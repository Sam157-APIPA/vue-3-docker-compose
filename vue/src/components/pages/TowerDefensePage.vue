<template>
  <div class="tower-defense-page">
    <div class="tower-defense-page__header">
      <div class="tower-defense-page__title-block">
        <h1 class="tower-defense-page__title">{{ level.title }}</h1>
        <p class="tower-defense-page__text">
          Path movement, waves, enemy types, economy and restart
        </p>
      </div>

      <div class="tower-defense-page__header-actions">
        <button
            class="tower-defense-page__back-button"
            type="button"
            @click="() => goToLevels()"
        >
          Back to levels
        </button>

        <div class="tower-defense-page__info-box">
          Gold: {{ gold }}
        </div>

        <div class="tower-defense-page__info-box">
          Base HP: {{ baseHp }}
        </div>

        <div class="tower-defense-page__info-box">
          Wave: {{ currentWaveNumber }}/{{ totalWaves }}
        </div>
      </div>
    </div>

    <div class="tower-defense-page__layout">
      <div class="tower-defense-page__left-column">
        <GameCanvas
            :level="level"
            :slots="slots"
            :towers-by-id="towersById"
            :enemies="enemies"
            :selected-tower-id="selectedTowerId"
            :selected-enemy-id="selectedEnemyId"
            :get-tower-stats="getTowerStats"
            @slot-click="(slotId) => onSlotClick(slotId)"
            @tower-click="(towerId) => onTowerClick(towerId)"
            @enemy-click="(enemyId) => onEnemyClick(enemyId)"
        />
      </div>

      <div class="tower-defense-page__right-column">
        <ControlPanel
            :build-mode="buildMode"
            :tower-types="towerTypes"
            :is-running="isRunning"
            :wave-in-progress="waveInProgress"
            :can-start-wave="canStartWave"
            :current-wave-number="currentWaveNumber"
            :total-waves="totalWaves"
            :status-text="statusText"
            :is-game-over="isGameOver"
            :is-victory="isVictory"
            @select-build="(towerType) => onSelectBuild(towerType)"
            @start-wave="() => onStartWave()"
            @toggle-pause="() => onTogglePause()"
            @reset-level="() => onResetLevel()"
        />

        <TowerPanel
            :selected-tower="selectedTower"
            :selected-enemy="selectedEnemy"
            :get-tower-stats="getTowerStats"
            :gold="gold"
            :base-hp="baseHp"
            :current-wave-number="currentWaveNumber"
            :total-waves="totalWaves"
            :status-text="statusText"
            @upgrade-tower="(towerId) => onUpgradeTower(towerId)"
            @remove-tower="(towerId) => onRemoveTower(towerId)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { ACTION_TYPES, GAME_TICK_MS, LEVEL_KEYS } from '@/constants/gameConstants'
import GameCanvas from '@/components/ui/GameCanvas.vue'
import ControlPanel from '@/components/ui/ControlPanel.vue'
import TowerPanel from '@/components/ui/TowerPanel.vue'

export default {
  name: 'TowerDefensePage',

  components: {
    GameCanvas,
    ControlPanel,
    TowerPanel
  },

  props: {
    levelKey: {
      type: String,
      default: LEVEL_KEYS.FIRST
    }
  },

  data () {
    return {
      loopId: 0
    }
  },

  computed: {
    ...mapGetters('towerDefense', [
      'level',
      'slots',
      'towersById',
      'enemies',
      'selectedTowerId',
      'selectedEnemyId',
      'buildMode',
      'selectedTower',
      'selectedEnemy',
      'getTowerStats',
      'towerTypes',
      'gold',
      'baseHp',
      'isRunning',
      'waveInProgress',
      'canStartWave',
      'currentWaveNumber',
      'totalWaves',
      'statusText',
      'isGameOver',
      'isVictory'
    ])
  },

  mounted () {
    this.initLevel(this.levelKey)
    this.startGameLoop()
  },

  beforeUnmount () {
    this.stopGameLoop()
  },

  beforeRouteUpdate (to, from, next) {
    this.initLevel(to.params.levelKey || LEVEL_KEYS.FIRST)
    next()
  },

  methods: {
    ...mapActions('towerDefense', {
      initLevel: ACTION_TYPES.INIT_LEVEL,
      toggleBuildMode: ACTION_TYPES.TOGGLE_BUILD_MODE,
      slotClick: ACTION_TYPES.SLOT_CLICK,
      towerClick: ACTION_TYPES.TOWER_CLICK,
      enemyClick: ACTION_TYPES.ENEMY_CLICK,
      upgradeTower: ACTION_TYPES.UPGRADE_TOWER,
      removeTower: ACTION_TYPES.REMOVE_TOWER,
      startWave: ACTION_TYPES.START_WAVE,
      togglePause: ACTION_TYPES.TOGGLE_PAUSE,
      tick: ACTION_TYPES.TICK,
      resetLevel: ACTION_TYPES.RESET_LEVEL
    }),

    startGameLoop () {
      this.stopGameLoop()

      this.loopId = window.setInterval(() => {
        this.tick(GAME_TICK_MS)
      }, GAME_TICK_MS)
    },

    stopGameLoop () {
      if (!this.loopId) {
        return
      }

      window.clearInterval(this.loopId)
      this.loopId = 0
    },

    goToLevels () {
      this.$router.push('/levels')
    },

    onSelectBuild (towerType) {
      this.toggleBuildMode(towerType)
    },

    onSlotClick (slotId) {
      this.slotClick(slotId)
    },

    onTowerClick (towerId) {
      this.towerClick(towerId)
    },

    onEnemyClick (enemyId) {
      this.enemyClick(enemyId)
    },

    onUpgradeTower (towerId) {
      this.upgradeTower(towerId)
    },

    onRemoveTower (towerId) {
      this.removeTower(towerId)
    },

    onStartWave () {
      this.startWave()
    },

    onTogglePause () {
      this.togglePause()
    },

    onResetLevel () {
      this.resetLevel()
    }
  }
}
</script>

<style scoped lang="scss">
.tower-defense-page {
  padding: 24px;

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 20px;
  }

  &__title-block {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__title {
    margin: 0;
    font-size: 32px;
    line-height: 1.1;
  }

  &__text {
    margin: 0;
    color: var(--muted);
  }

  &__header-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }

  &__back-button {
    padding: 12px 14px;
    border: 1px solid var(--line);
    border-radius: 12px;
    background: var(--panel);
    color: var(--text);
    cursor: pointer;
  }

  &__info-box {
    padding: 12px 16px;
    border: 1px solid var(--line);
    border-radius: 12px;
    background: var(--panel);
    font-weight: bold;
  }

  &__layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 340px;
    gap: 20px;
    align-items: start;
  }

  &__left-column {
    min-width: 0;
  }

  &__right-column {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  @media (max-width: 1100px) {
    &__header {
      flex-direction: column;
    }

    &__layout {
      grid-template-columns: 1fr;
    }
  }
}
</style>