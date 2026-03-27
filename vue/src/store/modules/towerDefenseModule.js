import {
  ACTION_TYPES,
  ARTILLERY_CONFIG,
  BARRICADE_CONFIG,
  DEFAULT_BASE_HP,
  DEFAULT_ENEMY_SPEED,
  DEFAULT_LEVEL_GOLD,
  ENEMY_CONFIG,
  FIGHTER_CONFIG,
  FIGHTER_TYPES,
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

  const barricadeSlots = (sourceLevel.barricadeSlots || []).map((slot) => {
    return {
      id: slot.id,
      pos: {
        x: slot.pos.x,
        y: slot.pos.y
      },
      barricadeId: null
    }
  })

  return {
    currentLevelKey: sourceLevel.id,
    buildMode: null,
    barricadeMode: false,
    artilleryMode: false,
    selectedTowerId: '',
    selectedEnemyId: '',
    selectedFighterId: '',
    selectedBarricadeId: '',
    gold: sourceLevel.startGold || DEFAULT_LEVEL_GOLD,
    baseHp: sourceLevel.baseHp || DEFAULT_BASE_HP,
    towerIndex: 1,
    enemyIndex: 1,
    fighterIndex: 1,
    barricadeIndex: 1,
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
    barricadeSlots,
    towersById: {},
    barricadesById: {},
    enemies: [],
    fighters: []
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

const getReversePath = (path) => {
  return [...path].reverse()
}

const createEnemy = (enemyId, enemyType, level) => {
  const config = ENEMY_CONFIG[enemyType] || ENEMY_CONFIG.basic
  const startPoint = level.path && level.path.length ? level.path[0] : level.enemySpawn

  return {
    id: enemyId,
    type: enemyType,
    title: config.title,
    hp: config.hp,
    maxHp: config.hp,
    reward: config.reward,
    color: config.color,
    isRanged: config.isRanged,
    attackDamage: config.attackDamage,
    attackRange: config.attackRange,
    attackRate: config.attackRate,
    cooldownMs: 0,
    distance: 0,
    pos: {
      x: startPoint.x,
      y: startPoint.y
    }
  }
}

const createFighter = (fighterId, level) => {
  const config = FIGHTER_CONFIG[FIGHTER_TYPES.GUARD]
  const reversePath = getReversePath(level.path || [])
  const startPoint = reversePath.length ? reversePath[0] : { x: 0, y: 0 }

  return {
    id: fighterId,
    type: FIGHTER_TYPES.GUARD,
    title: config.title,
    hp: config.hp,
    maxHp: config.hp,
    damage: config.damage,
    range: config.range,
    speed: config.speed,
    attackRate: config.attackRate,
    cooldownMs: 0,
    distance: 0,
    color: config.color,
    pos: {
      x: startPoint.x,
      y: startPoint.y
    }
  }
}

const findTowerSlot = (slots, towerId) => {
  return slots.find((slot) => slot.towerId === towerId) || null
}

const findNearestEnemyInRange = (enemies, point, range) => {
  let nearestEnemy = null
  let nearestDistance = Infinity

  enemies.forEach((enemy) => {
    const distance = getDistance(point, enemy.pos)

    if (distance > range) {
      return
    }

    if (distance < nearestDistance) {
      nearestDistance = distance
      nearestEnemy = enemy
    }
  })

  return nearestEnemy
}

const findNearestTargetForEnemy = (enemy, state) => {
  let nearestTarget = null
  let nearestDistance = Infinity

  Object.values(state.barricadesById).forEach((barricade) => {
    const distance = getDistance(enemy.pos, barricade.pos)

    if (distance > enemy.attackRange) {
      return
    }

    if (distance < nearestDistance) {
      nearestDistance = distance
      nearestTarget = {
        id: barricade.id,
        type: 'barricade',
        pos: barricade.pos
      }
    }
  })

  state.fighters.forEach((fighter) => {
    const distance = getDistance(enemy.pos, fighter.pos)

    if (distance > enemy.attackRange) {
      return
    }

    if (distance < nearestDistance) {
      nearestDistance = distance
      nearestTarget = {
        id: fighter.id,
        type: 'fighter',
        pos: fighter.pos
      }
    }
  })

  if (enemy.isRanged) {
    Object.values(state.towersById).forEach((tower) => {
      const slot = findTowerSlot(state.slots, tower.id)

      if (!slot) {
        return
      }

      const distance = getDistance(enemy.pos, slot.pos)

      if (distance > enemy.attackRange) {
        return
      }

      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestTarget = {
          id: tower.id,
          type: 'tower',
          pos: slot.pos
        }
      }
    })
  }

  return nearestTarget
}

const applyDamageToEntities = (state, damageToEnemies, damageToTowers, damageToFighters, damageToBarricades) => {
  let rewardSum = 0

  state.enemies = state.enemies
    .map((enemy) => {
      const damage = damageToEnemies[enemy.id] || 0
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

  const nextTowersById = {}

  Object.values(state.towersById).forEach((tower) => {
    const damage = damageToTowers[tower.id] || 0
    const nextHp = tower.hp - damage

    if (nextHp <= 0) {
      const slot = findTowerSlot(state.slots, tower.id)

      if (slot) {
        slot.towerId = null
      }

      if (state.selectedTowerId === tower.id) {
        state.selectedTowerId = ''
      }

      return
    }

    nextTowersById[tower.id] = {
      ...tower,
      hp: nextHp
    }
  })

  state.towersById = nextTowersById

  state.fighters = state.fighters
    .map((fighter) => {
      const damage = damageToFighters[fighter.id] || 0
      const nextHp = fighter.hp - damage

      if (nextHp <= 0) {
        if (state.selectedFighterId === fighter.id) {
          state.selectedFighterId = ''
        }

        return null
      }

      return {
        ...fighter,
        hp: nextHp
      }
    })
    .filter(Boolean)

  const nextBarricadesById = {}

  Object.values(state.barricadesById).forEach((barricade) => {
    const damage = damageToBarricades[barricade.id] || 0
    const nextHp = barricade.hp - damage

    if (nextHp <= 0) {
      const slot = state.barricadeSlots.find((item) => item.barricadeId === barricade.id)

      if (slot) {
        slot.barricadeId = null
      }

      if (state.selectedBarricadeId === barricade.id) {
        state.selectedBarricadeId = ''
      }

      return
    }

    nextBarricadesById[barricade.id] = {
      ...barricade,
      hp: nextHp
    }
  })

  state.barricadesById = nextBarricadesById

  if (state.selectedEnemyId) {
    const hasEnemy = state.enemies.some((enemy) => enemy.id === state.selectedEnemyId)

    if (!hasEnemy) {
      state.selectedEnemyId = ''
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

    barricadeSlots (state) {
      return state.barricadeSlots
    },

    towersById (state) {
      return state.towersById
    },

    barricadesById (state) {
      return state.barricadesById
    },

    enemies (state) {
      return state.enemies
    },

    fighters (state) {
      return state.fighters
    },

    selectedTowerId (state) {
      return state.selectedTowerId
    },

    selectedEnemyId (state) {
      return state.selectedEnemyId
    },

    selectedFighterId (state) {
      return state.selectedFighterId
    },

    selectedBarricadeId (state) {
      return state.selectedBarricadeId
    },

    buildMode (state) {
      return state.buildMode
    },

    barricadeMode (state) {
      return state.barricadeMode
    },

    artilleryMode (state) {
      return state.artilleryMode
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

    selectedFighter (state) {
      if (!state.selectedFighterId) {
        return null
      }

      return state.fighters.find((fighter) => fighter.id === state.selectedFighterId) || null
    },

    selectedBarricade (state) {
      if (!state.selectedBarricadeId) {
        return null
      }

      return state.barricadesById[state.selectedBarricadeId] || null
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
      state.barricadeSlots = payload.barricadeSlots
      state.towersById = payload.towersById
      state.barricadesById = payload.barricadesById
      state.enemies = payload.enemies
      state.fighters = payload.fighters
      state.buildMode = payload.buildMode
      state.barricadeMode = payload.barricadeMode
      state.artilleryMode = payload.artilleryMode
      state.selectedTowerId = payload.selectedTowerId
      state.selectedEnemyId = payload.selectedEnemyId
      state.selectedFighterId = payload.selectedFighterId
      state.selectedBarricadeId = payload.selectedBarricadeId
      state.towerIndex = payload.towerIndex
      state.enemyIndex = payload.enemyIndex
      state.fighterIndex = payload.fighterIndex
      state.barricadeIndex = payload.barricadeIndex
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

    [MUTATION_TYPES.SET_BARRICADE_MODE] (state, value) {
      state.barricadeMode = value
    },

    [MUTATION_TYPES.SET_ARTILLERY_MODE] (state, value) {
      state.artilleryMode = value
    },

    [MUTATION_TYPES.SET_SELECTED_TOWER_ID] (state, towerId) {
      state.selectedTowerId = towerId
    },

    [MUTATION_TYPES.SET_SELECTED_ENEMY_ID] (state, enemyId) {
      state.selectedEnemyId = enemyId
    },

    [MUTATION_TYPES.SET_SELECTED_FIGHTER_ID] (state, fighterId) {
      state.selectedFighterId = fighterId
    },

    [MUTATION_TYPES.SET_SELECTED_BARRICADE_ID] (state, barricadeId) {
      state.selectedBarricadeId = barricadeId
    },

    [MUTATION_TYPES.SET_GOLD] (state, gold) {
      state.gold = gold
    },

    [MUTATION_TYPES.BUILD_TOWER] (state, payload) {
      const slot = state.slots.find((item) => item.id === payload.slotId)

      if (!slot || slot.towerId) {
        return
      }

      const towerStats = getTowerStats(payload.towerType, 1)

      if (!towerStats) {
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
          hp: towerStats.hp,
          maxHp: towerStats.hp,
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

      const nextLevel = tower.level + 1
      const nextStats = getTowerStats(tower.type, nextLevel)

      if (!nextStats) {
        return
      }

      state.towersById = {
        ...state.towersById,
        [towerId]: {
          ...tower,
          level: nextLevel,
          hp: nextStats.hp,
          maxHp: nextStats.hp
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

    [MUTATION_TYPES.BUILD_BARRICADE] (state, slotId) {
      const slot = state.barricadeSlots.find((item) => item.id === slotId)

      if (!slot || slot.barricadeId) {
        return
      }

      const barricadeId = `barricade${state.barricadeIndex}`

      state.barricadeIndex += 1
      slot.barricadeId = barricadeId

      state.barricadesById = {
        ...state.barricadesById,
        [barricadeId]: {
          id: barricadeId,
          slotId: slot.id,
          title: BARRICADE_CONFIG.BASIC.title,
          hp: BARRICADE_CONFIG.BASIC.hp,
          maxHp: BARRICADE_CONFIG.BASIC.hp,
          pos: {
            x: slot.pos.x,
            y: slot.pos.y
          }
        }
      }

      state.selectedBarricadeId = barricadeId
      state.barricadeMode = false
    },

    [MUTATION_TYPES.REMOVE_BARRICADE] (state, barricadeId) {
      const barricade = state.barricadesById[barricadeId]

      if (!barricade) {
        return
      }

      const slot = state.barricadeSlots.find((item) => item.id === barricade.slotId)

      if (slot) {
        slot.barricadeId = null
      }

      const nextBarricades = {
        ...state.barricadesById
      }

      delete nextBarricades[barricadeId]

      state.barricadesById = nextBarricades

      if (state.selectedBarricadeId === barricadeId) {
        state.selectedBarricadeId = ''
      }
    },

    [MUTATION_TYPES.SPAWN_FIGHTER] (state) {
      const fighterId = `fighter${state.fighterIndex}`

      state.fighterIndex += 1

      state.fighters = [
        ...state.fighters,
        createFighter(fighterId, state.level)
      ]

      state.selectedFighterId = fighterId
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
      state.barricadeMode = false
      state.artilleryMode = false
      state.selectedEnemyId = ''
      state.selectedTowerId = ''
      state.selectedFighterId = ''
      state.selectedBarricadeId = ''
    },

    [MUTATION_TYPES.TOGGLE_PAUSE] (state) {
      if (!state.waveInProgress || state.isGameOver || state.isVictory) {
        return
      }

      state.isRunning = !state.isRunning
    },

    [MUTATION_TYPES.APPLY_ARTILLERY] (state, payload) {
      const damageToEnemies = {}

      state.enemies.forEach((enemy) => {
        const distance = getDistance(enemy.pos, payload.point)

        if (distance > ARTILLERY_CONFIG.radius) {
          return
        }

        const ratio = 1 - distance / ARTILLERY_CONFIG.radius
        const damage = Math.round(ARTILLERY_CONFIG.maxDamage * ratio)

        if (damage <= 0) {
          return
        }

        damageToEnemies[enemy.id] = (damageToEnemies[enemy.id] || 0) + damage
      })

      applyDamageToEntities(state, damageToEnemies, {}, {}, {})
      state.artilleryMode = false
    },

    [MUTATION_TYPES.APPLY_TICK] (state, deltaMs) {
      if (!state.isRunning || state.isGameOver || state.isVictory) {
        return
      }

      const levelPath = state.level.path || []
      const reversePath = getReversePath(levelPath)
      const pathTotalLength = getPathTotalLength(levelPath)
      const reversePathTotalLength = getPathTotalLength(reversePath)
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

      const damageToEnemies = {}
      const damageToTowers = {}
      const damageToFighters = {}
      const damageToBarricades = {}

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
          const nearestEnemy = findNearestEnemyInRange(state.enemies, slot.pos, stats.range)

          if (nearestEnemy) {
            damageToEnemies[nearestEnemy.id] = (damageToEnemies[nearestEnemy.id] || 0) + stats.damage
            nextCooldownMs = 1000 / stats.fireRate
          }
        }

        nextTowersById[tower.id] = {
          ...tower,
          cooldownMs: nextCooldownMs
        }
      })

      state.towersById = nextTowersById

      state.fighters = state.fighters
        .map((fighter) => {
          let nextCooldownMs = fighter.cooldownMs - deltaMs

          if (nextCooldownMs < 0) {
            nextCooldownMs = 0
          }

          const targetEnemy = findNearestEnemyInRange(state.enemies, fighter.pos, fighter.range)

          if (targetEnemy) {
            if (nextCooldownMs === 0) {
              damageToEnemies[targetEnemy.id] = (damageToEnemies[targetEnemy.id] || 0) + fighter.damage
              nextCooldownMs = 1000 / fighter.attackRate
            }

            return {
              ...fighter,
              cooldownMs: nextCooldownMs
            }
          }

          const nextDistance = fighter.distance + (fighter.speed * deltaMs) / 1000

          if (nextDistance >= reversePathTotalLength) {
            if (state.selectedFighterId === fighter.id) {
              state.selectedFighterId = ''
            }

            return null
          }

          return {
            ...fighter,
            cooldownMs: nextCooldownMs,
            distance: nextDistance,
            pos: getPointAtDistance(reversePath, nextDistance)
          }
        })
        .filter(Boolean)

      let escapedCount = 0

      state.enemies = state.enemies
        .map((enemy) => {
          let nextCooldownMs = enemy.cooldownMs - deltaMs

          if (nextCooldownMs < 0) {
            nextCooldownMs = 0
          }

          const target = findNearestTargetForEnemy(enemy, state)

          if (target) {
            if (nextCooldownMs === 0) {
              if (target.type === 'barricade') {
                damageToBarricades[target.id] = (damageToBarricades[target.id] || 0) + enemy.attackDamage
              }

              if (target.type === 'fighter') {
                damageToFighters[target.id] = (damageToFighters[target.id] || 0) + enemy.attackDamage
              }

              if (target.type === 'tower') {
                damageToTowers[target.id] = (damageToTowers[target.id] || 0) + enemy.attackDamage
              }

              nextCooldownMs = 1000 / enemy.attackRate
            }

            return {
              ...enemy,
              cooldownMs: nextCooldownMs
            }
          }

          const nextDistance = enemy.distance + (enemySpeed * deltaMs) / 1000

          if (nextDistance >= pathTotalLength) {
            escapedCount += 1
            return null
          }

          return {
            ...enemy,
            cooldownMs: nextCooldownMs,
            distance: nextDistance,
            pos: getPointAtDistance(levelPath, nextDistance)
          }
        })
        .filter(Boolean)

      if (escapedCount > 0) {
        state.baseHp = Math.max(0, state.baseHp - escapedCount)
      }

      applyDamageToEntities(state, damageToEnemies, damageToTowers, damageToFighters, damageToBarricades)

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
      state.level = payload.level
      state.slots = payload.slots
      state.barricadeSlots = payload.barricadeSlots
      state.towersById = payload.towersById
      state.barricadesById = payload.barricadesById
      state.enemies = payload.enemies
      state.fighters = payload.fighters
      state.buildMode = payload.buildMode
      state.barricadeMode = payload.barricadeMode
      state.artilleryMode = payload.artilleryMode
      state.selectedTowerId = payload.selectedTowerId
      state.selectedEnemyId = payload.selectedEnemyId
      state.selectedFighterId = payload.selectedFighterId
      state.selectedBarricadeId = payload.selectedBarricadeId
      state.towerIndex = payload.towerIndex
      state.enemyIndex = payload.enemyIndex
      state.fighterIndex = payload.fighterIndex
      state.barricadeIndex = payload.barricadeIndex
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
      commit(MUTATION_TYPES.SET_BARRICADE_MODE, false)
      commit(MUTATION_TYPES.SET_ARTILLERY_MODE, false)
      commit(MUTATION_TYPES.SET_SELECTED_TOWER_ID, '')
      commit(MUTATION_TYPES.SET_SELECTED_ENEMY_ID, '')
      commit(MUTATION_TYPES.SET_SELECTED_FIGHTER_ID, '')
      commit(MUTATION_TYPES.SET_SELECTED_BARRICADE_ID, '')
    },

    [ACTION_TYPES.TOGGLE_BARRICADE_MODE] ({ commit, state }) {
      const nextValue = !state.barricadeMode

      commit(MUTATION_TYPES.SET_BARRICADE_MODE, nextValue)
      commit(MUTATION_TYPES.SET_BUILD_MODE, null)
      commit(MUTATION_TYPES.SET_ARTILLERY_MODE, false)
      commit(MUTATION_TYPES.SET_SELECTED_TOWER_ID, '')
      commit(MUTATION_TYPES.SET_SELECTED_ENEMY_ID, '')
      commit(MUTATION_TYPES.SET_SELECTED_FIGHTER_ID, '')
      commit(MUTATION_TYPES.SET_SELECTED_BARRICADE_ID, '')
    },

    [ACTION_TYPES.TOGGLE_ARTILLERY_MODE] ({ commit, state }) {
      const nextValue = !state.artilleryMode

      commit(MUTATION_TYPES.SET_ARTILLERY_MODE, nextValue)
      commit(MUTATION_TYPES.SET_BUILD_MODE, null)
      commit(MUTATION_TYPES.SET_BARRICADE_MODE, false)
      commit(MUTATION_TYPES.SET_SELECTED_TOWER_ID, '')
      commit(MUTATION_TYPES.SET_SELECTED_ENEMY_ID, '')
      commit(MUTATION_TYPES.SET_SELECTED_FIGHTER_ID, '')
      commit(MUTATION_TYPES.SET_SELECTED_BARRICADE_ID, '')
    },

    [ACTION_TYPES.SLOT_CLICK] ({ commit, state }, slotId) {
      const slot = state.slots.find((item) => item.id === slotId)

      if (!slot) {
        return
      }

      if (slot.towerId) {
        commit(MUTATION_TYPES.SET_SELECTED_TOWER_ID, slot.towerId)
        commit(MUTATION_TYPES.SET_SELECTED_ENEMY_ID, '')
        commit(MUTATION_TYPES.SET_SELECTED_FIGHTER_ID, '')
        commit(MUTATION_TYPES.SET_SELECTED_BARRICADE_ID, '')
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
      commit(MUTATION_TYPES.SET_SELECTED_FIGHTER_ID, '')
      commit(MUTATION_TYPES.SET_SELECTED_BARRICADE_ID, '')
    },

    [ACTION_TYPES.BARRICADE_SLOT_CLICK] ({ commit, state }, slotId) {
      const slot = state.barricadeSlots.find((item) => item.id === slotId)

      if (!slot) {
        return
      }

      if (slot.barricadeId) {
        commit(MUTATION_TYPES.SET_SELECTED_BARRICADE_ID, slot.barricadeId)
        commit(MUTATION_TYPES.SET_SELECTED_TOWER_ID, '')
        commit(MUTATION_TYPES.SET_SELECTED_ENEMY_ID, '')
        commit(MUTATION_TYPES.SET_SELECTED_FIGHTER_ID, '')
        return
      }

      if (!state.barricadeMode) {
        commit(MUTATION_TYPES.SET_SELECTED_BARRICADE_ID, '')
        return
      }

      if (state.gold < BARRICADE_CONFIG.BASIC.price) {
        return
      }

      commit(MUTATION_TYPES.SET_GOLD, state.gold - BARRICADE_CONFIG.BASIC.price)
      commit(MUTATION_TYPES.BUILD_BARRICADE, slotId)
      commit(MUTATION_TYPES.SET_SELECTED_TOWER_ID, '')
      commit(MUTATION_TYPES.SET_SELECTED_ENEMY_ID, '')
      commit(MUTATION_TYPES.SET_SELECTED_FIGHTER_ID, '')
    },

    [ACTION_TYPES.TOWER_CLICK] ({ commit }, towerId) {
      commit(MUTATION_TYPES.SET_SELECTED_TOWER_ID, towerId)
      commit(MUTATION_TYPES.SET_SELECTED_ENEMY_ID, '')
      commit(MUTATION_TYPES.SET_SELECTED_FIGHTER_ID, '')
      commit(MUTATION_TYPES.SET_SELECTED_BARRICADE_ID, '')
    },

    [ACTION_TYPES.ENEMY_CLICK] ({ commit }, enemyId) {
      commit(MUTATION_TYPES.SET_SELECTED_ENEMY_ID, enemyId)
      commit(MUTATION_TYPES.SET_SELECTED_TOWER_ID, '')
      commit(MUTATION_TYPES.SET_SELECTED_FIGHTER_ID, '')
      commit(MUTATION_TYPES.SET_SELECTED_BARRICADE_ID, '')
    },

    [ACTION_TYPES.FIGHTER_CLICK] ({ commit }, fighterId) {
      commit(MUTATION_TYPES.SET_SELECTED_FIGHTER_ID, fighterId)
      commit(MUTATION_TYPES.SET_SELECTED_TOWER_ID, '')
      commit(MUTATION_TYPES.SET_SELECTED_ENEMY_ID, '')
      commit(MUTATION_TYPES.SET_SELECTED_BARRICADE_ID, '')
    },

    [ACTION_TYPES.BARRICADE_CLICK] ({ commit }, barricadeId) {
      commit(MUTATION_TYPES.SET_SELECTED_BARRICADE_ID, barricadeId)
      commit(MUTATION_TYPES.SET_SELECTED_TOWER_ID, '')
      commit(MUTATION_TYPES.SET_SELECTED_ENEMY_ID, '')
      commit(MUTATION_TYPES.SET_SELECTED_FIGHTER_ID, '')
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
      commit(MUTATION_TYPES.SET_SELECTED_FIGHTER_ID, '')
      commit(MUTATION_TYPES.SET_SELECTED_BARRICADE_ID, '')
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

    [ACTION_TYPES.REMOVE_BARRICADE] ({ commit, state }, barricadeId) {
      const barricade = state.barricadesById[barricadeId]

      if (!barricade) {
        return
      }

      commit(MUTATION_TYPES.SET_GOLD, state.gold + BARRICADE_CONFIG.BASIC.refund)
      commit(MUTATION_TYPES.REMOVE_BARRICADE, barricadeId)
    },

    [ACTION_TYPES.SPAWN_FIGHTER] ({ commit, state }) {
      const config = FIGHTER_CONFIG[FIGHTER_TYPES.GUARD]

      if (!config) {
        return
      }

      if (state.gold < config.price) {
        return
      }

      commit(MUTATION_TYPES.SET_GOLD, state.gold - config.price)
      commit(MUTATION_TYPES.SPAWN_FIGHTER)
      commit(MUTATION_TYPES.SET_SELECTED_TOWER_ID, '')
      commit(MUTATION_TYPES.SET_SELECTED_ENEMY_ID, '')
      commit(MUTATION_TYPES.SET_SELECTED_BARRICADE_ID, '')
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

    [ACTION_TYPES.CANVAS_CLICK] ({ commit, state }, point) {
      if (!state.artilleryMode) {
        return
      }

      if (state.gold < ARTILLERY_CONFIG.price) {
        return
      }

      commit(MUTATION_TYPES.SET_GOLD, state.gold - ARTILLERY_CONFIG.price)
      commit(MUTATION_TYPES.APPLY_ARTILLERY, { point })
    },

    [ACTION_TYPES.TICK] ({ commit, state }, deltaMs) {
      if (!state.isRunning) {
        return
      }

      commit(MUTATION_TYPES.APPLY_TICK, deltaMs)
    }
  }
}