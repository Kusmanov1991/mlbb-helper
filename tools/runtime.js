const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const num=n=>n.toFixed(1).replace(".",",");
const fmt=n=>"+"+num(n)+" п.п.";
const sgn=n=>(n>=0?"+":"−")+num(Math.abs(n));
const ico=en=>{const t=IT[en];return `<span class="ico ${t[2]}" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="${G[t[1]]}"/></svg></span>`;};
const AB={popol:"ПК",luoyi:"ЛЙ",xborg:"ИБ",yisunshin:"ЛС",lapulapu:"ЛЛ",change:"ЧЭ",suyou:"СЁ"};
const ava=(id,big)=>{const ru=H[id][0];let h=0;for(const c of id)h=(h*31+c.charCodeAt(0))%360;
 return `<span class="ava${big?" big":""}" style="background:hsl(${h} 42% 38%)" aria-hidden="true">${AB[id]||ru.slice(0,2)}</span>`;};
const LANE_NAME={gold:"Золото",mid:"Мид",roam:"Роум",exp:"Опыт",jungle:"Лес"};
const TITLE={gold:"линии золота",exp:"линии опыта",roam:"для роума",bans:"и баны"};
const RU2ID={};for(const k in H)RU2ID[H[k][0]]=k;
const wrOf=id=>MH[id]?MH[id][0]:50;
const banOf=id=>MH[id]?MH[id][1]:0;
const popOf=id=>POP[id]||0;
const TABS=["gold","exp","roam","bans"];   // мид и лес спрятаны: данные остались, вкладок нет

const st={tab:"gold",enemy:{gold:null,exp:null},pick:0,ban:new Set(),chips:new Set()};
const laneOf=()=>st.tab==="gold"||st.tab==="exp"?st.tab:null;

// ---------- общие куски ----------
function buildBlock(id,lane){
  const b=B[id+"@"+lane]||B[id];
  if(!b) return "";
  return `<div><h2 class="sp">Закуп на всю игру: ${esc(H[id][0])}</h2>
      <ol class="build">${b.i.map(x=>`<li>${ico(x)}<span>${esc(IT[x][0])}</span></li>`).join("")}</ol></div>
    <div class="meta"><span>Заклинание: <b>${esc(SP[b.s]||b.s)}</b></span>${b.r?`<span>${esc(b.rk||"Благословение роума")}: <b>${esc(b.r)}</b></span>`:""}</div>
    <p class="note">${esc(b.n)}</p>`;
}
function bannedLine(){
  if(!st.ban.size) return "";
  return `<div class="banline"><span>В бане: ${[...st.ban].map(id=>esc(H[id][0])).join(", ")}</span><button class="link" type="button" data-tab="bans">изменить</button></div>`;
}
const ALIAS={zetian:"Зетиан",luoyi:"Луо И",pharsa:"Фарса",zhuxin:"Чжу Синь",vale:"Вейл",aamon:"Аамон",bane:"Бейн",barats:"Баратс",baxia:"Баксия",change:"Чанъэ",dyrroth:"Дайрот Джавхед",jawhead:"Джавхед",kalea:"Калея",rafaela:"Рафаэла",silvanna:"Сильванна",suyou:"Суё Су Е",terizla:"Теризла",yisunshin:"И Сун-Син",yuzhong:"Юй Чжун Ю Чжун",fredrinn:"Фредерин"};
function matches(id,q){const [ru,en]=H[id];return ru.toLowerCase().includes(q)||en.toLowerCase().includes(q)||(ALIAS[id]||"").toLowerCase().includes(q);}
function phaseBox(v,label,time){
  const cls=v>0?"hi":v<0?"lo":"";
  const txt=v>0?"сильный":v<0?"слабый":"ровно";
  return `<div class="${cls}"><b>${label}</b>${time}<br>${txt}</div>`;
}
const pmLine=([v,t])=>`<li class="${v>=0?"up":"dn"}"><b>${sgn(v)}</b><span>${esc(t)}</span></li>`;
function banButton(id){
  return `<button class="link" type="button" data-banpick="${id}">${esc(H[id][0])} в бане → показать следующего</button>`;
}
function banWarn(id){
  const b=banOf(id);
  return b>=20?`<p class="note"><span class="tag w">часто банят</span> ${esc(H[id][0])} банят в ${Math.round(b)}% игр на Мифической чести. Держи запасной вариант из списка ниже.</p>`:"";
}

