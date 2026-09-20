from django.urls import path

from .views import (
    DriveFileListView,
    DriveFileUploadView,
    DriveFileDownloadView,
    DriveFileRenameView,
    DriveFileMoveView,
    DriveFileDeleteView,
    DriveFolderCreateView
)


urlpatterns = [
    path(
        "files/",
        DriveFileListView.as_view(),
        name="drive-files",
    ),
    path(
        "files/upload/",
        DriveFileUploadView.as_view(),
        name="drive-upload",
    ),
    path(
        "files/<str:file_id>/download/",
        DriveFileDownloadView.as_view(),
        name="drive-download",
    ),
    path(
        "files/<str:file_id>/rename/",
        DriveFileRenameView.as_view(),
        name="drive-rename",
    ),
    path(
        "files/<str:file_id>/move/",
        DriveFileMoveView.as_view(),
        name="drive-move",
    ),
    path(
        "files/<str:file_id>/",
        DriveFileDeleteView.as_view(),
        name="drive-delete",
    ),
    path("folders/", DriveFolderCreateView.as_view(), name="drive-folder-create"),
]