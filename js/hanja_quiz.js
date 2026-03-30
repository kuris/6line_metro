'use strict';

/* ═══════════════════════════════════════════════════
   hanja_quiz.js — 6호선 한자 퀴즈 데이터 및 실행 로직
   ═══════════════════════════════════════════════════ */

const stationKanji = {
  "응암": { hanja: "鷹岩", meaning: "매 응, 바위 암", hint: "매가 앉던 바위", sanityBonus: 5, fakes: ["응할 응, 어두울 암", "가슴 응, 암자 암"] },
  "역촌": { hanja: "驛村", meaning: "역 역, 마을 촌", hint: "역 옆 마을", sanityBonus: 5, fakes: ["거스릴 역, 마디 촌", "역병 역, 마을 촌"] },
  "불광": { hanja: "佛光", meaning: "부처 불, 빛 광", hint: "부처의 빛", sanityBonus: 5, fakes: ["아닐 불, 미칠 광", "떨칠 불, 넓을 광"] },
  "독바위": { hanja: "獨바위", meaning: "홀로 독", hint: "홀로 선 바위", sanityBonus: 5, fakes: ["독 독", "독기 독"] },
  "연신내": { hanja: "延新內", meaning: "늘일 연, 새 신, 안 내", hint: "새롭게 뻗은 안쪽", sanityBonus: 5, fakes: ["제비 연, 귀신 신, 내 천", "연기 연, 매울 신, 견딜 내"] },
  "구산": { hanja: "龜山", meaning: "거북 구, 산 산", hint: "거북이 모양의 산", sanityBonus: 5, fakes: ["아홉 구, 산 산", "구원할 구, 뫼 산"] },
  "새절": { hanja: "새절", meaning: "순우리말", hint: "새로 지은 절", sanityBonus: 5 },
  "증산": { hanja: "甑山", meaning: "시루 증, 산 산", hint: "시루 모양의 산", sanityBonus: 5, fakes: ["더할 증, 산 산", "증세 증, 뫼 산"] },
  "디지털미디어시티": { hanja: "-", meaning: "외래어", hint: "-", sanityBonus: 0 },
  "월드컵경기장": { hanja: "-", meaning: "외래어", hint: "-", sanityBonus: 0 },
  "마포구청": { hanja: "麻浦區廳", meaning: "삼 마, 포구 포", hint: "삼이 자라던 포구", sanityBonus: 5, fakes: ["말 마, 안을 포", "마귀 마, 대포 포"] },
  "망원": { hanja: "望遠", meaning: "바랄 망, 멀 원", hint: "멀리 바라보다", sanityBonus: 5, fakes: ["망할 망, 으뜸 원", "그물 망, 동산 원"] },
  "합정": { hanja: "合井", meaning: "합할 합, 우물 정", hint: "우물이 합쳐지는 곳", sanityBonus: 5, fakes: ["조개 합, 바를 정", "합할 합, 뜰 정"] },
  "상수": { hanja: "上水", meaning: "위 상, 물 수", hint: "위쪽 물가", sanityBonus: 5, fakes: ["서로 상, 빼어날 수", "코끼리 상, 목숨 수"] },
  "광흥창": { hanja: "廣興倉", meaning: "넓을 광, 일어날 흥, 창고 창", hint: "넓고 번성한 창고", sanityBonus: 5, fakes: ["빛 광, 기쁠 흥, 부를 창", "미칠 광, 일어날 흥, 창 창"] },
  "대흥": { hanja: "大興", meaning: "클 대, 일어날 흥", hint: "크게 번성하다", sanityBonus: 5, fakes: ["대신할 대, 기쁠 흥", "띠 대, 일어날 흥"] },
  "공덕": { hanja: "孔德", meaning: "구멍 공, 덕 덕", hint: "덕이 깊은 곳", sanityBonus: 5, fakes: ["빌 공, 큰 덕", "장인 공, 얻을 덕"] },
  "효창공원앞": { hanja: "孝昌公園", meaning: "효도 효, 창성할 창", hint: "효도가 창성한 공원", sanityBonus: 5, fakes: ["새벽 효, 부를 창", "본받을 효, 슬플 창"] },
  "삼각지": { hanja: "三角地", meaning: "석 삼, 뿔 각, 땅 지", hint: "세 갈래로 나뉜 땅", sanityBonus: 5, fakes: ["석 삼, 깨달을 각, 알 지", "석 삼, 물리칠 각, 지탱할 지"] },
  "신용산": { hanja: "新龍山", meaning: "새 신, 용 룡, 산 산", hint: "새로운 용의 산", sanityBonus: 5, fakes: ["매울 신, 얼굴 용, 산 산", "믿을 신, 쓸 용, 뫼 산"] },
  "이태원": { hanja: "梨泰院", meaning: "배나무 이, 클 태, 집 원", hint: "배나무가 있던 큰 집", sanityBonus: 5, fakes: ["다를 이, 편안할 태, 근원 원", "오얏 이, 태아 태, 동산 원"] },
  "한강진": { hanja: "漢江鎭", meaning: "한나라 한, 강 강, 진영 진", hint: "한강을 지키던 진영", sanityBonus: 5, fakes: ["찰 한, 부딪칠 강, 참 진", "원통할 한, 굳셀 강, 떨칠 진"] },
  "버티고개": { hanja: "-", meaning: "순우리말", hint: "버티며 넘던 고개", sanityBonus: 0 },
  "약수": { hanja: "藥水", meaning: "약 약, 물 수", hint: "약이 되는 물", sanityBonus: 5, fakes: ["맺을 약, 마칠 수", "같을 약, 머리 수"] },
  "청구": { hanja: "靑丘", meaning: "푸를 청, 언덕 구", hint: "푸른 언덕", sanityBonus: 5, fakes: ["맑을 청, 아홉 구", "들을 청, 구할 구"] },
  "신당": { hanja: "新堂", meaning: "새로울 신, 집 당", hint: "새로운 집", sanityBonus: 5, fakes: ["귀신 신, 무리 당", "믿을 신, 마땅 당"] },
  "동묘앞": { hanja: "東廟", meaning: "동녘 동, 사당 묘", hint: "동쪽의 사당", sanityBonus: 5, fakes: ["움직일 동, 묘할 묘", "아이 동, 무덤 묘"] },
  "창신": { hanja: "昌信", meaning: "창성할 창, 믿을 신", hint: "창성하고 믿음직한", sanityBonus: 5, fakes: ["부를 창, 새 신", "슬플 창, 귀신 신"] },
  "보문": { hanja: "普門", meaning: "넓을 보, 문 문", hint: "넓은 문", sanityBonus: 5, fakes: ["걸음 보, 글월 문", "지킬 보, 들을 문"] },
  "안암": { hanja: "安岩", meaning: "편안 안, 바위 암", hint: "편안한 바위", sanityBonus: 5, fakes: ["눈 안, 어두울 암", "기러기 안, 암자 암"] },
  "고려대": { hanja: "高麗大", meaning: "높을 고, 고울 려", hint: "고려대학교", sanityBonus: 5, fakes: ["옛 고, 나그네 려", "쓸 고, 아름다울 려"] },
  "월곡": { hanja: "月谷", meaning: "달 월, 골짜기 곡", hint: "달빛 드는 골짜기", sanityBonus: 5, fakes: ["넘을 월, 굽을 곡", "가로되 월, 곡식 곡"] },
  "상월곡": { hanja: "上月谷", meaning: "위 상, 달 월, 골짜기 곡", hint: "위쪽 달빛 골짜기", sanityBonus: 5, fakes: ["항상 상, 한 달 월, 굽을 곡", "코끼리 상, 넘을 월, 곡식 곡"] },
  "돌곶이": { hanja: "-", meaning: "순우리말", hint: "돌이 꽂혀있는 곳", sanityBonus: 0 },
  "석계": { hanja: "石溪", meaning: "돌 석, 시내 계", hint: "돌이 많은 시내", sanityBonus: 5, fakes: ["저녁 석, 이을 계", "자리 석, 닭 계"] },
  "태릉입구": { hanja: "泰陵入口", meaning: "클 태, 능 릉", hint: "태릉으로 들어가는 입구", sanityBonus: 5, fakes: ["모양 태, 언덕 릉", "태아 태, 능할 능"] },
  "화랑대": { hanja: "花郞臺", meaning: "꽃 화, 사내 랑, 대 대", hint: "화랑이 머물던 대", sanityBonus: 5, fakes: ["불 화, 파도 랑, 대신할 대", "그림 화, 밝을 랑, 띠 대"] },
  "봉화산": { hanja: "烽火山", meaning: "봉화 봉, 불 화, 산 산", hint: "봉화를 올리던 산", sanityBonus: 5, fakes: ["봉황 봉, 꽃 화, 뫼 산", "받들 봉, 화할 화, 산 산"] }
};

