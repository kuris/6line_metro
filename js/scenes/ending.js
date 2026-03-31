/* ═══════════════════════════════════════════════════
   scenes/ending.js
   6호선 잔혹사: 엔딩 시퀀스
   — 텍스트 속도 최적화: 여운은 남기되 호흡은 빠르게 가져갑니다.
   ═══════════════════════════════════════════════════ */

'use strict';

async function sceneEnding(type = 'default') {
  TrainPanel.setState('ending');
  
  if (type === 'ascension') {
    await seq([
      ['의식이 조각나며 당신은 신의 일부가 됩니다.', 'death', 1500],
      ['더 이상의 고통도, 더 이상의 의심도 없습니다.', 'narrator', 2200],
      ['오직 영원한 합일만이 존재할 뿐입니다.', 'highlight', 1800],
    ]);
  } else {
    await seq([
      ['열차는 멈췄지만, 당신의 여정은 끝나지 않았습니다.', 'narrator', 1500],
      ['어둠 속에서 다시 울리는 구동음. 저주받은 회귀가 당신을 부릅니다.', 'death', 2200],
      ['[†] 순례의 끝, 혹은 새로운 시작.', 'highlight', 1800],
    ]);
  }

  // 최종 점수 및 통계 출력 (속도 상향)
  await seq([
    ['', 'blank', 500],
    [`총 여정 거리: 36.4km`, 'system', 600],
    [`수집한 업보(業): ${G.score}`, 'system', 600],
    [`최종 정신력(魂): ${G.sanity}`, 'system', 600],
    [`감염도(蝕): ${G.infection}%`, 'system', 600],
    ['', 'blank', 800],
  ]);

  await print('당신은 이 노선을 다시 이식하시겠습니까?', 'warn');
  
  choices([
    ['다시 여정을 시작한다 (회귀)', () => location.reload()],
    ['지옥에서 로그아웃한다', () => {
      TrainPanel.addLog('시스템 종료 중...', 'warn');
      setTimeout(() => alert('당신은 탈출할 수 없습니다.'), 1500);
    }]
  ]);
}

window.sceneEnding = sceneEnding;
