import { GET, POST } from '@/app/api/webhooks/route'
import { getAllWebhooks, createWebhook } from '@/lib/webhook-db'
import { NextRequest } from 'next/server'

jest.mock('@/lib/webhook-db')

describe('Webhooks API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/webhooks', () => {
    it('should return all webhooks', async () => {
      const mockWebhooks = [
        {
          id: 1,
          url: 'https://example.com/webhook',
          event: 'expense.created' as const,
          secret: 'secret123',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      ;(getAllWebhooks as jest.Mock).mockResolvedValueOnce(mockWebhooks)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.webhooks).toHaveLength(1)
      expect(data.count).toBe(1)
      expect(data.webhooks[0].url).toBe('https://example.com/webhook')
    })

    it('should return empty array when no webhooks', async () => {
      ;(getAllWebhooks as jest.Mock).mockResolvedValueOnce([])

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.webhooks).toHaveLength(0)
      expect(data.count).toBe(0)
    })

    it('should handle database errors', async () => {
      ;(getAllWebhooks as jest.Mock).mockRejectedValueOnce(new Error('DB error'))

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch webhooks')
    })
  })

  describe('POST /api/webhooks', () => {
    it('should create a new webhook', async () => {
      const mockWebhook = {
        id: 1,
        url: 'https://example.com/webhook',
        event: 'expense.created' as const,
        secret: 'secret123',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(createWebhook as jest.Mock).mockResolvedValueOnce(mockWebhook)

      const request = new NextRequest('http://localhost:3000/api/webhooks', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          url: 'https://example.com/webhook',
          event: 'expense.created',
          secret: 'secret123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.message).toBe('Webhook registered successfully')
      expect(data.webhook.url).toBe('https://example.com/webhook')
    })

    it('should create webhook without secret', async () => {
      const mockWebhook = {
        id: 1,
        url: 'https://example.com/webhook',
        event: 'expense.created' as const,
        secret: null,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(createWebhook as jest.Mock).mockResolvedValueOnce(mockWebhook)

      const request = new NextRequest('http://localhost:3000/api/webhooks', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          url: 'https://example.com/webhook',
          event: 'expense.created',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.webhook.secret).toBeNull()
    })

    it('should reject request without content-type', async () => {
      const request = new NextRequest('http://localhost:3000/api/webhooks', {
        method: 'POST',
        body: JSON.stringify({ url: 'https://example.com/webhook', event: 'expense.created' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Content-Type must be application/json')
    })

    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/webhooks', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url: 'https://example.com/webhook' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing required fields: url, event')
    })

    it('should validate URL format', async () => {
      const request = new NextRequest('http://localhost:3000/api/webhooks', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url: 'invalid-url', event: 'expense.created' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid URL format')
    })

    it('should validate event type', async () => {
      const request = new NextRequest('http://localhost:3000/api/webhooks', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          url: 'https://example.com/webhook',
          event: 'invalid.event',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid event type')
    })

    it('should handle invalid JSON', async () => {
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

