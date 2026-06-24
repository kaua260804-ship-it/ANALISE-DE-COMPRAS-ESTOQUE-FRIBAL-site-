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
        carregando: false
    },
    
    /**
     * Inicializa a aplicação
     */
    init() {
        console.log('🚀 Inicializando aplicação...');
        this.loadData();
    },
    
    /**
     * Carrega os dados
     */
    async loadData() {
        if (this.state.carregando) return;
        this.state.carregando = true;
        
        try {
            this.setStatus('loading', 'Carregando dados...');
            console.log('📊 Carregando dados...');
            
            const dados = await DataProcessor.process();
            console.log(`✅ ${dados.length} registros carregados`);
            
            this.state.dados = dados;
            this.state.filtrados = [...dados];
            
            // Atualiza interface
            this.updateUI();
            
            this.setStatus('success', `✅ ${dados.length} registros`);
            document.getElementById('lastUpdate').textContent = new Date().toLocaleString('pt-BR');
            
        } catch (error) {
            console.error('❌ Erro:', error);
            this.setStatus('error', 'Erro ao carregar');
            this.showError(error.message);
        } finally {
            this.state.carregando = false;
        }
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
     * Atualiza o status no header
     */
    setStatus(type, message) {
        const el = document.getElementById('dataStatus');
        const icon = el.querySelector('i');
        const text = el.querySelector('span');
        
        el.className = `data-status ${type}`;
        
        const icons = {
            'loading': 'fa-spinner fa-spin',
            'success': 'fa-check-circle',
            'error': 'fa-times-circle'
        };
        
        icon.className = `fas ${icons[type] || 'fa-circle'}`;
        text.textContent = message;
    },
    
    /**
     * Mostra erro na tela
     */
    showError(message) {
        const container = document.getElementById('tableContainer');
        const loading = document.getElementById('loadingMessage');
        
        loading.style.display = 'flex';
        container.style.display = 'none';
        
        loading.innerHTML = `
            <i class="fas fa-exclamation-circle" style="color: #DC2626;"></i>
            <p style="color: #DC2626; font-weight: 600;">Erro ao carregar dados</p>
            <p style="font-size: 14px; color: #6B7280;">${message}</p>
            <button onclick="App.loadData()" style="margin-top:16px;padding:10px 24px;background:#4F46E5;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">
                <i class="fas fa-redo"></i> Tentar novamente
            </button>
        `;
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