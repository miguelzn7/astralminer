// js/uiManager.js
import * as CONST from './constants.js';
import * as STATE from './state.js';
// Import economy functions for buy/sell/craft buttons
// This creates a circular dependency, which is fine for function definitions in JS modules.
import { marketData, craftingRecipes, buyResource, sellResource, craftItem } from './economyManager.js';
// Import camera functions for escape key behavior related to view changes
// This also creates a circular dependency.
import { startTransitionToFocus, startTransitionToView } from './cameraManager.js';


// UI Element References (cached in initUIManager)
let uiElements = {};

export function initUIManager() {
    uiElements = {
        sceneContainer: document.getElementById('scene-container'),
        css2dContainer: document.getElementById('css2d-container'),
        viewStatusDiv: document.getElementById('view-status'),
        creditsStatusDiv: document.getElementById('credits-status'),
        inventoryListDiv: document.getElementById('inventory-list'),
        selectedObjectPanel: document.getElementById('selected-object-panel'),
        selectedName: document.getElementById('selected-name'),
        selectedInfo: document.getElementById('selected-info'),
        poiMenuPanel: document.getElementById('poi-menu-panel'),
        poiName: document.getElementById('poi-name'),
        poiTradingInfo: document.getElementById('poi-trading-info'),
        poiResourcesInfo: document.getElementById('poi-resources-info'),
        poiOpenMarketButton: document.getElementById('poi-open-market-btn'),
        tradingMenuPanel: document.getElementById('trading-menu-panel'),
        tradingMenuTitle: document.getElementById('trading-menu-title'),
        tradingMenuDescription: document.getElementById('trading-menu-description'),
        tradingMenuTbody: document.getElementById('trading-menu-tbody'),
        closeTradingMenuButton: document.getElementById('close-trading-menu'),
        openCraftingButton: document.getElementById('open-crafting-menu-btn'),
        craftingMenuPanel: document.getElementById('crafting-menu-panel'),
        craftingMenuContent: document.getElementById('crafting-menu-content'),
        closeCraftingMenuButton: document.getElementById('close-crafting-menu'),
    };

    // Add event listeners for UI-specific buttons
    uiElements.closeTradingMenuButton.addEventListener('click', hideTradingMenu);
    uiElements.openCraftingButton.addEventListener('click', showCraftingMenu);
    uiElements.closeCraftingMenuButton.addEventListener('click', hideCraftingMenu);
}

export function resetPoiScale(poiObject) {
    if (poiObject && poiObject.userData?.type === 'POI' && poiObject.scale.x !== 1.0) {
        console.log(`Reset scale: ${poiObject.userData.name}`);
        poiObject.scale.set(1, 1, 1);
    }
    if (STATE.objectToResetScale === poiObject) STATE.objectToResetScale = null;
}

export function hideAllInfoPanels() {
    if (uiElements.selectedObjectPanel) uiElements.selectedObjectPanel.style.display = 'none';
    if (uiElements.poiMenuPanel) uiElements.poiMenuPanel.style.display = 'none';
    hideTradingMenu();
    hideCraftingMenu();
}

export function updateSelectedObjectPanel(userData) {
    uiElements.selectedName.textContent = `Name: ${userData.name}`;
    uiElements.selectedInfo.textContent = `Info: ${userData.info}`;
    const existingButton = uiElements.selectedObjectPanel.querySelector('.open-market-button');
    if (existingButton) existingButton.remove();

    if (userData.type === "Moon" && userData.hasMarket) {
        const marketButton = document.createElement('button');
        marketButton.textContent = 'Open Market';
        marketButton.className = 'open-market-button';
        marketButton.style.marginTop = '8px';
        marketButton.onclick = () => {
            hideAllInfoPanels();
            showTradingMenu(userData.name);
        };
        uiElements.selectedObjectPanel.appendChild(marketButton);
    }
    uiElements.selectedObjectPanel.style.display = 'block';
}

export function updatePOIPanel(userData) {
    uiElements.poiName.textContent = `POI: ${userData.name}`;
    uiElements.poiResourcesInfo.textContent = `Location Data Available`;

    if (userData.parentMoon && userData.parentMoon.userData.hasMarket) {
        uiElements.poiTradingInfo.textContent = `Market access via ${userData.parentMoon.userData.name}.`;
        uiElements.poiOpenMarketButton.textContent = `Open ${userData.parentMoon.userData.name} Market`;
        uiElements.poiOpenMarketButton.onclick = () => {
            hideAllInfoPanels();
            showTradingMenu(userData.parentMoon.userData.name);
        };
        uiElements.poiOpenMarketButton.disabled = false;
    } else {
        uiElements.poiTradingInfo.textContent = `No market access available here.`;
        uiElements.poiOpenMarketButton.textContent = 'No Market';
        uiElements.poiOpenMarketButton.onclick = null;
        uiElements.poiOpenMarketButton.disabled = true;
    }
    uiElements.poiMenuPanel.style.display = 'block';
}

