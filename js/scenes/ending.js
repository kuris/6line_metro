/* ═══════════════════════════════════════════════════
   scenes/ending.js — 다중 엔딩 분기 (6종) + 공유하기
   ═══════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────
   엔딩 분기 판정
   ────────────────────────────────────────── */
function determineEnding() {
  const sc   = G.score;
  const mis  = G.missionCount;
  const tod  = G.timeOfDay || 'noon';
  const inv  = G.inventory || [];

  // 특수 엔딩 우선 체크
  if (inv.includes('수상한 메모지') && inv.includes('카세트테이프') && sc >= 15) {
    return 'secret';       // 🔮 비밀 엔딩 — 두 아이템 동시 보유 + 고득점
  }
  if (tod === 'dawn' && sc >= 20) {
    return 'dawn_hero';    // 🌙 새벽 영웅 — 새벽 고득점
  }
  if (tod === 'night' && mis >= 4) {
    return 'night_soul';   // 🌃 심야의 영혼 — 심야 고미션
  }
  if (sc >= 30) {
    return 'hero';         // 🏅 시민 영웅
  }
  if (sc >= 18) {
    return 'warm';         // ⭐ 따뜻한 이웃
  }
  if (sc >= 8) {
    return 'ordinary';     // 🚇 평범한 하루
  }
  return 'ghost';          // 🌑 지하철 유령
}

/* ──────────────────────────────────────────
   게임 오버 (배드 엔딩)
   ────────────────────────────────────────── */
async function sceneGameOver() {
  clearUI();
  TrainPanel.setState('ending');
  TrainPanel.addLog('생존 실패', 'danger');
  TrainPanel.showOverlay('☠︎ 탈출 실패', 0);

  sfx.alarm(0.3);

  let reason = '';
  if (G.health <= 0) reason = '체력이 고갈되었습니다.';
  else if (G.sanity <= 0) reason = '정신력이 한계에 달했습니다.';
  else if (G.infection >= 100) reason = '단내 바이러스에 완전히 감염되었습니다.';

  await printAscii([
    [`  ╔══════════════════════════════╗`, ''],
    [`  ║   ☠︎ GAME OVER               ║`, 'danger'],
    [`  ║   생존 및 탈출 실패            ║`, 'hl'],
    [`  ╠══════════════════════════════╣`, ''],
    [`  ║  이유 : ${padRight(reason, 20)}║`, ''],
    [`  ╚══════════════════════════════╝`, ''],
  ], 'ascii-danger', { rowDelay: 50, sound: 'boom' });

  await seq([
    ['', 'blank', 300],
    ['눈앞이 흐려진다.', 'narrator', 600],
    ['지하철의 덜컹거림이 아주 멀게 느껴진다.', 'narrator', 900],
    ['당신은 종착역에 도달하지 못했다.', 'death', 1200],
    ['', 'blank', 1500],
  ]);

  const sc = G.score;
  const tod = G.timeOfDay || 'noon';

  // 버튼 영역 (재시작만 제공)
  const btnWrap = document.createElement('div');
  btnWrap.id = 'ending-btn-wrap';

  // 공유하기 버튼 (실패 공유)
  const shareText = `[6호선 어드벤처] ${G.playerName}님의 여정 중단\n☠︎ 탈출 실패: ${reason}\n⭐ ${sc}점\n다시 도전하기 → https://bbkjhdeq.gensparkspace.com/`;
  const shareBtn  = document.createElement('button');
  shareBtn.className = 'end-btn share-btn';
  shareBtn.innerHTML = '📤 실패 결과 공유하기';
  shareBtn.onclick   = () => showShareModal(shareText, 'ghost', sc);
  btnWrap.appendChild(shareBtn);

  const restartBtn = document.createElement('button');
  restartBtn.className = 'end-btn';
  restartBtn.innerHTML = '🚇 다시 탑승하기 (재도전)';
  restartBtn.onclick   = () => { sfx.ui(); sceneIntro(); };
  btnWrap.appendChild(restartBtn);

  OUT.appendChild(btnWrap);
  scrollBottom();

  setTimeout(() => {
    if (typeof exportScreenshot === 'function') {
      exportScreenshot('아무것도 모른 채 끝나버린 하루');
    }
  }, 1500);
}

