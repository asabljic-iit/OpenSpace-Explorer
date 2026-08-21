// ==========================================================================
// Global Application State & Configurations
// ==========================================================================
let openspace = null;
let modalHistory = [];

let currentAnchor = '';
let currentAim = '';

let nodeDescriptions = {};
let currentLang = 'en';

let currentlyActiveButton = null;
let isButtonCooldownActive = false;

let overlayTimer = null;
let toggleTimer = null;

const OVERLAY_TIMEOUT_MS = 75000; // 75s before "Tap to Begin" overlay appears
const TOGGLE_TIMEOUT_MS = 15000;  // 15s default fallback for button highlights

// Icon mapping for primary category folders
const ICON_MAP = {
    constellations: 'sparkles',
    'focuson...': 'crosshair',
    deepspaceobjects: 'view',
    blackholes: 'circle-slash-2',
    galaxies: 'shell',
    nebulae: 'cloud-fog',
    stars: 'star',
    missions: 'rocket',
    beresheet: 'rocket',
    solarsystem: 'sun',
    asteroids: 'stone',
    dwarfplanets: 'circle-small',
    ceres: 'circle-small',
    makemake: 'circle-small',
    pluto: 'circle-small',
    earth: 'earth',
    moon: 'moon',
    speciallocations: 'map-pin',
    jupiter: 'at-sign-circle',
    mars: 'globe',
    mercury: 'circle',
    neptune: 'tennis-ball',
    saturn: 'planet',
    uranus: 'orbit',
    venus: 'circle',
    spacecrafts: 'rocket',
    satellites: 'satellite',
    telescopes: 'telescope',
    'ground-based': 'telescope',
    space: 'satellite'
};

// Returns a mapped Lucide icon identifier or defaults to 'folder'
function getIconName(folderName) {
    const clean = folderName.toLowerCase().replace(/[_\s]/g, '');
    return ICON_MAP[clean] || 'folder';
}

// Helper to safely render icons combining Core Lucide + Lucide Lab
function renderIcons() {
    if (!window.lucide) return;

    const rawLabExports = window.exports || window.lucideLab || {};
    const processedLabIcons = {};

    // PascalCase conversion matching Lucide's internal YA() formatter
    // Examples: 'planet' -> 'Planet', 'astronautHelmet' -> 'AstronautHelmet'
    const toPascalCase = (str) => {
        if (!str) return '';
        // Handles hyphens/underscores/spaces if any, then upper-cases first letter
        const camel = str.replace(/^([a-z])|[\s-_]+(\w)/g, (match, p1, p2) =>
            p2 ? p2.toUpperCase() : p1.toLowerCase()
        );
        return camel.charAt(0).toUpperCase() + camel.slice(1);
    };

    // Process all exported Lab icon arrays
    Object.keys(rawLabExports).forEach((key) => {
        const iconData = rawLabExports[key];

        // Valid Lucide icon definitions are arrays of SVG element descriptors
        if (Array.isArray(iconData)) {
            const pascalKey = toPascalCase(key);

            // Register PascalCase (required by Lucide's lookup engine)
            processedLabIcons[pascalKey] = iconData;

            // Also keep raw key & lowercased key as safety fallbacks
            processedLabIcons[key] = iconData;
            processedLabIcons[key.toLowerCase()] = iconData;
        }
    });

    // Pass the merged icon dictionary directly to createIcons
    lucide.createIcons({
        icons: {
            ...lucide.icons,
            ...processedLabIcons
        }
    });
}

// ==========================================================================
// OpenSpace Socket Connection & Initialization
// ==========================================================================
function connectToOpenSpace() {
    const host = window.location.hostname || 'localhost';
    const port = window.location.port || 5000;

    const api = window.openspaceApi(host, port);

    api.onDisconnect(() => {
        openspace = null;

        const container = document.getElementById('container');
        if (container) container.className = 'disconnected';

        const statusEl = document.getElementById('connection-status');
        if (statusEl) {
            statusEl.innerHTML = '<span>OpenSpace disconnected. Reloading...</span>';
        }

        setTimeout(() => window.location.reload(), 2000);
    });

    api.onConnect(async () => {
        try {
            openspace = await api.library();

            subscribeToNavigationState(api);
            await loadOpenSpaceActions();

            const container = document.getElementById('container');
            if (container) container.className = 'connected';
        } catch (e) {
            console.error('Initialization error, reloading in 2 seconds...', e);
            setTimeout(() => window.location.reload(), 2000);
        }
    });

    api.connect();
}

