// Sidebar.tsx
import { useAtom } from 'jotai'
import React from 'react'
import { categoryAtom } from '~app/state/agentAtom'
import { Category, categories } from '~app/state/data/categoriesData'
import { cx } from '~utils'

const Sidebar: React.FC = () => {
  const [category, setCategory] = useAtom(categoryAtom)

  return (
    <div className="w-64 h-full overflow-y-auto bg-gray-100 p-5">
      {categories.map((item: Category, index: number) => {
        const isMainCategorySelected = category.category === item.category && category.subcategory === null
        return (
          <div key={index} className="mb-4">
            <h3
              className={cx(
                'font-bold text-lg',
                'mt-1 hover:text-blue-500 cursor-pointer',
                isMainCategorySelected && 'text-blue-500',
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
              {item.category}
            </h3>
            {category.category === item.category && (
              <ul className="list-none mt-2">
                {item.subcategories.map((sub: string, subIndex: number) => (
                  <li
                    key={subIndex}
                    className={cx(
                      'ml-4 mt-1 hover:text-blue-500 cursor-pointer',
                      category.subcategory === sub && 'text-blue-500',
                    )}
                    onClick={() => {
                      setCategory((prev) =>
                        prev.subcategory === sub
                          ? { category: null, subcategory: null }
                          : { category: item.category, subcategory: sub },
                      )
                    }}
                  >
                    {sub}
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
