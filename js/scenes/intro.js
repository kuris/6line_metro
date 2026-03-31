/* ═══════════════════════════════════════════════════
   scenes/intro.js — 인트로 + 이름 입력 + 출발역 선택 + 상행/하행 선택
   ═══════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────
   전역 게임 상태 (방향)
   G.direction: 'up' | 'down'
     up   = 상행: 선택역 → 봉화산(index 증가)
     down = 하행: 선택역 → 응암(index 감소)
   G.dirStep: +1 (상행) | -1 (하행)
   G.endStation: 종착역 index
   ────────────────────────────────────────── */

async function sceneIntro() {
  clearUI();
  updateProgress(STATIONS, -1);
  STAT_BAR.classList.remove('show');
  G.score        = 0;
  G.missionCount = 0;
  G.moveCount    = 0;
  G.health       = 100;
  G.sanity       = 100;
  G.infection    = 0;
  G.inventory    = [];
  G.flags        = {};
  G.currentStation = -1;
  G.startStation   = -1;
  G.direction      = 'up';
  G.dirStep        = 1;
  G.endStation     = STATIONS.length - 1; // 봉화산
  G.timeOfDay      = 'noon';
  G.playerJob      = '';
  G.playerItem     = '';
  G.currentCar     = 4;
  G.stationDanger  = {};
  G.hanjaQuizFreq  = 0.3;
  updateStats();

  TrainPanel.setState('idle');
  TrainPanel.addLog('시스템 부팅 중...', 'info');
  TrainPanel.addLog('서울 지하철 6호선 가상 운행 시작', 'new');

  await seq([
    ['══════════════════════════════════════', 'divider', 0],
    ['서울 지하철 6호선', 'title', 80],
    ['LINE 6 · SURVIVAL ADVENTURE', 'subtitle', 200],
    ['══════════════════════════════════════', 'divider', 320],
    ['', 'blank', 440],
  ]);

  await printAscii([
    ['  ╔══════════════════════════════╗', ''],
    ['  ║   ◀  SEOUL METRO LINE 6  ▶   ║', 'hl'],
    ['  ║  응암 ○────────────○ 봉화산  ║', ''],
    ['  ║     38개 역  / 35.1 km       ║', ''],
    ['  ║   [ 지금 승차하시겠습니까? ]  ║', 'hl'],
    ['  ╚══════════════════════════════╝', ''],
  ], 'ascii-station', { rowDelay: 70, label: '// SEOUL METRO LINE 6 SYSTEM', sound: 'modem' });

  await seq([
    ['', 'blank', 100],
    ['오늘도 어김없이 6호선은 달린다.', 'narrator', 200],
    ['응암에서 봉화산까지, 38개의 역을 지나는 이 노선에는', 'narrator', 450],
    ['오늘도 수많은 이야기가 스쳐간다.', 'narrator', 700],
    ['', 'blank', 900],
    ['차체가 덜컹이며 낮은 진동이 발바닥을 울린다.', 'narrator', 1100],
    ['희미한 형광등 아래, 마스크를 쓴 사람들의 눈동자가 당신을 스치듯 지나간다.', 'narrator', 1400],
    ['공기 중에선 희미한 철 냄새와… 뭔가 이상한, 단내가 섞여 있다.', 'highlight', 1700],
    ['', 'blank', 1900],
    ['이 노선의 승객은 누구입니까.', 'highlight', 2000],
  ]);

  // 이름 입력 (예시 3개 + 직접 입력)
  await new Promise(resolve => {
    const examples = ['김도현', '박지민', '이서윤'];
    const opts = examples.map(name => [
      `강력 추천: ${name}`,
      async () => {
        G.playerName = name;
        TrainPanel.addLog(`탑승객: ${G.playerName}`, 'new');
        resolve();
      }
    ]);

    opts.push(['⌨️ 직접 이름을 입력하겠습니다', async () => {
      await print('이름을 입력해주세요.', 'system');
      NAME_AREA.classList.add('active');
      NAME_IN.focus();
      const go = () => {
        const v = NAME_IN.value.trim();
        G.playerName = v || '김도현';
        NAME_AREA.classList.remove('active');
        TrainPanel.addLog(`탑승객: ${G.playerName}`, 'new');
        resolve();
      };
      NAME_CNF.onclick = go;
      NAME_IN.onkeydown = e => { if (e.key === 'Enter') go(); };
    }]);

    choices(opts);
  });

  await afterName();
}

