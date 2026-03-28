/* ═══════════════════════════════════════════════════
   saveload.js — QR코드 세이브/로드
   저장: 게임상태 → Base64 → URL → QR코드
   불러오기: URL ?save= 파라미터 → 게임상태 복원
   ═══════════════════════════════════════════════════ */

'use strict';

const GAME_URL    = 'https://bbkjhdeq.gensparkspace.com/';
const SAVE_VER    = '2';   // 포맷 버전 (timeOfDay 필드 추가)

/* ──────────────────────────────────────────
   인코딩 / 디코딩
   ────────────────────────────────────────── */

function saveEncode() {
  // 아이템 이름 → 인덱스 매핑
  const ITEM_MAP  = { '수상한 메모지': 0, '카세트테이프': 1 };
  const invIdx    = G.inventory.map(i => ITEM_MAP[i] ?? i).filter(i => i !== undefined);

  // 플래그 압축 (key:value → 'k1=v1,k2=v2')
  const flagStr   = Object.entries(G.flags || {})
    .map(([k, v]) => `${k}=${v}`).join(',');

  const payload = {
    v:   SAVE_VER,
    n:   G.playerName,
    s:   G.startStation,
    c:   G.currentStation,
    d:   G.dirStep,
    e:   G.endStation,
    sc:  G.score,
    m:   G.missionCount,
    mv:  G.moveCount,
    inv: invIdx,
    f:   flagStr,
    tod: G.timeOfDay || 'noon',
  };

  // 체크섬 (간단한 위변조 감지)
  payload.cs = (G.score + G.moveCount + G.startStation + G.currentStation) % 97;

  try {
    const json = JSON.stringify(payload);
    const b64  = btoa(encodeURIComponent(json));
    return b64;
  } catch(e) {
    console.error('saveEncode error', e);
    return null;
  }
}

function saveDecode(b64) {
  try {
    const json    = decodeURIComponent(atob(b64));
    const payload = JSON.parse(json);

    // 버전 체크
    if (payload.v !== SAVE_VER) {
      return { error: '버전이 다른 세이브 코드입니다.' };
    }

    // 체크섬 검증
    const cs = (payload.sc + payload.mv + payload.s + payload.c) % 97;
    if (cs !== payload.cs) {
      return { error: '세이브 코드가 손상되었습니다.' };
    }

    // 아이템 인덱스 → 이름
    const ITEM_NAMES = ['수상한 메모지', '카세트테이프'];
    const inventory  = (payload.inv || []).map(i =>
      typeof i === 'number' ? ITEM_NAMES[i] : i
    ).filter(Boolean);

    // 플래그 복원
    const flags = {};
    if (payload.f) {
      payload.f.split(',').forEach(pair => {
        const [k, v] = pair.split('=');
        if (k) flags[k] = isNaN(v) ? v : Number(v);
      });
    }

    return {
      playerName:      payload.n   || '김도현',
      startStation:    payload.s   ?? 0,
      currentStation:  payload.c   ?? 0,
      dirStep:         payload.d   ?? 1,
      direction:       (payload.d ?? 1) >= 0 ? 'up' : 'down',
      endStation:      payload.e   ?? STATIONS.length - 1,
      score:           payload.sc  ?? 0,
      missionCount:    payload.m   ?? 0,
      moveCount:       payload.mv  ?? 0,
      timeOfDay:       payload.tod || 'noon',
      inventory,
      flags,
    };
  } catch(e) {
    console.error('saveDecode error', e);
    return { error: '세이브 코드를 읽을 수 없습니다.' };
  }
}

/* ──────────────────────────────────────────
   세이브 URL 생성
   ────────────────────────────────────────── */
function buildSaveURL() {
  const code = saveEncode();
  if (!code) return null;
  // ?save= 파라미터만 붙임 (버전 파라미터 제외)
  const base = GAME_URL.split('?')[0];
  return `${base}?save=${code}`;
}

/* ──────────────────────────────────────────
   QR 모달 표시
   ────────────────────────────────────────── */
