import { useEffect } from 'react'

import business from './business.json'
import { readableOn } from './lib/format'
import ClientView from './views/ClientView'

export default function App() {
  // White-label: акцентный цвет и название берём из business.json
  useEffect(() => {
    const root = document.documentElement.style
    root.setProperty('--theme-color', business.themeColor)
    root.setProperty('--theme-color-contrast', readableOn(business.themeColor))
    document.title = business.name
  }, [])

  return <ClientView />
}
