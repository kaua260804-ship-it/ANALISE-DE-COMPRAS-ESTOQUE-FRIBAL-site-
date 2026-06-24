/**
 * ========================================
 * STATISTICS.JS - ESTATÍSTICAS
 * ========================================
 */

const Statistics = {
    /**
     * Atualiza as estatísticas
     */
    update(data) {
        console.log('📈 Atualizando estatísticas...');
        
        if (!data || data.length === 0) {
            this.clear();
            return;
        }

        // ===== Média de Preço (VD LJ - Unitário Médio) =====
        const precos = data.map(item => parseFloat(item['Unitário Médio']) || 0).filter(v => v > 0);
        const mediaPreco = precos.length > 0 ? precos.reduce((a, b) => a + b, 0) / precos.length : 0;
        const elMediaPreco = document.getElementById('mediaPreco');
        if (elMediaPreco) elMediaPreco.textContent = Formatters.currency(mediaPreco);

        // ===== Média de Custo (ESTQ LJ - Custo Liq. Unitário) =====
        // Tenta diferentes nomes de coluna para custo
        const custos = data.map(item => {
            // Tenta várias possibilidades de nome da coluna de custo
            const custo = item['Custo Liq. Unitário'] || 
                          item['CustoLiqUnitario'] || 
                          item['Custo Líquido'] ||
                          item['CustoLiquido'] ||
                          item['Custo Unitário'] ||
                          item['CustoUnitario'] ||
                          item['Valor Custo'] ||
                          item['ValorCusto'] ||
                          0;
            return parseFloat(custo);
        }).filter(v => v > 0);

        console.log('📊 Custos encontrados:', custos.length, 'registros com custo > 0');
        if (custos.length > 0) {
            console.log('  Exemplo de custos:', custos.slice(0, 5));
        }

        const mediaCusto = custos.length > 0 ? custos.reduce((a, b) => a + b, 0) / custos.length : 0;
        const elMediaCusto = document.getElementById('mediaCusto');
        if (elMediaCusto) elMediaCusto.textContent = Formatters.currency(mediaCusto);

        // ===== Quantidade Disponível (Soma) =====
        const totalDisponivel = data.reduce((s, i) => s + (parseFloat(i['Quantidade Disponível (Loja)']) || 0), 0);
        const elTotalDisponivel = document.getElementById('totalDisponivel');
        if (elTotalDisponivel) elTotalDisponivel.textContent = Formatters.number(Math.round(totalDisponivel));

        // ===== Total Venda Quantidade (Soma) =====
        const vendaTotalQtd = data.reduce((s, i) => s + (parseFloat(i['Venda Quantidade']) || 0), 0);
        const elVendaTotalQtd = document.getElementById('vendaTotalQtd');
        if (elVendaTotalQtd) elVendaTotalQtd.textContent = Formatters.number(Math.round(vendaTotalQtd));
    },

    /**
     * Limpa as estatísticas
     */
    clear() {
        const ids = ['mediaPreco', 'mediaCusto', 'totalDisponivel', 'vendaTotalQtd'];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '-';
        });
    }
};

window.Statistics = Statistics;