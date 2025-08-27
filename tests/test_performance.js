// Script de teste de performance para as otimizações de streaming

const LONG_TEXT = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. `.repeat(10);

class PerformanceTest {
    constructor() {
        this.metrics = {
            charactersProcessed: 0,
            rerenders: 0,
            timeElapsed: 0,
            chunksCreated: 0
        };
    }

    // Testa o streaming caractere por caractere (método antigo)
    async testCharacterStreaming() {
        console.log('🔴 Testando streaming CARACTERE por CARACTERE (antigo)...');
        const startTime = Date.now();
        let rerenders = 0;
        
        for (let i = 0; i < LONG_TEXT.length; i++) {
            // Simula updateDisplay()
            rerenders++;
            // Simula delay de 20-30ms
            await new Promise(resolve => setTimeout(resolve, 25));
        }
        
        const timeElapsed = Date.now() - startTime;
        console.log(`  Caracteres: ${LONG_TEXT.length}`);
        console.log(`  Re-renders: ${rerenders}`);
        console.log(`  Tempo total: ${timeElapsed}ms (${(timeElapsed/1000).toFixed(1)}s)`);
        console.log(`  Performance: ${(LONG_TEXT.length / (timeElapsed/1000)).toFixed(0)} chars/s\n`);
        
        return { charactersProcessed: LONG_TEXT.length, rerenders, timeElapsed };
    }

    // Testa o streaming por chunks (método novo)
    async testChunkStreaming() {
        console.log('🟢 Testando streaming por CHUNKS (novo)...');
        const startTime = Date.now();
        let rerenders = 0;
        
        // Cria chunks inteligentes
        const chunks = this.createSmartChunks(LONG_TEXT, 50);
        console.log(`  Chunks criados: ${chunks.length}`);
        
        for (const chunk of chunks) {
            // Simula updateDisplay()
            rerenders++;
            // Simula delay de 10ms entre chunks
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        const timeElapsed = Date.now() - startTime;
        console.log(`  Caracteres: ${LONG_TEXT.length}`);
        console.log(`  Re-renders: ${rerenders}`);
        console.log(`  Tempo total: ${timeElapsed}ms (${(timeElapsed/1000).toFixed(1)}s)`);
        console.log(`  Performance: ${(LONG_TEXT.length / (timeElapsed/1000)).toFixed(0)} chars/s\n`);
        
        return { 
            charactersProcessed: LONG_TEXT.length, 
            rerenders, 
            timeElapsed,
            chunksCreated: chunks.length
        };
    }

    // Implementação do algoritmo de chunks inteligentes
    createSmartChunks(text, targetSize) {
        const chunks = [];
        let currentChunk = '';
        let i = 0;
        
        while (i < text.length) {
            currentChunk += text[i];
            
            if (currentChunk.length >= targetSize) {
                // Procura o próximo espaço para não cortar palavras
                while (i + 1 < text.length && text[i + 1] !== ' ' && text[i + 1] !== '\n') {
                    i++;
                    currentChunk += text[i];
                }
                
                chunks.push(currentChunk);
                currentChunk = '';
            }
            
            i++;
        }
        
        if (currentChunk) {
            chunks.push(currentChunk);
        }
        
        return chunks;
    }

    // Compara os resultados
    compareResults(oldMethod, newMethod) {
        console.log('📊 COMPARAÇÃO DE RESULTADOS');
        console.log('═══════════════════════════════════════════');
        
        const speedup = oldMethod.timeElapsed / newMethod.timeElapsed;
        const rerendersReduction = ((oldMethod.rerenders - newMethod.rerenders) / oldMethod.rerenders * 100);
        
        console.log(`⚡ Speedup: ${speedup.toFixed(1)}x mais rápido`);
        console.log(`📉 Redução de re-renders: ${rerendersReduction.toFixed(0)}%`);
        console.log(`   (${oldMethod.rerenders} → ${newMethod.rerenders})`);
        console.log(`⏱️  Tempo economizado: ${((oldMethod.timeElapsed - newMethod.timeElapsed)/1000).toFixed(1)}s`);
        console.log(`📦 Chunks criados: ${newMethod.chunksCreated}`);
        
        console.log('\n✅ MELHORIA DE PERFORMANCE:');
        if (speedup >= 5) {
            console.log('   🚀 EXCELENTE! Performance drasticamente melhorada.');
        } else if (speedup >= 3) {
            console.log('   ✨ MUITO BOM! Performance significativamente melhorada.');
        } else if (speedup >= 1.5) {
            console.log('   👍 BOM! Performance melhorada.');
        } else {
            console.log('   ⚠️  Melhoria modesta, considere otimizações adicionais.');
        }
    }

    // Executa todos os testes
    async runAllTests() {
        console.log('╔═══════════════════════════════════════════╗');
        console.log('║   TESTE DE PERFORMANCE - STREAMING        ║');
        console.log('╚═══════════════════════════════════════════╝\n');
        
        console.log(`Texto de teste: ${LONG_TEXT.length} caracteres\n`);
        
        const oldResult = await this.testCharacterStreaming();
        const newResult = await this.testChunkStreaming();
        
        this.compareResults(oldResult, newResult);
        
        console.log('\n═══════════════════════════════════════════');
        console.log('Teste concluído!');
    }
}

// Executa os testes
if (typeof window === 'undefined') {
    // Node.js environment
    const test = new PerformanceTest();
    test.runAllTests().catch(console.error);
} else {
    // Browser environment
    window.PerformanceTest = PerformanceTest;
    console.log('PerformanceTest carregado. Execute: new PerformanceTest().runAllTests()');
}