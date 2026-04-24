import json
import logging
import socket

import urllib3.util.connection as urllib3_cn
from django.conf import settings
from google import genai
from PIL import Image

logger = logging.getLogger(__name__)


# Force IPv4 to prevent Hugging Face / Google API IPv6 SSLEOF packet-drop issues
def allowed_gai_family():
    return socket.AF_INET


urllib3_cn.allowed_gai_family = allowed_gai_family


def _build_scan_error(message, code="scan_failed", status_code=500, details=None):
    error = {
        "error": message,
        "error_code": code,
        "status_code": status_code,
    }
    if details:
        error["details"] = details
    return error


def _classify_scan_exception(exc):
    message = str(exc)
    lowered = message.lower()

    if "api key expired" in lowered:
        return _build_scan_error(
            "AI scan is unavailable because the Gemini API key has expired. Renew the key in backend/.env.",
            code="gemini_key_expired",
            status_code=503,
        )

    if (
        "api_key_invalid" in lowered
        or "api key invalid" in lowered
        or "api key not found" in lowered
        or "please pass a valid api key" in lowered
    ):
        return _build_scan_error(
            "AI scan is unavailable because the Gemini API key is invalid or revoked. Update GEMINI_API_KEY in backend/.env or in your deployment secrets.",
            code="gemini_key_invalid",
            status_code=503,
        )

    if "quota" in lowered or "rate limit" in lowered or "resource_exhausted" in lowered:
        return _build_scan_error(
            "AI scan is temporarily unavailable because the Gemini quota has been exceeded. Please try again later.",
            code="gemini_quota_exceeded",
            status_code=503,
        )

    if "unavailable" in lowered or "high demand" in lowered:
        return _build_scan_error(
            "AI scan is temporarily unavailable because Gemini is overloaded. Please try again shortly.",
            code="gemini_unavailable",
            status_code=503,
        )

    if "not found" in lowered and "model" in lowered:
        return _build_scan_error(
            "AI scan is temporarily unavailable because the configured Gemini model is no longer supported.",
            code="gemini_model_not_found",
            status_code=503,
        )

    if "deadline" in lowered or "timed out" in lowered or "timeout" in lowered:
        return _build_scan_error(
            "AI scan timed out while contacting Gemini. Please try again.",
            code="gemini_timeout",
            status_code=504,
        )

    return _build_scan_error(
        f"AI scan failed: {message}",
        code="scan_failed",
        status_code=500,
    )


def scan_receipt_image(image_file):
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        logger.error("OCR ERROR: GEMINI_API_KEY is not set")
        return _build_scan_error(
            "AI scan is unavailable because GEMINI_API_KEY is missing in backend/.env.",
            code="gemini_key_missing",
            status_code=503,
        )

    try:
        client = genai.Client(api_key=api_key)
        img = Image.open(image_file)

        prompt = """
        Analyze this financial document image (receipt, invoice, salary slip, or bank alert)
        and extract the following information in valid JSON format:
        {
            "title": "Merchant Name or Income Source",
            "amount": "Total Amount (number only, no currency symbols)",
            "date": "Transaction Date in YYYY-MM-DD format",
            "category_suggestion": "A single word category (e.g., Food, Travel, Salary, Shopping, Interest)",
            "type": "EXPENSE or INCOME"
        }

        Use these rules for 'type':
        - "EXPENSE": For standard purchases, bills, receipts, and payments.
        - "INCOME": For salary credits, bank interest, refunds, or cashback notifications.

        If you cannot find a piece of information, return null for that field.
        Only return the raw JSON object. No markdown headers, no preamble.
        """

        models_to_try = [
            "gemini-2.5-flash-lite",
            "gemini-2.5-flash",
            "gemini-flash-lite-latest",
            "gemini-flash-latest",
            "gemini-2.0-flash",
            "gemini-2.0-flash-lite",
        ]

        response = None
        last_error = None

        logger.debug("--- AI SCAN DIAGNOSTIC ---")
        logger.debug("API Key Masked: %s...%s", api_key[:4], api_key[-4:] if api_key else "None")

        for model_id in models_to_try:
            try:
                logger.debug("Trying model: %s...", model_id)
                response = client.models.generate_content(
                    model=model_id,
                    contents=[prompt, img],
                )
                logger.debug("SUCCESS!")
                break
            except Exception as model_error:
                err_msg = str(model_error)[:80]
                logger.warning("Model %s failed: %s", model_id, err_msg)
                last_error = model_error
                continue

        if response is None:
            logger.error("All AI models failed. Final error: %s", last_error)
            raise last_error

        text = response.text.strip()
        logger.debug("AI Response Length: %d", len(text))

        if "```" in text:
            import re

            json_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
            if json_match:
                text = json_match.group(1)
            else:
                text = text.replace("```json", "").replace("```", "").strip()

        data = json.loads(text)
        return data

    except Exception as exc:
        logger.exception("AI Scan Error: %s", str(exc))
        return _classify_scan_exception(exc)
