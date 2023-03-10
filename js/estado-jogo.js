
// Enums 
// Modos de jogo
const GAME_MODE_RANKED = Symbol('GAME_MODE_RANKED');
const GAME_MODE_CASUAL = Symbol('GAME_MODE_CASUAL');

// Avaliação do menu 
const MENU_MAIN = Symbol('MENU_MAIN');
const MENU_PAUSE = Symbol('MENU_PAUSE');
const MENU_SCORE = Symbol('MENU_SCORE');




// Estado Geral 

const state = {
	game: {
		mode: GAME_MODE_RANKED,
		// Tempo de execução do jogo atual.
		time: 0,
		// Pontuação do jogador 
		score: 0,
		// Número total de cubos esmagados no jogo.
		cubeCount: 0
	},
	menus: {
		// Defina como `null` para ocultar todos os menus
		active: MENU_MAIN
	}
};


// Seletores de estado global 

const isInGame = () => !state.menus.active;
const isMenuVisible = () => !!state.menus.active;
const isCasualGame = () => state.game.mode === GAME_MODE_CASUAL;
const isPaused = () => state.menus.active === MENU_PAUSE;


// Local de armazenamento 

const highScoreKey = '__menja__highScore';
const getHighScore = () => {
	const raw = localStorage.getItem(highScoreKey);
	return raw ? parseInt(raw, 10) : 0;
};

let _lastHighscore = getHighScore();
const setHighScore = score => {
	_lastHighscore = getHighScore();
	localStorage.setItem(highScoreKey, String(score));
};

const isNewHighScore = () => state.game.score > _lastHighscore;
