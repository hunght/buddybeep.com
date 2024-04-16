import React from 'react'

const LoadingOverlay: React.FunctionComponent<{ loading: boolean }> = ({ loading }) => {
  if (!loading) return null

  return (
    <div className="absolute inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="w-8 h-8 border-4 border-blue-500 border-dotted rounded-full animate-spin"></div>
    </div>
  )
}

export default LoadingOverlay
