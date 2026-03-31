/* ═══════════════════════════════════════════════════
   scenes/events_part3.js
   6호선 잔혹사: 신당 ~ 신내
   — 유실된 궤도(버티고개, 돌곶이, 태릉입구, 봉화산) 복구 및 속도 최적화
   ═══════════════════════════════════════════════════ */

'use strict';

const EVENTS_PART3 = {

  /* ── 버티고개 (632) [유실 복구] ── */
  async ev_berti(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('버티고개 — 버텨야 하는 언덕', 'event');
    await seq([
      ['버티고개역. 가파른 터널 속에서 무언가 거대한 것이 열차를 뒤쫓아온다.', 'danger', 1200],
      ['"버텨... 버티지 못하면... 삼켜질 거야..." 벽면이 요동친다.', 'whisper', 1800],
    ]);
    choices([
      ['① 창문을 열고 뒤를 살핀다', async () => {
        G.sanity -= 15; updateStats();
        if (window.HorrorFX) window.HorrorFX.scare();
        await seq([['거대한 눈동자가 터널 전체를 메운 채 당신을 노려보고 있다!', 'death', 1500]]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 바닥에 엎드려 숨을 죽인다', async () => {
        G.health -= 10; updateStats();
        await seq([['열차가 요동치며 누군가의 육중한 발소리가 지붕 위를 지나간다.', 'narrator', 1500]]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ]);
  },

  /* ── 신당 (635) ── */
  async ev_sindang(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('신당 — 망령들의 거처', 'event');
    if (window.HorrorFX) window.HorrorFX.flashRed(500);

    await seq([
      ['신당역. 시장 보따리 안에서 썩은 내와 비릿한 피 내음이 진동한다.', 'narrator', 1200],
      ['"이봐... 네 심장은 아직 따뜻하군. 내 보따리에 담아가도 되겠나?"', 'dialog', 2000],
    ]);

    choices([
      ['① 노파의 손을 뿌리치고 도망친다', async () => {
        G.health -= 10; G.sanity -= 5; updateStats();
        await seq([['뿌리친 자리에 시커먼 손자국이 남으며 살이 타들어 간다.', 'death', 1500]]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 내 심장 대신 業(업)을 내어준다', async () => {
        G.score -= 20; G.sanity -= 15; updateStats();
        if (window.HorrorFX) window.HorrorFX.glitch(400);
        await seq([['당신의 業이 검은 연기가 되어 노파의 자루 속으로 빨려 들어간다.', 'death', 1500]]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ]);
  },

  /* ── 동묘앞 (636) ── */
  async ev_dongmyo(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('동묘앞 — 유품들의 아우성', 'event');
    await seq([
      ['동묘앞역. 해골들이 일제히 턱을 딱딱거리며 당신의 이름을 부른다.', 'death', 1500],
      ['"젊은이... 이 인생들을 사겠나? 죽음은 참으로 아름다운 법이야."', 'dialog', 1800],
    ]);
    choices([
      ['① 해골 하나를 건네받는다 (수집)', async () => {
        addItem('속삭이는 두개골');
        G.score += 20; G.sanity -= 10; updateStats();
        await seq([['"고마워... 고마워..." 해골이 당신의 손을 날카롭게 깨문다.', 'warn', 1500]]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 사양하고 고개를 돌린다', async () => {
        G.health -= 5; updateStats();
        await seq([['보이지 않는 기운이 심장을 강하게 압박하며 지나간다.', 'warn', 1500]]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ]);
  },

  /* ── 안암 (639) ── */
  async ev_anam(stIdx) {
    TrainPanel.setState('crowded');
    TrainPanel.addLog('안암 — 굶주린 지식의 아귀들', 'event');
    await seq([
      ['안암역. 하반신이 없는 학도들이 책을 씹어 먹으며 객차를 기어 다닌다.', 'announce', 1500],
      ['"당신의 뇌를... 한 조각만..." 검은 잉크가 그들의 눈에서 흐른다.', 'death', 2000],
    ]);
    choices([
      ['① 지갑에 든 현금을 뿌려 시선을 돌린다', async () => {
        G.score += 10; updateStats();
        await seq([['돈다발을 삼키는 소름끼치는 웃음 소리가 열차 안을 가득 채운다.', 'narrator', 1500]]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 그들에게 거짓된 정보를 속삭인다', async () => {
        G.sanity -= 10; G.score += 15; updateStats();
        if (window.HorrorFX) window.HorrorFX.glitch(300);
        await seq([['당신의 거짓을 삼킨 망령들이 비명을 지르며 썩어간다.', 'death', 1500]]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ]);
  },

  /* ── 돌곶이 (643) [유실 복구] ── */
  async ev_dolgoji(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('돌곶이 — 뾰족한 운명', 'event');
    await seq([
      ['돌곶이역. 천장에서 고드름처럼 날카로운 돌들이 자라나기 시작한다.', 'danger', 1200],
      ['돌들이 떨어질 때마다 승객들의 비명 소리가 들린다.', 'death', 1800],
    ]);
    choices([
      ['① 몸을 낮추고 좌석 밑으로 숨는다', async () => {
        G.health -= 15; updateStats();
        await seq([['떨어지는 파편에 등이 찢겨나가는 감각이 느껴진다.', 'warn', 1500]]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 돌 하나를 잡아 무기로 삼는다', async () => {
        addItem('부서진 돌조각');
        G.score += 20; updateStats();
        await seq([['손바닥이 찢어지며 피가 돌 속으로 스며든다.', 'death', 1500]]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ]);
  },

  /* ── 태릉입구 (645) [유실 복구] ── */
  async ev_taereung(stIdx) {
    TrainPanel.setState('crowded');
    TrainPanel.addLog('태릉입구 — 시든 장미의 무덤', 'warn');
    await seq([
      ['태릉입구역. 7호선으로 향하는 통로에서 썩은 꽃향기가 진동한다.', 'narrator', 1200],
      ['가루가 된 장미 꽃잎들이 눈을 찌를 듯이 흩날린다.', 'death', 1500],
    ]);
    choices([
      ['① 꽃잎들을 들이마신다', async () => {
        G.infection += 20; updateStats();
        await seq([['폐 속에서 식물들이 자라나는 듯한 기괴한 통증이 느껴진다.', 'warn', 1500]]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 코와 입을 막고 환승 구역을 피한다', async () => {
        G.sanity -= 10; updateStats();
        await seq([['뒤에서 누군가 꽃 묻은 손으로 당신의 목을 조르려 한다!', 'danger', 1500]]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ]);
  },

  /* ── 봉화산 (647) [유실 복구] ── */
  async ev_bonghwasan(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('봉화산 — 꺼지지 않는 연기', 'event');
    await seq([
      ['봉화산역. 승강장 전체가 자욱한 연기로 가득 차 있어 앞을 볼 수 없다.', 'narrator', 1200],
      ['연기 속에서 봉화에 구워지는 사람들의 냄새가 난다.', 'death', 1800],
    ]);
    choices([
      ['① 연기를 뚫고 밖으로 나간다', async () => {
        G.health -= 20; updateStats();
        await seq([['살이 타버리는 고통과 함께 당신의 기억 일부가 소실된다.', 'danger', 1500]]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 열차 깊숙한 곳으로 몸을 숨긴다', async () => {
        G.sanity -= 15; updateStats();
        await seq([['연기 속에서 수천 개의 눈동자가 당신을 찾아내려 한다.', 'whisper', 1500]]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ]);
  },

  /* ── 신내 (648) ── */
  async ev_sinnae(stIdx) {
    TrainPanel.setState('danger');
    TrainPanel.addLog('신내 — 신의 썩어가는 내장', 'danger');
    if (window.HorrorFX) window.HorrorFX.flashRed(1500);

    await seq([
      ['종착역, 신내. 이곳은 거대한 유기체의 내부다.', 'announce', 1500],
      ['"여기서 내리면... 진정한 신의 일부가 된다... 아니면 영원한 루프뿐..."', 'whisper', 2500],
    ]);

    choices([
      ['① 문 밖으로 뛰어 내려 신의 일부가 된다', async () => {
        G.sanity = 0; updateStats();
        await seq([
          ['뜨거운 위액 속으로 몸을 던졌다. 의식이 녹아 흐른다.', 'death', 1500],
          ['지옥의 끝에서 당신은 안식을 찾았다.', 'result', 1800],
        ]);
        if (window.sceneEnding) window.sceneEnding('ascension');
        else sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 거부하고 루프를 지속한다', async () => {
        G.health -= 50; G.score += 100; updateStats();
        if (window.HorrorFX) window.HorrorFX.glitch(800);
        await seq([
          ['문이 닫히고 열차는 다시 어둠 속으로 가속한다. 응암으로 향하는 루프.', 'death', 1500],
          ['業(업) +100 — 영원한 순례의 길을 선택했다.', 'life', 1800],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ]);
  }

};

window.EVENTS_PART3 = EVENTS_PART3;
