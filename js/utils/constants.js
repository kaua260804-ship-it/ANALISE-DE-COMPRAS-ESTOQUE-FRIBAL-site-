/**
 * ========================================
 * CONSTANTS.JS - CONSTANTES DO SISTEMA
 * ========================================
 */

const APP = {
    NAME: 'ANÁLISE DE ESTOQUE E VENDA',
    VERSION: '1.0.0',
    MAX_ROWS: 999999,
    PAGE_SIZE: 20,
    FILE_PATH: './data/BASE RELATORIO DE ESTOQUE VS VENDA.xlsx'
};

const SHEET_NAMES = {
    BS_CAD: ['BS CAD', 'BS_CAD', 'CADASTRO'],
    ESTOQUE_LOJA: ['ESTQ LJ', 'ESTOQUE LOJA', 'ESTOQUE_LJ', 'LOJA'],
    ESTOQUE_CD: ['ESTQ CD', 'ESTOQUE CDBR', 'ESTOQUE_CD', 'CDBR', 'CD'],
    VENDA_LOJA: ['VD LJ', 'VENDA LOJA', 'VENDA_LJ', 'VENDAS']
};

// ========================================
// MAPEAMENTO DE EMPRESAS PARA DIVISÃO
// ========================================
const EMPRESA_MAP = {
    // ===== LOJAS VAREJO =====
    'R001-EMP.CALHAU': 'VAREJO',
    'R004-EMP.COHAMA': 'VAREJO',
    'R005-MERC CRV90': 'VAREJO',
    'R027-EMP.PNS': 'VAREJO',
    'R028-EMP.TURU': 'VAREJO',
    'R029-EMP.PDA': 'VAREJO',
    'R063-MERC STI': 'VAREJO',
    'R064-EMP.THE': 'VAREJO',
    'R065-EMP.ITZ': 'VAREJO',
    'R072-MERC MAIOB': 'VAREJO',
    // ===== CD =====
    'C001-CD BR': 'DISTRIBUICAO'
};

// ========================================
// FUNÇÃO PARA OBTER A DIVISÃO DE UMA EMPRESA
// ========================================
function getDivisao(empresa) {
    // Se a empresa está no mapa, retorna a divisão
    if (EMPRESA_MAP[empresa]) {
        return EMPRESA_MAP[empresa];
    }
    
    // Se começa com 'C00' ou 'CD', é DISTRIBUICAO
    if (empresa && (empresa.startsWith('C00') || empresa.startsWith('CD') || empresa.includes('CD'))) {
        return 'DISTRIBUICAO';
    }
    
    // Se começa com 'R00' ou 'MERC', é VAREJO
    if (empresa && (empresa.startsWith('R00') || empresa.startsWith('MERC') || empresa.includes('MERC'))) {
        return 'VAREJO';
    }
    
    // Fallback padrão
    return 'VAREJO';
}

const STATUS_MAP = {
    'EM ESTOQUE': 'success',
    'ESTOQUE BAIXO': 'warning',
    'SEM ESTOQUE': 'danger',
    'EM ALTA': 'success',
    'SEM MOVIMENTO': 'warning',
    'NORMAL': 'success',
    'CRITICO': 'danger',
    'BAIXO': 'warning'
};

// ========================================
// COLUNAS DA TABELA
// ========================================
const TABLE_COLUMNS = [
    { key: 'Empresa', label: 'Empresa' },
    { key: 'Produto', label: 'Produto' },
    { key: 'Código Produto', label: 'Código' },
    { key: 'FORNECEDOR', label: 'Fornecedor' },
    { key: 'Quantidade Disponível (Loja)', label: 'Qtd Loja' },
    { key: 'Quantidade Disponível (CD)', label: 'Qtd CD' },
    { key: 'Preço Vda Unitário', label: 'Preço Unit.' },
    { key: 'Venda Valor', label: 'Venda R$' },
    { key: 'Venda Quantidade', label: 'Venda Qtd' },
    { key: 'CATEGORIA', label: 'Categoria' },
    { key: 'GRUPO', label: 'Grupo' },
    { key: 'SUBGRUPO1', label: 'Subgrupo' },
    { key: 'COMPRADOR', label: 'Comprador' }
];

// ========================================
// CARDS DO DASHBOARD
// ========================================
const DASHBOARD_CARDS = [
    { id: 'totalProdutos', icon: 'fa-box', color: '#4F46E5', label: 'Total Produtos' },
    { id: 'totalEstoqueLoja', icon: 'fa-store', color: '#059669', label: 'Estoque Loja' },
    { id: 'totalVendaQtd', icon: 'fa-shopping-cart', color: '#D97706', label: 'Venda Qtd' },
    { id: 'totalVendas', icon: 'fa-dollar-sign', color: '#DC2626', label: 'Vendas (R$)' }
];

// ========================================
// STATS
// ========================================
const STATS_CONFIG = [
    { id: 'mediaPreco', label: 'Média de Preço', icon: 'fa-tag' },
    { id: 'mediaCusto', label: 'Média de Custo', icon: 'fa-coins' },
    { id: 'totalDisponivel', label: 'Qtd Disponível', icon: 'fa-cubes' },
    { id: 'vendaTotalQtd', label: 'Total Venda Qtd', icon: 'fa-chart-bar' }
];

// ========================================
// EXPORTA PARA USO GLOBAL
// ========================================
window.APP = APP;
window.SHEET_NAMES = SHEET_NAMES;
window.EMPRESA_MAP = EMPRESA_MAP;
window.getDivisao = getDivisao;
window.STATUS_MAP = STATUS_MAP;
window.TABLE_COLUMNS = TABLE_COLUMNS;
window.DASHBOARD_CARDS = DASHBOARD_CARDS;
window.STATS_CONFIG = STATS_CONFIG;
