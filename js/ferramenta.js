// Ferramentas de medição de desempenho. Para compilações de produção, este arquivo não está incluído e todos
// usos das funções `PERF_*` são removidos do código do aplicativo.
// Ativar/Desativar o monitoramento de desempenho
const showPerfMonitor = false;

// Configuração 
const perfUpdateRate = 300; // ms

// Estado 
let perfLastUpdateTime = performance.now();
const perfStartTimes = {};
const perfTimings = {};

// INÍCIO E FIM do tempo de medição
const PERF_START = name => {
	if (!showPerfMonitor) return;
	perfStartTimes[name] = performance.now();
};

const PERF_END = name => {
	if (!showPerfMonitor) return;
	const start = perfStartTimes[name];
	invariant(start, `PERF_END called with "${name}" before matching PERF_START.`);
	const timings = perfTimings[name] || [];
	timings.push(performance.now() - start);
	perfTimings[name] = timings;
};

// Atualiza a tela se necessário
const PERF_UPDATE = () => {
	if (!showPerfMonitor) return;
	const now = performance.now();
	const elapsed = now - perfLastUpdateTime;
	if (elapsed > perfUpdateRate) {
		let html = '';
		// Tempos médios registrados, exibi-los e redefinir tudo
		const add = (a, b) => a + b;
		Object.keys(perfTimings).forEach((name, i) => {
			const timings = perfTimings[name];
			const avgTime = timings.reduce(add) / timings.length;
			timings.length = 0;
			if (i > 0) html += '<br>';
			html += `${name}: ${avgTime.toFixed(2)}ms`;
		});

		perfNode.innerHTML = html;
		perfLastUpdateTime = performance.now();
	}
}

const perfNode = document.createElement('div');
if (showPerfMonitor) {
	perfNode.style.position = 'fixed';
	perfNode.style.left = '0px';
	perfNode.style.bottom = '0px';
	perfNode.style.padding = '8px 16px';
	perfNode.style.fontSize = '10px';
	perfNode.style.fontFamily = 'monospace';
	perfNode.style.lineHeight = 1.3;
	perfNode.style.backgroundColor = '#000';
	perfNode.style.color = '#FFF';
	perfNode.style.opacity = 0.6;
	perfNode.style.pointerEvents = 'none';
	perfNode.style.userSelect = 'none';
	document.body.appendChild(perfNode);
}
