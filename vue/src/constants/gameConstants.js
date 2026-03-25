export const LEVEL_KEYS = {
  FIRST: 'firstLevel',
  SECOND: 'secondLevel'
}

export const TOWER_TYPES = {
  BASIC: 'basic',
  SNIPER: 'sniper',
  RAPID: 'rapid'
}

export const ENEMY_TYPES = {
  BASIC: 'basic',
  TANK: 'tank',
  SWARM: 'swarm'
}

export const MUTATION_TYPES = {
  SET_LEVEL: 'SET_LEVEL',
  SET_BUILD_MODE: 'SET_BUILD_MODE',
  SET_SELECTED_TOWER_ID: 'SET_SELECTED_TOWER_ID',
  SET_SELECTED_ENEMY_ID: 'SET_SELECTED_ENEMY_ID',
  SET_GOLD: 'SET_GOLD',
  BUILD_TOWER: 'BUILD_TOWER',
  UPGRADE_TOWER: 'UPGRADE_TOWER',
  REMOVE_TOWER: 'REMOVE_TOWER',
  START_WAVE: 'START_WAVE',
  TOGGLE_PAUSE: 'TOGGLE_PAUSE',
  APPLY_TICK: 'APPLY_TICK',
  RESET_LEVEL: 'RESET_LEVEL'
}

export const ACTION_TYPES = {
  INIT_LEVEL: 'initLevel',
  RESET_LEVEL: 'resetLevel',
  TOGGLE_BUILD_MODE: 'toggleBuildMode',
  SLOT_CLICK: 'slotClick',
  TOWER_CLICK: 'towerClick',
  ENEMY_CLICK: 'enemyClick',
  BUILD_TOWER: 'buildTower',
  UPGRADE_TOWER: 'upgradeTower',
  REMOVE_TOWER: 'removeTower',
  START_WAVE: 'startWave',
  TOGGLE_PAUSE: 'togglePause',
  TICK: 'tick'
}

export const TOWER_CONFIG = {
  [TOWER_TYPES.BASIC]: {
    title: 'Basic',
    price: 100,
    refund: 50,
    levels: {
      1: {
        damage: 12,
        range: 90,
        fireRate: 1
      },
      2: {
        damage: 18,
        range: 105,
        fireRate: 1.1
      },
      3: {
        damage: 26,
        range: 120,
        fireRate: 1.2
      }
    }
  },

  [TOWER_TYPES.SNIPER]: {
    title: 'Sniper',
    price: 140,
    refund: 70,
    levels: {
      1: {
        damage: 28,
        range: 165,
        fireRate: 0.65
      },
      2: {
        damage: 40,
        range: 185,
        fireRate: 0.75
      },
      3: {
        damage: 56,
        range: 205,
        fireRate: 0.85
      }
    }
  },

  [TOWER_TYPES.RAPID]: {
    title: 'Rapid',
    price: 120,
    refund: 60,
    levels: {
      1: {
        damage: 8,
        range: 80,
        fireRate: 2.2
      },
      2: {
        damage: 12,
        range: 92,
        fireRate: 2.5
      },
      3: {
        damage: 16,
        range: 108,
        fireRate: 2.8
      }
    }
  }
}

export const ENEMY_CONFIG = {
  [ENEMY_TYPES.BASIC]: {
    title: 'Basic',
    hp: 100,
    reward: 50,
    color: '#ef4444'
  },

  [ENEMY_TYPES.TANK]: {
    title: 'Tank',
    hp: 180,
    reward: 80,
    color: '#f59e0b'
  },

  [ENEMY_TYPES.SWARM]: {
    title: 'Swarm',
    hp: 60,
    reward: 30,
    color: '#ec4899'
  }
}

export const UPGRADE_PRICE_BY_LEVEL = {
  1: 70,
  2: 110
}

export const MAX_TOWER_LEVEL = 3
export const DEFAULT_LEVEL_GOLD = 300
export const DEFAULT_BASE_HP = 3
export const DEFAULT_ENEMY_SPEED = 90
export const GAME_TICK_MS = 50