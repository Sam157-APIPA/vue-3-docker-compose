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
  SWARM: 'swarm',
  RANGED_1: 'rangedLevel1',
  RANGED_2: 'rangedLevel2'
}

export const FIGHTER_TYPES = {
  GUARD: 'guard'
}

export const MUTATION_TYPES = {
  SET_LEVEL: 'SET_LEVEL',
  SET_BUILD_MODE: 'SET_BUILD_MODE',
  SET_BARRICADE_MODE: 'SET_BARRICADE_MODE',
  SET_ARTILLERY_MODE: 'SET_ARTILLERY_MODE',
  SET_SELECTED_TOWER_ID: 'SET_SELECTED_TOWER_ID',
  SET_SELECTED_ENEMY_ID: 'SET_SELECTED_ENEMY_ID',
  SET_SELECTED_FIGHTER_ID: 'SET_SELECTED_FIGHTER_ID',
  SET_SELECTED_BARRICADE_ID: 'SET_SELECTED_BARRICADE_ID',
  SET_GOLD: 'SET_GOLD',
  BUILD_TOWER: 'BUILD_TOWER',
  UPGRADE_TOWER: 'UPGRADE_TOWER',
  REMOVE_TOWER: 'REMOVE_TOWER',
  BUILD_BARRICADE: 'BUILD_BARRICADE',
  REMOVE_BARRICADE: 'REMOVE_BARRICADE',
  SPAWN_FIGHTER: 'SPAWN_FIGHTER',
  START_WAVE: 'START_WAVE',
  TOGGLE_PAUSE: 'TOGGLE_PAUSE',
  APPLY_ARTILLERY: 'APPLY_ARTILLERY',
  APPLY_TICK: 'APPLY_TICK',
  RESET_LEVEL: 'RESET_LEVEL'
}

export const ACTION_TYPES = {
  INIT_LEVEL: 'initLevel',
  RESET_LEVEL: 'resetLevel',
  TOGGLE_BUILD_MODE: 'toggleBuildMode',
  TOGGLE_BARRICADE_MODE: 'toggleBarricadeMode',
  TOGGLE_ARTILLERY_MODE: 'toggleArtilleryMode',
  SLOT_CLICK: 'slotClick',
  BARRICADE_SLOT_CLICK: 'barricadeSlotClick',
  TOWER_CLICK: 'towerClick',
  ENEMY_CLICK: 'enemyClick',
  FIGHTER_CLICK: 'fighterClick',
  BARRICADE_CLICK: 'barricadeClick',
  BUILD_TOWER: 'buildTower',
  UPGRADE_TOWER: 'upgradeTower',
  REMOVE_TOWER: 'removeTower',
  REMOVE_BARRICADE: 'removeBarricade',
  SPAWN_FIGHTER: 'spawnFighter',
  START_WAVE: 'startWave',
  TOGGLE_PAUSE: 'togglePause',
  CANVAS_CLICK: 'canvasClick',
  TICK: 'tick'
}

export const TOWER_CONFIG = {
  [TOWER_TYPES.BASIC]: {
    title: 'Basic',
    price: 100,
    refund: 50,
    levels: {
      1: {
        hp: 120,
        damage: 12,
        range: 90,
        fireRate: 1
      },
      2: {
        hp: 150,
        damage: 18,
        range: 105,
        fireRate: 1.1
      },
      3: {
        hp: 180,
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
        hp: 100,
        damage: 28,
        range: 165,
        fireRate: 0.65
      },
      2: {
        hp: 125,
        damage: 40,
        range: 185,
        fireRate: 0.75
      },
      3: {
        hp: 150,
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
        hp: 110,
        damage: 8,
        range: 80,
        fireRate: 2.2
      },
      2: {
        hp: 135,
        damage: 12,
        range: 92,
        fireRate: 2.5
      },
      3: {
        hp: 160,
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
    color: '#ef4444',
    isRanged: false,
    attackDamage: 14,
    attackRange: 28,
    attackRate: 0.8
  },

  [ENEMY_TYPES.TANK]: {
    title: 'Tank',
    hp: 190,
    reward: 80,
    color: '#f59e0b',
    isRanged: false,
    attackDamage: 20,
    attackRange: 30,
    attackRate: 0.7
  },

  [ENEMY_TYPES.SWARM]: {
    title: 'Swarm',
    hp: 60,
    reward: 30,
    color: '#ec4899',
    isRanged: false,
    attackDamage: 10,
    attackRange: 24,
    attackRate: 1.1
  },

  [ENEMY_TYPES.RANGED_1]: {
    title: 'Ranged 1',
    hp: 90,
    reward: 65,
    color: '#8b5cf6',
    isRanged: true,
    attackDamage: 12,
    attackRange: 110,
    attackRate: 1
  },

  [ENEMY_TYPES.RANGED_2]: {
    title: 'Ranged 2',
    hp: 130,
    reward: 95,
    color: '#06b6d4',
    isRanged: true,
    attackDamage: 20,
    attackRange: 145,
    attackRate: 1.15
  }
}

export const FIGHTER_CONFIG = {
  [FIGHTER_TYPES.GUARD]: {
    title: 'Guard',
    price: 90,
    hp: 120,
    damage: 18,
    range: 34,
    speed: 85,
    attackRate: 1.1,
    color: '#22c55e'
  }
}

export const BARRICADE_CONFIG = {
  BASIC: {
    title: 'Barricade',
    price: 80,
    refund: 30,
    hp: 180,
    color: '#a16207'
  }
}

export const ARTILLERY_CONFIG = {
  price: 140,
  radius: 120,
  maxDamage: 90
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