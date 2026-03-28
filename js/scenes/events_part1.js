/* ═══════════════════════════════════════════════════
   scenes/events_part1.js (601 ~ 610)
   응암 ~ 월드컵경기장 구간 이벤트
   ═══════════════════════════════════════════════════ */

'use strict';

window.STATION_EVENTS = window.STATION_EVENTS || {};

Object.assign(STATION_EVENTS, {

  /* ── 응암 (601) ── */
  async ev_eungam(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('응암 — 첫차 탑승객과 눈이 마주쳤다', 'event');
    TrainPanel.showOverlay('★ 의문의 메모지', 3000);

    await printAscii([
      [`  ┌────────────────────────────┐`, ''],
      [`  │   첫차  AM 05:30           │`, 'hl'],
      [`  │   응암 → 봉화산            │`, ''],
      [`  │   승객 수: 3명             │`, ''],
      [`  │   [메모지가 발 밑에 있다]  │`, 'hl'],
      [`  └────────────────────────────┘`, ''],
    ], 'ascii-station', { rowDelay: 60, sound: 'modem' });

    await seq([
      ['새벽 5시 30분. 첫차다.', 'narrator', 200],
      ['텅 빈 6호선 객차. 형광등이 차갑게 빛난다.', 'narrator', 450],
      [`${gn()}의 발 밑에 접힌 메모지 하나가 있다.`, 'narrator', 700],
      ['', 'blank', 900],
      ['"이것을 읽는 사람에게 — 봉화산에서 내리지 마세요."', 'dialog', 1000],
      ['', 'blank', 1200],
      ['필체는 급하고 떨린다.', 'narrator', 1300],
      ['', 'blank', 1500],
      ['어떻게 할 것인가.', 'highlight', 1600],
    ]);

    const eungamOpts = [
      ['① 메모지를 주머니에 넣는다 — 일단 보관', async () => {
        addItem('수상한 메모지');
        sfx.item();
        TrainPanel.addLog('메모지 획득', 'event');
        G.score += 2; G.missionCount++; updateStats();
        await seq([
          ['"봉화산에서 내리지 마라..." 이게 무슨 뜻이지.', 'narrator', 200],
          ['메모지를 접어 주머니에 넣었다.', 'result', 400],
          ['누가 남겨둔 것인지 — 알 수 없다.', 'narrator', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 그냥 무시하고 발로 밀어낸다', async () => {
        TrainPanel.addLog('메모지 무시', 'info');
        G.score += 1; updateStats();
        await seq([
          ['신경 쓸 게 뭐 있나. 그냥 발로 밀었다.', 'result', 200],
          ['하지만 메모지의 내용이 뇌리에 남는다.', 'narrator', 500],
          ['봉화산...', 'whisper', 800],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];

    if (G.playerJob === '형사') {
      eungamOpts.push(['[형사] 전문적인 시각으로 필체와 단서를 분석한다', async () => {
        TrainPanel.addLog('형사 — 필체 분석', 'event');
        G.score += 5; updateStats();
        await seq([
          ['메모지를 들고 빛에 비춰보았다. 지문은 닦여 있다.', 'narrator', 200],
          ['급하게 휘갈긴 글씨지만, 특정 모음의 획이 일정하게 떨린다.', 'narrator', 450],
          ['이건 공포가 아니라, "암호"를 전달하려는 긴급함이다.', 'highlight', 700],
          ['', 'blank', 900],
          ['메모지 뒤편에 아주 작게 적힌 숫자를 발견했다. (6...2...?)', 'death', 1000],
          ['', 'blank', 1200],
        ]);
        addItem('수상한 메모지');
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]);
    }

    if (G.playerJob === '오컬트 연구자') {
      eungamOpts.push(['[오컬트 연구자] 메모지에 서린 잔류 사념을 읽는다', async () => {
        TrainPanel.addLog('오컬트 — 잔류 사념', 'event');
        G.sanity = Math.max(0, G.sanity - 5); updateStats();
        await seq([
          ['메모지에 손을 올리자 손끝이 차갑게 저려온다.', 'whisper', 200],
          ['누군가의 강렬한 "거부감"이 종이에 박혀 있다.', 'narrator', 450],
          ['봉화산... 그곳은 살아있는 자의 땅이 아닐지도 모른다.', 'death', 700],
          ['', 'blank', 900],
          ['정신력이 소폭 감소했지만, 진실의 냄새를 맡았다.', 'result', 1000],
        ]);
        addItem('수상한 메모지');
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]);
    }

    eungamOpts.push(['③ 주위를 둘러보며 메모지를 남긴 사람을 찾는다', async () => {
      TrainPanel.setState('danger');
      TrainPanel.addLog('주변 탐색 중...', 'warn');
      G.score += 3; G.missionCount++; updateStats();
      await seq([
        ['객차 안을 둘러봤다. 세 명의 승객.', 'narrator', 200],
        ['창가에 앉은 노인. 문 쪽에 선 청년. 끝자리 여성.', 'narrator', 450],
        ['여성과 눈이 마주쳤다. 그녀가 고개를 돌렸다.', 'highlight', 700],
        ['', 'blank', 900],
        ['"... 괜찮으시겠어요?"', 'highlight', 1000],
        ['대답이 없다.', 'narrator', 1200],
        ['메모지를 집어넣었다. 나중에 생각하자.', 'result', 1500],
      ]);
      addItem('수상한 메모지');
      sfx.item();
      TrainPanel.playDepart();
      await sceneNextStation(stIdx + (G.dirStep || 1));
    }]);

    choices(eungamOpts);
  },

  /* ── 불광 (603) ── */
  async ev_bulgwang(stIdx) {
    TrainPanel.setState('crowded');
    TrainPanel.addLog('불광 — 3호선 환승객 폭주', 'warn');
    TrainPanel.showOverlay('⚠ 혼잡 — 소매치기 주의', 3000);

    await seq([
      ['', 'blank', 0],
      ['불광역. 3호선 환승역.', 'announce', 200],
      ['순식간에 객차가 꽉 찼다.', 'narrator', 450],
      ['누군가의 팔꿈치가 옆구리를 파고든다.', 'narrator', 700],
      ['', 'blank', 900],
      ['그때 — 옆 승객이 작게 소리를 질렀다.', 'narrator', 1000],
      ['"아 — 지갑이...!"', 'dialog', 1200],
      ['', 'blank', 1400],
      ['혼잡한 틈을 타 소매치기가 있었던 것이다.', 'narrator', 1500],
      ['어떻게 할 것인가.', 'highlight', 1700],
    ]);

    const bulgwangOpts = [
      ['① 소리를 질러 주변 승객들에게 알린다', async () => {
        sfx.alarm();
        TrainPanel.setState('danger');
        TrainPanel.addLog('소매치기 신고 — 대응 중', 'warn');
        G.score += 3; G.missionCount++; updateStats();
        await seq([
          ['"소매치기입니다! 거기 잡아요!"', 'death', 200],
          ['객차 안이 술렁였다.', 'narrator', 450],
          ['범인은 문 쪽으로 밀고 나가려 했지만 —', 'narrator', 700],
          ['이미 역에 멈춰선 열차. 문이 열리자마자 역무원이 있었다.', 'narrator', 1000],
          ['피해자가 고개를 숙였다. "감사합니다."', 'dialog', 1300],
          ['+3점 — 의로운 행동', 'life', 1600],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 가만히 있는다 — 내 일이 아니다', async () => {
        TrainPanel.addLog('소매치기 목격 — 무시', 'info');
        G.score += 0; updateStats();
        await seq([
          ['내 것도 아닌데.', 'result', 200],
          ['열차가 불광역을 출발했다.', 'narrator', 500],
          ['피해자의 황망한 얼굴이 잠시 보였다.', 'narrator', 800],
          ['모른 척 창밖을 바라봤다.', 'narrator', 1100],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];

    if (G.playerJob === '청소 노동자') {
      bulgwangOpts.push(['[청소 노동자] 바닥을 살피며 소매치기가 버린 단서를 찾는다', async () => {
        TrainPanel.addLog('청소 노동자 — 숙련된 시선', 'event');
        G.score += 5; updateStats();
        await seq([
          ['바닥을 훑는 시선은 누구보다 정확하다.', 'narrator', 200],
          ['구석탱이 의자 밑에 던져진 빈 지갑을 발견했다.', 'highlight', 450],
          ['현금은 사라졌지만, 피해자의 소중한 사진이 그대로 있다.', 'life', 700],
          ['지갑을 돌려받은 승객이 눈물을 글썽인다.', 'result', 1000],
          ['+5점 — 잃어버린 마음을 찾아줌', 'life', 1300],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]);
    }

    bulgwangOpts.push(['③ 조용히 피해자에게 목격한 내용을 알려준다', async () => {
      G.score += 2; G.missionCount++; updateStats();
      TrainPanel.addLog('피해자에게 귀띔', 'event');
      await seq([
        ['살며시 팔을 잡았다.', 'narrator', 200],
        ['"회색 점퍼 입은 남자 쪽 같아요. 조용히 역무원 부르세요."', 'highlight', 400],
        ['피해자가 눈을 크게 뜬 뒤, 고개를 끄덕였다.', 'narrator', 700],
        ['작은 도움. 작은 연대.', 'result', 1000],
        ['+2점 — 조용한 도움', 'life', 1200],
      ]);
      TrainPanel.playDepart();
      await sceneNextStation(stIdx + (G.dirStep || 1));
    }]);

    choices(bulgwangOpts);
  },

  /* ── 연신내 (605) ── */
  async ev_yeonsinnae(stIdx) {
    TrainPanel.setState('crowded');
    TrainPanel.addLog('연신내 — 극혼잡 / 밀침 사고', 'warn');
    TrainPanel.showOverlay('⚠ 극혼잡 — 열차 지연', 2500);

    await printAscii([
      [`  ⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙`, 'hl'],
      [`  ⊙ 연신내 — 3호선 환승 ⊙`, 'hl'],
      [`  ⊙ 탑승 대기 인원: ████  ⊙`, ''],
      [`  ⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙`, ''],
    ], 'ascii-crowd', { rowDelay: 60 });

    await seq([
      ['연신내역. 3호선 환승.', 'announce', 200],
      ['이미 꽉 찬 객차에 더 많은 사람이 밀고 들어온다.', 'narrator', 450],
      ['누군가 밀렸다. 노인이 비틀거렸다.', 'narrator', 700],
      ['', 'blank', 900],
      ['어떻게 반응하겠는가.', 'highlight', 1000],
    ]);

    const yeonsinnaeOpts = [
      ['① 노인을 부축해 자리를 양보한다', async () => {
        G.score += 3; G.missionCount++; updateStats();
        TrainPanel.addLog('노인 부축 — 양보', 'event');
        await seq([
          ['팔을 뻗어 노인의 팔꿈치를 잡았다.', 'narrator', 200],
          ['"앉으세요, 어르신."', 'highlight', 400],
          ['노인이 천천히 앉으며 손을 꼭 잡아주었다.', 'narrator', 700],
          ['"고마워요, 학생."', 'dialog', 1000],
          ['기분이 나쁘지 않았다.', 'result', 1300],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];

    if (['의대생', '간호사', '소방관'].includes(G.playerJob)) {
      yeonsinnaeOpts.push([`[${G.playerJob}] 노인의 안색을 살피며 전문적인 조치를 취한다`, async () => {
        TrainPanel.addLog(`${G.playerJob} — 응급 처치`, 'event');
        G.score += 5; G.sanity = Math.min(100, G.sanity + 5); updateStats();
        await seq([
          ['단순히 밀린 게 아니다. 노인의 안색이 창백하다.', 'narrator', 200],
          ['맥박을 재고 호흡을 돕기 위해 주변 사람들을 물렸다.', 'highlight', 450],
          ['"잠시만 길을 터주세요. 환자입니다."', 'dialog', 700],
          ['전문적인 대처에 혼란스럽던 차내가 일시에 소강 상태가 된다.', 'life', 1000],
          ['노인은 안정을 찾았고, 당신은 깊은 보람을 느낀다.', 'result', 1300],
          ['+5점 / +5 정신력 회복', 'life', 1500],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]);
    }

    yeonsinnaeOpts.push(['② 혼잡이 심해 본인도 간신히 버티고 있다', async () => {
      G.score += 1; updateStats();
      await seq([
        ['손잡이를 꽉 잡았다. 여기가 전쟁터인가.', 'narrator', 200],
        ['노인은 다행히 옆 승객이 잡아주었다.', 'narrator', 500],
        ['안도했지만, 동시에 미안한 마음도 들었다.', 'result', 800],
      ]);
      TrainPanel.playDepart();
      await sceneNextStation(stIdx + (G.dirStep || 1));
    }]);

    choices(yeonsinnaeOpts);
  },

  /* ── 새절 (607) ── */
  async ev_saejul(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('새절 — 이상 승객 포착', 'event');
    TrainPanel.showOverlay('★ 수상한 인물 탑승', 3000);

    await seq([
      ['새절역. 탑승객 중 수상한 인물이 보인다.', 'narrator', 200],
      ['커다란 짐 가방. 모자를 푹 눌러쓴 남성.', 'narrator', 450],
      ['가방에서 작은 소리가 들린다.', 'narrator', 700],
      ['', 'blank', 900],
      ['... 꽤액.', 'death', 1000],
      ['', 'blank', 1200],
      ['닭 울음소리다.', 'highlight', 1300],
      ['', 'blank', 1500],
      ['어떻게 할 것인가.', 'highlight', 1600],
    ]);

    const saejulOpts = [
      ['① 모른 척한다 — 내가 왜', async () => {
        G.score += 1; updateStats();
        await seq([
          ['지하철에 닭을.', 'result', 200],
          ['뭐 어때. 도착만 하면 되지.', 'narrator', 500],
          ['꽤액 소리가 계속 들렸다.', 'narrator', 800],
          ['다른 승객들도 못 들은 척이다.', 'narrator', 1100],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 살며시 말을 건넨다 — "뭐가 들어있어요?"', async () => {
        G.score += 2; G.missionCount++; updateStats();
        TrainPanel.addLog('이상 승객에게 접근', 'event');
        await seq([
          ['"저... 혹시 가방 안에 뭐가 있나요?"', 'highlight', 200],
          ['남자가 모자를 올리며 민망하게 웃었다.', 'narrator', 450],
          ['"아 이게... 어머니 병문안 가는 길에 잠깐만 맡아달라고 해서..."', 'dialog', 700],
          ['"재래시장 닭인데, 미안합니다. 곧 내려요."', 'dialog', 1000],
          ['뭔가 훈훈하고, 뭔가 황당하다.', 'result', 1300],
          ['+2점 — 용기 있는 한마디', 'life', 1500],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];

    if (G.playerJob === '사진기자') {
      saejulOpts.push(['[사진기자] 셔터 찬스를 놓칠 수 없다. 결정적 순간을 촬영한다', async () => {
        TrainPanel.addLog('사진기자 — 결정적 순간', 'event');
        G.score += 5; updateStats();
        sfx.shot();
        await seq([
          ['찰나의 순간, 가방에서 고개를 내민 닭과 남자의 눈빛을 담았다.', 'narrator', 200],
          ['현대 사회의 부조리를 상징하는 듯한 한 컷이다.', 'highlight', 450],
          ['남자는 화를 내는 대신, 쓸쓸하게 웃어 보였다.', 'result', 700],
          ['"좋은 사진 부탁해요."', 'dialog', 1000],
          ['마음 한구석이 찡해진다.', 'life', 1300],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]);
    }

    choices(saejulOpts);
  },

  /* ── DMC (609) ── */
  async ev_dmc(stIdx) {
    TrainPanel.setState('crowded');
    TrainPanel.addLog('DMC — 대환승', 'warn');
    TrainPanel.showOverlay('⚠ 3개 노선 환승 — 극혼잡', 3000);

    await printAscii([
      [`  ╔══════════════════════════╗`, ''],
      [`  ║  DIGITAL MEDIA CITY     ║`, 'hl'],
      [`  ║  공항철도  ◀──○──▶     ║`, ''],
      [`  ║  경의중앙선 ◀──○──▶    ║`, ''],
      [`  ║  6호선     ◀──★──▶     ║`, 'hl'],
      [`  ╚══════════════════════════╝`, ''],
    ], 'ascii-station', { rowDelay: 60, sound: 'modem' });

    await seq([
      ['디지털미디어시티. 방송국, 스타트업, 공항 가는 사람들.', 'narrator', 200],
      ['환승 인파가 쏟아진다.', 'narrator', 450],
      ['', 'blank', 600],
      ['누군가 손에 들고 있던 카메라가 바닥에 떨어졌다.', 'narrator', 700],
      ['발에 밟힐 것 같다.', 'death', 1000],
    ]);

    const dmcOpts = [
      ['① 몸을 숙여 카메라를 집어준다', async () => {
        G.score += 3; G.missionCount++; updateStats();
        await seq([
          ['혼잡한 틈에서 몸을 숙이는 것은 모험이었다.', 'narrator', 200],
          ['카메라를 집어 들었다. 다행히 멀쩡하다.', 'narrator', 500],
          ['상대방은 방송국 카메라 기자였다.', 'narrator', 800],
          ['"감사합니다! 생방 나가기 전에 깨질 뻔 했어요!"', 'dialog', 1100],
          ['세상은 이런 식으로 돌아간다.', 'result', 1400],
          ['+3점 — 발 빠른 도움', 'life', 1600],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 발에 밟히기 전에 발로 옆으로 밀어놓는다', async () => {
        G.score += 1; updateStats();
        await seq([
          ['발끝으로 카메라를 벽 쪽으로 밀었다.', 'result', 200],
          ['우선은 안전하다.', 'narrator', 500],
          ['카메라 주인이 뒤늦게 발견하고 집어들었다.', 'narrator', 800],
          ['눈이 마주쳤지만 고맙다는 말은 없었다.', 'narrator', 1100],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];

    if (G.playerJob === '사진기자') {
      dmcOpts.push(['[사진기자] 동료의 장비를 신속하게 구조하고 상태를 체크한다', async () => {
        TrainPanel.addLog('사진기자 — 장비 구조', 'event');
        G.score += 5; updateStats();
        await seq([
          ['떨어진 것은 수천만 원 상당의 시네마 렌즈였다.', 'narrator', 200],
          ['익숙하게 마운트 부위를 감싸며 낚아챘다.', 'highlight', 450],
          ['"핀 나간 데 없는 것 같네요. 조심하세요."', 'dialog', 700],
          ['동료 기자를 만난 반가움과 안도감이 교차한다.', 'result', 1000],
          ['+5점 — 동료애 발휘', 'life', 1300],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]);
    }

    choices(dmcOpts);
  },

  /* ── 월드컵경기장 (610) ── */
  async ev_worldcup(stIdx) {
    TrainPanel.setState('crowded');
    TrainPanel.addLog('월드컵경기장 — 귀가 행렬', 'warn');
    TrainPanel.showOverlay('⚽ 경기 종료 — 귀가 행렬', 2500);

    await printAscii([
      [`  ┌──────────────────────────┐`, ''],
      [`  │  ⚽  FINAL SCORE         │`, 'hl'],
      [`  │  서울  3  :  2  수원     │`, 'hl'],
      [`  │  경기 종료 — 만원 지하철 │`, ''],
      [`  └──────────────────────────┘`, ''],
    ], 'ascii-crowd', { rowDelay: 70 });

    await seq([
      ['경기가 방금 끝났다. 서울이 이겼다.', 'narrator', 200],
      ['객차가 응원 머플러를 두른 사람들로 꽉 찼다.', 'narrator', 450],
      ['', 'blank', 600],
      ['옆에 선 중학생이 들뜬 목소리로 묻는다.', 'narrator', 700],
      ['"형(언니)! 오늘 경기 보셨어요? 마지막 골 보셨어요?!"', 'dialog', 1000],
      ['', 'blank', 1200],
      ['어떻게 반응하겠는가.', 'highlight', 1300],
    ]);

    const worldcupOpts = [
      ['① 경기는 못 봤지만 같이 기뻐해준다', async () => {
        G.score += 2; G.missionCount++; updateStats();
        await seq([
          ['"못 봤는데, 이긴 거야? 대박이다!"', 'highlight', 200],
          ['아이의 눈이 반짝였다. 30분 내내 경기 얘기를 해줬다.', 'narrator', 500],
          ['덕분에 합정까지 심심하지 않았다.', 'result', 800],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];

    if (G.playerJob === '배우 지망생') {
      worldcupOpts.push(['[배우 지망생] 열정적인 축구 팬 연기로 분위기를 최고조로 끌어올린다', async () => {
        TrainPanel.addLog('배우 지망생 — 명연기', 'event');
        G.score += 6; updateStats();
        await seq([
          ['"오늘 그 결승골! 진짜 미쳤었죠! 제가 다 소름이 돋아서!"', 'highlight', 200],
          ['중학생뿐 아니라 주변의 모든 팬이 환호하며 당신과 하이파이브를 한다.', 'life', 450],
          ['방금 전까지 삭막했던 객차가 홈 경기장 북쪽 스탠드가 된 기분이다.', 'result', 700],
          ['당신의 연기는 사람들에게 잠시나마 일상의 시름을 잊게 했다.', 'life', 1000],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]);
    }

    worldcupOpts.push(['② 이어폰을 꽂는다', async () => {
      G.score += 0; updateStats();
      await seq([
        ['이어폰을 귀에 꽂았다. 음악이 흘렀다.', 'result', 200],
        ['아이는 잠시 멈칫하다 다른 쪽을 바라봤다.', 'narrator', 500],
        ['각자의 세계.', 'narrator', 800],
      ]);
      TrainPanel.playDepart();
      await sceneNextStation(stIdx + (G.dirStep || 1));
    }]);

    choices(worldcupOpts);
  },

});