export function showTradingMenu(moonName) {
    const data = marketData[moonName];
    if (!data) {
        console.warn("No market data available for:", moonName);
        return;
    }
    uiElements.tradingMenuTitle.textContent = `${data.icon} Market: ${moonName}`;
    uiElements.tradingMenuDescription.textContent = data.description;
    uiElements.tradingMenuTbody.innerHTML = '';

    data.companies.forEach((company, companyIndex) => {
        if (company.produces) {
            const prod = company.produces;
            const row = uiElements.tradingMenuTbody.insertRow();
            row.insertCell().textContent = company.name;
            row.insertCell().textContent = prod.resource;
            row.insertCell().textContent = 'Selling';
            row.insertCell().textContent = Math.floor(prod.inventory).toLocaleString();
            row.insertCell().textContent = prod.currentPrice.toFixed(2);
            const qtyCell = row.insertCell();
            const quantityInput = document.createElement('input');
            quantityInput.type = 'number';
            quantityInput.min = 1;
            quantityInput.max = Math.floor(prod.inventory);
            quantityInput.value = Math.min(100, Math.floor(prod.inventory) || 1);
            quantityInput.id = `buy-qty-${moonName}-${companyIndex}`;
            qtyCell.appendChild(quantityInput);

            const actionCell = row.insertCell();
            const buyButton = document.createElement('button');
            buyButton.textContent = 'Buy';
            buyButton.className = 'buy-button';
            if (prod.inventory < 1) {
                buyButton.disabled = true;
                quantityInput.disabled = true;
                quantityInput.value = 0;
            }
            buyButton.onclick = () => {
                const qty = parseInt(quantityInput.value, 10);
                if (!isNaN(qty) && qty > 0) buyResource(moonName, companyIndex, qty);
                else if (qty === 0 && prod.inventory >= 1) alert("Please enter a quantity greater than 0.");
                else if (prod.inventory < 1) alert("This item is out of stock.");
                else alert("Please enter a valid quantity.");
            };
            actionCell.appendChild(buyButton);
            row.cells[3].style.textAlign = 'right';
            row.cells[4].style.textAlign = 'right';
            qtyCell.style.textAlign = 'center';
            actionCell.style.textAlign = 'center';
            row.cells[2].style.color = '#aaffaa';
        }

        if (company.consumes) {
            const cons = company.consumes;
            const playerStock = STATE.player.inventory[cons.resource] || 0;
            const demandAmount = Math.max(0, Math.floor(cons.maxBuffer - cons.demandBuffer));
            const row = uiElements.tradingMenuTbody.insertRow();
            row.insertCell().textContent = company.name;
            row.insertCell().textContent = cons.resource;
            row.insertCell().textContent = 'Buying';
            row.insertCell().textContent = demandAmount.toLocaleString();
            row.insertCell().textContent = cons.currentPrice.toFixed(2);
            const qtyCell = row.insertCell();
            const quantityInput = document.createElement('input');
            quantityInput.type = 'number';
            quantityInput.min = 1;
            const maxSellable = Math.min(playerStock, demandAmount);
            quantityInput.max = maxSellable;
            quantityInput.value = Math.min(100, maxSellable || 1);
            quantityInput.id = `sell-qty-${moonName}-${companyIndex}`;
            qtyCell.appendChild(quantityInput);

            const actionCell = row.insertCell();
            const sellButton = document.createElement('button');
            sellButton.textContent = 'Sell';
            sellButton.className = 'sell-button';
            if (playerStock <= 0 || demandAmount <= 0) {
                sellButton.disabled = true;
                quantityInput.disabled = true;
                quantityInput.value = 0;
            }
            sellButton.onclick = () => {
                const qty = parseInt(quantityInput.value, 10);
                if (!isNaN(qty) && qty > 0) sellResource(moonName, companyIndex, qty);
                else if (qty === 0 && (playerStock > 0 && demandAmount > 0)) alert("Please enter a quantity greater than 0.");
                else if (playerStock <= 0) alert("You do not have any " + cons.resource + " to sell.");
                else if (demandAmount <= 0) alert(company.name + " does not require any " + cons.resource + " currently.");
                else alert("Please enter a valid quantity.");
            };
            actionCell.appendChild(sellButton);
            row.cells[3].style.textAlign = 'right';
            row.cells[4].style.textAlign = 'right';
            qtyCell.style.textAlign = 'center';
            actionCell.style.textAlign = 'center';
            row.cells[2].style.color = '#ffaaaa';
        }
    });
    uiElements.tradingMenuPanel.style.display = 'block';
}

export function hideTradingMenu() {
    if (uiElements.tradingMenuPanel && uiElements.tradingMenuPanel.style.display !== 'none') {
        uiElements.tradingMenuPanel.style.display = 'none';
        console.log("Trading menu hidden");
    }
}

