#!/usr/bin/env python3
"""
Corn Leaf Doctor - Telegram Bot Server
Handles:
1. Setting the persistent Chat Menu Button (web_app)
2. Responding to /start with a rich welcome message & inline launch button
"""

import os
import sys
import json
import time
import urllib.request
import urllib.error
from pathlib import Path

# Load .env if present
env_file = Path(__file__).resolve().parent.parent / '.env'
if env_file.exists():
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                os.environ.setdefault(k.strip(), v.strip())

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "9244505452:AAECK2JiKLYAzTjXidPkgNxIjArecUxdPJI")
WEBAPP_URL = os.getenv("WEBAPP_URL", "")

def call_tg_api(method: str, payload: dict = None):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/{method}"
    data = json.dumps(payload).encode("utf-8") if payload else None
    headers = {"Content-Type": "application/json"}
    req = urllib.request.Request(url, data=data, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode('utf-8')
        print(f"API Error [{method}]: {err_msg}")
        return None
    except Exception as e:
        print(f"Network error [{method}]: {e}")
        return None

def verify_bot():
    """Verify the bot token and print bot username"""
    res = call_tg_api("getMe")
    if res and res.get("ok"):
        bot = res["result"]
        print(f" Connected to @{bot.get('username')} ({bot.get('first_name')})")
        return bot
    else:
        print(" Failed to connect. Token might be invalid or network blocked.")
        return None

def setup_menu_button(webapp_url: str):
    """Sets the native bottom-left WebApp Menu Button in Telegram"""
    if not webapp_url:
        print("⚠️ No WEBAPP_URL provided. Skipping menu button setup.")
        return False

    print(f"Configuring Menu Button with Mini App URL: {webapp_url}")
    payload = {
        "menu_button": {
            "type": "web_app",
            "text": "🌽 Scan Leaf / ស្កេនស្លឹក",
            "web_app": {"url": webapp_url}
        }
    }
    res = call_tg_api("setChatMenuButton", payload)
    if res and res.get("ok"):
        print("✅ Telegram Menu Button configured successfully!")
        return True
    return False

def send_welcome(chat_id: int, webapp_url: str):
    """Sends bilingual welcome message with inline button to launch Mini App"""
    text = (
        "🌽 *Corn Leaf Doctor | គ្រូពេទ្យស្លឹកពោត*\n\n"
        "Welcome! Detect corn leaf diseases in real-time right on your phone with *zero internet required*.\n\n"
        "សូមស្វាគមន៍! វិភាគជំងឺស្លឹកពោតក្នុងទូរស័ព្ទភ្លាមៗ ដោយមិនបាច់ប្រើអ៊ីនធឺណិត។\n\n"
        "🟢 *Offline AI Ready (MobileNetV3-Large)*\n"
        "• 5 Class Diagnosis (Rust, Blight, Gray Spot, Insects, Healthy)\n"
        "• Plain Khmer & English Treatment Guidance\n\n"
        "Tap the button below to start scanning 👇"
    )

    reply_markup = {
        "inline_keyboard": [
            [
                {
                    "text": "🩺 Open Corn Leaf Doctor / បើកកម្មវិធី",
                    "web_app": {"url": webapp_url} if webapp_url else None
                }
            ]
        ]
    } if webapp_url else None

    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "Markdown",
    }
    if reply_markup:
        payload["reply_markup"] = reply_markup

    call_tg_api("sendMessage", payload)

def run_polling(webapp_url: str):
    """Long polling to respond to /start commands"""
    print(f"🤖 Bot polling started... Waiting for messages. (Ctrl+C to stop)")
    offset = 0
    while True:
        try:
            updates = call_tg_api("getUpdates", {"offset": offset, "timeout": 20})
            if updates and updates.get("ok"):
                for update in updates.get("result", []):
                    offset = update["update_id"] + 1
                    msg = update.get("message", {})
                    chat_id = msg.get("chat", {}).get("id")
                    text = msg.get("text", "")

                    if chat_id and (text.startswith("/start") or text.startswith("/scan")):
                        user_name = msg.get("from", {}).get("first_name", "Farmer")
                        print(f"📩 Received /start from {user_name} ({chat_id})")
                        send_welcome(chat_id, webapp_url)
            time.sleep(1)
        except KeyboardInterrupt:
            print("\nBot polling stopped.")
            break
        except Exception as e:
            print(f"Polling loop error: {e}")
            time.sleep(3)

if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else WEBAPP_URL
    bot = verify_bot()

    if bot and url:
        setup_menu_button(url)
        run_polling(url)
    elif bot and not url:
        print("\n💡 To link your Mini App, provide your HTTPS tunnel URL:")
        print("   python3 bot/bot.py https://xxxx.ngrok-free.app")
