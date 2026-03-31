/* ═══════════════════════════════════════════════════
   engine/combat.js
   실시간 긴급 대응 프로토콜 (Integrated UI Version)
   별도 오버레이 없이 대화창과 선택지 창에서 직접 작동
   ═══════════════════════════════════════════════════ */

'use strict';

const CombatEngine = (() => {

  /**
   * 실시간 조우 시작 (대화형 통합 버전)
   * @param {Object} data { name, hp, atk, speed, img, desc }
   * @returns {Promise<Boolean>}
   */
  function startBattle(data) {
    return new Promise(async (resolve) => {
      const h = {
        name: data.name || '미확인 개체',
        maxHp: data.hp || 50,
        hp: data.hp || 50,
        atk: data.atk || 10,
        speed: data.speed || 1.0,
        img: data.img || 'images/chracter/mad_girl.png',
        desc: data.desc || '위험 요소가 감지되었습니다.'
      };

      // 1. 전투 시작 연출
      await seq([
        ['', 'blank', 0],
        ['──────────────────────────────', 'divider', 0],
        [`[위험 조우: ${h.name}]`, 'danger', 100],
        [h.desc, 'narrator', 300],
      ]);

      // 2. 고정 상태 표시 패널 생성 (Output 하단에 고정 느낌으로 추가)
      const statusBox = document.createElement('div');
      statusBox.className = 'battle-status-card';
      statusBox.innerHTML = `
        <div class="atb-hp-wrap enemy">
          <div id="battle-e-hp" class="atb-hp-fill enemy" style="width:100%"></div>
          <div id="battle-e-hp-txt" class="atb-hp-text">ENEMY STABILITY: ${h.hp}%</div>
        </div>
        <div class="atb-hp-wrap player">
          <div id="battle-p-hp" class="atb-hp-fill player" style="width:${G.health}%"></div>
          <div id="battle-p-hp-txt" class="atb-hp-text">PLAYER VITALITY: ${G.health}%</div>
        </div>
        <div class="atb-gauge-wrap">
          <div id="battle-atb-fill" class="atb-gauge-fill"></div>
        </div>
      `;
      OUT.appendChild(statusBox);
      scrollBottom();

      const eHpBar = statusBox.querySelector('#battle-e-hp');
      const eHpTxt = statusBox.querySelector('#battle-e-hp-txt');
      const pHpBar = statusBox.querySelector('#battle-p-hp');
      const pHpTxt = statusBox.querySelector('#battle-p-hp-txt');
      const atbBar = statusBox.querySelector('#battle-atb-fill');

      // 3. 전투 루프 상태
      let playerAtb = 0;
      let enemyAtb = 0;
      let isBattleEnd = false;
      let isActing = false;
      let observationLevel = 0;

      const updateUI = () => {
        eHpBar.style.width = (h.hp / h.maxHp * 100) + '%';
        eHpTxt.textContent = `TARGET: ${Math.ceil(h.hp)}%`;
        pHpBar.style.width = G.health + '%';
        pHpTxt.textContent = `VITALITY: ${G.health}/100`;
        atbBar.style.width = playerAtb + '%';
      };

      const log = (msg, type) => {
        print(`> ${msg}`, type === 'danger' ? 'danger' : 'system', 0);
      };

      const cleanup = () => {
        isBattleEnd = true;
        statusBox.remove();
        CHOICES.innerHTML = '';
      };

      // 4. 선택지 렌더링 (실시간 갱신 최적화)
      const renderChoices = () => {
        if (isBattleEnd) return;
        
        // 커스텀 액션이 제공되면 그것을 사용, 없으면 기본 프로토콜 사용
        const actions = data.actions ? data.actions.map((act, i) => ({
          id: act.resolveValue,
          label: `${i+1}. ${act.label}`,
          style: act.style || ''
        })) : [
          { id: 'observe', label: '① 패턴 관찰 (Analyze)', style: '' },
          { id: 'respond', label: '② 심리 대치 (Respond)', style: '' },
          { id: 'retreat', label: '③ 강제 이탈 (Retreat)', style: 'danger' }
        ];

        if (!data.actions && G.companions && G.companions.length > 0) {
          actions.push({ id: 'companion', label: `④ ${G.companions[0].name} 요청`, style: 'highlight' });
        }

        // 버튼이 아직 없으면 생성, 있으면 텍스트만 업데이트
        const existingBtns = CHOICES.querySelectorAll('.choice-btn');
        
        if (existingBtns.length !== actions.length) {
          CHOICES.innerHTML = '';
          actions.forEach(act => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn' + (act.style ? ` ${act.style}` : '');
            btn.dataset.id = act.id;
            btn.dataset.label = act.label;
            CHOICES.appendChild(btn);
          });
        }

        const btns = CHOICES.querySelectorAll('.choice-btn');
        btns.forEach(btn => {
          const actionId = btn.dataset.id;
          const actionLabel = btn.dataset.label;

          if (playerAtb < 100) {
            btn.innerHTML = `${actionLabel} <span style="opacity:0.5; font-size:10px;">[대기 ${Math.floor(playerAtb)}%]</span>`;
            btn.style.opacity = '0.5';
            btn.disabled = true;
          } else {
            btn.innerHTML = `<strong>${actionLabel}</strong>`;
            btn.style.opacity = '1';
            btn.disabled = false;
            btn.onclick = () => {
              if (isActing) return;
              resolveAction(actionId);
            };
          }
        });
      };

      const resolveAction = async (action) => {
        isActing = true;

        // 커스텀 액션(돌발 이벤트)인 경우 선택 즉시 해당 값 반환하며 종료
        if (data.actions) {
          isBattleEnd = true;
          cleanup();
          resolve(action);
          return;
        }

        if (action === 'observe') {
          observationLevel++;
          h.speed *= 0.85;
          log('개체의 행동 패턴을 분석했습니다. (속도 저하)', 'system');
        } else if (action === 'respond') {
          const dmg = 10 + Math.random() * 10 + (observationLevel * 5);
          h.hp -= dmg;
          log(`${h.name}에게 유의미한 충격을 주었습니다.`, 'system');
        } else if (action === 'companion') {
          log(`${G.companions[0].name}이(가) 대응을 돕습니다!`, 'highlight');
          h.hp -= 15;
          playerAtb += 30;
        } else if (action === 'retreat') {
          if (Math.random() < 0.3 + (observationLevel * 0.15)) {
            log('성공적으로 위협 지역에서 이탈했습니다.', 'system');
            isBattleEnd = true;
            cleanup();
            resolve(true);
            return;
          } else {
            log('이탈에 실패했습니다! 경로가 차단되었습니다.', 'danger');
          }
        }

        playerAtb = 0;
        updateUI();
        
        if (h.hp <= 0) {
          log('위협 요소가 완전히 정지되었습니다.', 'system');
          isBattleEnd = true;
          G.score += 20;
          setTimeout(() => { cleanup(); resolve(true); }, 1000);
          return;
        }

        setTimeout(() => { isActing = false; }, 500);
      };

      // ── 메인 루프 ──
      const tick = () => {
        if (isBattleEnd) return;

        if (!isActing) {
          const oldAtb = Math.floor(playerAtb);
          playerAtb += 1.25; 
          if (playerAtb >= 100) playerAtb = 100;
          
          if (Math.floor(playerAtb) !== oldAtb) {
             renderChoices();
          }
        }

        enemyAtb += (0.6 * h.speed);
        if (enemyAtb >= 100) {
          enemyAtb = 0;

          // 커스텀 액션(돌발 이벤트)인 경우 적이 먼저 공격하면 'timeout' 처리
          if (data.actions) {
            log('대응 시간이 초과되었습니다!', 'danger');
            isBattleEnd = true;
            setTimeout(() => { cleanup(); resolve('timeout'); }, 800);
            return;
          }

          const dmg = h.atk * (0.8 + Math.random() * 0.4);
          G.health -= Math.floor(dmg);
          log(`${h.name}의 물리적 접촉! 본체 손상 발생 (-${Math.floor(dmg)})`, 'danger');
          updateUI();
          
          if (G.health <= 0) {
            log('치명적 신체 손상. 통신 두절...', 'danger');
            isBattleEnd = true;
            setTimeout(() => { cleanup(); resolve(false); }, 1000);
            return;
          }
        }

        updateUI();
        requestAnimationFrame(tick);
      };

      renderChoices();
      tick();
    });
  }

  return { startBattle };
})();

window.CombatEngine = CombatEngine;
