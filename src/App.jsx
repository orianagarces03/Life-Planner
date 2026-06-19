import { useState, useEffect, useCallback, useRef } from "react";

// ─── DEFAULT THEME ───────────────────────────────────────────────
const DEFAULT_THEME = {
  accent: "#c8f55a",
  bg: "#0f0f13",
  surface: "#18181f",
  card: "#1c1c25",
  border: "#2a2a35",
  text: "#eeeef2",
  muted: "#7f7f95",
  headingFont: "Syne",
  bodyFont: "Inter",
  darkMode: true,
  fontScale: 1,
};

const LIGHT_OVERRIDES = {
  bg: "#f4f4f8",
  surface: "#ffffff",
  card: "#f9f9fc",
  border: "#e0e0ea",
  text: "#18181f",
  muted: "#7f7f95",
};

const FONT_PAIRS = [
  { label: "Syne + Inter", heading: "Syne", body: "Inter" },
  { label: "Playfair + Lato", heading: "Playfair Display", body: "Lato" },
  { label: "Space Grotesk + DM Sans", heading: "Space Grotesk", body: "DM Sans" },
  { label: "Bebas Neue + Nunito", heading: "Bebas Neue", body: "Nunito" },
  { label: "Fraunces + Source Sans 3", heading: "Fraunces", body: "Source Sans 3" },
  { label: "Outfit (both)", heading: "Outfit", body: "Outfit" },
];

const ACCENT_PRESETS = [
  { label: "Lime", value: "#c8f55a" },
  { label: "Violet", value: "#7c6cfc" },
  { label: "Coral", value: "#ff7a5c" },
  { label: "Cyan", value: "#5ce1ff" },
  { label: "Amber", value: "#f5c842" },
  { label: "Pink", value: "#fd79a8" },
  { label: "Mint", value: "#55efc4" },
  { label: "Orange", value: "#ff9f43" },
];

const FONT_SIZES = [
  { label: "Small", value: 0.88 },
  { label: "Default", value: 1 },
  { label: "Large", value: 1.15 },
  { label: "Extra Large", value: 1.3 },
];

// Default sticker emoji choices the user can drop onto the screen
const DEFAULT_STICKERS = ["🌱","☕","🌸","⭐","🎧","📌","🐱","🌙","💫","🍃","🧡","✨"];

// ─── DEFAULT CATEGORIES ──────────────────────────────────────────
const DEFAULT_CATEGORIES = {
  workout:  { label: "Workout",          color: "#c8f55a", emoji: "💪" },
  medical:  { label: "Medical",          color: "#ff7a5c", emoji: "🏥" },
  travel:   { label: "Travel",           color: "#7c6cfc", emoji: "✈️" },
  task:     { label: "Task / Study",     color: "#5ce1ff", emoji: "📚" },
  tasks:    { label: "Tasks",            color: "#f5c842", emoji: "✅" },
  freelance:{ label: "Freelance",        color: "#ff9f43", emoji: "💼" },
  project:  { label: "Personal Project", color: "#a29bfe", emoji: "🚀" },
  family:   { label: "Family",           color: "#fd79a8", emoji: "🏠" },
  friends:  { label: "Friends",          color: "#55efc4", emoji: "🎉" },
  other:    { label: "Other",            color: "#b2bec3", emoji: "📌" },
};

// ─── COLOMBIAN PUBLIC HOLIDAYS ───────────────────────────────────
// Includes 2025 and 2026. Many are moved to Monday under Ley Emiliani.
const CO_HOLIDAYS = {
  // 2025
  "2025-01-01": "🎆 Año Nuevo",
  "2025-01-06": "👑 Día de Reyes",
  "2025-03-24": "⚜️ Día de San José",
  "2025-04-17": "✝️ Jueves Santo",
  "2025-04-18": "✝️ Viernes Santo",
  "2025-05-01": "👷 Día del Trabajo",
  "2025-06-02": "✝️ Ascensión del Señor",
  "2025-06-23": "✝️ Corpus Christi",
  "2025-06-30": "⚜️ Sagrado Corazón",
  "2025-07-07": "🏛️ San Pedro y San Pablo",
  "2025-07-20": "🇨🇴 Día de la Independencia",
  "2025-08-07": "⚔️ Batalla de Boyacá",
  "2025-08-18": "🙏 Asunción de la Virgen",
  "2025-10-13": "🌎 Día de la Raza",
  "2025-11-03": "🕊️ Todos los Santos",
  "2025-11-17": "🗡️ Independencia de Cartagena",
  "2025-12-08": "🌟 Inmaculada Concepción",
  "2025-12-25": "🎄 Navidad",
  // 2026
  "2026-01-01": "🎆 Año Nuevo",
  "2026-01-12": "👑 Día de Reyes",
  "2026-03-23": "⚜️ Día de San José",
  "2026-04-02": "✝️ Jueves Santo",
  "2026-04-03": "✝️ Viernes Santo",
  "2026-05-01": "👷 Día del Trabajo",
  "2026-05-18": "✝️ Ascensión del Señor",
  "2026-06-08": "✝️ Corpus Christi",
  "2026-06-15": "⚜️ Sagrado Corazón",
  "2026-06-29": "🏛️ San Pedro y San Pablo",
  "2026-07-20": "🇨🇴 Día de la Independencia",
  "2026-08-07": "⚔️ Batalla de Boyacá",
  "2026-08-17": "🙏 Asunción de la Virgen",
  "2026-10-12": "🌎 Día de la Raza",
  "2026-11-02": "🕊️ Todos los Santos",
  "2026-11-16": "🗡️ Independencia de Cartagena",
  "2026-12-08": "🌟 Inmaculada Concepción",
  "2026-12-25": "🎄 Navidad",
};

function catBg(color) {
  return color + "22";
}

// Returns '#000000' or '#ffffff' depending on which gives better contrast against the given hex color
function getContrastColor(hex) {
  if (!hex || hex.length < 7) return "#000000";
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  // Relative luminance (perceived brightness)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#000000" : "#ffffff";
}

const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const today  = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

function getDaysInMonth(y,m){ return new Date(y,m+1,0).getDate(); }
function getFirstDay(y,m){ return new Date(y,m,1).getDay(); }

function gcalToLocal(e) {
  const date = e.start?.date || e.start?.dateTime?.slice(0,10);
  const note = e.description || (e.start?.dateTime ? e.start.dateTime.slice(11,16) : "");
  return { id: e.id, date, title: e.summary || "(No title)", category: "other", note, fromGcal: true };
}

