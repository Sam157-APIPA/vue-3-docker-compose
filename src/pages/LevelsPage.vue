<template>
  <div class="page">
    <h1 class="title">Levels</h1>

    <div class="grid">
      <button
          v-for="level in levels"
          :key="level.id"
          class="card"
          @click="open(level.id)"
      >
        <div class="card__title">{{ level.name }}</div>
        <div class="card__text">Path points: {{ level.path.length }}</div>
        <div class="card__text">Tower slots: {{ level.slots.length }}</div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

const levels = computed(() => store.getters['td/getLevels'])

function open(id) {
  store.dispatch('td/openLevel', id)
  router.push(`/level/${id}`)
}
</script>

<style scoped>
.page {
  max-width: 1100px;
  margin: 0 auto;
}

.title {
  margin: 0 0 12px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.card {
  text-align: left;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px;
  cursor: pointer;
}

.card:hover {
  background: var(--soft);
}

.card__title {
  font-weight: 800;
  margin-bottom: 6px;
}

.card__text {
  color: var(--muted);
  font-size: 14px;
  margin-top: 2px;
}
</style>