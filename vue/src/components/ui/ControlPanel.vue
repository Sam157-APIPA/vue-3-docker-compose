<template>
  <div class="control-panel">
    <div class="control-panel__header">
      <h2 class="control-panel__title">Controls</h2>
      <p class="control-panel__text">Build and manage the whole defense line</p>
    </div>

    <div class="control-panel__section">
      <p class="control-panel__section-label">Towers</p>

      <div class="control-panel__button-grid">
        <button
            v-for="towerType in towerTypes"
            :key="towerType"
            class="control-panel__button"
            :class="{ 'control-panel__button--active': buildMode === towerType }"
            type="button"
            @click="() => emitSelectBuild(towerType)"
        >
          <span class="control-panel__button-title">{{ getTowerTitle(towerType) }}</span>
          <span class="control-panel__button-price">{{ getTowerPrice(towerType) }} gold</span>
        </button>
      </div>
    </div>

    <div class="control-panel__section">
      <p class="control-panel__section-label">Support</p>

      <div class="control-panel__button-column">
        <button
            class="control-panel__button"
            :class="{ 'control-panel__button--active': barricadeMode }"
            type="button"
            @click="() => emitToggleBarricade()"
        >
          <span class="control-panel__button-title">Barricade mode</span>
          <span class="control-panel__button-price">80 gold</span>
        </button>

        <button
            class="control-panel__button"
            type="button"
            @click="() => emitSpawnFighter()"
        >
          <span class="control-panel__button-title">Call guard</span>
          <span class="control-panel__button-price">90 gold</span>
        </button>

        <button
            class="control-panel__button"
            :class="{ 'control-panel__button--active': artilleryMode }"
            type="button"
            @click="() => emitToggleArtillery()"
        >
          <span class="control-panel__button-title">Artillery mode</span>
          <span class="control-panel__button-price">140 gold</span>
        </button>
      </div>
    </div>

    <div class="control-panel__section">
      <p class="control-panel__section-label">Level flow</p>

      <div class="control-panel__status-box">
        <p class="control-panel__status-line">Gold: {{ gold }}</p>
        <p class="control-panel__status-line">Wave: {{ currentWaveNumber }}/{{ totalWaves }}</p>
        <p class="control-panel__status-line">Status: {{ statusText }}</p>
      </div>

      <div class="control-panel__button-column">
        <button
            class="control-panel__button"
            :disabled="!canStartWave"
            type="button"
            @click="() => emitStartWave()"
        >
          Start next wave
        </button>

        <button
            class="control-panel__button"
            :disabled="!waveInProgress"
            type="button"
            @click="() => emitTogglePause()"
        >
          {{ isRunning ? 'Pause wave' : 'Continue wave' }}
        </button>

        <button
            class="control-panel__button control-panel__button--danger"
            type="button"
            @click="() => emitResetLevel()"
        >
          Restart level
        </button>
      </div>

      <p
          v-if="artilleryMode"
          class="control-panel__message"
      >
        Click on the map to strike artillery.
      </p>

      <p
          v-if="barricadeMode"
          class="control-panel__message"
      >
        Click on a road slot to place a barricade.
      </p>

      <p
          v-if="isGameOver"
          class="control-panel__message control-panel__message--danger"
      >
        The base is destroyed.
      </p>

      <p
          v-if="isVictory"
          class="control-panel__message control-panel__message--success"
      >
        All waves are cleared.
      </p>
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
    barricadeMode: {
      type: Boolean,
      required: true
    },
    artilleryMode: {
      type: Boolean,
      required: true
    },
    towerTypes: {
      type: Array,
      required: true
    },
    gold: {
      type: Number,
      required: true
    },
    isRunning: {
      type: Boolean,
      required: true
    },
    waveInProgress: {
      type: Boolean,
      required: true
    },
    canStartWave: {
      type: Boolean,
      required: true
    },
    currentWaveNumber: {
      type: Number,
      required: true
    },
    totalWaves: {
      type: Number,
      required: true
    },
    statusText: {
      type: String,
      required: true
    },
    isGameOver: {
      type: Boolean,
      required: true
    },
    isVictory: {
      type: Boolean,
      required: true
    }
  },

  emits: [
    'select-build',
    'toggle-barricade',
    'spawn-fighter',
    'toggle-artillery',
    'start-wave',
    'toggle-pause',
    'reset-level'
  ],

  methods: {
    emitSelectBuild (towerType) {
      this.$emit('select-build', towerType)
    },

    emitToggleBarricade () {
      this.$emit('toggle-barricade')
    },

    emitSpawnFighter () {
      this.$emit('spawn-fighter')
    },

    emitToggleArtillery () {
      this.$emit('toggle-artillery')
    },

    emitStartWave () {
      this.$emit('start-wave')
    },

    emitTogglePause () {
      this.$emit('toggle-pause')
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

<style scoped lang="scss">
.control-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 18px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);

  &__header {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__title {
    margin: 0;
    font-size: 22px;
  }

  &__text {
    margin: 0;
    color: var(--muted);
    font-size: 14px;
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__section-label {
    margin: 0;
    font-size: 14px;
    color: var(--muted);
  }

  &__button-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }

  &__button-column {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__status-box {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px;
    border-radius: 12px;
    background: var(--panel-2);
    border: 1px solid var(--line);
  }

  &__status-line {
    margin: 0;
    color: var(--text);
  }

  &__button {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    padding: 10px 12px;
    border: 1px solid var(--line);
    border-radius: 12px;
    background: var(--panel-2);
    color: var(--text);
    cursor: pointer;
  }

  &__button:hover {
    border-color: var(--accent);
  }

  &__button:disabled {
    opacity: 0.5;
    cursor: default;
  }

  &__button--active {
    background: rgba(56, 189, 248, 0.14);
    border-color: var(--accent);
  }

  &__button--danger {
    border-color: rgba(239, 68, 68, 0.4);
  }

  &__button-title {
    font-weight: bold;
  }

  &__button-price {
    color: var(--muted);
    font-size: 13px;
  }

  &__message {
    margin: 0;
    font-size: 14px;
    color: var(--muted);
  }

  &__message--danger {
    color: var(--danger);
  }

  &__message--success {
    color: var(--success);
  }
}
</style>