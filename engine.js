// =======================================
// ENGINE — 무당기(巫堂記) 게임 엔진
// =======================================

let state = {
  phase: 'title',
  char: 'maehyang',
  scenes: null,
  sceneId: 's0',
  ep: 1,
  trust: {},          // 인물별 인연 수치
  mindam: [],         // 획득한 민담 ID 배열
  singi: 0,           // 신기 (기존 coin)
  items: [],          // 획득 아이템 키 배열
  skills: [],         // 해금된 스킬 ID 배열
  deityYeonin: {},    // 신위별 인연 (기존 constellationTrust)
  deitySponsored: {}, // 신위별 신기 수령 총액
  flags: {},          // 씬 플래그 (dealMade, shinnul 등)
  sacrificeCount: 0,  // 희생 태그 횟수
  acceptCount: 0,     // 수용 태그 횟수
  resistCount: 0,     // 저항 태그 횟수
  truthCount: 0,      // 진실/직관 태그 횟수
  dispTxt: '',
  typing: false,
  choicesOn: false,
  lastClear: null,
  shopHintActive: false,
};
let typingTimer = null;
let constTimer = null;
let currentTab = 'inventory';

function resetTrust() {
  const t = {};
  Object.keys(TRUST_TARGETS).forEach(k => t[k] = 0);
  return t;
}

function resetDeityYeonin() {
  const y = {}, s = {};
  Object.keys(DEITIES).forEach(k => { y[k] = 0; s[k] = 0; });
  return {yeonin: y, sponsored: s};
}

function getDefaultSkills(charId) {
  return (SKILLS[charId] || []).filter(s => !s.locked).map(s => s.id);
}

// --- SAVE/LOAD ---
function getSaveData() {
  try { return JSON.parse(localStorage.getItem('mudanggi_save') || '{}'); } catch(e) { return {}; }
}
function setSaveData(d) {
  try { localStorage.setItem('mudanggi_save', JSON.stringify(d)); } catch(e) {}
}

// --- MODAL ---
function openModal(tab) {
  currentTab = tab || 'inventory';
  renderModalTabs();
  renderModalContent();
  document.getElementById('modal-overlay').style.display = 'flex';
}
function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
}

// --- INIT ---
function init() {
  buildStars();
  buildCharCards();
  showScreen('title');

  document.getElementById('start-btn').onclick = startGame;
  document.getElementById('retry-btn').onclick = () => {
    showScreen('title');
    buildCharCards();
  };
  document.getElementById('next-ep-btn').onclick = continueNextEp;
  document.getElementById('menu-btn').onclick = () => openModal('inventory');
  document.getElementById('modal-close-btn').onclick = closeModal;
  document.getElementById('modal-overlay').onclick = (e) => {
    if (e.target.id === 'modal-overlay') closeModal();
  };
}

