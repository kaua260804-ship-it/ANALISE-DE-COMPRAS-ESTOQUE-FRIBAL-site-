/**
 * ========================================
 * EXCELLOADER.JS - LEITURA DE PLANILHAS
 * ========================================
 */

const ExcelLoader = {
    /**
     * Carrega um arquivo Excel e retorna todas as abas
     */
    async load(filePath) {
        console.log('📁 Carregando arquivo:', filePath);
        
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Arquivo não encontrado: ${filePath}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { 
                type: 'array',
                cellDates: true,
                dateNF: 'yyyy-mm-dd'
            });
            
            console.log('📋 Abas encontradas:', workbook.SheetNames);
            
            // Converte todas as abas para JSON
            const sheets = {};
            workbook.SheetNames.forEach(name => {
                sheets[name] = XLSX.utils.sheet_to_json(workbook.Sheets[name]);
            });
            
            return {
                workbook,
                sheets,
                sheetNames: workbook.SheetNames
            };
            
        } catch (error) {
            console.error('❌ Erro ao carregar arquivo:', error);
            throw error;
        }
    },
    
    /**
     * Encontra uma aba por seus possíveis nomes
     */
    findSheet(sheetNames, possibleNames) {
        for (const name of possibleNames) {
            if (sheetNames.includes(name)) {
                return name;
            }
        }
        return null;
    },
    
    /**
     * Extrai dados de uma aba específica
     */
    getSheetData(sheets, sheetName) {
        return sheets[sheetName] || [];
    }
};

window.ExcelLoader = ExcelLoader;