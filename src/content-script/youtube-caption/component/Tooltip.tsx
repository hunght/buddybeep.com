import React, { useState } from 'react'

export const Tooltip: React.FC<{ text: string; children: React.ReactElement }> = ({ text, children }) => {
  const [isTooltipVisible, setTooltipVisible] = useState(false)
  if (!children) return null
  return (
    <div className="relative inline-block">
      <div onMouseEnter={() => setTooltipVisible(true)} onMouseLeave={() => setTooltipVisible(false)}>
        {children}
      </div>
      {isTooltipVisible && (
        <div className="absolute z-10 w-40 p-2 mt-2 -right-1/2  text-sm text-white bg-black rounded-lg">
          {text}
          <div className="w-4 h-4 absolute bg-black transform rotate-45 -top-2 left-1/2"></div>
        </div>
      )}
    </div>
  )
}