/* ──────────────────────────────────────────
   이름 입력 후: 시간대 선택 → 출발역 선택
   ────────────────────────────────────────── */
async function afterName() {
  // 이름 입력 후: 한자 퀴즈 설정 → 나이 선택 → 성별 선택 → 시간대 선택
  await sceneSelectHanjaQuiz();
}

/* ──────────────────────────────────────────
   한자 퀴즈 빈도 설정
   ────────────────────────────────────────── */
async function sceneSelectHanjaQuiz() {
  await print('', 'blank');
  await print('한자 퀴즈 빈도를 설정해주세요.', 'narrator');
  await print('역 이름에 담긴 숨겨진 한자 의미를 맞히면 정신력이 회복됩니다.', 'system');
  await print('', 'blank');

  const opts = [
    ['없음 (0%)', async () => { G.hanjaQuizFreq = 0.0; TrainPanel.addLog('한자 퀴즈: 없음', 'new'); await sceneSelectAge(); }],
    ['● 가끔 (30% - 추천)', async () => { G.hanjaQuizFreq = 0.3; TrainPanel.addLog('한자 퀴즈: 가끔', 'new'); await sceneSelectAge(); }],
    ['자주 (60%)', async () => { G.hanjaQuizFreq = 0.6; TrainPanel.addLog('한자 퀴즈: 자주', 'new'); await sceneSelectAge(); }],
    ['항상 (100%)', async () => { G.hanjaQuizFreq = 1.0; TrainPanel.addLog('한자 퀴즈: 항상', 'new'); await sceneSelectAge(); }],
  ];

  choices(opts);
}

/* ──────────────────────────────────────────
   나이대 선택
   ────────────────────────────────────────── */
async function sceneSelectAge() {
  await print('', 'blank');
  await print('승객의 연령대는 어떻게 됩니까?', 'narrator');
  await print('', 'blank');

  const ages = ['10대', '20대', '30대', '40대', '50대 이상'];
  const opts = ages.map(age => [
    age,
    async () => {
      G.playerAge = age;
      TrainPanel.addLog(`연령대: ${age}`, 'new');
      await sceneSelectGender();
    }
  ]);

  choices(opts);
}

/* ──────────────────────────────────────────
   성별 선택
   ────────────────────────────────────────── */
async function sceneSelectGender() {
  await print('', 'blank');
  await print('승객의 성별은 어떻게 됩니까?', 'narrator');
  await print('', 'blank');

  const genders = ['남성', '여성'];
  const opts = genders.map(gender => [
    gender,
    async () => {
      G.playerGender = gender;
      TrainPanel.addLog(`성별: ${gender}`, 'new');
      await print('', 'blank');
      await sceneSelectJob();
    }
  ]);

  choices(opts);
}

/* ──────────────────────────────────────────
   직업 선택
   ────────────────────────────────────────── */
