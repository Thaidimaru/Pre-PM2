# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.1] - 2026-09-10

### Changed
- **Typography & Font Family**: Updated primary font family across the application to **"TH Sarabun New"** (with aliases for `THSarabunNew` and Google Fonts `Sarabun`). Added `@font-face` definitions for local font detection and cloud fallback, and adjusted base font scale to 17px for optimal readability of Thai government standard typography.

## [2.1.0] - 2026-09-10

### Fixed & Enhanced
- **Client-Side High-Res Photo Compression**: Integrated automatic client-side canvas image optimization scaling camera photos to 1600px max dimension at 0.8 JPEG quality. Reduces mobile photo uploads from 4–10 MB to 150–300 KB, preventing Vercel `413 FUNCTION_PAYLOAD_TOO_LARGE` errors.
- **Station Location Auto-Fill**: Auto-populates `province`, `district`, and `subdistrict` into survey form when selecting any station.
- **Cloud Survey & Photo Retrieval APIs**: Added `GET /api/surveys`, `GET /api/survey?id=...`, `GET /api/photos`, and `GET /api/status` across both Vercel Serverless (`netlify/functions/api.js`, `api/handler.js`) and standalone Python (`database.py`).
- **Complete OneDrive Photo Syncing**: Updated `sync_onedrive.py` to auto-login, fetch all cloud survey records and photos, and download them organized by station directory into the company OneDrive folder (`NBTC Microwave\Photo\Pre_PM`).
- **Dashboard Survey Details & Photo Gallery Modal**: Upgraded `RecentSurveys` component allowing one-click inspection of survey fields, checklist items, and high-resolution photo gallery with zoom modal.
- **Database Schema Auto-Initialization**: Ensured `export_photos.py` automatically initializes SQLite schema if tables are not yet created, preventing `no such table` runtime exceptions.

## [2.0.9] - 2026-09-09

### Added
- Integrated direct photo export and saving to company **Microsoft OneDrive** (`NBTC Microwave/Photo/Pre_PM`) for automatic cloud syncing to SharePoint.
- Updated `database.py` to auto-detect the local OneDrive folder and write full resolution image files organized by station name upon saving.
- Enhanced `export_photos.py` with automatic OneDrive default destination and station-based folder organization.
- Created `sync_onedrive.py` utility (`npm run sync:onedrive`) to synchronize survey photos from local backups and Cloud API down to the OneDrive directory.

## [2.0.8] - 2026-09-09

### Added
- Integrated **Vercel Blob Storage (`@vercel/blob`)** as persistent cloud storage for Vercel deployments.
- Implemented multi-tier storage abstraction in `netlify/functions/api.js`: Tier 1 (Vercel Blob), Tier 2 (Netlify Blobs), Tier 3 (In-Memory / Local fallback).
- Added automatic detection for `BLOB_READ_WRITE_TOKEN` to activate Vercel Blob without manual code changes.

## [2.0.7] - 2026-09-09

### Fixed
- Fixed Vercel deployment error `functions.api/*.js.includeFiles should be string` by changing `includeFiles` from an array of strings to a glob pattern string in `vercel.json` according to Vercel OpenAPI schema.

## [2.0.6] - 2026-09-09

### Fixed
- Fixed radial gradient styling in `ProvinceChart.jsx` using Tailwind CSS v4 compatible syntax (`bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]`).
- Cleaned up unused Lucide React icon imports across dashboard components (`BarChart3`, `Sparkles`).

### Added
- Added standalone lightweight Node.js API server (`server.js`) and photo export script (`scripts/export-photos.js`).
- Updated `vercel.json` route rewrites and function packaging configuration.

## [2.0.3] - 2026-09-08

### Fixed
- Fixed Thai font rendering, text alignment, and diacritic clipping issues across the application.
- Integrated comprehensive Google Fonts (`Noto Sans Thai`, `Prompt`, `Sarabun`, and `Inter`) with full weights in `index.html`.
- Configured font fallback stack and modern typography standards in `src/index.css` (`font-size-adjust: from-font`, `letter-spacing: normal`, `line-break: relaxed`, `text-wrap: pretty`, and line-height `1.6`).
- Fixed text gradient clipping in `ShinyText` component by applying vertical padding, box-decoration-break cloning, and proper line height.
- Resolved Thai character spacing and tone mark distortion by replacing `tracking-tight` and `tracking-wide` with `tracking-normal leading-normal` on all Thai headings, cards, and buttons.

## [2.0.2] - 2026-09-08

### Fixed
- Fixed 404 error when loading `nbtc-logo-dashboard.png` by configuring the `public/` directory with static assets and importing the image module directly in `Navbar` and `LoginView`.

## [2.0.1] - 2026-09-08

### Changed
- Modernized frontend architecture to Single Page Application (SPA) powered by React 18, Vite 5, Tailwind CSS 4, and Radix UI accessible primitives.
- Upgraded UI styling to responsive Dark Cyber Glassmorphism theme with Framer Motion animations and Lucide React icons.
- Centralized application version management with authoritative single source of truth (`src/version.js`).
- Added standalone utility script `export_photos.py` to extract SQLite survey photos into local storage.
- Updated `database.py`, `netlify.toml`, and `vercel.json` with client-side SPA routing fallbacks and build artifact integration.

## [1.0.0] - 2026-09-08

### Added
- **Survey Control Room Dashboard**:
  - Live statistics display (total surveys, database stations, access granted / denied).
  - Provincial distribution bar chart with real-time station count.
  - Recent survey activity log table with auto-polling every 30 seconds.
  - Modern Glassmorphism aesthetic theme (`dashboard-theme.css`) with spotlight and shine effects.
- **Field Visit / Site Record Form**:
  - 7 structured sections covering Station Info, Local Informant, Site Access Permit, Radio & Power Status, Site Environment, Photo Documentation, and Sign-off Confirmation.
  - Real-time station search autocomplete connected to `DATABASE.xlsx`.
  - Multi-photo upload support with client-side preview and payload optimization.
- **Dual Server Architecture**:
  - **Cloud Serverless**: Netlify Functions (`netlify/functions/api.js`) with Netlify Blobs storage and Vercel serverless integration (`api/handler.js`).
  - **Local / Standalone**: Python threaded HTTP server (`database.py`) with SQLite backend (`survey.db`) and automated startup script (`server.ps1`).
- **Security & Access Control**:
  - Token-based HMAC SHA-256 authentication with configurable password via environment variables (`FORM_PASSWORD`) or `access-password.txt`.
  - URL rewrites preventing direct access to sensitive data files (`DATABASE.xlsx`, `access-password.txt`, `survey.db`).
- **Data Exporting**:
  - Automated PowerShell script (`export-surveys.ps1`) for exporting survey records into structured Excel sheets (`SURVEY_DATA.xlsx`).