export function showCraftingMenu() {
    if (STATE.viewState !== 'SYSTEM') {
        alert("Crafting is only available in the System view.");
        return;
    }
    hideAllInfoPanels();
    uiElements.craftingMenuContent.innerHTML = '';

    craftingRecipes.forEach((recipe, index) => {
        const recipeDiv = document.createElement('div');
        recipeDiv.className = 'crafting-recipe';
        let ingredientsHtml = '<div class="ingredients"><strong>Requires:</strong>';
        let canCraft = true;

        for (const resourceName in recipe.ingredients) {
            const requiredQty = recipe.ingredients[resourceName];
            const playerQty = STATE.player.inventory[resourceName] || 0;
            const hasEnough = playerQty >= requiredQty;
            if (!hasEnough) canCraft = false;
            ingredientsHtml += `<span class="ingredient-item">${resourceName}: ${requiredQty} <span class="${hasEnough ? 'have' : 'need'}">(Have: ${Math.floor(playerQty)})</span></span>`;
        }
        ingredientsHtml += '</div>';

        const craftButton = document.createElement('button');
        craftButton.textContent = 'Craft (1)';
        craftButton.className = 'craft-button';
        craftButton.disabled = !canCraft;
        craftButton.onclick = () => craftItem(index);

        recipeDiv.innerHTML = `
            <h4>${recipe.product}</h4>
            <p class="description">${recipe.description}</p>
            ${ingredientsHtml}
            <div class="crafting-clear"></div>
        `;
        recipeDiv.appendChild(craftButton);
        uiElements.craftingMenuContent.appendChild(recipeDiv);
    });
    uiElements.craftingMenuPanel.style.display = 'block';
    console.log("Crafting menu shown");
}

export function hideCraftingMenu() {
    if (uiElements.craftingMenuPanel && uiElements.craftingMenuPanel.style.display !== 'none') {
        uiElements.craftingMenuPanel.style.display = 'none';
        console.log("Crafting menu hidden");
    }
}

export function updateStatusPanel() {
    let viewTxt = "View: ";
    switch (STATE.viewState) {
        case 'SYSTEM': viewTxt += `System (${(uiElements.jupiter && uiElements.jupiter.userData) ? uiElements.jupiter.userData.name : 'Origin'})`; break; // Jupiter might not be initialized yet during first calls
        case 'MOON_FOCUS': viewTxt += `Focused (${STATE.focusedMoon?.userData.name || STATE.focusedObject?.userData.name || 'Moon'})`; break;
        case 'POI_FOCUS': viewTxt += `Focused (${STATE.focusedObject?.userData.name || 'POI'})`; break;
        default: viewTxt += "Unknown";
    }
    uiElements.viewStatusDiv.textContent = viewTxt;
    uiElements.creditsStatusDiv.textContent = `Credits: ${STATE.player.credits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} C`;
    uiElements.inventoryListDiv.innerHTML = '';
    const inventoryItems = Object.entries(STATE.player.inventory);
    if (inventoryItems.length === 0) {
        uiElements.inventoryListDiv.innerHTML = '<div>Empty</div>';
    } else {
        inventoryItems.sort((a, b) => a[0].localeCompare(b[0]));
        inventoryItems.forEach(([resource, quantity]) => {
            if (quantity > 0.001) {
                const itemDiv = document.createElement('div');
                itemDiv.innerHTML = `<span>${resource}:</span> ${Math.floor(quantity).toLocaleString()} ${resource === 'Energy Cells' || craftingRecipes.some(r => r.product === resource) ? 'units' : 'kg'}`;
                uiElements.inventoryListDiv.appendChild(itemDiv);
            }
        });
        if (uiElements.inventoryListDiv.children.length === 0) {
            uiElements.inventoryListDiv.innerHTML = '<div>Empty</div>';
        }
    }
    uiElements.openCraftingButton.style.display = (STATE.viewState === 'SYSTEM' && !STATE.isTransitioning) ? 'block' : 'none';
}


export function updateLabelAndPOIVisibility(camera) { // Pass camera if needed for culling, or rely on CSS2DRenderer
    const showBodyLabels = (STATE.viewState === 'SYSTEM' && !STATE.isTransitioning);
    STATE.celestialBodiesWithLabels.forEach(body => {
        if (body.userData.nametag) body.userData.nametag.visible = showBodyLabels;
    });

    let moonToShowPOIs = null;
    if (!STATE.isTransitioning && (STATE.viewState === 'MOON_FOCUS' || STATE.viewState === 'POI_FOCUS')) {
        moonToShowPOIs = STATE.focusedMoon;
    }
    STATE.moonsWithPOIs.forEach(moon => {
        if (moon.userData.poiGroup) {
            moon.userData.poiGroup.visible = (moon === moonToShowPOIs);
        }
    });

    const showPoiLabels = !STATE.isTransitioning && STATE.viewState === 'MOON_FOCUS';
    STATE.poisWithLabels.forEach(poi => {
        if (poi.userData.label) {
            const isVisible = showPoiLabels && poi.userData.parentMoon === STATE.focusedMoon;
            poi.userData.label.visible = isVisible;
        }
    });
}