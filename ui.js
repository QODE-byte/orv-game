// =======================================
// UI — 무당기(巫堂記) 모달 창
// =======================================

function renderModalTabs() {
  const tabs = [
    {id:'inventory', label:'🎒 아이템'},
    {id:'skills',    label:'⚡ 능력'},
    {id:'mindam',    label:'📜 민담'},
    {id:'deity',     label:'⭐ 신위'},
    {id:'shop',      label:'🔮 신기'},
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
    case 'skills':    body.innerHTML = renderSkills();    break;
    case 'mindam':    body.innerHTML = renderMindam();    break;
    case 'deity':     body.innerHTML = renderDeity();     break;
    case 'shop':      body.innerHTML = renderShop();      break;
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
  if (charSkills.length === 0) return '<div class="modal-empty">능력 데이터 없음</div>';
  return charSkills.map(sk => {
    const unlocked = state.skills.includes(sk.id);
    return `<div class="modal-card ${unlocked ? '' : 'locked'}">
      <div class="modal-card-icon">${unlocked ? '⚡' : '🔒'}</div>
      <div class="modal-card-info">
        <div class="modal-card-name">${unlocked ? sk.name : '???'}</div>
        <div class="modal-card-desc">${unlocked ? sk.desc : (sk.condition || '잠금됨')}</div>
      </div>
    </div>`;
  }).join('');
}

// --- MINDAM (설화 대체) ---
function renderMindam() {
  const entries = Object.entries(MINDAM_DEFS);
  return entries.map(([id, def]) => {
    const owned = state.mindam.includes(id);
    return `<div class="modal-card ${owned ? 'seolhwa-owned' : 'locked'}">
      <div class="modal-card-icon">${owned ? def.icon : '❓'}</div>
      <div class="modal-card-info">
        <div class="modal-card-name">${owned ? def.name : '???'}</div>
        <div class="modal-card-desc">${owned ? def.desc : '미발견'}</div>
        ${owned ? '' : `<div class="modal-card-desc" style="margin-top:4px;color:rgba(255,255,255,.25)">조건: ${def.condition}</div>`}
      </div>
    </div>`;
  }).join('');
}

// --- DEITY (성좌 대체) ---
function renderDeity() {
  return Object.entries(DEITIES).map(([key, d]) => {
    const yeonin = state.deityYeonin[key] || 0;
    const sponsored = state.deitySponsored[key] || 0;
    const active = yeonin > 0;
    return `<div class="modal-card">
      <div class="modal-card-icon">${yeonin >= 30 ? '🌟' : yeonin >= 15 ? '✨' : d.icon}</div>
      <div class="modal-card-info">
        <div class="modal-card-name" style="color:${yeonin >= 15 ? '#fbbf24' : 'rgba(255,255,255,0.6)'}">${active ? d.name : '???'}</div>
        <div class="const-bar-wrap">
          <div class="const-bar" style="width:${yeonin}%;background:${yeonin >= 30 ? '#fbbf24' : yeonin >= 15 ? '#f59e0b' : '#c084fc'}"></div>
        </div>
        <div class="modal-card-desc">${active ? `인연 ${yeonin} · 신기 후원 ${sponsored}` : '아직 접촉 없음'}</div>
        ${yeonin >= 30 ? '<div class="modal-card-desc" style="color:#fbbf24;margin-top:4px">인연 30+ · 숨겨진 선택지 해금 가능</div>' : ''}
      </div>
    </div>`;
  }).join('');
}

// --- SHOP (신기 소비) ---
function renderShop() {
  return `<div class="modal-card" style="margin-bottom:8px;background:rgba(192,132,252,.05);border-color:rgba(192,132,252,.2)">
    <div class="modal-card-icon">🔮</div>
    <div class="modal-card-info">
      <div class="modal-card-name">현재 신기</div>
      <div class="modal-card-desc" style="font-size:20px;font-weight:700;color:#c084fc">${state.singi}</div>
    </div>
  </div>` +
  SHOP_ITEMS.map(item => {
    if (item.special === 'recharge') {
      return `<div class="modal-card">
        <div class="modal-card-icon">${item.icon}</div>
        <div class="modal-card-info">
          <div class="modal-card-name">${item.name}</div>
          <div class="modal-card-desc">${item.desc}</div>
        </div>
        <button class="modal-card-btn" onclick="useRecharge()">무료</button>
      </div>`;
    }
    const canBuy = state.singi >= item.cost;
    return `<div class="modal-card">
      <div class="modal-card-icon">${item.icon}</div>
      <div class="modal-card-info">
        <div class="modal-card-name">${item.name}</div>
        <div class="modal-card-desc">${item.desc}</div>
      </div>
      <button class="modal-card-btn ${canBuy ? '' : 'disabled'}"
        onclick="buyShopItem('${item.id}',${item.cost})"
        ${canBuy ? '' : 'disabled'}>🔮${item.cost}</button>
    </div>`;
  }).join('');
}

function buyShopItem(itemId, cost) {
  if (state.singi < cost) return;
  state.singi -= cost;
  switch (itemId) {
    case 'hint':
      state.shopHintActive = true;
      closeModal();
      showChoices();
      break;
    case 'mindam_h':
      showMindamHint();
      break;
  }
  updateHUD();
  renderModalContent();
}

function useRecharge() {
  state.singi += 10;
  updateHUD();
  renderModalContent();
}

function showMindamHint() {
  const unowned = Object.entries(MINDAM_DEFS).filter(([id]) => !state.mindam.includes(id));
  if (unowned.length === 0) {
    alert('모든 민담을 이미 수집했습니다!');
    return;
  }
  const [id, def] = unowned[Math.floor(Math.random() * unowned.length)];
  alert(`민담 실마리: ${def.name}\n\n조건: ${def.condition}`);
}

window.buyShopItem = buyShopItem;
window.useRecharge = useRecharge;
