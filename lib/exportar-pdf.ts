import type { GrupoSetor } from './setores'

function sanitize(str: string): string {
  return str.replace(/[^\x00-\xFF]/g, '').trim()
}

export interface SecaoPDF {
  titulo: string
  grupos: GrupoSetor[]
}

function renderizarGrupos(doc: InstanceType<typeof import('jspdf').default>, grupos: GrupoSetor[], yInicial: number, W: number, M: number): number {
  let y = yInicial
  for (const grupo of grupos) {
    if (y > 255) { doc.addPage(); y = 22 }
    doc.setFillColor(240, 247, 242)
    doc.roundedRect(M, y - 4, W - M * 2, 7.5, 2, 2, 'F')
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(123, 168, 146)
    doc.text(sanitize(grupo.setor).toUpperCase(), M + 4, y + 0.5)
    y += 9

    for (const item of grupo.itens) {
      if (y > 272) { doc.addPage(); y = 22 }
      const nomeText = doc.splitTextToSize(sanitize(item.nome), 110)[0]
      const compraText = sanitize(item.compra)
      doc.setFontSize(10.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(26, 46, 37)
      doc.text(nomeText, M + 2, y)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(18, 140, 126)
      doc.text(compraText, W - M - 2, y, { align: 'right' })
      y += 6
      doc.setDrawColor(228, 242, 234)
      doc.setLineWidth(0.2)
      doc.line(M + 2, y - 1, W - M - 2, y - 1)
    }
    y += 5
  }
  return y
}

export async function baixarPDF(params: {
  nomeEvento: string
  data?: string
  totalPessoas: string
  cenario: string
  grupos: GrupoSetor[]
  responsavel?: string
  modo?: 'consolidado' | 'por_secao'
  secoes?: SecaoPDF[]
}) {
  const { default: jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  const W = 210
  const M = 18
  let y = 26

  // ── Cabeçalho ─────────────────────────────────────────────────
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(26, 46, 37)
  doc.text('Despensa', M, y)
  y += 7

  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(90, 122, 104)
  const meta = [
    sanitize(params.nomeEvento),
    params.data ? sanitize(params.data) : null,
    sanitize(params.totalPessoas),
  ].filter(Boolean).join('   ·   ')
  doc.text(meta, M, y)
  y += 4

  doc.setFontSize(8)
  doc.setTextColor(123, 168, 146)
  const linhaInfo = [
    params.modo === 'por_secao' ? 'Por dia / refeicao' : `Perfil: ${sanitize(params.cenario)}`,
    params.responsavel ? `Para: ${sanitize(params.responsavel)}` : null,
  ].filter(Boolean).join('   ·   ')
  doc.text(linhaInfo, M, y)
  y += 7

  doc.setDrawColor(212, 237, 224)
  doc.setLineWidth(0.6)
  doc.line(M, y, W - M, y)
  y += 9

  if (params.modo === 'por_secao' && params.secoes && params.secoes.length > 0) {
    // ── Modo: Por dia / refeição ───────────────────────────────
    for (const secao of params.secoes) {
      if (y > 240) { doc.addPage(); y = 22 }

      // Título da seção
      doc.setFillColor(18, 140, 126)
      doc.roundedRect(M, y - 5, W - M * 2, 9, 2, 2, 'F')
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(255, 255, 255)
      doc.text(sanitize(secao.titulo).toUpperCase(), M + 4, y + 0.5)
      y += 12

      y = renderizarGrupos(doc, secao.grupos, y, W, M)
      y += 4
    }
  } else {
    // ── Modo: Consolidado ─────────────────────────────────────
    y = renderizarGrupos(doc, params.grupos, y, W, M)
  }

  // ── Rodapé ────────────────────────────────────────────────────
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(187, 200, 193)
  doc.text('Lista gerada pelo app Despensa', W / 2, 288, { align: 'center' })

  const slug = params.nomeEvento.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const sufixo = params.modo === 'por_secao' ? '-por-dia' : ''
  doc.save(`despensa-${slug}${sufixo}.pdf`)
}
