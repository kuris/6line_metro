'use strict';

/* ═══════════════════════════════════════════════════
   hanja_quiz.js — 6호선 한자 퀴즈 데이터 및 실행 로직
   ═══════════════════════════════════════════════════ */

const stationKanji = {
  "응암": { hanja: "鷹岩", meaning: "매 응, 바위 암", hint: "매가 앉던 바위", sanityBonus: 5 },
  "역촌": { hanja: "驛村", meaning: "역 역, 마을 촌", hint: "역 옆 마을", sanityBonus: 5 },
  "불광": { hanja: "佛光", meaning: "부처 불, 빛 광", hint: "부처의 빛", sanityBonus: 5 },
  "독바위": { hanja: "獨바위", meaning: "홀로 독", hint: "홀로 선 바위", sanityBonus: 5 },
  "연신내": { hanja: "延新內", meaning: "늘일 연, 새 신, 안 내", hint: "새롭게 뻗은 안쪽", sanityBonus: 5 },
  "구산": { hanja: "龜山", meaning: "거북 구, 산 산", hint: "거북이 모양의 산", sanityBonus: 5 },
  "새절": { hanja: "새절", meaning: "순우리말", hint: "새로 지은 절", sanityBonus: 5 },
  "증산": { hanja: "甑山", meaning: "시루 증, 산 산", hint: "시루 모양의 산", sanityBonus: 5 },
  "디지털미디어시티": { hanja: "-", meaning: "외래어", hint: "-", sanityBonus: 0 },
  "월드컵경기장": { hanja: "-", meaning: "외래어", hint: "-", sanityBonus: 0 },
  "마포구청": { hanja: "麻浦區廳", meaning: "삼 마, 포구 포", hint: "삼이 자라던 포구", sanityBonus: 5 },
  "망원": { hanja: "望遠", meaning: "바랄 망, 멀 원", hint: "멀리 바라보다", sanityBonus: 5 },
  "합정": { hanja: "合井", meaning: "합할 합, 우물 정", hint: "우물이 합쳐지는 곳", sanityBonus: 5 },
  "상수": { hanja: "上水", meaning: "위 상, 물 수", hint: "위쪽 물가", sanityBonus: 5 },
  "광흥창": { hanja: "廣興倉", meaning: "넓을 광, 일어날 흥, 창고 창", hint: "넓고 번성한 창고", sanityBonus: 5 },
  "대흥": { hanja: "大興", meaning: "클 대, 일어날 흥", hint: "크게 번성하다", sanityBonus: 5 },
  "공덕": { hanja: "孔德", meaning: "구멍 공, 덕 덕", hint: "덕이 깊은 곳", sanityBonus: 5 },
  "효창공원앞": { hanja: "孝昌公園", meaning: "효도 효, 창성할 창", hint: "효도가 창성한 공원", sanityBonus: 5 },
  "삼각지": { hanja: "三角地", meaning: "석 삼, 뿔 각, 땅 지", hint: "세 갈래로 나뉜 땅", sanityBonus: 5 },
  "신용산": { hanja: "新龍山", meaning: "새 신, 용 룡, 산 산", hint: "새로운 용의 산", sanityBonus: 5 },
  "이태원": { hanja: "梨泰院", meaning: "배나무 이, 클 태, 집 원", hint: "배나무가 있던 큰 집", sanityBonus: 5 },
  "한강진": { hanja: "漢江鎭", meaning: "한나라 한, 강 강, 진영 진", hint: "한강을 지키던 진영", sanityBonus: 5 },
  "버티고개": { hanja: "-", meaning: "순우리말", hint: "버티며 넘던 고개", sanityBonus: 0 },
  "약수": { hanja: "藥水", meaning: "약 약, 물 수", hint: "약이 되는 물", sanityBonus: 5 },
  "청구": { hanja: "靑丘", meaning: "푸를 청, 언덕 구", hint: "푸른 언덕", sanityBonus: 5 },
  "신당": { hanja: "新堂", meaning: "새로울 신, 집 당", hint: "새로운 집", sanityBonus: 5 },
  "동묘앞": { hanja: "東廟", meaning: "동녘 동, 사당 묘", hint: "동쪽의 사당", sanityBonus: 5 },
  "창신": { hanja: "昌信", meaning: "창성할 창, 믿을 신", hint: "창성하고 믿음직한", sanityBonus: 5 },
  "보문": { hanja: "普門", meaning: "넓을 보, 문 문", hint: "넓은 문", sanityBonus: 5 },
  "안암": { hanja: "安岩", meaning: "편안 안, 바위 암", hint: "편안한 바위", sanityBonus: 5 },
  "고려대": { hanja: "高麗大", meaning: "높을 고, 고울 려", hint: "고려대학교", sanityBonus: 5 },
  "월곡": { hanja: "月谷", meaning: "달 월, 골짜기 곡", hint: "달빛 드는 골짜기", sanityBonus: 5 },
  "상월곡": { hanja: "上月谷", meaning: "위 상, 달 월, 골짜기 곡", hint: "위쪽 달빛 골짜기", sanityBonus: 5 },
  "돌곶이": { hanja: "-", meaning: "순우리말", hint: "돌이 꽂혀있는 곳", sanityBonus: 0 },
  "석계": { hanja: "石溪", meaning: "돌 석, 시내 계", hint: "돌이 많은 시내", sanityBonus: 5 },
  "태릉입구": { hanja: "泰陵入口", meaning: "클 태, 능 릉", hint: "태릉으로 들어가는 입구", sanityBonus: 5 },
  "화랑대": { hanja: "花郞臺", meaning: "꽃 화, 사내 랑, 대 대", hint: "화랑이 머물던 대", sanityBonus: 5 },
  "봉화산": { hanja: "烽火山", meaning: "봉화 봉, 불 화, 산 산", hint: "봉화를 올리던 산", sanityBonus: 5 }
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

  TrainPanel.addLog(`${st.name} — 한자 퀴즈 알림`, 'info');
  sfx.modem();
  
  // 오답 2개 또는 3개 뽑기
  let distractors = [];
  let attempts = 0;
  while (distractors.length < 2 && attempts < 50) {
    const r = kanjiList[Math.floor(Math.random() * kanjiList.length)];
    if (r.hanja !== data.hanja && !distractors.find(d => d.meaning === r.meaning)) {
      distractors.push(r);
    }
    attempts++;
  }
  
  // 문항 구성: 정답 1개 + 오답 2개 + "모르겠다"
  // (한자 형태를 그대로 보여주면 모양 맞추기가 되므로 뜻만 보여줌)
  let options = [
    { text: `${data.meaning}`, correct: true },
    ...distractors.map(d => ({ text: `${d.meaning}`, correct: false }))
  ];
  
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
            G.sanity = Math.min(100, G.sanity + data.sanityBonus);
            updateStats();
            TrainPanel.addLog('한자 의미를 기억해냈다', 'life');
            sfx.item();
            await seq([
              [`맞아, ${data.hanja} (${data.meaning}).`, 'highlight', 200],
              [`${data.hint}라는 뜻이었지.`, 'narrator', 500],
              ['알고 있으면 덜 무섭다. 확실히 기분이 좀 나아진다.', 'result', 800],
              [`+${data.sanityBonus} 정신력 회복`, 'life', 1100],
              ['', 'blank', 1300]
            ]);
            resolve(true);
          } else if (opt.isGiveUp) {
            G.sanity = Math.max(0, G.sanity - 3);
            updateStats();
            TrainPanel.addLog('의미를 전혀 알지 못한다', 'warn');
            sfx.boom(0.1);
            await seq([
              ['모르겠다. 애초에 한자를 잘 아는 것도 아니었고.', 'narrator', 200],
              ['이 역에 대해 아는 게 아무것도 없다는 데서 오는 미지의 불안감.', 'death', 500],
              ['-3 정신력 감소', 'death', 800],
              ['', 'blank', 1000]
            ]);
            resolve(true);
          } else {
            G.sanity = Math.max(0, G.sanity - 3);
            updateStats();
            TrainPanel.addLog('잘못된 기억', 'warn');
            sfx.boom(0.1);
            await seq([
              [`${opt.text}... 였던가?`, 'narrator', 200],
              ['아니, 무언가 틀린 것 같다. 찝찝한 직감이 든다.', 'death', 500],
              ['잘못된 확신은 오히려 불안감을 키운다.', 'death', 800],
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
