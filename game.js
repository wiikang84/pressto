// Pressto Game - 눌러또
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI Elements
const scoreDisplay = document.getElementById('score-display');
const tokenDisplay = document.getElementById('token-display');
const startScreen = document.getElementById('start-screen');
const gameoverScreen = document.getElementById('gameover-screen');
const finalScoreEl = document.getElementById('final-score');
const bestScoreEl = document.getElementById('best-score');
const restartBtn = document.getElementById('restart-btn');
const homeBtn = document.getElementById('home-btn');
const pauseBtn = document.getElementById('pause-btn');
const pauseScreen = document.getElementById('pause-screen');
const resumeBtn = document.getElementById('resume-btn');
const pauseHomeBtn = document.getElementById('pause-home-btn');
const reviveBtn = document.getElementById('revive-btn');
const startTokensEl = document.getElementById('start-tokens');
const gameoverTokensEl = document.getElementById('gameover-tokens');
const characterBtn = document.getElementById('character-btn');
const characterScreen = document.getElementById('character-screen');
const characterGrid = document.getElementById('character-grid');
const characterBackBtn = document.getElementById('character-back-btn');
const characterPreview = document.getElementById('character-preview');
const characterPreviewCtx = characterPreview ? characterPreview.getContext('2d') : null;

// 캐릭터 정의
const characters = {
    ppukku: {
        id: 'ppukku',
        name: '뿌꾸',
        desc: '귀여운 기본 새',
        price: 0,
        unlocked: true,
        colors: { body: '#FFD93D', bodyStroke: '#F4A900', wing: '#FF9500', beak: '#FF6B35', eye: '#000' }
    },
    ppuang: {
        id: 'ppuang',
        name: '뿌앙',
        desc: '화난 새',
        price: 0,
        unlocked: true,
        colors: { body: '#FF6B6B', bodyStroke: '#CC5555', wing: '#FF4444', beak: '#FF8800', eye: '#000' }
    },
    ppuing: {
        id: 'ppuing',
        name: '뿌잉',
        desc: '애교쟁이',
        price: 0,
        unlocked: true,
        colors: { body: '#FFB6C1', bodyStroke: '#FF69B4', wing: '#FF1493', beak: '#FF6B35', eye: '#000' }
    },
    ppuul: {
        id: 'ppuul',
        name: '뿌울',
        desc: '쿨한 새',
        price: 50,
        unlocked: false,
        colors: { body: '#4FC3F7', bodyStroke: '#0288D1', wing: '#03A9F4', beak: '#FF9800', eye: '#000' }
    },
    ppuseul: {
        id: 'ppuseul',
        name: '뿌슬',
        desc: '슬픈 새',
        price: 50,
        unlocked: false,
        colors: { body: '#B39DDB', bodyStroke: '#7E57C2', wing: '#9575CD', beak: '#FFAB91', eye: '#000' }
    },
    ppuban: {
        id: 'ppuban',
        name: '뿌반',
        desc: '신난 새',
        price: 100,
        unlocked: false,
        colors: { body: '#81C784', bodyStroke: '#4CAF50', wing: '#66BB6A', beak: '#FFCC02', eye: '#000' }
    }
};

// 현재 선택된 캐릭터
let currentCharacter = localStorage.getItem('pressto_character') || 'ppukku';
let unlockedCharacters = JSON.parse(localStorage.getItem('pressto_unlocked_chars')) || ['ppukku', 'ppuang', 'ppuing'];

// 캐릭터 잠금 해제
function unlockCharacter(charId) {
    const char = characters[charId];
    if (!char || unlockedCharacters.includes(charId)) return false;
    if (tokens < char.price) return false;

    tokens -= char.price;
    saveTokens();
    unlockedCharacters.push(charId);
    localStorage.setItem('pressto_unlocked_chars', JSON.stringify(unlockedCharacters));
    return true;
}

// 캐릭터 선택
function selectCharacter(charId) {
    if (!unlockedCharacters.includes(charId)) return false;
    currentCharacter = charId;
    localStorage.setItem('pressto_character', charId);
    updateCharacterPreview();
    return true;
}

