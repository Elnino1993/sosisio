import './style.css'
import { Simulation } from './simulation.js'

const map = L.map('map', { zoomControl: false }).setView([20, 0], 2);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 20
}).addTo(map);

L.control.zoom({ position: 'topright' }).addTo(map);

// ── Data ──
// period: 'current' = since 1 May 2026 | 'alltime' = historical endemic/cumulative

const globalDataCurrent = [
  {
    country: "MV Hondius (→ Rotterdam)",
    coords: [31.8, -14.2],
    confirmed: 9, probable: 2, deaths: 3, monitoring: 47,
    status: "CRITICAL · Andes Virus",
    note: "Outbreak began 1 Apr 2026 (departed Ushuaia). Docked Tenerife 10 May, disembarked 11 May. ETA Rotterdam 18 May. 16 pax at Nebraska facility, 2 in Atlanta.",
    source: "WHO DON-600 / ECDC 12 May 2026",
    isShip: true, isAndes: true
  },
  {
    country: "Argentina — Patagonia (Bariloche / Neuquén)",
    coords: [-41.133, -71.310],
    confirmed: 101, probable: 0, deaths: 32, monitoring: 220,
    status: "HIGH · Andes Virus",
    note: "101 confirmed since Jun 2025 season start — highest since 2018. CFR ~31%. Doubling vs prior season.",
    source: "Argentina MoH, May 2026",
    isAndes: true
  },
  {
    country: "Chile — Aysén (Coyhaique)",
    coords: [-45.575, -72.065],
    confirmed: 39, probable: 0, deaths: 13, monitoring: 85,
    status: "HIGH · Andes Virus",
    note: "39 confirmed YTD 2026. CFR 33% — well above historical avg of 22%.",
    source: "Chile MINSAL, May 2026",
    isAndes: true
  },
  {
    country: "United States — Four Corners (NM/AZ/CO/UT)",
    coords: [36.999, -109.045],
    confirmed: 17, probable: 0, deaths: 0, monitoring: 34,
    status: "LOW · Sin Nombre Virus",
    note: "17 cases as of CDC NNDSS week 17. No deaths this season.",
    source: "CDC, 2026"
  },
  {
    country: "China — Shaanxi (Xi'an)",
    coords: [34.341, 108.940],
    confirmed: 850, probable: 0, deaths: 28, monitoring: 1200,
    status: "MODERATE · HFRS (Hantaan/Seoul)",
    note: "Endemic HFRS province. ~10 000 cases/yr nationally; Shaanxi consistently top 3.",
    source: "China CDC / WHO, 2025–2026"
  },
  {
    country: "Russia — Ural / W. Siberia (Krasnoyarsk)",
    coords: [56.015, 92.893],
    confirmed: 420, probable: 0, deaths: 9, monitoring: 630,
    status: "LOW–MODERATE · HFRS (Puumala/Dobrava)",
    note: "Ural–Siberia corridor endemic. ~700–900 HFRS cases/yr in region.",
    source: "Rospotrebnadzor, 2025–2026"
  }
];

const ukraineDataCurrent = [
  {
    country: "Lviv Oblast",
    coords: [49.840, 24.030],
    confirmed: 12, probable: 5, deaths: 0, monitoring: 28,
    status: "MODERATE · HFRS (Puumala)",
    note: "Endemic western Ukraine. Refugee/IDP population movement elevates exposure risk.",
    source: "Ukraine MoH / ECDC 2025–2026"
  },
  {
    country: "Zakarpattia Oblast (Uzhhorod)",
    coords: [48.621, 22.288],
    confirmed: 19, probable: 8, deaths: 1, monitoring: 45,
    status: "HIGH · HFRS (Dobrava)",
    note: "Highest endemic HFRS burden in Ukraine. Carpathian forested terrain.",
    source: "Ukraine MoH / ECDC 2025–2026"
  },
  {
    country: "Eastern Front — Donbas",
    coords: [48.015, 37.802],
    confirmed: 38, probable: 22, deaths: 4, monitoring: 90,
    status: "CRITICAL · HFRS (Hantaan/Dobrava)",
    note: "Trench warfare: rodent overpopulation, destroyed sanitation, limited medical access.",
    source: "MSF / WHO Ukraine field reports 2025–2026"
  },
  {
    country: "Southern Front — Zaporizhzhia",
    coords: [47.838, 35.139],
    confirmed: 21, probable: 14, deaths: 2, monitoring: 55,
    status: "HIGH · HFRS",
    note: "Flooded steppe post-Kakhovka dam breach. Elevated rodent density.",
    source: "WHO Ukraine / MSF 2025–2026"
  }
];

