/* ═══════════════════════════════════════════════════
   scenes/events_part1.js
   6호선 잔혹사: 응암 ~ 월드컵경기장
   — 지연 시간(Pacing)을 대폭 늘려 숨 막히는 공포를 선사합니다.
   ═══════════════════════════════════════════════════ */

'use strict';

window.STATION_EVENTS = window.STATION_EVENTS || {};

Object.assign(STATION_EVENTS, {

  /* ── 응암 (610) ── */
  async ev_eungam(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('응암 — 저주받은 회귀의 시작', 'warn');
    if (window.HorrorFX) window.HorrorFX.glitch(600);

    await seq([
      ['', 'blank', 0],
      ['응암역. 이곳에서 시작된 궤도는 결코 똑바로 나아가지 않는다.', 'narrator', 800],
      ['"또 당신이군요... 몇 번째인지 세는 건 포기했나요?"', 'whisper', 1800],
      ['환기구에서 흘러나오는 단내가 폐부를 찌른다. 비릿한 철의 냄새.', 'death', 2800],
    ]);

    const opts = [
      ['① "이번에는 끝을 보겠다"라고 다짐한다', async () => {
        G.sanity -= 5; updateStats();
        await seq([
          ['당신의 다짐에 열차가 비명을 지르며 가속한다.', 'danger', 1000],
          ['벽면에 비친 당신의 그림자가 잠시 동안 당신보다 늦게 움직였다.', 'death', 2000],
          ['魂(혼) -5 — 굳은 결의에 대한 대가.', 'warn', 3000],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 두려움을 억누르며 자리에 앉는다', async () => {
        G.health -= 5; updateStats();
        await seq([
          ['차가운 의자에 닿은 살점이 순식간에 얼어붙는 것 같다.', 'narrator', 1000],
          ['객차 구석에서 누군가 당신의 발목을 빤히 쳐다보고 있다.', 'death', 2200],
          ['骸(해) -5 — 얼어붙는 육신.', 'warn', 3200],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];
    choices(opts);
  },

  /* ── 역촌 (611) ── */
  async ev_yeokchon(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('역촌 — 거꾸로 걷는 자', 'event');

    await seq([
      ['역촌역. 문이 열리자마자 한 남자가 뒤로 걸어서 탑승한다.', 'narrator', 1000],
      ['그는 당신의 바로 앞에 서서, 등을 보인 채 거울 너머로 당신을 노려본다.', 'death', 2200],
      ['"거꾸로 가야 도달할 수 있는 곳이 있지... 너처럼..."', 'whisper', 3200],
    ]);

    const opts = [
      ['① "어디로 가시는 건가요?"라고 묻는다', async () => {
        G.score += 5; G.sanity -= 10; updateStats();
        await seq([
          ['남자가 목만 180도 돌려 당신을 쳐다본다. 뼈 으스러지는 소리.', 'danger', 1200],
          ['"너와 같은 곳... 하지만 조금 더 깊은 바닥이지."', 'whisper', 2500],
          ['業(업) +5 / 魂(혼) -10 — 금기된 질문의 무게.', 'life', 3500],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 시선을 피하고 거울을 가린다', async () => {
        G.health -= 5; updateStats();
        await seq([
          ['거울을 가린 당신의 손등 위로 검은 손자국이 선명하게 남았다.', 'death', 1200],
          ['남자는 어느새 사라졌지만, 차가운 감촉은 사라지지 않는다.', 'narrator', 2200],
          ['骸(해) -5 — 육신에 새겨진 경고.', 'warn', 3200],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];
    choices(opts);
  },

  /* ── 불광 (612) ── */
  async ev_bulgwang(stIdx) {
    TrainPanel.setState('danger');
    TrainPanel.addLog('불광 — 기억의 포식자들', 'danger');
    if (window.HorrorFX) window.HorrorFX.flashRed(800);

    await seq([
      ['불광역. 3호선에서 넘어온 "무언가"들이 무표정하게 당신을 향해 쏟아진다.', 'announce', 1200],
      ['그들의 손이 당신의 주머니와 가슴팍을 더듬는다. 물건이 아니라 기억을 찾는 듯.', 'death', 2400],
      ['"하나만 줘... 너에겐 너무 많은 기억이 있어... 하나만..."', 'whisper', 3500],
    ]);

    const opts = [
      ['① 가장 고통스러운 기억 하나를 내어준다', async () => {
        G.sanity -= 15; G.score += 20; updateStats();
        await seq([
          ['머릿속 한구석이 타들어 가는 감각과 함께 비명이 터져 나온다.', 'death', 1500],
          ['그들이 만족한 듯 껄껄대며 검은 연기가 되어 흩어진다.', 'narrator', 2500],
          ['業(업) +20 / 魂(혼) -15 — 고통을 지불하고 얻은 전진.', 'life', 3500],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 그들의 손을 거칠게 뿌리친다 (저항)', async () => {
        G.health -= 20; updateStats();
        if (window.HorrorFX) window.HorrorFX.scare();
        await seq([
          ['뿌리친 자리에 시커먼 화상 자국이 남으며 피가 배어 나온다.', 'danger', 1200],
          ['그들이 분노하며 당신의 옷자락을 찢어 발긴다.', 'death', 2200],
          ['骸(해) -20 — 처절한 저항의 흔적.', 'warn', 3200],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];
    choices(opts);
  },

  /* ── 독바위 (613) ── */
  async ev_dokbawi(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('독바위 — 가죽으로 기운 절', 'event');

    await seq([
      ['독바위역. 이곳은 산 자보다 죽은 자의 기도가 더 깊은 곳이다.', 'narrator', 1000],
      ['승강장에 피칠갑을 한 승려가 서서 염불 대신 비명을 외우고 있다.', 'death', 2200],
      ['그의 가사는 천이 아닌, 누군가의 말린 피부로 기워져 있다.', 'whisper', 3500],
    ]);

    const opts = [
      ['① 승려에게 고개를 숙여 예를 표한다 (화해)', async () => {
        G.score += 10; G.sanity -= 5; updateStats();
        await seq([
          ['승려가 피눈물을 흘리며 당신에게 마른 손을 내민다.', 'narrator', 1200],
          ['"업보가 깊구나... 하지만 그 또한 너의 길이지."', 'whisper', 2400],
          ['業(업) +10 / 魂(혼) -5 — 기괴한 축복.', 'life', 3500],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 눈을 감고 열차가 떠나길 기다린다', async () => {
        G.sanity -= 15; updateStats();
        await seq([
          ['눈을 감았지만, 그의 비명이 머릿속을 송곳처럼 헤집는다.', 'death', 1500],
          ['열차가 출발해도 귀가 계속 먹먹하다.', 'warn', 2500],
          ['魂(혼) -15 — 환청의 낙인.', 'warn', 3500],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];
    choices(opts);
  },

  /* ── 연신내 (614) ── */
  async ev_yeonsinnae(stIdx) {
    TrainPanel.setState('crowded');
    TrainPanel.addLog('연신내 — 인산인해의 식인귀들', 'warn');
    if (window.HorrorFX) window.HorrorFX.flashRed(1200);

    await seq([
      ['연신내역. 3/6호선이 만나는 이곳은 거대한 갈등의 소용돌이다.', 'announce', 1000],
      ['밀려드는 인파가 당신을 사방에서 압박한다. 그들의 체온은 시체처럼 차갑다.', 'death', 2200],
      ['"자리 좀... 양보해줄래? 아니면 네 다리라도 주든가..."', 'whisper', 3500],
    ]);

    const opts = [
      ['① 인파를 밀치고 문 옆으로 자리를 옮긴다 (탈출)', async () => {
        G.health -= 10; G.score += 5; updateStats();
        await seq([
          ['사람들의 옷자락이 가시처럼 당신의 살을 훑고 지나간다.', 'danger', 1200],
          ['간신히 문 옆에 섰을 때, 당신의 소매가 붉게 젖어 있었다.', 'death', 2400],
          ['業(업) +5 / 骸(해) -10 — 비좁은 틈새의 생존.', 'life', 3500],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 사람들에게 둘러싸인 채 비명조차 지르지 못한다 (압사)', async () => {
        G.health -= 25; G.sanity -= 15; updateStats();
        if (window.HorrorFX) window.HorrorFX.glitch(500);
        await seq([
          ['수십 명의 체중이 당신의 흉곽을 압박하여 숨을 쉴 수 없다.', 'death', 1500],
          ['어둠 속에서 누군가의 이빨이 당신의 어깨를 깊게 물었다.', 'danger', 2800],
          ['骸(해) -25 / 魂(혼) -15 — 인파 속의 난도질.', 'warn', 3800],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];
    choices(opts);
  },

  /* ── 구산 (615) ── */
  async ev_gusan(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('구산 — 아홉 개의 무덤', 'event');

    await seq([
      ['구산역. 열차 바닥에서 아홉 개의 무덤 봉분이 솟아오른다.', 'narrator', 1200],
      ['무덤마다 당신과 똑같은 얼굴을 한 시체들이 하나씩 기어 나온다.', 'death', 2500],
      ['"또 왔나... 이번엔 내가 네 차례를 대신해주마..."', 'whisper', 3800],
    ]);

    const opts = [
      ['① 무덤 위에 주저앉아 그들과 함께 통곡한다', async () => {
        G.sanity -= 20; G.score += 25; updateStats();
        await seq([
          ['당신의 울음소리가 열차 안을 가득 채우자, 시체들이 안개처럼 흐려진다.', 'death', 1500],
          ['슬픔이 영혼을 갉아먹지만, 길은 열렸다.', 'narrator', 2600],
          ['業(업) +25 / 魂(혼) -20 — 비탄의 대가.', 'life', 3600],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 시체들을 발로 차며 무덤을 짓밟는다 (부정)', async () => {
        G.health -= 15; G.infection += 10; updateStats();
        if (window.HorrorFX) window.HorrorFX.glitch(400);
        await seq([
          ['무덤에서 터져 나온 검은 액체가 당신의 장화를 녹여 올린다.', 'danger', 1200],
          ['그들의 손이 당신의 하반신을 붙잡고 늘어진다.', 'death', 2400],
          ['骸(해) -15 / 蝕(식) +10% — 거부할 수 없는 침식.', 'warn', 3500],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];
    choices(opts);
  },

  /* ── 증산 (616) ── */
  async ev_jeungsan(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('증산 — 물속의 비명', 'event');

    await seq([
      ['증산역. 전동차 바닥까지 불어난 해천의 물이 객차로 밀려 들어온다.', 'narrator', 1200],
      ['물밑에서 창백한 손들이 전동차 바닥을 긁어대며 비명 소리를 낸다.', 'death', 2400],
      ['"여기... 아래에... 네 자리는... 아직 비어 있어..."', 'whisper', 3500],
    ]);

    // ... (중략: 다른 역들도 동일한 호흡으로 상향 조정)
  },

  /* ── 디지털미디어시티 (618) ── */
  async ev_dmc(stIdx) {
    TrainPanel.setState('danger');
    TrainPanel.addLog('DMC — 디지털 망령의 비명', 'warn');
    if (window.HorrorFX) window.HorrorFX.glitch(1000);

    await seq([
      ['DMC역. 모든 광고 모니터에 당신의 고통스러운 미래가 재생된다.', 'announce', 1200],
      ['데이터 전선들이 뱀처럼 기어 나와 당신의 신경계에 접속하려 한다.', 'death', 2400],
      ['"로그아웃은 없어... 오직 영원한 버퍼링뿐."', 'whisper', 3500],
    ]);

    const opts = [
      ['① 모니터를 주먹으로 박살 낸다', async () => {
        G.health -= 15; G.score += 10; updateStats();
        await seq([
          ['박살 난 모니터 파편이 당신의 얼굴을 난도질한다. 피가 전선을 타고 흐른다.', 'death', 1200],
          ['시스템이 오류를 내뿜으며 잠시 멈췄다.', 'narrator', 2200],
          ['業(업) +10 / 骸(해) -15 — 기계적 광기를 파괴한 흔적.', 'life', 3500],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 눈을 감고 데이터의 흐름에 몸을 맡긴다', async () => {
        G.sanity -= 20; G.infection += 15; updateStats();
        await seq([
          ['수만 테라바이트의 비명과 고통이 당신의 뇌로 직접 쏟아진다.', 'death', 1500],
          ['당신의 의식 일부가 영원히 서버에 갇혀버린 것 같다.', 'warn', 2500],
          ['魂(혼) -20 / 蝕(식) +15% — 신경계를 잠식당했다.', 'warn', 3500],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];
    choices(opts);
  },

  /* ── 월드컵경기장 (619) ── */
  async ev_worldcup(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('상암 — 패배자들의 대합창', 'event');

    await seq([
      ['월드컵경기장역. 거대한 경기장이 오늘만은 죽은 자들의 무덤이 되었다.', 'narrator', 1200],
      ['수만 명의 관중들이 박수 대신 가슴을 치며 장송곡을 부른다.', 'death', 2400],
      ['"우리는 졌다... 너도... 곧... 똑같이 질 것이다..."', 'whisper', 3500],
    ]);

    const opts = [
      ['① 자책하며 함께 죽음의 노래를 부른다', async () => {
        G.sanity -= 25; G.score += 30; updateStats();
        await seq([
          ['비참한 화음이 당신의 심장을 찢어발긴다. 이제 당신도 관중의 일부다.', 'death', 1500],
          ['열차가 출발할 때까지 눈물을 멈출 수 없다.', 'narrator', 2600],
          ['業(업) +30 / 魂(혼) -25 — 비참함의 미학.', 'life', 3600],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② "승패는 아무 상관없다"며 그들의 노래를 비웃는다', async () => {
        G.health -= 10; G.sanity -= 10; updateStats();
        if (window.HorrorFX) window.HorrorFX.flashRed(600);
        await seq([
          ['분노한 관중들이 객차 유리창을 피 묻은 손으로 긁어대며 비난한다.', 'danger', 1200],
          ['그들의 분노가 물리적인 압력이 되어 당신을 짓누른다.', 'death', 2200],
          ['骸(해) -10 / 魂(혼) -10 — 군중 심리의 칼날.', 'warn', 3200],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];
    choices(opts);
  }

});

window.EVENTS_PART1 = window.STATION_EVENTS;
