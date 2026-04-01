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
let _isNavigating = false;

async function sceneNextStation(nextIdx) {
  if (_isNavigating) {
    console.warn('Navigation already in progress for index:', nextIdx);
    return;
  }
  _isNavigating = true;

  try {
    // 1. 종착 조건 (STATIONS 범위를 벗어남)
    const isUp = (G.dirStep || 1) >= 0;
    const isEnd = isUp ? (nextIdx >= STATIONS.length) : (nextIdx < 0);
    if (isEnd) {
      await sceneEnding();
      return;
    }

    // 2. 현재 역 데이터 초기화
    const st = STATIONS[nextIdx];
    G.currentStation = nextIdx;
    G.moveCount++;
    updateStats();

    // 3. 종착역 도달 체크 (G.endStation 기준)
    if (typeof G.endStation === 'number' && nextIdx === G.endStation) {
      TrainPanel.setState('running');
      if (window.HorrorFX) {
        window.HorrorFX.flashBlood(1200);
        if (Math.random() < 0.3) window.HorrorFX.glitch(500);
      }

      await new Promise(r => setTimeout(r, 600));
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

    // 4. 일반 역 주행 연출
    const prevIdx = nextIdx - (G.dirStep || 1);
    const prevSt = (prevIdx >= 0 && prevIdx < STATIONS.length) ? STATIONS[prevIdx] : null;
    TrainPanel.setState(prevSt ? prevSt.trainState : 'running');
    
    // 이동 중 랜덤 소사건
    if (Math.random() < 0.45) await maybeRandomEvent();
    
    await new Promise(r => setTimeout(r, 500));

    // 5. 역 도착 연출 (시각/청각)
    if (typeof sfx !== 'undefined' && sfx.chime) sfx.chime(0.5);

    const imgFname = (typeof STATION_IMAGES !== 'undefined') ? STATION_IMAGES[st.name] : null;
    const flagKey = 'img_' + st.id;
    const hasSeen = G.flags[flagKey];
    const isAnchor = ['보문', '합정', '삼각지', '동묘앞', '연신내'].includes(st.name);
    
    let shouldShow = false;
    if (imgFname) {
      if (!hasSeen) {
        if (isAnchor || Math.random() < 0.6) shouldShow = true;
      } else {
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
    }

    if (window.HorrorFX) {
      window.HorrorFX.flashBlood(1000);
      if (Math.random() < 0.2) window.HorrorFX.glitch(300);
    }

    await TrainPanel.playArrival(st.name, null);
    TrainPanel.updateStationInfo(st, STATIONS, nextIdx);
    updateProgress(STATIONS, nextIdx);
    clearUI();

    const dirLabel = isUp ? '상행 ▲' : '하행 ▼';
    const remaining = Math.abs(G.endStation - nextIdx);

    const epDiv = document.createElement('div');
    epDiv.className = 'line ep-header show';
    epDiv.innerHTML = `
      <div class="ep-num">STATION ${st.code} [${dirLabel}] · 종점까지 ${remaining}역</div>
      <div class="ep-title">${st.name} <span style="font-size:11px;color:#4a6070;font-weight:400">${st.nameEn}</span>${st.hanja ? `<span style="font-size:10px;color:#2a5060;margin-left:6px">${st.hanja}</span>` : ''}</div>
      <div class="ep-sub">${st.desc}${st.transfer ? ` · 환승: ${st.transfer}` : ''}</div>`;
    OUT.appendChild(epDiv);

    TrainPanel.setState(st.trainState || 'running');

    // 한자 퀴즈
    if (typeof maybeRunHanjaQuiz === 'function') {
      const quizRan = await maybeRunHanjaQuiz(st);
      if (quizRan) {
        await print('', 'blank');
        await print('역사 안으로 발을 내딛는다...', 'narrator', 300);
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    // 도착 후 연출 표시 후 허브(Station Hub) 진입
    if (typeof getTrivia === 'function') {
      const trivia = getTrivia(st.id);
      if (trivia && trivia.cards && trivia.cards.length > 0) {
        TrainPanel.addLog(`${st.name}: ${trivia.tip}`, 'info');
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
      } else {
        await seq([
          ['', 'blank', 0],
          [st.desc, 'narrator', 200],
          ['', 'blank', 400],
        ]);
      }
    }

    // 허브로 이동하기 전에 내비게이션 플래그 해제
    _isNavigating = false;
    await sceneStationHub(nextIdx);

  } catch (e) {
    console.error('Navigation Error:', e);
    _isNavigating = false;
  }
}

/**
 * 역(Station) 허브 화면 - 탐험, 휴식, 이동 선택
 */
// [NEW] 역 분위기(Atmosphere) 정의
const ATMOSPHERES = {
  normal: { name: '평온함', desc: '특이사항 없는 고요한 승강장입니다.', color: 'var(--green)', chance: 0.4 },
  blackout: { name: '정전', desc: '비상등조차 꺼진 암흑 속입니다. 정신적 압박이 심합니다.', color: '#8040ff', chance: 0.15, sanityMod: -5 },
  panic: { name: '공황', desc: '정체불명의 소음과 비명이 들려옵니다. 누군가 당신을 쫓는듯 합니다.', color: 'var(--red)', chance: 0.12, healthMod: -5 },
  toxic: { name: '오염', desc: '코를 찌르는 악취와 함께 붉은 포자가 공기 중에 떠다닙니다.', color: '#c0ff40', chance: 0.12, infectionMod: 5 },
  silence: { name: '기묘한 침묵', desc: '소리가 모두 사라진 듯한 정적. 비밀이 숨겨져 있을 것 같습니다.', color: 'var(--gold)', chance: 0.1, mysteryMod: 0.3 },
  sanctuary: { name: '안식처', desc: '보기 드물게 따뜻하고 안전한 기운이 감도는 구역입니다.', color: 'var(--blue)', chance: 0.05, healMod: 10 }
};

window.sceneStationHub = async function(stIdx) {
  clearUI();
  
  const st = STATIONS[stIdx];
  const dirLabel = (G.dirStep || 1) >= 0 ? '상행 ▲' : '하행 ▼';
  
  // 1. 역 상태(Atmosphere) 결정 및 추적
  if (!G.flags.atmospheres) G.flags.atmospheres = {};
  if (!G.flags.atmospheres[stIdx]) {
    const roll = Math.random();
    let cum = 0;
    let selected = 'normal';
    for (const [key, atm] of Object.entries(ATMOSPHERES)) {
      cum += atm.chance;
      if (roll < cum) {
        selected = key;
        break;
      }
    }
    G.flags.atmospheres[stIdx] = selected;
  }
  const currentAtm = ATMOSPHERES[G.flags.atmospheres[stIdx]];

  // 2. 탐색 횟수 추적
  if (!G.flags.searchedData || typeof G.flags.searchedData !== 'object') {
    G.flags.searchedData = {};
  }
  const searches = G.flags.searchedData[stIdx] || 0;

  // 3. UI 출력
  const epDiv = document.createElement('div');
  epDiv.className = `line ep-header show atm-${G.flags.atmospheres[stIdx]}`;
  epDiv.innerHTML = `
    <div class="ep-num">STATION ${st.code} [역 상태: <span style="color:${currentAtm.color}">${currentAtm.name}</span>]</div>
    <div class="ep-title">${st.name} <span style="font-size:11px;color:#4a6070;font-weight:400">${st.nameEn}</span></div>
    <div class="ep-sub">${currentAtm.desc}</div>`;
  OUT.appendChild(epDiv);

  await print(`[${st.name}역에 머무는 중...]`, 'narrator', 300);
  
  // 4. 동적 선택지 구성
  const opts = [];
  const exploreRiskText = searches > 0 ? ` (탐색 ${searches}회 - 위험 증가)` : '';
  
  // 기본: 탐색
  opts.push([`🕵️ 역 내부 탐색${exploreRiskText}`, async () => {
    G.flags.searchedData[stIdx] = searches + 1;
    await exploreStation(st, stIdx, searches, currentAtm);
  }]);

  // 분위기별 특수 행동 (New!)
  if (G.flags.atmospheres[stIdx] === 'blackout') {
    opts.push([`🔦 비상 발전기 가동 시도`, async () => {
      clearUI();
      if (Math.random() < 0.4) {
        await print('발전기가 가랑거리는 소리를 내며 돌아갑니다. 빛이 돌아왔습니다!', 'life');
        G.sanity += 15;
        G.flags.atmospheres[stIdx] = 'normal';
      } else {
        await print('발전기가 불꽃을 튀기며 멈춰버렸습니다. 정전이 심화됩니다.', 'death');
        G.sanity -= 10;
      }
      updateStats();
      choices([['[ 돌아가기 ]', () => sceneStationHub(stIdx)]]);
    }]);
  } else if (G.flags.atmospheres[stIdx] === 'toxic') {
    opts.push([`😷 환강 정화 장치 가동`, async () => {
      clearUI();
      await print('뿌연 연기 사이로 공기 정화기가 돌아갑니다. 독소가 조금 옅어집니다.', 'info');
      G.infection = Math.max(0, G.infection - 8);
      updateStats();
      choices([['[ 돌아가기 ]', () => sceneStationHub(stIdx)]]);
    }]);
  } else if (G.flags.atmospheres[stIdx] === 'silence') {
    opts.push([`👂 벽 너머의 소리에 귀 기울이기`, async () => {
      clearUI();
      await print('숨을 죽이고 차가운 타일 벽에 귀를 댑니다...', 'whisper', 800);
      if (Math.random() < 0.5) {
        await print('누군가 쓴 것 같은 낙서의 의미를 깨우칩니다. 단서를 발견했습니다!', 'life');
        G.mysteries.push(`extra_${st.id}`);
        addItem(`📜 기묘한 전언`);
      } else {
        await print('그저 메마른 바람 소리만 들려올 뿐입니다.', 'narrator');
      }
      choices([['[ 돌아가기 ]', () => sceneStationHub(stIdx)]]);
    }]);
  } else if (G.flags.atmospheres[stIdx] === 'sanctuary') {
    opts.push([`🕯️ 평온한 촛불 켜기 (대량 회복)`, async () => {
      clearUI();
      await print('작은 촛불 하나가 어두운 승강장을 밝힙니다. 영혼이 치유됩니다.', 'life');
      G.health = Math.min(100, G.health + 20);
      G.sanity = Math.min(100, G.sanity + 20);
      updateStats();
      choices([['[ 돌아가기 ]', () => sceneStationHub(stIdx)]]);
    }]);
  }

  // 기본: 휴식
  opts.push([`💊 승강장 벤치에서 휴식`, async () => {
    await restAtStation(stIdx, currentAtm);
  }]);

  // 기본: 출발
  opts.push([`🚇 열차 탑승 (다음 역으로 ${dirLabel})`, async () => {
    TrainPanel.playDepart();
    sceneNextStation(stIdx + (G.dirStep || 1));
  }]);

  choices(opts);
};

/**
 * 역 내부 탐색 로직 - 리스크 앤 리턴 & 미스터리 수집
 */
async function exploreStation(st, stIdx, searches, currentAtm) {
  clearUI();
  
  if (currentAtm && currentAtm.sanityMod) {
    G.sanity += currentAtm.sanityMod;
    TrainPanel.addLog(`[${currentAtm.name}] 정신적 압박`, 'warn');
  }
  
  await print(`${st.name}역 구석구석을 살펴보기 시작한다...`, 'narrator', 500);

  // 1. 역 고유 이벤트 최우선 실행 (단, 탐색 횟수가 적을 때만 안전하게)
  if (searches === 0 && st.hasEvent && st.eventId && STATION_EVENTS[st.eventId] && !G.seenEvents.includes(`main_${st.id}`)) {
    G.seenEvents.push(`main_${st.id}`);
    await STATION_EVENTS[st.eventId](stIdx);
    return;
  }

  // 2. 리스크 계산 (탐색 횟수에 따라 기하급수적 리스크)
  let riskLevel = searches;
  
  if (riskLevel >= 2) {
    TrainPanel.addLog('위험한 탐색 - 둥지 접근', 'danger');
    const infDmg = 5 * (riskLevel - 1);
    const sanDmg = 3 * (riskLevel - 1);
    G.infection += infDmg;
    G.sanity -= sanDmg;
    updateStats();
    
    await seq([
      ['...', 'blank', 300],
      [`너무 오래 머물렀다. 어둠 속에서 수많은 시선이 당신을 꿰뚫어본다. (탐색 ${searches}회 누적)`, 'death', 800],
      [`蝕(식) +${infDmg}% / 魂(혼) -${sanDmg} — 심연에 노출됨.`, 'warn', 1200]
    ]);
  }

  // 3. 힌트 아이템 보유 여부 확인 (한자 퀴즈 보상)
  const hintItemName = `💡 힌트: ${st.name}`;
  const hasHint = hasItem(hintItemName);
  const alreadyFoundHere = G.seenEvents && G.seenEvents.includes(`mystery_${st.id}`);

  if (hasHint && !alreadyFoundHere) {
    choices([
      [`✨ [힌트 사용] '${st.name}'의 비밀을 즉시 간파한다`, async () => {
        removeItem(hintItemName);
        G.seenEvents.push(`mystery_${st.id}`);
        if (!G.mysteries) G.mysteries = [];
        G.mysteries.push(`clue_${st.id}`);
        G.sanity = Math.min(100, G.sanity + 20); // 힌트 사용 시 추가 보너스
        updateStats();

        TrainPanel.addLog(`[힌트 사용] ${st.name}의 미스터리 해독 완료`, 'life');
        await seq([
          ['', 'blank', 500],
          [`미리 확보해둔 '${st.name}'의 지명 유래를 떠올린다.`, 'highlight', 1200],
          ['혼란스러운 어둠 사이로 보이지 않던 진실의 실타래가 선명하게 보이기 시작한다.', 'life', 1800],
          ['[🔍 미스터리 단서를 안전하게 확보했습니다!]', 'life', 3000],
          ['魂(혼) +20 — 지식이 공포를 완전히 압도했습니다.', 'new', 3800],
          ['', 'blank', 4500],
        ]);
        choices([['[ 안전한 곳(승강장)으로 돌아가기 ]', () => sceneStationHub(stIdx)]]);
      }],
      [`🔎 그냥 직접 탐색한다 (아이템 아끼기)`, async () => {
        await _continueExploration(st, stIdx, searches);
      }]
    ]);
    return;
  }

  // 힌트가 없거나 이미 찾은 경우 일반 탐색 진행
  await _continueExploration(st, stIdx, searches);
}

/**
 * 실제 탐색 진행 서브 함수
 */
async function _continueExploration(st, stIdx, searches) {
  // 4. 미스터리 조각 획득 판정 (탐색을 깊이 할수록 발견 확률 증가)
  const mysteryFoundChance = 0.3 + (searches * 0.15); // 기본 30%, 탐색할수록 오름
  const alreadyFoundHere = G.seenEvents && G.seenEvents.includes(`mystery_${st.id}`);
  
  if (!alreadyFoundHere && Math.random() < mysteryFoundChance) {
    G.seenEvents.push(`mystery_${st.id}`);
    if (!G.mysteries) G.mysteries = [];
    G.mysteries.push(`clue_${st.id}`);
    G.sanity = Math.min(100, G.sanity + 15); // 단서를 찾으면 이성 보너스 (진실에 다가감)
    updateStats();
    
    TrainPanel.addLog('미스터리 단서 획득', 'new');
    await seq([
      ['', 'blank', 500],
      ['구석진 캐비닛 안쪽에서 피 묻은 생존자의 일지를 발견했다.', 'highlight', 1200],
      ['"이 궤도는... 살아있어. 역들 자체가 거대한 생물처럼 숨을 쉬고 있다고!"', 'whisper', 2000],
      ['[🔍 미스터리 단서를 획득했습니다!]', 'life', 3000],
      ['魂(혼) +15 — 진실에 다가가며 막연한 공포가 이성으로 대체되었다.', 'new', 3800],
      ['', 'blank', 4500],
    ]);
    
    choices([
        ['[ 안전한 곳(승강장)으로 돌아가기 ]', () => sceneStationHub(stIdx)]
    ]);
    return;
  }

  // 4. 고유 이벤트나 미스터리가 없으면, 돌발 조우 풀에서 추첨
  const poolType = (Math.random() < 0.2 + (searches * 0.25) + (G.infection / 200)) ? 'battle' : 'generic';
  const pool = EVENT_POOL[poolType] || [];
  const available = pool.filter(ev => !G.seenEvents.includes(ev.id));
  
  if (available.length > 0) {
    const selected = available[Math.floor(Math.random() * available.length)];
    G.seenEvents.push(selected.id);
    TrainPanel.addLog(`돌발 조우: ${selected.title}`, 'warn');
    await selected.run(stIdx);
  } else {
    // 풀이 떨어졌을 경우
    await seq([
      ['더 이상 특별한 것은 보이지 않는다.', 'narrator', 1000]
    ]);
    await print('', 'blank');
    choices([
      ['[ 돌아가기 ]', () => sceneStationHub(stIdx)]
    ]);
  }
}

/**
 * 벤치 휴식 로직
 */
async function restAtStation(stIdx, currentAtm) {
  clearUI();
  
  const st = STATIONS[stIdx];
  TrainPanel.addLog('짧은 휴식', 'info');
  
  let healAmt = 10;
  if (currentAtm && currentAtm.healMod) healAmt += currentAtm.healMod;

  G.sanity += healAmt;
  if(G.sanity > 100) G.sanity = 100;
  
  // 휴식 부작용 
  let infectionChance = 0.3;
  if (currentAtm && currentAtm.infectionMod) infectionChance += 0.2; // 오염된 곳에선 감염 확률 상승

  const infectedHeal = Math.random() < infectionChance;
  if(infectedHeal) {
    G.infection += 5;
  }
  updateStats();

  await seq([
    ['차가운 스테인리스 벤치에 몸을 뉘었다.', 'narrator', 500],
    ['눈을 붙이자 얕은 잠이 쏟아진다...', 'narrator', 1500],
    ['', 'blank', 2000],
    [`魂(혼) +${healAmt} — 긴장이 풀려 이성을 약간 회복했다.`, 'life', 3000],
  ]);

  if(infectedHeal) {
    await seq([
      ['하지만 자는 동안 호흡기를 통해 포자가 스며들었다.', 'danger', 1000],
      ['蝕(식) +5% — 감염 증가.', 'warn', 1500]
    ]);
  }

  await print('', 'blank');
  choices([
    ['[ 일어선다 ]', () => sceneStationHub(stIdx)]
  ]);
}

// (showTriviaPass 삭제 - 허브 엔진으로 통합됨)
