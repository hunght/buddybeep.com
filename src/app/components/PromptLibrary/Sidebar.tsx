// Sidebar.tsx
import { t } from 'i18next'
import { useAtom } from 'jotai'
import React from 'react'

import { categoryAtom } from '~app/state/agentAtom'
import { Category, categories } from '~app/state/data/categoriesData'
import { cx } from '~utils'

const Sidebar: React.FC = () => {
  const [category, setCategory] = useAtom(categoryAtom)

  return (
    <div className="w-64 h-full overflow-y-auto dark:text-gray-400  p-5 rounded-lg">
      {categories.map((item: Category, index: number) => {
        const isMainCategorySelected = category.category === item.category && category.subcategory === null
        return (
          <div key={index} className="mb-4">
            <h3
              className={cx(
                'font-semibold text-lg rounded-sm',
                'mt-1 hover:text-primary-text cursor-pointer hover:underline',
                isMainCategorySelected && 'text-primary-text font-bold',
              )}
              onClick={() => {
                setCategory((prev) => {
                  if (prev.category === item.category) {
                    if (prev.subcategory === null) {
                      return { category: null, subcategory: null }
                    }
                  }
                  return { category: item.category, subcategory: null }
                })
              }}
            >
              {t(item.category)}
            </h3>
            {category.category === item.category && (
              <ul className="list-none mt-2">
                {item.subcategories.map((sub: string, subIndex: number) => (
                  <li
                    key={subIndex}
                    className={cx(
                      'ml-4 mt-1 hover:text-primary-text cursor-pointer hover:underline',
                      category.subcategory === sub && 'text-primary-text font-semibold',
                    )}
                    onClick={() => {
                      setCategory((prev) =>
                        prev.subcategory === sub
                          ? { category: null, subcategory: null }
                          : { category: item.category, subcategory: sub },
                      )
                    }}
                  >
                    {t(sub)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default Sidebar
