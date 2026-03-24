import {
  ACTION_TYPES,
  DEFAULT_BASE_HP,
  DEFAULT_ENEMY_SPEED,
  DEFAULT_LEVEL_GOLD,
  ENEMY_CONFIG,
  LEVEL_KEYS,
  MAX_TOWER_LEVEL,
  MUTATION_TYPES,
  TOWER_CONFIG,
  TOWER_TYPES,
  UPGRADE_PRICE_BY_LEVEL
} from '@/constants/gameConstants'
import { levelConfig } from '@/data/levelConfig'

const createLevelState = (levelKey) => {
  const sourceLevel = levelConfig[levelKey] || levelConfig[LEVEL_KEYS.FIRST]

  const slots = sourceLevel.slots.map((slot) => {
    return {
      id: slot.id,
      pos: {
        x: slot.pos.x,
        y: slot.pos.y
      },
      towerId: null
    }
  })

  return {
    currentLevelKey: sourceLevel.id,
    buildMode: null,
    selectedTowerId: '',
    selectedEnemyId: '',
    gold: sourceLevel.startGold || DEFAULT_LEVEL_GOLD,
    baseHp: sourceLevel.baseHp || DEFAULT_BASE_HP,
    towerIndex: 1,
    enemyIndex: 1,
    currentWaveIndex: -1,
    waveInProgress: false,
    isRunning: false,
    isGameOver: false,
    isVictory: false,
    waveElapsedMs: 0,
    nextSpawnIndex: 0,
    pendingSpawns: [],
    level: {
      ...sourceLevel
    },
    slots,
    towersById: {},
    enemies: []
  }
}

const getTowerStats = (towerType, towerLevel) => {
  const towerConfig = TOWER_CONFIG[towerType]

  if (!towerConfig) {
    return null
  }

  return towerConfig.levels[towerLevel] || null
}

const getDistance = (firstPoint, secondPoint) => {
  const dx = firstPoint.x - secondPoint.x
  const dy = firstPoint.y - secondPoint.y

  return Math.sqrt(dx * dx + dy * dy)
}

const getPathTotalLength = (path) => {
  if (!path || path.length < 2) {
    return 0
  }

  let total = 0

  for (let index = 1; index < path.length; index += 1) {
    total += getDistance(path[index - 1], path[index])
  }

  return total
}

const getPointAtDistance = (path, distance) => {
  if (!path || !path.length) {
    return {
      x: 0,
      y: 0
    }
  }

  if (path.length === 1 || distance <= 0) {
    return {
      x: path[0].x,
      y: path[0].y
    }
  }

  let passedDistance = 0

  for (let index = 1; index < path.length; index += 1) {
    const from = path[index - 1]
    const to = path[index]
    const segmentLength = getDistance(from, to)

    if (passedDistance + segmentLength >= distance) {
      const offset = distance - passedDistance
      const ratio = segmentLength === 0 ? 0 : offset / segmentLength

      return {
        x: Math.round(from.x + (to.x - from.x) * ratio),
        y: Math.round(from.y + (to.y - from.y) * ratio)
      }
    }

    passedDistance += segmentLength
  }

  const lastPoint = path[path.length - 1]

  return {
    x: lastPoint.x,
    y: lastPoint.y
  }
}

const createEnemy = (enemyId, enemyType, level) => {
  const config = ENEMY_CONFIG[enemyType] || ENEMY_CONFIG.basic
  const startPoint = level.path && level.path.length ? level.path[0] : level.enemySpawn

  return {
    id: enemyId,
    type: enemyType,
    hp: config.hp,
    reward: config.reward,
    color: config.color,
    distance: 0,
    pos: {
      x: startPoint.x,
      y: startPoint.y
    }
  }
}