// MV Hondius cluster — WHO DON-600 / Wikipedia verified (as of 12 May 2026)
// Total: 8 confirmed + 2 probable = 10 cases, 3 deaths, CFR 38%
const clusterDataCurrent = [
  {
    country: "Netherlands",
    coords: [51.92, 4.48],
    confirmed: 2, probable: 0, deaths: 1, monitoring: 8,
    status: "CONFIRMED · Andes Virus",
    note: "Index case: Dutch man (70M), symptoms Apr 6, died Apr 11 aboard. Wife (69F) contracted Andes virus during 45-min KLM connection flight Apr 25, died Apr 26 in Johannesburg. Two further Dutch nationals at Amsterdam UMC and Leiden UMC.",
    source: "Wikipedia / WHO DON-600",
    isAndes: true, cluster: 'MV Hondius'
  },
  {
    country: "Germany",
    coords: [51.22, 6.78],
    confirmed: 1, probable: 0, deaths: 1, monitoring: 3,
    status: "CONFIRMED · Andes Virus",
    note: "German woman died aboard May 2 (3rd death). Body remained on ship until Rotterdam. Treated at University Hospital Düsseldorf.",
    source: "Wikipedia / WHO DON-600",
    isAndes: true, cluster: 'MV Hondius'
  },
  {
    country: "United Kingdom",
    coords: [53.37, -3.04],
    confirmed: 2, probable: 1, deaths: 0, monitoring: 5,
    status: "CONFIRMED · Andes Virus",
    note: "2 confirmed at Arrowe Park Hospital, Wirral. 1 British national evacuated to Netherlands (May 6). 1 suspected case on Tristan da Cunha. UKHSA traced all 30 Saint Helena disembarkees across 12 countries.",
    source: "Wikipedia / UKHSA",
    isAndes: true, cluster: 'MV Hondius'
  },
  {
    country: "Switzerland",
    coords: [47.37, 8.54],
    confirmed: 1, probable: 0, deaths: 0, monitoring: 2,
    status: "CONFIRMED · Andes Virus",
    note: "Swiss national disembarked at Saint Helena Apr 24. Confirmed positive May 6. Treated at Zurich University Hospital.",
    source: "Wikipedia / WHO DON-600",
    isAndes: true, cluster: 'MV Hondius'
  },
  {
    country: "France",
    coords: [48.86, 2.35],
    confirmed: 1, probable: 0, deaths: 0, monitoring: 3,
    status: "CONFIRMED · Critical condition",
    note: "French national tested positive May 11. Described as in 'very critical condition'. Under intensive care.",
    source: "Wikipedia / WHO DON-600",
    isAndes: true, cluster: 'MV Hondius'
  },
  {
    country: "United States",
    coords: [41.26, -96.01],
    confirmed: 1, probable: 1, deaths: 0, monitoring: 12,
    status: "CONFIRMED · Andes Virus",
    note: "1 confirmed positive, 1 symptomatic at Nebraska Medical Center biocontainment unit. 15 more in quarantine unit. 2 at Emory, Atlanta. 12 residents (TX, GA, VA, AZ, CA, NJ, MD) under monitoring. No deaths.",
    source: "CDC / HHS / ABC7",
    isAndes: true, cluster: 'MV Hondius'
  },
  {
    country: "Spain",
    coords: [40.42, -3.70],
    confirmed: 1, probable: 0, deaths: 0, monitoring: 4,
    status: "CONFIRMED · Andes Virus",
    note: "1 Spanish passenger confirmed May 11. Treated at Gómez Ulla Military Hospital, Madrid. Spain coordinated evacuations for 22 countries from Tenerife, overriding Canary Islands governor who initially refused the ship entry.",
    source: "Wikipedia / Spanish MoH",
    isAndes: true, cluster: 'MV Hondius'
  },
  {
    country: "South Africa — Johannesburg",
    coords: [-26.20, 28.04],
    confirmed: 0, probable: 0, deaths: 1, monitoring: 2,
    status: "DEATH RECORDED · Andes Virus",
    note: "Dutch widow (69F) died here Apr 26 after contracting virus on a 45-min KLM flight — person-to-person transmission confirmed. 1 British national also evacuated to Johannesburg hospital.",
    source: "Wikipedia / WHO DON-600",
    isAndes: true, cluster: 'MV Hondius'
  },
  {
    country: "Tristan da Cunha (UK territory)",
    coords: [-37.07, -12.32],
    confirmed: 0, probable: 1, deaths: 0, monitoring: 3,
    status: "SUSPECTED · Andes Virus",
    note: "Island resident suspected infected during Apr 13–15 ship stop. British paratroopers from 16 Air Assault Brigade parachuted in (island has no airstrip), delivering 3,300 kg of medical supplies and PPE.",
    source: "Wikipedia / UK MoD",
    isAndes: true, cluster: 'MV Hondius'
  },
  {
    country: "Saint Helena (UK territory)",
    coords: [-15.97, -5.71],
    confirmed: 0, probable: 0, deaths: 0, monitoring: 30,
    status: "MONITORING · Andes Virus",
    note: "30 passengers disembarked here Apr 24, dispersing to 12 countries. All 30 traced by UKHSA under 42-day monitoring protocol (last exposure +42 days = 5 Jun 2026).",
    source: "Wikipedia / UKHSA",
    isAndes: true, cluster: 'MV Hondius'
  },
  {
    country: "Cape Verde — Praia",
    coords: [14.93, -23.51],
    confirmed: 0, probable: 0, deaths: 0, monitoring: 5,
    status: "MONITORING · Andes Virus",
    note: "Ship docked May 3–6 for medical coordination. 5 individuals under monitoring.",
    source: "Wikipedia / WHO",
    isAndes: true, cluster: 'MV Hondius'
  },
  {
    country: "Argentina — Ushuaia (origin)",
    coords: [-54.81, -68.31],
    confirmed: 0, probable: 0, deaths: 0, monitoring: 0,
    status: "ORIGIN POINT · Andes Virus",
    note: "MV Hondius departed Apr 1. Index case had a 4-month road trip through Chile, Uruguay and Argentina (Nov 2025–Apr 2026). Environmental rodent exposure is the working hypothesis for initial infection.",
    source: "WHO DON-600",
    isAndes: true, cluster: 'MV Hondius'
  },
  {
    country: "Canada",
    coords: [45.42, -75.69],
    confirmed: 0, probable: 0, deaths: 0, monitoring: 10,
    status: "MONITORING · Andes Virus",
    note: "10 Canadian nationals under monitoring as of May 11. All asymptomatic. PHAC contact tracing active.",
    source: "CBC / PHAC",
    isAndes: true, cluster: 'MV Hondius'
  },
  {
    country: "Belgium",
    coords: [50.85, 4.35],
    confirmed: 0, probable: 0, deaths: 0, monitoring: 3,
    status: "MONITORING · Andes Virus",
    note: "3 Belgian nationals in precautionary 42-day monitoring. No confirmed cases.",
    source: "Sciensano / WHO",
    isAndes: true, cluster: 'MV Hondius'
  },
  {
    country: "Australia",
    coords: [-33.87, 151.21],
    confirmed: 0, probable: 0, deaths: 0, monitoring: 2,
    status: "MONITORING · Andes Virus",
    note: "2 Australian nationals under monitoring. No confirmed cases.",
    source: "Australian DoH / WHO",
    isAndes: true, cluster: 'MV Hondius'
  },
  {
    country: "Italy",
    coords: [41.90, 12.50],
    confirmed: 0, probable: 0, deaths: 0, monitoring: 4,
    status: "MONITORING · Andes Virus",
    note: "4 airline passengers placed under hantavirus monitoring after Tenerife flight connections.",
    source: "ISS / VisaHQ / WHO",
    isAndes: true, cluster: 'MV Hondius'
  },
  {
    country: "Singapore",
    coords: [1.29, 103.85],
    confirmed: 0, probable: 0, deaths: 0, monitoring: 2,
    status: "MONITORING · Andes Virus",
    note: "2 Singaporean nationals tested negative May 8. Remain under precautionary monitoring.",
    source: "MOH Singapore / WHO",
    isAndes: true, cluster: 'MV Hondius'
  },
  {
    country: "Ireland",
    coords: [53.33, -6.25],
    confirmed: 0, probable: 0, deaths: 0, monitoring: 2,
    status: "MONITORING · Andes Virus",
    note: "2 Irish nationals in precautionary monitoring.",
    source: "HPSC / WHO",
    isAndes: true, cluster: 'MV Hondius'
  },
];

