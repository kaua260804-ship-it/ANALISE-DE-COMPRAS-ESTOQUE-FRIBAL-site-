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
        comprador: []
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
     * Aplica os filtros aos dados (MULTIPLA ESCOLHA)
     */
    apply(data) {
        const search = document.getElementById('searchInput').value.toLowerCase().trim();
        
        // Pega os valores selecionados de cada filtro
        const empresaSelected = Array.from(document.getElementById('empresaFilter').selectedOptions).map(o => o.value);
        const categoriaSelected = Array.from(document.getElementById('categoriaFilter').selectedOptions).map(o => o.value);
        const grupoSelected = Array.from(document.getElementById('grupoFilter').selectedOptions).map(o => o.value);
        const subgrupo1Selected = Array.from(document.getElementById('subgrupo1Filter').selectedOptions).map(o => o.value);
        const compradorSelected = Array.from(document.getElementById('compradorFilter').selectedOptions).map(o => o.value);
        
        return data.filter(item => {
            // Busca
            if (search) {
                const produto = (item['Produto'] || '').toLowerCase();
                const codigo = (item['Código Produto'] || '').toString();
                if (!produto.includes(search) && !codigo.includes(search)) {
                    return false;
                }
            }
            
            // Filtro Empresa (multipla escolha)
            if (!empresaSelected.includes('all') && empresaSelected.length > 0) {
                if (!empresaSelected.includes(item['Empresa'])) return false;
            }
            
            // Filtro Categoria (multipla escolha)
            if (!categoriaSelected.includes('all') && categoriaSelected.length > 0) {
                if (!categoriaSelected.includes(item['CATEGORIA'])) return false;
            }
            
            // Filtro Grupo (multipla escolha)
            if (!grupoSelected.includes('all') && grupoSelected.length > 0) {
                if (!grupoSelected.includes(item['GRUPO'])) return false;
            }
            
            // Filtro Subgrupo1 (multipla escolha)
            if (!subgrupo1Selected.includes('all') && subgrupo1Selected.length > 0) {
                if (!subgrupo1Selected.includes(item['SUBGRUPO1'])) return false;
            }
            
            // Filtro Comprador (multipla escolha)
            if (!compradorSelected.includes('all') && compradorSelected.length > 0) {
                if (!compradorSelected.includes(item['COMPRADOR'])) return false;
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
        ['empresaFilter', 'categoriaFilter', 'grupoFilter', 'subgrupo1Filter', 'compradorFilter'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            // Seleciona "Todos"
            for (let opt of el.options) {
                opt.selected = opt.value === 'all';
            }
        });
    }
};

window.Filters = Filters;
