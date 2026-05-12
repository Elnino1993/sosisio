// SEIR pandemic simulation — Andes hantavirus with COVID-19 spread dynamics
// Visualization: GeoJSON country fills, red intensity = infection density
// CFR = 30% (Andes HPS historical case fatality rate)

const CFR   = 0.30;
const BETA  = 0.29;   // R0 * gamma  (R0=2.9)
const SIGMA = 0.192;  // 1 / 5.2d incubation
const GAMMA = 0.100;  // 1 / 10d infectious
const DT    = 7;      // days per tick

// ── Haversine distance ──
function hav([la1,lo1],[la2,lo2]) {
  const R=6371, r=Math.PI/180;
  const dLa=(la2-la1)*r, dLo=(lo2-lo1)*r;
  const a=Math.sin(dLa/2)**2+Math.cos(la1*r)*Math.cos(la2*r)*Math.sin(dLo/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

// ── Country data ──
// [id, GeoJSON name, [lat,lon], population, is_hub]
const COUNTRY_DEF = [
  ['AR','Argentina',                   [-38.4,-63.6], 45376763,  false],
  ['CL','Chile',                       [-35.7,-71.5], 19116201,  false],
  ['BR','Brazil',                      [-14.2,-51.9], 215313498, true ],
  ['PE','Peru',                        [ -9.2,-75.0], 32971846,  false],
  ['CO','Colombia',                    [  4.6,-74.3], 51516562,  false],
  ['VE','Venezuela',                   [  6.4,-66.6], 29069498,  false],
  ['BO','Bolivia',                     [-16.3,-63.6], 11832940,  false],
  ['EC','Ecuador',                     [ -1.8,-78.2], 17797737,  false],
  ['PY','Paraguay',                    [-23.4,-58.4],  7353038,  false],
  ['UY','Uruguay',                     [-32.5,-55.8],  3513652,  false],
  ['US','United States of America',    [ 37.1,-95.7], 331449281, true ],
  ['CA','Canada',                      [ 56.1,-106.3], 38048738, true ],
  ['MX','Mexico',                      [ 23.6,-102.5],128932753, false],
  ['GB','United Kingdom',              [ 55.4,  -3.4], 67215293, true ],
  ['FR','France',                      [ 46.2,   2.2], 67063703, true ],
  ['DE','Germany',                     [ 51.2,  10.5], 83149300, true ],
  ['IT','Italy',                       [ 41.9,  12.6], 59257566, false],
  ['ES','Spain',                       [ 40.5,  -3.7], 47414539, false],
  ['PT','Portugal',                    [ 39.4,  -8.2], 10270865, false],
  ['NL','Netherlands',                 [ 52.1,   5.3], 17590672, true ],
  ['BE','Belgium',                     [ 50.5,   4.5], 11589616, false],
  ['CH','Switzerland',                 [ 46.8,   8.2],  8654622, false],
  ['PL','Poland',                      [ 51.9,  19.1], 37797005, false],
  ['UA','Ukraine',                     [ 48.4,  31.2], 41167336, false],
  ['RU','Russia',                      [ 61.5, 105.3],145102755, true ],
  ['SE','Sweden',                      [ 60.1,  18.6], 10353442, false],
  ['NO','Norway',                      [ 60.5,   8.5],  5421241, false],
  ['FI','Finland',                     [ 61.9,  25.7],  5540720, false],
  ['RO','Romania',                     [ 45.9,  24.9], 19002116, false],
  ['GR','Greece',                      [ 39.1,  21.8], 10423054, false],
  ['RS','Serbia',                      [ 44.0,  21.0],  6908224, false],
  ['AT','Austria',                     [ 47.5,  14.6],  9006398, false],
  ['HU','Hungary',                     [ 47.2,  19.5],  9769949, false],
  ['TR','Turkey',                      [ 38.9,  35.2], 84339067, true ],
  ['SA','Saudi Arabia',                [ 23.9,  45.1], 34813871, true ],
  ['AE','United Arab Emirates',        [ 23.4,  53.8],  9890400, true ],
  ['IL','Israel',                      [ 31.1,  34.9],  8655535, false],
  ['IQ','Iraq',                        [ 33.2,  43.7], 40222503, false],
  ['IR','Iran',                        [ 32.4,  53.7], 83992953, false],
  ['AF','Afghanistan',                 [ 33.9,  67.7], 38928341, false],
  ['PK','Pakistan',                    [ 30.4,  69.3],220892331, false],
  ['IN','India',                       [ 20.6,  78.9],1380004385,true ],
  ['BD','Bangladesh',                  [ 23.7,  90.4],164689383, false],
  ['KZ','Kazakhstan',                  [ 48.0,  68.0], 18776707, false],
  ['UZ','Uzbekistan',                  [ 41.4,  64.6], 34915100, false],
  ['NP','Nepal',                       [ 28.4,  84.1], 29136808, false],
  ['CN','China',                       [ 35.9, 104.2],1439323776,true],
  ['JP','Japan',                       [ 36.2, 138.3],125681593, true ],
  ['KR','South Korea',                 [ 35.9, 127.8], 51269185, true ],
  ['TW','Taiwan',                      [ 23.7, 121.0], 23816775, false],
  ['TH','Thailand',                    [ 15.9, 100.9], 69799978, true ],
  ['VN','Viet Nam',                    [ 14.1, 108.3], 97338583, false],
  ['PH','Philippines',                 [ 12.9, 121.8],109581085, false],
  ['MY','Malaysia',                    [  4.2, 109.5], 32365998, true ],
  ['SG','Singapore',                   [  1.4, 103.8],  5850342, true ],
  ['MM','Myanmar',                     [ 17.1,  96.1], 54409794, false],
  ['ID','Indonesia',                   [ -0.8, 113.9],273523621, false],
  ['NG','Nigeria',                     [  9.1,   8.7],206139587, false],
  ['EG','Egypt',                       [ 26.8,  30.8],102334403, true ],
  ['ET','Ethiopia',                    [  9.1,  40.5],114963583, false],
  ['CD','Dem. Rep. Congo',             [ -4.0,  21.8], 89561403, false],
  ['TZ','Tanzania',                    [ -6.4,  34.9], 59734213, false],
  ['KE','Kenya',                       [  0.0,  37.9], 53771296, false],
  ['ZA','South Africa',                [-28.5,  25.0], 59308690, false],
  ['SD','Sudan',                       [ 12.9,  30.2], 43849269, false],
  ['MA','Morocco',                     [ 31.8,  -7.1], 36910558, false],
  ['DZ','Algeria',                     [ 28.0,   2.6], 43851043, false],
  ['AU','Australia',                   [-25.3, 133.8], 25687041, true ],
  ['NZ','New Zealand',                 [-40.9, 174.9],  4917000, false],
];

// Build country objects
const COUNTRIES = COUNTRY_DEF.map(([id, geoName, coords, pop, hub]) => ({
  id, geoName, coords, pop, hub,
  S: pop, E: 0, I: 0, R: 0, D: 0,
  totalCases: 0,
}));

const byId = id => COUNTRIES.find(c => c.id === id);

function resetAll() {
  COUNTRIES.forEach(c => {
    c.S = c.pop; c.E = 0; c.I = 0; c.R = 0; c.D = 0; c.totalCases = 0;
  });
  const s = (id, n) => { const c=byId(id); if(!c)return; const k=Math.min(n,c.S); c.I+=k; c.S-=k; c.totalCases+=k; };
  s('AR', 200); // Argentina — endemic origin
  s('CL', 120); // Chile
  s('NL',  20); // MV Hondius flag state
  s('US',  30); // Nebraska/Atlanta facilities
  s('GB',  10); // UK returnees
  s('FR',   6); // France confirmed evacuee
  s('DE',   4);
  s('AU',   5);
}

// ── Color: white → pink → red → dark red by infection fraction ──
function countryStyle(fraction) {
  if (fraction < 0.000002) {
    return { fillOpacity: 0, weight: 0.4, color: '#1e1e1e', fillColor: '#000' };
  }
  // log scale 0→1 across 5 decades
  const t = Math.min(1, Math.log10(fraction * 500000 + 1) / 5.7);

  // #fca5a5 (light pink) → #dc2626 (red) → #7f1d1d (deep red)
  let r, g, b;
  if (t < 0.5) {
    const u = t / 0.5;
    r = Math.round(252 - u * (252-220));
    g = Math.round(165 - u * (165-38));
    b = Math.round(165 - u * (165-38));
  } else {
    const u = (t - 0.5) / 0.5;
    r = Math.round(220 - u * (220-127));
    g = Math.round(38  - u * (38-29));
    b = Math.round(38  - u * (38-29));
  }

  const fillOpacity = 0.18 + t * 0.77;
  return {
    fillColor: `rgb(${r},${g},${b})`,
    fillOpacity,
    weight: 0.4,
    color: '#1a0000',
  };
}

// ── Simulation class ──
export class Simulation {
  constructor(leafletMap) {
    this.map          = leafletMap;
    this._geoGroup    = L.layerGroup().addTo(leafletMap);
    this._geoLayer    = null;
    this._featByName  = new Map(); // geoName → leaflet featureLayer
    this.week         = 0;
    this.running      = false;
    this._timer       = null;
    this._ready       = false;
    resetAll();
    this._loadGeo();
  }

  async _loadGeo() {
    try {
      const res = await fetch(
        'https://cdn.jsdelivr.net/gh/holtzy/D3-graph-gallery@master/DATA/world.geojson'
      );
      const geojson = await res.json();

      this._geoLayer = L.geoJSON(geojson, {
        style: { fillOpacity: 0, weight: 0.4, color: '#1e1e1e', fillColor: '#000' },
        onEachFeature: (feature, layer) => {
          const name = feature.properties?.name;
          if (name) this._featByName.set(name, layer);
        },
      }).addTo(this._geoGroup);

      this._ready = true;
      this._drawGeo(); // show initial seeds
    } catch (e) {
      console.error('GeoJSON load failed', e);
    }
  }

  _tick() {
    this.week++;
    const newExp = new Float64Array(COUNTRIES.length);

    COUNTRIES.forEach((src, si) => {
      if (src.I < 0.5) return;
      const prev = src.I / src.pop;
      COUNTRIES.forEach((dst, di) => {
        if (si === di || dst.S < 1) return;
        const dist = hav(src.coords, dst.coords);
        let rate = dist < 600  ? 0.00018
                 : dist < 1800 ? 0.00007
                 : dist < 4500 ? 0.000022
                 :               0.000006;
        if (src.hub) rate *= 9;
        if (dst.hub) rate *= 2.5;
        newExp[di] += src.pop * rate * prev * DT * (dst.S / dst.pop) * 0.28;
      });
    });

    COUNTRIES.forEach((c, i) => {
      const dNew  = BETA  * c.S * c.I / c.pop * DT;
      const dProg = SIGMA * c.E * DT;
      const dRec  = GAMMA * c.I * DT;
      const imp   = Math.min(newExp[i], c.S);

      c.S = Math.max(0, c.S - dNew - imp);
      c.E = Math.max(0, c.E + dNew + imp - dProg);
      c.I = Math.max(0, c.I + dProg - dRec);

      // CFR applied at recovery: 30% die, 70% survive
      const deaths   = dRec * CFR;
      const survived = dRec * (1 - CFR);
      c.D += deaths;
      c.R += survived;

      c.totalCases += dProg;
    });
  }

  _drawGeo() {
    if (!this._ready) return;
    COUNTRIES.forEach(c => {
      const total = c.E + c.I + c.R + c.D;
      const f     = total / c.pop;
      const style = countryStyle(f);
      const layer = this._featByName.get(c.geoName);
      if (layer) layer.setStyle(style);
    });
  }

  _stats() {
    const totalI    = Math.round(COUNTRIES.reduce((s,c) => s+c.I, 0));
    const totalD    = Math.round(COUNTRIES.reduce((s,c) => s+c.D, 0));
    const totalR    = Math.round(COUNTRIES.reduce((s,c) => s+c.R, 0));
    const totalC    = Math.round(COUNTRIES.reduce((s,c) => s+c.totalCases, 0));
    const affected  = COUNTRIES.filter(c => c.totalCases >= 50).length;
    const date      = new Date(2026, 4, 1);
    date.setDate(date.getDate() + this.week * 7);
    const dateStr   = date.toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'});
    return { week: this.week, totalI, totalD, totalR, totalC, affected, dateStr };
  }

  start(onTick, onEnd) {
    if (this.running) return;
    this.running = true;
    this._timer = setInterval(() => {
      this._tick();
      this._drawGeo();
      const s = this._stats();
      onTick(s);
      if (s.affected >= COUNTRIES.length || this.week >= 260) {
        this.stop();
        onEnd(s);
      }
    }, 140);
  }

  stop() {
    this.running = false;
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
  }

  reset() {
    this.stop();
    this.week = 0;
    resetAll();
    if (this._ready) {
      this._featByName.forEach(layer =>
        layer.setStyle({ fillOpacity: 0, weight: 0.4, color: '#1e1e1e', fillColor: '#000' })
      );
    }
  }
}
