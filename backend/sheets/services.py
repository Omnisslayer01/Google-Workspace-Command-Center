from googleapiclient.discovery import build


class SheetsService:
    """
    Service layer for Google Sheets operations.

    Uses the authenticated Google credentials provided by
    google_auth.services.get_google_client().
    """

    def __init__(self, user):
        from google_auth.services import get_google_client

        credentials = get_google_client(user)

        self.sheets = build(
            "sheets",
            "v4",
            credentials=credentials,
        )

        self.drive = build(
            "drive",
            "v3",
            credentials=credentials,
        )

    def list_spreadsheets(self, page_size=20):
        """
        List the user's Google Sheets files.
        """
        return (
            self.drive.files()
            .list(
                q="mimeType='application/vnd.google-apps.spreadsheet'",
                fields="files(id,name,createdTime,modifiedTime)",
                pageSize=page_size,
            )
            .execute()
        )

    def get_values(self, spreadsheet_id, range_name):
        """
        Read values from a sheet range.
        """
        return (
            self.sheets.spreadsheets()
            .values()
            .get(
                spreadsheetId=spreadsheet_id,
                range=range_name,
            )
            .execute()
        )

    def update_values(self, spreadsheet_id, range_name, values):
        """
        Update values in a sheet range.
        """
        return (
            self.sheets.spreadsheets()
            .values()
            .update(
                spreadsheetId=spreadsheet_id,
                range=range_name,
                valueInputOption="USER_ENTERED",
                body={"values": values},
            )
            .execute()
        )

    def append_values(self, spreadsheet_id, range_name, values):
        """
        Append rows to a sheet.
        """
        return (
            self.sheets.spreadsheets()
            .values()
            .append(
                spreadsheetId=spreadsheet_id,
                range=range_name,
                valueInputOption="USER_ENTERED",
                insertDataOption="INSERT_ROWS",
                body={"values": values},
            )
            .execute()
        )

    def get_sheet_metadata(self, spreadsheet_id):
        """
        Get spreadsheet metadata including worksheet names.
        """
        return (
            self.sheets.spreadsheets()
            .get(
                spreadsheetId=spreadsheet_id,
                fields="sheets(properties(title,sheetId,index))",
            )
            .execute()
        )