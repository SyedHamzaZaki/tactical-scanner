// ==================== PURE WEB AUDIO ENGINE (Dependency-Free Oscillators) ====================
let audioCtx = null;

const AudioSynth = {
  init() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },

  click() {
    this.init();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  },

  upload() {
    this.init();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.frequency.setValueAtTime(200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.35);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.35);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
  },

  scanTick() {
    this.init();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
  },

  scanStart() {
    this.init();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(85, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.5);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 1.5);
  },

  scanComplete() {
    this.init();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    
    // Note 1
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.frequency.setValueAtTime(523.25, now); // C5
    gain1.gain.setValueAtTime(0.04, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    osc1.start();
    osc1.stop(now + 0.2);

    // Note 2 slightly delayed
    setTimeout(() => {
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
      gain2.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.35);
      osc2.start();
      osc2.stop(audioCtx.currentTime + 0.35);
    }, 120);
  },

  threatAlert() {
    this.init();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    // Siren sound sweep
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(800, now + 0.2);
    osc.frequency.linearRampToValueAtTime(400, now + 0.4);
    osc.frequency.linearRampToValueAtTime(800, now + 0.6);
    
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    
    osc.start();
    osc.stop(now + 0.7);
  },

  error() {
    this.init();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  }
};


// ==================== APP STATE CONFIGURATIONS ====================
let appMode = "civilian"; // civilian or tactical
let activeImageSrc = null;
let activeFile = null;
let activeResult = null;
let historyRecords = [];
let soundOn = true;
let cameraStream = null;
let consoleLines = [];
let chatLogHistory = [];
let scanProgress = 0;


// ==================== MOCK FALLBACK DATA ====================
const MOCK_PROFILES = [
  {
    keywords: ["f35", "aircraft", "jet", "plane", "f-35"],
    data: {
      targetId: "OP-4890",
      classification: "Military Jet - Lockheed Martin F-35 Lightning II",
      threatLevel: "HIGH",
      threatColor: "#ff4400",
      confidence: "98.7%",
      description: "Classified fifth-generation stealth multirole fighter aircraft executing high-speed aerial maneuver maneuvers inside scanned visual horizon.",
      origin: "Lockheed Martin, USA",
      potential: "Advanced tactical stealth penetration, active radar signal interception, and airborne kinetic bombardment capabilities.",
      safetyRadius: "1.2 Kilometers (Hazardous airspace warning)",
      radarCrossSection: "0.005 m² (Stealth signature)",
      recommendations: "Stand clear of local high-altitude flight boundaries and verify operational airspace clearances.",
      signatures: [
        { name: "GPS", status: "ACTIVE", color: "#00ff00" },
        { name: "RF EMISSION", status: "DETECTED", color: "#ff0000" },
        { name: "THERMAL", status: "DETECTED", color: "#ff0000" },
        { name: "NETWORK", status: "ACTIVE", color: "#00ff00" }
      ]
    }
  },
  {
    keywords: ["knife", "blade", "weapon", "dagger", "sword"],
    data: {
      targetId: "TGT-9081",
      classification: "Tactical Tool - Steel Combat Knife",
      threatLevel: "MEDIUM",
      threatColor: "#ff8800",
      confidence: "94.2%",
      description: "Cold-steel manual edge hunting dagger with structured visual tactical grip anomalies.",
      origin: "Commercial Manufacturer",
      potential: "Close-quarters physical puncture capabilities, manual kinetic hazard potential.",
      safetyRadius: "10 Meters (Personal safety buffer)",
      radarCrossSection: "N/A (Non-reflective non-electronic)",
      recommendations: "Maintain physical separation and ensure edge containment sheets are securely locked.",
      signatures: [
        { name: "GPS", status: "N/A", color: "#888888" },
        { name: "RF EMISSION", status: "N/A", color: "#888888" },
        { name: "THERMAL", status: "N/A", color: "#888888" },
        { name: "NETWORK", status: "N/A", color: "#888888" }
      ]
    }
  },
  {
    keywords: ["cat", "tabby", "kitten", "feline", "pet"],
    data: {
      targetId: "BIO-0824",
      classification: "Domestic Companion - Felis Catus (Tabby)",
      threatLevel: "LOW",
      threatColor: "#44cc00",
      confidence: "99.1%",
      description: "Domesticated biological feline asset scanning environment. Displays high physical flexibility and standard companion profiles.",
      origin: "Local Biosphere",
      potential: "Minor claw scratch capabilities, negligible electronic threat matrix, high target cuteness score.",
      safetyRadius: "0 Meters (Safe for close interactions)",
      radarCrossSection: "N/A",
      recommendations: "Provide standard feline treats, maintain regular diagnostic petting schedules.",
      signatures: [
        { name: "GPS", status: "N/A", color: "#888888" },
        { name: "RF EMISSION", status: "N/A", color: "#888888" },
        { name: "THERMAL", status: "DETECTED", color: "#ff0000" },
        { name: "NETWORK", status: "N/A", color: "#888888" }
      ]
    }
  },
  {
    keywords: ["officer", "military", "uniform", "soldier", "army"],
    data: {
      targetId: "TGT-2145",
      classification: "Active Personnel - Pakistan Army Officer",
      threatLevel: "LOW",
      threatColor: "#44cc00",
      confidence: "95.4%",
      description: "Armed forces officer in official ceremonial uniform executing manual gestures within static visual diagnostic bounds.",
      origin: "Armed Forces Registry, Pakistan",
      potential: "Standard command communications authority, high tactical coordination potential.",
      safetyRadius: "5 Meters (Respectful distance guidelines)",
      radarCrossSection: "N/A",
      recommendations: "Observe local security protocols and maintain typical civil coordination channels.",
      signatures: [
        { name: "GPS", status: "INACTIVE", color: "#ff0000" },
        { name: "RF EMISSION", status: "NOT DETECTED", color: "#00ff00" },
        { name: "THERMAL", status: "DETECTED", color: "#ff0000" },
        { name: "NETWORK", status: "INACTIVE", color: "#ff0000" }
      ]
    }
  }
];

