# OSINT Tactical Scanner — Portable HTML/CSS/JS Edition

This folder contains a **100% self-contained, portable, zero-install** version of the **OSINT Tactical Scanner (v3.8.0)** web application built using **Vanilla HTML5, Tailwind CSS, and plain JavaScript**.

It delivers identical visual aesthetics, rich micro-animations, sounds, camera access, and AI integrations without requiring `Node.js`, `npm`, or any terminal setup!

---

## 🚀 Quick Start (Instant Run)

1. Open this folder: `c:\Users\Hamza\Desktop\application\vanilla`.
2. Double-click the **`index.html`** file in your local file explorer!
3. The application will instantly load and run in your default web browser (Chrome, Edge, Firefox, or Safari).
4. *No server, compilation, or local background command required!*

---

## 🌟 Portable Features & Capabilities

* **Dual Interface Modes**: Decoupled visual styles matching the Next.js React app:
  * **Civilian Mode**: Sans-serif, bright emerald public alerts, dynamic Circular Safety Rating SVG gauges.
  * **Tactical Mode**: Monospace grid backgrounds, cyber overlays, real-time satellite orbital coordinates tracking, and CRT scanlines.
* **🔒 Mode Switch Locks**: Automatically locks and hides visual switch toggles once a target is actively scanning/loaded to prevent graphic overlap.
* **📷 Integrated Live Viewfinder Camera**: Connects directly to local webcams or mobile camera streams using native `getUserMedia` APIs, rendering pulsing radar crosshairs, capture sweeps, and target capture triggers.
* **💬 Dynamic LLaMA Interrogations**:
  * If a **Groq API Key** is entered in Settings, the app calls the live Groq completions endpoint directly from the browser!
  * If offline/no key is entered, a highly descriptive local diagnostic generator and chatbot fallback simulates realistic threat evaluations (cat tabby, military jets, knives, army personnel) for demonstrations.
* **🎵 Native Synth sound engine**: High-fidelity interface clicks, scanning hums, warning bells, sirens, and error buzzers synthesized using the web's native **Web Audio API** oscillators.
* **📄 Vector PDF Exporter**: Leverages client-side native `jsPDF` coordinate drawing to assemble beautiful, high-resolution dossiers including target images, standoff safety radii, radar RCS profiles, and hazard descriptions.
* **🔍 OCR Text Extractor**: Integrates client-side OCR via `Tesseract.js` inside the browser to decrypt and display printed text inside an active overlay card.
* **📋 Scan Registry logs**: Persistent logging histories backed by browser `localStorage`.
* **💻 Command CLI Console**: Activates command inputs in Tactical HUD:
  * `/scan`: Triggers local target picture browser select drawer.
  * `/export`: Instantly compiles and downloads the PDF dossier.
  * `/reset`: Restores idle workspace coordinates.

---

## 🛠️ Folder File Mapping

* **`index.html`**: Structured tags, sliding Configuration Settings Drawer, grid columns, video streams, and CDN libraries.
* **`style.css`**: Pulsing radar loops, custom cyber grid matrices, dynamic CRT scanlines, glassmorphic filters, and mesh background gradients.
* **`app.js`**: Core program logic, sound synthesizers, canvas frames, Groq completions, and PDF layouts.

---

## 🌍 Instant Hosting & Sharing

Since this version consists of entirely static client-side files, you can deploy it publicly in under 10 seconds:
1. **GitHub Pages**: Upload this folder to a GitHub repository, enable Pages, and share the live link!
2. **Netlify / Vercel**: Drag and drop this folder directly into the Netlify dropzone.
3. **Local Share**: Simply zip the directory and send it to judges, classmates, or instructors for direct browser previewing!
