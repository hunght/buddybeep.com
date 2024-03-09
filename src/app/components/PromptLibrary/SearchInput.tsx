// SearchInput.tsx
import React, { useState, useEffect, useCallback } from 'react'
import { debounce } from 'lodash'
import closeIcon from '~/assets/icons/close.svg'
import { useAtom } from 'jotai'
import { searchQueryAtom } from '~app/state/agentAtom'
export const SearchInput: React.FC = () => {
  const [query, setQuery] = useState('')
  const [, setSearchQuery] = useAtom(searchQueryAtom)
  // Debounce the search query to avoid too many search operations
  const debounceSearch = useCallback(
    debounce((nextValue) => {
      console.log('Searching for:', nextValue)
      setSearchQuery(nextValue)
    }, 500),
    [],
  )

  useEffect(() => {
    debounceSearch(query)
  }, [query, debounceSearch])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  const handleClearSearch = () => {
    setQuery('')
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    debounceSearch(query)
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <div className="border rounded shadow focus:outline-none focus:border-blue-500 flex flex-row items-center py-2 px-1">
        <input type="text" value={query} onChange={handleInputChange} placeholder="Search..." className="w-full" />
        {query ? (
          <img src={closeIcon} className="w-4 h-4 cursor-pointer" onClick={handleClearSearch} />
        ) : (
          <div className="w-4" />
        )}
      </div>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Search
      </button>
    </form>
  )
}
