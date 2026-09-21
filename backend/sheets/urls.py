from django.urls import path

from .views import (
    SpreadsheetListView,
    SheetMetadataView,
    SheetValuesView,
    SheetAppendView,
)

urlpatterns = [
    path("spreadsheets/", SpreadsheetListView.as_view(), name="spreadsheet-list"),
    path("<str:spreadsheet_id>/metadata/", SheetMetadataView.as_view(), name="sheet-metadata"),
    path("<str:spreadsheet_id>/values/", SheetValuesView.as_view(), name="sheet-values"),
    path("<str:spreadsheet_id>/values/append/", SheetAppendView.as_view(), name="sheet-append"),
]