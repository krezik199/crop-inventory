'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Wheat, Sprout, ArrowLeft } from 'lucide-react';
import { CropInventoryResponse, SheetData } from '../lib/types';

// ─── Custom SVG Icons ──────────────────────────────────────────────────────────

function OnionIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Outer bulb */}
      <path d="M12 21C8.5 21 5.5 18.5 5.5 14.5C5.5 11 7.5 8.5 9 7C9.5 6.5 10 6 10.5 5.5C11 5 11.5 4.5 12 4C12.5 4.5 13 5 13.5 5.5C14 6 14.5 6.5 15 7C16.5 8.5 18.5 11 18.5 14.5C18.5 18.5 15.5 21 12 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15"/>
      {/* Inner layer lines */}
      <path d="M12 19C9.5 19 7.5 17 7.5 14.5C7.5 12 9 10 10.5 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <path d="M12 17C10.5 17 9.5 15.8 9.5 14.5C9.5 13 10.2 11.8 11 10.8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none"/>
      {/* Stem/top */}
      <path d="M10.5 5.5C10.5 5.5 11 3.5 12 3C13 3.5 13.5 5.5 13.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Roots */}
      <path d="M10 20.5C9.5 21.5 9 22 8.5 22" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      <path d="M12 21V22.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      <path d="M14 20.5C14.5 21.5 15 22 15.5 22" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}

function PeaPodIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Pod outer shape */}
      <path d="M3 12C3 12 4 5 9 4C14 3 18 6 20 9C21.5 11.5 21 14 19.5 15.5C17.5 17.5 14 18 11 17C8 16 5 15 3 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15"/>
      {/* Pod ridge line */}
      <path d="M3.5 11.5C5.5 13.5 8.5 14.5 11.5 15.5C14 16.5 17 16.5 19 15" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none"/>
      {/* Peas bumps */}
      <circle cx="7.5" cy="10.5" r="1.8" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.3"/>
      <circle cx="11.5" cy="9.5" r="1.8" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.3"/>
      <circle cx="15.5" cy="9.5" r="1.8" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.3"/>
      {/* Stem + curl */}
      <path d="M3 12C2 11 2 9.5 3 9C3.5 8.5 4 9 3.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      {/* Leaf */}
      <path d="M19.5 15.5C20.5 14 22 13 22 11.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function PotatoIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Main potato body — lumpy irregular oval */}
      <path d="M4.5 13C3.5 11 4 8.5 6 7C8 5.5 10.5 5 13 5.5C15.5 6 17.5 7 18.5 8.5C20 10.5 19.5 13.5 18 15C16.5 16.5 14 17.5 11 17.5C8 17.5 5.5 15.5 4.5 13Z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
        fill="currentColor" fillOpacity="0.15"/>
      {/* Eyes / dimples */}
      <circle cx="9" cy="10" r="0.9" fill="currentColor" fillOpacity="0.7"/>
      <circle cx="13.5" cy="9" r="0.9" fill="currentColor" fillOpacity="0.7"/>
      <circle cx="15.5" cy="13" r="0.9" fill="currentColor" fillOpacity="0.7"/>
      <circle cx="8.5" cy="14" r="0.7" fill="currentColor" fillOpacity="0.5"/>
      {/* Small sprout nub on top */}
      <path d="M14 5.5C14.5 4.5 15.5 4 16 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M15 4C15.5 3.5 16.5 3.5 17 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}

interface CropConfig {
  id: string;
  label: string;
  apiPath: string;
  unit: string;
  hasSubLocations: boolean;
  accentColor: string;
  bgColor: string;
  description: string;
  icon: (size?: number, className?: string) => React.ReactNode;
}

const CROPS: CropConfig[] = [
  {
    id: 'potato-seed',
    label: 'Potato Seed',
    apiPath: '/api/inventory/potato-seed',
    unit: 'CWT',
    hasSubLocations: false,
    accentColor: 'green',
    bgColor: 'from-green-950/60 to-green-900/20',
    description: 'Seed variety inventory',
    icon: (size = 24, className = '') => <Sprout width={size} height={size} className={className} />,
  },
  {
    id: 'wheat',
    label: 'Wheat',
    apiPath: '/api/inventory/wheat',
    unit: 'Bu',
    hasSubLocations: true,
    accentColor: 'amber',
    bgColor: 'from-amber-950/60 to-amber-900/20',
    description: 'Lincoln · Martinez · Kulm',
    icon: (size = 24, className = '') => <Wheat width={size} height={size} className={className} />,
  },
  {
    id: 'potatoes',
    label: 'Potatoes',
    apiPath: '/api/inventory/potatoes',
    unit: 'Tons',
    hasSubLocations: true,
    accentColor: 'orange',
    bgColor: 'from-orange-950/60 to-orange-900/20',
    description: 'Wheeler · Hiawatha · Road 19 · Martinez',
    icon: (size = 24, className = '') => <PotatoIcon size={size} className={className} />,
  },
  {
    id: 'onions',
    label: 'Onions',
    apiPath: '/api/inventory/onions',
    unit: 'Tons',
    hasSubLocations: true,
    accentColor: 'yellow',
    bgColor: 'from-yellow-950/60 to-yellow-900/20',
    description: 'Wagner',
    icon: (size = 24, className = '') => <OnionIcon size={size} className={className} />,
  },
  {
    id: 'yellow-peas',
    label: 'Yellow Peas',
    apiPath: '/api/inventory/yellow-peas',
    unit: 'Bu',
    hasSubLocations: false,
    accentColor: 'lime',
    bgColor: 'from-lime-950/60 to-lime-900/20',
    description: 'Pea inventory tracking',
    icon: (size = 24, className = '') => <PeaPodIcon size={size} className={className} />,
  },
];

