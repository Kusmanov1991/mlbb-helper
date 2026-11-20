const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const num=n=>n.toFixed(1).replace(".",",");
const fmt=n=>"+"+num(n)+" п.п.";
const sgn=n=>(n>=0?"+":"−")+num(Math.abs(n));
const ico=en=>{const t=IT[en];return `<span class="ico ${t[2]}" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="${G[t[1]]}"/></svg></span>`;};
const AB={popol:"ПК",luoyi:"ЛЙ",xborg:"ИБ",yuzhong:"ЮЧ",yisunshin:"ЛС",lapulapu:"ЛЛ",change:"ЧЭ",suyou:"СЁ"};
const ava=(id,big)=>{const ru=H[id][0];let h=0;for(const c of id)h=(h*31+c.charCodeAt(0))%360;
 return `<span class="ava${big?" big":""}" style="background:hsl(${h} 42% 38%)" aria-hidden="true">${AB[id]||ru.slice(0,2)}</span>`;};
const LANE_NAME={gold:"Золото",mid:"Мид",roam:"Роум",exp:"Опыт",jungle:"Лес"};
const LANE_TO={gold:"линию золота",mid:"мид",roam:"роум",exp:"линию опыта",jungle:"лес"};
const RU2ID={};for(const k in H)RU2ID[H[k][0]]=k;
const wrOf=id=>MH[id]?MH[id][0]:50;
// blind-pick win rates come from Mythical Honor
for(const l in BL)BL[l].forEach(c=>{if(MH[c.id])c.wr=MH[c.id][0];});

const st={lane:"gold",mode:"known",enemy:{gold:"brody",mid:"valir",roam:"marcel",exp:"masha",jungle:"ling"},pick:0,
 sel:{gold:new Set(),mid:new Set(),roam:new Set(),exp:new Set(),jungle:new Set()},bpick:0,ban:new Set(),side:"first",slot:1};

function bannedLine(){
  if(!st.ban.size) return "";
  return `<div class="banline"><span>В бане: ${[...st.ban].map(id=>esc(H[id][0])).join(", ")}</span><button class="link" type="button" data-go="draft">изменить</button></div>`;
}

function buildBlock(id){
  const b=B[id+"@"+st.lane]||B[id];
  return `<div><h2 class="sp">Закуп на всю игру: ${esc(H[id][0])}</h2>
      <ol class="build">${b.i.map(x=>`<li>${ico(x)}<span>${esc(IT[x][0])}</span></li>`).join("")}</ol></div>
    <div class="meta"><span>Заклинание: <b>${esc(SP[b.s])}</b></span>${b.r?`<span>${esc(b.rk||"Благословение роума")}: <b>${esc(b.r)}</b></span>`:""}</div>
    <p class="note">${esc(b.n)}</p>`;
}

// old transliterations stay searchable after switching to the in-game Russian names
const ALIAS={zetian:"Зетиан",luoyi:"Луо И",pharsa:"Фарса",zhuxin:"Чжу Синь",vale:"Вейл",aamon:"Аамон",bane:"Бейн",barats:"Баратс",baxia:"Баксия",change:"Чанъэ",dyrroth:"Дайрот Джавхед",jawhead:"Джавхед",kalea:"Калея",rafaela:"Рафаэла",silvanna:"Сильванна",suyou:"Суё Су Е",terizla:"Теризла",yisunshin:"И Сун-Син",yuzhong:"Ю Чжун Чонг",fredrinn:"Фредерин"};
function matches(id,q){const [ru,en]=H[id];return ru.toLowerCase().includes(q)||en.toLowerCase().includes(q)||(ALIAS[id]||"").toLowerCase().includes(q);}
function drawGrid(){
  const L=LANES[st.lane], q=$("#q").value.trim().toLowerCase();
  let shown=0;
  $("#grid").innerHTML=L.order.map(id=>{
    const [ru,en]=H[id];
    if(q && !matches(id,q)) return "";
    shown++;
    const bn=st.ban.has(id);
    return `<button class="chip${bn?" banned":""}" type="button" data-id="${id}" aria-pressed="${id===st.enemy[st.lane]}">${ava(id)}<span>${esc(ru)}<small>${bn?"в бане":esc(en)}</small></span></button>`;
  }).join("");
  let other=[];
  if(q){for(const l in LANES){if(l===st.lane)continue;for(const id of LANES[l].order)if(matches(id,q)&&!L.order.includes(id))other.push([l,id]);}}
  const em=$("#empty");
  if(other.length){
    em.hidden=false;
    em.innerHTML=`<span>${shown?"Ещё на других линиях:":"На этой линии такого героя нет. Он есть здесь:"}</span><div class="alts">${other.slice(0,8).map(([l,id])=>
      `<button class="alt" type="button" data-golane="${l}" data-id="${id}">${ava(id)}${esc(H[id][0])}<span class="e">${LANE_NAME[l]}</span></button>`).join("")}</div>`;
  }else{
    em.hidden=shown>0;
    em.innerHTML="Такого героя нет. Попробуй другое написание.";
  }
}

