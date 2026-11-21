const $ = (selector) => document.querySelector(selector);
const lockScreen = $("#lockScreen");
const homeScreen = $("#homeScreen");
const appScreen = $("#appScreen");
const appContent = $("#appContent");
const appTitle = $("#appTitle");
const appKicker = $("#appKicker");

const weekdays = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
const months = ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];

function updateClock(){
  const now = new Date();
  const time = now.toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit",hour12:false});
  const date = `${weekdays[now.getDay()]} · ${months[now.getMonth()]} ${now.getDate()}`;
  $("#clock").textContent = time;
  $("#lockTime").textContent = time;
  $("#lockDate").textContent = date;
  $("#homeDate").textContent = `${String(now.getMonth()+1).padStart(2,"0")}.${String(now.getDate()).padStart(2,"0")} ${weekdays[now.getDay()]}`;
}
updateClock();
setInterval(updateClock,1000);

function showScreen(screen){
  [lockScreen,homeScreen,appScreen].forEach(el=>el.classList.remove("active"));
  screen.classList.add("active");
}
$("#unlockButton").addEventListener("click",()=>showScreen(homeScreen));

function makeCard(item){
  const art = item.image
    ? `<div class="content-art"><img src="${item.image}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover"></div>`
    : `<div class="content-art">${item.emoji || "♡"}</div>`;
  return `<article class="content-card">${art}<div class="mini-tag">${item.tag || "CHOCO PICK"}</div><h3>${item.name}</h3><p>${item.desc || ""}</p></article>`;
}
function renderApp(key){
  const data = window.CHOCO_DATA[key];
  if(!data) return;
  appKicker.textContent = data.kicker || "CHOCO APPLICATION";
  appTitle.textContent = data.title || key.toUpperCase();
  let html = `<div class="menu-welcome"><div class="jp">${data.intro || "ようこそ！"}</div><p>${data.subtitle || ""}</p></div>`;
  if(data.items){
    html += `<div class="content-grid">${data.items.map(makeCard).join("")}</div>`;
  }
  if(data.entries){
    html += data.entries.map(entry=>`<article class="text-entry"><small>${entry.date || ""}</small><h3>${entry.title}</h3><p>${entry.body}</p><p style="margin-top:7px;color:#b17d8d">${entry.translation || ""}</p></article>`).join("");
  }
  if(data.heading){
    html += `<div class="profile-card"><div class="profile-heart">♡</div><h2>${data.heading}</h2><p>${data.body}</p></div>`;
  }
  html += `<button class="app-back-home" type="button">♡ 홈 화면으로 돌아가기</button>`;
  appContent.innerHTML = html;
  appContent.querySelector(".app-back-home").addEventListener("click",()=>showScreen(homeScreen));
  showScreen(appScreen);
  appContent.scrollTop=0;
}
document.querySelectorAll("[data-app]").forEach(button=>{
  button.addEventListener("click",()=>renderApp(button.dataset.app));
});
$("#backButton").addEventListener("click",()=>showScreen(homeScreen));
$("#hardwareBack").addEventListener("click",()=>{
  if(appScreen.classList.contains("active")) showScreen(homeScreen);
  else if(homeScreen.classList.contains("active")) showScreen(lockScreen);
});
$("#hardwareHome").addEventListener("click",()=>showScreen(homeScreen));
$("#hardwareMenu").addEventListener("click",()=>showScreen(homeScreen));