// 캐릭터 그리기 함수 - 새 형태 (머리+몸통+꼬리)
function drawCharacter(ctx, x, y, size, charId, isPressed = false, isAngry = false) {
    const char = characters[charId] || characters.ppukku;
    const colors = char.colors;

    ctx.save();
    ctx.translate(x, y);

    // === 꼬리 (뒤에 먼저 그리기) ===
    ctx.fillStyle = colors.wing;
    ctx.beginPath();
    ctx.moveTo(-size * 0.8, -size * 0.1);
    ctx.lineTo(-size * 1.3, -size * 0.4);
    ctx.lineTo(-size * 1.4, -size * 0.1);
    ctx.lineTo(-size * 1.3, size * 0.2);
    ctx.lineTo(-size * 0.8, size * 0.1);
    ctx.closePath();
    ctx.fill();

    // === 몸통 (둥근 새 형태) ===
    ctx.fillStyle = colors.body;
    ctx.beginPath();
    // 머리 + 몸통 연결된 새 형태
    ctx.ellipse(0, 0, size * 0.9, size * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.bodyStroke;
    ctx.lineWidth = size * 0.06;
    ctx.stroke();

    // === 머리 볏/깃털 (캐릭터별 다름) ===
    ctx.fillStyle = colors.wing;
    if (charId === 'ppuang') {
        // 뿔처럼 뾰족한 깃털
        ctx.beginPath();
        ctx.moveTo(-size * 0.2, -size * 0.7);
        ctx.lineTo(size * 0.1, -size * 1.1);
        ctx.lineTo(size * 0.3, -size * 0.65);
        ctx.closePath();
        ctx.fill();
    } else if (charId === 'ppuing') {
        // 리본 모양
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.arc(-size * 0.1, -size * 0.85, size * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(size * 0.25, -size * 0.85, size * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FF1493';
        ctx.beginPath();
        ctx.arc(size * 0.08, -size * 0.8, size * 0.1, 0, Math.PI * 2);
        ctx.fill();
    } else if (charId === 'ppuban') {
        // 왕관 모양
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(-size * 0.3, -size * 0.65);
        ctx.lineTo(-size * 0.2, -size * 1.0);
        ctx.lineTo(size * 0.0, -size * 0.75);
        ctx.lineTo(size * 0.2, -size * 1.0);
        ctx.lineTo(size * 0.3, -size * 0.65);
        ctx.closePath();
        ctx.fill();
    } else {
        // 기본 깃털
        ctx.beginPath();
        ctx.ellipse(size * 0.05, -size * 0.85, size * 0.12, size * 0.25, 0.2, 0, Math.PI * 2);
        ctx.fill();
    }

    // === 날개 ===
    const wingY = isPressed ? -size * 0.3 : size * 0.1;
    const wingAngle = isPressed ? -0.5 : 0.3;
    ctx.fillStyle = colors.wing;
    ctx.beginPath();
    ctx.save();
    ctx.translate(-size * 0.5, wingY);
    ctx.rotate(wingAngle);
    ctx.ellipse(0, 0, size * 0.35, size * 0.55, 0, 0, Math.PI * 2);
    ctx.restore();
    ctx.fill();

    // === 배 (밝은색) ===
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.ellipse(size * 0.1, size * 0.15, size * 0.5, size * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // === 캐릭터별 얼굴 표정 ===
    switch(charId) {
        case 'ppuang': // 화난 새
            // 찡그린 눈썹
            ctx.strokeStyle = '#000';
            ctx.lineWidth = size * 0.1;
            ctx.beginPath();
            ctx.moveTo(size * 0.1, -size * 0.45);
            ctx.lineTo(size * 0.55, -size * 0.25);
            ctx.stroke();
            // 화난 눈
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.ellipse(size * 0.35, -size * 0.15, size * 0.28, size * 0.22, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = size * 0.04;
            ctx.stroke();
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(size * 0.4, -size * 0.1, size * 0.12, 0, Math.PI * 2);
            ctx.fill();
            // 부리
            ctx.fillStyle = colors.beak;
            ctx.beginPath();
            ctx.moveTo(size * 0.65, -size * 0.05);
            ctx.lineTo(size * 1.1, size * 0.1);
            ctx.lineTo(size * 0.65, size * 0.2);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#CC5500';
            ctx.lineWidth = size * 0.03;
            ctx.stroke();
            break;

        case 'ppuing': // 애교 새
            // 볼터치
            ctx.fillStyle = 'rgba(255, 100, 150, 0.5)';
            ctx.beginPath();
            ctx.ellipse(size * 0.15, size * 0.2, size * 0.2, size * 0.12, 0, 0, Math.PI * 2);
            ctx.fill();
            // 윙크 눈
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.ellipse(size * 0.35, -size * 0.15, size * 0.25, size * 0.2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = size * 0.03;
            ctx.stroke();
            // 하트 눈
            ctx.fillStyle = '#FF69B4';
            drawHeart(ctx, size * 0.35, -size * 0.12, size * 0.12);
            // 부리 (웃는)
            ctx.fillStyle = colors.beak;
            ctx.beginPath();
            ctx.moveTo(size * 0.6, size * 0.0);
            ctx.quadraticCurveTo(size * 0.95, size * 0.1, size * 0.6, size * 0.25);
            ctx.closePath();
            ctx.fill();
            break;

        case 'ppuul': // 쿨한 새
            // 선글라스
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.roundRect(size * 0.1, -size * 0.35, size * 0.5, size * 0.28, size * 0.05);
            ctx.fill();
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = size * 0.04;
            ctx.stroke();
            // 선글라스 다리
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = size * 0.05;
            ctx.beginPath();
            ctx.moveTo(size * 0.1, -size * 0.2);
            ctx.lineTo(-size * 0.3, -size * 0.25);
            ctx.stroke();
            // 반사광
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.beginPath();
            ctx.ellipse(size * 0.25, -size * 0.28, size * 0.08, size * 0.05, -0.3, 0, Math.PI * 2);
            ctx.fill();
            // 부리
            ctx.fillStyle = colors.beak;
            ctx.beginPath();
            ctx.moveTo(size * 0.65, size * 0.05);
            ctx.lineTo(size * 1.0, size * 0.12);
            ctx.lineTo(size * 0.65, size * 0.2);
            ctx.closePath();
            ctx.fill();
            break;

        case 'ppuseul': // 슬픈 새
            // 축 처진 눈썹
            ctx.strokeStyle = colors.bodyStroke;
            ctx.lineWidth = size * 0.08;
            ctx.beginPath();
            ctx.moveTo(size * 0.1, -size * 0.45);
            ctx.lineTo(size * 0.5, -size * 0.35);
            ctx.stroke();
            // 슬픈 눈
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.ellipse(size * 0.35, -size * 0.1, size * 0.22, size * 0.18, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(size * 0.38, -size * 0.05, size * 0.1, 0, Math.PI * 2);
            ctx.fill();
            // 눈물
            ctx.fillStyle = '#87CEEB';
            ctx.beginPath();
            ctx.moveTo(size * 0.5, size * 0.0);
            ctx.quadraticCurveTo(size * 0.55, size * 0.15, size * 0.48, size * 0.25);
            ctx.quadraticCurveTo(size * 0.42, size * 0.15, size * 0.5, size * 0.0);
            ctx.fill();
            // 부리 (아래로)
            ctx.fillStyle = colors.beak;
            ctx.beginPath();
            ctx.moveTo(size * 0.6, size * 0.1);
            ctx.lineTo(size * 0.9, size * 0.2);
            ctx.lineTo(size * 0.6, size * 0.25);
            ctx.closePath();
            ctx.fill();
            break;

        case 'ppuban': // 신난 새
            // 별 눈
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.ellipse(size * 0.35, -size * 0.12, size * 0.28, size * 0.24, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = size * 0.03;
            ctx.stroke();
            ctx.fillStyle = '#FFD700';
            drawStar(ctx, size * 0.38, -size * 0.08, size * 0.14, 5);
            // 볼터치
            ctx.fillStyle = 'rgba(255, 150, 150, 0.5)';
            ctx.beginPath();
            ctx.ellipse(size * 0.15, size * 0.2, size * 0.18, size * 0.1, 0, 0, Math.PI * 2);
            ctx.fill();
            // 활짝 웃는 부리
            ctx.fillStyle = colors.beak;
            ctx.beginPath();
            ctx.moveTo(size * 0.55, size * 0.0);
            ctx.quadraticCurveTo(size * 1.05, size * 0.15, size * 0.55, size * 0.35);
            ctx.closePath();
            ctx.fill();
            // 입안
            ctx.fillStyle = '#8B0000';
            ctx.beginPath();
            ctx.ellipse(size * 0.7, size * 0.18, size * 0.12, size * 0.08, 0, 0, Math.PI * 2);
            ctx.fill();
            break;

        default: // ppukku - 기본 귀여운 새
            // 큰 눈
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.ellipse(size * 0.35, -size * 0.12, size * 0.28, size * 0.24, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = size * 0.03;
            ctx.stroke();
            // 눈동자
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(size * 0.42, -size * 0.08, size * 0.12, 0, Math.PI * 2);
            ctx.fill();
            // 눈 하이라이트
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(size * 0.47, -size * 0.15, size * 0.05, 0, Math.PI * 2);
            ctx.fill();
            // 볼터치
            ctx.fillStyle = 'rgba(255, 150, 150, 0.4)';
            ctx.beginPath();
            ctx.ellipse(size * 0.12, size * 0.18, size * 0.18, size * 0.1, 0, 0, Math.PI * 2);
            ctx.fill();
            // 부리
            ctx.fillStyle = colors.beak;
            ctx.beginPath();
            ctx.moveTo(size * 0.65, size * 0.0);
            ctx.lineTo(size * 1.05, size * 0.1);
            ctx.lineTo(size * 0.65, size * 0.22);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#CC5500';
            ctx.lineWidth = size * 0.02;
            ctx.stroke();
            break;
    }

    ctx.restore();
}

// 하트 그리기 헬퍼
function drawHeart(ctx, x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.3);
    ctx.bezierCurveTo(x - size, y - size * 0.5, x - size * 0.5, y - size, x, y - size * 0.5);
    ctx.bezierCurveTo(x + size * 0.5, y - size, x + size, y - size * 0.5, x, y + size * 0.3);
    ctx.fill();
}

// 별 그리기 헬퍼
function drawStar(ctx, cx, cy, radius, points) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? radius : radius * 0.5;
        const angle = (i * Math.PI / points) - Math.PI / 2;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
}

// 캐릭터 미리보기 업데이트
function updateCharacterPreview() {
    if (!characterPreviewCtx) return;
    characterPreviewCtx.clearRect(0, 0, 60, 60);
    drawCharacter(characterPreviewCtx, 30, 30, 22, currentCharacter);
}

// 캐릭터 선택 UI 생성
function createCharacterGrid() {
    if (!characterGrid) return;
    characterGrid.innerHTML = '';

    Object.values(characters).forEach(char => {
        const card = document.createElement('div');
        card.className = 'character-card';
        if (currentCharacter === char.id) card.classList.add('selected');
        if (!unlockedCharacters.includes(char.id)) card.classList.add('locked');

        const canvas = document.createElement('canvas');
        canvas.width = 70;
        canvas.height = 70;
        const cardCtx = canvas.getContext('2d');
        drawCharacter(cardCtx, 35, 35, 25, char.id);

        const name = document.createElement('span');
        name.className = 'character-name';
        name.textContent = char.name;

        const price = document.createElement('span');
        price.className = 'character-price';
        if (unlockedCharacters.includes(char.id)) {
            price.textContent = currentCharacter === char.id ? '✓ 선택됨' : '보유중';
        } else {
            price.textContent = `🪙 ${char.price}`;
        }

        card.appendChild(canvas);
        card.appendChild(name);
        card.appendChild(price);

        card.addEventListener('click', () => {
            if (unlockedCharacters.includes(char.id)) {
                selectCharacter(char.id);
                createCharacterGrid();
            } else if (tokens >= char.price) {
                if (confirm(`${char.name}을(를) ${char.price} 토큰으로 구매할까요?`)) {
                    if (unlockCharacter(char.id)) {
                        selectCharacter(char.id);
                        createCharacterGrid();
                        updateTokenDisplays();
                    }
                }
            } else {
                alert('토큰이 부족합니다!');
            }
        });

        characterGrid.appendChild(card);
    });
}

// 난이도 설정
const difficultySettings = {
    easy: {
        name: 'Easy',
        color: '#4CAF50',
        speed: 2.8,
        gap: 260,
        gravity: 0.14,
        lift: -3.8,
        practiceTime: 5000,
        levelSpeedIncrease: 0.03,
        spawnInterval: 2800,
        tokenThreshold: 25 // 25점당 1토큰
    },
    middle: {
        name: 'Middle',
        color: '#FF9800',
        speed: 3.8,
        gap: 220,
        gravity: 0.20,
        lift: -4.5,
        practiceTime: 4000,
        levelSpeedIncrease: 0.05,
        spawnInterval: 2400,
        tokenThreshold: 15 // 15점당 1토큰
    },
    hard: {
        name: 'Hard',
        color: '#f44336',
        speed: 5.2,
        gap: 160,
        gravity: 0.30,
        lift: -6,
        practiceTime: 2000,
        levelSpeedIncrease: 0.08,
        spawnInterval: 1800,
        tokenThreshold: 10 // 10점당 1토큰
    }
};

let currentDifficulty = 'middle'; // 기본 난이도

// 토큰 시스템
let tokens = parseInt(localStorage.getItem('pressto_tokens')) || 0;
let reviveInvincibleTime = 0; // 부활 후 무적 시간
const REVIVE_INVINCIBLE_DURATION = 3000; // 3초 무적
let lastTokenScore = 0; // 마지막 토큰 획득 점수
let tokenDisplay_timer = 0; // 토큰 획득 표시 타이머

// 수집용 토큰 아이템
let collectibleTokens = [];
let lastTokenLevel = 0; // 마지막 토큰 생성 레벨

// 플레이어 스프라이트 로드 (애니메이션)
const birdSprites = [];
let birdSpritesLoaded = 0;
const BIRD_FRAME_COUNT = 2;

for (let i = 1; i <= BIRD_FRAME_COUNT; i++) {
    const img = new Image();
    img.src = `assets/sprites/transparent PNG/fly/frame-${i}.png`;
    img.onload = () => {
        birdSpritesLoaded++;
    };
    birdSprites.push(img);
}

let currentBirdFrame = 0;
let birdAnimationTimer = 0;
const BIRD_ANIMATION_SPEED = 8; // 프레임당 틱

// Web Audio API 사운드 시스템
let audioContext = null;
let audioInitialized = false;

function getAudioContext() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch(e) {
            return null;
        }
    }
    return audioContext;
}

// 사용자 인터랙션 시 오디오 활성화
function initAudio() {
    if (audioInitialized) return;
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
        ctx.resume();
    }
    audioInitialized = true;
}

// 첫 터치/클릭 시 오디오 초기화
document.addEventListener('touchstart', initAudio, { once: true });
document.addEventListener('click', initAudio, { once: true });

// 바람 소리 생성 (장애물 통과 시)
function createWindSound(duration = 0.15, volume = 0.2) {
    const ctx = getAudioContext();
    if (!ctx) return;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        const t = i / bufferSize;
        const envelope = Math.sin(t * Math.PI); // 부드러운 페이드 인/아웃
        data[i] = (Math.random() * 2 - 1) * envelope * 0.3;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // 로우패스 필터로 부드러운 바람 소리
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    const gainNode = ctx.createGain();
    gainNode.gain.value = volume;

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start();
}

// 레벨업 바람 + 차임 소리
function createLevelUpSound() {
    const ctx = getAudioContext();
    if (!ctx) return;

    // 상승하는 바람 소리
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        const t = i / bufferSize;
        const envelope = Math.sin(t * Math.PI) * (1 - t * 0.5);
        data[i] = (Math.random() * 2 - 1) * envelope * 0.2;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.5);
    filter.Q.value = 1;

    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.25;

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    noiseSource.start();

    // 차임 소리 추가
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 코드
    frequencies.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;

        oscGain.gain.setValueAtTime(0, ctx.currentTime + index * 0.08);
        oscGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + index * 0.08 + 0.05);
        oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.08 + 0.4);

        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start(ctx.currentTime + index * 0.08);
        osc.stop(ctx.currentTime + index * 0.08 + 0.5);
    });
}

