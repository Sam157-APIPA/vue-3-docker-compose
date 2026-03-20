import { LEVELS } from '@/data/levels'

const START_COINS = 120

const TOWER_TYPES = ['gun', 'sniper', 'rapid']
const ENEMY_TYPES = ['light', 'medium', 'heavy']

const TOWER_CONFIG = {
  gun: {
    buildCost: 40,
    upgradeBaseCost: 30,
    upgradeStepCost: 20,
    stats: {
      damage: 10,
      fireRate: 1,
      range: 90,
      maxHp: 100
    }
  },
  sniper: {
    buildCost: 70,
    upgradeBaseCost: 50,
    upgradeStepCost: 30,
    stats: {
      damage: 25,
      fireRate: 0.6,
      range: 150,
      maxHp: 80
    }
  },
  rapid: {
    buildCost: 55,
    upgradeBaseCost: 35,
    upgradeStepCost: 22,
    stats: {
      damage: 6,
      fireRate: 2,
      range: 80,
      maxHp: 110
    }
  }
}

const ENEMY_CONFIG = {
  light: {
    hp: 60,
    reward: 15,
    color: '#f59e0b'
  },
  medium: {
    hp: 110,
    reward: 25,
    color: '#ef4444'
  },
  heavy: {
    hp: 180,
    reward: 40,
    color: '#7c3aed'
  }
}

