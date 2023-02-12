const sparks = [];
const sparkPool = [];


function addSpark(x, y, xD, yD) {
	const spark = sparkPool.pop() || {};

	spark.x = x + xD * 0.5;
	spark.y = y + yD * 0.5;
	spark.xD = xD;
	spark.yD = yD;
	spark.life = random(200, 300);
	spark.maxLife = spark.life;

	sparks.push(spark);

	return spark;
}


// Explosão de faísca esférica
function sparkBurst(x, y, count, maxSpeed) {
	const angleInc = TAU / count;
	for (let i=0; i<count; i++) {
		const angle = i * angleInc + angleInc * Math.random();
		const speed = (8 - Math.random() ** 6) * maxSpeed;
		addSpark(
			x,
			y,
			Math.sin(angle) * speed,
			Math.cos(angle) * speed
		);
	}
}


// Faz um alvo "vazar" faíscas de todos os vértices.
// Isso é usado para criar o efeito de "derramamento" da cola alvo.
let glueShedVertices;
function glueShedSparks(target) {
	if (!glueShedVertices) {
		glueShedVertices = cloneVertices(target.vertices);
	} else {
		copyVerticesTo(target.vertices, glueShedVertices);
	}

	glueShedVertices.forEach(v => {
		if (Math.random() < 0.4) {
			projectVertex(v);
			addSpark(
				v.x,
				v.y,
				random(-13, 13),
				random(-15, 15)
			);
		}
	});
}

function returnSpark(spark) {
	sparkPool.push(spark);
}
