import { describe, expect, it, vi } from 'vitest'
import { render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DICTIONARIES, I18nProvider, LanguageSwitch, useI18n } from './i18n'

const wrapper = ({ children }) => <I18nProvider>{children}</I18nProvider>

const keysOf = (obj, prefix = '') => Object.entries(obj).flatMap(([k, v]) =>
  typeof v === 'object' ? keysOf(v, `${prefix}${k}.`) : [`${prefix}${k}`])

describe('useI18n', () => {
  it('translates keys and fills placeholders in the saved language', () => {
    localStorage.setItem('devbridge_lang', 'es')
    const { result } = renderHook(() => useI18n(), { wrapper })

    expect(result.current.t('common.weeks', { n: 6 })).toBe('6 semanas')
    expect(result.current.translateError('Incorrect email or password.')).toBe('Correo o contraseña incorrectos.')
  })

  it('returns unknown keys and errors unchanged', () => {
    localStorage.setItem('devbridge_lang', 'es')
    const { result } = renderHook(() => useI18n(), { wrapper })

    expect(result.current.t('does.not.exist')).toBe('does.not.exist')
    expect(result.current.translateError('Unexpected failure')).toBe('Unexpected failure')
  })

  // Specific case: guards against untranslated texts when new keys are added.
  it('has a Spanish text for every English key', () => {
    const spanish = new Set(keysOf(DICTIONARIES.es))
    const missing = keysOf(DICTIONARIES.en).filter((k) => !spanish.has(k))
    expect(missing).toEqual([])
  })
})

describe('LanguageSwitch', () => {
  it('switches the language and remembers it', async () => {
    localStorage.setItem('devbridge_lang', 'en')
    render(<I18nProvider><LanguageSwitch /></I18nProvider>)

    await userEvent.click(screen.getByRole('button', { name: 'ES' }))

    expect(screen.getByRole('button', { name: 'ES' })).toHaveAttribute('aria-pressed', 'true')
    expect(localStorage.getItem('devbridge_lang')).toBe('es')
    expect(document.documentElement.lang).toBe('es')
  })

  it('ignores an invalid saved language and uses the browser one', () => {
    localStorage.setItem('devbridge_lang', 'fr')
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('es-CO')
    render(<I18nProvider><LanguageSwitch /></I18nProvider>)

    expect(screen.getByRole('button', { name: 'ES' })).toHaveAttribute('aria-pressed', 'true')
  })
})
