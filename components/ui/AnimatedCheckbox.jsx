import React from 'react'

export default function Checkbox({ checked, onChange, label, ...props }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer appearance-none w-5 h-5 border-2 border-black rounded transition-colors duration-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-green-400"
        style={{ minWidth: 14, minHeight: 14 }}
        {...props}
      />
      <span
        className="absolute w-5 h-5 flex items-center justify-center pointer-events-none opacity-0 scale-75 peer-checked:opacity-100 peer-checked:scale-100 transition-all duration-300"
        aria-hidden="true"
      >
        <svg
          className="text-green-600"
          width="12"
          height="12"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 12L10 17L17 7"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="ml-3 text-base">{label}</span>
      <style jsx>{`
        input:checked {
          border-color: #22c55e; /* Tailwind green-500 */
        }
      `}</style>
    </label>
  )
}
