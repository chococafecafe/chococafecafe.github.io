/*
  초코카페 콘텐츠 수정 파일
  글, 메뉴, 캐릭터 이름을 바꾸고 싶을 때 이 파일을 수정하세요.
  사진을 추가할 때는 images 폴더에 파일을 올린 뒤 image: "images/파일명.jpg"를 넣으면 됩니다.
*/
window.CHOCO_DATA = {
  dessert: {
    kicker: "TODAY'S SWEET MENU",
    title: "DESSERT MENU",
    intro: "今日のチョコカフェのメニュー♡",
    subtitle: "오늘의 추천 디저트 메뉴를 골라 보세요!",
    items: [
      {name:"まめごま 딸기 파르페", desc:"새콤달콤 딸기와 폭신한 크림을 듬뿍!", emoji:"🍓", tag:"NO.01 · STRAWBERRY"},
      {name:"슈가바니즈 마카롱", desc:"핑크와 화이트, 사랑스러운 두 가지 맛.", emoji:"🐰", tag:"NO.02 · MACARON"},
      {name:"코기뮹 구름 케이크", desc:"몽글몽글 구름처럼 부드러운 케이크.", emoji:"☁️", tag:"NO.03 · CREAM CAKE"},
      {name:"냥냥냥코 초코 푸딩", desc:"초코 소스가 듬뿍 올라간 작은 푸딩.", emoji:"🐱", tag:"NO.04 · CHOCOLATE"}
    ]
  },
  music: {
    kicker:"MUSIC PLAYER",
    title:"MUSIC ROOM",
    intro:"お気に入りのメロディ ♡",
    subtitle:"마음에 오래 머무는 노래들을 모아 두는 곳.",
    items:[
      {name:"오늘의 플레이리스트",desc:"좋아하는 노래를 하나씩 추가해 주세요.",emoji:"🎧",tag:"PLAYLIST"},
      {name:"애니메이션 OST",desc:"장면과 함께 기억하고 싶은 음악.",emoji:"🎼",tag:"ANIME OST"},
      {name:"추억의 J-POP",desc:"헤이세이 감성이 가득한 노래들.",emoji:"💿",tag:"J-POP"},
      {name:"마음에 남은 가사",desc:"잊고 싶지 않은 한 소절을 기록해요.",emoji:"💌",tag:"LYRICS"}
    ]
  },
  anime: {
    kicker:"ANIME COLLECTION",
    title:"ANIME ROOM",
    intro:"大好きな物語たち ♡",
    subtitle:"보고 나서도 마음에 남아 있는 이야기.",
    items:[
      {name:"시간을 달리는 소녀",desc:"돌아갈 수 없는 순간과 앞으로 달려가는 마음.",emoji:"🌻",tag:"MOVIE · 2006"},
      {name:"너의 이름은.",desc:"엇갈린 시간 속에서 서로를 찾아가는 이야기.",emoji:"🌠",tag:"MOVIE · 2016"},
      {name:"4월은 너의 거짓말",desc:"음악과 계절, 그리고 반짝이는 기억.",emoji:"🎻",tag:"ANIME · 2014"},
      {name:"나의 다음 애니",desc:"새롭게 발견한 작품을 여기에 추가해요.",emoji:"🎀",tag:"TO WATCH"}
    ]
  },
  character: {
    kicker:"CHARACTER CATALOG",
    title:"MY CHARACTERS",
    intro:"かわいい子たち、大集合！",
    subtitle:"초코카페에 놀러 온 귀여운 친구들.",
    items:[
      {name:"마메고마",desc:"작고 동그란 물범 친구 ♡",emoji:"🦭",tag:"FAVORITE"},
      {name:"슈가바니즈",desc:"달콤하고 포근한 토끼 친구들.",emoji:"🐰",tag:"SWEET"},
      {name:"코기뮹",desc:"밀가루 반죽처럼 말랑한 매력.",emoji:"🍞",tag:"SO CUTE"},
      {name:"냥냥냥코",desc:"고양이 친구들의 사랑스러운 일상.",emoji:"🐱",tag:"NYA"}
    ]
  },
  diary: {
    kicker:"DAEUN'S NOTE",
    title:"MY DIARY",
    intro:"今日の気持ちを、少しだけ。",
    subtitle:"마음에 남은 문장과 일본어 일기를 기록해요.",
    entries:[
      {date:"MY DREAM",title:"東京留学",body:"今はまだ夢だけど、いつか私の「今日」になる東京留学のために。",translation:"지금은 아직 꿈이지만, 언젠가 나의 ‘오늘’이 될 도쿄 유학을 위해."},
      {date:"DAILY NOTE",title:"오늘의 한 문장",body:"오늘의 기분과 새롭게 배운 표현을 이곳에 적어 보세요.",translation:"일기 내용은 data.js에서 자유롭게 수정할 수 있어요."}
    ]
  },
  archive: {
    kicker:"LITTLE THINGS I LOVE",
    title:"TASTE ARCHIVE",
    intro:"好きなものを、好きなだけ。",
    subtitle:"작고 귀여운 취향을 수집하는 다은이의 도감.",
    items:[
      {name:"핑크와 초코",desc:"연핑크, 밀크초코, 딸기우유 색.",emoji:"🎀",tag:"COLOR"},
      {name:"문구와 리본",desc:"스티커, 다이어리, 반짝이는 장식.",emoji:"🖊️",tag:"STATIONERY"},
      {name:"순정만화",desc:"오래 간직하고 싶은 만화책.",emoji:"📚",tag:"BOOK"},
      {name:"일본의 작은 가게",desc:"레트로한 카페와 아기자기한 거리.",emoji:"☕",tag:"PLACE"}
    ]
  },
  profile: {
    kicker:"WELCOME TO CHOCO CAFÉ",
    title:"ABOUT THE CAFE",
    heading:"チョコカフェにようこそ！",
    body:"초코카페는 다은이가 좋아하는 캐릭터와 디저트, 음악, 애니메이션 그리고 작은 취향을 모아 둔 공간입니다. 천천히 구경하고 가세요. 마음에 드는 메뉴가 있길 바라요 ♡"
  },
  guest: {
    kicker:"MESSAGE FOR YOU",
    title:"GUEST BOOK",
    heading:"방명록은 준비 중이에요 ♡",
    body:"초코카페에 다녀간 기분을 남길 수 있는 방명록을 나중에 연결할 예정이에요. 지금은 좋아하는 디저트와 캐릭터를 마음속으로 골라 주세요!"
  }
};