// 부드러운 점프 소리
function createJumpSound() {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
}

// 충돌 소리 (짧은 충격음)
function createHitSound() {
    const ctx = getAudioContext();
    if (!ctx) return;

    // 노이즈 버스트
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        const t = i / bufferSize;
        const envelope = Math.exp(-t * 15);
        data[i] = (Math.random() * 2 - 1) * envelope;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 500;

    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.3;

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start();

    // 저음 펑 소리 추가
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);
    oscGain.gain.setValueAtTime(0.3, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
}

// 토큰 획득 소리 (반짝이는 소리)
function createTokenSound() {
    const ctx = getAudioContext();
    if (!ctx) return;
    const frequencies = [880, 1108.73, 1318.51]; // A5, C#6, E6

    frequencies.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;

        const startTime = ctx.currentTime + index * 0.03;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.25);
    });
}

function playSound(name) {
    try {
        switch(name) {
            case 'jump':
                createJumpSound();
                break;
            case 'score':
                createWindSound(0.12, 0.15);
                break;
            case 'hit':
                createHitSound();
                break;
            case 'levelup':
                createLevelUpSound();
                break;
            case 'token':
                createTokenSound();
                break;
        }
    } catch(e) {
        // 오디오 에러 무시
    }
}

// 패럴랙스 배경용 구름
let clouds = [];
function initClouds() {
    clouds = [];
    for (let i = 0; i < 8; i++) {
        clouds.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height * 0.6,
            size: 30 + Math.random() * 50,
            speed: 0.2 + Math.random() * 0.3,
            opacity: 0.3 + Math.random() * 0.4
        });
    }
}

