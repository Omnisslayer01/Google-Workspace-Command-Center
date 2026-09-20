from io import BytesIO
from unittest.mock import Mock

from django.test import TestCase

from .services import DriveService


class DriveServiceTests(TestCase):
    def setUp(self):
        drive_client = Mock()

        self.drive_client = drive_client

        self.service = DriveService.__new__(DriveService)
        self.service.drive = drive_client

    def test_list_files(self):
        self.drive_client.files.return_value.list.return_value.execute.return_value = {
            "files": [{"id": "file-1", "name": "test.pdf"}],
            "nextPageToken": "next-page",
        }

        result = self.service.list_files(
            folder_id="folder-1",
            query="test",
            page_size=20,
        )

        self.assertEqual(result["files"][0]["id"], "file-1")
        self.assertEqual(result["nextPageToken"], "next-page")

        self.drive_client.files.return_value.list.assert_called_once()

    def test_upload(self):
        self.drive_client.files.return_value.create.return_value.execute.return_value = {
            "id": "uploaded-file",
            "name": "test.txt",
        }

        file = Mock()
        file.name = "test.txt"
        file.content_type = "text/plain"
        file.file = BytesIO(b"Hello Drive")

        result = self.service.upload(file, folder_id="folder-1")

        self.assertEqual(result["id"], "uploaded-file")

        create_call = (
            self.drive_client.files.return_value.create
        )

        create_call.assert_called_once()

        kwargs = create_call.call_args.kwargs

        self.assertEqual(
            kwargs["body"],
            {
                "name": "test.txt",
                "parents": ["folder-1"],
            },
        )

    def test_download(self):
        request = Mock()

        self.drive_client.files.return_value.get.return_value = request

        result = self.service.download("file-1")

        self.assertEqual(result, request)

        self.drive_client.files.return_value.get.assert_called_once_with(
            fileId="file-1",
            alt="media",
        )

    def test_create_folder(self):
        self.drive_client.files.return_value.create.return_value.execute.return_value = {
            "id": "folder-1",
            "name": "Documents",
            "mimeType": "application/vnd.google-apps.folder",
        }

        result = self.service.create_folder(
            "Documents",
            parent_id="parent-1",
        )

        self.assertEqual(result["id"], "folder-1")

        self.drive_client.files.return_value.create.assert_called_once()

        kwargs = (
            self.drive_client.files.return_value.create.call_args.kwargs
        )

        self.assertEqual(
            kwargs["body"],
            {
                "name": "Documents",
                "mimeType": "application/vnd.google-apps.folder",
                "parents": ["parent-1"],
            },
        )

    def test_rename(self):
        self.drive_client.files.return_value.update.return_value.execute.return_value = {
            "id": "file-1",
            "name": "renamed.txt",
        }

        result = self.service.rename(
            "file-1",
            "renamed.txt",
        )

        self.assertEqual(result["name"], "renamed.txt")

        self.drive_client.files.return_value.update.assert_called_once_with(
            fileId="file-1",
            body={"name": "renamed.txt"},
            fields="id,name,mimeType,modifiedTime",
        )

    def test_move(self):
        self.drive_client.files.return_value.update.return_value.execute.return_value = {
            "id": "file-1",
            "parents": ["folder-2"],
        }

        result = self.service.move(
            file_id="file-1",
            new_parent_id="folder-2",
            old_parent_id="folder-1",
        )

        self.assertEqual(result["id"], "file-1")

        self.drive_client.files.return_value.update.assert_called_once_with(
            fileId="file-1",
            addParents="folder-2",
            removeParents="folder-1",
            fields="id,name,mimeType,parents,modifiedTime",
        )

    def test_delete(self):
        self.drive_client.files.return_value.delete.return_value.execute.return_value = None

        result = self.service.delete("file-1")

        self.assertEqual(
            result,
            {
                "success": True,
                "file_id": "file-1",
            },
        )

        self.drive_client.files.return_value.delete.assert_called_once_with(
            fileId="file-1",
        )