// ---------- матрица матчапов из данных всех линий (включая спрятанные) ----------
const MX={};
function addM(a,b,e){if(!a||!b||a===b||!(e>0))return;const r=MX[a]||(MX[a]={});if(!(r[b]>=e))r[b]=e;}
for(const l in LANES){const E=LANES[l].E;for(const id in E){const d=E[id];
  d.p.forEach(p=>{if(p[1]!=null)addM(p[0],id,p[1]);});
  d.t.forEach(([n,e])=>addM(RU2ID[n],id,e));
  d.a.forEach(([n,e])=>addM(id,RU2ID[n],e));}}
for(const l in BL)BL[l].forEach(c=>{c.c.forEach(([n,e])=>addM(RU2ID[n],c.id,e));c.s.forEach(([n,e])=>addM(c.id,RU2ID[n],e));});
const edgeOf=(a,b)=>(MX[a]&&MX[a][b])||0;
const net=(a,b)=>edgeOf(a,b)-edgeOf(b,a);

// ---------- золото и опыт: расчёт ----------
const poolOf=lane=>LANES[lane].order;
const MECH=1.0, UNSURE=0.5;  // бонус контрпику по механике и штраф за матчап без статистики
function scoreVs(lane,c,e){
  const base=wrOf(c)-50, meas=net(c,e);
  const pe=LANES[lane].E[e].p.find(p=>p[0]===c);
  const mech=pe&&pe[1]==null&&pe[3]!=="wr"?MECH:0;
  const unc=!meas&&!mech?UNSURE:0;
  return {id:c,base,meas,mech,unc,pe,sc:base+meas+mech-unc,exp:wrOf(c)+meas};
}
function rankVs(lane,e){
  return poolOf(lane).filter(c=>c!==e&&!st.ban.has(c)).map(c=>scoreVs(lane,c,e)).sort((a,b)=>b.sc-a.sc);
}
// самый сильный ещё не забаненный контрпик с той же линии: враг может взять его позже
function riskOf(lane,c){
  let best=null;
  for(const x of poolOf(lane)){ if(x===c||st.ban.has(x)) continue; const n=net(x,c); if(n>0&&(!best||n>best[1])) best=[x,n]; }
  return best;
}
function rankBlind(lane){
  return poolOf(lane).filter(c=>!st.ban.has(c)).map(c=>{
    const base=wrOf(c)-50, risk=riskOf(lane,c);
    return {id:c,base,risk,sc:base-(risk?risk[1]:0)};
  }).sort((a,b)=>b.sc-a.sc);
}
// план по стадиям: сравниваем, в какой стадии сильнее каждый из двух героев
function phasePlan(lane,c,e){
  const pc=LANES[lane].E[c].ph, pe=LANES[lane].E[e].ph;
  const d0=pc[0]-pe[0], d1=pc[1]-pe[1], d2=pc[2]-pe[2];
  const early=d0>0?"Ты сильнее в начале: дави линию и бери размены до 10-й минуты."
    :d0<0?"Он сильнее в начале: фарми у башни и не меняйся до 10-й минуты."
    :"Начало ровное: решают размены и уход от его главного умения.";
  const late=d2>0?"После 16-й минуты ты сильнее: если отстаёшь, тяни игру."
    :d2<0?"После 16-й минуты он сильнее: набери преимущество раньше и дави башни."
    :d1>0?"С 10-й по 16-ю минуту твоё окно силы: ищи драки за черепаху и лорда."
    :d1<0?"С 10-й по 16-ю минуту он сильнее: в это время не дерись без команды."
    :"Дальше всё решают предметы и драки за объекты.";
  return {early,late};
}
function planBlock(lane,c,e){
  const mu=MU[lane+":"+e+":"+c], ph=phasePlan(lane,c,e), pv=PROF[e]||{}, pc=PROF[c]||{};
  const row=(k,t)=>t?`<li><b>${k}.</b> ${esc(t)}</li>`:"";
  const buy=(mu&&mu.b)||pv.buy;
  return `<div class="mu"><h2 class="sp">План на матчап «${esc(H[c][0])} — ${esc(H[e][0])}»</h2><ul class="plain">
    ${row("Начало",(mu&&mu.e)||ph.early)}${row("Дальше",(mu&&mu.l)||ph.late)}${row("Не делай",mu&&mu.x)}
    ${mu?"":row("Против соперника",pv.vs)}${row("Докупи",buy)}</ul></div>
    ${pc.play?`<div><h2 class="sp">Как играть: ${esc(H[c][0])}</h2><p class="why">${esc(pc.play)}</p></div>`:""}`;
}
function altsBlock(list,label,fmtv){
  return `<div><h2 class="sp">${label}</h2><div class="alts">${list.map((x,i)=>
    `<button class="alt" type="button" data-i="${i}" aria-pressed="${i===st.pick}">${ava(x.id)}${esc(H[x.id][0])}<span class="e">${fmtv(x)}</span></button>`).join("")}</div></div>`;
}
const expTxt=x=>x.meas?"≈"+num(x.exp)+"%":x.mech?"мех.":num(wrOf(x.id))+"%";

