/* ═══════════════════════════════════════════════════
   scenes/station_events.js
   역별 이벤트 씬 + sceneNextStation (역 간 이동 엔진)
   ═══════════════════════════════════════════════════ */

'use strict';

/* ────────────────────────────────────────────────────
   역 간 이동 공통 엔진
   nextIdx: 다음 역 인덱스 (G.dirStep에 따라 +1 또는 -1)
   ──────────────────────────────────────────────────── */
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
    // 종착역이면 해당 이벤트를 실행하고 엔딩으로
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
  const endSt     = STATIONS[G.endStation] || STATIONS[STATIONS.length - 1];
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

  // 이벤트 있는 역이면 씬 실행, 없으면 통과
  if (st.hasEvent && STATION_EVENTS[st.eventId]) {
    await STATION_EVENTS[st.eventId](nextIdx);
  } else {
    // 이벤트 없는 역 — trivia 카드 + 묘사 후 진행
    await showTriviaPass(st, nextIdx);
  }
}

/* ────────────────────────────────────────────────────
   이벤트 없는 역 통과 — trivia 카드 표시
   ──────────────────────────────────────────────────── */
async function showTriviaPass(st, stIdx) {
  const trivia = (typeof getTrivia === 'function') ? getTrivia(st.id) : null;

  if (trivia && trivia.cards && trivia.cards.length > 0) {
    TrainPanel.addLog(`${st.name}: ${trivia.tip}`, 'info');

    // 역명 한자 유래 카드 (첫 번째 카드가 hanja 타입이면 ASCII 박스로)
    const hanjaCard = trivia.cards.find(c => c.type === 'hanja' || c.type === 'origin');
    if (hanjaCard) {
      await seq([
        ['', 'blank', 0],
        [st.desc, 'narrator', 200],
        ['', 'blank', 400],
      ]);

      // 한자 유래 ASCII 박스
      if (st.hanja || st.hanjaDesc) {
        await printHanjaCard(st);
      }

      // 나머지 카드들 텍스트로
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
    // trivia 없는 역 — 기본 묘사
    await seq([
      ['', 'blank', 0],
      [st.desc, 'narrator', 200],
      ['', 'blank', 400],
      ['창밖으로 역 간판이 스쳐지나간다.', 'narrator', 600],
      ['', 'blank', 800],
    ]);
  }

  TrainPanel.addLog(`${st.name} 통과`, 'info');

  // 랜덤 소사건 (30% 확률)
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

/* ────────────────────────────────────────────────────
   이벤트 씬 레지스트리
   각 함수: async (stIdx) => { ... sceneNextStation(stIdx+1) }
   ──────────────────────────────────────────────────── */
const STATION_EVENTS = {

  /* ── 응암 (601) ── */
  async ev_eungam(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('응암 — 첫차 탑승객과 눈이 마주쳤다', 'event');
    TrainPanel.showOverlay('★ 의문의 메모지', 3000);

    await printAscii([
      [`  ┌────────────────────────────┐`, ''],
      [`  │   첫차  AM 05:30           │`, 'hl'],
      [`  │   응암 → 봉화산            │`, ''],
      [`  │   승객 수: 3명             │`, ''],
      [`  │   [메모지가 발 밑에 있다]  │`, 'hl'],
      [`  └────────────────────────────┘`, ''],
    ], 'ascii-station', { rowDelay: 60, sound: 'modem' });

    await seq([
      ['새벽 5시 30분. 첫차다.', 'narrator', 200],
      ['텅 빈 6호선 객차. 형광등이 차갑게 빛난다.', 'narrator', 450],
      [`${gn()}의 발 밑에 접힌 메모지 하나가 있다.`, 'narrator', 700],
      ['', 'blank', 900],
      ['"이것을 읽는 사람에게 — 봉화산에서 내리지 마세요."', 'dialog', 1000],
      ['', 'blank', 1200],
      ['필체는 급하고 떨린다.', 'narrator', 1300],
      ['', 'blank', 1500],
      ['어떻게 할 것인가.', 'highlight', 1600],
    ]);

    choices([
      ['① 메모지를 주머니에 넣는다 — 일단 보관', async () => {
        addItem('수상한 메모지');
        sfx.item();
        TrainPanel.addLog('메모지 획득', 'event');
        G.score += 2; G.missionCount++; updateStats();
        await seq([
          ['"봉화산에서 내리지 마라..." 이게 무슨 뜻이지.', 'narrator', 200],
          ['메모지를 접어 주머니에 넣었다.', 'result', 400],
          ['누가 남겨둔 것인지 — 알 수 없다.', 'narrator', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 그냥 무시하고 발로 밀어낸다', async () => {
        TrainPanel.addLog('메모지 무시', 'info');
        G.score += 1; updateStats();
        await seq([
          ['신경 쓸 게 뭐 있나. 그냥 발로 밀었다.', 'result', 200],
          ['하지만 메모지의 내용이 뇌리에 남는다.', 'narrator', 500],
          ['봉화산...', 'whisper', 800],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['③ 주위를 둘러보며 메모지를 남긴 사람을 찾는다', async () => {
        TrainPanel.setState('danger');
        TrainPanel.addLog('주변 탐색 중...', 'warn');
        G.score += 3; G.missionCount++; updateStats();
        await seq([
          ['객차 안을 둘러봤다. 세 명의 승객.', 'narrator', 200],
          ['창가에 앉은 노인. 문 쪽에 선 청년. 끝자리 여성.', 'narrator', 450],
          ['여성과 눈이 마주쳤다. 그녀가 고개를 돌렸다.', 'highlight', 700],
          ['', 'blank', 900],
          ['"... 괜찮으시겠어요?"', 'highlight', 1000],
          ['대답이 없다.', 'narrator', 1200],
          ['메모지를 집어넣었다. 나중에 생각하자.', 'result', 1500],
        ]);
        addItem('수상한 메모지');
        sfx.item();
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
    ]);
  },

  /* ── 불광 (603) — 3호선 환승 혼잡 ── */
  async ev_bulgwang(stIdx) {
    TrainPanel.setState('crowded');
    TrainPanel.addLog('불광 — 3호선 환승객 폭주', 'warn');
    TrainPanel.showOverlay('⚠ 혼잡 — 소매치기 주의', 3000);

    await seq([
      ['', 'blank', 0],
      ['불광역. 3호선 환승역.', 'announce', 200],
      ['순식간에 객차가 꽉 찼다.', 'narrator', 450],
      ['누군가의 팔꿈치가 옆구리를 파고든다.', 'narrator', 700],
      ['', 'blank', 900],
      ['그때 — 옆 승객이 작게 소리를 질렀다.', 'narrator', 1000],
      ['"아 — 지갑이...!"', 'dialog', 1200],
      ['', 'blank', 1400],
      ['혼잡한 틈을 타 소매치기가 있었던 것이다.', 'narrator', 1500],
      ['어떻게 할 것인가.', 'highlight', 1700],
    ]);

    choices([
      ['① 소리를 질러 주변 승객들에게 알린다', async () => {
        sfx.alarm();
        TrainPanel.setState('danger');
        TrainPanel.addLog('소매치기 신고 — 대응 중', 'warn');
        G.score += 3; G.missionCount++; updateStats();
        await seq([
          ['"소매치기입니다! 거기 잡아요!"', 'death', 200],
          ['객차 안이 술렁였다.', 'narrator', 450],
          ['범인은 문 쪽으로 밀고 나가려 했지만 —', 'narrator', 700],
          ['이미 역에 멈춰선 열차. 문이 열리자마자 역무원이 있었다.', 'narrator', 1000],
          ['피해자가 고개를 숙였다. "감사합니다."', 'dialog', 1300],
          ['+3점 — 의로운 행동', 'life', 1600],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 가만히 있는다 — 내 일이 아니다', async () => {
        TrainPanel.addLog('소매치기 목격 — 무시', 'info');
        G.score += 0; updateStats();
        await seq([
          ['내 것도 아닌데.', 'result', 200],
          ['열차가 불광역을 출발했다.', 'narrator', 500],
          ['피해자의 황망한 얼굴이 잠시 보였다.', 'narrator', 800],
          ['모른 척 창밖을 바라봤다.', 'narrator', 1100],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['③ 조용히 피해자에게 목격한 내용을 알려준다', async () => {
        G.score += 2; G.missionCount++; updateStats();
        TrainPanel.addLog('피해자에게 귀띔', 'event');
        await seq([
          ['살며시 팔을 잡았다.', 'narrator', 200],
          ['"회색 점퍼 입은 남자 쪽 같아요. 조용히 역무원 부르세요."', 'highlight', 400],
          ['피해자가 눈을 크게 뜬 뒤, 고개를 끄덕였다.', 'narrator', 700],
          ['작은 도움. 작은 연대.', 'result', 1000],
          ['+2점 — 조용한 도움', 'life', 1200],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
    ]);
  },

  /* ── 연신내 (605) — 매우 혼잡 ── */
  async ev_yeonsinnae(stIdx) {
    TrainPanel.setState('crowded');
    TrainPanel.addLog('연신내 — 극혼잡 / 밀침 사고', 'warn');
    TrainPanel.showOverlay('⚠ 극혼잡 — 열차 지연', 2500);

    await printAscii([
      [`  ⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙`, 'hl'],
      [`  ⊙ 연신내 — 3호선 환승 ⊙`, 'hl'],
      [`  ⊙ 탑승 대기 인원: ████  ⊙`, ''],
      [`  ⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙`, ''],
    ], 'ascii-crowd', { rowDelay: 60 });

    await seq([
      ['연신내역. 3호선 환승.', 'announce', 200],
      ['이미 꽉 찬 객차에 더 많은 사람이 밀고 들어온다.', 'narrator', 450],
      ['누군가 밀렸다. 노인이 비틀거렸다.', 'narrator', 700],
      ['', 'blank', 900],
      ['어떻게 반응하겠는가.', 'highlight', 1000],
    ]);

    choices([
      ['① 노인을 부축해 자리를 양보한다', async () => {
        G.score += 3; G.missionCount++; updateStats();
        TrainPanel.addLog('노인 부축 — 양보', 'event');
        await seq([
          ['팔을 뻗어 노인의 팔꿈치를 잡았다.', 'narrator', 200],
          ['"앉으세요, 어르신."', 'highlight', 400],
          ['노인이 천천히 앉으며 손을 꼭 잡아주었다.', 'narrator', 700],
          ['"고마워요, 학생."', 'dialog', 1000],
          ['학생이 아닌 지는 오래됐지만, 기분이 나쁘지 않았다.', 'result', 1300],
          ['+3점 — 따뜻한 마음', 'life', 1500],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 혼잡이 심해 본인도 간신히 버티고 있다', async () => {
        G.score += 1; updateStats();
        await seq([
          ['손잡이를 꽉 잡았다. 여기가 전쟁터인가.', 'narrator', 200],
          ['노인은 다행히 옆 승객이 잡아주었다.', 'narrator', 500],
          ['안도했지만, 동시에 미안한 마음도 들었다.', 'result', 800],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
    ]);
  },

  /* ── 새절 (607) — 이상 승객 ── */
  async ev_saejul(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('새절 — 이상 승객 포착', 'event');
    TrainPanel.showOverlay('★ 수상한 인물 탑승', 3000);

    await seq([
      ['새절역. 탑승객 중 수상한 인물이 보인다.', 'narrator', 200],
      ['커다란 짐 가방. 모자를 푹 눌러쓴 남성.', 'narrator', 450],
      ['가방에서 작은 소리가 들린다.', 'narrator', 700],
      ['', 'blank', 900],
      ['... 꽤액.', 'death', 1000],
      ['', 'blank', 1200],
      ['닭 울음소리다.', 'highlight', 1300],
      ['', 'blank', 1500],
      ['어떻게 할 것인가.', 'highlight', 1600],
    ]);

    choices([
      ['① 모른 척한다 — 내가 왜', async () => {
        G.score += 1; updateStats();
        await seq([
          ['지하철에 닭을.', 'result', 200],
          ['뭐 어때. 도착만 하면 되지.', 'narrator', 500],
          ['꽤액 소리가 계속 들렸다.', 'narrator', 800],
          ['다른 승객들도 못 들은 척이다.', 'narrator', 1100],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 살며시 말을 건넨다 — "뭐가 들어있어요?"', async () => {
        G.score += 2; G.missionCount++; updateStats();
        TrainPanel.addLog('이상 승객에게 접근', 'event');
        await seq([
          ['"저... 혹시 가방 안에 뭐가 있나요?"', 'highlight', 200],
          ['남자가 모자를 올리며 민망하게 웃었다.', 'narrator', 450],
          ['"아 이게... 어머니 병문안 가는 길에 잠깐만 맡아달라고 해서..."', 'dialog', 700],
          ['"재래시장 닭인데, 미안합니다. 곧 내려요."', 'dialog', 1000],
          ['뭔가 훈훈하고, 뭔가 황당하다.', 'result', 1300],
          ['+2점 — 용기 있는 한마디', 'life', 1500],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
    ]);
  },

  /* ── DMC (609) — 극혼잡 환승 ── */
  async ev_dmc(stIdx) {
    TrainPanel.setState('crowded');
    TrainPanel.addLog('DMC — 공항철도·경의중앙선 대환승', 'warn');
    TrainPanel.showOverlay('⚠ 3개 노선 환승 — 극혼잡', 3000);

    await printAscii([
      [`  ╔══════════════════════════╗`, ''],
      [`  ║  DIGITAL MEDIA CITY     ║`, 'hl'],
      [`  ║  공항철도  ◀──○──▶     ║`, ''],
      [`  ║  경의중앙선 ◀──○──▶    ║`, ''],
      [`  ║  6호선     ◀──★──▶     ║`, 'hl'],
      [`  ╚══════════════════════════╝`, ''],
    ], 'ascii-station', { rowDelay: 60, sound: 'modem' });

    await seq([
      ['디지털미디어시티. 방송국, 스타트업, 공항 가는 사람들.', 'narrator', 200],
      ['환승 인파가 쏟아진다.', 'narrator', 450],
      ['', 'blank', 600],
      ['누군가 손에 들고 있던 카메라가 바닥에 떨어졌다.', 'narrator', 700],
      ['발에 밟힐 것 같다.', 'death', 1000],
    ]);

    choices([
      ['① 몸을 숙여 카메라를 집어준다', async () => {
        G.score += 3; G.missionCount++; updateStats();
        await seq([
          ['혼잡한 틈에서 몸을 숙이는 것은 모험이었다.', 'narrator', 200],
          ['카메라를 집어 들었다. 다행히 멀쩡하다.', 'narrator', 500],
          ['상대방은 방송국 카메라 기자였다.', 'narrator', 800],
          ['"감사합니다! 생방 나가기 전에 깨질 뻔 했어요!"', 'dialog', 1100],
          ['세상은 이런 식으로 돌아간다.', 'result', 1400],
          ['+3점 — 발 빠른 도움', 'life', 1600],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 발에 밟히기 전에 발로 옆으로 밀어놓는다', async () => {
        G.score += 1; updateStats();
        await seq([
          ['발끝으로 카메라를 벽 쪽으로 밀었다.', 'result', 200],
          ['우선은 안전하다.', 'narrator', 500],
          ['카메라 주인이 뒤늦게 발견하고 집어들었다.', 'narrator', 800],
          ['눈이 마주쳤지만 고맙다는 말은 없었다.', 'narrator', 1100],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
    ]);
  },

  /* ── 월드컵경기장 (610) ── */
  async ev_worldcup(stIdx) {
    TrainPanel.setState('crowded');
    TrainPanel.addLog('월드컵경기장 — 경기 후 귀가 행렬', 'warn');
    TrainPanel.showOverlay('⚽ 경기 종료 — 귀가 행렬', 2500);

    await printAscii([
      [`  ┌──────────────────────────┐`, ''],
      [`  │  ⚽  FINAL SCORE         │`, 'hl'],
      [`  │  서울  3  :  2  수원     │`, 'hl'],
      [`  │  경기 종료 — 만원 지하철 │`, ''],
      [`  └──────────────────────────┘`, ''],
    ], 'ascii-crowd', { rowDelay: 70 });

    await seq([
      ['경기가 방금 끝났다. 서울이 이겼다.', 'narrator', 200],
      ['객차가 응원 머플러를 두른 사람들로 꽉 찼다.', 'narrator', 450],
      ['', 'blank', 600],
      ['옆에 선 중학생이 들뜬 목소리로 묻는다.', 'narrator', 700],
      ['"형(언니)! 오늘 경기 보셨어요? 마지막 골 보셨어요?!"', 'dialog', 1000],
      ['', 'blank', 1200],
      ['어떻게 반응하겠는가.', 'highlight', 1300],
    ]);

    choices([
      ['① 경기는 못 봤지만 같이 기뻐해준다', async () => {
        G.score += 2; G.missionCount++; updateStats();
        await seq([
          ['"못 봤는데, 이긴 거야? 대박이다!"', 'highlight', 200],
          ['아이의 눈이 반짝였다. 30분 내내 경기 얘기를 해줬다.', 'narrator', 500],
          ['덕분에 합정까지 심심하지 않았다.', 'result', 800],
          ['+2점 — 따뜻한 공감', 'life', 1000],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 이어폰을 꽂는다', async () => {
        G.score += 0; updateStats();
        await seq([
          ['이어폰을 귀에 꽂았다. 음악이 흘렀다.', 'result', 200],
          ['아이는 잠시 멈칫하다 다른 쪽을 바라봤다.', 'narrator', 500],
          ['각자의 세계.', 'narrator', 800],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
    ]);
  },

  /* ── 망원 (612) — 발 밟힘 시비 ── */
  async ev_mangwon(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('망원 — 발 밟힘 시비', 'warn');
    TrainPanel.showOverlay('⚠ 차내 시비 발생', 3000);
    sfx.alarm();

    await seq([
      ['망원역. 퇴근길 인파.', 'announce', 200],
      ['갑자기 뒤에서 언성이 높아졌다.', 'narrator', 450],
      ['"야! 발 밟았잖아! 미안하다고 해야지!"', 'death', 700],
      ['"일부러 그런 거 아니에요. 혼잡해서..."', 'dialog', 1000],
      ['시비가 붙었다. 주변 승객들이 불편하게 쳐다본다.', 'narrator', 1300],
      ['', 'blank', 1500],
      ['어떻게 할 것인가.', 'highlight', 1600],
    ]);

    choices([
      ['① 중재에 나선다 — "두 분 다 이해하지만..."', async () => {
        TrainPanel.setState('danger');
        G.score += 3; G.missionCount++; updateStats();
        TrainPanel.addLog('시비 중재 시도', 'event');
        await seq([
          ['"두 분 다 이해해요. 혼잡한 상황이었으니까요."', 'highlight', 200],
          ['"발 밟힌 분도 아프셨겠지만, 상대방도 일부러 그런 건 아닐 거예요."', 'highlight', 450],
          ['', 'blank', 650],
          ['잠시 침묵.', 'narrator', 750],
          ['화를 냈던 사람이 씩씩거리다 고개를 돌렸다.', 'narrator', 1000],
          ['간신히 가라앉았다.', 'result', 1300],
          ['+3점 — 용기 있는 중재', 'life', 1500],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 모른 척 다른 칸으로 이동한다', async () => {
        G.score += 0; updateStats();
        await seq([
          ['다음 칸으로 슬금슬금 이동했다.', 'result', 200],
          ['소란이 들리지 않는 곳에서야 숨을 쉬었다.', 'narrator', 500],
          ['현명한 건지, 비겁한 건지 모르겠다.', 'narrator', 800],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['③ 스마트폰을 꺼내 녹화한다', async () => {
        G.score += 1; updateStats();
        TrainPanel.addLog('상황 녹화 중', 'warn');
        await seq([
          ['스마트폰을 들어 녹화 버튼을 눌렀다.', 'narrator', 200],
          ['그 순간, 당사자들 모두 카메라를 의식했다.', 'narrator', 500],
          ['"뭐야, 왜 찍어?"', 'death', 700],
          ['... 난감한 상황이 됐다.', 'narrator', 1000],
          ['녹화를 중단하고 손을 내렸다.', 'result', 1300],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
    ]);
  },

  /* ── 합정 (613) — 2호선 환승 혼잡 ── */
  async ev_hapjeong(stIdx) {
    TrainPanel.setState('crowded');
    TrainPanel.addLog('합정 — 2호선 환승 폭주', 'warn');
    TrainPanel.showOverlay('★ 미아 어린이 발견', 3000);

    await seq([
      ['합정역. 2호선 환승.', 'announce', 200],
      ['홍대 나이트라이프 인파와 환승객이 뒤섞인다.', 'narrator', 450],
      ['', 'blank', 600],
      ['그때, 울음소리가 들린다.', 'narrator', 700],
      ['플랫폼 기둥 옆에 다섯 살쯤 된 아이가 혼자 울고 있다.', 'highlight', 1000],
      ['엄마를 잃어버린 것 같다.', 'narrator', 1300],
      ['', 'blank', 1500],
      ['당신은 이미 열차에 탑승 중이다. 문이 곧 닫힌다.', 'death', 1600],
    ]);

    choices([
      ['① 열차에서 내려 아이를 역무원에게 데려간다', async () => {
        G.score += 5; G.missionCount++; updateStats();
        sfx.door(true);
        TrainPanel.setState('boarding');
        TrainPanel.addLog('열차 하차 — 미아 도움', 'event');
        await seq([
          ['문이 닫히기 직전 몸을 밀어 빠져나왔다.', 'death', 200],
          ['아이에게 달려갔다.', 'narrator', 450],
          ['"얘야, 엄마 어디 있어? 역무원 아저씨한테 가자."', 'highlight', 700],
          ['아이가 울면서 손을 잡았다.', 'narrator', 1000],
          ['', 'blank', 1200],
          ['역무원실에 데려다주자 5분 만에 엄마가 달려왔다.', 'narrator', 1300],
          ['"감사합니다, 감사합니다!"', 'dialog', 1600],
          ['다음 열차가 3분 후. 충분하다.', 'result', 1900],
          ['+5점 — 오늘 가장 잘한 일', 'life', 2100],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 지나가는 역무원에게 손짓해서 알린다', async () => {
        G.score += 3; G.missionCount++; updateStats();
        TrainPanel.addLog('역무원에게 알림', 'event');
        await seq([
          ['플랫폼에 있는 역무원에게 손을 크게 흔들었다.', 'narrator', 200],
          ['"저기 아이가 혼자 있어요!"', 'highlight', 450],
          ['역무원이 달려갔다. 아이를 데려갔다.', 'narrator', 700],
          ['열차 문이 닫혔다.', 'narrator', 1000],
          ['작은 행동으로 충분했다.', 'result', 1300],
          ['+3점 — 빠른 판단', 'life', 1500],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 못 본 척 열차를 탄다', async () => {
        G.score -= 1; updateStats();
        TrainPanel.addLog('미아 목격 — 무시', 'warn');
        await seq([
          ['문이 닫혔다. 열차가 출발했다.', 'narrator', 200],
          ['창밖으로 아이가 점점 작아졌다.', 'death', 500],
          ['그 이미지가 한동안 지워지지 않는다.', 'narrator', 800],
          ['-1점', 'death', 1100],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
    ]);
  },

  /* ── 광흥창 (615) — 취객 ── */
  async ev_gwangheungchang(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('광흥창 — 취객 탑승', 'warn');
    TrainPanel.showOverlay('⚠ 취객 소란 주의', 3000);

    await seq([
      ['광흥창역. 심야.', 'announce', 200],
      ['술에 취한 중년 남성이 비틀거리며 탑승했다.', 'narrator', 450],
      ['주변 승객들이 멀찌감치 자리를 피한다.', 'narrator', 700],
      ['남성이 갑자기 큰 소리로 혼잣말을 시작했다.', 'narrator', 1000],
      ['"... 나쁜 놈들. 다 나쁜 놈들이야."', 'dialog', 1300],
      ['뭔가 상처받은 사람 같다.', 'narrator', 1600],
      ['', 'blank', 1800],
      ['어떻게 할 것인가.', 'highlight', 1900],
    ]);

    choices([
      ['① 조용히 옆에 앉아 말을 들어준다', async () => {
        G.score += 3; G.missionCount++; updateStats();
        TrainPanel.addLog('취객 경청 — 위로 시도', 'event');
        await seq([
          ['자리를 비운 사람들과 반대로 옆에 앉았다.', 'narrator', 200],
          ['남자가 잠시 멈추고 쳐다봤다.', 'narrator', 450],
          ['"회사에서 잘렸어. 20년 다녔는데."', 'dialog', 700],
          ['아무 말도 하지 않았다. 그냥 들었다.', 'narrator', 1000],
          ['대흥역에 이르자 남자가 조용해졌다.', 'narrator', 1300],
          ['"... 고마워요."', 'dialog', 1600],
          ['들어주는 것만으로 충분할 때가 있다.', 'result', 1900],
          ['+3점 — 경청의 힘', 'life', 2100],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 다른 칸으로 이동한다', async () => {
        G.score += 0; updateStats();
        await seq([
          ['조용히 다음 칸으로 이동했다.', 'result', 200],
          ['혼잣말 소리가 멀어졌다.', 'narrator', 500],
          ['때로는 거리 두기가 최선이다.', 'narrator', 800],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
    ]);
  },

  /* ── 공덕 (617) — 비상 방송 ── */
  async ev_gongdeok(stIdx) {
    TrainPanel.setState('danger');
    sfx.alarm();
    TrainPanel.addLog('공덕 — 비상 방송 발령!', 'warn');
    TrainPanel.showOverlay('⚠⚠ 비상 상황 — 즉각 대응 ⚠⚠', 0);

    await printAscii([
      [`  ╔══════════════════════════╗`, ''],
      [`  ║  ⚠  비상 방송  ⚠        ║`, 'hl'],
      [`  ║  "객차 내 연기 감지됨"   ║`, 'hl'],
      [`  ║  승객 여러분 침착하게    ║`, ''],
      [`  ║  안전문으로 대피하세요   ║`, ''],
      [`  ╚══════════════════════════╝`, ''],
    ], 'ascii-danger', { rowDelay: 50, pulse: true, sound: 'alarm' });

    await seq([
      ['공덕역 진입 직전.', 'narrator', 200],
      ['갑자기 차내 방송이 울렸다.', 'narrator', 400],
      ['"객차 내 연기가 감지되었습니다. 승객 여러분 침착하게 대피해주십시오."', 'death', 600],
      ['', 'blank', 900],
      ['객차 끝에서 연기가 피어오르는 것이 보인다.', 'death', 1000],
      ['승객들이 패닉 상태에 빠졌다.', 'narrator', 1300],
      ['', 'blank', 1500],
      ['당신은 어떻게 행동하겠는가.', 'highlight', 1600],
    ]);

    choices([
      ['① 침착하게 비상 인터폰을 누르고 주변 승객을 안정시킨다', async () => {
        G.score += 5; G.missionCount++; updateStats();
        TrainPanel.addLog('비상 인터폰 — 침착 대응', 'event');
        await seq([
          ['인터폰 버튼을 눌렀다.', 'highlight', 200],
          ['"연기 발생. 공덕역 진입 직전. 문 앞 안전 확보 중."', 'highlight', 450],
          ['', 'blank', 650],
          ['"모두 침착하게! 열차가 역에 멈추면 내립니다!"', 'highlight', 750],
          ['', 'blank', 950],
          ['30초 후 공덕역에 멈췄다. 역무원이 달려왔다.', 'narrator', 1050],
          ['연기는 전선 합선 — 큰 화재는 아니었다.', 'life', 1350],
          ['하지만 당신의 침착함이 패닉을 막았다.', 'result', 1650],
          ['+5점 — 위기의 리더십', 'life', 1900],
        ]);
        TrainPanel.setState('boarding');
        TrainPanel.hideOverlay();
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 비상구를 향해 달려간다', async () => {
        G.score += 1; updateStats();
        await seq([
          ['몸이 먼저 움직였다. 비상구 쪽으로 밀려갔다.', 'narrator', 200],
          ['공덕역에 멈추자마자 뛰어내렸다.', 'narrator', 500],
          ['다행히 큰 사고는 없었다.', 'result', 800],
          ['본능적인 행동. 틀렸다고 할 수는 없다.', 'narrator', 1100],
        ]);
        TrainPanel.setState('boarding');
        TrainPanel.hideOverlay();
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
    ]);
  },

  /* ── 삼각지 (619) — 수상한 가방 ── */
  async ev_samgakji(stIdx) {
    TrainPanel.setState('danger');
    TrainPanel.addLog('삼각지 — 주인 없는 가방 발견', 'warn');
    TrainPanel.showOverlay('★ 수상한 가방 — 어떻게 할 것인가?', 0);

    await seq([
      ['삼각지역. 4호선 환승.', 'announce', 200],
      ['한 승객이 내리며 가방을 좌석에 두고 내렸다.', 'narrator', 450],
      ['다들 보고도 모른다.', 'narrator', 700],
      ['', 'blank', 900],
      ['가방에서 뭔가 소리가 난다. 윙... 윙...', 'death', 1000],
      ['', 'blank', 1200],
      ['어떻게 할 것인가.', 'highlight', 1300],
    ]);

    choices([
      ['① 역무원 인터폰으로 신고한다', async () => {
        G.score += 4; G.missionCount++; updateStats();
        sfx.alarm();
        TrainPanel.addLog('유실물 신고 완료', 'event');
        await seq([
          ['인터폰을 들었다. "좌석에 주인 없는 가방이 있습니다."', 'highlight', 200],
          ['열차가 다음 역에서 멈췄고 역무원이 탑승했다.', 'narrator', 500],
          ['가방을 열었다. 노트북과 충전기, 서류들.', 'life', 800],
          ['분실물이었다. 다행히 위험물은 아니었다.', 'life', 1100],
          ['+4점 — 책임감 있는 신고', 'life', 1400],
        ]);
        TrainPanel.hideOverlay();
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 내릴 때 경비실에 갖다준다', async () => {
        G.score += 2; G.missionCount++; updateStats();
        await seq([
          ['가방을 집어 들었다. 묵직하다.', 'narrator', 200],
          ['다음 역에서 내려 경비실에 맡겼다.', 'narrator', 500],
          ['내 일정이 15분 늦어졌다.', 'result', 800],
          ['그래도 이게 맞는 일이다.', 'result', 1100],
          ['+2점 — 선한 시민', 'life', 1300],
        ]);
        TrainPanel.hideOverlay();
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['③ 모른 척한다', async () => {
        G.score += 0; updateStats();
        TrainPanel.addLog('유실물 무시', 'info');
        await seq([
          ['내 일이 아니다.', 'result', 200],
          ['하지만 저 가방의 주인은 나중에 얼마나 당황할까.', 'narrator', 500],
          ['', 'blank', 700],
          ['뭐가 됐든 내가 갖다주지 않아도 누군가 할 것이다.', 'narrator', 800],
        ]);
        TrainPanel.hideOverlay();
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
    ]);
  },

  /* ── 이태원 (621) — 외국인 ── */
  async ev_itaewon(stIdx) {
    TrainPanel.setState('crowded');
    TrainPanel.addLog('이태원 — 외국인 길 안내 요청', 'event');
    TrainPanel.showOverlay('★ 외국인 도움 요청', 2500);

    await seq([
      ['이태원역. 외국인 관광객들이 대거 탑승했다.', 'narrator', 200],
      ['한 외국인 커플이 노선도를 보며 당황한 표정이다.', 'narrator', 450],
      ['"Excuse me... Dongdaemun? Which line?"', 'dialog', 700],
      ['', 'blank', 900],
      ['어떻게 반응하겠는가.', 'highlight', 1000],
    ]);

    choices([
      ['① 직접 안내해준다 (영어로)', async () => {
        G.score += 3; G.missionCount++; updateStats();
        TrainPanel.addLog('외국인 안내 — 영어 소통', 'event');
        await seq([
          ['"Dongdaemun? Take Line 4 at Samgakji, just two stops ahead."', 'highlight', 200],
          ['커플의 얼굴이 환해졌다.', 'narrator', 500],
          ['"Oh thank you so much! You saved us!"', 'dialog', 800],
          ['세계 어디서나, 친절은 같은 언어다.', 'result', 1100],
          ['+3점 — 국제 친선', 'life', 1300],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 스마트폰으로 네이버 지도 보여준다', async () => {
        G.score += 2; G.missionCount++; updateStats();
        await seq([
          ['영어 설명이 어려우니 지도를 보여주기로 했다.', 'narrator', 200],
          ['"Here, look — this is your route."', 'highlight', 450],
          ['커플이 고개를 끄덕이며 사진을 찍었다.', 'narrator', 700],
          ['만국 공통언어 — 지도.', 'result', 1000],
          ['+2점 — 실용적 도움', 'life', 1200],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['③ 영어가 자신 없어 못 본 척한다', async () => {
        G.score += 0; updateStats();
        await seq([
          ['눈을 마주치려는데 반사적으로 고개를 돌렸다.', 'narrator', 200],
          ['커플은 결국 구글 번역기를 켰다.', 'narrator', 500],
          ['잠깐의 용기가 아쉬웠다.', 'result', 800],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
    ]);
  },

  /* ── 버티고개 (623) — 노인 실신 ── */
  async ev_berti(stIdx) {
    TrainPanel.setState('danger');
    sfx.alarm();
    TrainPanel.addLog('버티고개 — 노인 실신 신고!', 'warn');
    TrainPanel.showOverlay('⚠ 응급 상황 — 승객 실신', 0);

    await seq([
      ['버티고개역 진입 직전.', 'narrator', 200],
      ['맞은편 좌석의 노인이 갑자기 쓰러졌다.', 'death', 450],
      ['주변 승객들이 당황해 소리를 질렀다.', 'narrator', 700],
      ['"어떡해! 할아버지 숨이 없는 것 같아요!"', 'dialog', 1000],
      ['', 'blank', 1200],
      ['어떻게 행동할 것인가.', 'highlight', 1300],
    ]);

    choices([
      ['① 즉시 달려가 심폐소생술을 시도한다 (CPR)', async () => {
        G.score += 6; G.missionCount++; updateStats();
        TrainPanel.addLog('CPR 시행 — 응급 대응', 'event');
        await seq([
          ['달려갔다. 맥박을 확인했다. 약하지만 있다.', 'narrator', 200],
          ['인터폰: "버티고개 직전. 노인 실신. 구급대 요청!"', 'highlight', 500],
          ['흉부 압박을 시작했다. 30번 압박, 2번 호흡.', 'narrator', 800],
          ['버티고개역에 도착했고 구급대원이 탑승했다.', 'narrator', 1200],
          ['', 'blank', 1400],
          ['"계속하세요, 잘 하고 있어요!"', 'dialog', 1500],
          ['노인이 기침을 했다.', 'life', 1800],
          ['', 'blank', 2000],
          ['그 뒤 기억이 잘 나지 않는다. 손이 떨렸다.', 'narrator', 2100],
          ['+6점 — 생명을 살리다', 'life', 2400],
        ]);
        TrainPanel.hideOverlay();
        TrainPanel.setState('boarding');
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 인터폰으로 역무원에게 신고하고 공간을 확보한다', async () => {
        G.score += 4; G.missionCount++; updateStats();
        TrainPanel.addLog('역무원 신고 + 공간 확보', 'event');
        await seq([
          ['인터폰을 눌렀다. "노인 실신. 버티고개 직전."', 'highlight', 200],
          ['주변 승객들에게 공간을 비켜달라고 했다.', 'narrator', 500],
          ['노인 곁에 앉아 의식을 확인했다. 맥박이 있었다.', 'narrator', 800],
          ['역에 도착하자 구급대가 빠르게 조치했다.', 'life', 1100],
          ['침착한 대응 덕에 골든타임을 지켰다.', 'result', 1400],
          ['+4점 — 침착한 신고', 'life', 1600],
        ]);
        TrainPanel.hideOverlay();
        TrainPanel.setState('boarding');
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
    ]);
  },

  /* ── 신당 (626) — 중앙시장 ── */
  async ev_sindang(stIdx) {
    TrainPanel.setState('crowded');
    TrainPanel.addLog('신당 — 시장 상인들 탑승', 'info');
    TrainPanel.showOverlay('★ 신당 — 중앙시장 이야기', 2500);

    await seq([
      ['신당역. 2호선 환승.', 'announce', 200],
      ['커다란 보따리를 든 어르신들이 탑승했다.', 'narrator', 450],
      ['중앙시장 상인들이다.', 'narrator', 700],
      ['', 'blank', 900],
      ['한 할머니가 보따리를 선반에 올리려다 힘에 부치신다.', 'narrator', 1000],
    ]);

    choices([
      ['① 얼른 가서 선반에 올려드린다', async () => {
        G.score += 2; G.missionCount++; updateStats();
        await seq([
          ['보따리를 받아 선반에 올렸다.', 'narrator', 200],
          ['"아이고 고마워라. 명절 준비 나왔다가 무릎이 아파서."', 'dialog', 500],
          ['"무거운 걸 들고 다니지 마시고 배달 시키세요, 어머니."', 'highlight', 800],
          ['"그게 더 비싸잖아. 젊은 사람들은 몰라."', 'dialog', 1100],
          ['할말이 없었다.', 'result', 1400],
          ['+2점 — 일상의 친절', 'life', 1600],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 그냥 앉아서 지켜본다', async () => {
        G.score += 0; updateStats();
        await seq([
          ['할머니는 결국 혼자 올리셨다.', 'narrator', 200],
          ['힘들어 보이셨지만 말을 걸지 못했다.', 'narrator', 500],
          ['작은 친절 하나가 어려웠다.', 'narrator', 800],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
    ]);
  },

  /* ── 동묘앞 (627) — 벼룩시장 할아버지 ── */
  async ev_dongmyo(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('동묘앞 — 동묘벼룩시장 단골', 'event');
    TrainPanel.showOverlay('★ 동묘 고물상 할아버지', 2500);

    await printAscii([
      [`  ┌──────────────────────────┐`, ''],
      [`  │  동묘벼룩시장           │`, 'hl'],
      [`  │  1959年 개업 / 노점 약술 │`, ''],
      [`  │  "모든 것은 다 쓸모있다" │`, 'hl'],
      [`  └──────────────────────────┘`, ''],
    ], 'ascii-crowd', { rowDelay: 60 });

    await seq([
      ['동묘앞역. 1호선 환승.', 'announce', 200],
      ['낡은 군복 같은 옷을 입은 할아버지가 탑승했다.', 'narrator', 450],
      ['품 안에 라디오 하나, 손에 카세트테이프 꾸러미.', 'narrator', 700],
      ['', 'blank', 900],
      [`할아버지가 ${gn()}을(를) 유심히 보더니 말을 건넸다.`, 'narrator', 1000],
      ['"젊은이, 이거 갖겠소? 오늘 처음 보는 사람한테 주려 했는데."', 'dialog', 1300],
      ['카세트테이프에는 손으로 쓴 라벨: [인생은 아름다워]', 'highlight', 1600],
    ]);

    choices([
      ['① 감사히 받는다', async () => {
        addItem('카세트테이프');
        sfx.item();
        G.score += 2; G.missionCount++; updateStats();
        TrainPanel.addLog('카세트테이프 획득', 'event');
        await seq([
          ['테이프를 받았다.', 'narrator', 200],
          ['"고맙습니다, 할아버지."', 'highlight', 450],
          ['"나는 동묘에서 50년 장사했소. 다 거기서 배웠어."', 'dialog', 700],
          ['할아버지는 다음 역에서 내렸다.', 'narrator', 1000],
          ['테이프 안에 무슨 음악이 있을지 궁금하다.', 'result', 1300],
          ['+2점 — 인연', 'life', 1500],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 정중히 사양한다', async () => {
        G.score += 1; updateStats();
        await seq([
          ['"감사하지만, 괜찮습니다."', 'narrator', 200],
          ['할아버지가 고개를 끄덕였다.', 'narrator', 500],
          ['"그래. 받을 사람이 따로 있겠지."', 'dialog', 800],
          ['다음 역에서 내렸다. 테이프를 들고서.', 'narrator', 1100],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
    ]);
  },

  /* ── 안암 (630) — 고려대생 단체 ── */
  async ev_anam(stIdx) {
    TrainPanel.setState('crowded');
    TrainPanel.addLog('안암 — 고려대생 단체 MT 출발', 'warn');
    TrainPanel.showOverlay('★ 고려대 MT — 대합창 시작', 2500);

    await seq([
      ['안암역. 고려대 앞.', 'announce', 200],
      ['MT 가방을 진 학생들이 우르르 탑승했다.', 'narrator', 450],
      ['20명이 넘는다.', 'narrator', 700],
      ['', 'blank', 900],
      ['그들이 노래를 시작했다.', 'narrator', 1000],
      ['"♪ 청춘은 아름다워라~ ♪"', 'life', 1300],
      ['', 'blank', 1500],
      ['주변 승객들의 반응이 엇갈린다.', 'narrator', 1600],
    ]);

    choices([
      ['① 피식 웃으며 같이 흥얼거린다', async () => {
        G.score += 2; updateStats();
        await seq([
          ['저도 모르게 따라 흥얼거리고 있었다.', 'result', 200],
          ['학생 하나가 눈을 마주치며 엄지를 들었다.', 'narrator', 500],
          ['지하철 안의 짧은 축제.', 'life', 800],
          ['+2점 — 생기 있는 오늘', 'life', 1000],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 눈살을 찌푸린다 — 공공장소에서', async () => {
        G.score += 0; updateStats();
        await seq([
          ['이건 공공장소 아닌가.', 'narrator', 200],
          ['심기가 불편했지만 아무 말도 하지 않았다.', 'narrator', 500],
          ['학생들은 다음 역에서 한꺼번에 내렸다.', 'narrator', 800],
          ['갑자기 조용해진 객차.', 'narrator', 1100],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
    ]);
  },

  /* ── 돌곶이 (634) — 무임승차 단속 ── */
  async ev_dolgoji(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('돌곶이 — 무임승차 단속 현장', 'warn');
    TrainPanel.showOverlay('⚠ 무임승차 단속 중', 2500);

    await seq([
      ['돌곶이역.', 'announce', 200],
      ['단속요원이 탑승했다. 개찰구를 뛰어넘은 청소년을 쫓고 있다.', 'narrator', 450],
      ['', 'blank', 650],
      ['청소년은 겁에 질려 객차 구석으로 숨었다.', 'narrator', 750],
      ['단속요원이 주변 승객들에게 묻는다.', 'narrator', 1000],
      ['"혹시 빨간 점퍼 입은 청소년 보셨습니까?"', 'dialog', 1300],
      ['', 'blank', 1500],
      ['청소년이 눈을 마주치며 눈빛으로 애원한다.', 'highlight', 1600],
    ]);

    choices([
      ['① 청소년의 위치를 알려준다', async () => {
        G.score += 1; updateStats();
        TrainPanel.addLog('무임승차자 신고', 'info');
        await seq([
          ['규칙은 규칙이다.', 'narrator', 200],
          ['"저쪽 구석에 있어요."', 'highlight', 450],
          ['청소년이 고개를 떨어뜨렸다.', 'narrator', 700],
          ['단속요원이 데려가며 말했다.', 'narrator', 1000],
          ['"학생, 교통비 없으면 역무원한테 얘기해. 방법이 있어."', 'dialog', 1300],
          ['청소년의 뒷모습이 보였다.', 'result', 1600],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 못 봤다고 한다', async () => {
        G.score += 1; updateStats();
        await seq([
          ['"못 봤습니다."', 'highlight', 200],
          ['단속요원이 다른 칸으로 이동했다.', 'narrator', 500],
          ['청소년이 조용히 고개를 숙였다.', 'narrator', 800],
          ['...아마도 고마움.', 'result', 1100],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['③ 청소년에게 조용히 교통비를 건네준다', async () => {
        G.score += 3; G.missionCount++; updateStats();
        TrainPanel.addLog('교통비 도움', 'event');
        await seq([
          ['지갑을 열어 교통카드를 꺼냈다.', 'narrator', 200],
          ['단속요원에게 말했다.', 'narrator', 400],
          ['"제가 대신 낼게요. 얼마예요?"', 'highlight', 600],
          ['요원이 잠시 당황했다.', 'narrator', 900],
          ['"...1,400원입니다."', 'dialog', 1100],
          ['냈다.', 'narrator', 1300],
          ['청소년이 뭔가 말하려다 입을 다물었다.', 'narrator', 1600],
          ['눈빛으로 충분했다.', 'result', 1900],
          ['+3점 — 조건 없는 도움', 'life', 2100],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
    ]);
  },

  /* ── 태릉입구 (636) — 7호선 환승 ── */
  async ev_taereung(stIdx) {
    TrainPanel.setState('crowded');
    TrainPanel.addLog('태릉입구 — 7호선 환승 러시', 'warn');
    TrainPanel.showOverlay('⚠ 7호선 환승 — 극혼잡', 2500);

    await seq([
      ['태릉입구역. 7호선 환승.', 'announce', 200],
      ['육군사관학교 생도들이 단체로 탑승했다.', 'narrator', 450],
      ['빡빡 민 머리. 단정한 군복.', 'narrator', 700],
      ['그들 중 하나가 방향을 잃고 서 있다.', 'narrator', 1000],
      ['"저... 봉화산 방향이 이 열차 맞나요?"', 'dialog', 1300],
    ]);

    choices([
      ['① 맞다고 알려주고 대략적인 도착 시간도 알려준다', async () => {
        G.score += 2; G.missionCount++; updateStats();
        await seq([
          ['"맞아요. 두 정거장 더 가면 봉화산이에요."', 'highlight', 200],
          ['"약 4분 정도요."', 'highlight', 450],
          ['생도가 경례를 했다. "감사합니다!"', 'dialog', 700],
          ['뭔가 기분이 좋아졌다.', 'result', 1000],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 그냥 고개만 끄덕여준다', async () => {
        G.score += 1; updateStats();
        await seq([
          ['고개를 끄덕였다. 생도가 알아챘다.', 'result', 200],
          ['말 없는 도움도 도움이다.', 'narrator', 500],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
    ]);
  },

  /* ── 봉화산 (638) — 종착 ── */
  async ev_bonghwasan(stIdx) {
    TrainPanel.setState('arriving');
    sfx.chime();
    TrainPanel.addLog('봉화산 — 종착역 도착', 'new');
    TrainPanel.showOverlay('★ 종착역 봉화산 도착', 3000);

    await printAscii([
      [`  ╔══════════════════════════════╗`, ''],
      [`  ║  종착역  ·  FINAL STATION   ║`, 'hl'],
      [`  ║  봉화산  BONGHWASAN  638    ║`, 'hl'],
      [`  ║  중랑구 신내동               ║`, ''],
      [`  ║  "이 역에서 내리지 마세요" ← ║`, 'hl'],
      [`  ╚══════════════════════════════╝`, ''],
    ], 'ascii-station', { rowDelay: 70, sound: 'modem' });

    await seq([
      ['봉화산역. 종착역.', 'announce', 200],
      ['', 'blank', 400],
    ]);

    // 응암에서 메모지 받았는지 체크
    if (hasItem('수상한 메모지')) {
      await seq([
        ['...그 메모지가 떠올랐다.', 'highlight', 200],
        ['"봉화산에서 내리지 마세요."', 'death', 500],
        ['', 'blank', 700],
        ['열차 문이 열렸다. 승객들이 내리고 있다.', 'narrator', 800],
        ['', 'blank', 1000],
        ['어떻게 할 것인가.', 'highlight', 1100],
      ]);

      choices([
        ['① 메모를 무시하고 내린다', async () => {
          G.score += 1; updateStats();
          await seq([
            ['내렸다.', 'narrator', 200],
            ['아무 일도 일어나지 않았다.', 'narrator', 500],
            ['텅 빈 플랫폼. 시원한 바람.', 'life', 800],
            ['메모지는 역시 장난이었나.', 'result', 1100],
          ]);
          removeItem('수상한 메모지');
          await sceneEnding();
        }],
        ['② 잠시 기다리며 주변을 살핀다', async () => {
          G.score += 3; G.missionCount++; updateStats();
          TrainPanel.addLog('봉화산 — 잠복 관찰', 'event');
          await seq([
            ['문 앞에 섰지만 내리지 않았다.', 'narrator', 200],
            ['승객들이 다 내리고 텅 빈 객차.', 'narrator', 500],
            ['그때 — 응암에서 눈이 마주쳤던 그 여성이 플랫폼 끝에 서 있었다.', 'highlight', 800],
            ['', 'blank', 1100],
            ['그녀가 천천히 고개를 끄덕였다.', 'highlight', 1200],
            ['"내리지 않으셨군요. 잘 하셨어요."', 'dialog', 1500],
            ['', 'blank', 1800],
            ['그 이상의 설명은 없었다.', 'narrator', 1900],
            ['열차가 회차 준비를 한다.', 'announce', 2200],
            ['어떤 이야기는 답이 없다. 그래도 괜찮다.', 'result', 2500],
            ['+3점 — 미스터리의 결말', 'life', 2800],
          ]);
          removeItem('수상한 메모지');
          await sceneEnding();
        }],
      ]);
    } else {
      await seq([
        ['열차가 멈췄다. 이게 끝이다.', 'narrator', 200],
        [`${gn()}은(는) 봉화산에서 내렸다.`, 'narrator', 500],
        ['오늘 6호선에서의 여정이 끝났다.', 'result', 800],
        ['', 'blank', 1100],
      ]);
      await sceneEnding();
    }
  },

};
