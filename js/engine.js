/* ═══════════════════════════════════════════════════
   engine.js — 텍스트 출력 엔진 + Web Audio 사운드 + UI 유틸
   ═══════════════════════════════════════════════════ */

'use strict';

// ────────────────────────────────
//  DOM 참조
// ────────────────────────────────
const OUT       = document.getElementById('output');
const CHOICES   = document.getElementById('choices');
const NAME_AREA = document.getElementById('name-area');
const NAME_IN   = document.getElementById('name-input');
const NAME_CNF  = document.getElementById('name-confirm');
const PROGRESS  = document.getElementById('progress');
const SKIP_BTN  = document.getElementById('skip-btn');
const HDR_EP    = document.getElementById('header-ep');
const STAT_BAR  = document.getElementById('stat-bar');
const ST_HP     = document.getElementById('st-hp');
const ST_SP     = document.getElementById('st-sp');
const ST_INF    = document.getElementById('st-inf');
const ST_MSN    = document.getElementById('st-mission');
const ST_SCR    = document.getElementById('st-score');
const ST_MOV    = document.getElementById('st-move');
const ST_ITM    = document.getElementById('st-item');
const ST_ITM_W  = document.getElementById('st-item-wrap');
const ST_HANJA  = document.getElementById('st-hanja');
const ST_HANJA_W= document.getElementById('st-hanja-wrap');
const ST_COMP     = document.getElementById('st-companion');
const ST_COMP_W   = document.getElementById('st-companion-wrap');
const FS_BTN    = document.getElementById('fs-btn');
const SOUND_BTN = document.getElementById('sound-btn');
const SHARE_BTN = document.getElementById('share-btn');
const FAST_BTN  = document.getElementById('fast-btn');
const ST_HP_FILL = document.getElementById('st-hp-fill');
const ST_SP_FILL = document.getElementById('st-sp-fill');
const ST_INF_FILL = document.getElementById('st-inf-fill');
const ST_MYSTERY_WRAP = document.getElementById('st-mystery-wrap');
const ST_MYSTERY = document.getElementById('st-mystery');

if (SHARE_BTN) {
  SHARE_BTN.onclick = () => {
    if (typeof exportScreenshot === 'function') exportScreenshot();
  };
}

// ────────────────────────────────
//  게임 상태
// ────────────────────────────────
const G = {
  playerName:    '김도현',
  playerAge:     '20대',
  playerGender:  '여성',
  health:        100,
  sanity:        100,
  infection:     0,
  score:         0,
  missionCount:  0,
  mysteries:     [],      // 수집한 미스터리 조각(단서) ID 배열
  quizSolved:    [],      // 정답을 맞춘 역 이름/ID 배열 (중복 퀴즈 방지)
  inventory:     [],      // 아이템 목록
  seenEvents:    [],      // 이미 본 이벤트 ID 배열
  flags:         {},      // 스토리 플래그
  currentStation: -1,     // 현재 역 인덱스
  startStation:  -1,      // 선택한 출발역 인덱스
  direction:    'up',    // 'up'(상행) | 'down'(하행)
  dirStep:       1,       // +1(상행) | -1(하행)
  endStation:    37,      // 종착역 인덱스 (봉화산=37, 응암=0)
  timeOfDay:    'noon',  // 'dawn'|'morning'|'noon'|'evening'|'night'
  playerJob:    '',      // 직업
  playerItem:   '',      // 소지품
  currentCar:    4,      // 현재 탑승 호차 (1~7)
  stationDanger: {},     // { [stationIdx]: 위험레벨 0~3 }
  hanjaAttempts: 0,      // 한자 퀴즈(문자 해독) 시도 횟수
  hanjaSuccess:  0,      // 한자 퀴즈 성공 횟수
  hanjaFail:     0,      // 한자 퀴즈 실패 횟수
  companions:    [],     // 👥 동행자 목록 (최대 3명)
  seenEvents:    [],     // 👁️ 이미 본 이벤트 목록 (중복 방지용)
};

// ────────────────────────────────
//  UI 피드백 (팝업 효과 등)
// ────────────────────────────────
let lastStats = { health: 100, sanity: 100, infection: 0, score: 0 };

function showStatEffect(el, delta, label, color) {
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const popup = document.createElement('div');
  popup.className = 'stat-popup';
  popup.style.left = `${rect.left + rect.width / 2}px`;
  popup.style.top = `${rect.top}px`;
  popup.style.color = color;
  popup.textContent = `${delta > 0 ? '+' : ''}${delta} ${label}`;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 1200);
}

function gn() {
  return `<span style="color:#80e0a8;font-weight:700">${G.playerName}</span>`;
}

function addItem(item) {
  if (!G.inventory.includes(item)) G.inventory.push(item);
  updateStats();
}
function hasItem(item) { return G.inventory.includes(item); }
function removeItem(item) {
  G.inventory = G.inventory.filter(i => i !== item);
  updateStats();
}

let AVATAR_WRAP = document.getElementById('avatar-wrap');
let AVATAR_ASCII = document.getElementById('avatar-ascii');
let AVATAR_NAME = document.getElementById('avatar-name');
let AVATAR_MSG = document.getElementById('avatar-msg');

let lastMentalState = "CALM";

function getFaceByMentalState(mental_state) {
    const faces = {
        "CALM": {
            art: [
                "┌───────┐",
                "│ ◉   ◉ │",
                "│   ▽   │",
                "│ ╰───╯ │",
                "└───────┘",
            ],
            dialogue: [
                "...조용하네.",
                "다음 역이 어디지.",
                "오늘따라 사람이 없어.",
            ],
            color: "var(--face-calm)"
        },
        "ANXIOUS": {
            art: [
                "┌───────┐",
                "│ ◉   ◉ │",
                "│   △   │",
                "│ ╌───╌ │",
                "└───────┘",
            ],
            dialogue: [
                "뭔가 이상해...",
                "저 냄새는 뭐지.",
                "왜 이렇게 진동이 심하지.",
            ],
            color: "var(--face-anxious)"
        },
        "FEAR": {
            art: [
                "┌───────┐",
                "│ ●   ● │",
                "│   !   │",
                "│ ╰ ─ ╯ │",
                "└───────┘",
            ],
            dialogue: [
                "안돼... 뭔가 오고 있어.",
                "내려야 해. 지금 당장.",
                "저 사람... 숨을 안 쉬는 것 같아.",
            ],
            color: "var(--face-fear)"
        },
        "MADNESS": {
            art: [
                "┌───────┐",
                "│ ◈   ◈ │",
                "│ ╰▽▽▽╯ │",
                "│~~~~~~~│",
                "└───────┘",
            ],
            dialogue: [
                "다 보여... 다 들려...",
                "39개 역... 39개 역...",
                "기차는 멈추지 않아. 절대로.",
            ],
            color: "var(--face-madness)"
        },
    };
    return faces[mental_state] || faces["CALM"];
}

function setAvatarMessage(msg) {
  if (AVATAR_MSG) {
    const color = getFaceByMentalState(lastMentalState).color;
    AVATAR_MSG.innerHTML = `"${msg}" <br><span style="opacity:0.7; font-size:10px; font-weight:bold; color:${color};">[${lastMentalState}]</span>`;
  }
}

