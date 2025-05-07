<template>
  <div id="lovely-incremental-game" :style="cssVariables">
    <header class="app-header">
      <h1>Number Goes Up!</h1>
      <div class="resource-bar">
        <span>POINTS: <span class="resource-value">{{ points.toFixed(0) }}</span></span>
        <span>PER SEC: <span class="resource-value">{{ pointsPerSecond.toFixed(1) }}</span></span>
      </div>
    </header>

    <div class="main-layout-wrapper">
      <aside class="sidebar">
        <nav>
          <button 
            class="nav-button" 
            :class="{ active: activeTab === 'clicker' }"
            @click="switchTab('clicker')"
          >
            <span class="nav-icon">👆</span> Clicker
          </button>
          <button 
            class="nav-button" 
            :class="{ active: activeTab === 'generators' }"
            @click="switchTab('generators')"
            :disabled="!showGeneratorsTab"
          >
            <span class="nav-icon">⚙️</span> Generators
          </button>
          <button 
            class="nav-button"
            :class="{ active: activeTab === 'research' }"
            @click="switchTab('research')"
            :disabled="!showResearchTab"
          >
            <span class="nav-icon">🔬</span> Research
          </button>
          <button 
            class="nav-button"
            :class="{ active: activeTab === 'prestige' }"
            @click="switchTab('prestige')"
            :disabled="!showPrestigeTab"
          >
            <span class="nav-icon">✨</span> Prestige
          </button>
        </nav>
      </aside>

      <main class="game-content-area">
        <!-- Clicker Tab -->
        <div class="content-grid" v-if="activeTab === 'clicker'">
          <div class="game-card">
            <h3>Manual Clicker</h3>
            <div class="card-stat">Generates: <span class="stat-value">{{ manualClickValue.toFixed(1) }} pts/click</span></div>
            <button @click="addPointsManually">
              Click for Points
            </button>
          </div>
          
          <div class="game-card" v-if="clickUpgrades > 0">
            <h3>Click Upgrades</h3>
            <div class="card-stat">Level: <span class="stat-value">{{ clickUpgrades }}</span></div>
            <div class="card-stat">Bonus: <span class="stat-value">+{{ (clickUpgrades * 0.5).toFixed(1) }} pts/click</span></div>
            <button @click="upgradeClicker" :disabled="points < clickUpgradeCost">
              Upgrade (Cost: {{ clickUpgradeCost }} pts)
            </button>
          </div>
          
          <div class="game-card" v-if="points >= 50 && clickUpgrades === 0">
            <h3>Unlock Click Upgrades</h3>
            <div class="card-stat">Permanently increases click value</div>
            <button @click="unlockClickUpgrades" :disabled="points < 50">
              Unlock (Cost: 50 pts)
            </button>
          </div>
          
          <div class="game-card" v-if="points >= 100 && !showGeneratorsTab">
            <h3>Unlock Generators</h3>
            <div class="card-stat">Allows automated point generation</div>
            <button @click="unlockGenerators" :disabled="points < 100">
              Unlock (Cost: 100 pts)
            </button>
          </div>
        </div>
        
        <!-- Generators Tab -->
        <div class="content-grid" v-if="activeTab === 'generators' && showGeneratorsTab">
          <div class="game-card">
            <h3>Point Generator</h3>
            <div class="card-stat">Level: <span class="stat-value">{{ generatorLevel }}</span></div>
            <div class="card-stat">Produces: <span class="stat-value">{{ (generatorBaseProduction * generatorLevel).toFixed(1) }} pts/sec</span></div>
            <button @click="upgradeGenerator" :disabled="points < generatorUpgradeCost">
              Upgrade (Cost: {{ generatorUpgradeCost }} pts)
            </button>
          </div>
          
          <div class="game-card" v-if="generatorLevel >= 5">
            <h3>Advanced Generator</h3>
            <div class="card-stat">Level: <span class="stat-value">{{ advancedGeneratorLevel }}</span></div>
            <div class="card-stat">Produces: <span class="stat-value">{{ (advancedGeneratorLevel * 1.0).toFixed(1) }} pts/sec</span></div>
            <button @click="upgradeAdvancedGenerator" :disabled="points < advancedGeneratorCost">
              Upgrade (Cost: {{ advancedGeneratorCost }} pts)
            </button>
          </div>
          
          <div class="game-card" v-if="generatorLevel >= 10 && !showResearchTab">
            <h3>Unlock Research</h3>
            <div class="card-stat">Allows research to boost production</div>
            <button @click="unlockResearch" :disabled="points < 500">
              Unlock (Cost: 500 pts)
            </button>
          </div>
        </div>
        
        <!-- Research Tab -->
        <div class="content-grid" v-if="activeTab === 'research' && showResearchTab">
          <div class="game-card">
            <h3>Basic Research</h3>
            <div class="card-stat">Level: <span class="stat-value">{{ researchLevel }}</span></div>
            <div class="card-stat">Boosts production by: <span class="stat-value">+{{ (researchLevel * 5).toFixed(0) }}%</span></div>
            <button @click="upgradeResearch" :disabled="points < researchCost">
              Research (Cost: {{ researchCost }} pts)
            </button>
          </div>
          
          <div class="game-card" v-if="researchLevel >= 5 && points >= 5000 && !showPrestigeTab">
            <h3>Unlock Prestige</h3>
            <div class="card-stat">Allows resetting for permanent bonuses</div>
            <button @click="unlockPrestige" :disabled="points < 5000">
              Unlock (Cost: 5,000 pts)
            </button>
          </div>
        </div>
        
        <!-- Prestige Tab -->
        <div class="content-grid" v-if="activeTab === 'prestige' && showPrestigeTab">
          <div class="game-card">
            <h3>Prestige</h3>
            <div class="card-stat">Current Bonus: <span class="stat-value">+{{ (prestigePoints * 10).toFixed(0) }}% to all production</span></div>
            <div class="card-stat">Prestige Points: <span class="stat-value">{{ prestigePoints }}</span></div>
            <div class="card-stat">Next Prestige: <span class="stat-value">+{{ Math.max(1, Math.floor(Math.sqrt(points.value / 1000))) }}</span></div>
            <button @click="performPrestige" :disabled="points < 10000">
              Prestige (Req: 10,000 Pts)
            </button>
          </div>
          
          <div class="game-card">
            <h3>Reset Game</h3>
            <div class="card-stat">Warning: This will erase ALL progress</div>
            <button class="reset-button" @click="resetGame">
              Reset Game
            </button>
          </div>
        </div>
        <div class="save-controls" v-if="activeTab === 'prestige'">
          <button class="save-button" @click="manualSave">
            Save Game
          </button>
          <div class="last-saved" v-if="lastSavedTime">
            Last saved: {{ lastSavedTime }}
          </div>
        </div>
      </main>
    </div>

    <footer class="app-footer">
      <p>A Lovely Incremental Game &copy; {{ new Date().getFullYear() }}</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, CSSProperties, watch } from 'vue';

