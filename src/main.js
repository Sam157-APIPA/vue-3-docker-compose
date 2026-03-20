import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import { router, ROUTES } from '@/router/index.js'

const routesPlugin = {
  install(app) {
    app.config.globalProperties.$routes = ROUTES
  }
}

createApp(App)
  .use(router)
  .use(routesPlugin)
  .use(store)
  .mount('#project')