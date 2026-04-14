export class ApiError extends Error {
  status: number
  requestId?: string
  detail?: string

  constructor(args: { message: string; status: number; requestId?: string; detail?: string }) {
    super(args.message)
    this.name = 'ApiError'
    this.status = args.status
    this.requestId = args.requestId
    this.detail = args.detail
  }
}

function getRequestIdFromResponse(response: Response): string | undefined {
  return response.headers.get('X-Request-Id') ?? undefined
}

async function readErrorMessage(response: Response): Promise<string | undefined> {
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) return undefined

  try {
    const body: unknown = await response.json()
    if (!body || typeof body !== 'object') return undefined

    const detail = (body as { detail?: unknown }).detail
    if (typeof detail === 'string' && detail.trim().length > 0) return detail

    const title = (body as { title?: unknown }).title
    if (typeof title === 'string' && title.trim().length > 0) return title
  } catch {
    return undefined
  }

  return undefined
}

async function parseJsonOrThrow<T>(response: Response): Promise<T> {
  const text = await response.text()
  if (!text) {
    throw new ApiError({
      message: 'Empty response body',
      status: response.status,
      requestId: getRequestIdFromResponse(response),
    })
  }

  try {
    return JSON.parse(text) as T
  } catch {
    throw new ApiError({
      message: 'Invalid JSON response from server',
      status: response.status,
      requestId: getRequestIdFromResponse(response),
    })
  }
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers)
  if (!headers.has('Accept')) headers.set('Accept', 'application/json')

  return await fetch(path, { ...init, headers })
}

export async function apiGetJson<T>(path: string): Promise<T> {
  const response = await apiFetch(path, { method: 'GET' })
  if (!response.ok) {
    const detail = await readErrorMessage(response)
    throw new ApiError({
      message: detail ?? `GET ${path} failed (${response.status})`,
      status: response.status,
      requestId: getRequestIdFromResponse(response),
      detail,
    })
  }
  return await parseJsonOrThrow<T>(response)
}

export async function apiPostJson<TResponse, TBody>(
  path: string,
  body: TBody,
): Promise<TResponse> {
  const response = await apiFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const detail = await readErrorMessage(response)
    throw new ApiError({
      message: detail ?? `POST ${path} failed (${response.status})`,
      status: response.status,
      requestId: getRequestIdFromResponse(response),
      detail,
    })
  }

  return await parseJsonOrThrow<TResponse>(response)
}

export async function apiPutJson<TResponse, TBody>(
  path: string,
  body: TBody,
): Promise<TResponse> {
  const response = await apiFetch(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const detail = await readErrorMessage(response)
    throw new ApiError({
      message: detail ?? `PUT ${path} failed (${response.status})`,
      status: response.status,
      requestId: getRequestIdFromResponse(response),
      detail,
    })
  }

  return await parseJsonOrThrow<TResponse>(response)
}

export async function apiDelete(path: string): Promise<void> {
  const response = await apiFetch(path, { method: 'DELETE' })
  if (response.status === 204) return

  if (!response.ok) {
    const detail = await readErrorMessage(response)
    throw new ApiError({
      message: detail ?? `DELETE ${path} failed (${response.status})`,
      status: response.status,
      requestId: getRequestIdFromResponse(response),
      detail,
    })
  }
}
