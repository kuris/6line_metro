/* ═══════════════════════════════════════════════════
   engine/navigation.js
   역 간 이동 엔진 (STATION_EVENTS 기반)
   ═══════════════════════════════════════════════════ */

'use strict';

/**
 * 전역 이벤트 레지스트리
 * 각 개별 이벤트 파일(events_partX.js)에서 이 객체에 함수를 등록합니다.
 */
window.STATION_EVENTS = window.STATION_EVENTS || {};

/**
 * 역 간 이동 공통 엔진
 * @param {number} nextIdx 다음 역 인덱스 (G.dirStep에 따라 +1 또는 -1)
 */
async function sceneNextStation(nextIdx) {
  // 종착 조건: 방향에 따라 경계 체크
  const isUp   = (G.dirStep || 1) >= 0;
  const isEnd  = isUp ? (nextIdx >= STATIONS.length) : (nextIdx < 0);
  if (isEnd) {
    await sceneEnding();
    return;
  }

  // 종착역 도달 체크 (G.endStation 기준)
  if (typeof G.endStation === 'number' && nextIdx === G.endStation) {
    const st = STATIONS[nextIdx];
    G.currentStation = nextIdx;
    G.moveCount++;
    updateStats();

    TrainPanel.setState('running');
    await new Promise(r => setTimeout(r, 400));
    await TrainPanel.playArrival(st.name, null);
    TrainPanel.updateStationInfo(st, STATIONS, nextIdx);
    updateProgress(STATIONS, nextIdx);
    clearUI();

    const epDiv = document.createElement('div');
    epDiv.className = 'line ep-header show';
    const dirLabel = isUp ? '상행 ▲' : '하행 ▼';
    epDiv.innerHTML = `
      <div class="ep-num">STATION ${st.code} · 종착역 [${dirLabel}]</div>
      <div class="ep-title">${st.name} <span style="font-size:11px;color:#4a6070;font-weight:400">${st.nameEn}</span></div>
      <div class="ep-sub">${st.desc}${st.transfer ? ` · 환승: ${st.transfer}` : ''}</div>`;
    OUT.appendChild(epDiv);

    TrainPanel.setState('ending');
    TrainPanel.addLog(`종착역 도착: ${st.name}`, 'new');

    if (st.hasEvent && STATION_EVENTS[st.eventId]) {
      await STATION_EVENTS[st.eventId](nextIdx);
    } else {
      await seq([
        ['', 'blank', 0],
        [`종착역 ${st.name}에 도착했습니다.`, 'announce', 200],
        [st.desc, 'narrator', 500],
        ['', 'blank', 800],
      ]);
      await sceneEnding();
    }
    return;
  }

  const st = STATIONS[nextIdx];
  G.currentStation = nextIdx;
  G.moveCount++;
  updateStats();

  // 이동 중 랜덤 소사건 (이벤트 역 이동 전, 20% 확률로 추가 발동)
  if (Math.random() < 0.20) await maybeRandomEvent();

  // 열차 주행 → 도착 연출
  const prevIdx = nextIdx - (G.dirStep || 1);
  const prevSt  = (prevIdx >= 0 && prevIdx < STATIONS.length) ? STATIONS[prevIdx] : null;
  TrainPanel.setState(prevSt ? prevSt.trainState : 'running');
  await new Promise(r => setTimeout(r, 500));

  await TrainPanel.playArrival(st.name, null);
  TrainPanel.updateStationInfo(st, STATIONS, nextIdx);
  updateProgress(STATIONS, nextIdx);

  clearUI();

  // 방향 표시
  const dirLabel  = isUp ? '상행 ▲' : '하행 ▼';
  const remaining = Math.abs(G.endStation - nextIdx);

  // 에피소드 헤더
  const epDiv = document.createElement('div');
  epDiv.className = 'line ep-header show';
  epDiv.innerHTML = `
    <div class="ep-num">STATION ${st.code} [${dirLabel}] · 종점까지 ${remaining}역</div>
    <div class="ep-title">${st.name} <span style="font-size:11px;color:#4a6070;font-weight:400">${st.nameEn}</span>${st.hanja ? `<span style="font-size:10px;color:#2a5060;margin-left:6px">${st.hanja}</span>` : ''}</div>
    <div class="ep-sub">${st.desc}${st.transfer ? ` · 환승: ${st.transfer}` : ''}</div>`;
  OUT.appendChild(epDiv);

  TrainPanel.setState(st.trainState);

  // 한자 퀴즈 체크
  if (typeof maybeRunHanjaQuiz === 'function') {
    const quizRan = await maybeRunHanjaQuiz(st);
    if (quizRan) {
      await print('', 'blank');
      await print('열차는 멈추지 않고 계속 달려야 한다...', 'narrator', 300);
      await print('', 'blank');
      scrollBottom();
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // 이벤트 있는 역이면 씬 실행, 없으면 통과
  if (st.hasEvent && STATION_EVENTS[st.eventId]) {
    await STATION_EVENTS[st.eventId](nextIdx);
  } else {
    await showTriviaPass(st, nextIdx);
  }
}

/**
 * 이벤트 없는 역 통과 — trivia 카드 표시
 */
async function showTriviaPass(st, stIdx) {
  const trivia = (typeof getTrivia === 'function') ? getTrivia(st.id) : null;

  if (trivia && trivia.cards && trivia.cards.length > 0) {
    TrainPanel.addLog(`${st.name}: ${trivia.tip}`, 'info');

    const hanjaCard = trivia.cards.find(c => c.type === 'hanja' || c.type === 'origin');
    if (hanjaCard) {
      await seq([
        ['', 'blank', 0],
        [st.desc, 'narrator', 200],
        ['', 'blank', 400],
      ]);

      if (st.hanja || st.hanjaDesc) {
        await printHanjaCard(st);
      }

      for (const card of trivia.cards.filter(c => c !== hanjaCard)) {
        await print('', 'blank');
        await print(`${card.icon} ${card.title}`, 'highlight');
        const plainBody = card.body.replace(/<[^>]+>/g, '').replace(/\n\s*/g, ' ');
        await print(plainBody, 'narrator');
      }
    } else {
      await seq([
        ['', 'blank', 0],
        [st.desc, 'narrator', 200],
        ['', 'blank', 400],
      ]);
      for (const card of trivia.cards) {
        await print('', 'blank');
        await print(`${card.icon} ${card.title}`, 'highlight');
        const plainBody = card.body.replace(/<[^>]+>/g, '').replace(/\n\s*/g, ' ');
        await print(plainBody, 'narrator');
      }
    }
  } else {
    await seq([
      ['', 'blank', 0],
      [st.desc, 'narrator', 200],
      ['', 'blank', 400],
      ['창밖으로 역 간판이 스쳐지나간다.', 'narrator', 600],
      ['', 'blank', 800],
    ]);
  }

  TrainPanel.addLog(`${st.name} 통과`, 'info');
  await maybeRandomEvent();
  await print('', 'blank');

  const dirLabel = (G.dirStep || 1) >= 0 ? '상행 ▲' : '하행 ▼';

  choices([
    [`▸  계속 이동한다 (${dirLabel})`, () => {
      TrainPanel.playDepart();
      sceneNextStation(stIdx + (G.dirStep || 1));
    }]
  ]);
}
