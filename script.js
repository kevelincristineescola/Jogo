// Elementos das Telas
const sLogin = document.getElementById('screen-login');
const sTutorial = document.getElementById('screen-tutorial');
const sGame = document.getElementById('screen-game');
const sRanking = document.getElementById('screen-ranking');
const helpModal = document.getElementById('help-modal');

// Elementos de Controle/Dados
const btnStart = document.getElementById('btn-start');
const btnPlay = document.getElementById('btn-play');
const btnRestart = document.getElementById('btn-restart');
const btnCloseHelp = document.getElementById('btn-close-help');

const p1Input = document.getElementById('p1-name');
const p2Input = document.getElementById('p2-name');

// Elementos internos do Jogo
const p1Display = document.getElementById('p1-score-display');
const p2Display = document.getElementById('p2-score-display');
const levelDisplay = document.getElementById('level-display');
const objectiveAlert = document.getElementById('objective-alert');
const container = document.getElementById('game-container');
const p1Element = document.getElementById('player1');
const p2Element = document.getElementById('player2');
const starElement = document.getElementById('star');

// Estado do Jogo
let player1 = { name: '', score: 0, x: 50, y: 180 };
let player2 = { name: '', score: 0, x: 720, y: 180 };
let star = { x: 0, y: 0 };

let currentLevel = 1;
const maxLevels = 3;
let targetScoreNextLevel = 5; // Estrelas necessárias por nível
let p1RoundScore = 0;
let p2RoundScore = 0;

let gameSpeed = 5; // Aumenta conforme a fase
let keysPressed = {};
let gameLoopInterval;

// --- GERENCIAMENTO DE TELAS ---
btnStart.addEventListener('click', () => {
    if (p1Input.value.trim() === "" || p2Input.value.trim() === "") {
        alert("Por favor, preencha o nome de ambos os jogadores.");
        return;
    }
    player1.name = p1Input.value;
    player2.name = p2Input.value;
    
    sLogin.classList.add('hidden');
    sTutorial.classList.remove('hidden');
});

btnPlay.addEventListener('click', () => {
    sTutorial.classList.add('hidden');
    sGame.classList.remove('hidden');
    initGame();
});

btnRestart.addEventListener('click', () => {
    sRanking.classList.add('hidden');
    sLogin.classList.remove('hidden');
    resetFullState();
});

// --- SISTEMA DE AJUDA (F1) ---
window.addEventListener('keydown', (e) => {
    if (e.key === 'F1') {
        e.preventDefault(); // Impede que o navegador abra a ajuda padrão dele
        helpModal.classList.remove('hidden');
    }
});

btnCloseHelp.addEventListener('click', () => {
    helpModal.classList.add('hidden');
});

// --- LÓGICA DO JOGO ---
function initGame() {
    updateLabels();
    spawnStar();
    
    // Captura comandos do teclado de forma fluida
    window.addEventListener('keydown', (e) => keysPressed[e.key.toLowerCase()] = true);
    window.addEventListener('keyup', (e) => keysPressed[e.key.toLowerCase()] = false);
    
    gameLoopInterval = setInterval(gameLoop, 1000 / 60); // 60 FPS
}

function gameLoop() {
    movePlayers();
    checkCollisions();
    render();
}

function movePlayers() {
    // Player 1 (W, A, S, D)
    if (keysPressed['w'] && player1.y > 0) player1.y -= gameSpeed;
    if (keysPressed['s'] && player1.y < container.clientHeight - 30) player1.y += gameSpeed;
    if (keysPressed['a'] && player1.x > 0) player1.x -= gameSpeed;
    if (keysPressed['d'] && player1.x < container.clientWidth - 30) player1.x += gameSpeed;

    // Player 2 (Setas)
    if (keysPressed['arrowup'] && player2.y > 0) player2.y -= gameSpeed;
    if (keysPressed['arrowdown'] && player2.y < container.clientHeight - 30) player2.y += gameSpeed;
    if (keysPressed['arrowleft'] && player2.x > 0) player2.x -= gameSpeed;
    if (keysPressed['arrowright'] && player2.x < container.clientWidth - 30) player2.x += gameSpeed;
}

