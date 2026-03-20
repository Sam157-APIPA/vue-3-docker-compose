export const LEVELS = [
  {
    id: 'level-1',
    name: 'Level 1: Simple bend',
    size: { w: 900, h: 520 },
    enemySpawn: { x: 90, y: 260 },
    path: [
      { x: 60, y: 260 },
      { x: 300, y: 260 },
      { x: 300, y: 120 },
      { x: 700, y: 120 },
      { x: 700, y: 420 },
      { x: 860, y: 420 }
    ],
    slots: [
      { id: 's1', pos: { x: 200, y: 180 } },
      { id: 's2', pos: { x: 420, y: 120 } },
      { id: 's3', pos: { x: 520, y: 200 } },
      { id: 's4', pos: { x: 640, y: 320 } },
      { id: 's5', pos: { x: 760, y: 420 } }
    ]
  },
  {
    id: 'level-2',
    name: 'Level 2: Zigzag',
    size: { w: 900, h: 520 },
    enemySpawn: { x: 100, y: 420 },
    path: [
      { x: 80, y: 420 },
      { x: 220, y: 420 },
      { x: 220, y: 120 },
      { x: 420, y: 120 },
      { x: 420, y: 420 },
      { x: 620, y: 420 },
      { x: 620, y: 200 },
      { x: 820, y: 200 }
    ],
    slots: [
      { id: 's1', pos: { x: 150, y: 260 } },
      { id: 's2', pos: { x: 320, y: 120 } },
      { id: 's3', pos: { x: 520, y: 420 } },
      { id: 's4', pos: { x: 720, y: 200 } }
    ]
  }
]