// --- Color Palette ---
// (These will be applied via :style binding for simplicity in single file)
const colors = {
  foreground: '#d9ddb8', // light parchment
  background: '#1f281f', // deep moss green
  richBrown: '#3b3228',
  burntClay: '#ca5f4b',
  sageGreen: '#91ad6d',
  driedSunflower: '#d9b471',
  fadedSeafoam: '#8cbea3',
  dustyLavender: '#9e7e9f',
  mintHerb: '#97bda1',
  softLinen: '#f5f5dc',
};

const cssVariables = computed(() => ({
  '--color-foreground': colors.foreground,
  '--color-background': colors.background,
  '--color-text': colors.foreground,
  '--color-text-on-card': colors.richBrown,
  '--color-card-background': `rgba(217, 221, 184, 0.9)`, // light parchment with slight transparency
  '--color-card-border': colors.richBrown,
  '--color-button': colors.sageGreen,
  '--color-button-text': colors.softLinen,
  '--color-button-hover': colors.burntClay,
  '--color-button-disabled': colors.richBrown,
  '--color-sidebar-background': `rgba(59, 50, 40, 0.3)`, // Rich brown with transparency
  '--color-sidebar-button': `rgba(217, 221, 184, 0.7)`,
  '--color-sidebar-button-hover': colors.foreground,
  '--color-sidebar-button-active': colors.driedSunflower,
  '--color-header-background': `rgba(59, 50, 40, 0.5)`, // Rich brown with transparency
  '--color-accent-value': colors.burntClay,
  '--color-footer-text': colors.mintHerb,
} as CSSProperties));

// Add this to track last save time
const lastSavedTime = ref<string | null>(null);

// --- Reactive State ---
const points = ref(0);
const activeTab = ref('clicker');

// Progression unlocks
const showGeneratorsTab = ref(false);
const showResearchTab = ref(false);
const showPrestigeTab = ref(false);

