
const invariant = (condition, message) => {
	if (!condition) throw new Error(message);
};


/////////
// DOM //
/////////

const $ = selector => document.querySelector(selector);
const handleClick = (element, handler) => element.addEventListener('click', handler);
const handlePointerDown = (element, handler) => {
	element.addEventListener('touchstart', handler);
	element.addEventListener('mousedown', handler);
};



// Auxiliares de formatação

// Converte um número em uma string formatada com separadores de milhar.
const formatNumber = num => num.toLocaleString();




// Constantes matemáticas 

const PI = Math.PI;
const TAU = Math.PI * 2;
const ETA = Math.PI * 0.5;



//Auxiliares de matemática 

// Fixa um número entre os valores mínimo e máximo (inclusive)
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

// Interpola linearmente entre os números a e b por um valor específico.
// mistura >= 0 && mistura <= 1
const lerp = (a, b, mix) => (b - a) * mix + a;




// Auxiliares Aleatórios //

// Gera um número aleatório entre min (inclusive) e max (exclusivo)
const random = (min, max) => Math.random() * (max - min) + min;

// Gera um inteiro aleatório entre e possivelmente incluindo os valores mínimo e máximo
const randomInt = (min, max) => ((Math.random() * (max - min + 1)) | 0) + min;

// Retorna um elemento aleatório de um array
const pickOne = arr => arr[Math.random() * arr.length | 0];




// Auxiliares de cores

// Converte um objeto de cor { r, g, b } em um código hexadecimal de 6 dígitos.
const colorToHex = color => {
	return '#' +
		(color.r | 0).toString(16).padStart(2, '0') +
		(color.g | 0).toString(16).padStart(2, '0') +
		(color.b | 0).toString(16).padStart(2, '0');
};

// Opera em um objeto de cor { r, g, b }.
// Retorna o código hexadecimal da string.
// `lightness` deve variar de 0 a 1. 0 é preto puro, 1 é branco puro.
const shadeColor = (color, lightness) => {
	let other, mix;
	if (lightness < 0.5) {
		other = 0;
		mix = 1 - (lightness * 2);
	} else {
		other = 255;
		mix = lightness * 2 - 1;
	}
	return '#' +
		(lerp(color.r, other, mix) | 0).toString(16).padStart(2, '0') +
		(lerp(color.g, other, mix) | 0).toString(16).padStart(2, '0') +
		(lerp(color.b, other, mix) | 0).toString(16).padStart(2, '0');
};





// Auxiliares de cronometragem

const _allCooldowns = [];

const makeCooldown = (rechargeTime, units=1) => {
	let timeRemaining = 0;
	let lastTime = 0;

	const initialOptions = { rechargeTime, units };

	const updateTime = () => {
		const now = state.game.time;
		// Reinicia o tempo restante se o tempo retroceder.
		if (now < lastTime) {
			timeRemaining = 0;
		} else {
			// atualizando...
			timeRemaining -= now-lastTime;
			if (timeRemaining < 0) timeRemaining = 0;
		}
		lastTime = now;
	};

	const canUse = () => {
		updateTime();
		return timeRemaining <= (rechargeTime * (units-1));
	};

	const cooldown = {
		canUse,
		useIfAble() {
			const usable = canUse();
			if (usable) timeRemaining += rechargeTime;
			return usable;
		},
		mutate(options) {
			if (options.rechargeTime) {
				// Aplica o delta do tempo de recarga para que a mudança entre em vigor imediatamente.
				timeRemaining -= rechargeTime-options.rechargeTime;
				if (timeRemaining < 0) timeRemaining = 0;
				rechargeTime = options.rechargeTime;
			}
			if (options.units) units = options.units;
		},
		reset() {
			timeRemaining = 0;
			lastTime = 0;
			this.mutate(initialOptions);
		}
	};

	_allCooldowns.push(cooldown);

	return cooldown;
};

const resetAllCooldowns = () => _allCooldowns.forEach(cooldown => cooldown.reset());

const makeSpawner = ({ chance, cooldownPerSpawn, maxSpawns }) => {
	const cooldown = makeCooldown(cooldownPerSpawn, maxSpawns);
	return {
		shouldSpawn() {
			return Math.random() <= chance && cooldown.useIfAble();
		},
		mutate(options) {
			if (options.chance) chance = options.chance;
			cooldown.mutate({
				rechargeTime: options.cooldownPerSpawn,
				units: options.maxSpawns
			});
		}
	};
};




// Auxiliares de vetor

const normalize = v => {
	const mag = Math.hypot(v.x, v.y, v.z);
	return {
		x: v.x / mag,
		y: v.y / mag,
		z: v.z / mag
	};
}

// Curry ajudantes de matemática
const add = a => b => a + b;
// Ajudantes de vetor de curry
const scaleVector = scale => vector => {
	vector.x *= scale;
	vector.y *= scale;
	vector.z *= scale;
};









// 3D Ajudantes

// Clona array e todos os vértices.
function cloneVertices(vertices) {
	return vertices.map(v => ({ x: v.x, y: v.y, z: v.z }));
}

