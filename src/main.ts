import { createApp } from 'vue'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import App from './App.vue'
import router from './router'
import './style.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

const app = createApp(App)
app.use(router)
app.use(VueQueryPlugin, { queryClient })

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {})
  })
}

app.mount('#app')
