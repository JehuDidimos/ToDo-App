import { apiDelete, apiGetJson, apiPostJson, apiPutJson } from './apiClient'

export type ApiTask = {
  id: number
  title: string
  completed: boolean
  createdAt: string
}

export type CreateTaskRequest = {
  title: string
}

export type UpdateTaskRequest = {
  title: string
  completed: boolean
}

const BASE_PATH = '/api/tasks'

export async function listTasks(): Promise<ApiTask[]> {
  return await apiGetJson<ApiTask[]>(BASE_PATH)
}

export async function createTask(request: CreateTaskRequest): Promise<ApiTask> {
  return await apiPostJson<ApiTask, CreateTaskRequest>(BASE_PATH, request)
}

export async function updateTask(id: number, request: UpdateTaskRequest): Promise<ApiTask> {
  return await apiPutJson<ApiTask, UpdateTaskRequest>(`${BASE_PATH}/${id}`, request)
}

export async function deleteTask(id: number): Promise<void> {
  await apiDelete(`${BASE_PATH}/${id}`)
}
