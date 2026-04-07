// =======================================
// DATA — 캐릭터, 성좌, 스킬, 아이템, 설화
// =======================================

const CHARS = {
  dokja:     { name:'김독자',   col:'#f59e0b', desc:'유일한 독자\n전략형 . 제4의 벽',  illus:'📖', style:'전략/메타' },
  joonghyuk: { name:'유중혁',   col:'#ef4444', desc:'회귀자\n전투형 . 압도적 무력', illus:'⚔️', style:'전투/독주' },
  sooyoung:  { name:'한수영',   col:'#a78bfa', desc:'천재 작가\n설화형 . 이야기 무기화', illus:'✒️', style:'설화/창작' },
};

// --- 화자 맵 ---
const SPEAKER_MAP = {
  dokja:    {name:'김독자',  col:'#f59e0b'},
  joonghyuk:{name:'유중혁',  col:'#ef4444'},
  sooyoung: {name:'한수영',  col:'#a78bfa'},
  jihye:    {name:'이지혜',  col:'#38bdf8'},
  heewon:   {name:'정희원',  col:'#fb923c'},
  pildu:    {name:'공필두',  col:'#22d3ee'},
  hyunsung: {name:'이현성',  col:'#4ade80'},
  sangah:   {name:'유상아',  col:'#f9a8d4'},
  gilyoung: {name:'이길영',  col:'#86efac'},
  narrator: {name:'',       col:'#94a3b8'},
  system:   {name:'SYSTEM', col:'#22d3ee'},
};

// --- 신뢰도 대상 인물 ---
const TRUST_TARGETS = {
  yoo_joonghyuk: {name:'유중혁',  col:'#ef4444', icon:'⚔️'},
  han_sooyoung:  {name:'한수영',  col:'#a78bfa', icon:'✒️'},
  lee_jihye:     {name:'이지혜',  col:'#38bdf8', icon:'⚓'},
  jung_heewon:   {name:'정희원',  col:'#fb923c', icon:'🔥'},
  gong_pildu:    {name:'공필두',  col:'#22d3ee', icon:'🏰'},
  lee_hyunsung:  {name:'이현성',  col:'#4ade80', icon:'🛡️'},
  yoo_sangah:    {name:'유상아',  col:'#f9a8d4', icon:'💼'},
  lee_gilyoung:  {name:'이길영',  col:'#86efac', icon:'🐛'},
};

// --- 성좌 데이터 ---
const CONSTELLATIONS = {
  demon_king: {
    name:'구원의 마왕', host:'dokja',
    likes:['희생','동료','이야기','보호'], dislikes:['배신','포기','고독'],
  },
  black_flame: {
    name:'심연의 흑염룡', host:'sooyoung',
    likes:['전투','독설','자존심','서사'], dislikes:['비굴','굴복'],
  },
  defense_master: {
    name:'디펜스 마스터', host:'pildu',
    likes:['수비','협상','건축','전략'], dislikes:['무모','파괴'],
  },
  sea_god: {
    name:'해상전신', host:'jihye',
    likes:['용감','해전','충성','리더십'], dislikes:['배신','비겁'],
  },
  secretive_plotter: {
    name:'비밀 수렵자', host:null,
    likes:['전략','관찰','독서','침묵'], dislikes:['무모','허영'],
  },
  oldest_dream: {
    name:'가장 오래된 꿈', host:null,
    likes:['이야기','기억','희생','사랑'], dislikes:['망각','포기'],
  },
  harsh_critic: {
    name:'지독한 평론가', host:null,
    likes:['서사','비평','독설','진실'], dislikes:['거짓','아부'],
  },
  prisoner_of_golden_headband: {
    name:'긴고아의 죄수', host:null,
    likes:['자유','반항','전투','고독'], dislikes:['속박','복종'],
  },
};

