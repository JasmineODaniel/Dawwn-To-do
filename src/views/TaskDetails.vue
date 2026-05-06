<script setup lang="ts">
import { ref, computed, inject, type Ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { ArrowLeft, Home, List, User, Sun, Moon, Pencil, Trash2 } from 'lucide-vue-next'
import { useWebSocket } from '../composables/useWebSocket'
import type { Task } from '../types'

const isDark = inject<Ref<boolean>>('isDark')!
const toggleTheme = inject<() => void>('toggleTheme')!

const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()

const id = computed(() => route.params.id as string)

const showEditModal = ref(false)
const showDeleteModal = ref(false)

const editForm = ref({
  name: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
})

async function fetchTask({ signal }: { signal?: AbortSignal }) {
  const res = await fetch(`https://api.oluwasetemi.dev/tasks/${id.value}`, { signal })
  if (!res.ok) throw new Error('Failed to fetch task')
  const json = await res.json()
  return (json.data ?? json) as Task
}

const { data: task, isLoading, isError, error } = useQuery({
  queryKey: computed(() => ['task', id.value]),
  queryFn: ({ signal }) => fetchTask({ signal }),
  staleTime: 30_000,
  retry: 2,
})

const updateMutation = useMutation({
  mutationFn: async (formData: typeof editForm.value) => {
    const response = await fetch(`https://api.oluwasetemi.dev/tasks/${id.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    if (!response.ok) throw new Error('Failed to update task')
    const json = await response.json()
    return (json.data ?? json) as Task
  },
  onSuccess: (updated: Task) => {
    queryClient.setQueryData(['task', id.value], updated)
    queryClient.invalidateQueries({ queryKey: ['tasks'] })
    showEditModal.value = false
  },
})

const deleteMutation = useMutation({
  mutationFn: async () => {
    const response = await fetch(`https://api.oluwasetemi.dev/tasks/${id.value}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete task')
    return true
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] })
    router.push('/tasks')
  },
})

useWebSocket((update) => {
  if (!update || typeof update !== 'object') return
  const u = update as Record<string, unknown>
  const payload = (u.task ?? u.data ?? update) as Task
  const taskId = payload.id ?? payload._id
  const action = (u.action ?? u.event ?? 'updated') as string
  if (!taskId || taskId !== id.value) return

  if (action === 'deleted') {
    queryClient.removeQueries({ queryKey: ['task', id.value] })
    router.push('/tasks')
    return
  }

  queryClient.setQueryData<Task>(['task', id.value], (prev) => ({
    ...prev,
    ...payload,
    id: taskId,
  } as Task))
})

function openEditModal() {
  if (!task.value) return
  editForm.value = {
    name: task.value.name ?? '',
    description: task.value.description ?? '',
    status: task.value.status ?? 'TODO',
    priority: task.value.priority ?? 'MEDIUM',
  }
  showEditModal.value = true
}

function statusBadgeClass(status: string) {
  if (status === 'DONE') return 'bg-green-600 text-white'
  if (status === 'IN_PROGRESS') return 'bg-blue-500 text-white'
  return 'bg-yellow-500 text-black'
}
</script>

