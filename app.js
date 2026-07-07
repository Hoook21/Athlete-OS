const SNAPSHOT = {
  fitness: 23,
  fatigue: 17,
  form: 6,
  streak: 0,
  weekKm: 33.4,
  weekCount: 2,
  sportLastSeen: { Ride: 0, StandUpPaddling: 30, Walk: 44 },
  ctlSpark: [13.7, 14.8, 17.3, 21.8, 21.3, 23.6, 23.0, 35.6, 34.7, 35.4, 34.6, 33.8, 33.9, 33.1, 32.3, 31.5, 30.8, 30.0, 29.3, 28.6, 27.9, 27.3, 26.6, 26.0, 25.4, 26.0, 25.4, 27.0, 26.4, 25.7, 25.1, 24.5, 25.6, 25.0, 24.4, 23.8, 23.2, 22.7, 22.3, 21.8, 23.3, 22.8],
  activities: [
    { id: "19111528086", name: "Afternoon Ride", sport_type: "Ride", start_local: "2026-06-29T16:19:54", summary: { distance: 26355.8, moving_time: 3164, elevation_gain: 45, relative_effort: 86, total_calories: 592 } },
    { id: "19089644556", name: "Abendradfahrt", sport_type: "Ride", start_local: "2026-06-27T18:05:12", summary: { distance: 7074.1, moving_time: 2284, relative_effort: 9, total_calories: 176 } },
    { id: "19010875314", name: "Kurz in den Pool springen", sport_type: "Ride", start_local: "2026-06-21T12:06:26", summary: { distance: 25662.6, moving_time: 3440, relative_effort: 69, total_calories: 566 } },
    { id: "18944522392", name: "Afternoon Ride", sport_type: "Ride", start_local: "2026-06-16T16:09:27", summary: { distance: 26363.1, moving_time: 3294, relative_effort: 93, total_calories: 571 } },
    { id: "18915172806", name: "Lunch Ride", sport_type: "Ride", start_local: "2026-06-14T11:48:44", summary: { distance: 26782.6, moving_time: 3583, relative_effort: 52, total_calories: 604 } },
    { id: "18741097285", name: "Lunch Ride", sport_type: "Ride", start_local: "2026-06-01T12:47:31", summary: { distance: 36120, moving_time: 5384, relative_effort: 37, total_calories: 679 } },
    { id: "18716805284", name: "Stand-up-Paddeln am Nachmittag", sport_type: "StandUpPaddling", start_local: "2026-05-30T15:53:38", summary: { distance: 2933.4, moving_time: 2610, relative_effort: 5 } },
    { id: "18700247289", name: "Lunch Ride", sport_type: "Ride", start_local: "2026-05-29T11:22:47", summary: { distance: 26592.8, moving_time: 3329, relative_effort: 61, total_calories: 567 } },
  ],
};

const REF = {
  Ride: { avg_km: 33.8, max_km: 59.7, avg_speed: 25.9, avg_load: 75 },
  StandUpPaddling: { avg_km: 2.9, max_km: 3.1, avg_speed: 4.0, avg_load: 7 },
  Walk: { avg_km: 1.8, max_km: 1.8, avg_speed: 4.2, avg_load: 3 },
};

const SPORT_MAP = {
  Ride: { label: "RENNRAD", color: "#4fa8e0" },
  VirtualRide: { label: "RENNRAD", color: "#4fa8e0" },
  Run: { label: "LAUF", color: "#ff5a1f" },
  TrailRun: { label: "LAUF", color: "#ff5a1f" },
  Walk: { label: "WALK", color: "#8b93a1" },
  Hike: { label: "WALK", color: "#8b93a1" },
  StandUpPaddling: { label: "SUP", color: "#3fc6c6" },
  Badminton: { label: "BADMINTON", color: "#b48cf0" },
  Yoga: { label: "DEHNEN", color: "#4cd787" },
  WeightTraining: { label: "KRAFT", color: "#4cd787" },
  Workout: { label: "KRAFT", color: "#4cd787" },
};

const ICONS = {
  bolt:     `<svg width="11" height="13" viewBox="0 0 11 13" fill="none" aria-hidden="true"><path d="M6.5 1L1.5 7.5h4L4 12.5 10 5.5H6L6.5 1z" fill="currentColor"/></svg>`,
  clock:    `<svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true"><circle cx="6.5" cy="6.5" r="5.2" stroke="currentColor" stroke-width="1.3"/><path d="M6.5 4V6.5l1.8 1.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  moon:     `<svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true"><path d="M6.5 1.5C4 1.5 1.5 4 1.5 6.5S4 11.5 6.5 11.5c2.2 0 4-1.4 4.7-3.3-2.5.7-5.2-.9-5.6-3.7A5 5 0 0 1 6.5 1.5z" fill="currentColor"/></svg>`,
  heart:    `<svg width="13" height="12" viewBox="0 0 13 12" fill="none" aria-hidden="true"><path d="M6.5 10.5 1.5 5.5C-.5 3.5-.5 1.5 1.5.5s3 0 5 3c2-3 3-3 5-1s1.5 3-.5 5l-5 5z" fill="currentColor"/></svg>`,
  sun:      `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><circle cx="6" cy="6" r="2.1" fill="currentColor"/><path d="M6 1v1.1M6 9.9V11M1 6h1.1M9.9 6H11M2.6 2.6l.8.8M8.6 8.6l.8.8M9.4 2.6l-.8.8M3.4 8.6l-.8.8" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>`,
  cloud:    `<svg width="13" height="10" viewBox="0 0 13 10" fill="none" aria-hidden="true"><path d="M3.5 8.5a2.5 2.5 0 0 1 0-5A3.1 3.1 0 0 1 9.5 4a2.2 2.2 0 0 1-.5 4.5H3.5z" fill="currentColor"/></svg>`,
};

