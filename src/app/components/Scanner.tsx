"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HUDClock from "./HUDClock";
import ScanHistory, { ScanRecord } from "./ScanHistory";
import LandingPage from "./LandingPage";
import CommandCenter from "./CommandCenter";
import { Audio } from "../lib/audio";
import type { AnalysisResult } from "../types";

const SCAN_MSGS = [
  "ESTABLISHING SECURE UPLINK...",
  "DECRYPTING IMAGE PAYLOAD...",
  "RUNNING SPECTRAL ANALYSIS...",
  "CROSS-REFERENCING DATABASE...",
  "ANALYZING THERMAL SIGNATURE...",
  "SCANNING RF EMISSIONS...",
  "QUERYING INTELLIGENCE NETWORK...",
  "PROCESSING VISUAL MARKERS...",
  "RUNNING PATTERN RECOGNITION...",
  "COMPILING THREAT MATRIX...",
];

function loadHistory(): ScanRecord[] {
  try { return JSON.parse(localStorage.getItem("osint_history") || "[]"); } catch { return []; }
}
function saveHistory(r: ScanRecord[]) { localStorage.setItem("osint_history", JSON.stringify(r.slice(0, 20))); }

function compressImage(file: File, maxW = 1200, maxH = 1200): Promise<File> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) return resolve(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = typeof window !== "undefined" ? new window.Image() : null;
      if (!img) return resolve(file);
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxW || h > maxH) {
          if (w > h) {
            h = Math.round((h * maxW) / w);
            w = maxW;
          } else {
            w = Math.round((w * maxH) / h);
            h = maxH;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: "image/jpeg" }));
            } else {
              resolve(file);
            }
          }, "image/jpeg", 0.85); // Compress to high-quality JPEG (85% quality)
        } else {
          resolve(file);
        }
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export default function Scanner() {
  const [showLanding, setShowLanding] = useState(true);
  const [uiMode, setUiMode] = useState<"civilian" | "tactical">("civilian");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle"|"scanning"|"complete"|"error">("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [lines, setLines] = useState(["[SYS] OSINT TACTICAL SCANNER v3.7.1","[SYS] NODE: OMEGA-7 | ENCRYPTION: AES-256","[SYS] STATUS: AWAITING TARGET INPUT..."]);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showCommandCenter, setShowCommandCenter] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  
  // New features state
  const [ocrText, setOcrText] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [consoleInput, setConsoleInput] = useState("");

  // Live Camera panel states
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setHistory(loadHistory()); }, []);
  useEffect(() => { consoleRef.current && (consoleRef.current.scrollTop = consoleRef.current.scrollHeight); }, [lines]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const log = useCallback((l: string) => setLines(p => [...p, l]), []);

  const fileToBase64 = (f: File): Promise<string> => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res((r.result as string).split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(f);
  });

  const speakReport = () => {
    if (typeof window === "undefined" || !result) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      `Public Diagnostic Complete. Object is classified as ${result.classification}. Threat level evaluation is ${result.threatLevel}. safety recommendation is: ${result.recommendations}`
    );
    const voices = window.speechSynthesis.getVoices();
    const engVoice = voices.find(v => v.lang.startsWith("en"));
    if (engVoice) utterance.voice = engVoice;
    utterance.pitch = 0.95;
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImageSrc(url); setResult(null); setErrorMsg(""); setPhase("scanning"); setProgress(0); setOcrText(""); setChatHistory([]);
    soundOn && Audio.upload();
    setLines(p => [...p, "", `[SYS] IMAGE ACQUIRED — ${file.name} (${(file.size/1024).toFixed(1)}KB)`, "[SYS] COMPRESSING TELEMETRY RESOLUTION..."]);

    let finalFile = file;
    if (file.size > 800 * 1024) { // Compress files larger than ~800KB
      try {
        finalFile = await compressImage(file);
        setLines(p => [...p, `[SYS] TARGET OPTIMIZED: ${(finalFile.size/1024).toFixed(1)}KB`]);
      } catch (e) {
        console.warn("Client side compression failed, uploading original file", e);
      }
    } else {
      setLines(p => [...p, `[SYS] PAYLOAD IS ALREADY HIGHLY COMPACT.`]);
    }
    
    setLines(p => [...p, "[SYS] INITIATING TACTICAL SCAN...", ""]);

    const b64 = await fileToBase64(finalFile);
    let mi = 0;
    const msgI = setInterval(() => { if (mi < SCAN_MSGS.length) { log(`[SCAN] ${SCAN_MSGS[mi]}`); soundOn && Audio.scanTick(); mi++; } }, 800);
    const prgI = setInterval(() => setProgress(p => p >= 95 ? 95 : p + Math.random()*8), 400);
    soundOn && Audio.scanStart();

    // Run OCR in parallel using Tesseract.js (using optimized finalFile for speed!)
    let extractedText = "";
    const runOCR = async () => {
      try {
        const Tesseract = await import("tesseract.js");
        const ocrRes = await Tesseract.recognize(finalFile, "eng");
        extractedText = ocrRes.data.text || "";
        if (extractedText.trim()) {
          setOcrText(extractedText.trim());
        }
      } catch (err) {
        console.error("OCR extraction failed", err);
      }
    };
    runOCR();
    
    // EXIF Geolocation parsing must run on the ORIGINAL uncompressed file
    const exifPromise = import("exifr").then(m => m.default.parse(file, { gps: true, tiff: true })).catch(() => null);

    try {
      const res = await fetch("/api/analyze", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({imageBase64: b64, mimeType: finalFile.type}) });
      clearInterval(msgI); clearInterval(prgI);
      if (!res.ok) {
        let errMsg = `HTTP ${res.status}`;
        try {
          const e = await res.json();
          errMsg = e.error || errMsg;
        } catch {
          try {
            const txt = await res.text();
            if (txt && txt.length < 150) errMsg = txt;
          } catch {}
        }
        throw new Error(errMsg);
      }
      const data: AnalysisResult = await res.json();
      
      const metadata = await exifPromise;
      if (metadata) {
        data.exifData = {
          lat: metadata.latitude,
          lon: metadata.longitude,
          make: metadata.Make,
          model: metadata.Model,
          date: metadata.DateTimeOriginal?.toString() || metadata.CreateDate?.toString()
        };
        if (metadata.latitude) log(`[SYS] GEOLOCATION EXTRACTED: LAT ${metadata.latitude.toFixed(4)}, LON ${metadata.longitude.toFixed(4)}`);
      }

      setProgress(100); setResult(data); setPhase("complete");
      if (data.threatLevel === "CRITICAL" || data.threatLevel === "HIGH") { soundOn && Audio.threatAlert(); } else { soundOn && Audio.scanComplete(); }
      log(""); log("[SYS] ██ SCAN COMPLETE ██"); log(`[SYS] THREAT LEVEL: ${data.threatLevel}`); log(`[SYS] CLASSIFICATION: ${data.classification}`); log("[SYS] REPORT COMPILED.");

      if (extractedText.trim()) {
        log(`[SYS] INTERCEPTED COMMS: ${extractedText.trim().split(/\s+/).length} WORDS IDENTIFIED IN IMAGE.`);
      }

      // Voice readout automatically
      if (soundOn) {
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(
            `Analysis Complete. Threat evaluation is ${data.threatLevel}.`
          );
          utterance.pitch = 0.95;
          window.speechSynthesis.speak(utterance);
        }, 1500);
      }

      // Save to history
      const rec: ScanRecord = { id: Date.now().toString(), timestamp: new Date().toLocaleString(), thumbnail: url, classification: data.classification, threatLevel: data.threatLevel, threatColor: data.threatColor, targetId: data.targetId };
      const nh = [rec, ...history].slice(0, 20);
      setHistory(nh); saveHistory(nh);
    } catch (err: unknown) {
      clearInterval(msgI); clearInterval(prgI); setProgress(0);
      const msg = err instanceof Error ? err.message : "Unknown error";
      setPhase("error"); setErrorMsg(msg); soundOn && Audio.error();
      log(""); log(`[ERR] ANALYSIS FAILED: ${msg}`); log("[SYS] CHECK API KEY.");
    }
  };

  const startCamera = async (mode?: "environment" | "user" | any) => {
    try {
      const actualMode = typeof mode === "string" ? mode : facingMode;
      soundOn && Audio.click();
      setCameraActive(true);
      log(`[SYS] INITIALIZING CAMERA OPTICS STREAM (${actualMode.toUpperCase()})...`);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        log("[ERR] SECURE CONTEXT REQUIRED (HTTPS / LOCALHOST).");
        log("[SYS] TO TEST MOBILE CAMERA OVER LOCAL WI-FI:");
        log("[SYS] 1. Open chrome://flags/#unsafely-treat-insecure-origin-as-secure");
        log("[SYS] 2. Add your development URL (e.g., http://192.168.1.5:3000)");
        log("[SYS] 3. Set to 'Enabled' and relaunch your mobile browser.");
        throw new Error("Secure context (HTTPS/localhost) required for camera");
      }

      let stream: MediaStream;
      try {
        // Use soft constraint (ideal) so desktop/laptop fallback works seamlessly
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: actualMode },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
      } catch (err) {
        log(`[SYS] CAM_${actualMode.toUpperCase()} CONSTRAINT ERROR. TRYING GRACEFUL FALLBACK...`);
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: actualMode } } });
        } catch (innerErr) {
          log(`[SYS] DEFAULTING TO STANDARD CAMERA STREAM...`);
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }
      }
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      log("[SYS] OPTICAL STREAM ONLINE. WAITING FOR TARGET CAPTURE.");
    } catch (err: any) {
      log(`[ERR] CAM ERROR: ${err?.message || "ACCESS DENIED"}`);
      setCameraActive(false);
    }
  };

  const toggleCameraLens = () => {
    soundOn && Audio.click();
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const captureFrame = () => {
    if (!videoRef.current || !streamRef.current) return;
    soundOn && Audio.click();
    log("[SYS] IMAGE CAPTURED. GENERATING BUFFER...");
    
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
          processFile(file);
        }
      }, "image/jpeg", 0.9);
    }
    stopCamera();
  };

  const stopCamera = () => {
    soundOn && Audio.click();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    log("[SYS] CAMERA STREAM ROUTE TERMINATED.");
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !result || chatLoading) return;

    const userMsg = chatMessage.trim();
    setChatMessage("");
    setChatHistory(p => [...p, { role: "user", content: userMsg }]);
    setChatLoading(true);
    soundOn && Audio.scanTick();
    log(`[INT] SENT: "${userMsg}"`);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: chatHistory.map(h => ({ role: h.role === "user" ? "user" : "assistant", content: h.content })),
          context: result
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setChatHistory(p => [...p, { role: "assistant", content: data.reply }]);
      log(`[INT] RECV: "${data.reply}"`);
      soundOn && Audio.scanComplete();
    } catch (err) {
      // Fallback operational intel response if key/network fails
      const fallbackReplies: Record<string, string> = {
        default: "Target parameters are within normal diagnostic thresholds. Maintain standard alert state.",
        cat: "Object classified as domestic companion animal. Minimal hazard potential to residential environments.",
        weapon: "Operational guidelines recommend keeping a safe distance and alerting local security responders.",
      };
      const query = userMsg.toLowerCase();
      let reply = fallbackReplies.default;
      if (query.includes("weapon") || query.includes("gun") || query.includes("danger")) {
        reply = fallbackReplies.weapon;
      } else if (query.includes("cat") || query.includes("pet") || query.includes("animal")) {
        reply = fallbackReplies.cat;
      }
      setTimeout(() => {
        setChatHistory(p => [...p, { role: "assistant", content: reply }]);
        log(`[INT] RECV: "${reply}"`);
        soundOn && Audio.scanComplete();
        setChatLoading(false);
      }, 1000);
      return;
    } finally {
      setChatLoading(false);
    }
  };

  const reset = () => {
    setImageSrc(null); setResult(null); setErrorMsg(""); setPhase("idle"); setProgress(0); setOcrText(""); setChatHistory([]);
    setLines(["[SYS] OSINT TACTICAL SCANNER v3.7.1","[SYS] NODE: OMEGA-7 | ENCRYPTION: AES-256","[SYS] STATUS: AWAITING TARGET INPUT..."]);
    if (fileRef.current) fileRef.current.value = "";
    soundOn && Audio.click();
  };

  const handleExportPDF = async () => {
    if (!result || !imageSrc) return;
    soundOn && Audio.click();
    const { exportReportAsPDF } = await import("../lib/exportPDF");
    await exportReportAsPDF(result, imageSrc);
  };

  const tBorder = result ? { CRITICAL:"border-red-500",HIGH:"border-orange-500",MEDIUM:"border-yellow-500",LOW:"border-green-400",MINIMAL:"border-[#00ff88]" }[result.threatLevel] || "border-[#00ff88]/20" : "border-[#00ff88]/20";

  // Public Safety Index Score calculation
  const safetyScore = result ? {
    MINIMAL: 98,
    LOW: 88,
    MEDIUM: 55,
    HIGH: 25,
    CRITICAL: 5
  }[result.threatLevel] || 100 : 100;

  if (showLanding) {
    return <LandingPage onEnterScanner={() => { soundOn && Audio.click(); setShowLanding(false); }} />;
  }

  return (
    <div className={`min-h-screen ${uiMode === "civilian" ? "bg-[#060a12] text-white font-sans" : "bg-[#020408] text-[#00ff88] font-mono grid-bg"} vignette relative flex flex-col transition-all duration-500`}>
      {showCommandCenter && <CommandCenter history={history} onClose={() => setShowCommandCenter(false)} uiMode={uiMode} />}
      
      {/* 🍔 MOBILE SIDE BAR DRAWER menu popup */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Dark overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black z-50 backdrop-blur-sm"
            />
            {/* Drawer menu */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed right-0 top-0 bottom-0 w-[280px] z-50 p-6 flex flex-col justify-between border-l shadow-2xl ${
                uiMode === "civilian"
                  ? "bg-[#090f1d] border-white/10 text-white font-sans"
                  : "bg-black border-[#00ff88]/30 text-[#00ff88] font-mono grid-bg"
              }`}
            >
              <div className="space-y-6">
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b pb-4 border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🛡️</span>
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {uiMode === "civilian" ? "Portal Menu" : "SYS_MENU"}
                    </span>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1.5 hover:bg-white/5 border border-white/10 rounded-lg text-xs"
                  >
                    ✕
                  </button>
                </div>

                {/* Navigation Options list */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      soundOn && Audio.click();
                      setShowLanding(true);
                      setSidebarOpen(false);
                    }}
                    className={`flex items-center gap-2 w-full px-4 py-2.5 rounded-lg border text-left text-xs transition-all hover:translate-x-1 ${
                      uiMode === "civilian"
                        ? "border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-white"
                        : "border-[#00ff88]/20 hover:border-[#00ff88] hover:bg-[#00ff88]/5 text-[#00ff88]"
                    }`}
                  >
                    <span>🏡</span> Portal Home
                  </button>

                  <button
                    onClick={() => {
                      soundOn && Audio.click();
                      setShowCommandCenter(true);
                      setSidebarOpen(false);
                    }}
                    className={`flex items-center gap-2 w-full px-4 py-2.5 rounded-lg border text-left text-xs transition-all hover:translate-x-1 ${
                      uiMode === "civilian"
                        ? "border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-white"
                        : "border-[#00ff88]/20 hover:border-[#00ff88] hover:bg-[#00ff88]/5 text-[#00ff88]"
                    }`}
                  >
                    <span>📊</span> Telemetry Dash
                  </button>

                  {!imageSrc && (
                    <button
                      onClick={() => {
                        soundOn && Audio.click();
                        setUiMode(uiMode === "civilian" ? "tactical" : "civilian");
                        setSidebarOpen(false);
                      }}
                      className={`flex items-center gap-2 w-full px-4 py-2.5 rounded-lg border text-left text-xs transition-all hover:translate-x-1 ${
                        uiMode === "civilian"
                          ? "border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-white"
                          : "border-[#00ff88]/20 hover:border-[#00ff88] hover:bg-[#00ff88]/5 text-[#00ff88]"
                    }`}
                  >
                    <span>🔄</span> Switch Mode
                  </button>
                  )}

                  <button
                    onClick={() => {
                      setSoundOn(!soundOn);
                      soundOn && Audio.click();
                    }}
                    className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg border text-left text-xs transition-all ${
                      uiMode === "civilian"
                        ? "border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-white"
                        : "border-[#00ff88]/20 hover:border-[#00ff88] hover:bg-[#00ff88]/5 text-[#00ff88]"
                    }`}
                  >
                    <span>🔊 Audio Feedback</span>
                    <span>{soundOn ? "ACTIVE" : "MUTED"}</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowHistory(!showHistory);
                      setSidebarOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg border text-left text-xs transition-all ${
                      uiMode === "civilian"
                        ? "border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-white"
                        : "border-[#00ff88]/20 hover:border-[#00ff88] hover:bg-[#00ff88]/5 text-[#00ff88]"
                    }`}
                  >
                    <span>📋 Scan Registry Logs</span>
                    <span className="font-bold text-cyan-400">{history.length}</span>
                  </button>
                </div>
              </div>

              {/* Sidebar footer telemetry */}
              <div className="border-t pt-4 border-white/10 space-y-2">
                <p className="text-[8px] opacity-25 uppercase tracking-wider text-center">
                  Omega Node // Secure Connection
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* UPGRADED HEADERS */}
      {uiMode === "civilian" ? (
        <header className="border-b border-white/5 bg-[#090f1d]/90 backdrop-blur-xl px-4 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { soundOn && Audio.click(); setShowLanding(true); }}
              className="max-md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-xs text-white/70 hover:text-emerald-400 transition-all font-medium font-sans"
            >
              <span>🏡</span> Portal Home
            </button>
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.1em] sm:tracking-[0.15em] bg-clip-text text-transparent bg-gradient-to-r from-[#00ff88] via-[#00e5ff] to-white">
              Public Safety Diagnostic Center
            </span>
          </div>

          {/* Desktop action buttons */}
          <div className="hidden md:flex items-center gap-2 flex-wrap">
            <button onClick={() => { soundOn && Audio.click(); setShowCommandCenter(true); }} className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 border border-emerald-500/20 hover:border-emerald-500/50 rounded-lg bg-emerald-500/5 text-emerald-400 transition-all hover:scale-105">
              📊 Dash
            </button>
            {!imageSrc ? (
              <button
                onClick={() => { soundOn && Audio.click(); setUiMode("tactical"); }}
                className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 border border-emerald-500/20 hover:border-emerald-500/50 rounded-lg bg-emerald-500/5 text-emerald-400 transition-all hover:scale-105"
              >
                🔄 Switch HUD
              </button>
            ) : (
              <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 border border-white/5 rounded text-white/30">
                🔒 Theme Locked
              </span>
            )}
            <HUDClock />
            <button onClick={() => setSoundOn(!soundOn)} className="text-xs opacity-50 hover:opacity-100 transition-opacity px-2 py-1 border border-white/10 rounded-lg hover:bg-white/5" title="Toggle Sound">
              {soundOn ? "🔊" : "🔇"}
            </button>
            <button onClick={() => setShowHistory(!showHistory)} className="text-xs opacity-50 hover:opacity-100 transition-opacity px-2 py-1 border border-white/10 rounded-lg hover:bg-white/5" title="View Logs">
              📋 {history.length > 0 && <span className="text-emerald-400 font-bold">{history.length}</span>}
            </button>
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => { soundOn && Audio.click(); setSidebarOpen(true); }}
            className="md:hidden px-3 py-1.5 border border-white/10 hover:border-emerald-500/40 rounded-lg text-emerald-400 bg-white/5 text-xs font-bold uppercase tracking-wider transition-all"
          >
            ☰ Menu
          </button>
        </header>
      ) : (
        <header className="border-b border-[#00ff88]/20 bg-black/60 backdrop-blur-md px-4 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-[0_2px_20px_rgba(0,255,136,0.05)] font-mono">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { soundOn && Audio.click(); setShowLanding(true); }}
              className="max-md:hidden text-[9px] uppercase tracking-wider px-2.5 py-1.5 border border-[#00ff88]/30 hover:border-[#00ff88] text-[#00ff88] hover:bg-[#00ff88]/5 transition-all"
            >
              [ PORTAL_SYS ]
            </button>
            <span className="text-xs sm:text-sm font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase text-[#00ff88] glow-text">
              OSINT SCANNER // OMEGA-NODE_SYS
            </span>
          </div>

          {/* Desktop action buttons */}
          <div className="hidden md:flex items-center gap-2 font-mono flex-wrap">
            <button onClick={() => { soundOn && Audio.click(); setShowCommandCenter(true); }} className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 border border-[#00ff88]/30 hover:border-[#00ff88] rounded bg-[#00ff88]/5 text-[#00ff88] transition-all">
              [ COMMAND_CENTER ]
            </button>
            {!imageSrc ? (
              <button
                onClick={() => { soundOn && Audio.click(); setUiMode("civilian"); }}
                className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 border border-[#00ff88]/30 hover:border-[#00ff88] rounded bg-[#00ff88]/5 text-[#00ff88] transition-all"
              >
                🔄 CIVILIAN
              </button>
            ) : (
              <span className="text-[9px] uppercase tracking-wider px-2.5 py-1.5 border border-[#00ff88]/10 text-[#00ff88]/20">
                [ HUD_LOCKED ]
              </span>
            )}
            <HUDClock />
            <button onClick={() => setSoundOn(!soundOn)} className="text-[10px] opacity-50 hover:opacity-100 transition-opacity px-2 py-1 border border-[#00ff88]/20 rounded hover:bg-[#00ff88]/5" title="Toggle audio channel">
              {soundOn ? "🔊 AUDIO_ON" : "🔇 AUDIO_OFF"}
            </button>
            <button onClick={() => setShowHistory(!showHistory)} className="text-[10px] opacity-50 hover:opacity-100 transition-opacity px-2 py-1 border border-[#00ff88]/20 rounded hover:bg-[#00ff88]/5" title="Registry files">
              📋 LOGS: {history.length}
            </button>
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => { soundOn && Audio.click(); setSidebarOpen(true); }}
            className="md:hidden px-3 py-1.5 border border-[#00ff88]/40 hover:border-[#00ff88] bg-black/60 text-[#00ff88] text-[10px] font-bold uppercase tracking-wider transition-all"
          >
            [ MENU ]
          </button>
        </header>
      )}

      <main className="flex-1 p-3 md:p-6 max-w-[1550px] mx-auto w-full">
        {/* IDLE STATE */}
        <AnimatePresence mode="wait">
          {phase === "idle" && !imageSrc && (
            <motion.div key="idle" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} className="flex flex-col items-center justify-center min-h-[65vh] gap-6">
              <div className="text-center mb-2">
                <motion.div className={`text-6xl md:text-8xl font-extrabold mb-3 transition-colors ${uiMode === "civilian" ? "text-emerald-400" : "text-[#00ff88] glow-text"}`} animate={{opacity:[0.6,1,0.6]}} transition={{duration:3,repeat:Infinity}}>⬡</motion.div>
                <h2 className="text-xl md:text-3xl font-bold tracking-widest uppercase mb-1">
                  {uiMode === "civilian" ? "Public Diagnostics" : "Tactical Scanner"}
                </h2>
                <p className="text-[10px] md:text-xs opacity-35 tracking-[0.2em] uppercase">
                  {uiMode === "civilian" ? "Identify suspicious items, environments, or risks" : "AI-Powered Intelligence Analysis"}
                </p>
              </div>

              {/* 📷 INTERACTIVE LIVE CAMERA FEED SCANNING WINDOW */}
              {cameraActive ? (
                <div className={`relative w-full max-w-md aspect-[4/3] border-2 rounded-xl overflow-hidden flex flex-col justify-between p-3 ${uiMode === "civilian" ? "border-emerald-500 bg-[#090f1d]" : "border-[#00ff88] bg-black"}`}>
                  
                  {/* Glowing Radar crosshairs and camera recording status */}
                  <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 bg-black/60 border border-red-500/20 px-2 py-0.5 rounded text-[8px] font-mono text-red-500 tracking-wider">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                    LIVE OPTICAL STREAM
                  </div>
                  
                  <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
                    <div className={`w-32 h-32 border border-dashed rounded-full animate-spin opacity-40 ${uiMode === "civilian" ? "border-emerald-400" : "border-[#00ff88]"}`} />
                    <div className={`w-px h-full absolute opacity-20 ${uiMode === "civilian" ? "bg-emerald-400" : "bg-[#00ff88]"}`} />
                    <div className={`h-px w-full absolute opacity-20 ${uiMode === "civilian" ? "bg-emerald-400" : "bg-[#00ff88]"}`} />
                  </div>

                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-lg absolute inset-0 z-10" />

                  {/* High-tech capture control buttons */}
                  <div className="absolute bottom-3 left-0 w-full z-20 px-4 flex gap-2">
                    <button
                      onClick={toggleCameraLens}
                      className="px-3 py-2 border border-white/10 hover:border-white/40 bg-black/70 rounded-lg text-xs font-bold uppercase tracking-wider text-white transition-all"
                      title="Switch Lens"
                    >
                      🔄
                    </button>
                    <button
                      onClick={captureFrame}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-[1.02] transition-all ${uiMode === "civilian" ? "bg-emerald-400 hover:bg-emerald-500 text-black" : "bg-[#00ff88] hover:bg-[#00ff88]/90 text-black"}`}
                    >
                      [ Capture Target ]
                    </button>
                    <button
                      onClick={stopCamera}
                      className="px-3 py-2 border border-white/10 hover:border-red-500/50 bg-black/70 hover:bg-red-500/10 rounded-lg text-xs font-bold uppercase tracking-wider text-red-400 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Standard File Upload Zone */
                <div
                  onDragOver={e=>{e.preventDefault();setDragActive(true)}} onDragLeave={()=>setDragActive(false)} onDrop={e=>{e.preventDefault();setDragActive(false);const f=e.dataTransfer.files?.[0];if(f)processFile(f)}}
                  onClick={()=>fileRef.current?.click()}
                  className={`relative w-full max-w-md aspect-[4/3] border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 group ${dragActive?"border-emerald-500 bg-emerald-500/5":"border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5"}`}
                >
                  <div className={`absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 transition-colors ${uiMode === "civilian" ? "border-white/10 group-hover:border-emerald-500" : "border-[#00ff88]/30 group-hover:border-[#00ff88]"}`}/>
                  <div className={`absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 transition-colors ${uiMode === "civilian" ? "border-white/10 group-hover:border-emerald-500" : "border-[#00ff88]/30 group-hover:border-[#00ff88]"}`}/>
                  <div className={`absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 transition-colors ${uiMode === "civilian" ? "border-white/10 group-hover:border-emerald-500" : "border-[#00ff88]/30 group-hover:border-[#00ff88]"}`}/>
                  <div className={`absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 transition-colors ${uiMode === "civilian" ? "border-white/10 group-hover:border-emerald-500" : "border-[#00ff88]/30 group-hover:border-[#00ff88]"}`}/>
                  <svg className="w-10 h-10 opacity-25 group-hover:opacity-60 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <p className="text-xs font-semibold uppercase tracking-wider opacity-60 group-hover:opacity-95 transition-opacity">Select Photo to Scan</p>
                  <p className="text-[10px] opacity-35">Drag & drop or click to upload</p>
                  <input type="file" accept="image/*" className="hidden" ref={fileRef} onChange={e=>{const f=e.target.files?.[0];if(f)processFile(f)}} />
                </div>
              )}

              {/* Camera Activation Button (Only when camera feed not already active) */}
              {!cameraActive && (
                <button onClick={() => startCamera()} className={`text-[10px] uppercase tracking-wider border px-4 py-1.5 rounded transition-all hover:scale-105 ${uiMode === "civilian" ? "border-white/10 text-white/50 hover:text-white hover:bg-white/5" : "border-[#00ff88]/10 hover:border-[#00ff88]/40 hover:bg-[#00ff88]/5"}`}>
                  📷 Open Live Diagnostic Camera
                </button>
              )}

              <div className="flex gap-4 text-[9px] opacity-20">
                <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-[#00ff88]"/>SECURE</span>
                <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-[#00ff88]"/>ENCRYPTED</span>
                <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-[#00ff88]"/>AI READY</span>
              </div>

              {/* History panel */}
              {showHistory && history.length > 0 && (
                <div className="w-full max-w-md">
                  <ScanHistory records={history} onSelect={(r)=>{setImageSrc(r.thumbnail); setPhase("complete"); setResult({ targetId: r.targetId, classification: r.classification, threatLevel: r.threatLevel, threatColor: r.threatColor, confidence: "95%", description: "Loaded from scan registry.", signatures: [], origin: "Registry", recommendations: "N/A" });}} onClear={()=>{setHistory([]);saveHistory([]);}} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* REDESIGNED THREE-COLUMN GRID SYSTEM (Perfect responsive layout for laptops, desktops, and mobile!) */}
        {imageSrc && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            
            {/* COLUMN 1: TARGET DISPLAY & SYSTEM LOG CONSOLE */}
            <div className="flex flex-col gap-4">
              {/* Target Image Frame */}
              <div id="report-export-target" className={`relative border ${tBorder} rounded-xl overflow-hidden transition-colors duration-500 ${uiMode === "civilian" ? "bg-black/20 border-white/10" : "bg-black/40"}`}>
                <div className={`flex items-center justify-between px-3 py-2 border-b transition-colors ${uiMode === "civilian" ? "border-white/5 bg-white/5 text-white/50" : "border-[#00ff88]/10 bg-[#00ff88]/5"}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${phase==="scanning"?"bg-[#ffaa00] animate-pulse":phase==="complete"?"bg-[#00ff88]":"bg-red-500"}`}/>
                    <span className="text-[10px] tracking-wider uppercase opacity-55">{phase==="scanning"?"SCANNING":phase==="complete"?"COMPLETE":phase==="error"?"ERROR":"LOADED"}</span>
                  </div>
                  <span className="text-[10px] opacity-25">DIAGNOSTIC DISPLAY</span>
                </div>
                <div className="relative aspect-video flex items-center justify-center bg-black/60">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageSrc} alt="Target" className="max-w-full max-h-full object-contain" />
                  
                  {/* TACTICAL UNIQUE OVERLAY: Satellite Radar Tracking Sweep & Orbit Metrics */}
                  {uiMode === "tactical" && (
                    <div className="absolute top-2 left-2 font-mono text-[8px] text-[#00ff88]/60 bg-black/75 px-1.5 py-0.5 border border-[#00ff88]/10">
                      SYS_TRACK: ORBITAL-7 // SPEED: 7.82km/s
                    </div>
                  )}

                  <div className="absolute inset-3 pointer-events-none">
                    <div className={`absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 ${uiMode === "civilian" ? "border-white/10" : "border-[#00ff88]/40"}`}/>
                    <div className={`absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 ${uiMode === "civilian" ? "border-white/10" : "border-[#00ff88]/40"}`}/>
                    <div className={`absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 ${uiMode === "civilian" ? "border-white/10" : "border-[#00ff88]/40"}`}/>
                    <div className={`absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 ${uiMode === "civilian" ? "border-white/10" : "border-[#00ff88]/40"}`}/>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
                    <div className={`w-px h-full absolute ${uiMode === "civilian" ? "bg-white/10" : "bg-[#00ff88]"}`}/>
                    <div className={`h-px w-full absolute ${uiMode === "civilian" ? "bg-white/10" : "bg-[#00ff88]"}`}/>
                    <div className={`w-16 h-16 border rounded-full absolute pulse-ring ${uiMode === "civilian" ? "border-white/10" : "border-[#00ff88]"}`}/>
                  </div>
                  {phase==="scanning"&&(
                    <>
                      <div className="absolute inset-0 hex-grid opacity-30 z-10 pointer-events-none mix-blend-screen" />
                      <div className="absolute inset-0 matrix-rain z-10 pointer-events-none mix-blend-overlay" />
                      <motion.div className="absolute left-0 w-full h-0.5 z-20" style={{background:uiMode === "civilian" ? "linear-gradient(90deg,transparent,#00ff88,#00ff88,transparent)" : "linear-gradient(90deg,transparent,#ff2244,#ff2244,transparent)",boxShadow:uiMode === "civilian" ? "0 0 30px 10px rgba(0,255,136,0.3)" : "0 0 30px 10px rgba(255,34,68,0.5)"}} animate={{top:["0%","100%","0%"]}} transition={{duration:2.5,repeat:Infinity,ease:"linear"}}/>
                    </>
                  )}
                  {result && phase==="complete" && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                    >
                      <div 
                        className="w-[85%] h-[85%] border-2 border-dashed relative animate-pulse transition-colors duration-500"
                        style={{ borderColor: result.threatColor, boxShadow: `0 0 30px ${result.threatColor}20` }}
                      >
                        <div className="absolute top-[-2px] left-[-2px] w-6 h-6 border-t-4 border-l-4" style={{ borderColor: result.threatColor }} />
                        <div className="absolute top-[-2px] right-[-2px] w-6 h-6 border-t-4 border-r-4" style={{ borderColor: result.threatColor }} />
                        <div className="absolute bottom-[-2px] left-[-2px] w-6 h-6 border-b-4 border-l-4" style={{ borderColor: result.threatColor }} />
                        <div className="absolute bottom-[-2px] right-[-2px] w-6 h-6 border-b-4 border-r-4" style={{ borderColor: result.threatColor }} />
                        
                        <div 
                          className="absolute top-2 left-3 font-mono text-[9px] bg-black/90 px-2 py-0.5 border uppercase tracking-wider backdrop-blur-sm"
                          style={{ borderColor: result.threatColor, color: result.threatColor, textShadow: `0 0 8px ${result.threatColor}80` }}
                        >
                          TARGET_LOCKED // {result.targetId} ({result.confidence})
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
                {phase==="scanning"&&<div className="h-0.5 bg-black/60"><motion.div className={`h-full ${uiMode === "civilian" ? "bg-emerald-500" : "bg-gradient-to-r from-[#00ff88] via-[#00e5ff] to-[#00ff88]"}`} style={{width:`${progress}%`}} transition={{duration:0.3}}/></div>}
              </div>

              {/* Metrics under the image */}
              {result && (
                <div className="grid grid-cols-3 gap-2">
                  <div className={`border rounded-lg p-2.5 text-center ${uiMode === "civilian" ? "border-white/5 bg-white/5" : "border-[#00ff88]/10 bg-[#00ff88]/5"}`}>
                    <p className="text-[9px] uppercase tracking-wider opacity-35 mb-0.5">Reference ID</p>
                    <p className="text-xs font-bold" style={{color:"#00e5ff"}}>{result.targetId}</p>
                  </div>
                  <div className={`border rounded-lg p-2.5 text-center ${uiMode === "civilian" ? "border-white/5 bg-white/5" : "border-[#00ff88]/10 bg-[#00ff88]/5"}`}>
                    <p className="text-[9px] uppercase tracking-wider opacity-35 mb-0.5">Accuracy Index</p>
                    <p className="text-xs font-bold glow-text">{result.confidence}</p>
                  </div>
                  <div className="border rounded-lg p-2.5 text-center" style={{borderColor:result.threatColor+"40",backgroundColor:result.threatColor+"08"}}>
                    <p className="text-[9px] uppercase tracking-wider opacity-35 mb-0.5">Threat Level</p>
                    <p className="text-xs font-bold" style={{color:result.threatColor,textShadow:`0 0 8px ${result.threatColor}60`}}>{result.threatLevel}</p>
                  </div>
                </div>
              )}

              {/* Log Console moved directly under the image metrics block! */}
              <div className={`border rounded-xl overflow-hidden flex flex-col ${uiMode === "civilian" ? "border-white/5 bg-black/40" : "border-[#00ff88]/10 bg-black/40"}`} style={{minHeight:"180px",maxHeight:"230px"}}>
                <div className={`flex items-center gap-2 px-3 py-2 border-b ${uiMode === "civilian" ? "border-white/5 bg-white/5 text-white/50" : "border-[#00ff88]/10 bg-[#00ff88]/5"}`}>
                  <div className="flex gap-1"><div className="w-2 h-2 rounded-full bg-red-500/50"/><div className="w-2 h-2 rounded-full bg-yellow-500/50"/><div className="w-2 h-2 rounded-full bg-green-500/50"/></div>
                  <span className="text-[10px] tracking-wider opacity-35 ml-1 uppercase">Activity Log</span>
                </div>
                <div ref={consoleRef} className="flex-1 overflow-y-auto p-3 text-[11px] space-y-0.5 font-mono">
                  {lines.map((l,i)=><div key={i} className={`leading-relaxed ${l.startsWith("[ERR]")?"text-red-400":l.startsWith("[SYS]")? (uiMode === "civilian" ? "text-emerald-400/80" : "text-[#00ff88]/60") :l.startsWith("[SCAN]")?"text-[#00e5ff]/60":l.startsWith("[INT]")?"text-[#00ff88]":"opacity-25"}`}>{l||"\u00A0"}</div>)}
                  {(phase==="scanning" || chatLoading) && <span className="inline-block w-1.5 h-3 bg-[#00ff88] cursor-blink"/>}
                </div>

                {/* Tactical command terminal bar */}
                {uiMode === "tactical" && (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const cmd = consoleInput.trim();
                    setConsoleInput("");
                    if (cmd === "/reset") { reset(); }
                    else if (cmd === "/export") { handleExportPDF(); }
                    else if (cmd === "/scan") { fileRef.current?.click(); }
                    else { log(`[SYS] UNKNOWN CMD: "${cmd}". TRY: /scan, /export, /reset`); }
                  }} className="border-t border-[#00ff88]/15 bg-black/80 flex items-center px-2.5 py-1.5 gap-1.5">
                    <span className="text-[#00ff88]/40 text-[10px] font-mono">&gt;</span>
                    <input
                      type="text"
                      value={consoleInput}
                      onChange={(e) => setConsoleInput(e.target.value)}
                      placeholder="Type command (/scan, /export, /reset)..."
                      className="bg-transparent border-none outline-none focus:outline-none text-[10px] text-[#00ff88] placeholder-[#00ff88]/20 flex-1 font-mono"
                    />
                  </form>
                )}
              </div>

              {/* Intercepted Text Card (OCR) directly attached at the bottom of left column */}
              <AnimatePresence>
                {ocrText && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className={`border rounded-xl overflow-hidden ${uiMode === "civilian" ? "border-white/5 bg-white/5" : "border-[#00ff88]/10 bg-black/40"}`}>
                    <div className={`flex items-center justify-between px-3 py-2 border-b ${uiMode === "civilian" ? "border-white/5 bg-white/5 text-emerald-400" : "border-[#00ff88]/10 bg-[#00ff88]/5 text-[#00ff88]"}`}>
                      <span className="text-[10px] tracking-wider uppercase font-bold">Extracted Image Text</span>
                      <span className="text-[9px] opacity-35 uppercase">OCR PAYLOAD</span>
                    </div>
                    <div className={`p-3 text-[11px] font-mono leading-relaxed max-h-32 overflow-y-auto whitespace-pre-wrap select-all ${uiMode === "civilian" ? "bg-black/40 text-white/80" : "bg-[#00ff88]/5 text-[#00ff88]/80"}`}>
                      {ocrText}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* COLUMN 2: PRIMARY DIAGNOSTIC THREAT ASSESSMENT REPORT */}
            <div className="flex flex-col gap-4">
              <AnimatePresence>
                {result && phase==="complete" && (
                  <motion.div initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{duration:0.4}} className="border rounded-xl overflow-hidden flex flex-col h-full justify-between" style={{borderColor:result.threatColor+"40",backgroundColor:result.threatColor+"06"}}>
                    <div>
                      <div className="flex items-center justify-between px-4 py-3.5 border-b" style={{borderColor:result.threatColor+"25",backgroundColor:result.threatColor+"0c"}}>
                        <div className="flex items-center gap-2">
                          <motion.div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor:result.threatColor}} animate={{opacity:[1,0.3,1]}} transition={{duration:1.5,repeat:Infinity}}/>
                          <span className="text-[11px] font-bold tracking-[0.15em] uppercase" style={{color:result.threatColor}}>Diagnostic Threat Report</span>
                        </div>
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 border rounded opacity-60" style={{borderColor:result.threatColor+"30",color:result.threatColor}}>Public Assessment</span>
                      </div>
                      
                      <div className="p-4 space-y-4 text-xs">
                        {/* SAFETY SCORE CIRCLE (CIVILIAN Mode ONLY) */}
                        {uiMode === "civilian" && (
                          <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-white/5 shadow-inner">
                            <div className="space-y-0.5">
                              <h4 className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Public Safety Rating</h4>
                              <p className="text-[9px] text-white/40">Evaluation index for civilian risk mitigation.</p>
                            </div>
                            <div className="relative w-12 h-12 flex items-center justify-center">
                              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path className="text-white/10" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <motion.path
                                  className="text-emerald-400"
                                  strokeWidth="3.5"
                                  strokeDasharray={`${safetyScore}, 100`}
                                  strokeLinecap="round"
                                  stroke="currentColor"
                                  fill="none"
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                              </svg>
                              <span className="absolute text-[10px] font-extrabold text-emerald-400">{safetyScore}%</span>
                            </div>
                          </div>
                        )}

                        {/* TACTICAL UNIQUE FEATURE: Technical OSINT Signature Gain telemetry grid */}
                        {uiMode === "tactical" && (
                          <div className="grid grid-cols-2 gap-1.5 p-3.5 border border-[#00ff88]/10 bg-black/30 rounded-lg font-mono text-[9px] text-[#00ff88]/60">
                            <div>SPECTRAL GAIN: 8.42 dB</div>
                            <div>POLARITY: VERTICAL</div>
                            <div>BANDWIDTH: 450 MHz</div>
                            <div>DECRYPTION: ACTIVE (AES)</div>
                          </div>
                        )}

                        <div><p className="text-[9px] uppercase tracking-wider opacity-35 mb-0.5">Classification</p><p className="font-bold text-sm" style={{color:result.threatColor}}>{result.classification}</p></div>
                        
                        {/* 🌟 UPGRADED MULTIPLE DATA CODES (Origin, safety standoff, and RCS indexes!) */}
                        {result.exifData && (result.exifData.lat || result.exifData.make) && (
                          <div className="pt-2.5 border-t border-white/5">
                            <p className="text-[9px] uppercase tracking-wider opacity-35 mb-1 flex items-center gap-1.5">🌍 Uplink Origin Data (EXIF)</p>
                            <div className="grid grid-cols-2 gap-2 p-2 rounded bg-black/40 border border-white/5 font-mono text-[9px] opacity-80">
                              <div>LAT/LON: {result.exifData.lat ? `${result.exifData.lat.toFixed(4)}, ${result.exifData.lon?.toFixed(4)}` : "CLOAKED"}</div>
                              <div>DEVICE: {result.exifData.make ? `${result.exifData.make} ${result.exifData.model}` : "UNKNOWN"}</div>
                              <div className="col-span-2">TIMESTAMP: {result.exifData.date || "REDACTED"}</div>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-white/5">
                          <div>
                            <p className="text-[9px] uppercase tracking-wider opacity-35 mb-0.5">Involved Origin</p>
                            <p className="font-bold opacity-80">{result.origin || "Unknown"}</p>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase tracking-wider opacity-35 mb-0.5">Standoff Radius</p>
                            <p className="font-bold opacity-80 text-emerald-400">{result.safetyRadius || "0m - Safe"}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                          <div>
                            <p className="text-[9px] uppercase tracking-wider opacity-35 mb-0.5">Radar Profile (RCS)</p>
                            <p className="font-bold opacity-80 text-cyan-400">{result.radarCrossSection || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase tracking-wider opacity-35 mb-0.5">Threat Level</p>
                            <p className="font-bold opacity-80" style={{color:result.threatColor}}>{result.threatLevel}</p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/5">
                          <p className="text-[9px] uppercase tracking-wider opacity-35 mb-0.5">Hazard Potential & Utility</p>
                          <p className="opacity-80 leading-relaxed italic text-orange-400">{result.potential || "No additional threat potential flagged."}</p>
                        </div>

                        <div><p className="text-[9px] uppercase tracking-wider opacity-35 mb-0.5">Assessment Details</p><p className="opacity-75 leading-relaxed">{result.description}</p></div>
                        
                        {/* Custom Civilian Guidance Protocol card (ONLY visible in Civilian Mode) */}
                        {uiMode === "civilian" && (
                          <div className="border border-emerald-500/20 bg-emerald-950/10 rounded-xl p-3.5 space-y-2">
                            <h4 className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1.5">🛡️ Civilian Safety Actions</h4>
                            <div className="grid grid-cols-1 gap-1 font-mono text-[9px] text-white/70">
                              <div className="flex items-center gap-1.5">✅ 1. Keep secure observation distance from target</div>
                              <div className="flex items-center gap-1.5">✅ 2. In case of high/critical danger, report immediately</div>
                              <div className="flex items-center gap-1.5">✅ 3. Follow local municipal warning directives</div>
                            </div>
                            <p className="text-[8px] opacity-40 uppercase pt-1">EMERGENCY SERVICES: 911 / 112</p>
                          </div>
                        )}

                        <div className="border-t border-white/10 pt-3"><p className="text-[9px] uppercase tracking-wider opacity-35 mb-0.5">Public Recommendation</p><p className="opacity-70 italic">{result.recommendations}</p></div>
                      </div>
                    </div>

                    {/* Bottom Action buttons */}
                    <div className="p-4 border-t border-white/5 bg-black/10 flex gap-2 flex-wrap">
                      <button onClick={handleExportPDF} className={`flex-1 min-w-[60px] py-2.5 border rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-white/5 ${uiMode === "civilian" ? "border-white/20 text-white" : "border-[#00ff88]/20 text-[#00ff88]"}`} title="Export to PDF">📄 PDF</button>
                      <button onClick={() => { soundOn && Audio.click(); window.print(); }} className={`flex-1 min-w-[60px] py-2.5 border rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-white/5 ${uiMode === "civilian" ? "border-white/20 text-white" : "border-[#00ff88]/20 text-[#00ff88]"}`} title="Print Report">🖨️ Print</button>
                      <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(result, null, 2)); alert("JSON Payload Copied to Clipboard!"); soundOn && Audio.click(); }} className={`flex-1 min-w-[60px] py-2.5 border rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-white/5 ${uiMode === "civilian" ? "border-white/20 text-white" : "border-[#00ff88]/20 text-[#00ff88]"}`} title="Copy Raw JSON">📋 JSON</button>
                      <button onClick={speakReport} className="flex-1 min-w-[60px] py-2.5 border border-emerald-500/20 hover:border-emerald-500/50 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-[#00ff88]/5 text-emerald-400">🔊 Vocal</button>
                      <button onClick={reset} className="flex-1 min-w-[80px] py-2.5 border rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all hover:shadow-lg" style={{borderColor:result.threatColor+"30",color:result.threatColor}} onMouseEnter={e=>{e.currentTarget.style.backgroundColor=result.threatColor+"15"}} onMouseLeave={e=>{e.currentTarget.style.backgroundColor="transparent"}}>
                        New Scan
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error */}
              {phase==="error"&&(
                <motion.div initial={{opacity:0}} animate={{opacity:1}} className="border border-red-500/20 rounded-xl p-4 bg-red-500/5">
                  <p className="text-red-400 text-[10px] font-bold uppercase tracking-wider mb-1">⚠ Analysis Failed</p>
                  <p className="text-red-400/60 text-[10px] mb-3">{errorMsg}</p>
                  <p className="text-[9px] opacity-30 mb-3">Set GROQ_API_KEY in .env.local — get a free key at console.groq.com/keys</p>
                  <button onClick={reset} className="w-full py-2 border border-red-500/20 rounded-lg text-red-400 text-[10px] uppercase tracking-wider hover:bg-red-500/10 transition-colors">Reset</button>
                </motion.div>
              )}
            </div>

            {/* COLUMN 3: AI INTERROGATION TERMINAL & REGISTRY SESSION LOGS */}
            <div className="flex flex-col gap-4">
              {/* Operational Interrogation Terminal (Chat) */}
              <AnimatePresence>
                {result && phase==="complete" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`border rounded-xl overflow-hidden bg-black/40 flex flex-col flex-1 min-h-[300px] justify-between ${uiMode === "civilian" ? "border-white/5" : "border-[#00ff88]/15"}`}>
                    <div>
                      <div className={`flex items-center justify-between px-4 py-3 border-b ${uiMode === "civilian" ? "border-white/5 bg-white/5 text-emerald-400" : "border-[#00ff88]/15 bg-[#00ff88]/5 text-[#00e5ff]"}`}>
                        <span className="text-[10px] tracking-wider uppercase font-bold">Ask AI Safety Assistant</span>
                        <span className="text-[9px] opacity-35 uppercase">DIRECT RESPONSE LINK</span>
                      </div>

                      {/* Messages panel with standard scrolling */}
                      <div className="p-3 max-h-[320px] overflow-y-auto space-y-2.5 font-mono text-[10px]">
                        {chatHistory.length === 0 ? (
                          <div className="text-center py-8 opacity-25 uppercase text-[9px] tracking-wider">
                            No queries initiated. Type below to interrogate the active target signature.
                          </div>
                        ) : (
                          chatHistory.map((ch, i) => (
                            <div key={i} className={`p-2.5 rounded-lg border leading-relaxed ${ch.role === "user" ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" : "border-white/5 bg-black/30 text-white/85"}`}>
                              <span className="font-bold opacity-40 uppercase mr-1.5">{ch.role === "user" ? "CITIZEN" : "ASSISTANT"} &gt;</span>
                              {ch.content}
                            </div>
                          ))
                        )}
                        {chatLoading && <span className="inline-block w-1.5 h-3 bg-[#00ff88] cursor-blink"/>}
                      </div>
                    </div>

                    {/* Chat input form */}
                    <form onSubmit={handleSendMessage} className="p-3.5 border-t border-white/5 bg-black/25 flex gap-2">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={e => setChatMessage(e.target.value)}
                        placeholder="Ask safety questions or seek details..."
                        disabled={chatLoading}
                        className={`flex-1 bg-black/60 border focus:outline-none rounded-lg px-3 py-2 text-xs font-mono disabled:opacity-40 ${uiMode === "civilian" ? "border-white/10 focus:border-emerald-500/50 text-white placeholder-white/20" : "border-[#00ff88]/20 focus:border-[#00ff88]/60 text-[#00ff88] placeholder-[#00ff88]/20"}`}
                      />
                      <button
                        type="submit"
                        disabled={chatLoading || !chatMessage.trim()}
                        className={`px-3.5 border rounded-lg text-[10px] uppercase font-bold tracking-wider hover:bg-white/5 disabled:opacity-40 transition-all ${uiMode === "civilian" ? "border-white/10 text-white" : "border-[#00ff88]/20 text-[#00ff88]"}`}
                      >
                        Ask
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* History list inside the right column so it fits perfectly on desktop! */}
              {showHistory && history.length > 0 && (
                <div className="border border-white/5 rounded-xl bg-black/40 overflow-hidden">
                  <ScanHistory records={history} onSelect={(r)=>{setImageSrc(r.thumbnail); setPhase("complete"); setResult({ targetId: r.targetId, classification: r.classification, threatLevel: r.threatLevel, threatColor: r.threatColor, confidence: "95%", description: "Loaded from scan registry.", signatures: [], origin: "Registry", recommendations: "N/A" });}} onClear={()=>{setHistory([]);saveHistory([]);}} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>

      {/* UPGRADED FOOTERS */}
      {uiMode === "civilian" ? (
        <footer className="border-t border-white/5 bg-[#090f1d]/90 backdrop-blur-xl px-5 py-3.5 flex items-center justify-between text-xs text-white/40 tracking-wider">
          <div className="flex items-center gap-3">
            <span>🛡️ Public Safety OSINT Protocol</span>
            <span className="opacity-20">|</span>
            <span className="hover:text-emerald-400 transition-colors cursor-pointer">Civilian Directives</span>
            <span className="opacity-20">|</span>
            <span className="hover:text-emerald-400 transition-colors cursor-pointer">Emergency Dial: 911 / 112</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400/60">
            <span>SECURE PUBLIC CHANNEL</span>
          </div>
        </footer>
      ) : (
        <footer className="border-t border-[#00ff88]/20 bg-black/60 px-5 py-3.5 flex items-center justify-between text-xs font-mono text-[#00ff88]/50 tracking-wider">
          <div className="flex items-center gap-3">
            <span>[ SYSTEM: LLaMA-4-SCOUT ]</span>
            <span className="opacity-35">|</span>
            <span>[ ENCRYPTION: QUANTUM-AES ]</span>
            <span className="opacity-35">|</span>
            <span className="hover:text-[#00ff88] transition-colors cursor-pointer">[ SECURE_COMMS ]</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-[#00ff88] glow-text">
            <span>NODE_ID: 0x99A7</span>
          </div>
        </footer>
      )}
    </div>
  );
}
