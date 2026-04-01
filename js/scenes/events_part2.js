/* ═══════════════════════════════════════════════════
   scenes/events_part2.js
   6호선 잔혹사: 망원 ~ 이태원
   — 텍스트 속도 최적화: 공포의 호흡을 더 빠르게 가져갑니다.
   ═══════════════════════════════════════════════════ */

'use strict';

const EVENTS_PART2 = {

  /* ── 망원 (621) ── */
  async ev_mangwon(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('망원 — 존재하지 않는 목적지', 'warn');
    if (window.HorrorFX) window.HorrorFX.glitch(400);

    await seq([
      ['문 옆에 서 있는 남자가 당신을 빤히 쳐다보고 있다.', 'narrator', 1200],
      ['"저... 실례합니다. 삼양동으로 가려면 여기서 내려야 하나요?"', 'dialog', 1800],
      ['당신은 알고 있다. 6호선에는 삼양동이라는 역이 존재하지 않는다.', 'death', 2500],
    ]);

    choices([
      ['① "그런 역은 없습니다"라고 말한다', async () => {
        G.sanity -= 10; G.score += 5; updateStats();
        if (window.HorrorFX) window.HorrorFX.flashRed(400);
        await seq([
          ['남자의 입이 기괴하게 벌어지며 웃는다. "내 무덤 말입니다."', 'whisper', 1800],
          ['業(업) +5 / 魂(혼) -10 — 존재하지 않는 자와의 대화.', 'life', 1500],
        ]);
        TrainPanel.playDepart();
        await sceneStationHub(stIdx);
      }],
      ['② 눈을 피하고 무시한다', async () => {
        G.health -= 5; updateStats();
        await seq([
          ['휴대폰 화면에 비친 그의 일그러진 얼굴이 당신의 어깨 위에 있다.', 'death', 1800],
          ['骸(해) -5 — 어깨 위에 남은 보이지 않는 무게.', 'warn', 1500],
        ]);
        TrainPanel.playDepart();
        await sceneStationHub(stIdx);
      }]
    ]);
  },

  /* ── 합정 (622) ── */
  async ev_hapjeong(stIdx) {
    TrainPanel.setState('danger');
    TrainPanel.addLog('합정 — 절두산의 통곡', 'danger');
    if (window.HorrorFX) window.HorrorFX.scare();

    await seq([
      ['합정역 진입. 열차 안의 모든 소음이 마술처럼 사라진다.', 'narrator', 1200],
      ['"찾았다... 우리의 새 우두머리..." 누군가 소름 끼치게 속삭인다.', 'whisper', 2500],
    ]);

    choices([
      ['① "왜 다들 쳐다보는 거죠?"라고 큰 소리로 묻는다', async () => {
        G.health -= 15; G.sanity -= 10; updateStats();
        await seq([
          ['승객들이 일제히 목을 360도 꺾으며 손을 뻗어온다.', 'danger', 1500],
          ['骸(해) -15 / 魂(혼) -10 — 피의 난도질.', 'warn', 1500],
        ]);
        TrainPanel.playDepart();
        await sceneStationHub(stIdx);
      }],
      ['② 숨을 죽이고 비명을 참으며 버틴다', async () => {
        G.sanity -= 20; G.score += 15; updateStats();
        await seq([
          ['승객들이 코앞까지 다가와 당신의 눈동자를 핥고 있다.', 'death', 1800],
          ['業(업) +15 / 魂(혼) -20 — 추악한 권유.', 'life', 1500],
        ]);
        TrainPanel.playDepart();
        await sceneStationHub(stIdx);
      }]
    ]);
  },

  /* ── 상수 (623) ── */
  async ev_sangsu(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('상수 — 가죽 옷의 장인', 'event');

    await seq([
      ['한 젊은이가 다가와 당신의 옷 자락을 만진다.', 'narrator', 1500],
      ['"와, 소재가 너무 좋다. 이거 내 친구 피부랑 똑같은데?"', 'dialog', 2000],
    ]);

    choices([
      ['① 무시하고 빠르게 멀어진다', async () => {
        G.sanity -= 5; updateStats();
        await seq([['"다음에 만나면 네 것도 구경시켜줘..."', 'whisper', 1500]]);
        TrainPanel.playDepart();
        await sceneStationHub(stIdx);
      }],
      ['② "가져가보고 싶으면 해봐"라고 도발한다', async () => {
        G.health -= 10; G.score += 15; updateStats();
        if (window.HorrorFX) window.HorrorFX.flashRed(400);
        await seq([['청년의 손가락이 순간 발톱으로 변해 당신의 팔을 긁는다.', 'death', 1500]]);
        TrainPanel.playDepart();
        await sceneStationHub(stIdx);
      }]
    ]);
  },

  /* ── 광흥창 (624) ── */
  async ev_gwangheungchang(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('광흥창 — 검은 토사물', 'event');

    await seq([
      ['광흥창역. 악취가 진동한다. 피 냄새가 차내를 가득 메운다.', 'narrator', 1200],
      ['술 취한 남자가 바닥에 검은 액체와 유충들을 쏟아내고 있다.', 'death', 1800],
    ]);

    choices([
      ['① 유충들을 짓밟으며 자리를 피한다', async () => {
        G.health -= 5; G.infection += 10; updateStats();
        await seq([['터지는 유충들의 즙이 신발에 튀어 살을 파고든다.', 'warn', 1500]]);
        TrainPanel.playDepart();
        await sceneStationHub(stIdx);
      }],
      ['② 기괴한 호기심으로 유충들을 채집한다', async () => {
        G.sanity -= 15; G.score += 20; updateStats();
        addItem('살아있는 유충 병');
        await seq([['손가락 끝을 타는 유충들의 점액질이 소름 끼치게 부드럽다.', 'highlight', 1500]]);
        TrainPanel.playDepart();
        await sceneStationHub(stIdx);
      }]
    ]);
  },

  /* ── 공덕 (626) ── */
  async ev_gongdeok(stIdx) {
    TrainPanel.setState('danger');
    TrainPanel.addLog('공덕 — 검은 안개의 역', 'warn');
    if (window.HorrorFX) window.HorrorFX.flashRed(800);

    await seq([
      ['공덕역. 문이 열리자마자 정체불명의 검은 안개가 쏟아져 들어온다.', 'death', 1500],
      ['"여기로 와... 같이 썩어내리자... 깨끗해질 거야..."', 'whisper', 2000],
    ]);

    choices([
      ['① 날카로운 도구로 손들을 쳐낸다 (저항)', async () => {
        G.health -= 15; G.score += 15; updateStats();
        await seq([['간신히 문을 닫았지만, 당신의 팔은 이미 검게 멍들어 있다.', 'narrator', 1500]]);
        TrainPanel.playDepart();
        await sceneStationHub(stIdx);
      }],
      ['② 안개 속으로 손을 내밀어 수용한다', async () => {
        G.infection += 30; G.score += 10; updateStats();
        if (window.HorrorFX) window.HorrorFX.glitch(500);
        await seq([['안개가 당신의 팔을 타고 폐 속까지 침투한다. 차갑고 달콤하다.', 'narrator', 1800]]);
        TrainPanel.playDepart();
        await sceneStationHub(stIdx);
      }]
    ]);
  },

  /* ── 삼각지 (628) ── */
  async ev_samgakji(stIdx) {
    TrainPanel.setState('danger');
    TrainPanel.addLog('삼각지 — 큐브의 저주', 'danger');
    if (window.HorrorFX) window.HorrorFX.scare();

    await seq([
      ['삼각지역. 모든 벽이 당신을 비춘다. 거울 속의 존재가 손을 뻗는다.', 'death', 1500],
      ['"하나의 삼각형이 완성되면... 너는 이곳의 부품이 될 거야."', 'whisper', 2000],
    ]);

    choices([
      ['① 거울들을 깨뜨리며 필사적으로 저항한다', async () => {
        G.health -= 20; updateStats();
        await seq([['깨진 유리 조각들이 당신의 온몸에 박히고 피가 거울에 스며든다.', 'death', 1500]]);
        TrainPanel.playDepart();
        await sceneStationHub(stIdx);
      }],
      ['② 거울 속의 자신과 눈을 맞춘다 (수용)', async () => {
        G.sanity -= 35; G.score += 40; updateStats();
        await seq([['거울 속의 존재와 영혼이 뒤바뀌는 듯한 환청이 들린다.', 'death', 1800]]);
        TrainPanel.playDepart();
        await sceneStationHub(stIdx);
      }]
    ]);
  },

  /* ── 이태원 (630) ── */
  async ev_itaewon(stIdx) {
    TrainPanel.setState('crowded');
    TrainPanel.addLog('이태원 — 해골들의 축제', 'warn');
    if (window.HorrorFX) window.HorrorFX.flashRed(1000);

    await seq([
      ['이태원역. 화려한 네온사인 아래 해골 공범들이 춤을 추고 있다.', 'announce', 1200],
      ['해골 하나가 샴페인 잔에 담긴 붉은 "피"를 당신에게 권한다.', 'death', 1800],
    ]);

    choices([
      ['① 잔을 받아들고 함께 미친 듯이 춤춘다', async () => {
        G.infection += 20; G.score += 30; updateStats();
        await seq([['이성이 마비된다. 죽음의 무도회(Danse Macabre)가 시작된다.', 'death', 1800]]);
        TrainPanel.playDepart();
        await sceneStationHub(stIdx);
      }],
      ['② "지옥에나 가라"며 잔을 엎어버린다', async () => {
        G.sanity -= 15; updateStats();
        if (window.HorrorFX) window.HorrorFX.glitch(500);
        await seq([['해골들이 일제히 멈춰 서서 당신을 비난하듯 턱을 딱딱거린다.', 'danger', 1500]]);
        TrainPanel.playDepart();
        await sceneStationHub(stIdx);
      }]
    ]);
  }

};

window.EVENTS_PART2 = EVENTS_PART2;
Object.assign(STATION_EVENTS, EVENTS_PART2);
