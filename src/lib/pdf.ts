import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Case } from '@/types/database'
import { formatDate, formatCurrency } from './format'

/**
 * Financial PDF — billing/administrative use only.
 * Contains ONLY: patient name, file number, date, facility, procedure,
 * surgeon, high-risk flag. No clinical / academic data ever appears here.
 */
export function generateFinancialPDF(cases: Case[], title = 'Financial Report') {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text('Badr Clinic — ' + title, 14, 18)
  doc.setFontSize(9)
  doc.setTextColor(120)
  doc.text(`Generated ${new Date().toLocaleString()}`, 14, 24)

  autoTable(doc, {
    startY: 30,
    head: [['Patient', 'File #', 'Date', 'Facility', 'Procedure', 'Surgeon', 'High Risk']],
    body: cases.map((c) => [
      c.patient_full_name,
      c.file_number,
      formatDate(c.case_date),
      c.facility?.name ?? '—',
      c.procedure_name,
      c.surgeon ?? '—',
      c.is_high_risk ? 'Yes' : 'No',
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [31, 64, 63] },
  })

  doc.save(`badr-clinic-financial-${Date.now()}.pdf`)
}

/**
 * Logbook PDF — clinical/academic use only.
 * Contains ONLY clinical fields. No revenue, fees, or payment data ever appears here.
 */
export function generateLogbookPDF(cases: Case[], title = 'Clinical Logbook') {
  const doc = new jsPDF({ orientation: 'landscape' })
  doc.setFontSize(16)
  doc.text('Badr Clinic — ' + title, 14, 18)
  doc.setFontSize(9)
  doc.setTextColor(120)
  doc.text(`Generated ${new Date().toLocaleString()}`, 14, 24)

  autoTable(doc, {
    startY: 30,
    head: [['Diagnosis', 'Medical History', 'ASA', 'Procedure', 'Anesthesia', 'Airway', 'Complications', 'Tags']],
    body: cases.map((c) => [
      c.diagnosis ?? '—',
      c.medical_history ?? '—',
      c.asa ?? '—',
      c.procedure_name,
      c.anesthesia_type ?? '—',
      c.airway ?? '—',
      c.complications ?? '—',
      c.tags.join(', ') || '—',
    ]),
    styles: { fontSize: 7.5 },
    headStyles: { fillColor: [31, 64, 63] },
  })

  doc.save(`badr-clinic-logbook-${Date.now()}.pdf`)
}

// re-export for convenience where only currency formatting is needed alongside PDFs
export { formatCurrency }
