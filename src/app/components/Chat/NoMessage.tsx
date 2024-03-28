import React, { FC, useMemo } from 'react'
import logo from '~/assets/santa-logo.png'
import { FaArrowRightLong } from 'react-icons/fa6'
import { useTranslation } from 'react-i18next'

export const NoMessage: FC<{ onClick: (prompt: string) => void }> = ({ onClick }) => {
  const { t } = useTranslation()
  const textArrays = useMemo(
    () => [
      t('Tell me something about the Big Bang so that I can explain it to my 5-year-old child'),
      t("Please provide me with 10 gift ideas for my friend's birthday"),
      t('Generate five catchy titles for my writing about the use case of ChatGPT'),
    ],
    [t],
  )
  return (
    <div className="bg-gray-100 dark:bg-gray-800 min-h-screen flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg dark:bg-gray-800">
        <div className="flex flex-col items-center">
          <div className="mb-4">
            {/* Replace with your actual logo */}
            <img src={logo} alt="Logo" className="w-20 h-20" />
          </div>
          <h1 className="text-2xl font-bold mb-6">{t('How can I assist you today?')}</h1>

          {textArrays.map((text, index) => (
            <div key={index} className="w-full border-b-2 mb-4 ">
              <button
                onClick={() => {
                  onClick(text)
                }}
                className="text-left w-full py-2 focus:outline-none hover:bg-gray-100 transition-colors flex flex-row justify-center items-center px-1"
              >
                {text} <FaArrowRightLong />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