function showSaveModal() {
  sfx.ui();

  // QRCode 라이브러리 로드 여부 확인
  if (typeof QRCode === 'undefined') {
    console.error('QRCode 라이브러리가 로드되지 않았습니다.');
    alert('구성요소 로드 실패. 페이지를 새로고침 후 다시 시도해주세요.');
    return;
  }

  const url = buildSaveURL();
  if (!url) {
    alert('세이브 데이터 생성 실패');
    return;
  }

  // 현재 역 정보 (게임 시작 전이면 startStation 기준)
  const st       = STATIONS[G.currentStation] || STATIONS[G.startStation] || null;
  const dirLabel = G.direction === 'up' ? '상행 ▲' : '하행 ▼';
  const stName   = st ? st.name : '게임 시작 전';
  const todLabel = (typeof TIME_OF_DAY !== 'undefined' && TIME_OF_DAY[G.timeOfDay])
    ? TIME_OF_DAY[G.timeOfDay].label : '';

  // 모달 생성
  const overlay = document.createElement('div');
  overlay.id = 'save-modal-overlay';
  overlay.innerHTML = `
    <div id="save-modal">
      <div id="save-modal-header">
        <span>💾 세이브 QR</span>
        <button id="save-modal-close">✕</button>
      </div>

      <div id="save-modal-info">
        <span>👤 ${G.playerName}</span>
        <span>🚇 ${stName}</span>
        <span>${dirLabel}</span>
        ${todLabel ? `<span>🕐 ${todLabel}</span>` : ''}
        <span>⭐ ${G.score}점</span>
        <span>🎯 미션 ${G.missionCount}</span>
      </div>

      <div id="save-qr-wrap"></div>

      <div id="save-modal-desc">
        📱 모바일: QR 스캔 → 바로 게임 재개<br>
        💻 PC: 아래 주소를 복사해서 주소창에 붙여넣기
      </div>

      <div id="save-url-row">
        <input id="save-url-input" type="text" readonly value="${url}">
        <button id="save-url-copy">📋 복사</button>
      </div>

      <div id="save-copy-msg"></div>

      <div style="border-top:1px solid #0e2030;margin-top:12px;padding-top:12px;display:flex;gap:8px;justify-content:center;">
        <button class="save-load-btn" id="save-resume-btn" style="background:linear-gradient(135deg,#0a2010,#143020);border-color:#2a5a30;color:#70c080;">
          ▶ 지금 여기서 이어하기
        </button>
        <button class="save-load-btn" id="save-modal-close2" style="opacity:0.5;">
          ✕ 닫기
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // QR 생성 — DOM 삽입 후 다음 프레임에서 실행 (canvas 렌더 보장)
  requestAnimationFrame(() => {
    const qrWrap = document.getElementById('save-qr-wrap');
    if (!qrWrap) { console.error('QR wrap 없음'); return; }
    try {
      // qrcodejs: new QRCode(element, options) 방식
      qrWrap.innerHTML = '';  // canvas 초기화
      new QRCode(qrWrap, {
        text:           url,
        width:          220,
        height:         220,
        colorDark:      '#c8e8f8',
        colorLight:     '#070b0e',
        correctLevel:   QRCode.CorrectLevel.M,
      });
    } catch(e) {
      console.error('QR 생성 예외:', e);
      qrWrap.innerHTML =
        '<div style="color:#5a8090;font-size:11px;padding:20px;text-align:center">QR 생성 실패<br>아래 URL을 복사해 사용하세요</div>';
    }
  });

  // 복사 버튼
  document.getElementById('save-url-copy').onclick = () => {
    navigator.clipboard.writeText(url).then(() => {
      const msg = document.getElementById('save-copy-msg');
      msg.textContent = '✅ 복사되었습니다!';
      setTimeout(() => { msg.textContent = ''; }, 2000);
    }).catch(() => {
      // 클립보드 API 실패 시 수동 선택
      const inp = document.getElementById('save-url-input');
      inp.select();
      document.execCommand('copy');
      const msg = document.getElementById('save-copy-msg');
      msg.textContent = '✅ 복사되었습니다!';
      setTimeout(() => { msg.textContent = ''; }, 2000);
    });
    sfx.ui();
  };

  // 지금 여기서 이어하기 버튼
  document.getElementById('save-resume-btn').onclick = () => {
    overlay.remove();
    sfx.chime();
    // 현재 G 상태 그대로 재개 (이미 저장 시점 상태)
    if (G.currentStation >= 0) {
      _resumeAtStation(G.currentStation);
    } else {
      sceneIntro();
    }
  };

  // 닫기
  const closeModal = () => {
    overlay.remove();
    sfx.ui();
  };
  document.getElementById('save-modal-close').onclick = closeModal;
  const close2 = document.getElementById('save-modal-close2');
  if (close2) close2.onclick = closeModal;
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
  });
}

/* ──────────────────────────────────────────
   URL ?save= 파라미터 감지 → 자동 로드
   DOMContentLoaded 이전에 호출 가능
   ────────────────────────────────────────── */
function checkSaveParam() {
  console.log('[save] URL search:', window.location.search);
  const params = new URLSearchParams(window.location.search);
  const code   = params.get('save');
  console.log('[save] code found:', !!code, code ? code.substring(0,20)+'...' : 'none');
  if (!code) return false;

  const data = saveDecode(code);
  console.log('[save] decoded:', data);
  if (data.error) {
    console.warn('세이브 로드 실패:', data.error);
    return false;
  }

  // 로드 확인 모달
  const stName   = STATIONS[data.currentStation]?.name || '알 수 없음';
  const dirLabel = data.direction === 'up' ? '상행 ▲' : '하행 ▼';

  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.id = 'save-modal-overlay';
    overlay.innerHTML = `
      <div id="save-modal">
        <div id="save-modal-header">
          <span>📂 저장된 게임 발견</span>
        </div>
        <div id="save-modal-info" style="flex-direction:column;gap:6px;text-align:center">
          <div style="font-size:15px;color:#80e0a8;margin-bottom:4px">
            👤 ${data.playerName}
          </div>
          <div>🚇 ${stName} · ${dirLabel}</div>
          <div>🕐 ${(typeof TIME_OF_DAY !== 'undefined' && TIME_OF_DAY[data.timeOfDay])
            ? TIME_OF_DAY[data.timeOfDay].label : data.timeOfDay}</div>
          <div>⭐ ${data.score}점 · 🎯 미션 ${data.missionCount} · 이동 ${data.moveCount}역</div>
          ${data.inventory.length ? `<div>🎒 ${data.inventory.join(', ')}</div>` : ''}
        </div>
        <div id="save-modal-desc" style="text-align:center">
          이 게임을 이어서 하시겠습니까?
        </div>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:12px">
          <button class="save-load-btn" id="save-load-yes">▶ 이어하기</button>
          <button class="save-load-btn" id="save-load-no" style="opacity:0.6">✕ 새로 시작</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('save-load-yes').onclick = () => {
      overlay.remove();
      // URL에서 save 파라미터 제거 (뒤로가기 방지)
      const clean = window.location.pathname;
      window.history.replaceState({}, '', clean);
      resolve(data);
    };
    document.getElementById('save-load-no').onclick = () => {
      overlay.remove();
      const clean = window.location.pathname;
      window.history.replaceState({}, '', clean);
      resolve(null);
    };
  });
}

