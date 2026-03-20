<template>
  <div v-if="level" class="layout">
    <div class="left">
      <div class="toolbar">
        <button class="btn" @click="goLevels">
          ← Levels
        </button>

        <button class="btn btn--accent" @click="toggleBuildMode">
          {{ mode === 'build' ? 'Close build' : 'Build tower' }}
        </button>

        <button class="btn" @click="resetLevel">
          Reset level
        </button>

        <div class="hint">
          <span class="muted">Level:</span> <b>{{ level.name }}</b>
          <span class="sep">|</span>
          <span class="muted">Coins:</span> <b>{{ coins }}</b>
          <span class="sep">|</span>
          <span class="muted">Enemies:</span> <b>{{ enemies.length }}</b>
        </div>
      </div>

      <GameCanvas
          :level="level"
          :slots="slots"
          :towers-by-id="towersById"
          :enemies="enemies"
          :selected-tower-id="selectedTowerId"
          :selected-enemy-id="selectedEnemyId"
          :get-tower-stats="getTowerStats"
          @slot-click="slotClick"
          @tower-click="towerClick"
          @enemy-pointer-down="enemyPointerDown"
          @canvas-pointer-move="canvasPointerMove"
          @canvas-pointer-up="canvasPointerUp"
      />
    </div>

    <aside class="right">
      <TowerBuildMenu
          v-if="mode === 'build'"
          :tower-types="towerTypes"
          :selected-type="buildType"
          :coins="coins"
          :get-build-cost="getTowerBuildCost"
          @select-type="setBuildType"
      />

      <div class="panel">
        <div class="panel__title">Spawn enemy</div>
        <div class="row muted">
          Spawn enemy on the green point, then drag it on the map
        </div>

        <div class="enemy-list">
          <button
              v-for="type in enemyTypes"
              :key="type"
              class="btn"
              @click="spawnEnemy(type)"
          >
            Spawn {{ type }}
          </button>
        </div>
      </div>

      <TowerPanel
          v-if="selectedTower"
          :tower="selectedTower"
          :stats="selectedTowerStats"
          :upgrade-cost="selectedTowerUpgradeCost"
          :can-upgrade="canUpgradeSelectedTower"
          :coins="coins"
          @upgrade="upgrade"
          @remove="remove"
      />

      <div v-if="selectedEnemy" class="panel">
        <div class="panel__title">Enemy</div>
        <div class="row">type: <b>{{ selectedEnemy.type }}</b></div>
        <div class="row">hp: <b>{{ Math.round(selectedEnemy.hp) }}</b></div>
        <div class="row">reward: <b>{{ selectedEnemy.reward }}</b></div>
      </div>

      <div v-if="!selectedTower && !selectedEnemy && mode !== 'build'" class="panel muted">
        Build towers, spawn enemies and drag them to test tower range and damage
      </div>
    </aside>
  </div>

  <div v-else class="panel">
    Level not found
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import GameCanvas from '@/components/GameCanvas.vue'
import TowerBuildMenu from '@/components/TowerBuildMenu.vue'
import TowerPanel from '@/components/TowerPanel.vue'

const props = defineProps({
  id: String
})

const store = useStore()
const router = useRouter()

const draggingEnemyId = ref(null)

watch(
    () => props.id,
    (id) => {
      if (id) {
        store.dispatch('td/openLevel', id)
      }
    },
    { immediate: true }
)

const level = computed(() => store.getters['td/getCurrentLevel'])
const slots = computed(() => store.getters['td/getSlots'])
const towersById = computed(() => store.getters['td/getTowersById'])
const enemies = computed(() => store.getters['td/getEnemies'])

const mode = computed(() => store.getters['td/getMode'])
const buildType = computed(() => store.getters['td/getBuildType'])

const towerTypes = computed(() => store.getters['td/getTowerTypes'])
const enemyTypes = computed(() => store.getters['td/getEnemyTypes'])

const coins = computed(() => store.getters['td/getCoins'])

const selectedTowerId = computed(() => store.getters['td/getSelectedTowerId'])
const selectedEnemyId = computed(() => store.getters['td/getSelectedEnemyId'])

const selectedTower = computed(() => store.getters['td/getSelectedTower'])
const selectedEnemy = computed(() => store.getters['td/getSelectedEnemy'])

const selectedTowerStats = computed(() => store.getters['td/getSelectedTowerStats'])
const selectedTowerUpgradeCost = computed(() => store.getters['td/getSelectedTowerUpgradeCost'])
const canUpgradeSelectedTower = computed(() => store.getters['td/canUpgradeSelectedTower'])

const getTowerStats = (type, levelValue) => store.getters['td/getTowerStats'](type, levelValue)
const getTowerBuildCost = (type) => store.getters['td/getTowerBuildCost'](type)

let timerId = null

onMounted(() => {
  timerId = setInterval(() => {
    store.dispatch('td/tick', Date.now())
  }, 50)
})

onUnmounted(() => {
  if (timerId) {
    clearInterval(timerId)
  }

  timerId = null
  draggingEnemyId.value = null
})

function goLevels() {
  router.push('/levels')
}

function resetLevel() {
  store.dispatch('td/resetLevel')
  draggingEnemyId.value = null
}

function toggleBuildMode() {
  store.dispatch('td/toggleBuildMode')
}

function setBuildType(type) {
  store.commit('td/SET_BUILD_TYPE', type)
}

function slotClick(slotId) {
  store.dispatch('td/slotClick', slotId)
}

function towerClick(towerId) {
  draggingEnemyId.value = null
  store.dispatch('td/towerClick', towerId)
}

function enemyPointerDown({ enemyId, x, y }) {
  draggingEnemyId.value = enemyId
  store.dispatch('td/enemyClick', enemyId)
  store.dispatch('td/moveEnemy', { id: enemyId, x, y })
}

function canvasPointerMove({ x, y }) {
  if (!draggingEnemyId.value) return
  store.dispatch('td/moveEnemy', { id: draggingEnemyId.value, x, y })
}

function canvasPointerUp() {
  draggingEnemyId.value = null
}

function spawnEnemy(type) {
  draggingEnemyId.value = null
  store.dispatch('td/spawnEnemy', type)
}

function upgrade() {
  store.commit('td/UPGRADE_SELECTED_TOWER')
}

function remove() {
  store.commit('td/REMOVE_SELECTED_TOWER')
}
</script>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 12px;
  align-items: start;
}

.left {
  min-width: 0;
}

.right {
  position: sticky;
  top: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toolbar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 10px;
}

.btn {
  padding: 8px 10px;
  border: 1px solid var(--border);
  background: var(--panel);
  border-radius: 10px;
  cursor: pointer;
}

.btn:hover {
  background: var(--soft);
}

.btn--accent {
  border-color: var(--accent-border);
  background: var(--accent-bg);
}

.hint {
  margin-left: auto;
  font-size: 13px;
  color: var(--text);
}

.muted {
  color: var(--muted);
}

.sep {
  margin: 0 6px;
  color: var(--muted);
}

.panel {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px;
}

.panel__title {
  font-weight: 800;
  margin-bottom: 8px;
}

.row {
  margin-top: 6px;
  font-size: 14px;
}

.enemy-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.layout {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 16px;
  align-items: start;
}
</style>