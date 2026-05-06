export interface Task {
  id: string
  _id?: string
  name?: string
  title?: string
  description?: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  owner?: string
  createdAt?: string
  updatedAt?: string
}

export interface TaskMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface TasksResponse {
  tasks: Task[]
  meta: TaskMeta
}

export interface Notification {
  id: string
  text: string
  timestamp: string
}

export type WSStatus = 'connecting' | 'open' | 'closed' | 'error'
