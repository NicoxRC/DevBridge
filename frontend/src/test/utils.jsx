import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { I18nProvider } from '../i18n'

const ROUTER_FLAGS = { v7_startTransition: true, v7_relativeSplatPath: true }

/** Renders `ui` with i18n (English by default) and a router positioned at `route`. */
export function renderWithRouter(ui, { route = '/', lang = 'en' } = {}) {
  localStorage.setItem('devbridge_lang', lang)
  return render(
    <I18nProvider>
      <MemoryRouter initialEntries={[route]} future={ROUTER_FLAGS}>{ui}</MemoryRouter>
    </I18nProvider>
  )
}

/**
 * Renders a page at `route`, matched by `path` (e.g. '/projects/:id' to read params).
 * Navigating anywhere else renders "Moved to <url>", so tests can assert redirects.
 */
export function renderPage(ui, { route = '/', path, lang } = {}) {
  return renderWithRouter(
    <Routes>
      <Route path={path ?? route.split('?')[0]} element={ui} />
      <Route path="*" element={<CurrentUrl />} />
    </Routes>,
    { route, lang },
  )
}

function CurrentUrl() {
  const { pathname, search } = useLocation()
  return <p>Moved to {pathname}{search}</p>
}