function phaseBox(v,label,time){
  const cls=v>0?"hi":v<0?"lo":"";
  const txt=v>0?"сильный":v<0?"слабый":"ровно";
  return `<div class="${cls}"><b>${label}</b>${time}<br>${txt}</div>`;
}

function muBlock(mu,pid,ru){
  if(!mu) return "";
  const row=(k,t)=>t?`<li><b>${k}.</b> ${esc(t)}</li>`:"";
  return `<div class="mu"><h2 class="sp">План на матчап «${esc(H[pid][0])} — ${esc(ru)}»</h2><ul class="plain">
    ${row("Начало",mu.e)}${row("Дальше",mu.l)}${row("Не делай",mu.x)}${row("Сборка",mu.b)}</ul></div>`;
}
function drawKnown(){
  const enemy=st.enemy[st.lane], d=LANES[st.lane].E[enemy], ru=H[enemy][0];
  const PL=d.p.filter(x=>!st.ban.has(x[0]));
  if(st.pick>=PL.length) st.pick=0;
  const flat=d.ph.every(v=>v===0);
  const rest=`
    <div><h2 class="sp">Когда ${esc(ru)} опасен</h2>
      ${flat?`<p class="note">Заметной разницы между стадиями игры нет.</p>`:`<div class="phase">${phaseBox(d.ph[0],"Начало","0–10 мин")}${phaseBox(d.ph[1],"Середина","10–16 мин")}${phaseBox(d.ph[2],"Поздняя","16+ мин")}</div>`}</div>
    <div><h2 class="sp">Как играть</h2><ul class="plain">${d.tips.map(t=>`<li>${esc(t)}</li>`).join("")}</ul></div>
    <div><h2 class="sp">Попроси у команды</h2><div class="rows">${d.t.map(x=>`<span class="pill">${esc(x[0])}<i>${fmt(x[1])}</i></span>`).join("")}</div></div>
    ${d.a.length?`<div><h2 class="sp">Не бери против него</h2><div class="rows">${d.a.map(x=>`<span class="pill bad">${esc(x[0])}<i>−${num(x[1])}</i></span>`).join("")}</div></div>`:""}`;
  const head=`${bannedLine()}<div class="versus">Против: <b>${esc(ru)}</b>${st.ban.has(enemy)?` <span class="tag k">в бане</span>`:""}</div>`;
  if(!PL.length){
    $("#result").innerHTML=`${head}<p class="why">Все подобранные контрпики в бане. Возьми героя, который тебе привычен, и смотри советы ниже.</p>${rest}`;
    return;
  }
  const [pid,edge,w,kind]=PL[st.pick]; const mu=MU[st.lane+":"+enemy+":"+pid]; const why=(mu&&mu.w)||w||WK[pid]||"";
  const tag=edge!=null?`<span class="tag m">${fmt(edge)} к винрейту</span>`:`<span class="tag k">${kind==="wr"?"по винрейту":"по механике"}</span>`;
  const alts=PL.length>1?`<div><h2 class="sp">Варианты</h2><div class="alts">${PL.map((x,i)=>
    `<button class="alt" type="button" data-i="${i}" aria-pressed="${i===st.pick}">${ava(x[0])}${esc(H[x[0]][0])}<span class="e">${x[1]!=null?fmt(x[1]):x[3]==="wr"?"винр.":"мех."}</span></button>`).join("")}</div></div>`:"";
  $("#result").innerHTML=`${head}
    <div class="verdict">${ava(pid,true)}<span class="name">Бери: ${esc(H[pid][0])}</span>${tag}</div>
    <p class="why">${esc(why)}</p>
    ${muBlock(mu,pid,ru)}
    ${alts}
    ${buildBlock(pid)}
    ${rest}`;
}

