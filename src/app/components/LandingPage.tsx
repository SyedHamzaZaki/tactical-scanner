"use client";

import { motion } from "framer-motion";

interface LandingPageProps {
  onEnterScanner: () => void;
}

export default function LandingPage({ onEnterScanner }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#020408] text-white flex flex-col relative overflow-hidden grid-bg">
      {/* Decorative Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] aspect-square rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] aspect-square rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/5 backdrop-blur-md bg-black/20 sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00ff88] shadow-[0_0_10px_#00ff88]" />
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#00ff88]">OSINT Core</span>
        </div>
        <button
          onClick={onEnterScanner}
          className="text-xs uppercase font-bold tracking-widest px-4 py-2 rounded border border-[#00ff88]/30 hover:border-[#00ff88] hover:bg-[#00ff88]/5 transition-all text-[#00ff88]"
        >
          Launch Terminal
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-20 relative z-10 max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6 max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-400 font-mono uppercase tracking-wider">
            <span>🛡️ Civilian Safety & Public Intelligence</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            AI-Powered Public <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] via-[#00e5ff] to-[#00ff88] animate-pulse">
              Threat Assessment
            </span>
          </h1>

          <p className="text-sm md:text-lg text-white/60 font-sans max-w-2xl mx-auto leading-relaxed">
            Protect your community. Instantly scan images, evaluate potential environmental hazards, recognize tactical markers, and obtain actionable safety guidelines using our secure, public-grade intelligence platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onEnterScanner}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#00ff88] to-[#00e5ff] text-black font-bold uppercase tracking-wider rounded-lg shadow-[0_0_30px_rgba(0,255,136,0.3)] hover:shadow-[0_0_40px_rgba(0,255,136,0.55)] transition-all hover:scale-105"
            >
              Start Diagnostic Scan
            </button>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider rounded-lg transition-all text-center"
            >
              Explore Capabilities
            </a>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <section id="features" className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 pt-10 border-t border-white/5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-xl border border-white/5 bg-black/40 backdrop-blur-sm space-y-3 hover:border-emerald-500/20 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">👁️</div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">Multi-Modal Vision</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              Analyzes visual content, maps details, identifies anomalies, and generates accurate hazard assessments.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-xl border border-white/5 bg-black/40 backdrop-blur-sm space-y-3 hover:border-cyan-500/20 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">📡</div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">Comms Interception</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              Decrypts and extracts written text from captured targets instantly via built-in high-performance OCR.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-xl border border-white/5 bg-black/40 backdrop-blur-sm space-y-3 hover:border-emerald-500/20 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">💬</div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">Target Interrogation</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              Initiate a direct uplink connection to question details, request advice, or gather safety recommendations.
            </p>
          </motion.div>
        </section>

        {/* Civilian Onboarding Section */}
        <section className="w-full max-w-4xl mt-20 p-8 rounded-2xl border border-emerald-500/10 bg-gradient-to-r from-emerald-950/10 to-cyan-950/10 backdrop-blur-md flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-3">
            <h3 className="text-xl font-bold uppercase tracking-wider text-emerald-400">🛡️ Public Safety Protocol</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Our interface is designed to help normal citizens analyze suspicious situations safely. Upload photographs of suspicious bags, active blockades, unmarked drones, or damaged structures to get immediate guidance.
            </p>
            <ul className="text-xs text-white/70 space-y-1.5 list-disc pl-4 font-mono">
              <li>100% Client-side image processing options</li>
              <li>Fully automated Voice broadcast readouts</li>
              <li>Civilian action plans & guidelines included</li>
            </ul>
          </div>
          <div className="w-full md:w-auto flex-shrink-0">
            <button
              onClick={onEnterScanner}
              className="w-full px-6 py-3 border border-emerald-500/20 hover:border-emerald-500/60 bg-emerald-500/5 hover:bg-emerald-500/15 text-emerald-400 font-bold uppercase tracking-wider rounded text-xs transition-all"
            >
              Launch Platform Protocol
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-white/5 text-center text-[10px] text-white/20 font-mono uppercase tracking-widest mt-12">
        Public OSINT Initiative • Powered by Groq AI • Secure Channel
      </footer>
    </div>
  );
}
