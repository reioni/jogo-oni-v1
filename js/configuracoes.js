// Este arquivo é executado primeiro e fornece variáveis ​​globais usadas por todo o programa.
// A maior parte disso deve ser configuração.

// Multiplicador de tempo para todo o mecanismo de jogo.
let gameSpeed = 1;

// cores
const BLACK = { r: 0xfe, g: 0x95, b: 0x22 };
const BLUE =   { r: 0x67, g: 0xd7, b: 0xf0 };
const GREEN =  { r: 0xa6, g: 0xe0, b: 0x2c };
const PINK =   { r: 0xfa, g: 0x24, b: 0x73 };
const ORANGE = { r: 0xfe, g: 0x95, b: 0x22 };
const YELLOW = { r: 0xfa, g: 0x96, b: 0x22 };
const allColors = [BLACK, BLUE, GREEN, PINK, ORANGE, YELLOW];

// Jogabilidade
const getSpawnDelay = () => {
	const spawnDelayMax = 1400;
	const spawnDelayMin = 550;
	const spawnDelay = spawnDelayMax - state.game.cubeCount * 3.1;
	return Math.max(spawnDelay, spawnDelayMin);
}
const doubleStrongEnableScore = 2000;
// Número de cubos que devem ser esmagados antes de ativar um recurso.
const slowmoThreshold = 10;
const strongThreshold = 25;
const spinnerThreshold = 25;

// Estado de interação
let pointerIsDown = false;
// A última posição conhecida do ponteiro primário nas coordenadas da tela.`
let pointerScreen = { x: 0, y: 0 };
// Igual a `pointerScreen`, mas convertido em coordenadas de cena em rAF.
let pointerScene = { x: 0, y: 0 };
// Velocidade mínima do ponteiro antes que os "acertos" sejam contados.
const minPointerSpeed = 60;
// A velocidade de acerto afeta a direção do alvo após o acerto. Esse número amortece essa força.
const hitDampening = 0.1;
// Backboard recebe sombras e é a posição Z negativa mais distante das entidades.
const backboardZ = -400;
const shadowColor = '#262e36';
// Quanta resistência do ar é aplicada a objetos padrão
const airDrag = 0.022;
const gravity = 0.3;
//Configuração do Spark
const sparkColor = 'rgba(170,221,255,.9)';
const sparkThickness = 2.2;
const airDragSpark = 0.1;
// Acompanha as posições do ponteiro para mostrar a trilha
const touchTrailColor = 'rgba(170,221,255,.62)';
const touchTrailThickness = 7;
const touchPointLife = 120;
const touchPoints = [];
// Tamanho dos alvos no jogo. Isso afeta o tamanho renderizado e a área de acerto.
const targetRadius = 40;
const targetHitRadius = 50;
const makeTargetGlueColor = target => {
	// const alpha = (target.health - 1) / (target.maxHealth - 1);
	// return `rgba(170,221,255,${alpha.toFixed(3)})`;
	return 'rgb(170,221,255)';
};
// Tamanho dos fragmentos de destino
const fragRadius = targetRadius / 3;



// Elemento de tela do jogo necessário em setup.js e interação.js
const canvas = document.querySelector('#c');

//configuração da câmera 3D
// Afeta a perspectiva
const cameraDistance = 900;
// Não afeta a perspectiva
const sceneScale = 1;
// Objetos que chegarem muito perto da câmera serão esmaecidos para transparentes nesta faixa.
 // const cameraFadeStartZ = 0.8*cameraDistance - 6*targetRadius;
const cameraFadeStartZ = 0.45*cameraDistance;
const cameraFadeEndZ = 0.65*cameraDistance;
const cameraFadeRange = cameraFadeEndZ - cameraFadeStartZ;

// Globais usados ​​para acumular todos os vértices/polígonos em cada frame
const allVertices = [];
const allPolys = [];
const allShadowVertices = [];
const allShadowPolys = [];
