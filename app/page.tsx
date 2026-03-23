'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Wheat, Package, Sprout, Leaf, Circle } from 'lucide-react';
import { CropInventoryResponse, SheetData } from '../lib/types';

// ─── Crop Config ───────────────────────────────────────────────────────────────

interface CropConfig {
  id: string;
  label: string;
  apiPath: string;
  unit: string;
  hasSubLocations: boolean;
  accentColor: string;      // Tailwind color token name (used in data attr)
  icon: React.ReactNode;
}

const CROPS: CropConfig[] = [
  {
    id: 'potato-seed',
    label: 'Potato Seed',
    apiPath: '/api/inventory/potato-seed',
    unit: 'CWT',
    hasSubLocations: false,
    accentColor: 'green',
    icon: <Sprout className="w-4 h-4" />,
  },
  {
    id: 'wheat',
    label: 'Wheat',
    apiPath: '/api/inventory/wheat',
    unit: 'Bu',
    hasSubLocations: true,
    accentColor: 'amber',
    icon: <Wheat className="w-4 h-4" />,
  },
  {
    id: 'potatoes',
    label: 'Potatoes',
    apiPath: '/api/inventory/potatoes',
    unit: 'CWT',
    hasSubLocations: true,
    accentColor: 'orange',
    icon: <Package className="w-4 h-4" />,
  },
  {
    id: 'onions',
    label: 'Onions',
    apiPath: '/api/inventory/onions',
    unit: 'CWT',
    hasSubLocations: true,
    accentColor: 'yellow',
    icon: <Circle className="w-4 h-4" />,
  },
  {
    id: 'yellow-peas',
    label: 'Yellow Peas',
    apiPath: '/api/inventory/yellow-peas',
    unit: 'Bu',
    hasSubLocations: false,
    accentColor: 'lime',
    icon: <Leaf className="w-4 h-4" />,
  },
];

// ─── Types ─────────────────────────────────────────────────────────────────────

type CropDataMap = Record<string, CropInventoryResponse | null>;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function isConfigured(data: CropInventoryResponse | null) {
  if (!data) return false;
  return data.sheetId !== 'not-configured';
}

// ─── Components ────────────────────────────────────────────────────────────────

