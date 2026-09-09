"""
NBTC Microwave — Pre-PM Photo Exporter
Utility script to extract photos stored as BLOBs in survey.db into the photos/ directory.
"""

import os
import sys
import json
import sqlite3
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
DB_PATH = ROOT_DIR / "survey.db"
ONEDRIVE_DIR = Path(r"d:\Users\utai3\OneDrive - FORTH CORPORATION PUBLIC COMPANY LIMITED\NBTC Microwave\Photo\Pre_PM")
DEFAULT_OUTPUT_DIR = ONEDRIVE_DIR if ONEDRIVE_DIR.exists() else (ROOT_DIR / "photos")


def export_photos(output_dir: Path = DEFAULT_OUTPUT_DIR, by_folder: bool = True):
    """
    Export photos from SQLite survey.db to target folder (default: OneDrive).
    
    :param output_dir: Directory where photos will be exported.
    :param by_folder: If True, organizes photos in subfolders named after station/record_id.
    """
    if not DB_PATH.exists():
        print(f"[ERROR] Database file not found: {DB_PATH}")
        sys.exit(1)

    output_dir.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    try:
        query = """
            SELECT 
                p.id, 
                p.survey_id, 
                p.name, 
                p.content_type, 
                p.data, 
                s.record_id, 
                s.fields_json
            FROM survey_photos p
            LEFT JOIN surveys s ON p.survey_id = s.id
            ORDER BY p.id ASC
        """
        photos = cursor.execute(query).fetchall()

        if not photos:
            print(f"[INFO] No photos found in survey.db.")
            return

        print(f"[INFO] Found {len(photos)} photo(s) in survey.db. Exporting to: {output_dir}\n")

        exported_count = 0
        for row in photos:
            photo_id = row["id"]
            record_id = row["record_id"] or f"survey_{row['survey_id']}"
            raw_name = row["name"] or f"photo_{photo_id}.jpg"
            photo_data = row["data"]

            # Try to get station name from fields_json for context
            station_name = ""
            if row["fields_json"]:
                try:
                    fields = json.loads(row["fields_json"])
                    station_name = str(fields.get("station") or fields.get("stationSelect") or "").strip()
                except Exception:
                    pass

            safe_station = "".join(c for c in station_name if c not in r'\/:*?"<>|').strip() or record_id

            # Destination file path
            if by_folder:
                target_dir = output_dir / safe_station
                target_dir.mkdir(parents=True, exist_ok=True)
                filename = f"{record_id}_{raw_name}" if record_id else raw_name
                dest_path = target_dir / filename
            else:
                filename = f"{record_id}_{raw_name}" if record_id else raw_name
                dest_path = output_dir / filename

            # Write binary image data
            dest_path.write_bytes(photo_data)
            size_kb = len(photo_data) / 1024
            station_info = f" ({station_name})" if station_name else ""
            print(f"  [OK] Exported #{photo_id}: {dest_path.name}{station_info} [{size_kb:.1f} KB]")
            exported_count += 1

        print(f"\n[SUCCESS] Successfully exported {exported_count} photo(s) to '{output_dir}'.")

    finally:
        conn.close()


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Export photos from survey.db into OneDrive / photos folder")
    parser.add_argument("--dest", type=str, default=str(DEFAULT_OUTPUT_DIR), help="Destination folder path")
    parser.add_argument("--no-folder", action="store_true", help="Do not group into station subfolders")
    args = parser.parse_args()

    target_path = Path(args.dest)
    export_photos(output_dir=target_path, by_folder=not args.no_folder)

