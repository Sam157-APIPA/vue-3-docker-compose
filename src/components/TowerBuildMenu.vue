<template>
  <div class="panel">
    <div class="title">Build menu</div>
    <div class="muted">Choose tower type and click an empty slot</div>

    <div class="coins">
      Coins: <b>{{ coins }}</b>
    </div>

    <div class="list">
      <button
          v-for="type in towerTypes"
          :key="type"
          class="btn"
          :class="{
          active: type === selectedType,
          disabled: coins < getBuildCost(type)
        }"
          @click="emit('select-type', type)"
      >
        {{ type }} ({{ getBuildCost(type) }})
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  towerTypes: Array,
  selectedType: String,
  coins: Number,
  getBuildCost: Function
})

const emit = defineEmits(['select-type'])
</script>

<style scoped>
.panel {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px;
}

.title {
  font-weight: 800;
  margin-bottom: 6px;
}

.muted {
  color: var(--muted);
  font-size: 14px;
}

.coins {
  margin-top: 8px;
  font-size: 14px;
}

.list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  padding: 8px 10px;
  border: 1px solid var(--border);
  background: var(--panel);
  border-radius: 10px;
  cursor: pointer;
}

.btn:hover {
  background: var(--soft);
}

.active {
  border-color: var(--accent-border);
  background: var(--accent-bg);
}

.disabled {
  opacity: 0.55;
}
</style>