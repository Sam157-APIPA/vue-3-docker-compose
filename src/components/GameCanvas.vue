<template>
  <div class="frame">
    <svg
        ref="svgRef"
        class="svg"
        :style="{ width: `${level.size.w}px`, maxWidth: '100%' }"
        :viewBox="`0 0 ${level.size.w} ${level.size.h}`"
        @pointermove="handleCanvasPointerMove"
        @pointerup="handleCanvasPointerUp"
        @pointercancel="handleCanvasPointerUp"
        @mouseleave="handleCanvasPointerUp"
    >
      <rect
          x="0"
          y="0"
          :width="level.size.w"
          :height="level.size.h"
          fill="#0b1220"
      />

      <polyline
          v-if="pathPoints"
          :points="pathPoints"
          fill="none"
          stroke="#334155"
          stroke-width="10"
          stroke-linecap="round"
          stroke-linejoin="round"
          opacity="0.9"
      />

      <polyline
          v-if="pathPoints"
          :points="pathPoints"
          fill="none"
          stroke="#111827"
          stroke-width="4"
          stroke-linecap="round"
          stroke-linejoin="round"
          opacity="0.6"
      />

      <circle
          v-if="level.enemySpawn"
          :cx="level.enemySpawn.x"
          :cy="level.enemySpawn.y"
          r="8"
          fill="#22c55e"
      />

      <g v-for="slot in slots" :key="slot.id">
        <circle
            :cx="slot.pos.x"
            :cy="slot.pos.y"
            r="14"
            :fill="slot.towerId ? '#111827' : '#0f172a'"
            stroke="#94a3b8"
            stroke-width="2"
            opacity="0.95"
            class="clickable"
            @click.stop="emit('slot-click', slot.id)"
        />

        <g
            v-if="slot.towerId && towersById[slot.towerId]"
            class="clickable"
            @click.stop="emit('tower-click', slot.towerId)"
        >
          <circle
              :cx="slot.pos.x"
              :cy="slot.pos.y"
              r="10"
              :fill="towerColor(towersById[slot.towerId].type)"
          />

          <text
              :x="slot.pos.x"
              :y="slot.pos.y + 4"
              text-anchor="middle"
              font-size="10"
              fill="#e5e7eb"
              style="user-select: none"
          >
            {{ towersById[slot.towerId].level }}
          </text>
        </g>
      </g>

      <g v-if="rangeCircle">
        <circle
            :cx="rangeCircle.x"
            :cy="rangeCircle.y"
            :r="rangeCircle.r"
            fill="#60a5fa"
            opacity="0.12"
        />
        <circle
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
          v-for="enemy in enemies"
          :key="enemy.id"
          class="clickable"
          @pointerdown.stop="handleEnemyPointerDown(enemy.id, $event)"
      >
        <circle
            :cx="enemy.pos.x"
            :cy="enemy.pos.y"
            r="10"
            :fill="enemy.color || '#ef4444'"
            :stroke="enemy.id === selectedEnemyId ? '#22d3ee' : '#ffffff'"
            :stroke-width="enemy.id === selectedEnemyId ? 3 : 2"
        />

        <text
            :x="enemy.pos.x"
            :y="enemy.pos.y - 14"
            text-anchor="middle"
            font-size="11"
            fill="#ffffff"
            style="user-select: none; pointer-events: none"
        >
          {{ Math.round(enemy.hp) }}
        </text>
      </g>

      <text x="12" y="24" font-size="12" fill="#94a3b8">
        Green point is enemy test spawn. Towers attack enemies in range.
      </text>
    </svg>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  level: Object,
  slots: Array,
  towersById: Object,
  enemies: Array,
  selectedTowerId: String,
  selectedEnemyId: String,
  getTowerStats: Function
})

const emit = defineEmits([
  'slot-click',
  'tower-click',
  'enemy-pointer-down',
  'canvas-pointer-move',
  'canvas-pointer-up'
])

const svgRef = ref(null)

const pathPoints = computed(() => {
  const points = props.level?.path || []
  if (!points.length) return ''
  return points.map((point) => `${point.x},${point.y}`).join(' ')
})

const rangeCircle = computed(() => {
  const towerId = props.selectedTowerId
  if (!towerId) return null

  const slot = props.slots.find((item) => item.towerId === towerId)
  const tower = props.towersById[towerId]

  if (!slot || !tower) return null

  const stats = props.getTowerStats ? props.getTowerStats(tower.type, tower.level) : null
  const radius = stats ? stats.range : 90

  return {
    x: slot.pos.x,
    y: slot.pos.y,
    r: radius
  }
})

function towerColor(type) {
  if (type === 'sniper') return '#22c55e'
  if (type === 'rapid') return '#a78bfa'
  return '#60a5fa'
}

function getSvgPoint(event) {
  const svg = svgRef.value
  if (!svg) {
    return { x: 0, y: 0 }
  }

  const rect = svg.getBoundingClientRect()
  const viewWidth = props.level.size.w
  const viewHeight = props.level.size.h

  const x = ((event.clientX - rect.left) / rect.width) * viewWidth
  const y = ((event.clientY - rect.top) / rect.height) * viewHeight

  return {
    x: Math.round(x),
    y: Math.round(y)
  }
}

function handleEnemyPointerDown(enemyId, event) {
  if (event.button !== 0) return

  event.preventDefault()

  if (event.target?.setPointerCapture) {
    event.target.setPointerCapture(event.pointerId)
  }

  const point = getSvgPoint(event)

  emit('enemy-pointer-down', {
    enemyId,
    x: point.x,
    y: point.y
  })
}

function handleCanvasPointerMove(event) {
  const point = getSvgPoint(event)
  emit('canvas-pointer-move', point)
}

function handleCanvasPointerUp(event) {
  const point = getSvgPoint(event)
  emit('canvas-pointer-up', point)
}
</script>

<style scoped>
.frame {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow-x: auto;
  overflow-y: hidden;
  background: #0b1220;
}

.svg {
  height: auto;
  display: block;
  touch-action: none;
}

.clickable {
  cursor: pointer;
}
</style>