// --- 스킬 데이터 ---
const SKILLS = {
  dokja: [
    {id:'fourth_wall',   name:'제4의 벽',     desc:'메타 인식. 이야기를 읽는 자의 스킬.', locked:false, cost:0},
    {id:'reader_stigma', name:'독자의 설화',   desc:'이야기의 힘을 현실에 투영한다.',     locked:true,  cost:100, condition:'설화 3개 이상 보유'},
    {id:'sacrifice',     name:'자기희생 의지', desc:'성흔. 동료를 위해 모든 것을 건다.',   locked:true,  cost:0,   condition:'구원의 마왕 호감도 70+'},
  ],
  joonghyuk: [
    {id:'panya_sword',   name:'반야월광보도',  desc:'유중혁의 기본 검술.',              locked:false, cost:0},
    {id:'pacheon',       name:'파천삼재',      desc:'파괴적인 3연격.',                  locked:true,  cost:100, condition:'EP.3 클리어'},
    {id:'regressor_will',name:'귀환자의 의지', desc:'성흔. 절대 포기하지 않는 의지.',    locked:true,  cost:0,   condition:'EP.5 도달'},
  ],
  sooyoung: [
    {id:'black_flame_s', name:'흑염',         desc:'심연의 흑염룡에게 받은 불꽃.',      locked:false, cost:0},
    {id:'story_craft',   name:'설화 창작',    desc:'이야기를 무기로 만든다.',           locked:false, cost:0},
    {id:'author_eye',    name:'작가의 눈',    desc:'성흔. 서사의 흐름을 읽는다.',       locked:true,  cost:0,   condition:'심연의 흑염룡 호감도 70+'},
  ],
};

// --- 아이템 데이터 ---
const ITEMS = {
  'specters_stone':   {name:'스펙터의 영석',  desc:'2부 생존에 필요한 핵심 아이템.',       icon:'💎'},
  'bug_jar':          {name:'채집통',         desc:'이길영이 사용하는 충왕의 도구.',       icon:'🫙'},
  'shinyuseung_note': {name:'신유승의 쪽지',  desc:'히든 씬으로 가는 열쇠.',             icon:'📝'},
  'ways_of_survival': {name:'멸살법 단행본',  desc:'김독자의 유일한 무기. 특수 선택지 해금.', icon:'📕'},
  'broken_sword':     {name:'부러진 검',      desc:'유중혁의 과거 회차에서 온 검.',       icon:'🗡️'},
  'black_ink':        {name:'흑염의 잉크',    desc:'한수영의 펜에 깃든 흑염룡의 힘.',     icon:'🖋️'},
  'green_zone_key':   {name:'그린 존 열쇠',   desc:'공필두에게 받은 안전지대 출입증.',    icon:'🔑'},
};

// --- 설화 정의 ---
const SEOLHWA_DEFS = {
  sacrifice_seolhwa:  {name:'희생의 설화',  desc:'동료를 지키기 위해 자신을 던진 자의 이야기.', condition:'동료 보호 선택 3회', icon:'🛡️'},
  reader_seolhwa:     {name:'독자의 설화',  desc:'이 세계의 결말을 아는 유일한 독자의 이야기.', condition:'제4의 벽 선택 3회', icon:'📖'},
  regressor_seolhwa:  {name:'회귀의 설화',  desc:'1863번 반복한 회귀자의 이야기.',           condition:'유중혁 루트 EP.3 클리어', icon:'🔄'},
  black_flame_seolhwa:{name:'흑염의 설화',  desc:'심연의 불꽃을 다루는 작가의 이야기.',       condition:'한수영 흑염 분기 선택', icon:'🔥'},
  bug_king_seolhwa:   {name:'충왕의 설화',  desc:'벌레를 사랑한 소년왕의 이야기.',           condition:'이길영 동행 후 EP.3 클리어', icon:'🐛'},
  naval_seolhwa:      {name:'해전의 설화',  desc:'바다의 제독이 된 여전사의 이야기.',         condition:'이지혜 해전 씬 완료', icon:'⚓'},
  alliance_seolhwa:   {name:'동맹의 설화',  desc:'적을 동료로 만든 교섭의 이야기.',           condition:'공필두 신뢰도 50+', icon:'🤝'},
  story_king_seolhwa: {name:'서사왕의 설화',desc:'이야기로 왕이 된 자의 서사.',               condition:'왕들의 전쟁 클리어', icon:'👑'},
};

// --- 상점 상품 ---
const SHOP_ITEMS = [
  {id:'hint',       name:'씬 힌트',    desc:'다음 선택지의 결과를 미리 본다.',     cost:50,  icon:'🔮'},
  {id:'seolhwa_hint',name:'설화 힌트', desc:'미획득 설화의 획득 조건을 확인한다.', cost:30,  icon:'📜'},
  {id:'skill_unlock',name:'스킬 해금', desc:'잠긴 스킬 하나를 선구매로 해금한다.', cost:100, icon:'⚡'},
  {id:'char_info',   name:'인물 정보', desc:'등장인물의 상세 설명을 열람한다.',    cost:20,  icon:'👤'},
];
