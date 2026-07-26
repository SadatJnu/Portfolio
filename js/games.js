(function () {
  /* ================= Game 1: Sliding Puzzle (4x4, 15-puzzle) ================= */
  var board = document.getElementById('slideBoard');
  var movesEl = document.getElementById('slideMoves');
  var timeEl = document.getElementById('slideTime');
  var msgEl = document.getElementById('slideMsg');
  var shuffleBtn = document.getElementById('slideShuffle');
  var SIZE = 4;
  var tiles = [];       // tiles[index] = value (0 = empty), index 0..15 row-major
  var moves = 0, seconds = 0, timer = null, won = false;

  function fmtTime(s) {
    var m = Math.floor(s / 60), sec = s % 60;
    return (m < 10 ? '0' + m : m) + ':' + (sec < 10 ? '0' + sec : sec);
  }
  function startTimer() {
    clearInterval(timer);
    seconds = 0; timeEl.textContent = fmtTime(0);
    timer = setInterval(function () { seconds++; timeEl.textContent = fmtTime(seconds); }, 1000);
  }
  function isSolved() {
    for (var i = 0; i < 15; i++) if (tiles[i] !== i + 1) return false;
    return true;
  }
  function render() {
    board.innerHTML = '';
    tiles.forEach(function (val, idx) {
      var div = document.createElement('div');
      div.className = 'slide-tile' + (val === 0 ? ' empty' : '');
      div.textContent = val === 0 ? '' : val;
      div.addEventListener('click', function () { tryMove(idx); });
      board.appendChild(div);
    });
  }
  function emptyIndex() { return tiles.indexOf(0); }
  function tryMove(idx) {
    if (won) return;
    var empty = emptyIndex();
    var r1 = Math.floor(idx / SIZE), c1 = idx % SIZE;
    var r2 = Math.floor(empty / SIZE), c2 = empty % SIZE;
    var adjacent = (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1;
    if (!adjacent) return;
    tiles[empty] = tiles[idx]; tiles[idx] = 0;
    moves++; movesEl.textContent = moves;
    render();
    if (isSolved()) {
      won = true;
      clearInterval(timer);
      msgEl.textContent = 'Solved in ' + moves + ' moves — nice!';
      SFX.win();
    } else {
      SFX.move();
    }
  }
  function shuffle() {
    won = false; moves = 0; movesEl.textContent = 0; msgEl.textContent = '';
    tiles = []; for (var i = 1; i < 16; i++) tiles.push(i); tiles.push(0);
    // perform random valid slides from solved state so it's always solvable
    for (var s = 0; s < 400; s++) {
      var empty = emptyIndex();
      var r = Math.floor(empty / SIZE), c = empty % SIZE;
      var options = [];
      if (r > 0) options.push(empty - SIZE);
      if (r < SIZE - 1) options.push(empty + SIZE);
      if (c > 0) options.push(empty - 1);
      if (c < SIZE - 1) options.push(empty + 1);
      var pick = options[Math.floor(Math.random() * options.length)];
      tiles[empty] = tiles[pick]; tiles[pick] = 0;
    }
    render();
    startTimer();
  }
  if (board) { shuffleBtn.addEventListener('click', shuffle); shuffle(); }

  /* ================= Game 2 (new): Memory Match ================= */
  var memBoard = document.getElementById('memBoard');
  var memMovesEl = document.getElementById('memMoves');
  var memPairsEl = document.getElementById('memPairs');
  var memTimeEl = document.getElementById('memTime');
  var memMsgEl = document.getElementById('memMsg');
  var memRestartBtn = document.getElementById('memRestart');
  var ICONS = ['💻', '🚀', '⚙️', '☕', '🎯', '🧩', '📦', '🛰️'];
  var memMoves = 0, memPairs = 0, memSeconds = 0, memTimer = null;
  var flipped = [], lock = false;

  function memStartTimer() {
    clearInterval(memTimer);
    memSeconds = 0; memTimeEl.textContent = fmtTime(0);
    memTimer = setInterval(function () { memSeconds++; memTimeEl.textContent = fmtTime(memSeconds); }, 1000);
  }
  function shuffleArr(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }
  function buildMemory() {
    memMoves = 0; memPairs = 0; flipped = []; lock = false;
    memMovesEl.textContent = 0; memPairsEl.textContent = '0/8'; memMsgEl.textContent = '';
    var deck = shuffleArr(ICONS.concat(ICONS));
    memBoard.innerHTML = '';
    deck.forEach(function (icon, i) {
      var card = document.createElement('div');
      card.className = 'mem-card';
      card.dataset.icon = icon;
      card.dataset.i = i;
      card.innerHTML = '<div class="mem-inner"><div class="mem-face mem-front"></div><div class="mem-face mem-back">' + icon + '</div></div>';
      card.addEventListener('click', function () { flipCard(card); });
      memBoard.appendChild(card);
    });
    memStartTimer();
  }
  function flipCard(card) {
    if (lock || card.classList.contains('flip') || card.classList.contains('matched')) return;
    card.classList.add('flip');
    SFX.click();
    flipped.push(card);
    if (flipped.length === 2) {
      lock = true;
      memMoves++; memMovesEl.textContent = memMoves;
      var a = flipped[0], b = flipped[1];
      if (a.dataset.icon === b.dataset.icon) {
        a.classList.add('matched'); b.classList.add('matched');
        memPairs++; memPairsEl.textContent = memPairs + '/8';
        flipped = []; lock = false;
        if (memPairs === 8) {
          clearInterval(memTimer);
          memMsgEl.textContent = 'Cleared in ' + memMoves + ' moves — great memory!';
          SFX.win();
        } else {
          SFX.match();
        }
      } else {
        setTimeout(function () {
          a.classList.remove('flip'); b.classList.remove('flip');
          flipped = []; lock = false;
        }, 700);
        setTimeout(function () { SFX.tick(); }, 700);
      }
    }
  }
  if (memBoard) { memRestartBtn.addEventListener('click', buildMemory); buildMemory(); }

  /* ================= Game 3 (new): 2048 ================= */
  var g2048Board = document.getElementById('g2048Board');
  var g2048ScoreEl = document.getElementById('g2048Score');
  var g2048BestEl = document.getElementById('g2048Best');
  var g2048MsgEl = document.getElementById('g2048Msg');
  var g2048RestartBtn = document.getElementById('g2048Restart');
  var G2048_N = 4, G2048_CELL = 88; // 80px tile + 8px gap
  var grid2048 = [], score2048 = 0, best2048 = 0, over2048 = false, won2048 = false;

  function g2048Empty() {
    var out = [];
    for (var r = 0; r < G2048_N; r++) for (var c = 0; c < G2048_N; c++) if (!grid2048[r][c]) out.push([r, c]);
    return out;
  }
  function g2048Spawn() {
    var empties = g2048Empty();
    if (!empties.length) return;
    var cell = empties[Math.floor(Math.random() * empties.length)];
    grid2048[cell[0]][cell[1]] = Math.random() < 0.9 ? 2 : 4;
  }
  function g2048Render() {
    g2048Board.innerHTML = '';
    for (var r = 0; r < G2048_N; r++) for (var c = 0; c < G2048_N; c++) {
      var cellDiv = document.createElement('div');
      cellDiv.className = 'g2048-cell';
      cellDiv.style.top = (8 + r * G2048_CELL) + 'px';
      cellDiv.style.left = (8 + c * G2048_CELL) + 'px';
      g2048Board.appendChild(cellDiv);
    }
    for (var r2 = 0; r2 < G2048_N; r2++) for (var c2 = 0; c2 < G2048_N; c2++) {
      var v = grid2048[r2][c2];
      if (!v) continue;
      var t = document.createElement('div');
      t.className = 'g2048-tile';
      t.dataset.v = v >= 2048 ? '2048' : String(v);
      t.textContent = v;
      t.style.top = (8 + r2 * G2048_CELL) + 'px';
      t.style.left = (8 + c2 * G2048_CELL) + 'px';
      g2048Board.appendChild(t);
    }
    g2048ScoreEl.textContent = score2048;
    if (score2048 > best2048) { best2048 = score2048; localStorage.setItem('sa-2048-best', best2048); }
    g2048BestEl.textContent = best2048;
  }
  function g2048Slide(line) {
    var vals = line.filter(function (v) { return v; });
    var moved = vals.length !== line.filter(function (v, i) { return v !== undefined; }).length;
    var result = [];
    for (var i = 0; i < vals.length; i++) {
      if (i < vals.length - 1 && vals[i] === vals[i + 1]) {
        var merged = vals[i] * 2;
        result.push(merged);
        score2048 += merged;
        if (merged >= 2048) won2048 = true;
        i++;
        moved = true;
      } else {
        result.push(vals[i]);
      }
    }
    while (result.length < G2048_N) result.push(0);
    for (var j = 0; j < G2048_N; j++) if ((line[j] || 0) !== result[j]) moved = true;
    return { row: result, moved: moved };
  }
  function g2048Move(dir) {
    if (over2048) return;
    var changed = false;
    var scoreBefore = score2048;
    if (dir === 'left' || dir === 'right') {
      for (var r = 0; r < G2048_N; r++) {
        var row = grid2048[r].slice();
        if (dir === 'right') row.reverse();
        var res = g2048Slide(row);
        if (res.moved) changed = true;
        if (dir === 'right') res.row.reverse();
        grid2048[r] = res.row;
      }
    } else {
      for (var c = 0; c < G2048_N; c++) {
        var col = [];
        for (var r2 = 0; r2 < G2048_N; r2++) col.push(grid2048[r2][c]);
        if (dir === 'down') col.reverse();
        var res2 = g2048Slide(col);
        if (res2.moved) changed = true;
        if (dir === 'down') res2.row.reverse();
        for (var r3 = 0; r3 < G2048_N; r3++) grid2048[r3][c] = res2.row[r3];
      }
    }
    if (changed) {
      g2048Spawn();
      g2048Render();
      if (won2048) { g2048MsgEl.textContent = '2048 reached — you win! Keep going for a higher score.'; won2048 = false; SFX.win(); }
      else if (!g2048CanMove()) { over2048 = true; g2048MsgEl.textContent = 'Game over — no more moves. Final score ' + score2048; SFX.lose(); }
      else if (score2048 > scoreBefore) { SFX.pop(); }
      else { SFX.move(); }
    }
  }
  function g2048CanMove() {
    if (g2048Empty().length) return true;
    for (var r = 0; r < G2048_N; r++) for (var c = 0; c < G2048_N; c++) {
      var v = grid2048[r][c];
      if (c < G2048_N - 1 && grid2048[r][c + 1] === v) return true;
      if (r < G2048_N - 1 && grid2048[r + 1][c] === v) return true;
    }
    return false;
  }
  function g2048New() {
    grid2048 = []; for (var r = 0; r < G2048_N; r++) grid2048.push([0, 0, 0, 0]);
    score2048 = 0; over2048 = false; won2048 = false; g2048MsgEl.textContent = '';
    g2048Spawn(); g2048Spawn();
    g2048Render();
  }
  if (g2048Board) {
    best2048 = parseInt(localStorage.getItem('sa-2048-best') || '0', 10);
    g2048RestartBtn.addEventListener('click', g2048New);
    document.querySelectorAll('.dpad [data-dir]').forEach(function (b) {
      b.addEventListener('click', function () { g2048Move(b.dataset.dir); });
    });
    g2048Board.setAttribute('tabindex', '0');
    g2048Board.addEventListener('click', function () { g2048Board.focus(); });
    document.addEventListener('keydown', function (e) {
      var map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
      if (map[e.key] && g2048Board) { e.preventDefault(); g2048Move(map[e.key]); }
    });
    g2048New();
  }

  /* ================= Game 4 (new): Word Guess ================= */
  var wgBoard = document.getElementById('wgBoard');
  var wgKeyboard = document.getElementById('wgKeyboard');
  var wgTriesEl = document.getElementById('wgTries');
  var wgMsgEl = document.getElementById('wgMsg');
  var wgRestartBtn = document.getElementById('wgRestart');
  var WG_WORDS = ['REACT','CLOUD','QUERY','STACK','ARRAY','LOGIC','CODEC','ROUTE','FETCH','TOKEN',
    'DEBUG','BUILD','MERGE','BRANCH','INPUT','ADMIN','TABLE','FRAME','SCOPE','CACHE',
    'PROXY','ASYNC','CLASS','MODEL','LAYER','THEME','ALERT','FIELD','GRANT','TOOLS'].filter(function(w){return w.length===5;});
  var wgAnswer = '', wgRow = 0, wgCol = 0, wgOver = false;
  var WG_ROWS = 6, WG_COLS = 5;
  var KEY_ROWS = ['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'];

  function wgBuildBoard() {
    wgBoard.innerHTML = '';
    for (var r = 0; r < WG_ROWS; r++) {
      var rowDiv = document.createElement('div');
      rowDiv.className = 'wg-row';
      for (var c = 0; c < WG_COLS; c++) {
        var cell = document.createElement('div');
        cell.className = 'wg-cell';
        cell.id = 'wg-' + r + '-' + c;
        rowDiv.appendChild(cell);
      }
      wgBoard.appendChild(rowDiv);
    }
  }
  function wgBuildKeyboard() {
    wgKeyboard.innerHTML = '';
    KEY_ROWS.forEach(function (row, i) {
      var rowDiv = document.createElement('div');
      rowDiv.className = 'wg-krow';
      if (i === 2) rowDiv.appendChild(wgMakeKey('ENTER', true));
      row.split('').forEach(function (ch) { rowDiv.appendChild(wgMakeKey(ch)); });
      if (i === 2) rowDiv.appendChild(wgMakeKey('DEL', true));
      wgKeyboard.appendChild(rowDiv);
    });
  }
  function wgMakeKey(label, wide) {
    var b = document.createElement('button');
    b.className = 'wg-key' + (wide ? ' wide' : '');
    b.textContent = label;
    b.dataset.key = label;
    b.addEventListener('click', function () { wgHandleKey(label); });
    return b;
  }
  function wgHandleKey(key) {
    if (wgOver) return;
    if (key === 'DEL') {
      if (wgCol > 0) { wgCol--; wgSetCell(wgRow, wgCol, ''); SFX.tick(); }
      return;
    }
    if (key === 'ENTER') { wgSubmit(); return; }
    if (wgCol < WG_COLS) { wgSetCell(wgRow, wgCol, key); wgCol++; SFX.click(); }
  }
  function wgSetCell(r, c, letter) {
    var cell = document.getElementById('wg-' + r + '-' + c);
    cell.textContent = letter;
    cell.classList.toggle('filled', !!letter);
  }
  function wgSubmit() {
    if (wgCol < WG_COLS) { wgMsgEl.textContent = 'Not enough letters.'; return; }
    var guess = '';
    for (var c = 0; c < WG_COLS; c++) guess += document.getElementById('wg-' + wgRow + '-' + c).textContent;
    wgMsgEl.textContent = '';
    var answerLetters = wgAnswer.split('');
    var result = new Array(WG_COLS).fill('absent');
    var used = new Array(WG_COLS).fill(false);
    for (var i = 0; i < WG_COLS; i++) if (guess[i] === answerLetters[i]) { result[i] = 'correct'; used[i] = true; }
    for (var i2 = 0; i2 < WG_COLS; i2++) {
      if (result[i2] === 'correct') continue;
      for (var j = 0; j < WG_COLS; j++) {
        if (!used[j] && guess[i2] === answerLetters[j]) { result[i2] = 'present'; used[j] = true; break; }
      }
    }
    for (var c2 = 0; c2 < WG_COLS; c2++) {
      var cell = document.getElementById('wg-' + wgRow + '-' + c2);
      cell.classList.add(result[c2]);
      var keyBtn = wgKeyboard.querySelector('[data-key="' + guess[c2] + '"]');
      if (keyBtn) {
        var rank = { absent: 0, present: 1, correct: 2 };
        var cur = keyBtn.className.match(/correct|present|absent/);
        if (!cur || rank[result[c2]] > rank[cur[0]]) {
          keyBtn.classList.remove('correct', 'present', 'absent');
          keyBtn.classList.add(result[c2]);
        }
      }
    }
    wgRow++; wgCol = 0;
    wgTriesEl.textContent = wgRow + '/' + WG_ROWS;
    if (guess === wgAnswer) { wgOver = true; wgMsgEl.textContent = 'Correct — solved in ' + wgRow + '/' + WG_ROWS + '!'; SFX.win(); }
    else if (wgRow === WG_ROWS) { wgOver = true; wgMsgEl.textContent = 'Out of tries — the word was ' + wgAnswer + '.'; SFX.lose(); }
    else { SFX.select(); }
  }
  function wgNew() {
    wgAnswer = WG_WORDS[Math.floor(Math.random() * WG_WORDS.length)];
    wgRow = 0; wgCol = 0; wgOver = false; wgMsgEl.textContent = '';
    wgTriesEl.textContent = '0/' + WG_ROWS;
    wgBuildBoard(); wgBuildKeyboard();
  }
  if (wgBoard) {
    wgRestartBtn.addEventListener('click', wgNew);
    document.addEventListener('keydown', function (e) {
      if (!wgBoard || wgOver) return;
      if (e.key === 'Enter') { wgHandleKey('ENTER'); return; }
      if (e.key === 'Backspace') { wgHandleKey('DEL'); return; }
      var ch = e.key.toUpperCase();
      if (ch.length === 1 && ch >= 'A' && ch <= 'Z') wgHandleKey(ch);
    });
    wgNew();
  }

  /* ================= Game 5 (new): Snake ================= */
  var snakeCanvas = document.getElementById('snakeCanvas');
  if (snakeCanvas) {
    var sctx = snakeCanvas.getContext('2d');
    var SNAKE_N = 18, SNAKE_CELL = snakeCanvas.width / SNAKE_N;
    var snakeOverlay = document.getElementById('snakeOverlay');
    var snakeOverlayText = document.getElementById('snakeOverlayText');
    var snakeStartBtn = document.getElementById('snakeStart');
    var snakeScoreEl = document.getElementById('snakeScore');
    var snakeBestEl = document.getElementById('snakeBest');
    var snake, dir, nextDir, food, snakeScore, snakeBest, snakeLoop, snakeRunning;

    snakeBest = parseInt(localStorage.getItem('sa-snake-best') || '0', 10);
    snakeBestEl.textContent = snakeBest;

    function accentColor() { return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(); }
    function snakeRandomFood() {
      var occupied = snake.map(function (p) { return p[0] + ',' + p[1]; });
      var cell;
      do { cell = [Math.floor(Math.random() * SNAKE_N), Math.floor(Math.random() * SNAKE_N)]; }
      while (occupied.indexOf(cell[0] + ',' + cell[1]) !== -1);
      return cell;
    }
    function snakeReset() {
      snake = [[8, 9], [7, 9], [6, 9]];
      dir = 'right'; nextDir = 'right';
      food = snakeRandomFood();
      snakeScore = 0; snakeScoreEl.textContent = 0;
    }
    function snakeDraw() {
      sctx.clearRect(0, 0, snakeCanvas.width, snakeCanvas.height);
      sctx.fillStyle = accentColor();
      sctx.beginPath();
      sctx.arc(food[0] * SNAKE_CELL + SNAKE_CELL / 2, food[1] * SNAKE_CELL + SNAKE_CELL / 2, SNAKE_CELL / 2.6, 0, 7);
      sctx.fill();
      snake.forEach(function (p, i) {
        sctx.fillStyle = i === 0 ? accentColor() : 'color-mix(in srgb, ' + accentColor() + ' 55%, white)';
        sctx.globalAlpha = i === 0 ? 1 : .82;
        sctx.fillRect(p[0] * SNAKE_CELL + 1.5, p[1] * SNAKE_CELL + 1.5, SNAKE_CELL - 3, SNAKE_CELL - 3);
      });
      sctx.globalAlpha = 1;
    }
    function snakeStep() {
      dir = nextDir;
      var head = snake[0];
      var d = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dir];
      var next = [head[0] + d[0], head[1] + d[1]];
      if (next[0] < 0 || next[0] >= SNAKE_N || next[1] < 0 || next[1] >= SNAKE_N || snakeHits(next)) {
        return snakeGameOver();
      }
      snake.unshift(next);
      if (next[0] === food[0] && next[1] === food[1]) {
        snakeScore += 10; snakeScoreEl.textContent = snakeScore;
        food = snakeRandomFood();
        SFX.pop();
      } else {
        snake.pop();
      }
      snakeDraw();
    }
    function snakeHits(p) { return snake.some(function (s) { return s[0] === p[0] && s[1] === p[1]; }); }
    function snakeGameOver() {
      clearInterval(snakeLoop); snakeRunning = false;
      if (snakeScore > snakeBest) { snakeBest = snakeScore; localStorage.setItem('sa-snake-best', snakeBest); snakeBestEl.textContent = snakeBest; }
      snakeOverlayText.textContent = 'Game over — score ' + snakeScore;
      snakeStartBtn.textContent = 'Play Again';
      snakeOverlay.classList.add('show');
      SFX.lose();
    }
    function snakeStart() {
      snakeReset(); snakeDraw();
      snakeOverlay.classList.remove('show');
      snakeRunning = true;
      clearInterval(snakeLoop);
      snakeLoop = setInterval(snakeStep, 120);
    }
    snakeStartBtn.addEventListener('click', snakeStart);
    var SNAKE_OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };
    document.addEventListener('keydown', function (e) {
      if (!snakeRunning) return;
      var map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
      var d = map[e.key];
      if (d && SNAKE_OPP[d] !== dir) { nextDir = d; e.preventDefault(); }
    });
    var touchStart = null;
    snakeCanvas.addEventListener('touchstart', function (e) { touchStart = e.touches[0]; }, { passive: true });
    snakeCanvas.addEventListener('touchend', function (e) {
      if (!touchStart || !snakeRunning) return;
      var dx = e.changedTouches[0].clientX - touchStart.clientX;
      var dy = e.changedTouches[0].clientY - touchStart.clientY;
      var d = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      if (SNAKE_OPP[d] !== dir) nextDir = d;
    });
    snakeReset(); snakeDraw();
  }

  /* ================= Game 6 (new): Flappy Bird ================= */
  var flappyCanvas = document.getElementById('flappyCanvas');
  if (flappyCanvas) {
    var fctx = flappyCanvas.getContext('2d');
    var FW = flappyCanvas.width, FH = flappyCanvas.height;
    var flappyOverlay = document.getElementById('flappyOverlay');
    var flappyOverlayText = document.getElementById('flappyOverlayText');
    var flappyStartBtn = document.getElementById('flappyStart');
    var flappyScoreEl = document.getElementById('flappyScore');
    var flappyBestEl = document.getElementById('flappyBest');
    var flappyBest = parseInt(localStorage.getItem('sa-flappy-best') || '0', 10);
    flappyBestEl.textContent = flappyBest;

    var bird, pipes, flappyScore, flappyRunning, flappyLoop, frame;
    var GAP = 130, PIPE_W = 46, PIPE_SPEED = 2.4, GRAVITY = 0.42, FLAP = -7.2;

    function fAccent() { return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(); }
    function flappyReset() {
      bird = { x: 70, y: FH / 2, vy: 0, r: 13 };
      pipes = [{ x: FW + 40, gapY: 120 }];
      flappyScore = 0; flappyScoreEl.textContent = 0;
      frame = 0;
    }
    function flappyDraw() {
      fctx.clearRect(0, 0, FW, FH);
      fctx.fillStyle = fAccent();
      pipes.forEach(function (p) {
        fctx.globalAlpha = .85;
        fctx.fillRect(p.x, 0, PIPE_W, p.gapY);
        fctx.fillRect(p.x, p.gapY + GAP, PIPE_W, FH - (p.gapY + GAP));
      });
      fctx.globalAlpha = 1;
      fctx.beginPath();
      fctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2);
      fctx.fill();
      fctx.fillStyle = 'rgba(0,0,0,.35)';
      fctx.fillRect(0, FH - 4, FW, 4);
    }
    function flappyFlap() { if (flappyRunning) { bird.vy = FLAP; SFX.click(); } }
    function flappyStep() {
      frame++;
      bird.vy += GRAVITY; bird.y += bird.vy;
      if (frame % 90 === 0) pipes.push({ x: FW + 20, gapY: 40 + Math.random() * (FH - GAP - 80) });
      pipes.forEach(function (p) { p.x -= PIPE_SPEED; });
      if (pipes.length && pipes[0].x < -PIPE_W) pipes.shift();
      var lost = bird.y - bird.r < 0 || bird.y + bird.r > FH - 4;
      pipes.forEach(function (p) {
        if (bird.x + bird.r > p.x && bird.x - bird.r < p.x + PIPE_W) {
          if (bird.y - bird.r < p.gapY || bird.y + bird.r > p.gapY + GAP) lost = true;
        }
        if (!p.passed && p.x + PIPE_W < bird.x) { p.passed = true; flappyScore++; flappyScoreEl.textContent = flappyScore; SFX.pop(); }
      });
      flappyDraw();
      if (lost) flappyGameOver();
    }
    function flappyGameOver() {
      clearInterval(flappyLoop); flappyRunning = false;
      if (flappyScore > flappyBest) { flappyBest = flappyScore; localStorage.setItem('sa-flappy-best', flappyBest); flappyBestEl.textContent = flappyBest; }
      flappyOverlayText.textContent = 'Game over — score ' + flappyScore;
      flappyStartBtn.textContent = 'Play Again';
      flappyOverlay.classList.remove('hide');
      SFX.lose();
    }
    function flappyStart() {
      flappyReset(); flappyDraw();
      flappyOverlay.classList.add('hide');
      flappyRunning = true;
      clearInterval(flappyLoop);
      flappyLoop = setInterval(flappyStep, 20);
    }
    flappyStartBtn.addEventListener('click', flappyStart);
    flappyCanvas.addEventListener('click', flappyFlap);
    flappyCanvas.addEventListener('touchstart', function (e) { e.preventDefault(); flappyFlap(); }, { passive: false });
    document.addEventListener('keydown', function (e) { if (e.key === ' ' && flappyRunning) { e.preventDefault(); flappyFlap(); } });
    flappyReset(); flappyDraw();
  }

  /* ================= Game 7 (new): Tic-Tac-Toe vs AI ================= */
  var tttBoard = document.getElementById('tttBoard');
  if (tttBoard) {
    var tttWinsEl = document.getElementById('tttWins');
    var tttLossesEl = document.getElementById('tttLosses');
    var tttDrawsEl = document.getElementById('tttDraws');
    var tttMsgEl = document.getElementById('tttMsg');
    var tttRestartBtn = document.getElementById('tttRestart');
    var tttCells = [], tttState = [], tttOver = false;
    var tttStats = { w: 0, l: 0, d: 0 };
    var TTT_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

    function tttBuild() {
      tttBoard.innerHTML = '';
      tttCells = [];
      for (var i = 0; i < 9; i++) {
        var c = document.createElement('div');
        c.className = 'ttt-cell';
        c.dataset.i = i;
        c.addEventListener('click', function () { tttPlayerMove(parseInt(this.dataset.i, 10)); });
        tttBoard.appendChild(c);
        tttCells.push(c);
      }
    }
    function tttWinner(state) {
      for (var i = 0; i < TTT_LINES.length; i++) {
        var l = TTT_LINES[i];
        if (state[l[0]] && state[l[0]] === state[l[1]] && state[l[1]] === state[l[2]]) return { who: state[l[0]], line: l };
      }
      return null;
    }
    function tttEmpties(state) { var out = []; for (var i = 0; i < 9; i++) if (!state[i]) out.push(i); return out; }
    function tttBestMove() {
      // win if possible, else block, else center, else corner, else any
      var empties = tttEmpties(tttState);
      for (var i = 0; i < empties.length; i++) { var s = tttState.slice(); s[empties[i]] = 'O'; if (tttWinner(s)) return empties[i]; }
      for (var j = 0; j < empties.length; j++) { var s2 = tttState.slice(); s2[empties[j]] = 'X'; if (tttWinner(s2)) return empties[j]; }
      if (tttState[4] === '') return 4;
      var corners = [0, 2, 6, 8].filter(function (i) { return tttState[i] === ''; });
      if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
      return empties[Math.floor(Math.random() * empties.length)];
    }
    function tttRender(winLine) {
      tttCells.forEach(function (c, i) {
        c.textContent = tttState[i] || '';
        c.classList.toggle('x', tttState[i] === 'X');
        c.classList.toggle('o', tttState[i] === 'O');
        c.classList.toggle('filled', !!tttState[i]);
        c.classList.toggle('win', !!(winLine && winLine.indexOf(i) !== -1));
      });
    }
    function tttEndCheck() {
      var res = tttWinner(tttState);
      if (res) {
        tttOver = true;
        tttRender(res.line);
        if (res.who === 'X') { tttStats.w++; tttMsgEl.textContent = 'You win!'; SFX.win(); }
        else { tttStats.l++; tttMsgEl.textContent = 'Computer wins.'; SFX.lose(); }
        tttWinsEl.textContent = tttStats.w; tttLossesEl.textContent = tttStats.l; tttDrawsEl.textContent = tttStats.d;
        return true;
      }
      if (!tttEmpties(tttState).length) {
        tttOver = true; tttStats.d++; tttDrawsEl.textContent = tttStats.d; tttMsgEl.textContent = "It's a draw.";
        SFX.select();
        return true;
      }
      return false;
    }
    function tttPlayerMove(i) {
      if (tttOver || tttState[i]) return;
      tttState[i] = 'X'; tttRender(); SFX.click();
      if (tttEndCheck()) return;
      setTimeout(function () {
        var m = tttBestMove();
        tttState[m] = 'O'; tttRender(); SFX.select();
        tttEndCheck();
      }, 350);
    }
    function tttNew() {
      tttState = ['', '', '', '', '', '', '', '', '']; tttOver = false; tttMsgEl.textContent = '';
      tttBuild(); tttRender();
    }
    tttRestartBtn.addEventListener('click', tttNew);
    tttNew();
  }

  /* ================= Game 8 (new): Whack-a-Mole ================= */
  var wamBoard = document.getElementById('wamBoard');
  if (wamBoard) {
    var wamScoreEl = document.getElementById('wamScore');
    var wamBestEl = document.getElementById('wamBest');
    var wamTimeEl = document.getElementById('wamTime');
    var wamMsgEl = document.getElementById('wamMsg');
    var wamStartBtn = document.getElementById('wamStart');
    var wamHoles = [], wamScore = 0, wamBest = 0, wamRunning = false, wamPopTimer = null, wamCountdown = null, wamTimeLeft = 30;

    wamBest = parseInt(localStorage.getItem('sa-wam-best') || '0', 10);
    wamBestEl.textContent = wamBest;

    function wamBuild() {
      wamBoard.innerHTML = '';
      wamHoles = [];
      for (var i = 0; i < 9; i++) {
        var hole = document.createElement('div');
        hole.className = 'wam-hole';
        hole.innerHTML = '<div class="wam-mole">🐹</div>';
        hole.addEventListener('click', function () { wamWhack(this); });
        wamBoard.appendChild(hole);
        wamHoles.push(hole);
      }
    }
    function wamWhack(hole) {
      if (!wamRunning || !hole.classList.contains('up') || hole.classList.contains('hit')) return;
      hole.classList.add('hit');
      wamScore++; wamScoreEl.textContent = wamScore;
      SFX.hit();
      setTimeout(function () { hole.classList.remove('up', 'hit'); }, 120);
    }
    function wamPopRandom() {
      if (!wamRunning) return;
      var idle = wamHoles.filter(function (h) { return !h.classList.contains('up'); });
      if (idle.length) {
        var hole = idle[Math.floor(Math.random() * idle.length)];
        hole.classList.add('up');
        setTimeout(function () { hole.classList.remove('up'); }, 700 + Math.random() * 300);
      }
      wamPopTimer = setTimeout(wamPopRandom, 450 + Math.random() * 350);
    }
    function wamEnd() {
      wamRunning = false;
      clearTimeout(wamPopTimer);
      clearInterval(wamCountdown);
      wamHoles.forEach(function (h) { h.classList.remove('up', 'hit'); });
      if (wamScore > wamBest) { wamBest = wamScore; localStorage.setItem('sa-wam-best', wamBest); wamBestEl.textContent = wamBest; }
      wamMsgEl.textContent = "Time's up — final score " + wamScore + '.';
      wamStartBtn.textContent = 'Play Again';
      SFX.lose();
    }
    function wamStart() {
      wamScore = 0; wamScoreEl.textContent = 0; wamMsgEl.textContent = '';
      wamTimeLeft = 30; wamTimeEl.textContent = wamTimeLeft;
      wamRunning = true;
      wamPopRandom();
      wamCountdown = setInterval(function () {
        wamTimeLeft--; wamTimeEl.textContent = wamTimeLeft;
        if (wamTimeLeft <= 0) wamEnd();
      }, 1000);
    }
    wamBuild();
    wamStartBtn.addEventListener('click', wamStart);
  }

  /* ================= Game 9 (new): Bubble Shooter ================= */
  var bubbleCanvas = document.getElementById('bubbleCanvas');
  if (bubbleCanvas) {
    var bctx = bubbleCanvas.getContext('2d');
    var BW = bubbleCanvas.width, BH = bubbleCanvas.height;
    var B_D = 36, B_R = B_D / 2, B_COLS = 9, B_ROWS = 10; // 9*36=324=BW, 10*36=360 board height (100px left for cannon)
    var B_COLORS = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#a855f7'];
    var CANNON_X = BW / 2, CANNON_Y = BH - 45;
    var bubbleOverlay = document.getElementById('bubbleOverlay');
    var bubbleOverlayText = document.getElementById('bubbleOverlayText');
    var bubbleStartBtn = document.getElementById('bubbleStart');
    var bubbleScoreEl = document.getElementById('bubbleScore');
    var bubbleBestEl = document.getElementById('bubbleBest');
    var bubbleShotsEl = document.getElementById('bubbleShots');
    var bubbleBest = parseInt(localStorage.getItem('sa-bubble-best') || '0', 10);
    bubbleBestEl.textContent = bubbleBest;

    var bGrid, bScore, bShots, bRunning, bLoop, bFlying, bCurrentColor, bNextColor, bAimTheta, bPointer;

    function bCellXY(r, c) { return { x: c * B_D + B_R, y: r * B_D + B_R }; }
    function bNeighbors4(r, c) { return [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]; }
    function bColorsInGrid() {
      var set = {};
      for (var r = 0; r < B_ROWS; r++) for (var c = 0; c < B_COLS; c++) if (bGrid[r][c]) set[bGrid[r][c]] = true;
      var keys = Object.keys(set);
      return keys.length ? keys : B_COLORS;
    }
    function bRandomColor() { var pool = bColorsInGrid(); return pool[Math.floor(Math.random() * pool.length)]; }

    function bInitGrid() {
      bGrid = [];
      for (var r = 0; r < B_ROWS; r++) {
        var row = [];
        for (var c = 0; c < B_COLS; c++) row.push(r < 4 ? B_COLORS[Math.floor(Math.random() * B_COLORS.length)] : null);
        bGrid.push(row);
      }
    }

    function bDraw() {
      bctx.clearRect(0, 0, BW, BH);
      // danger line
      bctx.strokeStyle = 'rgba(239,68,68,.5)';
      bctx.setLineDash([6, 5]);
      bctx.beginPath();
      var dangerY = (B_ROWS - 1) * B_D;
      bctx.moveTo(0, dangerY); bctx.lineTo(BW, dangerY);
      bctx.stroke();
      bctx.setLineDash([]);
      // grid bubbles
      for (var r = 0; r < B_ROWS; r++) for (var c = 0; c < B_COLS; c++) {
        if (!bGrid[r][c]) continue;
        var p = bCellXY(r, c);
        bctx.beginPath(); bctx.arc(p.x, p.y, B_R - 2, 0, Math.PI * 2);
        bctx.fillStyle = bGrid[r][c]; bctx.fill();
        bctx.strokeStyle = 'rgba(0,0,0,.15)'; bctx.stroke();
      }
      // aim line + cannon
      if (bRunning && !bFlying) {
        bctx.strokeStyle = 'rgba(150,150,150,.4)';
        bctx.setLineDash([4, 6]);
        bctx.beginPath();
        bctx.moveTo(CANNON_X, CANNON_Y);
        bctx.lineTo(CANNON_X + Math.cos(bAimTheta) * 200, CANNON_Y + Math.sin(bAimTheta) * 200);
        bctx.stroke();
        bctx.setLineDash([]);
      }
      bctx.beginPath(); bctx.arc(CANNON_X, CANNON_Y, B_R - 1, 0, Math.PI * 2);
      bctx.fillStyle = bCurrentColor || '#999'; bctx.fill();
      bctx.strokeStyle = 'rgba(0,0,0,.2)'; bctx.stroke();
      if (bNextColor) {
        bctx.beginPath(); bctx.arc(CANNON_X + 46, CANNON_Y + 6, B_R - 8, 0, Math.PI * 2);
        bctx.fillStyle = bNextColor; bctx.fill();
      }
      if (bFlying) {
        bctx.beginPath(); bctx.arc(bFlying.x, bFlying.y, B_R - 2, 0, Math.PI * 2);
        bctx.fillStyle = bFlying.color; bctx.fill();
        bctx.strokeStyle = 'rgba(0,0,0,.15)'; bctx.stroke();
      }
    }

    function bNearestEmpty(row, col, x, y) {
      var visited = {}; visited[row + ',' + col] = true;
      var queue = [[row, col]], depth = 0;
      while (queue.length && depth <= B_ROWS + B_COLS) {
        var empties = [], nextQueue = [];
        queue.forEach(function (cell) {
          var r = cell[0], c = cell[1];
          if (r >= 0 && r < B_ROWS && c >= 0 && c < B_COLS && !bGrid[r][c]) empties.push([r, c]);
          bNeighbors4(r, c).forEach(function (n) {
            var key = n[0] + ',' + n[1];
            if (!visited[key] && n[0] >= 0 && n[0] < B_ROWS && n[1] >= 0 && n[1] < B_COLS) { visited[key] = true; nextQueue.push(n); }
          });
        });
        if (empties.length) {
          empties.sort(function (a, b) {
            var pa = bCellXY(a[0], a[1]), pb = bCellXY(b[0], b[1]);
            return (Math.pow(pa.x - x, 2) + Math.pow(pa.y - y, 2)) - (Math.pow(pb.x - x, 2) + Math.pow(pb.y - y, 2));
          });
          return empties[0];
        }
        queue = nextQueue; depth++;
      }
      return null;
    }
    function bFloodMatch(row, col, color) {
      var visited = {}; var stack = [[row, col]]; var group = [];
      while (stack.length) {
        var cell = stack.pop(); var key = cell[0] + ',' + cell[1];
        if (visited[key]) continue; visited[key] = true;
        var r = cell[0], c = cell[1];
        if (r < 0 || r >= B_ROWS || c < 0 || c >= B_COLS || bGrid[r][c] !== color) continue;
        group.push(cell);
        bNeighbors4(r, c).forEach(function (n) { stack.push(n); });
      }
      return group;
    }
    function bDropFloating() {
      var reachable = {};
      var stack = [];
      for (var c = 0; c < B_COLS; c++) if (bGrid[0][c]) stack.push([0, c]);
      while (stack.length) {
        var cell = stack.pop(); var key = cell[0] + ',' + cell[1];
        if (reachable[key]) continue;
        var r = cell[0], cc = cell[1];
        if (r < 0 || r >= B_ROWS || cc < 0 || cc >= B_COLS || !bGrid[r][cc]) continue;
        reachable[key] = true;
        bNeighbors4(r, cc).forEach(function (n) { stack.push(n); });
      }
      var dropped = 0;
      for (var r2 = 0; r2 < B_ROWS; r2++) for (var c2 = 0; c2 < B_COLS; c2++) {
        if (bGrid[r2][c2] && !reachable[r2 + ',' + c2]) { bGrid[r2][c2] = null; dropped++; }
      }
      return dropped;
    }
    function bIsEmpty() {
      for (var r = 0; r < B_ROWS; r++) for (var c = 0; c < B_COLS; c++) if (bGrid[r][c]) return false;
      return true;
    }
    function bEnd(won) {
      bRunning = false;
      clearInterval(bLoop);
      if (bScore > bubbleBest) { bubbleBest = bScore; localStorage.setItem('sa-bubble-best', bubbleBest); bubbleBestEl.textContent = bubbleBest; }
      bubbleOverlayText.textContent = won ? ('Board cleared — score ' + bScore + '!') : ('Game over — score ' + bScore + '.');
      bubbleStartBtn.textContent = 'Play Again';
      bubbleOverlay.classList.remove('hide');
      bDraw();
      if (won) SFX.win(); else SFX.lose();
    }
    function bSettle(row, col) {
      bGrid[row][col] = bFlying.color;
      var group = bFloodMatch(row, col, bFlying.color);
      if (group.length >= 3) {
        group.forEach(function (cell) { bGrid[cell[0]][cell[1]] = null; });
        bScore += group.length * 10;
        var dropped = bDropFloating();
        bScore += dropped * 5;
        bubbleScoreEl.textContent = bScore;
        SFX.pop(dropped > 0);
      } else {
        SFX.tick();
      }
      bFlying = null;
      if (bIsEmpty()) { bEnd(true); return; }
      for (var c = 0; c < B_COLS; c++) if (bGrid[B_ROWS - 1][c]) { bEnd(false); return; }
      bCurrentColor = bNextColor;
      bNextColor = bRandomColor();
    }
    function bStep() {
      if (bFlying) {
        bFlying.x += bFlying.vx; bFlying.y += bFlying.vy;
        if (bFlying.x - B_R < 0) { bFlying.x = B_R; bFlying.vx *= -1; SFX.bounce(); }
        if (bFlying.x + B_R > BW) { bFlying.x = BW - B_R; bFlying.vx *= -1; SFX.bounce(); }
        var landed = false, landRow = -1, landCol = -1;
        if (bFlying.y - B_R <= 0) {
          landed = true; landRow = 0;
          landCol = Math.max(0, Math.min(B_COLS - 1, Math.round((bFlying.x - B_R) / B_D)));
          if (bGrid[0][landCol]) { var alt = bNearestEmpty(0, landCol, bFlying.x, bFlying.y); if (alt) { landRow = alt[0]; landCol = alt[1]; } }
        } else {
          for (var r = 0; r < B_ROWS && !landed; r++) for (var c = 0; c < B_COLS && !landed; c++) {
            if (!bGrid[r][c]) continue;
            var p = bCellXY(r, c);
            var dist = Math.hypot(p.x - bFlying.x, p.y - bFlying.y);
            if (dist < B_D - 4) {
              var empty = bNearestEmpty(r, c, bFlying.x, bFlying.y);
              if (empty) { landed = true; landRow = empty[0]; landCol = empty[1]; }
              else { landed = true; landRow = -1; }
            }
          }
        }
        if (landed) { if (landRow >= 0) bSettle(landRow, landCol); else bEnd(false); }
      }
      bDraw();
    }
    function bPointerAngle(px, py) {
      var dx = px - CANNON_X, dy = py - CANNON_Y;
      if (dy >= -0.001) dy = -0.001; // force the shot into the upward hemisphere, keep left/right from dx
      var theta = Math.atan2(dy, dx);
      var lo = -Math.PI + 0.15, hi = -0.15;
      if (theta > hi) theta = hi;
      if (theta < lo) theta = lo;
      return theta;
    }
    function bUpdatePointer(clientX, clientY) {
      var rect = bubbleCanvas.getBoundingClientRect();
      var px = (clientX - rect.left) * (BW / rect.width);
      var py = (clientY - rect.top) * (BH / rect.height);
      bAimTheta = bPointerAngle(px, py);
    }
    function bFire() {
      if (!bRunning || bFlying) return;
      var speed = 9;
      bFlying = { x: CANNON_X, y: CANNON_Y, vx: Math.cos(bAimTheta) * speed, vy: Math.sin(bAimTheta) * speed, color: bCurrentColor };
      bShots++; bubbleShotsEl.textContent = bShots;
      SFX.click();
    }
    function bStart() {
      bInitGrid();
      bScore = 0; bShots = 0; bFlying = null; bAimTheta = -Math.PI / 2;
      bCurrentColor = bRandomColor(); bNextColor = bRandomColor();
      bubbleScoreEl.textContent = 0; bubbleShotsEl.textContent = 0;
      bRunning = true;
      bubbleOverlay.classList.add('hide');
      clearInterval(bLoop);
      bLoop = setInterval(bStep, 16);
      bDraw();
    }
    bubbleStartBtn.addEventListener('click', bStart);
    bubbleCanvas.addEventListener('mousemove', function (e) { bUpdatePointer(e.clientX, e.clientY); });
    bubbleCanvas.addEventListener('click', function (e) { bUpdatePointer(e.clientX, e.clientY); bFire(); });
    bubbleCanvas.addEventListener('touchmove', function (e) { e.preventDefault(); bUpdatePointer(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
    bubbleCanvas.addEventListener('touchstart', function (e) { bUpdatePointer(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    bubbleCanvas.addEventListener('touchend', function (e) { e.preventDefault(); bFire(); }, { passive: false });
    document.addEventListener('keydown', function (e) { if (e.key === ' ' && bRunning) { e.preventDefault(); bFire(); } });
    bInitGrid(); bAimTheta = -Math.PI / 2; bDraw();
  }
})();