const clusterDataAllTime = clusterDataCurrent; // same for now — outbreak is recent

// All-time: cumulative/historical endemic data since first documented cases
const globalDataAllTime = [
  {
    country: "Argentina — Patagonia (endemic since 1995)",
    coords: [-41.133, -71.310],
    confirmed: 1820, probable: 0, deaths: 481, monitoring: 0,
    status: "ENDEMIC · Andes Virus",
    note: "Andes virus first identified 1995 in Río Negro. 1820+ confirmed cases since surveillance began. CFR historically 25–35%.",
    source: "PAHO / Argentina MoH cumulative",
    isAndes: true
  },
  {
    country: "Chile — Aysén & Bio-Bío (endemic since 1995)",
    coords: [-45.575, -72.065],
    confirmed: 1140, probable: 0, deaths: 285, monitoring: 0,
    status: "ENDEMIC · Andes Virus",
    note: "First Chilean case 1995. Ongoing endemic transmission in Patagonian regions.",
    source: "Chile MINSAL cumulative",
    isAndes: true
  },
  {
    country: "United States — Four Corners (endemic since 1993)",
    coords: [36.999, -109.045],
    confirmed: 907, probable: 0, deaths: 357, monitoring: 0,
    status: "ENDEMIC · Sin Nombre Virus",
    note: "Sin Nombre virus identified during 1993 Four Corners outbreak. 907 total cases through 2026. CFR ~38%.",
    source: "CDC cumulative HPS surveillance 1993–2026"
  },
  {
    country: "Brazil — Amazônia / Cerrado",
    coords: [-10.5, -52.0],
    confirmed: 2100, probable: 0, deaths: 693, monitoring: 0,
    status: "ENDEMIC · Araraquara / Juquitiba virus",
    note: "Brazil reports highest HPS burden in S. America. ~100–200 cases/yr. CFR ~33%.",
    source: "Brazil MoH / PAHO cumulative"
  },
  {
    country: "Panama / Central America",
    coords: [8.9, -79.5],
    confirmed: 142, probable: 0, deaths: 58, monitoring: 0,
    status: "LOW ENDEMIC · Choclo / Calabazo virus",
    note: "Choclo virus (Los Santos, Panama) first described 1999. Sporadic cases.",
    source: "PAHO / Panama MoH cumulative"
  },
  {
    country: "China — Shaanxi (endemic since ~1950s)",
    coords: [34.341, 108.940],
    confirmed: 320000, probable: 0, deaths: 9600, monitoring: 0,
    status: "HIGH ENDEMIC · HFRS (Hantaan/Seoul)",
    note: "China accounts for >90% of global HFRS burden. ~10 000–50 000 cases/yr historically.",
    source: "China CDC / WHO cumulative"
  },
  {
    country: "Russia — Ural / W. Siberia",
    coords: [56.015, 92.893],
    confirmed: 180000, probable: 0, deaths: 2900, monitoring: 0,
    status: "HIGH ENDEMIC · HFRS (Puumala/Dobrava)",
    note: "Russia reports 5 000–10 000 HFRS cases/yr. Ural region most affected.",
    source: "Rospotrebnadzor cumulative"
  },
  {
    country: "Scandinavia — Finland / Sweden",
    coords: [63.5, 26.0],
    confirmed: 55000, probable: 0, deaths: 88, monitoring: 0,
    status: "ENDEMIC · Nephropathia epidemica (Puumala)",
    note: "Puumala virus (bank vole). Finland ~2 000–8 000 cases/yr. Low CFR <0.1%.",
    source: "ECDC / THL Finland cumulative"
  },
  {
    country: "Balkans — Serbia / Bosnia",
    coords: [44.0, 20.5],
    confirmed: 18000, probable: 0, deaths: 180, monitoring: 0,
    status: "ENDEMIC · HFRS (Dobrava)",
    note: "Dobrava virus endemic in Balkans. Periodic outbreaks especially in Serbia.",
    source: "ECDC cumulative"
  },
  {
    country: "MV Hondius — South Atlantic outbreak origin",
    coords: [-54.9, -67.7],
    confirmed: 9, probable: 2, deaths: 3, monitoring: 47,
    status: "ORIGIN POINT · Andes Virus",
    note: "Outbreak traced to contact with rodents during shore excursion near Ushuaia, Argentina (Apr 2026).",
    source: "WHO DON-600 / virological.org May 2026",
    isAndes: true
  }
];

