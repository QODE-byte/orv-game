// =======================================
// DATA — 무당기(巫堂記) 게임 데이터
// =======================================

const CHARS = {
  maehyang: {
    name:'이매향', col:'#c084fc',
    desc:'취준생 / 무당의 딸\n신내림을 거부해온 24세',
    illus:'🕯️', style:'직관/감성'
  },
};

// --- 화자 맵 ---
const SPEAKER_MAP = {
  maehyang: {name:'이매향',    col:'#c084fc'},
  chilsung:  {name:'칠성신',   col:'#fbbf24'},
  samshin:   {name:'삼신할머니',col:'#f9a8d4'},
  sungju:    {name:'성주신',   col:'#86efac'},
  gumiho:    {name:'구미호 신모',col:'#fb923c'},
  mother:    {name:'어머니',   col:'#a78bfa'},
  neighbor:  {name:'아주머니', col:'#6ee7b7'},
  woman:     {name:'여자',     col:'#f9a8d4'},
  child:     {name:'아이',     col:'#67e8f9'},
  narrator:  {name:'',         col:'#94a3b8'},
  system:    {name:'SYSTEM',   col:'#22d3ee'},
};

// --- 인연 대상 인물 ---
const TRUST_TARGETS = {
  mother:   {name:'어머니',   col:'#a78bfa', icon:'🕯️'},
  neighbor: {name:'아주머니', col:'#6ee7b7', icon:'🏠'},
  woman:    {name:'단골손님', col:'#f9a8d4', icon:'🙏'},
  child:    {name:'아이',     col:'#67e8f9', icon:'👁️'},
};

// --- 신위(神位) 8신 — 성좌 대체 ---
const DEITIES = {
  chilsung: {
    name:'칠성신(七星神)', icon:'⭐',
    likes:['지혜','관찰','진실','거래'], dislikes:['충동','거짓','회피'],
  },
  sanshin: {
    name:'산신(山神)', icon:'🏔️',
    likes:['용기','보호','수용','강인'], dislikes:['도주','비겁'],
  },
  yongwang: {
    name:'용왕(龍王)', icon:'🐉',
    likes:['관대','재물','포용','의외'], dislikes:['탐욕','인색'],
  },
  samshin: {
    name:'삼신할머니', icon:'🌸',
    likes:['생명','수용','희생','사랑'], dislikes:['포기','냉담'],
  },
  jeosung: {
    name:'저승사자', icon:'⚖️',
    likes:['공정','원칙','진실','냉정'], dislikes:['거짓','불공정'],
  },
  dokkaebi: {
    name:'도깨비 대왕', icon:'🪄',
    likes:['의외','반전','유쾌','창의'], dislikes:['고지식','포기'],
  },
  gumiho: {
    name:'구미호 신모', icon:'🦊',
    likes:['진실','직관','탐구','통찰'], dislikes:['은폐','회피'],
  },
  sungju: {
    name:'성주신(城主神)', icon:'🏠',
    likes:['공동체','희생','수용','책임'], dislikes:['이기심','파괴'],
  },
};

// --- 스킬 데이터 ---
const SKILLS = {
  maehyang: [
    {id:'sense',      name:'신감(神感)',   desc:'신들의 시선을 느낀다. 선택지 태그를 희미하게 감지한다.', locked:false, cost:0},
    {id:'ritual',     name:'굿법(巫法)',   desc:'기본 굿 의식 진행 가능. 어머니에게 배운 동작들.', locked:false, cost:0},
    {id:'contract',   name:'계약술(契約)', desc:'칠성신과의 거래 완성 시 해금. 신기 회복 속도 증가.', locked:true, cost:0, condition:'칠성신 거래 완성'},
    {id:'mindam_eye', name:'민담안(民譚眼)',desc:'민담 3개 이상 수집 시 해금. 숨겨진 선택지 감지.', locked:true, cost:0, condition:'민담 3개 이상 수집'},
  ],
};

// --- 아이템 데이터 ---
const ITEMS = {
  shinnul:    {name:'신물(神物)',    desc:'어머니의 부채. 받는 순간 무언가가 바뀐다.',        icon:'🪭'},
  incense:    {name:'향(香)',       desc:'신당의 오래된 향. 냄새가 기억을 불러온다.',        icon:'🌿'},
  note:       {name:'단서 쪽지',   desc:'단골손님이 남긴 쪽지. 아이에 대한 내용.',         icon:'📝'},
  eyeclosed:  {name:'닫힌 눈',     desc:'아이 앞에서 눈을 감아 본 기억. 무언가 보였다.',   icon:'👁️'},
};

// --- 민담 정의 (설화 대체) ---
const MINDAM_DEFS = {
  bari:      {name:'바리공주',    desc:'버려진 딸이 죽음을 건너 생명수를 가져왔다. 아무도 시키지 않았다.', condition:'희생 선택 2회', icon:'🌺'},
  shimchung: {name:'심청이',      desc:'아버지의 눈을 위해 스스로 바다에 몸을 던졌다. 결국 돌아왔다.',   condition:'수용 선택 3회', icon:'🌊'},
  arang:     {name:'아랑 설화',   desc:'억울하게 죽은 처녀의 원한. 진실을 말해준 자만이 풀 수 있었다.',  condition:'집 안 진입 후 진실 선택', icon:'👻'},
  gumiho_s:  {name:'구미호 전설', desc:'천 년을 기다린 구미호. 인간이 되려 했으나 결국은 자신이었다.',   condition:'직관 선택 3회', icon:'🦊'},
};

// --- 상점 (신기 소비) ---
const SHOP_ITEMS = [
  {id:'hint',      name:'신탁(神託)',    desc:'다음 선택지의 결과를 희미하게 감지한다.', cost:15, icon:'🔮'},
  {id:'mindam_h',  name:'민담 실마리',  desc:'미수집 민담의 획득 조건을 확인한다.',    cost:10, icon:'📜'},
  {id:'skill_u',   name:'신기 충전',    desc:'신기를 10 즉시 회복한다.',              cost:0,  icon:'✨', special:'recharge'},
];