function updateAvatar() {
  if (!AVATAR_WRAP) {
    // 동적 생성 (강력한 위치 지정 및 형태 지정)
    AVATAR_WRAP = document.createElement('div');
    AVATAR_WRAP.id = 'avatar-wrap';
    AVATAR_WRAP.style.cssText = 'position:relative; z-index:999; padding:12px 14px; border-top:1px dashed #304050; border-bottom:1px dashed #304050; background:#0a121a; display:flex; align-items:center; gap:14px; flex-shrink:0; box-shadow: 0 0 15px rgba(0,0,0,0.8); margin: 4px 0;';
    
    // ASCII 프리 태그
    AVATAR_ASCII = document.createElement('pre');
    AVATAR_ASCII.id = 'avatar-ascii';
    AVATAR_ASCII.style.cssText = "font-family:'Courier New', monospace; font-size:13px; font-weight:bold; line-height:1.2; color:#80e0a8; margin:0; text-shadow: 0 0 5px #80e0a8;";
    AVATAR_WRAP.appendChild(AVATAR_ASCII);
    
    // 다이얼로그 래퍼
    const dialogDiv = document.createElement('div');
    dialogDiv.id = 'avatar-dialog';
    dialogDiv.style.cssText = "flex:1; font-size:12px; color:#b8c8d8; font-family:'Noto Serif KR', monospace; line-height:1.5;";
    
    AVATAR_MSG = document.createElement('span');
    AVATAR_MSG.id = 'avatar-msg';
    AVATAR_MSG.innerHTML = '대기 중...';
    
    const avatarCapBtn = document.createElement('button');
    avatarCapBtn.innerHTML = '📷 캡처';
    avatarCapBtn.title = '현재 생존 기록을 이미지로 저장합니다.';
    avatarCapBtn.style.cssText = 'background:transparent; border:1px solid rgba(80,160,140,0.5); color:#60b090; font-size:10px; padding:2px 6px; border-radius:3px; margin-top:8px; cursor:pointer; align-self:flex-start; outline:none; font-family:"Noto Sans KR", sans-serif;';
    avatarCapBtn.onmouseover = () => { avatarCapBtn.style.background = 'rgba(80,160,140,0.2)'; avatarCapBtn.style.color = '#80e0c0'; };
    avatarCapBtn.onmouseout = () => { avatarCapBtn.style.background = 'transparent'; avatarCapBtn.style.color = '#60b090'; };
    avatarCapBtn.onclick = () => { if (typeof exportScreenshot === 'function') exportScreenshot(); };
    
    dialogDiv.style.display = 'flex';
    dialogDiv.style.flexDirection = 'column';
    
    dialogDiv.appendChild(AVATAR_NAME);
    dialogDiv.appendChild(AVATAR_MSG);
    dialogDiv.appendChild(avatarCapBtn);
    AVATAR_WRAP.appendChild(dialogDiv);
    
    const trainPanel = document.getElementById('train-panel');
    const trainLog = document.getElementById('train-log');
    if (trainPanel && trainLog) {
      trainPanel.insertBefore(AVATAR_WRAP, trainLog);
    }
  }

  AVATAR_WRAP.style.display = 'flex';

  if (G.currentStation === -1 && G.startStation === -1 && !G.playerAge) {
    AVATAR_NAME.textContent = "Unknown Passenger";
    AVATAR_ASCII.textContent = 
`┌───────┐
│ ?   ? │
│   -   │
│ ╰───╯ │
└───────┘`;
    AVATAR_ASCII.style.color = '#7a8a9a';
    AVATAR_ASCII.style.textShadow = 'none';
    return;
  }

  // 이름, 나이, 성별, 직업 표시
  const jobLabel = G.playerJob ? ` · ${G.playerJob}` : '';
  AVATAR_NAME.textContent = (G.playerName || '승객') + ` (${G.playerGender}, ${G.playerAge}${jobLabel})`;

  // 심리 상태 계산 (100 - sanity) + 부상/감염
  let fearIndex = (100 - G.sanity) + ((100 - G.health) * 0.4) + (G.infection * 0.6);
  
  let mentalState = "CALM";
  if (fearIndex >= 85 || G.sanity <= 15) {
    mentalState = "MADNESS";
  } else if (fearIndex >= 55) {
    mentalState = "FEAR";
  } else if (fearIndex >= 25) {
    mentalState = "ANXIOUS";
  }

  const faceData = getFaceByMentalState(mentalState);

  // 캐릭터의 메시지와 뱃지 갱신
  if (lastMentalState !== mentalState || AVATAR_MSG.innerHTML === '대기 중...') {
    lastMentalState = mentalState;
    const randomMsg = faceData.dialogue[Math.floor(Math.random() * faceData.dialogue.length)];
    AVATAR_MSG.innerHTML = `"${randomMsg}" <br><span style="opacity:0.7; font-size:10px; font-weight:bold; color:${faceData.color};">[${mentalState}]</span>`;
  } else {
    // 상태는 그대로지만 화면 갱신 시
    if (AVATAR_MSG.innerHTML.includes('<br>')) {
      const topMsg = AVATAR_MSG.innerHTML.split('<br>')[0];
      AVATAR_MSG.innerHTML = `${topMsg}<br><span style="opacity:0.7; font-size:10px; font-weight:bold; color:${faceData.color};">[${mentalState}]</span>`;
    }
  }

  AVATAR_ASCII.textContent = faceData.art.join('\n');
  AVATAR_ASCII.style.color = faceData.color;
  AVATAR_ASCII.style.textShadow = `0 0 5px ${faceData.color}`;

  // MADNESS 캡처 트리거 (1회 한정)
  if (mentalState === 'MADNESS' && !G.flags.madness_captured) {
    G.flags.madness_captured = true;
    // UI 업데이트가 완료된 후 실행되도록 지연
    setTimeout(() => {
      const CHOICES = document.getElementById('choices');
      if (CHOICES && typeof print !== 'undefined') {
        print(`[당신의 시야가 일그러집니다. 이 순간을 기록하시겠습니까?]`, 'danger').then(() => {
          const btn = document.createElement('div');
          btn.className = 'choice-btn';
          btn.innerHTML = '📷 스크린샷 저장';
          btn.style.borderColor = '#c02020';
          btn.style.color = '#ff6060';
          btn.onclick = () => {
            if (typeof exportScreenshot === 'function') {
              exportScreenshot("다 보여... 다 들려...");
            }
            btn.remove();
          };
          CHOICES.appendChild(btn);
        });
      }
    }, 1500);
  }
}

