<template>
  <div class="tower-defense-page">
    <div class="tower-defense-page__header">
      <div class="tower-defense-page__title-block">
        <h1 class="tower-defense-page__title">{{ level.title }}</h1>
        <p class="tower-defense-page__text">
          Waves, ranged enemies, fighters, barricades and artillery
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
            :barricade-slots="barricadeSlots"
            :towers-by-id="towersById"
            :barricades-by-id="barricadesById"
            :enemies="enemies"
            :fighters="fighters"
            :selected-tower-id="selectedTowerId"
            :selected-enemy-id="selectedEnemyId"
            :selected-fighter-id="selectedFighterId"
            :selected-barricade-id="selectedBarricadeId"
            :get-tower-stats="getTowerStats"
            :artillery-mode="artilleryMode"
            @slot-click="(slotId) => onSlotClick(slotId)"
            @barricade-slot-click="(slotId) => onBarricadeSlotClick(slotId)"
            @tower-click="(towerId) => onTowerClick(towerId)"
            @enemy-click="(enemyId) => onEnemyClick(enemyId)"
            @fighter-click="(fighterId) => onFighterClick(fighterId)"
            @barricade-click="(barricadeId) => onBarricadeClick(barricadeId)"
            @canvas-click="(point) => onCanvasClick(point)"
        />
      </div>

      <div class="tower-defense-page__right-column">
        <ControlPanel
            :build-mode="buildMode"
            :barricade-mode="barricadeMode"
            :artillery-mode="artilleryMode"
            :tower-types="towerTypes"
            :gold="gold"
            :is-running="isRunning"
            :wave-in-progress="waveInProgress"
            :can-start-wave="canStartWave"
            :current-wave-number="currentWaveNumber"
            :total-waves="totalWaves"
            :status-text="statusText"
            :is-game-over="isGameOver"
            :is-victory="isVictory"
            @select-build="(towerType) => onSelectBuild(towerType)"
            @toggle-barricade="() => onToggleBarricade()"
            @spawn-fighter="() => onSpawnFighter()"
            @toggle-artillery="() => onToggleArtillery()"
            @start-wave="() => onStartWave()"
            @toggle-pause="() => onTogglePause()"
            @reset-level="() => onResetLevel()"
        />

        <TowerPanel
            :selected-tower="selectedTower"
            :selected-enemy="selectedEnemy"
            :selected-fighter="selectedFighter"
            :selected-barricade="selectedBarricade"
            :get-tower-stats="getTowerStats"
            :gold="gold"
            :base-hp="baseHp"
            :current-wave-number="currentWaveNumber"
            :total-waves="totalWaves"
            :status-text="statusText"
            @upgrade-tower="(towerId) => onUpgradeTower(towerId)"
            @remove-tower="(towerId) => onRemoveTower(towerId)"
            @remove-barricade="(barricadeId) => onRemoveBarricade(barricadeId)"
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
      'barricadeSlots',
      'towersById',
      'barricadesById',
      'enemies',
      'fighters',
      'selectedTowerId',
      'selectedEnemyId',
      'selectedFighterId',
      'selectedBarricadeId',
      'buildMode',
      'barricadeMode',
      'artilleryMode',
      'selectedTower',
      'selectedEnemy',
      'selectedFighter',
      'selectedBarricade',
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
      toggleBarricadeMode: ACTION_TYPES.TOGGLE_BARRICADE_MODE,
      toggleArtilleryMode: ACTION_TYPES.TOGGLE_ARTILLERY_MODE,
      slotClick: ACTION_TYPES.SLOT_CLICK,
      barricadeSlotClick: ACTION_TYPES.BARRICADE_SLOT_CLICK,
      towerClick: ACTION_TYPES.TOWER_CLICK,
      enemyClick: ACTION_TYPES.ENEMY_CLICK,
      fighterClick: ACTION_TYPES.FIGHTER_CLICK,
      barricadeClick: ACTION_TYPES.BARRICADE_CLICK,
      upgradeTower: ACTION_TYPES.UPGRADE_TOWER,
      removeTower: ACTION_TYPES.REMOVE_TOWER,
      removeBarricade: ACTION_TYPES.REMOVE_BARRICADE,
      spawnFighter: ACTION_TYPES.SPAWN_FIGHTER,
      startWave: ACTION_TYPES.START_WAVE,
      togglePause: ACTION_TYPES.TOGGLE_PAUSE,
      canvasClick: ACTION_TYPES.CANVAS_CLICK,
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

    onToggleBarricade () {
      this.toggleBarricadeMode()
    },

    onToggleArtillery () {
      this.toggleArtilleryMode()
    },

    onSlotClick (slotId) {
      this.slotClick(slotId)
    },

    onBarricadeSlotClick (slotId) {
      this.barricadeSlotClick(slotId)
    },

    onTowerClick (towerId) {
      this.towerClick(towerId)
    },

    onEnemyClick (enemyId) {
      this.enemyClick(enemyId)
    },

    onFighterClick (fighterId) {
      this.fighterClick(fighterId)
    },

    onBarricadeClick (barricadeId) {
      this.barricadeClick(barricadeId)
    },

    onCanvasClick (point) {
      this.canvasClick(point)
    },

    onUpgradeTower (towerId) {
      this.upgradeTower(towerId)
    },

    onRemoveTower (towerId) {
      this.removeTower(towerId)
    },

    onRemoveBarricade (barricadeId) {
      this.removeBarricade(barricadeId)
    },

    onSpawnFighter () {
      this.spawnFighter()
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
    grid-template-columns: minmax(0, 1fr) 360px;
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

  @media (max-width: 1160px) {
    &__header {
      flex-direction: column;
    }

    &__layout {
      grid-template-columns: 1fr;
    }
  }
}
</style>