// ─── Quonset Building SVG ──────────────────────────────────────────────────────

function QuonsetBuilding({
  name,
  capacity,
  current,
  accentColor = '#f97316',
}: {
  name: string;
  capacity: number;
  current: number;
  accentColor?: string;
}) {
  const fillPct = Math.min(1, Math.max(0, current / capacity));
  const isEmpty = current === 0;

  const W = 100;
  const wallH = 14;       // short vertical side walls
  const archH = 38;       // height of the half-cylinder arch above walls
  const totalH = wallH + archH + 18; // +18 for label space
  const floor = wallH + archH;
  const cx = W / 2;

  // The arch is a half-ellipse
  const archTop = archH;

  // Fill: fills from floor up, clipped inside the arch shape
  const fillH = (wallH + archH) * fillPct;
  const fillY = floor - fillH;

  // Fill color
  const fillOpacity = fillPct > 0 ? 0.55 : 0;
  const fillCol = fillPct > 0.8 ? '#fb923c' : fillPct > 0.4 ? '#ea580c' : fillPct > 0.1 ? '#9a3412' : accentColor;

  // Clip path id (unique per name to avoid conflicts)
  const clipId = `quonset-clip-${name.replace(/\s+/g, '-')}`;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width={W} height={totalH} viewBox={`0 0 ${W} ${totalH}`} className="overflow-visible">
        <defs>
          {/* Clip path = the interior of the quonset shape */}
          <clipPath id={clipId}>
            <path d={`
              M 4 ${floor}
              L 4 ${archH}
              A ${cx - 4} ${archH} 0 0 1 ${W - 4} ${archH}
              L ${W - 4} ${floor}
              Z
            `} />
          </clipPath>
        </defs>

        {/* Foundation / ground line */}
        <rect x={2} y={floor} width={W - 4} height={3} fill="#1f2937" rx="1" />

        {/* Fill level (clipped to building shape) */}
        {fillPct > 0 && (
          <rect
            x={0} y={fillY} width={W} height={fillH + 3}
            fill={fillCol} fillOpacity={fillOpacity}
            clipPath={`url(#${clipId})`}
            style={{ transition: 'all 0.6s ease' }}
          />
        )}

        {/* Building body — arch outline */}
        <path
          d={`
            M 4 ${floor}
            L 4 ${archH}
            A ${cx - 4} ${archH} 0 0 1 ${W - 4} ${archH}
            L ${W - 4} ${floor}
            Z
          `}
          fill="#111827"
          stroke="#374151"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Arch ribs (the corrugated metal lines) */}
        {[0.2, 0.4, 0.6, 0.8].map((t, i) => {
          // Points along the arch
          const angle = Math.PI * t;
          const rx = cx - 4;
          const x = cx + rx * Math.cos(Math.PI - angle);
          const y = archH - (archH) * Math.sin(angle);
          return (
            <line
              key={i}
              x1={x} y1={y}
              x2={x} y2={floor}
              stroke="#1f2937"
              strokeWidth="1"
            />
          );
        })}

        {/* End wall detail — small door/vent rectangle */}
        <rect x={cx - 7} y={floor - 10} width={14} height={10} fill="#1a2332" stroke="#374151" strokeWidth="1" rx="1" />
        <line x1={cx} y1={floor - 10} x2={cx} y2={floor} stroke="#374151" strokeWidth="0.75" />

        {/* Roof vent on top */}
        <rect x={cx - 5} y={archH - 3} width={10} height={5} fill="#1f2937" stroke="#4b5563" strokeWidth="1" rx="1" />

        {/* Fill % text */}
        {fillPct > 0.18 && (
          <text
            x={cx} y={fillY + fillH / 2 + 4}
            textAnchor="middle" fontSize="9" fontWeight="700"
            fill="rgba(255,255,255,0.9)"
          >
            {Math.round(fillPct * 100)}%
          </text>
        )}

        {/* Empty label */}
        {isEmpty && (
          <text x={cx} y={floor - 18} textAnchor="middle" fontSize="8" fill="#4b5563">Empty</text>
        )}
      </svg>

      {/* Labels */}
      <p className="text-xs font-medium text-gray-300 text-center leading-tight max-w-[96px]">{name}</p>
      <p className="text-xs text-gray-500 text-center tabular-nums">
        {isEmpty ? '—' : fmt(current)} <span className="text-gray-700">/ {fmt(capacity)}</span>
      </p>
    </div>
  );
}

