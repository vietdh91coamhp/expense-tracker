import { GET, POST } from '@/app/api/expenses/route'
import { query } from '@/lib/db'
import { NextRequest } from 'next/server'

jest.mock('@/lib/db')

describe('Expenses API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/expenses', () => {
    it('should return all expenses', async () => {
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

      ;(query as jest.Mock).mockResolvedValueOnce({ rows: mockExpenses, rowCount: 1 })

      const request = new NextRequest('http://localhost:3000/api/expenses')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.expenses).toHaveLength(1)
      expect(data.expenses[0]).toHaveProperty('userId')
      expect(data.expenses[0]).toHaveProperty('createdAt')
    })

    it('should filter expenses by userId', async () => {
      ;(query as jest.Mock).mockResolvedValueOnce({ rows: [], rowCount: 0 })

      const request = new NextRequest('http://localhost:3000/api/expenses?userId=1')
      await GET(request)

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('AND user_id = $1'),
        expect.arrayContaining([1])
      )
    })

    it('should filter expenses by category', async () => {
      ;(query as jest.Mock).mockResolvedValueOnce({ rows: [], rowCount: 0 })

      const request = new NextRequest('http://localhost:3000/api/expenses?category=Food')
      await GET(request)

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('AND category = $1'),
        expect.arrayContaining(['Food'])
      )
    })

    it('should filter expenses by date range', async () => {
      ;(query as jest.Mock).mockResolvedValueOnce({ rows: [], rowCount: 0 })

      const request = new NextRequest('http://localhost:3000/api/expenses?startDate=2025-01-01&endDate=2025-01-31')
      await GET(request)

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('AND date >= $1'),
        expect.arrayContaining(['2025-01-01', '2025-01-31'])
      )
    })
  })

  describe('POST /api/expenses', () => {
    it('should create a new expense', async () => {
      const mockExpense = { 
        id: 1, 
        user_id: 1, 
        amount: 50.00, 
        category: 'Food', 
        description: 'Groceries',
        date: new Date('2025-01-15'),
        created_at: new Date(),
        updated_at: new Date()
      }

      ;(query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 }) // user check
        .mockResolvedValueOnce({ rows: [mockExpense], rowCount: 1 }) // insert

      const request = new NextRequest('http://localhost:3000/api/expenses', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ 
          userId: 1, 
          amount: 50.00, 
          category: 'Food',
          description: 'Groceries',
          date: '2025-01-15'
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.message).toBe('Expense created successfully')
      expect(data.expense).toHaveProperty('userId')
    })

    it('should reject request without content-type', async () => {
      const request = new NextRequest('http://localhost:3000/api/expenses', {
        method: 'POST',
        body: JSON.stringify({ userId: 1, amount: 50, category: 'Food' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Content-Type must be application/json')
    })

    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/expenses', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId: 1, amount: 50 }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing required fields: userId, amount, category')
    })

    it('should return 404 if user not found', async () => {
      ;(query as jest.Mock).mockResolvedValueOnce({ rows: [], rowCount: 0 })

      const request = new NextRequest('http://localhost:3000/api/expenses', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId: 999, amount: 50, category: 'Food' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('User not found')
    })

    it('should handle invalid JSON', async () => {
      // Mock the json() method to throw SyntaxError
      const mockJson = jest.fn().mockRejectedValue(new SyntaxError('Unexpected token'))
      
      const request = {
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: mockJson,
      } as any

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid JSON in request body')
    })
  })
})

