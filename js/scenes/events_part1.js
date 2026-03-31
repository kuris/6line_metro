/* ═══════════════════════════════════════════════════
   scenes/events_part1.js
   6호선 잔혹사: 응암 ~ 월드컵경기장
   — 속도 최적화 및 유실된 궤도(증산, 연신내, 새절) 복구 완료
   ═══════════════════════════════════════════════════ */

'use strict';

window.STATION_EVENTS = window.STATION_EVENTS || {};

Object.assign(STATION_EVENTS, {

  /* ── 응암 (610) ── */
  async ev_eungam(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('응암 — 저주받은 회귀', 'warn');
    if (window.HorrorFX) window.HorrorFX.glitch(400);

    await seq([
      ['응암역. 이곳에서 시작된 궤도는 결코 똑바로 나아가지 않는다.', 'narrator', 1200],
      ['"또 당신이군요... 몇 번째인지 세는 건 포기했나요?"', 'whisper', 1800],
    ]);

    choices([
      ['① "이번에는 끝을 보겠다"라고 다짐한다', async () => {
        G.sanity -= 5; updateStats();
        await seq([
          ['당신의 다짐에 열차가 비명을 지르며 가속한다.', 'danger', 1200],
          ['魂(혼) -5 — 굳은 결의에 대한 대가.', 'warn', 1500],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 두려움을 억누르며 자리에 앉는다', async () => {
        G.health -= 5; updateStats();
        await seq([
          ['차가운 의자에 닿은 살점이 순식간에 얼어붙는 것 같다.', 'narrator', 1200],
          ['骸(해) -5 — 얼어붙는 육신.', 'warn', 1500],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ]);
  },

  /* ── 불광 (612) ── */
  async ev_bulgwang(stIdx) {
    TrainPanel.setState('danger');
    TrainPanel.addLog('불광 — 기억의 포식자들', 'danger');
    if (window.HorrorFX) window.HorrorFX.flashRed(600);

    await seq([
      ['불광역. 3호선에서 넘어온 "무언가"들이 무표정하게 당신을 향해 쏟아진다.', 'announce', 1500],
      ['"하나만 줘... 너에겐 너무 많은 기억이 있어... 하나만..."', 'whisper', 2000],
    ]);

    choices([
      ['① 가장 고통스러운 기억 하나를 내어준다', async () => {
        G.sanity -= 15; G.score += 20; updateStats();
        await seq([
          ['머릿속 한구석이 타들어 가는 감각과 함께 비명이 터져 나온다.', 'death', 1500],
          ['業(업) +20 / 魂(혼) -15 — 고통을 지불하고 얻은 전진.', 'life', 2000],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 그들의 손을 거칠게 뿌리친다 (저항)', async () => {
        G.health -= 20; updateStats();
        if (window.HorrorFX) window.HorrorFX.scare();
        await seq([
          ['뿌리친 자리에 시커먼 화상 자국이 남으며 피가 배어 나온다.', 'danger', 1200],
          ['骸(해) -20 — 처절한 저항의 흔적.', 'warn', 1500],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ]);
  },

  /* ── 연신내 (614) [유실 복구] ── */
  async ev_yeonsinnae(stIdx) {
    TrainPanel.setState('crowded');
    TrainPanel.addLog('연신내 — 인산인해의 식인귀들', 'warn');
    if (window.HorrorFX) window.HorrorFX.flashRed(1000);

    await seq([
      ['연신내역. 3/6호선이 만나는 이곳은 거대한 갈등의 소용돌이다.', 'announce', 1200],
      ['밀려드는 인파가 당신을 사방에서 압박한다. 그들의 체온은 시체처럼 차갑다.', 'death', 1800],
    ]);

    choices([
      ['① 인파를 밀치고 문 옆으로 자리를 옮긴다', async () => {
        G.health -= 10; G.score += 5; updateStats();
        await seq([['사람들의 옷자락이 가시처럼 당신의 살을 훑고 지나간다.', 'danger', 1500]]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 사람들에게 둘러싸인 채 비명조차 지르지 못한다', async () => {
        G.health -= 25; G.sanity -= 15; updateStats();
        if (window.HorrorFX) window.HorrorFX.glitch(500);
        await seq([['수십 명의 체중이 당신의 흉곽을 압박하여 숨을 쉴 수 없다.', 'death', 1800]]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ]);
  },

  /* ── 새절 (616) [유실 복구] ── */
  async ev_saejul(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('새절 — 새로 생긴 절의 통곡', 'event');
    await seq([
      ['새절역. 승강장 한복판에 거대한 불상이 뒤집힌 채 놓여 있다.', 'narrator', 1500],
      ['불상의 갈라진 틈 사이로 붉은 액체가 폭포처럼 쏟아진다.', 'death', 1800],
    ]);
    choices([
      ['① 붉은 액체를 만져본다', async () => {
        G.infection += 15; updateStats();
        await seq([['손 끝이 타들어가는 듯한 고통과 함께 기이한 환상이 보인다.', 'warn', 1500]]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 눈을 돌리고 합장하며 기도한다', async () => {
        G.sanity += 10; updateStats();
        await seq([['비명 섞인 염불 소리가 귓가를 맴돌지만 마음은 조금 진정된다.', 'life', 1500]]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ]);
  },

  /* ── 증산 (617) [진행 중단 버그 수정] ── */
  async ev_jeungsan(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('증산 — 물속의 비명', 'event');

    await seq([
      ['증산역. 전동차 바닥까지 불어난 해천의 물이 객차로 밀려 들어온다.', 'narrator', 1200],
      ['물밑에서 창백한 손들이 전동차 바닥을 긁어대며 비명 소리를 낸다.', 'death', 1500],
      ['"여기... 아래에... 네 자리는... 아직 비어 있어..."', 'whisper', 2000],
    ]);

    choices([
      ['① 물속으로 손을 뻗어 정체를 확인한다', async () => {
        G.health -= 15; G.infection += 10; updateStats();
        await seq([['차가운 손들이 당신의 팔을 잡고 아래로 강하게 끌어당긴다!', 'danger', 1500]]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 자리에 올라서서 물을 피한다', async () => {
        G.sanity -= 10; updateStats();
        await seq([['당신의 발목을 스치는 검은 그림자들에 소름이 끼친다.', 'warn', 1500]]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ]);
  },

  /* ── 디지털미디어시티 (618) ── */
  async ev_dmc(stIdx) {
    TrainPanel.setState('danger');
    TrainPanel.addLog('DMC — 디지털 망령의 비명', 'warn');
    if (window.HorrorFX) window.HorrorFX.glitch(800);

    await seq([
      ['DMC역. 모든 광고 모니터에 당신의 고통스러운 미래가 재생된다.', 'announce', 1500],
      ['"로그아웃은 없어... 오직 영원한 버퍼링뿐."', 'whisper', 2000],
    ]);

    choices([
      ['① 모니터를 주먹으로 박살 낸다', async () => {
        G.health -= 15; G.score += 10; updateStats();
        if (window.HorrorFX) window.HorrorFX.flashBlood(800);
        await seq([
          ['박살 난 모니터 파편이 당신의 얼굴을 난도질한다.', 'death', 1500],
          ['業(업) +10 / 骸(해) -15 — 파괴의 흔적.', 'life', 1500],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 눈을 감고 데이터의 흐름에 눈을 감는다', async () => {
        G.sanity -= 20; G.infection += 15; updateStats();
        await seq([
          ['수만 테라바이트의 비명이 당신의 뇌로 직접 쏟아진다.', 'death', 1500],
          ['魂(혼) -20 / 蝕(식) +15% — 신경 잠식.', 'warn', 1500],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ]);
  },

  /* ── 월드컵경기장 (619) ── */
  async ev_worldcup(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('상암 — 패배자들의 대합창', 'event');

    await seq([
      ['월드컵경기장역. 거대한 경기장이 오늘만은 죽은 자들의 무덤이 되었다.', 'narrator', 1500],
      ['"우리는 졌다... 너도... 곧... 똑같이 질 것이다..."', 'whisper', 2000],
    ]);

    choices([
      ['① 자책하며 함께 죽음의 노래를 부른다', async () => {
        G.sanity -= 25; G.score += 30; updateStats();
        await seq([['비참한 화음이 당신의 심장을 찢어발긴다.', 'death', 1500]]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 그들의 노래를 비웃는다', async () => {
        G.health -= 15; G.sanity -= 10; updateStats();
        if (window.HorrorFX) window.HorrorFX.flashBlood(800);
        await seq([['분노한 관중들이 유리창을 피 묻은 손으로 긁어대며 비난한다.', 'danger', 1500]]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ]);
  }
});

window.EVENTS_PART1 = window.STATION_EVENTS;