// Clicker upgrades
const clickUpgrades = ref(0);
const manualClickValue = computed(() => 1 + (clickUpgrades.value * 0.5));
const clickUpgradeCost = computed(() => Math.floor(25 * Math.pow(1.5, clickUpgrades.value)));

// Generator values
const generatorLevel = ref(0);
const generatorBaseProduction = ref(0.1);
const advancedGeneratorLevel = ref(0);

// Research values
const researchLevel = ref(0);

// Prestige values
const prestigePoints = ref(0);

// --- Computed Properties ---
const pointsPerSecond = computed(() => {
  if (!showGeneratorsTab.value) return 0;
  
  const baseProduction = (generatorBaseProduction.value * generatorLevel.value) + 
                         (advancedGeneratorLevel.value * 1.0);
  const researchBonus = 1 + (researchLevel.value * 0.05);
  const prestigeBonus = 1 + (prestigePoints.value * 0.1);
  
  return baseProduction * researchBonus * prestigeBonus;
});

const generatorUpgradeCost = computed(() => {
  return Math.floor(10 * Math.pow(1.25, generatorLevel.value));
});

const advancedGeneratorCost = computed(() => {
  return Math.floor(100 * Math.pow(1.35, advancedGeneratorLevel.value));
});

const researchCost = computed(() => {
  return Math.floor(500 * Math.pow(1.5, researchLevel.value));
});

// --- Game Logic Functions ---
function addPointsManually() {
  const prestigeBonus = 1 + (prestigePoints.value * 0.1);
  points.value += manualClickValue.value * prestigeBonus;
}

function unlockClickUpgrades() {
  if (points.value >= 50) {
    points.value -= 50;
    clickUpgrades.value = 1;
  }
}

function upgradeClicker() {
  if (points.value >= clickUpgradeCost.value) {
    points.value -= clickUpgradeCost.value;
    clickUpgrades.value++;
  }
}

function unlockGenerators() {
  if (points.value >= 100) {
    points.value -= 100;
    showGeneratorsTab.value = true;
    generatorLevel.value = 1; // Start with level 1
    activeTab.value = 'generators'; // Switch to generators tab
  }
}

function upgradeGenerator() {
  if (points.value >= generatorUpgradeCost.value) {
    points.value -= generatorUpgradeCost.value;
    generatorLevel.value++;
  }
}

function upgradeAdvancedGenerator() {
  if (points.value >= advancedGeneratorCost.value) {
    points.value -= advancedGeneratorCost.value;
    advancedGeneratorLevel.value++;
  }
}

function unlockResearch() {
  if (points.value >= 500 && generatorLevel.value >= 10) {
    points.value -= 500;
    showResearchTab.value = true;
    researchLevel.value = 1; // Start with level 1
    activeTab.value = 'research'; // Switch to research tab
  }
}

function upgradeResearch() {
  if (points.value >= researchCost.value) {
    points.value -= researchCost.value;
    researchLevel.value++;
  }
}

function unlockPrestige() {
  if (points.value >= 5000 && researchLevel.value >= 5) {
    points.value -= 5000;
    showPrestigeTab.value = true;
    activeTab.value = 'prestige'; // Switch to prestige tab
  }
}

function performPrestige() {
  if (points.value >= 10000) {
    // Calculate prestige points gained
    const gainedPrestige = Math.max(1, Math.floor(Math.sqrt(points.value / 1000)));
    prestigePoints.value += gainedPrestige;
    
    // Reset progress but keep unlocks
    points.value = 0;
    generatorLevel.value = 1;
    advancedGeneratorLevel.value = 0;
    researchLevel.value = 0;
  }
}

function resetGame() {
  if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
    points.value = 0;
    clickUpgrades.value = 0;
    generatorLevel.value = 0;
    advancedGeneratorLevel.value = 0;
    researchLevel.value = 0;
    prestigePoints.value = 0;
    showGeneratorsTab.value = false;
    showResearchTab.value = false;
    showPrestigeTab.value = false;
    activeTab.value = 'clicker';
    localStorage.removeItem('numberGoesUpSave');
  }
}

// --- Save/Load Game State ---
function saveGameState() {
  const now = Date.now();
  const gameState = {
    points: points.value,
    clickUpgrades: clickUpgrades.value,
    generatorLevel: generatorLevel.value,
    advancedGeneratorLevel: advancedGeneratorLevel.value,
    researchLevel: researchLevel.value,
    prestigePoints: prestigePoints.value,
    showGeneratorsTab: showGeneratorsTab.value,
    showResearchTab: showResearchTab.value,
    showPrestigeTab: showPrestigeTab.value,
    activeTab: activeTab.value,
    lastSaved: now
  };
  
  try {
    localStorage.setItem('numberGoesUpSave', JSON.stringify(gameState));
    lastSavedTime.value = new Date(now).toLocaleTimeString();
    console.log('Game saved successfully at', lastSavedTime.value);
  } catch (e) {
    console.error('Failed to save game:', e);
  }
}

