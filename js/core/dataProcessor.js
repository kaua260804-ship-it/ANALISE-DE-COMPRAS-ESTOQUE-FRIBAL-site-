/**
 * ========================================
 * DATAPROCESSOR.JS - PROCESSADOR DE DADOS
 * ========================================
 */

const DataProcessor = {
    async process() {
        console.log('🚀 Iniciando processamento...');
        
        try {
            const { sheets, sheetNames } = await ExcelLoader.load(APP.FILE_PATH);
            
            const bsCadName = ExcelLoader.findSheet(sheetNames, ['BS CAD', 'BS_CAD', 'CADASTRO']);
            const estoqueLojaName = ExcelLoader.findSheet(sheetNames, ['ESTQ LJ', 'ESTOQUE LOJA', 'ESTOQUE_LJ', 'LOJA']);
            const estoqueCDName = ExcelLoader.findSheet(sheetNames, ['ESTQ CD', 'ESTOQUE CDBR', 'ESTOQUE_CD', 'CDBR', 'CD']);
            const vendaLojaName = ExcelLoader.findSheet(sheetNames, ['VD LJ', 'VENDA LOJA', 'VENDA_LJ', 'VENDAS']);
            
            console.log('📌 Abas mapeadas:', {
                'BS CAD': bsCadName,
                'ESTOQUE LOJA': estoqueLojaName,
                'ESTOQUE CD': estoqueCDName,
                'VENDA LOJA': vendaLojaName
            });
            
            const bsCad = ExcelLoader.getSheetData(sheets, bsCadName);
            const estoqueLoja = ExcelLoader.getSheetData(sheets, estoqueLojaName);
            const estoqueCD = ExcelLoader.getSheetData(sheets, estoqueCDName);
            const vendaLoja = ExcelLoader.getSheetData(sheets, vendaLojaName);
            
            console.log('📊 Registros encontrados:');
            console.log('  BS CAD:', bsCad.length);
            console.log('  ESTOQUE LOJA:', estoqueLoja.length);
            console.log('  ESTOQUE CD:', estoqueCD.length);
            console.log('  VENDA LOJA:', vendaLoja.length);
            
            if (estoqueLoja.length === 0) {
                console.warn('⚠️ ESTOQUE LOJA vazia, usando fallback');
                return this.fallback(bsCad);
            }
            
            // ========================================
            // ANALISA O PRIMEIRO REGISTRO DA ESTQ LJ
            // ========================================
            if (estoqueLoja.length > 0) {
                const primeiro = estoqueLoja[0];
                console.log('📝 Primeiro registro da ESTQ LJ:');
                console.log('  Todas as chaves:', Object.keys(primeiro));
                
                // Procura por campos de custo
                const possiveisCustos = ['Custo Liq. Unitário', 'CustoLiqUnitario', 'Custo Líquido', 'CustoLiquido', 'Custo Unitário', 'CustoUnitario', 'Valor Custo', 'ValorCusto'];
                possiveisCustos.forEach(key => {
                    if (primeiro[key] !== undefined) {
                        console.log(`  CUSTO - ${key}:`, primeiro[key]);
                    }
                });
            }
            
            // ========================================
            // CRIA ÍNDICES
            // ========================================
            console.log('🔨 Criando índices para busca...');
            
            const bsCadIndex = {};
            bsCad.forEach(item => {
                const chave = `${item['SEQPRODUTO']}|${item['DIVISAO']}`;
                bsCadIndex[chave] = item;
            });
            
            const cdIndex = {};
            estoqueCD.forEach(item => {
                const empresa = item['Empresa'] || item['EMPRESA'] || '';
                const codigo = item['Código Produto'] || item['CODIGO PRODUTO'] || '';
                const chave = `${codigo}|${empresa}`;
                cdIndex[chave] = item;
                if (codigo) {
                    cdIndex[`${codigo}|`] = item;
                }
            });
            
            const vendaIndex = {};
            vendaLoja.forEach(item => {
                const empresa = item['Empresa'] || item['EMPRESA'] || '';
                const codigo = item['Código Produto'] || item['CODIGO PRODUTO'] || '';
                const chave = `${codigo}|${empresa}`;
                vendaIndex[chave] = item;
                if (codigo) {
                    vendaIndex[`${codigo}|`] = item;
                }
            });
            
            console.log('✅ Índices criados');
            
            // ========================================
            // PROCESSA OS DADOS
            // ========================================
            console.log(`📊 Processando ${estoqueLoja.length} registros...`);
            
            const resultado = [];
            let comEmpresa = 0;
            let comVenda = 0;
            let comCD = 0;
            let comCusto = 0;
            
            for (let i = 0; i < estoqueLoja.length; i++) {
                const item = estoqueLoja[i];
                
                // Empresa
                let empresa = item['Empresa'] || item['EMPRESA'] || item['Código Empresa'] || item['CODIGO EMPRESA'] || '';
                if (!empresa) {
                    const divisao = item['DIVISAO'] || '';
                    if (divisao === 'VAREJO') {
                        empresa = 'R001-EMP.CALHAU';
                    } else if (divisao === 'DISTRIBUICAO') {
                        empresa = 'C001-CD BR';
                    }
                }
                if (empresa) comEmpresa++;
                
                const codigo = item['Código Produto'] || item['CODIGO PRODUTO'] || item['SEQPRODUTO'] || '';
                const divisao = EMPRESA_MAP[empresa] || 'VAREJO';
                
                // Busca no cadastro
                const chaveCadastro = `${codigo}|${divisao}`;
                const cadastro = bsCadIndex[chaveCadastro] || {};
                
                // Busca no CD
                let cd = cdIndex[`${codigo}|${empresa}`] || {};
                if (Object.keys(cd).length === 0) {
                    cd = cdIndex[`${codigo}|`] || {};
                }
                if (parseFloat(cd['Quantidade Disponível'] || cd['QuantidadeDisponivel'] || 0) > 0) comCD++;
                
                // Busca na Venda
                let venda = vendaIndex[`${codigo}|${empresa}`] || {};
                if (Object.keys(venda).length === 0) {
                    venda = vendaIndex[`${codigo}|`] || {};
                }
                if (parseFloat(venda['Venda Valor'] || venda['VendaValor'] || 0) > 0) comVenda++;
                
                // ===== CUSTO =====
                const custo = parseFloat(item['Custo Liq. Unitário'] || 
                                        item['CustoLiqUnitario'] || 
                                        item['Custo Líquido'] ||
                                        item['CustoLiquido'] ||
                                        item['Custo Unitário'] ||
                                        item['CustoUnitario'] ||
                                        item['Valor Custo'] ||
                                        item['ValorCusto'] ||
                                        0);
                if (custo > 0) comCusto++;
                
                const produto = item['Produto'] || item['PRODUTO'] || item['Descrição'] || item['DESCRICAO'] || '';
                
                resultado.push({
                    // ===== BS CAD =====
                    'COMPRADOR': cadastro['COMPRADOR'] || '',
                    'CATEGORIA': cadastro['CATEGORIA'] || '',
                    'GRUPO': cadastro['GRUPO'] || '',
                    'SUBGRUPO1': cadastro['SUBGRUPO1'] || '',
                    'SUBGRUPO2': cadastro['SUBGRUPO2'] || '',
                    'SUBGRUPO3': cadastro['SUBGRUPO3'] || '',
                    'SUBGRUPO4': cadastro['SUBGRUPO4'] || '',
                    'FORNECEDOR': cadastro['FORNECEDOR'] || '',
                    
                    // ===== ESTOQUE LOJA =====
                    'Empresa': empresa,
                    'Produto': produto,
                    'Código Produto': codigo,
                    'Quantidade Disponível (Loja)': parseFloat(item['Quantidade Disponível'] || item['QuantidadeDisponivel'] || item['QTD'] || 0),
                    'Valor Preço de Venda (Loja)': parseFloat(item['Valor Preço de Venda'] || item['ValorPrecoVenda'] || 0),
                    'Preço Vda Unitário': parseFloat(item['Preço Vda Unitário'] || item['PrecoVdaUnitario'] || item['PRECO'] || 0),
                    'Lucrat. Marg % (Loja)': parseFloat(item['Lucrat. Marg %'] || item['LucratMarg'] || 0),
                    'Dias de Estoque (Loja)': parseFloat(item['Dias de Estoque'] || item['DiasEstoque'] || 0),
                    'STATUS ESTOQUE': item['STATUS ESTOQUE'] || item['STATUSESTOQUE'] || '',
                    'STTS PREÇO': item['STTS PREÇO'] || item['STTSPRECO'] || '',
                    
                    // ===== CUSTO =====
                    'Custo Liq. Unitário': custo,  // <-- ADICIONADO PARA MÉDIA DE CUSTO
                    
                    // ===== ESTOQUE CD =====
                    'Quantidade Disponível (CD)': parseFloat(cd['Quantidade Disponível'] || cd['QuantidadeDisponivel'] || cd['QTD'] || 0),
                    'Quantidade em Estoque (CD)': parseFloat(cd['Quantidade em Estoque'] || cd['QuantidadeEmEstoque'] || 0),
                    'Dias de Estoque (CD)': parseFloat(cd['Dias de Estoque'] || cd['DiasEstoque'] || 0),
                    
                    // ===== VENDA LOJA =====
                    'Venda Quantidade': parseFloat(venda['Venda Quantidade'] || venda['VendaQuantidade'] || 0),
                    'Venda Valor': parseFloat(venda['Venda Valor'] || venda['VendaValor'] || venda['Valor'] || 0),
                    'Unitário Médio': parseFloat(venda['Unitário Médio'] || venda['UnitarioMedio'] || 0)
                });
            }
            
            console.log(`✅ ${resultado.length} registros processados`);
            console.log(`  Com Empresa: ${comEmpresa} registros`);
            console.log(`  Com Custo: ${comCusto} registros`);
            console.log(`  Com Venda: ${comVenda} registros`);
            console.log(`  Com CD: ${comCD} registros`);
            
            if (resultado.length > 0) {
                const ex = resultado[0];
                console.log('📝 Exemplo do primeiro registro:');
                console.log('  Empresa:', ex['Empresa'] || '(vazio)');
                console.log('  Produto:', ex['Produto']);
                console.log('  Qtd Loja:', ex['Quantidade Disponível (Loja)']);
                console.log('  Qtd CD:', ex['Quantidade Disponível (CD)']);
                console.log('  Venda R$:', ex['Venda Valor']);
                console.log('  Custo:', ex['Custo Liq. Unitário']);
            }
            
            return resultado;
            
        } catch (error) {
            console.error('❌ Erro no processamento:', error);
            throw error;
        }
    },
    
    fallback(bsCad) {
        console.log('📊 Gerando dados de fallback...');
        const resultado = [];
        const limite = Math.min(bsCad.length, 200);
        
        for (let i = 0; i < limite; i++) {
            const item = bsCad[i];
            const preco = (Math.random() * 50 + 5);
            const qtdLoja = Math.floor(Math.random() * 100) - 5;
            const qtdCD = Math.floor(Math.random() * 200);
            const vendaQtd = Math.floor(Math.random() * 30);
            
            resultado.push({
                'Empresa': item['DIVISAO'] === 'VAREJO' ? 'R001-EMP.CALHAU' : 'C001-CD BR',
                'Produto': item['DESCCOMPLETA'] || `Produto ${i+1}`,
                'Código Produto': item['SEQPRODUTO'] || `PROD${String(i+1).padStart(5,'0')}`,
                'COMPRADOR': item['COMPRADOR'] || '',
                'CATEGORIA': item['CATEGORIA'] || '',
                'GRUPO': item['GRUPO'] || '',
                'FORNECEDOR': item['FORNECEDOR'] || '',
                'Quantidade Disponível (Loja)': qtdLoja,
                'Quantidade Disponível (CD)': qtdCD,
                'Preço Vda Unitário': preco,
                'Valor Preço de Venda (Loja)': qtdLoja * preco,
                'Venda Quantidade': vendaQtd,
                'Venda Valor': vendaQtd * preco,
                'Lucrat. Marg % (Loja)': (Math.random() * 40 + 10),
                'Dias de Estoque (Loja)': Math.floor(Math.random() * 30) + 1,
                'STATUS ESTOQUE': ['EM ESTOQUE','ESTOQUE BAIXO','SEM ESTOQUE'][Math.floor(Math.random()*3)],
                'STTS PREÇO': ['PRECO COMPETITIVO','PRECO ALTO','PRECO BAIXO'][Math.floor(Math.random()*3)],
                'Custo Liq. Unitário': preco * 0.6  // <-- Custo fictício para fallback
            });
        }
        
        return resultado;
    }
};

window.DataProcessor = DataProcessor;