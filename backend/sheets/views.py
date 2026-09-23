from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .services import SheetsService
from .serializers import (
    SheetValuesSerializer,
    UpdateValuesSerializer,
    AppendValuesSerializer,
)


class SpreadsheetListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        service = SheetsService(request.user)
        data = service.list_spreadsheets()
        return Response(data, status=status.HTTP_200_OK)


class SheetMetadataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, spreadsheet_id):
        service = SheetsService(request.user)
        data = service.get_sheet_metadata(spreadsheet_id)
        return Response(data, status=status.HTTP_200_OK)


class SheetValuesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, spreadsheet_id):
        serializer = SheetValuesSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        service = SheetsService(request.user)
        data = service.get_values(
            spreadsheet_id,
            serializer.validated_data["range"],
        )

        return Response(data, status=status.HTTP_200_OK)

    def put(self, request, spreadsheet_id):
        serializer = UpdateValuesSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = SheetsService(request.user)
        data = service.update_values(
            spreadsheet_id,
            serializer.validated_data["range"],
            serializer.validated_data["values"],
        )

        return Response(data, status=status.HTTP_200_OK)


class SheetAppendView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, spreadsheet_id):
        serializer = AppendValuesSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = SheetsService(request.user)
        data = service.append_values(
            spreadsheet_id,
            serializer.validated_data["range"],
            serializer.validated_data["values"],
        )

        return Response(data, status=status.HTTP_200_OK)