function loadGameState() {
  try {
    const savedState = localStorage.getItem('numberGoesUpSave');
    if (!savedState) {
      console.log('No saved game found');
      return;
    }
    
    const gameState = JSON.parse(savedState);
    if (gameState.lastSaved) {
      lastSavedTime.value = new Date(gameState.lastSaved).toLocaleTimeString();
    }
    
    // Load all values with proper defaults
    points.value = gameState.points ?? 0;
    clickUpgrades.value = gameState.clickUpgrades ?? 0;
    generatorLevel.value = gameState.generatorLevel ?? 0;
    advancedGeneratorLevel.value = gameState.advancedGeneratorLevel ?? 0;
    researchLevel.value = gameState.researchLevel ?? 0;
    prestigePoints.value = gameState.prestigePoints ?? 0;
    
    // Explicitly set boolean values
    showGeneratorsTab.value = Boolean(gameState.showGeneratorsTab);
    showResearchTab.value = Boolean(gameState.showResearchTab);
    showPrestigeTab.value = Boolean(gameState.showPrestigeTab);
    
    // Set active tab, but ensure it's one that's unlocked
    if (gameState.activeTab === 'clicker' || 
        (gameState.activeTab === 'generators' && showGeneratorsTab.value) ||
        (gameState.activeTab === 'research' && showResearchTab.value) ||
        (gameState.activeTab === 'prestige' && showPrestigeTab.value)) {
      activeTab.value = gameState.activeTab;
    } else {
      // Default to clicker if saved tab isn't accessible
      activeTab.value = 'clicker';
    }
    
    console.log('Game loaded successfully');
  } catch (e) {
    console.error('Failed to parse saved game:', e);
    // If loading fails, don't leave the game in a partially loaded state
    resetGameState();
  }
}

// Add a function to reset to initial state without confirmation
function resetGameState() {
  points.value = 0;
  clickUpgrades.value = 0;
  generatorLevel.value = 0;
  advancedGeneratorLevel.value = 0;
  researchLevel.value = 0;
  prestigePoints.value = 0;
  showGeneratorsTab.value = false;
  showResearchTab.value = false;
  showPrestigeTab.value = false;
  activeTab.value = 'clicker';
}

// Auto-save every 30 seconds
let autoSaveInterval: number | null = null;

// --- Game Loop ---
let gameLoopInterval: number | null = null;

function gameTick() {
  points.value += pointsPerSecond.value / 10; // Update 10 times per second
}

// --- Lifecycle Hooks ---
onMounted(() => {
  // First load the saved game
  loadGameState();
  
  // Then set up the game loop and autosave
  gameLoopInterval = window.setInterval(() => {
    gameTick();
  }, 100);
  
  // Autosave every minute instead of 30 seconds to reduce potential issues
  autoSaveInterval = window.setInterval(() => {
    saveGameState();
  }, 60000);
  
  // Also save when the window is about to unload
  window.addEventListener('beforeunload', () => {
    saveGameState();
  });
  
  // Debug info
  console.log('Game initialized with:', {
    activeTab: activeTab.value,
    showGeneratorsTab: showGeneratorsTab.value,
    showResearchTab: showResearchTab.value,
    showPrestigeTab: showPrestigeTab.value
  });
});

onUnmounted(() => {
  // Clear intervals
  if (gameLoopInterval !== null) {
    clearInterval(gameLoopInterval);
    gameLoopInterval = null;
  }
  
  if (autoSaveInterval !== null) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
  
  // Save one last time
  saveGameState();
  
  // Remove event listener
  window.removeEventListener('beforeunload', saveGameState);
});

function switchTab(tab: string) {
  // Only switch to tabs that are unlocked
  if (tab === 'clicker' || 
      (tab === 'generators' && showGeneratorsTab.value) ||
      (tab === 'research' && showResearchTab.value) ||
      (tab === 'prestige' && showPrestigeTab.value)) {
    activeTab.value = tab;
    console.log('Switched to tab:', tab);
  }
}

// Add a manual save button to the UI
function manualSave() {
  saveGameState();
  alert('Game saved successfully!');
}
</script>

