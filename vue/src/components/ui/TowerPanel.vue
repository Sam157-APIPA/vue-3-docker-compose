<template>
  <div class="tower-panel">
    <div class="tower-panel__header">
      <h2 class="tower-panel__title">Selection</h2>
      <p class="tower-panel__text">Tower, enemy, fighter and barricade info</p>
    </div>

    <div class="tower-panel__card">
      <p class="tower-panel__card-title">Level status</p>
      <p class="tower-panel__line">Gold: {{ gold }}</p>
      <p class="tower-panel__line">Base HP: {{ baseHp }}</p>
      <p class="tower-panel__line">Wave: {{ currentWaveNumber }}/{{ totalWaves }}</p>
      <p class="tower-panel__line">Status: {{ statusText }}</p>
    </div>

    <div v-if="selectedTower" class="tower-panel__card">
      <p class="tower-panel__card-title">Selected tower</p>
      <p class="tower-panel__line">Type: {{ selectedTower.type }}</p>
      <p class="tower-panel__line">Level: {{ selectedTower.level }}</p>
      <p class="tower-panel__line">HP: {{ Math.round(selectedTower.hp) }}/{{ selectedTower.maxHp }}</p>
      <p class="tower-panel__line">Range: {{ towerStats ? towerStats.range : '-' }}</p>
      <p class="tower-panel__line">Damage: {{ towerStats ? towerStats.damage : '-' }}</p>
      <p class="tower-panel__line">Fire rate: {{ towerStats ? towerStats.fireRate : '-' }}</p>

      <div class="tower-panel__button-row">
        <button
            class="tower-panel__button"
            type="button"
            @click="() => emitUpgradeTower(selectedTower.id)"
        >
          Upgrade
        </button>

        <button
            class="tower-panel__button tower-panel__button--danger"
            type="button"
            @click="() => emitRemoveTower(selectedTower.id)"
        >
          Remove
        </button>
      </div>
    </div>

    <div v-else class="tower-panel__empty-state">
      <p class="tower-panel__empty-text">No tower selected</p>
    </div>

    <div v-if="selectedEnemy" class="tower-panel__card">
      <p class="tower-panel__card-title">Selected enemy</p>
      <p class="tower-panel__line">Type: {{ selectedEnemy.type }}</p>
      <p class="tower-panel__line">Title: {{ selectedEnemy.title }}</p>
      <p class="tower-panel__line">HP: {{ Math.round(selectedEnemy.hp) }}/{{ selectedEnemy.maxHp }}</p>
      <p class="tower-panel__line">Ranged: {{ selectedEnemy.isRanged ? 'yes' : 'no' }}</p>
      <p class="tower-panel__line">Damage: {{ selectedEnemy.attackDamage }}</p>
      <p class="tower-panel__line">Range: {{ selectedEnemy.attackRange }}</p>
    </div>

    <div v-else class="tower-panel__empty-state">
      <p class="tower-panel__empty-text">No enemy selected</p>
    </div>

    <div v-if="selectedFighter" class="tower-panel__card">
      <p class="tower-panel__card-title">Selected fighter</p>
      <p class="tower-panel__line">Type: {{ selectedFighter.type }}</p>
      <p class="tower-panel__line">HP: {{ Math.round(selectedFighter.hp) }}/{{ selectedFighter.maxHp }}</p>
      <p class="tower-panel__line">Damage: {{ selectedFighter.damage }}</p>
      <p class="tower-panel__line">Range: {{ selectedFighter.range }}</p>
      <p class="tower-panel__line">Speed: {{ selectedFighter.speed }}</p>
    </div>

    <div v-else class="tower-panel__empty-state">
      <p class="tower-panel__empty-text">No fighter selected</p>
    </div>

    <div v-if="selectedBarricade" class="tower-panel__card">
      <p class="tower-panel__card-title">Selected barricade</p>
      <p class="tower-panel__line">Title: {{ selectedBarricade.title }}</p>
      <p class="tower-panel__line">HP: {{ Math.round(selectedBarricade.hp) }}/{{ selectedBarricade.maxHp }}</p>

      <div class="tower-panel__button-row">
        <button
            class="tower-panel__button tower-panel__button--danger"
            type="button"
            @click="() => emitRemoveBarricade(selectedBarricade.id)"
        >
          Remove
        </button>
      </div>
    </div>

    <div v-else class="tower-panel__empty-state">
      <p class="tower-panel__empty-text">No barricade selected</p>
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
    selectedFighter: {
      type: Object,
      default: null
    },
    selectedBarricade: {
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
    },
    baseHp: {
      type: Number,
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
    }
  },

  emits: [
    'upgrade-tower',
    'remove-tower',
    'remove-barricade'
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
    },

    emitRemoveBarricade (barricadeId) {
      this.$emit('remove-barricade', barricadeId)
    }
  }
}
</script>

<style scoped lang="scss">
.tower-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

  &__card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px;
    border-radius: 12px;
    background: var(--panel-2);
    border: 1px solid var(--line);
  }

  &__card-title {
    margin: 0;
    font-weight: bold;
  }

  &__line {
    margin: 0;
    color: var(--text);
  }

  &__empty-state {
    padding: 14px;
    border-radius: 12px;
    background: var(--panel-2);
    border: 1px solid var(--line);
  }

  &__empty-text {
    margin: 0;
    color: var(--muted);
  }

  &__button-row {
    display: flex;
    gap: 10px;
    margin-top: 8px;
  }

  &__button {
    padding: 10px 12px;
    border: 1px solid var(--line);
    border-radius: 12px;
    background: transparent;
    color: var(--text);
    cursor: pointer;
  }

  &__button--danger {
    border-color: rgba(239, 68, 68, 0.45);
  }
}
</style>