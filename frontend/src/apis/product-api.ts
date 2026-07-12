import type {
  ProductGetRequestParam,
  ResponseStandard,
} from '@/models'

// DummyJSON API - Get Products
export async function getProducts(params?: ProductGetRequestParam): Promise<ResponseStandard> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL
  const queryParams = new URLSearchParams()

  if (params?.limit)
    queryParams.append('limit', params.limit.toString())
  if (params?.skip)
    queryParams.append('skip', params.skip.toString())
  if (params?.search)
    queryParams.append('q', params.search)

  const url = `${baseUrl}/products${params?.search ? '/search' : ''}${queryParams.toString() ? `?${queryParams}` : ''}`

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
        error: data.message || 'Failed to fetch products',
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
