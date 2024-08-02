import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'jotai'
import { myAtomStore } from '~app/state/store'
import LinkedInReplyGenerator from './components/LinkedInReplyGenerator'

function mount() {
  const root = document.createElement('div')
  root.id = 'buddy-beep-linkedin-reply-generator'
  document.body.appendChild(root)

  createRoot(root).render(
    <Provider store={myAtomStore}>
      <LinkedInReplyGenerator />
    </Provider>,
  )
}

mount()
