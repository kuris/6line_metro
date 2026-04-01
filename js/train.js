/* ═══════════════════════════════════════════════════
   train.js — 지하철 상시 아스키아트 패널
   상태: idle / boarding / running / crowded / arriving / event / danger / ending
   모바일 대응: 뷰포트 너비 감지 → 짧은 씬 자동 선택
   ═══════════════════════════════════════════════════ */

'use strict';

const TrainPanel = (() => {

  // ── DOM ──
  const viewport  = document.getElementById('train-viewport');
  const statusEl  = document.getElementById('train-panel-status');
  const nameEl    = document.getElementById('tsi-name');
  const nameEnEl  = document.getElementById('tsi-name-en');
  const xferEl    = document.getElementById('tsi-transfer');
  const routeEl   = document.getElementById('tsi-route-strip');
  const overlayEl = document.getElementById('train-event-overlay');
  const logEl     = document.getElementById('train-log');

  let animTimer    = null;
  let overlayTimer = null;
  let frame        = 0;
  const LOG_MAX    = 30;

  // ── 모바일 여부 감지 (패널 너비 기준) ──
  function isMobile() {
    return (viewport ? viewport.offsetWidth : window.innerWidth) < 260;
  }

  // ══════════════════════════════════════════
  //  씬 정의 — 각 상태마다 [full, compact] 제공
  //  compact: 모바일(좁은 패널)용 축약 버전
  // ══════════════════════════════════════════

  // 공통 헬퍼
  const O  = cls => (t) => `<span class="${cls}">${t}</span>`;
  const ou = O('ts-outer'), win= O('ts-window'), wl = O('ts-window-lit'),
        se = O('ts-seat'),  fl = O('ts-floor'),  rl = O('ts-rail'),
        pa = O('ts-pass'),  pr = O('ts-pass-red'), pg = O('ts-pass-gold'),
        tu = O('ts-tunnel'), ar = O('ts-arrive');

  const SCENES = {

    /* ── IDLE ── */
    idle: {
      full: () => [
        tu('  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓'),
        tu('  ▓▓▓   서울 지하철 6호선   ▓▓▓'),
        tu('  ▓▓▓   LINE 6  SEOUL      ▓▓▓'),
        tu('  ▓▓▓   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   ▓▓▓'),
        O('ts-dim')('   ·  ·  ·  ·  ·  ·  ·  ·  ·  · '),
        ou('  ┌────────────────────────────┐'),
        ou('  │') + wl('  ████  이름을 입력하세요  ████') + ou('│'),
        ou('  │') + se('    ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬') + ou('  │'),
        ou('  └────────────────────────────┘'),
        rl('   ●══════════════════════════● '),
      ],
      compact: () => [
        tu('▓▓▓ 서울 지하철 6호선 ▓▓▓'),
        tu('▓▓▓   LINE  6  SEOUL  ▓▓▓'),
        O('ts-dim')('· · · · · · · · · · · ·'),
        ou('┌──────────────────────┐'),
        ou('│') + wl(' 이름을 입력하세요  ') + ou('│'),
        ou('└──────────────────────┘'),
        rl('●══════════════════════●'),
      ],
    },

    /* ── ARRIVING ── */
    arriving: {
      full: (st) => [
        tu('  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓'),
        ar(`  ▶▶  ${(st||'').substring(0,14).padEnd(14)}  ▶▶  `),
        ou('  ┌────────────────────────────┐'),
        ou('  │') + wl('   ┌──────┐    ┌──────┐      ') + ou('  │'),
        ou('  │') + wl('   │  o o │    │  o o │      ') + ou('  │'),
        ou('  │') + wl('   └──────┘    └──────┘      ') + ou('  │'),
        ou('  │') + se('    ▬▬▬▬▬▬▬    ▬▬▬▬▬▬▬      ') + ou('  │'),
        ou('  └────────────────────────────┘'),
        rl('   ●══════════════════════════● '),
        ar('  ◀ 승강장 도착  문이 열립니다 ▶  '),
      ],
      compact: (st) => [
        ar(`▶ ${(st||'').substring(0,10)} 도착 ◀`),
        ou('┌──────────────────────┐'),
        ou('│') + wl(' ┌────┐  ┌────┐       ') + ou('│'),
        ou('│') + wl(' │o  o│  │o  o│       ') + ou('│'),
        ou('│') + wl(' └────┘  └────┘       ') + ou('│'),
        ou('└──────────────────────┘'),
        rl('●══════════════════════●'),
        ar('◀ 문이 열립니다 ▶'),
      ],
    },

    /* ── BOARDING ── */
    boarding: {
      full: () => [
        ou('┌─────────────────────────────────┐'),
        ou('│') + win(' ╔═══════╗  ╔═══════╗  ╔══════╗ ') + ou('│'),
        ou('│') + wl(' ║ o   o ║  ║ o   o ║  ║ o  o ║ ') + ou('│'),
        ou('│') + win(' ╚═══════╝  ╚═══════╝  ╚══════╝ ') + ou('│'),
        ou('│') + se('  ▬▬▬▬▬▬▬▬▬  ▬▬▬▬▬▬▬▬▬  ▬▬▬▬▬▬ ') + ou('│'),
        ou('│') + pa('   ⊙ ⊙  ⊙ ⊙  ⊙ ⊙  ⊙       ⊙  ') + ou('│'),
        ou('│') + fl('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ') + ou('│'),
        ou('└────────────────╥────────────────┘'),
        ar('                ║ ← 문 열림        '),
        rl(' ●═══════════════════════════════● '),
      ],
      compact: () => [
        ou('┌──────────────────────┐'),
        ou('│') + wl(' ╔════╗  ╔════╗  ╔═══╗ ') + ou('│'),
        ou('│') + wl(' ║o  o║  ║o  o║  ║o o║ ') + ou('│'),
        ou('│') + wl(' ╚════╝  ╚════╝  ╚═══╝ ') + ou('│'),
        ou('│') + pa(' ⊙ ⊙  ⊙ ⊙  ⊙ ⊙  ⊙    ') + ou('│'),
        ou('└──────────╥───────────┘'),
        ar('           ║ 문 열림'),
        rl('●══════════════════════●'),
      ],
    },

    /* ── RUNNING ── */
    running: {
      full: (f) => {
        const sp = ['·','-','=','≡'][Math.floor(f/2) % 4];
        const pRows = [
          '⊙ ⊙  ⊙ ⊙  ⊙ ⊙  ⊙  ⊙   ⊙  ⊙',
          '⊙    ⊙  ⊙    ⊙  ⊙  ⊙   ⊙  ⊙',
          '⊙ ⊙  ⊙  ⊙ ⊙  ⊙    ⊙  ⊙ ⊙  ⊙',
        ];
        return [
          tu(sp.repeat(18)),
          ou('┌─────────────────────────────────┐'),
          ou('│') + win(' ╔═══════╗  ╔═══════╗  ╔══════╗ ') + ou('│'),
          ou('│') + wl(' ║ o   o ║  ║ o   o ║  ║ o  o ║ ') + ou('│'),
          ou('│') + win(' ╚═══════╝  ╚═══════╝  ╚══════╝ ') + ou('│'),
          ou('│') + se('  ▬▬▬▬▬▬▬▬▬  ▬▬▬▬▬▬▬▬▬  ▬▬▬▬▬▬ ') + ou('│'),
          ou('│') + pa(`   ${pRows[f % 3]} `) + ou('│'),
          ou('│') + fl('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ') + ou('│'),
          ou('└─────────────────────────────────┘'),
          rl(` ●${sp.repeat(33)}●`),
        ];
      },
      compact: (f) => {
        const sp = ['·','-','=','≡'][Math.floor(f/2) % 4];
        const pRows = ['⊙ ⊙  ⊙ ⊙  ⊙ ⊙  ⊙  ', '⊙  ⊙  ⊙  ⊙  ⊙  ⊙  ', '⊙⊙  ⊙  ⊙⊙  ⊙  ⊙⊙  '];
        return [
          tu(sp.repeat(14)),
          ou('┌──────────────────────┐'),
          ou('│') + wl(' ╔════╗  ╔════╗  ╔═══╗ ') + ou('│'),
          ou('│') + wl(' ║o  o║  ║o  o║  ║o o║ ') + ou('│'),
          ou('│') + wl(' ╚════╝  ╚════╝  ╚═══╝ ') + ou('│'),
          ou('│') + pa(` ${pRows[f%3]}`) + ou('│'),
          ou('└──────────────────────┘'),
          rl(`●${sp.repeat(22)}●`),
        ];
      },
    },

    /* ── EVENT ── */
    event: {
      full: (f) => {
        const blink = f % 2 === 0;
        const excl  = blink ? '!!!' : '   ';
        return [
          ou('┌─────────────────────────────────┐'),
          ou('│') + win(' ╔═══════╗  ╔═══════╗  ╔══════╗ ') + ou('│'),
          ou('│') + wl(' ║ o   o ║  ║ o   o ║  ║ o  o ║ ') + ou('│'),
          ou('│') + win(' ╚═══════╝  ╚═══════╝  ╚══════╝ ') + ou('│'),
          ou('│') + se('  ▬▬▬▬▬▬▬▬▬  ▬▬▬▬▬▬▬▬▬  ▬▬▬▬▬▬ ') + ou('│'),
          ou('│') + pg('   ⊙ ⊙  ') + pr(`★ ← 이벤트 ${excl}`) + ou('     │'),
          ou('│') + fl('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ') + ou('│'),
          ou('└─────────────────────────────────┘'),
          rl(' ●═══════════════════════════════● '),
        ];
      },
      compact: (f) => {
        const excl = f % 2 === 0 ? '!!!' : '   ';
        return [
          ou('┌──────────────────────┐'),
          ou('│') + wl(' ╔════╗  ╔════╗  ╔═══╗ ') + ou('│'),
          ou('│') + wl(' ║o  o║  ║o  o║  ║o o║ ') + ou('│'),
          ou('│') + wl(' ╚════╝  ╚════╝  ╚═══╝ ') + ou('│'),
          ou('│') + pg(' ⊙⊙ ') + pr(`★ 이벤트${excl}`) + ou('  │'),
          ou('└──────────────────────┘'),
          rl('●══════════════════════●'),
        ];
      },
    },

    /* ── DANGER ── */
    danger: {
      full: (f) => {
        const blink = f % 2 === 0;
        const fill  = blink ? '▓▓▓▓▓▓▓' : '       ';
        const fill2 = blink ? '▓▓▓▓▓▓' : '      ';
        return [
          ou('┌─────────────────────────────────┐'),
          ou('│') + (blink ? pr(' ╔═══════╗  ╔═══════╗  ╔══════╗ ') : win(' ╔═══════╗  ╔═══════╗  ╔══════╗ ')) + ou('│'),
          ou('│') + pr(` ║${fill}║  ║${fill}║  ║${fill2}║ `) + ou('│'),
          ou('│') + (blink ? pr(' ╚═══════╝  ╚═══════╝  ╚══════╝ ') : win(' ╚═══════╝  ╚═══════╝  ╚══════╝ ')) + ou('│'),
          ou('│') + se('  ▬▬▬▬▬▬▬▬▬  ▬▬▬▬▬▬▬▬▬  ▬▬▬▬▬▬ ') + ou('│'),
          pr('│  ⚠  위험 — 비상 상황 ⚠        ') + ou('│'),
          ou('│') + fl('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ') + ou('│'),
          ou('└─────────────────────────────────┘'),
          rl(' ●═══════════════════════════════● '),
        ];
      },
      compact: (f) => {
        const blink = f % 2 === 0;
        return [
          ou('┌──────────────────────┐'),
          ou('│') + (blink ? pr(' ╔════╗  ╔════╗  ╔═══╗ ') : win(' ╔════╗  ╔════╗  ╔═══╗ ')) + ou('│'),
          ou('│') + pr(blink ? ' ║▓▓▓▓║  ║▓▓▓▓║  ║▓▓▓║ ' : ' ║    ║  ║    ║  ║   ║ ') + ou('│'),
          ou('│') + pr(' ⚠  비상 상황 ⚠       ') + ou('│'),
          ou('└──────────────────────┘'),
          rl('●══════════════════════●'),
        ];
      },
    },

    /* ── CROWDED ── */
    crowded: {
      full: (f) => {
        const shift = f % 2;
        const r1 = shift ? '⊙⊙ ⊙⊙ ⊙⊙ ⊙⊙ ⊙⊙ ⊙⊙ ⊙⊙ ⊙' : '⊙ ⊙⊙ ⊙⊙ ⊙⊙ ⊙⊙ ⊙⊙ ⊙⊙ ⊙⊙';
        return [
          ou('┌─────────────────────────────────┐'),
          ou('│') + win(' ╔═══════╗  ╔═══════╗  ╔══════╗ ') + ou('│'),
          ou('│') + wl(' ║ o   o ║  ║ o   o ║  ║ o  o ║ ') + ou('│'),
          ou('│') + win(' ╚═══════╝  ╚═══════╝  ╚══════╝ ') + ou('│'),
          ou('│') + se('  ▬▬▬▬▬▬▬▬▬  ▬▬▬▬▬▬▬▬▬  ▬▬▬▬▬▬ ') + ou('│'),
          ou('│') + pa(` ${r1.substring(0,32)} `) + ou('│'),
          ou('│') + pa(' ⊙ ⊙ ⊙ ⊙ ⊙ ⊙ ⊙ ⊙ ⊙ ⊙ ⊙ ⊙ ⊙ ') + ou('│'),
          ou('│') + fl('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ') + ou('│'),
          ou('└─────────────────────────────────┘'),
          rl(' ●═══════════════════════════════● '),
        ];
      },
      compact: (f) => {
        const shift = f % 2;
        const r = shift ? '⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙' : '⊙ ⊙ ⊙ ⊙ ⊙ ⊙ ⊙';
        return [
          ou('┌──────────────────────┐'),
          ou('│') + wl(' ╔════╗  ╔════╗  ╔═══╗ ') + ou('│'),
          ou('│') + wl(' ║o  o║  ║o  o║  ║o o║ ') + ou('│'),
          ou('│') + pa(` ${r.substring(0,20)} `) + ou('│'),
          ou('│') + pa(' ⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙  ') + ou('│'),
          ou('└──────────────────────┘'),
          rl('●══════════════════════●'),
        ];
      },
    },

    /* ── ENDING ── */
    ending: {
      full: () => [
        ar('  ══════════════════════════════  '),
        ar('    서울 지하철 6호선 완주          '),
        ar('    LINE 6  COMPLETE               '),
        ar('  ══════════════════════════════  '),
        ou('  ┌────────────────────────────┐'),
        ou('  │') + wl('  ★  모든 역을 통과했습니다  ★  ') + ou('│'),
        ou('  │') + pg('     ⊙ ⊙ ⊙ 수고하셨습니다 ⊙    ') + ou('│'),
        ou('  └────────────────────────────┘'),
        rl('   ●══════════════════════════● '),
      ],
      compact: () => [
        ar('═══ 6호선 완주! ════'),
        ar('  LINE 6 COMPLETE  '),
        ou('┌──────────────────┐'),
        ou('│') + wl(' ★ 수고하셨습니다 ★ ') + ou('│'),
        ou('└──────────────────┘'),
        rl('●════════════════●'),
      ],
    },
  };

  // ══════════════════════════════════
  //  씬 렌더링
  // ══════════════════════════════════
  function renderScene(state, arg) {
    const scene = SCENES[state];
    if (!scene) return;
    const useMobile = isMobile();
    const fn = useMobile ? scene.compact : scene.full;
    const lines = fn(arg !== undefined ? arg : frame);
    viewport.innerHTML = lines.join('\n');
  }

  // ══════════════════════════════════
  //  상태 API
  // ══════════════════════════════════
  function setStatus(text, cls = '') {
    statusEl.textContent = text;
    statusEl.className = cls || '';
  }

  function setState(state, arg) {
    clearInterval(animTimer);
    frame = 0;

    const animStates = {
      running:  { label: '▶ 운행 중',    cls: 'running', interval: 400 },
      event:    { label: '★ 이벤트',     cls: 'event',   interval: 600 },
      danger:   { label: '⚠ 위험',       cls: 'event',   interval: 350 },
      crowded:  { label: '▶ 혼잡',       cls: 'running', interval: 500 },
    };
    const staticStates = {
      arriving: { label: '◀ 도착',  cls: 'stopped' },
      boarding: { label: '⊡ 승하차', cls: 'stopped' },
      ending:   { label: '★ 완주!', cls: 'running' },
      idle:     { label: '— 대기',  cls: '' },
    };

    if (animStates[state]) {
      const s = animStates[state];
      setStatus(s.label, s.cls);
      renderScene(state, frame);
      animTimer = setInterval(() => { frame++; renderScene(state, frame); }, s.interval);
      // running 상태 전환 시 투둥투둥 사운드 (playDepart에서 이미 호출하는 경우 중복 방지)
      // setState('running')을 직접 호출하는 경우(이동 중 상태 표시)에만 짧게 재생
      if (state === 'running' && typeof sfx !== 'undefined') {
        // playDepart 내부에서 이미 tudung을 호출하므로, 직접 setState('running')만 된 경우 짧게 추가
        // (playDepart가 아닌 경로로 running이 되면 1.5초짜리 짧은 사운드)
        // _fromDepart 플래그로 구분
        if (!setState._fromDepart) {
          sfx.tudung(1.5, 0.12);
        }
        setState._fromDepart = false;
      }
    } else {
      const s = staticStates[state] || { label: '— 대기', cls: '' };
      setStatus(s.label, s.cls);
      renderScene(state, arg);
    }
  }

  // ══════════════════════════════════
  //  역 정보 업데이트
  // ══════════════════════════════════
  function updateStationInfo(station, stations, currentIdx) {
    if (!station) return;
    nameEl.textContent   = station.name   || '';
    nameEnEl.textContent = station.nameEn || '';
    xferEl.textContent   = station.transfer ? `환승: ${station.transfer}` : '';

    if (!stations || currentIdx < 0) { routeEl.innerHTML = ''; return; }
    const start = Math.max(0, currentIdx - 4);
    const end   = Math.min(stations.length - 1, currentIdx + 4);
    let html = '';
    for (let i = start; i <= end; i++) {
      const s = stations[i];
      const cls = i < currentIdx ? 'done' : i === currentIdx ? 'current' : s.hasEvent ? 'event' : '';
      html += `<div class="rs-stop"><div class="rs-dot ${cls}" title="${s.name}"></div></div>`;
      if (i < end) html += `<div class="rs-line${i < currentIdx ? ' done' : ''}"></div>`;
    }
    routeEl.innerHTML = html;
  }

  // ══════════════════════════════════
  //  호차 표시 UI 업데이트 (기능 2)
  // ══════════════════════════════════
  const CAR_STRIP = document.getElementById('car-strip');
  const TOTAL_CARS = 7;

  function updateCarStrip() {
    if (!CAR_STRIP) return;
    // G가 없거나 게임 중이 아니면 숨김
    if (typeof G === 'undefined') { CAR_STRIP.innerHTML = ''; return; }
    const cur = G.currentCar || 4;
    let html = '<span style="color:#1a3040;font-size:9px;margin-right:4px;">호차▸</span>';
    for (let i = 1; i <= TOTAL_CARS; i++) {
      const isActive = i === cur;
      const is7 = i === 7;
      const label = is7 ? `⚠${i}호차` : `${i}호차`;
      const cls = isActive ? 'car-item active' : 'car-item';
      html += `<span class="${cls}" data-car="${i}" title="${i}호차로 이동">${isActive ? `[${label}]` : label}</span>`;
    }
    CAR_STRIP.innerHTML = html;
    // 클릭 이벤트
    CAR_STRIP.querySelectorAll('.car-item').forEach(el => {
      el.onclick = () => {
        const newCar = parseInt(el.dataset.car, 10);
        if (newCar === G.currentCar) return;
        const prev = G.currentCar;
        G.currentCar = newCar;
        updateCarStrip();
        // 7호차 이동 시 이상 현상 트리거
        if (newCar === 7 && typeof print !== 'undefined') {
          print(`[${prev}호차 → 7호차로 이동했다. 주위가 지나치게 조용하다.]`, 'danger').then(async () => {
            const hasSeen = G.flags.girl_seen;
            const shouldShow = (!hasSeen) ? true : (Math.random() < 0.4);
            if (shouldShow && typeof showEventImage === 'function') {
              G.flags.girl_seen = true;
              let gImg = 'images/chracter/anxious_girl.png';
              if (Math.random() > 0.5) gImg = 'images/chracter/normal_girl.png';
              await showEventImage(gImg, '"...여긴 오면 안 되는 곳인데."', 1500, { sound: 'glitch', styleClass: 'style-ghost' });
            }
            if (typeof modifyStat !== 'undefined') modifyStat('sanity', -5, true);
          });
        } else if (typeof print !== 'undefined') {
          print(`[${prev}호차 → ${newCar}호차로 이동했다.]`, 'system');
        }
      };
    });
  }

  // ══════════════════════════════════
  //  차내 로그
  // ══════════════════════════════════
  function addLog(text, type = 'info') {
    // 1. 기존 기차 패널 로그 (왼쪽)
    const symbol = `[†]`;
    const entry = document.createElement('div');
    entry.className = `tlog-entry ${type}`;
    entry.textContent = `${symbol} ${text}`;
    if (logEl) logEl.appendChild(entry);

    // 2. 새로운 우측 사이드바 로그 (오른쪽 전용)
    const asideLog = document.getElementById('aside-log');
    if (asideLog) {
      // 초기 '대기 중' 메시지 제거
      const emptyMsg = asideLog.querySelector('.aside-log-empty');
      if (emptyMsg) emptyMsg.remove();

      const asideEntry = document.createElement('div');
      asideEntry.className = `aside-log-entry ${type}`;
      asideEntry.textContent = text;
      asideLog.prepend(asideEntry); // 최신 로그가 위로 오도록

      // 사이드바 로그 개수 제한 (가독성 위해 20개)
      const asideEntries = asideLog.querySelectorAll('.aside-log-entry');
      if (asideEntries.length > 20) asideEntries[asideEntries.length - 1].remove();
    }

    // 로그가 찍힐 때마다 기괴한 가야금 소리 (아주 낮게)
    if (window.AudioHorror && !window.AudioHorror.isMuted) {
      const notes = [110, 123, 147]; // 낮은 미레도 스타일
      const f = notes[Math.floor(Math.random() * notes.length)];
      window.AudioHorror.playGayageumNote(f);
    }

    if (logEl) {
      const entries = logEl.querySelectorAll('.tlog-entry');
      if (entries.length > LOG_MAX) entries[0].remove();
      requestAnimationFrame(() => entry.classList.add('show'));
      setTimeout(() => entry.classList.remove('new'), 1800);
      logEl.scrollTop = logEl.scrollHeight;
    }
  }

  // ══════════════════════════════════
  //  오버레이
  // ══════════════════════════════════
  function showOverlay(text, duration = 3000) {
    clearTimeout(overlayTimer);
    overlayEl.textContent = text;
    overlayEl.classList.add('show');
    if (duration > 0) overlayTimer = setTimeout(() => overlayEl.classList.remove('show'), duration);
  }
  function hideOverlay() {
    clearTimeout(overlayTimer);
    overlayEl.classList.remove('show');
  }

  // ══════════════════════════════════
  //  열차 도착/출발 시퀀스
  // ══════════════════════════════════
  async function playArrival(stationName, cb) {
    setState('arriving', stationName);
    addLog(`${stationName}: 어둠의 문이 열립니다`, 'new');
    if (typeof sfx !== 'undefined' && sfx.stopRumble) sfx.stopRumble();
    showOverlay(`⊠ ${stationName} — 문이 열립니다`, 2500);
    await _delay(1200);
    setState('boarding');
    if (typeof sfx !== 'undefined' && sfx.door) sfx.door(true, 0.4);
    addLog('통로 개방 — 낯선 공기가 유입됩니다', 'info');
    await _delay(800);
    if (cb) cb();
  }

  async function playDepart(cb) {
    if (typeof sfx !== 'undefined' && sfx.door) sfx.door(false, 0.4);
    addLog('통로 폐쇄 — 어둠 속으로 가속합니다', 'info');
    showOverlay('▶ 바퀴가 비명을 지르며 출발합니다', 1500);
    await _delay(600);
    // playDepart 경로임을 표시 → setState 내부에서 중복 재생 방지
    setState._fromDepart = true;
    setState('running');
    // 백그라운드 지하철 달리는 사운드 루프
    if (typeof sfx !== 'undefined' && sfx.startRumble) sfx.startRumble(0.2);
    if (cb) cb();
  }

  function _delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  // ══════════════════════════════════
  //  초기화
  // ══════════════════════════════════
  function init() {
    setState('idle');
    addLog('시스템 대기 중', 'info');
    // 리사이즈 시 씬 재렌더링 (compact ↔ full 전환)
    window.addEventListener('resize', () => { if (animTimer === null) renderScene('idle'); });
  }

  return { setState, updateStationInfo, updateCarStrip, addLog, showOverlay, hideOverlay, playArrival, playDepart, init };

})();
