import { ENEMY_TYPES, LEVEL_KEYS } from '@/constants/gameConstants'

export const levelConfig = {
  [LEVEL_KEYS.FIRST]: {
    id: LEVEL_KEYS.FIRST,
    title: 'First Level',
    startGold: 300,
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
    waves: [
      {
        id: 'wave1',
        spawns: [
          { type: ENEMY_TYPES.BASIC, delayMs: 0 },
          { type: ENEMY_TYPES.BASIC, delayMs: 900 },
          { type: ENEMY_TYPES.BASIC, delayMs: 1800 },
          { type: ENEMY_TYPES.SWARM, delayMs: 2600 }
        ]
      },
      {
        id: 'wave2',
        spawns: [
          { type: ENEMY_TYPES.BASIC, delayMs: 0 },
          { type: ENEMY_TYPES.SWARM, delayMs: 600 },
          { type: ENEMY_TYPES.SWARM, delayMs: 1200 },
          { type: ENEMY_TYPES.BASIC, delayMs: 1900 },
          { type: ENEMY_TYPES.TANK, delayMs: 3000 }
        ]
      },
      {
        id: 'wave3',
        spawns: [
          { type: ENEMY_TYPES.TANK, delayMs: 0 },
          { type: ENEMY_TYPES.BASIC, delayMs: 700 },
          { type: ENEMY_TYPES.BASIC, delayMs: 1400 },
          { type: ENEMY_TYPES.SWARM, delayMs: 1900 },
          { type: ENEMY_TYPES.SWARM, delayMs: 2300 },
          { type: ENEMY_TYPES.TANK, delayMs: 3400 }
        ]
      }
    ]
  },

  [LEVEL_KEYS.SECOND]: {
    id: LEVEL_KEYS.SECOND,
    title: 'Second Level',
    startGold: 350,
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
    waves: [
      {
        id: 'wave1',
        spawns: [
          { type: ENEMY_TYPES.BASIC, delayMs: 0 },
          { type: ENEMY_TYPES.BASIC, delayMs: 700 },
          { type: ENEMY_TYPES.SWARM, delayMs: 1300 },
          { type: ENEMY_TYPES.SWARM, delayMs: 1700 },
          { type: ENEMY_TYPES.BASIC, delayMs: 2400 }
        ]
      },
      {
        id: 'wave2',
        spawns: [
          { type: ENEMY_TYPES.TANK, delayMs: 0 },
          { type: ENEMY_TYPES.BASIC, delayMs: 800 },
          { type: ENEMY_TYPES.BASIC, delayMs: 1500 },
          { type: ENEMY_TYPES.SWARM, delayMs: 2000 },
          { type: ENEMY_TYPES.SWARM, delayMs: 2400 },
          { type: ENEMY_TYPES.TANK, delayMs: 3400 }
        ]
      },
      {
        id: 'wave3',
        spawns: [
          { type: ENEMY_TYPES.TANK, delayMs: 0 },
          { type: ENEMY_TYPES.TANK, delayMs: 1100 },
          { type: ENEMY_TYPES.BASIC, delayMs: 1800 },
          { type: ENEMY_TYPES.SWARM, delayMs: 2200 },
          { type: ENEMY_TYPES.SWARM, delayMs: 2500 },
          { type: ENEMY_TYPES.BASIC, delayMs: 3100 },
          { type: ENEMY_TYPES.TANK, delayMs: 4200 }
        ]
      }
    ]
  }
}