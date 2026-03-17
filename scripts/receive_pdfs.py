#!/usr/bin/env python3
"""Tiny HTTP server that receives PDF uploads from the browser."""
import os
from http.server import HTTPServer, BaseHTTPRequestHandler

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'pdfs', '2026-1')
os.makedirs(OUTPUT_DIR, exist_ok=True)

class Handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self, *args):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-Filename')
        self.end_headers()

    def do_POST(self, *args):
        length = int(self.headers.get('Content-Length', 0))
        filename = self.headers.get('X-Filename', 'unknown.pdf')
        data = self.rfile.read(length)
        filepath = os.path.join(OUTPUT_DIR, filename)
        with open(filepath, 'wb') as f:
            f.write(data)
        print(f"Saved: {filename} ({len(data)} bytes)")
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Type', 'text/plain')
        self.end_headers()
        self.wfile.write(b'OK')

    def log_message(self, format, *args):
        pass  # Suppress default logging

print(f"Listening on http://localhost:9876 - saving to {OUTPUT_DIR}")
HTTPServer(('localhost', 9876), Handler).serve_forever()