async function sceneSelectJob() {
  await print('오늘, 당신은 누구입니까?', 'narrator');
  await print('답하기 싫으면 답하지 않아도 됩니다.', 'system');
  await print('', 'blank');

  const JOBS = [
    // 일반 노동
    ['회사원',        '야근 후 귀가 중인 회사원'],
    ['청소 노동자',   '새벽 첫차를 타는 청소 노동자'],
    ['편의점 알바생', '야간 편의점 알바 끝내고 귀가 중'],
    ['의대생',        '당직 후 탈진 상태로 귀가 중인 의대생'],
    ['간호사',        '야간 근무를 마치고 돌아오는 간호사'],
    // 전문직
    ['형사',          '잠복 수사 중에 지하철을 탄 형사'],
    ['소방관',        '교대 근무를 마치고 돌아오는 소방관'],
    ['사진기자',      '현장 취재를 끝내고 귀사 중인 기자'],
    ['학원 강사',     '마지막 수업을 마치고 퇴근 중'],
    ['오컬트 연구자', '지하철 이상 현상을 추적하는 연구자'],
    // 사지/기타
    ['학생',          '새벽 시험을 앞두고 귀가 중인 입시생'],
    ['무직자',        '행선지 없이 막연히 탄 무직자'],
    ['배우 지망생',   '오디션을 마치고 돌아가는 배우 지망생'],
    ['가출 청소년',   '집에서 나와 갈 곳이 없는 청소년'],
    ['실직한 중년',   '직장을 잃고 방황 중인 중년 남성'],
    // 유니크
    ['퀵배달 기사',   '밤새 배달 삼십여 건을 소화한 배달기사'],
    ['노점상 상인',   '단속 피해 막차 탄 포장마차 상인'],
    ['식당 실장',     '늦은 회식 후 귀가 중인 식당 실장'],
    ['버스킹 뮤지션', '홍대 버스킹을 마치고 돌아오는 뮤지션'],
    ['...말하고 싶지 않다', null],
  ];

  const opts = JOBS.map(([shortLabel, desc]) => [
    desc || shortLabel,
    async () => {
      G.playerJob = shortLabel;
      TrainPanel.addLog(`직업: ${shortLabel}`, 'new');
      updateAvatar();
      await print('', 'blank');
      await sceneSelectItem();
    }
  ]);

  choices(opts);
}

/* ──────────────────────────────────────────
   소지품 선택
   ────────────────────────────────────────── */
async function sceneSelectItem() {
  await print('가방 안에 있는 것 하나를 고르십시오.', 'narrator');
  await print('선택한 소지품이 차내 상황에 영향을 줄 수 있습니다.', 'system');
  await print('', 'blank');

  // 직업별 자동 제안 품목 (맞춤형 확장)
  const byJob = {
    '회사원':        ['사원증', '서류 가방'],
    '청소 노동자':   ['먼지떨이', '고무장갑'],
    '편의점 알바생': ['폐기 도시락', '바코드 스캐너'],
    '의대생':        ['전공 서적', '진통제 샘플'],
    '간호사':        ['소독용 알코올', '처방전'],
    '형사':          ['수사 수첩', '수갑'],
    '소방관':        ['방연 마스크', '소형 손전등'],
    '사진기자':      ['망원 카메라', '프레스 완장'],
    '학원 강사':     ['분필통', '출석부'],
    '오컬트 연구자': ['낡은 노트', '자외선 랜턴'],
    '학생':          ['교과서', '학생증'],
    '무직자':        ['빈 지갑', '구인 광고지'],
    '배우 지망생':   ['오디션 대본', '손거울'],
    '가출 청소년':   ['컵라면', '동전 지갑'],
    '실직한 중년':   ['소주병', '남은 퇴직금'],
    '퀵배달 기사':   ['오토바이 헬멧', '운송장'],
    '노점상 상인':   ['잔돈 봉투', '업소용 라이터'],
    '식당 실장':     ['주문서', '영수증 뭉치'],
    '버스킹 뮤지션': ['하모니카', '기타 피크'],
  };

  const BASE_ITEMS = ['우산', '이어폰'];
  const suggested = byJob[G.playerJob] || ['빈 지갑', '싸구려 손전등'];
  const itemList = [...new Set([...suggested, ...BASE_ITEMS])];

  const opts = itemList.map(item => [
    item + (suggested.includes(item) ? ' <span style="color:#c8a840;font-size:10px">▶ 직업 관련</span>' : ''),
    async () => {
      G.playerItem = item;
      addItem(item);
      TrainPanel.addLog(`소지품: ${item}`, 'new');
      await print('', 'blank');
      await print('지금 몇 시입니까.', 'narrator');
      await print('시간대에 따라 6호선 내부의 상황과 승객들이 달라집니다.', 'system');
      await print('', 'blank');
      await sceneSelectTOD();
    }
  ]);

  choices(opts);
}


