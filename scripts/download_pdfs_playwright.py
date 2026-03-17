#!/usr/bin/env python3
"""Download all ORT Bedelía event PDFs using Playwright.
Uses cookies extracted from Chrome's profile."""
import hashlib
import json
import os
import shutil
import sqlite3
import struct
import sys
from base64 import b64decode
from pathlib import Path

from playwright.sync_api import sync_playwright

PDF_DIR = Path(__file__).parent.parent / "pdfs" / "2026-1"
PDF_DIR.mkdir(parents=True, exist_ok=True)

PDFS = [
    ("sistemas_sem1.pdf", "https://aulas.ort.edu.uy/pluginfile.php/962885/mod_folder/intro/ID%201%20%2814%29.pdf"),
    ("sistemas_sem2.pdf", "https://aulas.ort.edu.uy/pluginfile.php/962885/mod_folder/intro/ID%202%20%2811%29.pdf"),
    ("sistemas_sem3.pdf", "https://aulas.ort.edu.uy/pluginfile.php/962885/mod_folder/intro/ID%203%20%288%29.pdf"),
    ("sistemas_sem4.pdf", "https://aulas.ort.edu.uy/pluginfile.php/962885/mod_folder/intro/ID%204%20%286%29.pdf"),
    ("sistemas_sem5.pdf", "https://aulas.ort.edu.uy/pluginfile.php/962885/mod_folder/intro/ID%205%20%288%29.pdf"),
    ("sistemas_sem6.pdf", "https://aulas.ort.edu.uy/pluginfile.php/962885/mod_folder/intro/ID%206%20%285%29.pdf"),
    ("sistemas_sem7.pdf", "https://aulas.ort.edu.uy/pluginfile.php/962885/mod_folder/intro/ID%207%20%286%29.pdf"),
    ("sistemas_sem8.pdf", "https://aulas.ort.edu.uy/pluginfile.php/962885/mod_folder/intro/ID%208%20%2811%29.pdf"),
    ("sistemas_sem9.pdf", "https://aulas.ort.edu.uy/pluginfile.php/962885/mod_folder/intro/ID%209%20%287%29.pdf"),
    ("sistemas_electivas.pdf", "https://aulas.ort.edu.uy/pluginfile.php/962885/mod_folder/intro/EVENTOS%20ELECTIVAS%20%284%29.pdf"),
]


def get_chrome_cookies(domain: str) -> list[dict]:
    """Extract and decrypt cookies from Chrome's cookie store."""
    import subprocess

    # Get encryption key from macOS Keychain
    key_b64 = subprocess.check_output([
        "security", "find-generic-password", "-w", "-s", "Chrome Safe Storage", "-a", "Chrome"
    ]).decode().strip()
    key = b64decode(key_b64)
    derived_key = hashlib.pbkdf2_hmac('sha1', key, b'saltysalt', 1003, dklen=16)

    from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
    from cryptography.hazmat.backends import default_backend

    # Try all Chrome profiles
    chrome_dir = os.path.expanduser("~/Library/Application Support/Google/Chrome")
    cookies = []

    for profile in ["Default", "Profile 3", "Profile 4"]:
        db_path = os.path.join(chrome_dir, profile, "Cookies")
        if not os.path.exists(db_path):
            continue

        tmp_db = f"/tmp/chrome_cookies_{profile.replace(' ', '_')}.db"
        shutil.copy2(db_path, tmp_db)

        conn = sqlite3.connect(tmp_db)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT name, encrypted_value, host_key, path FROM cookies WHERE host_key LIKE ?",
            (f"%{domain}%",)
        )

        for name, enc_val, host, path in cursor.fetchall():
            if enc_val[:3] == b'v10':
                iv = b' ' * 16
                cipher = Cipher(algorithms.AES(derived_key), modes.CBC(iv), backend=default_backend())
                decryptor = cipher.decryptor()
                decrypted = decryptor.update(enc_val[3:]) + decryptor.finalize()
                pad_len = decrypted[-1]
                try:
                    value = decrypted[:-pad_len].decode('utf-8')
                    if value:  # Only add non-empty cookies
                        cookies.append({
                            "name": name,
                            "value": value,
                            "domain": host if host.startswith(".") else host,
                            "path": path,
                        })
                except:
                    pass

        conn.close()
        os.unlink(tmp_db)

    return cookies


