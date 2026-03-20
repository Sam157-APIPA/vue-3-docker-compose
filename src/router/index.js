import { createWebHistory, createRouter } from 'vue-router'

import IndexPage from '@/pages/IndexPage.vue'
import LevelsPage from '@/pages/LevelsPage.vue'
import LevelPage from '@/pages/LevelPage.vue'

export const ROUTES = {
  INDEX: 'INDEX',
  LEVELS: 'LEVELS',
  LEVEL: 'LEVEL'
}

const routes = [
  {
    name: ROUTES.INDEX,
    path: '/',
    component: IndexPage
  },
  {
    name: ROUTES.LEVELS,
    path: '/levels',
    component: LevelsPage
  },
  {
    name: ROUTES.LEVEL,
    path: '/level/:id',
    component: LevelPage,
    props: true
  }
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes
})