function spawnStar() {
    const maxX = container.clientWidth - 20;
    const maxY = container.clientHeight - 20;
    star.x = Math.floor(Math.random() * maxX);
    star.y = Math.floor(Math.random() * maxY);
}

function checkCollisions() {
    // Colisão Player 1 com a Estrela
    if (isColliding(player1, 30, star, 20)) {
        player1.score += 10;
        p1RoundScore++;
        spawnStar();
        checkLevelProgress();
    }
    // Colisão Player 2 com a Estrela
    if (isColliding(player2, 30, star, 20)) {
        player2.score += 10;
        p2RoundScore++;
        spawnStar();
        checkLevelProgress();
    }
}

function isColliding(obj1, size1, obj2, size2) {
    return (
        obj1.x < obj2.x + size2 &&
        obj1.x + size1 > obj2.x &&
        obj1.y < obj2.y + size2 &&
        obj1.y + size1 > obj2.y
    );
}

function checkLevelProgress() {
    updateLabels();
    let totalRoundPoints = p1RoundScore + p2RoundScore;

    if (totalRoundPoints >= targetScoreNextLevel) {
        if (currentLevel < maxLevels) {
            currentLevel++;
            p1RoundScore = 0;
            p2RoundScore = 0;
            gameSpeed += 3; // Aumenta a dificuldade/velocidade
            alert(`Parabéns! Passando para a Fase ${currentLevel}. Velocidade aumentada!`);
            updateLabels();
        } else {
            endGame();
        }
    }
}

function updateLabels() {
    p1Display.innerText = `${player1.name}: ${player1.score} pts`;
    p2Display.innerText = `${player2.name}: ${player2.score} pts`;
    levelDisplay.innerText = `Fase: ${currentLevel} / ${maxLevels}`;
    objectiveAlert.innerText = `Objetivo da Fase: Coletem juntos ${targetScoreNextLevel} estrelas nesta fase! (Progresso: ${p1RoundScore + p2RoundScore}/${targetScoreNextLevel})`;
}

function render() {
    p1Element.style.left = player1.x + 'px';
    p1Element.style.top = player1.y + 'px';

    p2Element.style.left = player2.x + 'px';
    p2Element.style.top = player2.y + 'px';

    starElement.style.left = star.x + 'px';
    starElement.style.top = star.y + 'px';
}

function endGame() {
    clearInterval(gameLoopInterval);
    sGame.classList.add('hidden');
    sRanking.classList.remove('hidden');

    // Determina vencedor
    let winner = "Empate!";
    if (player1.score > player2.score) winner = `Vitória de ${player1.name}!`;
    if (player2.score > player1.score) winner = `Vitória de ${player2.name}!`;
    document.getElementById('winner-text').innerText = winner;

    saveToRanking();
    displayRanking();
}

// --- SISTEMA DE LOGIN / RANKING (LOCALSTORAGE) ---
function saveToRanking() {
    let ranking = JSON.parse(localStorage.getItem('spaceArenaRanking')) || [];
    
    ranking.push({ name: player1.name, score: player1.score });
    ranking.push({ name: player2.name, score: player2.score });

    // Ordena do maior para o menor
    ranking.sort((a, b) => b.score - a.score);
    // Mantém apenas o top 5
    ranking = ranking.slice(0, 5);

    localStorage.setItem('spaceArenaRanking', JSON.stringify(ranking));
}

function displayRanking() {
    const rankingBody = document.getElementById('ranking-body');
    rankingBody.innerHTML = '';
    let ranking = JSON.parse(localStorage.getItem('spaceArenaRanking')) || [];

    ranking.forEach((player, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}º</td>
            <td>${player.name}</td>
            <td>${player.score} pts</td>
        `;
        rankingBody.appendChild(row);
    });
}

function resetFullState() {
    player1 = { name: '', score: 0, x: 50, y: 180 };
    player2 = { name: '', score: 0, x: 720, y: 180 };
    currentLevel = 1;
    p1RoundScore = 0;
    p2RoundScore = 0;
    gameSpeed = 5;
    keysPressed = {};
    p1Input.value = '';
    p2Input.value = '';
}