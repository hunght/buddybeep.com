// Sidebar.tsx
import React from 'react'
import { categories, Category } from './categoriesData'

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 h-full overflow-y-auto bg-gray-100 p-5">
      {categories.map((item: Category, index: number) => (
        <div key={index} className="mb-4">
          <h3 className="font-bold text-lg">{item.category}</h3>
          <ul className="list-none mt-2">
            {item.subcategories.map((sub: string, subIndex: number) => (
              <li key={subIndex} className="mt-1 hover:text-blue-500 cursor-pointer">
                {sub}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default Sidebar