const DEFAULT_MOCK = {
  targetId: "OP-99A7",
  classification: "General Object - Diagnostic Asset",
  threatLevel: "MINIMAL",
  threatColor: "#00ff00",
  confidence: "88.0%",
  description: "Scanned visual asset presents normal parameters. No anomalous hazards or military-grade signatures detected.",
  origin: "Unknown",
  potential: "Negligible risk, typical civilian consumer utility index.",
  safetyRadius: "0 meters - Safe for close proximity",
  radarCrossSection: "N/A",
  recommendations: "Maintain standard civilian observation protocols.",
  signatures: [
    { name: "GPS", status: "N/A", color: "#888888" },
    { name: "RF EMISSION", status: "N/A", color: "#888888" },
    { name: "THERMAL", status: "N/A", color: "#888888" },
    { name: "NETWORK", status: "N/A", color: "#888888" }
  ]
};


// ==================== DOM ELEMENTS SELECTORS ====================
const el = {
  landingPage: document.getElementById("landing-page"),
  btnEnterScanner: document.getElementById("btn-enter-scanner"),
  btnOpenApiConfig: document.getElementById("btn-open-api-config"),
  
  configDrawer: document.getElementById("config-drawer"),
  btnCloseConfig: document.getElementById("btn-close-config"),
  btnOpenSettings: document.getElementById("btn-open-settings"),
  inputApiKey: document.getElementById("input-api-key"),
  btnToggleKeyVisibility: document.getElementById("btn-toggle-key-visibility"),
  btnSaveConfig: document.getElementById("btn-save-config"),
  btnClearConfig: document.getElementById("btn-clear-config"),
  
  rangeVoiceRate: document.getElementById("range-voice-rate"),
  labelVoiceRate: document.getElementById("label-voice-rate"),
  rangeVoicePitch: document.getElementById("range-voice-pitch"),
  labelVoicePitch: document.getElementById("label-voice-pitch"),
  
  scannerWorkspace: document.getElementById("scanner-workspace"),
  btnBackHome: document.getElementById("btn-back-home"),
  appHeader: document.getElementById("app-header"),
  headerIcon: document.getElementById("header-icon"),
  headerTitle: document.getElementById("header-title"),
  headerBadge: document.getElementById("header-badge"),
  modeSwitcherContainer: document.getElementById("mode-switcher-container"),
  btnToggleUiMode: document.getElementById("btn-toggle-ui-mode"),
  clockTimestamp: document.getElementById("clock-timestamp"),
  clockCoordinates: document.getElementById("clock-coordinates"),
  btnToggleAudio: document.getElementById("btn-toggle-audio"),
  btnToggleLogs: document.getElementById("btn-toggle-logs"),
  badgeLogsCount: document.getElementById("badge-logs-count"),
  appFooter: document.getElementById("app-footer"),
  footerLogo: document.getElementById("footer-logo"),
  footerChannelBadge: document.getElementById("footer-channel-badge"),
  
  idleUploadViewport: document.getElementById("idle-upload-viewport"),
  idleBadgeIcon: document.getElementById("idle-badge-icon"),
  idleTitle: document.getElementById("idle-title"),
  idleDesc: document.getElementById("idle-desc"),
  dropzoneBox: document.getElementById("dropzone-box"),
  inputTargetFile: document.getElementById("input-target-file"),
  btnCameraTrigger: document.getElementById("btn-camera-trigger"),
  cameraViewfinderFeed: document.getElementById("camera-viewfinder-feed"),
  webcamPreview: document.getElementById("webcam-preview"),
  btnCameraCapture: document.getElementById("btn-camera-capture"),
  btnCameraAbort: document.getElementById("btn-camera-abort"),
  
  activeScannerView: document.getElementById("active-scanner-view"),
  imageViewportCard: document.getElementById("image-viewport-card"),
  badgeScanningIndicator: document.getElementById("badge-scanning-indicator"),
  badgeScanningText: document.getElementById("badge-scanning-text"),
  loadedTargetImage: document.getElementById("loaded-target-image"),
  tacticalOrbitalMetrics: document.getElementById("tactical-orbital-metrics"),
  scanningLaserLine: document.getElementById("scanning-laser-line"),
  progressBarContainer: document.getElementById("progress-bar-container"),
  progressBar: document.getElementById("progress-bar"),
  
  labelTargetId: document.getElementById("label-target-id"),
  labelConfidence: document.getElementById("label-confidence"),
  threatRatingBox: document.getElementById("threat-rating-box"),
  labelThreatLevel: document.getElementById("label-threat-level"),
  
  consoleLogsScroll: document.getElementById("console-logs-scroll"),
  consoleCliForm: document.getElementById("console-cli-form"),
  inputCliCommand: document.getElementById("input-cli-command"),
  
  ocrExtractedCard: document.getElementById("ocr-extracted-card"),
  ocrPayloadText: document.getElementById("ocr-payload-text"),
  
  reportDossierCard: document.getElementById("report-dossier-card"),
  reportIndicatorDot: document.getElementById("report-indicator-dot"),
  reportIndicatorTitle: document.getElementById("report-indicator-title"),
  civilianSafetyScoreCard: document.getElementById("civilian-safety-score-card"),
  svgSafetyScoreRing: document.getElementById("svg-safety-score-ring"),
  labelSafetyScorePercent: document.getElementById("label-safety-score-percent"),
  tacticalHardwareGainsPanel: document.getElementById("tactical-hardware-gains-panel"),
  reportClassification: document.getElementById("report-classification"),
  reportOrigin: document.getElementById("report-origin"),
  reportSafetyRadius: document.getElementById("report-safety-radius"),
  reportRcs: document.getElementById("report-rcs"),
  reportThreatLevelValue: document.getElementById("report-threat-level-value"),
  reportPotential: document.getElementById("report-potential"),
  reportDescription: document.getElementById("report-description"),
  civilianSafetyProtocolCard: document.getElementById("civilian-safety-protocol-card"),
  reportRecommendations: document.getElementById("report-recommendations"),
  
  btnExportPdf: document.getElementById("btn-export-pdf"),
  btnVocalReadout: document.getElementById("btn-vocal-readout"),
  btnResetScan: document.getElementById("btn-reset-scan"),
  
  aiInterrogationCard: document.getElementById("ai-interrogation-card"),
  chatMessagesContainer: document.getElementById("chat-messages-container"),
  chatEmptyState: document.getElementById("chat-empty-state"),
  chatPromptForm: document.getElementById("chat-prompt-form"),
  inputChatMessage: document.getElementById("input-chat-message"),
  btnChatSend: document.getElementById("btn-chat-send"),
  
  historyRegistryDrawer: document.getElementById("history-registry-drawer"),
  btnClearRegistry: document.getElementById("btn-clear-registry"),
  historyListViewport: document.getElementById("history-list-viewport")
};


