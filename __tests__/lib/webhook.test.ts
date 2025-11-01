import { triggerWebhooks, generateSignature, verifySignature } from '@/lib/webhook'
import { getWebhooksByEvent } from '@/lib/webhook-db'
import type { WebhookPayload } from '@/types/webhook'

jest.mock('@/lib/webhook-db')

// Mock fetch
global.fetch = jest.fn()

// Suppress console.log for webhook tests
const originalLog = console.log
beforeAll(() => {
  console.log = jest.fn()
})

afterAll(() => {
  console.log = originalLog
})

describe('Webhook System', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
    })
  })

  describe('triggerWebhooks', () => {
    const mockPayload: WebhookPayload = {
      event: 'expense.created',
      timestamp: new Date().toISOString(),
      data: {
        expense: {
          id: 1,
          userId: 1,
          amount: 50,
          category: 'Food',
          description: 'Test',
          date: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
    }

    it('should trigger webhooks for registered event', async () => {
      const mockWebhooks = [
        {
          id: 1,
          url: 'https://example.com/webhook',
          event: 'expense.created' as const,
          secret: null,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      ;(getWebhooksByEvent as jest.Mock).mockResolvedValueOnce(mockWebhooks)

      await triggerWebhooks('expense.created', mockPayload)

      expect(fetch).toHaveBeenCalledWith(
        'https://example.com/webhook',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'User-Agent': 'Expense-Tracker-Webhook/1.0',
          }),
          body: JSON.stringify(mockPayload),
        })
      )
    })

    it('should add signature header when secret provided', async () => {
      const mockWebhooks = [
        {
          id: 1,
          url: 'https://example.com/webhook',
          event: 'expense.created' as const,
          secret: 'my-secret',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      ;(getWebhooksByEvent as jest.Mock).mockResolvedValueOnce(mockWebhooks)

      await triggerWebhooks('expense.created', mockPayload)

      expect(fetch).toHaveBeenCalledWith(
        'https://example.com/webhook',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Webhook-Signature': expect.any(String),
          }),
        })
      )
    })

    it('should handle multiple webhooks', async () => {
      const mockWebhooks = [
        {
          id: 1,
          url: 'https://example1.com/webhook',
          event: 'expense.created' as const,
          secret: null,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          url: 'https://example2.com/webhook',
          event: 'expense.created' as const,
          secret: null,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      ;(getWebhooksByEvent as jest.Mock).mockResolvedValueOnce(mockWebhooks)

      await triggerWebhooks('expense.created', mockPayload)

      expect(fetch).toHaveBeenCalledTimes(2)
    })

    it('should handle no registered webhooks', async () => {
      ;(getWebhooksByEvent as jest.Mock).mockResolvedValueOnce([])

      await triggerWebhooks('expense.created', mockPayload)

      expect(fetch).not.toHaveBeenCalled()
    })

    it('should not throw on webhook delivery failure', async () => {
      const mockWebhooks = [
        {
          id: 1,
          url: 'https://example.com/webhook',
          event: 'expense.created' as const,
          secret: null,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      ;(getWebhooksByEvent as jest.Mock).mockResolvedValueOnce(mockWebhooks)
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      await expect(triggerWebhooks('expense.created', mockPayload)).resolves.not.toThrow()
    })
  })

  describe('generateSignature', () => {
    it('should generate consistent HMAC signature', () => {
      const payload = JSON.stringify({ test: 'data' })
      const secret = 'my-secret'

      const sig1 = generateSignature(payload, secret)
      const sig2 = generateSignature(payload, secret)

      expect(sig1).toBe(sig2)
      expect(sig1).toHaveLength(64) // SHA256 hex = 64 chars
    })

    it('should generate different signatures for different secrets', () => {
      const payload = JSON.stringify({ test: 'data' })

      const sig1 = generateSignature(payload, 'secret1')
      const sig2 = generateSignature(payload, 'secret2')

      expect(sig1).not.toBe(sig2)
    })

    it('should generate different signatures for different payloads', () => {
      const secret = 'my-secret'

      const sig1 = generateSignature(JSON.stringify({ test: 'data1' }), secret)
      const sig2 = generateSignature(JSON.stringify({ test: 'data2' }), secret)

      expect(sig1).not.toBe(sig2)
    })
  })

  describe('verifySignature', () => {
    it('should verify valid signature', () => {
      const payload = JSON.stringify({ test: 'data' })
      const secret = 'my-secret'
      const signature = generateSignature(payload, secret)

      expect(verifySignature(payload, signature, secret)).toBe(true)
    })

    it('should reject invalid signature', () => {
      const payload = JSON.stringify({ test: 'data' })
      const secret = 'my-secret'
      const invalidSignature = 'invalid'

      expect(verifySignature(payload, invalidSignature, secret)).toBe(false)
    })

    it('should reject signature with wrong secret', () => {
      const payload = JSON.stringify({ test: 'data' })
      const signature = generateSignature(payload, 'secret1')

      expect(verifySignature(payload, signature, 'secret2')).toBe(false)
    })

    it('should reject signature for tampered payload', () => {
      const payload = JSON.stringify({ test: 'data' })
      const secret = 'my-secret'
      const signature = generateSignature(payload, secret)

      const tamperedPayload = JSON.stringify({ test: 'tampered' })

      expect(verifySignature(tamperedPayload, signature, secret)).toBe(false)
    })
  })
})

