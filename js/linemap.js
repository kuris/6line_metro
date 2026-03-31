/* ═══════════════════════════════════════════════════
   linemap.js — 6호선 노선도 역 선택 UI
   실제 노선도처럼 구불구불한 선 위에 역 버튼 배치
   ═══════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────
   39개 역의 노선도 좌표 (SVG 660×380 기준)
   실제 6호선 노선 형태를 모방: 서쪽(좌상) → 동쪽(우하)
   ────────────────────────────────────────── */
/* ──────────────────────────────────────────
   6호선 실제 노선 형태 모방:
   - 서북(응암~연신내) : 수평 직선 → 우상단
   - 남서(구산~합정)   : 꺾어 내려오는 호
   - 남(합정~삼각지)   : 왼쪽으로 꺾임
   - 남동(삼각지~신당) : U자 바닥에서 다시 올라옴
   - 동(신당~신내)   : 오른쪽으로 뻗어나가는 곡선
   SVG 뷰박스: 570 × 310
   ────────────────────────────────────────── */
const LINE_MAP_COORDS = [
  // ── 서북부 직선 구간 ──
  { id:  0, x:  30, y:  52 },   // 601 응암
  { id:  1, x:  66, y:  52 },   // 602 역촌
  { id:  2, x: 102, y:  52 },   // 603 불광
  { id:  3, x: 138, y:  52 },   // 604 독바위
  { id:  4, x: 174, y:  52 },   // 605 연신내
  { id:  5, x: 207, y:  62 },   // 606 구산
  // ── 남하 호선 ──
  { id:  6, x: 234, y:  82 },   // 607 새절
  { id:  7, x: 252, y: 108 },   // 608 증산
  { id:  8, x: 260, y: 138 },   // 609 DMC
  { id:  9, x: 256, y: 167 },   // 610 마포구청
  { id: 10, x: 244, y: 193 },   // 611 망원
  { id: 11, x: 228, y: 215 },   // 612 망원(상)
  { id: 12, x: 208, y: 232 },   // 613 합정 ★환승
  // ── 서남부 (합정→삼각지) ──
  { id: 13, x: 186, y: 244 },   // 614 상수
  { id: 14, x: 163, y: 250 },   // 615 광흥창
  { id: 15, x: 140, y: 251 },   // 616 대흥
  { id: 16, x: 117, y: 246 },   // 617 공덕
  { id: 17, x:  97, y: 235 },   // 618 효창공원앞
  { id: 18, x:  82, y: 218 },   // 619 삼각지
  // ── 이태원 루프 ──
  { id: 19, x:  73, y: 198 },   // 620 녹사평
  { id: 20, x:  72, y: 176 },   // 621 이태원
  { id: 21, x:  78, y: 155 },   // 622 한강진
  { id: 22, x:  90, y: 136 },   // 623 버티고개
  // ── 동북부 올라오는 구간 ──
  { id: 23, x: 109, y: 119 },   // 624 약수
  { id: 24, x: 131, y: 106 },   // 625 청구
  { id: 25, x: 156, y:  96 },   // 626 신당
  { id: 26, x: 183, y:  89 },   // 627 동묘앞
  { id: 27, x: 212, y:  86 },   // 628 창신
  { id: 28, x: 241, y:  87 },   // 629 보문
  { id: 29, x: 271, y:  91 },   // 630 안암
  // ── 동부 완만한 하향 곡선 ──
  { id: 30, x: 302, y:  99 },   // 631 고려대
  { id: 31, x: 332, y: 111 },   // 632 월곡
  { id: 32, x: 361, y: 126 },   // 633 상월곡
  { id: 33, x: 390, y: 143 },   // 634 돌곶이
  { id: 34, x: 418, y: 162 },   // 635 석계
  { id: 35, x: 446, y: 181 },   // 636 태릉입구
  { id: 36, x: 474, y: 197 },   // 637 화랑대
  { id: 37, x: 504, y: 210 },   // 647 봉화산
  { id: 38, x: 534, y: 223 },   // 648 신내
];

/* ──────────────────────────────────────────
   노선도 UI 생성 및 반환
   onSelect(stIdx): 역 선택 콜백
   ────────────────────────────────────────── */
