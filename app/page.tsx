export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-2xl w-full">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Expense Tracker API
        </h1>
        <div className="bg-gray-100 rounded-lg p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Available Endpoints:</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <code className="bg-white px-2 py-1 rounded">GET /api/health</code> - Health check
              </li>
              <li>
                <code className="bg-white px-2 py-1 rounded">POST /api/init</code> - Initialize database
              </li>
              <li>
                <code className="bg-white px-2 py-1 rounded">POST /api/reset</code> - Drop database tables
              </li>
              <li className="mt-4">
                <strong>Users:</strong>
              </li>
              <li>
                <code className="bg-white px-2 py-1 rounded">GET /api/users</code> - Get all users
              </li>
              <li>
                <code className="bg-white px-2 py-1 rounded">POST /api/users</code> - Create user
              </li>
              <li>
                <code className="bg-white px-2 py-1 rounded">GET /api/users/[id]</code> - Get user by ID
              </li>
              <li>
                <code className="bg-white px-2 py-1 rounded">PUT /api/users/[id]</code> - Update user
              </li>
              <li>
                <code className="bg-white px-2 py-1 rounded">DELETE /api/users/[id]</code> - Delete user
              </li>
              <li className="mt-4">
                <strong>Expenses:</strong>
              </li>
              <li>
                <code className="bg-white px-2 py-1 rounded">POST /api/expenses</code> - Create expense
              </li>
              <li>
                <code className="bg-white px-2 py-1 rounded">GET /api/expenses/[userId]</code> - Get user expenses
              </li>
              <li>
                <code className="bg-white px-2 py-1 rounded">GET /api/expenses/[userId]/total</code> - Get total by category
              </li>
              <li>
                <code className="bg-white px-2 py-1 rounded">GET /api/expenses/[userId]/monthly</code> - Get monthly spending
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}

