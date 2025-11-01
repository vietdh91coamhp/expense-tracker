// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock environment variables
process.env.DB_HOST = 'localhost'
process.env.DB_PORT = '5432'
process.env.DB_NAME = 'expense_tracker_test'
process.env.DB_USER = 'postgres'
process.env.DB_PASSWORD = 'postgres'

// Suppress console.error in tests (expected errors are tested explicitly)
const originalError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalError
})