/* ──────────────────────────────────────────
   레이블 위치 오버라이드 (겹침 방지)
   above: true = 위, false = 아래, 'left'/'right' = 좌우
   ────────────────────────────────────────── */
const LABEL_POS = {
   0: 'above',   // 응암
   1: 'below',   // 역촌
   2: 'above',   // 불광
   3: 'below',   // 독바위
   4: 'above',   // 연신내
   5: 'above',   // 구산
   6: 'right',   // 새절
   7: 'right',   // 증산
   8: 'right',   // DMC
   9: 'right',   // 마포구청
  10: 'right',   // 망원
  11: 'right',   // 망원(상)
  12: 'below',   // 합정
  13: 'below',   // 상수
  14: 'below',   // 광흥창
  15: 'below',   // 대흥
  16: 'below',   // 공덕
  17: 'below',   // 효창공원앞
  18: 'left',    // 삼각지
  19: 'left',    // 녹사평
  20: 'left',    // 이태원
  21: 'left',    // 한강진
  22: 'left',    // 버티고개
  23: 'left',    // 약수
  24: 'above',   // 청구
  25: 'above',   // 신당
  26: 'above',   // 동묘앞
  27: 'above',   // 창신
  28: 'above',   // 보문
  29: 'above',   // 안암
  30: 'above',   // 고려대
  31: 'above',   // 월곡
  32: 'above',   // 상월곡
  33: 'above',   // 돌곶이
  34: 'above',   // 석계
  35: 'below',   // 태릉입구
  36: 'below',   // 화랑대
  37: 'below',   // 봉화산
  38: 'below',   // 신내
};

