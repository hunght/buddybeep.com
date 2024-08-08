import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'jotai'
import { myAtomStore } from '~app/state/store'
import RedditReplyGenerator from './components/RedditReplyGenerator'

function mount() {
  const root = document.createElement('div')
  root.id = 'buddy-beep-reddit-reply-generator'
  document.body.appendChild(root)

  createRoot(root).render(
    <Provider store={myAtomStore}>
      <RedditReplyGenerator />
    </Provider>,
  )
}

mount()
