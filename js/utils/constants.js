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

const EMPRESA_MAP = {
    'R001-EMP.CALHAU': 'VAREJO',
    'C001-CD BR': 'DISTRIBUICAO'
};

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
    { key: 'CATEGORIA', label: 'Categoria' },
    { key: 'GRUPO', label: 'Grupo' },
    { key: 'SUBGRUPO1', label: 'Subgrupo' },
    { key: 'COMPRADOR', label: 'Comprador' },
    { key: 'FORNECEDOR', label: 'Fornecedor' },
    { key: 'Quantidade Disponível (Loja)', label: 'Qtd Loja' },
    { key: 'Quantidade Disponível (CD)', label: 'Qtd CD' },
    { key: 'Preço Vda Unitário', label: 'Preço Unit.' },
    { key: 'Venda Valor', label: 'Venda R$' },
    { key: 'Venda Quantidade', label: 'Venda Qtd' }
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
