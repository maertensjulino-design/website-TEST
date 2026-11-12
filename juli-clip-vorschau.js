/* JULI CONSULTING · hochwertige Video-Vorschauen, nur sichtbare Clips laden */
(()=>{
 'use strict';
 const previews=Array.from(document.querySelectorAll('.juli-clip-preview'));
 const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
 const visible=new Set();
 function pause(preview){
   const v=preview.querySelector('video[data-juli-clip]');
   if(!v)return;
   v.pause();preview.classList.remove('juli-playing');
 }
 function play(preview){
   const v=preview.querySelector('video[data-juli-clip]');
   if(!v||reduced||document.hidden||!visible.has(preview))return;
   if(!v.getAttribute('src')){
     v.src=v.dataset.juliClip;
     v.load();
   }
   v.muted=true;v.playsInline=true;
   const p=v.play();
   if(p&&typeof p.catch==='function')p.catch(()=>preview.classList.remove('juli-playing'));
 }
 previews.forEach(preview=>{
   const v=preview.querySelector('video[data-juli-clip]');
   if(!v)return;
   v.addEventListener('playing',()=>{if(visible.has(preview)&&!document.hidden)preview.classList.add('juli-playing')});
   v.addEventListener('pause',()=>preview.classList.remove('juli-playing'));
   v.addEventListener('error',()=>preview.classList.remove('juli-playing'));
 });
 if('IntersectionObserver' in window){
   const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
     if(entry.isIntersecting){visible.add(entry.target);play(entry.target)}
     else{visible.delete(entry.target);pause(entry.target)}
   }),{threshold:0.12,rootMargin:'80px 0px'});
   previews.forEach(p=>io.observe(p));
 }else previews.forEach(p=>{visible.add(p);play(p)});
 document.addEventListener('visibilitychange',()=>{
   if(document.hidden)previews.forEach(pause);
   else visible.forEach(play);
 });

 // Das echte Coding-Video am Anfang (sowohl Startseite als auch Referenzen-Seite).
 const coding=Array.from(document.querySelectorAll('#buildTimelapse, .gallery-video video'));
 coding.forEach(v=>{
   v.muted=true;v.playsInline=true;v.loop=true;
   v.setAttribute('preload','metadata');
   const start=()=>{if(!document.hidden){const p=v.play();if(p&&p.catch)p.catch(()=>{});}};
   v.addEventListener('canplay',start,{once:true});
   if(v.readyState>=2)start();
 });
 if('IntersectionObserver' in window){
   const io=new IntersectionObserver(entries=>entries.forEach(e=>{
     const v=e.target;
     if(e.isIntersecting&&!document.hidden){const p=v.play();if(p&&p.catch)p.catch(()=>{});}
     else v.pause();
   }),{threshold:0.08,rootMargin:'150px 0px'});
   coding.forEach(v=>io.observe(v));
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden)coding.forEach(v=>v.pause());});
})();
