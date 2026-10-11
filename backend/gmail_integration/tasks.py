import base64
import io
import logging

from celery import shared_task
from django.contrib.auth import get_user_model

from gmail_integration.services import GmailService
from drive.services import DriveService

logger = logging.getLogger(__name__)
User = get_user_model()


@shared_task
def process_large_attachment(user_id, message_id, attachment_id, folder_id):
    try:
        user = User.objects.get(pk=user_id)
        
        gmail_service = GmailService(user)
        attachment_data = gmail_service.get_attachment(message_id, attachment_id)
        
        if not attachment_data or 'data' not in attachment_data:
            logger.error(f"Failed to fetch attachment {attachment_id} for message {message_id}")
            return
            
        file_data = base64.urlsafe_b64decode(attachment_data['data'])
        file_io = io.BytesIO(file_data)
        
        # DriveService.upload expects an object with 'name' and 'content_type' attributes
        # However, looking at the code, it uses getattr(file, "name", "uploaded_file")
        # Let's attach a name so it isn't just "uploaded_file"
        file_io.name = f"attachment_{attachment_id}"
        
        drive_service = DriveService(user)
        upload_response = drive_service.upload(file_io, folder_id=folder_id)
        
        logger.info(f"Successfully uploaded attachment {attachment_id} to Drive. File ID: {upload_response.get('id')}")
        
    except Exception as e:
        logger.exception(f"Error in process_large_attachment: {e}")