function updateStats() {
  if (ST_HP) ST_HP.textContent = Math.max(0, G.health);
  if (ST_SP) ST_SP.textContent = Math.max(0, G.sanity);
  if (ST_INF) ST_INF.textContent = Math.max(0, Math.min(100, G.infection));
  if (ST_MSN) ST_MSN.textContent = G.missionCount;
  if (ST_SCR) ST_SCR.textContent = G.score;
  if (ST_MOV) ST_MOV.textContent = G.moveCount;

  if (!lastStats._init) {
    lastStats.health = G.health;
    lastStats.sanity = G.sanity;
    lastStats.score = G.score;
    lastStats.infection = G.infection;
    lastStats._init = true;
  }

  // 수치 변화 감지 및 팝업 연출
  if (G.health !== lastStats.health) {
    const d = G.health - lastStats.health;
    showStatEffect(ST_HP, d, '骸', d > 0 ? '#80e0a8' : '#ff5050');
    lastStats.health = G.health;
  }
  if (G.sanity !== lastStats.sanity) {
    const d = G.sanity - lastStats.sanity;
    showStatEffect(ST_SP, d, '魂', d > 0 ? '#80e0a8' : '#ff5050');
    lastStats.sanity = G.sanity;
  }
  if (G.score !== lastStats.score) {
    const d = G.score - lastStats.score;
    showStatEffect(ST_SCR, d, '業', d > 0 ? '#80e0a8' : '#ff5050');
    lastStats.score = G.score;
  }
  if (G.infection !== lastStats.infection) {
    const d = G.infection - lastStats.infection;
    showStatEffect(ST_INF, d, '蝕', d > 0 ? '#ff5050' : '#80e0a8');
    lastStats.infection = G.infection;
  }

  // 프로그레스 바 너비 업데이트
  if (ST_HP_FILL) ST_HP_FILL.style.width = Math.max(0, Math.min(100, G.health)) + '%';
  if (ST_SP_FILL) ST_SP_FILL.style.width = Math.max(0, Math.min(100, G.sanity)) + '%';
  if (ST_INF_FILL) ST_INF_FILL.style.width = Math.max(0, Math.min(100, G.infection)) + '%';
  
  if (G.health === undefined) G.health = 100;

  // ────────────────────────────────
  // 전면적 호러 연출 연동 (정신력 魂 기반)
  // ────────────────────────────────
  if (window.HorrorFX) {
    const madness = (100 - G.sanity) / 100;
    window.HorrorFX.setIntensity(madness);
    
    // 피가 내리는 이펙트 비활성화 (요청 사항 반영)
    if (typeof window.HorrorFX.stopBloodDrip === 'function') {
      window.HorrorFX.stopBloodDrip();
    }
    
    // 이성이 낮을 때 가벼운 글리치만 남김
    if (G.sanity < 30 && Math.random() < 0.08) {
      window.HorrorFX.glitch(250);
    }
  }

  if (ST_HANJA && ST_HANJA_W) {
    if (G.hanjaAttempts > 0) {
      ST_HANJA_W.style.display = '';
      ST_HANJA.textContent = `${G.hanjaSuccess}/${G.hanjaAttempts}`;
    } else {
      ST_HANJA_W.style.display = 'none';
    }
  }
  
  // 옵션 패널 (단서, 이동 등)
  if (G.currentStation >= 0) {
    if (ST_MYSTERY_WRAP) {
      ST_MYSTERY_WRAP.style.display = 'inline-block';
      ST_MYSTERY_WRAP.style.cursor = 'pointer';
      ST_MYSTERY_WRAP.onclick = () => showMysteryArchive();
    }
    if (ST_MYSTERY) {
      const mysteryCount = G.mysteries ? G.mysteries.length : 0;
      ST_MYSTERY.textContent = `${mysteryCount}개`;
    }
  } else {
    if (ST_MYSTERY_WRAP) ST_MYSTERY_WRAP.style.display = 'none';
  }

  if (G.inventory && G.inventory.length > 0) {
    ST_ITM_W.style.display = '';
    ST_ITM.textContent = G.inventory.join(', ');
  } else {
    ST_ITM_W.style.display = 'none';
  }

  // 동행자 UI 업데이트
  if (ST_COMP && ST_COMP_W) {
    if (G.companions && G.companions.length > 0) {
      ST_COMP_W.style.display = '';
      ST_COMP.textContent = G.companions.map(c => c.name).join(', ');
    } else {
      ST_COMP_W.style.display = 'none';
    }
  }

  updateAvatar();
  
  if (typeof autoSave === 'function') autoSave();
}

/**
 * 생존 연대기 (Chronicle): 스탯, 단서, 전체 로그 통합 창
 */
