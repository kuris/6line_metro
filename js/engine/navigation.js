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

  // ── 오디오/이미지 컷인 연출 (역 도착) ──
  if (typeof sfx !== 'undefined' && sfx.chime) sfx.chime(0.5);

  const imgFname = (typeof STATION_IMAGES !== 'undefined') ? STATION_IMAGES[st.name] : null;
  const flagKey = 'img_' + st.id;
  
  // 최초 진입 시 특정 역 100%, 일반 역 60% 확률로 컷인 발동 (이후 재진입 시 15% 확률)
  const hasSeen = G.flags[flagKey];
  const isAnchor = ['보문', '합정', '삼각지', '동묘앞', '연신내'].includes(st.name);
  
  let shouldShow = false;
  if (imgFname) {
    if (!hasSeen) {
      if (isAnchor || Math.random() < 0.6) shouldShow = true;
    } else {
      // 이미 봤던 역이라도 15% 확률로 다시 보여줌 (분위기 유지)
      if (Math.random() < 0.15) shouldShow = true;
    }
  }

  if (shouldShow) {
    G.flags[flagKey] = true;
    const msgs = [
      `[관측 기록 복원] 마지막 목격 위치: ${st.name}`,
      `[오염된 아카이브 읽는 중] ...무언가 ${st.name} 플랫폼을 헤매고 있습니다.`,
      `(플래시백) 찰나의 흔들림 속에서 ${st.name}의 풍경이 망막에 새겨진다.`,
      `익숙한 ${st.name}역. 하지만 시계의 초침이 거꾸로 돌고 있다.`
    ];
    const text = msgs[Math.floor(Math.random() * msgs.length)];
    if (typeof showEventImage === 'function') {
      await showEventImage('images/subway/' + imgFname, text, 1400, { sound: 'glitch', styleClass: 'style-cctv' });
    }
  } else if (imgFname && Math.random() < 0.2) {
    // 역 배경이 안 떴더라도 20% 확률로 "유령 승객" 캐릭터가 스쳐지나감
    const ghostMsgs = [
      `반대편 승강장에 누군가 우두커니 서 있습니다.`,
      `방금 스쳐 지나간 사람의 얼굴이... 없었습니다.`,
      `"다음 역... 아니, 여긴 어디지?" 등 뒤에서 속삭임이 들립니다.`,
      `피로 가득한 누군가의 시선이 느껴집니다.`
    ];
    const gText = ghostMsgs[Math.floor(Math.random() * ghostMsgs.length)];
    const gImg = (Math.random() < 0.5) ? 'images/chracter/mad_girl.png' : 'images/chracter/fear_boy.png';
    if (typeof showEventImage === 'function') {
      await showEventImage(gImg, gText, 1300, { sound: 'glitch', styleClass: 'style-ghost' });
    }
  }

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
