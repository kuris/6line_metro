/* ═══════════════════════════════════════════════════
   scenes/events_part3.js
   6호선 잔혹사: 신당 ~ 신내 (지옥의 종착지)
   — 당신이 아는 그 이름 아래 진정한 어둠이 도사립니다.
   ═══════════════════════════════════════════════════ */

'use strict';

const EVENTS_PART3 = {

  /* ── 신당 (635) ── */
  async ev_sindang(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('신당 — 망령들의 새로운 거처', 'event');
    if (window.HorrorFX) window.HorrorFX.flashRed(500);

    await seq([
      ['신당역. 2호선에서 넘어온 고독사한 망령들이 집단으로 탑승한다.', 'announce', 200],
      ['시장 보따리 안에서 썩은 내와 비릿한 피 내음이 진동한다.', 'narrator', 450],
      ['남루한 노파가 당신 곁에 앉으며 차갑게 당신의 손목을 낚아챈다.', 'narrator', 700],
      ['"이봐... 네 심장은 아직 따뜻하군. 내 보따리에 담아가도 되겠나?"', 'dialog', 1000],
    ]);

    const opts = [
      ['① 노파의 손을 뿌리치고 도망친다', async () => {
        G.health -= 10; G.sanity -= 5; updateStats();
        await seq([
          ['뿌리친 자리에 시커먼 손자국이 남으며 살이 타들어 간다.', 'death', 200],
          ['노파가 꺽꺽대며 웃는다. "도망쳐봐야... 여긴 이미 내 집인걸."', 'dialog', 450],
          ['骸(해) -10 / 魂(혼) -5 — 육신에 새겨진 저주.', 'warn', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 내 심장 대신 業(업)을 내어준다 (협상)', async () => {
        G.score -= 20; G.sanity -= 15; updateStats();
        if (window.HorrorFX) window.HorrorFX.glitch(400);
        await seq([
          ['당신이 쌓아온 운(業)이 검은 연기가 되어 노파의 자루 속으로 빨려 들어간다.', 'death', 200],
          ['"맛있군... 잠시만 살려주마. 다음 역까지는 말이야."', 'dialog', 450],
          ['業(업) -20 / 魂(혼) -15 — 대가로 산 생명.', 'life', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];
    choices(opts);
  },

  /* ── 동묘앞 (636) ── */
  async ev_dongmyo(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('동묘앞 — 유품들의 아우성', 'event');

    await seq([
      ['동묘앞역. 낡은 군복의 할아버지가 카세트테이프 대신 해골들을 가닥가닥 엮어 들고 탄다.', 'narrator', 200],
      ['해골들이 일제히 턱을 딱딱거리며 당신의 이름을 부른다.', 'death', 450],
      ['"젊은이... 이 인생들을 사겠나? 죽음은 참으로 아름다운 법이야."', 'dialog', 700],
    ]);

    const opts = [
      ['① 해골 하나를 건네받는다 (수집)', async () => {
        addItem('속삭이는 두개골');
        G.score += 20; G.sanity -= 10; updateStats();
        await seq([
          ['두개골을 받자 당신의 귓가에 끔찍한 비명이 직접 꽂힌다.', 'death', 200],
          ['"고마워... 고마워..." 해골이 당신의 손을 날카롭게 깨문다.', 'warn', 450],
          ['業(업) +20 / 魂(혼) -10 — 무덤의 파수꾼이 된 기분.', 'life', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 사양하고 고개를 돌린다', async () => {
        G.health -= 5; updateStats();
        await seq([
          ['할아버지가 씁쓸하게 웃자 해골들이 당신을 향해 독설을 내뱉는다.', 'narrator', 200],
          ['骸(해) -5 — 보이지 않는 기운이 심장을 강하게 압박한다.', 'warn', 450],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];
    choices(opts);
  },

  /* ── 창신 (637) ── */
  async ev_changsin(stIdx) {
    TrainPanel.setState('danger');
    TrainPanel.addLog('창신 — 거짓된 신의 광신도', 'warn');
    if (window.HorrorFX) window.HorrorFX.scare();

    await seq([
      ['창신역. 흰 소복을 입은 자들이 전동차 안을 피로 물들이며 뛰어든다.', 'death', 200],
      ['"제물을 바쳐라! 그래야 이 영겁의 회귀가 끝난다!"', 'dialog', 450],
      ['그들이 당신을 에워싸고 날카로운 칼날을 들이민다.', 'narrator', 700],
    ]);

    const opts = [
      ['① 함께 칼을 휘두르며 광기에 동참한다 (공격)', async () => {
        G.score += 30; G.sanity -= 20; G.health -= 10; updateStats();
        await seq([
          ['당신도 모르게 짐승 같은 함성을 지르며 그들과 함께 날뛴다.', 'death', 200],
          ['객차 바닥이 붉은 바다로 변한다. 이제 누가 광신도인가?', 'narrator', 500],
          ['業(업) +30 / 魂(혼) -20 — 피의 축제에 침식되었다.', 'life', 800],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 바닥을 기어서 옆 칸으로 필사적으로 대피한다', async () => {
        G.health -= 15; updateStats();
        await seq([
          ['등 뒤로 칼이 스쳐 지나가며 옷이 찢긴다. 비릿한 쇠 냄새.', 'death', 200],
          ['간신히 문을 걸어 잠그자, 광신도들이 문 유리를 깨물며 흉측하게 웃는다.', 'narrator', 500],
          ['骸(해) -15 — 처절한 생존의 상흔.', 'warn', 800],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];
    choices(opts);
  },

  /* ── 안암 (639) ── */
  async ev_anam(stIdx) {
    TrainPanel.setState('crowded');
    TrainPanel.addLog('안암 — 굶주린 지식의 아귀들', 'event');

    await seq([
      ['안암역. 하반신이 없는 학도들이 책을 씹어 먹으며 객차 안을 기어 다닌다.', 'announce', 200],
      ['그들은 당신의 다리를 붙잡고 애원한다. "당신의 뇌를... 한 조각만... 빌려줘..."', 'death', 450],
      ['검은 잉크가 그들의 눈에서 눈물처럼 흐른다.', 'narrator', 700],
    ]);

    const opts = [
      ['① 지갑에 든 현금을 뿌려 시선을 돌린다', async () => {
        G.score += 5; updateStats();
        await seq([
          ['돈다발이 흩날리자 그들이 바보 같은 웃음을 지으며 돈을 뜯어 먹는다.', 'narrator', 200],
          ['업보(業) +5 — 잠시나마 얻은 추악한 자유.', 'life', 450],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 그들에게 거짓된 정보를 속삭인다 (기만)', async () => {
        G.sanity -= 10; G.score += 15; updateStats();
        if (window.HorrorFX) window.HorrorFX.glitch(300);
        await seq([
          ['당신의 거짓 지식을 삼킨 망령들이 고통스럽게 비명을 지르며 썩어간다.', 'death', 200],
          ['業(업) +15 / 魂(혼) -10 — 영혼을 속이는 교묘한 악의.', 'life', 450],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];
    choices(opts);
  },

  /* ── 석계 (644) ── */
  async ev_seokgye(stIdx) {
    TrainPanel.setState('danger');
    TrainPanel.addLog('석계 — 삼도천의 돌무덤', 'danger');
    if (window.HorrorFX) window.HorrorFX.flashRed(800);

    await seq([
      ['석계역. 전동차 바닥을 뚫고 거대한 강돌들이 무수히 솟아오른다.', 'announce', 200],
      ['객차가 순식간에 망자들의 강물로 채워지기 시작한다. 석계는 시냇물이 아니다.', 'death', 450],
      ['돌물결 속에 갇힌 승객들의 손이 당신의 목을 졸라 가라앉히려 한다.', 'narrator', 700],
    ]);

    const opts = [
      ['① 돌 더미를 타고 올라가 천장에 매달린다', async () => {
        G.health -= 20; updateStats();
        await seq([
          ['날카로운 돌에 온몸이 찢기며 간신히 천장 손잡이를 잡았다.', 'death', 200],
          ['아래에선 비명과 돌 굴러가는 소리가 한참 동안 이어졌다.', 'narrator', 450],
          ['骸(해) -20 — 피에 젖은 구사일생.', 'warn', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 강물 속으로 몸을 던져 함께 흐른다 (순응)', async () => {
        G.infection += 40; G.score += 50; updateStats();
        if (window.HorrorFX) window.HorrorFX.scare();
        await seq([
          ['당신의 몸이 돌처럼 단단해지고 차가워진다. 이제 고통은 없다.', 'death', 200],
          ['당신이 곧 석계(石溪)의 일부가 되었다.', 'narrator', 450],
          ['業(업) +50 / 蝕(식) +40% — 더 이상 인간이 아니다.', 'warn', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];
    choices(opts);
  },

  /* ── 신내 (648) ── */
  async ev_sinnae(stIdx) {
    TrainPanel.setState('danger');
    TrainPanel.addLog('신내 — 신의 썩어가는 내장', 'danger');
    if (window.HorrorFX) window.HorrorFX.flashRed(2000);

    await seq([
      ['종착역, 신내. 전동차가 멈춘 곳은 승강장이 아닌 거대한 유기체의 내부다.', 'announce', 200],
      ['천장과 벽에서 끈적한 위액이 쏟아지며 객차를 녹여내기 시작한다.', 'death', 450],
      ['"여기서 내리면... 진정한 신의 일부가 된다... 내리지 못하면 영원한 루프뿐..."', 'whisper', 800],
    ]);

    const opts = [
      ['① 문 밖으로 뛰어 내려 신의 일부가 된다 (엔딩 분기)', async () => {
        G.sanity = 0; updateStats();
        await seq([
          ['뜨거운 위액 속으로 몸을 던졌다. 의식이 녹아 흐른다.', 'death', 200],
          ['수만 명의 생각과 고통이 하나로 합쳐진다. 아, 이것이 낙원인가.', 'narrator', 500],
          ['지옥의 끝에서 당신은 안식을 찾았다.', 'result', 800],
        ]);
        // 엔딩 씬으로 트리거 (실제로는 ending.js에서 처리)
        if (window.sceneEnding) window.sceneEnding('ascension');
        else sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 거부하고 다시 폐쇄된 전동차 안에 남는다 (루프 지속)', async () => {
        G.health -= 50; G.score += 100; updateStats();
        if (window.HorrorFX) window.HorrorFX.glitch(1000);
        await seq([
          ['문이 닫히고 열차는 다시 어둠 속으로 가속한다. 응암으로 향하는 루프.', 'death', 200],
          ['살아남았으나, 육신은 이미 반쯤 녹아내려 끔찍한 형상이다.', 'narrator', 500],
          ['業(업) +100 — 영원한 순례의 길을 선택했다.', 'life', 800],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];
    choices(opts);
  }

};

window.EVENTS_PART3 = EVENTS_PART3;