function poolNames(){
  const s=new Set();
  for(const c of BL[st.lane]){c.c.forEach(x=>s.add(x[0]));c.s.forEach(x=>s.add(x[0]));}
  return [...s].filter(n=>!(RU2ID[n]&&st.ban.has(RU2ID[n]))).sort((a,b)=>a.localeCompare(b,"ru"));
}
function drawPool(){
  const q=$("#q2").value.trim().toLowerCase(), sel=st.sel[st.lane];
  const names=poolNames().filter(n=>!q||n.toLowerCase().includes(q));
  $("#pool").innerHTML=names.length?names.map(n=>`<button class="tog" type="button" data-n="${esc(n)}" aria-pressed="${sel.has(n)}">${esc(n)}</button>`).join("")
    :`<span class="empty">По этому герою нет статистики против героев из списка. Он не влияет на оценку.</span>`;
  $("#selrow").innerHTML=sel.size?`<span>Отмечено: ${sel.size}</span><button class="link" type="button" id="clr">Сбросить</button>`:"";
}
// strongest same-lane counter that the enemy can still pick
function laneRisk(id){
  const d=LANES[st.lane].E[id]; if(!d) return null;
  let best=null;
  for(const p of d.p){
    if(p[1]==null||st.ban.has(p[0])||st.sel[st.lane].has(H[p[0]][0])) continue;
    if(!best||p[1]>best[1]) best=p;
  }
  return best;
}
function rank(){
  const sel=st.sel[st.lane];
  return BL[st.lane].filter(c=>!st.ban.has(c.id)&&!sel.has(H[c.id][0])).map(c=>{
    let sc=c.wr-50; const up=[],dn=[];
    for(const [n,e] of c.s) if(sel.has(n)){sc+=e;up.push([n,e]);}
    for(const [n,e] of c.c) if(sel.has(n)){sc-=e;dn.push([n,e]);}
    const risk=laneRisk(c.id); if(risk) sc-=risk[1];
    return {c,sc,up,dn,risk};
  }).sort((a,b)=>b.sc-a.sc);
}
function drawBlind(){
  const sel=st.sel[st.lane], r=rank();
  if(!r.length){$("#result").innerHTML=`${bannedLine()}<p class="why">Все герои из списка в бане или уже у врага.</p>`;return;}
  if(st.bpick>=Math.min(r.length,12)) st.bpick=0;
  const x=r[st.bpick], id=x.c.id, any=sel.size>0;
  const lines=[`<li class="${x.c.wr>=50?"up":"dn"}"><b>${sgn(x.c.wr-50)}</b><span>Винрейт ${num(x.c.wr)}% на Мифической чести за 7 дней</span></li>`]
    .concat(x.up.map(([n,e])=>`<li class="up"><b>+${num(e)}</b><span>Силён против: ${esc(n)}</span></li>`))
    .concat(x.dn.map(([n,e])=>`<li class="dn"><b>−${num(e)}</b><span>Его контрит: ${esc(n)}</span></li>`))
    .concat(x.risk?[`<li class="dn"><b>−${num(x.risk[1])}</b><span>Риск: на линии его контрит ${esc(H[x.risk[0]][0])}, враг может взять его позже</span></li>`]:[]);
  const why=x.risk
    ?`<p class="why"><span class="tag w">риск</span> На линии его контрит ${esc(H[x.risk[0]][0])} (${fmt(x.risk[1])}). Если соперник по линии уже открыт и это не он, или ${esc(H[x.risk[0]][0])} в бане, риска нет.</p>`
    :`<p class="why">Ни одного измеренного контрпика с его линии сейчас не осталось, поэтому его можно брать, не видя соперника.</p>`;
  $("#result").innerHTML=`${bannedLine()}
    <div class="versus">Слепой пик на <b>${LANE_TO[st.lane]}</b>${any?`, у врага отмечено: <b>${[...sel].map(esc).join(", ")}</b>`:""}</div>
    <div class="verdict">${ava(id,true)}<span class="name">Бери: ${esc(H[id][0])}</span><span class="tag ${x.sc>=0?"m":"k"}">оценка ${sgn(x.sc)}</span></div>
    ${why}
    <div><h2 class="sp">Из чего сложилась оценка</h2><ul class="pm">${lines.join("")}</ul></div>
    <div><h2 class="sp">Рейтинг для этого состава</h2><div class="alts">${r.slice(0,12).map((y,i)=>
      `<button class="alt" type="button" data-b="${i}" aria-pressed="${i===st.bpick}">${ava(y.c.id)}${esc(H[y.c.id][0])}<span class="e">${sgn(y.sc)}</span></button>`).join("")}</div></div>
    ${buildBlock(id)}
    <div><h2 class="sp">Кого опасаться и банить</h2><div class="rows">${x.c.c.map(y=>`<span class="pill bad">${esc(y[0])}<i>−${num(y[1])}</i></span>`).join("")}</div></div>
    <div><h2 class="sp">Против кого он силён</h2><div class="rows">${x.c.s.map(y=>`<span class="pill">${esc(y[0])}<i>+${num(y[1])}</i></span>`).join("")}</div></div>`;
}