def main():
    print("Extracting Chrome cookies for aulas.ort.edu.uy...")
    cookies = get_chrome_cookies("aulas.ort.edu.uy")

    if not cookies:
        print("No cookies found. Trying alternative approach...")
        # Try to get cookies from the ORT domain more broadly
        cookies = get_chrome_cookies("ort.edu.uy")

    print(f"Found {len(cookies)} cookies")
    for c in cookies:
        print(f"  {c['name']} = {c['value'][:20]}... (domain: {c['domain']})")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(accept_downloads=True)

        # Set cookies if we have them
        if cookies:
            context.add_cookies(cookies)

        page = context.new_page()

        # Verify auth
        print("\nChecking authentication...")
        response = page.goto("https://aulas.ort.edu.uy/course/view.php?id=1616", wait_until="domcontentloaded")

        if "login" in page.url:
            print("Not authenticated via cookies. Trying to log in via the page...")
            # Navigate to login page and check if we can log in
            # Actually, let's try the API route approach instead
            print("Trying API token approach...")

            # Try getting a Moodle web service token
            page.goto("https://aulas.ort.edu.uy/login/token.php")
            print(f"Token page URL: {page.url}")

            print("\nERROR: Cannot authenticate. Will try direct API requests...")
            browser.close()
            return download_via_requests(cookies)

        print(f"Authenticated! Title: {page.title()}")

        # Download each PDF using page.request (API context, bypasses PDF viewer)
        for name, url in PDFS:
            dest = PDF_DIR / name
            if dest.exists() and dest.stat().st_size > 10000:
                print(f"  Already exists: {name} ({dest.stat().st_size} bytes)")
                continue

            print(f"  Downloading: {name}...")
            try:
                resp = page.request.get(url)
                if resp.status == 200:
                    body = resp.body()
                    # Check if it's actually a PDF (not a login redirect)
                    if body[:4] == b'%PDF' or len(body) > 50000:
                        with open(dest, "wb") as f:
                            f.write(body)
                        print(f"    OK: {len(body)} bytes")
                    else:
                        print(f"    Got HTML redirect instead of PDF ({len(body)} bytes)")
                else:
                    print(f"    HTTP {resp.status}")
            except Exception as e:
                print(f"    ERROR: {e}")

        browser.close()

    print_results()


def download_via_requests(cookies: list[dict]):
    """Fallback: use requests library with cookies."""
    import requests

    session = requests.Session()
    for c in cookies:
        session.cookies.set(c["name"], c["value"], domain=c.get("domain", "aulas.ort.edu.uy"))

    # Test auth
    resp = session.get("https://aulas.ort.edu.uy/course/view.php?id=1616", allow_redirects=False)
    if resp.status_code in (302, 303):
        print("Requests: Not authenticated either.")
        return

    print(f"Requests: Authenticated! Status: {resp.status_code}")

    for name, url in PDFS:
        dest = PDF_DIR / name
        if dest.exists() and dest.stat().st_size > 10000:
            print(f"  Already exists: {name}")
            continue

        print(f"  Downloading: {name}...")
        resp = session.get(url)
        if resp.status_code == 200 and len(resp.content) > 10000:
            with open(dest, "wb") as f:
                f.write(resp.content)
            print(f"    OK: {len(resp.content)} bytes")
        else:
            print(f"    Failed: status={resp.status_code}, size={len(resp.content)}")

    print_results()


def print_results():
    print("\n=== Results ===")
    for name, _ in PDFS:
        dest = PDF_DIR / name
        if dest.exists():
            size = dest.stat().st_size
            status = "OK" if size > 10000 else "TOO SMALL"
            print(f"  {name}: {size} bytes [{status}]")
        else:
            print(f"  {name}: MISSING")


if __name__ == "__main__":
    main()
