<template>
  <div class="page-root">
    <div class="page-header">
      <div class="title-block">
        <h1 class="page-title">Levels</h1>
        <p class="page-text">
          Choose a level
        </p>
      </div>

      <button
          class="back-button"
          type="button"
          @click="() => goHome()"
      >
        Back to home
      </button>
    </div>

    <div class="levels-grid">
      <button
          v-for="level in levelList"
          :key="level.id"
          class="level-card"
          type="button"
          @click="() => openLevel(level.id)"
      >
        <div class="level-card__title">{{ level.title }}</div>
        <div class="level-card__line">Path points: {{ level.path.length }}</div>
        <div class="level-card__line">Tower slots: {{ level.slots.length }}</div>
      </button>
    </div>
  </div>
</template>

<script>
import { levelConfig } from '@/data/levelConfig'

export default {
  name: 'LevelsPage',

  computed: {
    levelList () {
      return Object.values(levelConfig)
    }
  },

  methods: {
    goHome () {
      this.$router.push('/')
    },

    openLevel (levelKey) {
      this.$router.push(`/level/${levelKey}`)
    }
  }
}
</script>

<style scoped>
.page-root {
  padding: 24px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.title-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-title {
  margin: 0;
  font-size: 36px;
  line-height: 1.1;
}

.page-text {
  margin: 0;
  color: var(--muted);
}

.back-button {
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--panel);
  color: var(--text);
  cursor: pointer;
}

.levels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.level-card {
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--panel);
  color: var(--text);
  text-align: left;
  cursor: pointer;
}

.level-card:hover {
  border-color: var(--accent);
}

.level-card__title {
  margin-bottom: 10px;
  font-size: 22px;
  font-weight: bold;
}

.level-card__line {
  color: var(--muted);
  line-height: 1.6;
}
</style>