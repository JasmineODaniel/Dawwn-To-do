<script setup lang="ts">
import { inject, type Ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Home } from 'lucide-vue-next'

const isDark = inject<Ref<boolean>>('isDark')!
</script>

<template>
  <div
    :class="[
      'min-h-screen flex items-center justify-center',
      isDark ? 'bg-black text-white' : 'bg-white text-gray-900',
    ]"
  >
    <div class="text-center px-6">
      <h1
        :class="['text-8xl font-bold mb-4', isDark ? 'text-white' : 'text-gray-900']"
      >
        404
      </h1>
      <p class="text-2xl mb-8">Page Not Found</p>
      <p :class="['mb-12', isDark ? 'text-gray-400' : 'text-gray-600']">
        The page you're looking for doesn't exist.
      </p>
      <RouterLink
        to="/"
        :class="[
          'inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all transform hover:scale-105',
          isDark
            ? 'bg-white text-black hover:bg-gray-200'
            : 'bg-gray-900 text-white hover:bg-gray-800',
        ]"
        style="border-radius: 10px"
      >
        <Home :size="20" />
        <span>Go Home</span>
      </RouterLink>
    </div>
  </div>
</template>
