"""
NBTC Microwave — Survey Photo OneDrive Sync Utility
Synchronizes survey photos to the user's company OneDrive folder:
d:\\Users\\utai3\\OneDrive - FORTH CORPORATION PUBLIC COMPANY LIMITED\\NBTC Microwave\\Photo\\Pre_PM
"""

import os
import sys
import json
import base64
import argparse
import urllib.request
import urllib.error
from pathlib import Path

# Paths
ROOT_DIR = Path(__file__).resolve().parent
ONEDRIVE_DEFAULT = Path(r"d:\Users\utai3\OneDrive - FORTH CORPORATION PUBLIC COMPANY LIMITED\NBTC Microwave\Photo\Pre_PM")
TARGET_DIR = ONEDRIVE_DEFAULT if ONEDRIVE_DEFAULT.exists() else (ROOT_DIR / "photos")
DEFAULT_CLOUD_URL = os.environ.get("SURVEY_API_URL", "https://pre-pm-3-mxsg.vercel.app")


def sanitize_filename(name: str) -> str:
    return "".join(c for c in name if c not in r'\/:*?"<>|').strip()


def sync_from_local_json(dest_dir: Path) -> int:
    """Sync photos from local survey-*.json backup files."""
    json_files = list(ROOT_DIR.glob("survey-*.json"))
    if not json_files:
        return 0

    downloaded = 0
    for jf in json_files:
        try:
            data = json.loads(jf.read_text(encoding="utf-8"))
            record_id = data.get("recordId", jf.stem)
            fields = data.get("fields", {})
            photos = data.get("photos", [])

            station = sanitize_filename(str(fields.get("station") or fields.get("stationSelect") or "General")) or "General"
            station_folder = dest_dir / station
            station_folder.mkdir(parents=True, exist_ok=True)

            for idx, p in enumerate(photos, 1):
                raw_b64 = p.get("data", "")
                if not raw_b64:
                    continue

                raw_name = sanitize_filename(p.get("name") or f"photo_{idx}.jpg")
                file_name = f"{record_id}_{idx}_{raw_name}"
                out_path = station_folder / file_name

                if not out_path.exists():
                    out_path.write_bytes(base64.b64decode(raw_b64))
                    print(f"  [+] Saved: {station}/{file_name}")
                    downloaded += 1
        except Exception as e:
            print(f"  [!] Error reading {jf.name}: {e}")
    return downloaded


def sync_from_cloud(url: str, dest_dir: Path, token: str = "") -> int:
    """Fetch dashboard and surveys from Vercel/Netlify cloud API."""
    api_url = url.rstrip("/")
    print(f"[INFO] Connecting to Cloud API: {api_url}")

    req = urllib.request.Request(
        f"{api_url}/api/dashboard",
        headers={"User-Agent": "NBTC-OneDrive-Sync/1.0", "Accept": "application/json"}
    )
    if token:
        req.add_header("Authorization", f"Bearer {token}")

    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            dashboard = json.loads(res.read().decode("utf-8"))
    except urllib.error.URLError as e:
        print(f"[WARN] Could not connect to {api_url}: {e}")
        return 0

    stats = dashboard.get("stats", {})
    recent = dashboard.get("recent", [])
    print(f"[INFO] Cloud reports {stats.get('surveys', 0)} survey(s).")
    return 0


def main():
    parser = argparse.ArgumentParser(description="Sync survey photos into local OneDrive folder")
    parser.add_argument("--dest", type=str, default=str(TARGET_DIR), help="Destination folder path")
    parser.add_argument("--url", type=str, default=DEFAULT_CLOUD_URL, help="Cloud API base URL")
    parser.add_argument("--token", type=str, default="", help="Bearer auth token if required")
    args = parser.parse_args()

    dest = Path(args.dest)
    dest.mkdir(parents=True, exist_ok=True)

    print("=" * 60)
    print("NBTC Microwave — Survey Photo OneDrive Sync")
    print("=" * 60)
    print(f"Destination: {dest}")

    # Check local SQLite database first via export_photos
    try:
        from export_photos import export_photos, DB_PATH
        if DB_PATH.exists():
            print("\n[STEP 1] Syncing from local survey.db...")
            export_photos(output_dir=dest, by_folder=True)
    except Exception as e:
        print(f"[WARN] Local SQLite export failed: {e}")

    # Check local JSON backups
    print("\n[STEP 2] Checking local backup JSON files...")
    json_count = sync_from_local_json(dest)
    print(f"[INFO] Processed local JSON backups. New files: {json_count}")

    print("\n[STEP 3] Checking Cloud API...")
    sync_from_cloud(args.url, dest, args.token)

    print(f"\n[DONE] OneDrive sync completed. Destination folder: '{dest}'")
    print("Windows OneDrive will automatically upload and sync new files to SharePoint/OneDrive Cloud.")


if __name__ == "__main__":
    main()