/* ──────────────────────────────────────────
   세이브 데이터로 게임 상태 복원 후 재개
   ────────────────────────────────────────── */
async function loadSaveData(data) {
  // G 상태 복원
  G.playerName     = data.playerName;
  G.startStation   = data.startStation;
  G.currentStation = data.currentStation;
  G.direction      = data.direction;
  G.dirStep        = data.dirStep;
  G.endStation     = data.endStation;
  G.score          = data.score;
  G.missionCount   = data.missionCount;
  G.moveCount      = data.moveCount;
  G.timeOfDay      = data.timeOfDay || 'noon';
  G.inventory      = data.inventory;
  G.flags          = data.flags;

  // currentStation이 -1이면 (게임 시작 전 저장) → 인트로부터
  if (G.currentStation < 0) {
    await sceneIntro();
    return;
  }

  clearUI();
  updateProgress(STATIONS, G.currentStation);
  STAT_BAR.classList.add('show');
  updateStats();

  const st       = STATIONS[G.currentStation];
  if (!st) { await sceneIntro(); return; }  // 혹시 모를 방어 처리

  const dirLabel = G.direction === 'up' ? '상행 ▲' : '하행 ▼';
  const endSt    = STATIONS[G.endStation];

  TrainPanel.init();
  TrainPanel.setState(st.trainState);
  TrainPanel.updateStationInfo(st, STATIONS, G.currentStation);
  TrainPanel.addLog(`세이브 로드: ${G.playerName}`, 'new');
  TrainPanel.addLog(`${st.name} · ${dirLabel}`, 'event');
  TrainPanel.showOverlay(`▶ 게임 재개 — ${st.name}`, 2500);

  await printAscii([
    [`  ╔══════════════════════════════════╗`, ''],
    [`  ║  ▶  게임 재개                    ║`, 'hl'],
    [`  ╠══════════════════════════════════╣`, ''],
    [`  ║  승객  : ${padRight(G.playerName, 26)}║`, ''],
    [`  ║  현재역: ${padRight(st.name + ' (' + st.code + ')', 26)}║`, 'hl'],
    [`  ║  방향  : ${padRight(dirLabel + ' → ' + endSt.name, 26)}║`, ''],
    [`  ║  점수  : ${padRight(String(G.score) + '점', 26)}║`, ''],
    [`  ╚══════════════════════════════════╝`, ''],
  ], 'ascii-station', { rowDelay: 50, label: '// SAVE DATA LOADED', sound: 'modem' });

  await seq([
    ['', 'blank', 200],
    [`${gn()}은(는) 다시 6호선에 탑승했다.`, 'narrator', 400],
    [`${st.name}역. ${dirLabel} 방향.`, 'system', 600],
    ['', 'blank', 800],
  ]);

  sfx.chime();

  // 재개 방식 분기
  if (G.currentStation < 0) {
    // 게임 시작 전 저장이면 인트로부터
    await sceneIntro();
  } else {
    // 현재 역에 도착한 상태로 재개
    // sceneNextStation은 "이동 후 도착" 흐름이므로
    // 현재 역 화면을 직접 그린 뒤 선택지만 표시
    await _resumeAtStation(G.currentStation);
  }
}