const ukraineDataAllTime = [
  {
    country: "Lviv Oblast (since 1990s)",
    coords: [49.840, 24.030],
    confirmed: 340, probable: 80, deaths: 4, monitoring: 0,
    status: "ENDEMIC · HFRS (Puumala)",
    note: "Endemic HFRS since independence. 30–60 cases/yr. Worsened 2022–2026 due to displacement.",
    source: "Ukraine MoH cumulative"
  },
  {
    country: "Zakarpattia Oblast",
    coords: [48.621, 22.288],
    confirmed: 620, probable: 140, deaths: 12, monitoring: 0,
    status: "ENDEMIC · HFRS (Dobrava)",
    note: "Highest historical HFRS burden in Ukraine. Carpathian rodent reservoir persistent.",
    source: "Ukraine MoH cumulative"
  },
  {
    country: "Kharkiv Oblast",
    coords: [49.990, 36.230],
    confirmed: 280, probable: 60, deaths: 5, monitoring: 0,
    status: "MODERATE ENDEMIC · HFRS",
    note: "Pre-war endemic zone. Surveillance collapsed 2022–2024 due to occupation.",
    source: "Ukraine MoH / ECDC"
  },
  {
    country: "Eastern Front — Donbas",
    coords: [48.015, 37.802],
    confirmed: 38, probable: 22, deaths: 4, monitoring: 90,
    status: "CRITICAL · HFRS (active conflict zone)",
    note: "Current cases only — no reliable historical data from occupied territories since 2014.",
    source: "MSF / WHO 2025–2026"
  },
  {
    country: "Southern Front — Zaporizhzhia",
    coords: [47.838, 35.139],
    confirmed: 21, probable: 14, deaths: 2, monitoring: 55,
    status: "HIGH · HFRS",
    note: "Kakhovka dam flood zone. Rodent habitat disruption driving spread.",
    source: "WHO Ukraine / MSF 2025–2026"
  }
];

// Epidemic curve — MV Hondius, weekly incident cases (WHO DON-600 / Wikipedia verified)
const epiCurveData = [
  { week: 'Apr 1',  confirmed: 1, suspected: 0, deaths: 0 },
  { week: 'Apr 8',  confirmed: 0, suspected: 0, deaths: 1 },
  { week: 'Apr 15', confirmed: 1, suspected: 1, deaths: 0 },
  { week: 'Apr 22', confirmed: 2, suspected: 1, deaths: 1 },
  { week: 'Apr 29', confirmed: 2, suspected: 1, deaths: 1 },
  { week: 'May 6',  confirmed: 2, suspected: 0, deaths: 0 },
  { week: 'May 12', confirmed: 3, suspected: 1, deaths: 0 },
];

// Ship route waypoints — each stop with date and unique detail
const SHIP_ROUTE = [
  { coords: [-54.81, -68.31], name: "Ushuaia, Argentina",      date: "1 Apr 2026",       icon: "⚓", note: "Departure. 175 pax/crew from 23 nations. Tickets €14,000–€22,000." },
  { coords: [-54.28, -36.51], name: "South Georgia",           date: "4–7 Apr 2026",     icon: "🏔", note: "Remote island stop. No cases recorded here." },
  { coords: [-37.07, -12.32], name: "Tristan da Cunha",        date: "13–15 Apr 2026",   icon: "🪂", note: "1 resident suspected infected. British paratroopers parachuted in (no airstrip) with 3,300 kg of medical supplies." },
  { coords: [-15.97, -5.71],  name: "Saint Helena",            date: "24 Apr 2026",      icon: "⚠", note: "30 passengers disembarked to 12 countries. All traced by UKHSA." },
  { coords: [-7.94, -14.36],  name: "Ascension Island",        date: "27 Apr 2026",      icon: "🚁", note: "Ill British passenger medically evacuated." },
  { coords: [14.93, -23.51],  name: "Praia, Cape Verde",       date: "3–6 May 2026",     icon: "⚕", note: "Docked for WHO-coordinated medical operations." },
  { coords: [28.46, -16.25],  name: "Tenerife, Spain",         date: "10 May 2026",      icon: "✈", note: "94 passengers evacuated via 7 international flights. Canary Islands initially refused entry." },
  { coords: [51.92,  4.48],   name: "Rotterdam, Netherlands",  date: "ETA 17 May 2026",  icon: "🏠", note: "Final destination. Home port of MV Hondius." },
];

