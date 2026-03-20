<template>
  <div class="panel">
    <div class="title">Tower</div>

    <div class="row">id: <b>{{ tower.id }}</b></div>
    <div class="row">type: <b>{{ tower.type }}</b></div>
    <div class="row">level: <b>{{ tower.level }}</b></div>

    <template v-if="stats">
      <div class="separator"></div>
      <div class="row">damage: <b>{{ stats.damage }}</b></div>
      <div class="row">fire rate: <b>{{ stats.fireRate }}</b></div>
      <div class="row">range: <b>{{ stats.range }}</b></div>
      <div class="row">max hp: <b>{{ stats.maxHp }}</b></div>
    </template>

    <div class="separator"></div>
    <div class="row">
      Upgrade cost: <b>{{ upgradeCost }}</b>
    </div>
    <div class="row muted">
      Coins: {{ coins }}
    </div>

    <div class="actions">
      <button
          class="btn btn--accent"
          :disabled="!canUpgrade"
          @click="emit('upgrade')"
      >
        Upgrade
      </button>

      <button class="btn btn--danger" @click="emit('remove')">
        Remove
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  tower: Object,
  stats: Object,
  upgradeCost: Number,
  canUpgrade: Boolean,
  coins: Number
})

const emit = defineEmits(['upgrade', 'remove'])
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
  margin-bottom: 8px;
}

.row {
  margin-top: 6px;
  font-size: 14px;
}

.muted {
  color: var(--muted);
}

.separator {
  height: 1px;
  background: var(--border);
  margin-top: 10px;
  margin-bottom: 10px;
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.btn {
  padding: 8px 10px;
  border: 1px solid var(--border);
  background: var(--panel);
  border-radius: 10px;
  cursor: pointer;
}

.btn:hover {
  background: var(--soft);
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn--accent {
  border-color: var(--accent-border);
  background: var(--accent-bg);
}

.btn--danger {
  border-color: var(--danger-border);
  background: var(--danger-bg);
}
</style>