/* ──────────────────────────────────────────
   엔딩 데이터
   ────────────────────────────────────────── */
const ENDINGS = {

  hero: {
    grade:   '🏅 서울 시민 영웅',
    color:   '#c8a840',
    ascii: [
      [`  ╔══════════════════════════════╗`,''],
      [`  ║  🏅  ENDING  A              ║`,'hl'],
      [`  ║  서울 시민 영웅              ║`,'hl'],
      [`  ╠══════════════════════════════╣`,''],
      [`  ║  오늘 당신이 한 행동들은     ║`,''],
      [`  ║  6호선을 조금 더 나은 곳으로  ║`,''],
      [`  ║  만들었습니다.               ║`,''],
      [`  ╚══════════════════════════════╝`,''],
    ],
    story: [
      ['오늘 하루, 당신은 특별했다.', 'highlight'],
      ['메모지를 집었고, 자리를 양보했고, 위기에서 앞장섰다.', 'narrator'],
      ['아무도 강요하지 않았는데.', 'narrator'],
      ['', 'blank'],
      ['6호선에는 매일 수십만 명이 탄다.', 'narrator'],
      ['그 중 오늘 당신 같은 사람이 몇 명이나 있었을까.', 'narrator'],
      ['', 'blank'],
      ['"그래도 괜찮은 사람이 있어."', 'highlight'],
      ['누군가는 그렇게 생각하며 귀가했을 것이다.', 'result'],
    ],
    shareText: (name, sc, tod) =>
      `[6호선 어드벤처] ${name}님의 오늘 6호선 여정\n🏅 서울 시민 영웅 달성!\n⭐ ${sc}점 · ${TIME_OF_DAY[tod]?.label || '한낮'} 탑승\n지금 탑승 → https://bbkjhdeq.gensparkspace.com/`,
  },

  warm: {
    grade:   '⭐ 따뜻한 이웃',
    color:   '#80e0a8',
    ascii: [
      [`  ╔══════════════════════════════╗`,''],
      [`  ║  ⭐  ENDING  B              ║`,'hl'],
      [`  ║  따뜻한 이웃                ║`,'hl'],
      [`  ╠══════════════════════════════╣`,''],
      [`  ║  당신 덕분에 누군가의 하루가  ║`,''],
      [`  ║  조금 더 나아졌습니다.       ║`,''],
      [`  ╚══════════════════════════════╝`,''],
    ],
    story: [
      ['완벽하지는 않았지만, 충분히 좋은 하루였다.', 'narrator'],
      ['', 'blank'],
      ['불광역에서 잠깐 머뭇거렸고,', 'narrator'],
      ['합정역에서는 용기를 냈다.', 'narrator'],
      ['그것으로 충분하다.', 'highlight'],
      ['', 'blank'],
      ['따뜻한 사람들이 6호선을 지탱하고 있다.', 'narrator'],
      ['당신도 그 중 하나다.', 'result'],
    ],
    shareText: (name, sc, tod) =>
      `[6호선 어드벤처] ${name}님의 오늘 6호선 여정\n⭐ 따뜻한 이웃!\n⭐ ${sc}점 · ${TIME_OF_DAY[tod]?.label || '한낮'} 탑승\n지금 탑승 → https://bbkjhdeq.gensparkspace.com/`,
  },

  ordinary: {
    grade:   '🚇 평범한 하루',
    color:   '#5aaa7a',
    ascii: [
      [`  ╔══════════════════════════════╗`,''],
      [`  ║  🚇  ENDING  C              ║`,'hl'],
      [`  ║  평범한 하루                ║`,'hl'],
      [`  ╠══════════════════════════════╣`,''],
      [`  ║  그냥 출퇴근한 하루.         ║`,''],
      [`  ║  나쁘지 않습니다.            ║`,''],
      [`  ╚══════════════════════════════╝`,''],
    ],
    story: [
      ['오늘은 그냥 이동했다.', 'narrator'],
      ['지하철은 A에서 B로 가는 수단이었고,', 'narrator'],
      ['그 이상도 이하도 아니었다.', 'narrator'],
      ['', 'blank'],
      ['하지만 내일은 조금 다를 수도 있다.', 'highlight'],
      ['6호선은 내일도 달린다.', 'result'],
    ],
    shareText: (name, sc, tod) =>
      `[6호선 어드벤처] ${name}님의 오늘 6호선 여정\n🚇 평범한 하루. 내일은 달라질지도?\n⭐ ${sc}점 · ${TIME_OF_DAY[tod]?.label || '한낮'} 탑승\n지금 탑승 → https://bbkjhdeq.gensparkspace.com/`,
  },

  ghost: {
    grade:   '🌑 지하철 유령',
    color:   '#4a6070',
    ascii: [
      [`  ╔══════════════════════════════╗`,''],
      [`  ║  🌑  ENDING  D              ║`,'hl'],
      [`  ║  지하철 유령                ║`,'hl'],
      [`  ╠══════════════════════════════╣`,''],
      [`  ║  존재했지만, 아무도          ║`,''],
      [`  ║  기억하지 못할 하루.         ║`,''],
      [`  ╚══════════════════════════════╝`,''],
    ],
    story: [
      ['오늘 당신은 지하철을 탔다.', 'narrator'],
      ['그리고 내렸다.', 'narrator'],
      ['', 'blank'],
      ['그게 전부다.', 'death'],
      ['', 'blank'],
      ['유령처럼 스쳐지나간 하루.', 'narrator'],
      ['괜찮다. 누구나 그런 날이 있다.', 'result'],
      ['', 'blank'],
      ['다시 타면 된다.', 'highlight'],
    ],
    shareText: (name, sc, tod) =>
      `[6호선 어드벤처] ${name}님의 오늘 6호선 여정\n🌑 지하철 유령... 다시 탑승해보세요!\n⭐ ${sc}점 · ${TIME_OF_DAY[tod]?.label || '한낮'} 탑승\n지금 탑승 → https://bbkjhdeq.gensparkspace.com/`,
  },

  dawn_hero: {
    grade:   '🌙 새벽의 수호자',
    color:   '#8ab0e8',
    ascii: [
      [`  ╔══════════════════════════════╗`,''],
      [`  ║  🌙  ENDING  E  [특수]      ║`,'hl'],
      [`  ║  새벽의 수호자              ║`,'hl'],
      [`  ╠══════════════════════════════╣`,''],
      [`  ║  아무도 없는 새벽 첫차에서   ║`,''],
      [`  ║  당신은 빛이었습니다.        ║`,''],
      [`  ╚══════════════════════════════╝`,''],
    ],
    story: [
      ['새벽 5시 30분.', 'narrator'],
      ['텅 빈 객차. 형광등만 빛나는 그 시간에,', 'narrator'],
      ['당신은 혼자 선했다.', 'highlight'],
      ['', 'blank'],
      ['아무도 보지 않았다. 칭찬받을 사람도 없었다.', 'narrator'],
      ['그래서 더 진짜였다.', 'result'],
      ['', 'blank'],
      ['새벽 6호선에는 그런 사람들이 탄다.', 'narrator'],
      ['오늘 당신이 그랬다.', 'life'],
    ],
    shareText: (name, sc, tod) =>
      `[6호선 어드벤처] ${name}님의 새벽 6호선 여정\n🌙 새벽의 수호자 달성! (특수 엔딩)\n⭐ ${sc}점 · 새벽 첫차 탑승\n지금 탑승 → https://bbkjhdeq.gensparkspace.com/`,
  },

  night_soul: {
    grade:   '🌃 심야의 영혼',
    color:   '#a080d0',
    ascii: [
      [`  ╔══════════════════════════════╗`,''],
      [`  ║  🌃  ENDING  F  [특수]      ║`,'hl'],
      [`  ║  심야의 영혼                ║`,'hl'],
      [`  ╠══════════════════════════════╣`,''],
      [`  ║  막차가 끊기기 직전,         ║`,''],
      [`  ║  당신은 여러 사람을 만났다.  ║`,''],
      [`  ╚══════════════════════════════╝`,''],
    ],
    story: [
      ['심야 막차에는 특별한 사람들이 탄다.', 'narrator'],
      ['지쳐서 눈을 감은 직장인,', 'narrator'],
      ['버스킹 후 귀가하는 청년,', 'narrator'],
      ['막차를 놓칠 뻔한 아주머니.', 'narrator'],
      ['', 'blank'],
      ['당신은 그들 옆에 있었다.', 'highlight'],
      ['말 한마디, 작은 손짓으로.', 'narrator'],
      ['', 'blank'],
      ['막차가 끊기는 시간. 그게 오늘의 끝이었다.', 'result'],
      ['좋은 밤이었다.', 'life'],
    ],
    shareText: (name, sc, tod) =>
      `[6호선 어드벤처] ${name}님의 심야 6호선 여정\n🌃 심야의 영혼 달성! (특수 엔딩)\n⭐ ${sc}점 · 심야 막차 탑승\n지금 탑승 → https://bbkjhdeq.gensparkspace.com/`,
  },

  secret: {
    grade:   '🔮 수수께끼의 승객',
    color:   '#d0a0e0',
    ascii: [
      [`  ╔══════════════════════════════╗`,''],
      [`  ║  🔮  ENDING  ???  [비밀]    ║`,'hl'],
      [`  ║  수수께끼의 승객            ║`,'hl'],
      [`  ╠══════════════════════════════╣`,''],
      [`  ║  메모지. 카세트테이프.       ║`,''],
      [`  ║  두 개의 단서를 가진 자.     ║`,''],
      [`  ╚══════════════════════════════╝`,''],
    ],
    story: [
      ['주머니에 두 가지가 있다.', 'narrator'],
      ['응암의 메모지. 동묘의 카세트테이프.', 'highlight'],
      ['', 'blank'],
      ['"봉화산에서 내리지 마세요."', 'death'],
      ['', 'blank'],
      ['집에 돌아와 카세트 플레이어를 꺼냈다.', 'narrator'],
      ['테이프를 넣고 재생 버튼을 눌렀다.', 'narrator'],
      ['', 'blank'],
      ['흘러나온 것은 음악이 아니었다.', 'death'],
      ['누군가의 목소리. 낮고 떨리는.', 'narrator'],
      ['', 'blank'],
      ['"당신이 이 테이프를 듣고 있다면..."', 'dialog'],
      ['"6호선은 아직 끝나지 않았습니다."', 'highlight'],
      ['', 'blank'],
      ['테이프가 멈췄다.', 'narrator'],
      ['창밖으로 봉화산이 보였다.', 'death'],
      ['', 'blank'],
      ['...이 이야기는 아직 끝나지 않았다.', 'highlight'],
    ],
    shareText: (name, sc, tod) =>
      `[6호선 어드벤처] ${name}님이 비밀 엔딩을 발견했습니다!\n🔮 수수께끼의 승객 — 숨겨진 결말\n⭐ ${sc}점\n당신도 찾을 수 있을까? → https://bbkjhdeq.gensparkspace.com/`,
  },
};