function buildStars() {
  const layer = document.getElementById('stars-layer');
  layer.innerHTML = '';
  for (let i = 0; i < 28; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const sz = Math.random() * 2 + 0.5;
    s.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${Math.random()*5}s;animation-duration:${2+Math.random()*5}s;opacity:0.12`;
    layer.appendChild(s);
  }
}

function buildCharCards() {
  const wrap = document.getElementById('char-cards');
  wrap.innerHTML = '';
  const save = getSaveData();
  Object.entries(CHARS).forEach(([id, ch]) => {
    const card = document.createElement('div');
    card.className = 'char-card' + (id === state.char ? ' selected' : '');
    card.dataset.id = id;
    const completed = save[id] && save[id].completed;
    card.innerHTML = `
      <div style="font-size:28px;margin-bottom:8px">${ch.illus}</div>
      <div class="char-card-name" style="color:${ch.col}">${ch.name}</div>
      <div class="char-card-desc">${ch.desc}</div>
      ${completed ? '<div class="char-badge">CLEAR</div>' : ''}
    `;
    card.onclick = () => {
      document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.char = id;
    };
    wrap.appendChild(card);
  });
}

function showScreen(screen) {
  document.getElementById('title-screen').style.display = screen === 'title' ? 'flex' : 'none';
  document.getElementById('game-screen').style.display  = screen === 'game'  ? 'flex' : 'none';
  document.getElementById('clear-screen').style.display = screen === 'clear' ? 'flex' : 'none';
}

// --- GAME START ---
function startGame() {
  state.scenes = ALL_SCENES[state.char];
  state.sceneId = 's0';
  state.ep = 1;
  state.trust = resetTrust();
  state.mindam = [];
  state.singi = 0;
  state.items = [];
  state.skills = getDefaultSkills(state.char);
  const dData = resetDeityYeonin();
  state.deityYeonin = dData.yeonin;
  state.deitySponsored = dData.sponsored;
  state.flags = {};
  state.sacrificeCount = 0;
  state.acceptCount = 0;
  state.resistCount = 0;
  state.truthCount = 0;
  state.phase = 'game';
  state.lastClear = null;
  state.shopHintActive = false;
  showScreen('game');
  updateEpInfo();
  loadScene('s0');
}

function continueNextEp() {
  if (!state.lastClear || !state.lastClear.next) return;
  state.ep++;
  state.phase = 'game';
  showScreen('game');
  updateEpInfo();
  loadScene(state.lastClear.next);
}

function updateEpInfo() {
  document.getElementById('ep-info').textContent = '1막 · ' + (state.ep > 1 ? state.ep + '씬' : '귀가');
}

// --- LOAD SCENE ---
function loadScene(id) {
  if (typingTimer) { clearInterval(typingTimer); typingTimer = null; }
  state.sceneId = id;
  state.dispTxt = '';
  state.typing = true;
  state.choicesOn = false;

  const sc = state.scenes[id];
  if (!sc) { console.warn('씬 없음:', id); return; }

  // 화자
  const nameEl = document.getElementById('speaker-name');
  const spInfo = SPEAKER_MAP[sc.sp] || SPEAKER_MAP.narrator;
  if (spInfo.name) {
    nameEl.textContent = sc.sp === 'system' ? `【 ${spInfo.name} 】` : spInfo.name;
    nameEl.style.display = 'inline-flex';
    nameEl.style.color = spInfo.col;
    nameEl.style.borderColor = spInfo.col + '55';
  } else {
    nameEl.style.display = 'none';
  }

  document.getElementById('scene-illus').textContent = sc.illus || '🕯️';
  document.getElementById('bg-overlay').className = 'bg-overlay bg-' + (sc.bg || 'dark');

  const dtEl = document.getElementById('dialog-text');
  dtEl.style.fontFamily = "'Noto Serif KR',serif";
  dtEl.style.color = '#e0dbd2';

  const cw = document.getElementById('choices-wrap');
  cw.style.display = 'none';
  cw.innerHTML = '';

  // 타이핑
  document.getElementById('skip-hint').style.opacity = '1';
  const full = sc.txt;
  let i = 0;
  typingTimer = setInterval(() => {
    i++;
    state.dispTxt = full.slice(0, i);
    renderText();
    if (i >= full.length) {
      clearInterval(typingTimer); typingTimer = null;
      state.typing = false;
      state.choicesOn = true;
      document.getElementById('skip-hint').style.opacity = '0';
      showChoices();
    }
  }, 28);

  updateHUD();
  maybeShowDeity();
}

function renderText() {
  const el = document.getElementById('dialog-text');
  const lines = state.dispTxt.split('\n');
  let html = lines.map((l, idx) => l + (idx < lines.length - 1 ? '<br>' : '')).join('');
  if (state.typing) html += '<span id="cursor-blink">|</span>';
  el.innerHTML = html;
}

function skipTyping() {
  if (!state.typing) return;
  if (typingTimer) { clearInterval(typingTimer); typingTimer = null; }
  const sc = state.scenes[state.sceneId];
  state.dispTxt = sc.txt;
  state.typing = false;
  state.choicesOn = true;
  document.getElementById('skip-hint').style.opacity = '0';
  renderText();
  showChoices();
}

// --- CHOICES ---
function showChoices() {
  const sc = state.scenes[state.sceneId];
  if (!sc || !sc.ch || sc.ch.length === 0) return;
  const cw = document.getElementById('choices-wrap');
  cw.innerHTML = '';

  sc.ch.forEach((c, i) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.style.animationDelay = `${i * 0.07}s`;

    const lockedCost = c.locked || 0;
    const canAfford = lockedCost === 0 || state.singi >= lockedCost;

    let prefix = lockedCost > 0
      ? `<span class="choice-arrow ${canAfford ? 'locked-afford' : 'locked-broke'}">🔒</span>`
      : `<span class="choice-arrow">▷</span>`;

    let suffix = '';
    if (lockedCost > 0) {
      suffix = `<span class="choice-fx choice-lock-cost ${canAfford ? '' : 'broke'}">신기 ${lockedCost}</span>`;
    } else if (c.hint) {
      suffix = `<span class="choice-fx">${c.hint}</span>`;
    }

    btn.innerHTML = `${prefix}${c.t}${suffix}`;

    if (!canAfford) {
      btn.disabled = true;
      btn.classList.add('choice-locked-disabled');
    } else {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleChoice(c);
      });
    }
    cw.appendChild(btn);
  });
  cw.style.display = 'flex';
}

// --- HANDLE CHOICE ---
function handleChoice(choice) {
  const f = choice.fx || {};

  // 신기 잠금 소모
  if (choice.locked && choice.locked > 0) {
    state.singi = Math.max(0, state.singi - choice.locked);
  }

  // 인물별 인연 변화
  if (f.trust && typeof f.trust === 'object') {
    Object.entries(f.trust).forEach(([key, val]) => {
      if (state.trust[key] !== undefined) {
        state.trust[key] = Math.min(100, Math.max(0, state.trust[key] + val));
      }
    });
  }
  // trust2 (보조 인연 — 일부 씬에서 두 인물 동시 처리용)
  if (f.trust2 && typeof f.trust2 === 'object') {
    Object.entries(f.trust2).forEach(([key, val]) => {
      if (state.trust[key] !== undefined) {
        state.trust[key] = Math.min(100, Math.max(0, state.trust[key] + val));
      }
    });
  }

  // 신기 변화
  if (f.singi) {
    state.singi = Math.max(0, state.singi + f.singi);
  }

  // 신위 인연 변화
  if (f.deity && typeof f.deity === 'object') {
    Object.entries(f.deity).forEach(([key, val]) => {
      if (state.deityYeonin[key] !== undefined) {
        state.deityYeonin[key] = Math.min(100, Math.max(0, state.deityYeonin[key] + val));
      }
    });
  }

  // 아이템
  if (f.item && !state.items.includes(f.item)) {
    state.items.push(f.item);
    showItemPopup(f.item);
  }

  // 민담 즉시 획득
  if (f.mindam && !state.mindam.includes(f.mindam)) {
    state.mindam.push(f.mindam);
    const def = MINDAM_DEFS[f.mindam];
    if (def) showMindamPopup(def);
  }

  // 플래그
  if (f.flag && typeof f.flag === 'object') {
    Object.assign(state.flags, f.flag);
  }

  // 태그 기반 카운터
  const tags = f.tags || [];
  if (tags.includes('희생') || tags.includes('보호')) state.sacrificeCount++;
  if (tags.includes('수용')) state.acceptCount++;
  if (tags.includes('저항')) state.resistCount++;
  if (tags.includes('진실') || tags.includes('직관')) state.truthCount++;

  // 신위 매칭 신기 후원
  if (tags.length > 0) processDeityResponse(tags);

  // 민담 조건 자동 체크
  checkMindamConditions();

  updateHUD();

  const next = state.scenes[choice.n];
  if (next && next.clr) {
    goToClear(choice.n, next);
  } else if (next) {
    loadScene(choice.n);
  } else {
    console.warn('다음 씬 없음:', choice.n);
  }
}

// --- DEITY RESPONSE ---
function processDeityResponse(tags) {
  let bestKey = null;
  let bestScore = 0;

  Object.entries(DEITIES).forEach(([key, d]) => {
    let score = 0;
    tags.forEach(tag => {
      if (d.likes && d.likes.includes(tag)) score += 1;
      if (d.dislikes && d.dislikes.includes(tag)) score -= 1;
    });
    if (score > bestScore) { bestScore = score; bestKey = key; }
  });

  if (!bestKey || bestScore <= 0) return;

  const singiReward = Math.floor(Math.random() * 8 + 3) * bestScore;
  state.singi += singiReward;
  state.deityYeonin[bestKey] = Math.min(100, (state.deityYeonin[bestKey] || 0) + 2 * bestScore);
  state.deitySponsored[bestKey] = (state.deitySponsored[bestKey] || 0) + singiReward;

  const d = DEITIES[bestKey];
  const yeonin = state.deityYeonin[bestKey];

  // 인연 30+ → 스킬 힌트
  if (yeonin >= 30 && yeonin < 35) {
    showDeityPopup(`${d.icon} 【${d.name}】이 인연 30에 도달했습니다.\n숨겨진 선택지가 열릴 수 있습니다.`, singiReward, yeonin);
    checkDeitySkillUnlock(bestKey);
  } else if (Math.random() < 0.35) {
    showDeityPopup(`${d.icon} 【${d.name}】이 주목합니다. +${singiReward} 신기`, singiReward, yeonin);
  }

  updateHUD();
}

function checkDeitySkillUnlock(deityKey) {
  const unlockMap = { chilsung: 'contract', gumiho: 'mindam_eye' };
  const skillId = unlockMap[deityKey];
  if (skillId && !state.skills.includes(skillId)) {
    state.skills.push(skillId);
  }
}

// --- MINDAM CHECK ---
function checkMindamConditions() {
  const checks = [
    { id:'bari',      condition: () => state.sacrificeCount >= 2 },
    { id:'shimchung', condition: () => state.acceptCount >= 3 },
    { id:'gumiho_s',  condition: () => state.truthCount >= 3 },
  ];
  checks.forEach(({ id, condition }) => {
    if (!state.mindam.includes(id) && condition()) {
      state.mindam.push(id);
      const def = MINDAM_DEFS[id];
      if (def) showMindamPopup(def);
    }
  });
  // mindam_eye 스킬 해금
  if (state.mindam.length >= 3 && !state.skills.includes('mindam_eye')) {
    state.skills.push('mindam_eye');
  }
}

// --- POPUPS ---
function showDeityPopup(msg, singi, yeonin) {
  const popup = document.getElementById('constellation-popup');
  document.getElementById('const-msg').textContent = msg;
  document.getElementById('const-coin').textContent = singi > 0 ? `+${singi} 신기` : '';
  document.getElementById('const-coin').style.display = singi > 0 ? 'block' : 'none';
  document.getElementById('const-favor').textContent = `인연: ${yeonin}`;
  popup.classList.remove('hiding');
  popup.style.display = 'block';
  if (constTimer) clearTimeout(constTimer);
  constTimer = setTimeout(() => {
    popup.classList.add('hiding');
    setTimeout(() => { popup.style.display = 'none'; popup.classList.remove('hiding'); }, 300);
  }, 3000);
}

function showMindamPopup(def) {
  const popup = document.getElementById('seolhwa-popup');
  document.getElementById('seolhwa-popup-icon').textContent = def.icon;
  document.getElementById('seolhwa-popup-name').textContent = def.name;
  document.getElementById('seolhwa-popup-desc').textContent = def.desc;
  popup.style.display = 'flex';
  setTimeout(() => { popup.style.display = 'none'; }, 3500);
}

function showItemPopup(itemKey) {
  const item = ITEMS[itemKey];
  if (!item) return;
  const popup = document.getElementById('constellation-popup');
  document.getElementById('const-msg').textContent = `${item.icon} ${item.name} 획득!`;
  document.getElementById('const-coin').textContent = item.desc;
  document.getElementById('const-coin').style.display = 'block';
  document.getElementById('const-favor').textContent = '';
  popup.classList.remove('hiding');
  popup.style.display = 'block';
  if (constTimer) clearTimeout(constTimer);
  constTimer = setTimeout(() => {
    popup.classList.add('hiding');
    setTimeout(() => { popup.style.display = 'none'; popup.classList.remove('hiding'); }, 300);
  }, 2500);
}

function maybeShowDeity() {
  if (Math.random() > 0.15) return;
  const keys = Object.keys(DEITIES);
  const key = keys[Math.floor(Math.random() * keys.length)];
  const d = DEITIES[key];
  const yeonin = state.deityYeonin[key] || 0;
  if (yeonin < 2) return; // 인연 없는 신은 반응 안 함
  const msgs = [
    `${d.icon} 【${d.name}】이 당신을 지켜보고 있습니다.`,
    `${d.icon} 【${d.name}】이 고개를 끄덕입니다.`,
    `신들이 술렁입니다.`,
  ];
  showDeityPopup(msgs[Math.floor(Math.random() * msgs.length)], 0, yeonin);
}

// --- CLEAR / ENDING ---
function goToClear(id, sc) {
  if (typingTimer) { clearInterval(typingTimer); typingTimer = null; }
  if (constTimer) { clearTimeout(constTimer); constTimer = null; }

  state.lastClear = sc;

  // 인연 최고치
  const maxTrust = Object.values(state.trust).length > 0
    ? Math.max(...Object.values(state.trust))
    : 0;

  // EP.1 클리어 저장
  if (sc.ep === 1) {
    const save = getSaveData();
    const endingKey = sc.ending || 'unknown';
    if (!save[state.char]) save[state.char] = {};
    save[state.char].lastEnding = endingKey;
    save[state.char].completed = true;
    save[state.char].maxTrust = maxTrust;
    setSaveData(save);
  }

  // 클리어 화면 렌더
  document.getElementById('final-trust').textContent = maxTrust;
  document.getElementById('final-seolhwa').textContent = state.mindam.length;
  document.getElementById('final-coin').textContent = state.singi;
  document.getElementById('clear-msg').textContent = sc.txt;

  const badge = document.getElementById('ending-badge');
  badge.textContent = sc.badge || '';
  badge.style.background = (sc.col || '#c084fc') + '22';
  badge.style.color = sc.col || '#c084fc';
  badge.style.border = '1px solid ' + (sc.col || '#c084fc') + '66';
  document.getElementById('clear-title').textContent = sc.ending || '클리어!';
  document.getElementById('clear-ep-label').textContent = sc.ep ? `1막 ${sc.ep}씬` : '1막';
  document.getElementById('clear-star').textContent = sc.badge === '진 루트 씨앗' ? '★' : '◈';

  const nextBtn = document.getElementById('next-ep-btn');
  nextBtn.style.display = sc.next ? 'inline-block' : 'none';
  if (sc.next) nextBtn.textContent = '2막으로 ▶';

  showScreen('clear');
}

// --- HUD ---
function updateHUD() {
  const sc = state.scenes ? state.scenes[state.sceneId] : null;
  const hudTrust = document.getElementById('hud-trust-pills');
  hudTrust.innerHTML = '';

  const spToTrust = {
    mother: 'mother', neighbor: 'neighbor', woman: 'woman', child: 'child',
  };
  const keys = [];
  if (sc && spToTrust[sc.sp]) keys.push(spToTrust[sc.sp]);
  const sorted = Object.entries(state.trust)
    .filter(([k]) => !keys.includes(k) && state.trust[k] > 0)
    .sort((a, b) => b[1] - a[1]);
  sorted.forEach(([k]) => keys.push(k));

  keys.slice(0, 2).forEach(key => {
    const t = TRUST_TARGETS[key];
    if (!t) return;
    const val = state.trust[key] || 0;
    const pill = document.createElement('div');
    pill.className = 'stat-pill';
    pill.innerHTML = `
      <span style="color:${t.col};font-size:10px">${t.icon}</span>
      <div class="stat-track"><div class="stat-fill" style="width:${val}%;background:${t.col}"></div></div>
      <span style="color:${t.col};font-size:10px">${val}</span>
    `;
    hudTrust.appendChild(pill);
  });

  document.getElementById('val-seolhwa').textContent = '📜 ' + state.mindam.length;
  document.getElementById('val-coin').textContent = '🔮 ' + state.singi;
}

window.skipTyping = skipTyping;
init();
