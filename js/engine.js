// =======================================
// ENGINE — 게임 상태, 로직, HUD
// =======================================

// --- STATE ---
let state = {
  phase: 'title',
  char: 'dokja',
  scenes: null,
  sceneId: 's0',
  ep: 1,
  trust: {},       // 인물별 신뢰도
  seolhwa: [],     // 획득한 설화 ID 배열
  coin: 100,
  items: [],       // 획득 아이템 키 배열
  skills: [],      // 해금된 스킬 ID 배열
  constellationTrust: {},  // 성좌별 호감도
  constellationSponsored: {}, // 성좌별 후원 총액
  solitaryCount: 0,
  sacrificeCount: 0,
  fourthWallCount: 0,
  storyChoiceCount: 0,  // 서사/이야기 태그 선택 횟수
  dispTxt: '',
  typing: false,
  choicesOn: false,
  lastClear: null,
  shopHintActive: false,
};
let typingTimer = null;
let constTimer = null;

function resetTrust() {
  const t = {};
  Object.keys(TRUST_TARGETS).forEach(k => t[k] = 0);
  return t;
}

function resetConstellationTrust() {
  const t = {}, s = {};
  Object.keys(CONSTELLATIONS).forEach(k => { t[k] = 0; s[k] = 0; });
  return {trust: t, sponsored: s};
}

function getDefaultSkills(charId) {
  const charSkills = SKILLS[charId] || [];
  return charSkills.filter(s => !s.locked).map(s => s.id);
}

// --- SAVE/LOAD ---
function getSaveData() {
  try { return JSON.parse(localStorage.getItem('orv_save') || '{}'); } catch(e) { return {}; }
}
function setSaveData(d) {
  try { localStorage.setItem('orv_save', JSON.stringify(d)); } catch(e) {}
}

// --- INIT ---
function init() {
  buildStars();
  buildCharCards();
  showScreen('title');
  checkTrueEndHint();

  document.getElementById('start-btn').onclick = startGame;
  document.getElementById('retry-btn').onclick = () => {
    showScreen('title');
    checkTrueEndHint();
    buildCharCards();
  };
  document.getElementById('next-ep-btn').onclick = continueNextEp;

  // 메뉴 버튼
  document.getElementById('menu-btn').onclick = () => openModal('inventory');

  // 모달 닫기
  document.getElementById('modal-close-btn').onclick = closeModal;
  document.getElementById('modal-overlay').onclick = (e) => {
    if (e.target.id === 'modal-overlay') closeModal();
  };
}