function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`
}

function getTowerConfig(type) {
  return TOWER_CONFIG[type] || TOWER_CONFIG.gun
}

function getEnemyConfig(type) {
  return ENEMY_CONFIG[type] || ENEMY_CONFIG.light
}

function getTowerStats(type, level = 1) {
  const base = getTowerConfig(type).stats

  return {
    damage: Math.round(base.damage * (1 + 0.25 * (level - 1))),
    fireRate: +(base.fireRate * (1 + 0.1 * (level - 1))).toFixed(2),
    range: Math.round(base.range + 15 * (level - 1)),
    maxHp: Math.round(base.maxHp * (1 + 0.2 * (level - 1)))
  }
}

function getTowerBuildCost(type) {
  return getTowerConfig(type).buildCost
}

function getTowerUpgradeCost(type, level) {
  const config = getTowerConfig(type)
  return config.upgradeBaseCost + (level - 1) * config.upgradeStepCost
}

function dist2(a, b) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return dx * dx + dy * dy
}

function createEnemy(type, point) {
  const config = getEnemyConfig(type)

  return {
    id: uid('e'),
    type,
    hp: config.hp,
    reward: config.reward,
    color: config.color,
    pos: {
      x: point.x,
      y: point.y
    }
  }
}

function createSlots(level) {
  return level.slots.map((slot) => ({
    id: slot.id,
    pos: {
      x: slot.pos.x,
      y: slot.pos.y
    },
    towerId: null
  }))
}

export default {
  namespaced: true,

  state() {
    return {
      levels: LEVELS,
      currentLevelId: LEVELS[0]?.id || null,

      mode: 'idle',
      buildType: 'gun',

      coins: START_COINS,

      slots: [],
      towersById: {},
      enemies: [],

      selectedTowerId: null,
      selectedEnemyId: null
    }
  },

  getters: {
    getLevels: (state) => state.levels,

    getCurrentLevel: (state) => {
      if (!state.currentLevelId) return null
      return state.levels.find((level) => level.id === state.currentLevelId) || null
    },

    getMode: (state) => state.mode,
    getBuildType: (state) => state.buildType,
    getTowerTypes: () => TOWER_TYPES,
    getEnemyTypes: () => ENEMY_TYPES,

    getCoins: (state) => state.coins,

    getSlots: (state) => state.slots,
    getTowersById: (state) => state.towersById,
    getEnemies: (state) => state.enemies,

    getSelectedTowerId: (state) => state.selectedTowerId,
    getSelectedEnemyId: (state) => state.selectedEnemyId,

    getSelectedTower: (state) => {
      if (!state.selectedTowerId) return null
      return state.towersById[state.selectedTowerId] || null
    },

    getSelectedEnemy: (state) => {
      if (!state.selectedEnemyId) return null
      return state.enemies.find((enemy) => enemy.id === state.selectedEnemyId) || null
    },

    getSelectedTowerStats: (state, getters) => {
      const tower = getters.getSelectedTower
      if (!tower) return null
      return getTowerStats(tower.type, tower.level)
    },

    getSelectedTowerUpgradeCost: (state, getters) => {
      const tower = getters.getSelectedTower
      if (!tower) return 0
      return getTowerUpgradeCost(tower.type, tower.level)
    },

    canUpgradeSelectedTower: (state, getters) => {
      const tower = getters.getSelectedTower
      if (!tower) return false
      return state.coins >= getTowerUpgradeCost(tower.type, tower.level)
    },

    getTowerStats: () => (type, level) => getTowerStats(type, level),
    getTowerBuildCost: () => (type) => getTowerBuildCost(type),
    getTowerUpgradeCost: () => (type, level) => getTowerUpgradeCost(type, level)
  },

  mutations: {
    OPEN_LEVEL(state, levelId) {
      const level = state.levels.find((item) => item.id === levelId)
      if (!level) return

      state.currentLevelId = levelId
      state.mode = 'idle'
      state.buildType = 'gun'
      state.coins = START_COINS

      state.selectedTowerId = null
      state.selectedEnemyId = null

      state.towersById = {}
      state.enemies = []
      state.slots = createSlots(level)
    },

    RESET_CURRENT_LEVEL(state) {
      const level = state.levels.find((item) => item.id === state.currentLevelId)
      if (!level) return

      state.mode = 'idle'
      state.buildType = 'gun'
      state.coins = START_COINS

      state.selectedTowerId = null
      state.selectedEnemyId = null

      state.towersById = {}
      state.enemies = []
      state.slots = createSlots(level)
    },

    SET_MODE(state, mode) {
      state.mode = mode
    },

    SET_BUILD_TYPE(state, type) {
      state.buildType = type
    },

    SELECT_TOWER(state, towerId) {
      state.selectedTowerId = towerId
      state.selectedEnemyId = null
    },

    SELECT_ENEMY(state, enemyId) {
      state.selectedEnemyId = enemyId
      state.selectedTowerId = null
    },

    PLACE_TOWER(state, { slotId, type }) {
      const slot = state.slots.find((item) => item.id === slotId)
      if (!slot || slot.towerId) return

      const cost = getTowerBuildCost(type)
      if (state.coins < cost) return

      const towerId = uid('t')
      const stats = getTowerStats(type, 1)

      state.coins -= cost

      state.towersById[towerId] = {
        id: towerId,
        type,
        level: 1,
        hp: stats.maxHp,
        lastShotAt: 0
      }

      slot.towerId = towerId
      state.selectedTowerId = towerId
      state.selectedEnemyId = null
      state.mode = 'idle'
    },

    UPGRADE_SELECTED_TOWER(state) {
      const towerId = state.selectedTowerId
      if (!towerId) return

      const tower = state.towersById[towerId]
      if (!tower) return

      const cost = getTowerUpgradeCost(tower.type, tower.level)
      if (state.coins < cost) return

      state.coins -= cost
      tower.level += 1

      const stats = getTowerStats(tower.type, tower.level)
      if (tower.hp > stats.maxHp) {
        tower.hp = stats.maxHp
      }
    },

    REMOVE_SELECTED_TOWER(state) {
      const towerId = state.selectedTowerId
      if (!towerId) return

      const slot = state.slots.find((item) => item.towerId === towerId)
      if (slot) {
        slot.towerId = null
      }

      delete state.towersById[towerId]
      state.selectedTowerId = null
    },

    ADD_ENEMY(state, enemy) {
      state.enemies.push(enemy)
      state.selectedEnemyId = enemy.id
      state.selectedTowerId = null
    },

    MOVE_ENEMY(state, { id, x, y }) {
      const enemy = state.enemies.find((item) => item.id === id)
      if (!enemy) return

      enemy.pos.x = x
      enemy.pos.y = y
    },

    REMOVE_ENEMY(state, enemyId) {
      state.enemies = state.enemies.filter((enemy) => enemy.id !== enemyId)

      if (state.selectedEnemyId === enemyId) {
        state.selectedEnemyId = null
      }
    },

    TICK(state, now) {
      const activeTowers = []

      for (let i = 0; i < state.slots.length; i += 1) {
        const slot = state.slots[i]
        if (!slot.towerId) continue

        const tower = state.towersById[slot.towerId]
        if (!tower) continue

        activeTowers.push({
          id: tower.id,
          type: tower.type,
          level: tower.level,
          lastShotAt: tower.lastShotAt || 0,
          pos: {
            x: slot.pos.x,
            y: slot.pos.y
          }
        })
      }

      const aliveEnemies = []

      for (let enemyIndex = 0; enemyIndex < state.enemies.length; enemyIndex += 1) {
        const enemy = state.enemies[enemyIndex]
        let hp = enemy.hp

        for (let towerIndex = 0; towerIndex < activeTowers.length; towerIndex += 1) {
          const tower = activeTowers[towerIndex]
          const stats = getTowerStats(tower.type, tower.level)

          const cooldownMs = 1000 / stats.fireRate
          if (now - tower.lastShotAt < cooldownMs) continue

          const range2 = stats.range * stats.range
          const enemyDistance2 = dist2(tower.pos, enemy.pos)

          if (enemyDistance2 > range2) continue

          hp -= stats.damage
          tower.lastShotAt = now

          if (hp <= 0) break
        }

        if (hp > 0) {
          aliveEnemies.push({
            ...enemy,
            hp
          })
        } else {
          state.coins += enemy.reward

          if (state.selectedEnemyId === enemy.id) {
            state.selectedEnemyId = null
          }
        }
      }

      for (let i = 0; i < activeTowers.length; i += 1) {
        const tower = activeTowers[i]
        const originalTower = state.towersById[tower.id]

        if (originalTower) {
          originalTower.lastShotAt = tower.lastShotAt
        }
      }

      state.enemies = aliveEnemies
    }
  },

  actions: {
    openLevel({ commit }, levelId) {
      commit('OPEN_LEVEL', levelId)
    },

    resetLevel({ commit }) {
      commit('RESET_CURRENT_LEVEL')
    },

    toggleBuildMode({ state, commit }) {
      if (state.mode === 'build') {
        commit('SET_MODE', 'idle')
        return
      }

      commit('SELECT_TOWER', null)
      commit('SELECT_ENEMY', null)
      commit('SET_MODE', 'build')
    },

    slotClick({ state, commit }, slotId) {
      const slot = state.slots.find((item) => item.id === slotId)
      if (!slot) return

      if (state.mode === 'build') {
        commit('PLACE_TOWER', { slotId, type: state.buildType })
        return
      }

      if (slot.towerId) {
        commit('SELECT_TOWER', slot.towerId)
      }
    },

    towerClick({ commit }, towerId) {
      commit('SELECT_TOWER', towerId)
      commit('SET_MODE', 'idle')
    },

    enemyClick({ commit }, enemyId) {
      commit('SELECT_ENEMY', enemyId)
      commit('SET_MODE', 'idle')
    },

    spawnEnemy({ state, getters, commit }, type) {
      const level = getters.getCurrentLevel
      if (!level) return null

      const point = level.enemySpawn || { x: 80, y: 80 }
      const enemy = createEnemy(type, point)

      commit('ADD_ENEMY', enemy)
      return enemy.id
    },

    moveEnemy({ commit }, payload) {
      commit('MOVE_ENEMY', payload)
    },

    tick({ commit }, now) {
      commit('TICK', now)
    }
  }
}