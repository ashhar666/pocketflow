import os
import json
import logging
import socket
import urllib3.util.connection as urllib3_cn
from google import genai
from django.conf import settings
from PIL import Image
import io

logger = logging.getLogger(__name__)

# Force IPv4 to prevent Hugging Face / Google API IPv6 SSLEOF packet-drop issues
def allowed_gai_family():
    return socket.AF_INET
urllib3_cn.allowed_gai_family = allowed_gai_family

def scan_receipt_image(image_file):
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        print("❌ OCR ERROR: GEMINI_API_KEY is not set!")
        return {"error": "API Key missing"}
    
    # 🕵️ DIAGNOSTIC: Print masked key to verify rotation
    print(f"🕵️ Using API Key: {api_key[:4]}...{api_key[-4:]}")

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

        # Trying multiple models with automatic fallback due to quota/availability limits
        models_to_try = [
            "gemini-flash-lite-latest",
            "gemini-2.0-flash",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
        ]

        response = None
        last_error = None
        
        logger.debug("--- AI SCAN DIAGNOSTIC ---")
        logger.debug("API Key Masked: %s...%s", api_key[:4], api_key[-4:] if api_key else 'None')

        for model_id in models_to_try:
            try:
                logger.debug("Trying model: %s...", model_id)
                response = client.models.generate_content(
                    model=model_id,
                    contents=[prompt, img]
                )
                logger.debug("SUCCESS!")
                break
            except Exception as model_e:
                err_msg = str(model_e)[:80]
                logger.warning("Model %s failed: %s", model_id, err_msg)
                last_error = model_e
                continue

        if response is None:
            logger.error("All AI models failed. Final error: %s", last_error)
            raise last_error
        
        text = response.text.strip()
        logger.debug("AI Response Length: %d", len(text))
        
        if '```' in text:
            import re
            json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
            if json_match:
                text = json_match.group(1)
            else:
                text = text.replace('```json', '').replace('```', '').strip()
        
        data = json.loads(text)
        return data

    except Exception as e:
        logger.exception("AI Scan Error: %s", str(e))
        return {"error": f"AI Scan failed: {str(e)}"}