// Timeline of key outbreak events
const TIMELINE = [
  { date: "Nov 2025",   text: "Index case begins 4-month road trip: Chile → Uruguay → Argentina", type: "origin" },
  { date: "1 Apr",      text: "MV Hondius departs Ushuaia. 175 people, 23 nationalities, tickets €14k–€22k", type: "origin" },
  { date: "6 Apr",      text: "First symptoms in Dutch man (70M) — index case", type: "case" },
  { date: "11 Apr",     text: "Index case dies aboard. Initially attributed to natural causes", type: "death" },
  { date: "13–15 Apr",  text: "Tristan da Cunha stop — 1 island resident later suspected infected. Paratroopers airdrop 3,300 kg supplies", type: "spread" },
  { date: "24 Apr",     text: "30 passengers disembark at Saint Helena across 12 countries", type: "spread" },
  { date: "25 Apr",     text: "Wife of index case boards KLM flight (45 min) — infected in flight", type: "case" },
  { date: "26 Apr",     text: "Wife dies in Johannesburg hospital — 2nd death, person-to-person transmission confirmed", type: "death" },
  { date: "27 Apr",     text: "British passenger medically evacuated at Ascension Island", type: "spread" },
  { date: "2 May",      text: "German woman dies aboard ship — 3rd and final death", type: "death" },
  { date: "2 May",      text: "WHO notified. Andes virus confirmed via gene sequencing", type: "who" },
  { date: "4 May",      text: "WHO issues Disease Outbreak Notice DON-600", type: "who" },
  { date: "6 May",      text: "Medical evacuations to Netherlands begin. Swiss case confirmed positive", type: "spread" },
  { date: "7 May",      text: "Two UK nationals and KLM flight attendant confirmed/hospitalized", type: "case" },
  { date: "10 May",     text: "Ship arrives Tenerife. 94 passengers on 7 evacuation flights to 22 countries", type: "spread" },
  { date: "11 May",     text: "France (critical), USA, Spain each confirm 1 new case. 16 Americans at Nebraska Medical Center", type: "case" },
  { date: "12 May",     text: "Total: 10 cases (8 confirmed + 2 probable), 3 deaths. CFR 38%", type: "update" },
];

// ── Active view state ──
let activeRegion = 'global'; // 'global' | 'cluster' | 'ukraine'
let activePeriod = 'current'; // 'current' | 'alltime'
let activeStatus = 'all';    // 'all' | 'confirmed' | 'suspected' | 'deaths' | 'monitoring'
let countrySearch = '';

const getDataset = () => {
  if (activeRegion === 'global')  return activePeriod === 'current' ? globalDataCurrent  : globalDataAllTime;
  if (activeRegion === 'cluster') return activePeriod === 'current' ? clusterDataCurrent : clusterDataAllTime;
  if (activeRegion === 'ukraine') return activePeriod === 'current' ? ukraineDataCurrent : ukraineDataAllTime;
};

const filterDataset = (dataset) => {
  let filtered = dataset;

  if (countrySearch.trim()) {
    const q = countrySearch.toLowerCase();
    filtered = filtered.filter(r => r.country.toLowerCase().includes(q));
  }

  if (activeStatus === 'confirmed') filtered = filtered.filter(r => r.confirmed > 0);
  if (activeStatus === 'suspected') filtered = filtered.filter(r => (r.probable || 0) > 0);
  if (activeStatus === 'deaths')    filtered = filtered.filter(r => (r.deaths || 0) > 0);
  if (activeStatus === 'monitoring') filtered = filtered.filter(r => (r.monitoring || 0) > 0);

  return filtered;
};

let markersLayer = L.layerGroup().addTo(map);
let routeLayer   = L.layerGroup().addTo(map);

// ── Icons ──

const createCustomIcon = (region) => {
  const { confirmed, isShip, isAndes } = region;

  if (isShip && isAndes) {
    return L.divIcon({
      className: '',
      html: `<div style="
        position:relative; display:flex; align-items:center; justify-content:center;
        width:42px; height:42px;
        background:#1a0000; border:1px solid #c0392b;
        font-size:24px; line-height:1;
        animation:pulseSkull 1.2s infinite;
      ">☠️<span style="position:absolute;bottom:0;right:0;font-size:13px;line-height:1">🚢</span></div>`,
      iconSize: [42, 42], iconAnchor: [21, 21]
    });
  }

  if (isAndes) {
    const size = Math.min(Math.max(confirmed * 0.3, 32), 52);
    return L.divIcon({
      className: '',
      html: `<div style="
        display:flex; align-items:center; justify-content:center;
        width:${size}px; height:${size}px;
        background:#1a0000; border:1px solid #c0392b; border-radius:50%;
        font-size:${Math.round(size * 0.55)}px; line-height:1;
        animation:pulseSkull 1.4s infinite;
      ">☠️</div>`,
      iconSize: [size, size], iconAnchor: [size/2, size/2]
    });
  }

  const size = Math.min(Math.max(Math.sqrt(confirmed) * 2.5, 12), 38);
  const color = confirmed > 400 ? '#c0392b' : confirmed > 50 ? '#d97706' : '#2563eb';
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px; height:${size}px; border-radius:50%;
      background:${color}; opacity:0.75;
      border:1px solid rgba(255,255,255,0.3);
      box-shadow:0 0 ${size/2}px ${color};
    "></div>`,
    iconSize: [size, size], iconAnchor: [size/2, size/2]
  });
};

