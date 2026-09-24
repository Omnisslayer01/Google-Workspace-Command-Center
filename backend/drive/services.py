from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload

from google_auth.services import get_google_client


class DriveService:
    """
    Service layer for Google Drive API operations.

    Google authentication and token handling are owned by google_auth.
    This service consumes the authenticated Google client.
    """

    def __init__(self, user):
        self.user = user

        credentials = get_google_client(user)

        self.drive = build(
            "drive",
            "v3",
            credentials=credentials,
        )

    def list_files(self, folder_id=None, query=None, page_size=100):
        filters = ["trashed = false"]

        if folder_id:
            filters.append(f"'{folder_id}' in parents")

        if query:
            filters.append(f"name contains '{query}'")

        response = (
            self.drive.files()
            .list(
                q=" and ".join(filters),
                pageSize=page_size,
                fields=(
                    "nextPageToken,"
                    "files(id,name,mimeType,size,"
                    "createdTime,modifiedTime,parents,webViewLink,"
                    "owners(displayName,emailAddress))"
                ),
            )
            .execute()
        )

        return response

    def upload(self, file, folder_id=None):
        file_name = getattr(file, "name", "uploaded_file")
        content_type = getattr(file, "content_type", None)

        file_object = getattr(file, "file", file)

        metadata = {
            "name": file_name,
        }

        if folder_id:
            metadata["parents"] = [folder_id]

        media = MediaIoBaseUpload(
            file_object,
            mimetype=content_type or "application/octet-stream",
            resumable=True,
        )

        return (
            self.drive.files()
            .create(
                body=metadata,
                media_body=media,
                fields=(
                    "id,name,mimeType,size,"
                    "createdTime,modifiedTime,"
                    "parents,webViewLink"
                ),
            )
            .execute()
        )
    
    def download(self, file_id):
        return (
            self.drive.files()
            .get(
                fileId=file_id,
                alt="media",
            )
        )
    
    def create_folder(self, name, parent_id=None):
        metadata = {
            "name": name,
            "mimeType": "application/vnd.google-apps.folder",
        }

        if parent_id:
            metadata["parents"] = [parent_id]

        return (
            self.drive.files()
            .create(
                body=metadata,
                fields="id,name,mimeType,parents",
            )
            .execute()
        )
    
    def rename(self, file_id, name):
        return (
            self.drive.files()
            .update(
                fileId=file_id,
                body={"name": name},
                fields="id,name,mimeType,modifiedTime",
            )
            .execute()
        )
    
    def move(self, file_id, new_parent_id, old_parent_id=None):
        kwargs = {
            "fileId": file_id,
            "addParents": new_parent_id,
            "fields": "id,name,mimeType,parents,modifiedTime",
        }

        if old_parent_id:
            kwargs["removeParents"] = old_parent_id

        return (
            self.drive.files()
            .update(**kwargs)
            .execute()
        )
    
    def delete(self, file_id):
        self.drive.files().delete(
            fileId=file_id
        ).execute()

        return {
            "success": True,
            "file_id": file_id,
        }