const root = document.getElementById("root");
const todayKey = new Date().toISOString().slice(0, 10);
let recovery = null;
let recoveryHist = [];
let weather = weatherFallback();
let serverBackupActive = false;
let training = SNAPSHOT;
let stravaState = {
  configured: false,
  connected: false,
  live: false,
  label: "Strava Snapshot",
  detail: "Statischer Stand aus dem Artifact.",
  authUrl: null,
};

function sportInfo(type) {
  return SPORT_MAP[type] || { label: (type || "SPORT").toUpperCase().slice(0, 9), color: "#8b93a1" };
}


function hasActivityHeartrate(summary) {
  const hr = (summary && summary.heartrate) || {};
  return Number.isFinite(hr.avg) && hr.avg > 0;
}

function fmtKm(summary) {
  const hasHr = hasActivityHeartrate(summary);
  const km = ((summary && summary.distance) || 0) / 1000;
  return hasHr ? km.toFixed(1) : String(Math.round(km));
}

function fmtSpeed(summary) {
  const hasHr = hasActivityHeartrate(summary);
  const mins = Math.round(((summary && summary.moving_time) || 0) / 60);
  const km = ((summary && summary.distance) || 0) / 1000;
  const speed = mins ? km / (mins / 60) : 0;
  return hasHr ? speed.toFixed(1) : String(Math.round(speed));
}

function fmtLoad(load) {
  return String(Math.round(Number(load) || 0));
}
function sparkline(vals) {
  if (!vals || vals.length < 2) return "";
  const w = 440;
  const h = 42;
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const points = vals.map((v, i) => [(i / (vals.length - 1)) * w, h - ((v - min) / range) * (h - 6) - 3]);
  const d = points.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = `${d} L${w} ${h} L0 ${h} Z`;
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5a1f" stop-opacity="0.35"/><stop offset="1" stop-color="#ff5a1f" stop-opacity="0"/></linearGradient></defs>
    <path d="${area}" fill="url(#sg)"/><path d="${d}" fill="none" stroke="#ff5a1f" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
  </svg>`;
}

function weatherFallback() {
  return { temp_c: 18, wind_kmh: 12, precip_prob_percent: 20, condition: "manuell offen", _fallback: true };
}

function wmoCondition(code) {
  if (code === 0) return "klar";
  if (code <= 3) return "leicht bewölkt";
  if (code <= 48) return "Nebel";
  if (code <= 55) return "Nieselregen";
  if (code <= 65) return "Regen";
  if (code <= 77) return "Schnee";
  if (code <= 82) return "Schauer";
  return "Gewitter";
}

async function fetchWeather() {
  try {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=51.70&longitude=8.72" +
      "&current=temperature_2m,wind_speed_10m,weather_code" +
      "&daily=precipitation_probability_max,wind_speed_10m_max" +
      "&timezone=Europe%2FBerlin&forecast_days=1";
    const resp = await fetch(url);
    if (!resp.ok) return weatherFallback();
    const data = await resp.json();
    const cur = data.current;
    const daily = data.daily;
    if (!cur || typeof cur.temperature_2m !== "number") return weatherFallback();
    const precipArr = daily && daily.precipitation_probability_max;
    const windMaxArr = daily && daily.wind_speed_10m_max;
    const precipProb = (precipArr && typeof precipArr[0] === "number") ? precipArr[0] : 0;
    const windCur = typeof cur.wind_speed_10m === "number" ? cur.wind_speed_10m : 0;
    const windMax = (windMaxArr && typeof windMaxArr[0] === "number") ? windMaxArr[0] : windCur;
    const code = typeof cur.weather_code === "number" ? cur.weather_code : 0;
    return {
      temp_c: cur.temperature_2m,
      wind_kmh: Math.max(windCur, windMax),
      precip_prob_percent: precipProb,
      condition: wmoCondition(code),
      _fallback: false,
    };
  } catch {
    return weatherFallback();
  }
}

async function loadStravaSnapshot() {
  try {
    const statusResp = await fetch("/api/strava/status", { cache: "no-store" });
    if (statusResp.ok) {
      const status = await statusResp.json();
      stravaState = {
        configured: Boolean(status.configured),
        connected: Boolean(status.connected),
        live: false,
        label: status.connected ? "Strava verbunden" : status.configured ? "Strava verbinden" : "Strava Setup fehlt",
        detail: status.connected ? "Live-Sync wird geladen." : status.configured ? "Einmal mit Strava verbinden, dann werden die Aktivitäten live geladen." : "Server braucht STRAVA_CLIENT_ID und STRAVA_CLIENT_SECRET.",
        authUrl: status.authUrl || null,
      };
    }

    const snapshotResp = await fetch("/api/strava/snapshot", { cache: "no-store" });
    if (!snapshotResp.ok) throw new Error("Strava snapshot request failed");
    const data = await snapshotResp.json();
    if (data.ok && data.snapshot) {
      training = normalizeSnapshot(data.snapshot);
      stravaState = {
        configured: true,
        connected: true,
        live: true,
        label: "Strava live",
        detail: `Aktualisiert ${new Date(data.snapshot.updatedAt || Date.now()).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}.`,
        authUrl: null,
      };
      render();
      return;
    }

    const status = data.status || {};
    stravaState = {
      configured: Boolean(status.configured),
      connected: Boolean(status.connected),
      live: false,
      label: !status.configured ? "Strava Setup fehlt" : status.connected ? "Strava Fehler" : "Strava verbinden",
      detail: data.reason === "strava_error" ? (data.message || "Live-Daten konnten nicht geladen werden.") : (!status.configured ? "Server braucht STRAVA_CLIENT_ID und STRAVA_CLIENT_SECRET." : "Einmal mit Strava verbinden."),
      authUrl: status.authUrl || null,
    };
    training = SNAPSHOT;
    render();
  } catch {
    training = SNAPSHOT;
    stravaState = {
      configured: false,
      connected: false,
      live: false,
      label: "Strava Snapshot",
      detail: "Live-Sync nicht erreichbar, statischer Snapshot aktiv.",
      authUrl: null,
    };
    render();
  }
}

function normalizeSnapshot(value) {
  return {
    fitness: Number.isFinite(value.fitness) ? value.fitness : SNAPSHOT.fitness,
    fatigue: Number.isFinite(value.fatigue) ? value.fatigue : SNAPSHOT.fatigue,
    form: Number.isFinite(value.form) ? value.form : SNAPSHOT.form,
    streak: Number.isFinite(value.streak) ? value.streak : SNAPSHOT.streak,
    weekKm: Number.isFinite(value.weekKm) ? value.weekKm : SNAPSHOT.weekKm,
    weekCount: Number.isFinite(value.weekCount) ? value.weekCount : SNAPSHOT.weekCount,
    sportLastSeen: value.sportLastSeen || SNAPSHOT.sportLastSeen,
    ctlSpark: Array.isArray(value.ctlSpark) && value.ctlSpark.length ? value.ctlSpark : SNAPSHOT.ctlSpark,
    activities: Array.isArray(value.activities) && value.activities.length ? value.activities : SNAPSHOT.activities,
    heartrateZones: value.heartrateZones || null,
  };
}

async function loadRecovery() {
  const keys = await Storage.listPrefix("recovery:");
  const rows = [];
  for (const key of keys) {
    try {
      const value = await Storage.get(key);
      if (value) rows.push(JSON.parse(value));
    } catch {
      // ignore one broken row
    }
  }
  rows.sort((a, b) => (a.date < b.date ? 1 : -1));
  recoveryHist = rows;
  recovery = rows.find((row) => row.date === todayKey) || null;
}

async function saveRecovery(entry) {
  const next = { ...entry, date: todayKey, updatedAt: new Date().toISOString() };
  await Storage.set(`recovery:${todayKey}`, JSON.stringify(next));
  recovery = next;
  recoveryHist = recoveryHist.filter((row) => row.date !== todayKey);
  recoveryHist.unshift(next);
  render();
  pushBackup().catch(() => {});
}

function recoveryBaseline() {
  const past = recoveryHist.filter((row) => row.date !== todayKey);
  const avg = (items) => (items.length ? items.reduce((sum, value) => sum + value, 0) / items.length : null);
  return {
    rhr: avg(past.filter((row) => Number.isFinite(row.rhr)).map((row) => row.rhr)),
    hrv: avg(past.filter((row) => Number.isFinite(row.hrv)).map((row) => row.hrv)),
    n: past.length,
  };
}

function recoveryScore(entry) {
  if (!entry) return null;
  const base = recoveryBaseline();
  const points = [];
  const notes = [];

  if (Number.isFinite(entry.sleep)) {
    const score = entry.sleep >= 7.5 ? 100 : entry.sleep >= 7 ? 88 : entry.sleep >= 6 ? 70 : entry.sleep >= 5 ? 48 : 30;
    points.push(score);
    notes.push(entry.sleep >= 7.5 ? "Schlafdauer top" : entry.sleep >= 6 ? "Schlaf ok" : "zu wenig Schlaf");
  }

  if (Number.isFinite(entry.rhr)) {
    if (base.rhr) {
      const delta = entry.rhr - base.rhr;
      points.push(Math.max(20, Math.min(100, 85 - delta * 6)));
      notes.push(delta <= -2 ? "Ruhepuls niedrig" : delta >= 3 ? "Ruhepuls erhöht" : "Ruhepuls normal");
    } else {
      points.push(75);
      notes.push("Ruhepuls ohne Baseline");
    }
  }

  if (Number.isFinite(entry.hrv)) {
    if (base.hrv) {
      const delta = (entry.hrv - base.hrv) / base.hrv;
      points.push(Math.max(20, Math.min(100, 80 + delta * 120)));
      notes.push(delta >= 0.05 ? "HRV über Schnitt" : delta <= -0.1 ? "HRV gedämpft" : "HRV normal");
    } else {
      points.push(75);
      notes.push("HRV ohne Baseline");
    }
  }

  if (Number.isFinite(entry.feel)) points.push(((entry.feel - 1) / 4) * 100);
  if (!points.length) return null;

  const score = Math.round(points.reduce((sum, value) => sum + value, 0) / points.length);
  const status = score >= 80
    ? { t: "Gut erholt", c: "var(--green)" }
    : score >= 60
      ? { t: "Solide", c: "var(--blue)" }
      : score >= 45
        ? { t: "Mäßig", c: "var(--amber)" }
        : { t: "Erschöpft", c: "var(--orange)" };
  return { score, status, notes, base };
}

function buildRecommendation(metrics, forecast) {
  const rs = recoveryScore(recovery);
  if (rs && rs.score < 45) {
    return {
      badge: "rest",
      badgeText: "ERHOLEN",
      text: `Dein Erholungs-Score liegt heute bei <b>${rs.score}/100</b>. Heute besser Ruhetag oder nur lockeres Dehnen.`,
      meta: `Erholung ${rs.score} · Form ${metrics.form > 0 ? "+" : ""}${metrics.form}`,
    };
  }
  if (metrics.form <= -22 || metrics.streak >= 6) {
    return {
      badge: "rest",
      badgeText: "RUHETAG",
      text: `Deine Form liegt bei <b>${metrics.form}</b>. Aktive Erholung reicht heute.`,
      meta: `Form ${metrics.form} · ${metrics.streak} Tage Serie`,
    };
  }

  const rainy = forecast.precip_prob_percent >= 55;
  const windy = forecast.wind_kmh >= 30;
  const cold = forecast.temp_c < 6;
  const hot = forecast.temp_c > 29;
  let pick = "RENNRAD";
  let why = `Gute Bedingungen: ${Math.round(forecast.temp_c)}°C, moderater Wind, trocken.`;
  if (rainy) { pick = "DEHNEN"; why = `Regen wahrscheinlich (${forecast.precip_prob_percent}%). Drinnen ist sinnvoller.`; }
  else if (windy) { pick = "LAUF"; why = `Bis ${Math.round(forecast.wind_kmh)} km/h Wind. Laufen passt besser als Rennrad.`; }
  else if (cold) { pick = "LAUF"; why = `Bei ${Math.round(forecast.temp_c)}°C ist ein Lauf effizienter als eine lange Ausfahrt.`; }
  else if (hot) { pick = "SUP"; why = `Bei ${Math.round(forecast.temp_c)}°C ist Wasserzeit angenehmer als Hitze auf dem Rad.`; }

  const lowRecovery = rs && rs.score < 60;
  const badge = metrics.form < -8 || lowRecovery ? "easy" : "go";
  return {
    badge,
    badgeText: badge === "go" ? "GO" : "LOCKER",
    text: `Heutiger Vorschlag: <b>${pick}</b>. ${why}${rs ? ` Erholung: ${rs.score}/100.` : ""}`,
    meta: `Form ${metrics.form > 0 ? "+" : ""}${metrics.form} · ${Math.round(forecast.temp_c)}°C · Wind ${Math.round(forecast.wind_kmh)} km/h${forecast._fallback ? " · Wetter geschätzt" : ""}`,
  };
}

function renderActivity(activity, idx) {
  const info = sportInfo(activity.sport_type);
  const summary = activity.summary || {};
  const km = fmtKm(summary);
  const mins = Math.round((summary.moving_time || 0) / 60);
  const date = new Date(activity.start_local).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
  const rawLoad = Number.isFinite(summary.load)
    ? summary.load
    : Number.isFinite(summary.relative_effort)
      ? summary.relative_effort
      : Math.round(((summary.moving_time || 0) / 60) * 4);
  const load = fmtLoad(rawLoad);
  const loadSourceLabel = summary.load_source === 'hr_zones'
    ? 'HF-Zonen'
    : summary.load_source === 'relative_effort'
      ? 'Strava'
      : summary.load_source === 'estimate'
        ? 'Schätzung'
        : '';
  const hr = summary.heartrate || {};
  const hrText = hr.avg ? `${hr.avg} bpm${hr.max ? ` (max ${hr.max})` : ''}` : '';
  return `<div class="activity metric" data-activity="${idx}">
    <div class="chip" style="background: color-mix(in srgb, ${info.color} 18%, transparent); color: ${info.color}; border: 1px solid color-mix(in srgb, ${info.color} 45%, transparent);">${info.label}</div>
    <div class="act-info"><div class="act-name">${escapeHtml(activity.name || info.label)}</div><div class="act-meta">${date} · ${km} km · ${mins} min${hrText ? ` · ${ICONS.heart}${hrText}` : ''}</div></div>
    <div class="act-load">${load}<span class="l">LOAD${loadSourceLabel ? ` · ${loadSourceLabel}` : ''}</span></div>
  </div>`;
}

function renderRecoveryCard() {
  const rs = recoveryScore(recovery);
  if (!rs) {
    return `<div class="card">
      <div class="card-title"><span class="card-title-icon">${ICONS.moon}Regeneration</span><button class="wbtn" id="recEdit">Werte eintragen</button></div>
      <div class="placeholder"><b>Noch keine Werte für heute.</b> Trag Schlaf, Ruhepuls, HRV und Gefühl ein. Der Coach speichert die Werte lokal auf diesem Gerät und lernt deine Baseline über mehrere Tage.</div>
    </div>`;
  }
  const chips = [];
  if (Number.isFinite(recovery.sleep)) chips.push(`<div class="rec-chip"><span>Schlaf</span><b>${recovery.sleep} h</b></div>`);
  if (Number.isFinite(recovery.rhr)) chips.push(`<div class="rec-chip"><span>Ruhepuls</span><b>${recovery.rhr}</b></div>`);
  if (Number.isFinite(recovery.hrv)) chips.push(`<div class="rec-chip"><span>HRV</span><b>${recovery.hrv} ms</b></div>`);
  if (Number.isFinite(recovery.feel)) chips.push(`<div class="rec-chip"><span>Gefühl</span><b>${["", "schlecht", "mäßig", "ok", "gut", "top"][recovery.feel]}</b></div>`);
  return `<div class="card">
    <div class="card-title"><span class="card-title-icon">${ICONS.moon}Regeneration</span><button class="wbtn" id="recEdit">Bearbeiten</button></div>
    <div class="rec-head" id="recScoreClick">
      <div class="rec-ring" style="--p:${rs.score};--col:${rs.status.c};"><div class="rec-ring-inner"><div class="rec-score">${rs.score}</div><div class="rec-of">/100</div></div></div>
      <div style="flex:1;"><div class="rec-status" style="color:${rs.status.c};">${rs.status.t}</div><div class="rec-sub">Erholungs-Score · tippen für Details</div><div class="rec-chips">${chips.join("")}</div></div>
    </div>
  </div>`;
}


function renderHistory() {
  if (!recoveryHist.length) return `<div class="placeholder">Noch keine gespeicherte Historie.</div>`;
  return recoveryHist.slice(0, 7).map((row) => {
    const rs = recoveryScore(row);
    return `<div class="hist-row"><div><div>${new Date(row.date).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" })}</div><div class="hist-date">${row.sleep != null ? row.sleep : "-"}h Schlaf · HRV ${row.hrv != null ? row.hrv : "-"}</div></div><div class="hist-score" style="color:${rs ? rs.status.c : "var(--muted)"}">${rs ? rs.score : "-"}</div></div>`;
  }).join("");
}


function weekHeartrateOverview() {
  const hrActivities = (training.activities || []).filter((a) => {
    const hr = (a.summary && a.summary.heartrate) || {};
    return Number.isFinite(hr.avg) && hr.avg > 0;
  });
  if (!hrActivities.length) return '';
  const avg = Math.round(hrActivities.reduce((sum, a) => sum + a.summary.heartrate.avg, 0) / hrActivities.length);
  const zones = training.heartrateZones && Array.isArray(training.heartrateZones.zones) ? training.heartrateZones.zones : null;
  const zonesText = zones ? ` · Zonen: ${zones.join(' / ')} bpm` : '';
  return `<div class="hr-overview"><span class="hr-icon">${ICONS.heart}</span><span>Ø HF letzte ${hrActivities.length} Einheit${hrActivities.length > 1 ? 'en' : ''}: <b>${avg} bpm</b>${zonesText}</span></div>`;
}

function render() {
  const rec = buildRecommendation(training, weather);
  root.innerHTML = `
    <div class="eyebrow"><span><span class="dot"></span>STRAVA · WEWER</span><span>${new Date().toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" })}</span></div>
    <div class="head-unit">
      <div class="metric" data-metric="fitness">
        <div class="field-label">Fitness Score (CTL) <span class="info-i">i</span></div>
        <div class="hero-num">${training.fitness}<span class="unit">PUNKTE</span></div>
        <div class="hero-sub">Chronische Trainingslast · 42-Tage-Trend</div>
        ${sparkline(training.ctlSpark)}
      </div>
      <div class="gauge-row">
        <div class="gauge metric" data-metric="fatigue"><div class="field-label">Fatigue <span class="info-i">i</span></div><div class="v orange">${training.fatigue}</div></div>
        <div class="gauge metric" data-metric="form"><div class="field-label">Form <span class="info-i">i</span></div><div class="v ${training.form >= 0 ? "green" : "amber"}">${training.form > 0 ? "+" : ""}${training.form}</div></div>
        <div class="gauge metric" data-metric="week"><div class="field-label">Woche <span class="info-i">i</span></div><div class="v blue">${training.weekKm}<span style="font-size:11px;color:var(--muted);"> km</span></div></div>
      </div>
    </div>
    <section class="section"><div class="card call-card"><div class="call-badge ${rec.badge}">${rec.badgeText}</div><div style="flex:1;"><div class="call-text">${rec.text}</div><div class="call-meta">${rec.meta}</div><button class="weather-chip ${weather._fallback ? 'manual' : 'live'}" id="weatherInfo">${weather._fallback ? ICONS.cloud : ICONS.sun}${weather._fallback ? 'Wetter geschätzt' : 'Wetter live · Wewer'}</button></div></div></section>
    <section class="section">${renderRecoveryCard()}</section>
    <section class="section"><div class="card"><div class="card-title"><span class="card-title-icon">${ICONS.bolt}Letzte Aktivitäten</span></div>${weekHeartrateOverview()}${training.activities.map(renderActivity).join("")}</div></section>
    <section class="section"><div class="card"><div class="card-title"><span class="card-title-icon">${ICONS.clock}Recovery-Historie</span></div>${renderHistory()}</div></section>
  `;
  bindEvents();
}

function bindEvents() {
  root.querySelectorAll("[data-metric]").forEach((el) => el.addEventListener("click", () => openMetricPopup(el.dataset.metric)));
  root.querySelectorAll("[data-activity]").forEach((el) => el.addEventListener("click", () => openActivityPopup(training.activities[Number(el.dataset.activity)])));
  const elRecEdit = root.querySelector("#recEdit");
  if (elRecEdit) elRecEdit.addEventListener("click", openRecoveryInput);
  const elRecScore = root.querySelector("#recScoreClick");
  if (elRecScore) elRecScore.addEventListener("click", openRecoveryPopup);
  const elWeather = root.querySelector("#weatherInfo");
  if (elWeather) elWeather.addEventListener("click", function() {
    if (weather._fallback) {
      showPopup(`<div class="pop-eyebrow">Wetter</div><div class="pop-value" style="color:var(--amber);">Geschätzt</div><div class="pop-body">Live-Wetterdaten konnten nicht geladen werden. Der Coach nutzt Fallback-Werte (${weather.temp_c}°C, Wind ${weather.wind_kmh} km/h, ${weather.precip_prob_percent}% Regenwahrscheinlichkeit).</div>`, "var(--amber)");
    } else {
      showPopup(`<div class="pop-eyebrow">Wetter live · Wewer</div><div class="pop-value" style="color:var(--blue);">${Math.round(weather.temp_c)}°C</div><div class="pop-status" style="color:var(--blue);">${weather.condition}</div><div class="stat-grid"><div class="stat-row"><span>Wind</span><b>${Math.round(weather.wind_kmh)} km/h</b></div><div class="stat-row"><span>Regen</span><b>${weather.precip_prob_percent}%</b></div><div class="stat-row"><span>Quelle</span><b>Open-Meteo</b></div></div>`, "var(--blue)");
    }
  });
}

function metricInfo(key) {
  if (key === "fitness") return { accent: "var(--orange)", eyebrow: "Fitness Score · CTL", value: training.fitness, status: "Solide Grundlage", body: "Der Fitness Score ist deine 42-Tage-Trainingslast. Er steigt langsam durch konstante Belastung und bildet deine Ausdauerbasis ab." };
  if (key === "fatigue") return { accent: "var(--orange)", eyebrow: "Fatigue · ATL", value: training.fatigue, status: "Im Rahmen", body: "Fatigue ist die kurzfristige 7-Tage-Belastung. Sie zeigt, wie viel Training dir aktuell noch in den Beinen steckt." };
  if (key === "form") return { accent: "var(--green)", eyebrow: "Form · TSB", value: `${training.form > 0 ? "+" : ""}${training.form}`, status: "Frisch & erholt", body: "Form ist Fitness minus Fatigue. Positive Werte sprechen eher für Frische, stark negative Werte eher für Erholungsbedarf." };
  return { accent: "var(--blue)", eyebrow: "Diese Woche", value: `${training.weekKm} km`, status: `${training.weekCount} Einheiten`, body: "Das Wochenvolumen zeigt die letzten 7 Tage. Gleichmäßige Steigerung baut Fitness auf, ohne unnötig Risiko zu erzeugen." };
}

function openMetricPopup(key) {
  const info = metricInfo(key);
  showPopup(`<div class="pop-eyebrow">${info.eyebrow}</div><div class="pop-value" style="color:${info.accent};">${info.value}</div><div class="pop-status" style="color:${info.accent};">${info.status}</div><div class="pop-body">${info.body}</div>`, info.accent);
}

function openActivityPopup(activity) {
  if (!activity) return;
  const info = sportInfo(activity.sport_type);
  const summary = activity.summary || {};
  const km = fmtKm(summary);
  const mins = Math.round((summary.moving_time || 0) / 60);
  const rawLoad = Number.isFinite(summary.load)
    ? summary.load
    : Number.isFinite(summary.relative_effort)
      ? summary.relative_effort
      : Math.round(((summary.moving_time || 0) / 60) * 4);
  const load = fmtLoad(rawLoad);
  const loadSourceLabel = summary.load_source === 'hr_zones'
    ? 'HF-Zonen'
    : summary.load_source === 'relative_effort'
      ? 'Strava'
      : summary.load_source === 'estimate'
        ? 'Schätzung'
        : '';
  const speed = fmtSpeed(summary);
  const hr = summary.heartrate || {};
  const rows = [
    ["Distanz", `${km} km`],
    ["Dauer", `${mins} min`],
    ["Schnitt", `${speed} km/h`],
    ["Load", `${load}${loadSourceLabel ? ` (${loadSourceLabel})` : ''}`],
    Number.isFinite(summary.elevation_gain) ? ["Höhenmeter", `${Math.round(summary.elevation_gain)} m`] : null,
    hr.avg ? ["Ø HF", `${hr.avg} bpm`] : null,
    hr.max ? ["Max HF", `${hr.max} bpm`] : null,
    Number.isFinite(summary.total_calories) ? ["Kalorien", `${Math.round(summary.total_calories)} kcal`] : null,
  ].filter(Boolean);
  showPopup(`<div class="pop-eyebrow">${new Date(activity.start_local).toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long" })}</div><div class="pop-value" style="color:${info.color};font-size:30px;line-height:1.05;">${escapeHtml(activity.name || info.label)}</div><div class="pop-status" style="color:${info.color};">${info.label} · Load ${load}</div><div class="stat-grid">${rows.map((row) => `<div class="stat-row"><span>${row[0]}</span><b>${row[1]}</b></div>`).join("")}</div><div class="pop-eyebrow" style="margin-top:18px;color:${info.color};">Coach-Analyse</div><div class="pop-body" style="margin-top:6px;">${buildActivityAnalysis(activity.sport_type, { km: Number(km), mins, speed: Number(speed), load: Number(load), hasHr: hasActivityHeartrate(summary), loadSource: summary.load_source, hasRE: Number.isFinite(summary.relative_effort), elev: summary.elevation_gain })}</div>`, info.color);
}

function buildActivityAnalysis(sport, data) {
  const ref = REF[sport];
  const sourceNote = data.loadSource === 'hr_zones'
    ? 'Der Load wurde aus deinen Strava-HF-Zonen geschätzt.'
    : data.loadSource === 'estimate'
      ? 'Für diese Fahrt lag kein Strava-Effort oder keine HF vor, daher ist der Load geschätzt.'
      : '';
  const hasHr = data.hasHr;
  const kmDisplay = hasHr ? data.km.toFixed(1) : String(Math.round(data.km));
  const speedDisplay = hasHr ? data.speed.toFixed(1) : String(Math.round(data.speed));
  if (sport === "Ride" && ref) {
    const distance = data.km >= ref.avg_km * 1.2 ? "klar über deinem Schnitt" : data.km <= ref.avg_km * 0.55 ? "eher kurz und locker" : "typisch für deine Ausfahrten";
    const load = data.load >= ref.avg_load * 1.4 ? "deutlich fordernd" : data.load <= ref.avg_load * 0.5 ? "niedrig und regenerativ" : "im normalen Bereich";
    return `Mit <b>${kmDisplay} km</b> war die Einheit ${distance}. Das Tempo lag bei <b>${speedDisplay} km/h</b>, der Load war <b>${load}</b>. ${sourceNote}`;
  }
  if (sport === "StandUpPaddling") return `SUP ist ein guter Ausgleich: Rumpf, Gleichgewicht und aktive Erholung bei wenig Beinlast. Load <b>${data.load}</b> bestätigt die lockere Belastung. ${sourceNote}`;
  if (sport === "Walk") return `Lockerer Spaziergang: gut für Kreislauf und Regeneration, ohne deine Trainingslast stark zu erhöhen. ${sourceNote}`;
  return `<b>${data.km} km</b> in ${data.mins} min bei Load <b>${data.load}</b>. Für diese Sportart sammelt der Coach mit mehr Einträgen bessere Vergleichswerte. ${sourceNote}`;
}

function openRecoveryInput() {
  const entry = recovery || {};
  showPopup(`<div class="pop-eyebrow" style="color:var(--green);">Regeneration eintragen</div><div class="pop-body" style="margin:8px 0 4px;color:var(--muted);font-size:13px;">Aus Apple Health ablesen. Leer lassen, was du nicht hast.</div><div class="rec-form">
    <label>Schlafdauer <span>in Stunden</span><input id="inSleep" type="number" step="0.1" inputmode="decimal" placeholder="7.5" value="${entry.sleep != null ? entry.sleep : ""}"></label>
    <label>Ruhepuls <span>bpm</span><input id="inRhr" type="number" step="1" inputmode="numeric" placeholder="52" value="${entry.rhr != null ? entry.rhr : ""}"></label>
    <label>HRV <span>ms</span><input id="inHrv" type="number" step="1" inputmode="numeric" placeholder="65" value="${entry.hrv != null ? entry.hrv : ""}"></label>
    <label>Gefühl heute <span>subjektiv</span><select id="inFeel"><option value="">-</option>${[1, 2, 3, 4, 5].map((v) => `<option value="${v}" ${entry.feel === v ? "selected" : ""}>${["", "schlecht", "mäßig", "ok", "gut", "top"][v]}</option>`).join("")}</select></label>
  </div><div id="recWarn" style="color:var(--orange);font-size:12px;margin-top:12px;min-height:14px;"></div><button class="rec-save" id="recSave">Speichern</button>`, "var(--green)");
  document.getElementById("recSave").addEventListener("click", async () => {
    const entry = {
      sleep: readNumber("inSleep"),
      rhr: readNumber("inRhr"),
      hrv: readNumber("inHrv"),
      feel: readNumber("inFeel"),
    };
    if (!Object.values(entry).some(Number.isFinite)) {
      document.getElementById("recWarn").textContent = "Bitte mindestens einen Wert eingeben.";
      return;
    }
    await saveRecovery(entry);
    closePopup();
  });
}

function openRecoveryPopup() {
  const rs = recoveryScore(recovery);
  if (!rs) return;
  const body = `Dein Erholungs-Score von <b>${rs.score}/100</b> nutzt die Werte von heute: ${rs.notes.join(", ")}.<br><br>${rs.base.n < 3 ? `Für Ruhepuls und HRV lerne ich noch deine persönliche Baseline (${rs.base.n}/3 Tage). ` : ""}<b>Zusammen mit Form ${training.form > 0 ? "+" : ""}${training.form}</b> ergibt sich die heutige Empfehlung.`;
  showPopup(`<div class="pop-eyebrow" style="color:${rs.status.c};">Regeneration · heute</div><div class="pop-value" style="color:${rs.status.c};">${rs.score}<span style="font-size:18px;color:var(--muted);"> /100</span></div><div class="pop-status" style="color:${rs.status.c};">${rs.status.t}</div><div class="pop-body">${body}</div>`, rs.status.c);
}

async function exportData() {
  const records = await Storage.exportAll();
  const payload = { app: "fitness-coach", version: 1, exportedAt: new Date().toISOString(), records };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `fitness-coach-backup-${todayKey}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

async function importData(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const payload = JSON.parse(await file.text());
  if (!Array.isArray(payload.records)) throw new Error("Ungültiges Backup");
  await Storage.importAll(payload.records);
  await loadRecovery();
  render();
  event.target.value = "";
  pushBackup().catch(() => {});
}

async function pushBackup() {
  const records = await Storage.exportAll();
  if (!records.length) return;
  const resp = await fetch("/api/backup", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ records }),
  });
  if (!resp.ok) throw new Error("Backup konnte nicht gespeichert werden");
  serverBackupActive = true;
}

async function pullBackup() {
  const resp = await fetch("/api/backup");
  if (!resp.ok) return null;
  serverBackupActive = true;
  return resp.json();
}

async function initDataSync() {
  try {
    await loadRecovery();
    render();
  } catch (err) {
    console.error("loadRecovery failed:", err);
  }

  try {
    const backup = await pullBackup();
    if (backup && Array.isArray(backup.records) && backup.records.length) {
      await Storage.importAll(backup.records);
      await loadRecovery();
    }
    render();
  } catch (err) {
    console.error("pullBackup failed:", err);
  }

  pushBackup().then(function() {
    render();
  }).catch(function(err) {
    console.error("pushBackup failed:", err);
  });
}

function showPopup(inner, accent) {
  closePopup();
  const overlay = document.createElement("div");
  overlay.className = "pop-overlay";
  overlay.innerHTML = `<div class="pop" style="--accent:${accent};"><div class="pop-grip"></div>${inner}</div>`;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add("show"));
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closePopup();
  });
}

function closePopup() {
  const overlay = document.querySelector(".pop-overlay");
  if (!overlay) return;
  overlay.classList.remove("show");
  setTimeout(() => overlay.remove(), 180);
}

function readNumber(id) {
  const domEl = document.getElementById(id);
  const raw = domEl ? domEl.value.trim() : "";
  if (!raw) return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[char]));
}

function openStravaModal() {
  const col = stravaState.live ? "var(--green)" : stravaState.connected ? "var(--blue)" : "var(--amber)";
  const label = stravaState.live ? "LIVE" : stravaState.connected ? "VERBUNDEN" : stravaState.configured ? "NICHT VERBUNDEN" : "NICHT EINGERICHTET";
  let actions = "";
  if (!stravaState.live && stravaState.authUrl) {
    actions += `<div class="data-actions"><button class="data-btn" id="stravaModalConnect">Mit Strava verbinden</button></div>`;
  }
  if (stravaState.connected || stravaState.live) {
    actions += `<div class="data-actions"><button class="data-btn danger" id="stravaModalDisconnect">Strava trennen</button></div>`;
  }
  showPopup(
    `<div class="pop-eyebrow" style="color:${col};">Strava Verbindung</div>
     <div class="pop-value" style="color:${col};">${label}</div>
     <div class="pop-body" style="margin-top:10px;">${escapeHtml(stravaState.detail)}</div>${actions}`,
    col
  );
  const connectBtn = document.getElementById("stravaModalConnect");
  if (connectBtn && stravaState.authUrl) {
    connectBtn.addEventListener("click", () => { window.location.href = stravaState.authUrl; });
  }
  const disconnectBtn = document.getElementById("stravaModalDisconnect");
  if (disconnectBtn) {
    disconnectBtn.addEventListener("click", async () => {
      disconnectBtn.textContent = "Trennen…";
      disconnectBtn.disabled = true;
      await fetch("/api/strava/disconnect", { method: "POST" }).catch(() => {});
      closePopup();
      await loadStravaSnapshot();
    });
  }
}

function openDataModal() {
  const backupInfo = serverBackupActive
    ? "<b>Automatisches Backup aktiv.</b> Daten werden lokal und auf dem Server gesichert."
    : "<b>Lokal gespeichert.</b> IndexedDB mit localStorage-Fallback. Server-Backup wird aktiv, sobald der Server erreichbar ist.";
  showPopup(
    `<div class="pop-eyebrow" style="color:var(--blue);">Daten &amp; Backup</div>
     <div class="pop-body" style="margin:12px 0 16px;">${backupInfo}</div>
     <div class="data-actions">
       <button class="data-btn" id="modalExport">JSON exportieren</button>
       <label class="data-btn" for="modalImportFile">JSON importieren</label>
       <input id="modalImportFile" type="file" accept="application/json" hidden>
     </div>`,
    "var(--blue)"
  );
  document.getElementById("modalExport")?.addEventListener("click", exportData);
  document.getElementById("modalImportFile")?.addEventListener("change", async (e) => {
    await importData(e);
    closePopup();
  });
}

function openSettingsModal() {
  showPopup(
    `<div class="pop-eyebrow" style="color:var(--purple);">Einstellungen</div>
     <div class="pop-value" style="color:var(--muted);font-size:28px;line-height:1.1;">Bald verfügbar</div>
     <div class="pop-body" style="margin-top:12px;">Einstellungen werden in einer späteren Version hinzugefügt.</div>`,
    "var(--purple)"
  );
}

function initMenu() {
  const btn = document.getElementById("menuBtn");
  const dropdown = document.getElementById("menuDropdown");
  if (!btn || !dropdown) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = dropdown.classList.toggle("open");
    btn.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", String(open));
  });

  document.addEventListener("click", () => {
    dropdown.classList.remove("open");
    btn.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
  });

  dropdown.addEventListener("click", (e) => {
    e.stopPropagation();
    const action = e.target.closest("[data-action]")?.dataset.action;
    if (!action) return;
    dropdown.classList.remove("open");
    btn.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
    if (action === "strava") openStravaModal();
    else if (action === "data") openDataModal();
    else if (action === "settings") openSettingsModal();
  });
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

render();
initMenu();
initDataSync();
loadStravaSnapshot();
fetchWeather().then(function(w) { weather = w; render(); }).catch(function(err) { console.error("fetchWeather failed:", err); });
