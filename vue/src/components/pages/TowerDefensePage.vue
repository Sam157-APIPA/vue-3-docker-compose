<template>
  <div class="page-root">
    <div class="page-header">
      <div class="title-block">
        <h1 class="page-title">{{ level.title }}</h1>
        <p class="page-text">
          Manual level, fixed slots, build, upgrade, remove, manual enemy movement and economy
        </p>
      </div>

      <div class="header-actions">
        <button
            class="back-button"
            type="button"
            @click="() => goToLevels()"
        >
          Back to levels
        </button>

        <div class="gold-box">
          Gold: {{ gold }}
        </div>
      </div>
    </div>

    <div class="page-layout">
      <div class="left-column">
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
            @enemy-pointer-down="(payload) => onEnemyPointerDown(payload)"
            @canvas-pointer-move="(payload) => onCanvasPointerMove(payload)"
            @canvas-pointer-up="() => onCanvasPointerUp()"
        />
      </div>

      <div class="right-column">
        <ControlPanel
            :build-mode="buildMode"
            :tower-types="towerTypes"
            @select-build="(towerType) => onSelectBuild(towerType)"
            @spawn-enemy="() => onSpawnEnemy()"
            @run-step="() => onRunStep()"
            @reset-level="() => onResetLevel()"
        />

        <TowerPanel
            :selected-tower="selectedTower"
            :selected-enemy="selectedEnemy"
            :get-tower-stats="getTowerStats"
            :gold="gold"
            @upgrade-tower="(towerId) => onUpgradeTower(towerId)"
            @remove-tower="(towerId) => onRemoveTower(towerId)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { ACTION_TYPES, LEVEL_KEYS } from '@/constants/gameConstants'
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
      'gold'
    ])
  },

  mounted () {
    this.initLevel(this.levelKey)
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
      upgradeTower: ACTION_TYPES.UPGRADE_TOWER,
      removeTower: ACTION_TYPES.REMOVE_TOWER,
      spawnEnemy: ACTION_TYPES.SPAWN_ENEMY,
      enemyPointerDown: ACTION_TYPES.ENEMY_POINTER_DOWN,
      canvasPointerMove: ACTION_TYPES.CANVAS_POINTER_MOVE,
      canvasPointerUp: ACTION_TYPES.CANVAS_POINTER_UP,
      runDamageStep: ACTION_TYPES.RUN_DAMAGE_STEP,
      resetLevel: ACTION_TYPES.RESET_LEVEL
    }),

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

    onUpgradeTower (towerId) {
      this.upgradeTower(towerId)
    },

    onRemoveTower (towerId) {
      this.removeTower(towerId)
    },

    onSpawnEnemy () {
      this.spawnEnemy()
    },

    onEnemyPointerDown (payload) {
      this.enemyPointerDown(payload)
    },

    onCanvasPointerMove (payload) {
      this.canvasPointerMove(payload)
    },

    onCanvasPointerUp () {
      this.canvasPointerUp()
    },

    onRunStep () {
      this.runDamageStep()
    },

    onResetLevel () {
      this.resetLevel()
    }
  }
}
</script>

<style scoped>
.page-root {
  padding: 24px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.title-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-title {
  margin: 0;
  font-size: 32px;
  line-height: 1.1;
}

.page-text {
  margin: 0;
  color: var(--muted);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-button {
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--panel);
  color: var(--text);
  cursor: pointer;
}

.gold-box {
  padding: 12px 16px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--panel);
  font-weight: bold;
}

.page-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 20px;
  align-items: start;
}

.left-column {
  min-width: 0;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (max-width: 1100px) {
  .page-layout {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
  }
}
</style>