function drawGrid(){
  const lane=laneOf(), q=$("#q").value.trim().toLowerCase(), sel=st.enemy[lane];
  const ids=poolOf(lane).slice().sort((a,b)=>popOf(b)-popOf(a)).filter(id=>!q||matches(id,q));
  $("#grid").innerHTML=ids.map(id=>{const bn=st.ban.has(id);
    return `<button class="chip${bn?" banned":""}" type="button" data-id="${id}" aria-pressed="${id===sel}">${ava(id)}<span>${esc(H[id][0])}${bn?"<small>в бане</small>":""}</span></button>`;}).join("");
  const em=$("#empty");
  if(!ids.length){
    const other=TABS.filter(t=>t!==lane&&LANES[t]).flatMap(t=>poolOf(t).filter(id=>matches(id,q)).map(id=>[t,id]));
    em.hidden=false;
    em.innerHTML=other.length?`<span>На этой линии такого героя нет. Он есть здесь:</span><div class="alts">${other.slice(0,6).map(([t,id])=>
      `<button class="alt" type="button" data-golane="${t}" data-id="${id}">${ava(id)}${esc(H[id][0])}<span class="e">${LANE_NAME[t]}</span></button>`).join("")}</div>`
      :"Такого героя нет. Попробуй другое написание.";
  }else em.hidden=true;
  $("#unknownRow").innerHTML=sel?`<span>Соперник: <b>${esc(H[sel][0])}</b></span><button class="link" type="button" id="unk">Не знаю соперника</button>`
    :`<span>Соперник не выбран — показан лучший слепой пик.</span>`;
}

