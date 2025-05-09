// js/economyManager.js
import * as CONST from './constants.js';
import { player as playerState, setEconomyUpdateIntervalId, getEconomyUpdateIntervalId } from './state.js'; // Import specific things
// Import UI functions
import { updateStatusPanel, showTradingMenu, showCraftingMenu } from './uiManager.js';// Import UI functions that need to be called after transactions or economy updates

// Market Data Structure
export const marketData = {
    "Io": {
        description: "Highly volcanic, rich in sulfur compounds and silicates. Requires heat shielding and specialized extraction tech.",
        icon: "🌋",
        companies: [
            { name: "VulcanCore Mining", produces: { resource: "Sulfur", baseRate: 160 * CONST.BASE_RATE_SCALE, inventory: 200000, basePrice: 2.50 }, consumes: { resource: "Refined Metals", baseDemand: 10 * CONST.BASE_RATE_SCALE, demandBuffer: 400, maxBuffer: 10 * CONST.BASE_RATE_SCALE * (CONST.MAX_DEMAND_BUFFER_FACTOR * 0.8), basePrice: 18.00 } },
            { name: "SilicaTech Extractors", produces: { resource: "Basaltic Silicates", baseRate: 80 * CONST.BASE_RATE_SCALE, inventory: 95000, basePrice: 2.80 }, consumes: { resource: "Water Ice", baseDemand: 12 * CONST.BASE_RATE_SCALE, demandBuffer: 800, maxBuffer: 12 * CONST.BASE_RATE_SCALE * CONST.MAX_DEMAND_BUFFER_FACTOR, basePrice: 1.60 } },
            { name: "IonGas Consortium", produces: { resource: "Sodium Gas", baseRate: 12 * CONST.BASE_RATE_SCALE, inventory: 6500, basePrice: 15.00 }, consumes: { resource: "Energy Cells", baseDemand: 3 * CONST.BASE_RATE_SCALE, demandBuffer: 150, maxBuffer: 3 * CONST.BASE_RATE_SCALE * (CONST.MAX_DEMAND_BUFFER_FACTOR * 0.7), basePrice: 25.00 } },
            { name: "GeoThermal Power Inc.", produces: { resource: "Energy Cells", baseRate: 30 * CONST.BASE_RATE_SCALE, inventory: 25000, basePrice: 16.00}, consumes: { resource: "Coolant", baseDemand: 10 * CONST.BASE_RATE_SCALE, demandBuffer: 800, maxBuffer: 10 * CONST.BASE_RATE_SCALE * CONST.MAX_DEMAND_BUFFER_FACTOR, basePrice: 6.50}}
        ]
    },
     "Europa": {
        description: "Subsurface ocean under thick ice. Water extraction is key, potential for unique extremophile byproducts.",
        icon: "🌊",
        companies: [
            { name: "CryoHarvest Inc.", produces: { resource: "Water Ice", baseRate: 250 * CONST.BASE_RATE_SCALE, inventory: 1800000, basePrice: 0.65 }, consumes: { resource: "Drilling Equipment", baseDemand: 5 * CONST.BASE_RATE_SCALE, demandBuffer: 200, maxBuffer: 5 * CONST.BASE_RATE_SCALE * CONST.MAX_DEMAND_BUFFER_FACTOR, basePrice: 110.00 } },
            { name: "BrineCore Ltd.", produces: { resource: "Magnesium Sulfates", baseRate: 40 * CONST.BASE_RATE_SCALE, inventory: 35000, basePrice: 2.00 }, consumes: { resource: "Chemical Solvents", baseDemand: 6 * CONST.BASE_RATE_SCALE, demandBuffer: 350, maxBuffer: 6 * CONST.BASE_RATE_SCALE * CONST.MAX_DEMAND_BUFFER_FACTOR, basePrice: 35.00 } },
            { name: "AquaLife Research", produces: { resource: "Biotic Samples", baseRate: 1.5 * CONST.BASE_RATE_SCALE, inventory: 400, basePrice: 180.00 }, consumes: { resource: "Lab Supplies", baseDemand: 2 * CONST.BASE_RATE_SCALE, demandBuffer: 50, maxBuffer: 2 * CONST.BASE_RATE_SCALE * CONST.MAX_DEMAND_BUFFER_FACTOR, basePrice: 55.00 } },
            { name: "Europa Filtration Co.", produces: { resource: "Purified Water", baseRate: 60 * CONST.BASE_RATE_SCALE, inventory: 60000, basePrice: 3.20 }, consumes: { resource: "Water Ice", baseDemand: 80 * CONST.BASE_RATE_SCALE, demandBuffer: 80000, maxBuffer: 80 * CONST.BASE_RATE_SCALE * (CONST.MAX_DEMAND_BUFFER_FACTOR * 1.2), basePrice: 0.85 } }
        ]
    },
     "Ganymede": {
        description: "Largest moon, complex geology with ice, rock, and a magnetic field. Supports larger settlements.",
        icon: "🌐",
        companies: [
            { name: "MagnaDrill Systems", produces: { resource: "Iron Ore", baseRate: 120 * CONST.BASE_RATE_SCALE, inventory: 280000, basePrice: 1.90 }, consumes: { resource: "Heavy Machinery", baseDemand: 8 * CONST.BASE_RATE_SCALE, demandBuffer: 400, maxBuffer: 8 * CONST.BASE_RATE_SCALE * CONST.MAX_DEMAND_BUFFER_FACTOR, basePrice: 140.00 } },
            { name: "CoreBound Extraction", produces: { resource: "Silicate Rock", baseRate: 130 * CONST.BASE_RATE_SCALE, inventory: 220000, basePrice: 2.10 }, consumes: { resource: "Explosives", baseDemand: 10 * CONST.BASE_RATE_SCALE, demandBuffer: 700, maxBuffer: 10 * CONST.BASE_RATE_SCALE * CONST.MAX_DEMAND_BUFFER_FACTOR, basePrice: 45.00 } },
            { name: "DeepIce Inc.", produces: { resource: "Subsurface Ice", baseRate: 70 * CONST.BASE_RATE_SCALE, inventory: 95000, basePrice: 1.20 }, consumes: { resource: "Energy Cells", baseDemand: 20 * CONST.BASE_RATE_SCALE, demandBuffer: 2000, maxBuffer: 20 * CONST.BASE_RATE_SCALE * (CONST.MAX_DEMAND_BUFFER_FACTOR * 1.1), basePrice: 21.00 } },
            { name: "Ganymede Smelters", produces: { resource: "Refined Metals", baseRate: 45 * CONST.BASE_RATE_SCALE, inventory: 60000, basePrice: 19.00 }, consumes: { resource: "Iron Ore", baseDemand: 100 * CONST.BASE_RATE_SCALE, demandBuffer: 120000, maxBuffer: 100 * CONST.BASE_RATE_SCALE * (CONST.MAX_DEMAND_BUFFER_FACTOR * 1.2), basePrice: 2.50 } }
        ]
    },
     "Callisto": {
        description: "Ancient, stable surface with low radiation. Ideal for large-scale outposts and bulk resource storage.",
        icon: "🪐",
        companies: [
            { name: "QuietCrust Mining", produces: { resource: "Nickel-Iron Chunks", baseRate: 200 * CONST.BASE_RATE_SCALE, inventory: 350000, basePrice: 1.40 }, consumes: { resource: "Robotic Miners", baseDemand: 6 * CONST.BASE_RATE_SCALE, demandBuffer: 300, maxBuffer: 6 * CONST.BASE_RATE_SCALE * CONST.MAX_DEMAND_BUFFER_FACTOR, basePrice: 125.00 } },
            { name: "OuterShell Corp.", produces: { resource: "CO₂ Ice", baseRate: 80 * CONST.BASE_RATE_SCALE, inventory: 110000, basePrice: 1.00 }, consumes: { resource: "Atmospheric Processors", baseDemand: 5 * CONST.BASE_RATE_SCALE, demandBuffer: 250, maxBuffer: 5 * CONST.BASE_RATE_SCALE * CONST.MAX_DEMAND_BUFFER_FACTOR, basePrice: 75.00 } },
            { name: "MantleEdge Ltd.", produces: { resource: "Ammonia Ice", baseRate: 50 * CONST.BASE_RATE_SCALE, inventory: 50000, basePrice: 1.60 }, consumes: { resource: "Chemical Storage Tanks", baseDemand: 3 * CONST.BASE_RATE_SCALE, demandBuffer: 150, maxBuffer: 3 * CONST.BASE_RATE_SCALE * CONST.MAX_DEMAND_BUFFER_FACTOR, basePrice: 70.00 } }
        ]
    },
    "Amalthea": { description: "Inner moon outpost.", icon: "🪨", companies: [{ name: "Amalthea Station", produces: { resource: "Carbonaceous Dust", baseRate: 12*CONST.BASE_RATE_SCALE, inventory: 7000, basePrice: 1.90 }, consumes: { resource: "Basic Supplies", baseDemand: 1.5*CONST.BASE_RATE_SCALE, demandBuffer: 80, maxBuffer: 1.5*CONST.BASE_RATE_SCALE*(CONST.MAX_DEMAND_BUFFER_FACTOR * 0.9), basePrice: 15.00 } }] },
    "Thebe": { description: "Mining platform Thebe.", icon: "🌑", companies: [{ name: "Thebe Extraction", produces: { resource: "Rocky Regolith", baseRate: 10*CONST.BASE_RATE_SCALE, inventory: 6000, basePrice: 1.75 }, consumes: { resource: "Fuel", baseDemand: 1.2*CONST.BASE_RATE_SCALE, demandBuffer: 70, maxBuffer: 1.2*CONST.BASE_RATE_SCALE*(CONST.MAX_DEMAND_BUFFER_FACTOR * 0.9), basePrice: 9.50 } }] },
    "Metis": { description: "Ring observation post Metis.", icon: "🛰", companies: [{ name: "Metis Monitoring", produces: { resource: "Sensor Data", baseRate: 1.5*CONST.BASE_RATE_SCALE, inventory: 150, basePrice: 60.00 }, consumes: { resource: "Maintenance Parts", baseDemand: 0.8*CONST.BASE_RATE_SCALE, demandBuffer: 40, maxBuffer: 0.8*CONST.BASE_RATE_SCALE*(CONST.MAX_DEMAND_BUFFER_FACTOR * 0.8), basePrice: 40.00 } }] },
    "Adrastea": { description: "Automated Ring Sampler.", icon: "🌀", companies: [{ name: "Adrastea Collector", produces: { resource: "Micrometeorite Dust", baseRate: 6*CONST.BASE_RATE_SCALE, inventory: 5500, basePrice: 1.50 }, consumes: { resource: "Data Storage Units", baseDemand: 0.3*CONST.BASE_RATE_SCALE, demandBuffer: 15, maxBuffer: 0.3*CONST.BASE_RATE_SCALE*(CONST.MAX_DEMAND_BUFFER_FACTOR * 0.7), basePrice: 30.00 } }] },
};