// ---- bans and draft order ----
const threat=id=>(MH[id][0]-50)+MH[id][1]/20;
function banGroup(id){
  const [w,b]=MH[id];
  if(w>=52&&b>=15) return ["сильный, его банят","m"];
  if(w>=53.5&&b<15) return ["сильный, но редко банят","w"];
  if(b>=25&&w<52) return ["банят часто, винрейт обычный","k"];
  return null;
}
const SEQ=["A1","B1","B2","A2","A3","B3","B4","A4","A5","B5"];
function drawDraft(){
  const me=(st.side==="first"?"A":"B")+st.slot, idx=SEQ.indexOf(me);
  const seen=SEQ.slice(0,idx).filter(x=>x[0]!==me[0]).length;
  let adv, go;
  if(seen===0){adv="Ты пикаешь первым во всём драфте и не видишь ни одного врага. Бери сильного героя, которого трудно законтрить на линии. Во «Вслепую» рейтинг это учитывает.";go="blind";}
  else if(seen<4){adv=`К твоему ходу будет видно врагов: ${seen}. Соперник по линии, скорее всего, ещё не выбран. Открой «Вслепую» и отметь видимых врагов.`;go="blind";}
  else if(seen===4){adv="Будет видно 4 врага. Если среди них твой соперник по линии, бери прямой контрпик в «Знаю врага», если нет — «Вслепую».";go="known";}
  else {adv="Ты последний пик: видна вся команда врага. Бери прямой контрпик в «Знаю врага».";go="known";}
  let roleNote="";
  if(idx<=2&&(st.lane==="gold"||st.lane==="mid")) roleNote="Золото и мид обычно пикают последними, когда уже ясны танк и лесник. Если роумер или лесник твоей команды пикает позже тебя, договоритесь в чате, кто какую роль берёт. Если поменяться не выходит, бери героя для слепого пика.";
  if(idx>=7&&(st.lane==="roam"||st.lane==="jungle")) roleNote="Роумера и лесника обычно берут рано: от них зависит стиль драк. На позднем пике это плюс: можно взять роумера или лесника прямо под состав врага.";
  const seq=SEQ.map((x,i)=>`<div class="sq ${x[0]===me[0]?"us":"them"}${x===me?" me":""}"><b>${i+1}</b>${x[0]===me[0]?"Мы":"Враг"} ${x[1]}</div>`).join("");
  const list=Object.keys(MH).sort((a,b)=>threat(b)-threat(a)).slice(0,18);
  const next=list.filter(id=>!st.ban.has(id)).slice(0,3);
  const bq=($("#bq")&&$("#bq").value||"").trim().toLowerCase();
  const found=bq?Object.keys(MH).filter(id=>matches(id,bq)).slice(0,10):[];
  $("#result").innerHTML=`
    <div><h2 class="sp">Твой ход в драфте</h2>
      <div class="seg" role="group" aria-label="Чья команда пикает первой">
        <button type="button" data-side="first" aria-pressed="${st.side==="first"}">Мы пикаем первыми</button>
        <button type="button" data-side="second" aria-pressed="${st.side==="second"}">Враг первым</button></div></div>
    <div><h2 class="sp">Мой номер в команде (сверху вниз)</h2>
      <div class="seg" role="group" aria-label="Номер в команде">${[1,2,3,4,5].map(n=>`<button type="button" data-slot="${n}" aria-pressed="${st.slot===n}">${n}</button>`).join("")}</div></div>
    <div class="verdict"><span class="name">Пик ${idx+1} из 10</span><span class="tag ${seen>=4?"m":"w"}">видно врагов: ${seen}</span></div>
    <div class="seq" aria-label="Порядок пиков">${seq}</div>
    <p class="why">${esc(adv)}</p>
    ${roleNote?`<p class="note">${esc(roleNote)}</p>`:""}
    <button class="go" type="button" data-go="${go}">Открыть «${go==="blind"?"Вслепую":"Знаю врага"}» для линии ${esc(LANE_NAME[st.lane].toLowerCase())}</button>
    <div><h2 class="sp">Баны на Мифической чести (25–49 звёзд)</h2>
      <p class="note">Каждая команда банит 5 героев вслепую и одновременно, в две волны: сначала 3, после раскрытия ещё 2. Отмечай забаненных героев обеих команд: страница уберёт их из рекомендаций.</p></div>
    <div class="next"><span>Следующий бан:</span> ${next.map(id=>`<b>${esc(H[id][0])}</b>`).join(", ")}</div>
    <ul class="bans">${list.map(id=>{const g=banGroup(id),[w,b]=MH[id],on=st.ban.has(id);
      return `<li><button type="button" class="banrow" data-ban="${id}" aria-pressed="${on}">${ava(id)}<span class="bn"><b>${esc(H[id][0])}</b><small>винрейт ${num(w)}% · банят в ${Math.round(b)}%</small></span>${g?`<span class="tag ${g[1]}">${g[0]}</span>`:""}<span class="mk">${on?"в бане":"бан"}</span></button></li>`;}).join("")}</ul>
    <div><h2 class="sp">Отметить другого героя в бане</h2>
      <input id="bq" type="search" placeholder="Имя героя" autocomplete="off" aria-label="Найти героя для бана" value="${esc(bq)}">
      <div class="alts" id="bfound">${found.map(id=>`<button class="alt" type="button" data-ban="${id}" aria-pressed="${st.ban.has(id)}">${ava(id)}${esc(H[id][0])}<span class="e">${st.ban.has(id)?"в бане":"бан"}</span></button>`).join("")}</div></div>
    <button class="link" type="button" data-reset="1">Новый матч: снять все баны и отметки</button>`;
}