<style scoped>
/* Apply CSS variables from script setup */
#lovely-incremental-game {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-background);
  color: var(--color-text);
  font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif; /* A slightly more stylish sans-serif */
}

.app-header {
  background-color: var(--color-header-background);
  padding: 15px 30px;
  text-align: center;
  border-bottom: 1px solid var(--color-card-border);
}

.app-header h1 {
  margin: 0 0 10px 0;
  font-size: 2.2em;
  font-weight: 600; /* Bolder title */
  color: var(--color-foreground);
  letter-spacing: 0.5px;
}

.resource-bar {
  display: flex;
  justify-content: center;
  gap: 30px; /* Increased gap */
  font-size: 1.1em;
}
.resource-bar span {
  color: var(--color-foreground);
}
.resource-value {
  font-weight: bold;
  color: var(--color-accent-value); /* Burnt Clay for values */
}

.main-layout-wrapper {
  display: flex;
  flex-grow: 1;
  padding: 20px; /* Padding around sidebar and content */
  gap: 20px; /* Gap between sidebar and content */
}

.sidebar {
  width: 220px; /* Slightly wider sidebar */
  background-color: var(--color-sidebar-background);
  padding: 20px 10px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
}

.sidebar .nav-button {
  display: flex; /* For icon and text alignment */
  align-items: center;
  width: 100%;
  padding: 12px 15px;
  margin-bottom: 10px;
  background-color: var(--color-sidebar-button);
  color: var(--color-card-border); /* Rich Brown text */
  border: 1px solid transparent;
  border-radius: 8px;
  text-align: left;
  font-size: 1em;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}
.sidebar .nav-button .nav-icon {
  margin-right: 10px;
  font-size: 1.2em;
}
.sidebar .nav-button:hover {
  background-color: var(--color-sidebar-button-hover);
  border-color: var(--color-sidebar-button-active);
  color: var(--color-text-on-card);
}
.sidebar .nav-button.active {
  background-color: var(--color-sidebar-button-active);
  color: var(--color-text-on-card);
  font-weight: bold;
  border-color: var(--color-card-border);
}

.sidebar .nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--color-sidebar-background);
  color: var(--color-foreground);
  border-color: transparent;
}

.sidebar .nav-button:disabled:hover {
  background-color: var(--color-sidebar-background);
  border-color: transparent;
  transform: none;
}

.game-content-area {
  flex-grow: 1;
  overflow-y: auto;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); /* Responsive grid */
  gap: 20px;
}

.game-card {
  background-color: var(--color-card-background);
  color: var(--color-text-on-card);
  padding: 20px;
  border-radius: 10px;
  border: 1px solid var(--color-card-border);
  box-shadow: 0 3px 8px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Pushes button to bottom */
}
.game-card.placeholder {
  opacity: 0.5;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 150px; /* Ensure placeholder has some height */
  border-style: dashed;
}

.game-card h3 {
  color: var(--color-burnt-clay);
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.4em; /* Larger card titles */
  font-weight: 600;
}

.card-stat {
  margin: 8px 0;
  font-size: 1em;
}
.stat-value {
  font-weight: bold;
  color: var(--color-sage-green); /* Sage for stat values */
}

.game-card button {
  width: 100%; /* Full width button in card */
  padding: 12px 15px;
  margin-top: 15px; /* Space above button */
  background-color: var(--color-button);
  color: var(--color-button-text);
  font-size: 1em;
  border-radius: 6px;
}
.game-card button:hover:not(:disabled) {
  background-color: var(--color-button-hover);
}
.game-card button:disabled {
  background-color: var(--color-button-disabled);
  color: var(--color-foreground);
  opacity: 0.7;
}


.app-footer {
  text-align: center;
  padding: 20px;
  margin-top: auto; /* Pushes footer to bottom if content is short */
  font-size: 0.9em;
  color: var(--color-footer-text);
  border-top: 1px solid var(--color-card-border);
  background-color: var(--color-header-background); /* Match header bg */
}

.reset-container {
  margin-top: 20px;
}

.reset-button {
  background-color: var(--color-burnt-clay);
  font-size: 0.8em;
  padding: 8px 12px;
}

.save-controls {
  margin-top: 20px;
  padding: 15px;
  background-color: var(--color-card-background);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.save-button {
  background-color: var(--color-sage-green);
  padding: 10px 20px;
  margin-bottom: 10px;
}

.last-saved {
  font-size: 0.9em;
  color: var(--color-text-on-card);
  opacity: 0.8;
}
</style>
