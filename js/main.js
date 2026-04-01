/* ═══════════════════════════════════════════════════
   main.js — 게임 진입점 + 레이아웃 조립 + 모바일 탭 전환
   ═══════════════════════════════════════════════════ */

'use strict';

// ────────────────────────────────
//  DOM 참조
// ────────────────────────────────
const MAP_BTN      = document.getElementById('map-btn');
const MINIMAP_WRAP = document.getElementById('minimap-wrap');

const TAB_GAME     = document.getElementById('tab-game');
const TAB_TRAIN    = document.getElementById('tab-train');
const TAB_LOG      = document.getElementById('tab-log');
const PANEL_TRAIN  = document.getElementById('train-panel');
const PANEL_GAME   = document.getElementById('game');
const BADGE_TRAIN  = document.getElementById('badge-train');
const BADGE_LOG    = document.getElementById('badge-log');

// ────────────────────────────────
//  모바일 탭 전환
// ────────────────────────────────
let currentTab = 'game';    // 'game' | 'train' | 'log'

function isMobileLayout() {
  return window.innerWidth <= 760;
}

function switchTab(tab) {
  if (!isMobileLayout()) return;
  currentTab = tab;
  sfx.ui();

  // 탭 버튼 active
  [TAB_GAME, TAB_TRAIN, TAB_LOG].forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-selected', 'false');
  });

  // 패널 표시/숨김
  PANEL_GAME.classList.remove('tab-hidden');
  PANEL_TRAIN.classList.remove('tab-active');

  if (tab === 'game') {
    TAB_GAME.classList.add('active');
    TAB_GAME.setAttribute('aria-selected', 'true');
    PANEL_GAME.classList.remove('tab-hidden');
    PANEL_TRAIN.classList.remove('tab-active');
    // 뱃지 클리어
    BADGE_TRAIN.classList.remove('show');
    BADGE_LOG.classList.remove('show');
  } else if (tab === 'train') {
    TAB_TRAIN.classList.add('active');
    TAB_TRAIN.setAttribute('aria-selected', 'true');
    PANEL_GAME.classList.add('tab-hidden');
    PANEL_TRAIN.classList.add('tab-active');
    // 열차뷰 탭: 로그 숨김
    document.getElementById('train-log').style.display = 'none';
    document.getElementById('train-station-info').style.display = 'block';
    document.getElementById('train-viewport').style.display = 'block';
    BADGE_TRAIN.classList.remove('show');
  } else if (tab === 'log') {
    TAB_LOG.classList.add('active');
    TAB_LOG.setAttribute('aria-selected', 'true');
    PANEL_GAME.classList.add('tab-hidden');
    PANEL_TRAIN.classList.add('tab-active');
    // 로그 탭: 뷰포트/역정보 숨기고 로그만 보이게
    document.getElementById('train-log').style.display = 'block';
    document.getElementById('train-viewport').style.display = 'none';
    document.getElementById('train-station-info').style.display = 'none';
    BADGE_LOG.classList.remove('show');
  }

  // 탭 전환 후 스크롤 상단으로
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 탭 버튼 이벤트
TAB_GAME.addEventListener('click',  () => switchTab('game'));
TAB_TRAIN.addEventListener('click', () => switchTab('train'));
TAB_LOG.addEventListener('click',   () => switchTab('log'));

// 화면 크기 변경 시 데스크톱으로 전환되면 탭 숨김 스타일 초기화
window.addEventListener('resize', () => {
  if (!isMobileLayout()) {
    PANEL_GAME.classList.remove('tab-hidden');
    PANEL_TRAIN.classList.remove('tab-active');
    // 숨겼던 내부 요소 복원
    document.getElementById('train-log').style.display = '';
    document.getElementById('train-viewport').style.display = '';
    document.getElementById('train-station-info').style.display = '';
  }
});