// Crafting Recipes
export const craftingRecipes = [
    { product: "Coolant", description: "High-performance thermal fluid for GeoThermal Power.", ingredients: { "Purified Water": 1, "Chemical Solvents": 1, "Sodium Gas": 2, "Energy Cells": 1 } },
    { product: "Drilling Equipment", description: "Autonomous cryo-compatible rig for CryoHarvest.", ingredients: { "Refined Metals": 3, "Heavy Machinery": 1, "Chemical Storage Tanks": 1, "Energy Cells": 1 } },
    { product: "Chemical Solvents", description: "Acidic-salt-based solvent for BrineCore & others.", ingredients: { "Magnesium Sulfates": 1, "Water Ice": 1, "Sulfur": 1 } },
    { product: "Lab Supplies", description: "Sterile equipment for AquaLife Research.", ingredients: { "Refined Metals": 1, "Chemical Solvents": 1, "Purified Water": 1 } },
    { product: "Heavy Machinery", description: "Massive rigs for MagnaDrill Systems.", ingredients: { "Refined Metals": 4, "Energy Cells": 1, "Silicate Rock": 2 } },
    { product: "Explosives", description: "Controlled charges for CoreBound Extraction.", ingredients: { "Sulfur": 2, "Refined Metals": 1, "Chemical Solvents": 1 } },
    { product: "Robotic Miners", description: "Autonomous extractors for QuietCrust Mining.", ingredients: { "Refined Metals": 3, "Energy Cells": 1, "Data Storage Units": 1, "Sensor Data": 1 } },
    { product: "Atmospheric Processors", description: "Gas extraction machines for OuterShell Corp.", ingredients: { "Refined Metals": 2, "Chemical Solvents": 1, "Sensor Data": 1, "Energy Cells": 1 } },
    { product: "Chemical Storage Tanks", description: "Pressurized containment for MantleEdge Ltd.", ingredients: { "Refined Metals": 2, "Purified Water": 1, "Silicate Rock": 1 } },
    { product: "Basic Supplies", description: "Life support items for Amalthea Station.", ingredients: { "Purified Water": 1, "Refined Metals": 1, "Rocky Regolith": 1, "Carbonaceous Dust": 1 } },
    { product: "Fuel", description: "Synthesized combustible for Thebe Extraction.", ingredients: { "CO₂ Ice": 2, "Chemical Solvents": 1, "Ammonia Ice": 1, "Energy Cells": 1 } },
    { product: "Maintenance Parts", description: "Repair kits for Metis Monitoring.", ingredients: { "Refined Metals": 1, "Data Storage Units": 1, "Micrometeorite Dust": 1 } },
    { product: "Data Storage Units", description: "Radiation-shielded archival medium for Adrastea Collector.", ingredients: { "Refined Metals": 1, "Sensor Data": 1, "Chemical Solvents": 1 } }
];

