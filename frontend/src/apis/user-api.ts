import type {
  ResponseStandard,
  UserGetRequestParam,
  UserLoginRequestBody,
} from '@/models'
import { responseHandler } from '@/utils/api-response-handler'

export async function postUserLogin(
  requestData: UserLoginRequestBody,
): Promise<ResponseStandard | undefined> {
  const requestBody = requestData
  const { data, response } = await useApi('/user/login', {
    method: 'POST',
    body: JSON.stringify(requestBody),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_API_AUTH_KEY}`,
    },
  })

  const result: ResponseStandard = await responseHandler(data, response.value)
  return result
}

export async function getUsers(
  request: UserGetRequestParam,
  token: string,
): Promise<ResponseStandard> {
  const queryParams = new URLSearchParams()

  if (request.page !== undefined)
    queryParams.append('page', request.page.toString())

  if (request.pageSize !== undefined)
    queryParams.append('pageSize', request.pageSize.toString())

  const { data, response } = await useApi(`/users?${queryParams}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })

  const result: ResponseStandard = await responseHandler(data, response.value)
  return result
}

// DummyJSON API - Get Users
export async function getDummyUsers(
  params?: UserGetRequestParam,
): Promise<ResponseStandard> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL
  const queryParams = new URLSearchParams()

  if (params?.limit)
    queryParams.append('limit', params.limit.toString())
  if (params?.skip)
    queryParams.append('skip', params.skip.toString())

  const url = `${baseUrl}/users${queryParams.toString() ? `?${queryParams}` : ''}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (response.ok) {
      return {
        ok: true,
        data,
        error: undefined,
      }
    }
    else {
      return {
        ok: false,
        data: undefined,
        error: data.message || 'Failed to fetch users',
      }
    }
  }
  catch (error) {
    return {
      ok: false,
      data: undefined,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