function buildLineMap(onSelect) {
  const W = 570, H = 295;
  const R_NORMAL   = 6.5;
  const R_EVENT    = 8.5;
  const R_TRANSFER = 9.5;

  // ── 컨테이너 ──
  const wrap = document.createElement('div');
  wrap.id = 'linemap-wrap';
  wrap.innerHTML = `
    <div class="lm-title">
      <span class="lm-badge">LINE 6</span>
      <span>출발역을 선택하세요</span>
      <span class="lm-legend">
        <span class="lm-leg-dot ev"></span>이벤트
        <span class="lm-leg-dot xf"></span>환승
      </span>
    </div>
    <div class="lm-scroll-hint">← 스크롤 →</div>
  `;

  // ── SVG ──
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width',  '100%');
  svg.setAttribute('height', H);
  svg.style.minWidth = '400px';
  svg.id = 'linemap-svg';

  // ── 선 경로 ──
  const pathD = LINE_MAP_COORDS.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // 배경 두꺼운 선 (그림자)
  const pathBg = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathBg.setAttribute('d', pathD);
  pathBg.setAttribute('class', 'lm-line-bg');
  svg.appendChild(pathBg);

  // 메인 라인
  const pathMain = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathMain.setAttribute('d', pathD);
  pathMain.setAttribute('class', 'lm-line');
  svg.appendChild(pathMain);

  // ── 역 그리기 ──
  LINE_MAP_COORDS.forEach(({ id, x, y }) => {
    const st = STATIONS[id];
    const isEvent    = st.hasEvent;
    const isTransfer = !!st.transfer;
    const r = isTransfer ? R_TRANSFER : isEvent ? R_EVENT : R_NORMAL;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'lm-station-g');
    g.setAttribute('data-id', id);
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', `${st.name} 선택`);

    // 환승역: 바깥 링
    if (isTransfer) {
      const outerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      outerCircle.setAttribute('cx', x);
      outerCircle.setAttribute('cy', y);
      outerCircle.setAttribute('r', r + 3.5);
      outerCircle.setAttribute('class', 'lm-dot-xfer-ring');
      g.appendChild(outerCircle);
    }

    // 이벤트역: 별 펄스 원
    if (isEvent) {
      const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      pulse.setAttribute('cx', x);
      pulse.setAttribute('cy', y);
      pulse.setAttribute('r', r + 5);
      pulse.setAttribute('class', 'lm-dot-pulse');
      g.appendChild(pulse);
    }

    // 메인 원
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', r);
    circle.setAttribute('class',
      `lm-dot${isTransfer ? ' xfer' : ''}${isEvent ? ' event' : ''}`
    );
    g.appendChild(circle);

    // 이벤트 역에 별 표시
    if (isEvent) {
      const star = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      star.setAttribute('x', x);
      star.setAttribute('y', y + 1);
      star.setAttribute('class', 'lm-star');
      star.textContent = '★';
      g.appendChild(star);
    }

    // 레이블 위치 계산
    const pos = LABEL_POS[id] || 'above';
    let lx = x, ly = y, anchor = 'middle', cy = y, cy2 = y;
    if (pos === 'above') {
      ly = y - r - 4; cy2 = y - r - 15; anchor = 'middle';
    } else if (pos === 'below') {
      ly = y + r + 13; cy2 = y + r + 23; anchor = 'middle';
    } else if (pos === 'right') {
      lx = x + r + 5; ly = y + 3; cy2 = y + 12; anchor = 'start';
    } else if (pos === 'left') {
      lx = x - r - 5; ly = y + 3; cy2 = y + 12; anchor = 'end';
    }

    // 역 이름 레이블
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', lx);
    label.setAttribute('y', ly);
    label.setAttribute('class', `lm-label${isEvent ? ' ev' : ''}${isTransfer ? ' xf' : ''}`);
    label.setAttribute('text-anchor', anchor);
    label.textContent = st.name;
    g.appendChild(label);

    // 역 코드 (작게)
    const code = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    code.setAttribute('x', lx);
    code.setAttribute('y', cy2);
    code.setAttribute('class', 'lm-code');
    code.setAttribute('text-anchor', anchor);
    code.textContent = st.code;
    g.appendChild(code);

    // 클릭/터치/키 이벤트
    const handleSelect = () => {
      // 기존 선택 제거
      svg.querySelectorAll('.lm-station-g.selected').forEach(el => el.classList.remove('selected'));
      g.classList.add('selected');
      onSelect(id);
    };
    g.addEventListener('click', handleSelect);
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(); } });

    svg.appendChild(g);
  });

  // ── 종착역 표시 (양 끝) ──
  const addTerminus = (id, label, anchor) => {
    const { x, y } = LINE_MAP_COORDS[id];
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', anchor === 'start' ? x - 14 : x + 14);
    t.setAttribute('y', y + 4);
    t.setAttribute('class', 'lm-terminus');
    t.setAttribute('text-anchor', anchor);
    t.textContent = label;
    svg.appendChild(t);
  };
  addTerminus(0,  '← 응암', 'end');
  addTerminus(38, '신내 →', 'start');

  // SVG를 래퍼에 추가
  const svgWrap = document.createElement('div');
  svgWrap.className = 'lm-svg-wrap';
  svgWrap.appendChild(svg);
  wrap.appendChild(svgWrap);

  // ── 툴팁 / 역 정보 패널 ──
  const info = document.createElement('div');
  info.id = 'lm-info';
  info.innerHTML = `<span class="lm-info-placeholder">역을 클릭하면 정보가 표시됩니다</span>`;
  wrap.appendChild(info);

  // 마우스오버 툴팁
  svg.querySelectorAll('.lm-station-g').forEach(g => {
    const id = parseInt(g.getAttribute('data-id'));
    const st = STATIONS[id];
    g.addEventListener('mouseenter', () => {
      if (g.classList.contains('selected')) return;
      info.innerHTML = `
        <span class="lm-info-code">${st.code}</span>
        <span class="lm-info-name">${st.name}</span>
        ${st.hanja ? `<span class="lm-info-hanja">${st.hanja}</span>` : ''}
        ${st.transfer ? `<span class="lm-info-xfer">환승: ${st.transfer}</span>` : ''}
        ${st.hasEvent ? `<span class="lm-info-ev">★ 이벤트 역</span>` : ''}
        <span class="lm-info-hint">클릭해서 출발</span>
      `;
    });
    g.addEventListener('mouseleave', () => {
      const sel = svg.querySelector('.lm-station-g.selected');
      if (!sel) {
        info.innerHTML = `<span class="lm-info-placeholder">역을 클릭하면 정보가 표시됩니다</span>`;
      }
    });
  });

  return wrap;
}
