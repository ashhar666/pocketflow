import logging
import requests
import mimetypes
from django.conf import settings

logger = logging.getLogger(__name__)


def send_message(chat_id: str, text: str, reply_markup: dict = None) -> bool:
    """
    Send a text message to a Telegram chat.
    Optional `reply_markup` parameter allows adding custom keyboards or ForceReply.
    Returns True on success, False on any error.
    """
    token = settings.TELEGRAM_BOT_TOKEN
    if not token:
        logger.warning("TELEGRAM_BOT_TOKEN is not set — cannot send message.")
        return False

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
    }
    if reply_markup is not None:
        payload["reply_markup"] = reply_markup
        
    try:
        response = requests.post(url, json=payload, timeout=10)
        if not response.ok:
            logger.error("sendMessage failed: %s — %s", response.status_code, response.text)
            return False
        return True
    except requests.exceptions.Timeout:
        logger.warning("sendMessage timed out for chat_id=%s", chat_id)
        return False
    except requests.exceptions.RequestException as exc:
        logger.error("sendMessage network error: %s", exc)
        return False


def answer_callback_query(callback_query_id: str, text: str = None) -> bool:
    """
    Acknowledge a callback query from an inline keyboard button so it stops loading.
    """
    token = settings.TELEGRAM_BOT_TOKEN
    if not token:
        logger.warning("TELEGRAM_BOT_TOKEN not set for answer_callback_query")
        return False
        
    url = f"https://api.telegram.org/bot{token}/answerCallbackQuery"
    payload = {
        "callback_query_id": callback_query_id,
    }
    if text:
        payload["text"] = text
        
    try:
        response = requests.post(url, json=payload, timeout=5)
        return response.ok
    except requests.exceptions.RequestException:
        return False

def send_document(chat_id: str, document, filename: str, caption: str = "") -> bool:
    """
    Send a document (like a CSV or PDF) to a Telegram chat.
    `document` should be bytes or a file-like object.
    """
    token = settings.TELEGRAM_BOT_TOKEN
    if not token:
        logger.warning("TELEGRAM_BOT_TOKEN is not set — cannot send document.")
        return False

    url = f"https://api.telegram.org/bot{token}/sendDocument"
    content_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"
    files = {"document": (filename, document, content_type)}
    data = {
        "chat_id": chat_id,
        "caption": caption,
        "parse_mode": "HTML",
    }
    
    try:
        response = requests.post(url, data=data, files=files, timeout=15)
        if not response.ok:
            logger.error("sendDocument failed: %s — %s", response.status_code, response.text)
            return False
        return True
    except requests.exceptions.Timeout:
        logger.warning("sendDocument timed out for chat_id=%s", chat_id)
        return False
    except requests.exceptions.RequestException as exc:
        logger.error("sendDocument network error: %s", exc)
        return False


def get_telegram_file_path(file_id: str) -> str:
    """
    Get the file_path from Telegram for a given file_id.
    """
    token = settings.TELEGRAM_BOT_TOKEN
    url = f"https://api.telegram.org/bot{token}/getFile"
    try:
        response = requests.get(url, params={"file_id": file_id}, timeout=10)
        if response.ok:
            return response.json().get('result', {}).get('file_path')
        return None
    except Exception as e:
        logger.error("getFile error: %s", e)
        return None


def download_telegram_file(file_path: str) -> bytes:
    """
    Download the actual file content from Telegram's file server.
    """
    token = settings.TELEGRAM_BOT_TOKEN
    url = f"https://api.telegram.org/file/bot{token}/{file_path}"
    try:
        response = requests.get(url, timeout=20)
        if response.ok:
            return response.content
        return None
    except Exception as e:
        logger.error("download error: %s", e)
        return None
