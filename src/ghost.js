// Ghost of personal best. Stored separately from the main save so a bad ghost can never break progress.
// n: normal runs (random worlds) -> height-vs-time pace curve. d: daily (seeded world) -> x/height path, per day.
const KEY='orbitune_ghost',DT=100,MAX=3000;
const okArr=(a,len)=>Array.isArray(a)&&a.length>=len&&a.length<=MAX*2&&a.every(v=>Number.isInteger(v)&&Math.abs(v)<1e7);
export const Ghost={DT,MAX,
 load(){let g=null;try{g=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
  const out={v:1};if(!g||typeof g!=='object'||g.v!==1)return out;
  if(g.n&&okArr(g.n.p,10)&&Number.isFinite(g.n.h))out.n={h:g.n.h,score:g.n.score|0,p:g.n.p};
  if(g.d&&typeof g.d.date==='string'&&okArr(g.d.p,20)&&g.d.p.length%2===0&&Number.isFinite(g.d.h))out.d={date:g.d.date,h:g.d.h,score:g.d.score|0,p:g.d.p};
  return out;},
 save(g){try{localStorage.setItem(KEY,JSON.stringify(g))}catch(e){}}};
