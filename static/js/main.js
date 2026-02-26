/* ============================================================
   HealthyHen — Main Page JS
   · Drag & drop with preview
   · Confirmation modal + warning sound
   · Submits form to Flask POST /
   · Auto-scrolls to results after POST
   · Saves results + probabilities to localStorage
   · Polls /gradcam for heatmap after prediction
   ============================================================ */

const CLASS_COLORS = {
  Coccidiosis: "#FF6B35",
  Healthy: "#2ECC71",
  "Newcastle Disease": "#E74C3C",
  Salmonella: "#F39C12",
};
const STORAGE_KEY = "healthyhen_history";

/* ── DOM refs ─────────────────────────────────────────── */
const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const browseBtn = document.getElementById("browseBtn");
const changeBtn = document.getElementById("changeBtn");
const analyzeBtn = document.getElementById("analyzeBtn");
const analyzeLoader = document.getElementById("analyzeLoader");
const analyzeText = document.querySelector(".analyze-text");
const previewState = document.getElementById("previewState");
const previewImg = document.getElementById("previewImg");

let currentFile = null;

/* ── Drag & Drop ─────────────────────────────────────── */
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("drag-over");
});
dropZone.addEventListener("dragleave", () =>
  dropZone.classList.remove("drag-over"),
);
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("drag-over");
  const f = e.dataTransfer.files[0];
  if (f && f.type.startsWith("image/")) handleFile(f);
});
dropZone.addEventListener("click", (e) => {
  if (e.target !== changeBtn) fileInput.click();
});
browseBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  fileInput.click();
});
if (changeBtn)
  changeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    fileInput.click();
  });
fileInput.addEventListener("change", () => {
  if (fileInput.files[0]) handleFile(fileInput.files[0]);
});

function handleFile(file) {
  currentFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src = e.target.result;
    previewState.style.display = "flex";
    const inner = dropZone.querySelector(".upload-inner");
    if (inner) inner.style.display = "none";
    analyzeBtn.disabled = false;
  };
  reader.readAsDataURL(file);
}

/* ── Warning Sound ───────────────────────────────────── */
function playWarningSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const beep = (freq, t, dur, vol = 0.4) => {
      const osc = ctx.createOscillator(),
        gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.start(t);
      osc.stop(t + dur);
    };
    const t = ctx.currentTime;
    beep(880, t, 0.18);
    beep(660, t + 0.22, 0.18);
    beep(440, t + 0.44, 0.35);
  } catch (e) {}
}

/* ── Confirmation Modal ──────────────────────────────── */
function showConfirmModal() {
  return new Promise((resolve) => {
    playWarningSound();
    const overlay = document.createElement("div");
    overlay.style.cssText =
      "position:fixed;inset:0;z-index:2000;background:rgba(6,10,15,.85);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;animation:overlayFade .2s ease";
    overlay.innerHTML = `
      <div style="background:#0d1520;border:1px solid rgba(100,200,255,.18);border-top:1px solid rgba(100,200,255,.3);border-radius:16px;padding:2rem 1.8rem 1.6rem;max-width:390px;width:90%;text-align:center;animation:boxPop .28s cubic-bezier(.34,1.56,.64,1)">
        <div style="width:52px;height:52px;border-radius:13px;margin:0 auto 1rem;background:rgba(255,183,0,.07);border:1px solid rgba(255,183,0,.2);display:flex;align-items:center;justify-content:center">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" fill="rgba(255,183,0,.12)" stroke="#ffb700" stroke-width="1.5" stroke-linejoin="round"/>
            <line x1="12" y1="9" x2="12" y2="13" stroke="#ffb700" stroke-width="1.8" stroke-linecap="round"/>
            <circle cx="12" cy="17" r="1" fill="#ffb700"/>
          </svg>
        </div>
        <div style="font-family:'DM Mono',monospace;font-size:.62rem;letter-spacing:.13em;text-transform:uppercase;color:#ffb700;margin-bottom:.4rem">⚠ Confirmation Required</div>
        <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:1.1rem;color:#e8f4ff;margin-bottom:.55rem">Is this a poultry fecal sample?</div>
        <div style="font-size:.82rem;color:#6a8aaa;line-height:1.65;margin-bottom:1.35rem">This classifier only works on <strong style="color:#e8f4ff">chicken dung images</strong>.<br/>Unrelated photos will give unreliable results.</div>
        <div style="display:flex;gap:.6rem">
          <button id="confirmYes" style="flex:1;padding:.62rem 1rem;border-radius:10px;background:rgba(0,212,255,.1);border:1px solid rgba(0,212,255,.3);color:#00d4ff;font-family:'DM Mono',monospace;font-size:.76rem;cursor:pointer">✓ Yes, it's dung</button>
          <button id="confirmNo" style="flex:1;padding:.62rem 1rem;border-radius:10px;border:1px solid rgba(100,200,255,.1);background:rgba(255,255,255,.03);color:#6a8aaa;font-family:'DM Mono',monospace;font-size:.76rem;cursor:pointer">↩ Go Back</button>
        </div>
        <div style="margin-top:.9rem;font-size:.65rem;color:rgba(100,200,255,.3);font-family:'DM Mono',monospace">// clear · close-up · well-lit photo works best</div>
      </div>`;
    document.body.appendChild(overlay);
    const cleanup = (r) => {
      overlay.remove();
      resolve(r);
    };
    document.getElementById("confirmYes").onclick = () => cleanup(true);
    document.getElementById("confirmNo").onclick = () => cleanup(false);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) cleanup(false);
    });
  });
}

