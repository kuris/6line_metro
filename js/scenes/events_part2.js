/* ═══════════════════════════════════════════════════
   scenes/events_part2.js
   6호선 잔혹사: 망원 ~ 버티고개 구간
   — 화려함 뒤에 숨겨진 비릿한 원념과 환각
   ═══════════════════════════════════════════════════ */

'use strict';

const EVENTS_PART2 = {

  /* ── 망원 (621) ── */
  async ev_mangwon(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('망원 — 존재하지 않는 목적지', 'warn');
    if (window.HorrorFX) window.HorrorFX.glitch(400);

    await seq([
      ['', 'blank', 0],
      ['망원역. 문 옆에 서 있는 남자가 당신을 빤히 쳐다보고 있다.', 'narrator', 200],
      ['그의 얼굴은 마치 젖은 종이처럼 군데군데 일그러져 있다.', 'whisper', 450],
      ['"저... 실례합니다. 삼양동으로 가려면 여기서 내려야 하나요?"', 'dialog', 700],
      ['당신은 알고 있다. 6호선에는 삼양동이라는 역이 존재하지 않는다.', 'death', 950],
    ]);

    const opts = [
      ['① "그런 역은 없습니다"라고 차갑게 말한다', async () => {
        G.sanity -= 10; G.score += 5; updateStats();
        if (window.HorrorFX) window.HorrorFX.flashRed(300);
        await seq([
          ['남자의 입이 기괴하게 벌어지며 웃는다. 치아가 검은 액체로 가득하다.', 'danger', 200],
          ['"아... 그렇군요. 아직 만들지 않았나 보네요. 내 무덤 말입니다."', 'whisper', 450],
          ['그는 연기처럼 인파 속으로 사라졌고, 당신의 등뒤엔 서늘한 한기만 남았다.', 'result', 700],
          ['業(업) +5 / 魂(혼) -10 — 존재하지 않는 자와의 대화.', 'life', 1000],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 그저 휴대폰만 보며 무시한다', async () => {
        G.health -= 5; updateStats();
        await seq([
          ['시선을 피했지만, 휴대폰 검은 화면에 비친 그의 일그러진 얼굴이', 'danger', 200],
          ['당신의 어깨 위에 턱을 괴고 함께 화면을 보고 있는 것을 보았다.', 'death', 450],
          ['열차가 출발하자 그림자는 사라졌지만, 어깨가 짓눌린 듯 무겁다.', 'result', 700],
          ['骸(해) -5 — 어깨 위에 남은 보이지 않는 무게.', 'warn', 1000],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];
    choices(opts);
  },

  /* ── 합정 (622) ── */
  async ev_hapjeong(stIdx) {
    TrainPanel.setState('danger');
    TrainPanel.addLog('합정 — 절두산의 통곡', 'danger');
    if (window.HorrorFX) window.HorrorFX.scare();

    await seq([
      ['합정역 진입. 열차 안의 모든 소음이 마술처럼 사라진다.', 'narrator', 200],
      ['승객 전원이 미동도 없이 당신만을 노려보고 있다.', 'death', 450],
      ['그들의 목은 이미 한 번 잘렸다가 다시 이어붙인 듯 기괴하게 꺾여 있다.', 'narrator', 700],
      ['"찾았다... 우리의 새 우두머리..." 누군가 아주 작게 소름 끼치게 속삭인다.', 'whisper', 1000],
    ]);

    const opts = [
      ['① "왜 다들 쳐다보는 거죠?"라고 큰 소리로 묻는다', async () => {
        G.health -= 15; G.sanity -= 10; updateStats();
        await seq([
          ['당신의 목소리가 적막을 깨자, 승객들이 일제히 목을 360도 꺾는다.', 'danger', 200],
          ['그들이 손톱이 아닌 뼈 마디로 당신을 긁어내린다.', 'death', 500],
          ['열차가 급제동하며 불이 꺼졌다. 다시 켜졌을 때 당신은 피투성이다.', 'result', 800],
          ['骸(해) -15 / 魂(혼) -10 — 육체와 영혼의 난도질.', 'warn', 1100],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 숨을 죽이고 비명을 참으며 버틴다', async () => {
        G.sanity -= 20; G.score += 15; updateStats();
        await seq([
          ['1분이 영원처럼 느껴진다. 승객들은 당신의 코앞까지 다가와', 'whisper', 200],
          ['당신의 눈동자에 비친 자신들의 모습을 핥고 있다.', 'death', 500],
          ['문이 열리자마자 당신은 도망치듯 내렸다. 비웃음 소리가 등 뒤를 따라온다.', 'result', 800],
          ['業(업) +15 / 魂(혼) -20 — 침묵으로 지켜낸 추악한 생존.', 'life', 1100],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];
    choices(opts);
  },

  /* ── 상수 (623) ── */
  async ev_sangsu(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('상수 — 가죽 옷의 장인', 'event');

    await seq([
      ['상수역. 힙스터들의 웃음소리가 기분 나쁘게 울려 퍼진다.', 'narrator', 200],
      ['한 젊은이가 다가와 당신의 옷 자락을 만진다.', 'narrator', 450],
      ['"와, 소재가 너무 좋다. 이거 내 친구 피부랑 똑같은데? 어디서 샀어?"', 'dialog', 700],
      ['그의 뒤로 수많은 인피(人皮)로 만든 옷들이 전시된 쇼윈도가 지나간다.', 'death', 1000],
    ]);

    const opts = [
      ['① 무시하고 빠르게 멀어진다', async () => {
        G.sanity -= 5; updateStats();
        await seq([
          ['그의 손길이 닿았던 자리가 화상이라도 입은 듯 뜨겁다.', 'narrator', 200],
          ['"다음에 만나면 네 것도 구경시켜줘..."', 'whisper', 450],
          ['魂(혼) -5 — 불쾌한 접촉.', 'warn', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② "가져가보고 싶으면 해봐"라고 도발한다', async () => {
        G.health -= 10; G.score += 15; updateStats();
        if (window.HorrorFX) window.HorrorFX.flashRed(400);
        await seq([
          ['청년의 손가락이 순간 짐승의 발톱으로 변해 당신의 팔을 긁는다.', 'death', 200],
          ['"아하하, 역시 거칠어! 마음에 들어!"', 'dialog', 450],
          ['業(업) +15 / 骸(해) -10 — 피의 대가로 지켜낸 자존심.', 'life', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];
    choices(opts);
  },

  /* ── 광흥창 (624) ── */
  async ev_gwangheungchang(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('광흥창 — 검은 토사물', 'event');

    await seq([
      ['광흥창역. 악취가 진동한다. 쌀 썩는 냄새와 피 냄새가 섞였다.', 'narrator', 200],
      ['술 취한 것처럼 보이는 남자가 바닥에 검은 액체를 쏟아내고 있다.', 'narrator', 450],
      ['액체 속에서 살아있는 유충들이 꿈틀대며 당신의 발목을 향해 기어온다.', 'death', 700],
      ['"다들... 먹어치워라... 내장을 전부..." 남자가 꺽꺽대며 웃는다.', 'whisper', 1000],
    ]);

    const opts = [
      ['① 유충들을 짓밟으며 자리를 피한다', async () => {
        G.health -= 5; G.infection += 10; updateStats();
        await seq([
          ['터지는 유충들의 즙이 신발에 튀어 살을 파고드는 것 같다.', 'narrator', 200],
          ['발이 미세하게 떨린다. 안쪽으로 파고든 것인가.', 'warn', 450],
          ['骸(해) -5 / 蝕(식) +10% — 오염된 육신.', 'warn', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 인벤토리에 있는 물건으로 유충들을 채집한다', async () => {
        G.sanity -= 15; G.score += 20; updateStats();
        addItem('살아있는 유충 병');
        await seq([
          ['기괴한 호기심이 당신을 지배했다. 병 안에 유충들을 담았다.', 'highlight', 200],
          ['병 벽을 긁는 슥슥 소리가 주머니를 타고 전해진다.', 'narrator', 450],
          ['業(업) +20 / 魂(혼) -15 — 금기를 수집한 자.', 'life', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];
    choices(opts);
  },

  /* ── 대흥 (625) ── */
  async ev_daeheung(stIdx) {
    TrainPanel.setState('danger');
    TrainPanel.addLog('대흥 — 지축을 뒤흔드는 비명', 'danger');
    if (window.HorrorFX) window.HorrorFX.glitch(800);

    await seq([
      ['대흥역 진입 전. 열차 바닥이 마치 살아있는 무언가의 심장처럼 맥동한다.', 'narrator', 200],
      ['터널 벽에서 "살려줘!"가 아닌 "죽여줘!"라는 비명이 합창처럼 울려 퍼진다.', 'death', 550],
      ['공진 현상으로 객차 유리가 일제히 금이 가기 시작한다.', 'narrator', 800],
    ]);

    const opts = [
      ['① 귀를 막고 바닥에 엎드린다 (방어)', async () => {
        G.health -= 5; G.sanity -= 5; updateStats();
        await seq([
          ['파편이 머리 위로 쏟아진다. 고막에서 피가 흘러나온다.', 'death', 200],
          ['잠시 후 정적이 찾아왔지만, 당신의 세상은 이제 무음이다.', 'narrator', 450],
          ['骸(해) -5 / 魂(혼) -5 — 무너져 내리는 감각.', 'warn', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 비명 소리에 맞춰 함께 소리 지른다 (동화)', async () => {
        G.sanity -= 20; G.score += 25; updateStats();
        if (window.HorrorFX) window.HorrorFX.flashRed(600);
        await seq([
          ['당신의 비명이 합창에 섞이자 유리가 깨지는 소리가 멈춘다.', 'narrator', 200],
          ['어둠 속에서 무언가 당신을 동료로 인식한 듯 조용히 미소 짓는다.', 'death', 450],
          ['業(업) +25 / 魂(혼) -20 — 광기에 영혼을 한 조각 내어주었다.', 'life', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];
    choices(opts);
  },

  /* ── 공덕 (626) ── */
  async ev_gongdeok(stIdx) {
    TrainPanel.setState('danger');
    TrainPanel.addLog('공덕 — 검은 안개의 역', 'warn');
    if (window.HorrorFX) window.HorrorFX.flashRed(1000);

    await seq([
      ['공덕역. 문이 열리자마자 정체불명의 검은 안개가 쏟아져 들어온다.', 'death', 200],
      ['안개 속에서 수백 명의 손이 나타나 당신을 밖으로 끌어내려 한다.', 'narrator', 450],
      ['"여기로 와... 같이 썩어내리자... 깨끗해질 거야..."', 'whisper', 750],
    ]);

    const opts = [
      ['① 비상용 손도끼로 손들을 쳐낸다 (저항)', async () => {
        G.health -= 15; G.score += 15; updateStats();
        await seq([
          ['안개 속의 손들을 자를 때마다 가루가 되어 흩어진다.', 'death', 200],
          ['간신히 문을 닫았지만, 당신의 팔은 이미 검게 멍들어 있다.', 'narrator', 450],
          ['業(업) +15 / 骸(해) -15 — 처절한 거부.', 'life', 750],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 자진해서 안개 속으로 손을 내민다 (접촉)', async () => {
        G.infection += 30; G.score += 10; updateStats();
        if (window.HorrorFX) window.HorrorFX.glitch(500);
        await seq([
          ['안개가 당신의 팔을 타고 폐 속까지 침투한다. 차갑고 달콤하다.', 'narrator', 200],
          ['당신의 기억 속 소중한 풍경들이 검게 변질되어 간다.', 'warn', 450],
          ['蝕(식) +30% — 이제 당신의 절반은 안개다.', 'warn', 750],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];
    choices(opts);
  },

  /* ── 삼각지 (628) ── */
  async ev_samgakji(stIdx) {
    TrainPanel.setState('danger');
    TrainPanel.addLog('삼각지 — 큐브의 저주', 'danger');
    if (window.HorrorFX) window.HorrorFX.scare();

    await seq([
      ['삼각지역. 입구와 출구의 구분이 사라졌다. 모든 벽이 거울처럼 당신을 비춘다.', 'announce', 200],
      ['거울 속의 당신이 당신의 목을 조르기 위해 유리 밖으로 손을 뻗는다.', 'death', 500],
      ['"하나의 삼각형이 완성되면... 너는 이곳의 부품이 될 거야."', 'whisper', 800],
    ]);

    const opts = [
      ['① 거울들을 발로 차서 모두 깨뜨린다', async () => {
        G.health -= 20; updateStats();
        await seq([
          ['깨진 유리 조각들이 당신의 온몸에 박힌다. 피가 거울 파편에 스며든다.', 'death', 200],
          ['공간이 비틀리더니 간신히 원래의 객차 안으로 튕겨 나왔다.', 'narrator', 500],
          ['骸(해) -20 — 피의 희생으로 얻은 탈출.', 'warn', 800],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 거울 속의 자신과 눈을 맞춘다 (수용)', async () => {
        G.sanity -= 35; G.score += 40; updateStats();
        if (window.HorrorFX) window.HorrorFX.invert(1000);
        await seq([
          ['거울 속의 존재와 영혼이 뒤바뀌는 환상을 경험한다.', 'death', 200],
          ['이제 누가 진짜 당신인가? 어느 세계가 진짜인가?', 'narrator', 500],
          ['業(업) +40 / 魂(혼) -35 — 자아를 잃고 업보를 취했다.', 'life', 900],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];
    choices(opts);
  },

  /* ── 이태원 (630) ── */
  async ev_itaewon(stIdx) {
    TrainPanel.setState('crowded');
    TrainPanel.addLog('이태원 — 해골들의 축제', 'warn');
    if (window.HorrorFX) window.HorrorFX.flashRed(2000);

    await seq([
      ['이태원역. 화려한 네온사인 조명 아래 수많은 해골이 춤을 추고 있다.', 'announce', 200],
      ['신나는 클럽 음악이 비명과 뼈 부딪히는 소리로 변주되어 들린다.', 'narrator', 450],
      ['해골 하나가 샴페인 잔에 담긴 붉은 "피"를 당신에게 권한다.', 'death', 750],
    ]);

    const opts = [
      ['① 잔을 받아들고 함께 미친 듯이 춤춘다', async () => {
        G.infection += 20; G.score += 30; updateStats();
        await seq([
          ['이성이 마비된다. 죽음의 무도회(Danse Macabre)가 시작된다.', 'death', 200],
          ['열차가 출발할 때까지 당신은 자신의 살점이 떨어져 나가는 것도 몰랐다.', 'narrator', 500],
          ['業(업) +30 / 蝕(식) +20% — 영원한 쾌락의 끝.', 'life', 850],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② "지옥에나 가라"며 잔을 엎어버린다', async () => {
        G.sanity -= 15; updateStats();
        if (window.HorrorFX) window.HorrorFX.glitch(600);
        await seq([
          ['해골들이 일제히 멈춰 서서 당신을 비난하듯 턱을 딱딱거린다.', 'danger', 200],
          ['그들의 공허한 안구에서 쏟아지는 원망이 당신을 짓누른다.', 'narrator', 500],
          ['魂(혼) -15 — 환각의 후유증.', 'warn', 800],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];
    choices(opts);
  }

};

window.EVENTS_PART2 = EVENTS_PART2;