/* ──────────────────────────────────────────
   시간대 선택
   ────────────────────────────────────────── */
async function sceneSelectTOD() {
  const opts = TOD_ORDER.map(todId => {
    const t = TIME_OF_DAY[todId];
    return [
      `${t.emoji} ${t.label}  ${t.time}  — ${t.crowd} · ${t.bgNote}`,
      async () => {
        G.timeOfDay = todId;
        updateTODStat();
        TrainPanel.addLog(`탑승 시간: ${t.label} ${t.time}`, 'new');

        // 시간대 분위기 연출
        await printAscii(todAsciiLines(), 'ascii-station', { rowDelay: 50, sound: 'modem' });
        await seq([
          ['', 'blank', 100],
          [t.ambience, 'narrator', 200],
          [t.trainNote, 'system', 500],
          ['', 'blank', 700],
        ]);

        STAT_BAR.classList.add('show');
        updateStats();
        updateTODStat();

        await print('어느 역에서 여정을 시작하시겠습니까.', 'narrator');
        await print('', 'blank');
        await sceneSelectStart();
      }
    ];
  });

  choices(opts);
}

/* ──────────────────────────────────────────
   출발역 선택 — 노선도 UI
   ────────────────────────────────────────── */
async function sceneSelectStart() {
  await print('▸ 노선도에서 출발역을 선택하세요', 'system');
  await print('', 'blank');

  // 노선도 UI 삽입
  const mapEl = buildLineMap((stIdx) => {
    const st = STATIONS[stIdx];
    TrainPanel.addLog(`출발역 선택: ${st.name}`, 'event');
    // 노선도 제거 후 방향 선택으로
    if (mapEl && mapEl.parentNode) mapEl.parentNode.removeChild(mapEl);
    // choices 영역도 비움
    CHOICES.innerHTML = '';
    sceneSelectDirection(stIdx);
  });

  OUT.appendChild(mapEl);
  scrollBottom();

  // 전통적인 선택지는 표시하지 않음 (노선도 클릭으로 대체)
  // 모바일 폴백: 텍스트 선택지 토글 버튼 추가
  const fallbackBtn = document.createElement('button');
  fallbackBtn.className = 'choice-btn';
  fallbackBtn.style.cssText = 'margin-top:8px; font-size:11px; color:#2a5060; border-color:#0e2030; background:#040a10;';
  fallbackBtn.textContent = '▾ 텍스트 목록으로 선택';
  let fallbackShown = false;

  fallbackBtn.onclick = async () => {
    if (fallbackShown) return;
    fallbackShown = true;
    fallbackBtn.style.display = 'none';
    await print('', 'blank');

    const opts = [];
    START_STATION_GROUPS.forEach(group => {
      group.stations.forEach(stIdxF => {
        const st = STATIONS[stIdxF];
        const badge     = st.transfer ? ` 〔환승〕` : '';
        const eventMark = st.hasEvent ? ' ★' : '';
        const hanja     = st.hanja    ? ` · ${st.hanja}` : '';
        opts.push([
          `${st.code} ${st.name}${hanja}${badge}${eventMark}`,
          () => {
            if (mapEl && mapEl.parentNode) mapEl.parentNode.removeChild(mapEl);
            TrainPanel.addLog(`출발역 선택: ${st.name}`, 'event');
            sceneSelectDirection(stIdxF);
          }
        ]);
      });
    });
    choices(opts);
  };

  CHOICES.appendChild(fallbackBtn);
}

