const mockDoc = {
  internal: {
    pageSize: { getWidth: () => 210, getHeight: () => 297 },
    getNumberOfPages: () => 1
  },
  setFillColor: jest.fn(),
  setTextColor: jest.fn(),
  setFont: jest.fn(),
  setFontSize: jest.fn(),
  setDrawColor: jest.fn(),
  setLineWidth: jest.fn(),
  setPage: jest.fn(),
  rect: jest.fn(),
  roundedRect: jest.fn(),
  line: jest.fn(),
  text: jest.fn(),
  save: jest.fn(),
  addPage: jest.fn(),
}

const jsPDF = jest.fn(() => mockDoc)
export default jsPDF