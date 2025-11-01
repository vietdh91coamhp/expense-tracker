import { POST } from '@/app/api/reset/route'
import { query } from '@/lib/db'

jest.mock('@/lib/db')

describe('POST /api/reset', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should drop tables successfully', async () => {
    ;(query as jest.Mock).mockResolvedValue({ rows: [], rowCount: 0 })

    const response = await POST()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Database tables dropped successfully')
    expect(data).toHaveProperty('timestamp')
    expect(query).toHaveBeenCalledWith('DROP TABLE IF EXISTS webhooks CASCADE')
    expect(query).toHaveBeenCalledWith('DROP TABLE IF EXISTS expenses CASCADE')
    expect(query).toHaveBeenCalledWith('DROP TABLE IF EXISTS users CASCADE')
  })

  it('should drop tables in correct order', async () => {
    const calls: string[] = []
    ;(query as jest.Mock).mockImplementation((sql: string) => {
      calls.push(sql)
      return Promise.resolve({ rows: [], rowCount: 0 })
    })

    await POST()

    // Webhooks first, then expenses, then users (due to foreign keys)
    expect(calls[0]).toContain('webhooks')
    expect(calls[1]).toContain('expenses')
    expect(calls[2]).toContain('users')
  })

  it('should handle drop table errors', async () => {
    const error = new Error('Drop table failed')
    ;(query as jest.Mock).mockRejectedValueOnce(error)

    const response = await POST()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to drop database tables')
    expect(data.details).toBe('Drop table failed')
  })

  it('should handle unknown errors', async () => {
    ;(query as jest.Mock).mockRejectedValueOnce('Unknown error')

    const response = await POST()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.details).toBe('Unknown error')
  })
})