export function startEconomyUpdates() {
    const currentIntervalId = getEconomyUpdateIntervalId(); // Use the getter
    if (currentIntervalId) clearInterval(currentIntervalId);

    const newIntervalId = setInterval(updateEconomy, CONST.ECONOMY_UPDATE_INTERVAL_MS);
    setEconomyUpdateIntervalId(newIntervalId); // Use the setter to update the state

    console.log(`Economy simulation started (Update interval: ${CONST.ECONOMY_UPDATE_INTERVAL_MS}ms)`);
}

export function stopEconomyUpdates() {
    const currentIntervalId = getEconomyUpdateIntervalId(); // Use the getter
    if (currentIntervalId) {
        clearInterval(currentIntervalId);
        setEconomyUpdateIntervalId(null); // Use the setter to clear it
        console.log("Economy simulation stopped.");
    }
}


export function updateEconomy() {
    for (const moonName in marketData) {
        const market = marketData[moonName];
        market.companies.forEach(company => {
            if (company.produces) {
                const prod = company.produces;
                const maxInventory = prod.baseRate * CONST.MAX_INVENTORY_FACTOR;
                const productionAmount = prod.baseRate * Math.max(0, (1 - prod.inventory / maxInventory));
                prod.inventory = Math.min(prod.inventory + productionAmount, maxInventory * 1.2);

                const midPointInventory = Math.max(1, prod.baseRate * (CONST.MAX_INVENTORY_FACTOR / 2));
                const inventoryRatio = Math.max(0.1, Math.min(2.0, prod.inventory / midPointInventory));
                prod.currentPrice = prod.basePrice * (1 + (1 - inventoryRatio) * CONST.PRICE_VOLATILITY_FACTOR);
                prod.currentPrice = Math.max(0.01, prod.currentPrice);
            }

            if (company.consumes) {
                const cons = company.consumes;
                const needed = cons.maxBuffer - cons.demandBuffer;
                const consumptionAmount = Math.min(cons.demandBuffer, cons.baseDemand, needed > 0 ? cons.baseDemand : 0);
                cons.demandBuffer = Math.max(0, cons.demandBuffer - consumptionAmount);

                const bufferRatio = Math.min(1.0, Math.max(0, cons.demandBuffer / Math.max(1, cons.maxBuffer)));
                cons.currentPrice = cons.basePrice * (1 + (1 - bufferRatio) * CONST.PRICE_VOLATILITY_FACTOR);
                cons.currentPrice = Math.max(0.01, cons.currentPrice);
            }
        });
    }

    // Refresh UI if open
    const tradingMenuPanel = document.getElementById('trading-menu-panel'); // Avoid direct DOM access if possible, but simple for now
    const craftingMenuPanel = document.getElementById('crafting-menu-panel');
    const tradingMenuTitle = document.getElementById('trading-menu-title');


    if (tradingMenuPanel && tradingMenuPanel.style.display !== 'none' && tradingMenuTitle) {
        const currentMoon = tradingMenuTitle.textContent.split(': ')[1];
        if (currentMoon && marketData[currentMoon]) {
            showTradingMenu(currentMoon); // from uiManager
        }
    }
    if (craftingMenuPanel && craftingMenuPanel.style.display !== 'none') {
        showCraftingMenu(); // from uiManager
    }
}

