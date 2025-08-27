'use client'

import { useState } from 'react'
import CustomDatePicker from '@/components/CustomDatePicker'

export default function TestDatePicker() {
  const [dateValue, setDateValue] = useState(null)
  
  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Date Picker</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Date Picker with Clear Button:
          </label>
          <CustomDatePicker
            value={dateValue}
            onChange={(date) => {
              console.log('Date changed to:', date)
              setDateValue(date)
            }}
            placeholder="Select a date"
            allowClear={true}
          />
        </div>
        
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="text-sm">
            <strong>Current Value:</strong> {dateValue ? dateValue.toISOString() : 'null'}
          </p>
        </div>
        
        <div className="mt-4">
          <button
            onClick={() => setDateValue(new Date())}
            className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
          >
            Set Today
          </button>
          <button
            onClick={() => setDateValue(null)}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Clear Programmatically
          </button>
        </div>
      </div>
    </div>
  )
}