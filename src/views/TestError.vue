<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const shouldThrow = ref(false)

function triggerError() {
  shouldThrow.value = true
}

if (shouldThrow.value) {
  throw new Error('This is a test error to demonstrate the ErrorBoundary!')
}
</script>

<template>
  <div class="min-h-screen bg-black text-white flex items-center justify-center px-6">
    <div class="text-center">
      <h1 class="text-4xl font-bold mb-4">Test Error Boundary</h1>
      <p class="text-gray-400 mb-8">
        Click the button below to trigger an error and see the ErrorBoundary in action.
      </p>
      <div class="flex gap-4 justify-center">
        <button
          @click="triggerError"
          class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
          style="border-radius: 10px"
        >
          Trigger Error
        </button>
        <RouterLink
          to="/"
          class="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
          style="border-radius: 10px"
        >
          Go Home
        </RouterLink>
      </div>
    </div>
  </div>
</template>
