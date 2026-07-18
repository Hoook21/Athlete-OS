'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  normalizeSleep,
  validateSleep,
  readLatestSleep,
  writeLatestSleep,
} = require('../server.js');

const DATA_DIR = path.join(__dirname, '..', 'data');
const BACKUP_FILE = path.join(DATA_DIR, 'backup.json');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const backupExisted = fs.existsSync(BACKUP_FILE);
let backupBackup = null;
if (backupExisted) {
  backupBackup = fs.readFileSync(BACKUP_FILE, 'utf8');
}

function restoreBackup() {
  if (backupExisted) {
    fs.writeFileSync(BACKUP_FILE, backupBackup);
  } else {
    try { fs.unlinkSync(BACKUP_FILE); } catch { /* ignore */ }
  }
}

// 1. Dauer direkt erkannt
const withDuration = normalizeSleep({ durationHours: 7.5, quality: 85 });
assert(withDuration.durationHours === 7.5, 'durationHours should be parsed');
assert(withDuration.quality === 85, 'quality should be parsed');
assert(validateSleep(withDuration), 'duration should validate');

// 2. Dauer aus Bett- und Wachzeit berechnet
const withTimes = normalizeSleep({
  bedTime: '2026-07-17T23:00:00Z',
  wakeTime: '2026-07-18T06:30:00Z',
});
assert(withTimes.durationHours === 7.5, 'duration should be computed from bed+wake times');
assert(validateSleep(withTimes), 'bedTime+wakeTime should validate');

// 3. Alias-Felder werden erkannt
const aliases = normalizeSleep({
  sleep: '8',
  score: '92',
  hr: '58',
  source: 'Oura',
});
assert(aliases.durationHours === 8, 'sleep alias should work');
assert(aliases.quality === 92, 'score alias should work');
assert(aliases.heartRateAvg === 58, 'hr alias should work');
assert(aliases.source === 'Oura', 'source should be kept');

// 4. Unzureichende Daten werden abgelehnt
const invalid = normalizeSleep({ quality: 50 });
assert(!validateSleep(invalid), 'quality alone should not validate');

// 5. Leere Strings werden ignoriert
const emptyStrings = normalizeSleep({ durationHours: '', bedTime: '2026-07-17T23:00:00Z', wakeTime: '2026-07-18T07:00:00Z' });
assert(emptyStrings.durationHours === 8, 'empty durationHours should be ignored and computed from times');

// 6. Roundtrip über Backup
const roundtripEntry = {
  durationHours: 6.5,
  bedTime: '2026-07-17T22:30:00Z',
  wakeTime: '2026-07-18T05:00:00Z',
  quality: 72,
  heartRateAvg: 55,
  source: 'Apple Health',
};
writeLatestSleep(roundtripEntry);
const readBack = readLatestSleep();
assert(readBack.durationHours === 6.5, 'roundtrip durationHours');
assert(readBack.quality === 72, 'roundtrip quality');
assert(readBack.source === 'Apple Health', 'roundtrip source');

restoreBackup();

console.log('\nAlle Sleep-Tests bestanden.');
