import { useState, useEffect, useCallback } from "react";

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

  // ── Theme & categories state ──
  const [theme, setTheme]   = useState(DEFAULT_THEME);
  const [cats, setCats]     = useState(DEFAULT_CATEGORIES);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Load saved theme + category settings on first mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('planner-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.theme) setTheme(t => ({ ...t, ...parsed.theme }));
        if (parsed.cats) setCats(c => ({ ...c, ...parsed.cats }));
      }
    } catch {
      // no saved settings yet, or corrupted — defaults stay
    } finally {
      setSettingsLoaded(true);
    }
  }, []);

  // Save theme + category settings whenever they change (after initial load)
  useEffect(() => {
    if (!settingsLoaded) return;
    try {
      localStorage.setItem('planner-settings', JSON.stringify({ theme, cats }));
    } catch {
      // storage full or blocked; not critical to block UI
    }
  }, [theme, cats, settingsLoaded]);
  const [customHeading, setCustomHeading] = useState("");
  const [customBody, setCustomBody]       = useState("");

  // Resolved theme (merge dark/light)
  const T = theme.darkMode ? theme : { ...theme, ...LIGHT_OVERRIDES };
  const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(T.headingFont)}:wght@400;600;700;800&family=${encodeURIComponent(T.bodyFont)}:wght@300;400;500&display=swap`;

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
      const prompt = dt
        ? `Use Google Calendar MCP to create event "${form.title}" starting ${dt} (1hr) with description "${form.note||""} | Category: ${cats[form.category]?.label}". Return event id only.`
        : `Use Google Calendar MCP to create all-day event "${form.title}" on ${date} with description "${form.note||""} | Category: ${cats[form.category]?.label}". Return event id only.`;
      const data = await callClaude(prompt);
      const id = data.content?.find(b=>b.type==="text")?.text?.trim().replace(/"/g,"");
      if (id && id.length>5) setLocal(p=>p.map(e=>e.id===ev.id?{...e,id,fromGcal:true}:e));
      showToast("Saved to Google Calendar ✓");
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

  const upcoming = [...allEvents]
    .filter(e=>e.date>=todayStr&&(filterCat==="all"||e.category===filterCat))
    .sort((a,b)=>a.date.localeCompare(b.date)).slice(0,30);

  const daysInMonth = getDaysInMonth(year,month);
  const firstDay    = getFirstDay(year,month);

  // ── Styles ──
  const s = {
    root:      { minHeight:"100vh", background:T.bg, color:T.text, fontFamily:`'${T.bodyFont}', sans-serif`, fontWeight:300, padding:"1.5rem 1rem 4rem", transition:"background 0.3s, color 0.3s" },
    wrap:      { maxWidth:680, margin:"0 auto" },
    eyebrow:   { fontSize:"0.68rem", letterSpacing:"0.18em", textTransform:"uppercase", color:T.accent, marginBottom:"0.4rem" },
    h1:        { fontFamily:`'${T.headingFont}', sans-serif`, fontSize:"clamp(1.6rem,5vw,2.4rem)", fontWeight:800, letterSpacing:"-0.02em", lineHeight:1.1 },
    topBar:    { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1.25rem" },
    settingsBtn:{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:8, color:T.muted, padding:"0.35rem 0.7rem", cursor:"pointer", fontSize:"0.85rem", marginTop:"0.25rem" },
    statusBar: (st)=>({ display:"flex", alignItems:"center", gap:"0.5rem", background: st==="ok"?"rgba(85,239,196,0.08)":st==="error"?"rgba(255,122,92,0.08)":"rgba(200,245,90,0.06)", border:`1px solid ${st==="ok"?"rgba(85,239,196,0.2)":st==="error"?"rgba(255,122,92,0.2)":"rgba(200,245,90,0.15)"}`, borderRadius:8, padding:"0.45rem 0.75rem", fontSize:"0.78rem", color:st==="ok"?"#55efc4":st==="error"?"#ff7a5c":T.accent, marginBottom:"1rem" }),
    tabs:      { display:"flex", gap:"0.5rem", marginBottom:"1.25rem" },
    tab:       (a)=>({ padding:"0.45rem 1rem", borderRadius:"100px", fontSize:"0.82rem", fontWeight:500, cursor:"pointer", border:"1px solid", borderColor:a?T.accent:T.border, background:a?T.accent+"1a":T.surface, color:a?T.accent:T.muted }),
    calNav:    { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" },
    navBtn:    { background:T.surface, border:`1px solid ${T.border}`, borderRadius:8, color:T.text, padding:"0.3rem 0.75rem", cursor:"pointer", fontSize:"1rem" },
    monthLabel:{ fontFamily:`'${T.headingFont}', sans-serif`, fontWeight:600, fontSize:"1rem", color:T.text },
    grid:      { display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:"3px" },
    dayHead:   { textAlign:"center", fontSize:"0.68rem", color:T.muted, letterSpacing:"0.08em", textTransform:"uppercase", paddingBottom:"0.5rem" },
    cell:      (isToday)=>({ background:isToday?T.accent+"1a":T.surface, border:`1px solid ${isToday?T.accent:T.border}`, borderRadius:8, minHeight:58, padding:"0.3rem 0.35rem", cursor:"pointer" }),
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
      <div style={s.settingsPanel}>
        <div style={s.settingsPanelTitle}>
          <span>⚙️ Customize</span>
          <button onClick={()=>setShowSettings(false)} style={{...s.cancelBtn, flex:"none", padding:"0.25rem 0.65rem", fontSize:"0.8rem"}}>Done</button>
        </div>
        <div style={s.stabs}>
          <button style={s.stab(settingsTab==="theme")}  onClick={()=>setSettingsTab("theme")}>🎨 Theme</button>
          <button style={s.stab(settingsTab==="fonts")}  onClick={()=>setSettingsTab("fonts")}>✏️ Fonts</button>
          <button style={s.stab(settingsTab==="colors")} onClick={()=>setSettingsTab("colors")}>🏷️ Categories</button>
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
            <input style={{...s.colorInput, marginTop:"0.65rem"}} type="color" value={theme.accent}
              onChange={e=>setTheme(t=>({...t,accent:e.target.value}))} title="Pick any color" />
            <div style={{fontSize:"0.72rem", color:T.muted, marginTop:"0.3rem"}}>Or pick any custom color above ↑</div>
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
                <input type="color" value={v.color} style={s.catColorSwatch}
                  onChange={e=>setCats(prev=>({...prev,[k]:{...prev[k],color:e.target.value}}))} />
                <span style={{fontSize:"0.88rem", color:T.text}}>{v.emoji} {v.label}</span>
              </div>
            ))}
            <button style={{...s.cancelBtn, marginTop:"0.5rem", width:"100%"}}
              onClick={()=>setCats(DEFAULT_CATEGORIES)}>Reset to defaults</button>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={s.root}>
      <link href={fontUrl} rel="stylesheet" />
      <div style={s.wrap}>

        {/* Header */}
        <div style={s.topBar}>
          <div>
            <div style={s.eyebrow}>Life Planner · Google Calendar Sync</div>
            <h1 style={s.h1}>Your <span style={{color:T.accent}}>month,</span><br/>in one place.</h1>
          </div>
          <button style={s.settingsBtn} onClick={()=>setShowSettings(v=>!v)}>⚙️ Customize</button>
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
                  <div key={d} style={{...s.cell(isToday), background: holiday && !isToday ? T.accent+"0d" : isToday ? T.accent+"1a" : T.surface, borderColor: holiday ? T.accent+"55" : isToday ? T.accent : T.border}} onClick={()=>openDay(d)}>
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
      </div>

      {/* ── DAY PANEL ── */}
      {showDayPanel && selected && (() => {
        const ds = dateStr(selected);
        const dayEvs = allEvents.filter(e => e.date === ds);
        const holiday = CO_HOLIDAYS[ds];
        return (
          <div style={s.overlay} onClick={e=>{if(e.target===e.currentTarget)setShowDayPanel(false);}}>
            <div style={s.modal}>
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
        <div style={s.overlay} onClick={e=>{if(e.target===e.currentTarget)setShowModal(false);}}>
          <div style={s.modal}>
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
    </div>
  );
}