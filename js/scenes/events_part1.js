/* ═══════════════════════════════════════════════════
   scenes/events_part1.js
   6호선 잔혹사: 응암 ~ 월드컵경기장 구간
   — 당신이 아는 그 역들은 더 이상 존재하지 않습니다.
   ═══════════════════════════════════════════════════ */

'use strict';

const EVENTS_PART1 = {

  /* ── 응암 (610) ── */
  async ev_eungam(stIdx) {
    TrainPanel.setState('danger');
    TrainPanel.addLog('응암 — 루프의 시작', 'warn');
    if (window.HorrorFX) window.HorrorFX.flashRed(500);

    await seq([
      ['', 'blank', 0],
      ['응암역. 이곳은 원형의 감옥이다.', 'announce', 200],
      ['창밖의 풍경이 미세하게 떨리더니, 아까 본 그 벽보가 다시 지나간다.', 'narrator', 450],
      ['"내리지 못하면... 영원히 돌게 될 거야..."', 'death', 700],
      ['공기가 희박해지고, 심장이 조여온다.', 'narrator', 900],
    ]);

    const opts = [
      ['① 창밖의 어둠을 응시한다 (정신 집중)', async () => {
        G.sanity -= 15; G.score += 10; updateStats();
        if (window.HorrorFX) window.HorrorFX.glitch(400);
        await seq([
          ['어둠 속에서 수천 개의 눈동자가 당신과 마주친다.', 'death', 200],
          ['그들은 당신의 순례를 비웃듯 일제히 비명을 지른다.', 'narrator', 450],
          ['業(업) +10 — 진실을 본 대가.', 'life', 700],
          ['魂(혼) -15 — 정신이 침식되었다.', 'warn', 900],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 눈을 감고 바닥만 본다 (현실 부정)', async () => {
        G.health -= 5; updateStats();
        await seq([
          ['눈을 감았지만, 발바닥을 타고 올라오는 진동은 막을 수 없다.', 'narrator', 200],
          ['누군가 당신의 발목을 차갑게 움켜쥐었다 놓은 기분이 든다.', 'narrator', 450],
          ['骸(해) -5 — 육체적 공포감이 엄습한다.', 'warn', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];
    choices(opts);
  },

  /* ── 불광 (603) ── */
  async ev_bulgwang(stIdx) {
    TrainPanel.setState('crowded');
    TrainPanel.addLog('불광 — 시체들의 뒤엉킴', 'warn');
    if (window.HorrorFX) window.HorrorFX.glitch(300);

    await seq([
      ['', 'blank', 0],
      ['불광역. 3호선에서 넘어온 "무언가"들이 객차를 메운다.', 'announce', 200],
      ['사람들의 살점이 서로의 문신처럼 달라붙는다. 차갑다.', 'narrator', 450],
      ['옆 승객의 동공이 풀린 채 당신의 주머니를 뒤진다.', 'narrator', 700],
      ['그는 돈이 아니라 당신의 "이름"을 훔치려 한다.', 'highlight', 1000],
    ]);

    const opts = [
      ['① 그를 거세게 밀쳐낸다 (저항)', async () => {
        G.sanity -= 10; G.score += 5; updateStats();
        if (window.HorrorFX) window.HorrorFX.flashRed(300);
        await seq([
          ['밀쳐내자 그의 팔이 종이처럼 구겨지며 검은 액체가 쏟아진다.', 'death', 200],
          ['주변 승객들이 일제히 당신을 무표정하게 쳐다본다.', 'narrator', 450],
          ['"왜... 무례하게 구는 거지?"', 'dialog', 700],
          ['業(업) +5 — 존재를 지켜냈다.', 'life', 1000],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 내 이름을 내어준다 (체념)', async () => {
        G.infection += 20; G.sanity -= 5; updateStats();
        await seq([
          ['그가 당신의 귓가에 입을 대고 이름을 빨아들인다.', 'narrator', 200],
          ['자신이 누구였는지 잠시 잊어버린다. 텅 빈 기분.', 'narrator', 450],
          ['蝕(식) +20% — 자아가 깎여 나간다.', 'warn', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];
    choices(opts);
  },

  /* ── 독바위 (604) ── */
  async ev_dokbawi(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('독바위 — 고대 신의 이빨', 'event');

    await seq([
      ['터널 벽이 매끄러운 바위가 아닌, 거대한 치아처럼 변한다.', 'narrator', 200],
      ['독바위역은 거대 요괴의 입속과 닮아있다.', 'announce', 450],
      ['바닥에서 끈적한 액체가 올라와 당신의 신발을 적신다.', 'narrator', 700],
      ['"어서... 어서 도망쳐... 씹히기 전에..."', 'death', 1000],
    ]);

    const opts = [
      ['① 전력으로 뛰어 다른 칸으로 이동한다', async () => {
        G.health -= 15; updateStats();
        await seq([
          ['숨이 턱 끝까지 차오르며 옆 칸으로 뛰어넘어갔다.', 'narrator', 200],
          ['뒤를 돌아보자, 방금 서 있던 자리가 콰득 하고 닫힌 것 같다.', 'death', 450],
          ['骸(해) -15 — 심각한 체력 소모.', 'warn', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 가만히 서서 버틴다 (담력)', async () => {
        G.sanity -= 10; G.score += 15; updateStats();
        if (window.HorrorFX) window.HorrorFX.scare();
        await seq([
          ['전율이 온몸을 흝고 지나가지만 미동도 하지 않았다.', 'narrator', 200],
          ['거대한 입은 당신의 기개에 눌린 듯 침묵을 지킨다.', 'narrator', 450],
          ['業(업) +15 — 공포를 이겨낸 기록.', 'life', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];
    choices(opts);
  },

  /* ── 연신내 (605) ── */
  async ev_yeonsinnae(stIdx) {
    TrainPanel.setState('crowded');
    TrainPanel.addLog('연신내 — 비명의 수렁', 'warn');

    await seq([
      ['연신내역. 3개 노선이 엉킨 이곳은 거대한 거미줄이다.', 'announce', 200],
      ['창백한 노인이 당신의 코앞까지 다가와 숨을 들이킨다.', 'narrator', 450],
      ['"자네... 심장 소리가 들리지 않아서 그러네. 잠시 빌려주게."', 'dialog', 700],
      ['그의 손이 당신의 가슴팍을 향해 뻗어온다.', 'narrator', 1000],
    ]);

    const opts = [
      ['① 노인의 손을 단호히 쳐낸다', async () => {
        G.health -= 5; updateStats();
        await seq([
          ['노인의 손을 쳐내자, 말라비틀어진 손가락이 바닥에 떨어진다.', 'death', 200],
          ['"살아있는 것들은... 늘 아까운 게 많지..."', 'dialog', 450],
          ['骸(해) -5 — 기분 나쁜 냉기가 몸에 남았다.', 'warn', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 노인에게 심장 소리를 들려준다 (가까이 가기)', async () => {
        G.sanity -= 25; G.score += 20; updateStats();
        if (window.HorrorFX) window.HorrorFX.flashRed(800);
        await seq([
          ['그의 가슴에 귀를 대자 심장 소리 대신 수만 명의 통곡이 들린다.', 'death', 200],
          ['"아... 달콤한 소리로군. 자네의 영혼은 맛있어 보여."', 'dialog', 450],
          ['業(업) +20 / 魂(혼) -25 — 지옥의 목소리를 들었다.', 'life', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];
    choices(opts);
  },

  /* ── 구산 (606) ── */
  async ev_gusan(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('구산 — 잠든 괴수의 등', 'event');

    await seq([
      ['구산역. 전동차가 심하게 덜컹거린다.', 'announce', 200],
      ['땅속에 잠든 거대 거북 요괴가 몸을 뒤척인 모양이다.', 'narrator', 450],
      ['천장에서 흙 대신 말라비틀어진 인골들이 떨어진다.', 'death', 700],
    ]);

    const opts = [
      ['① 뼈를 치우며 자리를 지킨다', async () => {
        G.health -= 10; updateStats();
        await seq([
          ['두개골을 발로 밀어내며 버্ত다.', 'narrator', 200],
          ['뼈들이 바닥에 부딪히며 기괴한 노래 소리를 내는 것 같다.', 'narrator', 450],
          ['骸(해) -10 — 무거운 공기가 육신을 짓누른다.', 'warn', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 비상 벨을 눌러 상황을 알린다', async () => {
        if (window.sfx) sfx.alarm();
        await seq([
          ['비상 벨에선 응답 대신 꺽꺽거리는 웃음소리만 흘러나온다.', 'death', 200],
          ['"도와줄 사람은 아무도 없어... 여긴 이미 먹혔으니까..."', 'narrator', 450],
          ['魂(혼) -5 — 고립된 공포.', 'warn', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];
    choices(opts);
  },

  /* ── 새절 (607) ── */
  async ev_saejul(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('새절 — 피부로 기운 절', 'event');

    await seq([
      ['새절역. 승강장 벽면이 사람의 가죽처럼 누더기처럼 기워져 있다.', 'announce', 200],
      ['누군가 커다란 쌀자루를 들고 당신의 옆자리에 앉는다.', 'narrator', 450],
      ['자루 안에서 "살려달라"는 희미한 울음소리가 들린다.', 'death', 700],
    ]);

    const opts = [
      ['① 자루를 빼앗아 열어본다', async () => {
        G.sanity -= 30; G.score += 25; updateStats();
        if (window.HorrorFX) window.HorrorFX.scare();
        await seq([
          ['자루를 열자, 눈코입이 박탈당한 얼굴들이 쏟아져 나온다.', 'death', 200],
          ['"우리도... 새 옷(피부)이... 필요해..."', 'dialog', 450],
          ['業(업) +25 — 끔찍한 진실을 목격했다.', 'life', 700],
          ['魂(혼) -30 — 정신이 붕괴되기 직전이다.', 'warn', 900],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 못 본 척 자리를 옮긴다', async () => {
        G.infection += 10; updateStats();
        await seq([
          ['황급히 옆 칸으로 도망쳤다.', 'narrator', 200],
          ['등 뒤로 누군가 바늘로 가죽을 꿰매는 소리가 계속 들린다.', 'narrator', 450],
          ['蝕(식) +10% — 두려움이 당신을 갉아먹는다.', 'warn', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];
    choices(opts);
  },

  /* ── DMC (609) ── */
  async ev_dmc(stIdx) {
    TrainPanel.setState('danger');
    TrainPanel.addLog('DMC — 디지털 유령의 습격', 'warn');
    if (window.HorrorFX) window.HorrorFX.glitch(1000);

    await seq([
      ['디지털미디어시티. 승객들의 스마트폰 화면이 일제히 붉게 변한다.', 'announce', 200],
      ['화면 속에서 일그러진 얼굴들이 기어 나오려 한다.', 'death', 450],
      ['데이터화된 망령들이 당신의 기억을 전송받으려 한다.', 'narrator', 700],
    ]);

    const opts = [
      ['① 스마트폰을 바닥에 던져 파괴한다', async () => {
        G.score += 5; updateStats();
        await seq([
          ['액정이 박살 나자 비명 소리가 멈춘다.', 'narrator', 200],
          ['하지만 당신의 손끝에 검은 노이즈가 옮겨붙었다.', 'warn', 450],
          ['業(업) +5 — 잠시나마 연결을 끊었다.', 'life', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 화면 속 망령들과 대화해본다 (금기)', async () => {
        G.sanity -= 20; G.infection += 20; updateStats();
        await seq([
          ['망령들의 정보가 당신의 뇌로 직접 업로드된다.', 'death', 200],
          ['수만 명의 죽음이 당신의 의식을 짓누른다.', 'narrator', 450],
          ['蝕(식) +20% / 魂(혼) -20 — 이제 당신도 데이터의 일부다.', 'warn', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];
    choices(opts);
  },

  /* ── 월드컵경기장 (610) ── */
  async ev_worldcup(stIdx) {
    TrainPanel.setState('crowded');
    TrainPanel.addLog('월드컵경기장 — 망자들의 축제', 'warn');

    await seq([
      ['월드컵경기장역. 승강장이 붉은 응원 머플러가 아닌 "피 묻은 천"으로 가득하다.', 'announce', 200],
      ['경기에 패배해 스스로 목숨을 끊은 자들이 일제히 환호성을 지른다.', 'death', 450],
      ['"당신... 우리와 함께 응원하지 않을래? 영원히?"', 'dialog', 700],
    ]);

    const opts = [
      ['① 그들의 구호를 따라 부른다 (동화)', async () => {
        G.infection += 25; G.score += 30; updateStats();
        if (window.HorrorFX) window.HorrorFX.flashRed(1500);
        await seq([
          ['피의 찬가를 부르자 당신의 목소리가 괴물처럼 변한다.', 'death', 200],
          ['그들은 기뻐하며 당신의 몸에 문신을 새긴다.', 'narrator', 450],
          ['業(업) +30 — 그들의 일원이 되었다.', 'life', 700],
          ['蝕(식) +25% — 몸이 변하고 있다.', 'warn', 900],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 귀를 막고 객차 구석으로 숨는다', async () => {
        G.sanity -= 10; updateStats();
        await seq([
          ['환청이 머릿속을 맴돈다. "패배자... 살고 싶어 안달 난 인간..."', 'narrator', 200],
          ['그들의 웃음소리가 터널 끝까지 메아리친다.', 'narrator', 450],
          ['魂(혼) -10 — 극심한 고립감.', 'warn', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];
    choices(opts);
  }

};
