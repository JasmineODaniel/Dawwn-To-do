<script setup lang="ts">
import { ref, computed, inject, type Ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  Search, Home, List, User, ChevronLeft, ChevronRight,
  Sun, Moon, Plus, Zap, WifiOff, Bell,
} from 'lucide-vue-next'
import { useWebSocket } from '../composables/useWebSocket'
import { useSEO } from '../composables/useSEO'
import type { Task, TasksResponse, Notification } from '../types'

const PAGE_SIZE = 10

const isDark = inject<Ref<boolean>>('isDark')!
const toggleTheme = inject<() => void>('toggleTheme')!

const queryClient = useQueryClient()

const currentPage = ref(1)
const searchQuery = ref('')
const statusFilter = ref('ALL')
const showCreateModal = ref(false)
const notifications = ref<Notification[]>([])
const showNotificationCenter = ref(false)

const createForm = ref({
  name: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
})

useSEO('My Tasks', 'Manage your daily tasks and stay organized')

async function fetchTasks({ signal }: { signal?: AbortSignal }) {
  const params = new URLSearchParams({
    page: String(currentPage.value),
    limit: String(PAGE_SIZE),
  })
  if (statusFilter.value !== 'ALL') params.set('status', statusFilter.value)
  if (searchQuery.value.trim()) params.set('search', searchQuery.value.trim())

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(new Error('Request timed out')), 12000)
  if (signal) {
    signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true })
  }

  let res: Response
  try {
    res = await fetch(`https://api.oluwasetemi.dev/tasks?${params.toString()}`, {
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeoutId)
  }

  if (!res.ok) throw new Error('Failed to fetch tasks')

  const json = await res.json()
  const records: Task[] = Array.isArray(json) ? json : (json.data ?? [])
  const metaFromApi = !Array.isArray(json) && json.meta ? json.meta : null

  return {
    tasks: records,
    meta: metaFromApi ?? {
      page: currentPage.value,
      limit: PAGE_SIZE,
      total: records.length,
      totalPages: Math.max(1, Math.ceil(Math.max(records.length, PAGE_SIZE) / PAGE_SIZE)),
      hasNextPage: false,
      hasPreviousPage: currentPage.value > 1,
    },
  } as TasksResponse
}

const queryKey = computed(() => [
  'tasks',
  currentPage.value,
  searchQuery.value,
  statusFilter.value,
])

const { data, isLoading, isError, error } = useQuery({
  queryKey,
  queryFn: ({ signal }) => fetchTasks({ signal }),
  placeholderData: (prev) => prev,
  staleTime: 30_000,
  retry: 1,
  refetchOnWindowFocus: false,
})

async function createTaskFn(formData: typeof createForm.value) {
  const response = await fetch('https://api.oluwasetemi.dev/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  })
  if (!response.ok) throw new Error('Failed to create task')
  const json = await response.json()
  return (json.data ?? json) as Task
}

const createMutation = useMutation({
  mutationFn: createTaskFn,
  onSuccess: (created: Task) => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] })
    showCreateModal.value = false
    createForm.value = { name: '', description: '', status: 'TODO', priority: 'MEDIUM' }
    addNotification(`${created.name ?? created.title ?? 'Task'} added`)
  },
})

function addNotification(text: string) {
  notifications.value = [
    {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      text,
      timestamp: new Date().toLocaleTimeString(),
    },
    ...notifications.value,
  ].slice(0, 4)
}

function handleRealtimeUpdate(update: unknown) {
  if (!update || typeof update !== 'object') return

  const u = update as Record<string, unknown>
  const payload = (u.task ?? u.data ?? update) as Task
  const taskId = payload.id ?? payload._id
  const action = ((u.action ?? u.event ?? 'updated') as string)

  if (taskId) {
    queryClient.setQueriesData<TasksResponse>({ queryKey: ['tasks'] }, (old) => {
      if (!old) return old
      const tasks = old.tasks ?? []
      const exists = tasks.find((t) => (t.id ?? t._id) === taskId)

      let nextTasks = tasks
      if (action === 'deleted') {
        nextTasks = tasks.filter((t) => (t.id ?? t._id) !== taskId)
      } else if (exists) {
        nextTasks = tasks.map((t) =>
          (t.id ?? t._id) === taskId ? { ...t, ...payload, id: taskId } : t
        )
      } else {
        nextTasks = [{ ...payload, id: taskId }, ...tasks].slice(0, PAGE_SIZE)
      }

      const nextMeta = old.meta
        ? {
            ...old.meta,
            total:
              action === 'deleted'
                ? Math.max(0, (old.meta.total ?? 1) - 1)
                : action === 'created'
                ? (old.meta.total ?? 0) + 1
                : old.meta.total,
          }
        : old.meta

      return { ...old, tasks: nextTasks, meta: nextMeta }
    })
  }

  const label = payload.name ?? payload.title ?? 'Task'
  const note =
    action === 'deleted'
      ? `${label} removed`
      : action === 'created'
      ? `${label} added`
      : `${label} updated`
  addNotification(note)
}

