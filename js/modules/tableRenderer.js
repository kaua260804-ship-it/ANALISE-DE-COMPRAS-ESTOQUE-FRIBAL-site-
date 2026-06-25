/**
 * ========================================
 * TABLERENDERER.JS - RENDERIZAÇÃO DA TABELA COM PAGINAÇÃO
 * ========================================
 */

const TableRenderer = {
    pageSize: 20,
    currentPage: 1,
    totalPages: 1,
    dataCache: [],
    
    /**
     * Renderiza a tabela com paginação
     */
    render(data) {
        const container = document.getElementById('tableContainer');
        const loading = document.getElementById('loadingMessage');
        const rowCount = document.getElementById('rowCount');
        
        if (!data || data.length === 0) {
            if (container) container.style.display = 'none';
            if (loading) {
                loading.style.display = 'flex';
                loading.innerHTML = `
                    <i class="fas fa-search"></i>
                    <p>Nenhum registro encontrado</p>
                    <p style="font-size: 14px; color: #9CA3AF;">Tente ajustar os filtros</p>
                `;
            }
            if (rowCount) rowCount.textContent = '0';
            return;
        }
        
        this.dataCache = data;
        this.totalPages = Math.ceil(data.length / this.pageSize);
        this.currentPage = Math.min(this.currentPage, this.totalPages);
        
        const start = (this.currentPage - 1) * this.pageSize;
        const end = Math.min(start + this.pageSize, data.length);
        const pageData = data.slice(start, end);
        
        if (loading) loading.style.display = 'none';
        if (container) container.style.display = 'block';
        if (rowCount) rowCount.textContent = data.length;
        
        // ========================================
        // COLUNAS NA NOVA ORDEM
        // Empresa | Produto | Código | Fornecedor | Qtd Loja | Qtd CD | Preço Unit. | Venda R$ | Venda Qtd | Categoria | Grupo | Subgrupo | Comprador
        // ========================================
        const colunas = [
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
        
        let html = '<table><thead><tr>';
        colunas.forEach(col => {
            html += `<th>${col.label}</th>`;
        });
        html += '</tr></thead><tbody>';
        
        pageData.forEach((item) => {
            html += '<tr>';
            colunas.forEach(col => {
                let valor = item[col.key] !== undefined && item[col.key] !== null ? item[col.key] : '';
                let extraStyle = '';
                
                if (col.key === 'Empresa') {
                    if (valor === 'R001-EMP.CALHAU') {
                        extraStyle = ' style="color:#4F46E5;font-weight:600;"';
                    } else if (valor === 'C001-CD BR') {
                        extraStyle = ' style="color:#D97706;font-weight:600;"';
                    } else if (valor && valor !== 'N/A') {
                        extraStyle = ' style="color:#6B7280;font-weight:500;"';
                    }
                    if (!valor) valor = 'N/A';
                } else if (col.key === 'GRUPO' || col.key === 'SUBGRUPO1' || col.key === 'CATEGORIA' || col.key === 'COMPRADOR') {
                    if (valor) {
                        extraStyle = ' style="color:#6B7280;"';
                    } else {
                        valor = '-';
                    }
                } else if (col.key === 'FORNECEDOR') {
                    if (valor) {
                        extraStyle = ' style="color:#6B7280;"';
                    } else {
                        valor = '-';
                    }
                } else if (col.key === 'Quantidade Disponível (Loja)' && typeof valor === 'number') {
                    if (valor < 0) extraStyle = ' style="color:#DC2626;font-weight:600;"';
                    else if (valor < 10 && valor > 0) extraStyle = ' style="color:#D97706;font-weight:500;"';
                    valor = Formatters.number(Math.round(valor));
                } else if (col.key === 'Quantidade Disponível (CD)' && typeof valor === 'number') {
                    if (valor > 0) extraStyle = ' style="color:#059669;font-weight:500;"';
                    else if (valor < 0) extraStyle = ' style="color:#DC2626;font-weight:500;"';
                    valor = Formatters.number(Math.round(valor));
                } else if (col.key === 'Venda Valor' && typeof valor === 'number') {
                    if (valor > 0) extraStyle = ' style="color:#059669;font-weight:600;"';
                    valor = Formatters.currency(valor);
                } else if (col.key === 'Venda Quantidade' && typeof valor === 'number') {
                    if (valor > 0) extraStyle = ' style="color:#D97706;font-weight:500;"';
                    valor = Formatters.number(Math.round(valor));
                } else if (typeof valor === 'number') {
                    valor = Formatters.decimal(valor);
                }
                
                html += `<td${extraStyle}>${valor}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        
        html += this.renderPagination(start, end, data.length);
        if (container) container.innerHTML = html;
    },
    
    /**
     * Renderiza o componente de paginação
     */
    renderPagination(start, end, total) {
        let pageOptions = '';
        const totalPagesToShow = Math.min(this.totalPages, 50);
        for (let i = 1; i <= totalPagesToShow; i++) {
            pageOptions += `<option value="${i}" ${i === this.currentPage ? 'selected' : ''}>${i}</option>`;
        }
        if (this.totalPages > 50) {
            pageOptions += `<option value="all">...</option>`;
        }
        
        // Verifica se está carregando
        const statusEl = document.getElementById('dataStatus');
        const isLoading = statusEl ? statusEl.classList.contains('loading') : false;
        
        return `
            <div class="pagination-container" style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-top:1px solid #E5E7EB;background:#F9FAFB;flex-wrap:wrap;gap:8px;">
                <div style="font-size:13px;color:#6B7280;">
                    Mostrando <strong>${start + 1}</strong> a <strong>${end}</strong> de <strong>${total}</strong> registros
                    ${isLoading ? '<span style="margin-left:8px;color:#D97706;"><i class="fas fa-spinner fa-spin"></i> atualizando...</span>' : ''}
                </div>
                <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
                    <button class="btn-pagination" onclick="TableRenderer.goToPage(1)" ${this.currentPage === 1 ? 'disabled' : ''}>
                        <i class="fas fa-angle-double-left"></i>
                    </button>
                    <button class="btn-pagination" onclick="TableRenderer.goToPage(${this.currentPage - 1})" ${this.currentPage === 1 ? 'disabled' : ''}>
                        <i class="fas fa-angle-left"></i>
                    </button>
                    <span style="font-size:13px;color:#374151;padding:0 8px;font-weight:600;white-space:nowrap;">
                        Página ${this.currentPage} de ${this.totalPages}
                    </span>
                    <button class="btn-pagination" onclick="TableRenderer.goToPage(${this.currentPage + 1})" ${this.currentPage === this.totalPages ? 'disabled' : ''}>
                        <i class="fas fa-angle-right"></i>
                    </button>
                    <button class="btn-pagination" onclick="TableRenderer.goToPage(${this.totalPages})" ${this.currentPage === this.totalPages ? 'disabled' : ''}>
                        <i class="fas fa-angle-double-right"></i>
                    </button>
                    <select onchange="TableRenderer.goToPage(parseInt(this.value))" style="padding:4px 8px;border:1px solid #D1D5DB;border-radius:6px;font-size:13px;background:white;cursor:pointer;margin-left:8px;">
                        ${pageOptions}
                    </select>
                    <button class="btn-pagination" onclick="TableRenderer.exportToExcel()" style="background:#059669;color:white;border-color:#059669;">
                        <i class="fas fa-file-excel"></i> Exportar
                    </button>
                </div>
            </div>
        `;
    },
    
    /**
     * Exporta para Excel (baseado nos dados filtrados)
     */
    exportToExcel() {
        const data = this.dataCache;
        if (!data || data.length === 0) {
            alert('Nenhum dado para exportar!');
            return;
        }
        
        console.log('📊 Exportando para Excel:', data.length, 'registros');
        
        // Prepara os dados para exportação (nova ordem)
        const exportData = data.map(item => ({
            'Empresa': item['Empresa'] || '',
            'Produto': item['Produto'] || '',
            'Código': item['Código Produto'] || '',
            'Fornecedor': item['FORNECEDOR'] || '',
            'Qtd Loja': item['Quantidade Disponível (Loja)'] || 0,
            'Qtd CD': item['Quantidade Disponível (CD)'] || 0,
            'Preço Unit.': item['Preço Vda Unitário'] || 0,
            'Venda R$': item['Venda Valor'] || 0,
            'Venda Qtd': item['Venda Quantidade'] || 0,
            'Categoria': item['CATEGORIA'] || '',
            'Grupo': item['GRUPO'] || '',
            'Subgrupo': item['SUBGRUPO1'] || '',
            'Comprador': item['COMPRADOR'] || ''
        }));
        
        // Cria workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(wb, ws, 'Relatorio');
        
        // Ajusta largura das colunas (nova ordem)
        ws['!cols'] = [
            { wch: 15 }, // Empresa
            { wch: 40 }, // Produto
            { wch: 12 }, // Código
            { wch: 30 }, // Fornecedor
            { wch: 10 }, // Qtd Loja
            { wch: 10 }, // Qtd CD
            { wch: 12 }, // Preço Unit.
            { wch: 14 }, // Venda R$
            { wch: 10 }, // Venda Qtd
            { wch: 15 }, // Categoria
            { wch: 15 }, // Grupo
            { wch: 15 }, // Subgrupo
            { wch: 20 }  // Comprador
        ];
        
        // Salva o arquivo
        const fileName = `Relatorio_Estoque_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '_')}.xlsx`;
        XLSX.writeFile(wb, fileName);
        
        console.log('✅ Arquivo exportado:', fileName);
        alert(`✅ Relatório exportado com sucesso!\n\n${data.length} registros\nArquivo: ${fileName}`);
    },
    
    goToPage(page) {
        if (page === 'all') {
            this.pageSize = this.dataCache.length;
            this.currentPage = 1;
            this.totalPages = 1;
            this.render(this.dataCache);
            return;
        }
        if (page < 1 || page > this.totalPages || page === this.currentPage) return;
        this.currentPage = page;
        this.render(this.dataCache);
        const wrapper = document.getElementById('tableWrapper');
        if (wrapper) wrapper.scrollTop = 0;
    },
    
    reset() {
        this.currentPage = 1;
        this.totalPages = 1;
        this.dataCache = [];
    }
};

window.TableRenderer = TableRenderer;
