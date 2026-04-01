/* ═══════════════════════════════════════════════════
   scenes/intro.js
   6호선 잔혹사: 저주받은 궤도 — 도입부 (V4)
   — 캐릭터 프리셋(Quick Start) 및 극적인 페이싱 최적화
   ═══════════════════════════════════════════════════ */

'use strict';

async function sceneIntro() {
  clearUI();
  updateProgress(STATIONS, -1);
  
  // 1. 초기화
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

  if (window.HorrorFX) window.HorrorFX.scareMassive();

  // 2. 오프닝 연출 (페이싱 상향)
  await seq([
    ['══════════════════════════════════════', 'divider', 0],
    ['공포의 6호선: 저주받은 궤도', 'title', 0],
    ['THE CURSED LOOP · SURVIVAL ORDEAL', 'subtitle', 0],
    ['══════════════════════════════════════', 'divider', 100],
    ['', 'blank', 200],
  ]);

  await printAscii([
    ['  ╔══════════════════════════════╗', ''],
    ['  ║   ◀  THE CURSED LINE 6  ▶    ║', 'hl'],
    ['  ║  응암 ☠────────────☠ 신내    ║', ''],
    ['  ║     39개의 무덤  / 36.4 km     ║', ''],
    ['  ║   [ 당신의 영혼을 맡기겠습니까? ]  ║', 'hl'],
    ['  ╚══════════════════════════════╝', ''],
  ], 'ascii-station', { rowDelay: 50, label: '// CURSED LOOP SYSTEM', sound: 'modem' });

  await seq([
    ['', 'blank', 200],
    ['어둠을 뚫고, 오늘도 6호선은 당신의 비명을 싣고 달린다.', 'narrator', 0],
    ['응암에서 신내까지, 39개의 무덤을 지나는 이 노선에는', 'narrator', 0],
    ['오늘도 길을 잃은 영혼들이 떠돈다.', 'narrator', 0],
    ['', 'blank', 0],
    ['차체가 울부짖으며 낮은 비명이 발바닥을 타고 올라온다.', 'narrator', 0],
    ['공기 중에선 비릿한 철 냄새와… 썩어가는 내장의 단내가 섞여 있다.', 'highlight', 0],
    ['', 'blank', 0],
    ['이 지옥의 순례자는 누구입니까.', 'highlight', 0],
  ]);

  // 3. 캐릭터 생성 (프리셋 vs 수동)
  let isQuickStart = false;
  await new Promise(resolve => {
    const presets = [
      { name: '김도현', age: '20대', gender: '여성', job: '작곡가' },
      { name: '박지민', age: '30대', gender: '남성', job: '보안 요원' },
      { name: '이서윤', age: '40대', gender: '여성', job: '의료진' }
    ];

    const opts = presets.map(p => [
      `👤 ${p.name} (${p.age} ${p.gender}, ${p.job})`,
      async () => {
        G.playerName = p.name;
        G.playerAge  = p.age;
        G.playerGender = p.gender;
        G.playerJob  = p.job;
        isQuickStart = true;
        TrainPanel.addLog(`탑승객: ${G.playerName} / ${G.playerJob}`, 'new');
        resolve();
      }
    ]);

    opts.push(['⌨️ 직접 이름을 입력하겠습니다 (Custom)', async () => {
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

  if (!isQuickStart) {
    // 수동 입력 프로세스
    await print(`${G.playerName}님의 성별은?`, 'system');
    await new Promise(r => choices([
      ['남성', () => { G.playerGender='남성'; r(); }],
      ['여성', () => { G.playerGender='여성'; r(); }]
    ]));

    await print(`${G.playerName}님의 나이대는?`, 'system');
    await new Promise(r => {
      const ages = ['10대', '20대', '30대', '40대', '50대 이상'];
      choices(ages.map(a => [a, () => { G.playerAge=a; r(); }]));
    });

    await print('당신의 신분은 무엇입니까?', 'system');
    await new Promise(r => {
      const jobs = ['학생', '직장인', '작곡가', '보안 요원', '의료진', '노숙자'];
      choices(jobs.map(j => [j, () => { G.playerJob=j; r(); }]));
    });
  }

  // 4. 시작 연출
  await seq([
    ['', 'blank', 200],
    [`${gn()} (${G.playerGender}, ${G.playerAge} - ${G.playerJob})`, 'highlight', 0],
    ['정해진 수명도 없이, 당신은 6호선의 궤도 위에 올랐다.', 'narrator', 0],
    ['', 'blank', 300],
    ['어디서부터 이 비극을 시작하시겠습니까?', 'system', 0],
  ]);

  // 5. 출발역 선택 (지도)
  await new Promise(resolve => {
    const showMapSelection = () => {
      clearUI();
      print('...여정의 시작점을 선택하십시오.', 'highlight');
      const mapWrap = buildLineMap((stId) => confirmSelection(stId));
      OUT.appendChild(mapWrap);
      choices([['📋 목록에서 상세 지역 선택하기', () => showListSelection()]]);
    };

    const showListSelection = () => {
      const regionOpts = START_STATION_GROUPS.map(group => [
        group.label, async () => {
          const stationOpts = group.stations.map(stId => {
            const st = STATIONS[stId];
            return [`${st.name} (${st.nameEn})`, () => confirmSelection(stId)];
          });
          stationOpts.push(['◀ 뒤로 가기', () => showListSelection()]);
          choices(stationOpts);
        }
      ]);
      regionOpts.push(['🗺 지도로 선택하기', () => showMapSelection()]);
      choices(regionOpts);
    };

    const confirmSelection = (stId) => {
      const isUp = stId < 30;
      G.startStation = stId; 
      G.currentStation = stId; 
      G.direction = isUp ? 'up' : 'down'; 
      G.dirStep = isUp ? 1 : -1; 
      G.endStation = isUp ? 38 : 0;
      TrainPanel.addLog(`출발: ${STATIONS[stId].name}`, 'info');
      resolve();
    };

    showMapSelection();
  });

  // 6. 탑승 완료 및 출발
  await seq([
    ['', 'blank', 400],
    ['문이 닫히며 열차가 울부짖기 시작한다.', 'narrator', 0],
    ['당신은 되돌릴 수 없는 여정에 올랐다.', 'death', 0],
    ['[†] 순례를 시작합니다.', 'highlight', 400],
  ]);

  sceneNextStation(G.startStation);
}
