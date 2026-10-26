from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from googleapiclient.errors import HttpError
from google_auth.models import GoogleCredential

from .services import SheetsService
from .serializers import (
    SheetValuesSerializer,
    UpdateValuesSerializer,
    AppendValuesSerializer,
)


class SpreadsheetListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            service = SheetsService(request.user)
            data = service.list_spreadsheets()
            return Response(data, status=status.HTTP_200_OK)
        except GoogleCredential.DoesNotExist:
            return Response({"detail": "Google Workspace authorization is required."}, status=status.HTTP_403_FORBIDDEN)
        except HttpError as exc:
            return Response({"detail": str(exc.reason)}, status=exc.resp.status if hasattr(exc, 'resp') else 400)
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SheetMetadataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, spreadsheet_id):
        try:
            service = SheetsService(request.user)
            data = service.get_sheet_metadata(spreadsheet_id)
            return Response(data, status=status.HTTP_200_OK)
        except GoogleCredential.DoesNotExist:
            return Response({"detail": "Google Workspace authorization is required."}, status=status.HTTP_403_FORBIDDEN)
        except HttpError as exc:
            return Response({"detail": str(exc.reason)}, status=exc.resp.status if hasattr(exc, 'resp') else 400)
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SheetValuesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, spreadsheet_id):
        try:
            serializer = SheetValuesSerializer(data=request.query_params)
            serializer.is_valid(raise_exception=True)

            service = SheetsService(request.user)
            data = service.get_values(
                spreadsheet_id,
                serializer.validated_data["range"],
            )

            return Response(data, status=status.HTTP_200_OK)
        except GoogleCredential.DoesNotExist:
            return Response({"detail": "Google Workspace authorization is required."}, status=status.HTTP_403_FORBIDDEN)
        except HttpError as exc:
            return Response({"detail": str(exc.reason)}, status=exc.resp.status if hasattr(exc, 'resp') else 400)
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, spreadsheet_id):
        try:
            serializer = UpdateValuesSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            service = SheetsService(request.user)
            data = service.update_values(
                spreadsheet_id,
                serializer.validated_data["range"],
                serializer.validated_data["values"],
            )

            return Response(data, status=status.HTTP_200_OK)
        except GoogleCredential.DoesNotExist:
            return Response({"detail": "Google Workspace authorization is required."}, status=status.HTTP_403_FORBIDDEN)
        except HttpError as exc:
            return Response({"detail": str(exc.reason)}, status=exc.resp.status if hasattr(exc, 'resp') else 400)
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SheetAppendView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, spreadsheet_id):
        try:
            serializer = AppendValuesSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            service = SheetsService(request.user)
            data = service.append_values(
                spreadsheet_id,
                serializer.validated_data["range"],
                serializer.validated_data["values"],
            )

            return Response(data, status=status.HTTP_200_OK)
        except GoogleCredential.DoesNotExist:
            return Response({"detail": "Google Workspace authorization is required."}, status=status.HTTP_403_FORBIDDEN)
        except HttpError as exc:
            return Response({"detail": str(exc.reason)}, status=exc.resp.status if hasattr(exc, 'resp') else 400)
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SheetExportView(APIView):
    """
    Export Google Spreadsheet as an Excel (.xlsx) file or CSV.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, spreadsheet_id):
        from django.http import StreamingHttpResponse
        from googleapiclient.http import MediaIoBaseDownload
        from io import BytesIO
        from urllib.parse import quote

        export_format = request.query_params.get("format", "xlsx").lower()
        if export_format == "csv":
            mime_type = "text/csv"
            extension = ".csv"
        else:
            mime_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            extension = ".xlsx"

        try:
            service = SheetsService(request.user)
            file_meta = service.drive.files().get(fileId=spreadsheet_id, fields="name").execute()
            file_name = file_meta.get("name", "spreadsheet")
            if not file_name.lower().endswith(extension):
                file_name += extension

            drive_request = service.export_spreadsheet(spreadsheet_id, mime_type=mime_type)

            buffer = BytesIO()
            downloader = MediaIoBaseDownload(buffer, drive_request)
            done = False
            while not done:
                _, done = downloader.next_chunk()
            buffer.seek(0)

            response = StreamingHttpResponse(
                iter(lambda: buffer.read(8192), b""),
                content_type=mime_type,
            )
            response["Content-Disposition"] = f"attachment; filename*=UTF-8''{quote(file_name)}"
            response["X-Content-Type-Options"] = "nosniff"
            return response
        except GoogleCredential.DoesNotExist:
            return Response({"detail": "Google Workspace authorization is required."}, status=status.HTTP_403_FORBIDDEN)
        except HttpError as exc:
            return Response({"detail": str(exc.reason)}, status=exc.resp.status if hasattr(exc, 'resp') else 400)
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)