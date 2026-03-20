<template>
  <div class="app">
    <header class="topbar">
      <div class="brand">TD Prototype</div>

      <nav class="nav">
        <RouterLink :to="{ name: $routes.INDEX }">Home</RouterLink>
        <RouterLink :to="{ name: $routes.LEVELS }">Levels</RouterLink>
      </nav>
    </header>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<style scoped>
.app {
  min-height: 100%;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--panel);
  border-bottom: 1px solid var(--border);
}

.brand {
  font-weight: 800;
}

.nav {
  display: flex;
  gap: 10px;
  font-size: 14px;
  color: var(--muted);
}

.nav a {
  text-decoration: none;
  padding: 6px 10px;
  border-radius: 10px;
}

.nav a.router-link-active {
  background: var(--soft);
  color: var(--text);
}

.content {
  padding: 16px;
}
</style>