// ==================== SYSTEM LOG WRITER ====================
function log(msg) {
  consoleLines.push(msg);
  const div = document.createElement("div");
  div.className = "leading-relaxed";
  
  if (msg.startsWith("[ERR]")) {
    div.className += " text-red-400";
  } else if (msg.startsWith("[SYS]")) {
    div.className += appMode === "civilian" ? " text-emerald-400/80" : " text-[#00ff88]/60";
  } else if (msg.startsWith("[SCAN]")) {
    div.className += " text-[#00e5ff]/60";
  } else if (msg.startsWith("[INT]")) {
    div.className += " text-[#00ff88]";
  } else {
    div.className += " opacity-25";
  }
  
  div.textContent = msg;
  el.consoleLogsScroll.appendChild(div);
  el.consoleLogsScroll.scrollTop = el.consoleLogsScroll.scrollHeight;
}


// ==================== LOCAL CLOCK TELEMETRY ENGINE ====================
function updateClock() {
  const now = new Date();
  const utcString = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  el.clockTimestamp.textContent = utcString;
  
  // Random slowly drifting coordinates
  const lat = (38.8951 + (Math.sin(now.getTime() / 60000) * 0.005)).toFixed(4);
  const lng = (-77.0364 + (Math.cos(now.getTime() / 60000) * 0.005)).toFixed(4);
  el.clockCoordinates.textContent = `GRID: ${lat}°N ${Math.abs(lng)}°W`;
}
setInterval(updateClock, 1000);
updateClock();


// ==================== CONFIG drawer UTILS ====================
function loadConfig() {
  const key = localStorage.getItem("groq_api_key") || "";
  el.inputApiKey.value = key;
  
  const rate = localStorage.getItem("voice_rate") || "1.0";
  el.rangeVoiceRate.value = rate;
  el.labelVoiceRate.textContent = rate + "x";
  
  const pitch = localStorage.getItem("voice_pitch") || "0.95";
  el.rangeVoicePitch.value = pitch;
  el.labelVoicePitch.textContent = pitch;
}

function saveConfig() {
  const key = el.inputApiKey.value.trim();
  localStorage.setItem("groq_api_key", key);
  localStorage.setItem("voice_rate", el.rangeVoiceRate.value);
  localStorage.setItem("voice_pitch", el.rangeVoicePitch.value);
  
  log("[SYS] PARAMETERS COMMITTED TO LOCALSTORAGE.");
  if (soundOn) AudioSynth.click();
  toggleConfigDrawer(false);
}

function clearConfig() {
  localStorage.removeItem("groq_api_key");
  localStorage.setItem("voice_rate", "1.0");
  localStorage.setItem("voice_pitch", "0.95");
  loadConfig();
  log("[SYS] CONFIG MATRIX WIPED TO FACTORY DEFAULTS.");
  if (soundOn) AudioSynth.error();
}

function toggleConfigDrawer(show) {
  if (show) {
    el.configDrawer.classList.remove("translate-x-full");
  } else {
    el.configDrawer.classList.add("translate-x-full");
  }
}

el.rangeVoiceRate.addEventListener("input", (e) => { el.labelVoiceRate.textContent = e.target.value + "x"; });
el.rangeVoicePitch.addEventListener("input", (e) => { el.labelVoicePitch.textContent = e.target.value; });