// ---- win prediction: matchup matrix built from every lane's data ----
const MX={};
function addM(a,b,e){if(!a||!b||a===b||!(e>0))return;const r=MX[a]||(MX[a]={});if(!(r[b]>=e))r[b]=e;}
for(const l in LANES){const E=LANES[l].E;for(const id in E){const d=E[id];
  d.p.forEach(p=>{if(p[1]!=null)addM(p[0],id,p[1]);});
  d.t.forEach(([n,e])=>addM(RU2ID[n],id,e));
  d.a.forEach(([n,e])=>addM(id,RU2ID[n],e));}}
for(const l in BL)BL[l].forEach(c=>{c.c.forEach(([n,e])=>addM(RU2ID[n],c.id,e));c.s.forEach(([n,e])=>addM(c.id,RU2ID[n],e));});
const edgeOf=(a,b)=>(MX[a]&&MX[a][b])||0;
const ALL_IDS=Object.keys(MH).sort((a,b)=>H[a][0].localeCompare(H[b][0],"ru"));
st.teams={us:[],them:[]};st.tside="us";
function predict(A,B){
  // heroes not picked yet count as average (win rate 50, no matchups), so divide by 5 always
  const mean=X=>X.reduce((t,id)=>t+(wrOf(id)-50),0)/5;
  const pairs=[];let netSum=0;
  for(const a of A)for(const b of B){const n=edgeOf(a,b)-edgeOf(b,a);if(n){pairs.push([a,b,n]);netSum+=n;}}
  const strength=(mean(A)-mean(B))/2;          // half the gap in average hero win rate
  const match=netSum/5; // average edge per hero across the matchups between the teams
  const raw=50+strength+match;
  return {p:Math.max(15,Math.min(85,raw)),raw,strength,match,pairs};
}
function teamRow(side,label){
  const T=st.teams[side],on=st.tside===side;
  const slots=[0,1,2,3,4].map(i=>T[i]?`<button class="slot full" type="button" data-rm="${side}:${T[i]}" aria-label="Убрать ${esc(H[T[i]][0])}">${ava(T[i])}<span>${esc(H[T[i]][0])}</span></button>`
    :`<button class="slot" type="button" data-tside="${side}" aria-label="Добавить героя в команду ${label}">+</button>`).join("");
  return `<div class="team ${side}${on?" on":""}"><button class="tlabel" type="button" data-tside="${side}" aria-pressed="${on}">${label} <small>${T.length}/5</small></button><div class="slots">${slots}</div></div>`;
}
function drawTeams(){
  $("#teams").innerHTML=teamRow("us","Мы")+teamRow("them","Враг")+
    `<div class="selrow"><span>Добавляем в: <b>${st.tside==="us"?"нашу команду":"команду врага"}</b></span>${st.teams.us.length+st.teams.them.length?`<button class="link" type="button" data-tclear="1">Очистить</button>`:""}</div>`;
  const q=$("#q3").value.trim().toLowerCase();
  const ids=ALL_IDS.filter(id=>!q||matches(id,q));
  $("#grid3").innerHTML=ids.length?ids.map(id=>{const inUs=st.teams.us.includes(id),inThem=st.teams.them.includes(id);
    return `<button class="chip${inUs?" inus":inThem?" inthem":""}" type="button" data-pid="${id}" aria-pressed="${inUs||inThem}">${ava(id)}<span>${esc(H[id][0])}<small>${inUs?"у нас":inThem?"у врага":esc(H[id][1])}</small></span></button>`;}).join("")
    :`<span class="empty">Такого героя нет. Попробуй другое написание.</span>`;
}
function drawPred(){
  const A=st.teams.us,B=st.teams.them;
  if(!A.length||!B.length){
    $("#result").innerHTML=`<h2>Прогноз победы</h2><p class="why">Добавь хотя бы по одному герою в обе команды. Точнее всего прогноз, когда известны все 10.</p>`;
    return;
  }
  const r=predict(A,B), pct=Math.round(r.p);
  const good=r.pairs.filter(x=>x[2]>0).sort((a,b)=>b[2]-a[2]).slice(0,5);
  const bad=r.pairs.filter(x=>x[2]<0).sort((a,b)=>a[2]-b[2]).slice(0,5);
  const full=A.length===5&&B.length===5;
  const line=([a,b,n])=>`<li class="${n>0?"up":"dn"}"><b>${sgn(n)}</b><span>${esc(H[a][0])} против ${esc(H[b][0])}</span></li>`;
  $("#result").innerHTML=`
    <h2>Прогноз победы</h2>
    <div class="verdict"><span class="name">${pct}%</span><span class="tag ${pct>=55?"m":pct<=45?"k":"w"}">${pct>=55?"мы в плюсе":pct<=45?"враг в плюсе":"примерно равно"}</span></div>
    <div class="bar" role="img" aria-label="Шанс нашей команды ${pct} процентов"><span style="width:${pct}%"></span></div>
    <div class="barlbl"><span>Мы ${pct}%</span><span>Враг ${100-pct}%</span></div>
    ${full?"":`<p class="note">Известно героев: ${A.length+B.length} из 10. Прогноз уточнится, когда добавишь остальных.</p>`}
    <div><h2 class="sp">Из чего сложился прогноз</h2><ul class="pm">
      <li class="${r.strength>=0?"up":"dn"}"><b>${sgn(r.strength)}</b><span>Сила героев: средний винрейт на Мифической чести</span></li>
      <li class="${r.match>=0?"up":"dn"}"><b>${sgn(r.match)}</b><span>Матчапы: кто кого контрит между командами (${r.pairs.length} пар со статистикой)</span></li>
      ${r.raw!==r.p?`<li class="dn"><b>·</b><span>Итог ограничен диапазоном 15–85%: точнее данные не позволяют</span></li>`:""}
    </ul></div>
    ${good.length?`<div><h2 class="sp">Наши выигрышные матчапы</h2><ul class="pm">${good.map(line).join("")}</ul></div>`:""}
    ${bad.length?`<div><h2 class="sp">Где враг сильнее</h2><ul class="pm">${bad.map(line).join("")}</ul></div>`:""}
    <p class="note">Это оценка по статистике героев, а не гарантия. Она не учитывает навык игроков, их ранг и то, как команда играет вместе.</p>`;
}
function setHash(){
  const h=st.mode==="draft"?"draft":st.mode==="predict"?"predict":st.lane+"-"+(st.mode==="blind"?"blind":st.enemy[st.lane]);
  try{ if(location.hash!=="#"+h) history.replaceState(null,"","#"+h); }catch(e){ try{location.hash=h;}catch(_){} }
}
function draw(scroll){
  document.querySelectorAll("[data-lane]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.lane===st.lane));
  document.querySelectorAll("[data-mode]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.mode===st.mode));
  $("#laneTitle").textContent=(st.mode==="predict"||st.mode==="draft")?"по всем линиям":LANES[st.lane].title;
  const m=st.mode;
  $("#pickKnown").hidden=m!=="known"; $("#pickBlind").hidden=m!=="blind"; $("#pickPred").hidden=m!=="predict"; $("#sitCard").hidden=m==="draft"||m==="predict";
  $("#laneSeg").hidden=m==="predict";
  if(m==="blind"){drawPool();drawBlind();}else if(m==="known"){drawGrid();drawKnown();}else if(m==="predict"){drawTeams();drawPred();}else{drawDraft();}
  $("#sit").innerHTML=SIT[st.lane].map(([en,t])=>`<div>${ico(en)}<p><b>${esc(IT[en][0])}</b>${esc(t)}</p></div>`).join("");
  setHash();
  if(scroll){
    const smooth=!matchMedia("(prefers-reduced-motion: reduce)").matches;
    $("#result").scrollIntoView({behavior:smooth?"smooth":"auto",block:"start"});
  }
}
function fromHash(){
  const h=location.hash.slice(1); if(!h) return false;
  if(h==="draft"){st.mode="draft";return true;}
  if(h==="predict"){st.mode="predict";return true;}
  if(EG[h]){st.lane="gold";st.mode="known";st.enemy.gold=h;return true;}
  const i=h.indexOf("-"); if(i<0) return false;
  const lane=h.slice(0,i), rest=h.slice(i+1);
  if(!LANES[lane]) return false;
  if(rest==="blind"){st.lane=lane;st.mode="blind";return true;}
  if(LANES[lane].E[rest]){st.lane=lane;st.mode="known";st.enemy[lane]=rest;return true;}
  return false;
}

document.querySelector(".switches").addEventListener("click",e=>{
  const b=e.target.closest("button"); if(!b) return;
  if(b.dataset.lane){st.lane=b.dataset.lane;st.pick=0;st.bpick=0;$("#q").value="";$("#q2").value="";}
  if(b.dataset.mode){st.mode=b.dataset.mode;}
  draw(false);
});
$("#grid").addEventListener("click",e=>{const b=e.target.closest(".chip"); if(b){st.enemy[st.lane]=b.dataset.id;st.pick=0;draw(true);}});
$("#empty").addEventListener("click",e=>{const b=e.target.closest("[data-golane]"); if(!b) return;
  st.lane=b.dataset.golane;st.mode="known";st.enemy[st.lane]=b.dataset.id;st.pick=0;$("#q").value="";draw(true);});
$("#pool").addEventListener("click",e=>{const b=e.target.closest(".tog"); if(!b) return;
  const s=st.sel[st.lane], n=b.dataset.n; s.has(n)?s.delete(n):s.add(n); st.bpick=0; drawPool(); drawBlind();});
$("#selrow").addEventListener("click",e=>{if(e.target.id==="clr"){st.sel[st.lane].clear();st.bpick=0;drawPool();drawBlind();}});
$("#result").addEventListener("click",e=>{
  const a=e.target.closest("button"); if(!a) return;
  const d=a.dataset;
  if(d.i!=null){st.pick=+d.i;drawKnown();return;}
  if(d.b!=null){st.bpick=+d.b;drawBlind();return;}
  if(d.side){st.side=d.side;drawDraft();return;}
  if(d.slot){st.slot=+d.slot;drawDraft();return;}
  if(d.ban){st.ban.has(d.ban)?st.ban.delete(d.ban):st.ban.add(d.ban);st.pick=0;st.bpick=0;drawDraft();return;}
  if(d.reset){st.ban.clear();for(const l in st.sel)st.sel[l].clear();st.pick=0;st.bpick=0;if($("#bq"))$("#bq").value="";drawDraft();return;}
  if(d.go){st.mode=d.go;draw(true);}
});
$("#result").addEventListener("input",e=>{
  if(e.target.id!=="bq") return;
  const pos=e.target.selectionStart; drawDraft();
  const q=$("#bq"); if(q){q.focus(); try{q.setSelectionRange(pos,pos);}catch(_){}}
});
$("#q").addEventListener("input",drawGrid);
$("#q2").addEventListener("input",drawPool);
$("#q3").addEventListener("input",drawTeams);
$("#pickPred").addEventListener("click",e=>{
  const b=e.target.closest("button"); if(!b) return; const d=b.dataset;
  if(d.tside){st.tside=d.tside;drawTeams();return;}
  if(d.tclear){st.teams.us=[];st.teams.them=[];st.tside="us";drawTeams();drawPred();return;}
  if(d.rm){const [side,id]=d.rm.split(":");st.teams[side]=st.teams[side].filter(x=>x!==id);st.tside=side;drawTeams();drawPred();return;}
  if(d.pid){const id=d.pid,T=st.teams;
    if(T.us.includes(id)||T.them.includes(id)){T.us=T.us.filter(x=>x!==id);T.them=T.them.filter(x=>x!==id);}
    else{let side=st.tside;if(T[side].length>=5)side=side==="us"?"them":"us";if(T[side].length>=5)return;T[side].push(id);
      if(T[side].length>=5&&T[side==="us"?"them":"us"].length<5)st.tside=side==="us"?"them":"us";}
    $("#q3").value="";drawTeams();drawPred();}
});
addEventListener("hashchange",()=>{if(fromHash()){st.pick=0;draw(false);}});
fromHash(); draw(false);
