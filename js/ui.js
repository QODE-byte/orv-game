// =======================================
// UI — 모달 창, 탭, 상점, 팝업
// =======================================

// currentTab과 openModal/closeModal은 engine.js에서 정의됨

function renderModalTabs() {
  const tabs = [
    {id:'inventory', label:'🎒 인벤토리'},
    {id:'skills',    label:'⚡ 스킬'},
    {id:'seolhwa',   label:'📜 설화'},
    {id:'constellation', label:'⭐ 성좌'},
    {id:'shop',      label:'🪙 상점'},
  ];
  const wrap = document.getElementById('modal-tabs');
  wrap.innerHTML = '';
  tabs.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'modal-tab' + (t.id === currentTab ? ' active' : '');
    btn.textContent = t.label;
    btn.onclick = () => { currentTab = t.id; renderModalTabs(); renderModalContent(); };
    wrap.appendChild(btn);
  });
}

function renderModalContent() {
  const body = document.getElementById('modal-body');
  switch (currentTab) {
    case 'inventory': body.innerHTML = renderInventory(); break;
    case 'skills':    body.innerHTML = renderSkills(); break;
    case 'seolhwa':   body.innerHTML = renderSeolhwa(); break;
    case 'constellation': body.innerHTML = renderConstellations(); break;
    case 'shop':      body.innerHTML = renderShop(); break;
  }
}

// --- INVENTORY ---
function renderInventory() {
  if (state.items.length === 0) {
    return '<div class="modal-empty">아직 획득한 아이템이 없습니다.</div>';
  }
  return state.items.map(key => {
    const item = ITEMS[key];
    if (!item) return '';
    return `<div class="modal-card">
      <div class="modal-card-icon">${item.icon}</div>
      <div class="modal-card-info">
        <div class="modal-card-name">${item.name}</div>
        <div class="modal-card-desc">${item.desc}</div>
      </div>
    </div>`;
  }).join('');
}

// --- SKILLS ---
function renderSkills() {
  const charSkills = SKILLS[state.char] || [];
  if (charSkills.length === 0) return '<div class="modal-empty">스킬 데이터 없음</div>';

  return charSkills.map(sk => {
    const unlocked = state.skills.includes(sk.id);
    return `<div class="modal-card ${unlocked ? '' : 'locked'}">
      <div class="modal-card-icon">${unlocked ? '⚡' : '🔒'}</div>
      <div class="modal-card-info">
        <div class="modal-card-name">${unlocked ? sk.name : '???'}</div>
        <div class="modal-card-desc">${unlocked ? sk.desc : sk.condition || '잠금됨'}</div>
      </div>
      ${!unlocked && sk.cost > 0 ? `<button class="modal-card-btn" onclick="buySkill('${sk.id}',${sk.cost})">🪙${sk.cost}</button>` : ''}
    </div>`;
  }).join('');
}

function buySkill(skillId, cost) {
  if (state.coin < cost) {
    alert('코인이 부족합니다.');
    return;
  }
  state.coin -= cost;
  if (!state.skills.includes(skillId)) state.skills.push(skillId);
  updateHUD();
  renderModalContent();
}

// --- SEOLHWA ---
function renderSeolhwa() {
  const entries = Object.entries(SEOLHWA_DEFS);
  return entries.map(([id, def]) => {
    const owned = state.seolhwa.includes(id);
    return `<div class="modal-card ${owned ? 'seolhwa-owned' : 'locked'}">
      <div class="modal-card-icon">${owned ? def.icon : '❓'}</div>
      <div class="modal-card-info">
        <div class="modal-card-name">${owned ? def.name : '???'}</div>
        <div class="modal-card-desc">${owned ? def.desc : '미발견'}</div>
      </div>
    </div>`;
  }).join('');
}

// --- CONSTELLATIONS ---
function renderConstellations() {
  return Object.entries(CONSTELLATIONS).map(([key, c]) => {
    const trust = state.constellationTrust[key] || 0;
    const sponsored = state.constellationSponsored[key] || 0;
    const unlocked = trust > 0;
    return `<div class="modal-card">
      <div class="modal-card-icon">${trust >= 70 ? '🌟' : trust >= 50 ? '⭐' : '☆'}</div>
      <div class="modal-card-info">
        <div class="modal-card-name" style="color:${trust >= 50 ? '#fcd34d' : '#b5b0a8'}">${unlocked ? c.name : '???'}</div>
        <div class="const-bar-wrap">
          <div class="const-bar" style="width:${trust}%;background:${trust >= 70 ? '#fcd34d' : trust >= 50 ? '#f59e0b' : '#a78bfa'}"></div>
        </div>
        <div class="modal-card-desc">${unlocked ? `호감도 ${trust} . 후원 총액 ${sponsored} 코인` : '아직 만나지 못한 성좌'}</div>
        ${trust >= 70 ? '<div class="modal-card-desc" style="color:#fcd34d">성흔 해금!</div>' : ''}
      </div>
    </div>`;
  }).join('');
}

// --- SHOP ---
function renderShop() {
  return SHOP_ITEMS.map(item => {
    const canBuy = state.coin >= item.cost;
    return `<div class="modal-card">
      <div class="modal-card-icon">${item.icon}</div>
      <div class="modal-card-info">
        <div class="modal-card-name">${item.name}</div>
        <div class="modal-card-desc">${item.desc}</div>
      </div>
      <button class="modal-card-btn ${canBuy ? '' : 'disabled'}" onclick="buyShopItem('${item.id}',${item.cost})" ${canBuy ? '' : 'disabled'}>🪙${item.cost}</button>
    </div>`;
  }).join('');
}

function buyShopItem(itemId, cost) {
  if (state.coin < cost) return;
  state.coin -= cost;

  switch (itemId) {
    case 'hint':
      state.shopHintActive = true;
      closeModal();
      // 현재 씬의 선택지를 다시 렌더 (힌트 포함)
      showChoices();
      break;
    case 'seolhwa_hint':
      showSeolhwaHints();
      break;
    case 'skill_unlock':
      unlockRandomSkill();
      break;
    case 'char_info':
      showCharInfo();
      break;
  }
  updateHUD();
  renderModalContent();
}

function showSeolhwaHints() {
  const unowned = Object.entries(SEOLHWA_DEFS).filter(([id]) => !state.seolhwa.includes(id));
  if (unowned.length === 0) {
    alert('모든 설화를 이미 획득했습니다!');
    return;
  }
  const [id, def] = unowned[Math.floor(Math.random() * unowned.length)];
  alert(`설화 힌트: ${def.name}\n\n조건: ${def.condition}`);
}

function unlockRandomSkill() {
  const charSkills = SKILLS[state.char] || [];
  const locked = charSkills.filter(s => s.locked && s.cost > 0 && !state.skills.includes(s.id));
  if (locked.length === 0) {
    alert('해금 가능한 스킬이 없습니다.');
    state.coin += 100; // 환불
    return;
  }
  const sk = locked[0];
  state.skills.push(sk.id);
  alert(`${sk.name} 해금!`);
}

function showCharInfo() {
  const char = CHARS[state.char];
  alert(`${char.name}\n\n${char.desc}\n\n스타일: ${char.style}`);
}

// expose globals
window.buySkill = buySkill;
window.buyShopItem = buyShopItem;