/* ──────────────────────────────────────────
   방향 선택 화면 (상행 / 하행)
   선택역이 응암(0)이면 상행만, 봉화산(37)이면 하행만 가능
   ────────────────────────────────────────── */
async function sceneSelectDirection(stIdx) {
  clearUI();
  const st = STATIONS[stIdx];

  // 한자 유래 박스
  const hanjaLine = st.hanja
    ? `${st.name} (${st.hanja})`
    : st.name;

  await printAscii([
    [`  ┌──────────────────────────────────┐`, ''],
    [`  │  출발역 : ${padRight(hanjaLine, 24)}│`, 'hl'],
    [`  │  ${padRight(st.hanjaDesc, 34)}│`, ''],
    [`  │  ${padRight(st.desc, 34)}│`, ''],
    [`  └──────────────────────────────────┘`, ''],
  ], 'ascii-station', { rowDelay: 50, label: `// ${st.code} ${st.name}`, sound: 'modem' });

  await print('', 'blank');
  await print(`출발역: ${st.name} (${st.nameEn})`, 'highlight');
  if (st.transfer) {
    await print(`환승 노선: ${st.transfer}`, 'system');
  }
  await print('', 'blank');
  await print('안내: "단내 바이러스"라 불리는 인지 재해가 확산 중입니다.', 'death');
  await print('무사히 종착역에 도달하십시오. 감염도 100% 도달 시 탈출 실패.', 'system');
  await print('', 'blank');
  await print('어느 방향으로 피난하시겠습니까?', 'narrator');
  await print('', 'blank');

  const dirOpts = [];

  // 상행: 봉화산 방향 (index 증가) — 현재 역이 종점(37)이 아닐 때만
  if (stIdx < STATIONS.length - 1) {
    const endSt = STATIONS[STATIONS.length - 1];
    dirOpts.push([
      `▲ 상행 — ${st.name} → ${endSt.name} 방향 (${STATIONS.length - 1 - stIdx}개 역)`,
      () => {
        G.direction  = 'up';
        G.dirStep    = 1;
        G.endStation = STATIONS.length - 1;
        TrainPanel.addLog(`상행 선택: ${st.name} → ${endSt.name}`, 'event');
        sceneBeginJourney(stIdx);
      }
    ]);
  }

  // 하행: 응암 방향 (index 감소) — 현재 역이 시점(0)이 아닐 때만
  if (stIdx > 0) {
    const startSt = STATIONS[0];
    dirOpts.push([
      `▼ 하행 — ${st.name} → ${startSt.name} 방향 (${stIdx}개 역)`,
      () => {
        G.direction  = 'down';
        G.dirStep    = -1;
        G.endStation = 0;
        TrainPanel.addLog(`하행 선택: ${st.name} → ${startSt.name}`, 'event');
        sceneBeginJourney(stIdx);
      }
    ]);
  }

  // 역 선택으로 돌아가기
  dirOpts.push([
    '← 다른 역을 선택한다',
    () => {
      clearUI();
      afterName();
    }
  ]);

  choices(dirOpts);
}

/* ──────────────────────────────────────────
   여정 시작 연출
   ────────────────────────────────────────── */
