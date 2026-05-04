import logging
import requests
import mimetypes
from django.conf import settings
import socket
import urllib3.util.connection as urllib3_cn
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

import urllib.parse

# Force IPv4 to prevent Hugging Face / Telegram IPv6 SSLEOF packet-drop issues
def allowed_gai_family():
    return socket.AF_INET
urllib3_cn.allowed_gai_family = allowed_gai_family

logger = logging.getLogger(__name__)

# Configure a robust session with retries for Telegram API
_session = requests.Session()
_retry_strategy = Retry(
    total=3,
    backoff_factor=1,
    status_forcelist=[429, 500, 502, 503, 504],
)
_adapter = HTTPAdapter(max_retries=_retry_strategy)
_session.mount("https://", _adapter)
_session.mount("http://", _adapter)

def get_tg_url(original_url: str) -> str:
    """
    Reroute Telegram API calls through a Vercel proxy if enabled.
    This bypasses Hugging Face's direct network blocks to api.telegram.org.
    """
    proxy_enabled = getattr(settings, 'TELEGRAM_PROXY_ENABLED', False)
    if not proxy_enabled:
        return original_url
    
    frontend_url = getattr(settings, 'FRONTEND_URL', '').rstrip('/')
    if not frontend_url:
        logger.warning("TELEGRAM_PROXY_ENABLED is True but FRONTEND_URL is missing.")
        return original_url
        
    encoded_target = urllib.parse.quote(original_url, safe='')
    return f"{frontend_url}/api/tg-proxy?target={encoded_target}"

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

    original_url = f"https://api.telegram.org/bot{token}/sendMessage"
    url = get_tg_url(original_url)
    
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
    }
    if reply_markup is not None:
        payload["reply_markup"] = reply_markup
        
    try:
        # Increased timeout and use session
        response = _session.post(url, json=payload, timeout=20)
        if not response.ok:
            logger.error("sendMessage failed (URL: %s): %s — %s", url, response.status_code, response.text)
            return False
        return True
    except requests.exceptions.Timeout:
        logger.warning("sendMessage timed out (URL: %s) for chat_id=%s", url, chat_id)
        return False
    except requests.exceptions.RequestException as exc:
        logger.error("sendMessage network error (URL: %s): %s", url, exc)
        return False




def answer_callback_query(callback_query_id: str, text: str = None) -> bool:
    """
    Acknowledge a callback query from an inline keyboard button so it stops loading.
    """
    token = settings.TELEGRAM_BOT_TOKEN
    if not token:
        logger.warning("TELEGRAM_BOT_TOKEN not set for answer_callback_query")
        return False
        
    original_url = f"https://api.telegram.org/bot{token}/answerCallbackQuery"
    url = get_tg_url(original_url)
    
    payload = {
        "callback_query_id": callback_query_id,
    }
    if text:
        payload["text"] = text
        
    try:
        response = _session.post(url, json=payload, timeout=10)
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

    original_url = f"https://api.telegram.org/bot{token}/sendDocument"
    url = get_tg_url(original_url)
    
    content_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"
    files = {"document": (filename, document, content_type)}
    data = {
        "chat_id": chat_id,
        "caption": caption,
        "parse_mode": "HTML",
    }
    
    try:
        response = requests.post(url, data=data, files=files, timeout=20)
        if not response.ok:
            logger.error("sendDocument failed (URL: %s): %s — %s", url, response.status_code, response.text)
            return False
        return True
    except requests.exceptions.Timeout:
        logger.warning("sendDocument timed out (URL: %s) for chat_id=%s", url, chat_id)
        return False
    except requests.exceptions.RequestException as exc:
        logger.error("sendDocument network error (URL: %s): %s", url, exc)
        return False


def get_telegram_file_path(file_id: str) -> str:
    """
    Get the file_path from Telegram for a given file_id.
    """
    token = settings.TELEGRAM_BOT_TOKEN
    original_url = f"https://api.telegram.org/bot{token}/getFile"
    url = get_tg_url(original_url)
    try:
        response = _session.get(url, params={"file_id": file_id}, timeout=10)
        if response.ok:
            return response.json().get('result', {}).get('file_path')
        return None
    except Exception as e:
        logger.error("getFile error (URL: %s): %s", url, e)
        return None


def download_telegram_file(file_path: str) -> bytes:
    """
    Download the actual file content from Telegram's file server.
    Reroutes through proxy if enabled.
    """
    token = settings.TELEGRAM_BOT_TOKEN
    original_url = f"https://api.telegram.org/file/bot{token}/{file_path}"
    url = get_tg_url(original_url)
    try:
        response = requests.get(url, timeout=30)
        if response.ok:
            return response.content
        logger.error("download failed (URL: %s): %s — %s", url, response.status_code, response.text)
        return None
    except Exception as e:
        logger.error("download error (URL: %s): %s", url, e)
        return None
