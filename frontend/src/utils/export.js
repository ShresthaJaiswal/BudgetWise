import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export const exportToCSV = (filteredTransactions) => {
    if (filteredTransactions.length === 0) return

    const headers = ['Date', 'Description', 'Type', 'Category', 'Amount']
    const rows = filteredTransactions.map(t => [
        new Date(t.createdAt).toLocaleDateString('en-IN'),
        t.description,
        t.type.name,
        t.category.name,
        t.amount
    ])

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `budgetwise_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
}


export const exportToPDF = (filteredTransactions, user) => {
    if (filteredTransactions.length === 0) return

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    const fmt = (amount) => `Rs. ${amount.toLocaleString('en-IN')}`

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 14
    const primaryColor = [16, 185, 129] // emerald-500
    const darkColor = [30, 41, 59]   // slate-800
    const mutedColor = [100, 116, 139]// slate-500

    // summary
    const totalIncome = filteredTransactions.filter(t => t.type.name === 'income').reduce((s, t) => s + t.amount, 0)
    const totalExpenses = filteredTransactions.filter(t => t.type.name === 'expense').reduce((s, t) => s + t.amount, 0)
    const balance = totalIncome - totalExpenses
    const generatedOn = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })

    // called on every page
    const drawHeader = () => {
        doc.setFillColor(...primaryColor)
        doc.rect(0, 0, pageWidth, 18, 'F')

        // logo text
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(13)
        doc.setTextColor(255, 255, 255)
        doc.text('BudgetWise', margin, 12)

        // tagline
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(255, 255, 255)
        doc.text('Personal Finance Tracker', pageWidth - margin, 12, { align: 'right' })
    }

    // called on every page with page number and total pages (calculated after render)
    const drawFooter = (pageNum, totalPages) => {
        // footer line
        doc.setDrawColor(...mutedColor)
        doc.setLineWidth(0.3)
        doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12)

        // generated info
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7)
        doc.setTextColor(...mutedColor)
        doc.text(`Generated on ${generatedOn} · ${user?.name || 'BudgetWise User'}`, margin, pageHeight - 7)

        // page number
        doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' })
    }

    // page 1 header
    drawHeader()

    // report title
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(...darkColor)
    doc.text('Transaction Report', margin, 30)

    // subtitle
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...mutedColor)
    doc.text(`${filteredTransactions.length} transactions · Generated ${generatedOn}`, margin, 37)

    // summary box
    doc.setFillColor(241, 245, 249)  // slate-100
    doc.roundedRect(margin, 42, pageWidth - margin * 2, 22, 3, 3, 'F')

    const col1 = margin + 10
    const col2 = pageWidth / 2 - 10
    const col3 = pageWidth - margin - 10

    // income
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(16, 185, 129)
    doc.text(`+${fmt(totalIncome)}`, col1, 51, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...mutedColor)
    doc.text('Total Income', col1, 57, { align: 'center' })

    // expenses
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(239, 68, 68)
    doc.text(`-${fmt(totalExpenses)}`, col2, 51, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...mutedColor)
    doc.text('Total Expenses', col2, 57, { align: 'center' })

    // balance
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(balance >= 0 ? 16 : 239, balance >= 0 ? 185 : 68, balance >= 0 ? 129 : 68)
    doc.text(`${balance >= 0 ? '+' : '-'}${fmt(Math.abs(balance))}`, col3, 51, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...mutedColor)
    doc.text('Net Balance', col3, 57, { align: 'center' })

    // transactions table
    autoTable(doc, {
        startY: 70,
        margin: { left: margin, right: margin, bottom: 20 },
        head: [['Date', 'Description', 'Category', 'Type', 'Amount']],
        body: filteredTransactions.map(t => [
            new Date(t.createdAt).toLocaleDateString('en-IN'),
            t.description,
            t.category.name,
            t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1),
            `${t.type.name === 'income' ? '+' : '-'}${fmt(t.amount)}`
        ]),
        headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 8,
        },
        bodyStyles: {
            fontSize: 8,
            textColor: darkColor,
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252]  // slate-50
        },
        columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 60 },
            2: { cellWidth: 35 },
            3: { cellWidth: 22 },
            4: { cellWidth: 30, halign: 'right' },
        },
        // draw header + footer on every page
        didDrawPage: (data) => {
            drawHeader()
            // footer needs total pages — jsPDF provides it after render
            // so we store page data and draw footer in a second pass
        }
    })

    // draw footers on all pages (now we know total page count)
    const totalPages = doc.internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        drawFooter(i, totalPages)
    }

    doc.save(`budgetwise_report_${new Date().toISOString().slice(0, 10)}.pdf`)
}