// ── Status indicator ──

const refreshLabel = () => document.getElementById('refresh-label');

function setStatus(state, text) {
  const el = refreshLabel();
  if (!el) return;
  el.className = state;
  el.innerHTML = `<span class="status-dot"></span>${text}`;
}

function setIdle() {
  setStatus('', `Updated: ${new Date().toLocaleTimeString()}`);
}

function flashEl(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('flash');
  void el.offsetWidth;
  el.classList.add('flash');
  el.addEventListener('animationend', () => el.classList.remove('flash'), { once: true });
}

// ── Ship route ──

function renderShipRoute(visible) {
  routeLayer.clearLayers();
  if (!visible) return;

  // Dashed polyline along the route
  const coords = SHIP_ROUTE.map(s => s.coords);
  L.polyline(coords, {
    color: '#c0392b',
    weight: 1.5,
    opacity: 0.55,
    dashArray: '6 5',
    lineJoin: 'round',
  }).addTo(routeLayer);

  // Waypoint markers
  SHIP_ROUTE.forEach((stop, i) => {
    const isLast  = i === SHIP_ROUTE.length - 1;
    const isCurrent = i === 6; // Tenerife — current position
    const html = `
      <div style="
        display:flex;align-items:center;justify-content:center;
        width:28px;height:28px;
        background:${isCurrent ? '#c0392b' : '#1a0a0a'};
        border:1px solid ${isCurrent ? '#ff6b6b' : '#5a2020'};
        border-radius:50%;
        font-size:13px;line-height:1;
        opacity:${isLast ? 0.5 : 1};
        box-shadow:0 0 ${isCurrent ? 10 : 4}px ${isCurrent ? '#c0392b' : '#3a0a0a'};
      ">${stop.icon}</div>`;

    const marker = L.marker(stop.coords, {
      icon: L.divIcon({ className: '', html, iconSize: [28,28], iconAnchor: [14,14] })
    });

    marker.bindPopup(`
      <div class="popup-title">${stop.icon} ${stop.name}</div>
      <div style="font-size:0.7rem;color:#d97706;margin:4px 0">${stop.date}</div>
      <div style="font-size:0.75rem;color:#aaa;line-height:1.4">${stop.note}</div>
    `, { maxWidth: 260 });

    routeLayer.addLayer(marker);
  });
}

// ── Timeline (renders into news feed when cluster tab active) ──

function renderTimeline() {
  const feed = document.getElementById('news-feed');
  const header = document.querySelector('.news-header h2');
  const badge  = document.querySelector('.live-badge');
  if (!feed) return;

  if (header) header.textContent = 'Outbreak Timeline';
  if (badge)  badge.textContent  = 'WHO VERIFIED';

  const typeColor = { origin:'#5a5a5a', case:'#d97706', death:'#c0392b', spread:'#2563eb', who:'#7c3aed', update:'#059669' };
  const typeLabel = { origin:'ORIGIN', case:'CASE', death:'DEATH', spread:'SPREAD', who:'WHO', update:'UPDATE' };

  feed.innerHTML = TIMELINE.slice().reverse().map(e => `
    <div class="news-item" style="cursor:default">
      <div class="news-meta">
        <span class="news-source" style="color:${typeColor[e.type]}">${typeLabel[e.type]}</span>
        <span class="news-time">${e.date}</span>
      </div>
      <div class="news-title" style="color:#ccc">${e.text}</div>
    </div>
  `).join('');
}

function restoreNewsFeed() {
  const header = document.querySelector('.news-header h2');
  const badge  = document.querySelector('.live-badge');
  if (header) header.textContent = 'Latest Reports';
  if (badge)  badge.textContent  = 'LIVE';
}

// ── Epidemic Curve ──

function renderEpiCurve() {
  const chart = document.getElementById('epi-chart');
  const subtitle = document.getElementById('epi-subtitle');
  if (!chart) return;

  if (activeRegion !== 'cluster') {
    chart.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:0.72rem;color:#444">Select MV Hondius tab to view epidemic curve</div>';
    if (subtitle) subtitle.textContent = 'Switch to MV Hondius tab';
    return;
  }

  if (subtitle) subtitle.textContent = 'MV Hondius cluster · Weekly incident cases';

  const CHART_H = 72; // px available for bars
  const maxVal = Math.max(...epiCurveData.map(w => w.confirmed + w.suspected + w.deaths), 1);

  chart.innerHTML = epiCurveData.map(w => {
    const cPx = Math.round((w.confirmed / maxVal) * CHART_H);
    const sPx = Math.round((w.suspected / maxVal) * CHART_H);
    const dPx = Math.round((w.deaths    / maxVal) * CHART_H);

    return `
      <div class="epi-week">
        <div class="epi-bar-group">
          <div class="epi-bar deaths"    style="height:${dPx}px"></div>
          <div class="epi-bar suspected" style="height:${sPx}px"></div>
          <div class="epi-bar confirmed" style="height:${cPx}px"></div>
        </div>
        <div class="epi-week-label">${w.week}</div>
      </div>
    `;
  }).join('');
}