// Canvas 크기 설정
function resizeCanvas() {
    const container = document.getElementById('game-container');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 게임 상태
const GameState = {
    READY: 'ready',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAMEOVER: 'gameover'
};

// 게임 변수
let gameState = GameState.READY;
let score = 0;
let bestScore = parseInt(localStorage.getItem('pressto_best_' + currentDifficulty)) || 0;
let isPressed = false;
let gameStartTime = 0;
let practiceMode = true; // 연습 모드
let currentLevel = 1;
let levelUpDisplay = 0; // 레벨업 표시 타이머

// 레벨 테마 시스템
let currentCycle = 1; // 회차 (레벨 5 이후 증가)
const LEVELS_PER_CYCLE = 5;

// 레벨별 테마 정의
const levelThemes = [
    { // Lv.1 - 맑은 하늘
        name: '맑은 하늘',
        sky: ['#E0F6FF', '#87CEEB'],
        pipe: '#2ECC71',
        pipeStroke: '#27AE60',
        pipeCap: '#58D68D',
        pipeStyle: 'pipe'
    },
    { // Lv.2 - 석양
        name: '석양',
        sky: ['#FFD89B', '#FF6B6B'],
        pipe: '#8B4513',
        pipeStroke: '#5D2E0C',
        pipeCap: '#A0522D',
        pipeStyle: 'wood'
    },
    { // Lv.3 - 밤하늘
        name: '밤하늘',
        sky: ['#1a1a2e', '#16213e'],
        pipe: '#4A4A5A',
        pipeStroke: '#2A2A3A',
        pipeCap: '#6A6A7A',
        pipeStyle: 'building'
    },
    { // Lv.4 - 우주
        name: '우주',
        sky: ['#0d0d1a', '#1a0a2e'],
        pipe: '#6B4C9A',
        pipeStroke: '#4A3070',
        pipeCap: '#8B6CBB',
        pipeStyle: 'asteroid'
    },
    { // Lv.5 - 네온
        name: '네온 시티',
        sky: ['#0a0a15', '#1a0a25'],
        pipe: '#FF00FF',
        pipeStroke: '#00FFFF',
        pipeCap: '#FF69B4',
        pipeStyle: 'neon'
    }
];

// 플레이어 설정
const player = {
    x: 0,
    y: 0,
    width: 70,
    height: 85,
    velocity: 0,
    gravity: 0.12,
    lift: -3.5,
    maxVelocity: 6
};

// 장애물 설정
let pipes = [];
const pipeConfig = {
    width: 60,
    gap: 300,
    speed: 2,
    spawnInterval: 3000,
    minHeight: 50
};
let lastPipeTime = 0;

// 난이도 적용 함수
function applyDifficulty(diff) {
    const settings = difficultySettings[diff];
    pipeConfig.speed = settings.speed;
    pipeConfig.gap = settings.gap;
    pipeConfig.spawnInterval = settings.spawnInterval;
    player.gravity = settings.gravity;
    player.lift = settings.lift;
}

// 파티클 효과
let particles = [];

// 현재 테마 가져오기
function getCurrentTheme() {
    const themeIndex = ((currentLevel - 1) % LEVELS_PER_CYCLE);
    return levelThemes[themeIndex];
}

// 플레이어 색상
const playerColors = {
    player: '#FFD700',
    playerStroke: '#FFA500'
};

// 플레이어 초기화
function resetPlayer() {
    player.x = canvas.width * 0.15;
    player.y = canvas.height * 0.5;
    player.velocity = 0;
}

// 게임 초기화
function resetGame() {
    score = 0;
    pipes = [];
    particles = [];
    collectibleTokens = [];
    lastPipeTime = 0;
    currentLevel = 1;
    currentCycle = 1;
    levelUpDisplay = 0;
    lastTokenScore = 0;
    lastTokenLevel = 0;
    tokenDisplay_timer = 0;
    reviveInvincibleTime = 0;
    currentBirdFrame = 0;
    birdAnimationTimer = 0;
    initClouds();
    resetPlayer();
    scoreDisplay.textContent = '0';
    updateTokenDisplays();
}

// 장애물 생성
function spawnPipe() {
    // 레벨에 따라 갭 감소 (레벨당 5% 감소, 최소 150px)
    let baseGap = pipeConfig.gap;

    // Hard 모드: 10점까지는 갭을 더 크게 (220px)
    if (currentDifficulty === 'hard' && score <= 10) {
        baseGap = 220;
    }

    const gapMultiplier = 1 - (currentLevel - 1) * 0.05;
    const currentGap = Math.max(baseGap * gapMultiplier, 150);

    const minY = pipeConfig.minHeight;
    const maxY = canvas.height - currentGap - pipeConfig.minHeight;
    const gapY = Math.random() * (maxY - minY) + minY;

    pipes.push({
        x: canvas.width,
        gapY: gapY,
        gapSize: currentGap, // 각 파이프마다 갭 저장
        width: pipeConfig.width,
        passed: false
    });
}

// 수집용 토큰 생성 (5레벨마다)
function spawnCollectibleToken() {
    const settings = difficultySettings[currentDifficulty];

    // 난이도별 토큰 위치 결정
    let tokenY;
    const safeMargin = 80; // 화면 가장자리 여백

    if (currentDifficulty === 'easy') {
        // Easy: 화면 중앙 근처 (쉬운 위치)
        const centerY = canvas.height / 2;
        const easyRange = canvas.height * 0.2; // 중앙 ±20%
        tokenY = centerY + (Math.random() - 0.5) * easyRange;
    } else if (currentDifficulty === 'middle') {
        // Middle: 중앙에서 약간 벗어난 위치
        const centerY = canvas.height / 2;
        const offset = (Math.random() > 0.5 ? 1 : -1) * canvas.height * 0.25;
        tokenY = centerY + offset + (Math.random() - 0.5) * canvas.height * 0.15;
    } else {
        // Hard: 상단 또는 하단 가장자리 근처 (어려운 위치)
        if (Math.random() > 0.5) {
            tokenY = safeMargin + Math.random() * canvas.height * 0.15; // 상단
        } else {
            tokenY = canvas.height - safeMargin - Math.random() * canvas.height * 0.15; // 하단
        }
    }

    // 토큰 위치가 화면 안에 있도록 보정
    tokenY = Math.max(safeMargin, Math.min(canvas.height - safeMargin, tokenY));

    collectibleTokens.push({
        x: canvas.width + 40,
        y: tokenY,
        radius: 35, // 더 크게
        collected: false,
        glow: 0, // 반짝임 효과용
        pulse: 0 // 펄스 효과용
    });
}

// 파티클 생성
function createParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            radius: Math.random() * 4 + 2,
            color: color,
            life: 1
        });
    }
}

