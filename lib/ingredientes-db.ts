export type Categoria = 'proteina' | 'vegetal' | 'fruta' | 'carboidrato' | 'laticinios' | 'tempero' | 'bebida' | 'padaria'

export interface Ingrediente {
  nome: string
  categoria: Categoria
  percapitaGramas: number   // gramas por pessoa adulta (base masculina)
  fatorCorrecao: number     // interno — não mostrar ao usuário
  fatorCoccao: number       // interno
  sinonimos: string[]       // termos alternativos de busca
}

export const DB: Ingrediente[] = [
  // ─── PROTEÍNAS AVES ───────────────────────────────────────
  { nome: 'Frango peito s/ osso', categoria: 'proteina', percapitaGramas: 250, fatorCorrecao: 1.26, fatorCoccao: 0.80, sinonimos: ['frango', 'peito de frango', 'file de frango', 'filé de frango'] },
  { nome: 'Frango coxa e sobrecoxa', categoria: 'proteina', percapitaGramas: 300, fatorCorrecao: 1.50, fatorCoccao: 0.82, sinonimos: ['coxa frango', 'sobrecoxa', 'coxa e sobrecoxa'] },
  { nome: 'Frango inteiro', categoria: 'proteina', percapitaGramas: 350, fatorCorrecao: 1.38, fatorCoccao: 0.80, sinonimos: ['frango inteiro', 'galinha'] },
  { nome: 'Frango asa', categoria: 'proteina', percapitaGramas: 200, fatorCorrecao: 2.24, fatorCoccao: 0.82, sinonimos: ['asa', 'asa de frango', 'coxinha da asa'] },
  { nome: 'Peru', categoria: 'proteina', percapitaGramas: 300, fatorCorrecao: 1.40, fatorCoccao: 0.75, sinonimos: ['peru', 'chester'] },

  // ─── PROTEÍNAS BOVINAS ────────────────────────────────────
  { nome: 'Picanha', categoria: 'proteina', percapitaGramas: 300, fatorCorrecao: 1.27, fatorCoccao: 0.78, sinonimos: ['picanha'] },
  { nome: 'Alcatra', categoria: 'proteina', percapitaGramas: 250, fatorCorrecao: 1.21, fatorCoccao: 0.79, sinonimos: ['alcatra'] },
  { nome: 'Contra-filé', categoria: 'proteina', percapitaGramas: 250, fatorCorrecao: 1.23, fatorCoccao: 0.79, sinonimos: ['contrafile', 'contra filé', 'entrecote'] },
  { nome: 'Filé mignon', categoria: 'proteina', percapitaGramas: 220, fatorCorrecao: 1.15, fatorCoccao: 0.80, sinonimos: ['file mignon', 'filé mignon', 'mignon'] },
  { nome: 'Costela bovina', categoria: 'proteina', percapitaGramas: 450, fatorCorrecao: 1.65, fatorCoccao: 0.75, sinonimos: ['costela', 'costela boi', 'costela de boi'] },
  { nome: 'Carne moída bovina', categoria: 'proteina', percapitaGramas: 200, fatorCorrecao: 1.10, fatorCoccao: 0.80, sinonimos: ['carne moida', 'carne moída', 'patinho moido'] },
  { nome: 'Maminha', categoria: 'proteina', percapitaGramas: 250, fatorCorrecao: 1.20, fatorCoccao: 0.78, sinonimos: ['maminha'] },
  { nome: 'Fraldinha', categoria: 'proteina', percapitaGramas: 250, fatorCorrecao: 1.18, fatorCoccao: 0.78, sinonimos: ['fraldinha'] },
  { nome: 'Acém bovino', categoria: 'proteina', percapitaGramas: 250, fatorCorrecao: 1.25, fatorCoccao: 0.80, sinonimos: ['acem', 'acém'] },
  { nome: 'Patinho bovino', categoria: 'proteina', percapitaGramas: 220, fatorCorrecao: 1.15, fatorCoccao: 0.80, sinonimos: ['patinho'] },

  // ─── PROTEÍNAS SUÍNAS ─────────────────────────────────────
  { nome: 'Pernil suíno', categoria: 'proteina', percapitaGramas: 350, fatorCorrecao: 1.42, fatorCoccao: 0.76, sinonimos: ['pernil', 'pernil suino', 'pernil de porco'] },
  { nome: 'Lombo suíno', categoria: 'proteina', percapitaGramas: 250, fatorCorrecao: 1.15, fatorCoccao: 0.78, sinonimos: ['lombo', 'lombo suino', 'lombo de porco'] },
  { nome: 'Costelinha suína', categoria: 'proteina', percapitaGramas: 400, fatorCorrecao: 1.60, fatorCoccao: 0.75, sinonimos: ['costelinha', 'costelinha porco', 'spare rib'] },
  { nome: 'Linguiça calabresa', categoria: 'proteina', percapitaGramas: 120, fatorCorrecao: 1.05, fatorCoccao: 0.85, sinonimos: ['linguiça', 'linguica', 'calabresa'] },
  { nome: 'Linguiça toscana', categoria: 'proteina', percapitaGramas: 120, fatorCorrecao: 1.05, fatorCoccao: 0.85, sinonimos: ['toscana', 'linguiça toscana'] },
  { nome: 'Bacon', categoria: 'proteina', percapitaGramas: 60, fatorCorrecao: 1.05, fatorCoccao: 0.70, sinonimos: ['bacon', 'toucinho defumado'] },
  { nome: 'Paio', categoria: 'proteina', percapitaGramas: 80, fatorCorrecao: 1.05, fatorCoccao: 0.85, sinonimos: ['paio'] },

  // ─── PEIXES ───────────────────────────────────────────────
  { nome: 'Tilápia filé', categoria: 'proteina', percapitaGramas: 200, fatorCorrecao: 1.31, fatorCoccao: 0.83, sinonimos: ['tilapia', 'tilápia'] },
  { nome: 'Salmão filé', categoria: 'proteina', percapitaGramas: 200, fatorCorrecao: 1.12, fatorCoccao: 0.82, sinonimos: ['salmao', 'salmão'] },
  { nome: 'Atum filé', categoria: 'proteina', percapitaGramas: 200, fatorCorrecao: 1.15, fatorCoccao: 0.82, sinonimos: ['atum'] },
  { nome: 'Robalo filé', categoria: 'proteina', percapitaGramas: 220, fatorCorrecao: 1.40, fatorCoccao: 0.82, sinonimos: ['robalo'] },
  { nome: 'Dourado filé', categoria: 'proteina', percapitaGramas: 220, fatorCorrecao: 1.45, fatorCoccao: 0.82, sinonimos: ['dourado'] },
  { nome: 'Peixe inteiro', categoria: 'proteina', percapitaGramas: 350, fatorCorrecao: 2.20, fatorCoccao: 0.82, sinonimos: ['peixe', 'peixe inteiro'] },
  { nome: 'Bacalhau dessalgado', categoria: 'proteina', percapitaGramas: 180, fatorCorrecao: 1.20, fatorCoccao: 1.40, sinonimos: ['bacalhau'] },
  { nome: 'Sardinha fresca', categoria: 'proteina', percapitaGramas: 200, fatorCorrecao: 1.50, fatorCoccao: 0.80, sinonimos: ['sardinha'] },

  // ─── FRUTOS DO MAR ────────────────────────────────────────
  { nome: 'Camarão limpo', categoria: 'proteina', percapitaGramas: 200, fatorCorrecao: 1.10, fatorCoccao: 0.85, sinonimos: ['camarao', 'camarão', 'camarão limpo'] },
  { nome: 'Camarão inteiro', categoria: 'proteina', percapitaGramas: 300, fatorCorrecao: 2.75, fatorCoccao: 0.85, sinonimos: ['camarao inteiro', 'camarão inteiro'] },
  { nome: 'Lula', categoria: 'proteina', percapitaGramas: 200, fatorCorrecao: 1.30, fatorCoccao: 0.80, sinonimos: ['lula'] },
  { nome: 'Polvo', categoria: 'proteina', percapitaGramas: 250, fatorCorrecao: 1.20, fatorCoccao: 0.65, sinonimos: ['polvo'] },
  { nome: 'Mariscos', categoria: 'proteina', percapitaGramas: 300, fatorCorrecao: 2.50, fatorCoccao: 0.40, sinonimos: ['marisco', 'mariscos', 'mexilhao', 'mexilhão'] },

  // ─── OVOS ─────────────────────────────────────────────────
  { nome: 'Ovos', categoria: 'proteina', percapitaGramas: 100, fatorCorrecao: 1.12, fatorCoccao: 0.90, sinonimos: ['ovo', 'ovos'] },

  // ─── VEGETAIS ─────────────────────────────────────────────
  { nome: 'Cebola', categoria: 'vegetal', percapitaGramas: 40, fatorCorrecao: 1.25, fatorCoccao: 0.70, sinonimos: ['cebola'] },
  { nome: 'Alho', categoria: 'vegetal', percapitaGramas: 8, fatorCorrecao: 1.40, fatorCoccao: 0.75, sinonimos: ['alho'] },
  { nome: 'Tomate', categoria: 'vegetal', percapitaGramas: 60, fatorCorrecao: 1.10, fatorCoccao: 0.75, sinonimos: ['tomate'] },
  { nome: 'Tomate cereja', categoria: 'vegetal', percapitaGramas: 50, fatorCorrecao: 1.05, fatorCoccao: 1.00, sinonimos: ['tomate cereja', 'cherry'] },
  { nome: 'Pimentão vermelho', categoria: 'vegetal', percapitaGramas: 40, fatorCorrecao: 1.26, fatorCoccao: 0.80, sinonimos: ['pimentao', 'pimentão', 'pimentao vermelho'] },
  { nome: 'Pimentão verde', categoria: 'vegetal', percapitaGramas: 30, fatorCorrecao: 1.26, fatorCoccao: 0.80, sinonimos: ['pimentao verde'] },
  { nome: 'Pimentão amarelo', categoria: 'vegetal', percapitaGramas: 30, fatorCorrecao: 1.26, fatorCoccao: 0.80, sinonimos: ['pimentao amarelo'] },
  { nome: 'Batata inglesa', categoria: 'vegetal', percapitaGramas: 180, fatorCorrecao: 1.22, fatorCoccao: 0.97, sinonimos: ['batata', 'batata inglesa', 'batata cozida'] },
  { nome: 'Batata-doce', categoria: 'vegetal', percapitaGramas: 180, fatorCorrecao: 1.15, fatorCoccao: 0.97, sinonimos: ['batata doce', 'batata-doce'] },
  { nome: 'Cenoura', categoria: 'vegetal', percapitaGramas: 70, fatorCorrecao: 1.17, fatorCoccao: 0.94, sinonimos: ['cenoura'] },
  { nome: 'Abobrinha', categoria: 'vegetal', percapitaGramas: 90, fatorCorrecao: 1.09, fatorCoccao: 0.85, sinonimos: ['abobrinha', 'zucchini'] },
  { nome: 'Berinjela', categoria: 'vegetal', percapitaGramas: 80, fatorCorrecao: 1.10, fatorCoccao: 0.85, sinonimos: ['berinjela'] },
  { nome: 'Couve-flor', categoria: 'vegetal', percapitaGramas: 100, fatorCorrecao: 1.40, fatorCoccao: 0.90, sinonimos: ['couve-flor', 'couve flor'] },
  { nome: 'Brócolis', categoria: 'vegetal', percapitaGramas: 80, fatorCorrecao: 1.35, fatorCoccao: 0.87, sinonimos: ['brocolis', 'brócolis'] },
  { nome: 'Couve manteiga', categoria: 'vegetal', percapitaGramas: 40, fatorCorrecao: 1.20, fatorCoccao: 0.90, sinonimos: ['couve', 'couve manteiga'] },
  { nome: 'Rúcula', categoria: 'vegetal', percapitaGramas: 30, fatorCorrecao: 1.15, fatorCoccao: 1.00, sinonimos: ['rucula', 'rúcula'] },
  { nome: 'Alface', categoria: 'vegetal', percapitaGramas: 40, fatorCorrecao: 1.30, fatorCoccao: 1.00, sinonimos: ['alface'] },
  { nome: 'Cogumelos Paris', categoria: 'vegetal', percapitaGramas: 60, fatorCorrecao: 1.10, fatorCoccao: 0.70, sinonimos: ['cogumelo', 'cogumelos', 'champignon', 'champignons'] },
  { nome: 'Cogumelos shitake', categoria: 'vegetal', percapitaGramas: 40, fatorCorrecao: 1.10, fatorCoccao: 0.75, sinonimos: ['shitake', 'shiitake', 'cogumelo shitake'] },
  { nome: 'Tomate seco', categoria: 'vegetal', percapitaGramas: 20, fatorCorrecao: 1.00, fatorCoccao: 1.00, sinonimos: ['tomate seco'] },
  { nome: 'Cebola roxa', categoria: 'vegetal', percapitaGramas: 40, fatorCorrecao: 1.25, fatorCoccao: 0.70, sinonimos: ['cebola roxa'] },
  { nome: 'Espinafre', categoria: 'vegetal', percapitaGramas: 60, fatorCorrecao: 1.20, fatorCoccao: 0.60, sinonimos: ['espinafre'] },
  { nome: 'Mandioca', categoria: 'vegetal', percapitaGramas: 180, fatorCorrecao: 1.38, fatorCoccao: 0.96, sinonimos: ['mandioca', 'macaxeira', 'aipim'] },
  { nome: 'Mandioquinha', categoria: 'vegetal', percapitaGramas: 150, fatorCorrecao: 1.20, fatorCoccao: 0.97, sinonimos: ['mandioquinha', 'batata baroa', 'batata baroa'] },
  { nome: 'Milho verde', categoria: 'vegetal', percapitaGramas: 80, fatorCorrecao: 1.50, fatorCoccao: 1.00, sinonimos: ['milho', 'milho verde'] },
  { nome: 'Quiabo', categoria: 'vegetal', percapitaGramas: 60, fatorCorrecao: 1.15, fatorCoccao: 0.90, sinonimos: ['quiabo'] },
  { nome: 'Jiló', categoria: 'vegetal', percapitaGramas: 60, fatorCorrecao: 1.10, fatorCoccao: 0.90, sinonimos: ['jilo', 'jiló'] },
  { nome: 'Chuchu', categoria: 'vegetal', percapitaGramas: 100, fatorCorrecao: 1.20, fatorCoccao: 0.93, sinonimos: ['chuchu'] },
  { nome: 'Palmito', categoria: 'vegetal', percapitaGramas: 60, fatorCorrecao: 1.00, fatorCoccao: 1.00, sinonimos: ['palmito'] },
  { nome: 'Pimenta dedo-de-moça', categoria: 'vegetal', percapitaGramas: 5, fatorCorrecao: 1.10, fatorCoccao: 1.00, sinonimos: ['pimenta', 'pimenta dedo de moça', 'pimenta fresca'] },
  { nome: 'Cogumelos', categoria: 'vegetal', percapitaGramas: 50, fatorCorrecao: 1.10, fatorCoccao: 0.60, sinonimos: ['cogumelo', 'cogumelos', 'shitake', 'champignon'] },

  // ─── FRUTAS ───────────────────────────────────────────────
  { nome: 'Mamão', categoria: 'fruta', percapitaGramas: 200, fatorCorrecao: 1.50, fatorCoccao: 1.00, sinonimos: ['mamao', 'mamão', 'mamão papaia'] },
  { nome: 'Melancia', categoria: 'fruta', percapitaGramas: 250, fatorCorrecao: 1.90, fatorCoccao: 1.00, sinonimos: ['melancia'] },
  { nome: 'Melão', categoria: 'fruta', percapitaGramas: 200, fatorCorrecao: 1.60, fatorCoccao: 1.00, sinonimos: ['melao', 'melão'] },
  { nome: 'Abacaxi', categoria: 'fruta', percapitaGramas: 180, fatorCorrecao: 1.75, fatorCoccao: 1.00, sinonimos: ['abacaxi', 'ananas'] },
  { nome: 'Manga', categoria: 'fruta', percapitaGramas: 180, fatorCorrecao: 1.65, fatorCoccao: 1.00, sinonimos: ['manga'] },
  { nome: 'Banana', categoria: 'fruta', percapitaGramas: 120, fatorCorrecao: 1.40, fatorCoccao: 1.00, sinonimos: ['banana'] },
  { nome: 'Maçã', categoria: 'fruta', percapitaGramas: 150, fatorCorrecao: 1.15, fatorCoccao: 1.00, sinonimos: ['maca', 'maçã'] },
  { nome: 'Uva', categoria: 'fruta', percapitaGramas: 120, fatorCorrecao: 1.05, fatorCoccao: 1.00, sinonimos: ['uva', 'uvas'] },
  { nome: 'Limão', categoria: 'fruta', percapitaGramas: 20, fatorCorrecao: 1.20, fatorCoccao: 1.00, sinonimos: ['limao', 'limão'] },
  { nome: 'Laranja', categoria: 'fruta', percapitaGramas: 200, fatorCorrecao: 1.40, fatorCoccao: 1.00, sinonimos: ['laranja'] },
  { nome: 'Morango', categoria: 'fruta', percapitaGramas: 100, fatorCorrecao: 1.10, fatorCoccao: 1.00, sinonimos: ['morango'] },
  { nome: 'Abacate', categoria: 'fruta', percapitaGramas: 150, fatorCorrecao: 1.50, fatorCoccao: 1.00, sinonimos: ['abacate'] },
  { nome: 'Coco fresco', categoria: 'fruta', percapitaGramas: 50, fatorCorrecao: 2.50, fatorCoccao: 1.00, sinonimos: ['coco', 'coco fresco', 'coco verde'] },

  // ─── CARBOIDRATOS ─────────────────────────────────────────
  { nome: 'Arroz branco', categoria: 'carboidrato', percapitaGramas: 80, fatorCorrecao: 1.00, fatorCoccao: 2.50, sinonimos: ['arroz', 'arroz branco'] },
  { nome: 'Arroz integral', categoria: 'carboidrato', percapitaGramas: 80, fatorCorrecao: 1.00, fatorCoccao: 2.20, sinonimos: ['arroz integral'] },
  { nome: 'Feijão carioca', categoria: 'carboidrato', percapitaGramas: 70, fatorCorrecao: 1.00, fatorCoccao: 2.20, sinonimos: ['feijao', 'feijão', 'feijão carioca'] },
  { nome: 'Feijão preto', categoria: 'carboidrato', percapitaGramas: 80, fatorCorrecao: 1.00, fatorCoccao: 2.20, sinonimos: ['feijao preto', 'feijão preto'] },
  { nome: 'Macarrão espaguete', categoria: 'carboidrato', percapitaGramas: 100, fatorCorrecao: 1.00, fatorCoccao: 2.30, sinonimos: ['macarrao', 'macarrão', 'espaguete', 'spaghetti', 'pasta longa', 'bavette'] },
  { nome: 'Fettuccine', categoria: 'carboidrato', percapitaGramas: 90, fatorCorrecao: 1.00, fatorCoccao: 2.30, sinonimos: ['fettuccine', 'fetuccine', 'tagliatelle', 'talharim', 'linguine', 'pappardelle'] },
  { nome: 'Rigatoni', categoria: 'carboidrato', percapitaGramas: 90, fatorCorrecao: 1.00, fatorCoccao: 2.20, sinonimos: ['rigatoni', 'tortiglioni', 'mezze maniche'] },
  { nome: 'Penne', categoria: 'carboidrato', percapitaGramas: 90, fatorCorrecao: 1.00, fatorCoccao: 2.20, sinonimos: ['penne', 'penne rigate', 'pennette'] },
  { nome: 'Macarrão parafuso', categoria: 'carboidrato', percapitaGramas: 90, fatorCorrecao: 1.00, fatorCoccao: 2.20, sinonimos: ['parafuso', 'fusilli', 'farfalle', 'conchiglie', 'gravatinha', 'ditali'] },
  { nome: 'Lasanha', categoria: 'carboidrato', percapitaGramas: 100, fatorCorrecao: 1.00, fatorCoccao: 2.30, sinonimos: ['lasanha', 'lasagne', 'massa de lasanha'] },
  { nome: 'Pão de forma', categoria: 'padaria', percapitaGramas: 60, fatorCorrecao: 1.00, fatorCoccao: 1.00, sinonimos: ['pao de forma', 'pão de forma', 'pão'] },
  { nome: 'Pão francês', categoria: 'padaria', percapitaGramas: 50, fatorCorrecao: 1.00, fatorCoccao: 1.00, sinonimos: ['pao frances', 'pão francês', 'bisnaga'] },
  { nome: 'Tapioca', categoria: 'carboidrato', percapitaGramas: 60, fatorCorrecao: 1.00, fatorCoccao: 1.00, sinonimos: ['tapioca', 'goma de tapioca'] },
  { nome: 'Batata frita / chips', categoria: 'carboidrato', percapitaGramas: 150, fatorCorrecao: 1.22, fatorCoccao: 0.40, sinonimos: ['batata frita', 'fritas'] },
  { nome: 'Risoto (arroz arbóreo)', categoria: 'carboidrato', percapitaGramas: 90, fatorCorrecao: 1.00, fatorCoccao: 2.80, sinonimos: ['risoto', 'arroz arbóreo', 'arborio'] },
  { nome: 'Grão-de-bico', categoria: 'carboidrato', percapitaGramas: 70, fatorCorrecao: 1.00, fatorCoccao: 2.00, sinonimos: ['grao de bico', 'grão-de-bico'] },
  { nome: 'Lentilha', categoria: 'carboidrato', percapitaGramas: 70, fatorCorrecao: 1.00, fatorCoccao: 2.20, sinonimos: ['lentilha'] },

  // ─── LATICÍNIOS ───────────────────────────────────────────
  { nome: 'Leite integral', categoria: 'laticinios', percapitaGramas: 200, fatorCorrecao: 1.00, fatorCoccao: 1.00, sinonimos: ['leite', 'leite integral'] },
  { nome: 'Queijo mussarela', categoria: 'laticinios', percapitaGramas: 40, fatorCorrecao: 1.00, fatorCoccao: 0.90, sinonimos: ['mussarela', 'muçarela', 'queijo mussarela'] },
  { nome: 'Queijo prato', categoria: 'laticinios', percapitaGramas: 40, fatorCorrecao: 1.00, fatorCoccao: 0.90, sinonimos: ['queijo prato'] },
  { nome: 'Queijo coalho', categoria: 'laticinios', percapitaGramas: 60, fatorCorrecao: 1.00, fatorCoccao: 0.85, sinonimos: ['queijo coalho', 'coalho'] },
  { nome: 'Queijo parmesão', categoria: 'laticinios', percapitaGramas: 20, fatorCorrecao: 1.00, fatorCoccao: 1.00, sinonimos: ['parmesao', 'parmesão', 'queijo parmesão'] },
  { nome: 'Queijo gruyère', categoria: 'laticinios', percapitaGramas: 40, fatorCorrecao: 1.00, fatorCoccao: 0.90, sinonimos: ['gruyere', 'gruyère', 'queijo gruyère'] },
  { nome: 'Queijo brie', categoria: 'laticinios', percapitaGramas: 40, fatorCorrecao: 1.05, fatorCoccao: 1.00, sinonimos: ['brie', 'queijo brie'] },
  { nome: 'Queijo gorgonzola', categoria: 'laticinios', percapitaGramas: 30, fatorCorrecao: 1.00, fatorCoccao: 1.00, sinonimos: ['gorgonzola', 'queijo gorgonzola'] },
  { nome: 'Burrata', categoria: 'laticinios', percapitaGramas: 80, fatorCorrecao: 1.00, fatorCoccao: 1.00, sinonimos: ['burrata'] },
  { nome: 'Ricota', categoria: 'laticinios', percapitaGramas: 60, fatorCorrecao: 1.00, fatorCoccao: 1.00, sinonimos: ['ricota', 'ricotta'] },
  { nome: 'Cream cheese', categoria: 'laticinios', percapitaGramas: 30, fatorCorrecao: 1.00, fatorCoccao: 1.00, sinonimos: ['cream cheese', 'requeijão', 'catupiry'] },
  { nome: 'Creme de leite', categoria: 'laticinios', percapitaGramas: 50, fatorCorrecao: 1.00, fatorCoccao: 1.00, sinonimos: ['creme de leite'] },
  { nome: 'Manteiga', categoria: 'laticinios', percapitaGramas: 15, fatorCorrecao: 1.00, fatorCoccao: 0.85, sinonimos: ['manteiga'] },
  { nome: 'Iogurte natural', categoria: 'laticinios', percapitaGramas: 150, fatorCorrecao: 1.00, fatorCoccao: 1.00, sinonimos: ['iogurte', 'yogurt'] },

  // ─── TEMPEROS / CONDIMENTOS ───────────────────────────────
  { nome: 'Azeite de oliva', categoria: 'tempero', percapitaGramas: 12, fatorCorrecao: 1.00, fatorCoccao: 1.00, sinonimos: ['azeite', 'azeite de oliva'] },
  { nome: 'Óleo de soja', categoria: 'tempero', percapitaGramas: 10, fatorCorrecao: 1.00, fatorCoccao: 1.00, sinonimos: ['oleo', 'óleo', 'óleo de soja'] },
  { nome: 'Sal', categoria: 'tempero', percapitaGramas: 4, fatorCorrecao: 1.00, fatorCoccao: 1.00, sinonimos: ['sal'] },
  { nome: 'Pimenta-do-reino', categoria: 'tempero', percapitaGramas: 1, fatorCorrecao: 1.00, fatorCoccao: 1.00, sinonimos: ['pimenta do reino', 'pimenta-do-reino'] },
  { nome: 'Coentro fresco', categoria: 'tempero', percapitaGramas: 6, fatorCorrecao: 1.15, fatorCoccao: 1.00, sinonimos: ['coentro'] },
  { nome: 'Salsinha', categoria: 'tempero', percapitaGramas: 5, fatorCorrecao: 1.15, fatorCoccao: 1.00, sinonimos: ['salsinha', 'salsa'] },
  { nome: 'Cebolinha', categoria: 'tempero', percapitaGramas: 5, fatorCorrecao: 1.10, fatorCoccao: 1.00, sinonimos: ['cebolinha'] },
  { nome: 'Louro', categoria: 'tempero', percapitaGramas: 1, fatorCorrecao: 1.00, fatorCoccao: 1.00, sinonimos: ['louro', 'folha de louro'] },
  { nome: 'Extrato de tomate', categoria: 'tempero', percapitaGramas: 20, fatorCorrecao: 1.00, fatorCoccao: 1.00, sinonimos: ['extrato de tomate', 'molho de tomate', 'molho tomate'] },
  { nome: 'Leite de coco', categoria: 'tempero', percapitaGramas: 60, fatorCorrecao: 1.00, fatorCoccao: 1.00, sinonimos: ['leite de coco'] },
  { nome: 'Dendê', categoria: 'tempero', percapitaGramas: 15, fatorCorrecao: 1.00, fatorCoccao: 1.00, sinonimos: ['dende', 'dendê', 'azeite de dende', 'azeite dendê'] },
  { nome: 'Vinagre', categoria: 'tempero', percapitaGramas: 10, fatorCorrecao: 1.00, fatorCoccao: 1.00, sinonimos: ['vinagre'] },
  { nome: 'Molho shoyu', categoria: 'tempero', percapitaGramas: 10, fatorCorrecao: 1.00, fatorCoccao: 1.00, sinonimos: ['shoyu', 'molho shoyu', 'molho de soja'] },
  { nome: 'Alecrim', categoria: 'tempero', percapitaGramas: 1, fatorCorrecao: 1.00, fatorCoccao: 1.00, sinonimos: ['alecrim'] },
  { nome: 'Tomilho', categoria: 'tempero', percapitaGramas: 1, fatorCorrecao: 1.00, fatorCoccao: 1.00, sinonimos: ['tomilho'] },
  { nome: 'Açúcar', categoria: 'tempero', percapitaGramas: 15, fatorCorrecao: 1.00, fatorCoccao: 1.00, sinonimos: ['açucar', 'açúcar', 'sugar'] },
  { nome: 'Farinha de trigo', categoria: 'carboidrato', percapitaGramas: 30, fatorCorrecao: 1.00, fatorCoccao: 1.00, sinonimos: ['farinha', 'farinha de trigo'] },
  { nome: 'Farinha de mandioca', categoria: 'carboidrato', percapitaGramas: 30, fatorCorrecao: 1.00, fatorCoccao: 1.00, sinonimos: ['farinha de mandioca', 'farinha', 'farofa'] },

  // ─── BEBIDAS ──────────────────────────────────────────────
  { nome: 'Água mineral', categoria: 'bebida', percapitaGramas: 500, fatorCorrecao: 1.00, fatorCoccao: 1.00, sinonimos: ['agua', 'água', 'água mineral'] },
  { nome: 'Suco de laranja natural', categoria: 'bebida', percapitaGramas: 300, fatorCorrecao: 2.50, fatorCoccao: 1.00, sinonimos: ['suco de laranja', 'suco laranja'] },
  { nome: 'Refrigerante', categoria: 'bebida', percapitaGramas: 350, fatorCorrecao: 1.00, fatorCoccao: 1.00, sinonimos: ['refrigerante', 'coca', 'guaraná'] },
  { nome: 'Cerveja', categoria: 'bebida', percapitaGramas: 500, fatorCorrecao: 1.00, fatorCoccao: 1.00, sinonimos: ['cerveja', 'beer'] },
  { nome: 'Vinho tinto', categoria: 'bebida', percapitaGramas: 200, fatorCorrecao: 1.00, fatorCoccao: 1.00, sinonimos: ['vinho tinto', 'vinho'] },
  { nome: 'Vinho branco', categoria: 'bebida', percapitaGramas: 200, fatorCorrecao: 1.00, fatorCoccao: 1.00, sinonimos: ['vinho branco'] },
  { nome: 'Café', categoria: 'bebida', percapitaGramas: 10, fatorCorrecao: 1.00, fatorCoccao: 1.00, sinonimos: ['cafe', 'café'] },
]