// ── Render ──

const renderMapData = (dataset) => {
  const filtered = filterDataset(dataset);
  markersLayer.clearLayers();

  let totalConfirmed = 0, totalSuspected = 0, totalDeaths = 0, totalMonitoring = 0;

  filtered.forEach(region => {
    totalConfirmed  += region.confirmed || 0;
    totalSuspected  += region.probable  || 0;
    totalDeaths     += region.deaths    || 0;
    totalMonitoring += region.monitoring || 0;

    const andesBadge = region.isAndes
      ? `<div class="popup-andes-badge">☠ Andes Virus — Person-to-person transmission possible</div>`
      : '';

    const deathsRow = region.deaths
      ? `<div class="popup-stat deaths"><span>Deaths</span><span>${region.deaths}</span></div>`
      : '';

    const monRow = region.monitoring
      ? `<div class="popup-stat monitoring"><span>Monitoring</span><span>${region.monitoring}</span></div>`
      : '';

    const popup = `
      <div class="popup-title">${region.country}</div>
      <div class="popup-stat confirmed"><span>Confirmed</span><span>${(region.confirmed||0).toLocaleString()}</span></div>
      ${region.probable ? `<div class="popup-stat suspected"><span>Probable</span><span>${region.probable}</span></div>` : ''}
      ${deathsRow}
      ${monRow}
      ${andesBadge}
      <div style="margin-top:10px;font-size:0.75rem;color:#5a5a5a;line-height:1.4">${region.note}</div>
      <div style="margin-top:6px;font-size:0.65rem;color:#3a3a3a">Source: ${region.source}</div>
    `;

    const marker = L.marker(region.coords, { icon: createCustomIcon(region) });
    marker.bindPopup(popup, { maxWidth: 280 });
    markersLayer.addLayer(marker);
  });

  const el = (id) => document.getElementById(id);

  const cfr = totalConfirmed > 0
    ? ((totalDeaths / totalConfirmed) * 100).toFixed(1) + '%'
    : '—';

  const vals = {
    'total-confirmed': totalConfirmed.toLocaleString(),
    'total-suspected': totalSuspected.toLocaleString(),
    'total-deaths':    totalDeaths.toLocaleString(),
    'total-monitoring': totalMonitoring.toLocaleString(),
    'total-cfr':       cfr,
    'total-regions':   filtered.length,
  };

  Object.entries(vals).forEach(([id, next]) => {
    const elem = el(id);
    if (!elem) return;
    const prev = elem.textContent;
    elem.textContent = next;
    if (prev && prev !== '—' && prev !== next) flashEl(id);
  });

  renderEpiCurve();
};

renderMapData(getDataset());

// ── Tab helpers ──

function setActiveTab(id) {
  ['tab-global', 'tab-cluster', 'tab-ukraine'].forEach(t => {
    document.getElementById(t)?.classList.toggle('active', t === id);
  });
}

function switchView() {
  setStatus('updating', 'Loading map data…');
  setTimeout(() => {
    renderMapData(getDataset());
    setIdle();
  }, 300);
}

// ── Region tabs ──

document.getElementById('tab-global').addEventListener('click', () => {
  activeRegion = 'global';
  setActiveTab('tab-global');
  renderShipRoute(false);
  restoreNewsFeed();
  fetchNews();
  switchView();
  map.flyTo([20, 0], 2, { animate: true, duration: 1.5 });
});

document.getElementById('tab-cluster').addEventListener('click', () => {
  activeRegion = 'cluster';
  setActiveTab('tab-cluster');
  renderShipRoute(true);
  renderTimeline();
  switchView();
  // Fly to show full Atlantic route
  map.flyTo([5, -25], 3, { animate: true, duration: 1.8 });
});

document.getElementById('tab-ukraine').addEventListener('click', () => {
  activeRegion = 'ukraine';
  setActiveTab('tab-ukraine');
  renderShipRoute(false);
  restoreNewsFeed();
  fetchNews();
  switchView();
  map.flyTo([48.5, 31.0], 6, { animate: true, duration: 1.5 });
});

// ── Period filter ──

document.getElementById('filter-current').addEventListener('click', () => {
  activePeriod = 'current';
  document.getElementById('filter-current').classList.add('active');
  document.getElementById('filter-alltime').classList.remove('active');
  switchView();
});

document.getElementById('filter-alltime').addEventListener('click', () => {
  activePeriod = 'alltime';
  document.getElementById('filter-alltime').classList.add('active');
  document.getElementById('filter-current').classList.remove('active');
  switchView();
});

// ── Status filters ──

document.querySelectorAll('.status-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    activeStatus = btn.dataset.status;
    document.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    switchView();
  });
});

// ── Country search ──

const searchInput = document.getElementById('country-search');
const searchClear = document.getElementById('search-clear');

searchInput?.addEventListener('input', () => {
  countrySearch = searchInput.value;
  searchClear.style.display = countrySearch ? 'block' : 'none';
  switchView();
});

searchClear?.addEventListener('click', () => {
  countrySearch = '';
  searchInput.value = '';
  searchClear.style.display = 'none';
  switchView();
});

// ── News Feed ──

function showNewsSkeleton(feed) {
  feed.innerHTML = Array.from({ length: 5 }, () => `
    <div class="news-skeleton">
      <div class="skeleton-line short"></div>
      <div class="skeleton-line long"></div>
      <div class="skeleton-line mid"></div>
    </div>
  `).join('');
}

