<script setup lang="ts">
import { ref, provide, watchEffect } from 'vue'
import { RouterView } from 'vue-router'
import ErrorBoundary from './components/ErrorBoundary.vue'

const isDark = ref<boolean>(
  localStorage.getItem('theme') !== null
    ? localStorage.getItem('theme') === 'dark'
    : true
)

watchEffect(() => {
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark', isDark.value)
})

const toggleTheme = () => {
  isDark.value = !isDark.value
}

provide('isDark', isDark)
provide('toggleTheme', toggleTheme)
</script>

<template>
  <ErrorBoundary>
    <RouterView />
  </ErrorBoundary>
</template>