function drawVs(lane,e){
  const d=LANES[lane].E[e], r=rankVs(lane,e);
  if(!r.length){$("#result").innerHTML=`${bannedLine()}<p class="why">Все герои линии в бане.</p>`;return;}
  if(st.pick>=Math.min(r.length,8)) st.pick=0;
  const x=r[st.pick], c=x.id, mu=MU[lane+":"+e+":"+c];
  const why=(mu&&mu.w)||(x.pe&&x.pe[2])||(x.meas>0?"Статистически выигрывает этот матчап и силён в патче.":x.meas<0?"Силён в патче, хотя по статистике этот матчап ему неудобен.":"Сильный герой патча. Прямой статистики по этому матчапу нет.");
  const lines=[[x.base,`Сила в патче: винрейт ${num(wrOf(c))}% на Мифической чести`]];
  if(x.meas) lines.push([x.meas,"Матчап с этим соперником по статистике"]);
  if(x.mech) lines.push([x.mech,"Контрпик по механике умений (статистики нет)"]);
  if(x.unc) lines.push([-x.unc,"Нет статистики по этому матчапу: оценка менее надёжна"]);
  const tag=x.meas?`<span class="tag m">≈${num(x.exp)}% побед</span>`:x.mech?`<span class="tag k">по механике</span>`:`<span class="tag k">сила в патче</span>`;
  const flat=d.ph.every(v=>v===0);
  // прямой контрпик: самое большое преимущество именно против этого врага (статистика или механика)
  const ci=r.reduce((bi,y,i)=>{const v=y.meas+y.mech, bv=bi<0?0:r[bi].meas+r[bi].mech; return v>bv?i:bi;},-1);
  const cc=ci>=0&&ci!==st.pick?r[ci]:null;
  const counterCard=cc?`<div class="next"><span>Прямой контрпик:</span> <b>${esc(H[cc.id][0])}</b> — ${cc.meas?`${fmt(cc.meas)} в этом матчапе, ≈${num(cc.exp)}% побед`:"контрит по механике умений"}${banOf(cc.id)>=20?`, банят в ${Math.round(banOf(cc.id))}%`:""}. <button class="link" type="button" data-i="${ci}">Показать его</button></div>`:"";
  $("#result").innerHTML=`${bannedLine()}
    <div class="versus">Против: <b>${esc(H[e][0])}</b>${st.ban.has(e)?` <span class="tag k">в бане</span>`:""}</div>
    <div class="verdict">${ava(c,true)}<span class="name">Бери: ${esc(H[c][0])}</span>${tag}</div>
    <p class="why">${esc(why)}</p>
    <div><h2 class="sp">Из чего сложилась оценка</h2><ul class="pm">${lines.map(pmLine).join("")}</ul></div>
    ${counterCard}
    ${banWarn(c)}${banButton(c)}
    ${planBlock(lane,c,e)}
    ${altsBlock(r.slice(0,8),"Другие варианты",expTxt)}
    ${buildBlock(c,lane)}
    <div><h2 class="sp">Когда соперник опасен</h2>
      ${flat?`<p class="note">Заметной разницы между стадиями игры нет.</p>`:`<div class="phase">${phaseBox(d.ph[0],"Начало","0–10 мин")}${phaseBox(d.ph[1],"Середина","10–16 мин")}${phaseBox(d.ph[2],"Поздняя","16+ мин")}</div>`}</div>
    <div><h2 class="sp">Как играть против соперника</h2><ul class="plain">${d.tips.map(t=>`<li>${esc(t)}</li>`).join("")}</ul></div>
    ${d.t.length?`<div><h2 class="sp">Попроси у команды</h2><div class="rows">${d.t.map(y=>`<span class="pill">${esc(y[0])}<i>${fmt(y[1])}</i></span>`).join("")}</div></div>`:""}
    ${d.a.length?`<div><h2 class="sp">Не бери против соперника</h2><div class="rows">${d.a.map(y=>`<span class="pill bad">${esc(y[0])}<i>−${num(y[1])}</i></span>`).join("")}</div></div>`:""}`;
}

