"use client";

import { motion, AnimatePresence } from "framer-motion";

export interface ScanRecord {
  id: string;
  timestamp: string;
  thumbnail: string;
  classification: string;
  threatLevel: string;
  threatColor: string;
  targetId: string;
}

interface ScanHistoryProps {
  records: ScanRecord[];
  onSelect: (record: ScanRecord) => void;
  onClear: () => void;
}

export default function ScanHistory({ records, onSelect, onClear }: ScanHistoryProps) {
  if (records.length === 0) return null;

  return (
    <div className="border border-[#00ff88]/10 rounded-lg overflow-hidden bg-black/40 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#00ff88]/10 bg-[#00ff88]/5">
        <span className="text-[10px] uppercase tracking-widest opacity-50">Scan History</span>
        <button
          onClick={onClear}
          className="text-[10px] uppercase tracking-wider opacity-30 hover:opacity-80 hover:text-red-400 transition-colors"
        >
          Clear
        </button>
      </div>
      <div className="max-h-56 overflow-y-auto">
        <AnimatePresence>
          {records.map((rec, i) => (
            <motion.button
              key={rec.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelect(rec)}
              className="w-full flex items-center gap-3 px-3 py-2 border-b border-[#00ff88]/5 hover:bg-[#00ff88]/5 transition-colors text-left"
            >
              {/* Thumbnail */}
              <div className="w-10 h-10 rounded flex-shrink-0 overflow-hidden border border-[#00ff88]/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={rec.thumbnail} alt="thumb" className="w-full h-full object-cover opacity-70" />
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold truncate opacity-80" style={{ color: rec.threatColor }}>
                  {rec.classification}
                </p>
                <p className="text-[9px] opacity-30 uppercase tracking-wider">{rec.timestamp}</p>
              </div>
              {/* Threat badge */}
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                style={{ color: rec.threatColor, border: `1px solid ${rec.threatColor}40`, backgroundColor: rec.threatColor + "10" }}
              >
                {rec.threatLevel}
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
