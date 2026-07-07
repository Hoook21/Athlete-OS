'use strict';

const { buildStravaSnapshot } = require('../server.js');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function makeActivity(overrides = {}) {
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  return {
    id: Math.floor(Math.random() * 1e9),
    name: 'Test Ride',
    sport_type: 'Ride',
    start_date: `${day}T10:00:00Z`,
    start_date_local: `${day}T12:00:00`,
    distance: 20000,
    moving_time: 3600,
    total_elevation_gain: 100,
    ...overrides,
  };
}

// 1. HF-Daten werden übernommen und gerundet
const withHr = buildStravaSnapshot([makeActivity({
  id: 1001,
  has_heartrate: true,
  average_heartrate: 142.7,
  max_heartrate: 178.5,
})]);
assert(withHr.activities[0].summary.heartrate.avg === 143, 'avg HR should be rounded to 143');
assert(withHr.activities[0].summary.heartrate.max === 179, 'max HR should be rounded to 179');

// 2. has_heartrate=false erzeugt leeres Objekt
const withoutHr = buildStravaSnapshot([makeActivity({ id: 1002, has_heartrate: false, average_heartrate: 0, max_heartrate: 0 })]);
assert(Object.keys(withoutHr.activities[0].summary.heartrate).length === 0, 'has_heartrate=false should not expose HR');

// 3. Fehlende HF-Felder erzeugen leeres Objekt
const missing = buildStravaSnapshot([makeActivity({ id: 1003 })]);
assert(Object.keys(missing.activities[0].summary.heartrate).length === 0, 'missing HR fields should yield empty object');

// 4. Gemischte Aktivitäten: mit und ohne HF
const mixed = buildStravaSnapshot([
  makeActivity({ id: 2001, has_heartrate: true, average_heartrate: 130, max_heartrate: 160 }),
  makeActivity({ id: 2002, has_heartrate: false }),
  makeActivity({ id: 2003, has_heartrate: true, average_heartrate: 145 }),
]);
assert(mixed.activities[0].summary.heartrate.avg === 130, 'first activity avg HR');
assert(Object.keys(mixed.activities[1].summary.heartrate).length === 0, 'second activity no HR');
assert(mixed.activities[2].summary.heartrate.avg === 145, 'third activity avg HR');
assert(!('max' in mixed.activities[2].summary.heartrate), 'third activity should not have max HR');

// 5. Dashboard-HF-Überblick: avg über Aktivitäten mit HF berechnen sicher anzeigbar
const hrActivities = mixed.activities.filter((a) => Number.isFinite(a.summary.heartrate.avg));
assert(hrActivities.length === 2, 'two HR activities in mixed list');
const avgHr = Math.round(hrActivities.reduce((sum, a) => sum + a.summary.heartrate.avg, 0) / hrActivities.length);
assert(avgHr === Math.round((130 + 145) / 2), 'dashboard avg HR calculation');

console.log('\nAlle Herzfrequenz-Tests bestanden.');
