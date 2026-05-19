import React from 'react';
import { motion } from 'framer-motion';
import { ScanRecord } from '../types';

interface Props {
  history: ScanRecord[];
  onClose: () => void;
  uiMode: "civilian" | "tactical";
}

export default function CommandCenter({ history, onClose, uiMode }: Props) {
  const totalScans = history.length;
  const criticalCount = history.filter(h => h.threatLevel === "CRITICAL").length;
  const highCount = history.filter(h => h.threatLevel === "HIGH").length;
  const mediumCount = history.filter(h => h.threatLevel === "MEDIUM").length;
  const lowCount = history.filter(h => h.threatLevel === "LOW").length;

  const getPercentage = (count: number) => totalScans === 0 ? 0 : Math.round((count / totalScans) * 100);

  const tBorder = uiMode === "civilian" ? "border-white/10" : "border-[#00ff88]/30";
  const tText = uiMode === "civilian" ? "text-white" : "text-[#00ff88]";
  const tBg = uiMode === "civilian" ? "bg-[#090f1d]" : "bg-black/90";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md ${uiMode === "civilian" ? "bg-black/60" : "bg-black/80"}`}>
      <div className={`relative w-full max-w-4xl border ${tBorder} rounded-2xl overflow-hidden ${tBg} shadow-[0_0_50px_rgba(0,255,136,0.1)] font-mono flex flex-col max-h-[90vh]`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${tBorder} bg-white/5`}>
          <div className="flex items-center gap-3">
            <span className={`text-xl ${tText}`}>📊</span>
            <span className={`text-lg font-bold tracking-[0.2em] uppercase ${tText} glow-text`}>
              GLOBAL THREAT DASHBOARD // COMMAND CENTER
            </span>
          </div>
          <button onClick={onClose} className="text-red-400 hover:text-red-300 font-bold border border-red-500/20 px-3 py-1 rounded hover:bg-red-500/10 transition-colors shadow-[0_0_10px_rgba(255,0,0,0.2)] hover:shadow-[0_0_20px_rgba(255,0,0,0.5)]">
            [ CLOSE_TERMINAL ]
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
          {/* Stats Overview */}
          <div className={`border ${tBorder} rounded-xl p-5 space-y-5 bg-white/5 h-fit`}>
            <h3 className={`text-sm font-bold uppercase tracking-wider opacity-70 ${tText}`}>Aggregate Intelligence</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border border-white/10 rounded-lg bg-black/40 text-center">
                <div className={`text-3xl font-extrabold ${tText}`}>{totalScans}</div>
                <div className="text-[10px] uppercase opacity-50 mt-1">Total Intercepts</div>
              </div>
              <div className="p-3 border border-red-500/20 rounded-lg bg-red-500/10 text-center shadow-inner">
                <div className="text-3xl font-extrabold text-red-500">{criticalCount}</div>
                <div className="text-[10px] uppercase text-red-400/70 mt-1">Critical Threats</div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className={`text-[10px] uppercase opacity-50 ${tText}`}>Threat Distribution</h4>
              
              <div className="space-y-3 text-[10px] uppercase font-bold">
                <div className="flex items-center gap-3">
                  <span className="w-16 text-red-500">CRITICAL</span>
                  <div className="flex-1 h-2.5 bg-black/50 rounded-full overflow-hidden border border-red-500/20">
                    <motion.div initial={{width:0}} animate={{width:`${getPercentage(criticalCount)}%`}} transition={{duration:1, delay:0.1}} className="h-full bg-red-500 shadow-[0_0_10px_red]" />
                  </div>
                  <span className="w-8 text-right opacity-60 text-white">{getPercentage(criticalCount)}%</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="w-16 text-orange-400">HIGH</span>
                  <div className="flex-1 h-2.5 bg-black/50 rounded-full overflow-hidden border border-orange-400/20">
                    <motion.div initial={{width:0}} animate={{width:`${getPercentage(highCount)}%`}} transition={{duration:1, delay:0.2}} className="h-full bg-orange-400 shadow-[0_0_10px_orange]" />
                  </div>
                  <span className="w-8 text-right opacity-60 text-white">{getPercentage(highCount)}%</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-16 text-yellow-400">MEDIUM</span>
                  <div className="flex-1 h-2.5 bg-black/50 rounded-full overflow-hidden border border-yellow-400/20">
                    <motion.div initial={{width:0}} animate={{width:`${getPercentage(mediumCount)}%`}} transition={{duration:1, delay:0.3}} className="h-full bg-yellow-400" />
                  </div>
                  <span className="w-8 text-right opacity-60 text-white">{getPercentage(mediumCount)}%</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-16 text-emerald-400">LOW</span>
                  <div className="flex-1 h-2.5 bg-black/50 rounded-full overflow-hidden border border-emerald-400/20">
                    <motion.div initial={{width:0}} animate={{width:`${getPercentage(lowCount)}%`}} transition={{duration:1, delay:0.4}} className="h-full bg-emerald-400" />
                  </div>
                  <span className="w-8 text-right opacity-60 text-white">{getPercentage(lowCount)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Feed */}
          <div className={`border ${tBorder} rounded-xl p-5 flex flex-col bg-white/5`}>
            <h3 className={`text-sm font-bold uppercase tracking-wider opacity-70 mb-4 ${tText}`}>Recent Operations Feed</h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar min-h-[300px]">
              {history.length === 0 ? (
                <div className="text-xs opacity-40 italic text-center py-10 text-white">No intelligence recorded in current session.</div>
              ) : (
                history.map((record, i) => (
                  <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} transition={{delay: i * 0.1}} key={record.id} className="p-2 border border-white/5 rounded bg-black/40 flex items-center gap-3 text-[10px] text-white">
                    <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 border border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={record.thumbnail} className="w-full h-full object-cover" alt="thumb" />
                    </div>
                    <div className="flex-1 truncate">
                      <div className="font-bold opacity-90 truncate text-sm">{record.classification}</div>
                      <div className="opacity-40">{record.timestamp} // ID: {record.targetId}</div>
                    </div>
                    <div className="px-2.5 py-1.5 rounded font-bold shadow-lg" style={{ backgroundColor: record.threatColor + "20", color: record.threatColor, border: `1px solid ${record.threatColor}40` }}>
                      {record.threatLevel}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className={`p-2 border-t ${tBorder} text-center text-[9px] uppercase tracking-[0.3em] opacity-40 bg-white/5 text-white`}>
          [ END OF RECORD // DATA ENCRYPTED ]
        </div>
      </div>
    </motion.div>
  );
}
