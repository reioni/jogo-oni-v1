function draw(ctx, width, height, viewScale) {
	PERF_START('draw');

	const halfW = width / 2;
	const halfH = height / 2;


	// 3D Polis
	// ---------------
	ctx.lineJoin = 'bevel';

	PERF_START('drawShadows');
	ctx.fillStyle = shadowColor;
	ctx.strokeStyle = shadowColor;
	allShadowPolys.forEach(p => {
		if (p.wireframe) {
			ctx.lineWidth = 2;
			ctx.beginPath();
			const { vertices } = p;
			const vCount = vertices.length;
			const firstV = vertices[0];
			ctx.moveTo(firstV.x, firstV.y);
			for (let i=1; i<vCount; i++) {
				const v = vertices[i];
				ctx.lineTo(v.x, v.y);
			}
			ctx.closePath();
			ctx.stroke();
		} else {
			ctx.beginPath();
			const { vertices } = p;
			const vCount = vertices.length;
			const firstV = vertices[0];
			ctx.moveTo(firstV.x, firstV.y);
			for (let i=1; i<vCount; i++) {
				const v = vertices[i];
				ctx.lineTo(v.x, v.y);
			}
			ctx.closePath();
			ctx.fill();
		}
	});
	PERF_END('drawShadows');

	PERF_START('drawPolys');

	allPolys.forEach(p => {
		if (!p.wireframe && p.normalCamera.z < 0) return;

		if (p.strokeWidth !== 0) {
			ctx.lineWidth = p.normalCamera.z < 0 ? p.strokeWidth * 0.5 : p.strokeWidth;
			ctx.strokeStyle = p.normalCamera.z < 0 ? p.strokeColorDark : p.strokeColor;
		}

		const { vertices } = p;
		const lastV = vertices[vertices.length - 1];
		const fadeOut = p.middle.z > cameraFadeStartZ;

		if (!p.wireframe) {
			const normalLight = p.normalWorld.y * 0.5 + p.normalWorld.z * -0.5;
			const lightness = normalLight > 0
				? 0.1
				: ((normalLight ** 32 - normalLight) / 2) * 0.9 + 0.1;
			ctx.fillStyle = shadeColor(p.color, lightness);
		}

		// Faz desaparecer polis perto da câmera. `globalAlpha` deve ser redefinido posteriormente.
		if (fadeOut) {
			// Se o polígono ficar muito perto da câmera (fora de `cameraFadeRange`) o alfa
// pode ficar negativo, o que tem a aparência de alpha = 1. Então, vamos fixá-lo em 0.
			ctx.globalAlpha = Math.max(0, 1 - (p.middle.z - cameraFadeStartZ) / cameraFadeRange);
		}

		ctx.beginPath();
		ctx.moveTo(lastV.x, lastV.y);
		for (let v of vertices) {
			ctx.lineTo(v.x, v.y);
		}

		if (!p.wireframe) {
			ctx.fill();
		}
		if (p.strokeWidth !== 0) {
			ctx.stroke();
		}

		if (fadeOut) {
			ctx.globalAlpha = 1;
		}
	});
	PERF_END('drawPolys');


	PERF_START('draw2D');

	// 2D Faiscas
	
	ctx.strokeStyle = sparkColor;
	ctx.lineWidth = sparkThickness;
	ctx.beginPath();
	sparks.forEach(spark => {
		ctx.moveTo(spark.x, spark.y);
	 // Encolher faíscas para comprimento zero à medida que morrem.
     // Acelera o encolhimento à medida que a vida se aproxima de 0 (curva raiz).
     // Observe que as faíscas já ficam menores ao longo do tempo à medida que sua velocidade diminu
     // para baixo do amortecimento. Então isso é como uma escala dupla para baixo. Para contrariar isso
    // um pouco e manter as faíscas maiores por mais tempo, também aumentaremos a escala
    // um pouco depois de aplicar a curva raiz.
		const scale = (spark.life / spark.maxLife) ** 0.5 * 1.5;
		ctx.lineTo(spark.x - spark.xD*scale, spark.y - spark.yD*scale);

	});
	ctx.stroke();


	// Toques de toque

	ctx.strokeStyle = touchTrailColor;
	const touchPointCount = touchPoints.length;
	for (let i=1; i<touchPointCount; i++) {
		const current = touchPoints[i];
		const prev = touchPoints[i-1];
		if (current.touchBreak || prev.touchBreak) {
			continue;
		}
		const scale = current.life / touchPointLife;
		ctx.lineWidth = scale * touchTrailThickness;
		ctx.beginPath();
		ctx.moveTo(prev.x, prev.y);
		ctx.lineTo(current.x, current.y);
		ctx.stroke();
	}

	PERF_END('draw2D');

	PERF_END('draw');
	PERF_END('frame');

	// Exibir atualizações de desempenho.
	PERF_UPDATE();
}
