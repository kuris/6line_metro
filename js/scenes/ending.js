/* ═══════════════════════════════════════════════════
   scenes/ending.js
   6호선 잔혹사: 다중 엔딩 및 피의 게임 오버
   — 결말은 탈출이 아니라, 당신의 영혼이 멈춰 선 곳입니다.
   ═══════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────
   엔딩 분기 판정
   ────────────────────────────────────────── */
function determineEnding() {
  const sc   = G.score; // Karma (業)
  const mis  = G.missionCount;
  const tod  = G.timeOfDay || 'noon';
  const inv  = G.inventory || [];

  // 특수 엔딩 우선 체크
  if (inv.includes('속삭이는 두개골') && inv.includes('살아있는 유충 병')) {
    return 'cursed_artifact'; // 🌀 저주받은 수집가
  }
  
  if (sc >= 50) {
    return 'karma_monarch';    // 👹 업보를 짊어진 군주 (최고 득점)
  }
  if (sc >= 30) {
    return 'scarred_survivor'; // 🛡️ 흉터 입은 생존자 (고득점)
  }
  if (sc >= 15) {
    return 'soul_partial';     // 🌓 반쪽짜리 영혼 (중간 득점)
  }
  if (G.infection >= 80) {
    return 'evolving_horror';  // 🦠 진화하는 공포 (고감염)
  }
  
  return 'eternal_passenger';  // 🌑 영원히 내리지 못하는 승객 (저득점)
}

/* ──────────────────────────────────────────
   게임 오버 (배드 엔딩)
   ────────────────────────────────────────── */
async function sceneGameOver() {
  clearUI();
  TrainPanel.setState('ending');
  TrainPanel.addLog('[†] 생존 중단 — 영혼이 회수되었습니다', 'danger');
  if (window.HorrorFX) window.HorrorFX.scare();

  let reason = '';
  if (G.health <= 0) reason = '육신(骸)이 갈가리 찢겼습니다.';
  else if (G.sanity <= 0) reason = '영혼(魂)이 광기에 먹혔습니다.';
  else if (G.infection >= 100) reason = '침식(蝕)이 자아를 덮쳤습니다.';

  await printAscii([
    [`  ╔══════════════════════════════╗`, ''],
    [`  ║   ☠︎ DATA CORRUPTED          ║`, 'danger'],
    [`  ║   이 지옥에서 당신은 사라졌다   ║`, 'hl'],
    [`  ╠══════════════════════════════╣`, ''],
    [`  ║  사유 : ${padRight(reason, 20)}║`, ''],
    [`  ╚══════════════════════════════╝`, ''],
  ], 'ascii-danger', { rowDelay: 50, sound: 'boom' });

  await seq([
    ['', 'blank', 300],
    ['눈앞이 핏빛으로 물든다.', 'narrator', 600],
    ['전동차의 덜컹거림이 이제 당신의 심장 박동과 동기화된다.', 'narrator', 900],
    ['당신은 이제 6호선의 영원한 부품 중 하나다.', 'death', 1200],
    ['', 'blank', 1500],
    ['[†] 다음 승객을 기다립니다...', 'highlight', 1800],
  ]);

  const sc = G.score;

  const btnWrap = document.createElement('div');
  btnWrap.id = 'ending-btn-wrap';

  const shareText = `[6호선 잔혹사] ${G.playerName}님의 영혼 소멸\n☠︎ 사유: ${reason}\n業(업): ${sc}\n다시 저주의 궤도에 오르기 → https://bbkjhdeq.gensparkspace.com/`;
  const shareBtn  = document.createElement('button');
  shareBtn.className = 'end-btn share-btn';
  shareBtn.innerHTML = '📤 비극적 소식 전파하기';
  shareBtn.onclick   = () => showShareModal(shareText, 'ghost', sc);
  btnWrap.appendChild(shareBtn);

  const restartBtn = document.createElement('button');
  restartBtn.className = 'end-btn';
  restartBtn.innerHTML = '🚇 다시 탑승하기 (영혼의 재점화)';
  restartBtn.onclick   = () => { if (window.sfx) sfx.ui(); sceneIntro(); };
  btnWrap.appendChild(restartBtn);

  OUT.appendChild(btnWrap);
  scrollBottom();
}

