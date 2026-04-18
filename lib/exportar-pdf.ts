import type { GrupoSetor } from './setores'

function fmt(kg: number): string {
  if (kg < 0.001) return `${(kg * 1000000).toFixed(0)}mg`
  if (kg < 1) return `${(kg * 1000).toFixed(0)}g`
  return `${kg.toFixed(3)}kg`
}

export async function baixarPDF(params: {
  nomeEvento: string
  data?: string
  totalPessoas: string
  cenario: string
  grupos: GrupoSetor[]
}) {
  const { default: jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  const W = 210
  const margin = 18
  let y = 24

  // Cabeçalho
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(26, 46, 37)
  doc.text('despensa', margin, y)
  y += 8

  // Informações do evento
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(90, 122, 104)
  const info = [
    params.nomeEvento,
    params.data,
    params.totalPessoas,
    `Cenário: ${params.cenario}`,
  ].filter(Boolean).join('  ·  ')
  const linhas = doc.splitTextToSize(info as string, W - margin * 2)
  doc.text(linhas, margin, y)
  y += linhas.length * 5 + 4

  // Linha divisória
  doc.setDrawColor(212, 237, 224)
  doc.setLineWidth(0.5)
  doc.line(margin, y, W - margin, y)
  y += 8

  for (const grupo of params.grupos) {
    if (y > 258) { doc.addPage(); y = 20 }

    // Rótulo do setor
    doc.setFillColor(240, 247, 242)
    doc.roundedRect(margin, y - 4, W - margin * 2, 8, 2, 2, 'F')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(123, 168, 146)
    doc.text(grupo.setor.toUpperCase(), margin + 4, y + 1)
    y += 11

    for (const item of grupo.itens) {
      if (y > 272) { doc.addPage(); y = 20 }

      // Nome do ingrediente
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(26, 46, 37)
      doc.text(item.nome, margin + 2, y)

      // Quantidade (alinhada à direita)
      const qtdTxt = fmt(item.brutoKg)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(18, 140, 126)
      const xQtd = item.unidade ? W - margin - 32 : W - margin
      doc.text(qtdTxt, xQtd, y, { align: 'right' })

      // Unidade
      if (item.unidade) {
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(123, 168, 146)
        doc.setFontSize(9)
        doc.text(item.unidade, W - margin, y, { align: 'right' })
      }

      y += 7
      doc.setDrawColor(228, 242, 234)
      doc.setLineWidth(0.3)
      doc.line(margin + 2, y - 2, W - margin - 2, y - 2)
    }
    y += 5
  }

  // Rodapé
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(187, 187, 187)
  doc.text('Lista gerada pelo app despensa', W / 2, 287, { align: 'center' })

  const slug = params.nomeEvento.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  doc.save(`despensa-${slug}.pdf`)
}
