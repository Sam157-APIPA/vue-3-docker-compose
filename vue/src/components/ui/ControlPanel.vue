<template>
  <div class="panel-root">
    <div class="panel-header">
      <h2 class="panel-title">Controls</h2>
      <p class="panel-text">Build, spawn and test damage manually</p>
    </div>

    <div class="section-block">
      <p class="section-label">Build mode</p>

      <div class="button-grid">
        <button
            v-for="towerType in towerTypes"
            :key="towerType"
            class="action-button"
            :class="{ 'action-button-active': buildMode === towerType }"
            type="button"
            @click="() => emitSelectBuild(towerType)"
        >
          <span class="button-title">{{ getTowerTitle(towerType) }}</span>
          <span class="button-price">{{ getTowerPrice(towerType) }} gold</span>
        </button>
      </div>
    </div>

    <div class="section-block">
      <p class="section-label">Enemy test</p>

      <div class="button-column">
        <button
            class="action-button"
            type="button"
            @click="() => emitSpawnEnemy()"
        >
          Spawn enemy at green point
        </button>

        <button
            class="action-button"
            type="button"
            @click="() => emitRunStep()"
        >
          Run damage step
        </button>

        <button
            class="action-button action-button-danger"
            type="button"
            @click="() => emitResetLevel()"
        >
          Reset level
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { TOWER_CONFIG } from '@/constants/gameConstants'

export default {
  name: 'ControlPanel',

  props: {
    buildMode: {
      type: String,
      default: null
    },
    towerTypes: {
      type: Array,
      required: true
    }
  },

  emits: [
    'select-build',
    'spawn-enemy',
    'run-step',
    'reset-level'
  ],

  methods: {
    emitSelectBuild (towerType) {
      this.$emit('select-build', towerType)
    },

    emitSpawnEnemy () {
      this.$emit('spawn-enemy')
    },

    emitRunStep () {
      this.$emit('run-step')
    },

    emitResetLevel () {
      this.$emit('reset-level')
    },

    getTowerTitle (towerType) {
      const config = TOWER_CONFIG[towerType]

      if (!config) {
        return towerType
      }

      return config.title
    },

    getTowerPrice (towerType) {
      const config = TOWER_CONFIG[towerType]

      if (!config) {
        return 0
      }

      return config.price
    }
  }
}
</script>

<style scoped>
.panel-root {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 18px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);
}

.panel-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.panel-title {
  margin: 0;
  font-size: 22px;
}

.panel-text {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
}

.section-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-label {
  margin: 0;
  font-size: 14px;
  color: var(--muted);
}

.button-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.button-column {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-button {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  border: 1px solid var(--line);
  background: var(--panel-2);
  color: var(--text);
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
}

.action-button:hover {
  border-color: var(--accent);
}

.action-button-active {
  background: rgba(56, 189, 248, 0.14);
  border-color: var(--accent);
}

.action-button-danger {
  border-color: rgba(239, 68, 68, 0.4);
}

.button-title {
  font-weight: bold;
}

.button-price {
  color: var(--muted);
  font-size: 13px;
}
</style>