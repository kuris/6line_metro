/* ═══════════════════════════════════════════════════
   timeofday.js — 시간대 시스템
   새벽첫차 / 출근러시 / 한낮 / 퇴근러시 / 심야막차
   ═══════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────
   시간대 정의
   ────────────────────────────────────────── */
const TIME_OF_DAY = {
  dawn: {
    id:       'dawn',
    label:    '새벽 첫차',
    emoji:    '🌙',
    time:     'AM 05:30',
    color:    '#2a4a6a',
    bgNote:   '텅 빈 객차. 차가운 형광등.',
    crowd:    '한산',
    crowdPax: '2~4명',
    ambience: '정적. 가끔 환기 소리.',
    trainNote:'첫차 특유의 고요함.',
    statLabel:'🌙 새벽',
  },
  morning: {
    id:       'morning',
    label:    '출근 러시',
    emoji:    '🌅',
    time:     'AM 08:20',
    color:    '#6a4a20',
    bgNote:   '만원 객차. 숨이 막힌다.',
    crowd:    '극혼잡',
    crowdPax: '150%+',
    ambience: '소음·진동·냄새 총집합.',
    trainNote:'출근 인파로 빽빽.',
    statLabel:'🌅 출근',
  },
  noon: {
    id:       'noon',
    label:    '한낮',
    emoji:    '☀️',
    time:     'PM 12:40',
    color:    '#4a6a2a',
    bgNote:   '적당히 한산. 점심 먹으러 가는 사람들.',
    crowd:    '보통',
    crowdPax: '30~50%',
    ambience: '편안한 소음.',
    trainNote:'그나마 탈 만하다.',
    statLabel:'☀️ 한낮',
  },
  evening: {
    id:       'evening',
    label:    '퇴근 러시',
    emoji:    '🌆',
    time:     'PM 06:15',
    color:    '#6a3a10',
    bgNote:   '출근보다 더 혼잡. 퇴근 피로감.',
    crowd:    '극혼잡',
    crowdPax: '170%+',
    ambience: '한숨·짜증·스마트폰 소리.',
    trainNote:'퇴근 인파 최고조.',
    statLabel:'🌆 퇴근',
  },
  night: {
    id:       'night',
    label:    '심야 막차',
    emoji:    '🌃',
    time:     'PM 11:50',
    color:    '#1a2a4a',
    bgNote:   '취객·야근자·연인. 막차의 분위기.',
    crowd:    '한산',
    crowdPax: '10~20%',
    ambience: '취한 웃음소리. 먼 곳 같은 객차.',
    trainNote:'막차 특유의 쓸쓸함.',
    statLabel:'🌃 심야',
  },
};

const TOD_ORDER = ['dawn','morning','noon','evening','night'];

/* ──────────────────────────────────────────
   헬퍼
   ────────────────────────────────────────── */
function getTOD() {
  return TIME_OF_DAY[G.timeOfDay] || TIME_OF_DAY.noon;
}

// 시간대에 따른 묘사 문장 반환
function todDesc(variants) {
  // variants: { dawn, morning, noon, evening, night, default }
  const t = G.timeOfDay || 'noon';
  return variants[t] || variants['default'] || '';
}

// 혼잡도 텍스트
function crowdText() {
  const tod = getTOD();
  return `${tod.crowd} (${tod.crowdPax})`;
}

// 시간대별 ASCII 배경
function todAsciiLines() {
  const tod = getTOD();
  switch(tod.id) {
    case 'dawn':
      return [
        [`  ┌──────────────────────────────┐`,''],
        [`  │  🌙  새벽 첫차  ${tod.time}    │`,'hl'],
        [`  │  객차 ${tod.crowdPax.padEnd(6)} · ${tod.bgNote.slice(0,14)}  │`,''],
        [`  └──────────────────────────────┘`,''],
      ];
    case 'morning':
      return [
        [`  ┌──────────────────────────────┐`,''],
        [`  │  🌅  출근 러시  ${tod.time}   │`,'hl'],
        [`  │  혼잡 ${tod.crowdPax.padEnd(6)} · 숨막히는 아침    │`,''],
        [`  └──────────────────────────────┘`,''],
      ];
    case 'noon':
      return [
        [`  ┌──────────────────────────────┐`,''],
        [`  │  ☀️  한낮  ${tod.time}        │`,'hl'],
        [`  │  한산 ${tod.crowdPax.padEnd(6)} · 점심 시간대      │`,''],
        [`  └──────────────────────────────┘`,''],
      ];
    case 'evening':
      return [
        [`  ┌──────────────────────────────┐`,''],
        [`  │  🌆  퇴근 러시  ${tod.time}  │`,'hl'],
        [`  │  혼잡 ${tod.crowdPax.padEnd(6)} · 퇴근 인파 최고조 │`,''],
        [`  └──────────────────────────────┘`,''],
      ];
    case 'night':
      return [
        [`  ┌──────────────────────────────┐`,''],
        [`  │  🌃  심야 막차  ${tod.time}   │`,'hl'],
        [`  │  한산 ${tod.crowdPax.padEnd(6)} · 막차의 쓸쓸함    │`,''],
        [`  └──────────────────────────────┘`,''],
      ];
    default: return [];
  }
}

// stat-bar 시간대 표시 업데이트
function updateTODStat() {
  const el = document.getElementById('st-tod');
  if (el) el.textContent = getTOD().statLabel;
}