// ─── Potato Storage Locations ──────────────────────────────────────────────────

interface StorageConfig {
  name: string;
  capacity: number;
}

interface StorageLocationConfig {
  location: string;
  buildings: StorageConfig[];
}

const POTATO_LOCATIONS: StorageLocationConfig[] = [
  { location: 'Wheeler',  buildings: [{ name: 'East', capacity: 6000  }, { name: 'West',  capacity: 6000  }] },
  { location: 'Hiawatha', buildings: [{ name: 'North', capacity: 4000 }, { name: 'South', capacity: 4000  }] },
  { location: 'Road 19',  buildings: [{ name: 'East', capacity: 10000 }, { name: 'West',  capacity: 10000 }] },
  { location: 'Martinez', buildings: [{ name: 'North', capacity: 6000 }, { name: 'South', capacity: 6000  }] },
];

const ONION_LOCATIONS: StorageLocationConfig[] = [
  { location: 'Wagner', buildings: [{ name: 'North', capacity: 3500 }, { name: 'South', capacity: 3500 }] },
];

// ─── Wheat Storage Locations ────────────────────────────────────────────────────

interface BinConfig { name: string; capacity: number; }
interface WheatLocationConfig { location: string; bins: BinConfig[]; }

const WHEAT_LOCATIONS: WheatLocationConfig[] = [
  {
    location: 'Lincoln',
    bins: [
      { name: 'Bin 1', capacity: 15000 }, { name: 'Bin 2', capacity: 15000 },
      { name: 'Bin 3', capacity: 15000 }, { name: 'Bin 4', capacity: 15000 },
      { name: 'Bin 5', capacity: 15000 }, { name: 'Bin 6', capacity: 15000 },
      { name: 'Bin 7', capacity: 15000 },
    ],
  },
  {
    location: 'Martinez',
    bins: [
      { name: 'North Bin', capacity: 15000 },
      { name: 'South Bin', capacity: 15000 },
    ],
  },
  {
    location: 'Kulm',
    bins: [{ name: 'Bin 1', capacity: 15000 }],
  },
];

// ─── Types ──────────────────────────────────────────────────────────────────────

type CropDataMap = Record<string, CropInventoryResponse | null>;

// ─── Helpers ────────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function isConfigured(data: CropInventoryResponse | null) {
  if (!data) return false;
  return data.sheetId !== 'not-configured';
}

// ─── Home / Crop Selector ───────────────────────────────────────────────────────

