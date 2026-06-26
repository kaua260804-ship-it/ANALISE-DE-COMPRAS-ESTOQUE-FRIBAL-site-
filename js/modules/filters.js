/**
 * ========================================
 * FILTERS.JS - SISTEMA DE FILTROS COM MULTIPLA ESCOLHA
 * ========================================
 */

const Filters = {
    // Estado dos filtros selecionados
    selected: {
        empresa: [],
        categoria: [],
        grupo: [],
        subgrupo1: [],
        comprador: [],
        fornecedor: []
    },
    
    /**
     * Popula os filtros com valores únicos
     */
    populate(data) {
        console.log('🔍 Populando filtros...');
        
        if (!data || data.length === 0) {
            console.warn('⚠️ Sem dados para popular filtros');
            return;
        }
        
        // ===== EMPRESAS =====
        const empresas = [...new Set(data.map(i => i['Empresa']).filter(Boolean))];
        console.log('🏢 Empresas encontradas:', empresas.length);
        this.populateMultiSelect('empresaFilter', empresas);
        
        // ===== CATEGORIAS =====
        const categorias = [...new Set(data.map(i => i['CATEGORIA']).filter(Boolean))];
        console.log('📂 Categorias encontradas:', categorias.length);
        this.populateMultiSelect('categoriaFilter', categorias);
        
        // ===== GRUPOS =====
        const grupos = [...new Set(data.map(i => i['GRUPO']).filter(Boolean))];
        console.log('📁 Grupos encontrados:', grupos.length);
        this.populateMultiSelect('grupoFilter', grupos);
        
        // ===== SUBGRUPO1 =====
        const subgrupos1 = [...new Set(data.map(i => i['SUBGRUPO1']).filter(Boolean))];
        console.log('📂 Subgrupos 1 encontrados:', subgrupos1.length);
        this.populateMultiSelect('subgrupo1Filter', subgrupos1);
        
        // ===== COMPRADORES =====
        const compradores = [...new Set(data.map(i => i['COMPRADOR']).filter(Boolean))];
        console.log('👤 Compradores encontrados:', compradores.length);
        this.populateMultiSelect('compradorFilter', compradores);
        
        // ===== FORNECEDORES =====
        const fornecedores = [...new Set(data.map(i => i['FORNECEDOR']).filter(Boolean))];
        console.log('🚚 Fornecedores encontrados:', fornecedores.length);
        this.populateMultiSelect('fornecedorFilter', fornecedores);
        
        console.log('✅ Filtros populados com sucesso!');
    },
    
    /**
     * Popula um select múltiplo
     */
    populateMultiSelect(elementId, options) {
        const el = document.getElementById(elementId);
        if (!el) return;
        
        // Salva os selecionados atuais
        const currentSelected = Array.from(el.selectedOptions).map(o => o.value);
        
        el.innerHTML = '';
        
        // Adiciona opção "Todos"
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = 'Todos';
        allOption.selected = currentSelected.includes('all') || currentSelected.length === 0;
        el.appendChild(allOption);
        
        // Adiciona as opções
        options.sort().forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value || '(vazio)';
            option.selected = currentSelected.includes(value);
            el.appendChild(option);
        });
        
        // Configura como multiselect
        el.multiple = true;
        el.size = Math.min(options.length + 1, 6);
        
        // Adiciona evento de mudança
        el.onchange = () => {
            // Se "Todos" foi selecionado, desmarca os outros
            const selected = Array.from(el.selectedOptions).map(o => o.value);
            if (selected.includes('all') && selected.length > 1) {
                // Remove "Todos" se outros estiverem selecionados
                for (let opt of el.options) {
                    if (opt.value === 'all') {
                        opt.selected = false;
                    }
                }
            }
            // Se nenhum selecionado, seleciona "Todos"
            if (Array.from(el.selectedOptions).length === 0) {
                for (let opt of el.options) {
                    if (opt.value === 'all') {
                        opt.selected = true;
                        break;
                    }
                }
            }
            App.applyFilters();
        };
    },
    
    /**
     * Aplica os filtros aos dados (MULTIPLA ESCOLHA + PERSONALIZADOS)
     */
    apply(data) {
        const search = document.getElementById('searchInput').value.toLowerCase().trim();
        
        // Pega os valores selecionados de cada filtro
        const empresaSelected = Array.from(document.getElementById('empresaFilter').selectedOptions).map(o => o.value);
        const categoriaSelected = Array.from(document.getElementById('categoriaFilter').selectedOptions).map(o => o.value);
        const grupoSelected = Array.from(document.getElementById('grupoFilter').selectedOptions).map(o => o.value);
        const subgrupo1Selected = Array.from(document.getElementById('subgrupo1Filter').selectedOptions).map(o => o.value);
        const compradorSelected = Array.from(document.getElementById('compradorFilter').selectedOptions).map(o => o.value);
        const fornecedorSelected = Array.from(document.getElementById('fornecedorFilter').selectedOptions).map(o => o.value);
        
        // Filtros personalizados (radio)
        const comparativoEstoque = document.querySelector('input[name="comparativoEstoque"]:checked');
        const statusEstoque = document.querySelector('input[name="statusEstoque"]:checked');
        const statusVenda = document.querySelector('input[name="statusVenda"]:checked');
        
        const comparativoValue = comparativoEstoque ? comparativoEstoque.value : 'all';
        const statusEstoqueValue = statusEstoque ? statusEstoque.value : 'all';
        const statusVendaValue = statusVenda ? statusVenda.value : 'all';
        
        return data.filter(item => {
            // Busca
            if (search) {
                const produto = (item['Produto'] || '').toLowerCase();
                const codigo = (item['Código Produto'] || '').toString();
                if (!produto.includes(search) && !codigo.includes(search)) {
                    return false;
                }
            }
            
            // Filtro Empresa
            if (!empresaSelected.includes('all') && empresaSelected.length > 0) {
                if (!empresaSelected.includes(item['Empresa'])) return false;
            }
            
            // Filtro Categoria
            if (!categoriaSelected.includes('all') && categoriaSelected.length > 0) {
                if (!categoriaSelected.includes(item['CATEGORIA'])) return false;
            }
            
            // Filtro Grupo
            if (!grupoSelected.includes('all') && grupoSelected.length > 0) {
                if (!grupoSelected.includes(item['GRUPO'])) return false;
            }
            
            // Filtro Subgrupo1
            if (!subgrupo1Selected.includes('all') && subgrupo1Selected.length > 0) {
                if (!subgrupo1Selected.includes(item['SUBGRUPO1'])) return false;
            }
            
            // Filtro Comprador
            if (!compradorSelected.includes('all') && compradorSelected.length > 0) {
                if (!compradorSelected.includes(item['COMPRADOR'])) return false;
            }
            
            // Filtro Fornecedor
            if (!fornecedorSelected.includes('all') && fornecedorSelected.length > 0) {
                if (!fornecedorSelected.includes(item['FORNECEDOR'])) return false;
            }
            
            // ========================================
            // FILTROS PERSONALIZADOS
            // ========================================
            
            const qtdLoja = parseFloat(item['Quantidade Disponível (Loja)']) || 0;
            const qtdCD = parseFloat(item['Quantidade Disponível (CD)']) || 0;
            const vendaQtd = parseFloat(item['Venda Quantidade']) || 0;
            
            // 1. COMPARATIVO ESTOQUE
            if (comparativoValue !== 'all') {
                switch(comparativoValue) {
                    case 'lojaZero_cdMaior': // Loja=0 e CD>0
                        if (!(qtdLoja === 0 && qtdCD > 0)) return false;
                        break;
                    case 'lojaMaior_cdMaior': // Loja>0 e CD>0
                        if (!(qtdLoja > 0 && qtdCD > 0)) return false;
                        break;
                    case 'lojaZero_cdZero': // Loja=0 e CD=0
                        if (!(qtdLoja === 0 && qtdCD === 0)) return false;
                        break;
                    case 'lojaMaior_cdZero': // Loja>0 e CD=0
                        if (!(qtdLoja > 0 && qtdCD === 0)) return false;
                        break;
                }
            }
            
            // 2. STATUS ESTOQUE
            if (statusEstoqueValue !== 'all') {
                switch(statusEstoqueValue) {
                    case 'negativo': // Loja < 0
                        if (!(qtdLoja < 0)) return false;
                        break;
                    case 'normal': // Loja > 0
                        if (!(qtdLoja > 0)) return false;
                        break;
                    case 'zero': // Loja = 0
                        if (!(qtdLoja === 0)) return false;
                        break;
                }
            }
            
            // 3. STATUS VENDA
            if (statusVendaValue !== 'all') {
                switch(statusVendaValue) {
                    case 'comVenda': // Venda > 0
                        if (!(vendaQtd > 0)) return false;
                        break;
                    case 'semVenda': // Venda = 0
                        if (!(vendaQtd === 0)) return false;
                        break;
                }
            }
            
            return true;
        });
    },
    
    /**
     * Limpa todos os filtros
     */
    clear() {
        document.getElementById('searchInput').value = '';
        
        // Limpa seleções dos multiselects
        ['empresaFilter', 'categoriaFilter', 'grupoFilter', 'subgrupo1Filter', 'compradorFilter', 'fornecedorFilter'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            for (let opt of el.options) {
                opt.selected = opt.value === 'all';
            }
        });
        
        // Limpa os radios
        document.querySelectorAll('input[type="radio"]').forEach(el => {
            if (el.value === 'all') {
                el.checked = true;
            } else {
                el.checked = false;
            }
        });
    }
};

window.Filters = Filters;
