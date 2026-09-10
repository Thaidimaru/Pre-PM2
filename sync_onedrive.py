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


def get_auth_token(api_url: str, manual_token: str = "") -> str:
    """Obtain auth token using access-password.txt or manual argument."""
    if manual_token:
        return manual_token

    password_file = ROOT_DIR / "access-password.txt"
    password = os.environ.get("FORM_PASSWORD", "")
    if not password and password_file.exists():
        try:
            password = password_file.read_text(encoding="utf-8-sig").strip()
        except Exception:
            password = ""
    if not password:
        password = "FieldForm-2026!Share"

    try:
        login_req = urllib.request.Request(
            f"{api_url}/api/login",
            data=json.dumps({"password": password}).encode("utf-8"),
            headers={"Content-Type": "application/json", "User-Agent": "NBTC-OneDrive-Sync/2.1"}
        )
        with urllib.request.urlopen(login_req, timeout=10) as res:
            data = json.loads(res.read().decode("utf-8"))
            return data.get("token", "")
    except Exception as e:
        print(f"[WARN] Auto-login failed: {e}")
        return ""


def sync_from_cloud(url: str, dest_dir: Path, token: str = "") -> int:
    """Fetch all surveys and photos from Vercel/Netlify cloud API and save to OneDrive folder."""
    api_url = url.rstrip("/")
    print(f"[INFO] Connecting to Cloud API: {api_url}")

    if not token:
        token = get_auth_token(api_url, token)
        if token:
            print(f"[INFO] Successfully authenticated with Cloud API.")
        else:
            print(f"[WARN] Proceeding without authentication token.")

    # 1. Fetch dashboard metrics
    try:
        req = urllib.request.Request(
            f"{api_url}/api/dashboard",
            headers={"User-Agent": "NBTC-OneDrive-Sync/2.1", "Accept": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=15) as res:
            dashboard = json.loads(res.read().decode("utf-8"))
            stats = dashboard.get("stats", {})
            storage = dashboard.get("storage", {})
            print(f"[INFO] Cloud Storage Tier: {storage.get('tier', 'Unknown')} | Total Surveys: {stats.get('surveys', 0)}")
    except Exception as e:
        print(f"[WARN] Could not retrieve dashboard from {api_url}: {e}")

    # 2. Fetch full survey records
    if not token:
        print(f"[WARN] No valid token available to fetch full surveys.")
        return 0

    try:
        surveys_req = urllib.request.Request(
            f"{api_url}/api/surveys",
            headers={
                "User-Agent": "NBTC-OneDrive-Sync/2.1",
                "Accept": "application/json",
                "Authorization": f"Bearer {token}"
            }
        )
        with urllib.request.urlopen(surveys_req, timeout=25) as res:
            surveys_payload = json.loads(res.read().decode("utf-8"))
            surveys = surveys_payload.get("surveys", [])
    except Exception as e:
        print(f"[WARN] Could not fetch surveys from {api_url}/api/surveys: {e}")
        return 0

    if not surveys:
        print(f"[INFO] No surveys returned from Cloud API.")
        return 0

    print(f"[INFO] Processing {len(surveys)} survey record(s) from Cloud API...")
    downloaded_photos = 0
    saved_records = 0

    for survey in surveys:
        record_id = survey.get("recordId", "PM-UNKNOWN")
        saved_at = survey.get("savedAt", "")
        fields = survey.get("fields", {})
        photos = survey.get("photos", [])

        raw_station = str(fields.get("station") or fields.get("stationSelect") or "General").strip()
        station = sanitize_filename(raw_station) or "General"
        station_folder = dest_dir / station
        station_folder.mkdir(parents=True, exist_ok=True)

        # Save survey metadata JSON
        meta_file = station_folder / f"survey_{record_id}.json"
        if not meta_file.exists():
            meta_data = {
                "recordId": record_id,
                "savedAt": saved_at,
                "station": raw_station,
                "fields": fields,
                "photoCount": len(photos)
            }
            meta_file.write_text(json.dumps(meta_data, ensure_ascii=False, indent=2), encoding="utf-8")
            saved_records += 1

        # Save photo files
        for idx, p in enumerate(photos, 1):
            raw_b64 = p.get("data", "")
            if not raw_b64:
                continue

            raw_name = sanitize_filename(p.get("name") or f"photo_{idx}.jpg")
            if not any(raw_name.lower().endswith(ext) for ext in ('.jpg', '.jpeg', '.png', '.webp')):
                raw_name += '.jpg'

            file_name = f"{record_id}_{idx}_{raw_name}"
            out_path = station_folder / file_name

            if not out_path.exists():
                try:
                    photo_bytes = base64.b64decode(raw_b64)
                    out_path.write_bytes(photo_bytes)
                    size_kb = len(photo_bytes) / 1024
                    print(f"  [+] Synced Photo: {station}/{file_name} [{size_kb:.1f} KB]")
                    downloaded_photos += 1
                except Exception as pe:
                    print(f"  [!] Failed to save {file_name}: {pe}")

    print(f"[SUCCESS] Cloud Sync: {downloaded_photos} new photo(s), {saved_records} survey record(s) saved.")
    return downloaded_photos


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
