function setupCanvases() {
	const ctx = canvas.getContext('2d');
	// alinha devicePixelRatio
	const dpr = window.devicePixelRatio || 1;
	// A visualização será dimensionada para que os objetos apareçam com tamanhos semelhantes em todos os tamanhos de tela.
	let viewScale;
	// Dimensões (levando em conta viewScale!)
	let width, height;

	function handleResize() {
		const w = window.innerWidth;
		const h = window.innerHeight;
		viewScale = h / 1000;
		width = w / viewScale;
		height = h / viewScale;
		canvas.width = w * dpr;
		canvas.height = h * dpr;
		canvas.style.width = w + 'px';
		canvas.style.height = h + 'px';
	}

	// Define o tamanho inicial
	handleResize();
	// redimensiona a tela cheia
	window.addEventListener('resize', handleResize);


	// Executar loop de jogo
	let lastTimestamp = 0;
	function frameHandler(timestamp) {
		let frameTime = timestamp - lastTimestamp;
		lastTimestamp = timestamp;

		// sempre enfileira outro frame
		raf();

		// Se o jogo estiver pausado, ainda rastrearemos frameTime (acima), mas todos os outros
// lógica e desenho do jogo podem ser evitados.
		if (isPaused()) return;

		// certifique-se de que o tempo negativo não seja reportado (o primeiro frame pode ser maluco)
		if (frameTime < 0) {
			frameTime = 17;
		}
		// - limita a taxa de quadros mínima para 15fps[~68ms] (assumindo 60fps[~17ms] como 'normal')
		else if (frameTime > 68) {
			frameTime = 68;
		}

		const halfW = width / 2;
		const halfH = height / 2;

		// Converte a posição do ponteiro da tela para as coordenadas da cena.
		pointerScene.x = pointerScreen.x / viewScale - halfW;
		pointerScene.y = pointerScreen.y / viewScale - halfH;

		const lag = frameTime / 16.6667;
		const simTime = gameSpeed * frameTime;
		const simSpeed = gameSpeed * lag;
		tick(width, height, simTime, simSpeed, lag);

		// limpa tela automaticamente
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		// Desenho em escala automática para telas de alta resolução e incorpora `viewScale`.
// Também muda a tela para que (0, 0) fique no meio da tela.
// Isso só funciona com projeção em perspectiva 3D.
		const drawScale = dpr * viewScale;
		ctx.scale(drawScale, drawScale);
		ctx.translate(halfW, halfH);
		draw(ctx, width, height, viewScale);
		ctx.setTransform(1, 0, 0, 1, 0, 0);
	}
	const raf = () => requestAnimationFrame(frameHandler);
	// iniciar loop
	raf();
}
