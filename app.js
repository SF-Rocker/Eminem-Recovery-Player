const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const progress = document.getElementById('progress');
const currentTimeEl = document.getElementById('current');
const durationEl = document.getElementById('duration');
const volumeEl = document.getElementById('volume');
const playlistEl = document.getElementById('playlist');
const titleEl = document.getElementById('title');
const artistEl = document.getElementById('artist');
const addFilesBtn = document.getElementById('addFiles');
const fileInput = document.getElementById('fileInput');

const audio = new Audio();
audio.preload = 'metadata';
let playlist = [];
let current = 0;
let isPlaying = false;

function formatTime(sec){
  if (isNaN(sec)) return '0:00';
  const m = Math.floor(sec/60);
  const s = Math.floor(sec%60).toString().padStart(2,'0');
  return `${m}:${s}`;
}

function loadTrack(i){
  if(!playlist[i]) return;
  current = i;
  audio.src = playlist[i].url;
  titleEl.textContent = playlist[i].name.replace(/\.mp3$|\.wav$|\.m4a$/i,'');
  artistEl.textContent = playlist[i].artist || 'Local file';
  updatePlaylistUI();
  audio.load();
}

function playTrack(){
  audio.play();
  isPlaying = true;
  playBtn.textContent = '⏸';
}
function pauseTrack(){
  audio.pause();
  isPlaying = false;
  playBtn.textContent = '▶';
}

playBtn.addEventListener('click',()=>{
  if(!audio.src) { if(playlist.length) loadTrack(0); else return; }
  isPlaying ? pauseTrack() : playTrack();
});
prevBtn.addEventListener('click',()=>{
  if(playlist.length===0) return;
  current = (current-1+playlist.length)%playlist.length;
  loadTrack(current);
  playTrack();
});
nextBtn.addEventListener('click',()=>{
  if(playlist.length===0) return;
  current = (current+1)%playlist.length;
  loadTrack(current);
  playTrack();
});

audio.addEventListener('timeupdate',()=>{
  progress.max = audio.duration || 100;
  progress.value = audio.currentTime || 0;
  currentTimeEl.textContent = formatTime(audio.currentTime);
  durationEl.textContent = formatTime(audio.duration);
});

progress.addEventListener('input', ()=>{
  audio.currentTime = progress.value;
});

volumeEl.addEventListener('input', ()=>{
  audio.volume = volumeEl.value;
});

audio.addEventListener('ended', ()=>{
  nextBtn.click();
});

function renderPlaylist(){
  playlistEl.innerHTML = '';
  playlist.forEach((t, i) =>{
    const li = document.createElement('li');
    li.dataset.index = i;
    if(i===current) li.classList.add('playing');
    li.innerHTML = `<div class="meta"><strong>${t.name}</strong><div class="small">${t.artist||''}</div></div><div class="small">${t.duration?formatTime(t.duration):''}</div>`;
    li.addEventListener('click', ()=>{ loadTrack(i); playTrack(); });
    playlistEl.appendChild(li);
  });
}

function updatePlaylistUI(){
  const lis = playlistEl.querySelectorAll('li');
  lis.forEach(li => li.classList.remove('playing'));
  const cur = playlistEl.querySelector(`li[data-index="${current}"]`);
  if(cur) cur.classList.add('playing');
}

addFilesBtn.addEventListener('click', ()=> fileInput.click());
fileInput.addEventListener('change', async (e)=>{
  const files = Array.from(e.target.files);
  for(const f of files){
    const url = URL.createObjectURL(f);
    const item = { name: f.name, url, file: f };
    playlist.push(item);
    // try to load metadata duration
    const temp = new Audio();
    temp.src = url;
    await new Promise(r => temp.addEventListener('loadedmetadata', r));
    item.duration = temp.duration;
  }
  renderPlaylist();
  if(!audio.src) { loadTrack(0); }
});

// Optional: preload audio files from ./audio if served by a local server
(async function tryLoadLocalAudio(){
  try{
    const resp = await fetch('./audio/playlist.json');
    if(!resp.ok) return;
    const list = await resp.json();
    for(const p of list){ playlist.push(p); }
    renderPlaylist();
  }catch(e){ /* ignore */ }
})();

// Helpful: allow dropping files onto the playlist
['dragover','dragenter'].forEach(ev => document.addEventListener(ev, e=>e.preventDefault()));
['drop'].forEach(ev => document.addEventListener(ev, async e=>{
  e.preventDefault();
  const files = Array.from(e.dataTransfer.files).filter(f=>f.type.startsWith('audio'));
  for(const f of files){
    const url = URL.createObjectURL(f);
    const item = { name: f.name, url, file: f };
    playlist.push(item);
    const temp = new Audio(); temp.src = url; await new Promise(r=>temp.addEventListener('loadedmetadata', r));
    item.duration = temp.duration;
  }
  renderPlaylist();
  if(!audio.src) loadTrack(0);
}));

// Provide keyboard shortcuts: space play/pause, n next, p prev
document.addEventListener('keydown', (e)=>{
  if(e.code==='Space') { e.preventDefault(); playBtn.click(); }
  if(e.key==='n') nextBtn.click();
  if(e.key==='p') prevBtn.click();
});

// Initialize volume
audio.volume = volumeEl.value;
