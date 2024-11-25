// SearchInput.tsx
import React, { useState, useEffect, useCallback } from 'react'
import { debounce } from 'lodash-es'
import closeIcon from '~/assets/icons/close.svg'
import { useAtom } from 'jotai'
import { searchQueryAtom } from '~app/state/agentAtom'
import { t } from 'i18next'
import logger from '~utils/logger'
export const SearchInput: React.FC = () => {
  const [query, setQuery] = useState('')
  const [, setSearchQuery] = useAtom(searchQueryAtom)
  // Debounce the search query to avoid too many search operations
  const debounceSearch = useCallback(
    debounce((nextValue) => {
      logger.log('Searching for:', nextValue)
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
      <div className="shadow focus:outline-none focus:border-blue-500 flex flex-row items-center py-1 px-1">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={t('Search Prompts')}
          className="w-full bg-transparent rounded-full"
        />
        {query ? (
          <img src={closeIcon} className="w-4 h-4 cursor-pointer" onClick={handleClearSearch} />
        ) : (
          <div className="w-4" />
        )}
      </div>

      <button
        type="button"
        className="rounded bg-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
      >
        {t('Search')}
      </button>
    </form>
  )
}
