import { GET, DELETE, PATCH } from '@/app/api/webhooks/[id]/route'
import { getWebhookById, deleteWebhook, updateWebhookStatus } from '@/lib/webhook-db'
import { NextRequest } from 'next/server'

jest.mock('@/lib/webhook-db')

const mockParams = { params: { id: '1' } }

describe('Webhooks [id] API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/webhooks/[id]', () => {
    it('should return webhook by id', async () => {
      const mockWebhook = {
        id: 1,
        url: 'https://example.com/webhook',
        event: 'expense.created' as const,
        secret: 'secret123',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(getWebhookById as jest.Mock).mockResolvedValueOnce(mockWebhook)

      const request = new NextRequest('http://localhost:3000/api/webhooks/1')
      const response = await GET(request, mockParams)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.webhook.id).toBe(1)
      expect(data.webhook.url).toBe('https://example.com/webhook')
    })

    it('should return 404 if webhook not found', async () => {
      ;(getWebhookById as jest.Mock).mockResolvedValueOnce(null)

      const request = new NextRequest('http://localhost:3000/api/webhooks/999')
      const response = await GET(request, mockParams)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Webhook not found')
    })

    it('should handle database errors', async () => {
      ;(getWebhookById as jest.Mock).mockRejectedValueOnce(new Error('DB error'))

      const request = new NextRequest('http://localhost:3000/api/webhooks/1')
      const response = await GET(request, mockParams)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch webhook')
    })
  })

  describe('DELETE /api/webhooks/[id]', () => {
    it('should delete a webhook', async () => {
      ;(deleteWebhook as jest.Mock).mockResolvedValueOnce(true)

      const request = new NextRequest('http://localhost:3000/api/webhooks/1')
      const response = await DELETE(request, mockParams)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Webhook deleted successfully')
      expect(deleteWebhook).toHaveBeenCalledWith(1)
    })

    it('should return 404 if webhook not found', async () => {
      ;(deleteWebhook as jest.Mock).mockResolvedValueOnce(false)

      const request = new NextRequest('http://localhost:3000/api/webhooks/999')
      const response = await DELETE(request, mockParams)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Webhook not found')
    })

    it('should handle database errors', async () => {
      ;(deleteWebhook as jest.Mock).mockRejectedValueOnce(new Error('DB error'))

      const request = new NextRequest('http://localhost:3000/api/webhooks/1')
      const response = await DELETE(request, mockParams)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to delete webhook')
    })
  })

  describe('PATCH /api/webhooks/[id]', () => {
    it('should update webhook status', async () => {
      const mockWebhook = {
        id: 1,
        url: 'https://example.com/webhook',
        event: 'expense.created' as const,
        secret: null,
        active: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(updateWebhookStatus as jest.Mock).mockResolvedValueOnce(mockWebhook)

      const request = new NextRequest('http://localhost:3000/api/webhooks/1', {
        method: 'PATCH',
        body: JSON.stringify({ active: false }),
      })

      const response = await PATCH(request, mockParams)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Webhook updated successfully')
      expect(data.webhook.active).toBe(false)
      expect(updateWebhookStatus).toHaveBeenCalledWith(1, false)
    })

    it('should validate active field', async () => {
      const request = new NextRequest('http://localhost:3000/api/webhooks/1', {
        method: 'PATCH',
        body: JSON.stringify({ active: 'invalid' }),
      })

      const response = await PATCH(request, mockParams)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('active')
    })

    it('should return 404 if webhook not found', async () => {
      ;(updateWebhookStatus as jest.Mock).mockResolvedValueOnce(null)

      const request = new NextRequest('http://localhost:3000/api/webhooks/999', {
        method: 'PATCH',
        body: JSON.stringify({ active: true }),
      })

      const response = await PATCH(request, mockParams)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Webhook not found')
    })

    it('should handle database errors', async () => {
      ;(updateWebhookStatus as jest.Mock).mockRejectedValueOnce(new Error('DB error'))

      const request = new NextRequest('http://localhost:3000/api/webhooks/1', {
        method: 'PATCH',
        body: JSON.stringify({ active: true }),
      })

      const response = await PATCH(request, mockParams)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to update webhook')
    })
  })
})