async function fetchNews() {
  const feed = document.getElementById('news-feed');
  showNewsSkeleton(feed);
  setStatus('loading', 'Loading news feed…');

  try {
    const rssUrl = encodeURIComponent('https://news.google.com/rss/search?q=hantavirus+OR+"Andes+virus"+OR+"MV+Hondius"&hl=en-US&gl=US&ceid=US:en');
    const res  = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`);
    const data = await res.json();
    if (data.status !== 'ok') throw new Error();

    feed.innerHTML = '';
    data.items.slice(0, 10).forEach(item => {
      const parts = (item.title || '').split(' - ');
      const source = parts.length > 1 ? parts.pop() : 'Source';
      const title  = parts.join(' - ');
      const diff   = Date.now() - new Date(item.pubDate || 0);
      const hrs    = Math.floor(diff / 36e5);
      const time   = hrs === 0
        ? `${Math.floor(diff / 6e4)}m ago`
        : hrs < 24 ? `${hrs}h ago` : `${Math.floor(hrs/24)}d ago`;

      const a = document.createElement('a');
      a.className = 'news-item';
      a.href = item.link || '#';
      a.target = '_blank';
      a.innerHTML = `
        <div class="news-meta">
          <span class="news-source">${source}</span>
          <span class="news-time">${time}</span>
        </div>
        <div class="news-title">${title}</div>
      `;
      feed.appendChild(a);
    });

    setIdle();
  } catch {
    feed.innerHTML = `<div style="padding:16px;font-size:0.75rem;color:#c0392b">Feed unavailable</div>`;
    setStatus('', 'Feed error');
  }
}

fetchNews();
setInterval(fetchNews, 5 * 60 * 1000);

// ── Live fluctuation (visual only, current period only) ──

function simulateLive() {
  if (activePeriod !== 'current') return;
  setStatus('updating', 'Updating data…');

  setTimeout(() => {
    const jitter = (v, d) => Math.max(0, v + Math.floor((Math.random() - 0.45) * d));
    [...globalDataCurrent, ...ukraineDataCurrent].forEach(r => {
      r.confirmed = jitter(r.confirmed, 2);
      if (r.probable !== undefined) r.probable = jitter(r.probable, 1);
    });
    renderMapData(getDataset());
    setIdle();
  }, 600);
}

setInterval(simulateLive, 30 * 1000);

// ── Fly to ship on load ──

setTimeout(() => {
  map.flyTo([31.8, -14.2], 5, { animate: true, duration: 3 });
}, 800);

// ── Pandemic simulation ──

const sim = new Simulation(map);

const simPanel      = document.getElementById('sim-panel');
const simStartBtn   = document.getElementById('sim-start-btn');
const simStopBtn    = document.getElementById('sim-stop-btn');
const simResetBtn   = document.getElementById('sim-reset-btn');
const simDate       = document.getElementById('sim-date');
const simBadge      = document.getElementById('sim-badge');
const simWeek       = document.getElementById('sim-week');
const simInfectious = document.getElementById('sim-infectious');
const simDeaths     = document.getElementById('sim-deaths');
const simSurvivors  = document.getElementById('sim-survivors');
const simCountries  = document.getElementById('sim-countries');

function fmt(n) {
  if (n >= 1e9) return (n/1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n/1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n/1e3).toFixed(0) + 'K';
  return n.toLocaleString();
}

function updateSimPanel(s) {
  simDate.textContent       = s.dateStr;
  simWeek.textContent       = `W${s.week}`;
  simInfectious.textContent = fmt(s.totalI);
  simDeaths.textContent     = fmt(s.totalD);
  simSurvivors.textContent  = fmt(s.totalR);
  simCountries.textContent  = `${s.affected}/66`;
}

simStartBtn.addEventListener('click', () => {
  if (sim.running) return;

  simPanel.classList.add('visible');
  simStartBtn.classList.add('running');
  simStartBtn.textContent = '☣ Running…';
  simBadge.textContent    = 'LIVE';
  simBadge.className      = 'sim-badge running';

  map.flyTo([20, 10], 2, { animate: true, duration: 1.5 });

  sim.start(
    (s) => updateSimPanel(s),
    (s) => {
      updateSimPanel(s);
      simStartBtn.textContent = '☣ Simulate Spread';
      simStartBtn.classList.remove('running');
      simBadge.textContent = 'PANDEMIC';
      simBadge.className   = 'sim-badge ended';
      simDate.textContent  = `${s.dateStr} — simulation complete`;
      setStatus('', `Pandemic: ${fmt(s.totalD)} dead · ${fmt(s.totalR)} survived`);
    }
  );
});

simStopBtn.addEventListener('click', () => {
  sim.stop();
  simStartBtn.textContent = '☣ Simulate Spread';
  simStartBtn.classList.remove('running');
  simBadge.textContent = 'PAUSED';
  simBadge.className   = 'sim-badge';
});

simResetBtn.addEventListener('click', () => {
  sim.reset();
  simPanel.classList.remove('visible');
  simStartBtn.textContent = '☣ Simulate Spread';
  simStartBtn.classList.remove('running');
  simBadge.textContent = '';
  simDate.textContent  = 'Simulation paused';
  [simWeek, simInfectious, simCountries].forEach(el => { if (el) el.textContent = '—'; });
  if (simDeaths) simDeaths.textContent = '—';
  if (simSurvivors) simSurvivors.textContent = '—';
});