/* 무작위 오답 생성을 위해 한자가 있는 역의 데이터만 배열로 변환 */
const kanjiList = Object.values(stationKanji).filter(k => k.hanja !== "-" && k.sanityBonus > 0 && k.meaning !== "순우리말");

async function maybeRunHanjaQuiz(st) {
  // 퀴즈 빈도 설정이 0이거나 데이터가 없으면 실행 안 함
  const freq = G.hanjaQuizFreq ?? 1.0;
  if (freq <= 0) return false;
  
  // 랜덤 확률 체크
  if (Math.random() > freq) return false;

  const data = stationKanji[st.name];
  // 한자가 없거나 보너스가 0인 곳(순우리말, 외래어 등)은 스킵 (퀴즈 생성 애매함)
  if (!data || data.hanja === "-" || data.sanityBonus <= 0 || data.meaning === "순우리말") return false;

  TrainPanel.addLog(`[승객 식별 제어] 문자 해독 모듈 가동`, 'warn');
  sfx.modem();
  
  let options = [{ text: `${data.meaning}`, correct: true }];

  if (data.fakes && data.fakes.length > 0) {
    // 맞춤형 동음이의어 오답 추가
    let shuffledFakes = [...data.fakes].sort(() => 0.5 - Math.random());
    let selectedFakes = shuffledFakes.slice(0, 2);
    selectedFakes.forEach(fake => {
      options.push({ text: fake, correct: false });
    });
  } else {
    // 예비용 로직: fakes가 없을 경우 다른 역명에서 뜻을 무작위 추출
    let distractors = [];
    let attempts = 0;
    while (distractors.length < 2 && attempts < 50) {
      const r = kanjiList[Math.floor(Math.random() * kanjiList.length)];
      if (r.hanja !== data.hanja && !distractors.find(d => d.meaning === r.meaning)) {
        distractors.push(r);
      }
      attempts++;
    }
    distractors.forEach(d => {
      options.push({ text: `${d.meaning}`, correct: false });
    });
  }
  
  // 섞기
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  
  // "모르겠다" 옵션 항상 마지막에
  options.push({ text: "모르겠다", correct: false, isGiveUp: true });

  await seq([
    ['', 'blank', 200],
    [`"...다음 역은 ${st.name}, ${st.name}역입니다."`, 'announce', 500],
    [`${st.name}... ${data.hanja}.`, 'narrator', 800],
    ['어떤 뜻이더라.', 'system', 1100],
    ['', 'blank', 1300]
  ]);

  return new Promise(resolve => {
    const choiceOpts = options.map((opt, idx) => {
      const label = `${idx + 1}) ${opt.text}`;
      return [
        label,
        async () => {
          if (opt.correct) {
            G.hanjaAttempts++;
            G.hanjaSuccess++;
            G.sanity = Math.min(100, G.sanity + data.sanityBonus);
            updateStats();
            TrainPanel.addLog('[문자 해독 승인] 출구 인식 허가', 'life');
            sfx.item();
            await seq([
              [`맞아, ${data.hanja} (${data.meaning}).`, 'highlight', 200],
              [`${data.hint}라는 의미지. 출구 방향이 읽히기 시작했다.`, 'narrator', 500],
              ['문자를 이해하자 눈앞의 표지판이 더 이상 낯설지 않다. 안도감이 든다.', 'result', 800],
              [`+${data.sanityBonus} 정신력 회복`, 'life', 1100],
              ['', 'blank', 1300]
            ]);
            resolve(true);
          } else if (opt.isGiveUp) {
            G.hanjaAttempts++;
            G.hanjaFail++;
            G.sanity = Math.max(0, G.sanity - 3);
            updateStats();
            TrainPanel.addLog('[해독 실패] 대체 경로 탐색 불가', 'warn');
            sfx.boom(0.1);
            await seq([
              ['모르겠다. 애초에 한자를 잘 아는 것도 아니었고.', 'narrator', 200],
              ['당신은 아직 이 역의 문자를 온전히 읽을 수 없다. 거대한 구조물이 나를 거부하는 느낌.', 'death', 500],
              ['-3 정신력 감소', 'death', 800],
              ['', 'blank', 1000]
            ]);
            resolve(true);
          } else {
            G.hanjaAttempts++;
            G.hanjaFail++;
            G.sanity = Math.max(0, G.sanity - 3);
            updateStats();
            TrainPanel.addLog('[해독 실패] 대체 경로 탐색 불가', 'warn');
            sfx.boom(0.1);
            await seq([
              [`${opt.text}... 였던가?`, 'narrator', 200],
              ['아니, 문자가 뒤틀려 보인다. 표지판이 의미 없는 기호로 부서진다.', 'death', 500],
              ['잘못된 해독은 오히려 생존 본능을 교란시킨다.', 'death', 800],
              ['-3 정신력 감소', 'death', 1100],
              ['', 'blank', 1300]
            ]);
            resolve(true);
          }
        }
      ];
    });

    choices(choiceOpts);
  });
}
