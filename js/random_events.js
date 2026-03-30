/* ═══════════════════════════════════════════════════
   random_events.js — 역 사이 이동 중 랜덤 소사건
   30% 확률로 발생 / 시간대별 가중치 풀
   ═══════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────
   소사건 풀
   each: { id, tod(시간대 배열|'all'), weight, fn: async() }
   ────────────────────────────────────────── */
const RANDOM_EVENT_POOL = [

  /* ── 1. 취객의 접근 (Dangerous) ── */
  {
    id: 're_drunk_approaches',
    tod: ['evening', 'night', 'dawn'], weight: 5,
    async fn() {
      await seq([
        ['', 'blank', 0],
        ['비틀거리는 취객이 다가온다. 눈의 핏발이 기괴하게 서 있다.', 'narrator', 200],
        ['"너... 너도 단내 나잖아..."', 'danger', 500],
        ['거친 손길로 당신의 멱살을 잡으려 한다.', 'danger', 800],
      ]);
      await choices([
        ['맞서 싸운다', async () => {
          if (G.playerGender === '남성' && (G.playerAge === '20대' || G.playerAge === '30대')) {
            await seq([
              ['강하게 팔을 쳐내고 취객을 밀쳐냈다.', 'highlight', 200],
              ['당신의 기세에 늘린 취객이 뒤로 넘어졌다.', 'narrator', 500],
            ]);
            await modifyStat('sanity', 10);
            G.score += 2; updateStats();
          } else {
            await seq([
              ['저항했지만 감염된 자의 힘이 비정상적으로 강했다.', 'danger', 200],
              ['손톱에 긁히며 바닥에 뒹굴었다.', 'death', 500],
            ]);
            await modifyStat('health', -20);
            await modifyStat('infection', 10);
          }
        }],
        ['도망간다', async () => {
          if (G.playerAge === '10대' || G.playerAge === '20대') {
            await seq([
              ['재빠르게 옆 칸으로 도망쳤다.', 'narrator', 200],
              ['가빠진 숨을 고르며 마음을 진정시킨다.', 'narrator', 500],
            ]);
            await modifyStat('sanity', -5);
          } else {
            await seq([
              ['도망치려 했으나 발이 꼬였다.', 'danger', 200],
              ['등을 세게 부딪히며 옆 칸으로 간신히 넘어갔다.', 'narrator', 500],
            ]);
            await modifyStat('health', -10);
            await modifyStat('sanity', -10);
          }
        }],
        ['상대하지 않고 무시한다', async () => {
          await seq([
            ['고개를 돌렸지만, 그 상대를 가볍게 볼 일이 아니었다. 취객이 어깨를 상하게 후려쳤다.', 'danger', 200],
          ]);
          await modifyStat('health', -15);
        }],
        ...(G.companions && G.companions.length > 0 ? [[`동행자 ${G.companions[0].name}에게 도와달라고 소리친다`, async () => {
          const comp = G.companions[0];
          await seq([
            [`"${comp.name}! 도와주세요!" 당신의 외침에 그가 취객의 어깨를 밀쳤다.`, 'narrator', 200],
            [`취객과 ${comp.name}이(가) 엉켜 바닥을 굴렀다.`, 'danger', 500],
          ]);
          await modifyStat('sanity', -5);
          await print(`${comp.name}의 옷이 찢어지고 상처가 났다.`, 'danger');
        }]] : []),
      ]);
    }
  },

  /* ── 2. 버려진 가방 (Puzzle/Risk) ── */
  {
    id: 're_rot_smell',
    tod: 'all', weight: 4,
    async fn() {
      await seq([
        ['', 'blank', 0],
        ['선반 위에 버려진 검은색 백팩이 있다.', 'narrator', 200],
        ['지퍼 틈 사이로 아찔할 만큼 강렬한 단내가 흘러나온다.', 'danger', 500],
      ]);
      const compOptions = G.companions && G.companions.length > 0 ? (G.companions.map(c => [`동행자 ${c.name}에게 시킨다`, async () => {
        await seq([
          [`${c.name}이(가) 긴장한 표정으로 가방에 손을 뻗는다.`, 'narrator', 200],
        ]);
        if (Math.random() < 0.6) {
           await seq([
            [`다행히 가방 안에는 구급약이 들어있었다.`, 'life', 200],
            [`${c.name}이(가) 안도하며 당신에게 건넨다.`, 'narrator', 500],
          ]);
          addItem('비상 구급약');
          await modifyStat('sanity', 5);
        } else {
          await seq([
            [`가방을 열자마자 분홍색 점액이 ${c.name}의 손을 덮쳤다!`, 'death', 200],
            [`${c.name}이(가) 고통스럽게 비명을 지른다.`, 'danger', 500],
          ]);
          await modifyStat('sanity', -20);
          // 동행자 부상 처리 (여기선 간단히 멘트만)
          await print(`${c.name}의 팔에 기괴한 반점이 솟아오른다.`, 'danger');
        }
      }])) : [];

      await choices([
        ['열어본다', async () => {
          if (Math.random() < 0.5) {
            await seq([
              ['가방 안에는 누군가 남긴 구급약과 깨끗한 마스크가 있었다. (단내는 오염된 가방 겉면에서 난 것이었다)', 'life', 200],
              ['유용하게 쓸 수 있을 것 같다.', 'narrator', 500],
            ]);
            await modifyStat('health', 15);
            await modifyStat('infection', -10);
            addItem('비상 구급약');
            G.score += 3; updateStats();
          } else {
            await seq([
              ['지퍼를 열자마자 썩은 꿀 같은 악취가 폐부를 찔렀다.', 'death', 200],
              ['백팩 안쪽은 기괴한 분홍색 점액으로 덮여있었다.', 'danger', 500],
            ]);
            await modifyStat('infection', 25);
            await modifyStat('sanity', -15);
          }
        }],
        ...compOptions,
        ['무시한다', async () => {
          await seq([
            ['단내로부터 멀어지기 위해 반대쪽 끝으로 자리를 옮겼다.', 'narrator', 200],
            ['계속해서 찝찝한 기분이 든다.', 'narrator', 500],
          ]);
          await modifyStat('sanity', -5);
        }],
      ]);
    }
  },

  /* ── 3. 우는 아이 (Good/Emotional) ── */
  {
    id: 're_crying_child',
    tod: 'all', weight: 3,
    async fn() {
      await seq([
        ['', 'blank', 0],
        ['객차 구석에서 마스크가 벗겨진 참인 7살 쯤 된 아이가 혼자 울고 있다.', 'narrator', 200],
        ['주변 사람들은 단내 감염을 두려워하며 아무도 접근하지 않는다.', 'danger', 500],
      ]);
      await choices([
        ['달래준다', async () => {
          let extra = '';
          if (G.playerGender === '여성' || G.playerAge === '40대' || G.playerAge === '50대 이상') {
            extra = '능숙하고 부드럽게 아이를 안심시켰다. 아이가 울음을 멈추고 웃었다.';
          } else {
            extra = '서툴지만 최선을 다해 아이를 달랬다. 아이가 조용히 고개를 끄덕였다.';
          }
          await seq([
            [extra, 'life', 200],
            ['마스크를 다시 씌워주려 가까이 다가갔을 때, 아이에게서 미약한 단내가 훅 끼쳤다.', 'danger', 500],
            ['하지만 후회하지 않는다.', 'highlight', 800],
          ]);
          await modifyStat('infection', 15);
          await modifyStat('sanity', 20);
          G.score += 5; updateStats();
          G.flags.helped_child = true;
        }],
        ['나도 피한다', async () => {
          await print('모두가 그렇듯, 나도 시선을 거뒀다. 어쩔 수 없는 일이다.', 'narrator');
          await modifyStat('sanity', -10);
          G.flags.ignored_child = true;
        }],
      ]);
    }
  },

  /* ── 4. 자리 양보 (Comic/Routine) ── */
  {
    id: 're_seat_offer_new',
    tod: 'all', weight: 4,
    async fn() {
      await seq([
        ['', 'blank', 0],
        ['무거운 짐을 든 백발의 노인이 힘겹게 버티고 섰다.', 'narrator', 200],
        ['마침 내 자리가 유일하게 앉을 수 있는 곳이다.', 'narrator', 500],
      ]);
      await choices([
        ['자리를 양보한다', async () => {
          if (G.playerAge === '50대 이상') {
            await seq([
              ['"어휴, 나이도 있는 양반이 앉으셔야지." 서로 양보하는 진풍경이 벌어졌다.', 'highlight', 200],
              ['결국 짐만 들어드리기로 했다.', 'narrator', 500],
            ]);
            await modifyStat('sanity', 15);
          } else {
            await seq([
              ['자리에서 일어섰다. 노인이 고맙다며 박하사탕을 하나 쥐어주셨다.', 'life', 200],
              ['오랜만에 보는 평범한 일상이 박하사탕처럼 입안을 감돈다.', 'narrator', 500],
            ]);
            await modifyStat('health', -5); 
            await modifyStat('sanity', 10);
            await modifyStat('infection', -5);
          }
          G.score += 3; updateStats();
        }],
        ['못 본 척 눈을 감는다', async () => {
          await seq([
            ['위험한 상황에 체력을 아끼는 것도 생존법이다.', 'narrator', 200],
            ['하지만 마음 한구석이 불편한 건 어쩔 수 없다.', 'narrator', 500],
          ]);
          await modifyStat('sanity', -5);
        }],
      ]);
    }
  },

  /* ── 5. 정체불명의 안개 (Dangerous) ── */
  {
    id: 're_sudden_gas',
    tod: 'all', weight: 4,
    async fn() {
      await seq([
        ['', 'blank', 0],
        ['갑자기 열차 내부 환풍구에서 짙은 분홍색 안개가 뿜어져 나온다.', 'danger', 200],
        ['"단내다!! 숨 참아!!" 누군가 비명을 지른다.', 'highlight', 500],
      ]);
      await choices([
        ['옷깃으로 코와 입을 막고 엎드린다', async () => {
          await seq([
            ['가스를 직접 마시는 것은 피했지만 노출된 피부가 따끔거린다.', 'narrator', 200],
          ]);
          await modifyStat('health', -10);
          await modifyStat('infection', 5);
        }],
        ['당황하여 숨을 들이마신다', async () => {
          await seq([
            ['달콤하고 역겨운 냄새가 폐 속 깊이 들어왔다.', 'death', 200],
            ['눈앞이 핑 돌며 이성이 흔들린다.', 'danger', 500],
          ]);
          await modifyStat('health', -15);
          await modifyStat('infection', 20);
          await modifyStat('sanity', -20);
        }],
      ]);
    }
  },

  /* ── 6. 급정거 (Risk) ── */
  {
    id: 're_sudden_brake_new',
    tod: 'all', weight: 4,
    async fn() {
      await seq([
        ['', 'blank', 0],
        ['끼익-!! 고막을 찢는 마찰음과 함께 열차가 급정거한다.', 'danger', 200],
        ['비명과 함께 사람들과 짐이 한쪽으로 쏠리며 아수라장이 된다.', 'narrator', 500],
      ]);
      await choices([
        ['손잡이를 꽉 잡는다', async () => {
          if (G.playerAge === '50대 이상' || G.playerAge === '40대') {
            await seq([
              ['필사적으로 버텼으나 나이에 따른 반사 신경 부족으로 어깨와 허리에 무리가 갔다.', 'danger', 200],
            ]);
            await modifyStat('health', -15);
          } else {
            await seq([
              ['재빠르게 중심을 잡고 팔 근육에 강한 힘을 주어 넘어지는 것을 막아냈다.', 'highlight', 200],
            ]);
            await modifyStat('health', -5);
          }
        }],
        ['옆으로 쓰러지는 사람을 감싸 안는다', async () => {
          await seq([
            ['넘어지려던 승객을 몸으로 버텨줬다.', 'life', 200],
            ['덕분에 바닥에 구른 사람이 적었지만, 당신의 등은 문에 세게 부딪혔다.', 'danger', 500],
          ]);
          await modifyStat('health', -15);
          await modifyStat('sanity', 15);
          G.score += 4; updateStats();
        }],
      ]);
    }
  },

  /* ── 7. 환각과 속삭임 (Night/Dawn 전용) ── */
  {
    id: 're_hallucination',
    tod: ['dawn', 'night'], weight: 3,
    async fn() {
      await seq([
        ['', 'blank', 0],
        ['창밖 유리창에 비친 당신의 얼굴이 어딘가 기괴하게 일그러져 있다.', 'danger', 200],
        ['마치 당신을 비웃듯, 거울 속 당신이 입 모양으로 속삭인다.', 'narrator', 500],
        ['"너도 결국 달콤하게 썩어갈 거야..."', 'death', 800],
      ]);
      await choices([
        ['눈을 질끈 감는다', async () => {
          await seq([
            ['환각이다. 단내 바이러스의 초기 인지 조작일 뿐이다.', 'narrator', 200],
            ['심호흡을 하고 눈을 뜨자 핼쑥해진 당신의 진짜 얼굴만 보였다.', 'narrator', 500],
          ]);
          await modifyStat('sanity', -10);
        }],
        ['유리창을 주먹으로 내리친다', async () => {
          await seq([
            ['쾅! 소리와 함께 주먹이 얼얼하다. 유리는 깨지지 않았다.', 'danger', 200],
            ['사람들이 공포에 질린 눈으로 당신을 쳐다본다. 깊은 후회가 몰려온다.', 'narrator', 500],
          ]);
          await modifyStat('health', -5);
          await modifyStat('sanity', -20);
        }],
      ]);
    }
  },

  /* ── 8. [시간제한] 쓰러진 남자 (도덕 딜레마) ── */
  {
    id: 're_collapse_man',
    tod: 'all', weight: 4,
    async fn() {
      await seq([
        ['', 'blank', 0],
        ['앞 좌석의 중년 남자가 소리 없이 쓰러졌다.', 'danger', 200],
        ['다른 승객들은 모두 고개를 숙이고 있다. 아무도 보지 않는다.', 'narrator', 500],
        ['', 'blank', 700],
      ]);
      markStationDanger(G.currentStation, 1);

      await timedChoices([
        ['🚶 일어나 다가간다', async () => {
          const hasAlcohol = hasItem('소독용 알코올') || hasItem('수술용 장갑');
          if (G.playerJob === '간호사' || G.playerJob === '의대생' || G.playerJob === '소방관') {
            await seq([
              ['직업적 반사 신경으로 즉시 남자의 상태를 확인했다.', 'highlight', 200],
              ['맥박이 약하다. 신속히 응급조치를 취했다.', 'life', 500],
              ['차내 방송이 울리며 다음 역에서 구급대원이 대기했다.', 'narrator', 800],
            ]);
            await modifyStat('sanity', 15);
            await modifyStat('infection', hasAlcohol ? 5 : 15);
            G.score += 8; updateStats();
          } else {
            await seq([
              ['가까이 다가가자 그의 코와 입 주변에서 단내가 훅 끼쳤다.', 'danger', 200],
              ['침착하게 손으로 그를 부축하고 비상 버튼을 눌렀다.', 'narrator', 500],
            ]);
            await modifyStat('sanity', 10);
            await modifyStat('infection', hasAlcohol ? 5 : 20);
            G.score += 5; updateStats();
          }
          G.flags.helped_man = true;
        }],
        ['🎧 못 본 척 이어폰을 낀다', async () => {
          await seq([
            ['이어폰 볼륨을 높였다. 음악 소리가 모든 것을 덮어버린다.', 'narrator', 200],
            ['열차가 다음 역에 멈췄을 때 남자는 이미 창백했다.', 'death', 500],
          ]);
          await modifyStat('sanity', -20);
          markStationDanger(G.currentStation, 2);
          G.flags.ignored_man = true;
        }],
        ['📞 비상 인터폰을 누른다', async () => {
          await seq([
            ['\"승객 중 한 분이 倒れ셨습니다. 3호차 여부 확인 요청합니다.\"', 'highlight', 200],
            ['기관사의 목소리가 차내에 울렸다. 몇몇 승객이 몸을 돌렸다.', 'narrator', 500],
          ]);
          await modifyStat('sanity', 5);
          G.score += 3; updateStats();
        }],
        ['🔍 그를 자세히 살펴본다', async () => {
          await seq([
            ['남자의 얼굴을 자세히 들여다봤다.', 'narrator', 200],
            ['눈가에 분홍빛 반점. 단내 감염의 말기 증상이다.', 'death', 500],
            ['공포가 등줄기를 타고 흘렀다.', 'danger', 800],
          ]);
          await modifyStat('sanity', -10);
          await modifyStat('infection', 5);
          markStationDanger(G.currentStation, 3);
        }],
        ...(G.companions && G.companions.length > 0 ? [[`👥 동행자 ${G.companions[0].name}에게 확인을 맡긴다`, async () => {
          const comp = G.companions[0];
          await seq([
            [`"${comp.name}님, 저분 좀 봐주실 수 있나요?" 당신의 부탁에 그가 다가간다.`, 'narrator', 200],
            [`그가 남자의 어깨를 흔들자, 남자가 피를 토하며 ${comp.name}의 얼굴에 뿜어냈다!`, 'death', 500],
          ]);
          await modifyStat('sanity', -20);
          await print(`${comp.name}이(가) 비명을 지르며 뒤로 넘어졌다.`, 'danger');
        }]] : []),
        // 시간초과 기본값
        ['⏰ ...아무것도 하지 않았다', async () => {
          await seq([
            ['시간이 흘렀다. 결국 아무것도 하지 않았다.', 'death', 200],
            ['나 자신이 낯설게 느껴진다.', 'narrator', 500],
          ]);
          await modifyStat('sanity', -25);
          G.flags.ignored_man = true;
        }, 'default'],
      ], 10);
    }
  },

  /* ── 9. [시간제한] 버려진 가방과 째깍거리는 소리 ── */
  {
    id: 're_ticking_bag',
    tod: ['morning','evening','night'], weight: 3,
    async fn() {
      await seq([
        ['', 'blank', 0],
        ['선반 위 검은 가방에서 규칙적인 째깍 소리가 들린다.', 'danger', 200],
        ['다른 승객들이 눈치를 주고받기 시작한다.', 'narrator', 500],
        ['', 'blank', 700],
      ]);
      markStationDanger(G.currentStation, 2);

      await timedChoices([
        ['🏃 즉시 다른 칸으로 피한다', async () => {
          await seq([
            ['재빠르게 칸을 이동했다. 몇 사람이 따라왔다.', 'narrator', 200],
            ['30초 뒤, 별다른 일은 없었다. 알람 시계였다.', 'highlight', 500],
          ]);
          await modifyStat('sanity', -5);
        }],
        ['🔎 가까이 다가가 확인한다', async () => {
          if (G.playerJob === '형사' || G.playerJob === '소방관') {
            await seq([
              ['훈련받은 눈으로 가방을 점검했다. 낡은 손목시계였다.', 'life', 200],
              ['\"아무것도 아닙니다\"라고 조용히 말했다. 승객들이 안도했다.', 'narrator', 500],
            ]);
            await modifyStat('sanity', 10);
            G.score += 4; updateStats();
          } else {
            await seq([
              ['가방을 열었다. 낡은 손목시계와 도시락 통이 나왔다.', 'narrator', 200],
              ['헛된 긴장이었다. 하지만 심장은 아직 두근거린다.', 'narrator', 500],
            ]);
            await modifyStat('sanity', -5);
          }
        }],
        ['📣 큰소리로 "가방 주인 있어요?" 묻는다', async () => {
          await seq([
            ['아무도 대답하지 않았다. 차내가 더 싸늘해졌다.', 'narrator', 200],
          ]);
          await modifyStat('sanity', -10);
        }],
        ['⏰ ...그냥 앉아서 기다린다', async () => {
          await seq([
            ['아무것도 하지 않고 눈을 감았다. 째깍째깍... 째깍째깍...', 'death', 200],
            ['결국 멈췄다. 식은땀이 흘렀다.', 'narrator', 500],
          ]);
          await modifyStat('sanity', -15);
        }, 'default'],
      ], 8);
    }
  },

  /* ── 10. [새벽 전용] 청소 노동자와의 대화 ── */
  {
    id: 're_dawn_cleaner',
    tod: ['dawn'], weight: 5,
    async fn() {
      await seq([
        ['', 'blank', 0],
        ['새벽 첫차에는 청소복 차림의 사람들이 가득하다.', 'narrator', 200],
        ['옆에 앉은 중년 여성이 지친 눈으로 당신을 쳐다본다.', 'narrator', 500],
        ['"어디 가세요? 이 시간에 첫차 타는 사람은 다 사연이 있지."', 'dialog', 800],
      ]);
      await choices([
        ['"저도 노동자입니다"', async () => {
          const match = G.playerJob === '청소 노동자' || G.playerJob === '퀵배달 기사' || G.playerJob === '편의점 알바생';
          if (match) {
            await seq([
              ['"어이구, 고생이 많지. 우리 같은 사람들이 세상을 돌리는 거야."', 'dialog', 200],
              ['여성이 주머니에서 핫팩을 꺼내 건넸다.', 'life', 500],
            ]);
            await modifyStat('sanity', 15);
            await modifyStat('health', 5);
            addItem('핫팩');
          } else {
            await seq([
              ['"그래요. 다들 힘들죠 뭐."', 'dialog', 200],
            ]);
            await modifyStat('sanity', 5);
          }
        }],
        ['창밖을 보며 대답하지 않는다', async () => {
          await seq([
            ['여성이 고개를 숙이고 눈을 감았다. 잠들었다.', 'narrator', 200],
          ]);
          await modifyStat('sanity', -5);
        }],
      ]);
    }
  },

  /* ── 11. [새벽 전용] 잠든 취객과 가방 ── */
  {
    id: 're_dawn_drunk',
    tod: ['dawn'], weight: 4,
    async fn() {
      await seq([
        ['', 'blank', 0],
        ['새벽 첫차 구석에 전날 밤부터 자고 있는 취객이 있다.', 'narrator', 200],
        ['가방이 반쯤 열린 채 지갑이 삐져나와 있다.', 'narrator', 500],
      ]);
      await choices([
        ['지갑을 안전하게 가방 안에 넣어준다', async () => {
          await seq([
            ['조심스럽게 지갑을 넣었다. 취객이 잠꼬대를 했다.', 'narrator', 200],
            ['"...돈 없어... 다 썼어..."', 'dialog', 500],
          ]);
          await modifyStat('sanity', 10);
          G.score += 3; updateStats();
        }],
        ['그냥 무시한다', async () => {
          await seq([
            ['내 일이 아니다.', 'narrator', 200],
          ]);
          await modifyStat('sanity', -5);
        }],
        ['슬쩍 손을 뻗어 지갑을 확인한다', async () => {
          await seq([
            ['지갑 안에는 주민등록증과 영수증만 잔뜩이었다. 돈은 한 푼도 없었다.', 'narrator', 200],
            ['자신이 한없이 초라하게 느껴졌다.', 'narrator', 500],
          ]);
          await modifyStat('sanity', -15);
        }],
      ]);
    }
  },

  /* ── 12. [새벽 전용] 적막한 역사의 발소리 ── */
  {
    id: 're_dawn_footsteps',
    tod: ['dawn'], weight: 3,
    async fn() {
      await seq([
        ['', 'blank', 0],
        ['텅 빈 객차. 형광등이 한 번 깜빡인다.', 'narrator', 200],
        ['창밖 플랫폼에서 발소리가 들렸다. 한 발... 두 발...', 'danger', 500],
        ['열차는 이미 출발 중인데.', 'death', 800],
      ]);
      await choices([
        ['창문을 통해 플랫폼을 확인한다', async () => {
          await seq([
            ['아무도 없었다. 발소리는 사라졌다. 환청이었을까.', 'narrator', 200],
          ]);
          await modifyStat('sanity', -15);
          markStationDanger(G.currentStation, 2);
        }],
        ['눈을 감고 이어폰을 낀다', async () => {
          await seq([
            ['소음을 차단했다. 들리지 않으면 없는 것이다.', 'narrator', 200],
          ]);
          await modifyStat('sanity', -5);
        }],
      ]);
    }
  },

  /* ── 13. [심야 전용] 울고 있는 승객 ── */
  {
    id: 're_night_crying',
    tod: ['night'], weight: 5,
    async fn() {
      await seq([
        ['', 'blank', 0],
        ['막차 객차 끝자리에서 한 여성이 조용히 울고 있다.', 'narrator', 200],
        ['마스크 위로 눈물이 흘러내린다. 주변엔 아무도 없다.', 'narrator', 500],
      ]);
      await choices([
        ['다가가 조용히 옆에 앉는다', async () => {
          await seq([
            ['아무 말 없이 옆에 앉았다. 여성이 잠시 울음을 멈췄다.', 'narrator', 200],
            ['"있어줘서... 고마워요."', 'dialog', 500],
            ['그 한 마디가 이 새벽보다 따뜻했다.', 'highlight', 800],
          ]);
          await modifyStat('sanity', 20);
          G.score += 5; updateStats();
        }],
        ['못 본 척 반대쪽으로 자리를 옮긴다', async () => {
          await seq([
            ['자리를 피했다. 울음 소리가 등 뒤로 멀어졌다.', 'narrator', 200],
          ]);
          await modifyStat('sanity', -10);
        }],
        ['손수건(혹은 티슈)을 건넨다', async () => {
          if (hasItem('손수건') || hasItem('처방전')) {
            await seq([
              ['조용히 건넸다. 여성이 "감사해요"라며 받았다.', 'life', 200],
            ]);
            await modifyStat('sanity', 15);
            G.score += 3; updateStats();
          } else {
            await seq([
              ['아무것도 없었다. 당황해서 그냥 고개를 끄덕였다.', 'narrator', 200],
            ]);
            await modifyStat('sanity', 5);
          }
        }],
      ]);
    }
  },

  /* ── 14. [심야 전용] 아무도 없는 플랫폼 ── */
  {
    id: 're_night_empty_platform',
    tod: ['night'], weight: 4,
    async fn() {
      await seq([
        ['', 'blank', 0],
        ['막차가 한 역을 통과한다. 플랫폼에 아무도 없다.', 'narrator', 200],
        ['...아무도 없는 게 아니다. 플랫폼 끝에 누군가 서 있다.', 'danger', 500],
        ['열차가 속도를 줄이지 않고 통과한다. 그 사람은 움직이지 않는다.', 'death', 800],
      ]);

      markStationDanger(G.currentStation, 2);

      await choices([
        ['창문에 바짝 붙어 그 사람을 확인하려 한다', async () => {
          await seq([
            ['열차가 너무 빨리 지나쳐 얼굴을 볼 수 없었다.', 'narrator', 200],
            ['하지만 그 순간 분명히 눈이 마주쳤다는 느낌이 든다.', 'death', 500],
          ]);
          await modifyStat('sanity', -20);
          markStationDanger(G.currentStation, 3);
        }],
        ['아무것도 못 본 척 눈을 돌린다', async () => {
          await seq([
            ['없는 것으로 하자.', 'narrator', 200],
          ]);
          await modifyStat('sanity', -10);
        }],
      ]);
    }
  },

  /* ── 15. 새로운 만남 (동행자 합류) ── */
  {
    id: 're_meet_survivor',
    tod: 'all', weight: 4,
    async fn() {
      const gList = G.companions.map(c => c.gender);
      const maleCount = gList.filter(g => g === '남성').length;
      const femaleCount = gList.filter(g => g === '여성').length;
      
      // 성비 균형을 맞춘 성별 선택
      let gender = Math.random() < 0.5 ? '남성' : '여성';
      if (maleCount > femaleCount) gender = '여성';
      else if (femaleCount > maleCount) gender = '남성';

      const names = gender === '남성' ? ['박준호', '최현우', '이민형', '정태양'] : ['이지은', '박소윤', '김하늘', '최유리'];
      const name = names[Math.floor(Math.random() * names.length)];
      const jobs = ['직장인', '대학생', '공무원', '휴가 나온 군인', '고등학생'];
      const job = jobs[Math.floor(Math.random() * jobs.length)];

      await seq([
        ['', 'blank', 0],
        [`옆 칸의 연결문이 열리며 땀범벅이 된 한 사람이 다급히 넘어온다.`, 'narrator', 200],
        [`"저기... 제발 부탁이에요. 혼자 있기가 너무 무서워서..."`, 'dialog', 500],
        [`그는 자신을 ${job} ${name}(이)라고 소개하며 동행을 요청한다.`, 'narrator', 800],
      ]);

      if (G.companions.length >= 3) {
        await seq([
          [`하지만 이미 당신 곁에는 세 명이나 있다. 더 이상은 무리다.`, 'danger', 200],
          [`그는 실망한 표정으로 다시 옆 칸으로 돌아갔다.`, 'narrator', 500],
        ]);
        return;
      }

      await choices([
        ['동행을 허락한다', async () => {
          await seq([
            [`"정말 감사합니다... 정말로요."`, 'dialog', 200],
            [`${name}이(가) 당신의 일행에 합류했다.`, 'life', 500],
          ]);
          G.companions.push({ name, gender, job, infection: 0 });
          updateStats();
          await modifyStat('sanity', 10);
        }],
        ['거절하고 내쫓는다', async () => {
          await seq([
            [`"이 상황에서 누굴 믿으라고... 미안하지만 각자도생합시다."`, 'narrator', 200],
            [`그는 절망적인 표정으로 플랫폼 바닥을 향해 고개를 떨궜다.`, 'death', 500],
          ]);
          await modifyStat('sanity', -15);
        }],
      ]);
    }
  },

  /* ── 16. 동행자의 위기 (딜레마) ── */
  {
    id: 're_companion_crisis',
    tod: 'all', weight: 3,
    async fn() {
      if (G.companions.length === 0) {
        // 동행자가 없으면 다른 이벤트로 대체 (재귀 호출 대신 그냥 패스)
        return await RANDOM_EVENT_POOL.find(e => e.id === 're_rot_smell').fn();
      }

      const comp = G.companions[Math.floor(Math.random() * G.companions.length)];
      await seq([
        ['', 'blank', 0],
        [`갑자기 ${comp.name}이(가) 가슴을 부여잡으며 거칠게 기침을 토해낸다.`, 'danger', 200],
        [`그의 마스크 사이로 진득한 단내가 새어 나오기 시작한다.`, 'death', 500],
        [`"콜록... 아, 아니에요... 그냥 사레들린 거예요..."`, 'dialog', 800],
      ]);

      await choices([
        ['진정시키고 끝까지 함께한다', async () => {
          await seq([
            [`그를 꽉 안아주며 진정시켰다. 다행히 발작은 멈췄지만, 그의 몸에선 은은한 단내가 계속 난다.`, 'life', 200],
            [`당신도 그 소용돌이 속에 함께 휘말릴 위험이 크다.`, 'danger', 500],
          ]);
          await modifyStat('infection', 15);
          await modifyStat('sanity', 20);
        }],
        ['다음 역에서 하차시킨다 (추방)', async () => {
          await seq([
            [`"미안하지만... 다른 승객들을 위해서라도 여기서 내려야겠어요."`, 'narrator', 200],
            [`${comp.name}은(는) 아무 말 없이 다음 역 플랫폼에 버려졌다. 닫히는 문 너머로 그의 눈망울이 잊히질 않는다.`, 'death', 500],
          ]);
          G.companions = G.companions.filter(c => c.name !== comp.name);
          updateStats();
          await modifyStat('sanity', -30);
        }],
      ]);
    }
  },

];


/* ──────────────────────────────────────────
   랜덤 소사건 발동 함수
   30% 확률 / 같은 사건 연속 안 나오게
   ────────────────────────────────────────── */
let _lastRandomId = null;

async function maybeRandomEvent() {
  // 30% 확률
  if (Math.random() > 0.30) return;

  const tod = G.timeOfDay || 'noon';

  // 현재 시간대에 맞는 풀 필터링
  const pool = RANDOM_EVENT_POOL.filter(e =>
    (e.tod === 'all' || e.tod.includes(tod)) && e.id !== _lastRandomId
  );
  if (!pool.length) return;

  // 가중치 기반 선택
  const totalWeight = pool.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * totalWeight;
  let chosen = pool[pool.length - 1];
  for (const ev of pool) {
    r -= ev.weight;
    if (r <= 0) { chosen = ev; break; }
  }

  _lastRandomId = chosen.id;

  // 소사건 구분선
  TrainPanel.addLog('차내 소사건 발생', 'info');
  await print('──────────────────', 'divider');
  await print(`${getTOD().emoji} 차내 소사건`, 'system');

  await chosen.fn();

  await print('──────────────────', 'divider');
  await print('', 'blank');
}
