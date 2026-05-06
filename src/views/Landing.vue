<script setup lang="ts">
import { inject, type Ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Sun, Moon } from 'lucide-vue-next'
import { useSEO } from '../composables/useSEO'

const isDark = inject<Ref<boolean>>('isDark')!
const toggleTheme = inject<() => void>('toggleTheme')!

useSEO('Home', 'Another day to arrange your day and start fresh')

const blobs = [
  { id: 1, style: 'top:10%;left:15%;width:220px;height:120px;background:rgba(255,255,255,0.06);filter:blur(50px);animation:float 20s infinite ease-in-out' },
  { id: 2, style: 'top:20%;right:20%;width:260px;height:160px;background:rgba(165,180,252,0.08);filter:blur(60px);animation:float 25s infinite ease-in-out 2s' },
  { id: 3, style: 'bottom:25%;left:25%;width:230px;height:140px;background:rgba(255,255,255,0.05);filter:blur(55px);animation:float 30s infinite ease-in-out 4s' },
  { id: 4, style: 'top:40%;right:10%;width:190px;height:100px;background:rgba(165,180,252,0.07);filter:blur(45px);animation:float 22s infinite ease-in-out 1s' },
  { id: 5, style: 'bottom:15%;right:30%;width:210px;height:130px;background:rgba(255,255,255,0.06);filter:blur(52px);animation:float 28s infinite ease-in-out 3s' },
]
</script>

<template>
  <div
    class="min-h-screen relative overflow-hidden"
    style="
      background-image: url('/splash-bg.jpg');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    "
  >
    <div
      class="absolute inset-0 transition-colors duration-500"
      :class="isDark ? 'bg-black/65' : 'bg-white/40'"
    />

    <button
      @click="toggleTheme"
      class="fixed top-8 right-8 p-4 rounded-full z-50 transition-all backdrop-blur-sm"
      :class="isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/10 hover:bg-black/20 text-gray-900'"
      aria-label="Toggle theme"
    >
      <Sun v-if="isDark" :size="24" />
      <Moon v-else :size="24" />
    </button>

    <div class="relative min-h-screen flex items-center justify-center px-6">
      <div
        v-for="blob in blobs"
        :key="blob.id"
        class="absolute rounded-full pointer-events-none"
        :style="blob.style"
      />

      <div class="relative z-10 text-center max-w-4xl">
        <h1
          class="text-7xl md:text-9xl font-bold mb-8 tracking-wider"
          :class="isDark ? 'text-white' : 'text-gray-900'"
          style="
            font-family: Michroma, sans-serif;
            text-shadow: 0 2px 40px rgba(0, 0, 0, 0.3);
          "
        >
          DAWWN TODO
        </h1>

        <p
          class="text-xl md:text-2xl mb-12 leading-relaxed"
          :class="isDark ? 'text-white/75' : 'text-gray-800/80'"
        >
          Embrace the morning, organize your thoughts.
        </p>

        <RouterLink
          to="/tasks"
          class="inline-block px-12 py-4 font-semibold text-lg transition-all transform hover:scale-105"
          :class="isDark ? 'bg-white text-black hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-700'"
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