// 배경 그리기
function drawBackground() {
    const theme = getCurrentTheme();
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, theme.sky[0]);
    gradient.addColorStop(1, theme.sky[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 패럴랙스 구름 업데이트 및 그리기
    if (gameState === GameState.PLAYING) {
        updateParallaxClouds();
    }
    drawParallaxClouds();

    // 레벨별 배경 장식
    const themeIndex = (currentLevel - 1) % LEVELS_PER_CYCLE;

    if (themeIndex === 0) {
        // 맑은 하늘 - 추가 장식
        // 태양
        ctx.fillStyle = 'rgba(255, 255, 200, 0.8)';
        ctx.beginPath();
        ctx.arc(canvas.width * 0.9, canvas.height * 0.15, 35, 0, Math.PI * 2);
        ctx.fill();
        // 태양광
        ctx.strokeStyle = 'rgba(255, 255, 200, 0.3)';
        ctx.lineWidth = 3;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(canvas.width * 0.9 + Math.cos(angle) * 45, canvas.height * 0.15 + Math.sin(angle) * 45);
            ctx.lineTo(canvas.width * 0.9 + Math.cos(angle) * 60, canvas.height * 0.15 + Math.sin(angle) * 60);
            ctx.stroke();
        }
    } else if (themeIndex === 1) {
        // 석양 - 태양
        const sunGradient = ctx.createRadialGradient(
            canvas.width * 0.85, canvas.height * 0.35, 0,
            canvas.width * 0.85, canvas.height * 0.35, 50
        );
        sunGradient.addColorStop(0, 'rgba(255, 200, 100, 1)');
        sunGradient.addColorStop(0.5, 'rgba(255, 150, 50, 0.8)');
        sunGradient.addColorStop(1, 'rgba(255, 100, 50, 0)');
        ctx.fillStyle = sunGradient;
        ctx.beginPath();
        ctx.arc(canvas.width * 0.85, canvas.height * 0.35, 50, 0, Math.PI * 2);
        ctx.fill();
    } else if (themeIndex === 2) {
        // 밤하늘 - 반짝이는 별
        const time = Date.now() * 0.001;
        for (let i = 0; i < 60; i++) {
            const x = (i * 137 + 50) % canvas.width;
            const y = (i * 89 + 30) % canvas.height;
            const size = (i % 3) + 1;
            const twinkle = 0.5 + Math.sin(time * 2 + i) * 0.5;
            ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        // 달
        ctx.fillStyle = '#FFFACD';
        ctx.shadowColor = '#FFFACD';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(canvas.width * 0.8, canvas.height * 0.18, 35, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    } else if (themeIndex === 3) {
        // 우주 - 별 + 성운
        const time = Date.now() * 0.0005;
        // 성운 효과
        ctx.fillStyle = 'rgba(150, 100, 200, 0.1)';
        ctx.beginPath();
        ctx.ellipse(canvas.width * 0.3, canvas.height * 0.4, 150, 80, time, 0, Math.PI * 2);
        ctx.fill();
        // 별
        for (let i = 0; i < 100; i++) {
            const x = (i * 137) % canvas.width;
            const y = (i * 89) % canvas.height;
            const size = (i % 2) + 0.5;
            ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + (i % 7) * 0.1})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        // 행성
        const planetGradient = ctx.createRadialGradient(
            canvas.width * 0.9 - 5, canvas.height * 0.15 - 5, 0,
            canvas.width * 0.9, canvas.height * 0.15, 30
        );
        planetGradient.addColorStop(0, '#C39BD3');
        planetGradient.addColorStop(1, '#6C3483');
        ctx.fillStyle = planetGradient;
        ctx.beginPath();
        ctx.arc(canvas.width * 0.9, canvas.height * 0.15, 28, 0, Math.PI * 2);
        ctx.fill();
        // 행성 고리
        ctx.strokeStyle = 'rgba(200, 180, 220, 0.6)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(canvas.width * 0.9, canvas.height * 0.15, 45, 12, -0.3, 0, Math.PI * 2);
        ctx.stroke();
    } else if (themeIndex === 4) {
        // 네온 시티 - 빌딩 실루엣 + 네온
        // 빌딩 실루엣
        ctx.fillStyle = 'rgba(20, 20, 40, 0.8)';
        for (let i = 0; i < 15; i++) {
            const bx = i * (canvas.width / 12);
            const bh = 50 + Math.random() * 100;
            ctx.fillRect(bx, canvas.height - bh, canvas.width / 15, bh);
        }
        // 네온 라인
        const neonTime = Date.now() * 0.003;
        ctx.strokeStyle = `rgba(255, 0, 255, ${0.3 + Math.sin(neonTime) * 0.2})`;
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(0, canvas.height * (0.3 + i * 0.12));
            ctx.lineTo(canvas.width, canvas.height * (0.35 + i * 0.12));
            ctx.stroke();
        }
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.3 + Math.cos(neonTime) * 0.2})`;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(canvas.width * (0.2 + i * 0.3), 0);
            ctx.lineTo(canvas.width * (0.25 + i * 0.3), canvas.height * 0.6);
            ctx.stroke();
        }
    }

    // 회차 표시 (2회차 이상)
    if (currentCycle > 1) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
        ctx.font = `bold ${60 + currentCycle * 8}px "Press Start 2P", sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(`${currentCycle}`, canvas.width / 2, canvas.height / 2 + 20);
    }

    // 50점 이상 보스 스테이지 효과 (Easy/Middle)
    if (score >= 50 && (currentDifficulty === 'easy' || currentDifficulty === 'middle')) {
        // 화면 가장자리 글로우 효과
        const glowIntensity = 0.15 + Math.sin(Date.now() * 0.003) * 0.05;
        const bossGradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, canvas.height * 0.3,
            canvas.width / 2, canvas.height / 2, canvas.height
        );
        if (currentDifficulty === 'easy') {
            bossGradient.addColorStop(0, 'rgba(255, 215, 0, 0)');
            bossGradient.addColorStop(1, `rgba(255, 150, 0, ${glowIntensity})`);
        } else {
            bossGradient.addColorStop(0, 'rgba(255, 50, 50, 0)');
            bossGradient.addColorStop(1, `rgba(255, 0, 100, ${glowIntensity})`);
        }
        ctx.fillStyle = bossGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 번개/스파크 효과
        if (Math.random() < 0.02) {
            ctx.strokeStyle = currentDifficulty === 'easy' ?
                'rgba(255, 215, 0, 0.3)' : 'rgba(255, 100, 150, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            const startX = Math.random() * canvas.width;
            ctx.moveTo(startX, 0);
            let y = 0;
            while (y < canvas.height * 0.3) {
                y += 20;
                ctx.lineTo(startX + (Math.random() - 0.5) * 50, y);
            }
            ctx.stroke();
        }
    }

    // 크레딧 표시
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '12px "Press Start 2P", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('made by 빛나아빠', canvas.width / 2, canvas.height - 15);
    ctx.textAlign = 'left';
}

// 패럴랙스 구름 업데이트
function updateParallaxClouds() {
    clouds.forEach(cloud => {
        cloud.x -= cloud.speed * pipeConfig.speed;
        if (cloud.x + cloud.size * 2 < 0) {
            cloud.x = canvas.width + cloud.size;
            cloud.y = Math.random() * canvas.height * 0.5;
        }
    });
}

// 패럴랙스 구름 그리기
function drawParallaxClouds() {
    clouds.forEach(cloud => {
        ctx.fillStyle = `rgba(255, 255, 255, ${cloud.opacity})`;
        drawCloud(cloud.x, cloud.y, cloud.size);
    });
}

function drawCloud(x, y, size) {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.arc(x + size * 0.8, y - size * 0.2, size * 0.7, 0, Math.PI * 2);
    ctx.arc(x + size * 1.4, y, size * 0.8, 0, Math.PI * 2);
    ctx.fill();
}

// 플레이어 그리기 (캐릭터 시스템)
function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);

    // 기울기 (속도에 따라)
    const rotation = Math.min(Math.max(player.velocity * 3, -30), 30) * Math.PI / 180;
    ctx.rotate(rotation);

    // 애니메이션 업데이트 (날개 펄럭임)
    if (gameState === GameState.PLAYING) {
        birdAnimationTimer++;
        if (birdAnimationTimer >= BIRD_ANIMATION_SPEED) {
            birdAnimationTimer = 0;
            currentBirdFrame = (currentBirdFrame + 1) % BIRD_FRAME_COUNT;
        }
    }

    // 눌렀을 때/부활 무적일 때 효과
    const isInvincible = reviveInvincibleTime > Date.now() || practiceMode;

    if (isInvincible && gameState === GameState.PLAYING) {
        // 무적 상태 글로우 효과
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 20 + Math.sin(Date.now() * 0.01) * 10;
    }

    // 선택된 캐릭터로 그리기
    const size = player.width / 2;
    const wingUp = currentBirdFrame === 0 || isPressed;
    drawCharacter(ctx, 0, 0, size, currentCharacter, wingUp);

    ctx.shadowBlur = 0;
    ctx.restore();
}

// 파이프 그리기
function drawPipes() {
    pipes.forEach(pipe => {
        const gap = pipe.gapSize || pipeConfig.gap;
        // 위쪽 파이프
        drawPipe(pipe.x, 0, pipe.width, pipe.gapY, true);
        // 아래쪽 파이프
        drawPipe(pipe.x, pipe.gapY + gap, pipe.width, canvas.height - pipe.gapY - gap, false);
    });
}