function drawBlind(lane){
  const r=rankBlind(lane);
  if(!r.length){$("#result").innerHTML=`${bannedLine()}<p class="why">Все герои линии в бане.</p>`;return;}
  if(st.pick>=Math.min(r.length,8)) st.pick=0;
  const x=r[st.pick], c=x.id, pc=PROF[c]||{};
  const lines=[[x.base,`Сила в патче: винрейт ${num(wrOf(c))}% на Мифической чести`]];
  if(x.risk) lines.push([-x.risk[1],`Риск: на линии его контрит ${H[x.risk[0]][0]}, враг может взять его позже`]);
  const why=x.risk?`Если соперник уже открыт и это не ${H[x.risk[0]][0]}, или ${H[x.risk[0]][0]} в бане, риска нет.`
    :"Измеренных контрпиков на линии у него не осталось: можно брать, не видя соперника.";
  const cnt=poolOf(lane).filter(y=>y!==c&&net(y,c)>0).sort((a,b)=>net(b,c)-net(a,c)).slice(0,5);
  $("#result").innerHTML=`${bannedLine()}
    <div class="versus">Слепой пик на <b>${lane==="gold"?"линию золота":"линию опыта"}</b></div>
    <div class="verdict">${ava(c,true)}<span class="name">Бери: ${esc(H[c][0])}</span><span class="tag ${x.sc>=0?"m":"k"}">оценка ${sgn(x.sc)}</span></div>
    <p class="why">${esc(why)}</p>
    <div><h2 class="sp">Из чего сложилась оценка</h2><ul class="pm">${lines.map(pmLine).join("")}</ul></div>
    ${banWarn(c)}${banButton(c)}
    ${pc.play?`<div><h2 class="sp">Как играть: ${esc(H[c][0])}</h2><p class="why">${esc(pc.play)}</p></div>`:""}
    ${cnt.length?`<div><h2 class="sp">Кого опасаться на линии</h2><div class="rows">${cnt.map(y=>`<span class="pill bad">${esc(H[y][0])}<i>−${num(net(y,c))}</i></span>`).join("")}</div></div>`:""}
    ${altsBlock(r.slice(0,8),"Рейтинг для слепого пика",y=>sgn(y.sc))}
    ${buildBlock(c,lane)}
    <p class="note">Как только увидишь соперника по линии, выбери его в списке выше: совет станет точнее.</p>`;
}

// ---------- роум: метовые герои + ситуация ----------
const ROAM_WR=0.5;  // все восемь и так метовые: половина разницы винрейта, чтобы ситуация решала
const CHIP_TXT={};ROAM_CHIPS.forEach(([k,t])=>CHIP_TXT[k]=t);
function roamRank(){
  const meta=ROAM_META.filter(m=>!st.ban.has(m.id)).map(m=>{
    const base=(wrOf(m.id)-50)*ROAM_WR, up=[[base,`Сила в патче: винрейт ${num(wrOf(m.id))}% на Мифической чести`]];
    let sc=base;
    for(const k of st.chips){const v=m.tags[k]; if(v){sc+=v;up.push([v,CHIP_TXT[k]]);}}
    return {m,id:m.id,sc,up};
  }).sort((a,b)=>b.sc-a.sc);
  if(meta.length) return meta;
  // все метовые в бане: берём следующих по силе из всех роумеров
  return BL.roam.map(c=>c.id).filter(id=>!st.ban.has(id)&&!ROAM_META.some(m=>m.id===id))
    .map(id=>({m:null,id,sc:wrOf(id)-50,up:[[wrOf(id)-50,`Сила в патче: винрейт ${num(wrOf(id))}% на Мифической чести`]]})).sort((a,b)=>b.sc-a.sc);
}
function drawChips(){
  $("#chips").innerHTML=ROAM_CHIPS.map(([k,t])=>`<button class="tog" type="button" data-chip="${k}" aria-pressed="${st.chips.has(k)}">${esc(t)}</button>`).join("")+
    (st.chips.size?`<button class="link" type="button" data-chipclear="1">Сбросить</button>`:"");
}
function drawRoam(){
  const r=roamRank();
  if(!r.length){$("#result").innerHTML=`${bannedLine()}<p class="why">Все роумеры в бане.</p>`;return;}
  if(st.pick>=r.length) st.pick=0;
  const x=r[st.pick], c=x.id, m=x.m;
  const list=ROAM_META.map(mm=>{const on=st.ban.has(mm.id), idx=r.findIndex(y=>y.id===mm.id);
    return `<li><button type="button" class="banrow" ${on?`data-unban="${mm.id}"`:`data-i="${idx}"`} aria-pressed="${on}">${ava(mm.id)}<span class="bn"><b>${esc(H[mm.id][0])}</b><small>винрейт ${num(wrOf(mm.id))}% · банят в ${Math.round(banOf(mm.id))}%</small></span><span class="mk">${on?"в бане":idx===st.pick?"выбран":"смотреть"}</span></button></li>`;}).join("");
  $("#result").innerHTML=`${bannedLine()}
    <div class="verdict">${ava(c,true)}<span class="name">Бери: ${esc(H[c][0])}</span><span class="tag m">${num(wrOf(c))}% побед</span></div>
    ${m?`<p class="why">${esc(m.when)}</p>`:`<p class="why">Все метовые роумеры в бане: это следующий по силе в патче.</p>`}
    <div><h2 class="sp">Почему он</h2><ul class="pm">${x.up.map(pmLine).join("")}</ul></div>
    ${banWarn(c)}${banButton(c)}
    ${m?`<div><h2 class="sp">Как играть</h2><p class="why">${esc(m.play)}</p></div>`:""}
    ${buildBlock(c,"roam")}
    <div><h2 class="sp">Метовые роумеры патча</h2><ul class="bans">${list}</ul></div>
    <p class="note">Порядок: половина разницы винрейта с 50% плюс бонусы за отмеченную ситуацию. Забаненный герой выпадает из рекомендации.</p>`;
}

