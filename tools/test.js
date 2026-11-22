// Быстрая проверка логики страницы без браузера: node tools/test.js
const html=require("fs").readFileSync(__dirname+"/../index.html","utf8");
const s=html.match(/<script>([\s\S]*)<\/script>/)[1];
const els={};const mk=id=>els[id]||(els[id]={id,innerHTML:"",hidden:false,value:"",textContent:"",dataset:{},addEventListener(){},setAttribute(){},scrollIntoView(){},focus(){},setSelectionRange(){}});
global.document={querySelector:q=>mk(q),querySelectorAll:()=>[]};
global.location={hash:""};global.history={replaceState(_,__,h){location.hash=h}};global.addEventListener=()=>{};global.matchMedia=()=>({matches:true});
const api=new Function(s+";return {st,draw,LANES,BL,B,H,IT,SP,MH,PROF,ROAM_META,ROAM_CHIPS,rankVs,rankBlind,roamRank,fromHash,MU};")();
const {st,draw,LANES,B,H,IT,SP,MH,PROF,ROAM_META,ROAM_CHIPS}=api;const bad=[];
const res=()=>els["#result"].innerHTML;
// сборки: 6 предметов, все предметы и заклинания известны
for(const k in B){const base=k.split("@")[0];if(!H[base])bad.push("noH "+k);if(B[k].i.length!==6)bad.push("len "+k);for(const i of B[k].i)if(!IT[i])bad.push("item "+k+":"+i);if(!SP[B[k].s])bad.push("sp "+k+":"+B[k].s);}
for(const lane of ["gold","exp"]){
  const pool=LANES[lane].order;
  for(const id of pool){
    if(!PROF[id])bad.push("noProf "+id);
    if(!B[id]&&!B[id+"@"+lane])bad.push("noBuild "+id);
    st.tab=lane;st.enemy[lane]=id;
    for(let i=0;i<8;i++){st.pick=i;draw(false);if(!/Бери:/.test(res()))bad.push("noPick "+lane+" "+id+" "+i);}
  }
  const tops=pool.map(e=>{const r=api.rankVs(lane,e);return H[e][0]+"→"+H[r[0].id][0]+(r[0].meas?"("+r[0].exp.toFixed(1)+")":r[0].mech?"(мех)":"");});
  console.log("\n"+lane+": лучший против каждого врага\n "+tops.join(" | "));
  st.enemy[lane]=null;for(let i=0;i<8;i++){st.pick=i;draw(false);}
  console.log(" слепой пик:",api.rankBlind(lane).slice(0,5).map(x=>H[x.id][0]+" "+x.sc.toFixed(1)+(x.risk?" (риск "+H[x.risk[0]][0]+")":"")).join(", "));
}
// роум
st.tab="roam";st.chips=new Set();draw(false);console.log("\nроум без ситуации:",api.roamRank().slice(0,4).map(x=>H[x.id][0]+" "+x.sc.toFixed(1)).join(", "));
for(const [k] of ROAM_CHIPS){st.chips=new Set([k]);draw(false);console.log(" "+k+":",api.roamRank().slice(0,3).map(x=>H[x.id][0]+" "+x.sc.toFixed(1)).join(", "));}
st.chips=new Set(["dive","notank"]);draw(false);console.log(" dive+notank:",api.roamRank().slice(0,3).map(x=>H[x.id][0]).join(", "));
st.ban=new Set(ROAM_META.map(m=>m.id));st.chips=new Set();draw(false);console.log(" все метовые в бане:",api.roamRank().slice(0,3).map(x=>H[x.id][0]).join(", "),/Бери:/.test(res()));
for(const m of ROAM_META){if(!B[m.id]&&!B[m.id+"@roam"])bad.push("noBuild roam "+m.id);}
// баны убирают героя из советов
st.ban=new Set(["masha","bruno"]);st.tab="exp";st.enemy.exp="freya";st.pick=0;draw(false);
if(api.rankVs("exp","freya").some(x=>x.id==="masha"))bad.push("banned masha still ranked");
st.tab="gold";st.enemy.gold=null;draw(false);if(api.rankBlind("gold").some(x=>x.id==="bruno"))bad.push("banned bruno still ranked");
st.tab="bans";draw(false);if(!/Следующий бан/.test(res()))bad.push("bans tab");
// адреса
for(const h of ["gold","exp","roam","bans","draft","gold-brody","exp-masha","mid-valir","jungle-ling","roam-pick","brody"]){location.hash="#"+h;st.enemy={gold:null,exp:null};api.fromHash();draw(false);process.stdout.write(h+"→"+st.tab+(st.enemy[st.tab]?":"+st.enemy[st.tab]:"")+" ");}
console.log("\nbad",bad);
