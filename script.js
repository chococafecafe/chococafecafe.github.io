const $ = (id) => document.getElementById(id);
const state = { app: null, monthOffset: 0, tracks: [], trackIndex: 0, audioUrl: null, dessertItems: [] };

function updateClock(){
  const now = new Date();
  const time = now.toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit",hour12:false});
  const ampm = now.getHours() >= 12 ? "PM" : "AM";
  const date = now.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"2-digit"}).toUpperCase();
  $("statusTime").textContent = time;
  $("lockClock").textContent = now.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:true});
  $("lockDate").textContent = date;
  $("heartTime").textContent = time;
  $("heartAmPm").textContent = ampm;
  $("homeDate").textContent = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,"0")}.${String(now.getDate()).padStart(2,"0")} ${now.toLocaleDateString("en-US",{weekday:"short"}).toUpperCase()}`;
}
updateClock(); setInterval(updateClock,1000);

function showScreen(which){
  $("lockScreen").classList.toggle("hidden",which!=="lock");
  $("homeScreen").classList.toggle("hidden",which!=="home");
  $("appScreen").classList.toggle("hidden",which!=="app");
}
$("unlockButton").addEventListener("click",()=>{
  $("lockState").textContent="Unlocked";
  $("unlockButton").classList.add("unlocked");
  setTimeout(()=>showScreen("home"),260);
});
$("hardwareHome").addEventListener("click",()=>{state.app=null;showScreen("home");});
$("appBack").addEventListener("click",()=>{state.app=null;showScreen("home");});
$("hardwareBack").addEventListener("click",()=>{if(state.app){state.app=null;showScreen("home");}else showScreen("lock");});
$("hardwareMenu").addEventListener("click",()=>openApp("calendar"));
$("appMenu").addEventListener("click",()=>openApp("calendar"));
document.querySelectorAll("[data-app]").forEach(btn=>btn.addEventListener("click",()=>openApp(btn.dataset.app)));

const titles={dessert:"dessert menu",anime:"anime collection",music:"music player",message:"message box",diary:"my diary",calendar:"calendar",character:"character"};
function openApp(app){
  state.app=app; showScreen("app");
  $("appTitle").textContent=titles[app]||app.toUpperCase();
  $("appEyebrow").textContent="choco application";
  const renderers={dessert:renderDessert,anime:renderAnime,music:renderMusic,message:renderMessage,diary:renderDiary,calendar:renderCalendar,character:renderCharacter};
  renderers[app]();
}
function safeText(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function fileToData(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});}
function saveLocal(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch(e){alert("저장 공간이 부족해요. 사진 크기를 줄여서 다시 시도해 주세요.");}}
function loadLocal(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch(e){return fallback;}}

function renderDessert(){
  const items=loadLocal("chocoDesserts",[]);
  $("appBody").innerHTML=`<div class="ribbon-title">today's dessert menu ♡</div><p class="section-note">사진과 메뉴를 직접 추가해 봐!</p><div class="editor-toolbar"><button class="soft-btn dark" id="addDessert">＋ 사진과 메뉴 추가</button></div><div class="dessert-list" id="dessertList"></div><p class="section-note">♡ CHOCO CAFÉ · sweet menu ♡</p>`;
  const list=$("dessertList");
  items.forEach((it,i)=>{
    const el=document.createElement("article");el.className="dessert-item";
    el.innerHTML=`<img src="${it.image}" alt=""><div><input aria-label="메뉴 이름" placeholder="메뉴 이름" value="${safeText(it.name||"")}"><textarea aria-label="메뉴 설명" placeholder="맛과 특징을 적어줘">${safeText(it.desc||"")}</textarea><div class="dessert-price">♡ choco special ♡</div></div><button class="remove-item" title="삭제">×</button>`;
    const [name,desc]=el.querySelectorAll("input,textarea");
    const update=()=>{items[i].name=name.value;items[i].desc=desc.value;saveLocal("chocoDesserts",items);};
    name.addEventListener("input",update);desc.addEventListener("input",update);
    el.querySelector(".remove-item").addEventListener("click",()=>{items.splice(i,1);saveLocal("chocoDesserts",items);renderDessert();});
    list.append(el);
  });
  $("addDessert").addEventListener("click",()=>$("dessertPhotoPicker").click());
}
$("dessertPhotoPicker").addEventListener("change",async e=>{
  const files=[...e.target.files];const items=loadLocal("chocoDesserts",[]);
  for(const file of files){if(!file.type.startsWith("image/"))continue;items.push({image:await fileToData(file),name:"",desc:""});}
  saveLocal("chocoDesserts",items);if(state.app==="dessert")renderDessert();e.target.value="";
});