export function buyResource(moonName, companyIndex, quantity) {
    const market = marketData[moonName];
    if (!market) return;
    const company = market.companies[companyIndex];
    if (!company || !company.produces) return;

    const prod = company.produces;
    const price = prod.currentPrice;
    const currentStock = Math.floor(prod.inventory);

    if (isNaN(quantity) || quantity <= 0) {
        alert("Please enter a valid quantity greater than 0.");
        return;
    }
    if (quantity > currentStock) {
        alert(`Only ${currentStock} kg of ${prod.resource} available. Buying that amount.`);
        quantity = currentStock;
    }
    if (quantity <= 0) {
        alert(`Not enough ${prod.resource} in stock.`);
        showTradingMenu(moonName);
        return;
    }
    const totalCost = price * quantity;
    if (STATE.player.credits < totalCost) {
        alert(`Insufficient credits! Need ${totalCost.toFixed(2)} C, have ${STATE.player.credits.toFixed(2)} C.`);
        return;
    }

    STATE.player.credits -= totalCost;
    prod.inventory -= quantity;
    STATE.player.inventory[prod.resource] = (STATE.player.inventory[prod.resource] || 0) + quantity;
    console.log(`%cBought ${quantity} ${prod.resource} from ${company.name} @ ${price.toFixed(2)} C/kg for ${totalCost.toFixed(2)} C`, "color: lightgreen");

    const midPointInventory = Math.max(1, prod.baseRate * (CONST.MAX_INVENTORY_FACTOR / 2));
    const inventoryRatio = Math.max(0.1, Math.min(2.0, prod.inventory / midPointInventory));
    prod.currentPrice = prod.basePrice * (1 + (1 - inventoryRatio) * CONST.PRICE_VOLATILITY_FACTOR * 1.1);
    prod.currentPrice = Math.max(0.01, prod.currentPrice);

    updateStatusPanel();
    showTradingMenu(moonName);
}