function buildStars() {
  const layer = document.getElementById('stars-layer');
  layer.innerHTML = '';
  for (let i = 0; i < 24; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const sz = Math.random() * 2.5 + 0.5;
    s.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${Math.random()*4}s;animation-duration:${2+Math.random()*4}s;opacity:0.15`;
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

function checkTrueEndHint() {
  const save = getSaveData();
  const hint = document.getElementById('true-end-hint');
  const chars = Object.keys(CHARS);
  const cleared = chars.filter(c => save[c] && save[c].completed && save[c].maxTrust >= 70).length;
  if (cleared >= chars.length) {
    hint.style.display = 'block';
    hint.textContent = '★ 진 엔딩 해금! 아무 캐릭터로 시작하세요 ★';
    hint.style.color = '#fcd34d';
  } else if (cleared > 0) {
    hint.style.display = 'block';
    hint.textContent = `진 엔딩 조건: ${cleared}/${chars.length} 캐릭터 클리어 (최고 신뢰도 70+)`;
  } else {
    hint.style.display = 'none';
  }
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
  state.seolhwa = [];
  state.coin = 100;
  state.items = [];
  state.skills = getDefaultSkills(state.char);
  const cData = resetConstellationTrust();
  state.constellationTrust = cData.trust;
  state.constellationSponsored = cData.sponsored;
  state.solitaryCount = 0;
  state.sacrificeCount = 0;
  state.fourthWallCount = 0;
  state.storyChoiceCount = 0;
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
  document.getElementById('ep-info').textContent = 'EP.' + state.ep;
  document.getElementById('footer-bar').textContent = `전지적 독자시점 팬게임 . EP.${state.ep} . 원작: 싱숑`;
}

// --- LOAD SCENE ---
function loadScene(id) {
  if (typingTimer) { clearInterval(typingTimer); typingTimer = null; }
  state.sceneId = id;
  state.dispTxt = '';
  state.typing = true;
  state.choicesOn = false;

  const sc = state.scenes[id];
  if (!sc) return;

  // Speaker
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

  // Scene illus & bg
  document.getElementById('scene-illus').textContent = sc.illus || '📖';
  document.getElementById('bg-overlay').className = 'bg-overlay bg-' + (sc.bg || 'dark');

  const isSystem = sc.sp === 'system';
  const dtEl = document.getElementById('dialog-text');
  dtEl.style.fontFamily = isSystem ? "'Courier New',monospace" : "'Noto Serif KR',serif";
  dtEl.style.color = isSystem ? '#22d3ee' : '#e0dbd2';

  // Hide choices
  const cw = document.getElementById('choices-wrap');
  cw.style.display = 'none';
  cw.innerHTML = '';

  // Typing
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
  }, 26);

  updateHUD();
  maybeShowConstellation();
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

    // 힌트 텍스트 생성
    let hintText = c.hint || '';
    // 상점 힌트 활성 시 추가 정보 표시
    if (state.shopHintActive && c.fx && c.fx.tags) {
      hintText += (hintText ? ' ' : '') + '[' + c.fx.tags.join(',') + ']';
    }

    btn.innerHTML = `<span class="choice-arrow">▷</span>${c.t}${hintText ? `<span class="choice-fx">${hintText}</span>` : ''}`;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleChoice(c);
    });
    cw.appendChild(btn);
  });
  cw.style.display = 'flex';
  state.shopHintActive = false; // 한 번만 적용
}

// --- HANDLE CHOICE ---
function handleChoice(choice) {
  const f = choice.fx || {};

  // 인물별 신뢰도
  if (f.trust && typeof f.trust === 'object') {
    Object.entries(f.trust).forEach(([key, val]) => {
      if (state.trust[key] !== undefined) {
        state.trust[key] = Math.min(100, Math.max(0, state.trust[key] + val));
      }
    });
  }

  // 코인
  if (f.coin) {
    state.coin = Math.max(0, state.coin + f.coin);
  }

  // 아이템
  if (f.item && !state.items.includes(f.item)) {
    state.items.push(f.item);
    showItemPopup(f.item);
  }

  // 태그 기반 추적
  const tags = f.tags || [];
  if (tags.includes('희생') || tags.includes('보호')) state.sacrificeCount++;
  if (tags.includes('전략') && choice.t.includes('제4의 벽')) state.fourthWallCount++;
  if (tags.includes('이야기') || tags.includes('서사')) state.storyChoiceCount++;
  if (tags.includes('고독') || choice.t.includes('혼자') || choice.t.includes('모른 척')) state.solitaryCount++;

  // 성좌 매칭 후원
  if (tags.length > 0) {
    processConstellationSponsor(tags);
  }

  // 설화 자동 체크
  checkSeolhwaConditions();

  updateHUD();

  const next = state.scenes[choice.n];
  if (next && next.clr) {
    goToClear(choice.n, next);
  } else if (next) {
    loadScene(choice.n);
  }
}

// --- CONSTELLATION SPONSOR ---
function processConstellationSponsor(tags) {
  let bestMatch = null;
  let bestScore = 0;

  Object.entries(CONSTELLATIONS).forEach(([key, c]) => {
    let score = 0;
    tags.forEach(tag => {
      if (c.likes.includes(tag)) score += 1;
      if (c.dislikes && c.dislikes.includes(tag)) score -= 1;
    });
    if (score > bestScore) {
      bestScore = score;
      bestMatch = key;
    }
  });

  if (bestMatch && bestScore > 0) {
    const coinReward = Math.floor(Math.random() * 11 + 5) * bestScore; // 5~15 per match
    state.coin += coinReward;
    state.constellationTrust[bestMatch] = Math.min(100, (state.constellationTrust[bestMatch] || 0) + 3 * bestScore);
    state.constellationSponsored[bestMatch] = (state.constellationSponsored[bestMatch] || 0) + coinReward;

    const c = CONSTELLATIONS[bestMatch];
    const trust = state.constellationTrust[bestMatch];

    // 특별 이벤트 체크
    if (trust >= 70 && !state.skills.includes(bestMatch + '_stigma')) {
      showConstellationPopup(`【 ${c.name} 】이 성흔을 제안합니다!\n\n+${coinReward} 코인 후원`, coinReward, trust);
      // 성흔 스킬 자동 해금 (해당 성좌에 매칭되는 스킬)
      unlockStigmaSkill(bestMatch);
    } else if (trust >= 50) {
      const bonusCoin = Math.floor(Math.random() * 51 + 50); // 50~100 보너스
      state.coin += bonusCoin;
      state.constellationSponsored[bestMatch] += bonusCoin;
      showConstellationPopup(`【 ${c.name} 】이 특별 후원!\n\n+${coinReward + bonusCoin} 코인`, coinReward + bonusCoin, trust);
    } else if (Math.random() < 0.4) { // 40% 확률로 표시
      showConstellationPopup(`【 ${c.name} 】이 후원합니다.\n\n+${coinReward} 코인`, coinReward, trust);
    }

    updateHUD();
  }

  // dislike 매칭 시
  Object.entries(CONSTELLATIONS).forEach(([key, c]) => {
    let dislikeHit = false;
    tags.forEach(tag => {
      if (c.dislikes && c.dislikes.includes(tag)) dislikeHit = true;
    });
    if (dislikeHit) {
      state.constellationTrust[key] = Math.max(0, (state.constellationTrust[key] || 0) - 2);
    }
  });
}

function unlockStigmaSkill(constellationKey) {
  // 성좌 → 스킬 매핑
  const stigmaMap = {
    demon_king: 'sacrifice',
    black_flame: 'author_eye',
  };
  const skillId = stigmaMap[constellationKey];
  if (skillId && !state.skills.includes(skillId)) {
    state.skills.push(skillId);
  }
}

// --- SEOLHWA CHECK ---
function checkSeolhwaConditions() {
  const checks = [
    { id: 'sacrifice_seolhwa', condition: () => state.sacrificeCount >= 3 },
    { id: 'reader_seolhwa', condition: () => state.fourthWallCount >= 3 },
    { id: 'regressor_seolhwa', condition: () => state.char === 'joonghyuk' && state.ep >= 3 },
    { id: 'black_flame_seolhwa', condition: () => state.char === 'sooyoung' && state.items.includes('black_ink') },
    { id: 'bug_king_seolhwa', condition: () => state.items.includes('bug_jar') && state.ep >= 3 },
    { id: 'alliance_seolhwa', condition: () => (state.trust.gong_pildu || 0) >= 50 },
    { id: 'story_king_seolhwa', condition: () => state.ep >= 4 && state.storyChoiceCount >= 5 },
  ];

  checks.forEach(({ id, condition }) => {
    if (!state.seolhwa.includes(id) && condition()) {
      state.seolhwa.push(id);
      const def = SEOLHWA_DEFS[id];
      if (def) showSeolhwaPopup(def);
    }
  });
}

// --- POPUPS ---
function showConstellationPopup(msg, coin, trust) {
  const popup = document.getElementById('constellation-popup');
  document.getElementById('const-msg').textContent = msg;
  document.getElementById('const-coin').textContent = coin > 0 ? `+${coin} 코인` : '';
  document.getElementById('const-coin').style.display = coin > 0 ? 'block' : 'none';
  document.getElementById('const-favor').textContent = `성좌 호감도: ${trust}`;

  popup.classList.remove('hiding');
  popup.style.display = 'block';

  if (constTimer) clearTimeout(constTimer);
  constTimer = setTimeout(() => {
    popup.classList.add('hiding');
    setTimeout(() => { popup.style.display = 'none'; popup.classList.remove('hiding'); }, 300);
  }, 3000);
}

function showSeolhwaPopup(def) {
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

function maybeShowConstellation() {
  // 랜덤 성좌 반응 (태그 없는 일반 씬 전환 시)
  if (Math.random() > 0.2) return;
  const keys = Object.keys(CONSTELLATIONS);
  const key = keys[Math.floor(Math.random() * keys.length)];
  const c = CONSTELLATIONS[key];
  const trust = state.constellationTrust[key] || 0;
  const msgs = [
    `성좌 「${c.name}」이 당신을 지켜봅니다.`,
    `성좌들이 술렁입니다.`,
    `성좌 「${c.name}」이 고개를 끄덕입니다.`,
  ];
  showConstellationPopup(msgs[Math.floor(Math.random() * msgs.length)], 0, trust);
}

// --- CLEAR / ENDING ---
function goToClear(id, sc) {
  if (typingTimer) { clearInterval(typingTimer); typingTimer = null; }
  if (constTimer) { clearTimeout(constTimer); constTimer = null; }

  state.lastClear = sc;

  // 최고 신뢰도 계산
  const maxTrust = Math.max(...Object.values(state.trust));

  // 배드 엔딩 체크
  if (state.solitaryCount >= 5 && sc.ep === 5) {
    showSpecialEnding(BAD_ENDING, 'BAD');
    return;
  }

  // EP.5 클리어 시 저장
  if (sc.ep === 5) {
    const save = getSaveData();
    save[state.char] = { completed: true, maxTrust: maxTrust };
    setSaveData(save);

    // 진 엔딩 체크
    const chars = Object.keys(CHARS);
    const allDone = chars.every(c => save[c] && save[c].completed && save[c].maxTrust >= 70);
    if (allDone && maxTrust >= 70) {
      showSpecialEnding(TRUE_ENDING, 'TRUE');
      return;
    }
  }

  // 클리어 화면 렌더
  document.getElementById('final-trust').textContent = maxTrust;
  document.getElementById('final-seolhwa').textContent = state.seolhwa.length;
  document.getElementById('final-coin').textContent = state.coin;
  document.getElementById('clear-msg').textContent = sc.txt;

  const badge = document.getElementById('ending-badge');
  badge.textContent = sc.badge || '';
  badge.style.background = (sc.col || '#f59e0b') + '22';
  badge.style.color = sc.col || '#f59e0b';
  badge.style.border = '1px solid ' + (sc.col || '#f59e0b') + '66';
  document.getElementById('clear-title').textContent = sc.ending || '클리어!';

  const epLabel = sc.ep ? `EPISODE ${sc.ep}` : 'EPISODE 1';
  document.getElementById('clear-ep-label').textContent = epLabel;

  const nextBtn = document.getElementById('next-ep-btn');
  if (sc.next) {
    nextBtn.style.display = 'inline-block';
    nextBtn.textContent = `Episode ${(sc.ep || 1) + 1} 시작 ▶`;
  } else {
    nextBtn.style.display = 'none';
  }

  showScreen('clear');
}

function showSpecialEnding(ending, type) {
  const maxTrust = Math.max(...Object.values(state.trust));
  document.getElementById('final-trust').textContent = maxTrust;
  document.getElementById('final-seolhwa').textContent = state.seolhwa.length;
  document.getElementById('final-coin').textContent = state.coin;
  document.getElementById('clear-msg').textContent = ending.txt;

  const badge = document.getElementById('ending-badge');
  badge.textContent = ending.badge;
  badge.style.background = ending.col + '22';
  badge.style.color = ending.col;
  badge.style.border = '1px solid ' + ending.col + '66';

  document.getElementById('clear-title').textContent = type === 'TRUE' ? '진 엔딩' : '배드 엔딩';
  document.getElementById('clear-ep-label').textContent = type === 'TRUE' ? 'TRUE ENDING' : 'BAD ENDING';
  document.getElementById('clear-star').textContent = type === 'TRUE' ? '★' : '☆';
  document.getElementById('next-ep-btn').style.display = 'none';

  showScreen('clear');
}

// --- HUD ---
function updateHUD() {
  // 현재 씬 화자에 해당하는 인물 신뢰도 표시
  const sc = state.scenes ? state.scenes[state.sceneId] : null;
  const hudTrust = document.getElementById('hud-trust-pills');
  hudTrust.innerHTML = '';

  // 관련 인물 신뢰도 최대 2개 표시
  const relevantKeys = getRelevantTrustKeys(sc);
  relevantKeys.slice(0, 2).forEach(key => {
    const t = TRUST_TARGETS[key];
    if (!t) return;
    const val = state.trust[key] || 0;
    const pill = document.createElement('div');
    pill.className = 'stat-pill';
    pill.innerHTML = `
      <span style="color:${t.col};font-size:10px">${t.icon}</span>
      <div class="stat-track"><div class="stat-fill" style="width:${val}%;background:${t.col};box-shadow:0 0 4px ${t.col}66"></div></div>
      <span style="color:${t.col};font-size:10px">${val}</span>
    `;
    hudTrust.appendChild(pill);
  });

  // 설화 개수
  document.getElementById('val-seolhwa').textContent = '📜 ' + state.seolhwa.length;
  // 코인
  document.getElementById('val-coin').textContent = '◈ ' + state.coin;
}

function getRelevantTrustKeys(sc) {
  if (!sc) return Object.keys(state.trust).filter(k => state.trust[k] > 0).slice(0, 2);

  // 화자가 인물이면 해당 인물의 신뢰도 키 매핑
  const spToTrust = {
    joonghyuk: 'yoo_joonghyuk',
    sooyoung: 'han_sooyoung',
    jihye: 'lee_jihye',
    heewon: 'jung_heewon',
    pildu: 'gong_pildu',
    hyunsung: 'lee_hyunsung',
    sangah: 'yoo_sangah',
    gilyoung: 'lee_gilyoung',
  };

  const keys = [];
  if (spToTrust[sc.sp]) keys.push(spToTrust[sc.sp]);

  // 값이 높은 순으로 나머지 추가
  const sorted = Object.entries(state.trust)
    .filter(([k]) => !keys.includes(k) && state.trust[k] > 0)
    .sort((a, b) => b[1] - a[1]);
  sorted.forEach(([k]) => keys.push(k));

  return keys;
}

// expose globals
window.skipTyping = skipTyping;

init();