// Copia dados de vértices de um array para outro.
// Arrays devem ter o mesmo comprimento.
function copyVerticesTo(arr1, arr2) {
	const len = arr1.length;
	for (let i=0; i<len; i++) {
		const v1 = arr1[i];
		const v2 = arr2[i];
		v2.x = v1.x;
		v2.y = v1.y;
		v2.z = v1.z;
	}
}

// Calcula o ponto médio do triângulo.
// Muda a propriedade `middle` de um dado `poly`.
function computeTriMiddle(poly) {
	const v = poly.vertices;
	poly.middle.x = (v[0].x + v[1].x + v[2].x) / 3;
	poly.middle.y = (v[0].y + v[1].y + v[2].y) / 3;
	poly.middle.z = (v[0].z + v[1].z + v[2].z) / 3;
}

// Calcula o ponto médio quad.
// Muda a propriedade `middle` de um dado `poly`.
function computeQuadMiddle(poly) {
	const v = poly.vertices;
	poly.middle.x = (v[0].x + v[1].x + v[2].x + v[3].x) / 4;
	poly.middle.y = (v[0].y + v[1].y + v[2].y + v[3].y) / 4;
	poly.middle.z = (v[0].z + v[1].z + v[2].z + v[3].z) / 4;
}

function computePolyMiddle(poly) {
	if (poly.vertices.length === 3) {
		computeTriMiddle(poly);
	} else {
		computeQuadMiddle(poly);
	}
}

// Calcula a distância de qualquer ponto médio do polígono (tri ou quad) até a câmera.
// Define a propriedade `depth` de um `poly` fornecido.
// Também aciona o cálculo do ponto médio, que altera a propriedade `middle` de `poly`.
function computePolyDepth(poly) {
	computePolyMiddle(poly);
	const dX = poly.middle.x;
	const dY = poly.middle.y;
	const dZ = poly.middle.z - cameraDistance;
	poly.depth = Math.hypot(dX, dY, dZ);
}

// Calcula normal de qualquer polígono. Usa o produto vetorial normalizado.
// Muda a propriedade `normalName` do `poly` fornecido.
function computePolyNormal(poly, normalName) {
	// Armazena referências rápidas em vértices
	const v1 = poly.vertices[0];
	const v2 = poly.vertices[1];
	const v3 = poly.vertices[2];
	// Calcula a diferença de vértices, seguindo a ordem de enrolamento.
	const ax = v1.x - v2.x;
	const ay = v1.y - v2.y;
	const az = v1.z - v2.z;
	const bx = v1.x - v3.x;
	const by = v1.y - v3.y;
	const bz = v1.z - v3.z;
	// Produto cruzado
	const nx = ay*bz - az*by;
	const ny = az*bx - ax*bz;
	const nz = ax*by - ay*bx;
	// Calcula a magnitude de normal e normaliza
	const mag = Math.hypot(nx, ny, nz);
	const polyNormal = poly[normalName];
	polyNormal.x = nx / mag;
	polyNormal.y = ny / mag;
	polyNormal.z = nz / mag;
}

// Aplica translação/rotação/escala a todos os vértices dados.
// Se `vertices` e `target` forem o mesmo array, os vértices serão modificados no lugar.
// Se `vertices` e `target` forem arrays diferentes, `vertices` não serão tocados, em vez disso o
// valores transformados de `vertices` serão escritos no array `target`.
function transformVertices(vertices, target, tX, tY, tZ, rX, rY, rZ, sX, sY, sZ) {
	// As constantes de multiplicação de matrizes só precisam ser calculadas uma vez para todos os vértices.
	const sinX = Math.sin(rX);
	const cosX = Math.cos(rX);
	const sinY = Math.sin(rY);
	const cosY = Math.cos(rY);
	const sinZ = Math.sin(rZ);
	const cosZ = Math.cos(rZ);

	// Usando forEach() como map(), mas com um array de destino (reciclado).
	vertices.forEach((v, i) => {
		const targetVertex = target[i];
		// X rotação do eixo
		const x1 = v.x;
		const y1 = v.z*sinX + v.y*cosX;
		const z1 = v.z*cosX - v.y*sinX;
		// Y rotação do eixo
		const x2 = x1*cosY - z1*sinY;
		const y2 = y1;
		const z2 = x1*sinY + z1*cosY;
		// Z rotação do eixo
		const x3 = x2*cosZ - y2*sinZ;
		const y3 = x2*sinZ + y2*cosZ;
		const z3 = z2;

		// Dimensionar, traduzir e definir a transformação.
		targetVertex.x = x3 * sX + tX;
		targetVertex.y = y3 * sY + tY;
		targetVertex.z = z3 * sZ + tZ;
	});
}

// Projeção 3D em um único vértice.
// Muda diretamente o vértice.
const projectVertex = v => {
	const focalLength = cameraDistance * sceneScale;
	const depth = focalLength / (cameraDistance - v.z);
	v.x = v.x * depth;
	v.y = v.y * depth;
};

// Projeção 3D em um único vértice.
// Muda um vértice de destino secundário.
const projectVertexTo = (v, target) => {
	const focalLength = cameraDistance * sceneScale;
	const depth = focalLength / (cameraDistance - v.z);
	target.x = v.x * depth;
	target.y = v.y * depth;
};