function renderMusic(){
  $("appBody").innerHTML=`<div class="ribbon-title">my little music ♡</div><p class="section-note">나만의 mp3 플레이어</p><div class="music-player"><div class="mp3-screen"><div class="lcd-top"><span>choco mp3</span><span>♫　PLAY</span></div><div class="mp3-track" id="trackName">no music selected</div><div class="mp3-artist" id="trackArtist">add your favorite songs ♡</div><div class="progress"><span id="progressFill"></span></div><div class="lcd-top"><span id="elapsed">00:00</span><span id="duration">00:00</span></div></div><div class="player-controls"><button id="prevTrack">◀</button><button id="playTrack">▶</button><button id="nextTrack">▶|</button></div><div class="editor-toolbar"><button class="soft-btn dark" id="addMusic">＋ MP3 음악 추가</button></div></div><ul class="track-list" id="trackList"></ul><p class="section-note">※ 선택한 음악은 이 브라우저에서 재생돼. 다른 기기에는 자동으로 공유되지 않아.</p><audio id="audioPlayer"></audio>`;
  const audio=$("audioPlayer");
  const draw=()=>{
    $("trackList").innerHTML="";
    state.tracks.forEach((track,i)=>{const li=document.createElement("li");if(i===state.trackIndex)li.classList.add("active");li.innerHTML=`<span>${String(i+1).padStart(2,"0")}</span><button>${safeText(track.name)}</button><span>♫</span>`;li.querySelector("button").addEventListener("click",()=>playIndex(i));$("trackList").append(li);});
    const current=state.tracks[state.trackIndex];$("trackName").textContent=current?current.name:"no music selected";$("trackArtist").textContent=current?"choco café playlist":"add your favorite songs ♡";
  };
  function playIndex(i){if(!state.tracks.length)return;state.trackIndex=(i+state.tracks.length)%state.tracks.length;if(state.audioUrl)URL.revokeObjectURL(state.audioUrl);state.audioUrl=URL.createObjectURL(state.tracks[state.trackIndex].file);audio.src=state.audioUrl;audio.play().catch(()=>{});draw();$("playTrack").textContent="Ⅱ";}
  $("playTrack").addEventListener("click",()=>{if(!state.tracks.length){$("audioPicker").click();return;}if(audio.paused){if(!audio.src)playIndex(state.trackIndex);else audio.play();$("playTrack").textContent="Ⅱ";}else{audio.pause();$("playTrack").textContent="▶";}});
  $("prevTrack").addEventListener("click",()=>playIndex(state.trackIndex-1));
  $("nextTrack").addEventListener("click",()=>playIndex(state.trackIndex+1));
  $("addMusic").addEventListener("click",()=>$("audioPicker").click());
  audio.addEventListener("timeupdate",()=>{const p=audio.duration?audio.currentTime/audio.duration*100:0;$("progressFill").style.width=p+"%";$("elapsed").textContent=fmt(audio.currentTime);$("duration").textContent=fmt(audio.duration);});
  audio.addEventListener("ended",()=>playIndex(state.trackIndex+1));
  function fmt(v){if(!Number.isFinite(v))return"00:00";return `${String(Math.floor(v/60)).padStart(2,"0")}:${String(Math.floor(v%60)).padStart(2,"0")}`;}
  draw();
}
$("audioPicker").addEventListener("change",e=>{
  [...e.target.files].forEach(file=>{if(file.type.startsWith("audio/")||/\.(mp3|m4a|wav|ogg)$/i.test(file.name))state.tracks.push({name:file.name.replace(/\.[^.]+$/,""),file});});
  if(state.app==="music")renderMusic();e.target.value="";
});

