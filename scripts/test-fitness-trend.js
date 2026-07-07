'use strict';

const { computeFitnessTrend } = require('../server.js');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// Szenario: 21 Tage konstantes Training (Load 80), dann 21 Tage komplette Ruhe.
// Der Fitness-Score (CTL) darf in der Ruhephase nicht steigen, sondern muss sinken.
const trained = Array(21).fill(80);
const rested = Array(21).fill(0);
const loads = [...trained, ...rested];

const trend = computeFitnessTrend(loads);
const firstRestIndex = 21;
const lastIndex = loads.length - 1;

const ctlAtRestStart = trend.ctlSpark[firstRestIndex];
const ctlAtRestEnd = trend.ctlSpark[lastIndex];

console.log('Fitness am Trainingsende:', Math.round(ctlAtRestStart));
console.log('Fitness nach 21 Ruhetagen:', Math.round(ctlAtRestEnd));
console.log('Fitness-Sparkletrend in Ruhephase:', ctlAtRestStart > ctlAtRestEnd ? 'sinkt ✓' : 'steigt/stagniert ✗');

assert(ctlAtRestStart > ctlAtRestEnd, 'CTL darf in der Ruhephase nicht steigen');
assert(trend.fatigue < trend.fitness, 'Nach langer Ruhe sollte die Fatigue deutlich unter der Fitness liegen');

// Vergleich: bei reinem 42-Tage-SMA würde der Wert in 21 Ruhetagen kaum sinken.
const smaValue = loads.slice(-42).reduce((a, b) => a + b, 0) / 42;
console.log('Vergleich 42-Tage-SMA nach Ruhe:', Math.round(smaValue));
assert(Math.round(ctlAtRestEnd) < Math.round(smaValue), 'CTL muss in der Ruhephase unter dem einfachen 42-Tage-Durchschnitt liegen');

console.log('\nAlle Prüfungen bestanden.');