export default {
  namespaced: true,

  state () {
    return createLevelState(LEVEL_KEYS.FIRST)
  },

  getters: {
    level (state) {
      return state.level
    },

    slots (state) {
      return state.slots
    },

    towersById (state) {
      return state.towersById
    },

    enemies (state) {
      return state.enemies
    },

    selectedTowerId (state) {
      return state.selectedTowerId
    },

    selectedEnemyId (state) {
      return state.selectedEnemyId
    },

    buildMode (state) {
      return state.buildMode
    },

    gold (state) {
      return state.gold
    },

    baseHp (state) {
      return state.baseHp
    },

    isRunning (state) {
      return state.isRunning
    },

    waveInProgress (state) {
      return state.waveInProgress
    },

    isGameOver (state) {
      return state.isGameOver
    },

    isVictory (state) {
      return state.isVictory
    },

    currentWaveIndex (state) {
      return state.currentWaveIndex
    },

    totalWaves (state) {
      return state.level.waves ? state.level.waves.length : 0
    },

    currentWaveNumber (state) {
      if (state.currentWaveIndex < 0) {
        return 0
      }

      return state.currentWaveIndex + 1
    },

    canStartWave (state) {
      const totalWaves = state.level.waves ? state.level.waves.length : 0

      return !state.waveInProgress &&
        !state.isGameOver &&
        !state.isVictory &&
        state.currentWaveIndex < totalWaves - 1
    },

    selectedTower (state) {
      if (!state.selectedTowerId) {
        return null
      }

      return state.towersById[state.selectedTowerId] || null
    },

    selectedEnemy (state) {
      if (!state.selectedEnemyId) {
        return null
      }

      return state.enemies.find((enemy) => enemy.id === state.selectedEnemyId) || null
    },

    getTowerStats () {
      return (towerType, towerLevel) => {
        return getTowerStats(towerType, towerLevel)
      }
    },

    towerTypes () {
      return Object.values(TOWER_TYPES)
    },

    statusText (state) {
      if (state.isGameOver) {
        return 'Game over'
      }

      if (state.isVictory) {
        return 'Victory'
      }

      if (state.waveInProgress && state.isRunning) {
        return 'Wave is running'
      }

      if (state.waveInProgress && !state.isRunning) {
        return 'Wave is paused'
      }

      return 'Waiting for next wave'
    }
  },

  mutations: {
    [MUTATION_TYPES.SET_LEVEL] (state, payload) {
      state.currentLevelKey = payload.currentLevelKey
      state.level = payload.level
      state.slots = payload.slots
      state.towersById = payload.towersById
      state.enemies = payload.enemies
      state.buildMode = payload.buildMode
      state.selectedTowerId = payload.selectedTowerId
      state.selectedEnemyId = payload.selectedEnemyId
      state.towerIndex = payload.towerIndex
      state.enemyIndex = payload.enemyIndex
      state.gold = payload.gold
      state.baseHp = payload.baseHp
      state.currentWaveIndex = payload.currentWaveIndex
      state.waveInProgress = payload.waveInProgress
      state.isRunning = payload.isRunning
      state.isGameOver = payload.isGameOver
      state.isVictory = payload.isVictory
      state.waveElapsedMs = payload.waveElapsedMs
      state.nextSpawnIndex = payload.nextSpawnIndex
      state.pendingSpawns = payload.pendingSpawns
    },

    [MUTATION_TYPES.SET_BUILD_MODE] (state, towerType) {
      state.buildMode = towerType
    },

    [MUTATION_TYPES.SET_SELECTED_TOWER_ID] (state, towerId) {
      state.selectedTowerId = towerId
    },

    [MUTATION_TYPES.SET_SELECTED_ENEMY_ID] (state, enemyId) {
      state.selectedEnemyId = enemyId
    },

    [MUTATION_TYPES.SET_GOLD] (state, gold) {
      state.gold = gold
    },

    [MUTATION_TYPES.BUILD_TOWER] (state, payload) {
      const slot = state.slots.find((item) => item.id === payload.slotId)

      if (!slot || slot.towerId) {
        return
      }

      const towerId = `tower${state.towerIndex}`

      state.towerIndex += 1
      slot.towerId = towerId

      state.towersById = {
        ...state.towersById,
        [towerId]: {
          id: towerId,
          slotId: slot.id,
          type: payload.towerType,
          level: 1,
          cooldownMs: 0
        }
      }

      state.selectedTowerId = towerId
      state.buildMode = null
    },

    [MUTATION_TYPES.UPGRADE_TOWER] (state, towerId) {
      const tower = state.towersById[towerId]

      if (!tower || tower.level >= MAX_TOWER_LEVEL) {
        return
      }

      state.towersById = {
        ...state.towersById,
        [towerId]: {
          ...tower,
          level: tower.level + 1
        }
      }
    },

    [MUTATION_TYPES.REMOVE_TOWER] (state, towerId) {
      const tower = state.towersById[towerId]

      if (!tower) {
        return
      }

      const slot = state.slots.find((item) => item.id === tower.slotId)

      if (slot) {
        slot.towerId = null
      }

      const nextTowers = {
        ...state.towersById
      }

      delete nextTowers[towerId]

      state.towersById = nextTowers

      if (state.selectedTowerId === towerId) {
        state.selectedTowerId = ''
      }
    },

    [MUTATION_TYPES.START_WAVE] (state) {
      const nextWaveIndex = state.currentWaveIndex + 1
      const wave = state.level.waves[nextWaveIndex]

      if (!wave) {
        return
      }

      state.currentWaveIndex = nextWaveIndex
      state.waveInProgress = true
      state.isRunning = true
      state.waveElapsedMs = 0
      state.nextSpawnIndex = 0
      state.pendingSpawns = wave.spawns.map((spawn) => {
        return {
          type: spawn.type,
          delayMs: spawn.delayMs
        }
      })
      state.buildMode = null
      state.selectedEnemyId = ''
      state.selectedTowerId = ''
    },

    [MUTATION_TYPES.TOGGLE_PAUSE] (state) {
      if (!state.waveInProgress || state.isGameOver || state.isVictory) {
        return
      }

      state.isRunning = !state.isRunning
    },

    [MUTATION_TYPES.APPLY_TICK] (state, deltaMs) {
      if (!state.isRunning || state.isGameOver || state.isVictory) {
        return
      }

      const levelPath = state.level.path || []
      const pathTotalLength = getPathTotalLength(levelPath)
      const enemySpeed = state.level.enemySpeed || DEFAULT_ENEMY_SPEED

      state.waveElapsedMs += deltaMs

      while (
        state.nextSpawnIndex < state.pendingSpawns.length &&
        state.pendingSpawns[state.nextSpawnIndex].delayMs <= state.waveElapsedMs
        ) {
        const spawn = state.pendingSpawns[state.nextSpawnIndex]
        const enemyId = `enemy${state.enemyIndex}`

        state.enemyIndex += 1
        state.nextSpawnIndex += 1

        state.enemies = [
          ...state.enemies,
          createEnemy(enemyId, spawn.type, state.level)
        ]
      }

      let escapedCount = 0

      state.enemies = state.enemies
        .map((enemy) => {
          const nextDistance = enemy.distance + (enemySpeed * deltaMs) / 1000

          if (nextDistance >= pathTotalLength) {
            escapedCount += 1
            return null
          }

          return {
            ...enemy,
            distance: nextDistance,
            pos: getPointAtDistance(levelPath, nextDistance)
          }
        })
        .filter(Boolean)

      if (escapedCount > 0) {
        state.baseHp = Math.max(0, state.baseHp - escapedCount)
      }

      if (state.baseHp <= 0) {
        state.isGameOver = true
        state.isRunning = false
        state.waveInProgress = false
        state.pendingSpawns = []
        state.nextSpawnIndex = 0
        state.waveElapsedMs = 0
        state.selectedEnemyId = ''
        return
      }

      const damageByEnemyId = {}
      const nextTowersById = {}

      state.slots.forEach((slot) => {
        if (!slot.towerId) {
          return
        }

        const tower = state.towersById[slot.towerId]

        if (!tower) {
          return
        }

        const stats = getTowerStats(tower.type, tower.level)

        if (!stats) {
          nextTowersById[tower.id] = tower
          return
        }

        let nextCooldownMs = tower.cooldownMs - deltaMs

        if (nextCooldownMs < 0) {
          nextCooldownMs = 0
        }

        if (nextCooldownMs === 0) {
          let nearestEnemy = null
          let nearestDistance = Infinity

          state.enemies.forEach((enemy) => {
            const distance = getDistance(slot.pos, enemy.pos)

            if (distance > stats.range) {
              return
            }

            if (distance < nearestDistance) {
              nearestDistance = distance
              nearestEnemy = enemy
            }
          })

          if (nearestEnemy) {
            if (!damageByEnemyId[nearestEnemy.id]) {
              damageByEnemyId[nearestEnemy.id] = 0
            }

            damageByEnemyId[nearestEnemy.id] += stats.damage
            nextCooldownMs = 1000 / stats.fireRate
          }
        }

        nextTowersById[tower.id] = {
          ...tower,
          cooldownMs: nextCooldownMs
        }
      })

      state.towersById = nextTowersById

      let rewardSum = 0

      state.enemies = state.enemies
        .map((enemy) => {
          const damage = damageByEnemyId[enemy.id] || 0
          const nextHp = enemy.hp - damage

          if (nextHp <= 0) {
            rewardSum += enemy.reward || 0
            return null
          }

          return {
            ...enemy,
            hp: nextHp
          }
        })
        .filter(Boolean)

      if (rewardSum > 0) {
        state.gold += rewardSum
      }

      if (state.selectedEnemyId) {
        const stillExists = state.enemies.some((enemy) => enemy.id === state.selectedEnemyId)

        if (!stillExists) {
          state.selectedEnemyId = ''
        }
      }

      const allSpawnsCompleted = state.nextSpawnIndex >= state.pendingSpawns.length
      const noEnemiesLeft = state.enemies.length === 0

      if (state.waveInProgress && allSpawnsCompleted && noEnemiesLeft) {
        state.waveInProgress = false
        state.isRunning = false
        state.pendingSpawns = []
        state.nextSpawnIndex = 0
        state.waveElapsedMs = 0

        const totalWaves = state.level.waves ? state.level.waves.length : 0

        if (state.currentWaveIndex >= totalWaves - 1) {
          state.isVictory = true
        }
      }
    },

    [MUTATION_TYPES.RESET_LEVEL] (state, payload) {
      state.currentLevelKey = payload.currentLevelKey
      state.buildMode = payload.buildMode
      state.selectedTowerId = payload.selectedTowerId
      state.selectedEnemyId = payload.selectedEnemyId
      state.towerIndex = payload.towerIndex
      state.enemyIndex = payload.enemyIndex
      state.level = payload.level
      state.slots = payload.slots
      state.towersById = payload.towersById
      state.enemies = payload.enemies
      state.gold = payload.gold
      state.baseHp = payload.baseHp
      state.currentWaveIndex = payload.currentWaveIndex
      state.waveInProgress = payload.waveInProgress
      state.isRunning = payload.isRunning
      state.isGameOver = payload.isGameOver
      state.isVictory = payload.isVictory
      state.waveElapsedMs = payload.waveElapsedMs
      state.nextSpawnIndex = payload.nextSpawnIndex
      state.pendingSpawns = payload.pendingSpawns
    }
  },

  actions: {
    [ACTION_TYPES.INIT_LEVEL] ({ commit }, levelKey = LEVEL_KEYS.FIRST) {
      commit(MUTATION_TYPES.SET_LEVEL, createLevelState(levelKey))
    },

    [ACTION_TYPES.RESET_LEVEL] ({ commit, state }) {
      commit(MUTATION_TYPES.RESET_LEVEL, createLevelState(state.currentLevelKey))
    },

    [ACTION_TYPES.TOGGLE_BUILD_MODE] ({ commit, state }, towerType) {
      const nextValue = state.buildMode === towerType ? null : towerType

      commit(MUTATION_TYPES.SET_BUILD_MODE, nextValue)
      commit(MUTATION_TYPES.SET_SELECTED_TOWER_ID, '')
      commit(MUTATION_TYPES.SET_SELECTED_ENEMY_ID, '')
    },

    [ACTION_TYPES.SLOT_CLICK] ({ commit, state }, slotId) {
      const slot = state.slots.find((item) => item.id === slotId)

      if (!slot) {
        return
      }

      if (slot.towerId) {
        commit(MUTATION_TYPES.SET_SELECTED_TOWER_ID, slot.towerId)
        commit(MUTATION_TYPES.SET_SELECTED_ENEMY_ID, '')
        return
      }

      if (!state.buildMode) {
        commit(MUTATION_TYPES.SET_SELECTED_TOWER_ID, '')
        return
      }

      const config = TOWER_CONFIG[state.buildMode]

      if (!config) {
        return
      }

      if (state.gold < config.price) {
        return
      }

      commit(MUTATION_TYPES.SET_GOLD, state.gold - config.price)
      commit(MUTATION_TYPES.BUILD_TOWER, {
        slotId,
        towerType: state.buildMode
      })
      commit(MUTATION_TYPES.SET_SELECTED_ENEMY_ID, '')
    },

    [ACTION_TYPES.TOWER_CLICK] ({ commit }, towerId) {
      commit(MUTATION_TYPES.SET_SELECTED_TOWER_ID, towerId)
      commit(MUTATION_TYPES.SET_SELECTED_ENEMY_ID, '')
    },

    [ACTION_TYPES.ENEMY_CLICK] ({ commit }, enemyId) {
      commit(MUTATION_TYPES.SET_SELECTED_ENEMY_ID, enemyId)
      commit(MUTATION_TYPES.SET_SELECTED_TOWER_ID, '')
    },

    [ACTION_TYPES.BUILD_TOWER] ({ commit, state }, payload) {
      const config = TOWER_CONFIG[payload.towerType]

      if (!config) {
        return
      }

      if (state.gold < config.price) {
        return
      }

      commit(MUTATION_TYPES.SET_GOLD, state.gold - config.price)
      commit(MUTATION_TYPES.BUILD_TOWER, payload)
      commit(MUTATION_TYPES.SET_SELECTED_ENEMY_ID, '')
    },

    [ACTION_TYPES.UPGRADE_TOWER] ({ commit, state }, towerId) {
      const tower = state.towersById[towerId]

      if (!tower) {
        return
      }

      if (tower.level >= MAX_TOWER_LEVEL) {
        return
      }

      const upgradePrice = UPGRADE_PRICE_BY_LEVEL[tower.level]

      if (!upgradePrice) {
        return
      }

      if (state.gold < upgradePrice) {
        return
      }

      commit(MUTATION_TYPES.SET_GOLD, state.gold - upgradePrice)
      commit(MUTATION_TYPES.UPGRADE_TOWER, towerId)
    },

    [ACTION_TYPES.REMOVE_TOWER] ({ commit, state }, towerId) {
      const tower = state.towersById[towerId]

      if (!tower) {
        return
      }

      const config = TOWER_CONFIG[tower.type]

      if (config) {
        commit(MUTATION_TYPES.SET_GOLD, state.gold + config.refund)
      }

      commit(MUTATION_TYPES.REMOVE_TOWER, towerId)
    },

    [ACTION_TYPES.START_WAVE] ({ commit, getters }) {
      if (!getters.canStartWave) {
        return
      }

      commit(MUTATION_TYPES.START_WAVE)
    },

    [ACTION_TYPES.TOGGLE_PAUSE] ({ commit }) {
      commit(MUTATION_TYPES.TOGGLE_PAUSE)
    },

    [ACTION_TYPES.TICK] ({ commit, state }, deltaMs) {
      if (!state.isRunning) {
        return
      }

      commit(MUTATION_TYPES.APPLY_TICK, deltaMs)
    }
  }
}