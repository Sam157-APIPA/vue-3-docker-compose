<template>
  <div class="game-canvas">
    <svg
        ref="svgRef"
        class="game-canvas__svg"
        :style="{ width: `${level.size.w}px`, maxWidth: '100%' }"
        :viewBox="`0 0 ${level.size.w} ${level.size.h}`"
        @click="(event) => onCanvasClick(event)"
    >
      <rect
          class="game-canvas__background"
          x="0"
          y="0"
          :width="level.size.w"
          :height="level.size.h"
          fill="#0b1220"
      />

      <polyline
          v-if="pathPoints"
          class="game-canvas__path-back"
          :points="pathPoints"
          fill="none"
          stroke="#334155"
          stroke-width="12"
          stroke-linecap="round"
          stroke-linejoin="round"
          opacity="0.9"
      />

      <polyline
          v-if="pathPoints"
          class="game-canvas__path-front"
          :points="pathPoints"
          fill="none"
          stroke="#111827"
          stroke-width="5"
          stroke-linecap="round"
          stroke-linejoin="round"
          opacity="0.65"
      />

      <circle
          v-if="level.enemySpawn"
          class="game-canvas__spawn-point"
          :cx="level.enemySpawn.x"
          :cy="level.enemySpawn.y"
          r="8"
          fill="#22c55e"
      />

      <circle
          v-if="finishPoint"
          class="game-canvas__finish-point"
          :cx="finishPoint.x"
          :cy="finishPoint.y"
          r="8"
          fill="#ef4444"
      />

      <g
          v-for="slot in barricadeSlots"
          :key="slot.id"
          class="game-canvas__barricade-slot-group"
      >
        <rect
            v-if="!slot.barricadeId"
            class="game-canvas__barricade-slot game-canvas__barricade-slot--clickable"
            :x="slot.pos.x - 15"
            :y="slot.pos.y - 15"
            width="30"
            height="30"
            rx="6"
            fill="rgba(245, 158, 11, 0.14)"
            stroke="#f59e0b"
            stroke-width="2"
            @click.stop="() => emitBarricadeSlotClick(slot.id)"
        />

        <g
            v-if="slot.barricadeId && barricadesById[slot.barricadeId]"
            class="game-canvas__barricade-group game-canvas__barricade-group--clickable"
            @click.stop="() => emitBarricadeClick(slot.barricadeId)"
        >
          <rect
              class="game-canvas__barricade-body"
              :x="slot.pos.x - 18"
              :y="slot.pos.y - 18"
              width="36"
              height="36"
              rx="8"
              :fill="slot.barricadeId === selectedBarricadeId ? '#b45309' : '#92400e'"
              stroke="#fbbf24"
              stroke-width="2"
          />
          <text
              class="game-canvas__barricade-hp-label"
              :x="slot.pos.x"
              :y="slot.pos.y - 24"
              text-anchor="middle"
              font-size="11"
              fill="#ffffff"
          >
            {{ Math.round(barricadesById[slot.barricadeId].hp) }}
          </text>
        </g>
      </g>

      <g
          v-for="slot in slots"
          :key="slot.id"
          class="game-canvas__slot-group"
      >
        <circle
            class="game-canvas__slot-circle game-canvas__slot-circle--clickable"
            :cx="slot.pos.x"
            :cy="slot.pos.y"
            r="14"
            :fill="slot.towerId ? '#111827' : '#0f172a'"
            stroke="#94a3b8"
            stroke-width="2"
            opacity="0.95"
            @click.stop="() => emitSlotClick(slot.id)"
        />

        <g
            v-if="slot.towerId && towersById[slot.towerId]"
            class="game-canvas__tower-group game-canvas__tower-group--clickable"
            @click.stop="() => emitTowerClick(slot.towerId)"
        >
          <circle
              class="game-canvas__tower-circle"
              :cx="slot.pos.x"
              :cy="slot.pos.y"
              r="10"
              :fill="towerColor(towersById[slot.towerId].type)"
              :stroke="slot.towerId === selectedTowerId ? '#22d3ee' : '#ffffff'"
              :stroke-width="slot.towerId === selectedTowerId ? 3 : 2"
          />

          <text
              class="game-canvas__tower-level-label"
              :x="slot.pos.x"
              :y="slot.pos.y + 4"
              text-anchor="middle"
              font-size="10"
              fill="#e5e7eb"
          >
            {{ towersById[slot.towerId].level }}
          </text>

          <text
              class="game-canvas__tower-hp-label"
              :x="slot.pos.x"
              :y="slot.pos.y - 14"
              text-anchor="middle"
              font-size="11"
              fill="#ffffff"
          >
            {{ Math.round(towersById[slot.towerId].hp) }}
          </text>
        </g>
      </g>

      <g v-if="rangeCircle" class="game-canvas__range-group">
        <circle
            class="game-canvas__range-fill"
            :cx="rangeCircle.x"
            :cy="rangeCircle.y"
            :r="rangeCircle.r"
            fill="#60a5fa"
            opacity="0.12"
        />
        <circle
            class="game-canvas__range-stroke"
            :cx="rangeCircle.x"
            :cy="rangeCircle.y"
            :r="rangeCircle.r"
            fill="none"
            stroke="#60a5fa"
            stroke-width="2"
            opacity="0.45"
            stroke-dasharray="6 6"
        />
      </g>

      <g
          v-for="fighter in fighters"
          :key="fighter.id"
          class="game-canvas__fighter-group game-canvas__fighter-group--clickable"
          @click.stop="() => emitFighterClick(fighter.id)"
      >
        <polygon
            class="game-canvas__fighter-shape"
            :points="fighterPoints(fighter.pos.x, fighter.pos.y)"
            :fill="fighter.color"
            :stroke="fighter.id === selectedFighterId ? '#22d3ee' : '#ffffff'"
            :stroke-width="fighter.id === selectedFighterId ? 3 : 2"
        />
        <text
            class="game-canvas__fighter-hp-label"
            :x="fighter.pos.x"
            :y="fighter.pos.y - 16"
            text-anchor="middle"
            font-size="11"
            fill="#ffffff"
        >
          {{ Math.round(fighter.hp) }}
        </text>
      </g>

      <g
          v-for="enemy in enemies"
          :key="enemy.id"
          class="game-canvas__enemy-group game-canvas__enemy-group--clickable"
          @click.stop="() => emitEnemyClick(enemy.id)"
      >
        <circle
            class="game-canvas__enemy-circle"
            :cx="enemy.pos.x"
            :cy="enemy.pos.y"
            r="10"
            :fill="enemy.color || '#ef4444'"
            :stroke="enemy.id === selectedEnemyId ? '#22d3ee' : '#ffffff'"
            :stroke-width="enemy.id === selectedEnemyId ? 3 : 2"
        />

        <text
            class="game-canvas__enemy-hp-label"
            :x="enemy.pos.x"
            :y="enemy.pos.y - 14"
            text-anchor="middle"
            font-size="11"
            fill="#ffffff"
        >
          {{ Math.round(enemy.hp) }}
        </text>

        <circle
            v-if="enemy.isRanged"
            class="game-canvas__enemy-range-mark"
            :cx="enemy.pos.x + 10"
            :cy="enemy.pos.y - 10"
            r="4"
            fill="#111827"
            stroke="#ffffff"
            stroke-width="1.5"
        />
      </g>

      <circle
          v-if="artilleryMode"
          class="game-canvas__artillery-preview"
          cx="60"
          cy="60"
          r="18"
          fill="rgba(239, 68, 68, 0.2)"
          stroke="#ef4444"
          stroke-width="2"
      />

      <text
          class="game-canvas__helper-text"
          x="12"
          y="24"
          font-size="12"
          fill="#94a3b8"
      >
        Green point is spawn. Red point is finish. Empty orange slot is for barricade.
      </text>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'GameCanvas',

  props: {
    level: {
      type: Object,
      required: true
    },
    slots: {
      type: Array,
      required: true
    },
    barricadeSlots: {
      type: Array,
      required: true
    },
    towersById: {
      type: Object,
      required: true
    },
    barricadesById: {
      type: Object,
      required: true
    },
    enemies: {
      type: Array,
      required: true
    },
    fighters: {
      type: Array,
      required: true
    },
    selectedTowerId: {
      type: String,
      default: ''
    },
    selectedEnemyId: {
      type: String,
      default: ''
    },
    selectedFighterId: {
      type: String,
      default: ''
    },
    selectedBarricadeId: {
      type: String,
      default: ''
    },
    getTowerStats: {
      type: Function,
      required: true
    },
    artilleryMode: {
      type: Boolean,
      required: true
    }
  },

  emits: [
    'slot-click',
    'barricade-slot-click',
    'tower-click',
    'enemy-click',
    'fighter-click',
    'barricade-click',
    'canvas-click'
  ],

  computed: {
    pathPoints () {
      const points = this.level.path || []

      if (!points.length) {
        return ''
      }

      return points.map((point) => `${point.x},${point.y}`).join(' ')
    },

    finishPoint () {
      const points = this.level.path || []

      if (!points.length) {
        return null
      }

      return points[points.length - 1]
    },

    rangeCircle () {
      const towerId = this.selectedTowerId

      if (!towerId) {
        return null
      }

      const slot = this.slots.find((item) => item.towerId === towerId)
      const tower = this.towersById[towerId]

      if (!slot || !tower) {
        return null
      }

      const stats = this.getTowerStats(tower.type, tower.level)
      const radius = stats ? stats.range : 90

      return {
        x: slot.pos.x,
        y: slot.pos.y,
        r: radius
      }
    }
  },

  methods: {
    emitSlotClick (slotId) {
      this.$emit('slot-click', slotId)
    },

    emitBarricadeSlotClick (slotId) {
      this.$emit('barricade-slot-click', slotId)
    },

    emitTowerClick (towerId) {
      this.$emit('tower-click', towerId)
    },

    emitEnemyClick (enemyId) {
      this.$emit('enemy-click', enemyId)
    },

    emitFighterClick (fighterId) {
      this.$emit('fighter-click', fighterId)
    },

    emitBarricadeClick (barricadeId) {
      this.$emit('barricade-click', barricadeId)
    },

    towerColor (type) {
      if (type === 'sniper') {
        return '#22c55e'
      }

      if (type === 'rapid') {
        return '#a78bfa'
      }

      return '#60a5fa'
    },

    fighterPoints (x, y) {
      return `${x},${y - 11} ${x + 11},${y} ${x},${y + 11} ${x - 11},${y}`
    },

    getSvgPoint (event) {
      const svg = this.$refs.svgRef

      if (!svg) {
        return {
          x: 0,
          y: 0
        }
      }

      const rect = svg.getBoundingClientRect()
      const viewWidth = this.level.size.w
      const viewHeight = this.level.size.h

      return {
        x: Math.round(((event.clientX - rect.left) / rect.width) * viewWidth),
        y: Math.round(((event.clientY - rect.top) / rect.height) * viewHeight)
      }
    },

    onCanvasClick (event) {
      const point = this.getSvgPoint(event)

      this.$emit('canvas-click', point)
    }
  }
}
</script>

<style scoped lang="scss">
.game-canvas {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  overflow-x: auto;
  overflow-y: hidden;
  background: #0b1220;

  &__svg {
    display: block;
    height: auto;
  }

  &__slot-circle--clickable,
  &__tower-group--clickable,
  &__enemy-group--clickable,
  &__fighter-group--clickable,
  &__barricade-group--clickable,
  &__barricade-slot--clickable {
    cursor: pointer;
  }

  &__tower-level-label,
  &__tower-hp-label,
  &__enemy-hp-label,
  &__fighter-hp-label,
  &__barricade-hp-label,
  &__helper-text {
    user-select: none;
    pointer-events: none;
  }
}
</style>