async function callClaude(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6", max_tokens: 1000,
      mcp_servers: [{ type: "url", url: "https://calendar.googleapis.com/mcp/v1", name: "google-calendar" }],
      messages: [{ role: "user", content: prompt }],
    }),
  });
  return res.json();
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────
export default function LifePlanner() {
  const [year, setYear]           = useState(today.getFullYear());
  const [month, setMonth]         = useState(today.getMonth());
  const [localEvents, setLocal]   = useState([]);
  const [gcalEvents, setGcal]     = useState([]);
  const [selected, setSelected]   = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDayPanel, setShowDayPanel] = useState(false);
  const [form, setForm]           = useState({ title:"", category:"workout", note:"", time:"" });
  const [view, setView]           = useState("calendar");
  const [filterCat, setFilter]    = useState("all");
  const [gcalLoading, setGcalLoading] = useState(false);
  const [gcalStatus, setGcalStatus]   = useState(null);
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab]   = useState("theme");
  const [colorPickerCtx, setColorPickerCtx] = useState(null); // { type: 'accent'|'category'|'note', key }
  const [stickers, setStickers] = useState([]); // {id, emoji or imgSrc, x, y}
  const [notes, setNotes] = useState([]); // {id, text, x, y, date}
  const [openNoteId, setOpenNoteId] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [draggingId, setDraggingId] = useState(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // ── Theme & categories state ──
  const [theme, setTheme]   = useState(DEFAULT_THEME);
  const [cats, setCats]     = useState(DEFAULT_CATEGORIES);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [splashFading, setSplashFading] = useState(false);

  // Load saved theme + category settings on first mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('planner-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.theme) setTheme(t => ({ ...t, ...parsed.theme }));
        if (parsed.cats) setCats(c => ({ ...c, ...parsed.cats }));
        if (parsed.stickers) setStickers(parsed.stickers);
        if (parsed.notes) setNotes(parsed.notes);
      }
    } catch {
      // no saved settings yet, or corrupted — defaults stay
    } finally {
      setSettingsLoaded(true);
    }
  }, []);

  // Save theme + category + sticker + note settings whenever they change (after initial load)
  useEffect(() => {
    if (!settingsLoaded) return;
    try {
      localStorage.setItem('planner-settings', JSON.stringify({ theme, cats, stickers, notes }));
    } catch {
      // storage full or blocked; not critical to block UI
    }
  }, [theme, cats, stickers, notes, settingsLoaded]);

  // Show splash every time the app opens
  useEffect(() => {
    setShowSplash(true);
    const fadeTimer = setTimeout(() => setSplashFading(true), 1400);
    const removeTimer = setTimeout(() => setShowSplash(false), 1900);
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
  }, []);

  const [customHeading, setCustomHeading] = useState("");
  const [customBody, setCustomBody]       = useState("");

  // Resolved theme (merge dark/light)
  const T = theme.darkMode ? theme : { ...theme, ...LIGHT_OVERRIDES };

  // Reliably load the selected Google Fonts by injecting/updating a <link> in document.head.
  // This is more dependable than a <link> rendered inline in JSX, which browsers can
  // silently ignore on re-render when only the href changes.
  useEffect(() => {
    const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(T.headingFont)}:wght@400;500;600;700;800&family=${encodeURIComponent(T.bodyFont)}:wght@300;400;500;600&display=swap`;
    let link = document.getElementById('planner-google-font');
    if (!link) {
      link = document.createElement('link');
      link.id = 'planner-google-font';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    if (link.href !== fontUrl) {
      link.href = fontUrl;
    }
  }, [T.headingFont, T.bodyFont]);

  function showToast(msg, type="ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  // ── GCal load ──
  const loadGcal = useCallback(async () => {
    setGcalLoading(true); setGcalStatus(null);
    try {
      const tMin = new Date(year,month,1).toISOString();
      const tMax = new Date(year,month+1,0,23,59,59).toISOString();
      const data = await callClaude(`Use the Google Calendar MCP to list all events between ${tMin} and ${tMax} from the user's primary calendar. Return ONLY a raw JSON array with fields: id, summary, start, description. No markdown.`);
      const raw = data.content?.find(b=>b.type==="mcp_tool_result")?.content?.[0]?.text
               || data.content?.find(b=>b.type==="text")?.text || "[]";
      let arr = [];
      try { const c = raw.replace(/```json|```/g,"").trim(); arr = JSON.parse(c); if (!Array.isArray(arr)) arr = arr.items||[]; }
      catch { const m = raw.match(/\[[\s\S]*\]/); if (m) try { arr=JSON.parse(m[0]); } catch {} }
      setGcal(arr.map(gcalToLocal).filter(e=>e.date));
      setGcalStatus("ok");
    } catch { setGcalStatus("error"); showToast("Couldn't load Google Calendar","error"); }
    finally { setGcalLoading(false); }
  }, [year, month]);

  useEffect(() => { loadGcal(); }, [loadGcal]);

  const allEvents = [...localEvents, ...gcalEvents.filter(gc=>!localEvents.some(le=>le.id===gc.id))];

  function dateStr(d) { return `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`; }
  function eventsForDay(d) { return allEvents.filter(e=>e.date===dateStr(d)); }

  function openDay(d) {
    setSelected(d);
    setForm({title:"",category:"workout",note:"",time:""});
    setShowDayPanel(true);
    setShowModal(false);
  }
  function openAdd(d) {
    setSelected(d);
    setForm({title:"",category:"workout",note:"",time:""});
    setShowModal(true);
    setShowDayPanel(false);
  }

  async function saveEvent() {
    if (!form.title.trim()) return;
    setSaving(true);
    const date = dateStr(selected);
    const ev = { id:`local-${Date.now()}`, date, ...form, fromGcal:false };
    setLocal(p=>[...p,ev]); setShowModal(false); setShowDayPanel(false);
    try {
      const dt = form.time ? `${date}T${form.time}:00` : null;
      const isFamily = form.category === "family";
      const reminderMinutes = isFamily ? 2880 : 120; // 2 days vs 2 hours before
      const reminderLabel = isFamily ? "2 days before" : "2 hours before";
      const prompt = dt
        ? `Use Google Calendar MCP to create event "${form.title}" starting ${dt} (1hr) with description "${form.note||""} | Category: ${cats[form.category]?.label}". Set a popup notification reminder ${reminderMinutes} minutes before the event start (${reminderLabel}), overriding any default reminders. Return event id only.`
        : `Use Google Calendar MCP to create all-day event "${form.title}" on ${date} with description "${form.note||""} | Category: ${cats[form.category]?.label}". Set a popup notification reminder ${reminderMinutes} minutes before the event start (${reminderLabel}), overriding any default reminders. Return event id only.`;
      const data = await callClaude(prompt);
      const id = data.content?.find(b=>b.type==="text")?.text?.trim().replace(/"/g,"");
      if (id && id.length>5) setLocal(p=>p.map(e=>e.id===ev.id?{...e,id,fromGcal:true}:e));
      showToast(`Saved · reminder set ${reminderLabel} ✓`);
    } catch { showToast("Saved locally (sync failed)","warn"); }
    finally { setSaving(false); }
  }

  async function deleteEvent(ev) {
    setLocal(p=>p.filter(e=>e.id!==ev.id)); setGcal(p=>p.filter(e=>e.id!==ev.id));
    if (ev.fromGcal) {
      try { await callClaude(`Use Google Calendar MCP to delete event id "${ev.id}" from primary calendar.`); showToast("Removed from Google Calendar ✓"); }
      catch { showToast("Removed locally (sync failed)","warn"); }
    }
  }

  function prevMonth() { if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); }
  function nextMonth() { if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); }

  // ── Sticker handlers ──
  function addSticker(content, isImage=false) {
    const id = `sticker-${Date.now()}`;
    setStickers(prev => [...prev, {
      id,
      content,
      isImage,
      x: 50 + Math.random() * 30, // vw-ish start position (percentage based)
      y: 30 + Math.random() * 30,
      scale: 1,
    }]);
  }

  function removeSticker(id) {
    setStickers(prev => prev.filter(s => s.id !== id));
  }

  function handleStickerPointerDown(e, sticker) {
    e.preventDefault();
    e.stopPropagation();
    const touches = e.touches;
    if (touches && touches.length === 2) {
      // Pinch start — record initial distance and sticker's current scale
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      dragOffset.current.pinchStartDist = Math.hypot(dx, dy);
      dragOffset.current.pinchStartScale = sticker.scale || 1;
      dragOffset.current.pinching = true;
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const clientX = e.clientX ?? touches?.[0]?.clientX ?? 0;
      const clientY = e.clientY ?? touches?.[0]?.clientY ?? 0;
      dragOffset.current = {
        offsetX: clientX - rect.left,
        offsetY: clientY - rect.top,
        pinching: false,
      };
    }
    setDraggingId(sticker.id);
  }

  function handlePointerMove(e) {
    if (!draggingId) return;
    const touches = e.touches;
    const isNoteDrag = typeof draggingId === "string" && draggingId.startsWith("note-");

    if (isNoteDrag) {
      const noteId = draggingId.replace("note-", "");

      // Two fingers on the note → resize, ignore position changes
      if (touches && touches.length === 2) {
        if (!dragOffset.current.pinching) {
          const dx0 = touches[0].clientX - touches[1].clientX;
          const dy0 = touches[0].clientY - touches[1].clientY;
          dragOffset.current.pinchStartDist = Math.hypot(dx0, dy0);
          dragOffset.current.pinchStartScale = notes.find(n=>n.id===noteId)?.scale || 1;
          dragOffset.current.pinching = true;
          dragOffset.current.moved = true;
        }
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const ratio = dist / (dragOffset.current.pinchStartDist || dist);
        const newScale = Math.max(0.5, Math.min(2.5, dragOffset.current.pinchStartScale * ratio));
        setNotes(prev => prev.map(n => n.id === noteId ? { ...n, scale: newScale } : n));
        return;
      }

      // Single finger → drag position (skip a beat right after releasing second finger)
      if (dragOffset.current.pinching) return;
      const clientX = e.clientX ?? touches?.[0]?.clientX;
      const clientY = e.clientY ?? touches?.[0]?.clientY;
      if (clientX == null) return;
      // Mark as moved once it exceeds a small threshold, so a simple tap still opens the note
      const dx = clientX - (dragOffset.current.startX ?? clientX);
      const dy = clientY - (dragOffset.current.startY ?? clientY);
      if (Math.hypot(dx, dy) > 6) dragOffset.current.moved = true;
      const xPct = ((clientX - dragOffset.current.offsetX) / window.innerWidth) * 100;
      const yPct = ((clientY - dragOffset.current.offsetY) / window.innerHeight) * 100;
      setNotes(prev => prev.map(n => n.id === noteId
        ? { ...n, x: Math.max(0, Math.min(80, xPct)), y: Math.max(0, Math.min(88, yPct)) }
        : n
      ));
      return;
    }

    // Two fingers on the sticker → resize, ignore position changes
    if (touches && touches.length === 2) {
      if (!dragOffset.current.pinching) {
        const dx0 = touches[0].clientX - touches[1].clientX;
        const dy0 = touches[0].clientY - touches[1].clientY;
        dragOffset.current.pinchStartDist = Math.hypot(dx0, dy0);
        dragOffset.current.pinchStartScale = stickers.find(s=>s.id===draggingId)?.scale || 1;
        dragOffset.current.pinching = true;
      }
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const ratio = dist / (dragOffset.current.pinchStartDist || dist);
      const newScale = Math.max(0.4, Math.min(3, dragOffset.current.pinchStartScale * ratio));
      setStickers(prev => prev.map(s => s.id === draggingId ? { ...s, scale: newScale } : s));
      return;
    }

    // Single finger / mouse → drag position
    if (dragOffset.current.pinching) return; // just released second finger, skip a beat
    const clientX = e.clientX ?? touches?.[0]?.clientX;
    const clientY = e.clientY ?? touches?.[0]?.clientY;
    if (clientX == null) return;
    const xPct = ((clientX - dragOffset.current.offsetX) / window.innerWidth) * 100;
    const yPct = ((clientY - dragOffset.current.offsetY) / window.innerHeight) * 100;
    setStickers(prev => prev.map(s => s.id === draggingId
      ? { ...s, x: Math.max(0, Math.min(92, xPct)), y: Math.max(0, Math.min(94, yPct)) }
      : s
    ));
  }

  function handlePointerUp(e) {
    // If one finger lifted but one remains (mid pinch→drag transition), reset offset and keep dragging
    if (e?.touches && e.touches.length === 1 && draggingId) {
      const rect = e.target?.getBoundingClientRect?.() || { left: 0, top: 0 };
      dragOffset.current = {
        ...dragOffset.current,
        offsetX: e.touches[0].clientX - rect.left,
        offsetY: e.touches[0].clientY - rect.top,
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        pinching: false,
      };
      return;
    }

    // Note drag/pinch release — open the editor only if it was a tap (didn't move or resize)
    if (typeof draggingId === "string" && draggingId.startsWith("note-")) {
      const noteId = draggingId.replace("note-", "");
      if (!dragOffset.current.moved) {
        const note = notes.find(n => n.id === noteId);
        if (note) openNote(note);
      }
      setDraggingId(null);
      dragOffset.current = {};
      return;
    }

    setDraggingId(null);
    dragOffset.current = {};
  }

  function handleStickerImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => addSticker(reader.result, true);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  // ── Sticky note handlers ──
  function addNote() {
    const id = `note-${Date.now()}`;
    const newNote = {
      id,
      text: "",
      color: theme.accent,
      date: todayStr,
      x: 8 + Math.random() * 55,
      y: 8 + Math.random() * 55,
      scale: 1,
    };
    setNotes(prev => [...prev, newNote]);
    setOpenNoteId(id);
    setNoteDraft("");
  }

  function openNote(note) {
    setOpenNoteId(note.id);
    setNoteDraft(note.text);
  }

  function closeNote() {
    if (openNoteId) {
      setNotes(prev => prev.map(n => n.id === openNoteId
        ? { ...n, text: noteDraft, date: noteDraft.trim() ? (n.text.trim() ? n.date : todayStr) : n.date }
        : n
      ).filter(n => n.id !== openNoteId || noteDraft.trim() !== "" || n.text.trim() !== ""));
    }
    setOpenNoteId(null);
    setNoteDraft("");
  }

  function deleteNote(id) {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (openNoteId === id) { setOpenNoteId(null); setNoteDraft(""); }
  }

  function handleNotePointerDown(e, note) {
    e.stopPropagation();
    const touches = e.touches;
    if (touches && touches.length === 2) {
      // Pinch start — record initial distance and note's current scale
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      dragOffset.current = {
        pinchStartDist: Math.hypot(dx, dy),
        pinchStartScale: note.scale || 1,
        pinching: true,
        moved: true, // a pinch should never trigger the tap-to-open behavior
      };
      setDraggingId(`note-${note.id}`);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX ?? touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? touches?.[0]?.clientY ?? 0;
    dragOffset.current = {
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top,
      startX: clientX,
      startY: clientY,
      moved: false,
      pinching: false,
    };
    setDraggingId(`note-${note.id}`);
  }

  const upcoming = [...allEvents]
    .filter(e=>e.date>=todayStr&&(filterCat==="all"||e.category===filterCat))
    .sort((a,b)=>a.date.localeCompare(b.date)).slice(0,30);

  const daysInMonth = getDaysInMonth(year,month);
  const firstDay    = getFirstDay(year,month);

  // ── Styles ──
  const s = {
    root:      { minHeight:"100dvh", background:T.bg, color:T.text, fontFamily:`'${T.bodyFont}', sans-serif`, fontWeight:300, padding:"1.5rem 1rem 4rem", transition:"background 0.3s, color 0.3s", fontSize:`${(T.fontScale||1)*16}px` },
    wrap:      { maxWidth:680, margin:"0 auto" },
    eyebrow:   { fontSize:"0.68rem", letterSpacing:"0.18em", textTransform:"uppercase", color:T.accent, marginBottom:"0.4rem" },
    h1:        { fontFamily:`'${T.headingFont}', sans-serif`, fontSize:"clamp(1.6rem,5vw,2.4rem)", fontWeight:800, letterSpacing:"-0.02em", lineHeight:1.1 },
    topBar:    { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1.25rem" },
    settingsBtn:{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:7, color:T.muted, padding:"0.25rem 0.5rem", cursor:"pointer", fontSize:"0.7rem", marginTop:"0.2rem" },
    statusBar: (st)=>({ display:"flex", alignItems:"center", gap:"0.5rem", background: st==="ok"?"rgba(85,239,196,0.08)":st==="error"?"rgba(255,122,92,0.08)":"rgba(200,245,90,0.06)", border:`1px solid ${st==="ok"?"rgba(85,239,196,0.2)":st==="error"?"rgba(255,122,92,0.2)":"rgba(200,245,90,0.15)"}`, borderRadius:8, padding:"0.45rem 0.75rem", fontSize:"0.78rem", color:st==="ok"?"#55efc4":st==="error"?"#ff7a5c":T.accent, marginBottom:"1rem" }),
    tabs:      { display:"flex", gap:"0.5rem", marginBottom:"1.25rem" },
    tab:       (a)=>({ padding:"0.45rem 1rem", borderRadius:"100px", fontSize:"0.82rem", fontWeight:500, cursor:"pointer", border:"1px solid", borderColor:a?T.accent:T.border, background:a?T.accent+"1a":T.surface, color:a?T.accent:T.muted }),
    calNav:    { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" },
    navBtn:    { background:T.surface, border:`1px solid ${T.border}`, borderRadius:8, color:T.text, padding:"0.3rem 0.75rem", cursor:"pointer", fontSize:"1rem" },
    monthLabel:{ fontFamily:`'${T.headingFont}', sans-serif`, fontWeight:600, fontSize:"1rem", color:T.text },
    grid:      { display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:"3px" },
    dayHead:   { textAlign:"center", fontSize:"0.68rem", color:T.muted, letterSpacing:"0.08em", textTransform:"uppercase", paddingBottom:"0.5rem" },
    cell:      (isToday)=>({ background:isToday?T.accent+"1a":T.surface, border:`1px solid ${isToday?T.accent:T.border}`, borderRadius:8, minHeight:58, padding:"0.3rem 0.35rem", cursor:"pointer", transition:"transform 0.12s ease, background 0.15s" }),
    cellNum:   (isToday)=>({ fontSize:"0.75rem", fontWeight:isToday?600:400, color:isToday?T.accent:T.text, marginBottom:"0.2rem" }),
    dot:       (cat)=>({ display:"inline-block", width:6, height:6, borderRadius:"50%", background:cats[cat]?.color||"#aaa", margin:"1px" }),
    dotsRow:   { display:"flex", flexWrap:"wrap", gap:"1px", marginTop:"2px" },
    addBtn:    { display:"block", width:"100%", marginTop:"1rem", padding:"0.7rem", background:T.accent+"14", border:`1px dashed ${T.accent}55`, borderRadius:10, color:T.accent, fontSize:"0.85rem", cursor:"pointer", textAlign:"center" },
    filterRow: { display:"flex", gap:"0.4rem", flexWrap:"wrap", marginBottom:"1rem" },
    filterBtn: (a)=>({ padding:"0.3rem 0.75rem", borderRadius:"100px", fontSize:"0.75rem", border:"1px solid", borderColor:a?T.accent:T.border, background:a?T.accent+"1a":T.surface, color:a?T.accent:T.muted, cursor:"pointer" }),
    eventCard: (cat)=>({ background:cats[cat]?.color+"18"||T.card, border:`1px solid ${cats[cat]?.color||T.border}33`, borderLeft:`3px solid ${cats[cat]?.color||T.border}`, borderRadius:"0 10px 10px 0", padding:"0.75rem 1rem", marginBottom:"0.5rem", display:"flex", alignItems:"center", justifyContent:"space-between" }),
    eventTitle:{ fontWeight:500, fontSize:"0.9rem", color:T.text },
    eventMeta: { fontSize:"0.75rem", color:T.muted, marginTop:"0.1rem" },
    gcalBadge: { fontSize:"0.62rem", background:"rgba(92,225,255,0.1)", color:"#5ce1ff", border:"1px solid rgba(92,225,255,0.2)", borderRadius:4, padding:"0.1rem 0.35rem", marginLeft:"0.4rem" },
    deleteBtn: { background:"none", border:"none", color:T.muted, cursor:"pointer", fontSize:"1rem", padding:"0.2rem 0.4rem", borderRadius:6 },
    emptyState:{ textAlign:"center", color:T.muted, padding:"2rem 0", fontSize:"0.88rem" },
    legend:    { display:"flex", flexWrap:"wrap", gap:"0.5rem", marginTop:"0.85rem" },
    overlay:   { position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:"1rem" },
    modal:     { background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"1.5rem", width:"100%", maxWidth:420, maxHeight:"90vh", overflowY:"auto" },
    modalTitle:{ fontFamily:`'${T.headingFont}', sans-serif`, fontWeight:600, fontSize:"1.05rem", marginBottom:"1.1rem", color:T.text },
    label:     { fontSize:"0.72rem", color:T.muted, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"0.3rem", display:"block" },
    input:     { width:"100%", background:T.bg, border:`1px solid ${T.border}`, borderRadius:8, color:T.text, padding:"0.6rem 0.8rem", fontSize:"0.9rem", marginBottom:"0.9rem", outline:"none", fontFamily:"inherit" },
    catGrid:   { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0.4rem", marginBottom:"0.9rem" },
    catBtn:    (a,cat)=>({ padding:"0.5rem 0.4rem", borderRadius:8, fontSize:"0.72rem", border:`1px solid ${a?cats[cat]?.color:T.border}`, background:a?cats[cat]?.color+"22":T.surface, color:a?cats[cat]?.color:T.muted, cursor:"pointer", textAlign:"center" }),
    modalActions:{ display:"flex", gap:"0.5rem", marginTop:"0.5rem" },
    saveBtn:   { flex:1, padding:"0.65rem", background:T.accent, border:"none", borderRadius:8, color:"#0f0f13", fontWeight:600, fontSize:"0.9rem", cursor:saving?"not-allowed":"pointer", fontFamily:"inherit", opacity:saving?0.7:1 },
    cancelBtn: { flex:1, padding:"0.65rem", background:T.surface, border:`1px solid ${T.border}`, borderRadius:8, color:T.muted, fontSize:"0.9rem", cursor:"pointer", fontFamily:"inherit" },
    toast:     (type)=>({ position:"fixed", bottom:"1.5rem", left:"50%", transform:"translateX(-50%)", background:type==="error"?"#2d1a1a":"#1a2d1a", border:`1px solid ${type==="error"?"#ff7a5c44":"#c8f55a44"}`, color:type==="error"?"#ff7a5c":T.accent, padding:"0.6rem 1.2rem", borderRadius:100, fontSize:"0.82rem", zIndex:200, whiteSpace:"nowrap" }),
    // Settings panel
    settingsPanel:{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"1.5rem", marginBottom:"1.5rem" },
    settingsPanelTitle:{ fontFamily:`'${T.headingFont}', sans-serif`, fontWeight:700, fontSize:"1rem", color:T.text, marginBottom:"1rem", display:"flex", justifyContent:"space-between", alignItems:"center" },
    stabs:     { display:"flex", gap:"0.4rem", marginBottom:"1.25rem" },
    stab:      (a)=>({ padding:"0.35rem 0.85rem", borderRadius:"100px", fontSize:"0.78rem", border:"1px solid", borderColor:a?T.accent:T.border, background:a?T.accent+"1a":T.surface, color:a?T.accent:T.muted, cursor:"pointer" }),
    row:       { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.85rem" },
    rowLabel:  { fontSize:"0.85rem", color:T.text },
    swatchRow: { display:"flex", gap:"0.4rem", flexWrap:"wrap" },
    swatch:    (color, active)=>({ width:28, height:28, borderRadius:"50%", background:color, cursor:"pointer", border:active?`2px solid ${T.text}`:"2px solid transparent", boxSizing:"border-box" }),
    colorInput:{ background:T.bg, border:`1px solid ${T.border}`, borderRadius:8, color:T.text, padding:"0.4rem 0.6rem", fontSize:"0.82rem", width:"100%", marginTop:"0.5rem", fontFamily:"inherit" },
    fontPairBtn:(a)=>({ padding:"0.45rem 0.75rem", borderRadius:8, fontSize:"0.8rem", border:`1px solid ${a?T.accent:T.border}`, background:a?T.accent+"1a":T.surface, color:a?T.accent:T.muted, cursor:"pointer", marginBottom:"0.4rem", display:"block", width:"100%", textAlign:"left" }),
    toggle:    (on)=>({ width:40, height:22, borderRadius:100, background:on?T.accent:T.border, position:"relative", cursor:"pointer", transition:"background 0.2s", flexShrink:0 }),
    toggleKnob:(on)=>({ position:"absolute", top:3, left:on?19:3, width:16, height:16, borderRadius:"50%", background:"#fff", transition:"left 0.2s" }),
    catColorRow:{ display:"flex", alignItems:"center", gap:"0.6rem", marginBottom:"0.6rem" },
    catColorSwatch:{ width:22, height:22, borderRadius:6, cursor:"pointer", border:"none", padding:0, flexShrink:0 },
    divider:   { borderTop:`1px solid ${T.border}`, margin:"0.75rem 0" },
  };

  // ── Settings panel render ──
  // ── Draggable color picker (HSL square + hue strip) ──
  // Stays open while dragging; only closes via the Done button or backdrop tap.
  function ColorPickerPopover({ initialColor, onApply, onClose }) {
    function hexToHsl(hex) {
      let r = parseInt(hex.slice(1,3),16)/255, g = parseInt(hex.slice(3,5),16)/255, b = parseInt(hex.slice(5,7),16)/255;
      const max = Math.max(r,g,b), min = Math.min(r,g,b);
      let h, s, l = (max+min)/2;
      if (max === min) { h = 0; s = 0; }
      else {
        const d = max - min;
        s = l > 0.5 ? d/(2-max-min) : d/(max+min);
        if (max === r) h = ((g-b)/d + (g < b ? 6 : 0));
        else if (max === g) h = (b-r)/d + 2;
        else h = (r-g)/d + 4;
        h *= 60;
      }
      return { h, s: s*100, l: l*100 };
    }
    function hslToHex(h, s, l) {
      s /= 100; l /= 100;
      const c = (1-Math.abs(2*l-1))*s, x = c*(1-Math.abs((h/60)%2-1)), m = l-c/2;
      let r,g,b;
      if (h<60) [r,g,b]=[c,x,0]; else if (h<120) [r,g,b]=[x,c,0]; else if (h<180) [r,g,b]=[0,c,x];
      else if (h<240) [r,g,b]=[0,x,c]; else if (h<300) [r,g,b]=[x,0,c]; else [r,g,b]=[c,0,x];
      const toHex = v => Math.round((v+m)*255).toString(16).padStart(2,"0");
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    const initHsl = hexToHsl(initialColor || "#c8f55a");
    const [hue, setHue] = useState(initHsl.h);
    const [sat, setSat] = useState(initHsl.s);
    const [light, setLight] = useState(initHsl.l);
    const squareRef = useRef(null);
    const hueRef = useRef(null);
    const [draggingSquare, setDraggingSquare] = useState(false);
    const [draggingHue, setDraggingHue] = useState(false);

    const currentHex = hslToHex(hue, sat, light);

    function updateFromSquare(clientX, clientY) {
      const rect = squareRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
      setSat(x * 100);
      setLight(100 - y * 100);
    }
    function updateFromHue(clientX) {
      const rect = hueRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      setHue(x * 360);
    }

    function onSquareDown(e) {
      e.preventDefault();
      setDraggingSquare(true);
      const cx = e.clientX ?? e.touches?.[0]?.clientX;
      const cy = e.clientY ?? e.touches?.[0]?.clientY;
      updateFromSquare(cx, cy);
    }
    function onHueDown(e) {
      e.preventDefault();
      setDraggingHue(true);
      const cx = e.clientX ?? e.touches?.[0]?.clientX;
      updateFromHue(cx);
    }
    function onMove(e) {
      if (draggingSquare) {
        const cx = e.clientX ?? e.touches?.[0]?.clientX;
        const cy = e.clientY ?? e.touches?.[0]?.clientY;
        if (cx == null) return;
        updateFromSquare(cx, cy);
      } else if (draggingHue) {
        const cx = e.clientX ?? e.touches?.[0]?.clientX;
        if (cx == null) return;
        updateFromHue(cx);
      }
    }
    function onUp() { setDraggingSquare(false); setDraggingHue(false); }

    return (
      <div
        className="planner-overlay-anim"
        style={{ position:"fixed", inset:0, zIndex:600, background:"rgba(0,0,0,0.65)", display:"flex", alignItems:"center", justifyContent:"center", padding:"1.5rem" }}
        onClick={(e)=>{ if (e.target===e.currentTarget) onClose(); }}
        onMouseMove={onMove} onMouseUp={onUp} onTouchMove={onMove} onTouchEnd={onUp}
      >
        <div className="planner-pop-anim" style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"1.25rem", width:"100%", maxWidth:300 }}>
          <div style={{ fontSize:"0.85rem", fontWeight:600, color:T.text, marginBottom:"0.9rem", fontFamily:`'${T.headingFont}', sans-serif` }}>Pick a color</div>

          {/* Saturation/Lightness square */}
          <div
            ref={squareRef}
            onMouseDown={onSquareDown}
            onTouchStart={onSquareDown}
            style={{
              position:"relative", width:"100%", height:160, borderRadius:10, marginBottom:"0.9rem",
              background:`linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hue},100%,50%))`,
              touchAction:"none", cursor:"crosshair", border:`1px solid ${T.border}`,
            }}
          >
            <div style={{
              position:"absolute", left:`${sat}%`, top:`${100-light}%`,
              width:16, height:16, borderRadius:"50%", border:"2px solid white",
              boxShadow:"0 0 0 1px rgba(0,0,0,0.4)", transform:"translate(-50%,-50%)", pointerEvents:"none",
              background: currentHex,
            }} />
          </div>

          {/* Hue strip */}
          <div
            ref={hueRef}
            onMouseDown={onHueDown}
            onTouchStart={onHueDown}
            style={{
              position:"relative", width:"100%", height:20, borderRadius:100, marginBottom:"1rem",
              background:"linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
              touchAction:"none", cursor:"pointer", border:`1px solid ${T.border}`,
            }}
          >
            <div style={{
              position:"absolute", left:`${(hue/360)*100}%`, top:"50%",
              width:20, height:20, borderRadius:"50%", border:"2px solid white",
              boxShadow:"0 0 0 1px rgba(0,0,0,0.4)", transform:"translate(-50%,-50%)", pointerEvents:"none",
              background: `hsl(${hue},100%,50%)`,
            }} />
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", marginBottom:"1rem" }}>
            <div style={{ width:28, height:28, borderRadius:8, background:currentHex, border:`1px solid ${T.border}`, flexShrink:0 }} />
            <span style={{ fontSize:"0.8rem", color:T.muted, fontFamily:"monospace" }}>{currentHex}</span>
          </div>

          <div style={{ display:"flex", gap:"0.5rem" }}>
            <button style={s.cancelBtn} onClick={onClose}>Cancel</button>
            <button style={s.saveBtn} onClick={()=>{ onApply(currentHex); onClose(); }}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  function SettingsPanel() {
    const [localCustomH, setLocalCustomH] = useState(customHeading);
    const [localCustomB, setLocalCustomB] = useState(customBody);

    function applyCustomFonts() {
      if (localCustomH) setTheme(t=>({...t, headingFont: localCustomH}));
      if (localCustomB) setTheme(t=>({...t, bodyFont: localCustomB}));
      setCustomHeading(localCustomH); setCustomBody(localCustomB);
      showToast("Fonts updated ✓");
    }

    return (
      <div className="planner-pop-anim" style={{...s.settingsPanel, transformOrigin: "top right"}}>
        <div style={s.settingsPanelTitle}>
          <span>⚙️ Customize</span>
          <button onClick={()=>setShowSettings(false)} style={{...s.cancelBtn, flex:"none", padding:"0.25rem 0.65rem", fontSize:"0.8rem"}}>Done</button>
        </div>
        <div style={s.stabs}>
          <button style={s.stab(settingsTab==="theme")}  onClick={()=>setSettingsTab("theme")}>🎨 Theme</button>
          <button style={s.stab(settingsTab==="fonts")}  onClick={()=>setSettingsTab("fonts")}>✏️ Fonts</button>
          <button style={s.stab(settingsTab==="colors")} onClick={()=>setSettingsTab("colors")}>🏷️ Categories</button>
          <button style={s.stab(settingsTab==="stickers")} onClick={()=>setSettingsTab("stickers")}>🌱 Stickers</button>
        </div>

        {/* THEME TAB */}
        {settingsTab==="theme" && (
          <>
            {/* Dark / Light toggle */}
            <div style={s.row}>
              <span style={s.rowLabel}>Dark mode</span>
              <div style={s.toggle(theme.darkMode)} onClick={()=>setTheme(t=>({...t,darkMode:!t.darkMode}))}>
                <div style={s.toggleKnob(theme.darkMode)} />
              </div>
            </div>
            <div style={s.divider} />
            {/* Accent presets */}
            <div style={{...s.label, marginBottom:"0.5rem"}}>Accent color</div>
            <div style={s.swatchRow}>
              {ACCENT_PRESETS.map(p=>(
                <div key={p.value} style={s.swatch(p.value, theme.accent===p.value)}
                  title={p.label} onClick={()=>setTheme(t=>({...t,accent:p.value}))} />
              ))}
            </div>
            <button style={{...s.cancelBtn, marginTop:"0.65rem", width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem"}}
              onClick={()=>setColorPickerCtx({type:"accent"})}>
              <span style={{width:16,height:16,borderRadius:"50%",background:theme.accent,display:"inline-block",border:`1px solid ${T.border}`}} />
              Custom color…
            </button>
            <div style={{fontSize:"0.72rem", color:T.muted, marginTop:"0.3rem"}}>Or pick a preset above ↑</div>
            <div style={s.divider} />
            {/* Font size */}
            <div style={{...s.label, marginBottom:"0.5rem"}}>Font size</div>
            <div style={{display:"flex", gap:"0.4rem", flexWrap:"wrap"}}>
              {FONT_SIZES.map(fs=>(
                <button key={fs.label} style={s.stab(theme.fontScale===fs.value)}
                  onClick={()=>setTheme(t=>({...t,fontScale:fs.value}))}>{fs.label}</button>
              ))}
            </div>
          </>
        )}

        {/* FONTS TAB */}
        {settingsTab==="fonts" && (
          <>
            <div style={s.label}>Font pairs</div>
            {FONT_PAIRS.map(fp=>(
              <button key={fp.label} style={s.fontPairBtn(theme.headingFont===fp.heading && theme.bodyFont===fp.body)}
                onClick={()=>setTheme(t=>({...t,headingFont:fp.heading,bodyFont:fp.body}))}>
                <span style={{fontFamily:`'${fp.heading}', sans-serif`, fontWeight:700}}>{fp.heading}</span>
                <span style={{color:T.muted, fontSize:"0.72rem"}}> + {fp.body}</span>
              </button>
            ))}
            <div style={s.divider} />
            <div style={s.label}>Custom Google Font</div>
            <input style={s.input} placeholder="Heading font e.g. Raleway" value={localCustomH}
              onChange={e=>setLocalCustomH(e.target.value)} />
            <input style={s.input} placeholder="Body font e.g. Poppins" value={localCustomB}
              onChange={e=>setLocalCustomB(e.target.value)} />
            <button style={s.saveBtn} onClick={applyCustomFonts}>Apply custom fonts</button>
            <div style={{fontSize:"0.72rem", color:T.muted, marginTop:"0.5rem"}}>
              Use exact names from <a href="https://fonts.google.com" target="_blank" rel="noreferrer" style={{color:T.accent}}>fonts.google.com</a>
            </div>
          </>
        )}

        {/* CATEGORIES TAB */}
        {settingsTab==="colors" && (
          <>
            <div style={s.label}>Category colors</div>
            {Object.entries(cats).map(([k,v])=>(
              <div key={k} style={s.catColorRow}>
                <button
                  onClick={()=>setColorPickerCtx({type:"category", key:k})}
                  style={{...s.catColorSwatch, background:v.color, cursor:"pointer"}}
                  title="Tap to change color"
                />
                <span style={{fontSize:"0.88rem", color:T.text}}>{v.emoji} {v.label}</span>
              </div>
            ))}
            <button style={{...s.cancelBtn, marginTop:"0.5rem", width:"100%"}}
              onClick={()=>setCats(DEFAULT_CATEGORIES)}>Reset to defaults</button>
          </>
        )}

        {/* STICKERS TAB */}
        {settingsTab==="stickers" && (
          <>
            <div style={s.label}>Add a sticker to your screen</div>
            <div style={{fontSize:"0.78rem", color:T.muted, marginBottom:"0.75rem", lineHeight:1.5}}>
              Tap one to drop it on screen, then drag it anywhere — it stays right where you let go.
            </div>
            <div style={{display:"grid", gridTemplateColumns:"repeat(6, 1fr)", gap:"0.4rem", marginBottom:"1rem"}}>
              {DEFAULT_STICKERS.map(emoji=>(
                <button key={emoji}
                  onClick={()=>{ addSticker(emoji,false); showToast("Sticker added — drag it anywhere ✓"); }}
                  style={{fontSize:"1.4rem", background:T.surface, border:`1px solid ${T.border}`, borderRadius:8, padding:"0.5rem 0", cursor:"pointer"}}>
                  {emoji}
                </button>
              ))}
            </div>
            <div style={s.divider} />
            <div style={s.label}>Upload your own image</div>
            <label style={{...s.cancelBtn, display:"block", textAlign:"center", marginBottom:"0.9rem", cursor:"pointer"}}>
              📤 Choose image (PNG, JPG)
              <input type="file" accept="image/*" onChange={handleStickerImageUpload} style={{display:"none"}} />
            </label>
            {stickers.length > 0 && (
              <>
                <div style={s.divider} />
                <div style={s.label}>Active stickers ({stickers.length})</div>
                <div style={{display:"flex", flexWrap:"wrap", gap:"0.5rem", marginTop:"0.4rem"}}>
                  {stickers.map(st=>(
                    <div key={st.id} style={{display:"flex", alignItems:"center", gap:"0.3rem", background:T.surface, border:`1px solid ${T.border}`, borderRadius:8, padding:"0.3rem 0.5rem"}}>
                      {st.isImage ? <img src={st.content} alt="" style={{width:18,height:18,objectFit:"contain"}}/> : <span style={{fontSize:"1rem"}}>{st.content}</span>}
                      <button onClick={()=>removeSticker(st.id)} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:"0.85rem",padding:0}}>×</button>
                    </div>
                  ))}
                </div>
                <button style={{...s.cancelBtn, marginTop:"0.75rem", width:"100%"}}
                  onClick={()=>{ setStickers([]); showToast("All stickers cleared"); }}>Clear all stickers</button>
              </>
            )}
          </>
        )}

        {/* NOTES TAB */}
      </div>
    );
  }

  return (
    <div
      style={s.root}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
    >

      {/* ── SPLASH SCREEN (once per day) ── */}
      {showSplash && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: T.bg,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          textAlign: "center",
          padding: "0 2rem",
          opacity: splashFading ? 0 : 1,
          transition: "opacity 0.5s ease",
          pointerEvents: "none",
        }}>
          <div style={{
            fontFamily: `'${T.headingFont}', sans-serif`,
            fontWeight: 800,
            fontSize: "1.15rem",
            color: T.text,
            letterSpacing: "-0.01em",
            textAlign: "center",
            lineHeight: 1.4,
            opacity: splashFading ? 0 : 1,
            transform: splashFading ? "translateY(-6px)" : "translateY(0)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}>
            Your <span style={{ color: T.accent }}>month,</span> in one place.
          </div>
          <div style={{
            fontSize: "0.68rem", color: T.muted, marginTop: "0.5rem",
            textAlign: "center",
            opacity: splashFading ? 0 : 1, transition: "opacity 0.6s ease",
          }}>
            {MONTHS[month]} {year}
          </div>
        </div>
      )}

      <div style={s.wrap}>

        {/* Header */}
        <div style={s.topBar}>
          <div>
            <div style={s.eyebrow}>Life Planner · Google Calendar Sync</div>
            <h1 style={s.h1}>Your <span style={{color:T.accent}}>month,</span><br/>in one place.</h1>
          </div>
          <button className="planner-tappable" style={s.settingsBtn} onClick={()=>setShowSettings(v=>!v)}>⚙️ Customize</button>
        </div>

        {/* Settings panel */}
        {showSettings && <SettingsPanel />}

        {/* GCal status */}
        <div style={s.statusBar(gcalLoading?"loading":gcalStatus)}>
          {gcalLoading
            ? <span>⏳ Loading Google Calendar…</span>
            : gcalStatus==="ok"
              ? <span>✓ Google Calendar synced · {gcalEvents.length} event{gcalEvents.length!==1?"s":""} this month</span>
              : gcalStatus==="error"
                ? <><span>✕ Sync failed</span><button onClick={loadGcal} style={{marginLeft:"auto",background:"none",border:`1px solid #ff7a5c44`,color:"#ff7a5c",borderRadius:6,padding:"0.1rem 0.5rem",cursor:"pointer",fontSize:"0.75rem"}}>Retry</button></>
                : null}
        </div>

        {/* Tabs */}
        <div style={s.tabs}>
          <button style={s.tab(view==="calendar")} onClick={()=>setView("calendar")}>📅 Calendar</button>
          <button style={s.tab(view==="list")}     onClick={()=>setView("list")}>📋 Upcoming</button>
          <button style={s.tab(view==="notes")}    onClick={()=>setView("notes")}>🗒️ Notes</button>
        </div>

        {/* ── CALENDAR VIEW ── */}
        {view==="calendar" && (
          <>
            <div style={s.calNav}>
              <button style={s.navBtn} onClick={prevMonth}>‹</button>
              <span style={s.monthLabel}>{MONTHS[month]} {year}</span>
              <button style={s.navBtn} onClick={nextMonth}>›</button>
            </div>
            <div style={s.grid}>
              {DAYS.map(d=><div key={d} style={s.dayHead}>{d}</div>)}
              {Array.from({length:firstDay}).map((_,i)=>(
                <div key={`e${i}`} style={{...s.cell(false), opacity:0, pointerEvents:"none"}} />
              ))}
              {Array.from({length:daysInMonth}).map((_,i)=>{
                const d=i+1, ds=dateStr(d), isToday=ds===todayStr, evs=eventsForDay(d);
                const holiday = CO_HOLIDAYS[ds];
                return (
                  <div key={d} className="planner-tappable" style={{...s.cell(isToday), background: holiday && !isToday ? T.accent+"0d" : isToday ? T.accent+"1a" : T.surface, borderColor: holiday ? T.accent+"55" : isToday ? T.accent : T.border}} onClick={()=>openDay(d)}>
                    <div style={s.cellNum(isToday)}>{d}</div>
                    {holiday && <div style={{fontSize:"0.55rem", color:T.accent, lineHeight:1.2, marginBottom:"1px", overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis"}} title={holiday}>{holiday.slice(0,2)}</div>}
                    <div style={s.dotsRow}>{evs.map(e=><span key={e.id} style={s.dot(e.category)} title={e.title}/>)}</div>
                  </div>
                );
              })}
            </div>
            <div style={s.legend}>
              {Object.entries(cats).map(([k,v])=>(
                <span key={k} style={{fontSize:"0.7rem",color:v.color,display:"flex",alignItems:"center",gap:"0.3rem"}}>
                  <span style={{width:7,height:7,borderRadius:"50%",background:v.color,display:"inline-block"}}/>{v.label}
                </span>
              ))}
            </div>
            {/* Holiday banner for visible month */}
            {(() => {
              const monthHolidays = Object.entries(CO_HOLIDAYS)
                .filter(([k]) => k.startsWith(`${year}-${String(month+1).padStart(2,'0')}`));
              if (!monthHolidays.length) return null;
              return (
                <div style={{background:T.accent+"0d", border:`1px solid ${T.accent}33`, borderRadius:10, padding:"0.65rem 0.9rem", marginTop:"0.85rem"}}>
                  <div style={{fontSize:"0.7rem", color:T.accent, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"0.4rem", fontWeight:500}}>🇨🇴 Festivos colombianos</div>
                  {monthHolidays.map(([date, name]) => {
                    const d = parseInt(date.split("-")[2]);
                    return <div key={date} style={{fontSize:"0.78rem", color:T.text, marginBottom:"0.2rem"}}><span style={{color:T.muted, marginRight:"0.5rem", fontSize:"0.72rem"}}>{MONTHS[month].slice(0,3)} {d}</span>{name}</div>;
                  })}
                </div>
              );
            })()}
            <button style={s.addBtn} onClick={()=>openAdd(today.getDate())}>+ Add event to today</button>
          </>
        )}

        {/* ── LIST VIEW ── */}
        {view==="list" && (
          <>
            <div style={s.filterRow}>
              <button style={s.filterBtn(filterCat==="all")} onClick={()=>setFilter("all")}>All</button>
              {Object.entries(cats).map(([k,v])=>(
                <button key={k} style={s.filterBtn(filterCat===k)} onClick={()=>setFilter(k)}>{v.emoji} {v.label}</button>
              ))}
            </div>
            {upcoming.length===0
              ? <div style={s.emptyState}>No upcoming events. Tap the calendar to add some!</div>
              : upcoming.map(e=>{
                  const [,m,d]=e.date.split("-");
                  return (
                    <div key={e.id} style={s.eventCard(e.category)}>
                      <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
                        <span style={{fontSize:"1.1rem"}}>{cats[e.category]?.emoji||"📌"}</span>
                        <div>
                          <div style={s.eventTitle}>{e.title}{e.fromGcal&&<span style={s.gcalBadge}>GCal</span>}</div>
                          <div style={s.eventMeta}>{MONTHS[parseInt(m)-1]} {parseInt(d)}{e.note?` · ${e.note}`:""}</div>
                        </div>
                      </div>
                      <button style={s.deleteBtn} onClick={()=>deleteEvent(e)}>×</button>
                    </div>
                  );
                })
            }
            <button style={s.addBtn} onClick={()=>openAdd(today.getDate())}>+ Add new event</button>
          </>
        )}

        {/* ── NOTES VIEW ── */}
        {view==="notes" && (
          <>
            <div style={{fontSize:"0.82rem", color:T.muted, marginBottom:"1rem"}}>
              Drag any note to move it, pinch with two fingers to resize, tap (without dragging) to open and write.
            </div>
            <div style={{
              position:"relative", width:"100%", height:"60vh", minHeight:380,
              background:T.surface, border:`1px solid ${T.border}`, borderRadius:14,
              overflow:"hidden", marginBottom:"1rem",
            }}>
              {notes.length===0 && (
                <div style={{...s.emptyState, position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center"}}>
                  No notes yet. Add your first one below!
                </div>
              )}
              {notes.map(n=>{
                const bgColor = n.color || T.accent;
                const textColor = getContrastColor(bgColor);
                const mutedTextColor = textColor === "#000000" ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.7)";
                const isDraggingThis = draggingId === `note-${n.id}`;
                const noteScale = n.scale || 1;
                return (
                  <div key={n.id}
                    onMouseDown={(e)=>handleNotePointerDown(e,n)}
                    onTouchStart={(e)=>handleNotePointerDown(e,n)}
                    style={{
                      position:"absolute",
                      left:`${n.x ?? 10}%`,
                      top:`${n.y ?? 10}%`,
                      width:130, minHeight:100,
                      background: bgColor,
                      borderRadius:10, padding:"0.7rem 0.8rem",
                      cursor: isDraggingThis ? "grabbing" : "grab",
                      userSelect:"none", touchAction:"none",
                      display:"flex", flexDirection:"column", justifyContent:"space-between",
                      boxShadow: isDraggingThis ? "0 12px 24px rgba(0,0,0,0.35)" : "0 2px 8px rgba(0,0,0,0.18)",
                      transform: `scale(${noteScale})`,
                      transformOrigin: "top left",
                      transition: isDraggingThis ? "none" : "box-shadow 0.15s",
                      zIndex: isDraggingThis ? 50 : 1,
                    }}>
                    <div style={{
                      fontSize:"0.78rem", color:textColor, lineHeight:1.4,
                      overflow:"hidden", display:"-webkit-box", WebkitLineClamp:4, WebkitBoxOrient:"vertical",
                      wordBreak:"break-word",
                    }}>
                      {n.text.trim() ? n.text : <span style={{color:mutedTextColor}}>Tap to write…</span>}
                    </div>
                    <div style={{fontSize:"0.64rem", color:mutedTextColor, marginTop:"0.4rem"}}>
                      {MONTHS[parseInt(n.date.split("-")[1])-1].slice(0,3)} {parseInt(n.date.split("-")[2])}
                    </div>
                    <button
                      onClick={(e)=>{ e.stopPropagation(); deleteNote(n.id); }}
                      onMouseDown={(e)=>e.stopPropagation()}
                      onTouchStart={(e)=>e.stopPropagation()}
                      style={{
                        position:"absolute", top:-6, right:-6, width:18, height:18, borderRadius:"50%",
                        background:T.card, border:`1px solid ${T.border}`, color:T.muted, fontSize:"0.7rem",
                        display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", padding:0, lineHeight:1,
                        transform: `scale(${1/noteScale})`,
                      }}>×</button>
                  </div>
                );
              })}
            </div>
            <button style={s.addBtn} onClick={addNote}>+ Add note</button>
          </>
        )}
      </div>

      {/* ── DAY PANEL ── */}
      {showDayPanel && selected && (() => {
        const ds = dateStr(selected);
        const dayEvs = allEvents.filter(e => e.date === ds);
        const holiday = CO_HOLIDAYS[ds];
        return (
          <div className="planner-overlay-anim" style={s.overlay} onClick={e=>{if(e.target===e.currentTarget)setShowDayPanel(false);}}>
            <div className="planner-pop-anim" style={s.modal}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem"}}>
                <div style={s.modalTitle}>{MONTHS[month]} {selected}</div>
                <button onClick={()=>setShowDayPanel(false)} style={{background:"none",border:"none",color:T.muted,fontSize:"1.3rem",cursor:"pointer",lineHeight:1}}>×</button>
              </div>
              {holiday && (
                <div style={{background:T.accent+"12", border:`1px solid ${T.accent}33`, borderRadius:8, padding:"0.5rem 0.75rem", marginBottom:"0.85rem", fontSize:"0.82rem", color:T.accent}}>
                  {holiday}
                </div>
              )}
              {dayEvs.length === 0 ? (
                <div style={{color:T.muted, fontSize:"0.88rem", textAlign:"center", padding:"1rem 0"}}>No events on this day.</div>
              ) : (
                <div style={{marginBottom:"0.85rem"}}>
                  {dayEvs.map(e => (
                    <div key={e.id} style={{...s.eventCard(e.category), marginBottom:"0.4rem"}}>
                      <div style={{display:"flex", alignItems:"center", gap:"0.65rem"}}>
                        <span style={{fontSize:"1rem"}}>{cats[e.category]?.emoji || "📌"}</span>
                        <div>
                          <div style={s.eventTitle}>{e.title}{e.fromGcal && <span style={s.gcalBadge}>GCal</span>}</div>
                          {e.note && <div style={s.eventMeta}>{e.time ? `${e.time} · ` : ""}{e.note}</div>}
                          {e.time && !e.note && <div style={s.eventMeta}>{e.time}</div>}
                        </div>
                      </div>
                      <button style={s.deleteBtn} onClick={()=>{ deleteEvent(e); }} title="Remove">×</button>
                    </div>
                  ))}
                </div>
              )}
              <button style={s.saveBtn} onClick={()=>{ setShowDayPanel(false); openAdd(selected); }}>+ Add event</button>
            </div>
          </div>
        );
      })()}


      {/* ── ADD EVENT MODAL ── */}
      {showModal && (
        <div className="planner-overlay-anim" style={s.overlay} onClick={e=>{if(e.target===e.currentTarget)setShowModal(false);}}>
          <div className="planner-pop-anim" style={s.modal}>
            <div style={s.modalTitle}>Add to {MONTHS[month]} {selected}</div>
            <label style={s.label}>What is it?</label>
            <input style={s.input} placeholder="e.g. Gym session, Dentist, Trip…" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} />
            <label style={s.label}>Time (optional)</label>
            <input style={s.input} type="time" value={form.time} onChange={e=>setForm(f=>({...f,time:e.target.value}))} />
            <label style={s.label}>Category</label>
            <div style={s.catGrid}>
              {Object.entries(cats).map(([k,v])=>(
                <button key={k} style={s.catBtn(form.category===k,k)} onClick={()=>setForm(f=>({...f,category:k}))}>
                  {v.emoji} {v.label}
                </button>
              ))}
            </div>
            <div style={{fontSize:"0.74rem", color:T.muted, marginBottom:"0.9rem", marginTop:"-0.4rem"}}>
              🔔 Reminder: {form.category==="family" ? "2 days before" : "2 hours before"}
            </div>
            <label style={s.label}>Note (optional)</label>
            <input style={s.input} placeholder="e.g. 8am, bring ID, 3 nights…" value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} />
            <div style={s.modalActions}>
              <button style={s.cancelBtn} onClick={()=>setShowModal(false)}>Cancel</button>
              <button style={s.saveBtn} onClick={saveEvent} disabled={saving}>{saving?"Saving…":"Save & Sync 📅"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && <div style={s.toast(toast.type)}>{toast.msg}</div>}

      {/* ── FLOATING STICKERS ── */}
      {stickers.map(st => (
        <div
          key={st.id}
          onMouseDown={(e) => handleStickerPointerDown(e, st)}
          onTouchStart={(e) => handleStickerPointerDown(e, st)}
          style={{
            position: "fixed",
            left: `${st.x}%`,
            top: `${st.y}%`,
            zIndex: 300,
            cursor: draggingId === st.id ? "grabbing" : "grab",
            userSelect: "none",
            touchAction: "none",
            width: 56,
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: st.isImage ? 0 : "2rem",
            transform: `scale(${st.scale || 1})`,
            transformOrigin: "center center",
            filter: draggingId === st.id ? "drop-shadow(0 8px 16px rgba(0,0,0,0.4))" : "drop-shadow(0 2px 6px rgba(0,0,0,0.25))",
            transition: draggingId === st.id ? "none" : "filter 0.15s",
          }}
        >
          {st.isImage ? (
            <img src={st.content} alt="sticker" style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }} />
          ) : st.content}
          {/* remove button — counter-scaled so it stays tappable regardless of sticker size */}
          <button
            onClick={(e) => { e.stopPropagation(); removeSticker(st.id); }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            style={{
              position: "absolute", top: -6, right: -6, width: 18, height: 18,
              borderRadius: "50%", background: T.card, border: `1px solid ${T.border}`,
              color: T.muted, fontSize: "0.7rem", display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer", padding: 0, lineHeight: 1,
              transform: `scale(${1/(st.scale || 1)})`,
            }}
          >×</button>
        </div>
      ))}

      {/* ── NOTE EDITING OVERLAY (centered) ── */}
      {openNoteId && (() => {
        const activeNote = notes.find(n => n.id === openNoteId);
        const noteColor = activeNote?.color || T.accent;
        const noteTextColor = getContrastColor(noteColor);
        const noteMutedColor = noteTextColor === "#000000" ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.7)";
        const pillBg = noteTextColor === "#000000" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.18)";
        const pillBorder = noteTextColor === "#000000" ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.3)";
        const originX = activeNote ? `${activeNote.x ?? 50}%` : "50%";
        const originY = activeNote ? `${activeNote.y ?? 50}%` : "50%";
        return (
          <div
            className="planner-overlay-anim"
            style={{
              position: "fixed", inset: 0, zIndex: 500,
              background: "rgba(0,0,0,0.6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "1.5rem",
            }}
            onClick={(e) => { if (e.target === e.currentTarget) closeNote(); }}
          >
            <div
              className="planner-pop-anim"
              style={{
                background: noteColor,
                borderRadius: 16,
                padding: "1.25rem",
                width: "100%",
                maxWidth: 340,
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                transformOrigin: `${originX} ${originY}`,
              }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.75rem" }}>
                <button
                  onClick={()=>setColorPickerCtx({type:"note", key:openNoteId})}
                  style={{
                    display:"flex", alignItems:"center", gap:"0.4rem",
                    background:pillBg, border:`1px solid ${pillBorder}`, borderRadius:100,
                    padding:"0.25rem 0.6rem", cursor:"pointer", fontSize:"0.72rem", color:noteTextColor,
                  }}>
                  <span style={{width:14,height:14,borderRadius:"50%",background:noteColor,display:"inline-block",border:`1px solid ${pillBorder}`}} />
                  Color
                </button>
                <span style={{ fontSize: "0.7rem", color: noteMutedColor }}>
                  {activeNote ? `${MONTHS[parseInt(activeNote.date.split("-")[1])-1].slice(0,3)} ${parseInt(activeNote.date.split("-")[2])}` : ""}
                </span>
              </div>
              <textarea
                autoFocus
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Write something…"
                style={{
                  width: "100%", minHeight: 180, background: "transparent",
                  border: "none", outline: "none", resize: "none",
                  color: noteTextColor, fontFamily: `'${T.bodyFont}', sans-serif`,
                  fontSize: "0.95rem", lineHeight: 1.6,
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.75rem" }}>
                <button
                  onClick={closeNote}
                  style={{
                    padding:"0.55rem 1.1rem", background:pillBg, border:`1px solid ${pillBorder}`,
                    borderRadius:8, color:noteTextColor, fontWeight:600, fontSize:"0.85rem", cursor:"pointer",
                    fontFamily:"inherit",
                  }}>Done</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── DRAGGABLE COLOR PICKER POPOVER ── */}
      {colorPickerCtx && (
        <ColorPickerPopover
          initialColor={
            colorPickerCtx.type === "accent" ? theme.accent
            : colorPickerCtx.type === "category" ? cats[colorPickerCtx.key]?.color
            : notes.find(n=>n.id===colorPickerCtx.key)?.color || theme.accent
          }
          onApply={(hex) => {
            if (colorPickerCtx.type === "accent") setTheme(t=>({...t,accent:hex}));
            else if (colorPickerCtx.type === "category") setCats(prev=>({...prev,[colorPickerCtx.key]:{...prev[colorPickerCtx.key],color:hex}}));
            else if (colorPickerCtx.type === "note") setNotes(prev=>prev.map(n=>n.id===colorPickerCtx.key?{...n,color:hex}:n));
          }}
          onClose={() => setColorPickerCtx(null)}
        />
      )}
    </div>
  );
}
