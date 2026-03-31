/* ═══════════════════════════════════════════════════
   hanja_quiz.js — 6호선 전 구간(39개 역) 스토리텔링 고도화
   — 지명의 유래(한자/순우리말/외래어)가 플레이어의 생사를 가릅니다.
   — 텍스트 출력 속도 최적화 버전을 유지합니다.
   ═══════════════════════════════════════════════════ */

'use strict';

const stationOrigin = {
  "응암": {
    topic: "鷹岩", meaning: "매 응, 바위 암",
    storyCorrect: "매가 앉던 바위의 강인한 기운이 당신을 보호합니다. 주변의 안개가 걷힙니다.",
    storyFail: "바위 위에 앉은 매의 환영이 당신의 눈을 파먹기 위해 날아듭니다. 지명이 저주로 변합니다.",
    sanityBonus: 5, fakes: ["가슴 응, 어두울 암", "응할 응, 암자 암"]
  },
  "역촌": {
    topic: "驛村", meaning: "역 역, 마을 촌",
    storyCorrect: "옛 역참의 길잡이들이 당신의 앞길을 잠시 비춰줍니다. 전진할 힘을 얻습니다.",
    storyFail: "길을 잃은 역참의 망령들이 한꺼번에 당신의 다리를 붙잡아 궤도 아래로 끌어내립니다.",
    sanityBonus: 5, fakes: ["거스릴 역, 마디 촌", "역병 역, 마을 촌"]
  },
  "불광": {
    topic: "佛光", meaning: "부처 불, 빛 광",
    storyCorrect: "부처의 자비로운 서광이 어둠을 밀어냅니다. 영혼이 기이하게 따뜻해집니다.",
    storyFail: "부처의 빛이 지옥의 업화로 변해 당신의 그림자와 이성을 불태웁니다.",
    sanityBonus: 10, fakes: ["아닐 불, 미칠 광", "떨칠 불, 넓을 광"]
  },
  "독바위": {
    topic: "독바위", meaning: "날카롭게 홀로 솟은 바위 (순우리말)",
    storyCorrect: "굳건한 바위의 돌 기운이 흔들리는 정신을 다잡아 줍니다. 의지가 단단해집니다.",
    storyFail: "이름 없는 바위의 무게가 당신의 어깨를 짓누르며 숨통을 옥죄어옵니다.",
    sanityBonus: 5, fakes: ["독액을 내뿜는 저주받은 바위", "망자들의 독(항아리)을 묻어둔 묘지"]
  },
  "연신내": {
    topic: "연신내", meaning: "못 옆에 새로 뻗은 냇가 (순우리말)",
    storyCorrect: "새로 뻗은 시냇물처럼 길은 이어집니다. 탈출의 끝이 아득하게나마 보입니다.",
    storyFail: "물은 마르지 않고, 폐 속까지 썩은 물이 차오르는 치명적인 환각에 빠집니다.",
    sanityBonus: 5, fakes: ["해가 연장되는 거짓 신의 제단", "역병이 퍼지는 검은 늪"]
  },
  "구산": {
    topic: "龜山", meaning: "거북 구, 산 산",
    storyCorrect: "장수와 길운의 상징인 거북이 당신의 요동치는 심장 박동을 안정시킵니다.",
    storyFail: "수천 년을 탈각하지 못한 거북의 원념이 단단한 껍질처럼 당신을 가둡니다.",
    sanityBonus: 5, fakes: ["아홉 구, 산 산", "구원할 구, 뫼 산"]
  },
  "새절": {
    topic: "새절", meaning: "새로 지은 사찰 (순우리말)",
    storyCorrect: "이름 없는 승려의 축원이 귓가에 맴돌며 타들어 가는 마음을 달랩니다.",
    storyFail: "가죽으로 기운 사찰의 문이 열리며 원통하고 고통스러운 목탁 소리가 고막을 찢습니다.",
    sanityBonus: 5, fakes: ["새가 날다 떨어져 죽는 절벽", "새벽녘에만 나타나는 허상의 사원"]
  },
  "증산": {
    topic: "甑山", meaning: "시루 증, 산 산",
    storyCorrect: "시루 속의 떡처럼 따뜻한 풍요로움이 느껴집니다. 잠시나마 고통이 소멸합니다.",
    storyFail: "고열의 시루 속에 물리적으로 갇혀 살이 쪄지는 듯한 환촉에 피를 토합니다.",
    sanityBonus: 8, fakes: ["더할 증, 산 산", "증세 증, 뫼 산"]
  },
  "디지털미디어시티": {
    topic: "Digital Media City", meaning: "첨단 미디어 산업이 밀집된 도시",
    storyCorrect: "기계적인 알람음 틈새로 현실의 소리가 들려옵니다. 감각을 잠시 되찾습니다.",
    storyFail: "사방의 모니터가 일제히 켜지며 당신의 가장 끔찍한 죽음의 순간을 생중계합니다.",
    sanityBonus: 5, fakes: ["버려진 데이터와 망령들의 디지털 폐기장", "끝없는 가상 현실 루프의 메인 코어"]
  },
  "월드컵경기장": {
    topic: "월드컵경기장", meaning: "세계 축구 대회가 열린 거대 구장",
    storyCorrect: "투지 어린 함성 소리가 환청으로 울려 퍼지며 다시 일어설 용기를 줍니다.",
    storyFail: "패배한 망령들이 집단으로 몰려와 당신을 바닥에 짓밟고 지나가는 압통을 느낍니다.",
    sanityBonus: 5, fakes: ["세계의 파멸을 중계하는 원형 감옥", "피에 굶주린 군중의 대형 도축장"]
  },
  "마포구청": {
    topic: "麻浦區廳", meaning: "삼 마, 포구 포, 구역 구, 관청 청",
    storyCorrect: "옛 관청의 엄숙하고 차가운 질서가 어지러운 궤도의 혼란을 잠재웁니다.",
    storyFail: "사형수를 옭아매던 축축한 삼베 밧줄이 당신의 목을 졸라오기 시작합니다.",
    sanityBonus: 5, fakes: ["마귀 마, 두려울 포, 지경 구, 관청 청", "말 마, 덮을 포, 원수 구, 청할 청"]
  },
  "망원": {
    topic: "望遠", meaning: "바랄 망, 멀 원",
    storyCorrect: "멀리 바라보는 매의 눈을 잠시 얻었습니다. 임박한 위험을 아슬아슬하게 피합니다.",
    storyFail: "먼 곳의 무언가와 눈을 맞춰버렸습니다. 그것이 무서운 속도로 다가차 옵니다.",
    sanityBonus: 5, fakes: ["망할 망, 으뜸 원", "그물 망, 동산 원"]
  },
  "합정": {
    topic: "合井", meaning: "합할 합, 우물 정",
    storyCorrect: "시원한 우물물이 핏자국을 씻어내고 영혼의 생기를 돌려줍니다.",
    storyFail: "끝을 알 수 없는 우물 속으로 추락하는 환각 속에 폐에 피가 차오릅니다.",
    sanityBonus: 10, fakes: ["조개 합, 바를 정", "합할 합, 뜰 정"]
  },
  "상수": {
    topic: "上水", meaning: "위 상, 물 수",
    storyCorrect: "상류의 맑은 물가에서 부는 정화의 바람이 객차 내부의 썩은 안개를 걷어냅니다.",
    storyFail: "천장에서 피가 섞인 탁류가 쏟아져 내려 당신의 숨통을 막습니다.",
    sanityBonus: 5, fakes: ["서로 상, 빼어날 수", "코끼리 상, 목숨 수"]
  },
  "광흥창": {
    topic: "廣興倉", meaning: "넓을 광, 일어날 흥, 창고 창",
    storyCorrect: "곡식이 무한히 쌓여있던 옛 창고의 풍요로운 기운이 당신의 텅 빈 의지를 채웁니다.",
    storyFail: "버려진 창고에 갇힌 채 굶주린 쥐 떼들에게 산 채로 살을 뜯기는 환각에 빠집니다.",
    sanityBonus: 5, fakes: ["미칠 광, 일어날 흥, 창 창", "빛 광, 기쁠 흥, 부를 창"]
  },
  "대흥": {
    topic: "大興", meaning: "클 대, 일어날 흥",
    storyCorrect: "크게 일어난다는 선조들의 염원이 당신의 지친 무릎에 힘을 싣습니다.",
    storyFail: "거대하고 비틀린 중력이 오장육부 전체를 짓눌러 고통스럽게 만듭니다.",
    sanityBonus: 5, fakes: ["대신할 대, 피 흥", "띠 대, 일어날 흥"]
  },
  "공덕": {
    topic: "孔德", meaning: "구멍 공, 은혜 덕",
    storyCorrect: "아득한 과거 누군가 쌓아 올린 공덕이 방패가 되어, 당신의 타락을 한 번 튕겨냅니다.",
    storyFail: "의식 한가운데 거대한 구멍이 뚫리고, 끔찍한 절망이 그 속으로 흘러듭니다.",
    sanityBonus: 7, fakes: ["빌 공, 얻을 덕", "장인 공, 숨길 덕"]
  },
  "효창공원앞": {
    topic: "孝昌公園", meaning: "효도 효, 창성할 창, 공평할 공, 동산 원",
    storyCorrect: "이 땅에 잠든 선열들의 고결한 넋이 악령의 무차별적인 접근을 차단합니다.",
    storyFail: "원통하게 죽은 목 없는 영혼들의 절규가 시끄럽게 울려 귀에서 피가 흐릅니다.",
    sanityBonus: 5, fakes: ["새벽 효, 부를 창, 텅빌 공, 으뜸 원", "효과 효, 슬플 창, 공평할 공, 원망 원"]
  },
  "삼각지": {
    topic: "三角地", meaning: "석 삼, 뿔 각, 땅 지",
    storyCorrect: "완벽한 삼각형의 균형을 찾아 기하학적으로 일그러진 공간의 비틀림에서 빠져나옵니다.",
    storyFail: "사방의 공간이 날카로운 뿔 형태로 좁혀지며 당신의 숨통을 삼 갈래로 찢습니다.",
    sanityBonus: 12, fakes: ["석 삼, 깨달을 각, 알 지", "석 삼, 물리칠 각, 지탱할 지"]
  },
  "녹사평": {
    topic: "綠莎坪", meaning: "푸를 녹, 억새 사, 들 평 (푸른 들판)",
    storyCorrect: "상쾌한 푸른 풀밭의 시각적 환영이 폐를 가득 채운 지옥의 핏물을 정화시킵니다.",
    storyFail: "병든 풀밭 밑에 천 년간 묻혀 있던 구더기 떼가 발목을 뚫고 혈관으로 파고듭니다.",
    sanityBonus: 5, fakes: ["녹일 녹, 뱀 사, 들 평", "푸를 녹, 죽을 사, 평평할 평"]
  },
  "이태원": {
    topic: "梨泰院", meaning: "배나무 이, 클 태, 집 원",
    storyCorrect: "이방인을 따뜻하게 맞던 옛 역원의 포용력이, 조각나던 당신의 자아를 얼기설기 붙여냅니다.",
    storyFail: "죽은 배나무의 새카만 뿌리들이 바닥에서 솟아나 당신의 팔다리를 묶어버립니다.",
    sanityBonus: 8, fakes: ["다를 이, 편안할 태, 근원 원", "가슴 이, 태아 태, 동산 원"]
  },
  "한강진": {
    topic: "漢江鎭", meaning: "한수 한, 강 강, 진압할 진",
    storyCorrect: "거대한 뱃길을 지키던 군사 진영의 위용이 엄습하는 공포를 일시적으로 진압합니다.",
    storyFail: "수도 없이 한강에 투신한 차가운 원혼들이 당신을 깊고 어두운 물 밑으로 수장시킵니다.",
    sanityBonus: 5, fakes: ["찰 한, 부딪칠 강, 참 진", "원통할 한, 굳셀 강, 떨칠 진"]
  },
  "버티고개": {
    topic: "버티고개", meaning: "도둑이 많아 버티며 넘어야 했던 고개 (순우리말)",
    storyCorrect: "아무리 험한 지옥도 끈질기게 버티겠다는 강인한 투지가 온몸을 단단하게 감쌉니다.",
    storyFail: "더 이상은 버틸 수 없다는 극심한 무력감이 뼈를 녹여 그 자리에 주저앉게 만듭니다.",
    sanityBonus: 5, fakes: ["거대한 벌레들이 우글거리는 계곡", "사람들의 허리를 꺾어버리는 처형장"]
  },
  "약수": {
    topic: "藥水", meaning: "약 약, 물 수",
    storyCorrect: "신령스러운 바위틈 샘물이 닿은 기억처럼, 찢긴 피부와 무너진 멘탈을 회복시킵니다.",
    storyFail: "생수를 목에 넘기는 순간, 극심한 산성의 독극물로 변해 식도가 하얗게 타들어 갑니다.",
    sanityBonus: 5, fakes: ["맺을 약, 마칠 수", "같을 약, 머리 수"]
  },
  "청구": {
    topic: "靑丘", meaning: "푸를 청, 언덕 구",
    storyCorrect: "시야를 답답하게 가리던 오염된 기운을 푸른 언덕 너머의 바람이 날려버립니다.",
    storyFail: "당신은 죽어 묻힌 이들의 봉분만이 끝없이 늘어선 창백하고 푸르스름한 언덕에 갇힙니다.",
    sanityBonus: 5, fakes: ["맑을 청, 원수 구", "들을 청, 구할 구"]
  },
  "신당": {
    topic: "新堂", meaning: "새 신, 집 당",
    storyCorrect: "새로운 무당들이 올리던 기도의 잔향이 당신 주변에 보이지 않는 결계를 칩니다.",
    storyFail: "신들은 죽었습니다. 오직 당신을 제물로 바치려는 흉측한 작두 날의 환영만이 덮쳐옵니다.",
    sanityBonus: 15, fakes: ["귀신 신, 무리 당", "믿을 신, 마땅 당"]
  },
  "동묘앞": {
    topic: "東廟", meaning: "동녘 동, 사당 묘",
    storyCorrect: "무신 관우의 영정이 뿜어내는 호연지기가 악습에 찌든 원령들의 접근을 단호히 불허합니다.",
    storyFail: "버려진 시장통의 물건들에 깃들어 있던 수만 가지 원한이 당신의 뇌세포를 파먹습니다.",
    sanityBonus: 8, fakes: ["움직일 동, 묘할 묘", "아이 동, 무덤 묘"]
  },
  "창신": {
    topic: "昌信", meaning: "창성할 창, 믿을 신",
    storyCorrect: "번영과 굳건한 믿음이라는 단어의 힘이 갈라진 마음의 빈틈을 단단한 시멘트처럼 메웁니다.",
    storyFail: "눈을 찌푸린 맹목적 광신자들의 환영이 나타나 열차를 광기의 예배당으로 만듭니다.",
    sanityBonus: 5, fakes: ["부를 창, 귀신 신", "창 고름 창, 펼 신"]
  },
  "보문": {
    topic: "普門", meaning: "넓을 보, 문 문",
    storyCorrect: "사방으로 열린 구원의 문 틈새로 한 줌의 빛이 새어나와 당신의 뺨을 마루만집니다.",
    storyFail: "결코 열려선 안 될 지옥의 안쪽 문이 덜커덕거리며 거대한 심연을 드러냅니다.",
    sanityBonus: 5, fakes: ["걸음 보, 글월 문", "지킬 보, 들을 문"]
  },
  "안암": {
    topic: "安岩", meaning: "편안 안, 바위 암",
    storyCorrect: "거센 비바람에도 꿈쩍 않는 바위처럼, 당장 눈앞을 찢는 비명소리에도 의연함을 유지합니다.",
    storyFail: "안식처인 줄 알았던 바위는 사실 녹아내린 시체 더미였습니다. 액체가 당신을 덮칩니다.",
    sanityBonus: 5, fakes: ["눈 안, 어두울 암", "기러기 안, 암자 암"]
  },
  "고려대": {
    topic: "高麗大", meaning: "높을 고, 고울 려, 클 대",
    storyCorrect: "학문의 요람이 지닌 투명하고 이상적인 이성이 막연한 원초적 두려움을 부숴버립니다.",
    storyFail: "도서관에 갇혀 죽어간 하반신 없는 학도들이 당신의 뇌를 한 조각씩 뜯어 먹으려 달려듭니다.",
    sanityBonus: 5, fakes: ["쓸 고, 병 려, 대신할 대", "옛 고, 더러울 려, 큰 대"]
  },
  "월곡": {
    topic: "月谷", meaning: "달 월, 골짜기 곡",
    storyCorrect: "어두운 객실 너머로 은은한 창백한 달빛이 스며들어 당장 밟을 함정을 피해가게 해줍니다.",
    storyFail: "어떤 빛도 닿지 않는 영원한 밤의 골짜기에 떨어져, 고막이 터질듯한 적막에 갇힙니다.",
    sanityBonus: 5, fakes: ["넘을 월, 통곡할 곡", "가로되 월, 곡식 곡"]
  },
  "상월곡": {
    topic: "上月谷", meaning: "위 상, 달 월, 골짜기 곡",
    storyCorrect: "고지대에서 피어난 밝은 달빛이 부정한 것들을 태워버려 안도감을 선사합니다.",
    storyFail: "머리 위 천장이 산산조각 나며 핏덩어리 진 고기 조각들이 비처럼 쏟아져 내립니다.",
    sanityBonus: 5, fakes: ["상장 상, 넘을 월, 부르짖을 곡", "코끼리 상, 세월 월, 어긋날 곡"]
  },
  "돌곶이": {
    topic: "돌곶이", meaning: "검은 돌들이 꼬치처럼 꽂힌 모양 (순우리말)",
    storyCorrect: "암석 돌기처럼 단단하고 뾰족한 인내심이 솟아나, 외부의 참습을 무력화시킵니다.",
    storyFail: "수천 개의 뾰족한 돌 조각이 당신의 피부를 뚫고 뼈 속에서부터 돋아나는 끔찍함을 겪습니다.",
    sanityBonus: 5, fakes: ["원혼들이 돌아가지 못하고 갇힌 지옥의 결계", "목이 잘린 석불이 피의 눈물을 흘리는 제단"]
  },
  "석계": {
    topic: "石溪", meaning: "돌 석, 시내 계",
    storyCorrect: "어디선가 들려오는 청아한 물소리가 피로 물든 열차 안의 비명을 일순간 씻어냅니다.",
    storyFail: "객실 바닥에 고인 강물 속의 날카로운 돌들이 비명을 지르며 당신의 발목을 벱니다.",
    sanityBonus: 5, fakes: ["저녁 석, 묶을 계", "자리 석, 닭 계"]
  },
  "태릉입구": {
    topic: "泰陵入口", meaning: "클 태, 언덕 릉, 들 입, 입 구",
    storyCorrect: "압도적인 왕릉의 신성한 기운이 잠시나마 잡귀의 접근을 차단하는 무형의 결계를 칩니다.",
    storyFail: "무덤의 입구가 입을 벌리고, 산 자를 순장품으로 끌어들이려는 차가운 바람을 뿜어냅니다.",
    sanityBonus: 10, fakes: ["모양 태, 능할 릉, 입 입, 구 구", "태아 태, 언덕 릉, 슬플 입, 입 구"]
  },
  "화랑대": {
    topic: "花郞臺", meaning: "꽃 화, 사내 랑, 대 대",
    storyCorrect: "수천 년 전 화랑들의 굽히지 않는 기백이 빙의된 듯, 약해졌던 심장이 거세게 뜁니다.",
    storyFail: "사지가 찢겨 죽은 젋은 전사들의 억울한 원혼들이 화랑대 위에서 칼을 꽂으며 덮칩니다.",
    sanityBonus: 5, fakes: ["불 화, 파도 랑, 대신할 대", "그림 화, 낭만 랑, 무리 대"]
  },
  "봉화산": {
    topic: "烽火山", meaning: "봉화 봉, 불 화, 산 산",
    storyCorrect: "어둠 속에서 당신을 올바른 길로 인도하는 마지막 구조의 불빛이 희미하게 타오릅니다.",
    storyFail: "그 불은 당신을 구하려는 것이 아닌 화형대의 불길이었습니다. 온몸에 화상을 입습니다.",
    sanityBonus: 8, fakes: ["받들 봉, 화할 화, 뫼 산", "벌 봉, 재앙 화, 부를 산"]
  },
  "신내": {
    topic: "新內", meaning: "새 신, 안 내",
    storyCorrect: "길고 길었던 여정의 끝, 마침내 안전한 안쪽 세상의 문이 진동과 함께 열립니다.",
    storyFail: "이 안쪽의 세계는 결국 지옥의 메인 터미널이었습니다. 영원한 루프의 감옥에 유폐됩니다.",
    sanityBonus: 20, fakes: ["귀신 신, 인내할 내", "매울 신, 올 래"]
  }
};

