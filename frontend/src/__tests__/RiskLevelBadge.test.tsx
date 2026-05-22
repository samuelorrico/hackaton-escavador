import { render, screen } from '@testing-library/react'
import { RiskLevelBadge } from '../components/ui/RiskLevelBadge'

describe('RiskLevelBadge', () => {
  it('renders risk level text', () => {
    render(<RiskLevelBadge level="crítico" />)
    expect(screen.getByText('crítico')).toBeInTheDocument()
  })

  it('applies red class for crítico', () => {
    const { container } = render(<RiskLevelBadge level="crítico" />)
    expect(container.firstChild).toHaveClass('bg-red-600')
  })

  it('applies green class for baixo', () => {
    const { container } = render(<RiskLevelBadge level="baixo" />)
    expect(container.firstChild).toHaveClass('bg-green-500')
  })
})