// ─── CLASSIFICAÇÃO AUTOMÁTICA ────────────────────────────────

const DEFAULTS_POR_CATEGORIA: Record<Categoria, { percapitaGramas: number; fatorCorrecao: number; fatorCoccao: number }> = {
  proteina:    { percapitaGramas: 220, fatorCorrecao: 1.25, fatorCoccao: 0.80 },
  carboidrato: { percapitaGramas: 80,  fatorCorrecao: 1.00, fatorCoccao: 2.20 },
  vegetal:     { percapitaGramas: 80,  fatorCorrecao: 1.15, fatorCoccao: 0.87 },
  fruta:       { percapitaGramas: 120, fatorCorrecao: 1.30, fatorCoccao: 1.00 },
  laticinios:  { percapitaGramas: 60,  fatorCorrecao: 1.00, fatorCoccao: 1.00 },
  tempero:     { percapitaGramas: 10,  fatorCorrecao: 1.00, fatorCoccao: 1.00 },
  bebida:      { percapitaGramas: 350, fatorCorrecao: 1.00, fatorCoccao: 1.00 },
  padaria:     { percapitaGramas: 60,  fatorCorrecao: 1.00, fatorCoccao: 1.00 },
}

const PALAVRAS_CATEGORIA: Array<{ palavras: string[]; categoria: Categoria }> = [
  {
    categoria: 'proteina',
    palavras: ['carne', 'frango', 'peixe', 'camarao', 'file', 'bife', 'costela', 'pernil', 'lombo',
      'linguica', 'hamburguer', 'lagosta', 'siri', 'caranguejo', 'polvo', 'lula', 'ostra',
      'porco', 'suino', 'bovino', 'pato', 'ganso', 'cordeiro', 'cabrito', 'coelho', 'steak',
      'picanha', 'alcatra', 'maminha', 'fraldinha', 'acem', 'patinho', 'bacon', 'paio',
      'salsicha', 'presunto', 'mortadela', 'pepperoni', 'atum', 'sardinha', 'salmao',
      'tilapia', 'robalo', 'dourado', 'bacalhau', 'mariscos', 'mexilhao', 'vieiras'],
  },
  {
    categoria: 'carboidrato',
    palavras: ['arroz', 'feijao', 'macarrao', 'massa', 'batata', 'polenta', 'lentilha', 'grao',
      'cuscuz', 'fuba', 'quinoa', 'milho', 'tapioca', 'inhame', 'aipim', 'mandioca',
      'pao', 'torrada', 'biscoito', 'bolacha', 'farofa', 'farinha', 'trigo', 'aveia',
      'cevada', 'centeio', 'chia', 'linhaça', 'linhaça', 'amido'],
  },
  {
    categoria: 'vegetal',
    palavras: ['alface', 'tomate', 'cebola', 'cenoura', 'abobrinha', 'berinjela', 'pepino',
      'couve', 'repolho', 'brocolis', 'espinafre', 'quiabo', 'chuchu', 'jilo',
      'vagem', 'beterraba', 'pimentao', 'aspargo', 'alcachofra', 'cogumelo', 'champignon',
      'alho', 'alho-poro', 'cebola', 'palmito', 'aipo', 'rucula', 'agriao',
      'endiva', 'escarola', 'chicoria', 'nabo', 'rabanete', 'ervilha', 'grao de bico'],
  },
  {
    categoria: 'fruta',
    palavras: ['banana', 'maca', 'laranja', 'limao', 'abacaxi', 'mamao', 'manga', 'melao',
      'uva', 'pera', 'pessego', 'morango', 'caju', 'goiaba', 'maracuja', 'acerola',
      'caqui', 'figo', 'abacate', 'kiwi', 'melancia', 'cereja', 'ameixa', 'damasco',
      'framboesa', 'mirtilo', 'pitanga', 'jabuticaba', 'cupuacu', 'açai', 'acai'],
  },
  {
    categoria: 'laticinios',
    palavras: ['queijo', 'iogurte', 'requeijao', 'creme de leite', 'leite', 'manteiga', 'nata',
      'coalhada', 'ricota', 'mozarela', 'musarela', 'parmesao', 'cheddar', 'brie',
      'gorgonzola', 'cottage', 'catupiry', 'cream cheese', 'ghee'],
  },
  {
    categoria: 'bebida',
    palavras: ['suco', 'agua', 'cerveja', 'vinho', 'whisky', 'rum', 'cachaca', 'vodka',
      'refrigerante', 'coca', 'guarana', 'energetico', 'cha', 'cafe', 'leite',
      'isotonico', 'drink', 'cocktail', 'espumante', 'sake'],
  },
  {
    categoria: 'padaria',
    palavras: ['pao', 'baguete', 'croissant', 'brioche', 'ciabatta', 'focaccia', 'broa',
      'torrada', 'bisnaga', 'pao de queijo', 'cucao', 'cucão'],
  },
]

