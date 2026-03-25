import { exportToCSV } from '../utils/export'

const mockTransactions = [
  {
    createdAt: '2026-03-01T00:00:00.000Z',
    description: 'Grocery run',
    type: { name: 'expense' },
    category: { name: 'Food & Dining' },
    amount: 500
  }
]

describe('exportToCSV', () => {

  beforeEach(() => {
    // mock DOM APIs fresh for each test
    global.URL.createObjectURL = jest.fn(() => 'blob:mock')
    global.URL.revokeObjectURL = jest.fn()
    global.Blob = jest.fn((content) => ({ content }))
  })

  it('should not throw for empty transactions', () => {
    expect(() => exportToCSV([])).not.toThrow()
  })

  it('should trigger download for valid transactions', () => {
    const mockClick = jest.fn()
    jest.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: mockClick
    })

    exportToCSV(mockTransactions)

    expect(global.URL.createObjectURL).toHaveBeenCalled()
    expect(mockClick).toHaveBeenCalled()
    expect(global.URL.revokeObjectURL).toHaveBeenCalled()
  })

  it('should not trigger download for empty transactions', () => {
    const mockClick = jest.fn()
    jest.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: mockClick
    })

    exportToCSV([])
    expect(mockClick).not.toHaveBeenCalled()
  })

})