const stationListKeys = Object.keys(stationOrigin);

async function maybeRunHanjaQuiz(st) {
  const freq = G.hanjaQuizFreq ?? 1.0;
  if (freq <= 0) return false;
  if (Math.random() > freq) return false;

  const data = stationOrigin[st.name];
  if (!data) return false;

  TrainPanel.addLog(`[승객 식별 제어] 고대 지명 해독 가동`, 'warn');
  
  let options = [{ text: `${data.meaning}`, correct: true }];
  
  if (data.fakes) {
    data.fakes.forEach(f => options.push({ text: f, correct: false }));
  } else {
    // 혹시라도 fakes가 없는 경우 다른 역의 의미를 가져와 오답으로 사용
    const others = stationListKeys.filter(k => k !== st.name).sort(() => 0.5 - Math.random());
    options.push({ text: stationOrigin[others[0]].meaning, correct: false });
    options.push({ text: stationOrigin[others[1]].meaning, correct: false });
  }

  // 보기 무작위 섞기
  options.sort(() => 0.5 - Math.random());
  
  // 단념 선택지 추가
  options.push({ text: "단념한다 (모기겠다 / 거부한다)", correct: false, isGiveUp: true });

  await seq([
    ['', 'blank', 0],
    [`"...다음 역은 ${st.name}, ${st.name}역입니다."`, 'announce', 800],
    [`${st.name}... ${data.topic}. 역 이름의 유래가 뇌리를 스칩니다.`, 'narrator', 1500],
    ['이름이 가진 본질을 파악해야만 주술적 함정에서 벗어납니다.', 'system', 1500],
  ]);

  return new Promise(resolve => {
    const choiceOpts = options.map((opt, idx) => [
      `${idx + 1}) [${opt.text}]`,
      async () => {
        if (opt.correct) {
          G.hanjaAttempts = (G.hanjaAttempts || 0) + 1;
          G.hanjaSuccess = (G.hanjaSuccess || 0) + 1;
          G.sanity = Math.min(100, G.sanity + data.sanityBonus);
          G.score += 5;
          updateStats();
          if (window.sfx && window.sfx.item) window.sfx.item();
          TrainPanel.addLog('[해독 성공] 지명의 가호를 얻었습니다', 'life');
          
          await seq([
            [`맞아, ${data.meaning}.`, 'highlight', 1200],
            [data.storyCorrect, 'life', 2200],
            [`魂(혼) +${data.sanityBonus} — 본질을 꿰뚫어 이성을 회복합니다.`, 'system', 1500],
          ]);
          resolve(true);
        } else if (opt.isGiveUp) {
          G.hanjaFail = (G.hanjaFail || 0) + 1;
          G.sanity = Math.max(0, G.sanity - 3);
          updateStats();
          if (window.sfx && window.sfx.boom) window.sfx.boom(0.1);
          TrainPanel.addLog('[해독 단념] 스스로 눈과 귀를 닫았습니다', 'warn');
          
          await seq([
            ['단념했습니다. 모르는 채로 휩쓸리는 쪽이 편안할지도 모릅니다.', 'narrator', 1200],
            ['시각과 청각이 마비되며 보이지 않는 올가미가 스멀거립니다.', 'death', 2000],
            ['魂(혼) -3 — 의지의 감각 상실.', 'warn', 1500],
          ]);
          resolve(true);
        } else {
          G.hanjaFail = (G.hanjaFail || 0) + 1;
          G.sanity = Math.max(0, G.sanity - (data.sanityBonus + 2));
          updateStats();
          if (window.HorrorFX) window.HorrorFX.flashRed(600);
          if (window.sfx && window.sfx.boom) window.sfx.boom(0.2);
          TrainPanel.addLog('[해독 실패] 치명적 오독으로 인한 저주 발동', 'danger');
          
          await seq([
            [`틀렸어... 당신이 떠올린 의미는 망령들의 유도일 뿐.`, 'death', 1200],
            [data.storyFail, 'danger', 2200],
            [`魂(혼) -${data.sanityBonus + 2} — 어설픈 지식이 칼날이 되어 돌아옵니다.`, 'warn', 1500],
          ]);
          resolve(true);
        }
      }
    ]);
    
    choices(choiceOpts);
  });
}

window.maybeRunHanjaQuiz = maybeRunHanjaQuiz;
