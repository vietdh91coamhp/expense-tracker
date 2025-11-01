import { GET } from '@/app/api/expenses/[userId]/total/route'
import { query } from '@/lib/db'
import { NextRequest } from 'next/server'

jest.mock('@/lib/db')

const mockParams = { params: { userId: '1' } }

describe('GET /api/expenses/[userId]/total', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return total expenses by category', async () => {
    const mockCategoryTotals = [
      {
        category: 'Food',
        count: '5',
        total: '250.50',
        average: '50.10',
        min_amount: '20.00',
        max_amount: '80.00',
      },
      {
        category: 'Transport',
        count: '3',
        total: '150.00',
        average: '50.00',
        min_amount: '30.00',
        max_amount: '70.00',
      },
    ]

    ;(query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 }) // user check
      .mockResolvedValueOnce({ rows: mockCategoryTotals, rowCount: 2 }) // totals

    const request = new NextRequest('http://localhost:3000/api/expenses/1/total')
    const response = await GET(request, mockParams)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.userId).toBe(1)
    expect(data.totalExpenses).toBe(400.50)
    expect(data.totalTransactions).toBe(8)
    expect(data.byCategory).toHaveLength(2)
    expect(data.byCategory[0]).toHaveProperty('percentage')
    expect(data.byCategory[0].category).toBe('Food')
    expect(data.byCategory[0].total).toBe(250.50)
  })

  it('should return 404 if user not found', async () => {
    ;(query as jest.Mock).mockResolvedValueOnce({ rows: [], rowCount: 0 })

    const request = new NextRequest('http://localhost:3000/api/expenses/999/total')
    const response = await GET(request, mockParams)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('User not found')
  })

  it('should filter by date range', async () => {
    ;(query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })

    const request = new NextRequest('http://localhost:3000/api/expenses/1/total?startDate=2025-01-01&endDate=2025-01-31')
    await GET(request, mockParams)

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('AND date >= $2'),
      expect.arrayContaining([1, '2025-01-01', '2025-01-31'])
    )
  })

  it('should handle empty results', async () => {
    ;(query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })

    const request = new NextRequest('http://localhost:3000/api/expenses/1/total')
    const response = await GET(request, mockParams)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.totalExpenses).toBe(0)
    expect(data.totalTransactions).toBe(0)
    expect(data.byCategory).toHaveLength(0)
  })

  it('should calculate percentages correctly', async () => {
    const mockCategoryTotals = [
      {
        category: 'Food',
        count: '2',
        total: '75.00',
        average: '37.50',
        min_amount: '25.00',
        max_amount: '50.00',
      },
      {
        category: 'Transport',
        count: '1',
        total: '25.00',
        average: '25.00',
        min_amount: '25.00',
        max_amount: '25.00',
      },
    ]

    ;(query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: mockCategoryTotals, rowCount: 2 })

    const request = new NextRequest('http://localhost:3000/api/expenses/1/total')
    const response = await GET(request, mockParams)
    const data = await response.json()

    expect(data.byCategory[0].percentage).toBe('75.00')
    expect(data.byCategory[1].percentage).toBe('25.00')
  })
})