/* ──────────────────────────────────────────
   메인 엔딩 씬
   ────────────────────────────────────────── */
async function sceneEnding() {
  clearUI();

  TrainPanel.setState('ending');
  TrainPanel.addLog('여정 완료', 'new');
  TrainPanel.showOverlay('★ 여정 완료 — 결과 집계 중', 0);

  const endingId = determineEnding();
  const ending   = ENDINGS[endingId];
  const sc       = G.score;
  const tod      = G.timeOfDay || 'noon';
  const todData  = TIME_OF_DAY[tod] || TIME_OF_DAY.noon;

  // 방향·구간 통계
  const isUp      = (G.dirStep || 1) >= 0;
  const dirLabel  = isUp ? '상행 ▲' : '하행 ▼';
  const startSt   = STATIONS[G.startStation] || STATIONS[0];
  const endSt     = STATIONS[G.endStation]   || STATIONS[STATIONS.length - 1];
  const rangeMin  = isUp ? G.startStation : G.endStation;
  const rangeMax  = isUp ? G.endStation   : G.startStation;
  const routeSlice    = STATIONS.slice(
    Math.max(0, rangeMin),
    Math.min(STATIONS.length, rangeMax + 1)
  );
  const totalStations  = routeSlice.length;
  const eventStations  = routeSlice.filter(s => s.hasEvent).length;
  const participateRate = eventStations > 0
    ? Math.round((G.missionCount / eventStations) * 100) : 0;

  sfx.ding(0.2);

  // 결과 카드
  await printAscii([
    [`  ╔══════════════════════════════╗`, ''],
    [`  ║   6호선 여정 완료            ║`, 'hl'],
    [`  ║   LINE 6 JOURNEY COMPLETE   ║`, ''],
    [`  ╠══════════════════════════════╣`, ''],
    [`  ║  시간대 : ${padRight(todData.label, 20)}║`, ''],
    [`  ║  방향   : ${padRight(dirLabel, 20)}║`, ''],
    [`  ║  구간   : ${padRight(startSt.name+'→'+endSt.name, 20)}║`, ''],
    [`  ╠══════════════════════════════╣`, ''],
    [`  ║  총 점수   : ${String(sc).padEnd(16)} ║`, 'hl'],
    [`  ║  미션 완료 : ${String(G.missionCount).padEnd(16)} ║`, ''],
    [`  ║  이동 역수 : ${String(G.moveCount).padEnd(16)} ║`, ''],
    [`  ║  참여율   : ${String(participateRate + '%').padEnd(16)} ║`, ''],
    [`  ╠══════════════════════════════╣`, ''],
    [`  ║  엔딩: ${ending.grade.padEnd(23)} ║`, 'hl'],
    [`  ╚══════════════════════════════╝`, ''],
  ], 'ascii-done', { rowDelay: 45, label: '// 여정 결과 집계', sound: 'modem' });

  await new Promise(r => setTimeout(r, 400));

  // 엔딩 ASCII
  await printAscii(ending.ascii, 'ascii-done', { rowDelay: 60, sound: null });

  await new Promise(r => setTimeout(r, 300));

  // 엔딩 스토리
  for (const [text, cls] of ending.story) {
    await print(text, cls, 80);
  }

  // 아이템 특별 코멘트
  if (hasItem('카세트테이프') && endingId !== 'secret') {
    await seq([
      ['', 'blank', 200],
      ['집에 돌아와 카세트 플레이어를 찾아봤다.', 'result', 300],
      ['할아버지가 준 테이프 — 제목은 [인생은 아름다워].', 'narrator', 600],
      ['흘러나온 음악은 60년대 올드팝이었다. 나쁘지 않았다.', 'result', 900],
    ]);
  }
  if (hasItem('수상한 메모지') && endingId !== 'secret') {
    await seq([
      ['', 'blank', 200],
      ['메모지가 아직 주머니 안에 있다.', 'result', 300],
      ['"봉화산에서 내리지 마세요." — 이게 다 무슨 뜻이었을까.', 'narrator', 600],
    ]);
  }

  await seq([
    ['', 'blank', 300],
    ['──────────────────────────────', 'divider', 0],
    ['오늘도 6호선은 달렸다.', 'narrator', 200],
    ['38개의 역, 35.1킬로미터.', 'narrator', 400],
    ['그리고 그 안의 수많은 이야기들.', 'narrator', 600],
    ['당신도 그 이야기 중 하나였습니다.', 'highlight', 900],
    ['', 'blank', 1100],
  ]);

  TrainPanel.hideOverlay();
  updateProgress(STATIONS, STATIONS.length - 1);

  // ── 버튼 영역 ──
  const btnWrap = document.createElement('div');
  btnWrap.id = 'ending-btn-wrap';

  // 공유하기 버튼
  const shareText = ending.shareText(G.playerName, sc, tod);
  const shareBtn  = document.createElement('button');
  shareBtn.className = 'end-btn share-btn';
  shareBtn.innerHTML = '📤 결과 공유하기';
  shareBtn.onclick   = () => showShareModal(shareText, endingId, sc);
  btnWrap.appendChild(shareBtn);

  // 재시작 버튼
  const restartBtn = document.createElement('button');
  restartBtn.className = 'end-btn';
  restartBtn.innerHTML = '🚇 다시 탑승하기 — 다른 시간대로';
  restartBtn.onclick   = () => { sfx.ui(); sceneIntro(); };
  btnWrap.appendChild(restartBtn);

  // 결과 요약
  const scoreDiv = document.createElement('div');
  scoreDiv.className = 'ending-score-line';
  scoreDiv.innerHTML =
    `${todData.emoji} ${todData.label} · ${dirLabel} · ` +
    `<span style="color:${ending.color}">${ending.grade}</span> · ` +
    `⭐ ${sc}점`;
  btnWrap.appendChild(scoreDiv);

  OUT.appendChild(btnWrap);
  scrollBottom();

  setTimeout(() => {
    if (typeof exportScreenshot === 'function') {
      let catchphrase = '이런 엔딩이 있었어?';
      if (endingId === 'secret') catchphrase = '봉화산 비밀 밝혀냈다';
      else if (endingId === 'ghost') catchphrase = '유령처럼 지나간 하루';
      else if (endingId === 'dawn_hero') catchphrase = '새벽 첫차의 수호자';
      exportScreenshot(catchphrase);
    }
  }, 1500);
}

