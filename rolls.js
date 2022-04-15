const week1 = require('./docs/data/mft2021.2.week1.json');
const week2 = require('./docs/data/mft2021.3.week2.json');
const week3 = require('./docs/data/mft2021.4.week3.json');

const rolls = {};
Object.entries(week1.rolls)
.concat(Object.entries(week2.rolls))
.concat(Object.entries(week3.rolls))
.map(([playerId, entries]) => {
  if (!rolls[playerId]) rolls[playerId] = {};
  rolls[playerId].rolls = (rolls[playerId].rolls || []).concat(entries);
});

const avg = arr => arr.reduce((sum, x) => x + sum, 0) / arr.length;

Object.entries(rolls)
.forEach(([playerId, obj]) => {
  const player = require('./generated/players/' + playerId + '.json');
  obj.avg = avg(obj.rolls).toFixed(2);
  obj.username = player.username;
});

const sorted = Object.values(rolls).sort((a, b) => b.avg - a.avg);

sorted
.forEach(({ rolls, avg, username }) => {
  console.log(username.padEnd(17), rolls.join(', ').padEnd(23), ('avg = ' + avg));
});
