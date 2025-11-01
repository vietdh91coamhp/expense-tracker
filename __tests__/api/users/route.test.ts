import { GET, POST } from '@/app/api/users/route'
import { query } from '@/lib/db'
import { NextRequest } from 'next/server'

jest.mock('@/lib/db')

describe('Users API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/users', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', created_at: new Date(), updated_at: new Date() },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', created_at: new Date(), updated_at: new Date() },
      ]

      ;(query as jest.Mock).mockResolvedValueOnce({ rows: mockUsers, rowCount: 2 })

      const request = new NextRequest('http://localhost:3000/api/users')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.users).toHaveLength(2)
      expect(data.count).toBe(2)
      expect(data.users[0]).toHaveProperty('createdAt')
      expect(data.users[0]).toHaveProperty('updatedAt')
    })

    it('should filter users by email', async () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com', created_at: new Date(), updated_at: new Date() }

      ;(query as jest.Mock).mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 })

      const request = new NextRequest('http://localhost:3000/api/users?email=john@example.com')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.users).toHaveLength(1)
      expect(data.users[0].email).toBe('john@example.com')
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('AND email = $1'),
        ['john@example.com']
      )
    })

    it('should handle database errors', async () => {
      ;(query as jest.Mock).mockRejectedValueOnce(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/users')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch users')
      expect(data.details).toBe('Database error')
    })
  })

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com', created_at: new Date(), updated_at: new Date() }

      ;(query as jest.Mock).mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 })

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'John Doe', email: 'john@example.com' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.message).toBe('User created successfully')
      expect(data.user).toHaveProperty('id')
      expect(data.user.name).toBe('John Doe')
    })

    it('should reject request without content-type header', async () => {
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify({ name: 'John Doe', email: 'john@example.com' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Content-Type must be application/json')
    })

    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'John Doe' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing required fields: name, email')
    })

    it('should validate email format', async () => {
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'John Doe', email: 'invalid-email' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid email format')
    })

    it('should handle duplicate email error', async () => {
      const error = new Error('duplicate key value violates unique constraint')
      ;(query as jest.Mock).mockRejectedValueOnce(error)

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'John Doe', email: 'john@example.com' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toBe('Email already exists')
    })

    it('should handle invalid JSON', async () => {
      // Suppress the specific console.error for this test
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      
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
      
      consoleErrorSpy.mockRestore()
    })
  })
})

