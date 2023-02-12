/*
Executor de teste super simples. Expõe as seguintes funções globais:
- `teste`
- `isso`
- `descreva`

O uso é padrão. As chamadas `describe()` podem ser aninhadas.
Todas as funções permitem encadear `.only` para que apenas esse teste (ou grupo) seja executado.
Os pares vão com a biblioteca "esperar" de Michael Jackson.
*/

((global) => {
	
	// Internos privados 
// --------------------------------

 // Permite facilmente recolher/expandir toda a árvore de testes.
	const expandAll = true;

	// Tipos
	const TestType = Symbol('Test');
	const GroupType = Symbol('Group');

	// Fila de teste. Pode incluir grupos de testes aninhados recursivamente.
	let testQueue = [];

	// Substitua para variantes `.only`.
	let testOverride = null;

	// Acompanha o número de execuções de teste.
	let runTestCount = 0;

	// Executar testes e registrar a saída. Também lida com grupos.
	function runTest(test) {
		switch (test.type) {
			// Teste único. Podemos apenas executá-lo.
			case TestType:
				runTestCount++;
				try {
					test.testFn();
					console.log(
						`%cPASS%c ${test.name}`,
						'color: #fff; background-color: #01a54f; padding: 1px 6px; border-radius: 2px',
						'color: #01a54f;'
					);
				}
				catch(e) {
					console.log(
						`%cFAIL%c ${test.name}`,
						'color: #fff; background-color: #e50000; padding: 1px 6px; border-radius: 2px',
						'color: #e50000;'
					);
					console.error(e);
				}
				break;

			// Grupo de testes. Execute subtestes recursivamente com saída agrupada.
			case GroupType:
				expandAll ? console.group(test.name) : console.groupCollapsed(test.name);
				test.tests.forEach(runTest);
				console.groupEnd();
				break;

			default:
				throw new Error('Invalid object type');
		}

	}

	//Executa todos os testes.
// --------------------------------

// Permitir que os testes sejam enfileirados de forma síncrona. Todos eles serão executados no próximo tick do loop de eventos.
	setTimeout(() => {
		runTestCount = 0;
		let startTime = performance.now();
		if (testOverride) {
			console.log(
				'%cTest Runner: Hiding all but one test result.',
				'color: #700; background-color: #fdd; padding: 2px 10px; border-radius: 20px;'
			);
			runTest(testOverride);
		} else {
			testQueue.forEach(runTest);
		}
		const runTime = performance.now() - startTime;
		console.log(`Test Runner: Ran ${runTestCount} ${runTestCount === 1 ? 'test' : 'tests'} in ${runTime.toFixed(2)} ms.`);
	});


	// Api publica 
	// --------------------------------
	function describe(name, queueTests) {
		const oldQueue = testQueue;
		testQueue = [];
		queueTests();
		oldQueue.push({ type: GroupType, name: name, tests: testQueue });
		testQueue = oldQueue;
	}

	describe.only = function describeOnly(name, queueTests) {
		const oldQueue = testQueue;
		testQueue = [];
		queueTests();
		testOverride = { type: GroupType, name: name, tests: testQueue };
		testQueue = oldQueue;
	};

	function test(name, testFn) {
		testQueue.push({ type: TestType, name, testFn });
	}

	test.only = function testOnly(name, testFn) {
		testOverride = { type: TestType, name, testFn };
	}

	// expõe as apis globais
	global.describe = describe;
	global.test = test;
	global.it = test;

})(window);




// Testa o executor de teste.
// Tente encadear `.only` a qualquer um dos testes abaixo.
// --------------------------------

/*
it('it() é um alias de test()', () => {});
test('Os testes podem ser isolados',) => {});
describe('Ou agrupados.', () => {
	test('Test A', () => {});
	test('Test B', () => {});
});
test('Falha no tests...', () => {
	throw new Error('BUG')
});
test('...não bloqueia outros testes.', () => {});
describe('Grupos', () => {
	describe('pode ser', () => {
		describe('profundamente', () => {
			describe('aninhada.', () => {
				test('Test A', () => {});
				test('Test B', () => {});
			});
		});
	});
});
*/
