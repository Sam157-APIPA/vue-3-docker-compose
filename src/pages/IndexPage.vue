<template>
  <div class="page">
    <h1 class="title">Home</h1>

    <div class="grid">
      <RouterLink class="card" :to="{ name: $routes.LEVELS }">
        <div class="card__title">Tower Defense</div>
        <div class="card__text">Open levels and start the game</div>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
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
  display: block;
  text-decoration: none;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px;
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
}
</style>