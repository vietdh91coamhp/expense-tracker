import { Pool } from 'pg'

// Mock the pg module
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
import { getPool, query } from '@/lib/db'

describe('Database Module', () => {
  let poolInstance: any

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset the module to get a fresh pool instance
    jest.resetModules()
  })

  describe('getPool', () => {
    it('should create a new pool instance', () => {
      const pool = getPool()
      expect(pool).toBeDefined()
    })

    it('should return the same pool instance on subsequent calls', () => {
      const pool1 = getPool()
      const pool2 = getPool()
      expect(pool1).toBe(pool2)
    })
  })

  describe('query', () => {
    beforeEach(() => {
      poolInstance = getPool()
    })

    it('should execute a query successfully', async () => {
      const mockResult = {
        rows: [{ id: 1, name: 'Test' }],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: [],
      }

      ;(poolInstance.query as jest.Mock).mockResolvedValueOnce(mockResult)

      const result = await query('SELECT * FROM users WHERE id = $1', [1])

      expect(result).toEqual(mockResult)
      expect(poolInstance.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', [1])
    })

    it('should execute query without parameters', async () => {
      const mockResult = {
        rows: [{ id: 1 }, { id: 2 }],
        rowCount: 2,
        command: 'SELECT',
        oid: 0,
        fields: [],
      }

      ;(poolInstance.query as jest.Mock).mockResolvedValueOnce(mockResult)

      const result = await query('SELECT * FROM users')

      expect(result).toEqual(mockResult)
      expect(poolInstance.query).toHaveBeenCalledWith('SELECT * FROM users', undefined)
    })

    it('should handle query errors', async () => {
      const error = new Error('Database connection failed')
      ;(poolInstance.query as jest.Mock).mockRejectedValueOnce(error)

      await expect(query('SELECT * FROM users')).rejects.toThrow('Database connection failed')
    })

    it('should log query execution time', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      const mockResult = {
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: [],
      }

      ;(poolInstance.query as jest.Mock).mockResolvedValueOnce(mockResult)

      await query('SELECT * FROM users')

      expect(consoleSpy).toHaveBeenCalledWith(
        'Executed query',
        expect.objectContaining({
          text: 'SELECT * FROM users',
          rows: 0,
          duration: expect.any(Number),
        })
      )

      consoleSpy.mockRestore()
    })
  })
})

