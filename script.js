(() => {
  const canvas = document.getElementById('board');
  const ctx = canvas.getContext('2d');

  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const overlay = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlayText = document.getElementById('overlayText');
  const playBtn = document.getElementById('playBtn');
  const levelButtonsWrap = document.getElementById('levelButtons');
  const lbList = document.getElementById('lbList');

  const GRID = 24;                      // клеток по стороне
  let cell = canvas.width / GRID;       // размер клетки в px (canvas — квадрат)

  // Скорость (мс между шагами) для уровней 1..5
  const LEVEL_SPEED = { 1: 150, 2: 120, 3: 95, 4: 75, 5: 58 };

  const STORAGE_BEST = 'snake_best_score';
  const STORAGE_BOARD = 'snake_leaderboard';

  let level = 1;
  let snake, dir, nextDir, food, score, best, timer, running, gameOver;

  // ---------- Инициализация ----------

  function init() {
    resizeCanvas();
    best = parseInt(localStorage.getItem(STORAGE_BEST) || '0', 10);
    bestEl.textContent = best;
    renderLeaderboard();
    resetState();
    draw();

    window.addEventListener('resize', () => { resizeCanvas(); draw(); });
  }

  function resizeCanvas() {
    // Держим канвас квадратным согласно CSS-размеру
    const rect = canvas.getBoundingClientRect();
    const size = Math.round(rect.width);
    canvas.width = size;
    canvas.height = size;
    cell = size / GRID;
  }

  function resetState() {
    const mid = Math.floor(GRID / 2);
    snake = [
      { x: mid - 1, y: mid },
      { x: mid - 2, y: mid },
      { x: mid - 3, y: mid }
    ];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    gameOver = false;
    scoreEl.textContent = score;
    placeFood();
  }

  function placeFood() {
    let pos;
    do {
      pos = {
        x: Math.floor(Math.random() * GRID),
        y: Math.floor(Math.random() * GRID)
      };
    } while (snake.some(s => s.x === pos.x && s.y === pos.y));
    food = pos;
  }

  // ---------- Игровой цикл ----------

  function start() {
    resetState();
    running = true;
    overlay.classList.add('hidden');
    clearInterval(timer);
    timer = setInterval(step, LEVEL_SPEED[level]);
  }

  function step() {
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // Столкновение со стеной
    if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
      return endGame();
    }
    // Столкновение с собой
    if (snake.some(s => s.x === head.x && s.y === head.y)) {
      return endGame();
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score += 10;
      scoreEl.textContent = score;
      placeFood();
    } else {
      snake.pop();
    }

    draw();
  }

  function endGame() {
    running = false;
    gameOver = true;
    clearInterval(timer);

    if (score > best) {
      best = score;
      localStorage.setItem(STORAGE_BEST, String(best));
      bestEl.textContent = best;
    }
    saveScore(score, level);
    renderLeaderboard();

    overlayTitle.textContent = 'Игра окончена';
    overlayText.textContent = `Счёт: ${score}. Попробуйте побить рекорд — ${best}.`;
    playBtn.textContent = 'Играть снова';
    overlay.classList.remove('hidden');
  }

  // ---------- Отрисовка ----------

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // сетка
    ctx.strokeStyle = '#f4f4f4';
    ctx.lineWidth = 1;
    for (let i = 1; i < GRID; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cell, 0);
      ctx.lineTo(i * cell, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cell);
      ctx.lineTo(canvas.width, i * cell);
      ctx.stroke();
    }

    // еда
    const pad = cell * 0.22;
    ctx.fillStyle = '#111111';
    roundRect(food.x * cell + pad, food.y * cell + pad, cell - pad * 2, cell - pad * 2, 4);
    ctx.fill();

    // змейка
    snake.forEach((s, i) => {
      const isHead = i === 0;
      ctx.fillStyle = isHead ? '#b81813' : '#e4231c';
      const p = isHead ? cell * 0.06 : cell * 0.12;
      roundRect(s.x * cell + p, s.y * cell + p, cell - p * 2, cell - p * 2, isHead ? 6 : 4);
      ctx.fill();
    });
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // ---------- Рекорды ----------

  function saveScore(value, lvl) {
    if (value <= 0) return;
    const list = JSON.parse(localStorage.getItem(STORAGE_BOARD) || '[]');
    list.push({ score: value, level: lvl, date: new Date().toLocaleDateString('ru-RU') });
    list.sort((a, b) => b.score - a.score);
    localStorage.setItem(STORAGE_BOARD, JSON.stringify(list.slice(0, 5)));
  }

  function renderLeaderboard() {
    const list = JSON.parse(localStorage.getItem(STORAGE_BOARD) || '[]');
    lbList.innerHTML = '';
    if (list.length === 0) {
      lbList.innerHTML = '<li class="lb-empty">Пока пусто — сыграйте первым</li>';
      return;
    }
    list.forEach((entry, i) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span><span class="lb-rank">${i + 1}</span>${entry.score} очков</span>
        <span class="lb-meta">ур. ${entry.level} · ${entry.date}</span>
      `;
      lbList.appendChild(li);
    });
  }

  // ---------- Управление: клавиатура ----------

  function setDir(x, y) {
    // запрет разворота на 180°
    if (dir.x === -x && dir.y === -y) return;
    nextDir = { x, y };
  }

  window.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowUp': case 'w': case 'W': case 'ц': case 'Ц':
        e.preventDefault(); setDir(0, -1); break;
      case 'ArrowDown': case 's': case 'S': case 'ы': case 'Ы':
        e.preventDefault(); setDir(0, 1); break;
      case 'ArrowLeft': case 'a': case 'A': case 'ф': case 'Ф':
        e.preventDefault(); setDir(-1, 0); break;
      case 'ArrowRight': case 'd': case 'D': case 'в': case 'В':
        e.preventDefault(); setDir(1, 0); break;
    }
  });

  // ---------- Управление: свайпы ----------

  let touchStart = null;

  canvas.addEventListener('touchstart', (e) => {
    const t = e.changedTouches[0];
    touchStart = { x: t.clientX, y: t.clientY };
  }, { passive: true });

  canvas.addEventListener('touchend', (e) => {
    if (!touchStart) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    const absX = Math.abs(dx), absY = Math.abs(dy);
    const THRESHOLD = 24;

    if (Math.max(absX, absY) < THRESHOLD) { touchStart = null; return; }

    if (absX > absY) {
      setDir(dx > 0 ? 1 : -1, 0);
    } else {
      setDir(0, dy > 0 ? 1 : -1);
    }
    touchStart = null;
  }, { passive: true });

  // ---------- Управление: кнопки на экране (мобильные) ----------

  document.getElementById('btnUp').addEventListener('click', () => setDir(0, -1));
  document.getElementById('btnDown').addEventListener('click', () => setDir(0, 1));
  document.getElementById('btnLeft').addEventListener('click', () => setDir(-1, 0));
  document.getElementById('btnRight').addEventListener('click', () => setDir(1, 0));

  // ---------- Уровни ----------

  levelButtonsWrap.addEventListener('click', (e) => {
    const btn = e.target.closest('.level-btn');
    if (!btn) return;
    level = parseInt(btn.dataset.level, 10);
    [...levelButtonsWrap.children].forEach(b => b.classList.toggle('active', b === btn));
  });
  // уровень 1 по умолчанию активен
  levelButtonsWrap.children[0].classList.add('active');

  // ---------- Кнопка "Играть" ----------

  playBtn.addEventListener('click', start);

  init();
})();
