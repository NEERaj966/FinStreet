import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const sanitizeFileName = (value = 'report') => {
  const normalized = String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || 'report'
}

const escapeCsvCell = (value) => {
  const text = value === null || value === undefined ? '' : String(value)
  const escaped = text.replace(/"/g, '""')
  return /[",\n]/.test(text) ? `"${escaped}"` : escaped
}

const downloadBlob = (blob, fileName) => {
  const objectUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(objectUrl)
}

const getColumnValue = (column, row) => {
  if (typeof column.value === 'function') {
    return column.value(row)
  }
  return row?.[column.key]
}

export const formatReportCurrency = (value) => {
  const amount = Number(value || 0)
  return `₹${amount.toFixed(2)}`
}

export const formatReportDate = (value) => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return String(value)
  }

  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export const buildReportFileName = (label, extension) => {
  const dateStamp = new Date().toISOString().slice(0, 10)
  return `${sanitizeFileName(label)}-${dateStamp}.${extension}`
}

export const downloadCsvReport = ({
  fileName,
  columns,
  rows,
  metaRows = [],
}) => {
  const headerLine = columns.map((column) => escapeCsvCell(column.label)).join(',')
  const dataLines = rows.map((row) =>
    columns
      .map((column) => escapeCsvCell(getColumnValue(column, row)))
      .join(',')
  )

  const csvLines = [
    ...metaRows.map((metaRow) => metaRow.map(escapeCsvCell).join(',')),
    ...(metaRows.length ? [''] : []),
    headerLine,
    ...dataLines,
  ]

  const blob = new Blob(['\ufeff', csvLines.join('\n')], {
    type: 'text/csv;charset=utf-8;',
  })

  downloadBlob(blob, fileName)
}

export const downloadPdfReport = ({
  fileName,
  title,
  subtitleLines = [],
  summaryLines = [],
  columns,
  rows,
  orientation = 'portrait',
}) => {
  const doc = new jsPDF({
    orientation,
    unit: 'pt',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const contentWidth = pageWidth - 80

  doc.setFillColor(15, 23, 42)
  doc.rect(0, 0, pageWidth, 96, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text(title, 40, 44)

  let currentY = 68

  if (subtitleLines.length) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    subtitleLines.forEach((line) => {
      doc.text(String(line), 40, currentY)
      currentY += 14
    })
  }

  currentY = 120
  doc.setTextColor(15, 23, 42)

  if (summaryLines.length) {
    const wrappedSummaryLines = summaryLines.map((line) =>
      doc.splitTextToSize(String(line), contentWidth - 32)
    )
    const summaryHeight =
      42 +
      wrappedSummaryLines.reduce(
        (total, wrappedLine) => total + wrappedLine.length * 14,
        0
      ) +
      16

    doc.setFillColor(241, 245, 249)
    doc.roundedRect(40, currentY, contentWidth, summaryHeight, 14, 14, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('Report Summary', 56, currentY + 22)

    let summaryY = currentY + 42
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    wrappedSummaryLines.forEach((wrapped) => {
      doc.text(wrapped, 56, summaryY)
      summaryY += wrapped.length * 14
    })
    currentY = summaryY + 16
  }

  autoTable(doc, {
    startY: currentY,
    head: [columns.map((column) => column.label)],
    body: rows.length
      ? rows.map((row) => columns.map((column) => getColumnValue(column, row)))
      : [['No records available']],
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 7,
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    bodyStyles: rows.length
      ? {}
      : {
          halign: 'center',
          textColor: [100, 116, 139],
        },
    columnStyles: rows.length
      ? {}
      : {
          0: { cellWidth: contentWidth },
        },
    margin: {
      left: 40,
      right: 40,
      bottom: 36,
    },
  })

  doc.save(fileName)
}
