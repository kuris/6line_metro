/* ═══════════════════════════════════════════════════
   scenes/intro.js
   6호선 잔혹사: 저주받은 궤도 — 도입부
   — 지연 시간(Pacing)을 대폭 늘려 지옥의 입구에 선 긴장감을 선사합니다.
   ═══════════════════════════════════════════════════ */

'use strict';

async function sceneIntro() {
  clearUI();
  updateProgress(STATIONS, -1);
  G.score        = 0;
  G.missionCount = 0;
  G.moveCount    = 0;
  G.health       = 100;
  G.sanity       = 100;
  G.infection    = 0;
  G.inventory    = [];
  G.currentStation = -1;
  G.direction      = 'up';
  G.dirStep        = 1;
  G.endStation     = STATIONS.length - 1;
  updateStats();

  TrainPanel.setState('idle');
  TrainPanel.addLog('저주받은 시스템 부팅 중...', 'warn');
  TrainPanel.addLog('[†] 6호선: 죽음의 궤도 가동 시작', 'death');

  // 대규모 공포 연출 트리거 (모니터 혈성 연출 포함)
  if (window.HorrorFX) {
    window.HorrorFX.scareMassive();
  }

  await seq([
    ['══════════════════════════════════════', 'divider', 0],
    ['공포의 6호선: 저주받은 궤도', 'title', 1200],
    ['THE CURSED LOOP · SURVIVAL ORDEAL', 'subtitle', 2500],
    ['══════════════════════════════════════', 'divider', 4000],
    ['', 'blank', 4500],
  ]);

  await printAscii([
    ['  ╔══════════════════════════════╗', ''],
    ['  ║   ◀  THE CURSED LINE 6  ▶    ║', 'hl'],
    ['  ║  응암 ☠────────────☠ 신내    ║', ''],
    ['  ║     39개의 무덤  / 36.4 km     ║', ''],
    ['  ║   [ 당신의 영혼을 맡기겠습니까? ]  ║', 'hl'],
    ['  ╚══════════════════════════════╝', ''],
  ], 'ascii-station', { rowDelay: 120, label: '// CURSED LOOP SYSTEM', sound: 'modem' });

  await seq([
    ['', 'blank', 500],
    ['어둠을 뚫고, 오늘도 6호선은 당신의 비명을 싣고 달린다.', 'narrator', 2000],
    ['응암에서 신내까지, 39개의 무덤을 지나는 이 노선에는', 'narrator', 3500],
    ['오늘도 길을 잃은 영혼들이 떠돈다.', 'narrator', 5000],
    ['', 'blank', 5500],
    ['차체가 울부짖으며 낮은 비명이 발바닥을 타고 올라온다.', 'narrator', 6500],
    ['공기 중에선 비릿한 철 냄새와… 썩어가는 내장의 단내가 섞여 있다.', 'highlight', 8000],
    ['', 'blank', 9000],
    ['이 지옥의 순례자는 누구입니까.', 'highlight', 10000],
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

  // 성별 선택
  await print(`${G.playerName}님의 성별을 선택하세요.`, 'system');
  await new Promise(resolve => {
    choices([
      ['남성', async () => { G.playerGender = '남성'; resolve(); }],
      ['여성', async () => { G.playerGender = '여성'; resolve(); }]
    ]);
  });

  // 연령대 선택
  await print(`${G.playerName}님의 연령대를 선택하세요.`, 'system');
  await new Promise(resolve => {
    choices([
      ['10대', async () => { G.playerAge = '10대'; resolve(); }],
      ['20대', async () => { G.playerAge = '20대'; resolve(); }],
      ['30대', async () => { G.playerAge = '30대'; resolve(); }],
      ['40대', async () => { G.playerAge = '40대'; resolve(); }],
      ['50대 이상', async () => { G.playerAge = '50대 이상'; resolve(); }]
    ]);
  });

  // 직업 선택
  await print('이 지옥 같은 루프에서 당신의 신분은 무엇입니까?', 'system');
  await new Promise(resolve => {
    const jobs = [
      ['취준생', '특별한 기술은 없지만 간절한 마음으로 버팁니다.'],
      ['직장인', '피곤에 찌든 몸이지만 생존 본능만은 날카롭습니다.'],
      ['영매', '보이지 않는 원혼들의 기척을 민감하게 느낍니다.'],
      ['노숙자', '지하철의 생리를 누구보다 잘 알며 본능적으로 숨습니다.'],
      ['가출 청소년', '어떤 환경에서도 살아남는 질긴 생명력을 가졌습니다.']
    ];
    choices(jobs.map(j => [j[0], async () => { 
      G.playerJob = j[0]; 
      TrainPanel.addLog(`신분: ${G.playerJob}`, 'info');
      resolve(); 
    }]));
  });

  // 한자 퀴즈 빈도 선택 (게임 난이도 성격)
  await print('이 길을 지나는 동안 죽은 자들의 하소연을 얼마나 들으시겠습니까?', 'system');
  await new Promise(resolve => {
    choices([
      ['가끔만 듣겠다 (낮음)', async () => { G.hanjaQuizFreq = 0.2; resolve(); }],
      ['적당히 듣겠다 (보통)', async () => { G.hanjaQuizFreq = 0.4; resolve(); }],
      ['매번 듣겠다 (높음)', async () => { G.hanjaQuizFreq = 0.7; resolve(); }]
    ]);
  });

  // 인트로 나레이션 속도 최적화
  await seq([
    ['', 'blank', 300],
    ['당신은 서울 지하철 6호선의 깊은 지하에 서 있습니다.', 'narrator', 1500],
    ['이곳은 단순한 노선이 아닙니다. 망자들의 비명과 생존자들의 흐느낌이 섞인 궤도.', 'death', 2800],
    ['...여정의 시작점을 선택하십시오.', 'highlight', 1500],
  ]);

  // 출발역 선택 시스템 (전 구간 거점역 지원)
  await new Promise(resolve => {
    const regionOpts = START_STATION_GROUPS.map(group => [
      group.label, async () => {
        // 지역 내 세부 역 선택
        const stationOpts = group.stations.map(stId => {
          const st = STATIONS[stId];
          return [`${st.name} (${st.nameEn})`, async () => {
            const isUp = stId < 30; // 대략적인 방향 설정
            G.startStation = stId; 
            G.currentStation = stId; 
            G.direction = isUp ? 'up' : 'down'; 
            G.dirStep = isUp ? 1 : -1; 
            G.endStation = isUp ? 38 : 0;
            resolve();
          }];
        });
        stationOpts.push(['뒤로 가기', () => choices(regionOpts)]);
        choices(stationOpts);
      }
    ]);
    choices(regionOpts);
  });

  // 첫 이동 시작 (속도 상향)
  await seq([
    ['', 'blank', 400],
    ['문이 닫히며 열차가 울부짖기 시작한다.', 'narrator', 1500],
    ['당신은 되돌릴 수 없는 여정에 올랐다.', 'death', 2800],
    ['[†] 순례를 시작합니다.', 'highlight', 1500],
  ]);

  sceneNextStation(G.startStation);
}