// ---------- баны ----------
const threat=id=>(MH[id][0]-50)+MH[id][1]/20;
function banGroup(id){
  const [w,b]=MH[id];
  if(w>=52&&b>=15) return ["сильный, его банят","m"];
  if(w>=53.5&&b<15) return ["сильный, но редко банят","w"];
  if(b>=25&&w<52) return ["банят часто, винрейт обычный","k"];
  return null;
}
function drawBans(){
  const list=Object.keys(MH).sort((a,b)=>threat(b)-threat(a)).slice(0,18);
  const next=list.filter(id=>!st.ban.has(id)).slice(0,3);
  const bq=($("#bq")&&$("#bq").value||"").trim().toLowerCase();
  const found=bq?Object.keys(MH).filter(id=>matches(id,bq)).slice(0,10):[];
  $("#result").innerHTML=`
    <div><h2 class="sp">Кого банить на Мифической чести (25–49 звёзд)</h2>
      <p class="note">Каждая команда банит 5 героев. Отмечать баны не обязательно: если отметишь, эти герои пропадут из советов на всех вкладках.</p></div>
    <div class="next"><span>Следующий бан:</span> ${next.map(id=>`<b>${esc(H[id][0])}</b>`).join(", ")}</div>
    <ul class="bans">${list.map(id=>{const g=banGroup(id),[w,b]=MH[id],on=st.ban.has(id);
      return `<li><button type="button" class="banrow" data-ban="${id}" aria-pressed="${on}">${ava(id)}<span class="bn"><b>${esc(H[id][0])}</b><small>винрейт ${num(w)}% · банят в ${Math.round(b)}%</small></span>${g?`<span class="tag ${g[1]}">${g[0]}</span>`:""}<span class="mk">${on?"в бане":"бан"}</span></button></li>`;}).join("")}</ul>
    <div><h2 class="sp">Отметить другого героя в бане</h2>
      <input id="bq" type="search" placeholder="Имя героя" autocomplete="off" aria-label="Найти героя для бана" value="${esc(bq)}">
      <div class="alts" id="bfound">${found.map(id=>`<button class="alt" type="button" data-ban="${id}" aria-pressed="${st.ban.has(id)}">${ava(id)}${esc(H[id][0])}<span class="e">${st.ban.has(id)?"в бане":"бан"}</span></button>`).join("")}</div></div>
    ${st.ban.size?`<button class="link" type="button" data-reset="1">Новый матч: снять все баны</button>`:""}`;
}

