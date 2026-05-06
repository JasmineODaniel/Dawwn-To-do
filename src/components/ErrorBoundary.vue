<script setup lang="ts">
import { ref, onErrorCaptured, inject, type Ref } from 'vue'
import { RouterLink } from 'vue-router'

const isDark = inject<Ref<boolean>>('isDark')!

const hasError = ref(false)
const errorMessage = ref('')
const errorStack = ref('')

onErrorCaptured((err) => {
  hasError.value = true
  errorMessage.value = err instanceof Error ? err.message : String(err)
  errorStack.value = err instanceof Error ? (err.stack ?? '') : ''
  return false
})

function reload() {
  window.location.reload()
}
</script>

<template>
  <div
    v-if="hasError"
    :class="[
      'min-h-screen flex items-center justify-center px-6',
      isDark ? 'bg-black text-white' : 'bg-white text-gray-900',
    ]"
  >
    <div class="max-w-2xl w-full">
      <div
        :class="[
          'p-8 rounded-xl border',
          isDark ? 'bg-red-900/20 border-red-500' : 'bg-red-50 border-red-300',
        ]"
        style="border-radius: 10px"
      >
        <h1
          :class="['text-4xl font-bold mb-4', isDark ? 'text-red-400' : 'text-red-600']"
        >
          Something went wrong
        </h1>

        <p :class="['text-lg mb-6', isDark ? 'text-gray-300' : 'text-gray-700']">
          We're sorry, but something unexpected happened. Please try refreshing the page or go back home.
        </p>

        <details
          v-if="errorMessage"
          :class="['mb-6 p-4 rounded-lg', isDark ? 'bg-gray-900' : 'bg-white']"
          style="border-radius: 10px"
        >
          <summary class="cursor-pointer font-semibold mb-2">Error Details</summary>
          <pre :class="['text-sm overflow-auto', isDark ? 'text-gray-400' : 'text-gray-600']">{{ errorMessage }}
{{ errorStack }}</pre>
        </details>

        <div class="flex gap-4">
          <button
            @click="reload"
            :class="[
              'px-6 py-3 rounded-xl font-semibold transition-colors',
              isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300',
            ]"
            style="border-radius: 10px"
          >
            Refresh Page
          </button>
          <RouterLink
            to="/"
            :class="[
              'px-6 py-3 rounded-xl font-semibold transition-colors',
              isDark
                ? 'bg-white text-black hover:bg-gray-200'
                : 'bg-gray-900 text-white hover:bg-gray-800',
            ]"
            style="border-radius: 10px"
          >
            Go Home
          </RouterLink>
        </div>
      </div>
    </div>
  </div>

  <slot v-else />
</template>
