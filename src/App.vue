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
          <button class="nav-button active">
            <span class="nav-icon">⚙️</span> Generators
          </button>
          <button class="nav-button">
            <span class="nav-icon">🔬</span> Research
          </button>
          <button class="nav-button">
            <span class="nav-icon">✨</span> Prestige
          </button>
        </nav>
      </aside>

      <main class="game-content-area">
        <div class="content-grid">
          <div class="game-card">
            <h3>Point Generator</h3>
            <div class="card-stat">Level: <span class="stat-value">{{ generatorLevel }}</span></div>
            <div class="card-stat">Produces: <span class="stat-value">{{ (generatorBaseProduction * generatorLevel).toFixed(1) }} pts/sec</span></div>
            <button @click="upgradeGenerator" :disabled="points < generatorUpgradeCost">
              Upgrade (Cost: {{ generatorUpgradeCost }} pts)
            </button>
          </div>

          <div class="game-card">
            <h3>Manual Clicker</h3>
            <div class="card-stat">Generates: <span class="stat-value">{{ manualClickValue }} pts/click</span></div>
            <button @click="addPointsManually">
              Click for Points
            </button>
          </div>

          <div class="game-card" v-if="showPrestige">
            <h3>Prestige</h3>
            <div class="card-stat">Current Bonus: <span class="stat-value">+{{ (prestigePoints * 10).toFixed(0) }}% PPS</span></div>
            <div class="card-stat">Prestige Points: <span class="stat-value">{{ prestigePoints }}</span></div>
            <button @click="performPrestige" :disabled="points < 10000">
              Prestige (Req: 10,000 Pts)
            </button>
          </div>

          <div class="game-card placeholder"><h3>Future Feature</h3></div>
          <div class="game-card placeholder"><h3>Another Idea</h3></div>

        </div>
      </main>
    </div>

    <footer class="app-footer">
      <p>A Lovely Incremental Game &copy; {{ new Date().getFullYear() }}</p>
    </footer>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, CSSProperties } from 'vue';

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


// --- Reactive State ---
const points = ref(0);
const generatorLevel = ref(1);
const generatorBaseProduction = ref(0.1);
const prestigePoints = ref(0);
const manualClickValue = ref(1);

// --- Computed Properties ---
const pointsPerSecond = computed(() => {
  return (generatorBaseProduction.value * generatorLevel.value) * (1 + prestigePoints.value * 0.1); // Prestige bonus: 10% per prestige point
});

const generatorUpgradeCost = computed(() => {
  return Math.floor(10 * Math.pow(1.25, generatorLevel.value -1)); // Slightly increased cost scaling
});

const showPrestige = computed(() => points.value >= 5000 || prestigePoints.value > 0);

// --- Game Logic Functions ---
function upgradeGenerator() {
  if (points.value >= generatorUpgradeCost.value) {
    points.value -= generatorUpgradeCost.value;
    generatorLevel.value++;
  }
}

function addPointsManually() {
  points.value += manualClickValue.value * (1 + prestigePoints.value * 0.1);
}

function performPrestige() {
  if (points.value >= 10000) {
    const gainedPrestige = Math.floor(Math.sqrt(points.value / 1000)) || 1; // Ensure at least 1 if condition met
    prestigePoints.value += gainedPrestige;
    points.value = 0;
    generatorLevel.value = 1;
  }
}

// --- Game Loop ---
let gameLoopInterval: number | undefined;
function gameTick() {
  points.value += pointsPerSecond.value / 10; // Update 10 times per second for smoother visuals
}

// --- Lifecycle Hooks ---
onMounted(() => {
  gameLoopInterval = setInterval(gameTick, 100); // Game tick every 100ms
});

onUnmounted(() => {
  if (gameLoopInterval) {
    clearInterval(gameLoopInterval);
  }
});
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
  border-color: var(--color-dried-sunflower);
  color: var(--color-rich-brown);
}
.sidebar .nav-button.active {
  background-color: var(--color-sidebar-button-active);
  color: var(--color-rich-brown);
  font-weight: bold;
  border-color: var(--color-rich-brown);
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
</style>