// ---------- отрисовка и адрес ----------
function setHash(){
  const lane=laneOf(), h=lane&&st.enemy[lane]?lane+"-"+st.enemy[lane]:st.tab;
  try{ if(location.hash!=="#"+h) history.replaceState(null,"","#"+h); }catch(e){ try{location.hash=h;}catch(_){} }
}
function draw(scroll){
  document.querySelectorAll("[data-tab]").forEach(b=>{if(b.closest(".switches"))b.setAttribute("aria-pressed",b.dataset.tab===st.tab);});
  $("#laneTitle").textContent=TITLE[st.tab];
  const lane=laneOf();
  $("#pickKnown").hidden=!lane; $("#pickRoam").hidden=st.tab!=="roam"; $("#sitCard").hidden=st.tab==="bans";
  if(lane){drawGrid(); st.enemy[lane]?drawVs(lane,st.enemy[lane]):drawBlind(lane);}
  else if(st.tab==="roam"){drawChips();drawRoam();}
  else drawBans();
  if(st.tab!=="bans") $("#sit").innerHTML=SIT[st.tab].map(([en,t])=>`<div>${ico(en)}<p><b>${esc(IT[en][0])}</b>${esc(t)}</p></div>`).join("");
  setHash();
  if(scroll){
    const smooth=!matchMedia("(prefers-reduced-motion: reduce)").matches;
    $("#result").scrollIntoView({behavior:smooth?"smooth":"auto",block:"start"});
  }
}
function fromHash(){
  const h=location.hash.slice(1); if(!h) return false;
  if(h==="bans"||h==="draft"){st.tab="bans";return true;}
  if(h==="roam"||h.startsWith("roam-")){st.tab="roam";return true;}
  if(h==="gold"||h==="exp"){st.tab=h;return true;}
  if(EG[h]){st.tab="gold";st.enemy.gold=h;return true;}
  const i=h.indexOf("-"); if(i<0) return false;
  const lane=h.slice(0,i), rest=h.slice(i+1);
  if(lane!=="gold"&&lane!=="exp"){st.tab="gold";return true;}   // старые ссылки на мид и лес
  st.tab=lane; st.enemy[lane]=LANES[lane].E[rest]?rest:null; return true;
}

document.querySelector(".switches").addEventListener("click",e=>{
  const b=e.target.closest("[data-tab]"); if(!b) return;
  st.tab=b.dataset.tab; st.pick=0; $("#q").value=""; draw(false);
});
$("#grid").addEventListener("click",e=>{const b=e.target.closest(".chip"); if(!b) return;
  const lane=laneOf(), id=b.dataset.id; st.enemy[lane]=st.enemy[lane]===id?null:id; st.pick=0; $("#q").value=""; draw(true);});
$("#unknownRow").addEventListener("click",e=>{if(e.target.id==="unk"){st.enemy[laneOf()]=null;st.pick=0;draw(false);}});
$("#empty").addEventListener("click",e=>{const b=e.target.closest("[data-golane]"); if(!b) return;
  st.tab=b.dataset.golane; st.enemy[st.tab]=b.dataset.id; st.pick=0; $("#q").value=""; draw(true);});
$("#pickRoam").addEventListener("click",e=>{const b=e.target.closest("button"); if(!b) return;
  if(b.dataset.chipclear){st.chips.clear();}
  else if(b.dataset.chip){const k=b.dataset.chip; st.chips.has(k)?st.chips.delete(k):st.chips.add(k);}
  else return;
  st.pick=0; drawChips(); drawRoam();});
$("#result").addEventListener("click",e=>{
  const a=e.target.closest("button"); if(!a) return;
  const d=a.dataset;
  if(d.i!=null){st.pick=+d.i;draw(false);return;}
  if(d.banpick){st.ban.add(d.banpick);st.pick=0;draw(false);return;}
  if(d.unban){st.ban.delete(d.unban);draw(false);return;}
  if(d.ban){st.ban.has(d.ban)?st.ban.delete(d.ban):st.ban.add(d.ban);st.pick=0;drawBans();return;}
  if(d.reset){st.ban.clear();st.pick=0;if($("#bq"))$("#bq").value="";drawBans();return;}
  if(d.tab){st.tab=d.tab;st.pick=0;draw(true);}
});
$("#result").addEventListener("input",e=>{
  if(e.target.id!=="bq") return;
  const pos=e.target.selectionStart; drawBans();
  const q=$("#bq"); if(q){q.focus(); try{q.setSelectionRange(pos,pos);}catch(_){}}
});
$("#q").addEventListener("input",drawGrid);
addEventListener("hashchange",()=>{if(fromHash()){st.pick=0;draw(false);}});
fromHash(); draw(false);
