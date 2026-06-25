/**
 * ========================================
 * MAIN.JS - ORQUESTRADOR PRINCIPAL
 * ========================================
 */

const App = {
    // Estado da aplicação
    state: {
        dados: [],
        filtrados: [],
        carregando: false,
        cacheKey: 'estoque_dados_cache',
        cacheTimestamp: 'estoque_dados_timestamp'
    },
    
    /**
     * Inicializa a aplicação
     */
    init() {
        console.log('🚀 Inicializando aplicação...');
        
        // Verifica se tem dados em cache
        const cache = this.loadFromCache();
        if (cache) {
            console.log('📦 Carregando dados do cache...');
            this.state.dados = cache;
            this.state.filtrados = [...cache];
            this.updateUI();
            this.setStatus('success', `✅ ${cache.length} registros (cache)`);
            document.getElementById('lastUpdate').textContent = this.getCacheTimestamp();
            
            // Carrega em background para verificar atualizações
            setTimeout(() => {
                this.loadData(true); // true = background
            }, 500);
        } else {
            // Primeiro acesso - carrega normal
            this.loadData();
        }
    },
    
    /**
     * Carrega os dados
     */
    async loadData(background = false) {
        if (this.state.carregando) return;
        this.state.carregando = true;
        
        if (!background) {
            this.setStatus('loading', 'Carregando dados...');
            console.log('📊 Carregando dados...');
        } else {
            console.log('🔄 Verificando atualizações em background...');
        }
        
        try {
            const dados = await DataProcessor.process();
            console.log(`✅ ${dados.length} registros carregados`);
            
            // Salva no cache
            this.saveToCache(dados);
            
            // Atualiza estado
            this.state.dados = dados;
            this.state.filtrados = [...dados];
            
            // Atualiza interface
            this.updateUI();
            
            const msg = `✅ ${dados.length} registros ${background ? '(atualizado)' : ''}`;
            this.setStatus('success', msg);
            document.getElementById('lastUpdate').textContent = this.getCacheTimestamp();
            
            if (background) {
                console.log('✅ Cache atualizado em background!');
            }
            
        } catch (error) {
            console.error('❌ Erro:', error);
            if (!background) {
                this.setStatus('error', 'Erro ao carregar');
                this.showError(error.message);
            }
        } finally {
            this.state.carregando = false;
        }
    },
    
    /**
     * Salva dados no cache
     */
    saveToCache(dados) {
        try {
            localStorage.setItem(this.state.cacheKey, JSON.stringify(dados));
            localStorage.setItem(this.state.cacheTimestamp, new Date().toISOString());
        } catch (e) {
            console.warn('⚠️ Erro ao salvar cache:', e);
        }
    },
    
    /**
     * Carrega dados do cache
     */
    loadFromCache() {
        try {
            const data = localStorage.getItem(this.state.cacheKey);
            if (data) {
                return JSON.parse(data);
            }
        } catch (e) {
            console.warn('⚠️ Erro ao ler cache:', e);
        }
        return null;
    },
    
    /**
     * Pega timestamp do cache
     */
    getCacheTimestamp() {
        try {
            const ts = localStorage.getItem(this.state.cacheTimestamp);
            if (ts) {
                return new Date(ts).toLocaleString('pt-BR');
            }
        } catch (e) {}
        return '-';
    },
    
    /**
     * Atualiza a interface
     */
    updateUI() {
        const dados = this.state.filtrados;
        
        Dashboard.update(dados);
        Statistics.update(dados);
        Filters.populate(this.state.dados);
        TableRenderer.render(dados);
        document.getElementById('rowCount').textContent = dados.length;
    },
    
    /**
     * Aplica os filtros
     */
    applyFilters() {
        this.state.filtrados = Filters.apply(this.state.dados);
        this.updateUI();
    },
    
    /**
     * Limpa os filtros
     */
    clearFilters() {
        Filters.clear();
        this.state.filtrados = [...this.state.dados];
        this.updateUI();
    },
    
    /**
     * Limpa o cache e recarrega
     */
    forceReload() {
        if (confirm('Deseja recarregar todos os dados da planilha?')) {
            localStorage.removeItem(this.state.cacheKey);
            localStorage.removeItem(this.state.cacheTimestamp);
            this.loadData(false);
        }
    },
    
    /**
     * Atualiza o status no header
     */
    setStatus(type, message) {
        const el = document.getElementById('dataStatus');
        if (!el) return;
        
        const icon = el.querySelector('i');
        const text = el.querySelector('span');
        
        el.className = `data-status ${type}`;
        
        const icons = {
            'loading': 'fa-spinner fa-spin',
            'success': 'fa-check-circle',
            'error': 'fa-times-circle'
        };
        
        if (icon) icon.className = `fas ${icons[type] || 'fa-circle'}`;
        if (text) text.textContent = message;
    },
    
    /**
     * Mostra erro na tela
     */
    showError(message) {
        const container = document.getElementById('tableContainer');
        const loading = document.getElementById('loadingMessage');
        
        if (loading) {
            loading.style.display = 'flex';
            loading.innerHTML = `
                <i class="fas fa-exclamation-circle" style="color: #DC2626;"></i>
                <p style="color: #DC2626; font-weight: 600;">Erro ao carregar dados</p>
                <p style="font-size: 14px; color: #6B7280;">${message}</p>
                <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
                    <button onclick="App.loadData()" style="padding:10px 24px;background:#4F46E5;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">
                        <i class="fas fa-redo"></i> Tentar novamente
                    </button>
                    <button onclick="App.forceReload()" style="padding:10px 24px;background:#DC2626;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">
                        <i class="fas fa-trash"></i> Limpar Cache
                    </button>
                </div>
            `;
        }
        if (container) container.style.display = 'none';
    }
};

// ========================================
// INICIALIZAÇÃO
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Expõe funções globalmente
window.App = App;
