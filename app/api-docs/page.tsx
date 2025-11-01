'use client'

import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'
import { useEffect, useState } from 'react'

export default function ApiDocs() {
  const [spec, setSpec] = useState(null)

  useEffect(() => {
    fetch('/openapi.yaml')
      .then(res => res.text())
      .then(text => {
        const yaml = require('yaml')
        const parsed = yaml.parse(text)
        setSpec(parsed)
      })
      .catch(err => console.error('Failed to load OpenAPI spec:', err))
  }, [])

  if (!spec) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading API Documentation...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="api-docs-container">
      <SwaggerUI spec={spec} />
    </div>
  )
}

