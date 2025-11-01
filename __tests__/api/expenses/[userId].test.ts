import { GET } from '@/app/api/expenses/[userId]/route'
import { query } from '@/lib/db'
import { NextRequest } from 'next/server'

jest.mock('@/lib/db')

const mockParams = { params: { userId: '1' } }

describe('GET /api/expenses/[userId]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return expenses for a user', async () => {
    const mockExpenses = [
      {
        id: 1,
        user_id: 1,
        amount: 50.00,
        category: 'Food',
        description: 'Groceries',
        date: new Date('2025-01-15'),
        created_at: new Date(),
        updated_at: new Date()
      },
    ]

    ;(query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 }) // user check
      .mockResolvedValueOnce({ rows: mockExpenses, rowCount: 1 }) // expenses

    const request = new NextRequest('http://localhost:3000/api/expenses/1')
    const response = await GET(request, mockParams)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.userId).toBe(1)
    expect(data.expenses).toHaveLength(1)
    expect(data.expenses[0]).toHaveProperty('userId')
    expect(data.count).toBe(1)
  })

  it('should return 404 if user not found', async () => {
    ;(query as jest.Mock).mockResolvedValueOnce({ rows: [], rowCount: 0 })

    const request = new NextRequest('http://localhost:3000/api/expenses/999')
    const response = await GET(request, mockParams)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('User not found')
  })

  it('should filter by category', async () => {
    ;(query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })

    const request = new NextRequest('http://localhost:3000/api/expenses/1?category=Food')
    await GET(request, mockParams)

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('AND category = $2'),
      expect.arrayContaining([1, 'Food'])
    )
  })

  it('should filter by date range', async () => {
    ;(query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })

    const request = new NextRequest('http://localhost:3000/api/expenses/1?startDate=2025-01-01&endDate=2025-01-31')
    await GET(request, mockParams)

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('AND date >= $2'),
      expect.arrayContaining([1, '2025-01-01', '2025-01-31'])
    )
  })

  it('should handle database errors', async () => {
    ;(query as jest.Mock).mockRejectedValueOnce(new Error('Database error'))

    const request = new NextRequest('http://localhost:3000/api/expenses/1')
    const response = await GET(request, mockParams)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch expenses')
  })
})

