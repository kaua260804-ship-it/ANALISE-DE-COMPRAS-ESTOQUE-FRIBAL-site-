/**
 * ========================================
 * DATAJOINER.JS - JOIN ENTRE ABAS (PROCV)
 * ========================================
 */

const DataJoiner = {
    /**
     * Cria um índice para busca eficiente
     */
    createIndex(data, keys) {
        const index = {};
        
        if (!data || data.length === 0) {
            return index;
        }
        
        data.forEach(item => {
            const key = keys.map(k => {
                const value = item[k] || '';
                return value.toString().trim();
            }).join('|');
            
            if (key && key !== '|') {
                index[key] = item;
            }
        });
        
        return index;
    },
    
    /**
     * Busca um item no índice
     */
    findInIndex(index, keys, values) {
        const key = keys.map(k => {
            const value = values[k] || '';
            return value.toString().trim();
        }).join('|');
        
        return index[key] || null;
    },
    
    /**
     * Faz o join entre duas tabelas
     */
    join(leftData, rightData, leftKeys, rightKeys) {
        const rightIndex = this.createIndex(rightData, rightKeys);
        const result = [];
        
        leftData.forEach(leftItem => {
            const match = this.findInIndex(rightIndex, rightKeys, leftItem);
            result.push({
                ...leftItem,
                ...(match || {})
            });
        });
        
        return result;
    }
};

window.DataJoiner = DataJoiner;