// Subscribes to live OpenSpace property updates for camera Anchor and Aim
function subscribeToNavigationState(api) {
    const anchorURI = 'NavigationHandler.OrbitalNavigator.Anchor';
    const aimURI = 'NavigationHandler.OrbitalNavigator.Aim';

    try {
        const anchorSub = api.subscribeToProperty(anchorURI);
        (async () => {
            for await (const data of anchorSub) {
                if (data && data.value !== undefined) {
                    currentAnchor = data.value;
                    await updateInfoPanel();
                }
            }
        })();
    } catch (e) {
        console.error('Failed to subscribe to Anchor:', e);
    }

    try {
        const aimSub = api.subscribeToProperty(aimURI);
        (async () => {
            for await (const data of aimSub) {
                if (data && data.value !== undefined) {
                    currentAim = data.value;
                    await updateInfoPanel();
                }
            }
        })();
    } catch (e) {
        console.error('Failed to subscribe to Aim:', e);
    }
}

// ==========================================================================
// Localization & Info Panel Logic
// ==========================================================================
async function loadDescriptions() {
    try {
        const response = await fetch('descriptions.json');
        nodeDescriptions = await response.json();
    } catch (e) {
        console.error('Failed to load descriptions.json:', e);
    }
}

function setLanguage(langCode) {
    currentLang = langCode;
    updateInfoPanel();
}

function getLocalizedFolderName(folderName) {
    if (nodeDescriptions.folders && nodeDescriptions.folders[folderName]) {
        return nodeDescriptions.folders[folderName][currentLang] || folderName;
    }
    return folderName.replace(/_/g, ' ');
}

function getLocalizedActionName(act) {
    const rawName = act.Name || act.Identifier;
    if (nodeDescriptions.actions) {
        if (nodeDescriptions.actions[act.Identifier]) {
            return nodeDescriptions.actions[act.Identifier][currentLang] || rawName;
        }
        if (nodeDescriptions.actions[rawName]) {
            return nodeDescriptions.actions[rawName][currentLang] || rawName;
        }
    }
    return rawName;
}

async function getNodeGuiName(nodeIdentifier) {
    if (!nodeIdentifier) return '';

    const sceneNode = nodeIdentifier.startsWith('Scene.')
        ? nodeIdentifier
        : `Scene.${nodeIdentifier}`;

    try {
        const guiName = await openspace.propertyValue(`${sceneNode}.GuiName`);
        if (guiName && guiName.trim() !== '') return guiName;
    } catch (e) { }

    return nodeIdentifier.replace('Scene.', '').replace(/_/g, ' ');
}

// Helper function to recursively find a target key at any nesting level in descriptions.json
function findNodeDescription(targetKey, currentObject = nodeDescriptions) {
    if (!currentObject || typeof currentObject !== 'object') return null;

    // 1. Direct match on current level
    if (currentObject[targetKey]) {
        return currentObject[targetKey];
    }

    // 2. Recursively search nested objects (e.g. openspace -> "Solar System" -> "Earth")
    for (const key in currentObject) {
        if (typeof currentObject[key] === 'object' && currentObject[key] !== null) {
            const result = findNodeDescription(targetKey, currentObject[key]);
            if (result) return result;
        }
    }

    return null;
}

// Updated Info Panel display logic
async function updateInfoPanel() {
    const titleEl = document.getElementById('info-title');
    const descEl = document.getElementById('info-description');

    if (!titleEl || !descEl) return;

    const cleanAimID = currentAim.replace('Scene.', '').trim();
    const cleanAnchorID = currentAnchor.replace('Scene.', '').trim();

    let targetNode = '';
    let isAiming = false;

    if (cleanAimID !== '' && cleanAimID !== cleanAnchorID) {
        targetNode = cleanAimID;
        isAiming = true;
    } else if (cleanAnchorID !== '') {
        targetNode = cleanAnchorID;
    }

    if (targetNode) {
        const guiName = await getNodeGuiName(targetNode);
        titleEl.innerHTML = `${isAiming ? 'Aiming at:' : 'Focused on:'} <span>${guiName}</span>`;

        // Search both node identifier and GUI name in nested JSON categories
        const nodeEntry = findNodeDescription(targetNode) || findNodeDescription(guiName);

        if (nodeEntry) {
            const localizedText = nodeEntry[currentLang] || nodeEntry['en'];
            descEl.innerText = localizedText || `Currently focused on ${guiName}.`;
        } else {
            descEl.innerText = `Currently ${isAiming ? 'aiming at' : 'focused on'} ${guiName}.`;
        }
    }
}