// ==================== DYNAMIC THEME SYSTEM (Civilian vs Tactical) ====================
function updateThemeUI() {
  if (appMode === "civilian") {
    // Standard body & background styles
    document.body.className = "min-h-screen text-white font-sans bg-[#060a12] vignette relative transition-all duration-500 overflow-y-auto";
    document.body.classList.remove("grid-bg");
    
    // Header tags
    el.appHeader.className = "border-b border-white/5 bg-[#090f1d]/90 backdrop-blur-xl px-5 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.4)]";
    el.headerIcon.textContent = "🛡️";
    el.headerTitle.className = "text-sm font-extrabold uppercase tracking-[0.15em] bg-clip-text text-transparent bg-gradient-to-r from-[#00ff88] via-[#00e5ff] to-white";
    el.headerTitle.textContent = "Public Safety Diagnostic Center";
    el.headerBadge.className = "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[9px] font-mono uppercase tracking-wider text-emerald-400";
    el.headerBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Live Uplink`;
    
    // Toggle switches
    el.btnToggleUiMode.className = "text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 border border-emerald-500/20 hover:border-emerald-500/50 rounded-lg bg-emerald-500/5 text-emerald-400 transition-all hover:scale-105";
    el.btnToggleUiMode.textContent = "🔄 Switch to Cyber HUD";

    // Panel styling
    el.imageViewportCard.className = "relative border border-white/10 rounded-xl overflow-hidden bg-black/20";
    el.ocrExtractedCard.className = "border border-white/5 bg-white/5 rounded-xl overflow-hidden";
    el.consoleCliForm.classList.add("hidden");
    
    el.civilianSafetyScoreCard.classList.remove("hidden");
    el.civilianSafetyProtocolCard.classList.remove("hidden");
    el.tacticalHardwareGainsPanel.classList.add("hidden");
    el.tacticalOrbitalMetrics.classList.add("hidden");
    
    // Footers
    el.appFooter.className = "border-t border-white/5 bg-[#090f1d]/90 backdrop-blur-xl px-5 py-3.5 flex items-center justify-between text-xs text-white/40 tracking-wider";
    el.footerLogo.textContent = "🛡️ Public Safety OSINT Protocol";
    el.footerChannelBadge.className = "flex items-center gap-2 text-[10px] font-mono text-emerald-400/60";
    el.footerChannelBadge.textContent = "SECURE PUBLIC CHANNEL";
  } else {
    // Tactical HUD cyber styles
    document.body.className = "min-h-screen text-[#00ff88] font-mono bg-[#020408] grid-bg vignette relative transition-all duration-500 overflow-y-auto scanlines";
    
    // Header
    el.appHeader.className = "border-b border-[#00ff88]/20 bg-black/60 backdrop-blur-md px-5 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-[0_2px_20px_rgba(0,255,136,0.05)]";
    el.headerIcon.textContent = "";
    el.headerTitle.className = "text-sm font-bold tracking-[0.2em] uppercase text-[#00ff88] glow-text";
    el.headerTitle.textContent = "OSINT SCANNER // OMEGA-NODE_SYS";
    el.headerBadge.className = "text-[10px] opacity-40 uppercase tracking-widest text-[#00ff88]";
    el.headerBadge.textContent = "[ UPLINK: DECRYPTED ]";
    
    // Toggle
    el.btnToggleUiMode.className = "text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 border border-[#00ff88]/30 hover:border-[#00ff88] rounded bg-[#00ff88]/5 text-[#00ff88] transition-all";
    el.btnToggleUiMode.textContent = "🔄 CIVILIAN MODE";
    
    // Panels
    el.imageViewportCard.className = "relative border border-[#00ff88]/20 rounded-xl overflow-hidden bg-black/40";
    el.ocrExtractedCard.className = "border border-[#00ff88]/10 bg-black/40 rounded-xl overflow-hidden";
    el.consoleCliForm.classList.remove("hidden");
    
    el.civilianSafetyScoreCard.classList.add("hidden");
    el.civilianSafetyProtocolCard.classList.add("hidden");
    el.tacticalHardwareGainsPanel.classList.remove("hidden");
    if (activeImageSrc) {
      el.tacticalOrbitalMetrics.classList.remove("hidden");
    }
    
    // Footer
    el.appFooter.className = "border-t border-[#00ff88]/20 bg-black/60 px-5 py-3.5 flex items-center justify-between text-xs font-mono text-[#00ff88]/50 tracking-wider";
    el.footerLogo.textContent = "[ SYSTEM: LLaMA-4-SCOUT ]";
    el.footerChannelBadge.className = "flex items-center gap-2 text-[10px] text-[#00ff88] glow-text";
    el.footerChannelBadge.textContent = "NODE_ID: 0x99A7";
  }
  
  // Apply threat border to image container if complete
  if (activeResult) {
    const borders = {
      CRITICAL: appMode === "civilian" ? "border-red-500" : "border-red-500",
      HIGH: appMode === "civilian" ? "border-orange-500" : "border-orange-500",
      MEDIUM: appMode === "civilian" ? "border-yellow-500" : "border-yellow-500",
      LOW: appMode === "civilian" ? "border-green-400" : "border-green-400",
      MINIMAL: appMode === "civilian" ? "border-[#00ff88]" : "border-[#00ff88]"
    };
    el.imageViewportCard.className = `relative border ${borders[activeResult.threatLevel] || "border-white/10"} rounded-xl overflow-hidden bg-black/20`;
  }
}

// Lock switches once target loaded
function updateThemeLockState() {
  if (activeImageSrc) {
    el.modeSwitcherContainer.innerHTML = appMode === "civilian" ? 
      `<span class="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 border border-white/5 rounded text-white/30">🔒 Theme Locked</span>` :
      `<span class="text-[9px] font-mono uppercase tracking-wider px-2.5 py-1.5 border border-[#00ff88]/10 text-[#00ff88]/20">[ THEME_LOCKED ]</span>`;
  } else {
    el.modeSwitcherContainer.innerHTML = `<button id="btn-toggle-ui-mode" class="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 border border-emerald-500/20 hover:border-emerald-500/50 rounded-lg bg-emerald-500/5 text-emerald-400 transition-all hover:scale-105">🔄 Switch to Cyber HUD</button>`;
    
    // Rebind listener
    document.getElementById("btn-toggle-ui-mode").addEventListener("click", () => {
      if (soundOn) AudioSynth.click();
      appMode = appMode === "civilian" ? "tactical" : "civilian";
      updateThemeUI();
    });
    updateThemeUI();
  }
}


// ==================== LIVE WEBCAM VIEWFINDER ====================
async function startWebcam() {
  try {
    if (soundOn) AudioSynth.click();
    el.dropzoneBox.classList.add("hidden");
    el.btnCameraTrigger.classList.add("hidden");
    el.cameraViewfinderFeed.classList.remove("hidden");
    
    log("[SYS] INTIALIZING CAMERA OPTICS STREAM...");
    
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    el.webcamPreview.srcObject = cameraStream;
    
    log("[SYS] OPTICAL STREAM ONLINE. WAITING FOR TARGET CAPTURE.");
  } catch (err) {
    log("[ERR] WEBCAM ACCESS DENIED OR UNAVAILABLE");
    stopWebcam();
  }
}

function stopWebcam() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
  el.webcamPreview.srcObject = null;
  el.cameraViewfinderFeed.classList.add("hidden");
  el.dropzoneBox.classList.remove("hidden");
  el.btnCameraTrigger.classList.remove("hidden");
  log("[SYS] CAMERA STREAM ROUTE TERMINATED.");
}

function captureWebcamFrame() {
  if (!cameraStream || !el.webcamPreview.videoWidth) return;
  if (soundOn) AudioSynth.click();
  log("[SYS] IMAGE CAPTURED. GENERATING BUFFER...");
  
  const video = el.webcamPreview;
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  canvas.toBlob((blob) => {
    if (blob) {
      const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
      processFile(file);
    }
  }, "image/jpeg", 0.9);
  
  stopWebcam();
}


// ==================== PARALLEL OCR DECODER ====================
async function runOcrProcessing(file) {
  try {
    const ocrRes = await Tesseract.recognize(file, "eng");
    const text = ocrRes.data.text || "";
    if (text.trim()) {
      el.ocrExtractedCard.classList.remove("hidden");
      el.ocrPayloadText.textContent = text.trim();
      log(`[SYS] INTERCEPTED COMMS: ${text.trim().split(/\s+/).length} WORDS IDENTIFIED IN IMAGE.`);
    }
  } catch (err) {
    console.error("OCR Extraction failed", err);
  }
}


// ==================== OSINT CORE CLASSIFIER (Vision AI or Fallback Simulator) ====================
async function processFile(file) {
  if (!file.type.startsWith("image/")) return;
  activeFile = file;
  
  const url = URL.createObjectURL(file);
  activeImageSrc = url;
  
  // Lock toggles
  updateThemeLockState();
  
  // Transition panels
  el.idleUploadViewport.classList.add("hidden");
  el.activeScannerView.classList.remove("hidden");
  
  el.loadedTargetImage.src = url;
  el.badgeScanningIndicator.className = "w-1.5 h-1.5 rounded-full bg-[#ffaa00] animate-pulse";
  el.badgeScanningText.textContent = "SCANNING";
  el.progressBarContainer.classList.remove("hidden");
  el.scanningLaserLine.classList.remove("hidden");
  el.ocrExtractedCard.classList.add("hidden");
  el.ocrPayloadText.textContent = "";
  
  // Clear chat
  chatLogHistory = [];
  el.chatMessagesContainer.innerHTML = `<div id="chat-empty-state" class="text-center py-8 opacity-25 uppercase text-[9px] tracking-wider">No queries initiated. Type below to interrogate the active target signature.</div>`;
  el.chatEmptyState = document.getElementById("chat-empty-state");
  
  if (soundOn) {
    AudioSynth.upload();
    AudioSynth.scanStart();
  }
  
  consoleLines = [];
  el.consoleLogsScroll.innerHTML = "";
  log("[SYS] IMAGE ACQUIRED — " + file.name + " (" + (file.size/1024).toFixed(1) + "KB)");
  log("[SYS] INITIATING TACTICAL SCAN...");
  
  // Run OCR
  runOcrProcessing(file);
  
  // Animate laser lines and logs
  let mi = 0;
  const msgI = setInterval(() => {
    if (mi < SCAN_MSGS.length) {
      log(`[SCAN] ${SCAN_MSGS[mi]}`);
      if (soundOn) AudioSynth.scanTick();
      mi++;
    }
  }, 500);
  
  let prg = 0;
  const prgI = setInterval(() => {
    prg += Math.floor(Math.random() * 12) + 3;
    if (prg >= 95) {
      prg = 95;
      clearInterval(prgI);
    }
    el.progressBar.style.width = prg + "%";
  }, 200);

  // Convert image to base64
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onloadend = async () => {
    const base64 = reader.result.split(",")[1];
    
    // Check key
    const apiKey = localStorage.getItem("groq_api_key");
    
    if (apiKey && apiKey.startsWith("gsk_")) {
      // Direct live API vision completion!
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + apiKey
          },
          body: JSON.stringify({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [
              {
                role: "system",
                content: "You are a military OSINT classifier AI. Return ONLY a valid JSON object matching exactly: {targetId, classification, threatLevel (CRITICAL/HIGH/MEDIUM/LOW/MINIMAL), threatColor, confidence, description, origin, potential, safetyRadius, radarCrossSection, recommendations, signatures: [{name, status, color}]}. Be realistic."
              },
              {
                role: "user",
                content: [
                  { type: "text", text: "Analyze this target image." },
                  { type: "image_url", image_url: { url: reader.result } }
                ]
              }
            ],
            response_format: { type: "json_object" }
          })
        });
        
        clearInterval(msgI);
        clearInterval(prgI);
        
        if (!response.ok) throw new Error("API Route Failure " + response.status);
        const resJson = await response.json();
        const content = JSON.parse(resJson.choices[0].message.content);
        
        renderDiagnosticReport(content);
      } catch (err) {
        log("[ERR] DIRECT KEY CONTACT ATTEMPT FAILED. TRIGGERING INTUITIVE LOCAL SIMULATOR...");
        runLocalSimulator(file, msgI, prgI);
      }
    } else {
      // Local fallback simulator
      setTimeout(() => {
        clearInterval(msgI);
        clearInterval(prgI);
        runLocalSimulator(file);
      }, 4000);
    }
  };
}

// Local simulator engine matching key attributes
function runLocalSimulator(file) {
  const name = file.name.toLowerCase();
  let selected = DEFAULT_MOCK;
  
  for (const prof of MOCK_PROFILES) {
    if (prof.keywords.some(k => name.includes(k))) {
      selected = prof.data;
      break;
    }
  }
  
  renderDiagnosticReport(selected);
}

function renderDiagnosticReport(data) {
  activeResult = data;
  scanProgress = 100;
  el.progressBar.style.width = "100%";
  
  // Sound notifications
  if (soundOn) {
    if (data.threatLevel === "CRITICAL" || data.threatLevel === "HIGH") {
      AudioSynth.threatAlert();
    } else {
      AudioSynth.scanComplete();
    }
  }
  
  // Log results
  log("");
  log("[SYS] ██ SCAN COMPLETE ██");
  log(`[SYS] THREAT LEVEL: ${data.threatLevel}`);
  log(`[SYS] CLASSIFICATION: ${data.classification}`);
  log("[SYS] REPORT COMPILED.");
  
  // Update state badges
  el.badgeScanningIndicator.className = "w-1.5 h-1.5 rounded-full bg-[#00ff88]";
  el.badgeScanningText.textContent = "COMPLETE";
  
  // Fill report card fields
  el.labelTargetId.textContent = data.targetId;
  el.labelConfidence.textContent = data.confidence;
  el.labelThreatLevel.textContent = data.threatLevel;
  el.labelThreatLevel.style.color = data.threatColor;
  el.threatRatingBox.style.borderColor = data.threatColor + "40";
  el.threatRatingBox.style.backgroundColor = data.threatColor + "08";
  
  el.reportClassification.textContent = data.classification;
  el.reportClassification.style.color = data.threatColor;
  el.reportOrigin.textContent = data.origin;
  el.reportSafetyRadius.textContent = data.safetyRadius;
  el.reportRcs.textContent = data.radarCrossSection;
  el.reportThreatLevelValue.textContent = data.threatLevel;
  el.reportThreatLevelValue.style.color = data.threatColor;
  el.reportPotential.textContent = data.potential;
  el.reportDescription.textContent = data.description;
  el.reportRecommendations.textContent = data.recommendations;
  
  // Update safety ring score
  const scoreMap = { MINIMAL: 98, LOW: 88, MEDIUM: 55, HIGH: 25, CRITICAL: 5 };
  const score = scoreMap[data.threatLevel] || 100;
  
  el.labelSafetyScorePercent.textContent = score + "%";
  el.svgSafetyScoreRing.setAttribute("stroke-dasharray", `${score}, 100`);
  
  // Voice Synthesis broadcast
  setTimeout(() => {
    speakText(`Analysis Complete. Threat evaluation is ${data.threatLevel}.`);
  }, 1200);
  
  // Save to Scan Registry history
  const rec = {
    id: Date.now().toString(),
    timestamp: new Date().toLocaleString(),
    thumbnail: activeImageSrc,
    classification: data.classification,
    threatLevel: data.threatLevel,
    threatColor: data.threatColor,
    targetId: data.targetId,
    description: data.description,
    origin: data.origin,
    safetyRadius: data.safetyRadius,
    radarCrossSection: data.radarCrossSection,
    potential: data.potential,
    recommendations: data.recommendations,
    signatures: data.signatures
  };
  
  historyRecords.unshift(rec);
  if (historyRecords.length > 20) historyRecords.pop();
  localStorage.setItem("osint_history", JSON.stringify(historyRecords));
  
  updateHistoryListUI();
  updateThemeUI();
}


// ==================== OPERATOR VOCAL TTS SYNTH ====================
function speakText(text) {
  if (typeof window === "undefined" || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const eng = voices.find(v => v.lang.startsWith("en"));
  if (eng) utterance.voice = eng;
  
  // Load custom drawer rate pitches
  const rate = parseFloat(localStorage.getItem("voice_rate") || "1.0");
  const pitch = parseFloat(localStorage.getItem("voice_pitch") || "0.95");
  
  utterance.rate = rate;
  utterance.pitch = pitch;
  
  window.speechSynthesis.speak(utterance);
}

el.btnVocalReadout.addEventListener("click", () => {
  if (!activeResult) return;
  if (soundOn) AudioSynth.click();
  speakText(`Public Diagnostic Complete. Object is classified as ${activeResult.classification}. Threat level evaluation is ${activeResult.threatLevel}. safety recommendation is: ${activeResult.recommendations}`);
});


// ==================== INTERROGATION ASSISTANT CHAT ENGINE ====================
async function handleChatSubmit(e) {
  e.preventDefault();
  const text = el.inputChatMessage.value.trim();
  if (!text || !activeResult) return;
  
  el.inputChatMessage.value = "";
  
  // Hide empty state
  if (el.chatEmptyState) {
    el.chatEmptyState.classList.add("hidden");
  }
  
  appendChatMessage("user", text);
  log(`[INT] SENT: "${text}"`);
  
  const apiKey = localStorage.getItem("groq_api_key");
  
  if (apiKey && apiKey.startsWith("gsk_")) {
    // Send direct client completion using llama-3.3-70b-versatile
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + apiKey
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: `You are a military OSINT chatbot safety operator. Give highly informative, operations-oriented safety assessments based on the target: ${JSON.stringify(activeResult)}. Maintain professional operational jargon.`
            },
            ...chatLogHistory.map(h => ({ role: h.role, content: h.content })),
            { role: "user", content: text }
          ],
          max_tokens: 150
        })
      });
      
      if (!response.ok) throw new Error("Chat api failed");
      const resJson = await response.json();
      const reply = resJson.choices[0].message.content;
      
      appendChatMessage("assistant", reply);
      log(`[INT] RECV: "${reply}"`);
      if (soundOn) AudioSynth.scanComplete();
    } catch (err) {
      triggerMockChatReply(text);
    }
  } else {
    // Local mock chat
    triggerMockChatReply(text);
  }
}

function triggerMockChatReply(text) {
  const fallbacks = {
    default: "Target parameters are within normal diagnostic thresholds. Maintain standard alert state.",
    weapon: "Operational guidelines recommend keeping a safe distance and alerting local security responders.",
    cat: "Object classified as domestic companion animal. Minimal hazard potential to residential environments."
  };
  
  let reply = fallbacks.default;
  const q = text.toLowerCase();
  if (q.includes("weapon") || q.includes("gun") || q.includes("danger") || q.includes("aircraft") || q.includes("jet")) {
    reply = fallbacks.weapon;
  } else if (q.includes("cat") || q.includes("pet") || q.includes("animal")) {
    reply = fallbacks.cat;
  }
  
  setTimeout(() => {
    appendChatMessage("assistant", reply);
    log(`[INT] RECV: "${reply}"`);
    if (soundOn) AudioSynth.scanComplete();
  }, 1000);
}

function appendChatMessage(role, content) {
  chatLogHistory.push({ role, content });
  
  const card = document.createElement("div");
  card.className = role === "user" ? 
    "p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 leading-relaxed font-mono" :
    "p-2.5 rounded-lg border border-white/5 bg-black/30 text-white/85 leading-relaxed font-mono";
    
  card.innerHTML = `<span class="font-bold opacity-40 uppercase mr-1.5">${role === "user" ? "CITIZEN" : "ASSISTANT"} &gt;</span>${content}`;
  
  el.chatMessagesContainer.appendChild(card);
  el.chatMessagesContainer.scrollTop = el.chatMessagesContainer.scrollHeight;
}

el.chatPromptForm.addEventListener("submit", handleChatSubmit);


// ==================== NATIVE VECTOR PDF EXPORTER ====================
async function exportVectorPDF() {
  if (!activeResult || !activeImageSrc) return;
  if (soundOn) AudioSynth.click();
  
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Background
  pdf.setFillColor(6, 10, 18);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");
  
  // Neon cyan border
  pdf.setDrawColor(0, 229, 255);
  pdf.setLineWidth(0.4);
  pdf.rect(8, 8, pageWidth - 16, pageHeight - 16);
  
  // Header title block
  pdf.setFillColor(12, 20, 36);
  pdf.rect(8, 8, pageWidth - 16, 25, "F");
  
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(0, 255, 136);
  pdf.text("PUBLIC SAFETY ASSESSMENT REPORT", pageWidth / 2, 17, { align: "center" });
  
  pdf.setFont("courier", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(0, 229, 255);
  pdf.text(`REFERENCE ID: ${activeResult.targetId}  |  STATUS: COMPLETE  |  ${new Date().toUTCString()}`, pageWidth / 2, 25, { align: "center" });
  
  let y = 38;
  
  // Grid column data details
  pdf.setFillColor(15, 23, 42);
  pdf.rect(12, y, pageWidth - 24, 38, "F");
  pdf.setDrawColor(255, 255, 255, 0.05);
  pdf.rect(12, y, pageWidth - 24, 38, "S");
  
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(150, 160, 180);
  pdf.text("CLASSIFICATION", 18, y + 8);
  pdf.text("ACCURACY INDEX", 90, y + 8);
  pdf.text("THREAT RATING", 145, y + 8);
  
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(255, 255, 255);
  pdf.text(activeResult.classification, 18, y + 15);
  pdf.text(activeResult.confidence, 90, y + 15);
  
  const isHigh = activeResult.threatLevel === "CRITICAL" || activeResult.threatLevel === "HIGH";
  pdf.setTextColor(isHigh ? 255 : 0, isHigh ? 68 : 255, isHigh ? 68 : 136);
  pdf.text(activeResult.threatLevel, 145, y + 15);
  
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(150, 160, 180);
  pdf.text("ORIGIN MATRIX", 18, y + 24);
  pdf.text("STANDOFF RADIUS", 90, y + 24);
  pdf.text("RADAR PROFILE", 145, y + 24);
  
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9.5);
  pdf.setTextColor(230, 235, 245);
  pdf.text(activeResult.origin || "Unknown", 18, y + 31);
  pdf.text(activeResult.safetyRadius || "0 meters - Safe", 90, y + 31);
  pdf.text(activeResult.radarCrossSection || "N/A", 145, y + 31);
  
  y += 46;
  
  // Diagnostic Summary
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(0, 229, 255);
  pdf.text("DIAGNOSTIC ANALYSIS SUMMARY", 12, y);
  pdf.setDrawColor(0, 229, 255, 0.2);
  pdf.line(12, y + 2, pageWidth - 12, y + 2);
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(220, 225, 235);
  const descLines = pdf.splitTextToSize(activeResult.description, pageWidth - 24);
  pdf.text(descLines, 12, y + 8);
  
  y += 8 + descLines.length * 5 + 8;
  
  // Potential & Capabilities
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(255, 136, 0);
  pdf.text("POTENTIAL HAZARDS & CAPABILITIES", 12, y);
  pdf.setDrawColor(255, 136, 0, 0.2);
  pdf.line(12, y + 2, pageWidth - 12, y + 2);
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);
  pdf.setTextColor(220, 225, 235);
  const potLines = pdf.splitTextToSize(activeResult.potential || "No outstanding capabilities mapped.", pageWidth - 24);
  pdf.text(potLines, 12, y + 8);
  
  y += 8 + potLines.length * 5 + 8;
  
  // Safety actions
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(0, 255, 136);
  pdf.text("PUBLIC SAFETY ACTION DIRECTIVES", 12, y);
  pdf.setDrawColor(0, 255, 136, 0.2);
  pdf.line(12, y + 2, pageWidth - 12, y + 2);
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);
  pdf.setTextColor(210, 215, 225);
  const recLines = pdf.splitTextToSize(`Recommendation: ${activeResult.recommendations}`, pageWidth - 24);
  pdf.text(recLines, 12, y + 8);
  
  y += 8 + recLines.length * 5 + 6;
  
  // Signatures
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(150, 160, 180);
  pdf.text("OPERATIONAL SIGNATURE REGISTER", 12, y);
  pdf.setDrawColor(255, 255, 255, 0.05);
  pdf.line(12, y + 2, pageWidth - 12, y + 2);
  
  let sigY = y + 8;
  activeResult.signatures.forEach((sig) => {
    pdf.setFont("courier", "bold");
    pdf.setFontSize(8.5);
    pdf.setTextColor(180, 190, 200);
    pdf.text(`> ${sig.name.padEnd(20, " ")}: ${sig.status}`, 16, sigY);
    sigY += 5.5;
  });
  
  // Brand footer
  pdf.setFillColor(12, 20, 36);
  pdf.rect(8, pageHeight - 17, pageWidth - 16, 9, "F");
  
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(0, 255, 136);
  pdf.text("PUBLIC THREAT CLASSIFIER • CERTIFIED SECURE OSINT NETWORK", pageWidth / 2, pageHeight - 11, { align: "center" });
  
  pdf.save(`Safety-Assessment-Report-${activeResult.targetId}.pdf`);
}

el.btnExportPdf.addEventListener("click", exportVectorPDF);


// ==================== SCAN HISTORY DRAWER REGISTRY ====================
function updateHistoryListUI() {
  if (historyRecords.length === 0) {
    el.historyListViewport.innerHTML = `<p class="text-center text-[10px] opacity-30 uppercase font-mono py-6">No previous logs indexed.</p>`;
    el.badgeLogsCount.classList.add("hidden");
    return;
  }
  
  el.badgeLogsCount.classList.remove("hidden");
  el.badgeLogsCount.textContent = historyRecords.length;
  
  el.historyListViewport.innerHTML = "";
  historyRecords.forEach((rec) => {
    const card = document.createElement("div");
    card.className = "flex items-center gap-3 p-2 bg-black/30 border border-white/5 hover:border-emerald-500/30 rounded-lg cursor-pointer transition-all";
    
    card.innerHTML = `
      <img src="${rec.thumbnail}" class="w-10 h-10 object-cover rounded border border-white/10 bg-black/60">
      <div class="flex-1 min-w-0">
        <h4 class="text-[10px] font-bold text-white uppercase truncate">${rec.classification}</h4>
        <p class="text-[8px] opacity-40 font-mono">${rec.timestamp}</p>
      </div>
      <span class="text-[8px] font-bold px-1.5 py-0.5 rounded border font-mono" style="border-color:${rec.threatColor}40; color:${rec.threatColor}">${rec.threatLevel}</span>
    `;
    
    card.addEventListener("click", () => {
      if (soundOn) AudioSynth.click();
      activeImageSrc = rec.thumbnail;
      
      // Load directly
      el.idleUploadViewport.classList.add("hidden");
      el.activeScannerView.classList.remove("hidden");
      
      el.loadedTargetImage.src = rec.thumbnail;
      el.badgeScanningIndicator.className = "w-1.5 h-1.5 rounded-full bg-[#00ff88]";
      el.badgeScanningText.textContent = "COMPLETE";
      el.progressBarContainer.classList.add("hidden");
      el.scanningLaserLine.classList.add("hidden");
      
      renderDiagnosticReport(rec);
      updateThemeLockState();
    });
    
    el.historyListViewport.appendChild(card);
  });
}

el.btnClearRegistry.addEventListener("click", () => {
  if (soundOn) AudioSynth.error();
  historyRecords = [];
  localStorage.setItem("osint_history", "[]");
  updateHistoryListUI();
  log("[SYS] SYSTEM LOG DATABASE TERMINATED.");
});


// ==================== DYNAMIC reset PROCEDURES ====================
function resetWorkspace() {
  if (soundOn) AudioSynth.click();
  activeImageSrc = null;
  activeFile = null;
  activeResult = null;
  
  el.activeScannerView.classList.add("hidden");
  el.idleUploadViewport.classList.remove("hidden");
  el.ocrExtractedCard.classList.add("hidden");
  el.ocrPayloadText.textContent = "";
  
  updateThemeLockState();
  log("[SYS] WORKSPACE FLUSHED. RE-ARMED AWAITING SCAN.");
}

el.btnResetScan.addEventListener("click", resetWorkspace);


// ==================== CLI COMMAND CONSOLE (Cyber Terminal) ====================
el.consoleCliForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const cmd = el.inputCliCommand.value.trim();
  el.inputCliCommand.value = "";
  if (!cmd) return;
  
  log(`[SYS] CMD: "${cmd}"`);
  
  if (cmd === "/reset") {
    resetWorkspace();
  } else if (cmd === "/export") {
    exportVectorPDF();
  } else if (cmd === "/scan") {
    el.inputTargetFile.click();
  } else {
    log(`[SYS] UNKNOWN COMMAND: "${cmd}". AVAIL: /scan, /export, /reset`);
  }
});


// ==================== INITIAL EVENT LISTENERS ====================
el.btnEnterScanner.addEventListener("click", () => {
  el.landingPage.classList.add("translate-y-[-100%]");
  el.scannerWorkspace.classList.remove("hidden");
  if (soundOn) AudioSynth.click();
});

el.btnBackHome.addEventListener("click", () => {
  el.landingPage.classList.remove("translate-y-[-100%]");
  if (soundOn) AudioSynth.click();
});

// Settings config buttons
el.btnOpenApiConfig.addEventListener("click", () => toggleConfigDrawer(true));
el.btnOpenSettings.addEventListener("click", () => toggleConfigDrawer(true));
el.btnCloseConfig.addEventListener("click", () => toggleConfigDrawer(false));
el.btnSaveConfig.addEventListener("click", saveConfig);
el.btnClearConfig.addEventListener("click", clearConfig);

// Toggle Key Visibility
el.btnToggleKeyVisibility.addEventListener("click", () => {
  const isPass = el.inputApiKey.type === "password";
  el.inputApiKey.type = isPass ? "text" : "password";
  el.btnToggleKeyVisibility.innerHTML = isPass ? `<i class="fa-solid fa-eye-slash"></i>` : `<i class="fa-solid fa-eye"></i>`;
});

// Sound toggler
el.btnToggleAudio.addEventListener("click", () => {
  soundOn = !soundOn;
  el.btnToggleAudio.textContent = soundOn ? "🔊" : "🔇";
  el.btnToggleAudio.style.opacity = soundOn ? "1.0" : "0.5";
});

// Logs toggle
el.btnToggleLogs.addEventListener("click", () => {
  const isHidden = el.historyRegistryDrawer.classList.contains("hidden");
  if (isHidden) {
    el.historyRegistryDrawer.classList.remove("hidden");
  } else {
    el.historyRegistryDrawer.classList.add("hidden");
  }
});

// Drag & drop triggers
el.dropzoneBox.addEventListener("dragover", (e) => {
  e.preventDefault();
  el.dropzoneBox.classList.add("border-emerald-500", "bg-emerald-500/5");
});

el.dropzoneBox.addEventListener("dragleave", () => {
  el.dropzoneBox.classList.remove("border-emerald-500", "bg-emerald-500/5");
});

el.dropzoneBox.addEventListener("drop", (e) => {
  e.preventDefault();
  el.dropzoneBox.classList.remove("border-emerald-500", "bg-emerald-500/5");
  const file = e.dataTransfer.files?.[0];
  if (file) processFile(file);
});

el.dropzoneBox.addEventListener("click", () => el.inputTargetFile.click());
el.inputTargetFile.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (file) processFile(file);
});

// Camera viewfinder buttons
el.btnCameraTrigger.addEventListener("click", startWebcam);
el.btnCameraCapture.addEventListener("click", captureWebcamFrame);
el.btnCameraAbort.addEventListener("click", stopWebcam);


// ==================== SYSTEM INIT LOADERS ====================
window.addEventListener("DOMContentLoaded", () => {
  // Load config keys
  loadConfig();
  
  // Load history records
  try {
    historyRecords = JSON.parse(localStorage.getItem("osint_history") || "[]");
  } catch {
    historyRecords = [];
  }
  updateHistoryListUI();
  
  // Set default theme UI
  updateThemeUI();
  updateThemeLockState();
  
  log("[SYS] TARGET SYSTEM MATRIX ONLINE.");
  log("[SYS] DRAG A PHOTO OR LAUNCH OPTICAL DETECTS.");
});

// Scanner message streams
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
