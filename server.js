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
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
      catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
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

function activityLoad(activity) {
  const effort = Number(activity.relative_effort);
  if (Number.isFinite(effort) && effort > 0) return effort;
  const distanceKm = (Number(activity.distance) || 0) / 1000;
  const minutes = (Number(activity.moving_time) || 0) / 60;
  return Math.max(1, distanceKm * 2 + minutes * 0.25);
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

function buildStravaSnapshot(activities) {
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
    loadsByDay.set(day, (loadsByDay.get(day) || 0) + activityLoad(activity));
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

  return {
    ...trend,
    streak: 0,
    weekKm: Math.round(weekKm * 10) / 10,
    weekCount: week.length,
    sportLastSeen,
    activities: sorted.slice(0, 8).map((activity) => ({
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
      },
    })),
    source: 'strava-live',
    updatedAt: new Date().toISOString(),
  };
}

loadStravaConfig();

const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (pathname.startsWith('/api/')) res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

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
    return jsonOk(res, { ok: true });
  }

  if (pathname === '/api/strava/snapshot') {
    try {
      const status = stravaStatus(req);
      if (!status.configured) return jsonOk(res, { ok: false, reason: 'not_configured', status });
      if (!status.connected) return jsonOk(res, { ok: false, reason: 'not_connected', status });
      const activities = await fetchStravaActivities();
      return jsonOk(res, { ok: true, status: stravaStatus(req), snapshot: buildStravaSnapshot(activities) });
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

module.exports = { computeFitnessTrend };