/* ──────────────────────────────────────────
   정식 엔딩 연출
   ────────────────────────────────────────── */
async function sceneEnding(endingKey) {
  clearUI();
  TrainPanel.setState('ending');
  
  let title = '';
  let sub   = '';
  let desc  = [];

  switch(endingKey) {
    case 'karma_monarch':
      title = '업보를 짊어진 군주';
      sub = '👹 THE LORD OF KARMA';
      desc = [
        '당신이 지나온 39개의 무덤엔 당신의 비정한 결단과 피의 흔적이 가득하다.',
        '지옥의 왕은 당신의 비릿한 업보에 경탄하며, 노선의 열쇠를 건넸다.',
        '이제 당신은 이 전동차를 운전하는 사신(死神)이다.',
      ];
      break;
    case 'scarred_survivor':
      title = '흉터 입은 생존자';
      sub = '🛡️ THE SCARRED SURVIVOR';
      desc = [
        '간신히 신내역의 안개를 뚫고 지상으로 나왔지만, 태양 빛이 너무나 아프다.',
        '당신의 등엔 수많은 영혼이 매달려 있고, 밤마다 전동차 소리에 비명을 지를 것이다.',
        '생존은 구원인가, 아니면 또 다른 고통의 시작인가.',
      ];
      break;
    case 'eternal_passenger':
      title = '영원히 내리지 못하는 승객';
      sub = '🌑 THE ETERNAL PASSENGER';
      desc = [
        '아무런 흔적도 남기지 못한 채, 당신의 존재는 흐릿해져 간다.',
        '문은 열렸으나 당신의 발은 바닥에 눌어붙어 움직이지 않는다.',
        '당신은 이제 창문에 비친 기괴한 허상 중 하나로 남을 뿐이다.',
      ];
      break;
    default:
      title = '망각의 끝';
      sub = '🌫️ THE FORGOTTEN END';
      desc = [
        '여정이 끝났다. 하지만 당신은 아무것도 기억하지 못한 채 눈을 뜬다.',
        '어느 역인지 알 수 없는 승강장. 당신의 손엔 6호선 승차권만이 쥐어져 있다.',
      ];
  }

  await printAscii([
    [`  ╔══════════════════════════════╗`, ''],
    [`  ║   ✦ DESTINATION REACHED     ║`, 'hl'],
    [`  ║   ${padRight(title, 20)} ║`, 'life'],
    [`  ╠══════════════════════════════╣`, ''],
    [`  ║  최종 業(업) : ${padRight(G.score.toString(), 10)}    ║`, ''],
    [`  ╚══════════════════════════════╝`, ''],
  ], 'ascii-ending', { rowDelay: 70 });

  for (const line of desc) {
    await print(line, 'narrator', 800);
  }

  if (window.HorrorFX) window.HorrorFX.flashRed(1000);

  // 결과 공유 버튼
  const btnWrap = document.createElement('div');
  btnWrap.id = 'ending-btn-wrap';
  
  const shareText = `[6호선 잔혹사] ${G.playerName}님의 여정 완결\n✦ 엔딩: ${title}\n業(업): ${G.score}\n지옥의 문턱 넘기 → https://bbkjhdeq.gensparkspace.com/`;
  const shareBtn = document.createElement('button');
  shareBtn.className = 'end-btn share-btn';
  shareBtn.innerHTML = '📤 나의 비극 전파하기';
  shareBtn.onclick = () => showShareModal(shareText, endingKey, G.score);
  btnWrap.appendChild(shareBtn);

  const restartBtn = document.createElement('button');
  restartBtn.className = 'end-btn';
  restartBtn.innerHTML = '🚇 처음부터 다시 순례하기';
  restartBtn.onclick = () => sceneIntro();
  btnWrap.appendChild(restartBtn);

  OUT.appendChild(btnWrap);
  scrollBottom();
}

function padRight(str, len) {
  let s = str.toString();
  while (s.length < len) s += ' ';
  return s;
}
