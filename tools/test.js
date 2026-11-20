const html=require("fs").readFileSync(__dirname+"/../index.html","utf8");
const s=html.match(/<script>([\s\S]*)<\/script>/)[1];
const els={};const mk=id=>els[id]||(els[id]={id,innerHTML:"",hidden:false,value:"",textContent:"",dataset:{},addEventListener(){},setAttribute(){},scrollIntoView(){},focus(){},setSelectionRange(){}});
global.document={querySelector:q=>mk(q),querySelectorAll:()=>[]};
global.location={hash:""};global.history={replaceState(_,__,h){location.hash=h}};global.addEventListener=()=>{};global.matchMedia=()=>({matches:true});
const api=new Function(s+";return {st,draw,LANES,BL,B,H,IT,SP,WK,MH,poolNames,rank,drawDraft,drawGrid};")();
const {st,draw,LANES,BL,B,H,IT,SP,WK,MH}=api;let bad=[];
for(const k in B){const base=k.split("@")[0];if(!H[base])bad.push("noH "+k);if(B[k].i.length!==6)bad.push("len "+k);for(const i of B[k].i)if(!IT[i])bad.push("item "+i);if(!SP[B[k].s])bad.push("sp "+k);}
const all=new Set();
for(const ln in LANES){const L=LANES[ln];
 if(new Set(L.order).size!==L.order.length)bad.push("dup "+ln);
 for(const id of L.order){all.add(id);const d=L.E[id];if(!d){bad.push("noE "+ln+" "+id);continue;}if(!H[id])bad.push("noH "+id);if(!B[id]&&!B[id+"@"+ln])bad.push("noBuild "+id);if(!d.p.length)bad.push("nop "+id);
  d.p.forEach((p,i)=>{if(!B[p[0]]&&!B[p[0]+"@"+ln])bad.push("noB "+p[0]);if(!p[2]&&!WK[p[0]])bad.push("nowhy "+id+">"+p[0]);st.lane=ln;st.mode="known";st.enemy[ln]=id;st.pick=i;draw(false);});}
 if(Object.keys(L.E).length!==L.order.length)bad.push("count "+ln+" "+Object.keys(L.E).length+"/"+L.order.length);
 for(const c of BL[ln]){if(!B[c.id]&&!B[c.id+"@"+ln])bad.push("blB "+c.id);if(!L.order.includes(c.id))bad.push("blNotInLane "+c.id);}
 st.lane=ln;st.mode="blind";st.sel[ln]=new Set();draw(false);const names=api.poolNames();
 const unk=names.filter(n=>!Object.values(H).some(h=>h[0]===n));
 console.log(ln,L.order.length,"pool",names.length,"unknownNames",unk.join(","),"| top:",api.rank().slice(0,4).map(x=>x.c.id+":"+x.sc.toFixed(1)+(x.risk?"(r "+x.risk[0]+")":"")).join(" "));
 names.forEach(n=>{st.sel[ln]=new Set([n]);for(let i=0;i<12;i++){st.bpick=i;draw(false);}});st.sel[ln]=new Set();}
const missing=Object.keys(MH).filter(k=>!all.has(k));console.log("heroes covered",all.size,"missing",missing.join(","));
// bans: ban everything in a lane's picks and draw
st.ban=new Set(["lesley","harley","novaria","masha","marcel"]);st.lane="gold";st.mode="blind";draw(false);console.log("gold w/ bans:",api.rank().slice(0,3).map(x=>x.c.id+":"+x.sc.toFixed(1)).join(" "));
st.lane="mid";draw(false);console.log("mid w/ bans:",api.rank().slice(0,3).map(x=>x.c.id+":"+x.sc.toFixed(1)).join(" "));
st.lane="gold";st.mode="known";st.enemy.gold="bruno";draw(false);console.log("bruno known (lesley banned):",els["#result"].innerHTML.includes("Все подобранные"));
st.mode="draft";for(const side of ["first","second"])for(let n=1;n<=5;n++){st.side=side;st.slot=n;draw(false);const m=els["#result"].innerHTML.match(/Пик (\d+) из 10<\/span><span class="tag \w">видно врагов: (\d)/);process.stdout.write(side[0]+n+"="+m[1]+"/"+m[2]+" ");}
console.log();
// global search
st.mode="known";st.lane="gold";els["#q"].value="векс";api.drawGrid();console.log("search vex on gold:",els["#empty"].hidden,/data-golane="mid" data-id="vexana"/.test(els["#empty"].innerHTML));els["#q"].value="";
console.log("bad",bad);