function norm(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function classificarIngredienteDesconhecido(nome: string): Ingrediente {
  const n = norm(nome)
  for (const { palavras, categoria } of PALAVRAS_CATEGORIA) {
    if (palavras.some(p => n.includes(p))) {
      const d = DEFAULTS_POR_CATEGORIA[categoria]
      return { nome, categoria, ...d, sinonimos: [] }
    }
  }
  // fallback genérico → tempero/condimento
  const d = DEFAULTS_POR_CATEGORIA.tempero
  return { nome, categoria: 'tempero', ...d, sinonimos: [] }
}

// Busca local síncrona — retorna sugestões do banco
export function buscarIngrediente(termo: string): Ingrediente[] {
  if (!termo || termo.length < 2) return []
  const t = norm(termo)
  return DB.filter(ing => {
    const nome = norm(ing.nome)
    const sins = ing.sinonimos.map(norm)
    return nome.includes(t) || sins.some(s => s.includes(t))
  }).slice(0, 6)
}

// Cache em localStorage para não chamar a API duas vezes para o mesmo ingrediente
function getCacheIA(nome: string): Ingrediente | null {
  if (typeof window === 'undefined') return null
  try {
    const cache = JSON.parse(localStorage.getItem('ingredientes_ia_cache') || '{}')
    return cache[norm(nome)] ?? null
  } catch { return null }
}
function setCacheIA(ing: Ingrediente, key?: string) {
  if (typeof window === 'undefined') return
  try {
    const cache = JSON.parse(localStorage.getItem('ingredientes_ia_cache') || '{}')
    cache[key ?? norm(ing.nome)] = ing
    localStorage.setItem('ingredientes_ia_cache', JSON.stringify(cache))
  } catch {}
}

// Busca com IA — chama API quando ingrediente não está no banco local
export async function buscarIngredienteIA(termo: string, receitaNome?: string): Promise<Ingrediente> {
  const t = norm(termo)

  // 1. Banco local
  const local = DB.find(ing => norm(ing.nome).includes(t) || ing.sinonimos.map(norm).some(s => s.includes(t)))
  if (local) return local

  // 2. Cache localStorage (com chave que inclui contexto da receita)
  const cacheKey = receitaNome ? `${norm(termo)}__${norm(receitaNome)}` : norm(termo)
  const cached = getCacheIA(cacheKey)
  if (cached) return cached

  // 3. API Claude
  try {
    const res = await fetch('/api/ingrediente', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: termo, receitaNome }),
    })
    if (res.ok) {
      const dados = await res.json()
      const ing: Ingrediente = {
        nome: dados.nome ?? termo,
        categoria: dados.categoria ?? 'tempero',
        percapitaGramas: dados.percapitaGramas ?? 50,
        fatorCorrecao: dados.fatorCorrecao ?? 1.10,
        fatorCoccao: 1.00,
        sinonimos: [],
      }
      setCacheIA(ing, cacheKey)
      return ing
    }
  } catch {}

  // 4. Fallback classificação por palavras-chave
  return classificarIngredienteDesconhecido(termo)
}

export function encontrarIngrediente(nome: string): Ingrediente | undefined {
  const t = norm(nome)
  return DB.find(ing => {
    const n = norm(ing.nome)
    const sins = ing.sinonimos.map(norm)
    return n === t || sins.includes(t)
  })
}
