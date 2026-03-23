<template>
  <div class="page-root">
    <div class="page-header">
      <h1 class="page-title">Home</h1>
      <p class="page-text">
        Tower Defense lab project
      </p>
    </div>

    <div class="card-list">
      <button
          class="nav-card"
          type="button"
          @click="() => goToLevels()"
      >
        <div class="nav-card__title">Tower Defense</div>
        <div class="nav-card__text">Open levels</div>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomePage',

  methods: {
    goToLevels () {
      this.$router.push('/levels')
    }
  }
}
</script>

<style scoped>
.page-root {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 36px;
  line-height: 1.1;
}

.page-text {
  margin: 0;
  color: var(--muted);
}

.card-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.nav-card {
  width: 420px;
  max-width: 100%;
  padding: 24px;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: var(--panel);
  color: var(--text);
  text-align: left;
  cursor: pointer;
}

.nav-card:hover {
  border-color: var(--accent);
}

.nav-card__title {
  margin-bottom: 10px;
  font-size: 24px;
  font-weight: bold;
}

.nav-card__text {
  color: var(--muted);
  font-size: 16px;
}
</style>