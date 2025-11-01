import { GET, PUT, DELETE } from '@/app/api/users/[id]/route'
import { query } from '@/lib/db'
import { NextRequest } from 'next/server'

jest.mock('@/lib/db')

const mockParams = { params: { id: '1' } }

describe('Users [id] API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/users/[id]', () => {
    it('should return a user by id', async () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com', created_at: new Date(), updated_at: new Date() }

      ;(query as jest.Mock).mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 })

      const request = new NextRequest('http://localhost:3000/api/users/1')
      const response = await GET(request, mockParams)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user.id).toBe(1)
      expect(data.user.name).toBe('John Doe')
      expect(data.user).toHaveProperty('createdAt')
    })

    it('should return 404 if user not found', async () => {
      ;(query as jest.Mock).mockResolvedValueOnce({ rows: [], rowCount: 0 })

      const request = new NextRequest('http://localhost:3000/api/users/999')
      const response = await GET(request, mockParams)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('User not found')
    })

    it('should handle database errors', async () => {
      ;(query as jest.Mock).mockRejectedValueOnce(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/users/1')
      const response = await GET(request, mockParams)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch user')
    })
  })

  describe('PUT /api/users/[id]', () => {
    it('should update user name', async () => {
      const updatedUser = { id: 1, name: 'John Updated', email: 'john@example.com', created_at: new Date(), updated_at: new Date() }

      ;(query as jest.Mock).mockResolvedValueOnce({ rows: [updatedUser], rowCount: 1 })

      const request = new NextRequest('http://localhost:3000/api/users/1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'John Updated' }),
      })

      const response = await PUT(request, mockParams)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('User updated successfully')
      expect(data.user.name).toBe('John Updated')
    })

    it('should update user email', async () => {
      const updatedUser = { id: 1, name: 'John Doe', email: 'newemail@example.com', created_at: new Date(), updated_at: new Date() }

      ;(query as jest.Mock).mockResolvedValueOnce({ rows: [updatedUser], rowCount: 1 })

      const request = new NextRequest('http://localhost:3000/api/users/1', {
        method: 'PUT',
        body: JSON.stringify({ email: 'newemail@example.com' }),
      })

      const response = await PUT(request, mockParams)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user.email).toBe('newemail@example.com')
    })

    it('should validate email format on update', async () => {
      const request = new NextRequest('http://localhost:3000/api/users/1', {
        method: 'PUT',
        body: JSON.stringify({ email: 'invalid-email' }),
      })

      const response = await PUT(request, mockParams)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid email format')
    })

    it('should return error if no fields to update', async () => {
      const request = new NextRequest('http://localhost:3000/api/users/1', {
        method: 'PUT',
        body: JSON.stringify({}),
      })

      const response = await PUT(request, mockParams)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('No fields to update')
    })

    it('should return 404 if user not found', async () => {
      ;(query as jest.Mock).mockResolvedValueOnce({ rows: [], rowCount: 0 })

      const request = new NextRequest('http://localhost:3000/api/users/999', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated' }),
      })

      const response = await PUT(request, mockParams)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('User not found')
    })

    it('should handle duplicate email on update', async () => {
      const error = new Error('duplicate key value violates unique constraint')
      ;(query as jest.Mock).mockRejectedValueOnce(error)

      const request = new NextRequest('http://localhost:3000/api/users/1', {
        method: 'PUT',
        body: JSON.stringify({ email: 'existing@example.com' }),
      })

      const response = await PUT(request, mockParams)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toBe('Email already exists')
    })
  })

  describe('DELETE /api/users/[id]', () => {
    it('should delete a user', async () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com', created_at: new Date(), updated_at: new Date() }

      ;(query as jest.Mock).mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 })

      const request = new NextRequest('http://localhost:3000/api/users/1')
      const response = await DELETE(request, mockParams)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toContain('User deleted successfully')
      expect(data.user.id).toBe(1)
    })

    it('should return 404 if user not found', async () => {
      ;(query as jest.Mock).mockResolvedValueOnce({ rows: [], rowCount: 0 })

      const request = new NextRequest('http://localhost:3000/api/users/999')
      const response = await DELETE(request, mockParams)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('User not found')
    })

    it('should handle database errors', async () => {
      ;(query as jest.Mock).mockRejectedValueOnce(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/users/1')
      const response = await DELETE(request, mockParams)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to delete user')
    })
  })
})