async function sceneBeginJourney(startIdx) {
  clearUI();
  const st     = STATIONS[startIdx];
  const endSt  = STATIONS[G.endStation];
  const isUp   = G.direction === 'up';
  const dirLabel = isUp ? '상행 ▲' : '하행 ▼';
  const arrow    = isUp ? '→' : '←';

  updateProgress(STATIONS, startIdx);

  await printAscii([
    [`  ┌────────────────────────────────────┐`, ''],
    [`  │  6호선  ${dirLabel}                        │`, 'hl'],
    [`  │  출발: ${padRight(st.name + ' (' + st.code + ')', 28)}│`, ''],
    [`  │  종점: ${padRight(endSt.name + ' (' + endSt.code + ')', 28)}│`, ''],
    [`  │  방향: ${st.name} ${arrow} ${endSt.name}`.padEnd(36) + '  │', ''],
    [`  └────────────────────────────────────┘`, ''],
  ], 'ascii-station', { rowDelay: 60, label: `// 탑승 완료 — ${st.name}`, sound: 'modem' });

  sfx.chime();
  TrainPanel.setState('boarding');
  TrainPanel.updateStationInfo(st, STATIONS, startIdx);
  TrainPanel.showOverlay(`⊡ ${st.name} 승차 완료 [${dirLabel}]`, 2500);
  TrainPanel.updateCarStrip();   // 호차 UI 활성화

  await seq([
    ['', 'blank', 300],
    [`${gn()}은(는) ${st.name}에서 6호선에 탑승했다.`, 'narrator', 500],
    [`방향: ${dirLabel} (${endSt.name} 종점)`, 'system', 700],
    ['', 'blank', 900],
    [st.desc, 'narrator', 1000],
    ['', 'blank', 1200],
  ]);

  // 한자 유래 표시
  if (st.hanja || st.hanjaDesc) {
    await printHanjaCard(st);
  }

  await seq([
    ['', 'blank', 0],
    ['문이 닫힌다. 열차가 출발한다.', 'announce', 200],
    ['', 'blank', 400],
  ]);

  sfx.door(false);
  TrainPanel.setState(st.trainState);

  await new Promise(r => setTimeout(r, 600));

  // 이벤트 역이면 이벤트 먼저, 아니면 바로 다음 역으로
  if (st.hasEvent && STATION_EVENTS[st.eventId]) {
    await STATION_EVENTS[st.eventId](startIdx);
  } else {
    await sceneNextStation(startIdx + G.dirStep);
  }
}

/* ──────────────────────────────────────────
   한자 유래 카드 출력 헬퍼
   ────────────────────────────────────────── */
async function printHanjaCard(st) {
  if (!st.hanja && !st.hanjaDesc) return;

  const hanjaTitle = st.hanja
    ? `  ║  ${st.name} · ${st.hanja}  `
    : `  ║  ${st.name}  `;

  await printAscii([
    [`  ╔══════════════════════════════════╗`, ''],
    [`  ║  📖 역명 유래                    ║`, 'hl'],
    [`  ╠══════════════════════════════════╣`, ''],
    [`  ║  ${padRight((st.hanja ? st.name + ' · ' + st.hanja : st.name), 32)}  ║`, 'hl'],
    [`  ╟──────────────────────────────────╢`, ''],
    ...wrapText(st.hanjaDesc, 32).map(line => [`  ║  ${line.padEnd(32)}  ║`, '']),
    [`  ╚══════════════════════════════════╝`, ''],
  ], 'ascii-hanja', { rowDelay: 45, label: '// 역명 유래', sound: null });
}

/* ──────────────────────────────────────────
   텍스트 줄 분할 헬퍼 (ASCII 박스용)
   ────────────────────────────────────────── */
function wrapText(text, maxLen) {
  if (!text) return [''];
  const words  = text.split(' ');
  const lines  = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    // 한글은 2바이트 폭으로 계산 (근사치)
    const dispLen = [...test].reduce((sum, c) => sum + (c.charCodeAt(0) > 127 ? 2 : 1), 0);
    if (dispLen > maxLen && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [''];
}

/* ──────────────────────────────────────────
   문자열 패딩 헬퍼 (한글 2바이트 고려)
   ────────────────────────────────────────── */
function padRight(str, targetDispLen) {
  str = String(str || '');
  const dispLen = [...str].reduce((sum, c) => sum + (c.charCodeAt(0) > 127 ? 2 : 1), 0);
  const pad = Math.max(0, targetDispLen - dispLen);
  return str + ' '.repeat(pad);
}
