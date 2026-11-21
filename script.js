const $ = (id) => document.getElementById(id);
const lockScreen = $('lockScreen');
const homeScreen = $('homeScreen');
const appScreen = $('appScreen');
let currentView = 'lock';

const appInfo = {
  dessert: {title:'dessert', heading:'sweet menu', description:'a little sweetness for today'},
  anime: {title:'anime', heading:'anime room', description:'stories that stay in our hearts'},
  music: {title:'music', heading:'music box', description:'songs for every little moment'},
  message: {title:'message', heading:'little letters', description:'a place for lovely messages'},
  diary: {title:'diary', heading:'my diary', description:'photos, notes, and everyday memories'},
  calendar: {title:'calendar', heading:'calendar', description:'today is a page in your story'},
  character: {title:'character', heading:'character room', description:'a tiny space for favorite friends'}
};

function updateClock(){
  const now = new Date();
  const time = new Intl.DateTimeFormat('en-US',{hour:'2-digit',minute:'2-digit',hour12:false}).format(now);
  const hour12 = new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit',hour12:true}).format(now).toLowerCase();
  const dateLong = new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric'}).format(now);
  const dateShort = new Intl.DateTimeFormat('en-US',{year:'numeric',month:'2-digit',day:'2-digit'}).format(now).replaceAll('/','.');
  const weekday = new Intl.DateTimeFormat('en-US',{weekday:'short'}).format(now).toUpperCase();
  $('statusTime').textContent = time;
  $('lockDate').textContent = dateLong.toUpperCase();
  $('lockClock').textContent = hour12;
  $('homeDate').textContent = `${dateShort} ${weekday}`;
  $('homeClock').textContent = time;
  $('homeAmPm').textContent = new Intl.DateTimeFormat('en-US',{hour:'numeric',hour12:true}).format(now).replace(/[0-9]/g,'').trim().toUpperCase();
}

function showLock(){
  currentView = 'lock';
  lockScreen.hidden = false;
  homeScreen.hidden = true;
  appScreen.hidden = true;
  $('unlockLabel').textContent = 'Locked';
}
function showHome(){
  currentView = 'home';
  lockScreen.hidden = true;
  homeScreen.hidden = false;
  appScreen.hidden = true;
}
function openApp(name){
  const info = appInfo[name];
  if(!info) return;
  currentView = 'app';
  lockScreen.hidden = true;
  homeScreen.hidden = true;
  appScreen.hidden = false;
  $('appTitle').textContent = info.title;
  $('appHeading').textContent = info.heading;
  $('appDescription').textContent = info.description;
  $('appPlaceholder').querySelector('span:last-child').textContent = 'coming soon';
}
function goBack(){
  if(currentView === 'app') showHome();
  else if(currentView === 'home') showLock();
  else showHome();
}

$('unlockButton').addEventListener('click',showHome);
$('homeButton').addEventListener('click',showHome);
$('backButton').addEventListener('click',goBack);
$('menuButton').addEventListener('click',goBack);
$('appBack').addEventListener('click',showHome);
document.querySelectorAll('.app-icon').forEach((button)=>{
  button.addEventListener('click',()=>openApp(button.dataset.app));
});

updateClock();
setInterval(updateClock,1000);
