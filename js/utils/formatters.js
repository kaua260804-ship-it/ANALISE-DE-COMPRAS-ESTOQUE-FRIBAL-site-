/**
 * ========================================
 * FORMATTERS.JS - FUNÇÕES DE FORMATAÇÃO
 * ========================================
 */

const Formatters = {
    /**
     * Formata um número com separadores de milhar
     */
    number(value) {
        if (typeof value !== 'number' || isNaN(value)) return value;
        return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    },
    
    /**
     * Formata um valor monetário em R$
     */
    currency(value) {
        if (typeof value !== 'number' || isNaN(value)) return value;
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    },
    
    /**
     * Formata um percentual
     */
    percent(value) {
        if (typeof value !== 'number' || isNaN(value)) return value;
        return value.toFixed(1) + '%';
    },
    
    /**
     * Formata uma data
     */
    date(value) {
        if (!value) return '-';
        try {
            const d = new Date(value);
            return d.toLocaleDateString('pt-BR');
        } catch {
            return value;
        }
    },
    
    /**
     * Formata um número com decimais
     */
    decimal(value, decimals = 2) {
        if (typeof value !== 'number' || isNaN(value)) return value;
        return value.toFixed(decimals).replace('.', ',');
    },
    
    /**
     * Trunca um texto com ellipsis
     */
    truncate(text, maxLength = 50) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
};

// Exporta para uso global
window.Formatters = Formatters;