// ==========================================================================
// Action Loading & Folder Tree Hierarchy
// ==========================================================================
async function loadOpenSpaceActions() {
    const container = document.getElementById('actions-grid');
    container.innerHTML = '<div class="status-msg">Loading OpenSpace Actions...</div>';

    try {
        const rawActions = await openspace.action.actions();

        if (!rawActions || Object.keys(rawActions).length === 0) {
            console.warn('OpenSpace actions empty. Reloading in 2 seconds...');
            setTimeout(() => window.location.reload(), 2000);
            return;
        }

        const actionList = Array.isArray(rawActions) ? rawActions : Object.values(rawActions);
        container.innerHTML = '';

        const blockedActions = typeof BLOCKED_ACTIONS !== 'undefined' ? BLOCKED_ACTIONS : [];
        const blockedCategories = typeof BLOCKED_CATEGORIES !== 'undefined' ? BLOCKED_CATEGORIES : [];

        const rootTree = { subfolders: {}, actions: [] };

        actionList.forEach((action) => {
            if (blockedActions.includes(action.Identifier)) return;

            let path = action.GuiPath || 'General';
            path = path.replace(/^\/+|\/+$/g, '');

            const isBlocked = blockedCategories.some((blocked) => {
                const cleanBlocked = blocked.replace(/^\/+|\/+$/g, '');
                return path === cleanBlocked || path.startsWith(cleanBlocked + '/');
            });
            if (isBlocked) return;

            if (!path || path === 'General') {
                path = (action.Identifier && action.Identifier.includes('.'))
                    ? action.Identifier.split('.')[0]
                    : 'General';
            }

            const pathParts = path.split('/').filter(Boolean);
            let currentLevel = rootTree;

            pathParts.forEach((folderName) => {
                if (!currentLevel.subfolders[folderName]) {
                    currentLevel.subfolders[folderName] = {
                        name: folderName,
                        subfolders: {},
                        actions: []
                    };
                }
                currentLevel = currentLevel.subfolders[folderName];
            });

            currentLevel.actions.push(action);
        });

        // Render primary top-level folders
        const folderKeys = Object.keys(rootTree.subfolders).sort();

        folderKeys.forEach((folderName) => {
            const subNode = rootTree.subfolders[folderName];
            const icon = getIconName(folderName);
            const localizedTitle = getLocalizedFolderName(folderName);

            const card = document.createElement('div');
            card.className = 'icon-card';
            card.onclick = () => openFolderModal(folderName, subNode);

            card.innerHTML = `
              <div class="icon-wrapper">
                <i data-lucide="${icon}"></i>
              </div>
              <span class="card-title">${localizedTitle}</span>
            `;

            container.appendChild(card);
        });

        renderIcons();

    } catch (e) {
        console.error('Failed to load actions:', e);
        container.innerHTML = '<div class="status-msg error">Error loading actions.</div>';
    }
}

// ==========================================================================
// Modal Rendering & Navigation
// ==========================================================================
function openFolderModal(title, node) {
    modalHistory = [{ title: title, node: node }];
    const modal = document.getElementById('folder-modal');
    modal.classList.add('active');

    const container = document.getElementById('container');
    if (container) container.scrollTop = 0;

    renderModalCurrentLevel();
}

function navigateModalBack() {
    if (modalHistory.length > 1) {
        modalHistory.pop();
        renderModalCurrentLevel();
    }
}

function closeModal() {
    document.getElementById('folder-modal').classList.remove('active');
    modalHistory = [];

    const container = document.getElementById('container');
    if (container) container.scrollTop = 0;
}

// Resolves folder timeout duration by checking subfolders first, then parent categories
function getActiveFolderTimeout() {
    const fallback = typeof DEFAULT_TOGGLE_TIMEOUT_MS !== 'undefined'
        ? DEFAULT_TOGGLE_TIMEOUT_MS
        : TOGGLE_TIMEOUT_MS;

    if (typeof FOLDER_TIMEOUTS === 'undefined' || modalHistory.length === 0) {
        return fallback;
    }

    // Traverse backward from active subfolder to root folder
    for (let i = modalHistory.length - 1; i >= 0; i--) {
        const folderTitle = modalHistory[i].title;
        const cleanKey = folderTitle.toLowerCase().replace(/[^a-z0-9]/g, '');

        for (const [key, value] of Object.entries(FOLDER_TIMEOUTS)) {
            const cleanConfigKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (cleanKey === cleanConfigKey) {
                return value;
            }
        }
    }

    return fallback;
}

function clearActiveButton() {
    if (currentlyActiveButton) {
        currentlyActiveButton.classList.remove('btn-highlight');
        currentlyActiveButton = null;
    }
}