function renderCalendar(){
  const base=new Date();base.setDate(1);base.setMonth(base.getMonth()+state.monthOffset);
  const y=base.getFullYear(),m=base.getMonth(),today=new Date();
  const monthName=base.toLocaleDateString("en-US",{month:"long",year:"numeric"});
  let html=`<div class="ribbon-title">♡ my sweet calendar ♡</div><div class="calendar-wrap"><div class="calendar-top"><button id="prevMonth">‹</button><strong>${monthName}</strong><button id="nextMonth">›</button></div><div class="calendar-grid">`;
  ["SUN","MON","TUE","WED","THU","FRI","SAT"].forEach((d,i)=>html+=`<span class="weekday ${i===0?"sun":i===6?"sat":""}">${d}</span>`);
  const start=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate();
  for(let i=0;i<start;i++)html+="<span></span>";
  for(let d=1;d<=days;d++){const dow=new Date(y,m,d).getDay();const isToday=y===today.getFullYear()&&m===today.getMonth()&&d===today.getDate();html+=`<span class="${isToday?"today":""} ${dow===0?"sun":dow===6?"sat":""} ${dow===0||dow===6?"heart-day":""}">${d}</span>`;}
  html+=`</div><div class="calendar-memo">♡ today is ${today.getFullYear()}.${String(today.getMonth()+1).padStart(2,"0")}.${String(today.getDate()).padStart(2,"0")} · ${today.toLocaleDateString("en-US",{weekday:"long"}).toUpperCase()} ♡<br>little things make lovely days.</div></div>`;
  $("appBody").innerHTML=html;
  $("prevMonth").addEventListener("click",()=>{state.monthOffset--;renderCalendar();});
  $("nextMonth").addEventListener("click",()=>{state.monthOffset++;renderCalendar();});
}
function renderDiary(){
  $("appBody").innerHTML=`<div class="ribbon-title">dear diary ♡</div><div class="diary-date">${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric",weekday:"long"})}</div><p class="section-note">사진을 붙이고 글을 써서 오늘의 페이지를 만들어 봐.</p><div class="editor-toolbar"><button class="soft-btn dark" id="addDiaryPhoto">＋ 사진 추가</button><button class="soft-btn" id="addDiaryText">＋ 글씨 추가</button><button class="soft-btn" id="saveDiary">♡ 저장</button></div><div class="diary-board" id="diaryBoard"></div><p class="section-note">글씨를 눌러 수정하고, 삭제 버튼으로 사진이나 글 카드를 지울 수 있어. 카드를 끌어서 순서를 바꿔봐!</p>`;
  const board=$("diaryBoard");const cards=loadLocal("chocoDiary",[]);
  function addCard(card){const el=document.createElement("div");el.className=card.type==="text"?"diary-text-card":"diary-card";el.draggable=true;el.dataset.id=card.id;
    if(card.type==="text"){
      el.innerHTML=`<button class="delete-card" title="글 카드 삭제" aria-label="글 카드 삭제">×</button><div class="diary-text-content" contenteditable="true">${safeText(card.text||"오늘의 기록을 적어줘 ♡")}</div>`;
    } else {
      el.innerHTML=`<button class="delete-card" title="사진 카드 삭제" aria-label="사진 카드 삭제">×</button><img src="${card.image}" alt=""><div contenteditable="true">${safeText(card.caption||"a lovely memory ♡")}</div>`;
    }
    el.addEventListener("dragstart",e=>{e.dataTransfer.setData("text/plain",card.id);});
    el.addEventListener("dragover",e=>e.preventDefault());
    el.addEventListener("drop",e=>{e.preventDefault();const id=e.dataTransfer.getData("text/plain");const moving=[...board.children].find(x=>x.dataset.id===id);if(moving&&moving!==el)board.insertBefore(moving,el);});
    const del=el.querySelector(".delete-card");if(del)del.addEventListener("click",()=>{el.remove();persist();});
    board.append(el);
  }
  cards.forEach(addCard);
  function persist(){const data=[...board.children].map(el=>el.classList.contains("diary-text-card")?{id:el.dataset.id,type:"text",text:el.innerText}:{id:el.dataset.id,type:"photo",image:el.querySelector("img").src,caption:el.querySelector("[contenteditable]").innerText});saveLocal("chocoDiary",data);}
  $("addDiaryPhoto").addEventListener("click",()=>$("diaryPhotoPicker").click());
  $("addDiaryText").addEventListener("click",()=>{addCard({id:"d"+Date.now(),type:"text",text:"오늘의 기록을 적어줘 ♡"});persist();});
  $("saveDiary").addEventListener("click",()=>{persist();alert("오늘의 다이어리를 이 브라우저에 저장했어 ♡");});
  board.addEventListener("input",persist);
}
$("diaryPhotoPicker").addEventListener("change",async e=>{
  const board=$("diaryBoard");if(state.app!=="diary"||!board){e.target.value="";return;}
  for(const file of [...e.target.files]){
    if(!file.type.startsWith("image/"))continue;
    const data=await fileToData(file);
    const id="d"+Date.now()+Math.random().toString(16).slice(2);
    const el=document.createElement("div");
    el.className="diary-card";el.draggable=true;el.dataset.id=id;
    el.innerHTML=`<button class="delete-card" title="사진 카드 삭제" aria-label="사진 카드 삭제">×</button><img src="${data}" alt=""><div contenteditable="true">a lovely memory ♡</div>`;
    el.querySelector(".delete-card").addEventListener("click",()=>{el.remove();$("saveDiary").click();});
    board.append(el);
  }
  $("saveDiary").click();e.target.value="";
});
function renderAnime(){$("appBody").innerHTML=`<div class="ribbon-title">my anime collection ♡</div><div class="message-paper">애니메이션 소개 공간은 다음 단계에서 사진과 이야기로 채울게. ♡</div>`;}
function renderMessage(){$("appBody").innerHTML=`<div class="ribbon-title">message for you ♡</div><div class="message-paper">초코카페에 온 걸 환영해!<br><br>이곳은 작은 취향과 추억을 모아두는 공간이야.<br><br>천천히 둘러보고 달콤한 추억 하나 가져가길 ♡</div>`;}
function renderCharacter(){$("appBody").innerHTML=`<div class="empty-character"><div class="big">୨୧</div><div class="ribbon-title">character room</div><p>coming soon...</p><small>이 공간은 나중에 꾸며볼게 ♡</small></div>`;}