/* ── Save to localStorage ────────────────────────────── */
function saveToHistory(
  prediction,
  confidence,
  imagePath,
  imageFilename,
  probabilities,
) {
  try {
    const records = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    records.unshift({
      id: Date.now(),
      prediction,
      confidence: parseFloat(confidence),
      imagePath,
      imageFilename,
      probabilities: probabilities || {},
      timestamp: new Date().toISOString(),
    });
    if (records.length > 50) records.splice(50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.warn("History save failed:", e);
  }
}

/* ── Poll Grad-CAM from Flask ────────────────────────── */
function pollGradcam(filename, attempts) {
  if (attempts > 60) return;
  fetch("/gradcam?filename=" + encodeURIComponent(filename))
    .then((r) => r.json())
    .then((data) => {
      if (data.gradcam) {
        const loading = document.getElementById("gradcamLoading");
        const img = document.getElementById("gradcamImg");
        if (loading) loading.style.display = "none";
        if (img) {
          img.src = "data:image/png;base64," + data.gradcam;
          img.style.display = "block";
        }
      } else {
        setTimeout(() => pollGradcam(filename, attempts + 1), 1500);
      }
    })
    .catch(() => setTimeout(() => pollGradcam(filename, attempts + 1), 2000));
}

/* ── Analyze button ──────────────────────────────────── */
analyzeBtn.addEventListener("click", async () => {
  if (!currentFile) return;
  const confirmed = await showConfirmModal();
  if (!confirmed) return;
  if (analyzeText) analyzeText.style.display = "none";
  if (analyzeLoader) analyzeLoader.style.display = "flex";
  analyzeBtn.disabled = true;

  const form = document.createElement("form");
  form.method = "POST";
  form.action = "/";
  form.enctype = "multipart/form-data";
  form.style.display = "none";
  const inp = document.createElement("input");
  inp.type = "file";
  inp.name = "file";
  const dt = new DataTransfer();
  dt.items.add(currentFile);
  inp.files = dt.files;
  form.appendChild(inp);
  document.body.appendChild(form);
  form.submit();
});

/* ── On DOMContentLoaded: handle post-result state ────── */
document.addEventListener("DOMContentLoaded", () => {
  const HH = window.HH || {};

  /* 1. Auto-scroll to results if prediction is present */
  if (HH.hasPrediction) {
    const anchor = document.getElementById("resultsAnchor");
    if (anchor) {
      setTimeout(
        () => anchor.scrollIntoView({ behavior: "smooth", block: "start" }),
        200,
      );
    }
  }

  /* 2. Save result to history */
  if (HH.hasPrediction && HH.prediction && HH.confidence !== null) {
    saveToHistory(
      HH.prediction,
      HH.confidence,
      HH.imagePath,
      HH.imageFilename,
      HH.probabilities,
    );
  }

  /* 3. Start Grad-CAM polling */
  if (HH.hasPrediction && HH.imageFilename) {
    pollGradcam(HH.imageFilename, 0);
  }

  /* 4. New analysis button */
  const newBtn = document.getElementById("newBtn");
  if (newBtn)
    newBtn.addEventListener("click", () => {
      window.location.href = "/";
    });
});
