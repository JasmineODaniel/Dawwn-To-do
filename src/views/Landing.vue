<script setup lang="ts">
import { computed, inject, type Ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Sun, Moon } from 'lucide-vue-next'
import { useSEO } from '../composables/useSEO'

const isDark = inject<Ref<boolean>>('isDark')!
const toggleTheme = inject<() => void>('toggleTheme')!

useSEO('Home', 'Another day to arrange your day and start fresh')

const darkBlobs = [
  { id: 1, style: 'top:10%;left:15%;width:200px;height:110px;background:rgba(255,255,255,0.25);filter:blur(38px);animation:float 20s infinite ease-in-out' },
  { id: 2, style: 'top:20%;right:20%;width:240px;height:150px;background:rgba(165,180,252,0.2);filter:blur(48px);animation:float 25s infinite ease-in-out 2s' },
  { id: 3, style: 'bottom:25%;left:25%;width:210px;height:130px;background:rgba(255,255,255,0.15);filter:blur(42px);animation:float 30s infinite ease-in-out 4s' },
  { id: 4, style: 'top:40%;right:10%;width:170px;height:90px;background:rgba(165,180,252,0.3);filter:blur(32px);animation:float 22s infinite ease-in-out 1s' },
  { id: 5, style: 'bottom:15%;right:30%;width:200px;height:120px;background:rgba(255,255,255,0.18);filter:blur(40px);animation:float 28s infinite ease-in-out 3s' },
]

const lightBlobs = [
  { id: 1, style: 'top:10%;left:15%;width:200px;height:110px;background:rgba(224,231,255,0.7);filter:blur(38px);animation:float 20s infinite ease-in-out' },
  { id: 2, style: 'top:20%;right:20%;width:240px;height:150px;background:rgba(221,214,254,0.6);filter:blur(48px);animation:float 25s infinite ease-in-out 2s' },
  { id: 3, style: 'bottom:25%;left:25%;width:210px;height:130px;background:rgba(224,231,255,0.55);filter:blur(42px);animation:float 30s infinite ease-in-out 4s' },
  { id: 4, style: 'top:40%;right:10%;width:170px;height:90px;background:rgba(221,214,254,0.65);filter:blur(32px);animation:float 22s infinite ease-in-out 1s' },
  { id: 5, style: 'bottom:15%;right:30%;width:200px;height:120px;background:rgba(224,231,255,0.6);filter:blur(40px);animation:float 28s infinite ease-in-out 3s' },
]

const blobs = computed(() => (isDark.value ? darkBlobs : lightBlobs))
</script>

<template>
  <div
    :class="[
      'min-h-screen transition-colors duration-500',
      isDark ? 'bg-black text-white' : 'bg-white text-gray-900',
    ]"
  >
    <button
      @click="toggleTheme"
      :class="[
        'fixed top-8 right-8 p-4 rounded-full z-50 transition-all',
        isDark
          ? 'bg-white/10 hover:bg-white/20 text-white'
          : 'bg-gray-900/10 hover:bg-gray-900/20 text-gray-900',
      ]"
      aria-label="Toggle theme"
    >
      <Sun v-if="isDark" :size="24" />
      <Moon v-else :size="24" />
    </button>

    <div class="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
      <div
        v-for="blob in blobs"
        :key="blob.id"
        class="absolute rounded-full pointer-events-none"
        :style="blob.style"
      />

      <div class="relative z-10 text-center max-w-4xl">
        <h1
          :class="[
            'text-7xl md:text-9xl font-bold mb-8 tracking-wider',
            isDark ? 'text-white' : 'text-gray-900',
          ]"
          style="font-family: Michroma, sans-serif"
        >
          DAWWN TODO
        </h1>

        <p
          :class="[
            'text-xl md:text-2xl mb-12 leading-relaxed',
            isDark ? 'text-gray-300' : 'text-gray-700',
          ]"
        >
          Embrace the morning, organize your thoughts.
        </p>

        <RouterLink
          to="/tasks"
          :class="[
            'inline-block px-12 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105',
            isDark
              ? 'bg-white text-black hover:bg-blue-100'
              : 'bg-gray-900 text-white hover:bg-gray-800',
          ]"
          style="border-radius: 10px"
        >
          Begin Your Day
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  25% {
    transform: translateY(-20px) translateX(10px);
  }
  50% {
    transform: translateY(-10px) translateX(-10px);
  }
  75% {
    transform: translateY(-25px) translateX(5px);
  }
}
</style>
