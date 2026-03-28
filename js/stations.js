/* ═══════════════════════════════════════════════════
   stations.js — 서울 지하철 6호선 역 데이터 & 이벤트 정의
   총 38개 역: 응암순환 ~ 봉화산
   ═══════════════════════════════════════════════════ */

'use strict';

/*
  역 데이터 구조:
  {
    id:        고유 ID (숫자),
    name:      한글역명,
    nameEn:    영문역명,
    hanja:     한자역명 (없으면 null),
    hanjaDesc: 한자 유래 한 줄 요약,
    code:      역번호 (601~ 형식),
    transfer:  환승 노선 (없으면 null),
    hasEvent:  이벤트 보유 여부,
    eventId:   이벤트 씬 함수명 (station_events.js에서 정의),
    trainState:'running'|'crowded'|'event'|'danger' (주행중 패널 상태),
    logMsg:    도착 시 차내 로그 메시지,
    desc:      역 배경 설명 (게임 내 표시용),
  }
*/

const STATIONS = [
  {
    id: 0, name: '응암', nameEn: 'Eungam', code: '601',
    hanja: '鷹岩',
    hanjaDesc: '매(鷹)가 앉는 바위(岩)가 있던 곳. 매 사냥터였던 산기슭.',
    transfer: null, hasEvent: true, eventId: 'ev_eungam',
    trainState: 'running', logMsg: '응암 — 출발역 선택',
    desc: '은평구 응암동. 6호선의 시작점. 이른 아침 첫차 승객들.'
  },
  {
    id: 1, name: '역촌', nameEn: 'Yeokchon', code: '602',
    hanja: '驛村',
    hanjaDesc: '조선시대 역참(驛站)이 있던 마을(村). 공문서·물자 전달의 중간 기지.',
    transfer: null, hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '역촌 통과',
    desc: '은평구 역촌동. 주택가 한복판.'
  },
  {
    id: 2, name: '불광', nameEn: 'Bulgwang', code: '603',
    hanja: '佛光',
    hanjaDesc: '부처(佛)의 빛(光). 인근 불광사(佛光寺)에서 유래한 지명.',
    transfer: '3호선', hasEvent: true, eventId: 'ev_bulgwang',
    trainState: 'crowded', logMsg: '불광 — 3호선 환승역 (혼잡)',
    desc: '은평구 불광동. 3호선 환승역. 환승객으로 항상 붐빈다.'
  },
  {
    id: 3, name: '독바위', nameEn: 'Dokbawi', code: '604',
    hanja: null,
    hanjaDesc: '순우리말 지명. 날카롭게 솟은 바위가 있던 자리. 개발로 바위는 사라짐.',
    transfer: null, hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '독바위 통과',
    desc: '은평구 진관동 경계. 독바위라는 이름의 바위가 있던 곳.'
  },
  {
    id: 4, name: '연신내', nameEn: 'Yeonsinnae', code: '605',
    hanja: null,
    hanjaDesc: '순우리말 지명. \'연(년)신내\' — 못(沼) 옆 냇가. 옛 도성 밖 물가 마을.',
    transfer: '3호선', hasEvent: true, eventId: 'ev_yeonsinnae',
    trainState: 'crowded', logMsg: '연신내 — 3호선 환승 (매우 혼잡)',
    desc: '은평구 연신내. 상업지구. 3호선 환승으로 극도로 혼잡.'
  },
  {
    id: 5, name: '구산', nameEn: 'Gusan', code: '606',
    hanja: '龜山',
    hanjaDesc: '거북(龜)처럼 생긴 산(山)이 있던 곳. 풍수지리적 길지로 불림.',
    transfer: null, hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '구산 통과',
    desc: '은평구 구산동. 조용한 주택가.'
  },
  {
    id: 6, name: '새절', nameEn: 'Saejul', code: '607',
    hanja: null,
    hanjaDesc: '순우리말 지명. \'새(新)로 생긴 절(寺)\'. 새로 세운 절이 있던 마을.',
    transfer: '9호선(예정)', hasEvent: true, eventId: 'ev_saejul',
    trainState: 'event', logMsg: '새절 — 이상 승객 포착',
    desc: '은평구 신사동. 재개발 지역. 낯선 이가 탑승했다.'
  },
  {
    id: 7, name: '증산', nameEn: 'Jeungsan', code: '608',
    hanja: '甑山',
    hanjaDesc: '시루(甑, 쪄서 음식 만드는 그릇)처럼 생긴 산(山)에서 유래.',
    transfer: null, hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '증산 통과',
    desc: '은평구 증산동. 평범한 주거지역.'
  },
  {
    id: 8, name: '디지털미디어시티', nameEn: 'Digital Media City', code: '609',
    hanja: null,
    hanjaDesc: '상암 뉴타운 개발로 생긴 현대 지명. 방송·IT 클러스터를 뜻하는 영문명.',
    transfer: '공항철도·경의중앙선', hasEvent: true, eventId: 'ev_dmc',
    trainState: 'crowded', logMsg: 'DMC — 대규모 환승 (극혼잡)',
    desc: '마포구 상암동. 방송국·IT기업 밀집. 환승 인파가 몰린다.'
  },
  {
    id: 9, name: '월드컵경기장', nameEn: 'World Cup Stadium', code: '610',
    hanja: null,
    hanjaDesc: '2002 FIFA 월드컵을 위해 건립된 서울 상암 월드컵경기장에서 유래.',
    transfer: null, hasEvent: true, eventId: 'ev_worldcup',
    trainState: 'event', logMsg: '월드컵경기장 — 경기 관람객 탑승',
    desc: '마포구 상암동. 서울 월드컵경기장 인근. 경기 후 귀가 행렬.'
  },
  {
    id: 10, name: '마포구청', nameEn: 'Mapo-gu Office', code: '611',
    hanja: '麻浦區廳',
    hanjaDesc: '마포(麻浦)는 \'삼(麻) 뒤편 포구(浦)\'. 삼베 거래가 활발했던 한강 포구.',
    transfer: null, hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '마포구청 통과',
    desc: '마포구 성산동. 구청 앞 역.'
  },
  {
    id: 11, name: '망원', nameEn: 'Mangwon', code: '612',
    hanja: '望遠',
    hanjaDesc: '멀리(遠) 바라본다(望). 조선 인조가 이곳에서 한강 너머를 바라본 데서 유래.',
    transfer: null, hasEvent: true, eventId: 'ev_mangwon',
    trainState: 'event', logMsg: '망원 — 발 밟힘 시비 발생',
    desc: '마포구 망원동. 카페·맛집 골목. 퇴근길 인파.'
  },
  {
    id: 12, name: '합정', nameEn: 'Hapjeong', code: '613',
    hanja: '合井',
    hanjaDesc: '두 물줄기가 합쳐지는(合) 우물(井)이 있던 곳. 한강과 샛강이 만나는 지점.',
    transfer: '2호선', hasEvent: true, eventId: 'ev_hapjeong',
    trainState: 'crowded', logMsg: '합정 — 2호선 환승 (매우 혼잡)',
    desc: '마포구 합정동. 2호선 환승. 홍대 인접 상권.'
  },
  {
    id: 13, name: '상수', nameEn: 'Sangsu', code: '614',
    hanja: '上水',
    hanjaDesc: '윗(上)쪽 물가(水). 마포 일대에서 한강 상류 방향의 포구가 있던 자리.',
    transfer: null, hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '상수 통과',
    desc: '마포구 상수동. 조용한 카페거리.'
  },
  {
    id: 14, name: '광흥창', nameEn: 'Gwangheungchang', code: '615',
    hanja: '廣興倉',
    hanjaDesc: '조선 관리들의 녹봉(봉급)을 보관하던 국가 창고(倉). 廣興은 \'널리 흥하다\'.',
    transfer: null, hasEvent: true, eventId: 'ev_gwangheungchang',
    trainState: 'event', logMsg: '광흥창 — 취객 탑승',
    desc: '마포구 신수동. 마포대교 인근. 심야 취객이 올라탔다.'
  },
  {
    id: 15, name: '대흥', nameEn: 'Daeheung', code: '616',
    hanja: '大興',
    hanjaDesc: '크게(大) 흥하다(興). 조선시대 마을 이름에서 유래. 번성하기를 바라는 뜻.',
    transfer: null, hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '대흥 통과',
    desc: '마포구 대흥동. 서강대학교 인근.'
  },
  {
    id: 16, name: '공덕', nameEn: 'Gongdeok', code: '617',
    hanja: '孔德',
    hanjaDesc: '공덕(孔德)이란 \'구멍(孔) 덕(德)\'. 공씨 가문의 덕을 기리거나 지형에서 유래설.',
    transfer: '5호선·경의중앙선·공항철도', hasEvent: true, eventId: 'ev_gongdeok',
    trainState: 'danger', logMsg: '공덕 — 비상 상황 발생!',
    desc: '마포구 공덕동. 4개 노선 환승역. 갑작스러운 비상 방송.'
  },
  {
    id: 17, name: '효창공원앞', nameEn: 'Hyochang Park', code: '618',
    hanja: '孝昌公園',
    hanjaDesc: '효(孝)와 번창(昌)을 뜻함. 조선 정조 아들 문효세자 묘원에서 유래. 독립운동가 안장지.',
    transfer: null, hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '효창공원앞 통과',
    desc: '용산구 효창동. 효창공원 인근. 역사 깊은 거리.'
  },
  {
    id: 18, name: '삼각지', nameEn: 'Samgakji', code: '619',
    hanja: '三角地',
    hanjaDesc: '세(三) 갈래 각(角) 형태의 땅(地). 세 도로가 만나는 삼각형 지형.',
    transfer: '4호선', hasEvent: true, eventId: 'ev_samgakji',
    trainState: 'event', logMsg: '삼각지 — 수상한 가방 발견',
    desc: '용산구 한강로동. 4호선 환승. 누군가 가방을 두고 내렸다.'
  },
  {
    id: 19, name: '신용산', nameEn: 'Shin-Yongsan', code: '620',
    hanja: '新龍山',
    hanjaDesc: '새로운(新) 용산(龍山). 용산(龍山)은 용처럼 꾸불거리는 산세에서 유래.',
    transfer: '경의중앙선', hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '신용산 통과',
    desc: '용산구 이촌동. 경의중앙선 환승.'
  },
  {
    id: 20, name: '이태원', nameEn: 'Itaewon', code: '621',
    hanja: '梨泰院',
    hanjaDesc: '배나무(梨) 밭이 있던 역원(驛院 — 泰院). 조선시대 외국 사신이 묵던 원(院).',
    transfer: null, hasEvent: true, eventId: 'ev_itaewon',
    trainState: 'crowded', logMsg: '이태원 — 외국인 관광객 탑승',
    desc: '용산구 이태원동. 글로벌 거리. 다국어 대화가 들린다.'
  },
  {
    id: 21, name: '한강진', nameEn: 'Hangangjin', code: '622',
    hanja: '漢江鎭',
    hanjaDesc: '한강(漢江) 나루터에 있던 군사 진영(鎭). 조선시대 한강을 지키던 수군 진지.',
    transfer: null, hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '한강진 통과',
    desc: '용산구 한강진동. 한강 바로 옆. 창 밖으로 강이 보인다.'
  },
  {
    id: 22, name: '버티고개', nameEn: 'Berti Pass', code: '623',
    hanja: null,
    hanjaDesc: '순우리말 지명. 가파른 고개를 넘을 때 \'버텨야\' 한다는 뜻. 일설에는 \'벌티\'(벌판 고개).',
    transfer: null, hasEvent: true, eventId: 'ev_berti',
    trainState: 'event', logMsg: '버티고개 — 노인 실신 신고',
    desc: '성동구 금호동. 가파른 언덕 동네. 노인이 쓰러졌다.'
  },
  {
    id: 23, name: '약수', nameEn: 'Yaksu', code: '624',
    hanja: '藥水',
    hanjaDesc: '약(藥)이 되는 물(水). 이 일대 샘물이 병을 고친다 하여 약수터로 유명했음.',
    transfer: '3호선', hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '약수 통과',
    desc: '중구 신당동. 3호선 환승.'
  },
  {
    id: 24, name: '청구', nameEn: 'Cheonggu', code: '625',
    hanja: '靑丘',
    hanjaDesc: '푸른(靑) 언덕(丘). 한국의 옛 별칭인 \'청구(靑丘)\'와도 연관. 초록 산이 있던 동네.',
    transfer: '5호선', hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '청구 통과',
    desc: '성동구 행당동. 5호선 환승.'
  },
  {
    id: 25, name: '신당', nameEn: 'Sindang', code: '626',
    hanja: '新堂',
    hanjaDesc: '새(新) 마을(堂·洞). 조선시대 도성 밖 새로 형성된 마을. 또는 신당(神堂, 무속 신당)설.',
    transfer: '2호선', hasEvent: true, eventId: 'ev_sindang',
    trainState: 'crowded', logMsg: '신당 — 2호선 환승 (혼잡)',
    desc: '중구 신당동. 2호선 환승. 중앙시장 장꾼들이 오른다.'
  },
  {
    id: 26, name: '동묘앞', nameEn: 'Dongmyo', code: '627',
    hanja: '東廟',
    hanjaDesc: '동(東)쪽 사당(廟). 임진왜란 후 관우를 모신 동관왕묘(東關王廟)에서 유래.',
    transfer: '1호선', hasEvent: true, eventId: 'ev_dongmyo',
    trainState: 'event', logMsg: '동묘앞 — 고물상 할아버지',
    desc: '종로구 숭인동. 1호선 환승. 동묘벼룩시장 단골들.'
  },
  {
    id: 27, name: '창신', nameEn: 'Changsin', code: '628',
    hanja: '昌信',
    hanjaDesc: '번창(昌)하고 믿음직한(信) 곳. 조선 도성 밖에 형성된 직물·봉제 마을.',
    transfer: null, hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '창신 통과',
    desc: '종로구 창신동. 봉제공장 골목.'
  },
  {
    id: 28, name: '보문', nameEn: 'Bomun', code: '629',
    hanja: '普門',
    hanjaDesc: '널리(普) 열린 문(門). 불교 관음신앙의 \'보문품(普門品)\'에서 유래. 인근 보문사가 있음.',
    transfer: null, hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '보문 통과',
    desc: '성북구 보문동. 성신여대 인근.'
  },
  {
    id: 29, name: '안암', nameEn: 'Anam', code: '630',
    hanja: '安岩',
    hanjaDesc: '편안한(安) 바위(岩). 마을 뒤 바위가 마을을 지킨다는 믿음에서 유래.',
    transfer: null, hasEvent: true, eventId: 'ev_anam',
    trainState: 'event', logMsg: '안암 — 고려대생들 단체 탑승',
    desc: '성북구 안암동. 고려대학교 앞. MT 가는 학생들이 쏟아진다.'
  },
  {
    id: 30, name: '고려대', nameEn: 'Korea Univ.', code: '631',
    hanja: '高麗大',
    hanjaDesc: '고려(高麗, Korea)의 이름을 딴 대학교. 고려는 \'높고(高) 아름답다(麗)\'는 뜻.',
    transfer: null, hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '고려대 통과',
    desc: '성북구 안암동. 고려대학교 정문 앞.'
  },
  {
    id: 31, name: '월곡', nameEn: 'Wolgok', code: '632',
    hanja: '月谷',
    hanjaDesc: '달(月)이 비치는 골짜기(谷). 달빛이 맑게 비치는 고요한 산골에서 유래.',
    transfer: null, hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '월곡 통과',
    desc: '성북구 월곡동. 한국과학기술연구원(KIST) 인근.'
  },
  {
    id: 32, name: '상월곡', nameEn: 'Sangwolgok', code: '633',
    hanja: '上月谷',
    hanjaDesc: '월곡(月谷)의 위쪽(上). 달빛 골짜기 위에 자리한 마을.',
    transfer: null, hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '상월곡 통과',
    desc: '성북구 월곡동 북쪽.'
  },
  {
    id: 33, name: '돌곶이', nameEn: 'Dolgoji', code: '634',
    hanja: null,
    hanjaDesc: '순우리말 지명. \'돌(石)이 꽂혀있다\'. 돌이 튀어나온 지형. 석관(石串)과 같은 뜻.',
    transfer: null, hasEvent: true, eventId: 'ev_dolgoji',
    trainState: 'event', logMsg: '돌곶이 — 무임승차 단속',
    desc: '성북구 석관동. 단속요원과 무임승차자의 실랑이.'
  },
  {
    id: 34, name: '석계', nameEn: 'Seokgye', code: '635',
    hanja: '石溪',
    hanjaDesc: '돌(石)이 많은 시냇가(溪). 돌이 많은 하천 주변 마을. 석관동과 같은 어원.',
    transfer: '1호선', hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '석계 통과',
    desc: '성북구 석관동. 1호선 환승.'
  },
  {
    id: 35, name: '태릉입구', nameEn: 'Taereung', code: '636',
    hanja: '泰陵入口',
    hanjaDesc: '태릉(泰陵)은 조선 중종의 계비 문정왕후의 능(陵). 泰는 \'크고 편안하다\'.',
    transfer: '7호선', hasEvent: true, eventId: 'ev_taereung',
    trainState: 'crowded', logMsg: '태릉입구 — 7호선 환승 (혼잡)',
    desc: '노원구 공릉동. 7호선 환승. 육군사관학교 인근.'
  },
  {
    id: 36, name: '화랑대', nameEn: 'Hwarangdae', code: '637',
    hanja: '花郞臺',
    hanjaDesc: '화랑(花郞)은 신라 청년 엘리트 집단. 육군사관학교 옛 이름 \'화랑대\'에서 유래.',
    transfer: null, hasEvent: false, eventId: null,
    trainState: 'running', logMsg: '화랑대 통과',
    desc: '노원구 공릉동. 경춘선 옛 터가 남아있다.'
  },
  {
    id: 37, name: '봉화산', nameEn: 'Bonghwasan', code: '638',
    hanja: '烽火山',
    hanjaDesc: '봉화(烽火, 신호 불)를 올리던 산(山). 조선시대 전국 봉화 통신망의 거점.',
    transfer: null, hasEvent: true, eventId: 'ev_bonghwasan',
    trainState: 'event', logMsg: '봉화산 — 종착역 도착',
    desc: '중랑구 신내동. 6호선의 종착역. 이 여정의 끝.'
  },
];

/* 빠른 검색용 맵 */
const STATION_MAP = {};
STATIONS.forEach(st => { STATION_MAP[st.id] = st; });

/* 이벤트 있는 역만 추출 */
const EVENT_STATIONS = STATIONS.filter(st => st.hasEvent);

/*
  방향 정보:
  - 상행(上行): 응암(601) → 봉화산(638) 방향 = index 증가
  - 하행(下行): 봉화산(638) → 응암(601) 방향 = index 감소
  게임에서 선택한 startStation 기준:
    상행 → startStation ~ 37 (봉화산)
    하행 → startStation ~ 0 (응암)
*/

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
    label: '🟤 북동부 (태릉·봉화산 방면)',
    stations: [35, 36, 37],
  },
];
