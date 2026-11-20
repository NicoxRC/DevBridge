import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { apiError, makeProject } from '../test/fixtures'
import { renderWithRouter } from '../test/utils'
import { ChipPicker, ErrorMsg, ProjectCard, StatusBadge, Tags } from './ui'

describe('StatusBadge', () => {
  it('shows a known status translated and colored', () => {
    renderWithRouter(<StatusBadge status="accepted" />)
    expect(screen.getByText('Accepted')).toHaveClass('badge-green')
  })

  it('shows an unknown status as is, in gray', () => {
    renderWithRouter(<StatusBadge status="archived" />)
    expect(screen.getByText('archived')).toHaveClass('badge-gray')
  })
})

describe('Tags', () => {
  it('highlights the matching items', () => {
    renderWithRouter(<Tags items={['React', 'Go']} highlight={['React']} />)
    expect(screen.getByText('React')).toHaveClass('tag-match')
  })

  it('highlights nothing without matches', () => {
    renderWithRouter(<Tags items={['React', 'Go']} />)
    expect(screen.getByText('React')).not.toHaveClass('tag-match')
    expect(screen.getByText('Go')).not.toHaveClass('tag-match')
  })
})

describe('ProjectCard', () => {
  it('shows the project summary, match and link', () => {
    renderWithRouter(<ProjectCard project={makeProject()} score={75} matched={['Python']} />)

    expect(screen.getByRole('heading', { name: 'Inventory API' })).toBeInTheDocument()
    expect(screen.getByText('75% match')).toBeInTheDocument()
    expect(screen.getByText('2 slots')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View details' })).toHaveAttribute('href', '/projects/7')
  })

  it('never shows negative slots nor a match without score', () => {
    renderWithRouter(<ProjectCard project={makeProject({ slots: 2, acceptedCount: 3 })} />)

    expect(screen.getByText('0 slots')).toBeInTheDocument()
    expect(screen.queryByText(/match/)).not.toBeInTheDocument()
  })
})

describe('ChipPicker', () => {
  it('adds an option when it is clicked', async () => {
    const onChange = vi.fn()
    renderWithRouter(<ChipPicker options={['React', 'Go']} value={['React']} onChange={onChange} />)

    await userEvent.click(screen.getByRole('button', { name: 'Go' }))
    expect(onChange).toHaveBeenCalledWith(['React', 'Go'])
  })

  it('removes a selected option when it is clicked again', async () => {
    const onChange = vi.fn()
    renderWithRouter(<ChipPicker options={['React', 'Go']} value={['React']} onChange={onChange} />)

    await userEvent.click(screen.getByRole('button', { name: 'React' }))
    expect(onChange).toHaveBeenCalledWith([])
  })
})

describe('ErrorMsg', () => {
  it('shows the API error translated', () => {
    renderWithRouter(<ErrorMsg error={apiError('Incorrect email or password.')} />, { lang: 'es' })
    expect(screen.getByText('Correo o contraseña incorrectos.')).toBeInTheDocument()
  })

  it('renders nothing without an error', () => {
    const { container } = renderWithRouter(<ErrorMsg error={undefined} />)
    expect(container).toBeEmptyDOMElement()
  })
})