function showSurvivalChronicle() {
  if (window.sfx && window.sfx.ui) sfx.ui();
  const overlay = document.createElement('div');
  overlay.id = 'save-modal-overlay';
  overlay.style.zIndex = '2000';
  
  let mysteryHtml = '';
  if (!G.mysteries || G.mysteries.length === 0) {
    mysteryHtml = '<div style="color:#4a6070;text-align:center;padding:10px;font-size:12px">아직 확보된 단서가 없습니다.</div>';
  } else {
    G.mysteries.forEach(id => {
      const key = id.replace('clue_', '');
      const text = window.MYSTERY_DATA ? (window.MYSTERY_DATA[key] || '해독할 수 없는 파편입니다.') : '데이터 로드 실패';
      mysteryHtml += `
        <div class="mystery-item" style="border-left:2px solid #80e0a8;padding:6px 10px;margin-bottom:8px;background:rgba(128,224,168,0.05);border-radius:0 4px 4px 0">
          <div style="font-size:10px;color:#80e0a8;margin-bottom:2px">🔍 STATION.${key}</div>
          <div style="font-size:12px;color:#c8e8f8;line-height:1.4">${text}</div>
        </div>
      `;
    });
  }

  // 전체 로그 복제 (Train Log)
  const trainLog = document.getElementById('train-log');
  let logHtml = '기록된 로그가 없습니다.';
  if (trainLog) {
    // 로그가 너무 많을 경우를 대비해 복제본 생성 후 스타일 조정
    logHtml = trainLog.innerHTML;
  }

  const mysteryMax = window.MYSTERY_DATA ? Object.keys(window.MYSTERY_DATA).length : 37;
  const mysteryCount = G.mysteries ? G.mysteries.length : 0;
  const mysteryRate = Math.floor((mysteryCount / mysteryMax) * 100);

  overlay.innerHTML = `
    <div id="save-modal" style="max-width:500px;width:95%;border-top:2px solid #80e0a8;height:85vh;display:flex;flex-direction:column;max-height:800px">
      <div id="save-modal-header">
        <span>📜 생존 연대기 (Survival Chronicle)</span>
        <button id="archive-close">✕</button>
      </div>

      <div style="background:#0a1015;padding:12px;border-bottom:1px solid #1e3040;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
        <div style="border:1px solid #1a3040;padding:6px;border-radius:4px;text-align:center">
          <div style="font-size:9px;color:#5a8090">業(업)</div>
          <div style="font-size:16px;color:#80e0a8;font-weight:700">${G.score}</div>
        </div>
        <div style="border:1px solid #1a3040;padding:6px;border-radius:4px;text-align:center">
          <div style="font-size:9px;color:#5a8090">단서</div>
          <div style="font-size:16px;color:#c8e8f8;font-weight:700">${mysteryCount}/${mysteryMax}</div>
        </div>
        <div style="border:1px solid #1a3040;padding:6px;border-radius:4px;text-align:center">
          <div style="font-size:9px;color:#5a8090">해독</div>
          <div style="font-size:16px;color:#80e0a8">${G.hanjaSuccess}</div>
        </div>
        <div style="border:1px solid #1a3040;padding:6px;border-radius:4px;text-align:center">
          <div style="font-size:9px;color:#5a8090">이동</div>
          <div style="font-size:16px;color:#c8e8f8">${G.moveCount}역</div>
        </div>
      </div>

      <div style="flex:1;overflow-y:auto;padding:15px;background:#070b0e" class="chronicle-scroll">
        <div style="font-size:11px;color:#c05020;margin-bottom:10px;border-bottom:1px dashed #302010;padding-bottom:4px;letter-spacing:1px">🔍 COLLECTED MYSTERIES</div>
        ${mysteryHtml}
        
        <div style="font-size:11px;color:#5a8090;margin:25px 0 10px;border-bottom:1px dashed #1a3040;padding-bottom:4px;letter-spacing:1px">📋 SURVIVAL LOGS (최근순)</div>
        <div style="font-family:'Courier New',monospace;font-size:11px;line-height:1.6;color:#4a6070">
          ${logHtml}
        </div>
      </div>

      <div style="padding:10px;text-align:center;border-top:1px solid #1e3040;background:#0a1015">
        <button class="save-load-btn" id="archive-close-btn" style="width:100%;height:44px">기록창 닫기</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('show'));

  const dismiss = () => {
    overlay.classList.remove('show');
    setTimeout(() => { overlay.remove(); if (window.sfx && window.sfx.ui) sfx.ui(); }, 400);
  };
  document.getElementById('archive-close').onclick = dismiss;
  document.getElementById('archive-close-btn').onclick = dismiss;
  overlay.onclick = (e) => { if (e.target === overlay) dismiss(); };
}

// 기존 함수명 매핑 (호환성 유지)
function showMysteryArchive() {
  showSurvivalChronicle();
}

async function modifyStat(type, amount, skipCheck = false) {
  if (type === 'health') {
    G.health = Math.max(0, Math.min(100, G.health + amount));
    if (amount < 0) await print(`[-${Math.abs(amount)} 체력 감소]`, 'death', 100);
    else if (amount > 0) await print(`[+${amount} 체력 회복]`, 'life', 100);
  } else if (type === 'sanity') {
    G.sanity = Math.max(0, Math.min(100, G.sanity + amount));
    if (amount < 0) await print(`[-${Math.abs(amount)} 정신력 감소]`, 'death', 100);
    else if (amount > 0) await print(`[+${amount} 정신력 회복]`, 'life', 100);

    // 트리거 #3: 공포 한계점 컷인 (정신력이 낮을 때 더 자주 발생)
    if (typeof showEventImage === 'function') {
      let lucky = false;
      if (G.sanity <= 40) {
        lucky = (Math.random() < 0.45); // 40 이하: 45% 고확률
      } else if (G.sanity <= 70) {
        lucky = (Math.random() < 0.15); // 70 이하: 15% 확률로 스쳐감
      }

      if (lucky) {
        G.flags.low_sanity_img = true;
        let fImg = 'images/chracter/fear_girl.png';
        const rnd = Math.random();
        if (rnd < 0.25) fImg = 'images/chracter/mad_girl.png';
        else if (rnd < 0.5) fImg = 'images/chracter/fear_boy.png';
        else if (rnd < 0.75) fImg = 'images/chracter/anxious_girl.png';
        await showEventImage(fImg, '정신이 아득해진다...', 1200, { sound: 'glitch', styleClass: 'style-fear' });
      }
    }
  } else if (type === 'infection') {
    G.infection = Math.max(0, Math.min(100, G.infection + amount));
    if (amount > 0) await print(`[+${amount}% 감염도 증가]`, 'death', 100);
    else if (amount < 0) await print(`[-${Math.abs(amount)}% 감염도 감소]`, 'life', 100);
  }
  updateStats();
  updateAvatar();
  
  if (!skipCheck) {
    await checkGameOver();
  }
}

async function checkGameOver() {
  if (G.health <= 0 || G.sanity <= 0 || G.infection >= 100) {
    if (typeof sceneGameOver === 'function') {
      await sceneGameOver();
    }
  }
}

// ────────────────────────────────
//  ⚡ 빨리보기
// ────────────────────────────────
let skipMode = false;
let fastMode = false; // 기본값은 공포 분위기를 위해 느린 진행(false)으로 설정
let printQueue = [];
let skipResolvers = [];
let isTyping = false;

function flushPending() {
  printQueue.forEach(t => clearTimeout(t));
  printQueue = [];
  const rs = skipResolvers.slice();
  skipResolvers = [];
  rs.forEach(fn => fn());
}

function toggleFast() {
  fastMode = !fastMode;
  FAST_BTN.textContent = fastMode ? '⚡ 빨리보기 ON' : '⚡ 빨리보기';
  FAST_BTN.classList.toggle('active', fastMode);
  if (fastMode) { skipMode = true; flushPending(); }
  sfx.ui();
}
FAST_BTN.addEventListener('click', toggleFast);

// ────────────────────────────────
//  🌙 테마 토글 (다크 ↔ 라이트)
// ────────────────────────────────
const THEME_BTN = document.getElementById('theme-btn');

function _applyTheme(isLight) {
  if (isLight) {
    document.documentElement.classList.add('theme-light');
    THEME_BTN.textContent = '☀️';
    THEME_BTN.title = '다크 테마로 전환';
    // 라이트 테마일 때 theme-color 메타 업데이트
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.content = '#f0ece4';
  } else {
    document.documentElement.classList.remove('theme-light');
    THEME_BTN.textContent = '🌙';
    THEME_BTN.title = '라이트 테마로 전환';
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.content = '#070b0e';
  }
}

function toggleTheme() {
  const isLight = !document.documentElement.classList.contains('theme-light');
  _applyTheme(isLight);
  try { localStorage.setItem('line6_theme', isLight ? 'light' : 'dark'); } catch(e) {}
  sfx.ui && sfx.ui();
}

// 기본값을 라이트 테마로 설정
(function() {
  try {
    const saved = localStorage.getItem('line6_theme');
    if (saved === 'dark') {
      _applyTheme(false);
    } else {
      _applyTheme(true); // Default
    }
  } catch(e) {
    _applyTheme(true);
  }
})();

THEME_BTN.addEventListener('click', toggleTheme);

// ────────────────────────────────
//  ⛶ 전체화면
// ────────────────────────────────
function isFS() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
}
function toggleFS() {
  if (!isFS()) {
    const el = document.documentElement;
    (el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen).call(el);
  } else {
    (document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen).call(document);
  }
}
function updateFsIcon() {
  FS_BTN.textContent = isFS() ? '✕' : '⛶';
  FS_BTN.title       = isFS() ? '전체화면 해제 (ESC)' : '전체화면';
  FS_BTN.classList.toggle('active', isFS());
}
FS_BTN.addEventListener('click', toggleFS);
document.addEventListener('fullscreenchange',       updateFsIcon);
document.addEventListener('webkitfullscreenchange', updateFsIcon);
document.addEventListener('mozfullscreenchange',    updateFsIcon);

// ────────────────────────────────
//  🔊 Web Audio 사운드 엔진
// ────────────────────────────────
let audioCtx  = null;
let soundOn   = true;   // ← 기본값: 사운드 ON
let tickCount = 0;

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

// 초기 버튼 상태를 ON으로 설정
if (SOUND_BTN) {
  SOUND_BTN.onclick = () => {
    const isMuted = SOUND_BTN.classList.toggle('muted');
    SOUND_BTN.innerHTML = isMuted ? '🔇 MUTE' : '🔊 SOUND';
    if (window.AudioHorror) window.AudioHorror.setMute(isMuted);
    // 기존 sfx 무음 처리 (구현되어 있다면)
    if (window.sfx) sfx.setMute(isMuted); 
  };
}
// 첫 번째 사용자 인터랙션에서 AudioContext 활성화
function _unlockAudio() {
  if (soundOn) getCtx();
  document.removeEventListener('click',   _unlockAudio);
  document.removeEventListener('keydown', _unlockAudio);
  document.removeEventListener('touchend', _unlockAudio);
}
document.addEventListener('click',    _unlockAudio, { once: true });
document.addEventListener('keydown',  _unlockAudio, { once: true });
document.addEventListener('touchend', _unlockAudio, { once: true });

SOUND_BTN.addEventListener('click', () => {
  soundOn = !soundOn;
  SOUND_BTN.textContent = soundOn ? '🔊' : '🔇';
  SOUND_BTN.title       = soundOn ? '사운드 끄기' : '사운드 켜기';
  SOUND_BTN.classList.toggle('active', soundOn);
  SOUND_BTN.classList.add('flash');
  setTimeout(() => SOUND_BTN.classList.remove('flash'), 80);
  if (soundOn) { getCtx(); sfx.ding(0.15); }
});

const sfx = {
  _audioElements: {},

  playFile(filename, vol = 1.0, loop = false) {
    if (!soundOn) return null;
    try {
      const a = new Audio('audio/' + filename);
      a.volume = vol;
      a.loop = loop;
      a.play().catch(e => console.warn('Audio File Play Blocked:', e));
      return a;
    } catch(e) { return null; }
  },

  tick(vol = 0.3) {
    if (!soundOn) return;
    tickCount++;
    if (tickCount % 2 !== 0) return;

    if (!this._audioElements['typing']) {
      this._audioElements['typing'] = new Audio('audio/typing.wav');
      this._audioElements['typing'].volume = vol;
    }
    const a = this._audioElements['typing'];
    // Restart audio block to allow rapid repeated playing
    if (a.readyState >= 2) {
      a.currentTime = 0;
      a.play().catch(e=>{});
    }
  },

  /* подзем카 출발/도착 차임 */
  chime(vol = 0.5) { return this.playFile('station_chime.mp3', vol); },

  /* 문 열림/닫힘 */
  door(open = true, vol = 0.6) { return this.playFile('subway_doors.mp3', vol); },

  /* 지하철 주행 소음 (루프) */
  startRumble(vol = 0.3) {
    this.stopRumble();
    if (!soundOn) return;
    this._audioElements['ride'] = this.playFile('subway_ride.mp3', vol, true);
  },
  stopRumble() {
    const a = this._audioElements['ride'];
    if (a) {
      a.pause();
      a.currentTime = 0;
      this._audioElements['ride'] = null;
    }
  },

  /* 추가 효과음 */
  glitch(vol = 0.6) { return this.playFile('glitch.wav', vol); },
  heartbeat(vol = 0.8) { return this.playFile('heartbeat.wav', vol); },

  /* ★ 지하철 이동 투둥투둥 사운드
   * "투" = 높은 충격 노이즈 + 오실레이터 피치다운
   * "둥" = 낮은 공명음 (바닥이 울리는 느낌)
   * 필터 없이 직접 출력해서 확실하게 들리게
   */
  tudung(duration = 3.5, vol = 0.35) {
    if (!soundOn) return;
    try {
      const c  = getCtx();
      const t0 = c.currentTime;

      // ── ① 저주파 차체 진동 ──
      const baseOsc  = c.createOscillator();
      const baseGain = c.createGain();
      baseOsc.type = 'sawtooth';
      baseOsc.frequency.setValueAtTime(55, t0);
      baseOsc.frequency.linearRampToValueAtTime(60, t0 + duration * 0.5);
      baseOsc.frequency.linearRampToValueAtTime(50, t0 + duration);
      const baseLp = c.createBiquadFilter();
      baseLp.type = 'lowpass'; baseLp.frequency.value = 200;
      baseGain.gain.setValueAtTime(0, t0);
      baseGain.gain.linearRampToValueAtTime(vol * 0.28, t0 + 0.3);
      baseGain.gain.setValueAtTime(vol * 0.28, t0 + duration - 0.4);
      baseGain.gain.linearRampToValueAtTime(0, t0 + duration);
      baseOsc.connect(baseLp); baseLp.connect(baseGain); baseGain.connect(c.destination);
      baseOsc.start(t0); baseOsc.stop(t0 + duration + 0.1);

      // ── ② 투둥 충격음 — 필터 없이 직접 출력 ──
      // "투" : 짧고 강한 노이즈 버스트 (고음)
      // "둥" : 오실레이터가 빠르게 피치 강하 (저음 통)
      const interval = 0.38; // 투둥 한 세트 간격

      for (let t = 0.2; t < duration - 0.15; t += interval) {
        const fadeVol = t < 0.4 ? (t / 0.4)
                      : t > duration - 0.45 ? ((duration - t) / 0.45)
                      : 1.0;
        const v = vol * fadeVol;

        // — "투" : 노이즈 타격음 —
        const tuLen = Math.floor(c.sampleRate * 0.045);
        const tuBuf = c.createBuffer(1, tuLen, c.sampleRate);
        const tuData = tuBuf.getChannelData(0);
        for (let i = 0; i < tuLen; i++) {
          tuData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / tuLen, 2.0);
        }
        const tuSrc  = c.createBufferSource(); tuSrc.buffer = tuBuf;
        const tuGain = c.createGain();
        tuGain.gain.setValueAtTime(v * 1.1, t0 + t);
        tuGain.gain.exponentialRampToValueAtTime(0.0001, t0 + t + 0.045);
        tuSrc.connect(tuGain); tuGain.connect(c.destination);
        tuSrc.start(t0 + t);

        // — "둥" : 오실레이터 피치 강하 (울리는 공명) —
        const dungTime = t + 0.11;
        const dungOsc  = c.createOscillator();
        const dungGain = c.createGain();
        dungOsc.type = 'sine';
        dungOsc.frequency.setValueAtTime(180, t0 + dungTime);
        dungOsc.frequency.exponentialRampToValueAtTime(55, t0 + dungTime + 0.18);
        dungGain.gain.setValueAtTime(v * 1.3, t0 + dungTime);
        dungGain.gain.exponentialRampToValueAtTime(0.0001, t0 + dungTime + 0.22);
        dungOsc.connect(dungGain); dungGain.connect(c.destination);
        dungOsc.start(t0 + dungTime);
        dungOsc.stop(t0 + dungTime + 0.25);
      }

      // ── ③ 레일 마찰 노이즈 (중주파 — PC 스피커에도 잘 들림) ──
      const noiseLen  = Math.floor(c.sampleRate * duration);
      const noiseBuf  = c.createBuffer(1, noiseLen, c.sampleRate);
      const noiseData = noiseBuf.getChannelData(0);
      for (let i = 0; i < noiseLen; i++) noiseData[i] = Math.random() * 2 - 1;
      const noiseSrc  = c.createBufferSource(); noiseSrc.buffer = noiseBuf;
      // 2000Hz 대역통과 — PC 스피커에서 확실히 들림
      const nbp = c.createBiquadFilter();
      nbp.type = 'bandpass'; nbp.frequency.value = 1800; nbp.Q.value = 0.6;
      const noiseGain = c.createGain();
      noiseGain.gain.setValueAtTime(0, t0);
      noiseGain.gain.linearRampToValueAtTime(vol * 0.18, t0 + 0.4);
      noiseGain.gain.setValueAtTime(vol * 0.18, t0 + duration - 0.4);
      noiseGain.gain.linearRampToValueAtTime(0, t0 + duration);
      noiseSrc.connect(nbp); nbp.connect(noiseGain); noiseGain.connect(c.destination);
      noiseSrc.start(t0); noiseSrc.stop(t0 + duration + 0.1);

    } catch(e) { console.warn('tudung error:', e); }
  },



  /* 경보/위험 */
  alarm(vol = 0.2) {
    if (!soundOn) return;
    try {
      const c = getCtx(), now = c.currentTime;
      [0, 0.22, 0.44].forEach(st => {
        const o = c.createOscillator(); o.type = 'square';
        o.frequency.setValueAtTime(880, now + st);
        o.frequency.linearRampToValueAtTime(660, now + st + 0.2);
        const g = c.createGain();
        g.gain.setValueAtTime(vol, now+st); g.gain.linearRampToValueAtTime(0, now+st+0.22);
        o.connect(g); g.connect(c.destination); o.start(now+st); o.stop(now+st+0.23);
      });
    } catch(e) {}
  },

  /* 아이템 획득 */
  item(vol = 0.15) {
    if (!soundOn) return;
    try {
      const c = getCtx(), now = c.currentTime;
      [[880,0],[1100,0.08],[1320,0.16],[1760,0.24]].forEach(([freq,st]) => {
        const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = freq;
        const g = c.createGain();
        g.gain.setValueAtTime(0, now+st);
        g.gain.linearRampToValueAtTime(vol, now+st+0.01);
        g.gain.exponentialRampToValueAtTime(0.001, now+st+0.5);
        o.connect(g); g.connect(c.destination); o.start(now+st); o.stop(now+st+0.55);
      });
    } catch(e) {}
  },

  /* 모뎀/전광판 */
  modem(vol = 0.07) {
    if (!soundOn) return;
    try {
      const c = getCtx(), now = c.currentTime;
      [[1100,0,0.06],[1700,0.07,0.06],[850,0.14,0.05],[1400,0.19,0.06]].forEach(([freq,st,dur]) => {
        const o = c.createOscillator(), g = c.createGain();
        o.type = 'square'; o.frequency.value = freq;
        g.gain.setValueAtTime(0, now+st);
        g.gain.linearRampToValueAtTime(vol, now+st+0.006);
        g.gain.linearRampToValueAtTime(0, now+st+dur);
        o.connect(g); g.connect(c.destination); o.start(now+st); o.stop(now+st+dur+0.01);
      });
    } catch(e) {}
  },

  /* UI 클릭 */
  ui(vol = 0.05) {
    if (!soundOn) return;
    try {
      const c = getCtx(), now = c.currentTime;
      const o = c.createOscillator(); o.type = 'square';
      o.frequency.setValueAtTime(380, now); o.frequency.linearRampToValueAtTime(460, now+0.04);
      const g = c.createGain(); g.gain.setValueAtTime(vol,now); g.gain.linearRampToValueAtTime(0,now+0.06);
      o.connect(g); g.connect(c.destination); o.start(now); o.stop(now+0.07);
    } catch(e) {}
  },

  /* 딩 (사운드 ON 확인) */
  ding(vol = 0.18) {
    if (!soundOn) return;
    try {
      const c = getCtx(), now = c.currentTime;
      [[880,0],[1320,0.07],[1760,0.13]].forEach(([freq,delay]) => {
        const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = freq;
        const g = c.createGain();
        g.gain.setValueAtTime(0, now+delay);
        g.gain.linearRampToValueAtTime(vol*(1-delay*1.5), now+delay+0.012);
        g.gain.exponentialRampToValueAtTime(0.001, now+delay+1.3);
        o.connect(g); g.connect(c.destination); o.start(now+delay); o.stop(now+delay+1.4);
      });
    } catch(e) {}
  },

  /* 충격/폭발 */
  boom(vol = 0.22) {
    if (!soundOn) return;
    try {
      const c = getCtx(), now = c.currentTime, dur = 0.45;
      const osc = c.createOscillator(); osc.type = 'sine';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(20, now+dur);
      const g = c.createGain(); g.gain.setValueAtTime(vol,now); g.gain.exponentialRampToValueAtTime(0.001,now+dur);
      osc.connect(g); g.connect(c.destination); osc.start(now); osc.stop(now+dur);
    } catch(e) {}
  },
};

// ────────────────────────────────
//  텍스트 출력 엔진
// ────────────────────────────────
function clearUI() {
  // 이전 텍스트들을 혈창(train-log)에 요약/백업하여 다시 볼 수 있게 처리 (요청 사항 반영)
  if (OUT.innerHTML.trim() !== '') {
    const trainLog = document.getElementById('train-log');
    if (trainLog) {
      const arch = document.createElement('div');
      arch.innerHTML = OUT.innerHTML;
      arch.style.borderTop = "1px dashed #1e3040";
      arch.style.margin = "12px 0 4px";
      arch.style.paddingTop = "8px";
      arch.style.opacity = "0.6";
      arch.style.fontSize = "12px";
      
      // 지나간 로그는 애니메이션 제거
      arch.querySelectorAll('.line').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.animation = 'none';
        el.style.marginBottom = '2px';
      });
      arch.querySelectorAll('.ascii-wrap').forEach(el => {
        el.style.fontSize = '9px';
        el.style.lineHeight = '1';
      });

      trainLog.appendChild(arch);
      trainLog.scrollTop = trainLog.scrollHeight;
      
      // 모바일 로그 뱃지 업데이트 (새로운 로그가 쌓였음을 알림)
      const badgeLog = document.getElementById('badge-log');
      if (badgeLog && window.getComputedStyle(document.getElementById('train-panel')).display === 'none') {
        badgeLog.classList.add('show');
      }
    }
  }

  OUT.innerHTML     = '';
  CHOICES.innerHTML = '';
  NAME_AREA.classList.remove('active');
  skipMode = false;
  printQueue.forEach(t => clearTimeout(t));
  printQueue = [];
  skipResolvers = [];
  SKIP_BTN.classList.remove('visible');
}

function scrollBottom() {
  // 모바일: game 패널이 숨겨져 있으면 window 기준 스크롤
  const gameEl = document.getElementById('game');
  if (gameEl && !gameEl.classList.contains('tab-hidden')) {
    gameEl.scrollTo({ top: gameEl.scrollHeight, behavior: 'smooth' });
  }
  // window 스크롤도 같이 (데스크톱 + 모바일 공통)
  requestAnimationFrame(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  });
}

function print(html, cls = 'narrator', delay = 0) {
  return new Promise(resolve => {
    const fn = () => {
      const d = document.createElement('div');
      d.className = 'line ' + cls;
      if (cls === 'blank') d.style.height = '10px';
      
      // 아바타 메시지 연동 (내레이션이나 다이얼로그일 때)
      if (cls === 'dialog' || cls === 'narrator' || cls === 'highlight' || cls === 'danger') {
        const plainText = html.replace(/<[^>]+>/g, '').trim();
        if (plainText && !plainText.startsWith('[')) {
          setAvatarMessage(plainText);
        }
      }

      OUT.appendChild(d);
      requestAnimationFrame(() => d.classList.add('show'));

      const isPlain = !html.includes('<') && html.trim() !== '' && !['blank','divider','system','name'].includes(cls);
      
      if (isPlain && !skipMode && !fastMode) {
        let i = 0;
        const typeChar = () => {
          if (skipMode || fastMode || i >= html.length) {
            d.innerHTML = html;
            scrollBottom();
            resolve();
            return;
          }
          d.innerHTML += html.charAt(i);
          i++;
          if (i % 3 === 0) sfx.tick(); 
          if (i % 10 === 0) scrollBottom();
          setTimeout(typeChar, 25);
        };
        typeChar();
      } else {
        d.innerHTML = html;
        if (!['blank','divider','system','name'].includes(cls) && html.trim()) sfx.tick();
        scrollBottom();
        resolve();
      }
    };

    const isPlain = !html.includes('<') && html.trim() !== '' && !['blank','divider','system','name'].includes(cls);
    if (skipMode || fastMode || delay === 0 || isPlain) { 
      fn(); 
    } else {
      let resolved = false;
      const done = () => { if (!resolved) { resolved = true; fn(); } };
      const t = setTimeout(done, delay);
      printQueue.push(t);
      skipResolvers.push(done);
    }
  });
}

async function seq(lines) {
  if (!fastMode) SKIP_BTN.classList.add('visible');
  isTyping = true;
  for (const [html, cls, delay] of lines) {
    await print(html, cls || 'narrator', fastMode ? 0 : (delay ?? 0));
  }
  isTyping = false;
  SKIP_BTN.classList.remove('visible');
}

SKIP_BTN.onclick = () => { skipMode = true; flushPending(); };

// ────────────────────────────────
//  아스키아트 출력
// ────────────────────────────────
async function printAscii(rows, theme = '', opts = {}) {
  const { rowDelay = 80, glow = false, pulse = false, blink = false, label = '', sound = null } = opts;
  if (sound && sfx[sound]) sfx[sound]();
  else sfx.modem();

  if (label) {
    const lbl = document.createElement('div');
    lbl.className = 'line system show';
    lbl.style.marginBottom = '2px';
    lbl.textContent = label;
    OUT.appendChild(lbl);
  }

  const box  = document.createElement('div');
  box.className = 'ascii-box';
  const wrap = document.createElement('div');
  wrap.className = `ascii-wrap ${theme}${glow?' ascii-glow':''}${pulse?' ascii-pulse':''}${blink?' ascii-blink':''}`;
  box.appendChild(wrap);
  OUT.appendChild(box);
  scrollBottom();

  for (let i = 0; i < rows.length; i++) {
    const [text, extraCls = ''] = Array.isArray(rows[i]) ? rows[i] : [rows[i], ''];
    const span = document.createElement('span');
    span.className = `ascii-line ${extraCls}`;
    span.textContent = text;
    wrap.appendChild(span);

    await new Promise(res => {
      if (skipMode || fastMode) { span.classList.add('show'); res(); return; }
      let resolved = false;
      const done = () => { if (!resolved) { resolved = true; span.classList.add('show'); scrollBottom(); res(); } };
      const t = setTimeout(done, i === 0 ? 0 : rowDelay);
      printQueue.push(t);
      skipResolvers.push(done);
    });
  }
  scrollBottom();
}

// ────────────────────────────────
//  선택지 렌더링
// ────────────────────────────────
function choices(opts) {
  CHOICES.innerHTML = '';
  NAME_AREA.classList.remove('active');
  skipMode = false;
  SKIP_BTN.classList.remove('visible');
  sfx.ui();

  opts.forEach(([label, fn, style = ''], idx) => {
    const b = document.createElement('button');
    b.className = 'choice-btn' + (style ? ` ${style}` : '');
    b.innerHTML = label;
    b.style.animationDelay = `${idx * 0.08}s`;
    b.onclick = () => {
      sfx.ui();
      stopIdleMonologue();
      CHOICES.innerHTML = '';
      fn();
    };
    CHOICES.appendChild(b);
  });
  scrollBottom();
  startIdleMonologue();
}

// ────────────────────────────────
//  진행 상태 업데이트
// ────────────────────────────────
function updateProgress(stations, currentIdx) {
  if (!PROGRESS) return;
  HDR_EP.textContent = currentIdx >= 0
    ? `${stations[currentIdx].name} — ${currentIdx + 1}/${stations.length}`
    : '';

  PROGRESS.innerHTML = stations.map((st, i) => {
    const done    = i < currentIdx;
    const active  = i === currentIdx;
    const hasEv   = st.hasEvent;
    const danger  = G.stationDanger[i] || 0;
    const cls = done ? 'pdot-done' : active ? 'pdot-current' : hasEv ? 'pdot-event' : 'pdot-todo';
    const col = done ? '#703010'   : active ? '#c05020'       : hasEv ? '#c8a840'    : '#1e3040';
    // 위험 아이콘 오버레이
    const dangerIcon = danger >= 3 ? ' <span style="color:#ff4444;animation:pdanger 0.6s infinite">⚠</span>'
                     : danger === 2 ? ' <span style="color:#ffaa00">◉</span>'
                     : danger === 1 ? ' <span style="color:#888800">☆</span>'
                     : '';
    return `<div class="p-item">
      <div class="pdot ${cls}"></div>
      <span style="color:${col}">${st.name}</span>${dangerIcon}
    </div>`;
  }).join('');
}

// ────────────────────────────────
//  위험도 기록
// ────────────────────────────────
function markStationDanger(stationIdx, level = 1) {
  const current = G.stationDanger[stationIdx] || 0;
  G.stationDanger[stationIdx] = Math.min(3, Math.max(current, level));
  updateProgress(typeof STATIONS !== 'undefined' ? STATIONS : [], G.currentStation);
}

// ────────────────────────────────
//  환청/독백 타이머 (15초 대기)
// ────────────────────────────────
let _idleTimer = null;

const MONOLOGUE_LINES = {
  CALM:     ['...이 역이 어디지.', '지하에 있으면 시간이 느리게 간다.', '...조용하다.'],
  ANXIOUS:  ['왜 이렇게 진동이 심하지...', '사람들이 이상하게 나를 쳐다보는 것 같아.', '저 냄새... 어디서 나는 거지.'],
  FEAR:     ['내려야 해. 다음 역에서 내리자.', '저 사람... 눈을 안 깜빡인다.', '...뭔가 오고 있어.'],
  MADNESS:  ['39... 39... 39개 역...', '다 보여. 다 들려. 다 냄새가 나.', '기차는 멈추지 않아. 절대로.'],
};

function startIdleMonologue() {
  stopIdleMonologue();
  if (G.currentStation < 0) return; // 인트로 중엔 비활성
  _idleTimer = setTimeout(() => {
    const lines = MONOLOGUE_LINES[lastMentalState] || MONOLOGUE_LINES.CALM;
    const msg = lines[Math.floor(Math.random() * lines.length)];
    setAvatarMessage(msg);
    // 아바타 깜빡임 효과
    if (AVATAR_WRAP) {
      AVATAR_WRAP.style.boxShadow = `0 0 20px ${getFaceByMentalState(lastMentalState).color}`;
      setTimeout(() => {
        if (AVATAR_WRAP) AVATAR_WRAP.style.boxShadow = '';
      }, 800);
    }
    // 공포/광기 상태면 15초 뒤 다시
    if (lastMentalState === 'FEAR' || lastMentalState === 'MADNESS') {
      startIdleMonologue();
    }
  }, 15000);
}

function stopIdleMonologue() {
  if (_idleTimer) { clearTimeout(_idleTimer); _idleTimer = null; }
}

// ────────────────────────────────
//  시간 제한 선택지
// ────────────────────────────────
function timedChoices(opts, seconds = 10) {
  return new Promise(resolve => {
    stopIdleMonologue();
    CHOICES.innerHTML = '';
    NAME_AREA.classList.remove('active');
    skipMode = false;
    SKIP_BTN.classList.remove('visible');
    sfx.alarm();

    // 타이머 바 컨테이너
    const timerWrap = document.createElement('div');
    timerWrap.style.cssText = 'margin-bottom:8px; padding:4px 10px; background:#0a1a10; border:1px solid #304030; border-radius:3px;';
    const timerLabel = document.createElement('div');
    timerLabel.style.cssText = 'font-size:10px; color:#88a880; font-family:Courier New,monospace; margin-bottom:4px;';
    timerLabel.textContent = `⏱ 남은 시간: ${seconds}초`;
    const timerBar = document.createElement('div');
    timerBar.style.cssText = `height:6px; background:#44bb44; border-radius:2px; transition:width 1s linear; width:100%;`;
    timerWrap.appendChild(timerLabel);
    timerWrap.appendChild(timerBar);
    CHOICES.appendChild(timerWrap);

    let remaining = seconds;
    const tick = setInterval(() => {
      remaining--;
      timerLabel.textContent = `⏱ 남은 시간: ${remaining}초`;
      const pct = (remaining / seconds) * 100;
      timerBar.style.width = pct + '%';
      timerBar.style.background = remaining <= 3 ? '#ff4444' : remaining <= 5 ? '#ffaa00' : '#44bb44';
      if (remaining <= 0) {
        clearInterval(tick);
        CHOICES.innerHTML = '';
        // 시간초과 — 아무것도 하지 않음 처리
        const defaultOpt = opts.find(o => o[2] === 'default') || opts[opts.length - 1];
        resolve(defaultOpt[1]());
      }
    }, 1000);

    // 선택지 버튼
    opts.forEach(([label, fn, style = ''], idx) => {
      const b = document.createElement('button');
      b.className = 'choice-btn' + (style ? ` ${style}` : '');
      b.innerHTML = label;
      b.style.animationDelay = `${idx * 0.08}s`;
      b.onclick = () => {
        clearInterval(tick);
        sfx.ui();
        CHOICES.innerHTML = '';
        resolve(fn());
      };
      CHOICES.appendChild(b);
    });
    scrollBottom();
  });
}

