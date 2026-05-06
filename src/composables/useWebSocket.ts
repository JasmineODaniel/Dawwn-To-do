import { ref, onUnmounted } from 'vue'
import type { WSStatus } from '../types'

export function useWebSocket(onMessage: (data: unknown) => void) {
  const status = ref<WSStatus>('connecting')
  const lastMessage = ref<unknown>(null)

  const ws = new WebSocket('wss://api.oluwasetemi.dev/ws/tasks')

  ws.onopen = () => { status.value = 'open' }
  ws.onclose = () => { status.value = 'closed' }
  ws.onerror = () => { status.value = 'error' }
  ws.onmessage = (event: MessageEvent) => {
    try {
      const update = JSON.parse(event.data as string)
      lastMessage.value = update
      onMessage(update)
    } catch {}
  }

  onUnmounted(() => ws.close())

  return { status, lastMessage }
}
