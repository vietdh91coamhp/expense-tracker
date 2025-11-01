import { closePool } from '@/lib/db'

jest.mock('pg', () => {
  const mPool = {
    query: jest.fn(),
    end: jest.fn(),
  }
  return {
    Pool: jest.fn(() => mPool),
  }
})

// Import after mocking
import { getPool } from '@/lib/db'

describe('Database Pool Management', () => {
  let poolInstance: any

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('closePool', () => {
    it('should close existing pool', async () => {
      poolInstance = getPool()
      
      await closePool()

      expect(poolInstance.end).toHaveBeenCalled()
    })

    it('should handle closing when no pool exists', async () => {
      // Close first time
      await closePool()
      
      // Closing again shouldn't throw
      await expect(closePool()).resolves.not.toThrow()
    })
  })
})

