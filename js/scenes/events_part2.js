/* ═══════════════════════════════════════════════════
   scenes/events_part2.js (621 ~ 632)
   망원 ~ 버티고개 구간 이벤트
   ═══════════════════════════════════════════════════ */

'use strict';

window.STATION_EVENTS = window.STATION_EVENTS || {};

Object.assign(STATION_EVENTS, {

  /* ── 망원 (621) ── */
  async ev_mangwon(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('망원 — 길 잃은 통근자', 'event');
    await seq([
      ['망원역. 퇴근길 인파가 쏟아져 들어온다.', 'narrator', 200],
      ['문 옆에서 한 남자가 안절부절못하며 지도를 들여다보고 있다.', 'narrator', 450],
      ['"저... 실례합니다. 합정으로 가려면 어느 쪽을 타야 하죠?"', 'dialog', 700],
      ['그는 배고픔과 피로에 지쳐 보인다.', 'narrator', 950],
    ]);

    const mangwonOpts = [
      ['① 반대편 승강장이라고 친절히 알려준다', async () => {
        G.score += 2; updateStats();
        await seq([
          ['"반대쪽으로 가셔야 해요."', 'highlight', 200],
          ['그는 연신 고개를 숙이며 기운 없이 걸어 나갔다.', 'result', 450],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 모르는 척 고개를 돌린다', async () => {
        await seq([
          ['누군가를 도울 여유 따윈 없다.', 'narrator', 200],
          ['그는 한참을 미로처럼 헤매다 결국 다시 내렸다.', 'result', 450],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];

    if (['식당 실장', '노점상 상인'].includes(G.playerJob)) {
      mangwonOpts.push([`[${G.playerJob}] 가방에 있던 음식을 조금 나눠준다`, async () => {
        TrainPanel.addLog(`${G.playerJob} — 음식 나눔`, 'event');
        G.score += 7; updateStats();
        await seq([
          ['"이거라도 좀 드세요. 기운 차리셔야죠."', 'highlight', 200],
          ['남자는 놀란 눈으로 빵 한 조각을 받아 들었다.', 'narrator', 450],
          ['"정말... 정말 감사합니다. 오늘 너무 힘들었거든요."', 'dialog', 700],
          ['그의 눈가가 촉촉해졌다. 당신도 마음이 따뜻해진다.', 'life', 950],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]);
    }

    if (G.playerJob === '퀵배달 기사') {
      mangwonOpts.push(['[퀵배달 기사] 이 지역 골목 지리를 꿰고 있다. 최단 경로를 찍어준다', async () => {
        TrainPanel.addLog('퀵배달 — 지리 마스터', 'event');
        G.score += 6; updateStats();
        await seq([
          ['"합정요? 여기서 2번 출구로 나가서 망원시장 통과하는 게 제일 빨라요."', 'highlight', 200],
          ['복잡한 지도를 보며 헤매던 남자의 눈이 번쩍 뜨였다.', 'narrator', 450],
          ['"와, 진짜 감사합니다! 배달 하시는 분인가 봐요? 정말 큰 도움 됐습니다."', 'dialog', 700],
          ['전문가의 조언은 언제나 빛을 발한다.', 'result', 950],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]);
    }

    choices(mangwonOpts);
  },

  /* ── 합정 (622) ── */
  async ev_hapjeong(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('합정 — 취객들의 언쟁', 'event');
    await seq([
      ['합정역. 2호선 환승 인파 사이로 험악한 분위기가 감돈다.', 'narrator', 200],
      ['술에 취한 두 남자가 서로 멱살을 잡기 일보 직전이다.', 'narrator', 450],
      ['"당신이 먼저 밀었잖아!" / "아니, 길을 막고 서 있으니까..."', 'dialog', 700],
      ['주변 사람들이 겁을 먹고 피하기 시작한다.', 'narrator', 950],
    ]);

    const hapjeongOpts = [
      ['① "다들 진정하세요!" 소리쳐 말린다', async () => {
        G.score += 3; updateStats();
        await seq([
          ['당신의 외침에 두 남자가 움찔하며 손을 놓았다.', 'highlight', 200],
          ['"사람들 많은데 이게 무슨 창피입니까?"', 'dialog', 450],
          ['서로 투덜거리며 제 갈 길을 갔다. 상황 종료.', 'result', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 멀리 떨어져서 지켜본다', async () => {
        await seq([
          ['괜히 말려들었다간 피곤해진다.', 'narrator', 200],
          ['다행히 역무원이 나타나 상황을 정리했다.', 'result', 450],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];

    if (['형사', '소방관'].includes(G.playerJob)) {
      hapjeongOpts.push([`[${G.playerJob}] 단호한 태도로 개입하여 상황을 분리시킨다`, async () => {
        TrainPanel.addLog(`${G.playerJob} — 상황 제압`, 'event');
        G.score += 7; updateStats();
        await seq([
          [`"자, 그만하세요! 사고 납니다. 두 분 다 이쪽으로."`, 'highlight', 200],
          [`숙련된 손길로 두 사람 사이를 갈라놓았다.`, 'narrator', 450],
          [`당신의 카리스마에 눌려 두 남자는 순순히 흩어졌다.`, 'result', 700],
          [`시민들이 안도의 한숨을 내쉰다.`, 'life', 950],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]);
    }

    choices(hapjeongOpts);
  },

  /* ── 광흥창 (624) ── */
  async ev_gwangheungchang(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('광흥창 — 취객의 하소연', 'event');
    await seq([
      ['광흥창역. 심야의 열차 안.', 'narrator', 200],
      ['술 취한 남자가 옆자리에 앉아 혼잣말을 흥얼거린다.', 'narrator', 450],
      ['"다들 나만 무시하고... 세상을 그렇게 사는 게 아닌데..."', 'dialog', 700],
    ]);

    const gwangOpts = [
      ['① 조용히 다른 칸으로 피한다', async () => {
        await seq([
          ['굳이 엮이고 싶지 않다.', 'narrator', 200],
          ['남아있는 사람들의 한숨 섞인 눈빛이 뒤통수에 꽂힌다.', 'result', 450],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 가만히 들어준다', async () => {
        G.score += 2; updateStats();
        await seq([
          ['그저 묵묵히 고개를 끄덕여주었다.', 'narrator', 200],
          ['남자는 한참을 떠들다 어느새 잠이 들었다.', 'result', 450],
          ['누군가에겐 들어줄 한 사람이 필요했을지도 모른다.', 'life', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];

    if (G.playerJob === '실직한 중년') {
      gwangOpts.push(['[실직한 중년] 같은 아픔을 가진 이로서 그의 손을 가만히 잡아준다', async () => {
        TrainPanel.addLog('실직자 — 동병상련', 'event');
        G.score += 7; G.sanity = Math.min(100, G.sanity + 15); updateStats();
        await seq([
          ['"힘드시죠... 저도 압니다. 우리 조금만 더 버텨봅시다."', 'highlight', 200],
          ['취객은 당신의 손을 잡고 아이처럼 엉엉 울기 시작했다.', 'narrator', 450],
          ['함께 흘린 눈물이 가슴 속의 응어리를 조금 씻어내린다.', 'life', 700],
          ['누군가를 위로하며 스스로도 위로받았다.', 'result', 950],
          ['+15 정신력 회복', 'life', 1100],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]);
    }

    choices(gwangOpts);
  },

  /* ── 공덕 (626) ── */
  async ev_gongdeok(stIdx) {
    TrainPanel.setState('danger');
    sfx.alarm();
    TrainPanel.addLog('공덕 — 연기 발생!', 'warn');
    await seq([
      ['공덕역 진입 직전, 객차 내부에 연기가 자욱해진다.', 'death', 200],
      ['"불이야! 대피해!" 누군가의 외침에 아수라장이 된다.', 'narrator', 450],
    ]);

    const opts = [
      ['① 코와 입을 막고 침착하게 대피 유도', async () => {
        G.score += 5; updateStats();
        await seq([
          ['"코 막으세요! 낮은 자세로 이동합니다!"', 'highlight', 200],
          ['당신의 안내에 패닉이 잦아들며 줄이 만들어졌다.', 'result', 450],
          ['전원 무사히 공덕역 플랫폼으로 빠져나갔다.', 'life', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 정신없이 문 쪽으로 달려간다', async () => {
        G.sanity -= 5; updateStats();
        await seq([
          ['살고 싶은 본능이 앞섰다. 사람들을 헤치고 나갔다.', 'narrator', 200],
          ['정신을 차려보니 안전한 곳이었지만, 자괴감이 든다.', 'result', 450],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];
    choices(opts);
  },

  /* ── 삼각지 (628) ── */
  async ev_samgakji(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('삼각지 — 주인 없는 상자', 'event');
    await seq([
      ['삼각지역. 의자 위에 낡은 상자 하나가 놓여 있다.', 'narrator', 200],
      ['지나가는 사람들 모두 힐끗거리며 피한다.', 'narrator', 450],
    ]);

    const opts = [
      ['① 역무원에게 신고한다', async () => {
        G.score += 3; updateStats();
        await seq([
          ['인터폰을 통해 위치를 알렸다.', 'highlight', 200],
          ['곧 역무원이 수거해갔다. 유실물이었던 것 같다.', 'result', 450],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 직접 열어본다', async () => {
        G.sanity -= 2; updateStats();
        await seq([
          ['상자를 조심스럽게 열었다. 안에는 낡은 구두가 들어있다.', 'narrator', 200],
          ['누군가의 소중한 물건일 텐데... 왠지 가슴이 서늘하다.', 'result', 450],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];
    choices(opts);
  },

  /* ── 이태원 (630) ── */
  async ev_itaewon(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('이태원 — 외국인 관광객', 'event');
    await seq([
      ['이태원역. 커다란 배낭을 멘 외국인이 지도를 펼치고 당황해한다.', 'narrator', 200],
      ['"Excuse me, I want to go to Dongdaemun Market..."', 'dialog', 450],
      ['주변 사람들은 시선을 회피하며 지나간다.', 'narrator', 700],
    ]);

    const itaewonOpts = [
      ['① "Yes, you should take Line 4 at Samgakji."', async () => {
        G.score += 4; updateStats();
        await seq([
          ['당신의 유창한 안내에 관광객의 표정이 밝아졌다.', 'highlight', 200],
          ['"Thank you so much! Korean people are so kind!"', 'dialog', 450],
          ['기분 좋은 감사가 이어진다.', 'life', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 스마트폰 번역기를 켜서 보여준다', async () => {
        G.score += 2; updateStats();
        await seq([
          ['서툰 영어지만 최선을 다해 스마트폰으로 경로를 찍어주었다.', 'narrator', 200],
          ['그도 고개를 숙이며 "감사합니다"라고 한국말로 인사했다.', 'result', 450],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];

    if (['학생', '회사원'].includes(G.playerJob)) {
      itaewonOpts.push([`[${G.playerJob}] 매일 공부한 영어 실력을 발휘해 완벽하게 안내한다`, async () => {
        TrainPanel.addLog(`${G.playerJob} — 영어 실력 발휘`, 'event');
        G.score += 6; updateStats();
        await seq([
          [`"It's easier to transfer at Samgakji. Let me show you on the map."`, 'highlight', 200],
          [`환승역 뿐 아니라 주변 맛집까지 추천해주는 여유를 보였다.`, 'narrator', 450],
          [`어학 실력이 드디어 빛을 발하는 순간이다.`, 'life', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]);
    }

    if (G.playerJob === '버스킹 뮤지션') {
      itaewonOpts.push(['[버스킹 뮤지션] 리듬 섞인 제스처와 짧은 감탄사로 유쾌하게 설명한다', async () => {
        TrainPanel.addLog('뮤지션 — 소울 넘치는 안내', 'event');
        G.score += 6; updateStats();
        await seq([
          ['"Yo! Samgakji station! Line 4! Boom! Two stops! Easy!"', 'highlight', 200],
          ['당신의 흥겨운 안내에 관광객도 함께 웃으며 리듬을 탄다.', 'life', 450],
          ['말은 안 통해도 마음은 통하는 법이다.', 'result', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]);
    }

    choices(itaewonOpts);
  },

  /* ── 버티고개 (632) ── */
  async ev_berti(stIdx) {
    TrainPanel.setState('danger');
    sfx.alarm();
    TrainPanel.addLog('버티고개 — 노인의 실신', 'warn');
    await seq([
      ['버티고개역. 의자에 앉아있던 노인이 갑자기 바닥으로 고꾸라진다.', 'death', 200],
      ['"아이고, 할아버지!" 승객들이 비명을 지르며 물러난다.', 'narrator', 450],
    ]);

    const opts = [
      ['① 비상 인터폰으로 역무원을 호출한다', async () => {
        G.score += 4; updateStats();
        await seq([
          ['"버티고개역. 실신 환자 발생! 빨리요!"', 'highlight', 200],
          ['신속한 신고 덕에 1분 만에 구급대원이 도착했다.', 'result', 450],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 무서워서 고개를 돌린다', async () => {
        G.sanity -= 3; updateStats();
        await seq([
          ['차가운 시멘트 바닥에 누워있는 노인의 모습이 뇌리에 박힌다.', 'narrator', 200],
          ['죄책감이 가랑비처럼 스며든다.', 'result', 450],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];
    choices(opts);
  },

});
