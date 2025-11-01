// Database Models
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: number;
  userId: number;
  amount: number;
  category: string;
  description: string | null;
  date: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Request Body Types
export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export interface CreateExpenseRequest {
  userId: number;
  amount: number;
  category: string;
  description?: string;
  date?: string;
}

export interface UpdateExpenseRequest {
  userId?: number;
  amount?: number;
  category?: string;
  description?: string;
  date?: string;
}

// Response Body Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: string;
  message?: string;
}

export interface UserListResponse {
  users: User[];
  count: number;
}

export interface UserResponse {
  user: User;
}

export interface ExpenseListResponse {
  userId: number;
  expenses: Expense[];
  count: number;
}

export interface ExpenseResponse {
  expense: Expense;
}

export interface CategoryTotal {
  category: string;
  count: number;
  total: number;
  average: number;
  minAmount: number;
  maxAmount: number;
  percentage: string;
}

export interface ExpenseTotalResponse {
  userId: number;
  totalExpenses: number;
  totalTransactions: number;
  byCategory: CategoryTotal[];
}

export interface MonthlyCategory {
  category: string;
  total: number;
  count: number;
}

export interface MonthlyBreakdown {
  month: string;
  year: string;
  monthNumber: string;
  total: number;
  count: number;
  categories: MonthlyCategory[];
}

export interface MonthlySpendingResponse {
  userId: number;
  totalExpenses: number;
  totalTransactions: number;
  monthlyBreakdown: MonthlyBreakdown[];
  filters: {
    year: string;
    month: string;
  };
}

// Query Parameters
export interface ExpenseQueryParams {
  category?: string;
  startDate?: string;
  endDate?: string;
}

export interface UserQueryParams {
  email?: string;
}

export interface MonthlyQueryParams {
  year?: string;
  month?: string;
}

