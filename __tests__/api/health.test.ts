import { GET } from '@/app/api/health/route'
import { getPool } from '@/lib/db'

// Mock the db module
jest.mock('@/lib/db', () => ({
  getPool: jest.fn(),
}))

describe('GET /api/health', () => {
  let mockPool: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockPool = {
      query: jest.fn(),
    }
    ;(getPool as jest.Mock).mockReturnValue(mockPool)
  })

  it('should return healthy status when database is connected', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      status: 'ok',
      message: 'API and database are healthy',
      timestamp: expect.any(String),
    })
  })

  it('should return error status when database connection fails', async () => {
    mockPool.query.mockRejectedValueOnce(new Error('Connection failed'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data).toEqual({
      status: 'error',
      message: 'Database connection failed',
      timestamp: expect.any(String),
    })
  })

  it('should handle unknown errors', async () => {
    mockPool.query.mockRejectedValueOnce('Unknown error')

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data).toEqual({
      status: 'error',
      message: 'Database connection failed',
      timestamp: expect.any(String),
    })
  })
})