// ────────────────────────────────
//  이벤트 발생 시 모바일 뱃지 표시
//  (game 탭 외에서 이벤트 로그가 쌓이면 알림)
// ────────────────────────────────
const _origAddLog = TrainPanel.addLog.bind(TrainPanel);
TrainPanel.addLog = function(text, type) {
  _origAddLog(text, type);
  if (isMobileLayout()) {
    if (currentTab === 'game' && (type === 'event' || type === 'warn' || type === 'new')) {
      BADGE_TRAIN.textContent = '!';
      BADGE_TRAIN.classList.add('show');
      BADGE_LOG.textContent = '!';
      BADGE_LOG.classList.add('show');
    }
  }
};

// ────────────────────────────────
//  스토리 텍스트 출력 시 모바일: game 탭으로 자동 전환
// ────────────────────────────────
const _origPrint = print;
// print 함수 래핑 — 선택지가 나올 때 game 탭으로 자동 포커스
const _origChoices = choices;
window.choices = function(opts) {
  if (isMobileLayout() && currentTab !== 'game') {
    switchTab('game');
  }
  _origChoices(opts);
};

// ────────────────────────────────
//  🗺 노선도 토글
// ────────────────────────────────
MAP_BTN.addEventListener('click', () => {
  sfx.ui();
  if (typeof showSurvivalChronicle === 'function') {
    showSurvivalChronicle();
  }
});

// ────────────────────────────────
//  미니맵 빌드
// ────────────────────────────────
function buildMinimap() {
  const el = document.getElementById('minimap');
  if (!el) return;
  el.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.style.cssText = `
    display:flex; flex-wrap:wrap; gap:3px 0;
    padding:6px 12px 4px;
    font-family:'Courier New',monospace; font-size:11px;
  `;

  STATIONS.forEach((st, i) => {
    const done    = i < G.currentStation;
    const current = i === G.currentStation;
    const hasEv   = st.hasEvent;

    const item = document.createElement('div');
    item.style.cssText = 'display:flex;align-items:center;gap:3px;';

    const dot = document.createElement('span');
    dot.style.cssText = `
      display:inline-block;width:9px;height:9px;border-radius:50%;flex-shrink:0;
      background:${current ? '#c05020' : done ? '#703010' : hasEv ? '#8a6010' : 'transparent'};
      border:1px solid ${current ? '#c05020' : done ? '#703010' : hasEv ? '#8a6010' : '#1e3040'};
      ${current ? 'box-shadow:0 0 5px #c05020;' : ''}
    `;

    const label = document.createElement('span');
    label.style.cssText = `color:${current ? '#c05020' : done ? '#703010' : hasEv ? '#8a6010' : '#1e3040'};`;
    label.textContent = st.name;

    const sep = document.createElement('span');
    sep.style.cssText = 'color:#152028;margin:0 2px;';
    sep.textContent = i < STATIONS.length - 1 ? '—' : '';

    item.append(dot, label, sep);
    wrap.appendChild(item);
  });
  el.appendChild(wrap);
}

// ────────────────────────────────
//  세이브 버튼
// ────────────────────────────────
const SAVE_BTN = document.getElementById('save-btn');
if (SAVE_BTN) {
  SAVE_BTN.addEventListener('click', () => {
    sfx.ui();
    if (G.currentStation < 0) {
      // 게임 시작 전엔 저장 불가 — 토스트 메시지
      const toast = document.createElement('div');
      toast.style.cssText = 'position:fixed;top:60px;left:50%;transform:translateX(-50%);background:#0b1a24;border:1px solid #c05020;color:#c05020;font-size:12px;font-family:Courier New,monospace;padding:8px 18px;border-radius:4px;z-index:9999;pointer-events:none;white-space:nowrap;';
      toast.textContent = '⚠ 역을 출발한 후 저장할 수 있습니다';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2200);
      return;
    }
    showSaveModal();
  });
}

// ────────────────────────────────
//  초기화 — URL ?save= 및 로컬스토리지 자동저장 감지 후 분기
// ────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  TrainPanel.init();
  buildMinimap();
  MINIMAP_WRAP.style.display = 'none';

  // 모바일이면 game 탭이 기본 활성
  if (isMobileLayout()) {
    switchTab('game');
  }

  // 자동저장 혹은 URL 세이브를 가져온다.
  const saveData = await checkAutoSaveOrParam();
  if (saveData) {
    await loadSaveData(saveData);
  } else {
    sceneIntro();
  }
});
