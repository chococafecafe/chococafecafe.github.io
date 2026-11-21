const $ = (id) => document.getElementById(id);
const lockScreen = $('lockScreen');
const homeScreen = $('homeScreen');
let unlocked = false;

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
  unlocked = false;
  lockScreen.hidden = false;
  homeScreen.hidden = true;
  $('unlockLabel').textContent = 'Locked';
}
function showHome(){
  unlocked = true;
  lockScreen.hidden = true;
  homeScreen.hidden = false;
}
$('unlockButton').addEventListener('click',showHome);
$('homeButton').addEventListener('click',showHome);
$('backButton').addEventListener('click',()=> unlocked ? showLock() : showHome());
$('menuButton').addEventListener('click',()=> unlocked ? showLock() : showHome());
// App contents are intentionally placeholders for the next design session.
document.querySelectorAll('.app-icon').forEach((button)=>{
  button.addEventListener('click',()=>{
    const name = button.dataset.app;
    alert(`${name} app ♡\nLet's decorate this app tomorrow!`);
  });
});
updateClock();
setInterval(updateClock,1000);
