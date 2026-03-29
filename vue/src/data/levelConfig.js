import { ENEMY_TYPES, LEVEL_KEYS } from '@/constants/gameConstants'

export const levelConfig = {
  [LEVEL_KEYS.FIRST]: {
    id: LEVEL_KEYS.FIRST,
    title: 'First Level',
    startGold: 320,
    baseHp: 3,
    enemySpeed: 95,
    size: {
      w: 900,
      h: 520
    },
    enemySpawn: {
      x: 90,
      y: 260
    },
    path: [
      { x: 90, y: 260 },
      { x: 300, y: 260 },
      { x: 300, y: 120 },
      { x: 700, y: 120 },
      { x: 700, y: 400 }
    ],
    slots: [
      {
        id: 'slotA',
        pos: { x: 200, y: 180 }
      },
      {
        id: 'slotB',
        pos: { x: 400, y: 300 }
      },
      {
        id: 'slotC',
        pos: { x: 600, y: 200 }
      }
    ],
    barricadeSlots: [
      {
        id: 'roadA',
        pos: { x: 220, y: 260 }
      },
      {
        id: 'roadB',
        pos: { x: 520, y: 120 }
      }
    ],
    waves: [
      {
        id: 'wave1',
        spawns: [
          { type: ENEMY_TYPES.BASIC, delayMs: 0 },
          { type: ENEMY_TYPES.BASIC, delayMs: 900 },
          { type: ENEMY_TYPES.SWARM, delayMs: 1700 },
          { type: ENEMY_TYPES.RANGED_1, delayMs: 2600 }
        ]
      },
      {
        id: 'wave2',
        spawns: [
          { type: ENEMY_TYPES.BASIC, delayMs: 0 },
          { type: ENEMY_TYPES.RANGED_1, delayMs: 800 },
          { type: ENEMY_TYPES.SWARM, delayMs: 1300 },
          { type: ENEMY_TYPES.SWARM, delayMs: 1700 },
          { type: ENEMY_TYPES.TANK, delayMs: 2800 }
        ]
      },
      {
        id: 'wave3',
        spawns: [
          { type: ENEMY_TYPES.RANGED_2, delayMs: 0 },
          { type: ENEMY_TYPES.BASIC, delayMs: 700 },
          { type: ENEMY_TYPES.TANK, delayMs: 1500 },
          { type: ENEMY_TYPES.RANGED_1, delayMs: 2200 },
          { type: ENEMY_TYPES.SWARM, delayMs: 2600 },
          { type: ENEMY_TYPES.RANGED_2, delayMs: 3600 }
        ]
      }
    ]
  },

  [LEVEL_KEYS.SECOND]: {
    id: LEVEL_KEYS.SECOND,
    title: 'Second Level',
    startGold: 360,
    baseHp: 4,
    enemySpeed: 95,
    size: {
      w: 900,
      h: 520
    },
    enemySpawn: {
      x: 100,
      y: 100
    },
    path: [
      { x: 100, y: 100 },
      { x: 800, y: 100 },
      { x: 800, y: 400 },
      { x: 200, y: 400 }
    ],
    slots: [
      {
        id: 'slot1',
        pos: { x: 300, y: 200 }
      },
      {
        id: 'slot2',
        pos: { x: 500, y: 300 }
      },
      {
        id: 'slot3',
        pos: { x: 650, y: 180 }
      },
      {
        id: 'slot4',
        pos: { x: 250, y: 350 }
      }
    ],
    barricadeSlots: [
      {
        id: 'road1',
        pos: { x: 420, y: 100 }
      },
      {
        id: 'road2',
        pos: { x: 800, y: 250 }
      },
      {
        id: 'road3',
        pos: { x: 520, y: 400 }
      }
    ],
    waves: [
      {
        id: 'wave1',
        spawns: [
          { type: ENEMY_TYPES.BASIC, delayMs: 0 },
          { type: ENEMY_TYPES.RANGED_1, delayMs: 700 },
          { type: ENEMY_TYPES.SWARM, delayMs: 1300 },
          { type: ENEMY_TYPES.BASIC, delayMs: 2200 },
          { type: ENEMY_TYPES.RANGED_1, delayMs: 3000 }
        ]
      },
      {
        id: 'wave2',
        spawns: [
          { type: ENEMY_TYPES.TANK, delayMs: 0 },
          { type: ENEMY_TYPES.RANGED_1, delayMs: 900 },
          { type: ENEMY_TYPES.SWARM, delayMs: 1500 },
          { type: ENEMY_TYPES.SWARM, delayMs: 1900 },
          { type: ENEMY_TYPES.RANGED_2, delayMs: 2900 },
          { type: ENEMY_TYPES.TANK, delayMs: 3900 }
        ]
      },
      {
        id: 'wave3',
        spawns: [
          { type: ENEMY_TYPES.RANGED_2, delayMs: 0 },
          { type: ENEMY_TYPES.TANK, delayMs: 800 },
          { type: ENEMY_TYPES.BASIC, delayMs: 1500 },
          { type: ENEMY_TYPES.RANGED_2, delayMs: 2200 },
          { type: ENEMY_TYPES.SWARM, delayMs: 2600 },
          { type: ENEMY_TYPES.SWARM, delayMs: 3000 },
          { type: ENEMY_TYPES.TANK, delayMs: 4200 }
        ]
      }
    ]
  }
}