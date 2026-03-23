<template>
  <div class="panel-root">
    <div class="panel-header">
      <h2 class="panel-title">Selection</h2>
      <p class="panel-text">Tower info, enemy info and economy</p>
    </div>

    <div class="info-card">
      <p class="info-title">Economy</p>
      <p class="info-line">Gold: {{ gold }}</p>
    </div>

    <div v-if="selectedTower" class="info-card">
      <p class="info-title">Selected tower</p>
      <p class="info-line">Type: {{ selectedTower.type }}</p>
      <p class="info-line">Level: {{ selectedTower.level }}</p>
      <p class="info-line">Range: {{ towerStats ? towerStats.range : '-' }}</p>
      <p class="info-line">Damage: {{ towerStats ? towerStats.damage : '-' }}</p>

      <div class="button-row">
        <button
            class="action-button"
            type="button"
            @click="() => emitUpgradeTower(selectedTower.id)"
        >
          Upgrade
        </button>

        <button
            class="action-button action-button-danger"
            type="button"
            @click="() => emitRemoveTower(selectedTower.id)"
        >
          Remove
        </button>
      </div>
    </div>

    <div v-else class="empty-state">
      <p class="empty-text">No tower selected</p>
    </div>

    <div v-if="selectedEnemy" class="info-card">
      <p class="info-title">Selected enemy</p>
      <p class="info-line">Id: {{ selectedEnemy.id }}</p>
      <p class="info-line">HP: {{ Math.round(selectedEnemy.hp) }}</p>
      <p class="info-line">X: {{ selectedEnemy.pos.x }}</p>
      <p class="info-line">Y: {{ selectedEnemy.pos.y }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TowerPanel',

  props: {
    selectedTower: {
      type: Object,
      default: null
    },
    selectedEnemy: {
      type: Object,
      default: null
    },
    getTowerStats: {
      type: Function,
      required: true
    },
    gold: {
      type: Number,
      required: true
    }
  },

  emits: [
    'upgrade-tower',
    'remove-tower'
  ],

  computed: {
    towerStats () {
      if (!this.selectedTower) {
        return null
      }

      return this.getTowerStats(this.selectedTower.type, this.selectedTower.level)
    }
  },

  methods: {
    emitUpgradeTower (towerId) {
      this.$emit('upgrade-tower', towerId)
    },

    emitRemoveTower (towerId) {
      this.$emit('remove-tower', towerId)
    }
  }
}
</script>

<style scoped>
.panel-root {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.info-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  border-radius: 12px;
  background: var(--panel-2);
  border: 1px solid var(--line);
}

.info-title {
  margin: 0;
  font-weight: bold;
}

.info-line {
  margin: 0;
  color: var(--text);
}

.empty-state {
  padding: 14px;
  border-radius: 12px;
  background: var(--panel-2);
  border: 1px solid var(--line);
}

.empty-text {
  margin: 0;
  color: var(--muted);
}

.button-row {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.action-button {
  border: 1px solid var(--line);
  background: transparent;
  color: var(--text);
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
}

.action-button-danger {
  border-color: rgba(239, 68, 68, 0.45);
}
</style>