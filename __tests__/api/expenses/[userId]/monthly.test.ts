import { GET } from '@/app/api/expenses/[userId]/monthly/route'
import { query } from '@/lib/db'
import { NextRequest } from 'next/server'

jest.mock('@/lib/db')

const mockParams = { params: { userId: '1' } }

describe('GET /api/expenses/[userId]/monthly', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return monthly spending summary', async () => {
    const mockMonthlyData = [
      {
        month: '2025-10',
        year: '2025',
        month_number: '10',
        category: 'Food',
        count: '3',
        total: '150.00',
      },
      {
        month: '2025-10',
        year: '2025',
        month_number: '10',
        category: 'Transport',
        count: '2',
        total: '100.00',
      },
      {
        month: '2025-09',
        year: '2025',
        month_number: '09',
        category: 'Food',
        count: '2',
        total: '80.00',
      },
    ]

    ;(query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 }) // user check
      .mockResolvedValueOnce({ rows: mockMonthlyData, rowCount: 3 }) 

    const request = new NextRequest('http://localhost:3000/api/expenses/1/monthly')
    const response = await GET(request, mockParams)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.userId).toBe(1)
    expect(data.totalExpenses).toBe(330.00)
    expect(data.totalTransactions).toBe(7)
    expect(data.monthlyBreakdown).toHaveLength(2) 
    expect(data.monthlyBreakdown[0].month).toBe('2025-10') 
    expect(data.monthlyBreakdown[0].total).toBe(250.00)
    expect(data.monthlyBreakdown[0].categories).toHaveLength(2)
  })

  it('should return 404 if user not found', async () => {
    ;(query as jest.Mock).mockResolvedValueOnce({ rows: [], rowCount: 0 })

    const request = new NextRequest('http://localhost:3000/api/expenses/999/monthly')
    const response = await GET(request, mockParams)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('User not found')
  })

  it('should filter by year', async () => {
    ;(query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })

    const request = new NextRequest('http://localhost:3000/api/expenses/1/monthly?year=2025')
    await GET(request, mockParams)

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("AND TO_CHAR(date, 'YYYY') = $2"),
      expect.arrayContaining([1, '2025'])
    )
  })

  it('should filter by year and month', async () => {
    ;(query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })

    const request = new NextRequest('http://localhost:3000/api/expenses/1/monthly?year=2025&month=10')
    await GET(request, mockParams)

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("AND TO_CHAR(date, 'MM') = $3"),
      expect.arrayContaining([1, '2025', '10'])
    )
  })

  it('should return correct filter info', async () => {
    ;(query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })

    const request = new NextRequest('http://localhost:3000/api/expenses/1/monthly?year=2025')
    const response = await GET(request, mockParams)
    const data = await response.json()

    expect(data.filters.year).toBe('2025')
    expect(data.filters.month).toBe('all')
  })

  it('should handle empty results', async () => {
    ;(query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })

    const request = new NextRequest('http://localhost:3000/api/expenses/1/monthly')
    const response = await GET(request, mockParams)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.monthlyBreakdown).toHaveLength(0)
    expect(data.totalExpenses).toBe(0)
  })

  it('should group categories within same month', async () => {
    const mockMonthlyData = [
      {
        month: '2025-10',
        year: '2025',
        month_number: '10',
        category: 'Food',
        count: '2',
        total: '100.00',
      },
      {
        month: '2025-10',
        year: '2025',
        month_number: '10',
        category: 'Transport',
        count: '1',
        total: '50.00',
      },
    ]

    ;(query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: mockMonthlyData, rowCount: 2 })

    const request = new NextRequest('http://localhost:3000/api/expenses/1/monthly')
    const response = await GET(request, mockParams)
    const data = await response.json()

    expect(data.monthlyBreakdown).toHaveLength(1)
    expect(data.monthlyBreakdown[0].categories).toHaveLength(2)
    expect(data.monthlyBreakdown[0].total).toBe(150.00)
    expect(data.monthlyBreakdown[0].count).toBe(3)
  })
})