// ──────────────────────────────────────────
//  스토리 생성기
// ──────────────────────────────────────────
function generateMyStory() {
  const pName = G.playerName || '승객';
  const jobStr = G.playerJob || '승객';
  const tod = G.timeOfDay || 'noon';
  
  let tStr = '어느 시간';
  if(tod === 'dawn') tStr = '새벽 첫차';
  if(tod === 'morning') tStr = '아침 출근길';
  if(tod === 'noon') tStr = '한낮';
  if(tod === 'evening') tStr = '저녁 퇴근길';
  if(tod === 'night') tStr = '심야 막차';

  const startName = G.startStation >= 0 && typeof STATIONS !== 'undefined' ? STATIONS[G.startStation].name : '어느 역';
  const endName = G.endStation >= 0 && typeof STATIONS !== 'undefined' ? STATIONS[G.endStation].name : '어딘가';

  let s = `${tStr}, ${jobStr} ${pName}은(는) ${startName}역에서 열차에 올랐다.\n`;
  
  if (typeof hasItem === 'function' && hasItem('수상한 메모지')) {
    s += `발 밑에 떨어진 조각. "봉화산에서 내리지 마세요."\n불안감을 외면한 채 그는 메모지를 챙겼다.\n`;
  }
  
  if (G.flags.entered_car7) {
    s += `7호차로 이동했을 때 이미 뭔가 이상하다는 걸 깨달았다.\n정신이 조금씩 흔들렸다.\n`;
  }
  
  if (G.flags.ignored_man) {
    s += `어느 역을 지날 때 쓰러진 남자를 보았지만, 두려움에 못 본 척 외면했다.\n`;
  } else if (G.flags.helped_man) {
    s += `쓰러진 남자를 보고 망설임 없이 다가가 구했다.\n`;
  }

  if (G.flags.ignored_child) {
    s += `객차에서 우는 아이를 무시하며 오직 자신의 생존만을 생각했다.\n`;
  } else if (G.flags.helped_child) {
    s += `객차 구석에서 우는 아이를 달래며 한 줄기 인간성을 지켰다.\n`;
  }

  s += `\n결국 ${endName}역에 닿았다.`;
  if (lastMentalState === 'MADNESS') {
    s += `\n하지만 이미 그의 정신은 무너져 내린 뒤였다.`;
  } else if (lastMentalState === 'FEAR') {
    s += `\n극동의 공포가 그의 숨통을 조이고 있었다.`;
  }

  return s;
}