export function sellResource(moonName, companyIndex, quantity) {
    const market = marketData[moonName];
    if (!market) return;
    const company = market.companies[companyIndex];
    if (!company || !company.consumes) return;

    const cons = company.consumes;
    const resource = cons.resource;
    const price = cons.currentPrice;

    if (isNaN(quantity) || quantity <= 0) {
        alert("Please enter a valid quantity greater than 0.");
        return;
    }
    const playerStock = STATE.player.inventory[resource] || 0;
    if (quantity > playerStock) {
        alert(`Not enough ${resource} in cargo! Have ${Math.floor(playerStock)} kg, tried to sell ${quantity} kg. Selling ${Math.floor(playerStock)} kg instead.`);
        quantity = Math.floor(playerStock);
    }
    const demandAvailable = Math.max(0, Math.floor(cons.maxBuffer - cons.demandBuffer));
    if (demandAvailable <= 0) {
         alert(`${company.name} does not need any ${resource} right now.`);
         showTradingMenu(moonName);
         return;
    }
    if (quantity > demandAvailable) {
         alert(`${company.name} only wants to buy ${demandAvailable} kg of ${resource} right now. Selling that amount.`);
         quantity = demandAvailable;
   }
    if (quantity <= 0) {
        alert(`Cannot sell ${resource} (Adjusted quantity is 0 or less).`);
        showTradingMenu(moonName);
        return;
    }
    const totalIncome = price * quantity;

    STATE.player.credits += totalIncome;
    STATE.player.inventory[resource] -= quantity;
    if (STATE.player.inventory[resource] <= 0.001) {
        delete STATE.player.inventory[resource];
    }
    cons.demandBuffer += quantity;
    console.log(`%cSold ${quantity} ${resource} to ${company.name} @ ${price.toFixed(2)} C/kg for ${totalIncome.toFixed(2)} C`, "color: lightcoral");

    const bufferRatio = Math.min(1.0, Math.max(0, cons.demandBuffer / Math.max(1, cons.maxBuffer)));
    cons.currentPrice = cons.basePrice * (1 + (1 - bufferRatio) * CONST.PRICE_VOLATILITY_FACTOR * 1.1);
    cons.currentPrice = Math.max(0.01, cons.currentPrice);

    updateStatusPanel();
    showTradingMenu(moonName);
}

export function craftItem(recipeIndex) {
    const recipe = craftingRecipes[recipeIndex];
    if (!recipe) {
        console.error("Invalid recipe index:", recipeIndex);
        return;
    }

    let canCraft = true;
    for (const resourceName in recipe.ingredients) {
        const requiredQty = recipe.ingredients[resourceName];
        const playerQty = STATE.player.inventory[resourceName] || 0;
        if (playerQty < requiredQty) {
            canCraft = false;
            break;
        }
    }

    if (!canCraft) {
        alert(`Insufficient resources to craft ${recipe.product}.`);
        showCraftingMenu();
        return;
    }

    for (const resourceName in recipe.ingredients) {
        const requiredQty = recipe.ingredients[resourceName];
        STATE.player.inventory[resourceName] -= requiredQty;
        if (STATE.player.inventory[resourceName] <= 0.001) {
            delete STATE.player.inventory[resourceName];
        }
    }
    STATE.player.inventory[recipe.product] = (STATE.player.inventory[recipe.product] || 0) + 1;
    console.log(`%cCrafted 1x ${recipe.product}`, "color: cyan");

    updateStatusPanel();
    showCraftingMenu();
}