function renderModalCurrentLevel() {
    if (modalHistory.length === 0) return;

    const currentLevel = modalHistory[modalHistory.length - 1];
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const backBtn = document.getElementById('modal-back-btn');

    modalTitle.innerText = getLocalizedFolderName(currentLevel.title);
    modalBody.innerHTML = '';
    modalBody.scrollTop = 0;

    backBtn.style.display = modalHistory.length > 1 ? 'flex' : 'none';

    const subfolderKeys = Object.keys(currentLevel.node.subfolders).sort();

    // 1. Render Subfolder Cards
    if (subfolderKeys.length > 0) {
        const subgrid = document.createElement('div');
        subgrid.className = 'icon-grid sub-grid';

        subfolderKeys.forEach((sfName) => {
            const subNode = currentLevel.node.subfolders[sfName];
            const icon = getIconName(sfName);
            const localizedSubTitle = getLocalizedFolderName(sfName);

            const card = document.createElement('div');
            card.className = 'icon-card sub-icon-card';
            card.onclick = () => {
                modalHistory.push({ title: sfName, node: subNode });
                renderModalCurrentLevel();
            };

            card.innerHTML = `
              <div class="icon-wrapper sub-icon-wrapper">
                <i data-lucide="${icon}"></i>
              </div>
              <span class="card-title">${localizedSubTitle}</span>
            `;

            subgrid.appendChild(card);
        });

        modalBody.appendChild(subgrid);
    }

    // 2. Render Action Trigger Buttons
    if (currentLevel.node.actions.length > 0) {
        const btnGrid = document.createElement('div');
        btnGrid.className = 'modal-btn-grid';

        currentLevel.node.actions.forEach((act) => {
            const btn = document.createElement('button');
            const actionName = getLocalizedActionName(act);

            btn.className = 'action-btn';
            btn.setAttribute('data-action-id', act.Identifier);
            btn.innerText = actionName;

            // Preserve active highlight when re-rendering current level
            if (currentlyActiveButton && currentlyActiveButton.getAttribute('data-action-id') === act.Identifier) {
                btn.classList.add('btn-highlight');
                currentlyActiveButton = btn;
            }

            btn.onclick = async () => {
                // Enforce 1-second tap cooldown
                if (isButtonCooldownActive) return;

                isButtonCooldownActive = true;
                setTimeout(() => {
                    isButtonCooldownActive = false;
                }, 1000);

                // Update active button state and clear previous timer
                clearActiveButton();
                clearTimeout(toggleTimer);

                btn.classList.add('btn-highlight');
                currentlyActiveButton = btn;

                // Schedule auto-off timer based on folder config
                const timeoutMs = getActiveFolderTimeout();
                if (timeoutMs && timeoutMs > 0) {
                    toggleTimer = setTimeout(resetAllToggles, timeoutMs);
                }

                // Trigger action in OpenSpace
                try {
                    await openspace.action.triggerAction(act.Identifier);
                } catch (err) {
                    console.error(`Failed to trigger ${act.Identifier}:`, err);
                }
            };

            btnGrid.appendChild(btn);
        });

        modalBody.appendChild(btnGrid);
    }

    renderIcons();
}

// ==========================================================================
// Inactivity / Idle Overlay Logic
// ==========================================================================
function resetAllToggles() {
    clearActiveButton();
}

function resetIdleTimer() {
    const overlay = document.getElementById('idle-overlay');

    if (overlay && overlay.classList.contains('active')) {
        overlay.classList.remove('active');
        closeModal();

        // 300ms interaction shield on dismissal
        const container = document.getElementById('container');
        if (container) {
            container.style.pointerEvents = 'none';
            setTimeout(() => {
                container.style.pointerEvents = 'auto';
            }, 300);
        }
    }

    // Reset idle overlay timeout
    clearTimeout(overlayTimer);
    overlayTimer = setTimeout(showIdleOverlay, OVERLAY_TIMEOUT_MS);
}

function showIdleOverlay() {
    const overlay = document.getElementById('idle-overlay');
    if (overlay) {
        overlay.classList.add('active');
        renderIcons();
    }
}

// Global user interaction event listeners to reset timer
window.addEventListener('pointerdown', resetIdleTimer, true);
window.addEventListener('touchstart', resetIdleTimer, true);
window.addEventListener('mousemove', resetIdleTimer, true);
window.addEventListener('keydown', resetIdleTimer, true);

// Start application on page load
window.addEventListener('DOMContentLoaded', async () => {
    renderIcons();
    await loadDescriptions();
    connectToOpenSpace();
});