<template>
  <div
    v-if="isLoading"
    :class="[
      'min-h-screen flex items-center justify-center',
      isDark ? 'bg-black text-white' : 'bg-white text-gray-900',
    ]"
  >
    <div class="text-xl">Loading task details...</div>
  </div>

  <div
    v-else
    :class="['min-h-screen flex', isDark ? 'bg-black text-white' : 'bg-white text-gray-900']"
  >
    <aside
      :class="[
        'fixed left-0 top-0 h-screen w-20 flex flex-col items-center py-8 border-r',
        isDark ? 'bg-gray-950 border-gray-800' : 'bg-gray-50 border-gray-200',
      ]"
    >
      <RouterLink
        to="/"
        :class="[
          'p-4 rounded-xl mb-8 transition-colors',
          isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200',
        ]"
        aria-label="Home"
      >
        <Home :size="24" />
      </RouterLink>

      <RouterLink
        to="/tasks"
        :class="[
          'p-4 rounded-xl mb-8 transition-colors',
          isDark ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-900',
        ]"
        aria-label="Tasks"
      >
        <List :size="24" />
      </RouterLink>

      <button
        :class="[
          'p-4 rounded-xl mb-8 transition-colors',
          isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200',
        ]"
        aria-label="Profile"
        type="button"
      >
        <User :size="24" />
      </button>

      <div class="mt-auto">
        <button
          @click="toggleTheme"
          :class="[
            'p-4 rounded-xl transition-colors',
            isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200',
          ]"
          aria-label="Toggle theme"
          type="button"
        >
          <Sun v-if="isDark" :size="24" />
          <Moon v-else :size="24" />
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
        <div class="px-8 py-6">
          <RouterLink
            to="/tasks"
            :class="[
              'inline-flex items-center gap-2 font-semibold transition-colors',
              isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900',
            ]"
          >
            <ArrowLeft :size="20" />
            <span>Back to Tasks</span>
          </RouterLink>
        </div>
      </header>

      <div class="p-8">
        <div
          v-if="isError"
          :class="[
            'p-6 rounded-xl border',
            isDark ? 'bg-red-900/20 border-red-500' : 'bg-red-50 border-red-300',
          ]"
          style="border-radius: 10px"
        >
          <h2
            :class="['text-2xl font-bold mb-2', isDark ? 'text-red-400' : 'text-red-600']"
          >
            Error Loading Task
          </h2>
          <p :class="isDark ? 'text-red-300' : 'text-red-700'">
            {{ (error as Error)?.message }}
          </p>
          <RouterLink
            to="/tasks"
            :class="[
              'inline-flex items-center gap-2 mt-4',
              isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700',
            ]"
          >
            <ArrowLeft :size="16" />
            Back to Tasks
          </RouterLink>
        </div>

        <div v-else-if="!task" class="text-center py-12">
          <h2 class="text-3xl font-bold mb-4">Task not found</h2>
          <RouterLink
            to="/tasks"
            :class="[
              'inline-flex items-center gap-2 font-semibold',
              isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700',
            ]"
          >
            <ArrowLeft :size="16" />
            Back to Tasks
          </RouterLink>
        </div>

        <div
          v-else
          :class="[
            'p-8 rounded-xl border',
            isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200',
          ]"
          style="border-radius: 10px"
        >
          <div class="flex justify-between items-start mb-8">
            <h1 class="text-4xl font-bold">{{ task.name ?? task.title }}</h1>

            <div class="flex gap-2">
              <button
                @click="openEditModal"
                :class="[
                  'p-3 rounded-xl transition-colors',
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200',
                ]"
                style="border-radius: 10px"
                aria-label="Edit task"
                type="button"
              >
                <Pencil :size="20" />
              </button>
              <button
                @click="showDeleteModal = true"
                class="p-3 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors"
                style="border-radius: 10px"
                aria-label="Delete task"
                type="button"
              >
                <Trash2 :size="20" />
              </button>
            </div>
          </div>

          <div class="space-y-6">
            <div :class="['border-b pb-6', isDark ? 'border-gray-800' : 'border-gray-200']">
              <span
                :class="['font-semibold block mb-2', isDark ? 'text-gray-400' : 'text-gray-600']"
              >
                Description
              </span>
              <p class="text-lg leading-relaxed">
                {{ task.description ?? 'No description provided' }}
              </p>
            </div>

            <div
              :class="[
                'flex items-center gap-4 border-b pb-6',
                isDark ? 'border-gray-800' : 'border-gray-200',
              ]"
            >
              <span :class="['font-semibold', isDark ? 'text-gray-400' : 'text-gray-600']">
                Status:
              </span>
              <span
                :class="[
                  'px-6 py-2 rounded-xl text-sm font-bold',
                  statusBadgeClass(task.status),
                ]"
                style="border-radius: 10px"
              >
                {{ task.status }}
              </span>
            </div>

            <div :class="['border-b pb-6', isDark ? 'border-gray-800' : 'border-gray-200']">
              <span :class="['font-semibold', isDark ? 'text-gray-400' : 'text-gray-600']">
                Priority:
              </span>
              <span class="ml-4 text-lg">{{ task.priority ?? 'Not set' }}</span>
            </div>

            <div :class="['border-b pb-6', isDark ? 'border-gray-800' : 'border-gray-200']">
              <span :class="['font-semibold', isDark ? 'text-gray-400' : 'text-gray-600']">
                Owner:
              </span>
              <span class="ml-4 text-lg">{{ task.owner ?? 'Unknown' }}</span>
            </div>

            <div
              v-if="task.createdAt"
              :class="['border-b pb-6', isDark ? 'border-gray-800' : 'border-gray-200']"
            >
              <span :class="['font-semibold', isDark ? 'text-gray-400' : 'text-gray-600']">
                Created:
              </span>
              <span class="ml-4 text-lg">{{ new Date(task.createdAt).toLocaleString() }}</span>
            </div>

            <div
              v-if="task.updatedAt"
              :class="['border-b pb-6', isDark ? 'border-gray-800' : 'border-gray-200']"
            >
              <span :class="['font-semibold', isDark ? 'text-gray-400' : 'text-gray-600']">
                Last Updated:
              </span>
              <span class="ml-4 text-lg">{{ new Date(task.updatedAt).toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <Teleport to="body">
      <div
        v-if="showEditModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <div
          :class="[
            'w-full max-w-md rounded-xl p-6',
            isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900',
          ]"
          style="border-radius: 10px"
        >
          <h3 class="text-2xl font-bold mb-6">Edit Task</h3>

          <div
            v-if="updateMutation.error.value"
            class="mb-4 p-3 rounded-lg bg-red-500/20 text-red-400 text-sm"
          >
            {{ (updateMutation.error.value as Error).message }}
          </div>

          <form @submit.prevent="updateMutation.mutate(editForm)" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold mb-2">Task Name</label>
              <input
                v-model="editForm.name"
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
              <label class="block text-sm font-semibold mb-2">Description</label>
              <textarea
                v-model="editForm.description"
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

            <div>
              <label class="block text-sm font-semibold mb-2">Status</label>
              <select
                v-model="editForm.status"
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

            <div class="flex gap-4">
              <button
                type="button"
                @click="showEditModal = false"
                :class="[
                  'flex-1 px-6 py-3 rounded-xl font-semibold transition-colors',
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300',
                ]"
                style="border-radius: 10px"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="updateMutation.isPending.value"
                :class="[
                  'flex-1 px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50',
                  isDark
                    ? 'bg-white text-black hover:bg-gray-200'
                    : 'bg-gray-900 text-white hover:bg-gray-800',
                ]"
                style="border-radius: 10px"
              >
                {{ updateMutation.isPending.value ? 'Updating...' : 'Update Task' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <div
          :class="[
            'w-full max-w-md rounded-xl p-6',
            isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900',
          ]"
          style="border-radius: 10px"
        >
          <h3 class="text-2xl font-bold mb-4">Delete Task</h3>
          <p :class="['mb-6', isDark ? 'text-gray-300' : 'text-gray-600']">
            Are you sure you want to delete this task? This action cannot be undone.
          </p>

          <div
            v-if="deleteMutation.error.value"
            class="mb-4 p-3 rounded-lg bg-red-500/20 text-red-400 text-sm"
          >
            {{ (deleteMutation.error.value as Error).message }}
          </div>

          <div class="flex gap-4">
            <button
              @click="showDeleteModal = false"
              :class="[
                'flex-1 px-6 py-3 rounded-xl font-semibold transition-colors',
                isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300',
              ]"
              style="border-radius: 10px"
              type="button"
            >
              Cancel
            </button>
            <button
              @click="deleteMutation.mutate()"
              :disabled="deleteMutation.isPending.value"
              class="flex-1 px-6 py-3 rounded-xl font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
              style="border-radius: 10px"
              type="button"
            >
              {{ deleteMutation.isPending.value ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
