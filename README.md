# 🌾 Hyer Farms Inventory

A Progressive Web App for real-time crop inventory tracking. Built with Next.js, TypeScript, and TailwindCSS.

## Crops Tracked

| Crop | Sheet Structure | Unit |
|---|---|---|
| **Potato Seed** | Tabs = varieties (Rising Star, Little Star, etc.) | CWT |
| **Wheat** | Tabs = storage locations (Bin 1, Bin 2, etc.) | Bu |
| **Potatoes** | Tabs = storage locations (Cellar 1, Cellar 2, etc.) | CWT |
| **Onions** | Tabs = storage locations (Pack Shed, Field Pile, etc.) | CWT |
| **Yellow Peas** | Tabs = varieties or locations | Bu |

## How Tab Discovery Works

Each crop has its own Google Sheet. The app **automatically discovers all tabs** in each sheet — no hardcoding needed. Just name your tabs however you like and they'll appear as cards (overview) or sub-tabs (detail).

Tabs are excluded if their name starts with `_` or matches: `README`, `Reference`, `Temp`, `Summary`.

## Google Sheet Format

Each tab should follow this column layout:

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Row 1 | Tab/variety name (title row) | | | | | | |
| Row 2 | Column headers | | | | | | |
| Row 3+ | Date | PO # | Incoming | Outgoing | Location/Field | Running Balance | Notes | BOL Link |

## Setup

### 1. Install

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
- Add your Google Service Account credentials (JSON or individual fields)
- Add a Sheet ID for each crop you want to track
- Leave a `SHEET_ID` blank to show a "not configured" placeholder for that crop

### 3. Run

```bash
npm run dev
```

## Adding a New Crop

1. Create a new Google Sheet, share it with your service account email (Viewer access)
2. Add tabs for each variety or storage location
3. Add a `YOURCROP_SHEET_ID=...` entry to `.env.local`
4. In `app/api/inventory/`, copy any existing route file and update the crop name and env var
5. Add a new entry to the `CROPS` array in `app/page.tsx`

## Deployment (Render)

Set these environment variables in Render:
- `GOOGLE_SERVICE_ACCOUNT_JSON` — full contents of your service account JSON key
- `POTATO_SEED_SHEET_ID` — existing potato seed sheet
- `WHEAT_SHEET_ID`, `POTATOES_SHEET_ID`, `ONIONS_SHEET_ID`, `YELLOW_PEAS_SHEET_ID` — add as you set up each sheet

Build command: `npm install && npm run build`  
Start command: `npm start`

## Project Structure

```
app/
├── api/inventory/
│   ├── potato-seed/route.ts   ← Potato seed API
│   ├── wheat/route.ts          ← Wheat API
│   ├── potatoes/route.ts       ← Potatoes API
│   ├── onions/route.ts         ← Onions API
│   └── yellow-peas/route.ts    ← Yellow Peas API
├── layout.tsx
├── page.tsx                    ← Main tabbed UI
└── globals.css
lib/
├── sheets.ts                   ← Shared Google Sheets fetch logic
└── types.ts                    ← Shared TypeScript types
```
