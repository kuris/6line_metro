/* ═══════════════════════════════════════════════════
   scenes/events_part3.js (626 ~ 638)
   신당 ~ 봉화산 구간 이벤트 (통합 및 최적화)
   ═══════════════════════════════════════════════════ */

'use strict';

window.STATION_EVENTS = window.STATION_EVENTS || {};

Object.assign(STATION_EVENTS, {

  /* ── 신당 (626) ── */
  async ev_sindang(stIdx) {
    TrainPanel.setState('crowded');
    TrainPanel.addLog('신당 — 중앙시장 상인들과 기묘한 노파', 'event');
    await seq([
      ['신당역. 2호선 환승 인파와 함께 중앙시장 상인들이 대거 탑승한다.', 'announce', 200],
      ['커다란 보따리들이 객차 바닥을 채우고, 눅눅한 시장 냄새가 번진다.', 'narrator', 450],
      ['그때, 남루한 차림의 한 노파가 당신 곁에 앉으며 차갑게 읊조린다.', 'narrator', 700],
      ['"이봐... 오늘 길조심해. 특히 아래를 보지 마."', 'dialog', 1000],
    ]);

    const opts = [
      ['① 할머니의 무거운 보따리를 위 선반에 올려드린다', async () => {
        G.score += 3; updateStats();
        await seq([
          ['노파 대신 옆에 있던 다른 할머니의 보따리를 챙겨 올렸다.', 'narrator', 200],
          ['"고마워라. 오늘따라 몸이 천근만근이네."', 'dialog', 450],
          ['노파는 그 모습을 보며 의미심장하게 웃는다.', 'result', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 노파에게 왜 그런 말을 하는지 공손히 묻는다', async () => {
        G.score += 2; updateStats();
        await seq([
          ['"그게 무슨 말씀이신가요, 할머니?"', 'highlight', 200],
          ['노파는 대답 대신 당신의 손을 한 번 꽉 쥐고는 자리에서 일어났다.', 'narrator', 450],
          ['손바닥에 얼음 같은 차가운 감촉이 남았다.', 'result', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];

    if (['오컬트 연구자', '무직자'].includes(G.playerJob)) {
      opts.push(['[영적 예민함] 노파의 눈을 정면으로 쳐다보며 비범함을 느낀다', async () => {
        TrainPanel.addLog('신비로운 조우', 'event');
        G.score += 7; G.sanity = Math.min(100, G.sanity + 20); updateStats();
        await seq([
          ['그녀의 눈동자 속에서 수많은 6호선의 영혼들을 보았다.', 'whisper', 200],
          ['노파가 희미하게 웃었다. "보는 눈이 있구먼."', 'dialog', 450],
          ['그녀가 당신의 어깨를 툭 쳤다. 온몸의 공포가 씻은 듯 사라진다.', 'life', 700],
          ['거대한 가호를 얻은 기분이다.', 'result', 1000],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]);
    }

    if (G.playerJob === '편의점 알바생') {
      opts.push(['[편의점 알바생] 시장 사람들의 고단함에 공감하며 가벼운 인사를 건넨다', async () => {
        TrainPanel.addLog('알바생 — 노동의 연대', 'event');
        G.score += 5; updateStats();
        await seq([
          ['"오늘 물건이 많이 들어왔네요. 힘드시죠?"', 'highlight', 200],
          ['비슷한 처지의 노동자로서 건넨 한마디에 상인들이 웃으며 답한다.', 'narrator', 450],
          ['"에구, 학생도 고생이 많네. 이거 하나 먹어봐."', 'dialog', 700],
          ['검은 봉지에 담긴 귤 몇 알을 선물 받았다.', 'life', 950],
          ['따뜻한 인심이 차내를 가득 채운다.', 'result', 1100],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]);
    }

    choices(opts);
  },

  /* ── 동묘앞 (627) ── */
  async ev_dongmyo(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('동묘앞 — 벼룩시장 할아버지', 'event');
    await printAscii([
      [`  ┌──────────────────────────┐`, ''],
      [`  │  동묘벼룩시장           │`, 'hl'],
      [`  │  "모든 것은 다 쓸모있다" │`, 'hl'],
      [`  └──────────────────────────┘`, ''],
    ], 'ascii-crowd', { rowDelay: 60 });

    await seq([
      ['동묘앞역. 낡은 군복 차림의 할아버지가 카세트테이프 꾸러미를 들고 탄다.', 'narrator', 200],
      ['그가 당신을 유심히 보더니 낡은 테이프 하나를 내민다.', 'narrator', 450],
      ['"젊은이, 이거 갖겠소? 인생은 아름다운 법이야."', 'dialog', 700],
    ]);

    const dongmyoOpts = [
      ['① 감사히 받는다', async () => {
        addItem('카세트테이프');
        G.score += 3; updateStats();
        await seq([
          ['[인생은 아름다워]라고 적힌 테이프를 받았다.', 'highlight', 200],
          ['"고맙습니다. 잘 들을게요."', 'dialog', 450],
          ['할아버지는 만족한 듯 다음 역에서 내렸다.', 'result', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];

    if (G.playerJob === '가출 청소년') {
      dongmyoOpts.push(['[가출 청소년] 할아버지의 낡은 옷과 손을 보며 알 수 없는 유대감을 느낀다', async () => {
        TrainPanel.addLog('가출 청소년 — 세대 초월 공감', 'event');
        G.score += 6; G.sanity = Math.min(100, G.sanity + 10); updateStats();
        await seq([
          ['"저... 저도 비슷한 테이프가 있었어요."', 'highlight', 200],
          ['할아버지가 당신의 머리를 거칠지만 따뜻하게 쓰다듬었다.', 'narrator', 450],
          ['"살아라, 얘야. 어떻게든 살다 보면 좋은 날이 와."', 'dialog', 700],
          ['세상 어디에도 기댈 곳 없던 마음에 온기가 스민다.', 'life', 950],
          ['+10 정신력 회복', 'life', 1100],
        ]);
        addItem('희망의 테이프');
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]);
    }

    dongmyoOpts.push(['② 정중히 사양한다', async () => {
      await seq([
        ['"아직은 필요 없을 것 같습니다."', 'narrator', 200],
        ['할아버지는 씁쓸하게 웃으며 고개를 끄덕였다.', 'result', 450],
      ]);
      TrainPanel.playDepart();
      await sceneNextStation(stIdx + (G.dirStep || 1));
    }]);

    choices(dongmyoOpts);
  },

  /* ── 안암 (630) ── */
  async ev_anam(stIdx) {
    TrainPanel.setState('crowded');
    TrainPanel.addLog('안암 — 청춘의 열기와 학구열', 'event');
    await seq([
      ['안암역. 고려대학교 학생들의 활기찬 웃음소리가 객차를 가득 채운다.', 'announce', 200],
      ['한쪽에서는 MT를 떠나는 무리가 응원가를 부르고, 다른 쪽에서는 시험 공부가 한창이다.', 'narrator', 450],
    ]);

    const opts = [
      ['① 학생들의 응원가에 맞춰 가볍게 박수를 쳐준다', async () => {
        G.score += 3; G.sanity = Math.min(100, G.sanity + 5); updateStats();
        await seq([
          ['당신의 호응에 학생들이 더 신나게 노래를 부른다.', 'life', 200],
          ['삭막한 지하철 안이 잠시 동안 축제 현장이 되었다.', 'result', 450],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 그냥 조용히 자리를 지킨다', async () => {
        await seq([
          ['청춘의 에너지를 묵묵히 지켜보며 옛 생각을 한다.', 'narrator', 200],
          ['열차 내의 무거운 정적이 잠시 희석된다.', 'result', 450],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ];

    if (['학원 강사', '의대생', '학생'].includes(G.playerJob)) {
      opts.push(['[지식 전수] 암기 중인 학생들에게 결정적인 힌트를 건넨다', async () => {
        TrainPanel.addLog('지식 전수 — 뿌듯함', 'event');
        G.score += 6; G.sanity = Math.min(100, G.sanity + 10); updateStats();
        await seq([
          ['"그 개념은... 뒷장에 그림이랑 같이 보시면 더 잘 외워질 거예요."', 'dialog', 200],
          ['학생들은 깜짝 놀라며 책을 넘겼다. "헐, 진짜네! 감사합니다!"', 'highlight', 450],
          ['누군가를 도왔다는 실감이 생존에 대한 의지를 북돋운다.', 'result', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]);
    }

    choices(opts);
  },

  /* ── 돌곶이 (634) ── */
  async ev_dolgoji(stIdx) {
    TrainPanel.setState('event');
    TrainPanel.addLog('돌곶이 — 무임승차 단속', 'warn');
    await seq([
      ['돌곶이역. 단속요원이 탑승해 부정 승차자를 찾고 있다.', 'announce', 200],
      ['한 청소년이 겁에 질려 당신 옆자리로 몸을 숨긴다.', 'narrator', 450],
    ]);

    choices([
      ['① "저 친구는 제 일행입니다"라며 대신 결제해준다', async () => {
        G.score += 5; updateStats();
        await seq([
          ['단속요원에게 카드를 보여주었다. "이 친구 몫까지 찍혔나요?"', 'highlight', 200],
          ['요원이 고개를 끄덕이며 지나갔다. 소년은 울먹이며 고맙다고 했다.', 'life', 450],
          ['작은 자비가 누군가에겐 큰 구원이 된다.', 'result', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 단속요원의 시선을 피해 청소년을 가려준다', async () => {
        G.score += 2; updateStats();
        await seq([
          ['몸을 살짝 기울여 소년을 요원의 시야에서 차단했다.', 'narrator', 200],
          ['위기를 넘긴 소년이 조용히 다음 역에서 내렸다.', 'result', 450],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['③ 모른 척 정면만 응시한다', async () => {
        await seq([
          ['법은 지켜져야 하는 법. 하지만 마음이 편치는 않다.', 'narrator', 200],
          ['소년은 결국 요원에게 적발되어 끌려 나갔다.', 'result', 450],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ]);
  },

  /* ── 태릉입구 (636) ── */
  async ev_taereung(stIdx) {
    TrainPanel.setState('crowded');
    TrainPanel.addLog('태릉입구 — 7호선 환승 러시', 'warn');
    await seq([
      ['태릉입구역. 7호선에서 쏟아지는 인파로 숨쉬기조차 힘들다.', 'announce', 200],
      ['각잡힌 제복의 육사 생도들이 늠름하게 자리를 지키고 서 있다.', 'narrator', 450],
    ]);

    choices([
      ['① 무거운 짐을 든 승객을 대신해 짐을 들어준다', async () => {
        G.score += 4; updateStats();
        await seq([
          ['"제가 좀 들어드릴까요?"', 'highlight', 200],
          ['당신의 행동에 옆에 있던 생도들도 함께 돕기 시작했다.', 'result', 450],
          ['선한 영향력이 순식간에 객차 안으로 퍼져나간다.', 'life', 700],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }],
      ['② 구석으로 몸을 밀어 넣어 공간을 확보한다', async () => {
        await seq([
          ['생존이 우선이다. 최선을 다해 버텼다.', 'narrator', 200],
          ['열차가 출발하고서야 간신히 숨통이 트였다.', 'result', 450],
        ]);
        TrainPanel.playDepart();
        await sceneNextStation(stIdx + (G.dirStep || 1));
      }]
    ]);
  },

  /* ── 봉화산 (638) ── */
  async ev_bonghwasan(stIdx) {
    TrainPanel.setState('arriving');
    sfx.chime();
    TrainPanel.addLog('봉화산 — 여정의 끝', 'new');
    await printAscii([
      [`  ╔══════════════════════════════╗`, ''],
      [`  ║  종착역  ·  FINAL STATION   ║`, 'hl'],
      [`  ║  봉화산  BONGHWASAN  638    ║`, 'hl'],
      [`  ╚══════════════════════════════╝`, ''],
    ], 'ascii-station', { rowDelay: 70 });

    if (hasItem('수상한 메모지')) {
      await seq([
        ['종착역에 도착했다. 하지만 메모지의 경고가 귓가를 맴돈다.', 'death', 200],
        ['"봉화산에서 내리지 마세요."', 'death', 450],
      ]);
      choices([
        ['① 경고를 무시하고 내린다', async () => {
          await seq([
            ['내렸다. 차가운 바람이 불어온다.', 'narrator', 200],
            ['아무 일도 일어나지 않았지만, 왠지 등 뒤가 서늘하다.', 'result', 450],
          ]);
          await sceneEnding();
        }],
        ['② 열차에 남은 채 회차를 기다린다', async () => {
          G.score += 10; updateStats();
          await seq([
            ['자리를 지키자 플랫폼의 불이 꺼지고 열차가 어둠 속으로 들어간다.', 'death', 200],
            ['잠시 후, 정체 모를 발소리가 객차 바깥을 스쳐 지나갔다.', 'whisper', 450],
            ['당신은 진실에 한 발짝 다가갔다. 하지만 그 대가는 무엇일까.', 'result', 700],
          ]);
          await sceneEnding();
        }]
      ]);
    } else {
      await seq([
        ['열차가 멈췄다. 안내 방송이 들려온다.', 'announce', 200],
        [`${gn()}은(는) 무거운 발걸음으로 플랫폼에 내렸다.`, 'narrator', 450],
        ['오늘의 생존 기록이 마무리된다.', 'result', 700],
      ]);
      await sceneEnding();
    }
  },

});
