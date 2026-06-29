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
                console.log('  Chaves:', Object.keys(primeiro).slice(0, 15));
                console.log('  Empresa:', primeiro['Empresa'] || primeiro['EMPRESA'] || '(não encontrado)');
                console.log('  Código Produto:', primeiro['Código Produto'] || primeiro['CODIGO PRODUTO'] || '(não encontrado)');
            }
            
            // ========================================
            // CRIA ÍNDICES PARA JOIN
            // ========================================
            console.log('🔨 Criando índices para busca...');
            
            // Índice BS CAD por SEQPRODUTO + DIVISAO
            const bsCadIndex = {};
            bsCad.forEach(item => {
                const chave = `${item['SEQPRODUTO']}|${item['DIVISAO']}`;
                bsCadIndex[chave] = item;
            });
            
            // Índice CD por Código Produto + Empresa
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
            
            // Índice de VENDA por Código Produto + Empresa
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
            console.log('  BS CAD:', Object.keys(bsCadIndex).length);
            console.log('  ESTQ CD:', Object.keys(cdIndex).length);
            console.log('  VD LJ:', Object.keys(vendaIndex).length);
            
            // Mostra as empresas encontradas na VD LJ
            const empresasVD = [...new Set(vendaLoja.map(i => i['Empresa'] || i['EMPRESA'] || '').filter(Boolean))];
            console.log('  Empresas na VD LJ:', empresasVD.slice(0, 10));
            
            // ========================================
            // PROCESSA OS DADOS
            // ========================================
            console.log(`📊 Processando ${estoqueLoja.length} registros...`);
            
            const resultado = [];
            let comEmpresa = 0;
            let comVenda = 0;
            let comCD = 0;
            let comCusto = 0;
            let matchVenda = 0;
            
            for (let i = 0; i < estoqueLoja.length; i++) {
                const item = estoqueLoja[i];
                
                // ===== CAMPO EMPRESA =====
                let empresa = item['Empresa'] || item['EMPRESA'] || '';
                
                // Se não encontrou empresa, tenta inferir
                if (!empresa) {
                    const divisao = item['DIVISAO'] || '';
                    if (divisao === 'VAREJO') {
                        empresa = 'R001-EMP.CALHAU';
                    } else if (divisao === 'DISTRIBUICAO') {
                        empresa = 'C001-CD BR';
                    }
                }
                if (empresa) comEmpresa++;
                
                // ===== CÓDIGO DO PRODUTO =====
                const codigo = item['Código Produto'] || item['CODIGO PRODUTO'] || item['SEQPRODUTO'] || '';
                
                // ===== OBTÉM A DIVISÃO USANDO A FUNÇÃO GLOBAL =====
                const divisao = window.getDivisao ? window.getDivisao(empresa) : 'VAREJO';
                
                // ===== BUSCA NA BS CAD =====
                const chaveCadastro = `${codigo}|${divisao}`;
                const cadastro = bsCadIndex[chaveCadastro] || {};
                
                // ===== BUSCA NO CD =====
                let cd = cdIndex[`${codigo}|${empresa}`] || {};
                if (Object.keys(cd).length === 0) {
                    cd = cdIndex[`${codigo}|`] || {};
                }
                if (parseFloat(cd['Quantidade Disponível'] || cd['QuantidadeDisponivel'] || 0) > 0) comCD++;
                
                // ===== BUSCA NA VENDA =====
                let venda = vendaIndex[`${codigo}|${empresa}`] || {};
                
                // Se não encontrou, tenta sem empresa
                if (Object.keys(venda).length === 0) {
                    venda = vendaIndex[`${codigo}|`] || {};
                }
                
                const vendaQtd = parseFloat(venda['Venda Quantidade'] || venda['VendaQuantidade'] || 0);
                const vendaValor = parseFloat(venda['Venda Valor'] || venda['VendaValor'] || venda['Valor'] || 0);
                
                if (vendaQtd > 0 || vendaValor > 0) {
                    comVenda++;
                    matchVenda++;
                }
                
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
                
                // ===== NOME DO PRODUTO =====
                const produto = item['Produto'] || item['PRODUTO'] || item['Descrição'] || item['DESCRICAO'] || '';
                
                // ========================================
                // MONTA O REGISTRO COMPLETO
                // ========================================
                resultado.push({
                    // BS CAD
                    'COMPRADOR': cadastro['COMPRADOR'] || '',
                    'CATEGORIA': cadastro['CATEGORIA'] || '',
                    'GRUPO': cadastro['GRUPO'] || '',
                    'SUBGRUPO1': cadastro['SUBGRUPO1'] || '',
                    'SUBGRUPO2': cadastro['SUBGRUPO2'] || '',
                    'SUBGRUPO3': cadastro['SUBGRUPO3'] || '',
                    'SUBGRUPO4': cadastro['SUBGRUPO4'] || '',
                    'FORNECEDOR': cadastro['FORNECEDOR'] || '',
                    
                    // ESTOQUE LOJA
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
                    
                    // CUSTO
                    'Custo Liq. Unitário': custo,
                    
                    // ESTOQUE CD
                    'Quantidade Disponível (CD)': parseFloat(cd['Quantidade Disponível'] || cd['QuantidadeDisponivel'] || cd['QTD'] || 0),
                    'Quantidade em Estoque (CD)': parseFloat(cd['Quantidade em Estoque'] || cd['QuantidadeEmEstoque'] || 0),
                    'Dias de Estoque (CD)': parseFloat(cd['Dias de Estoque'] || cd['DiasEstoque'] || 0),
                    
                    // VENDA LOJA
                    'Venda Quantidade': vendaQtd,
                    'Venda Valor': vendaValor,
                    'Unitário Médio': parseFloat(venda['Unitário Médio'] || venda['UnitarioMedio'] || 0)
                });
            }
            
            console.log(`✅ ${resultado.length} registros processados`);
            console.log(`  Com Empresa: ${comEmpresa} registros`);
            console.log(`  Com Custo: ${comCusto} registros`);
            console.log(`  Com Venda: ${comVenda} registros`);
            console.log(`  Match Venda por Empresa: ${matchVenda} registros`);
            console.log(`  Com CD: ${comCD} registros`);
            
            // Mostra exemplo
            if (resultado.length > 0) {
                const ex = resultado[0];
                console.log('📝 Exemplo do primeiro registro:');
                console.log('  Empresa:', ex['Empresa'] || '(vazio)');
                console.log('  Produto:', ex['Produto']);
                console.log('  Qtd Loja:', ex['Quantidade Disponível (Loja)']);
                console.log('  Qtd CD:', ex['Quantidade Disponível (CD)']);
                console.log('  Venda Qtd:', ex['Venda Quantidade']);
                console.log('  Venda R$:', ex['Venda Valor']);
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
            
            const empresas = ['R001-EMP.CALHAU', 'R004-EMP.COHAMA', 'R027-EMP.PNS', 'R029-EMP.PDA', 'C001-CD BR'];
            const empresa = empresas[Math.floor(Math.random() * empresas.length)];
            
            resultado.push({
                'Empresa': empresa,
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
                'Custo Liq. Unitário': preco * 0.6,
                'Unitário Médio': preco
            });
        }
        
        return resultado;
    }
};

window.DataProcessor = DataProcessor;
