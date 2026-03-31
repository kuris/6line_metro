/* ═══════════════════════════════════════════════════
   scenes/event_pool.js — 공통 위험 조우 풀
   특정 역에 종속되지 않고 랜덤하게 발생하는 비상 대응 상황
   ═══════════════════════════════════════════════════ */

'use strict';

window.EVENT_POOL = {

  /* ── 일반적인 상황 대치 (Physical / Mental Response) ── */
  generic: [
    {
      id: 'pool_unclaimed_parcel',
      title: '미확인 적재물',
      desc: '선반 위에 정체를 알 수 없는 검은색 보따리가 놓여 있습니다.',
      run: async (stIdx) => {
        await seq([
          ['옆자리에 주인 없는 검은색 보따리가 놓여 있습니다.', 'narrator', 200],
          ['보따리 겉면이 마치 심장처럼 미세하게 박동하고 있습니다.', 'highlight', 450],
        ]);
        choices([
          ['① 보따리를 조준하여 상태를 확인한다 (관찰)', async () => {
            if (Math.random() < 0.45) {
              await seq([['보따리 안에서 낡은 비상용 랜턴을 발견했습니다.', 'life', 200]]);
              G.score += 5; addItem('비상 랜턴');
            } else {
              await seq([['보따리가 터지며 불쾌한 자극을 주는 포자가 뿜어져 나옵니다!', 'danger', 200]]);
              await modifyStat('infection', 10);
            }
            TrainPanel.playDepart();
            await sceneNextStation(stIdx + (G.dirStep || 1));
          }],
          ['② 오염 구역을 설정하고 자리를 이탈한다', async () => {
            await seq([['본능적인 위험을 직감하고 자리를 옮겼습니다. 호흡이 안정됩니다.', 'life', 200]]);
            G.sanity = Math.min(100, G.sanity + 5);
            TrainPanel.playDepart();
            await sceneNextStation(stIdx + (G.dirStep || 1));
          }]
        ]);
      }
    },
    {
      id: 'pool_glitch_broadcast',
      title: '노이즈 섞인 안내방송',
      desc: '객차 내 스피커에서 알아들을 수 없는 기계음이 흘러나옵니다.',
      run: async (stIdx) => {
        await seq([
          ['치지직... "이번...역은... 으..아...역입니다..."', 'whisper', 200],
          ['방송 소리가 점점 커지더니 고막을 찌르는 금속음으로 바뀝니다.', 'death', 450],
        ]);
        choices([
          ['① 귀를 막고 방송 내용을 필터링한다', async () => {
            await seq([['고통스럽지만 안내방송 사이에 섞인 다음 역 정보를 읽어냈습니다.', 'highlight', 200]]);
            G.score += 5;
            TrainPanel.playDepart();
            await sceneNextStation(stIdx + (G.dirStep || 1));
          }],
          ['② 비상 통화 장치를 눌러 상황을 보고한다', async () => {
            await seq([['응답이 없습니다. 하지만 통화 장치를 누르는 동안 소음이 잦아듭니다.', 'narrator', 200]]);
            await modifyStat('sanity', -5);
            TrainPanel.playDepart();
            await sceneNextStation(stIdx + (G.dirStep || 1));
          }]
        ]);
      }
    }
  ],

  /* ── 비상 대응 프로토콜 (Hazardous Contact) ── */
  battle: [
    {
      id: 'pool_hazard_type_a',
      title: '위협 탐지: 타입 A (Infected)',
      run: async (stIdx) => {
        await seq([
          ['경보: 객차 연결부에서 오염된 개체가 접근 중입니다!', 'danger', 200],
        ]);
        const win = await CombatEngine.startBattle({
          name: '감염된 승객 (TYPE-A)',
          hp: 45,
          atk: 13,
          speed: 1.2,
          img: 'images/chracter/mad_girl.png',
          desc: '이성을 상실한 개체가 비정상적인 속도로 돌진합니다.',
          type: 'infected'
        });
        
        if (win) {
          await seq([['개체로부터 안전 거리를 확보하고 평정을 되찾습니다.', 'life', 200]]);
          TrainPanel.playDepart();
          await sceneNextStation(stIdx + (G.dirStep || 1));
        }
      }
    },
    {
      id: 'pool_hazard_type_b',
      title: '위협 탐지: 타입 B (Distorted)',
      run: async (stIdx) => {
        await seq([
          ['주의: 육안으로 식별하기 어려운 형태의 왜곡된 개체가 탐지되었습니다.', 'death', 200],
        ]);
        const win = await CombatEngine.startBattle({
          name: '뒤틀린 잔상 (TYPE-B)',
          hp: 65,
          atk: 9,
          speed: 0.7,
          img: 'images/chracter/fear_boy.png',
          desc: '기하학적으로 꺾인 형체가 당신에게 손을 뻗어옵니다.',
          type: 'infected'
        });
        
        if (win) {
          await seq([['치열한 대치 끝에 개체의 활동이 정지되었습니다.', 'life', 200]]);
          TrainPanel.playDepart();
          await sceneNextStation(stIdx + (G.dirStep || 1));
        }
      }
    }
  ]
};