// A single sheet/location detail panel
function SheetDetailPanel({
  sheet,
  unit,
  accentColor,
}: {
  sheet: SheetData;
  unit: string;
  accentColor: string;
}) {
  const recent = [...sheet.transactions].slice(-8).reverse();
  const totalIn = sheet.transactions.reduce((s, t) => s + t.incoming, 0);
  const totalOut = sheet.transactions.reduce((s, t) => s + t.outgoing, 0);

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Current Balance', value: fmt(sheet.currentTotal), sub: unit, highlight: true },
          { label: 'Total In', value: fmt(totalIn), sub: unit, highlight: false },
          { label: 'Total Out', value: fmt(totalOut), sub: unit, highlight: false },
        ].map((s) => (
          <div
            key={s.label}
            className={`p-5 rounded-xl border ${
              s.highlight
                ? `bg-gradient-to-br from-gray-900 to-gray-800 border-${accentColor}-700/50`
                : 'bg-gray-900/60 border-gray-800'
            }`}
          >
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">{s.label}</p>
            <p className={`text-3xl font-bold ${s.highlight ? `text-${accentColor}-400` : 'text-white'}`}>
              {s.value}
            </p>
            <p className="text-xs text-gray-600 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Transaction table */}
      <div className="rounded-xl border border-gray-800 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-800 bg-gray-900/60">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Recent Transactions
            <span className="ml-2 font-normal text-gray-600">({sheet.transactions.length} total)</span>
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
                    <th key={h} className="px-4 py-2 text-left text-xs text-gray-600 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((tx, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-900 hover:bg-gray-900/40 transition-colors"
                  >
                    <td className="px-4 py-2.5 text-gray-400 whitespace-nowrap">{tx.date}</td>
                    <td className="px-4 py-2.5 text-gray-500 font-mono text-xs">{tx.poNumber || '—'}</td>
                    <td className="px-4 py-2.5">
                      {tx.incoming > 0 ? (
                        <span className={`text-${accentColor}-400 font-medium`}>+{fmt(tx.incoming)}</span>
                      ) : (
                        <span className="text-gray-700">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      {tx.outgoing > 0 ? (
                        <span className="text-red-400 font-medium">−{fmt(tx.outgoing)}</span>
                      ) : (
                        <span className="text-gray-700">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{tx.location || '—'}</td>
                    <td className="px-4 py-2.5 text-white font-medium tabular-nums">
                      {fmt(tx.runningBalance)}
                    </td>
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

// Overview cards for a crop (shown when no sub-location is selected or for potato-seed)
function CropOverviewPanel({
  data,
  crop,
  onSelectLocation,
}: {
  data: CropInventoryResponse;
  crop: CropConfig;
  onSelectLocation?: (name: string) => void;
}) {
  const sheetList = Object.values(data.sheets);
  const grandTotal = sheetList.reduce((s, sh) => s + sh.currentTotal, 0);

  if (sheetList.length === 0) {
    return (
      <div className="py-16 text-center text-gray-600">
        <p className="text-sm">No data — sheet may still be empty or credentials may be missing.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Grand total banner */}
      <div
        className={`p-6 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-${crop.accentColor}-800/40`}
      >
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Total {crop.label}</p>
        <p className={`text-6xl font-bold text-${crop.accentColor}-400 tabular-nums`}>
          {fmt(grandTotal)}
        </p>
        <p className="text-sm text-gray-600 mt-2">
          {crop.unit} · {sheetList.length} {sheetList.length === 1 ? 'location' : 'locations'} tracked
        </p>
      </div>

      {/* Per-sheet cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sheetList.map((sheet) => (
          <button
            key={sheet.name}
            onClick={() => onSelectLocation?.(sheet.name)}
            className={`text-left p-5 rounded-xl bg-gray-900/60 border border-gray-800 hover:border-${crop.accentColor}-700/60 hover:bg-gray-900 transition-all group`}
          >
            <p className="text-sm text-gray-400 mb-3 font-medium group-hover:text-white transition-colors">
              {sheet.name}
            </p>
            <p className={`text-4xl font-bold text-${crop.accentColor}-400 tabular-nums`}>
              {fmt(sheet.currentTotal)}
            </p>
            <p className="text-xs text-gray-600 mt-2">
              {crop.unit} · {sheet.transactions.length} transactions
            </p>
            {crop.hasSubLocations && (
              <p className={`text-xs text-${crop.accentColor}-700 mt-3 group-hover:text-${crop.accentColor}-500 transition-colors`}>
                View details →
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Full crop panel — overview + optional sub-location tabs
function CropPanel({
  crop,
  data,
  loading,
}: {
  crop: CropConfig;
  data: CropInventoryResponse | null;
  loading: boolean;
}) {
  const [activeLocation, setActiveLocation] = useState<string | null>(null);

  const configured = isConfigured(data);

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className={`animate-spin rounded-full h-10 w-10 border-b-2 border-${crop.accentColor}-400`} />
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="py-20 text-center space-y-3">
        <p className="text-gray-500 text-sm">
          No Google Sheet configured for <span className="text-white font-medium">{crop.label}</span>.
        </p>
        <p className="text-gray-700 text-xs font-mono">
          Add <code className="bg-gray-900 px-2 py-0.5 rounded text-gray-400">
            {crop.id.toUpperCase().replace(/-/g, '_')}_SHEET_ID
          </code> to your environment variables.
        </p>
      </div>
    );
  }

  if (!data) return null;

  const sheetList = Object.values(data.sheets);
  const activeSheet = activeLocation ? data.sheets[activeLocation] : null;

  // For single-location crops (potato seed), skip sub-nav
  if (!crop.hasSubLocations) {
    if (sheetList.length === 0) {
      return (
        <CropOverviewPanel data={data} crop={crop} />
      );
    }
    // Show all varieties as overview cards, clicking opens detail
    if (!activeLocation) {
      return (
        <CropOverviewPanel
          data={data}
          crop={crop}
          onSelectLocation={sheetList.length > 1 ? setActiveLocation : undefined}
        />
      );
    }
    return (
      <div className="space-y-4">
        <button
          onClick={() => setActiveLocation(null)}
          className="text-xs text-gray-500 hover:text-white transition flex items-center gap-1"
        >
          ← All varieties
        </button>
        <h3 className="text-xl font-bold text-white">{activeLocation}</h3>
        {activeSheet && <SheetDetailPanel sheet={activeSheet} unit={crop.unit} accentColor={crop.accentColor} />}
      </div>
    );
  }

  // Multi-location crops: show overview or sub-location panel
  return (
    <div className="space-y-6">
      {/* Sub-location tabs */}
      {sheetList.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveLocation(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeLocation === null
                ? `bg-${crop.accentColor}-900/50 text-${crop.accentColor}-300 border border-${crop.accentColor}-700/50`
                : 'text-gray-500 hover:text-gray-300 border border-gray-800 hover:border-gray-700'
            }`}
          >
            Overview
          </button>
          {sheetList.map((sheet) => (
            <button
              key={sheet.name}
              onClick={() => setActiveLocation(sheet.name)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeLocation === sheet.name
                  ? `bg-${crop.accentColor}-900/50 text-${crop.accentColor}-300 border border-${crop.accentColor}-700/50`
                  : 'text-gray-500 hover:text-gray-300 border border-gray-800 hover:border-gray-700'
              }`}
            >
              {sheet.name}
            </button>
          ))}
        </div>
      )}

      {/* Panel body */}
      {activeLocation === null ? (
        <CropOverviewPanel data={data} crop={crop} onSelectLocation={setActiveLocation} />
      ) : (
        <div className="space-y-4">
          {activeSheet && (
            <SheetDetailPanel sheet={activeSheet} unit={crop.unit} accentColor={crop.accentColor} />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function FarmInventoryPage() {
  const [activeCropId, setActiveCropId] = useState<string>(CROPS[0].id);
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
      console.error(`Failed to fetch ${crop.id}:`, err);
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

  // Initial load
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(fetchAll, 60_000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const activeCrop = CROPS.find((c) => c.id === activeCropId)!;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top header */}
      <header className="border-b border-gray-900 px-8 lg:px-14 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Hyer Farms
              <span className="ml-3 text-gray-600 font-normal text-lg">Inventory</span>
            </h1>
            {lastUpdated && (
              <p className="text-xs text-gray-700 mt-0.5">
                Last updated: <span className="text-gray-500">{lastUpdated}</span>
              </p>
            )}
          </div>
          <button
            onClick={fetchAll}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 text-gray-300 rounded-lg hover:border-gray-600 hover:text-white transition disabled:opacity-40 text-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </header>

      {/* Crop tabs */}
      <nav className="border-b border-gray-900 px-8 lg:px-14">
        <div className="max-w-7xl mx-auto flex gap-1 overflow-x-auto">
          {CROPS.map((crop) => {
            const isActive = activeCropId === crop.id;
            const data = cropData[crop.id];
            const configured = isConfigured(data);
            return (
              <button
                key={crop.id}
                onClick={() => setActiveCropId(crop.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? `border-${crop.accentColor}-500 text-white`
                    : 'border-transparent text-gray-600 hover:text-gray-400 hover:border-gray-700'
                }`}
              >
                <span className={isActive ? `text-${crop.accentColor}-400` : ''}>{crop.icon}</span>
                {crop.label}
                {!configured && data !== undefined && (
                  <span className="ml-1 w-1.5 h-1.5 rounded-full bg-gray-700 inline-block" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-8 lg:px-14 py-8">
        <CropPanel
          crop={activeCrop}
          data={cropData[activeCropId] ?? null}
          loading={loadingCrops[activeCropId] ?? true}
        />
      </main>

      <footer className="text-center text-xs text-gray-800 pb-8">
        Auto-refreshes every 60 seconds · Hyer Farms
      </footer>
    </div>
  );
}