function drawPipe(x, y, width, height, isTop) {
    const theme = getCurrentTheme();
    const themeIndex = (currentLevel - 1) % LEVELS_PER_CYCLE;

    ctx.lineWidth = 3;

    if (themeIndex === 0) {
        // Lv.1 - 기본 파이프
        ctx.fillStyle = theme.pipe;
        ctx.strokeStyle = theme.pipeStroke;
        ctx.fillRect(x, y, width, height);
        ctx.strokeRect(x, y, width, height);
        // 캡
        const capHeight = 25;
        const capX = x - 7.5;
        let capY = isTop ? y + height - capHeight : y;
        ctx.fillStyle = theme.pipeCap;
        ctx.fillRect(capX, capY, width + 15, capHeight);
        ctx.strokeRect(capX, capY, width + 15, capHeight);
        // 하이라이트
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(x + 5, y, 10, height);

    } else if (themeIndex === 1) {
        // Lv.2 - 나무 기둥
        ctx.fillStyle = theme.pipe;
        ctx.strokeStyle = theme.pipeStroke;
        ctx.fillRect(x, y, width, height);
        ctx.strokeRect(x, y, width, height);
        // 나무 무늬
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        for (let i = 0; i < height; i += 20) {
            ctx.beginPath();
            ctx.moveTo(x, y + i);
            ctx.bezierCurveTo(x + width/3, y + i + 5, x + width*2/3, y + i - 5, x + width, y + i);
            ctx.stroke();
        }
        // 이끼/잎
        ctx.fillStyle = '#228B22';
        const leafY = isTop ? y + height : y;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(x + (i * width/4), leafY, 8, 0, Math.PI * 2);
            ctx.fill();
        }

    } else if (themeIndex === 2) {
        // Lv.3 - 빌딩
        ctx.fillStyle = theme.pipe;
        ctx.strokeStyle = theme.pipeStroke;
        ctx.fillRect(x, y, width, height);
        ctx.strokeRect(x, y, width, height);
        // 창문
        ctx.fillStyle = '#FFD700';
        const windowSize = 8;
        const windowGap = 15;
        for (let wy = y + 10; wy < y + height - 10; wy += windowGap) {
            for (let wx = x + 8; wx < x + width - 8; wx += windowGap) {
                if (Math.random() > 0.3) {
                    ctx.fillRect(wx, wy, windowSize, windowSize);
                }
            }
        }

    } else if (themeIndex === 3) {
        // Lv.4 - 운석/바위
        ctx.fillStyle = theme.pipe;
        ctx.strokeStyle = theme.pipeStroke;
        // 울퉁불퉁한 모양
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let i = 0; i <= height; i += 20) {
            const offset = Math.sin(i * 0.1) * 8;
            ctx.lineTo(x + offset, y + i);
        }
        ctx.lineTo(x + width, y + height);
        for (let i = height; i >= 0; i -= 20) {
            const offset = Math.cos(i * 0.15) * 8;
            ctx.lineTo(x + width + offset, y + i);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // 크레이터
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        for (let i = 0; i < 3; i++) {
            const craterY = y + (height * (i + 1) / 4);
            ctx.beginPath();
            ctx.ellipse(x + width/2, craterY, 12, 8, 0, 0, Math.PI * 2);
            ctx.fill();
        }

    } else if (themeIndex === 4) {
        // Lv.5 - 네온 레이저
        // 글로우 효과
        ctx.shadowColor = theme.pipe;
        ctx.shadowBlur = 20;
        ctx.fillStyle = theme.pipe;
        ctx.fillRect(x, y, width, height);
        ctx.shadowBlur = 0;
        // 네온 테두리
        ctx.strokeStyle = theme.pipeStroke;
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, width, height);
        // 중앙 라인
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + width/2, y);
        ctx.lineTo(x + width/2, y + height);
        ctx.stroke();
        // 끝부분 강조
        const endY = isTop ? y + height : y;
        ctx.fillStyle = theme.pipeCap;
        ctx.shadowColor = theme.pipeCap;
        ctx.shadowBlur = 15;
        ctx.fillRect(x - 5, endY - 5, width + 10, 10);
        ctx.shadowBlur = 0;
    }

    // 회차별 웅장함 효과 (2회차 이상)
    if (currentCycle > 1) {
        ctx.strokeStyle = `rgba(255, 215, 0, ${0.3 + currentCycle * 0.1})`;
        ctx.lineWidth = currentCycle;
        ctx.strokeRect(x - 2, y, width + 4, height);
    }
}