function HomeScreen({
  cropData,
  onSelect,
}: {
  cropData: CropDataMap;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Crops</h2>
        <p className="text-gray-500 text-sm mt-1">Select a crop to view inventory</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CROPS.map((crop) => {
          const data = cropData[crop.id];
          const configured = isConfigured(data);
          const sheets = data ? Object.values(data.sheets) : [];
          const total = sheets.reduce((s, sh) => s + sh.currentTotal, 0);

          return (
            <button
              key={crop.id}
              onClick={() => onSelect(crop.id)}
              className={`text-left p-6 rounded-2xl bg-gradient-to-br ${crop.bgColor} border border-gray-800 hover:border-${crop.accentColor}-700/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 group`}
            >
              <div className="flex items-start justify-between mb-5">
                <div className={`p-3 rounded-xl bg-${crop.accentColor}-900/40 border border-${crop.accentColor}-800/40`}>
                  {crop.icon(28, `text-${crop.accentColor}-400`)}
                </div>
                <span className={`text-xs text-${crop.accentColor}-700 group-hover:text-${crop.accentColor}-500 transition-colors mt-1`}>
                  View →
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-1">{crop.label}</h3>
              <p className="text-xs text-gray-500 mb-4">{crop.description}</p>

              {configured && total > 0 ? (
                <div>
                  <p className={`text-3xl font-bold text-${crop.accentColor}-400 tabular-nums`}>
                    {fmt(total)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{crop.unit} current inventory</p>
                </div>
              ) : configured ? (
                <p className="text-sm text-gray-600">No inventory recorded</p>
              ) : crop.id === 'wheat' ? (
                <div>
                  <p className={`text-3xl font-bold text-${crop.accentColor}-400 tabular-nums`}>
                    {fmt(WHEAT_LOCATIONS.reduce((s, l) => s + l.bins.reduce((bs, b) => bs + b.capacity, 0), 0))}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Bu total capacity</p>
                </div>
              ) : (
                <p className="text-xs text-gray-700 font-mono">Not configured</p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Grain Bin SVG ──────────────────────────────────────────────────────────────

function GrainBin({ name, capacity, current }: { name: string; capacity: number; current: number }) {
  const fillPct = Math.min(1, Math.max(0, current / capacity));
  const isEmpty = current === 0;
  const W = 80; const roofH = 22; const bodyTop = roofH; const bodyH = 68;
  const bodyBottom = bodyTop + bodyH; const legH = 10; const H = bodyBottom + legH + 2;
  const cx = W / 2;
  const roofPts = `${cx},2 ${W - 4},${roofH} 4,${roofH}`;
  const fillH = bodyH * fillPct; const fillY = bodyBottom - fillH;
  const fillColor = fillPct > 0.8 ? '#f59e0b' : fillPct > 0.4 ? '#d97706' : fillPct > 0.1 ? '#92400e' : '#1c1917';

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
        <line x1={cx - 12} y1={bodyBottom} x2={cx - 14} y2={bodyBottom + legH} stroke="#4b5563" strokeWidth="2.5" strokeLinecap="round" />
        <line x1={cx + 12} y1={bodyBottom} x2={cx + 14} y2={bodyBottom + legH} stroke="#4b5563" strokeWidth="2.5" strokeLinecap="round" />
        <rect x={4} y={bodyTop} width={W - 8} height={bodyH} fill="#111827" rx="3" />
        {fillPct > 0 && <rect x={5} y={fillY} width={W - 10} height={fillH} fill={fillColor} rx="2" style={{ transition: 'all 0.6s ease' }} />}
        <rect x={4} y={bodyTop} width={W - 8} height={bodyH} fill="none" stroke="#374151" strokeWidth="1.5" rx="3" />
        {[0.33, 0.66].map((f, i) => <line key={i} x1={5} y1={bodyTop + bodyH * f} x2={W - 5} y2={bodyTop + bodyH * f} stroke="#1f2937" strokeWidth="1" />)}
        <polygon points={roofPts} fill="#1f2937" stroke="#374151" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx={cx} cy={3} r={2.5} fill="#374151" />
        {fillPct > 0.15 && <text x={cx} y={fillY + fillH / 2 + 4} textAnchor="middle" fontSize="10" fontWeight="600" fill="rgba(255,255,255,0.85)">{Math.round(fillPct * 100)}%</text>}
        {isEmpty && <text x={cx} y={bodyTop + bodyH / 2 + 4} textAnchor="middle" fontSize="9" fill="#4b5563">Empty</text>}
      </svg>
      <p className="text-xs font-medium text-gray-300 text-center leading-tight">{name}</p>
      <p className="text-xs text-gray-500 text-center tabular-nums">
        {isEmpty ? '—' : fmt(current)} <span className="text-gray-700">/ {fmt(capacity)}</span>
      </p>
    </div>
  );
}

// ─── Wheat Panels ───────────────────────────────────────────────────────────────

function WheatLocationPanel({ location }: { location: WheatLocationConfig }) {
  const totalCapacity = location.bins.reduce((s, b) => s + b.capacity, 0);
  return (
    <div className="space-y-6">
      <div className="p-5 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-amber-800/30 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{location.location} — Total Capacity</p>
          <p className="text-3xl font-bold text-amber-400 tabular-nums">{fmt(totalCapacity)}</p>
          <p className="text-xs text-gray-600 mt-1">Bu · {location.bins.length} {location.bins.length === 1 ? 'bin' : 'bins'}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Current</p>
          <p className="text-2xl font-bold text-white tabular-nums">0</p>
          <p className="text-xs text-gray-600 mt-1">Bu stored</p>
        </div>
      </div>
      <div className="p-6 rounded-xl bg-gray-900/60 border border-gray-800">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-6">Storage Bins</p>
        <div className="flex flex-wrap gap-8 justify-start">
          {location.bins.map((bin) => <GrainBin key={bin.name} name={bin.name} capacity={bin.capacity} current={0} />)}
        </div>
      </div>
    </div>
  );
}

function WheatOverviewPanel({ onSelectLocation }: { onSelectLocation: (loc: string) => void }) {
  const totalCapacity = WHEAT_LOCATIONS.reduce((s, loc) => s + loc.bins.reduce((bs, b) => bs + b.capacity, 0), 0);
  return (
    <div className="space-y-8">
      <div className="p-6 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-amber-800/40">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Total Wheat Capacity</p>
        <p className="text-6xl font-bold text-amber-400 tabular-nums">{fmt(totalCapacity)}</p>
        <p className="text-sm text-gray-600 mt-2">Bu · {WHEAT_LOCATIONS.reduce((s, l) => s + l.bins.length, 0)} bins across {WHEAT_LOCATIONS.length} locations</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {WHEAT_LOCATIONS.map((loc) => {
          const locCapacity = loc.bins.reduce((s, b) => s + b.capacity, 0);
          return (
            <button key={loc.location} onClick={() => onSelectLocation(loc.location)}
              className="text-left p-5 rounded-xl bg-gray-900/60 border border-gray-800 hover:border-amber-700/60 hover:bg-gray-900 transition-all group">
              <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors mb-3">{loc.location}</p>
              <div className="flex gap-1 mb-3">
                {loc.bins.map((bin) => (
                  <svg key={bin.name} width="16" height="22" viewBox="0 0 16 22">
                    <polygon points="8,1 15,6 1,6" fill="#1f2937" stroke="#374151" strokeWidth="1" />
                    <rect x="1" y="6" width="14" height="13" fill="#111827" stroke="#374151" strokeWidth="1" rx="1" />
                  </svg>
                ))}
              </div>
              <p className="text-2xl font-bold text-amber-400 tabular-nums">{fmt(locCapacity)}</p>
              <p className="text-xs text-gray-600 mt-1">Bu capacity · {loc.bins.length} {loc.bins.length === 1 ? 'bin' : 'bins'}</p>
              <p className="text-xs text-amber-700 mt-3 group-hover:text-amber-500 transition-colors">View bins →</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Quonset Storage Location Panel (Potatoes & Onions) ────────────────────────

function QuonsetLocationPanel({
  location,
  accentColor,
  unit,
}: {
  location: StorageLocationConfig;
  accentColor: string;
  unit: string;
}) {
  const totalCapacity = location.buildings.reduce((s, b) => s + b.capacity, 0);
  const totalCurrent = 0; // wired to sheet later

  return (
    <div className="space-y-6">
      <div className={`p-5 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-${accentColor}-800/30 flex items-center justify-between`}>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{location.location} — Capacity</p>
          <p className={`text-3xl font-bold text-${accentColor}-400 tabular-nums`}>{fmt(totalCapacity)}</p>
          <p className="text-xs text-gray-600 mt-1">{unit} · {location.buildings.length} {location.buildings.length === 1 ? 'building' : 'buildings'}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Current</p>
          <p className="text-2xl font-bold text-white tabular-nums">{fmt(totalCurrent)}</p>
          <p className="text-xs text-gray-600 mt-1">{unit} stored</p>
        </div>
      </div>

      <div className="p-6 rounded-xl bg-gray-900/60 border border-gray-800">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-6">Storages</p>
        <div className="flex flex-wrap gap-10 justify-start">
          {location.buildings.map((b) => (
            <QuonsetBuilding
              key={b.name}
              name={b.name}
              capacity={b.capacity}
              current={0}
              accentColor={accentColor === 'orange' ? '#f97316' : '#eab308'}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function QuonsetOverviewPanel({
  locations,
  accentColor,
  unit,
  cropLabel,
  onSelectLocation,
}: {
  locations: StorageLocationConfig[];
  accentColor: string;
  unit: string;
  cropLabel: string;
  onSelectLocation: (loc: string) => void;
}) {
  const totalCapacity = locations.reduce((s, loc) => s + loc.buildings.reduce((bs, b) => bs + b.capacity, 0), 0);

  if (locations.length === 0) {
    return (
      <div className="py-16 text-center text-gray-600">
        <p className="text-sm">No storage locations configured yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className={`p-6 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-${accentColor}-800/40`}>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Total {cropLabel} Capacity</p>
        <p className={`text-6xl font-bold text-${accentColor}-400 tabular-nums`}>{fmt(totalCapacity)}</p>
        <p className="text-sm text-gray-600 mt-2">
          {unit} · {locations.reduce((s, l) => s + l.buildings.length, 0)} buildings across {locations.length} locations
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {locations.map((loc) => {
          const locCapacity = loc.buildings.reduce((s, b) => s + b.capacity, 0);
          return (
            <button
              key={loc.location}
              onClick={() => onSelectLocation(loc.location)}
              className={`text-left p-5 rounded-xl bg-gray-900/60 border border-gray-800 hover:border-${accentColor}-700/60 hover:bg-gray-900 transition-all group`}
            >
              <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors mb-3">{loc.location}</p>
              {/* Mini quonset icons */}
              <div className="flex gap-2 mb-3">
                {loc.buildings.map((b) => (
                  <svg key={b.name} width="32" height="20" viewBox="0 0 32 20">
                    <path d="M 2 17 L 2 8 A 14 8 0 0 1 30 8 L 30 17 Z" fill="#111827" stroke="#374151" strokeWidth="1" />
                    <rect x="2" y="17" width="28" height="2" fill="#1f2937" rx="0.5" />
                  </svg>
                ))}
              </div>
              <p className={`text-2xl font-bold text-${accentColor}-400 tabular-nums`}>{fmt(locCapacity)}</p>
              <p className="text-xs text-gray-600 mt-1">{unit} capacity</p>
              <p className={`text-xs text-${accentColor}-700 mt-3 group-hover:text-${accentColor}-500 transition-colors`}>View storage →</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Sheet Detail Panel ─────────────────────────────────────────────────────────

function SheetDetailPanel({ sheet, unit, accentColor }: { sheet: SheetData; unit: string; accentColor: string }) {
  const recent = [...sheet.transactions].slice(-8).reverse();
  const totalIn = sheet.transactions.reduce((s, t) => s + t.incoming, 0);
  const totalOut = sheet.transactions.reduce((s, t) => s + t.outgoing, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Current Balance', value: fmt(sheet.currentTotal), sub: unit, highlight: true },
          { label: 'Total In', value: fmt(totalIn), sub: unit, highlight: false },
          { label: 'Total Out', value: fmt(totalOut), sub: unit, highlight: false },
        ].map((s) => (
          <div key={s.label} className={`p-5 rounded-xl border ${s.highlight ? `bg-gradient-to-br from-gray-900 to-gray-800 border-${accentColor}-700/50` : 'bg-gray-900/60 border-gray-800'}`}>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">{s.label}</p>
            <p className={`text-3xl font-bold ${s.highlight ? `text-${accentColor}-400` : 'text-white'}`}>{s.value}</p>
            <p className="text-xs text-gray-600 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-gray-800 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-800 bg-gray-900/60">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Recent Transactions <span className="ml-2 font-normal text-gray-600">({sheet.transactions.length} total)</span>
          </p>
        </div>
        {recent.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-600">No transactions recorded</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-black/40">
                  {['Date', 'PO #', 'In', 'Out', 'Location', 'Balance'].map((h) => (
                    <th key={h} className="px-4 py-2 text-left text-xs text-gray-600 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((tx, i) => (
                  <tr key={i} className="border-b border-gray-900 hover:bg-gray-900/40 transition-colors">
                    <td className="px-4 py-2.5 text-gray-400 whitespace-nowrap">{tx.date}</td>
                    <td className="px-4 py-2.5 text-gray-500 font-mono text-xs">{tx.poNumber || '—'}</td>
                    <td className="px-4 py-2.5">{tx.incoming > 0 ? <span className={`text-${accentColor}-400 font-medium`}>+{fmt(tx.incoming)}</span> : <span className="text-gray-700">—</span>}</td>
                    <td className="px-4 py-2.5">{tx.outgoing > 0 ? <span className="text-red-400 font-medium">−{fmt(tx.outgoing)}</span> : <span className="text-gray-700">—</span>}</td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{tx.location || '—'}</td>
                    <td className="px-4 py-2.5 text-white font-medium tabular-nums">{fmt(tx.runningBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Crop Overview Panel ────────────────────────────────────────────────────────

function CropOverviewPanel({ data, crop, onSelectLocation }: { data: CropInventoryResponse; crop: CropConfig; onSelectLocation?: (name: string) => void }) {
  const sheetList = Object.values(data.sheets);
  const grandTotal = sheetList.reduce((s, sh) => s + sh.currentTotal, 0);

  if (sheetList.length === 0) {
    return <div className="py-16 text-center text-gray-600"><p className="text-sm">No data yet.</p></div>;
  }

  return (
    <div className="space-y-8">
      <div className={`p-6 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-${crop.accentColor}-800/40`}>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Total {crop.label}</p>
        <p className={`text-6xl font-bold text-${crop.accentColor}-400 tabular-nums`}>{fmt(grandTotal)}</p>
        <p className="text-sm text-gray-600 mt-2">{crop.unit} · {sheetList.length} {sheetList.length === 1 ? 'location' : 'locations'} tracked</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sheetList.map((sheet) => (
          <button key={sheet.name} onClick={() => onSelectLocation?.(sheet.name)}
            className={`text-left p-5 rounded-xl bg-gray-900/60 border border-gray-800 hover:border-${crop.accentColor}-700/60 hover:bg-gray-900 transition-all group`}>
            <p className="text-sm text-gray-400 mb-3 font-medium group-hover:text-white transition-colors">{sheet.name}</p>
            <p className={`text-4xl font-bold text-${crop.accentColor}-400 tabular-nums`}>{fmt(sheet.currentTotal)}</p>
            <p className="text-xs text-gray-600 mt-2">{crop.unit} · {sheet.transactions.length} transactions</p>
            {crop.hasSubLocations && <p className={`text-xs text-${crop.accentColor}-700 mt-3 group-hover:text-${crop.accentColor}-500 transition-colors`}>View details →</p>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Crop Detail View ───────────────────────────────────────────────────────────

function CropDetailView({ crop, data, loading }: { crop: CropConfig; data: CropInventoryResponse | null; loading: boolean }) {
  const [activeLocation, setActiveLocation] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className={`animate-spin rounded-full h-10 w-10 border-b-2 border-${crop.accentColor}-400`} />
      </div>
    );
  }

  // Wheat bin visualization
  if (crop.id === 'wheat') {
    return (
      <div className="space-y-6">
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setActiveLocation(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeLocation === null ? 'bg-amber-900/50 text-amber-300 border border-amber-700/50' : 'text-gray-500 hover:text-gray-300 border border-gray-800 hover:border-gray-700'}`}>
            Overview
          </button>
          {WHEAT_LOCATIONS.map((loc) => (
            <button key={loc.location} onClick={() => setActiveLocation(loc.location)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeLocation === loc.location ? 'bg-amber-900/50 text-amber-300 border border-amber-700/50' : 'text-gray-500 hover:text-gray-300 border border-gray-800 hover:border-gray-700'}`}>
              {loc.location}
            </button>
          ))}
        </div>
        {activeLocation === null
          ? <WheatOverviewPanel onSelectLocation={setActiveLocation} />
          : <WheatLocationPanel location={WHEAT_LOCATIONS.find((l) => l.location === activeLocation)!} />
        }
      </div>
    );
  }

  // Potatoes — quonset storage visualization
  if (crop.id === 'potatoes') {
    return (
      <div className="space-y-6">
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setActiveLocation(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeLocation === null ? 'bg-orange-900/50 text-orange-300 border border-orange-700/50' : 'text-gray-500 hover:text-gray-300 border border-gray-800 hover:border-gray-700'}`}>
            Overview
          </button>
          {POTATO_LOCATIONS.map((loc) => (
            <button key={loc.location} onClick={() => setActiveLocation(loc.location)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeLocation === loc.location ? 'bg-orange-900/50 text-orange-300 border border-orange-700/50' : 'text-gray-500 hover:text-gray-300 border border-gray-800 hover:border-gray-700'}`}>
              {loc.location}
            </button>
          ))}
        </div>
        {activeLocation === null
          ? <QuonsetOverviewPanel locations={POTATO_LOCATIONS} accentColor="orange" unit="Tons" cropLabel="Potato" onSelectLocation={setActiveLocation} />
          : <QuonsetLocationPanel location={POTATO_LOCATIONS.find((l) => l.location === activeLocation)!} accentColor="orange" unit="Tons" />
        }
      </div>
    );
  }

  // Onions — quonset storage visualization
  if (crop.id === 'onions') {
    return (
      <div className="space-y-6">
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setActiveLocation(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeLocation === null ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700/50' : 'text-gray-500 hover:text-gray-300 border border-gray-800 hover:border-gray-700'}`}>
            Overview
          </button>
          {ONION_LOCATIONS.map((loc) => (
            <button key={loc.location} onClick={() => setActiveLocation(loc.location)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeLocation === loc.location ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700/50' : 'text-gray-500 hover:text-gray-300 border border-gray-800 hover:border-gray-700'}`}>
              {loc.location}
            </button>
          ))}
        </div>
        {activeLocation === null
          ? <QuonsetOverviewPanel locations={ONION_LOCATIONS} accentColor="yellow" unit="Tons" cropLabel="Onion" onSelectLocation={setActiveLocation} />
          : <QuonsetLocationPanel location={ONION_LOCATIONS.find((l) => l.location === activeLocation)!} accentColor="yellow" unit="Tons" />
        }
      </div>
    );
  }



  const configured = isConfigured(data);
  if (!configured) {
    return (
      <div className="py-20 text-center space-y-3">
        <p className="text-gray-500 text-sm">No Google Sheet configured for <span className="text-white font-medium">{crop.label}</span>.</p>
        <p className="text-gray-700 text-xs font-mono">
          Add <code className="bg-gray-900 px-2 py-0.5 rounded text-gray-400">{crop.id.toUpperCase().replace(/-/g, '_')}_SHEET_ID</code> to your environment variables.
        </p>
      </div>
    );
  }

  if (!data) return null;

  const sheetList = Object.values(data.sheets);
  const activeSheet = activeLocation ? data.sheets[activeLocation] : null;

  // Potato seed
  if (!crop.hasSubLocations) {
    if (sheetList.length === 0) return <CropOverviewPanel data={data} crop={crop} />;
    if (!activeLocation) {
      return <CropOverviewPanel data={data} crop={crop} onSelectLocation={sheetList.length > 1 ? setActiveLocation : undefined} />;
    }
    return (
      <div className="space-y-5">
        <button onClick={() => setActiveLocation(null)}
          className="flex items-center gap-3 px-6 py-4 rounded-xl border border-gray-700 text-gray-200 hover:text-white hover:border-gray-500 hover:bg-gray-900 transition-all text-xl font-semibold min-w-[200px]">
          <span className="text-2xl">←</span> All varieties
        </button>
        <h3 className="text-xl font-bold text-white">{activeLocation}</h3>
        {activeSheet && <SheetDetailPanel sheet={activeSheet} unit={crop.unit} accentColor={crop.accentColor} />}
      </div>
    );
  }

  // Multi-location crops
  return (
    <div className="space-y-6">
      {sheetList.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setActiveLocation(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeLocation === null ? `bg-${crop.accentColor}-900/50 text-${crop.accentColor}-300 border border-${crop.accentColor}-700/50` : 'text-gray-500 hover:text-gray-300 border border-gray-800 hover:border-gray-700'}`}>
            Overview
          </button>
          {sheetList.map((sheet) => (
            <button key={sheet.name} onClick={() => setActiveLocation(sheet.name)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeLocation === sheet.name ? `bg-${crop.accentColor}-900/50 text-${crop.accentColor}-300 border border-${crop.accentColor}-700/50` : 'text-gray-500 hover:text-gray-300 border border-gray-800 hover:border-gray-700'}`}>
              {sheet.name}
            </button>
          ))}
        </div>
      )}
      {activeLocation === null
        ? <CropOverviewPanel data={data} crop={crop} onSelectLocation={setActiveLocation} />
        : <div className="space-y-4">{activeSheet && <SheetDetailPanel sheet={activeSheet} unit={crop.unit} accentColor={crop.accentColor} />}</div>
      }
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function FarmInventoryPage() {
  const [activeCropId, setActiveCropId] = useState<string | null>(null); // null = home screen
  const [cropData, setCropData] = useState<CropDataMap>({});
  const [loadingCrops, setLoadingCrops] = useState<Record<string, boolean>>({});
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchCrop = useCallback(async (crop: CropConfig) => {
    setLoadingCrops((prev) => ({ ...prev, [crop.id]: true }));
    try {
      const res = await fetch(crop.apiPath);
      const data: CropInventoryResponse = await res.json();
      setCropData((prev) => ({ ...prev, [crop.id]: data }));
    } catch (err) {
      setCropData((prev) => ({ ...prev, [crop.id]: null }));
    } finally {
      setLoadingCrops((prev) => ({ ...prev, [crop.id]: false }));
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all(CROPS.map(fetchCrop));
    setLastUpdated(new Date().toLocaleTimeString());
    setIsRefreshing(false);
  }, [fetchCrop]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => {
    const interval = setInterval(fetchAll, 60_000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const activeCrop = activeCropId ? CROPS.find((c) => c.id === activeCropId) : null;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-900 px-8 lg:px-14 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {/* Clickable title always goes home */}
            <button onClick={() => setActiveCropId(null)} className="text-left">
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-baseline gap-2">
                Hyer Farms
                <span className="text-gray-600 font-normal text-lg">Inventory</span>
              </h1>
            </button>
            {lastUpdated && (
              <p className="text-xs text-gray-700 mt-0.5">Last updated: <span className="text-gray-500">{lastUpdated}</span></p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Back button when inside a crop */}
            {activeCrop && (
              <button onClick={() => setActiveCropId(null)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-${activeCrop.accentColor}-800/50 text-${activeCrop.accentColor}-400 hover:bg-${activeCrop.accentColor}-900/20 transition-all text-sm font-medium`}>
                <ArrowLeft className="w-4 h-4" />
                All Crops
              </button>
            )}
            <button onClick={fetchAll} disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 text-gray-300 rounded-lg hover:border-gray-600 hover:text-white transition disabled:opacity-40 text-sm">
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Crop name breadcrumb when inside a crop */}
        {activeCrop && (
          <div className="max-w-7xl mx-auto mt-3 flex items-center gap-2">
            <span className={`text-${activeCrop.accentColor}-400`}>{activeCrop.icon(16)}</span>
            <span className="text-lg font-semibold text-white">{activeCrop.label}</span>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-8 lg:px-14 py-8">
        {activeCrop ? (
          <CropDetailView
            crop={activeCrop}
            data={cropData[activeCrop.id] ?? null}
            loading={loadingCrops[activeCrop.id] ?? true}
          />
        ) : (
          <HomeScreen cropData={cropData} onSelect={setActiveCropId} />
        )}
      </main>

      <footer className="text-center text-xs text-gray-800 pb-8">
        Auto-refreshes every 60 seconds · Hyer Farms
      </footer>
    </div>
  );
}