/* ──────────────────────────────────────────
   세이브 재개: 현재 역에서 바로 선택지 표시
   ────────────────────────────────────────── */
async function _resumeAtStation(idx) {
  const st = STATIONS[idx];
  if (!st) { await sceneIntro(); return; }

  clearUI();
  TrainPanel.setState('boarding');
  TrainPanel.updateStationInfo(st, STATIONS, idx);
  updateProgress(STATIONS, idx);

  const isUp     = (G.dirStep || 1) >= 0;
  const dirLabel = isUp ? '상행 ▲' : '하행 ▼';
  const endSt    = STATIONS[G.endStation] || STATIONS[STATIONS.length - 1];
  const remaining = Math.abs(G.endStation - idx);

  // 에피소드 헤더
  const epDiv = document.createElement('div');
  epDiv.className = 'line ep-header show';
  epDiv.innerHTML = `
    <div class="ep-num">STATION ${st.code} [${dirLabel}] · 종점까지 ${remaining}역 — 재개</div>
    <div class="ep-title">${st.name} <span style="font-size:11px;color:#4a6070;font-weight:400">${st.nameEn}</span>${st.hanja ? `<span style="font-size:10px;color:#2a5060;margin-left:6px">${st.hanja}</span>` : ''}</div>
    <div class="ep-sub">${st.desc}${st.transfer ? ` · 환승: ${st.transfer}` : ''}</div>`;
  OUT.appendChild(epDiv);

  await seq([
    ['', 'blank', 0],
    [`[재개] ${st.name}역 — ${dirLabel}`, 'system', 100],
    ['', 'blank', 300],
  ]);

  // 다음 역으로 이동하는 선택지
  choices([
    [`▸ 계속 이동한다 (${dirLabel})`, () => {
      TrainPanel.playDepart();
      sceneNextStation(idx + (G.dirStep || 1));
    }]
  ]);
}