// 파티클 그리기
function drawParticles() {
    particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

// 수집용 토큰 그리기
function drawCollectibleTokens() {
    collectibleTokens.forEach(token => {
        if (token.collected) return;

        token.glow = (token.glow + 0.08) % (Math.PI * 2);
        token.pulse = (token.pulse + 0.1) % (Math.PI * 2);
        const glowIntensity = 0.6 + Math.sin(token.glow) * 0.4;
        const pulseScale = 1 + Math.sin(token.pulse) * 0.1;

        ctx.save();
        ctx.translate(token.x, token.y);
        ctx.scale(pulseScale, pulseScale);

        // 외곽 글로우 (여러 겹)
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 30 + Math.sin(token.glow) * 15;

        // 외곽 빛
        ctx.fillStyle = `rgba(255, 215, 0, ${glowIntensity * 0.3})`;
        ctx.beginPath();
        ctx.arc(0, 0, token.radius + 15, 0, Math.PI * 2);
        ctx.fill();

        // 중간 빛
        ctx.fillStyle = `rgba(255, 215, 0, ${glowIntensity * 0.5})`;
        ctx.beginPath();
        ctx.arc(0, 0, token.radius + 8, 0, Math.PI * 2);
        ctx.fill();

        // 토큰 본체
        const gradient = ctx.createRadialGradient(0, -10, 0, 0, 0, token.radius);
        gradient.addColorStop(0, '#FFF8DC');
        gradient.addColorStop(0.5, '#FFD700');
        gradient.addColorStop(1, '#FFA500');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, token.radius, 0, Math.PI * 2);
        ctx.fill();

        // 토큰 테두리
        ctx.strokeStyle = '#FF8C00';
        ctx.lineWidth = 4;
        ctx.stroke();

        // 내부 테두리
        ctx.strokeStyle = '#FFE4B5';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, token.radius - 6, 0, Math.PI * 2);
        ctx.stroke();

        // 코인 이모지
        ctx.font = `bold ${token.radius * 1.2}px "Segoe UI"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🪙', 0, 0);

        ctx.restore();
    });
}

// 충돌 감지 (히트박스 여유있게)
function checkCollision() {
    const hitboxShrink = 25; // 충돌 판정 많이 여유

    // 화면 상하단 충돌 (30% 이상 벗어나면 사망)
    const boundaryTolerance = player.height * 0.3; // 30% 여유
    if (player.y - player.height/2 + boundaryTolerance < 0 ||
        player.y + player.height/2 - boundaryTolerance > canvas.height) {
        return true;
    }

    // 파이프 충돌
    for (let pipe of pipes) {
        const gap = pipe.gapSize || pipeConfig.gap;
        const playerLeft = player.x - player.width/2 + hitboxShrink;
        const playerRight = player.x + player.width/2 - hitboxShrink;
        const playerTop = player.y - player.height/2 + hitboxShrink;
        const playerBottom = player.y + player.height/2 - hitboxShrink;

        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + pipe.width;

        // X축 겹침 확인
        if (playerRight > pipeLeft && playerLeft < pipeRight) {
            // 위쪽 파이프 충돌
            if (playerTop < pipe.gapY) {
                return true;
            }
            // 아래쪽 파이프 충돌
            if (playerBottom > pipe.gapY + gap) {
                return true;
            }
        }
    }

    return false;
}

// 게임 업데이트
function update(deltaTime) {
    if (gameState !== GameState.PLAYING) return;

    const now = Date.now();
    const timeSinceStart = now - gameStartTime;
    const settings = difficultySettings[currentDifficulty];

    // 연습 모드 체크 (난이도별 시간)
    if (practiceMode && timeSinceStart >= settings.practiceTime) {
        practiceMode = false;
    }

    // 부활 무적 체크
    const isReviveInvincible = reviveInvincibleTime > now;

    // 토큰 표시 타이머
    if (tokenDisplay_timer > 0) {
        tokenDisplay_timer--;
    }

    // 플레이어 물리
    if (isPressed) {
        player.velocity += player.lift * 0.3; // 부드러운 상승
        if (player.velocity < player.lift) {
            player.velocity = player.lift;
        }
    } else {
        // 연습 모드에서는 중력 약하게
        if (practiceMode) {
            player.velocity += player.gravity * 0.5;
        } else {
            player.velocity += player.gravity;
        }
    }

    player.velocity = Math.min(Math.max(player.velocity, -player.maxVelocity), player.maxVelocity);
    player.y += player.velocity;

    // 장애물 생성 (연습 모드에서도 생성하지만 간격 넓게)
    const spawnInterval = practiceMode ? pipeConfig.spawnInterval * 1.5 : pipeConfig.spawnInterval;
    if (now - lastPipeTime > spawnInterval) {
        spawnPipe();
        lastPipeTime = now;
    }

    // 장애물 이동 및 점수 (레벨에 따라 속도 변화)
    const speedMultiplier = 1 + (currentLevel - 1) * 0.05; // 레벨당 5% 속도 증가

    pipes.forEach(pipe => {
        pipe.x -= pipeConfig.speed * speedMultiplier;

        // 점수 획득
        if (!pipe.passed && pipe.x + pipe.width < player.x) {
            pipe.passed = true;
            score++;
            scoreDisplay.textContent = score;
            createParticles(player.x, player.y, 5, '#FFD700');
            playSound('score');

            // 난이도별 점수마다 토큰 획득
            const threshold = settings.tokenThreshold;
            const tokenCount = Math.floor(score / threshold);
            const lastTokenCount = Math.floor(lastTokenScore / threshold);
            if (tokenCount > lastTokenCount) {
                earnToken();
                lastTokenScore = score;
            }

            // 10점 단위로 레벨업
            const newLevel = Math.floor(score / 10) + 1;
            if (newLevel > currentLevel) {
                currentLevel = newLevel;
                // 5레벨마다 회차 증가
                currentCycle = Math.floor((currentLevel - 1) / LEVELS_PER_CYCLE) + 1;
                levelUpDisplay = 120; // 2초간 표시 (60fps 기준)
                createParticles(canvas.width/2, canvas.height/2, 20 + currentCycle * 5, '#FF69B4');
                playSound('levelup');
            }
        }
    });

    // 화면 밖 파이프 제거
    pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);

    // 5레벨마다 수집용 토큰 생성
    if (currentLevel > lastTokenLevel && currentLevel % 5 === 0) {
        spawnCollectibleToken();
        lastTokenLevel = currentLevel;
    }

    // 수집용 토큰 업데이트
    collectibleTokens.forEach(token => {
        if (token.collected) return;

        // 토큰 이동
        token.x -= pipeConfig.speed * speedMultiplier;

        // 플레이어와 충돌 체크 (수집)
        const dx = player.x - token.x;
        const dy = player.y - token.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < token.radius + player.width / 2 - 10) {
            token.collected = true;
            earnToken();
            createParticles(token.x, token.y, 15, '#FFD700');
        }
    });

    // 화면 밖 토큰 제거
    collectibleTokens = collectibleTokens.filter(token => token.x + token.radius > 0 && !token.collected);

    // 파티클 업데이트
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
    });
    particles = particles.filter(p => p.life > 0);

    // 충돌 감지 (연습 모드 또는 부활 무적 중에는 죽지 않음)
    if (checkCollision()) {
        if (practiceMode || isReviveInvincible) {
            // 연습 모드/무적: 화면 밖으로 나가면 중앙으로 복귀
            if (player.y < player.height/2) {
                player.y = player.height/2 + 10;
                player.velocity = 0;
            }
            if (player.y > canvas.height - player.height/2) {
                player.y = canvas.height - player.height/2 - 10;
                player.velocity = 0;
            }
        } else {
            gameOver();
        }
    }
}

// 게임 오버
function gameOver() {
    gameState = GameState.GAMEOVER;
    playSound('hit');

    // 최고 점수 업데이트 (난이도별)
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('pressto_best_' + currentDifficulty, bestScore);
    }

    // UI 업데이트
    finalScoreEl.textContent = score;
    bestScoreEl.textContent = bestScore;
    scoreDisplay.classList.remove('visible');
    tokenDisplay.classList.remove('visible');
    pauseBtn.classList.add('hidden');
    gameoverScreen.classList.remove('hidden');

    // 되살리기 버튼 상태
    updateTokenDisplays();
    if (reviveBtn) {
        if (tokens > 0) {
            reviveBtn.disabled = false;
            reviveBtn.textContent = '🔄 되살리기 (1토큰)';
        } else {
            reviveBtn.disabled = true;
            reviveBtn.textContent = '토큰 부족';
        }
    }

    // 파티클 효과
    createParticles(player.x, player.y, 20, '#FF6B6B');
}

// 게임 시작
function startGame(difficulty) {
    if (difficulty) {
        currentDifficulty = difficulty;
        applyDifficulty(difficulty);
        bestScore = parseInt(localStorage.getItem('pressto_best_' + currentDifficulty)) || 0;
    }

    gameState = GameState.PLAYING;
    practiceMode = true; // 연습 모드로 시작
    resetGame();
    startScreen.classList.add('hidden');
    gameoverScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    scoreDisplay.classList.add('visible');
    tokenDisplay.classList.add('visible');
    pauseBtn.classList.remove('hidden');
    gameStartTime = Date.now();
    lastPipeTime = gameStartTime + 2000; // 2초 후부터 파이프 생성
}

// 연습 모드 스킵
function skipPractice() {
    practiceMode = false;
}

// 토큰 표시 업데이트
function updateTokenDisplays() {
    if (startTokensEl) startTokensEl.textContent = tokens;
    if (gameoverTokensEl) gameoverTokensEl.textContent = tokens;
    if (tokenDisplay) tokenDisplay.textContent = tokens;
}

// 토큰 저장
function saveTokens() {
    localStorage.setItem('pressto_tokens', tokens);
    updateTokenDisplays();
}

// 토큰 획득
function earnToken() {
    tokens++;
    saveTokens();
    tokenDisplay_timer = 90; // 1.5초간 표시
    createParticles(canvas.width - 60, 50, 10, '#FFD700');
    playSound('token');
}

// 되살리기 함수
function revive() {
    if (tokens <= 0) return false;

    tokens--;
    saveTokens();

    // 게임 상태 복구
    gameState = GameState.PLAYING;
    gameoverScreen.classList.add('hidden');
    scoreDisplay.classList.add('visible');
    tokenDisplay.classList.add('visible');

    // 플레이어 위치 초기화
    resetPlayer();
    player.velocity = 0;

    // 장애물 전부 제거
    pipes = [];

    // 3초 무적
    reviveInvincibleTime = Date.now() + REVIVE_INVINCIBLE_DURATION;

    // 파이프 생성 딜레이
    lastPipeTime = Date.now() + 2000;

    // 파티클 효과
    createParticles(player.x, player.y, 30, '#9C27B0');

    return true;
}

// 게임 재시작
function restartGame() {
    startGame();
}

// 처음으로 돌아가기
function goToHome() {
    gameState = GameState.READY;
    resetGame();
    gameoverScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    scoreDisplay.classList.remove('visible');
    tokenDisplay.classList.remove('visible');
    pauseBtn.classList.add('hidden');
    updateTokenDisplays();
}

// 일시정지
let pausedTime = 0; // 일시정지된 시간 저장
function pauseGame() {
    if (gameState !== GameState.PLAYING) return;
    gameState = GameState.PAUSED;
    pausedTime = Date.now();
    pauseScreen.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
}

// 게임 재개
function resumeGame() {
    if (gameState !== GameState.PAUSED) return;
    // 일시정지 동안의 시간 보정
    const pauseDuration = Date.now() - pausedTime;
    gameStartTime += pauseDuration;
    if (reviveInvincibleTime > 0) {
        reviveInvincibleTime += pauseDuration;
    }
    lastPipeTime += pauseDuration;

    gameState = GameState.PLAYING;
    pauseScreen.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
}

// 연습 모드 UI 그리기
function drawPracticeUI() {
    const now = Date.now();
    const settings = difficultySettings[currentDifficulty];
    const isReviveInvincible = reviveInvincibleTime > now;

    // 부활 무적 표시
    if (isReviveInvincible && gameState === GameState.PLAYING) {
        const timeLeft = Math.ceil((reviveInvincibleTime - now) / 1000);
        ctx.fillStyle = 'rgba(156, 39, 176, 0.5)';
        ctx.fillRect(canvas.width/2 - 100, 10, 200, 50);
        ctx.strokeStyle = '#E91E63';
        ctx.lineWidth = 3;
        ctx.strokeRect(canvas.width/2 - 100, 10, 200, 50);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px "Segoe UI"';
        ctx.textAlign = 'center';
        ctx.fillText(`부활 무적! ${timeLeft}초`, canvas.width/2, 42);
        return;
    }

    if (!practiceMode || gameState !== GameState.PLAYING) return;

    const timeLeft = Math.ceil((settings.practiceTime - (now - gameStartTime)) / 1000);

    // 반투명 배경
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(canvas.width/2 - 130, 10, 260, 70);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeRect(canvas.width/2 - 130, 10, 260, 70);

    // 난이도 + 연습 모드 텍스트
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 18px "Segoe UI"';
    ctx.textAlign = 'center';
    ctx.fillText(`[${settings.name}] 연습 모드 (무적)`, canvas.width/2, 36);

    // 남은 시간
    ctx.fillStyle = '#fff';
    ctx.font = '14px "Segoe UI"';
    ctx.fillText(`${timeLeft}초 후 실전 | 더블클릭: SKIP`, canvas.width/2, 58);
}

// 토큰 획득 표시
function drawTokenEarnUI() {
    if (tokenDisplay_timer <= 0 || gameState !== GameState.PLAYING) return;

    const alpha = tokenDisplay_timer / 90;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 36px "Segoe UI"';
    ctx.textAlign = 'center';
    ctx.fillText('+1 TOKEN!', canvas.width / 2, canvas.height / 2 - 50);
    ctx.restore();
}

// 레벨 표시 UI
function drawLevelUI() {
    if (gameState !== GameState.PLAYING) return;

    const theme = getCurrentTheme();

    // 현재 레벨 + 회차 (좌측 상단, 일시정지 버튼 옆)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    const boxWidth = currentCycle > 1 ? 130 : 100;
    const levelBoxX = 80; // 일시정지 버튼 옆
    ctx.fillRect(levelBoxX, 10, boxWidth, 50);

    ctx.textAlign = 'left';

    // 회차 표시 (2회차 이상)
    if (currentCycle > 1) {
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 12px "Segoe UI"';
        ctx.fillText(`${currentCycle}회차`, levelBoxX + 5, 25);
    }

    // 레벨
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px "Segoe UI"';
    ctx.fillText(`Lv.${currentLevel}`, levelBoxX + 5, currentCycle > 1 ? 48 : 38);

    // 난이도 표시 (우측 상단)
    const settings = difficultySettings[currentDifficulty];
    ctx.fillStyle = settings.color;
    ctx.fillRect(canvas.width - 90, 10, 80, 28);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(canvas.width - 90, 10, 80, 28);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px "Segoe UI"';
    ctx.textAlign = 'center';
    ctx.fillText(settings.name, canvas.width - 50, 29);

    // 테마 이름 (난이도 아래)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(canvas.width - 110, 45, 100, 25);
    ctx.fillStyle = theme.pipe;
    ctx.font = '12px "Segoe UI"';
    ctx.textAlign = 'right';
    ctx.fillText(theme.name, canvas.width - 15, 62);

    // 레벨업 표시 (중앙)
    if (levelUpDisplay > 0) {
        levelUpDisplay--;
        const alpha = Math.min(levelUpDisplay / 60, 1);
        const scale = 1 + (120 - levelUpDisplay) * 0.005;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.scale(scale, scale);

        // 회차 변경 시 특별 표시
        const isNewCycle = (currentLevel - 1) % LEVELS_PER_CYCLE === 0 && currentLevel > 1;

        if (isNewCycle) {
            // 새 회차 시작
            ctx.fillStyle = '#FFD700';
            ctx.font = `bold ${50 + currentCycle * 5}px "Segoe UI"`;
            ctx.textAlign = 'center';
            ctx.fillText(`${currentCycle}회차 돌입!`, 0, -20);

            ctx.fillStyle = '#FF69B4';
            ctx.font = 'bold 24px "Segoe UI"';
            ctx.fillText('더 강해진 도전이 시작됩니다!', 0, 25);
        } else {
            // 일반 레벨업
            ctx.fillStyle = '#FF69B4';
            ctx.font = 'bold 48px "Segoe UI"';
            ctx.textAlign = 'center';
            ctx.fillText(`LEVEL ${currentLevel}!`, 0, 0);

            ctx.fillStyle = '#FFD700';
            ctx.font = '20px "Segoe UI"';
            ctx.fillText(`${theme.name}`, 0, 35);
        }

        ctx.restore();
    }
}

// 렌더링
function render() {
    drawBackground();
    drawPipes();
    drawCollectibleTokens();
    drawPlayer();
    drawParticles();
    drawPracticeUI();
    drawLevelUI();
    drawTokenEarnUI();
}

// 게임 루프
let lastTime = 0;
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    update(deltaTime);
    render();

    requestAnimationFrame(gameLoop);
}

// 입력 처리
function handlePress() {
    if (gameState === GameState.READY) {
        startGame();
        return; // 게임 시작 시에는 바로 상승하지 않음
    }
    if (gameState === GameState.PLAYING) {
        if (!isPressed) {
            playSound('jump');
        }
        isPressed = true;
    }
}

function handleRelease() {
    isPressed = false;
}

// 이벤트 리스너
canvas.addEventListener('mousedown', handlePress);
canvas.addEventListener('mouseup', handleRelease);
canvas.addEventListener('mouseleave', handleRelease);
canvas.addEventListener('dblclick', () => {
    if (practiceMode && gameState === GameState.PLAYING) {
        skipPractice();
    }
});

let lastTapTime = 0;
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const now = Date.now();

    // 더블탭 감지 (300ms 이내)
    if (now - lastTapTime < 300 && practiceMode && gameState === GameState.PLAYING) {
        skipPractice();
    }
    lastTapTime = now;
    handlePress();
});
canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    handleRelease();
});

// 시작 화면 클릭 (버튼 영역 제외)
startScreen.addEventListener('click', (e) => {
    if (e.target.closest('.diff-btn') || e.target.closest('.character-select-btn') || e.target.closest('button')) return;
    handlePress();
});
startScreen.addEventListener('touchstart', (e) => {
    if (e.target.closest('.diff-btn') || e.target.closest('.character-select-btn') || e.target.closest('button')) return;
    e.preventDefault();
    handlePress();
});

// 키보드 입력
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (gameState === GameState.READY) {
            startGame();
        } else if (gameState === GameState.PLAYING) {
            isPressed = true;
        } else if (gameState === GameState.PAUSED) {
            resumeGame();
        }
    }
    // S키로 연습 모드 스킵
    if (e.code === 'KeyS' && practiceMode && gameState === GameState.PLAYING) {
        skipPractice();
    }
    // ESC로 일시정지/재개
    if (e.code === 'Escape') {
        if (gameState === GameState.PLAYING) {
            pauseGame();
        } else if (gameState === GameState.PAUSED) {
            resumeGame();
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        isPressed = false;
    }
});

// 재시작 버튼
restartBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    restartGame();
});

// 처음으로 버튼
homeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    goToHome();
});

// 일시정지 버튼
pauseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    pauseGame();
});

// 계속하기 버튼
resumeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    resumeGame();
});

// 일시정지 화면에서 처음으로
pauseHomeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    goToHome();
});

// 난이도 버튼 이벤트
document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const difficulty = btn.dataset.difficulty;
        startGame(difficulty);
    });
    btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const difficulty = btn.dataset.difficulty;
        startGame(difficulty);
    });
});

// 되살리기 버튼 이벤트
if (reviveBtn) {
    reviveBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        revive();
    });
}

// 캐릭터 선택 버튼 이벤트
if (characterBtn) {
    characterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        startScreen.classList.add('hidden');
        characterScreen.classList.remove('hidden');
        createCharacterGrid();
    });
}

// 캐릭터 선택 돌아가기 버튼
if (characterBackBtn) {
    characterBackBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        characterScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
    });
}

// 초기화
resetPlayer();
initClouds();
updateTokenDisplays();
updateCharacterPreview();
createCharacterGrid();
bestScoreEl.textContent = bestScore;
requestAnimationFrame(gameLoop);