/* ──────────────────────────────────────────
   공유 모달
   ────────────────────────────────────────── */
function showShareModal(shareText, endingId, sc) {
  sfx.ui();
  const url     = `https://bbkjhdeq.gensparkspace.com/`;
  const ending  = ENDINGS[endingId];

  const overlay = document.createElement('div');
  overlay.id = 'save-modal-overlay';
  overlay.innerHTML = `
    <div id="save-modal">
      <div id="save-modal-header">
        <span>📤 결과 공유하기</span>
        <button id="save-modal-close">✕</button>
      </div>

      <div id="save-modal-info" style="flex-direction:column;gap:4px;text-align:center">
        <div style="font-size:16px;color:${ending.color};font-weight:700;margin-bottom:4px">
          ${ending.grade}
        </div>
        <div style="font-size:12px;white-space:pre-line;color:#5a8a9a;line-height:1.6">
${shareText}
        </div>
      </div>

      <div id="save-qr-wrap">
        <canvas id="save-qr-canvas"></canvas>
      </div>

      <button id="save-capture" class="end-btn" style="width:100%; margin-bottom:12px; background:#102a18; border-color:#205030;">📸 결과 카드 이미지 캡처</button>

      <div id="save-modal-desc">
        📱 친구에게 QR 보여주기<br>
        💻 아래 텍스트 복사해서 공유
      </div>

      <div id="save-url-row">
        <input id="save-url-input" type="text" readonly value="${shareText.replace(/\n/g,' | ')}">
        <button id="save-url-copy">📋 복사</button>
      </div>
      <div id="save-copy-msg"></div>

      <div style="margin-top:8px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
        <button class="save-load-btn" id="share-twitter">🐦 트위터</button>
        <button class="save-load-btn" id="share-kakao">💛 카카오</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // QR — 게임 URL만
  QRCode.toCanvas(
    document.getElementById('save-qr-canvas'),
    url,
    { width: 180, margin: 2, color: { dark: '#c8e8f8', light: '#070b0e' } }
  );

  // 캡처 버튼
  document.getElementById('save-capture').onclick = () => {
    if (typeof exportScreenshot === 'function') {
      let catchphrase = '이런 엔딩이 있었어?';
      if (endingId === 'secret') catchphrase = '봉화산 비밀 밝혀냈다';
      else if (endingId === 'ghost') catchphrase = '아무도 모르게 사라진 흔적';
      else if (endingId === 'dawn_hero') catchphrase = '새벽 첫차의 수호자';
      exportScreenshot(catchphrase);
    }
  };

  // 복사 버튼
  document.getElementById('save-url-copy').onclick = () => {
    navigator.clipboard.writeText(shareText).catch(() => {
      const inp = document.getElementById('save-url-input');
      inp.select(); document.execCommand('copy');
    });
    const msg = document.getElementById('save-copy-msg');
    msg.textContent = '✅ 복사되었습니다!';
    setTimeout(() => { msg.textContent = ''; }, 2000);
    sfx.ui();
  };

  // 트위터 공유
  document.getElementById('share-twitter').onclick = () => {
    const tw = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(tw, '_blank');
    sfx.ui();
  };

  // 카카오 (URL scheme으로 앱 연동 없이 링크 공유)
  document.getElementById('share-kakao').onclick = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      const msg = document.getElementById('save-copy-msg');
      msg.textContent = '✅ 클립보드에 복사! 카카오톡에 붙여넣기하세요.';
      setTimeout(() => { msg.textContent = ''; }, 3000);
    });
    sfx.ui();
  };

  // 닫기
  const close = () => { overlay.remove(); sfx.ui(); };
  document.getElementById('save-modal-close').onclick = close;
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
}
