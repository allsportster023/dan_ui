export function convertDbwToWatts(dbwValue: number) {
  let jammerWatts = 0;
  if (dbwValue > 0) {
      let watts = Math.pow(10, dbwValue / 10);
      if (watts < 1) {
          jammerWatts = Math.round(watts * 100) / 100;
      } else if (watts < 10) {
          jammerWatts = Math.round(watts * 10) / 10;
      } else {
          jammerWatts = Math.round(watts);
      }
  }
  return jammerWatts;
}

export function convertWattsToDbw(wattValue: number) {
  let jammerDbw = 0;
  if (wattValue > 0) {
      let dbw = 10 * Math.log10(wattValue);
      if (Math.abs(dbw) < 1) {
          jammerDbw = Math.round(dbw * 100) / 100;
      } else if (Math.abs(dbw) < 10) {
          jammerDbw = Math.round(dbw * 10) / 10;
      } else {
          jammerDbw = Math.round(dbw);
      }
  }
  return jammerDbw;
}