// export function getMaterialRate(material) {
//   // We need prices for different pipe sizes!! For now, return fixed rates.
//   const rates = {
//     copper: 55, // parseFloat(document.getElementById("copperRate").value),
//     pex: 35, //parseFloat(document.getElementById("pexRate").value),
//     stainless: 75, //parseFloat(document.getElementById("stainlessRate").value),
//     plastic: 25, //parseFloat(document.getElementById("plasticRate").value),
//   };
//   return rates[material] || 0;
// }

// export function getRadiatorCost(type) {
//   const costs = {
//     standard: 150,
//     compact: 200,
//     premium: 280,
//     designer: 450,
//   };
//   return costs[type] || 150;
// }

// export function getCylinderCost(size, type) {
//   const baseCosts = {
//     150: 600,
//     200: 750,
//     250: 900,
//     300: 1100,
//     400: 1400,
//   };
//   const typeMultipliers = {
//     unvented: 1.0,
//     vented: 0.8,
//     thermal_store: 1.3,
//   };
//   return (baseCosts[size] || 600) * (typeMultipliers[type] || 1.0);
// }

// export function getControlSystemCost(type, zones) {
//   const baseCosts = {
//     basic: 300,
//     weather_comp: 600,
//     smart_home: 900,
//     zone_control: 1200,
//   };
//   const zoneCost = zones > 2 ? (zones - 2) * 150 : 0;
//   return (baseCosts[type] || 300) + zoneCost;
// }
// // test/lib/materials.js
//const defaultData = { ...same shape as JSON above... };
import defaultData from './materials.json' with { type: 'json' };
let cachedData = null;
let loadingPromise = null;

async function fetchMaterials() {
  if (!loadingPromise) {
    loadingPromise = fetch("./lib/materials.json", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`materials.json ${res.status}`);
        return res.json();
      })
      .then((data) => (cachedData = data))
      .catch((err) => {
        console.warn("Falling back to defaults:", err);
        cachedData = structuredClone(defaultData);
      });
  }
  await loadingPromise;
  return cachedData;
}

export async function initMaterials() {
  await fetchMaterials();
}

function getData() {
  if (!cachedData) {
    console.warn("Material data not loaded yet; using defaults");
    return defaultData;
  }
  return cachedData;
}

export function getMaterialRate(material) {
  return getData().pipeRates[material] ?? 0;
}

export function getRadiatorCost(type) {
  return getData().radiatorCosts[type] ?? defaultData.radiatorCosts.standard;
}
export function getValveCost(type) {
  return getData().radiatorValveCost[type] ?? defaultData.radiatorValveCost.none;
}

export function getCylinderCost(size, type) {
  const { base, typeMultiplier } = getData().cylinderCosts;
  return (base[size] ?? base["150"]) * (typeMultiplier[type] ?? 1);
}

export function getControlSystemCost(type, zones) {
  const { base, includedZones, extraZoneFee } = getData().controlSystems;
  const zoneCost = Math.max(0, zones - includedZones) * extraZoneFee;
  return (base[type] ?? base.basic) + zoneCost;
}
export function getCondensateDrainCost() {
  return getData().condensateDrain ?? 0;
}

export function getElectricalCablesCost() {
  return getData().electricalCables ?? 0;
}
export function getComplexityMultiplier(type) {
  return getData().complexityMultiplier[type] ?? 1;
}
export function getSystemMultiplier(type) {
  return getData().systemMultiplier[type] ?? 1;
}
export async function saveMaterials(updated) {
  const res = await fetch("/api/materials", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updated),
  });
  if (!res.ok) throw new Error(`Save failed ${res.status}`);
  cachedData = await res.json();
  return cachedData;
}