const { status: socketStatus } = useWebSocket(handleRealtimeUpdate)

const tasks = computed(() => data.value?.tasks ?? [])
const meta = computed(() => data.value?.meta)
const totalTasksCount = computed(() => meta.value?.total ?? tasks.value.length)

const filteredTasks = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return tasks.value.filter((task) => {
    const name = (task.name ?? task.title ?? '').toLowerCase()
    return (
      name.includes(q) &&
      (statusFilter.value === 'ALL' || task.status === statusFilter.value)
    )
  })
})

const showInlineError = computed(() => isError.value && !isLoading.value)

function onStatusChange(e: Event) {
  currentPage.value = 1
  statusFilter.value = (e.target as HTMLSelectElement).value
}

function statusBadgeClass(status: string) {
  if (status === 'DONE') return 'bg-green-600 text-white'
  if (status === 'IN_PROGRESS') return 'bg-amber-400 text-black'
  return 'bg-red-500 text-white'
}

function taskId(task: Task) {
  return task.id ?? task._id ?? ''
}
</script>

<template>
  <div
    v-if="isLoading"
    :class="[
      'h-screen flex items-center justify-center',
      isDark ? 'bg-black text-white' : 'bg-white text-gray-900',
    ]"
  >
    <div class="text-xl">Loading tasks...</div>
  </div>

  <div
    v-else
    :class="[
      'min-h-screen flex',
      isDark ? 'dark-charcoal dark-grid text-white' : 'light-grid text-gray-900',
    ]"
  >
    <aside
      :class="[
        'fixed left-0 top-0 h-screen w-20 flex flex-col items-center pt-14 pb-8 border-r',
        isDark ? 'bg-gray-950 border-gray-800' : 'bg-gray-50 border-gray-200',
      ]"
    >
      <RouterLink
        to="/"
        :class="[
          'p-3 rounded-xl mb-8 transition-colors',
          isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200',
        ]"
        aria-label="Home"
      >
        <Home :size="16" />
      </RouterLink>

      <RouterLink
        to="/tasks"
        :class="[
          'p-3 rounded-xl mb-8 transition-colors',
          isDark ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-900',
        ]"
        aria-label="Tasks"
      >
        <List :size="16" />
      </RouterLink>

      <button
        :class="[
          'p-3 rounded-xl mb-8 transition-colors',
          isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200',
        ]"
        aria-label="Profile"
        type="button"
      >
        <User :size="16" />
      </button>

      <div class="mt-auto">
        <button
          @click="toggleTheme"
          :class="[
            'p-3 rounded-xl transition-colors',
            isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200',
          ]"
          aria-label="Toggle theme"
          type="button"
        >
          <Sun v-if="isDark" :size="16" />
          <Moon v-else :size="16" />
        </button>
      </div>
    </aside>

    <main class="ml-20 flex-1">
      <header
        :class="[
          'sticky top-0 z-40 border-b backdrop-blur-sm',
          isDark ? 'bg-black/80 border-gray-800' : 'bg-white/80 border-gray-200',
        ]"
      >
        <div class="px-8 py-7 space-y-5">
          <div
            v-if="showInlineError"
            :class="[
              'w-full px-4 py-3 rounded-lg text-sm',
              isDark
                ? 'bg-red-500/10 text-red-200 border border-red-500/30'
                : 'bg-red-50 text-red-700 border border-red-200',
            ]"
          >
            Failed to load tasks. {{ (error as Error)?.message ?? 'Please check your connection.' }}
          </div>

          <div class="flex items-center gap-3 flex-wrap">
            <div class="text-lg brand-lockup tracking-[0.24em]">DAWWN&nbsp;TODO</div>

            <div class="flex-1" />

            <select
              :value="statusFilter"
              @change="onStatusChange"
              :class="[
                'px-3 py-2 text-sm rounded-lg border transition-colors',
                isDark
                  ? 'bg-gray-900 border-gray-800 text-white focus:border-gray-600'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-gray-500',
              ]"
              style="border-radius: 8px"
            >
              <option value="ALL">All</option>
              <option value="TODO">Todo</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>

            <div class="relative w-[220px]">
              <Search
                :class="[
                  'absolute left-3 top-1/2 -translate-y-1/2',
                  isDark ? 'text-gray-400' : 'text-gray-600',
                ]"
                :size="16"
                aria-hidden="true"
              />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search tasks"
                :class="[
                  'w-full pl-9 pr-3 py-2 text-sm rounded-lg border transition-colors focus:outline-none',
                  isDark
                    ? 'bg-gray-900 border-gray-800 text-white placeholder-gray-500 focus:border-gray-600'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-500',
                ]"
                style="border-radius: 8px; border-width: 1px"
              />
            </div>

            <div
              :class="[
                'flex items-center gap-2 px-3 h-9 rounded-full text-[11px] font-semibold',
                socketStatus === 'open'
                  ? isDark
                    ? 'bg-gray-800 text-gray-200'
                    : 'bg-gray-100 text-gray-700'
                  : isDark
                  ? 'bg-gray-900 text-gray-500'
                  : 'bg-gray-100 text-gray-600',
              ]"
            >
              <Zap v-if="socketStatus === 'open'" :size="12" />
              <WifiOff v-else :size="12" />
              <span>{{ socketStatus === 'open' ? 'Live' : 'Connecting' }}</span>
            </div>

            <button
              @click="showNotificationCenter = !showNotificationCenter"
              :class="[
                'relative h-9 w-9 rounded-full flex items-center justify-center transition-colors',
                isDark ? 'bg-gray-900 hover:bg-gray-800' : 'bg-gray-100 hover:bg-gray-200',
              ]"
              type="button"
              aria-label="Toggle notification center"
            >
              <Bell :size="14" />
              <span
                v-if="notifications.length > 0"
                class="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500"
              />
            </button>
          </div>

          <div class="flex items-center justify-between gap-4 flex-wrap">
            <h2 class="text-4xl font-bold">My Tasks</h2>
            <button
              @click="showCreateModal = true"
              :class="[
                'h-10 w-10 rounded-full font-semibold transition-colors flex items-center justify-center',
                isDark
                  ? 'bg-gray-800 text-white hover:bg-gray-700'
                  : 'bg-gray-900 text-white hover:bg-gray-800',
              ]"
              style="border-radius: 12px"
              type="button"
              aria-label="Add task"
            >
              <Plus :size="16" />
            </button>
          </div>

          <p :class="['text-sm', isDark ? 'text-gray-400' : 'text-gray-600']">
            Showing {{ filteredTasks.length }} of {{ totalTasksCount }} tasks
          </p>
        </div>
      </header>

      <div class="p-8">
        <div
          v-if="showNotificationCenter"
          :class="[
            'mb-6 rounded-xl border',
            isDark ? 'glass-card border-white/10' : 'bg-white border-gray-200',
          ]"
          style="border-radius: 10px"
        >
          <div class="flex items-center justify-between px-6 py-4">
            <div class="font-semibold">Live updates</div>
            <button
              @click="notifications = []"
              :class="isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'"
              type="button"
            >
              Clear
            </button>
          </div>
          <ul class="px-6 pb-4 space-y-2 text-sm max-h-64 overflow-auto">
            <li v-if="notifications.length === 0" class="text-gray-500">
              No notifications yet.
            </li>
            <li
              v-for="note in notifications"
              :key="note.id"
              class="flex justify-between gap-4"
            >
              <span>{{ note.text }}</span>
              <span class="text-gray-500">{{ note.timestamp }}</span>
            </li>
          </ul>
        </div>

        <div
          v-if="filteredTasks.length === 0"
          :class="[
            'p-8 rounded-xl border text-center',
            isDark
              ? 'glass-card border-white/10 text-gray-300'
              : 'bg-white border-gray-200 text-gray-700',
          ]"
          style="border-radius: 10px"
        >
          No tasks found. Try adjusting your search or filters.
        </div>

        <div v-else class="space-y-3">
          <RouterLink
            v-for="task in filteredTasks"
            :key="taskId(task)"
            :to="`/tasks/${taskId(task)}`"
            :class="[
              'block px-5 py-4 rounded-xl border transition-colors net-card',
              isDark
                ? 'glass-card border-white/10 hover:border-white/20'
                : 'bg-white border-gray-200 hover:bg-gray-50',
            ]"
            style="border-radius: 10px"
          >
            <div class="flex justify-between items-center">
              <span class="text-base font-medium">{{ task.name ?? task.title }}</span>
              <span
                :class="[
                  'px-3 py-1 text-xs font-semibold rounded-lg',
                  statusBadgeClass(task.status),
                ]"
                style="border-radius: 10px"
              >
                {{ task.status ?? 'Pending' }}
              </span>
            </div>
          </RouterLink>
        </div>

        <div class="mt-8 flex justify-between items-center text-sm">
          <button
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="!meta?.hasPreviousPage"
            :class="[
              'p-3 rounded-xl font-semibold transition-colors',
              meta?.hasPreviousPage
                ? isDark
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
                : isDark
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed',
            ]"
            style="border-radius: 10px"
            aria-label="Previous page"
            type="button"
          >
            <ChevronLeft :size="24" />
          </button>

          <div :class="isDark ? 'text-gray-400' : 'text-gray-600'">
            Page {{ meta?.page ?? 1 }} of {{ meta?.totalPages ?? 1 }}
          </div>

          <button
            @click="currentPage += 1"
            :disabled="!meta?.hasNextPage"
            :class="[
              'p-3 rounded-xl font-semibold transition-colors',
              meta?.hasNextPage
                ? isDark
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
                : isDark
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed',
            ]"
            style="border-radius: 10px"
            aria-label="Next page"
            type="button"
          >
            <ChevronRight :size="24" />
          </button>
        </div>
      </div>
    </main>

    <Teleport to="body">
      <div
        v-if="showCreateModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
      >
        <div
          :class="[
            'w-full max-w-md rounded-xl p-6',
            isDark
              ? 'bg-gray-950 text-white border border-white/10 glass-card'
              : 'bg-white text-gray-900',
          ]"
          style="border-radius: 10px"
        >
          <h3 class="text-xl font-bold mb-5">Create New Task</h3>

          <div
            v-if="createMutation.error.value"
            class="mb-4 p-3 rounded-lg bg-red-500/20 text-red-400 text-sm"
          >
            {{ (createMutation.error.value as Error).message }}
          </div>

          <form @submit.prevent="createMutation.mutate(createForm)" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold mb-2">Task Name</label>
              <input
                v-model="createForm.name"
                type="text"
                :class="[
                  'w-full px-4 py-3 rounded-xl border focus:outline-none',
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900',
                ]"
                style="border-radius: 10px"
                required
              />
            </div>

            <div>
              <label class="block text-xs font-semibold mb-2">Description</label>
              <textarea
                v-model="createForm.description"
                :class="[
                  'w-full px-4 py-3 rounded-xl border focus:outline-none',
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900',
                ]"
                style="border-radius: 10px"
                rows="3"
              />
            </div>

            <div class="flex gap-3">
              <div class="flex-1">
                <label class="block text-xs font-semibold mb-2">Status</label>
                <select
                  v-model="createForm.status"
                  :class="[
                    'w-full px-4 py-3 rounded-xl border focus:outline-none',
                    isDark
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900',
                  ]"
                  style="border-radius: 10px"
                >
                  <option value="TODO">Todo</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>

              <div class="flex-1">
                <label class="block text-xs font-semibold mb-2">Priority</label>
                <select
                  v-model="createForm.priority"
                  :class="[
                    'w-full px-4 py-3 rounded-xl border focus:outline-none',
                    isDark
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900',
                  ]"
                  style="border-radius: 10px"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>

            <div class="flex gap-4">
              <button
                type="button"
                @click="showCreateModal = false"
                :class="[
                  'flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300',
                ]"
                style="border-radius: 10px"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="createMutation.isPending.value"
                :class="[
                  'flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50',
                  isDark
                    ? 'bg-gray-900 text-white hover:bg-gray-800 border border-white/10'
                    : 'bg-gray-900 text-white hover:bg-gray-800',
                ]"
                style="border-radius: 10px"
              >
                {{ createMutation.isPending.value ? 'Creating...' : 'Create Task' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
