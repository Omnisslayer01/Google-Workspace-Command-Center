from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import DriveService


class DriveFileListView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        folder_id = request.query_params.get("folder_id")
        query = request.query_params.get("query")

        page_size = request.query_params.get("page_size", 100)

        try:
            page_size = int(page_size)
        except (TypeError, ValueError):
            return Response(
                {
                    "success": False,
                    "error": "page_size must be a valid integer.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if page_size < 1 or page_size > 1000:
            return Response(
                {
                    "success": False,
                    "error": "page_size must be between 1 and 1000.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            service = DriveService(request.user)

            files = service.list_files(
                folder_id=folder_id,
                query=query,
                page_size=page_size,
            )

            return Response(
                {
                    "success": True,
                    "data": files,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as exc:
            return Response(
                {
                    "success": False,
                    "error": str(exc),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class DriveFileUploadView(APIView):
    permission_classes = (IsAuthenticated,)

    MAX_FILE_SIZE = 10 * 1024 * 1024

    ALLOWED_CONTENT_TYPES = {
        "application/pdf",
        "text/plain",
        "text/csv",
        "application/json",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "image/jpeg",
        "image/png",
        "image/webp",
    }

    def post(self, request):
        uploaded_file = request.FILES.get("file")
        folder_id = request.data.get("folder_id")

        if not uploaded_file:
            return Response(
                {
                    "success": False,
                    "error": "A file is required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if uploaded_file.size > self.MAX_FILE_SIZE:
            return Response(
                {
                    "success": False,
                    "error": "File size must not exceed 10 MB.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if uploaded_file.content_type not in self.ALLOWED_CONTENT_TYPES:
            return Response(
                {
                    "success": False,
                    "error": "Unsupported file type.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            service = DriveService(request.user)

            uploaded = service.upload(
                uploaded_file,
                folder_id=folder_id,
            )

            return Response(
                {
                    "success": True,
                    "data": uploaded,
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as exc:
            return Response(
                {
                    "success": False,
                    "error": str(exc),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
class DriveFileDownloadView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, file_id):
        try:
            service = DriveService(request.user)

            drive_request = service.download(file_id)

            from django.http import StreamingHttpResponse

            response = StreamingHttpResponse(
                self._stream_file(drive_request),
                content_type="application/octet-stream",
            )

            response["Content-Disposition"] = (
                f'attachment; filename="{file_id}"'
            )

            return response

        except Exception as exc:
            return Response(
                {
                    "success": False,
                    "error": str(exc),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @staticmethod
    def _stream_file(drive_request):
        from io import BytesIO
        from googleapiclient.http import MediaIoBaseDownload

        buffer = BytesIO()
        downloader = MediaIoBaseDownload(buffer, drive_request)

        done = False

        while not done:
            _, done = downloader.next_chunk()

        buffer.seek(0)

        while chunk := buffer.read(8192):
            yield chunk


class DriveFileRenameView(APIView):
    permission_classes = (IsAuthenticated,)

    def patch(self, request, file_id):
        name = request.data.get("name")

        if not name or not name.strip():
            return Response(
                {
                    "success": False,
                    "error": "A valid file name is required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            service = DriveService(request.user)

            result = service.rename(
                file_id=file_id,
                name=name.strip(),
            )

            return Response(
                {
                    "success": True,
                    "data": result,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as exc:
            return Response(
                {
                    "success": False,
                    "error": str(exc),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DriveFileMoveView(APIView):
    permission_classes = (IsAuthenticated,)

    def patch(self, request, file_id):
        new_parent_id = request.data.get("new_parent_id")
        old_parent_id = request.data.get("old_parent_id")

        if not new_parent_id:
            return Response(
                {
                    "success": False,
                    "error": "new_parent_id is required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            service = DriveService(request.user)

            result = service.move(
                file_id=file_id,
                new_parent_id=new_parent_id,
                old_parent_id=old_parent_id,
            )

            return Response(
                {
                    "success": True,
                    "data": result,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as exc:
            return Response(
                {
                    "success": False,
                    "error": str(exc),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DriveFileDeleteView(APIView):
    permission_classes = (IsAuthenticated,)

    def delete(self, request, file_id):
        try:
            service = DriveService(request.user)

            result = service.delete(file_id)

            return Response(
                {
                    "success": True,
                    "data": result,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as exc:
            return Response(
                {
                    "success": False,
                    "error": str(exc),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class DriveFolderCreateView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        name = request.data.get("name")
        parent_id = request.data.get("parent_id")

        if not name or not name.strip():
            return Response(
                {
                    "success": False,
                    "error": "A valid folder name is required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            service = DriveService(request.user)

            folder = service.create_folder(
                name=name.strip(),
                parent_id=parent_id,
            )

            return Response(
                {
                    "success": True,
                    "data": folder,
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as exc:
            return Response(
                {
                    "success": False,
                    "error": str(exc),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )