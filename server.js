'use strict';
const http = require('node:http');
const fs   = require('node:fs');
const path = require('node:path');

const PORT        = Number(process.env.PORT || 5176);
const ROOT        = __dirname;
const DATA_DIR    = path.join(ROOT, 'data');
const BACKUP_FILE = path.join(DATA_DIR, 'backup.json');
const STRAVA_TOKEN_FILE  = path.join(DATA_DIR, 'strava-token.json');
const STRAVA_CONFIG_FILE = path.join(DATA_DIR, 'strava-config.json');
const STRAVA_ZONES_FILE  = path.join(DATA_DIR, 'athlete-zones.json');
const STRAVA_SCOPE = 'read,activity:read_all';

let stravaConfig = { clientId: '', clientSecret: '' };

function loadStravaConfig() {
  const file = readJsonFile(STRAVA_CONFIG_FILE);
  stravaConfig = {
    clientId:     (file && file.clientId)     || process.env.STRAVA_CLIENT_ID     || '',
    clientSecret: (file && file.clientSecret) || process.env.STRAVA_CLIENT_SECRET || '',
  };
}

const MIME = {
  '.html':        'text/html; charset=utf-8',
  '.js':          'application/javascript; charset=utf-8',
  '.css':         'text/css; charset=utf-8',
  '.json':        'application/json; charset=utf-8',
  '.svg':         'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
  '.ico':         'image/x-icon',
  '.png':         'image/png',
};

function readBackup() {
  try {
    return JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf8'));
  } catch {
    return { app: 'fitness-coach', version: 1, updatedAt: null, records: [] };
  }
}

function writeBackup(data) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 2));
}

function readJsonFile(file, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJsonFile(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function jsonError(res, status, message) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify({ error: message }));
}

function jsonOk(res, data) {
  res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const text = Buffer.concat(chunks).toString('utf8');
      if (!text.trim()) { resolve({}); return; }
      const contentType = req.headers['content-type'] || '';
      if (contentType.includes('application/x-www-form-urlencoded')) {
        try {
          const params = new URLSearchParams(text);
          const obj = {};
          for (const [key, value] of params) obj[key] = value;
          resolve(obj);
          return;
        } catch { reject(new Error('Invalid form data')); return; }
      }
      try { resolve(JSON.parse(text)); }
      catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

const SLEEP_KEY = 'latest-sleep';

function readLatestSleep() {
  const backup = readBackup();
  const record = backup.records.find(r => r.k === SLEEP_KEY);
  if (!record) return null;
  try { return JSON.parse(record.v); } catch { return null; }
}

function writeLatestSleep(entry) {
  const backup = readBackup();
  const map = new Map(backup.records.map(r => [r.k, r.v]));
  map.set(SLEEP_KEY, JSON.stringify(entry));
  writeBackup({
    app: 'fitness-coach',
    version: backup.version || 1,
    updatedAt: new Date().toISOString(),
    records: [...map.entries()].map(([k, v]) => ({ k, v })),
  });
  return entry;
}

function normalizeSleep(input) {
  const out = {
    durationHours: undefined,
    bedTime: undefined,
    wakeTime: undefined,
    quality: undefined,
    heartRateAvg: undefined,
    spo2Avg: undefined,
    remMinutes: undefined,
    deepMinutes: undefined,
    lightMinutes: undefined,
    awakeMinutes: undefined,
    source: undefined,
    updatedAt: new Date().toISOString(),
  };

  function pick(...keys) {
    for (const key of keys) {
      if (input[key] === undefined || input[key] === null || input[key] === '') continue;
      return input[key];
    }
    return undefined;
  }

  const duration = pick('durationHours', 'duration', 'sleep', 'hours');
  if (duration !== undefined) {
    const parsed = Number(duration);
    if (Number.isFinite(parsed)) out.durationHours = parsed;
  }

  const bed = pick('bedTime', 'bedtime', 'start', 'bedTimeISO', 'einschlafzeit');
  if (bed) out.bedTime = String(bed);

  const wake = pick('wakeTime', 'waketime', 'end', 'wakeTimeISO', 'aufwachzeit');
  if (wake) out.wakeTime = String(wake);

  if (out.bedTime && out.wakeTime && out.durationHours === undefined) {
    const startMs = new Date(out.bedTime).getTime();
    const endMs = new Date(out.wakeTime).getTime();
    if (!Number.isNaN(startMs) && !Number.isNaN(endMs) && endMs > startMs) {
      out.durationHours = (endMs - startMs) / (60 * 60 * 1000);
    }
  }

  const quality = pick('quality', 'sleepQuality', 'score');
  if (quality !== undefined) {
    const parsed = Number(quality);
    if (Number.isFinite(parsed)) out.quality = parsed;
  }

  const hr = pick('heartRateAvg', 'heartRate', 'hr', 'rhr', 'averageHeartRate');
  if (hr !== undefined) {
    const parsed = Number(hr);
    if (Number.isFinite(parsed)) out.heartRateAvg = parsed;
  }

  const spo2 = pick('spo2Avg', 'spo2', 'bloodOxygen', 'averageSpo2');
  if (spo2 !== undefined) {
    const parsed = Number(spo2);
    if (Number.isFinite(parsed)) out.spo2Avg = parsed;
  }

  const rem = pick('remMinutes', 'rem', 'remMin');
  if (rem !== undefined) {
    const parsed = Number(rem);
    if (Number.isFinite(parsed)) out.remMinutes = parsed;
  }

  const deep = pick('deepMinutes', 'deep', 'deepMin', 'deepSleep');
  if (deep !== undefined) {
    const parsed = Number(deep);
    if (Number.isFinite(parsed)) out.deepMinutes = parsed;
  }

  const light = pick('lightMinutes', 'light', 'lightMin', 'lightSleep');
  if (light !== undefined) {
    const parsed = Number(light);
    if (Number.isFinite(parsed)) out.lightMinutes = parsed;
  }

  const awake = pick('awakeMinutes', 'awake', 'awakeMin', 'wakeupTime');
  if (awake !== undefined) {
    const parsed = Number(awake);
    if (Number.isFinite(parsed)) out.awakeMinutes = parsed;
  }

  const source = pick('source', 'device', 'app');
  if (source) out.source = String(source);

  return out;
}

function validateSleep(entry) {
  return Number.isFinite(entry.durationHours) || (entry.bedTime && entry.wakeTime);
}

function stravaConfigured() {
  return Boolean(stravaConfig.clientId && stravaConfig.clientSecret);
}

function publicBaseUrl(req) {
  const proto = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host || `localhost:${PORT}`;
  return `${proto}://${host}`;
}

function stravaStatus(req) {
  const token = readJsonFile(STRAVA_TOKEN_FILE);
  return {
    configured: stravaConfigured(),
    connected: Boolean(token && token.access_token && token.refresh_token),
    athlete: token && token.athlete ? { id: token.athlete.id, username: token.athlete.username, firstname: token.athlete.firstname } : null,
    expiresAt: token && token.expires_at ? new Date(token.expires_at * 1000).toISOString() : null,
    authUrl: stravaConfigured() ? `${publicBaseUrl(req)}/api/strava/oauth/start` : null,
  };
}

async function exchangeStravaToken(params) {
  const resp = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: stravaConfig.clientId,
      client_secret: stravaConfig.clientSecret,
      ...params,
    }),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data.message || 'Strava token request failed');
  writeJsonFile(STRAVA_TOKEN_FILE, data);
  return data;
}

async function getValidStravaToken() {
  let token = readJsonFile(STRAVA_TOKEN_FILE);
  if (!stravaConfigured()) throw new Error('Strava is not configured');
  if (!token || !token.access_token || !token.refresh_token) throw new Error('Strava is not connected');
  const expiresAtMs = Number(token.expires_at || 0) * 1000;
  if (Date.now() + 60_000 < expiresAtMs) return token;
  token = await exchangeStravaToken({ grant_type: 'refresh_token', refresh_token: token.refresh_token });
  return token;
}

async function fetchStravaActivities() {
  const token = await getValidStravaToken();
  const after = Math.floor((Date.now() - 60 * 24 * 60 * 60 * 1000) / 1000);
  const url = new URL('https://www.strava.com/api/v3/athlete/activities');
  url.searchParams.set('after', String(after));
  url.searchParams.set('per_page', '100');
  const resp = await fetch(url, { headers: { Authorization: `Bearer ${token.access_token}` } });
  const data = await resp.json().catch(() => null);
  if (!resp.ok || !Array.isArray(data)) throw new Error('Strava activities request failed');
  return data;
}

async function fetchStravaAthleteZones() {
  const token = await getValidStravaToken();
  const resp = await fetch('https://www.strava.com/api/v3/athlete/zones', {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  const data = await resp.json().catch(() => null);
  if (!resp.ok || !data) return null;
  return data;
}

function readAthleteZones() {
  const zones = readJsonFile(STRAVA_ZONES_FILE);
  if (!zones) return null;
  const hrZones = zones.heart_rate && Array.isArray(zones.heart_rate.zones) ? zones.heart_rate.zones : null;
  if (!hrZones || hrZones.length === 0) return null;
  return {
    heartRateZones: hrZones,
    fetchedAt: zones.fetchedAt || null,
    source: 'strava',
  };
}

function storeAthleteZones(apiZones) {
  if (!apiZones || !apiZones.heart_rate || !Array.isArray(apiZones.heart_rate.zones)) {
    return false;
  }
  const zones = {
    heart_rate: apiZones.heart_rate,
    power: apiZones.power || null,
    fetchedAt: new Date().toISOString(),
    source: 'strava',
  };
  writeJsonFile(STRAVA_ZONES_FILE, zones);
  return true;
}

function heartrateFromActivity(activity) {
  // Strava liefert average_heartrate/max_heartrate nur, wenn has_heartrate true ist.
  // Bei Opt-out oder fehlendem Sensor bleiben die Werte undefined.
  if (activity.has_heartrate === false) return {};
  const avg = Number(activity.average_heartrate);
  const max = Number(activity.max_heartrate);
  const out = {};
  if (Number.isFinite(avg) && avg > 0) out.avg = Math.round(avg);
  if (Number.isFinite(max) && max > 0) out.max = Math.round(max);
  return out;
}

function zoneIndexForHr(value, zoneUpperBounds) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  for (let i = 0; i < zoneUpperBounds.length; i += 1) {
    if (value <= zoneUpperBounds[i]) return i + 1;
  }
  return zoneUpperBounds.length;
}

function computeHeartrateLoad(activity, zones) {
  // Vereinfachter, dokumentierter HF-Zonen-Load.
  // Wir kennen pro Aktivität nur Durchschnitts-HF, Max-HF und Dauer – nicht die
  // Zeit pro Zone. Daher wird der Durchschnitt einer Zone zugeordnet und die
  // Dauer mit einem exponentiellen Zonen-Faktor gewichtet. Der Max-HF-Cap
  // verhindert, dass eine Aktivität mit kurzem Spike als hochintensiv gilt.
  // Keine medizinische TRIMP; Ruhepuls und Geschlecht sind Strava nicht
  // bekannt, daher bleibt der Score absichtlich konservativ.
  const bounds = zones && Array.isArray(zones.heartRateZones) ? zones.heartRateZones : null;
  if (!bounds || bounds.length === 0) return { load: 0, source: 'none' };

  const hr = heartrateFromActivity(activity);
  if (!hr.avg) return { load: 0, source: 'none' };

  const minutes = (Number(activity.moving_time) || 0) / 60;
  if (minutes <= 0) return { load: 0, source: 'none' };

  const avgZone = zoneIndexForHr(hr.avg, bounds);
  const maxZone = zoneIndexForHr(hr.max || hr.avg, bounds);
  const effectiveZone = Math.min(avgZone + 0.2 * Math.max(0, maxZone - avgZone), bounds.length);
  // Edwards-ähnliche Gewichtung: Zone 1 = 1, Zone 2 = 2, Zone 3 = 3, Zone 4 = 4, Zone 5 = 5.
  const weight = Math.max(1, effectiveZone);
  const load = Math.round(minutes * weight);
  return { load: Math.max(1, load), source: 'hr_zones' };
}

function activityLoad(activity, zones) {
  // 1. Strava Suffer Score / relative effort ist die beste Load-Quelle, wenn verfügbar.
  const effort = Number(activity.relative_effort);
  if (Number.isFinite(effort) && effort > 0) {
    return { load: effort, source: 'relative_effort' };
  }

  // 2. Wenn athletenweite HF-Zonen vorliegen und die Aktivität HF-Daten hat,
  //    berechnen wir einen HF-Zonen-Load. Das ist deutlich realistischer als
  //    eine reine Dauer*Distanz-Schätzung.
  const hrLoad = computeHeartrateLoad(activity, zones);
  if (hrLoad.load > 0) {
    return { load: hrLoad.load, source: hrLoad.source };
  }

  // 3. Fallback: klassische Dauer+Distanz-Heuristik.
  const distanceKm = (Number(activity.distance) || 0) / 1000;
  const minutes = (Number(activity.moving_time) || 0) / 60;
  return { load: Math.max(1, distanceKm * 2 + minutes * 0.25), source: 'estimate' };
}

function computeFitnessTrend(dailyLoads) {
  // CTL/ATL mit exponentieller Glättung (Banister-Modell).
  // An Ruhetagen (load = 0) sinken Fitness und Fatigue sanft,
  // anstatt am 42-Tage-Fenster hängen zu bleiben.
  const CTL_TAU = 42;
  const ATL_TAU = 7;
  const ctlDecay = 1 - Math.exp(-1 / CTL_TAU);
  const atlDecay = 1 - Math.exp(-1 / ATL_TAU);

  let ctl = 0;
  let atl = 0;
  const ctlSeries = [];
  for (const load of dailyLoads) {
    ctl += (load - ctl) * ctlDecay;
    atl += (load - atl) * atlDecay;
    ctlSeries.push(ctl);
  }

  return {
    fitness: Math.round(ctl),
    fatigue: Math.round(atl),
    form: Math.round(ctl - atl),
    ctlSpark: ctlSeries.map((value) => Math.round(value * 10) / 10),
  };
}

function buildStravaSnapshot(activities, zones) {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const sorted = [...activities].sort((a, b) => new Date(b.start_date || b.start_date_local) - new Date(a.start_date || a.start_date_local));
  const week = sorted.filter((a) => now - new Date(a.start_date || a.start_date_local).getTime() <= 7 * dayMs);
  const loadsByDay = new Map();
  const sportLastSeen = {};

  for (const activity of sorted) {
    const started = new Date(activity.start_date || activity.start_date_local);
    if (Number.isNaN(started.getTime())) continue;
    const day = started.toISOString().slice(0, 10);
    const { load } = activityLoad(activity, zones);
    loadsByDay.set(day, (loadsByDay.get(day) || 0) + load);
    const ageDays = Math.max(0, Math.floor((now - started.getTime()) / dayMs));
    const type = activity.sport_type || activity.type || 'Sport';
    if (sportLastSeen[type] == null || ageDays < sportLastSeen[type]) sportLastSeen[type] = ageDays;
  }

  const dailyLoads = [];
  for (let i = 41; i >= 0; i -= 1) {
    const date = new Date(now - i * dayMs).toISOString().slice(0, 10);
    dailyLoads.push(loadsByDay.get(date) || 0);
  }

  const trend = computeFitnessTrend(dailyLoads);
  const weekKm = week.reduce((sum, activity) => sum + (Number(activity.distance) || 0), 0) / 1000;

  const snapshot = {
    ...trend,
    streak: 0,
    weekKm: Math.round(weekKm * 10) / 10,
    weekCount: week.length,
    sportLastSeen,
    activities: sorted.slice(0, 8).map((activity) => {
      const { load, source } = activityLoad(activity, zones);
      return {
        id: String(activity.id),
        name: activity.name || 'Strava Aktivitaet',
        sport_type: activity.sport_type || activity.type || 'Sport',
        start_local: activity.start_date_local || activity.start_date,
        summary: {
          distance: Number(activity.distance) || 0,
          moving_time: Number(activity.moving_time) || 0,
          elevation_gain: Number(activity.total_elevation_gain) || 0,
          relative_effort: Number(activity.relative_effort) || undefined,
          total_calories: Number(activity.calories) || undefined,
          heartrate: heartrateFromActivity(activity),
          load,
          load_source: source,
        },
      };
    }),
    source: 'strava-live',
    updatedAt: new Date().toISOString(),
  };

  if (zones && Array.isArray(zones.heartRateZones)) {
    snapshot.heartrateZones = {
      zones: zones.heartRateZones,
      fetchedAt: zones.fetchedAt,
      source: zones.source,
    };
  }

  return snapshot;
}

loadStravaConfig();

const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (pathname.startsWith('/api/')) res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (pathname === '/api/sleep/latest') {
    if (req.method === 'GET') {
      const latest = readLatestSleep();
      if (!latest) return jsonError(res, 404, 'No sleep measurement found');
      return jsonOk(res, latest);
    }

    if (req.method === 'POST') {
      let raw;
      try { raw = await readBody(req); }
      catch (err) { return jsonError(res, 400, err.message || 'Invalid body'); }

      const entry = normalizeSleep(raw);
      if (!validateSleep(entry)) {
        return jsonError(res, 422, 'durationHours or bedTime+wakeTime required');
      }

      const saved = writeLatestSleep(entry);
      return jsonOk(res, { ok: true, saved });
    }

    return jsonError(res, 405, 'Method Not Allowed');
  }

  if (pathname === '/api/strava/status') {
    return jsonOk(res, stravaStatus(req));
  }

  if (pathname === '/api/strava/config' && req.method === 'POST') {
    let body;
    try { body = await readBody(req); } catch { return jsonError(res, 400, 'Invalid JSON body'); }
    const { clientId, clientSecret } = body;
    if (typeof clientId !== 'string' || typeof clientSecret !== 'string' || !clientId || !clientSecret) {
      return jsonError(res, 422, 'clientId and clientSecret required');
    }
    writeJsonFile(STRAVA_CONFIG_FILE, { clientId: clientId.trim(), clientSecret: clientSecret.trim() });
    loadStravaConfig();
    return jsonOk(res, { ok: true, configured: stravaConfigured() });
  }

  if (pathname === '/api/strava/oauth/start') {
    if (!stravaConfigured()) return jsonError(res, 503, 'Strava is not configured');
    const url = new URL('https://www.strava.com/oauth/authorize');
    url.searchParams.set('client_id', stravaConfig.clientId);
    url.searchParams.set('redirect_uri', `${publicBaseUrl(req)}/api/strava/callback`);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('approval_prompt', 'auto');
    url.searchParams.set('scope', STRAVA_SCOPE);
    res.writeHead(302, { Location: url.toString(), 'Cache-Control': 'no-store' });
    res.end();
    return;
  }

  if (pathname === '/api/strava/callback') {
    if (!stravaConfigured()) return jsonError(res, 503, 'Strava is not configured');
    const url = new URL(req.url, publicBaseUrl(req));
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    if (error) return jsonError(res, 400, `Strava OAuth error: ${error}`);
    if (!code) return jsonError(res, 400, 'Missing Strava OAuth code');
    try {
      await exchangeStravaToken({ grant_type: 'authorization_code', code });
      res.writeHead(302, { Location: '/?strava=connected', 'Cache-Control': 'no-store' });
      res.end();
    } catch (err) {
      return jsonError(res, 502, err.message || 'Strava OAuth failed');
    }
    return;
  }

  if (pathname === '/api/strava/disconnect' && req.method === 'POST') {
    try { fs.unlinkSync(STRAVA_TOKEN_FILE); } catch { }
    try { fs.unlinkSync(STRAVA_ZONES_FILE); } catch { }
    return jsonOk(res, { ok: true });
  }

  if (pathname === '/api/strava/snapshot') {
    try {
      const status = stravaStatus(req);
      if (!status.configured) return jsonOk(res, { ok: false, reason: 'not_configured', status });
      if (!status.connected) return jsonOk(res, { ok: false, reason: 'not_connected', status });
      const [activities, apiZones] = await Promise.all([
        fetchStravaActivities(),
        fetchStravaAthleteZones().catch(() => null),
      ]);
      const zonesStored = storeAthleteZones(apiZones);
      const zones = zonesStored ? readAthleteZones() : readAthleteZones();
      return jsonOk(res, { ok: true, status: stravaStatus(req), snapshot: buildStravaSnapshot(activities, zones) });
    } catch (err) {
      return jsonOk(res, { ok: false, reason: 'strava_error', message: err.message || 'Strava failed', status: stravaStatus(req) });
    }
  }

  if (pathname === '/api/backup') {
    if (req.method === 'GET') {
      const backup = readBackup();
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify(backup));
      return;
    }

    if (req.method === 'PUT') {
      let body;
      try { body = await readBody(req); }
      catch { return jsonError(res, 400, 'Invalid JSON body'); }

      const incoming = Array.isArray(body.records) ? body.records : [];
      for (const r of incoming) {
        if (typeof r.k !== 'string' || typeof r.v !== 'string') {
          return jsonError(res, 422, 'Each record must have string k and string v');
        }
      }

      const existing = readBackup();
      const map = new Map(existing.records.map(r => [r.k, r.v]));
      for (const r of incoming) map.set(r.k, r.v);

      const merged = {
        app: 'fitness-coach',
        version: 1,
        updatedAt: new Date().toISOString(),
        records: [...map.entries()].map(([k, v]) => ({ k, v })),
      };
      writeBackup(merged);
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify(merged));
      return;
    }

    return jsonError(res, 405, 'Method Not Allowed');
  }

  // Static file serving
  let filePath = path.join(ROOT, pathname === '/' ? 'index.html' : pathname);
  const relative = path.relative(ROOT, filePath);
  if (relative.startsWith('..')) { return jsonError(res, 403, 'Forbidden'); }

  try {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) filePath = path.join(filePath, 'index.html');
  } catch {
    res.writeHead(404); res.end('Not Found'); return;
  }

  const contentType = MIME[path.extname(filePath)] || 'application/octet-stream';
  try {
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(fs.readFileSync(filePath));
  } catch {
    res.writeHead(404); res.end('Not Found');
  }
});

if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Fitness Coach  →  http://localhost:${PORT}/`);
  });
}

module.exports = {
  computeFitnessTrend,
  buildStravaSnapshot,
  activityLoad,
  computeHeartrateLoad,
  zoneIndexForHr,
  readAthleteZones,
  storeAthleteZones,
  readLatestSleep,
  writeLatestSleep,
  normalizeSleep,
  validateSleep,
};