// ──────────────────────────────────────────
//  결과 이미지 공유 (캡처) 함수
// ──────────────────────────────────────────
window.exportScreenshot = async function(customQuote) {
  if (typeof html2canvas === 'undefined') {
    alert('모듈을 불러오는 중입니다. 잠시 후 시도해주세요.');
    return;
  }
  const wrap = document.getElementById('share-card-wrap');
  const content = document.getElementById('share-card-content');
  if (!wrap || !content) return;

  const faceData = getFaceByMentalState(lastMentalState || 'CALM');
  const statColor = faceData.color;
  const stateStr = `<span style="color:${statColor};">${lastMentalState || 'CALM'} 👁</span>`;

  let quote = customQuote;
  if (!quote) quote = faceData.dialogue[Math.floor(Math.random() * faceData.dialogue.length)];

  const storyStr = generateMyStory().replace(/\n/g, '\n│  ');

  const html = 
`┌────────────────────────────────────────┐
│  SEOUL METRO LINE 6                    │
│  ── SURVIVAL RECORD ──                 │
│                                        │
│  [ 당신의 오늘 이야기 ]                │
│                                        │
│  ${storyStr}
│                                        │
│  ──────────────────────────────────────│
│  최종 상태: ${stateStr}
│  정신력: ${Math.max(0, G.sanity)} / 체력: ${Math.max(0, G.health)}
│  해결한 사건: ${G.missionCount}
│  ──────────────────────────────────────│
│                                        │
│  "${quote}"
│                                        │
│  line6.vercel.app                      │
└────────────────────────────────────────┘`;

  content.innerHTML = html;

  try {
    const canvas = await html2canvas(wrap, { backgroundColor: '#040a10', scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    // 브라우저가 data: 스킴에서 파일명 지정을 무시하고 긴 난수로 저장하는 현상(로컬 환경) 방지
    canvas.toBlob((blob) => {
      if (!blob) return;
      const ts = new Date().toISOString().replace(/[:T-]/g, '').slice(0, 14);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `line6_record_${ts}.png`;
      link.href = url;
      
      // FF 등 기타 환경 호환성 위해 body에 잠시 추가 후 클릭
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/png');
    
    // 로그에 시각적 피드백
    if (typeof TrainPanel !== 'undefined') {
       TrainPanel.addLog('📷 스크린샷 캡처 완료', 'info');
    }

    // 결과 모달창 띄워주기 (직접 우클릭 저장 가능하도록 지원)
    showCaptureResultModal(imgData);

  } catch (err) {
    console.error('Screenshot failed:', err);
    alert('스크린샷 저장에 실패했습니다.');
  }
};

function showCaptureResultModal(imgData) {
  const overlay = document.createElement('div');
  overlay.id = 'capture-modal-overlay';
  overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:9999; display:flex; justify-content:center; align-items:center; flex-direction:column; gap:15px; opacity:0; transition:opacity 0.3s;';
  
  const imgBox = document.createElement('img');
  imgBox.src = imgData;
  imgBox.style.cssText = 'max-width:90%; max-height:70vh; border:2px solid #5a9a8a; border-radius:5px; box-shadow:0 0 20px #5a9a8a50; object-fit:contain;';

  const desc = document.createElement('div');
  desc.innerHTML = '✅ <b>스크린샷 생성 완료!</b><br><span style="font-size:12px;color:#80c0a0;margin-top:5px;display:block;">(다운로드가 차단된 경우 기기에서 이미지를 길게 누르거나 속성을 통해 직접 저장하세요)</span>';
  desc.style.cssText = 'color:#fff; text-align:center; line-height:1.4; font-family:"Noto Sans KR", sans-serif;';

  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '닫기';
  closeBtn.className = 'end-btn';
  closeBtn.style.cssText = 'padding:10px 30px; margin-top:10px; font-size:14px;';
  closeBtn.onclick = () => {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 300);
    if (typeof sfx !== 'undefined' && sfx.ui) sfx.ui();
  };

  overlay.onclick = (e) => { if (e.target === overlay) closeBtn.onclick(); };

  overlay.appendChild(desc);
  overlay.appendChild(imgBox);
  overlay.appendChild(closeBtn);
  document.body.appendChild(overlay);

  // fade-in
  setTimeout(() => overlay.style.opacity = '1', 10);
  if (typeof sfx !== 'undefined' && sfx.ding) sfx.ding(0.5);
}

// ──────────────────────────────────────────
// 이벤트 컷인 이미지 오버레이 연출
// ──────────────────────────────────────────
function showEventImage(src, text = '', duration = 1600, options = {}) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'event-image-overlay';
    if (options.styleClass) overlay.classList.add(options.styleClass);

    const img = document.createElement('img');
    img.src = src;
    img.className = 'event-image';

    overlay.appendChild(img);

    if (text) {
      const caption = document.createElement('div');
      caption.className = 'event-image-caption';
      caption.innerHTML = text;
      overlay.appendChild(caption);
    }

    const hint = document.createElement('div');
    hint.className = 'hint-text';
    hint.innerHTML = '― TAP TO CONTINUE ―';
    overlay.appendChild(hint);

    document.body.appendChild(overlay);

    if (options.sound && sfx[options.sound]) sfx[options.sound](options.volume || 1.0);

    // Fade-in trigger
    requestAnimationFrame(() => {
      // Force repaint
      void overlay.offsetWidth;
      overlay.classList.add('show');
    });

    const dismiss = () => {
      overlay.classList.remove('show');
      setTimeout(() => {
        overlay.remove();
        resolve();
      }, 400);
      if (typeof sfx !== 'undefined' && sfx.ui) sfx.ui();
    };

    overlay.onclick = dismiss;
  });
}
