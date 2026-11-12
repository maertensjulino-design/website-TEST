
/* Local interactive regional map + FAQ assistant; no external API or third-party requests. */
(function(){
 'use strict';
 const places=[{"id":0,"name":"Beelitz","lat":52.2384,"lon":12.9707,"km":3.8},{"id":1,"name":"Michendorf","lat":52.3127,"lon":13.0305,"km":9.2},{"id":2,"name":"Potsdam","lat":52.4009,"lon":13.0591,"km":18.1},{"id":3,"name":"Werder (Havel)","lat":52.3773,"lon":12.9344,"km":13.1},{"id":4,"name":"Caputh / Schwielowsee","lat":52.3488,"lon":13.0055,"km":11.3},{"id":5,"name":"Teltow","lat":52.4036,"lon":13.2611,"km":27.8},{"id":6,"name":"Kleinmachnow","lat":52.4086,"lon":13.2259,"km":26.2},{"id":7,"name":"Ludwigsfelde","lat":52.2986,"lon":13.2609,"km":23.2},{"id":8,"name":"Trebbin","lat":52.216,"lon":13.224,"km":20.8},{"id":9,"name":"Luckenwalde","lat":52.0906,"lon":13.1671,"km":24.9},{"id":10,"name":"Brück","lat":52.198,"lon":12.768,"km":12.8},{"id":11,"name":"Kloster Lehnin","lat":52.325,"lon":12.746,"km":14.3},{"id":12,"name":"Treuenbrietzen","lat":52.097,"lon":12.872,"km":18.5},{"id":13,"name":"Bad Belzig","lat":52.1413,"lon":12.5938,"km":26.2},{"id":14,"name":"Brandenburg an der Havel","lat":52.412,"lon":12.557,"km":30.3},{"id":15,"name":"Berlin-Tempelhof","lat":52.474,"lon":13.388,"km":39.4},{"id":16,"name":"Stahnsdorf","lat":52.3842,"lon":13.2209,"km":24.3}];
 const buttons=[...document.querySelectorAll('.jc-place-btn')];
 const pins=[...document.querySelectorAll('.jc-map-pin')];
 const placeSearch=document.getElementById('jc-place-search');
 const count=document.getElementById('jc-count-places');
 let filter='all',selected=2;
 const norm=s=>String(s||'').toLocaleLowerCase('de-DE').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');
 function showPlace(id){
   selected=Number(id);const p=places[selected];if(!p)return;
   buttons.forEach(b=>{const on=Number(b.dataset.place)===selected;b.classList.toggle('is-active',on);b.setAttribute('aria-pressed',String(on));});
   pins.forEach(el=>el.classList.toggle('is-active',Number(el.dataset.place)===selected));
   document.getElementById('jc-selected-name').textContent=p.name;
   document.getElementById('jc-selected-distance').textContent='Rund '+p.km.toFixed(1).replace('.',',')+' km Luftlinie von Beelitz-Heilstätten.';
 }
 function applyFilter(){
   const query=norm(placeSearch.value.trim());let shown=0;
   places.forEach(p=>{let match=norm(p.name).includes(query);if(filter==='20')match=match&&p.km<=20;if(filter==='50')match=match&&p.km>20&&p.km<=50;
    buttons[p.id].hidden=!match;pins[p.id].classList.toggle('is-hidden',!match);if(match)shown++;
   });
   count.textContent=shown+' '+(shown===1?'Ort':'Orte');
   if(!buttons[selected]||buttons[selected].hidden){const next=places.find(p=>!buttons[p.id].hidden);if(next)showPlace(next.id)}
 }
 buttons.forEach(el=>el.addEventListener('click',()=>showPlace(el.dataset.place)));
 pins.forEach(el=>{el.addEventListener('click',()=>showPlace(el.dataset.place));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showPlace(el.dataset.place)}})});
 placeSearch.addEventListener('input',applyFilter);
 document.querySelectorAll('[data-km-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.kmFilter;document.querySelectorAll('[data-km-filter]').forEach(c=>{c.classList.toggle('is-active',c===b);c.setAttribute('aria-pressed',String(c===b))});applyFilter()}));
 showPlace(2);applyFilter();
 const faq=JSON.parse(document.getElementById('jc-faq-data').textContent);
 const faqSearch=document.getElementById('jc-faq-search'),list=document.getElementById('jc-faq-questions'),catList=document.getElementById('jc-faq-categories'),more=document.getElementById('jc-faq-more'),faqCount=document.getElementById('jc-faq-search-count');
 const cats=['Alle Themen',...new Set(faq.map(f=>f.category))];let activeCat='Alle Themen',limit=8;
 const fullNorm=s=>norm(s).replace(/[^a-z0-9]+/g,' ').trim();
 const aliases={
   monatsabo:'abo',monatlich:'abo',monats:'abo',abonnement:'abo',abos:'abo',kuendigen:'kundigung',kuendigung:'kundigung',kundigen:'kundigung',
   website:'webseite',websites:'webseite',webseiten:'webseite',homepage:'webseite',webdesign:'webseite',seiten:'webseite',homepageerstellung:'erstellung',
   mail:'email',e:'email',mails:'email',emails:'email',anfragen:'anfrage',preismodell:'preis',preise:'preis',kostet:'preis',kosten:'preis',kostenpunkt:'preis',
   4995:'49',pflege:'betreuung',wartung:'betreuung',warten:'betreuung',betreuen:'betreuung',anderungen:'anderung',andern:'anderung',bearbeiten:'anderung',
   laufzeit:'kundigung',jederzeit:'kundigung',monat:'abo',geschaft:'unternehmen',shop:'onlineshop',handy:'smartphone',suchmaschine:'google',umkreis:'radius'
 };
 const stop=new Set('ich du wir ihr sie man ist sind eine einen einer einem ein die der das den dem des und oder mit fur über zum zur von im in am an bei auf nach als kann konnen gibt gibt es wie was welche welchen wieviel viel bitte denn mir mein meine deine eure eurem auch noch schon mehr jetzt einfach gerne muss brauche braucht werden wird soll sollte zu dir dich uns dass ob wenn nicht haben hat so'.split(' '));
 const tokens=s=>fullNorm(s).split(/\s+/).filter(Boolean).map(t=>aliases[t]||t).filter(t=>!stop.has(t)&&t.length>1);
 const docTokens=faq.map(f=>tokens(f.question+' '+f.tags));
 const freq={};docTokens.forEach(t=>new Set(t).forEach(w=>{freq[w]=(freq[w]||0)+1}));
 function findMatches(input){
   const raw=fullNorm(input),tq=tokens(input),total=tq.length;
   return faq.map((f,i)=>{
     const q=fullNorm(f.question), tags=fullNorm(f.tags),ts=new Set(docTokens[i]);let score=0,matched=0;
     if(raw.length>4&&q.includes(raw))score+=30;
     if(raw.length>4&&tags.includes(raw))score+=15;
     for(const t of tq){
       let hit=ts.has(t);
       if(!hit&&t.length>=4)hit=[...ts].some(x=>x.startsWith(t)||t.startsWith(x)&&x.length>=4);
       if(hit){matched++;score+=2+6/Math.sqrt(freq[t]||12);}
     }
     if(total>1)score+=7*(matched/total);score+=Math.min(4,matched);if(matched===0 && !q.includes(raw))score=0;
     // Strong conversational intents take priority over generic token overlap.
     const abo=/(abo|abonnement|monat|monats)/.test(raw);
     const money=/(kost|preis|gebuhr|gebueren|wieviel|wie viel|49 95)/.test(raw);
     const cancel=/(kundig|kuendig|laufzeit|vertrag beenden)/.test(raw);
     const without=/(ohne|kein|pflicht|freiwillig|zwang)/.test(raw);
     const care=/(betreu|pflege|wartung|aktualisier)/.test(raw);
     if(abo&&money&&f.id===2)score+=43;
     if(abo&&without&&f.id===4)score+=44;
     if(abo&&cancel&&f.id===12)score+=40;
     if(abo&&care&&f.id===15)score+=36;
     if(abo&&/brutto|netto/.test(raw)&&f.id===3)score+=43;
     if(care&&/(umfang|enthalt|inklusive|was|wieviel)/.test(raw)&&f.id===15)score+=34;
     if(/(50 ?km|50 kilometer|umkreis|einzugskreis|radius)/.test(raw)&&f.id===96)score+=35;
     return {f,score,matched};
   }).sort((a,b)=>b.score-a.score||a.f.id-b.f.id);
 }
 function renderCats(){catList.replaceChildren();cats.forEach(cat=>{let b=document.createElement('button');b.type='button';b.textContent=cat;b.classList.toggle('is-active',cat===activeCat);b.setAttribute('aria-pressed',String(cat===activeCat));b.addEventListener('click',()=>{activeCat=cat;limit=8;renderCats();renderFaq()});catList.append(b)})}
 function renderFaq(){
   let q=faqSearch.value.trim();let pool=faq.filter(f=>activeCat==='Alle Themen'||f.category===activeCat);
   if(q){let rank=findMatches(q);pool=rank.filter(o=>o.score>0 &&(activeCat==='Alle Themen'||o.f.category===activeCat)).map(o=>o.f)}
   faqCount.textContent=pool.length;list.replaceChildren();
   if(!pool.length){const p=document.createElement('p');p.className='jc-faq-empty';p.textContent='Keine passende Frage gefunden. Frag den Assistenten oder sende uns eine persönliche Anfrage.';list.append(p)}
   for(const f of pool.slice(0,limit)){
     const d=document.createElement('details');d.className='jc-faq-item';const sm=document.createElement('summary');sm.textContent=f.question;
     const p=document.createElement('p');p.textContent=f.answer;const small=document.createElement('small');small.textContent=f.category;
     d.append(sm,p,small);list.append(d);
   }
   more.hidden=pool.length<=limit;
 }
 faqSearch.addEventListener('input',()=>{limit=8;renderFaq()});more.addEventListener('click',()=>{limit+=8;renderFaq()});renderCats();renderFaq();
 const panel=document.getElementById('jc-chat-panel'),launch=document.getElementById('jc-chat-launch'),close=document.getElementById('jc-chat-close'),form=document.getElementById('jc-chat-form'),input=document.getElementById('jc-chat-input'),messages=document.getElementById('jc-chat-messages'),suggestions=document.getElementById('jc-chat-suggestions');
 function openChat(){panel.hidden=false;launch.setAttribute('aria-expanded','true');input.focus();messages.scrollTop=messages.scrollHeight}
 function closeChat(){panel.hidden=true;launch.setAttribute('aria-expanded','false');launch.focus()}
 launch.addEventListener('click',()=>{if(panel.hidden)openChat();else closeChat()});close.addEventListener('click',closeChat);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)closeChat()});
 function appendMsg(text,type){let msg=document.createElement('div');msg.className='jc-chat-message '+(type==='user'?'is-user':'is-bot');msg.textContent=text;messages.append(msg);messages.scrollTop=messages.scrollHeight;return msg}
 function updateSuggestions(items){suggestions.replaceChildren();items.forEach(f=>{const b=document.createElement('button');b.type='button';b.textContent=f.question.length>38?f.question.slice(0,35)+'…':f.question;b.addEventListener('click',()=>ask(f.question));suggestions.append(b)})}
 function ask(text){text=String(text||'').trim().slice(0,280);if(!text)return;openChat();appendMsg(text,'user');input.value='';let hits=findMatches(text).filter(h=>h.score>0);
   const best=hits[0];let reply;
   if(!best || best.matched===0 || best.score<6){reply='Dazu habe ich in meinen Antworten keine eindeutige Auskunft. Schreib mir gern über das Kontaktformular – ich kläre dein Anliegen persönlich.';updateSuggestions([faq[1],faq[10],faq[40]])}
   else{reply=best.f.answer;updateSuggestions(hits.slice(1,4).map(h=>h.f))}
   appendMsg(reply,'bot');
 }
 form.addEventListener('submit',e=>{e.preventDefault();ask(input.value)});
 document.querySelectorAll('[data-ask]').forEach(b=>b.addEventListener('click',()=>ask(b.dataset.ask)));
 document.getElementById('jc-chat-contact').addEventListener('click',()=>{panel.hidden=true;launch.setAttribute('aria-expanded','false')});
})();
