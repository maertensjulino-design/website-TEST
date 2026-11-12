/* Redaktionelle Inhalte aus content/site.json; kein Framework, kein Datenbankdienst. */
(function(){
'use strict';
const q=(css)=>document.querySelector(css);
function put(css,value){const e=q(css);if(!e||typeof value!=='string')return;const norm=x=>String(x||'').replace(/\s+/g,' ').trim();if(norm(e.innerText||e.textContent)===norm(value))return;e.textContent=value;}
function safeImage(str){return typeof str==='string' && (/^\/?uploads\/[\w\-.\/%]+$/i.test(str)||/^data:image\/(?:jpeg|png|webp|gif);base64,/i.test(str)||/^blob:/i.test(str)) ? str : null;}
function safeLink(str){return typeof str==='string' && (/^https:\/\//i.test(str)||/^\/[\w\-.\/%?#=&]+$/.test(str))?str:null;}
function dateTodayBerlin(){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
function dateOnly(d){return typeof d==='string'?d.slice(0,10):'';}
function content(data){
 if(!data||typeof data!=='object')return;
 const notice=q('#jc-hinweis');
 const today=dateTodayBerlin(), from=dateOnly(data.hinweis_von), to=dateOnly(data.hinweis_bis);
 if(notice){
  const on=data.hinweis_aktiv===true && (!from || today>=from) && (!to || today<=to);
  notice.hidden=!on;
  put('#jc-hinweis-titel',data.hinweis_titel||'Aktuelle Mitteilung');
  put('#jc-hinweis-text',data.hinweis_text||'');
 }
 // Only text nodes are updated. Source HTML, effects, video and animations remain intact.
 put('#start .lead',data.hero_text);
 // The eyebrow contains the decorative dot; preserve it.
 const eyebrow=q('#start .eyebrow');
 if(eyebrow&&typeof data.hero_kicker==='string'){
   for(const node of eyebrow.childNodes){if(node.nodeType===Node.TEXT_NODE){node.nodeValue=' '+data.hero_kicker;break;}}
 }
 put('#leistungen h2',data.leistungen_titel);
 put('#leistungen .section-head p',data.leistungen_text);
 put('#arbeiten h2',data.referenzen_titel);
 put('#arbeiten .portfolio-lead p',data.referenzen_text);
 put('#ueber-mich h2',data.ueber_titel);
 put('#ueber-mich p',data.ueber_text);
 put('#preise h2',data.preise_titel);
 put('#preise .pricing-heading p',data.preise_text);
 put('#kontakt h2',data.kontakt_titel);
 put('#kontakt .contact-intro p',data.kontakt_text);
 const hero=safeImage(data.hero_bild), portrait=safeImage(data.ueber_bild);
 if(hero){const img=q('#start .hero-media img');if(img)img.src=hero;}
 if(portrait){const img=q('#ueber-mich .about-photo img');if(img)img.src=portrait;}
 const showcase=q('#jc-kundenprojekte'), tiles=q('#jc-kundenprojekte-items');
 if(showcase&&tiles){
   tiles.replaceChildren();
   const records=Array.isArray(data.kundenprojekte)?data.kundenprojekte:[];
   for(const p of records){
     if(!p||p.sichtbar===false||!p.titel)continue;
     const article=document.createElement('article');article.className='jc-tile';
     const imgSrc=safeImage(p.bild);
     if(imgSrc){const img=document.createElement('img');img.loading='lazy';img.alt=p.titel;img.src=imgSrc;article.appendChild(img);}
     const body=document.createElement('div');body.className='jc-tile-body';
     const title=document.createElement('h3');title.textContent=p.titel;body.appendChild(title);
     if(p.beschreibung){const desc=document.createElement('p');desc.textContent=p.beschreibung;body.appendChild(desc);}
     const link=safeLink(p.link);
     if(link){const a=document.createElement('a');a.href=link;a.textContent='Projekt ansehen ↗';if(link.startsWith('https://')){a.target='_blank';a.rel='noopener noreferrer';}body.appendChild(a);}
     article.appendChild(body);tiles.appendChild(article);
   }
   showcase.hidden=tiles.children.length===0;
 }
 const news=q('#jc-news'),box=q('#jc-news-items');
 if(news&&box){
   box.replaceChildren();
   for(const item of (Array.isArray(data.aktuelles)?data.aktuelles:[])){
     if(!item||item.sichtbar===false||!item.titel)continue;
     const article=document.createElement('article');
     if(item.datum){const t=document.createElement('time');t.textContent=dateOnly(item.datum);t.dateTime=dateOnly(item.datum);article.appendChild(t);}
     const h=document.createElement('h3');h.textContent=item.titel;article.appendChild(h);
     if(item.text){const p=document.createElement('p');p.textContent=item.text;article.appendChild(p);}
     box.appendChild(article);
   }
   news.hidden=box.children.length===0;
 }
}
window.addEventListener('message',function(event){
 if(event.source!==window.parent||!event.data||event.data.type!=='JC_EDITOR_PREVIEW')return;
 content(event.data.site);
});
const close=q('#jc-hinweis-close');if(close)close.addEventListener('click',()=>{q('#jc-hinweis').hidden=true;});
if(location.protocol==='file:'){document.addEventListener('submit',function(event){if(event.target.matches('form[name=\"kontakt\"]')){event.preventDefault();alert('Lokale Vorschau. Die echte Anfrage funktioniert erst nach der Veröffentlichung mit Netlify Forms.');}},true);}
if(location.protocol!=='file:'){
 fetch('./content/site.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('CMS-Inhalte konnten nicht geladen werden');return r.json();}).then(content).catch(err=>console.warn('JULI Content:',err.message));
}
})();