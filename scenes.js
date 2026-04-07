// =======================================
// SCENES — 무당기(巫堂記) 1막 씬 데이터
// =======================================
// fx 포맷:
//   trust: {인물키: 값}   — 인연 변화
//   singi: 값              — 신기 변화
//   deity: {신위키: 값}   — 신위 인연 변화
//   tags: ['태그']         — 신위 매칭 + 민담 조건 추적
//   item: '아이템키'        — 아이템 획득
//   mindam: '민담키'        — 민담 즉시 획득
//   flag: {키: 값}          — 플래그 설정
//
// locked: N — 신기 N 소모 필요. 0 또는 생략 = 무료

const SCENES_MAEHYANG = {

  // ============================================================
  // 씬 1-1: 귀가
  // ============================================================

  's0': {
    sp:'narrator', illus:'🌆', bg:'shrine',
    txt:'저녁 7시.\n서울 외곽, 어느 빌라 지하 계단.\n\n간판도 없는 반지하. 문 앞에 금줄이 걸려 있다.',
    ch:[{t:'계속하기 ▶', n:'s1', fx:{}}]
  },

  's1': {
    sp:'maehyang', illus:'🕯️', bg:'shrine',
    txt:'…또 이 냄새.\n\n향 냄새. 어릴 때부터 지독하게 싫었다.\n아직도 어딘가에 배어 있는 것 같은 냄새.',
    ch:[{t:'계속하기 ▶', n:'s2', fx:{}}]
  },

  's2': {
    sp:'neighbor', illus:'🏠', bg:'shrine',
    txt:'"어, 매향이 왔어? 오래됐다."\n\n"어머니가 쓰러지기 전에—\n이걸 꼭 네가 받아야 한다고 하셨어."\n\n아주머니가 작은 부채를 내밀었다.',
    ch:[{t:'계속하기 ▶', n:'s3', fx:{}}]
  },

  // === 씬 1-1 메인 선택지 ===
  's3': {
    sp:'maehyang', illus:'🪭', bg:'shrine',
    txt:'신물(神物).\n\n어머니가 20년째 쓰던 것.\n받는다는 건—\n\n받는다는 게 무슨 의미인지 모르지 않는다.',
    ch:[
      {t:'"알겠어요. 받을게요."',
       n:'s3a', fx:{trust:{mother:5}, singi:10, tags:['수용'], flag:{shinnul:true}, item:'shinnul'},
       hint:'+신기 10'},
      {t:'"일단 병원부터 가야 해요."',
       n:'s3b', fx:{trust:{mother:-3}, singi:0, tags:['현실']}},
      {t:'(아무 말도 하지 않고 바라본다.)',
       n:'s3c', fx:{singi:5, tags:['관찰'], deity:{chilsung:3}},
       hint:'+신기 5'},
    ]
  },

  // A 루트: 신물 수락
  's3a': {
    sp:'narrator', illus:'🪭', bg:'shrine',
    txt:'생각보다 무거웠다.\n\n아니, 무게는 없었다. 그런데 손이 무거웠다.',
    ch:[{t:'계속하기 ▶', n:'s4a', fx:{}}]
  },

  's4a': {
    sp:'neighbor', illus:'🏠', bg:'shrine',
    txt:'"잘 생각했어. 어머니도 기다리셨을 거야."\n\n잠깐의 침묵.\n\n"신당은… 네가 봐줄 거지?"',
    ch:[
      {t:'신당 문을 한 번 더 본다.',  n:'s5a',  fx:{singi:2, tags:['관찰']}},
      {t:'대답하지 않고 나온다.',      n:'s5bc', fx:{trust:{neighbor:-2}}},
    ]
  },

  // B/C 루트 공통 진입
  's3b': {
    sp:'narrator', illus:'🏥', bg:'dark',
    txt:'부채는 아주머니 손에 그대로 있었다.\n\n어머니는 응급실 침대에 누워 있었다.\n맥박은 고르게 뛰었다.',
    ch:[{t:'계속하기 ▶', n:'s3b_2', fx:{}}]
  },

  's3b_2': {
    sp:'mother', illus:'🕯️', bg:'dark',
    txt:'"…왔구나."\n\n눈을 뜨지 않고 말했다.\n\n"네가 안 받을 것 같아서."',
    ch:[
      {t:'"나 아직 뭔지도 모르잖아."',  n:'s4bc', fx:{trust:{mother:-2}, tags:['현실']}},
      {t:'(아무 말도 하지 않는다.)',      n:'s4bc', fx:{tags:['관찰']}},
    ]
  },

  's3c': {
    sp:'narrator', illus:'🪭', bg:'shrine',
    txt:'부채를 내려다봤다.\n\n내리지 않았다. 올리지도 않았다.\n그냥 거기, 그 무게가 있었다.',
    ch:[{t:'계속하기 ▶', n:'s4bc', fx:{}}]
  },

  // 공통: 씬 1-1b 마무리
  's4bc': {
    sp:'neighbor', illus:'🏠', bg:'shrine',
    txt:'"그래도 신당은 좀 봐줄 수 있지?"\n\n"손님이 왔는데 문이 잠겨 있대."\n\n문자 알림이 왔다.',
    ch:[
      {t:'신당 문을 확인하러 간다.',   n:'s5bc', fx:{trust:{neighbor:3}, singi:2}},
      {t:'내일 할게요, 라고 답한다.', n:'s5bc', fx:{trust:{neighbor:-3}, tags:['현실']}},
    ]
  },

  // A 루트 → 씬 1-2 분기점
  's5a': {
    sp:'narrator', illus:'🕯️', bg:'shrine',
    txt:'신당 안.\n\n어머니가 없는 자리. 신단(神壇) 위에 부채가 놓였다.\n\n가방 속 핸드폰이 울렸다. 면접 알림.\n내일 오후 2시.',
    ch:[{t:'계속하기 ▶', n:'s5a_2', fx:{}}]
  },

  's5a_2': {
    sp:'narrator', illus:'📱', bg:'shrine',
    txt:'신물을 받았다.\n\n신당에 있는 건 자연스럽다.\n그런데 면접은—\n\n이상하게, 생각이 잘 안 났다.',
    ch:[{t:'계속하기 ▶', n:'s6_choice', fx:{}}]
  },

  // B/C 루트 → 씬 1-2
  's5bc': {
    sp:'narrator', illus:'🌆', bg:'dark',
    txt:'고시원으로 돌아왔다.\n\n벽에 붙은 면접 일정표. 내일 오후 2시.\n\n핸드폰에 아주머니 문자가 왔다.\n"그 손님, 아직 기다린대."',
    ch:[{t:'계속하기 ▶', n:'s6_choice', fx:{}}]
  },

  // ============================================================
  // 씬 1-2: 현실 충돌
  // ============================================================

  // A 루트 전용: 강제 면접 미룸
  's6_forced_A': {
    sp:'narrator', illus:'📱', bg:'dark',
    txt:'오전 11시. 카톡이 왔다.\n\n아주머니: "매향아, 그 손님 오늘 또 왔어."\n\n부채가 가방 안에서 진동하는 것 같았다.\n아니, 진동이 아니었다. 그냥—무거웠다.',
    ch:[{t:'계속하기 ▶', n:'s6_forced_A2', fx:{}}]
  },

  's6_forced_A2': {
    sp:'maehyang', illus:'📱', bg:'dark',
    txt:'(면접 담당자에게 문자를 보냈다.)\n\n"개인 사정이 생겼습니다.\n일정 조정이 가능할까요?"\n\n보내놓고 화면을 껐다. 후회는 나중에.',
    ch:[{t:'계속하기 ▶', n:'s6_choice', fx:{trust:{mother:5}, singi:5, tags:['수용'], flag:{faceDelayed:true}}}]
  },

  // 공통 선택지 (B/C 루트는 여기서 바로)
  's6_choice': {
    sp:'narrator', illus:'⏰', bg:'dark',
    txt:'오후 2시까지 3시간.\n\n신당까지 버스로 40분.\n\n핸드폰이 또 울렸다.',
    ch:[
      {t:'"신당에는 못 간다. 면접이 먼저다."',
       n:'s7a', fx:{trust:{mother:-5}, tags:['현실']}},
      {t:'"면접은 다음에도 있다. 신당에 간다."',
       n:'s7b', fx:{trust:{mother:8}, singi:5, tags:['수용'], deity:{samshin:5}},
       hint:'+신기 5'},
      {t:'"일정 조정 요청하고, 신당도 잠깐 간다."',
       n:'s7c', locked:15,
       fx:{trust:{mother:5}, singi:-10, tags:['지혜'], deity:{chilsung:5}},
       hint:'🔒 신기 15 소모'},
    ]
  },

  // 씬 1-2 결과 분기
  's7a': {
    sp:'narrator', illus:'🏢', bg:'dark',
    txt:'면접은 잘 됐다. 아마도.\n\n집에 돌아오는 길, 아주머니 문자.\n"손님 그냥 갔어. 많이 힘들어 보이더라."\n\n읽고 껐다.',
    ch:[{t:'계속하기 ▶', n:'s8', fx:{trust:{neighbor:-3}, tags:['현실']}}]
  },

  's7b': {
    sp:'narrator', illus:'🕯️', bg:'shrine',
    txt:'버스 안에서 면접 준비 자료를 꺼냈다.\n한 글자도 안 들어왔다.\n\n신당 문을 열었다. 손님은 기다리고 있었다.\n\n눈이 퉁퉁 부어 있었다.',
    ch:[{t:'계속하기 ▶', n:'s8', fx:{trust:{woman:5}, singi:3}}]
  },

  's7c': {
    sp:'narrator', illus:'📱', bg:'dark',
    txt:'담당자가 흔쾌히 승낙했다. 오후 4시로.\n\n10분 있었다. 신당에.\n손님한테 다음에 오라고 했다.\n\n버스 안에서 면접 자료를 폈다.\n이번엔 조금 읽혔다.',
    ch:[{t:'계속하기 ▶', n:'s8', fx:{trust:{mother:3}, trust2:{woman:3}}}]
  },

  // ============================================================
  // 씬 1-3: 첫 신위 등장
  // ============================================================

  's8': {
    sp:'narrator', illus:'🚇', bg:'subway',
    txt:'저녁 지하철.\n\n2호선. 창밖 터널이 흘렀다.\n\n매향은 앉아서 졸고 있었다.\n소리가 없어졌다.',
    ch:[{t:'계속하기 ▶', n:'s8_stop', fx:{}}]
  },

  's8_stop': {
    sp:'narrator', illus:'🚇', bg:'subway',
    txt:'지하철이 멈췄다.\n\n아니, 멈춘 게 아니었다. 소리가 없어졌다.\n\n사람들은 그대로였다.\n핸드폰을 보고, 이어폰을 끼고, 자고 있었다.\n\n움직이지 않았다.',
    ch:[{t:'계속하기 ▶', n:'s8_chil', fx:{}}]
  },

  // 칠성신 등장 — 루트별 분기는 s8에서 오는 경로 태그로 구분
  // (단순화: 하나의 씬, 루트별 텍스트 차이는 후속 개발에서 처리)
  's8_chil': {
    sp:'chilsung', illus:'⭐', bg:'dark',
    txt:'맞은편 좌석.\n\n노인이었다. 아니, 노인처럼 보였다.\n\n"왔구나."',
    ch:[{t:'계속하기 ▶', n:'s8_chil2', fx:{deity:{chilsung:2}}}]
  },

  's8_chil2': {
    sp:'maehyang', illus:'🕯️', bg:'dark',
    txt:'"…누구세요."\n\n물었다. 어디서 나온 말인지 몰랐다.',
    ch:[{t:'계속하기 ▶', n:'s8_chil3', fx:{}}]
  },

  's8_chil3': {
    sp:'chilsung', illus:'⭐', bg:'dark',
    txt:'"네 어머니는 하루에 세 번씩 내 이름을 불렀다."\n\n"칠성신(七星神)이다."\n\n침묵이 길었다.',
    ch:[{t:'계속하기 ▶', n:'s9_choice', fx:{deity:{chilsung:3}}}]
  },

  // 씬 1-3 메인 선택지
  's9_choice': {
    sp:'chilsung', illus:'⭐', bg:'dark',
    txt:'"네게 묻겠다."\n\n"왜 왔느냐."',
    ch:[
      {t:'"당신이 뭔데 저한테 묻습니까."',
       n:'s9a', fx:{deity:{chilsung:3}, tags:['저항']},
       hint:'칠성신 +인연 3'},
      {t:'"…모르겠어요. 그냥 여기 있었어요."',
       n:'s9b', fx:{deity:{chilsung:5}, singi:5, tags:['관찰']},
       hint:'+신기 5'},
      {t:'"거래를 제안하고 싶습니다."',
       n:'s9c', locked:20,
       fx:{deity:{chilsung:15}, singi:-15, tags:['지혜'], flag:{dealProposed:true}},
       hint:'🔒 신기 20 소모'},
    ]
  },

  // 선택지 결과 분기
  's9a': {
    sp:'chilsung', illus:'⭐', bg:'dark',
    txt:'"…"\n\n침묵이 길었다.\n\n"좋아. 그 질문이 더 낫군."',
    ch:[{t:'계속하기 ▶', n:'s10', fx:{deity:{chilsung:2}}}]
  },

  's9b': {
    sp:'chilsung', illus:'⭐', bg:'dark',
    txt:'"정직하군."\n\n노인이 처음으로 표정을 바꿨다.\n딱딱한 게 아니라, 조금—달라졌다.',
    ch:[{t:'계속하기 ▶', n:'s10', fx:{deity:{chilsung:2}}}]
  },

  's9c': {
    sp:'chilsung', illus:'⭐', bg:'dark',
    txt:'"이름도 모르는 신에게. 거래를."\n\n긴 침묵.\n\n"…좋다."',
    ch:[{t:'계속하기 ▶', n:'s9c2', fx:{deity:{chilsung:5}}}]
  },

  's9c2': {
    sp:'maehyang', illus:'🕯️', bg:'dark',
    txt:'"어머니가 깨어나는 거요."\n\n어디서 나온 말인지 몰랐다.\n\n칠성신이 처음으로 웃었다.',
    ch:[{t:'계속하기 ▶', n:'s9c3', fx:{deity:{chilsung:5}, singi:15, flag:{dealMade:true}}}]
  },

  's9c3': {
    sp:'chilsung', illus:'⭐', bg:'dark',
    txt:'"그건 내 영역이 아니다."\n\n"하지만—시간을 줄 수 있다."\n\n"굿을 마칠 때까지."',
    ch:[{t:'계속하기 ▶', n:'s10', fx:{}}]
  },

  // 씬 1-3 공통 마무리
  's10': {
    sp:'chilsung', illus:'⭐', bg:'dark',
    txt:'"네 어머니가 부탁했다."\n\n"말해줄 수 없다."\n\n"네가 스스로 알아야 한다. 그게 조건이다."',
    ch:[{t:'계속하기 ▶', n:'s10_wake', fx:{singi:20}}]
  },

  's10_wake': {
    sp:'narrator', illus:'🚇', bg:'subway',
    txt:'지하철이 움직이고 있었다. 소리가 돌아왔다.\n\n성수역이었다.\n가방 속 핸드폰이 울렸다.\n\n아주머니였다.',
    ch:[{t:'계속하기 ▶', n:'s11', fx:{}}]
  },

  // ============================================================
  // 씬 1-4: 의뢰인
  // ============================================================

  's11': {
    sp:'neighbor', illus:'🏠', bg:'dark',
    txt:'"아가, 매향이 왔어? 우리 딸이 좀 이상해."\n\n"3주째 말을 안 해. 병원은 다 가봤는데."\n\n"혹시…봐줄 수 있어?"',
    ch:[{t:'계속하기 ▶', n:'s12_choice', fx:{}}]
  },

  // 씬 1-4 메인 선택지
  's12_choice': {
    sp:'maehyang', illus:'🕯️', bg:'dark',
    txt:'문 앞.\n\n소금이 뿌려져 있었다.\n\n나는 무당이 아니다.\n알고 있었다.\n그런데 발이 안 떨어졌다.',
    ch:[
      {t:'"들어가도 될까요."',
       n:'s13a', fx:{trust:{woman:10}, singi:5, tags:['수용'], deity:{sungju:8}},
       hint:'+신기 5'},
      {t:'"어머니한테 연락드릴게요."',
       n:'s13b', fx:{trust:{woman:-5}, tags:['현실']}},
      {t:'(눈을 감아본다.)',
       n:'s13c', locked:10,
       fx:{trust:{woman:15}, singi:-5, tags:['직관'], deity:{chilsung:5}, item:'eyeclosed'},
       hint:'🔒 신기 10 소모'},
    ]
  },

  // 집 안 루트
  's13a': {
    sp:'narrator', illus:'👁️', bg:'dark',
    txt:'초등학생 여자아이였다.\n이불을 뒤집어쓰고 있었다.\n\n도망가지 않았다.\n그게 이상했다.',
    ch:[{t:'계속하기 ▶', n:'s13a2', fx:{}}]
  },

  's13a2': {
    sp:'child', illus:'👁️', bg:'dark',
    txt:'"언니도 보여?"\n\n속삭이듯 말했다.\n\n"저기 구석에."',
    ch:[
      {t:'"뭐가 보여?"',
       n:'s13a3', fx:{trust:{child:15}, singi:5, tags:['진실'], mindam:'arang'},
       hint:'민담 아랑 설화 획득'},
      {t:'"아무것도 없어."',
       n:'s13a4', fx:{trust:{child:-5}, tags:['현실']}},
    ]
  },

  's13a3': {
    sp:'child', illus:'👁️', bg:'dark',
    txt:'"여자요. 머리가 길어요."\n\n"계속 울고 있어요."\n\n매향은 구석을 봤다.\n아무것도 없었다.\n그런데 차가웠다.',
    ch:[{t:'계속하기 ▶', n:'s14', fx:{deity:{gumiho:5}, trust:{child:5}}}]
  },

  's13a4': {
    sp:'narrator', illus:'👁️', bg:'dark',
    txt:'아이가 다시 이불 속으로 들어갔다.\n\n매향은 방을 나왔다.\n계단에서 잠깐 멈췄다.\n\n추웠다.',
    ch:[{t:'계속하기 ▶', n:'s14', fx:{}}]
  },

  // 연락 루트
  's13b': {
    sp:'narrator', illus:'📱', bg:'dark',
    txt:'어머니는 전화를 안 받았다.\n\n당연히.\n\n아주머니에게 죄송하다고 문자를 보냈다.\n답장이 없었다.\n\n그게 더 무거웠다.',
    ch:[{t:'계속하기 ▶', n:'s14', fx:{trust:{neighbor:-5}}}]
  },

  // 직관 루트
  's13c': {
    sp:'narrator', illus:'👁️', bg:'dark',
    txt:'눈을 감았다.\n\n뭔가 보일 거라고 생각하지 않았다.\n\n보였다.\n구석에 뭔가—빛 같은 게.\n\n눈을 떴다. 없었다.',
    ch:[{t:'계속하기 ▶', n:'s13c2', fx:{deity:{chilsung:3}}}]
  },

  's13c2': {
    sp:'child', illus:'👁️', bg:'dark',
    txt:'"언니 보였어?"\n\n아이가 이불 밖으로 고개를 내밀었다.\n\n처음으로 말했다.',
    ch:[{t:'계속하기 ▶', n:'s14', fx:{trust:{child:20}, singi:10, tags:['직관'], deity:{gumiho:8}}}]
  },

  // 씬 1-4 마무리 → 씬 1-5
  's14': {
    sp:'narrator', illus:'🌙', bg:'dark',
    txt:'밤 11시.\n\n어머니한테 문자가 왔다.\n"굿을 해야 한다."\n\n두 글자.\n\n매향은 오래 화면을 봤다.',
    ch:[{t:'계속하기 ▶', n:'s15', fx:{}}]
  },

  // ============================================================
  // 씬 1-5: 첫 굿
  // ============================================================

  's15': {
    sp:'narrator', illus:'🕯️', bg:'shrine',
    txt:'신당에 혼자였다.\n\n향도 없었다. 장구도 없었다.\n어머니 무복(巫服) 한 벌.\n신단 위 신물.\n\n그게 전부였다.',
    ch:[{t:'계속하기 ▶', n:'s15_chil', fx:{}}]
  },

  // 칠성신 등장 (인연도 따라 다름)
  's15_chil': {
    sp:'chilsung', illus:'⭐', bg:'shrine',
    txt:'"왔군."\n\n어디서 나온 목소리인지 몰랐다.\n\n"오늘이 그날이군."',
    ch:[{t:'계속하기 ▶', n:'s16_choice', fx:{}}]
  },

  // 씬 1-5 핵심 선택지
  's16_choice': {
    sp:'maehyang', illus:'🪭', bg:'shrine',
    txt:'무복이 있었다.\n\n들었다가, 내려놨다가, 다시 들었다.\n\n입으면—\n뭔가 달라진다는 걸 알고 있었다.',
    ch:[
      {t:'(무복을 입는다.)',
       n:'s17a', fx:{trust:{mother:10}, singi:5, tags:['수용'], deity:{samshin:10}},
       hint:'삼신할머니 주목'},
      {t:'(무복 없이 신단 앞에 선다.)',
       n:'s17b', fx:{trust:{mother:5}, tags:['저항']}},
      {t:'칠성신에게 먼저 말을 건다.',
       n:'s17c', locked:30,
       fx:{deity:{chilsung:15}, singi:-20, tags:['지혜'], flag:{dealComplete:true}},
       hint:'🔒 신기 30 소모 · 거래 완성'},
    ]
  },

  // 굿 진행 — A/B 공통
  's17a': {
    sp:'narrator', illus:'🪭', bg:'shrine',
    txt:'무거웠다.\n\n예상보다 훨씬.\n\n무게는 없었는데—손이 무거웠다.',
    ch:[{t:'계속하기 ▶', n:'s17_ritual', fx:{}}]
  },

  's17b': {
    sp:'narrator', illus:'🕯️', bg:'shrine',
    txt:'뭘 해야 하는지 몰랐다.\n\n어머니가 하던 걸 기억해냈다.\n손을 모았다. 눈을 감았다.\n\n5분이 지났다.\n아무 일도 일어나지 않았다.',
    ch:[{t:'계속하기 ▶', n:'s17_ritual', fx:{}}]
  },

  's17_ritual': {
    sp:'narrator', illus:'🕯️', bg:'shrine',
    txt:'새벽 2시였다.\n\n신단 위 물그릇이 흔들렸다.\n바람이 없는데.\n\n칠성신이 어디선가 말했다.',
    ch:[{t:'계속하기 ▶', n:'s18_choice', fx:{singi:5}}]
  },

  // 최종 선택: 계약 여부
  's18_choice': {
    sp:'chilsung', illus:'⭐', bg:'shrine',
    txt:'"충분하다."\n\n"한 가지만 묻겠다."\n\n"이름을 말할 수 있느냐."',
    ch:[
      {t:'"이매향.\n오늘부터 신을 모시겠습니다."',
       n:'end_a', fx:{deity:{chilsung:20}, singi:15, tags:['수용']}},
      {t:'(아무 말도 하지 않는다.)',
       n:'end_b', fx:{trust:{mother:15}, tags:['저항']}},
    ]
  },

  // 거래 루트 굿
  's17c': {
    sp:'chilsung', illus:'⭐', bg:'shrine',
    txt:'"조건을 말해라."\n\n"어머니가 깨어나는 거예요."\n\n칠성신이 웃지 않았다.\n대신—고개를 끄덕였다.',
    ch:[{t:'계속하기 ▶', n:'s17c2', fx:{}}]
  },

  's17c2': {
    sp:'narrator', illus:'🕯️', bg:'shrine',
    txt:'굿이 시작됐다.\n\n매향이 시작한 게 아니었다.\n그냥—시작됐다.\n\n새벽 1시였다.',
    ch:[{t:'계속하기 ▶', n:'end_c', fx:{singi:20, deity:{chilsung:15}}}]
  },

  // ============================================================
  // 엔딩
  // ============================================================

  'end_a': {
    clr:true, ep:1, next:null,
    ending:'순응 엔딩',
    badge:'계약 성립',
    col:'#c084fc',
    txt:'칠성신이 말했다.\n\n"들었다."\n\n그게 전부였다.\n그게 전부인데—충분했다.',
  },

  'end_b': {
    clr:true, ep:1, next:null,
    ending:'저항 엔딩',
    badge:'독자적 루트',
    col:'#94a3b8',
    txt:'굿은 끝났다.\n계약은 없었다.\n\n새벽 4시. 어머니한테서 문자가 왔다.\n"일어났다."\n\n매향은 서울행 첫차를 검색했다.',
  },

  'end_c': {
    clr:true, ep:1, next:null,
    ending:'거래 엔딩',
    badge:'진 루트 씨앗',
    col:'#fbbf24',
    txt:'어머니가 깨어났을 때,\n매향은 신당 바닥에 앉아 있었다.\n\n"혼자 했어?"\n\n매향은 대답하지 않았다.\n어머니는 더 묻지 않았다.',
  },
};

// --- 전체 씬 맵 ---
const ALL_SCENES = {
  maehyang: SCENES_MAEHYANG,
};
