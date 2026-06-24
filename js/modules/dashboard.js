/**
 * ========================================
 * DASHBOARD.JS - CARDS DO DASHBOARD
 * ========================================
 */

const Dashboard = {
    /**
     * Atualiza todos os cards do dashboard
     */
    update(data) {
        console.log('📊 Atualizando dashboard...');
        
        if (!data || data.length === 0) {
            this.clear();
            return;
        }
        
        // Total de produtos únicos
        const produtos = new Set(data.map(item => item['Código Produto']));
        const elProdutos = document.getElementById('totalProdutos');
        if (elProdutos) elProdutos.textContent = Formatters.number(produtos.size);
        
        // Estoque Loja
        const estoqueLoja = data.reduce((s, i) => s + (parseFloat(i['Quantidade Disponível (Loja)']) || 0), 0);
        const elLoja = document.getElementById('totalEstoqueLoja');
        if (elLoja) elLoja.textContent = Formatters.number(Math.round(estoqueLoja));
        
        // Venda Quantidade (substituiu Estoque CD)
        const vendaQtd = data.reduce((s, i) => s + (parseFloat(i['Venda Quantidade']) || 0), 0);
        const elVendaQtd = document.getElementById('totalVendaQtd');
        if (elVendaQtd) elVendaQtd.textContent = Formatters.number(Math.round(vendaQtd));
        
        // Vendas (R$)
        const vendas = data.reduce((s, i) => s + (parseFloat(i['Venda Valor']) || 0), 0);
        const elVendas = document.getElementById('totalVendas');
        if (elVendas) elVendas.textContent = Formatters.currency(vendas);
    },
    
    /**
     * Limpa os cards
     */
    clear() {
        const ids = ['totalProdutos', 'totalEstoqueLoja', 'totalVendaQtd', 'totalVendas'];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '0';
        });
    }
};

window.Dashboard = Dashboard;