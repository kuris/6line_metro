/* ═══════════════════════════════════════════════════
   stations.js — 서울 지하철 6호선 역 데이터 & 이벤트 정의
   총 39개 역: 응암순환 ~ 신내
   ═══════════════════════════════════════════════════ */

'use strict';

const STATIONS = [
  {
    id: 0, name: '응암', nameEn: 'Eungam', code: '610',
    hanja: '鷹岩',
    hanjaDesc: '매(鷹)가 앉는 바위(岩)가 있던 곳. 매 사냥터였던 산기슭.',
    transfer: null, hasEvent: true, eventId: 'ev_eungam',
    trainState: 'running', logMsg: '응암 — 출발역 선택',
    desc: '은평구 응암동. 6호선의 시작점. 이른 아침 첫차 승객들.'
  },
  {
    id: 1, name: '역촌', nameEn: 'Yeokchon', code: '611',
    hanja: '驛村',
    hanjaDesc: '조선시대 역참(驛站)이 있던 마을(村). 공문서·물자 전달의 중간 기지.',
    transfer: null, hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '역촌 통과',
    desc: '은평구 역촌동. 주택가 한복판.'
  },
  {
    id: 2, name: '불광', nameEn: 'Bulgwang', code: '612',
    hanja: '佛光',
    hanjaDesc: '부처(佛)의 빛(光). 인근 불광사(佛光寺)에서 유래한 지명.',
    transfer: '3호선', hasEvent: true, eventId: 'ev_bulgwang',
    trainState: 'crowded', logMsg: '불광 — 3호선 환승역 (혼잡)',
    desc: '은평구 불광동. 3호선 환승역. 환승객으로 항상 붐빈다.'
  },
  {
    id: 3, name: '독바위', nameEn: 'Dokbawi', code: '613',
    hanja: null,
    hanjaDesc: '순우리말 지명. 날카롭게 솟은 바위가 있던 자리. 개발로 바위는 사라짐.',
    transfer: null, hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '독바위 통과',
    desc: '은평구 진관동 경계. 독바위라는 이름의 바위가 있던 곳.'
  },
  {
    id: 4, name: '연신내', nameEn: 'Yeonsinnae', code: '614',
    hanja: null,
    hanjaDesc: '순우리말 지명. \'연(년)신내\' — 못(沼) 옆 냇가. 옛 도성 밖 물가 마을.',
    transfer: '3호선·GTX-A', hasEvent: true, eventId: 'ev_yeonsinnae',
    trainState: 'crowded', logMsg: '연신내 — 3호선·GTX-A 환승 (매우 혼잡)',
    desc: '은평구 연신내. 상업지구. 3호선 환승으로 극도로 혼잡.'
  },
  {
    id: 5, name: '구산', nameEn: 'Gusan', code: '615',
    hanja: '龜山',
    hanjaDesc: '거북(龜)처럼 생긴 산(山)이 있던 곳. 풍수지리적 길지로 불림.',
    transfer: null, hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '구산 통과',
    desc: '은평구 구산동. 조용한 주택가.'
  },
  {
    id: 6, name: '새절', nameEn: 'Saejeol', code: '616',
    hanja: null,
    hanjaDesc: '순우리말 지명. \'새(新)로 생긴 절(寺)\'. 새로 세운 절이 있던 마을.',
    transfer: null, hasEvent: true, eventId: 'ev_saejul',
    trainState: 'event', logMsg: '새절 — 이상 승객 포착',
    desc: '은평구 신사동. 신사오거리 인근. 낯선 이가 탑승했다.'
  },
  {
    id: 7, name: '증산', nameEn: 'Jeungsan', code: '617',
    hanja: '甑山',
    hanjaDesc: '시루(甑, 쪄서 음식 만드는 그릇)처럼 생긴 산(山)에서 유래.',
    transfer: null, hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '증산 통과',
    desc: '은평구 증산동. 평범한 주거지역.'
  },
  {
    id: 8, name: '디지털미디어시티', nameEn: 'Digital Media City', code: '618',
    hanja: null,
    hanjaDesc: '상암 뉴타운 개발로 생긴 현대 지명. 방송·IT 클러스터를 뜻하는 영문명.',
    transfer: '공항철도·경의중앙선', hasEvent: true, eventId: 'ev_dmc',
    trainState: 'crowded', logMsg: 'DMC — 대규모 환승 (극혼잡)',
    desc: '마포구 상암동. 방송국·IT기업 밀집. 3개 노선 환승 인파가 몰린다.'
  },
  {
    id: 9, name: '월드컵경기장', nameEn: 'World Cup Stadium', code: '619',
    hanja: null,
    hanjaDesc: '2002 FIFA 월드컵을 위해 건립된 서울 상암 월드컵경기장에서 유래.',
    transfer: null, hasEvent: true, eventId: 'ev_worldcup',
    trainState: 'event', logMsg: '월드컵경기장 — 경기 관람객 탑승',
    desc: '마포구 상암동. 서울 월드컵경기장 앞. 경기 후 대규모 귀가 행렬.'
  },
  {
    id: 10, name: '마포구청', nameEn: 'Mapo-gu Office', code: '620',
    hanja: '麻浦區廳',
    hanjaDesc: '마포(麻浦)는 \'삼(麻) 뒤편 포구(浦)\'. 삼베 거래가 활발했던 한강 포구.',
    transfer: null, hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '마포구청 통과',
    desc: '마포구 성산동. 구청 앞 역.'
  },
  {
    id: 11, name: '망원', nameEn: 'Mangwon', code: '621',
    hanja: '望遠',
    hanjaDesc: '멀리(遠) 바라본다(望). 조선 인조가 이곳에서 한강 너머를 바라본 데서 유래.',
    transfer: null, hasEvent: true, eventId: 'ev_mangwon',
    trainState: 'event', logMsg: '망원 — 발 밟힘 시비 발생',
    desc: '마포구 망원동. 망리단길·망원시장 인근. 퇴근길 인파.'
  },
  {
    id: 12, name: '합정', nameEn: 'Hapjeong', code: '622',
    hanja: '合井',
    hanjaDesc: '두 물줄기가 합쳐지는(合) 우물(井)이 있던 곳. 한강과 샛강이 만나는 지점.',
    transfer: '2호선', hasEvent: true, eventId: 'ev_hapjeong',
    trainState: 'crowded', logMsg: '합정 — 2호선 환승 (매우 혼잡)',
    desc: '마포구 합정동. 2호선 환승. 홍대 인접 상권.'
  },
  {
    id: 13, name: '상수', nameEn: 'Sangsu', code: '623',
    hanja: '上水',
    hanjaDesc: '윗(上)쪽 물가(水). 마포 일대에서 한강 상류 방향의 포구가 있던 자리.',
    transfer: null, hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '상수 통과',
    desc: '마포구 상수동. 홍대 후문 인근. 조용한 카페거리.'
  },
  {
    id: 14, name: '광흥창', nameEn: 'Gwangheungchang', code: '624',
    hanja: '廣興倉',
    hanjaDesc: '조선 관리들의 녹봉(봉급)을 보관하던 국가 창고(倉). 廣興은 \'널리 흥하다\'.',
    transfer: null, hasEvent: true, eventId: 'ev_gwangheungchang',
    trainState: 'event', logMsg: '광흥창 — 취객 탑승',
    desc: '마포구 신수동. 서강대교 인근. 심야 취객이 올라탔다.'
  },
  {
    id: 15, name: '대흥', nameEn: 'Daeheung', code: '625',
    hanja: '大興',
    hanjaDesc: '크게(大) 흥하다(興). 조선시대 마을 이름에서 유래. 번성하기를 바라는 뜻.',
    transfer: null, hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '대흥 통과',
    desc: '마포구 대흥동. 서강대학교 정문 인근.'
  },
  {
    id: 16, name: '공덕', nameEn: 'Gongdeok', code: '626',
    hanja: '孔德',
    hanjaDesc: '공덕(孔德)이란 \'구멍(孔) 덕(德)\'. 공씨 가문의 덕을 기리거나 지형에서 유래설.',
    transfer: '5호선·경의중앙선·공항철도', hasEvent: true, eventId: 'ev_gongdeok',
    trainState: 'danger', logMsg: '공덕 — 비상 상황 발생!',
    desc: '마포구 공덕동. 4개 노선 환승역. 갑작스러운 비상 방송.'
  },
  {
    id: 17, name: '효창공원앞', nameEn: 'Hyochang Park', code: '627',
    hanja: '孝昌公園',
    hanjaDesc: '조선 정조 아들 문효세자 묘원에서 유래. 孝와 昌은 효성스럽고 번성함을 뜻함.',
    transfer: '경의중앙선', hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '효창공원앞 — 경의중앙선 환승',
    desc: '용산구 효창동. 효창공원 인근. 독립운동가 7인의 묘역.'
  },
  {
    id: 18, name: '삼각지', nameEn: 'Samgakji', code: '628',
    hanja: '三角地',
    hanjaDesc: '세(三) 갈래 각(角) 형태의 땅(地). 세 도로가 만나는 삼각형 지형에서 유래.',
    transfer: '4호선', hasEvent: true, eventId: 'ev_samgakji',
    trainState: 'event', logMsg: '삼각지 — 수상한 가방 발견',
    desc: '용산구 한강로동. 4호선 환승. 전쟁기념관 인근.'
  },
  {
    id: 19, name: '녹사평', nameEn: 'Noksapyeong', code: '629',
    hanja: '綠莎坪',
    hanjaDesc: '푸른(綠) 풀(莎)이 무성한 벌판(坪). 조선 시대 군사 훈련지로 이용되던 곳.',
    transfer: null, hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '녹사평 통과',
    desc: '용산구 용산동. 경리단길·해방촌 인근. 지하 4층까지 뚫린 거대 돔 구조 역.'
  },
  {
    id: 20, name: '이태원', nameEn: 'Itaewon', code: '630',
    hanja: '梨泰院',
    hanjaDesc: '배나무(梨) 밭이 있던 역원(驛院 — 泰院). 조선시대 외국 사신이 묵던 원(院).',
    transfer: null, hasEvent: true, eventId: 'ev_itaewon',
    trainState: 'crowded', logMsg: '이태원 — 외국인 관광객 탑승',
    desc: '용산구 이태원동. 글로벌 문화 거리. 다국적 인파가 오간다.'
  },
  {
    id: 21, name: '한강진', nameEn: 'Hangangjin', code: '631',
    hanja: '漢江鎭',
    hanjaDesc: '한강(漢江) 나루터에 있던 군사 진영(鎭). 조선시대 한강을 지키던 수군 진지.',
    transfer: null, hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '한강진 통과',
    desc: '용산구 한강진동. 블루스퀘어 인근. 창 밖으로 한강 전경이 보인다.'
  },
  {
    id: 22, name: '버티고개', nameEn: 'Beotigogae', code: '632',
    hanja: null,
    hanjaDesc: '순우리말 지명. 가파른 고개를 넘을 때 \'버텨야\' 한다는 뜻. 일설에는 \'벌티\'(벌판 고개).',
    transfer: null, hasEvent: true, eventId: 'ev_berti',
    trainState: 'event', logMsg: '버티고개 — 노인 실신 신고',
    desc: '중구 신당동. 가파른 언덕 지형에 위치한 지하역. 노인이 쓰러졌다.'
  },
  {
    id: 23, name: '약수', nameEn: 'Yaksu', code: '633',
    hanja: '藥水',
    hanjaDesc: '약(藥)이 되는 물(水). 이 일대 샘물이 병을 고친다 하여 약수터로 유명했음.',
    transfer: '3호선', hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '약수 — 3호선 환승',
    desc: '중구 신당동. 남산 기슭. 3호선 환승객이 많다.'
  },
  {
    id: 24, name: '청구', nameEn: 'Cheonggu', code: '634',
    hanja: '靑丘',
    hanjaDesc: '푸른(靑) 언덕(丘). 한국의 옛 별칭인 \'청구(靑丘)\'와도 연관. 초록 산이 있던 동네.',
    transfer: '5호선', hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '청구 — 5호선 환승',
    desc: '중구 신당동. 주거지 밀집. 5호선 환승.'
  },
  {
    id: 25, name: '신당', nameEn: 'Sindang', code: '635',
    hanja: '新堂',
    hanjaDesc: '조선시대 도성 외부 무당들의 신당(神堂)이 많아 붙여진 이름에서 유래.',
    transfer: '2호선', hasEvent: true, eventId: 'ev_sindang',
    trainState: 'crowded', logMsg: '신당 — 2호선 환승 (혼잡)',
    desc: '중구 신당동. 2호선 환승. 중앙시장 상인들의 활기가 느껴진다.'
  },
  {
    id: 26, name: '동묘앞', nameEn: 'Dongmyo', code: '636',
    hanja: '東廟',
    hanjaDesc: '동(東)쪽 사당(廟). 임진왜란 후 관우를 모신 동관왕묘(東關王廟)에서 유래.',
    transfer: '1호선', hasEvent: true, eventId: 'ev_dongmyo',
    trainState: 'event', logMsg: '동묘앞 — 고물상 할아버지',
    desc: '종로구 숭인동. 1호선 환승. 동묘벼룩시장의 빈티지한 풍경.'
  },
  {
    id: 27, name: '창신', nameEn: 'Changsin', code: '637',
    hanja: '昌信',
    hanjaDesc: '번창(昌)하고 믿음직한(信) 곳. 조선 도성 밖에 형성된 봉제 마을.',
    transfer: null, hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '창신 통과',
    desc: '종로구 창신동. 절개산 아래 주택가. 봉제 공장의 소리가 들린다.'
  },
  {
    id: 28, name: '보문', nameEn: 'Bomun', code: '638',
    hanja: '普門',
    hanjaDesc: '널리(普) 열린 문(門). 불교 관음신앙의 \'보문품(普門品)\'에서 유래. 보문사가 있음.',
    transfer: '우이신설선', hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '보문 — 우이신설선 환승',
    desc: '성북구 보문동. 성북천 인근. 우이신설 전철 환승.'
  },
  {
    id: 29, name: '안암', nameEn: 'Anam', code: '639',
    hanja: '安岩',
    hanjaDesc: '편안한(安) 바위(岩). 마을 뒤 바위가 마을을 지킨다는 믿음에서 유래.',
    transfer: null, hasEvent: true, eventId: 'ev_anam',
    trainState: 'event', logMsg: '안암 — 고려대생들 단체 탑승',
    desc: '성북구 안암동. 고려대학교 후문. 대학촌의 활기찬 에너지.'
  },
  {
    id: 30, name: '고려대', nameEn: 'Korea Univ.', code: '640',
    hanja: '高麗大',
    hanjaDesc: '고려(高麗)의 이름을 딴 대학교. 고려는 \'높고(高) 아름답다(麗)\'는 뜻.',
    transfer: null, hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '고려대 통과',
    desc: '성북구 안암동. 고려대학교 정문 앞. 고풍스러운 캠퍼스 건물.'
  },
  {
    id: 31, name: '월곡', nameEn: 'Wolgok', code: '641',
    hanja: '月谷',
    hanjaDesc: '달(月)이 비치는 골짜기(谷). 달빛이 맑게 비치는 고요한 고개에서 유래.',
    transfer: null, hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '월곡 통과',
    desc: '성북구 하월곡동. 동덕여대 인근. 조용한 산동네.'
  },
  {
    id: 32, name: '상월곡', nameEn: 'Sangwolgok', code: '642',
    hanja: '上月谷',
    hanjaDesc: '월곡(月谷)의 위쪽(상). 달빛 골짜기 위에 자리한 높은 마을.',
    transfer: null, hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '상월곡 통과',
    desc: '성북구 상월곡동. KIST(한국과학기술연구원) 입구.'
  },
  {
    id: 33, name: '돌곶이', nameEn: 'Dolgoji', code: '643',
    hanja: null,
    hanjaDesc: '순우리말 지명. \'돌(石)이 꽂혀있다\'. 돌이 튀어나온 지형. 한자로는 석관(石串).',
    transfer: null, hasEvent: true, eventId: 'ev_dolgoji',
    trainState: 'event', logMsg: '돌곶이 — 무임승차 단속',
    desc: '성북구 석관동. 의릉 인근. 오래된 주택가.'
  },
  {
    id: 34, name: '석계', nameEn: 'Seokgye', code: '644',
    hanja: '石溪',
    hanjaDesc: '돌(石)이 많은 시냇가(溪). 석관동과 월계동의 경계에 있어 한 글자씩 따옴.',
    transfer: '1호선', hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '석계 — 1호선 환승',
    desc: '노원구 월계동. 1호선 환승. 중랑천 옆 대규모 주거단지.'
  },
  {
    id: 35, name: '태릉입구', nameEn: 'Taereung Entrance', code: '645',
    hanja: '泰陵入口',
    hanjaDesc: '태릉(泰陵)은 문정왕후의 능. 泰는 \'크고 편안하다\', 陵은 국왕과 왕비의 묘.',
    transfer: '7호선', hasEvent: true, eventId: 'ev_taereung',
    trainState: 'crowded', logMsg: '태릉입구 — 7호선 환승 (혼잡)',
    desc: '노원구 공릉동. 7호선 환승. 육군사관학교와 장미정원이 가깝다.'
  },
  {
    id: 36, name: '화랑대', nameEn: 'Hwarangdae', code: '646',
    hanja: '花郞臺',
    hanjaDesc: '육군사관학교의 별칭인 \'화랑대\'에서 유래. 화랑(花郞)은 신라의 청년 전사.',
    transfer: null, hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '화랑대 통과',
    desc: '노원구 공릉동. 구 경춘선 숲길로 이어지는 산책로가 있다.'
  },
  {
    id: 37, name: '봉화산', nameEn: 'Bonghwasan', code: '647',
    hanja: '烽火山',
    hanjaDesc: '봉화(烽火)를 올리던 산(山). 조선시대 전국 봉화 통신망의 주요 거점.',
    transfer: null, hasEvent: true, eventId: 'ev_bonghwasan',
    trainState: 'event', logMsg: '봉화산 — 여정 종반부',
    desc: '중랑구 신내동. 봉화산 기슭. 오지에 가까운 한적함이 감돈다.'
  },
  {
    id: 38, name: '신내', nameEn: 'Sinnae', code: '648',
    hanja: '新內',
    hanjaDesc: '새 마을(新)의 안쪽(內). 망우산 기슭 아래 새로 형성된 마을.',
    transfer: '경춘선', hasEvent: true, eventId: 'ev_sinnae',
    trainState: 'event', logMsg: '신내 — 종착역 도착',
    desc: '중랑구 신내동. 6호선의 최종 종착역이자 경춘선 환승역. 이 긴 여정의 끝.'
  },
];

/* 빠른 검색용 맵 */
const STATION_MAP = {};
STATIONS.forEach(st => { STATION_MAP[st.id] = st; });

/* 이벤트 있는 역만 추출 */
const EVENT_STATIONS = STATIONS.filter(st => st.hasEvent);

/* 출발역 선택지 (주요 역 그룹) */
const START_STATION_GROUPS = [
  {
    label: '🟤 서부 (응암·불광 방면)',
    stations: [0, 2, 4, 6, 8],
  },
  {
    label: '🟤 마포 (망원·합정 방면)',
    stations: [11, 12, 14, 16],
  },
  {
    label: '🟤 용산·이태원 방면',
    stations: [18, 20, 22],
  },
  {
    label: '🟤 동부 (신당·동묘 방면)',
    stations: [25, 26, 29, 33],
  },
  {
    label: '🟤 북동부 (태릉·봉화산·신내 방면)',
    stations: [35, 36, 37, 38],
  },
];