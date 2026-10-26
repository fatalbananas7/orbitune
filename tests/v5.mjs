import {chromium} from 'playwright';
const secs=+process.argv[2]||90,skill=+process.argv[3]||1,tag=process.argv[4]||'v5',th=process.env.TH;
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:+(process.env.DPR||1),hasTouch:true,isMobile:true});
const p=await ctx.newPage();const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{if(!localStorage.getItem('orbitune_v1'))localStorage.setItem('orbitune_v1',JSON.stringify({tut:true,assist:0}))});
await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(1200);
if(th)await p.evaluate((t)=>window.__nmTH(...t.split(',').map(Number)),th);
const box=await p.evaluate(()=>{const r=document.querySelector('canvas').getBoundingClientRect();return {x:r.x,y:r.y,s:r.width/window.ORB.LW}});
const tap=(x,y)=>p.touchscreen.tap(box.x+x*box.s,box.y+y*box.s);
const start=(o)=>p.evaluate((o)=>{const g=window.__game;g.scene.getScenes(true).forEach(s=>s.scene.key!=='Game'&&s.scene.stop());g.scene.start('Game',o)},o);
const all={star:[],shard:[]},runs=[];let fps=[],objs=[];
const startSector=+(process.env.SS||0);
await start({start:startSector});await p.waitForTimeout(400);const t0=Date.now();let shots=0;
const snap=async()=>p.evaluate(()=>{const s=window.__game.scene.getScene('Game');const R=s.R;return {score:R.score,t:+R.time.toFixed(1),sec:s.sector+1,lat:R.latches,max:R.maxCombo,nm:R.nm,gz:R.gz,ml:R.ml,ch:R.charged,col:R.collapses,od:s.overdrive,why:s.why,
  star:window.__nm.star,shard:window.__nm.shard,fired:window.__nm.fired,co:s.callout&&s.callout(),nch:s.nodes.filter(n=>n.type==='charged').length}});
while(Date.now()-t0<secs*1000){
 const st=await p.evaluate(()=>{const s=window.__game.scene.getScene('Game');if(!s.sys.isActive()||!s.c)return {};if(s.over)return {over:1};
  const c=s.c,f=window.__game.loop.actualFps,o=s.children.list.length;if(c.state!=='orbit')return {fps:f,o};const vx=-Math.sin(c.ang)*c.dir,vy=Math.cos(c.ang)*c.dir;let px=c.x,py=c.y,dvx=vx;
  for(let k=0;k<60;k++){px+=dvx*9;py+=vy*9;if(px<10||px>s.W-10)dvx*=-1;for(const n of s.nodes){if(n.alive&&n!==c.node&&n.y<c.node.y-40&&Math.hypot(n.x-px,n.y-py)<n.r+s.catchR*0.6)return {go:1,fps:f,o};}}
  return {fps:f,o,orb:c.node.orbitT};});
 if(st.fps){fps.push(st.fps);objs.push(st.o);}
 if(st.go){if(Math.random()<skill){await p.waitForTimeout(Math.random()*160*(1.6-skill));await tap(195,500);}}
 else if(st.orb>2.0&&Math.random()<0.3*(1.2-skill))await tap(195,500);
 if(st.over){const r=await snap();runs.push(r);all.star.push(...r.star);all.shard.push(...r.shard);
  if(process.env.SHOTS&&shots<2){shots++;await p.waitForTimeout(2600);await p.screenshot({path:`shots/${tag}-results${shots}.png`});}
  await start({start:startSector});await p.waitForTimeout(400);}
 await p.waitForTimeout(20);}
const last=await snap();runs.push({...last,unfinished:true});all.star.push(...last.star);all.shard.push(...last.shard);
const sum=k=>runs.reduce((a,r)=>a+(r[k]||0),0),mins=sum('t')/60;
const hist=a=>{const h={};a.forEach(v=>{const k=v<0?'<0':Math.floor(v/4)*4;h[k]=(h[k]||0)+1});return h};
console.log(JSON.stringify({tag,skill,runs:runs.map(r=>[r.score,r.t,r.sec,r.max,r.why||'-',`nm${r.nm} gz${r.gz} ml${r.ml} ch${r.ch} col${r.col}`,r.co&&r.co.h]),gameMin:+mins.toFixed(2),
 perMin:{nearStar:+(sum('nm')/mins).toFixed(2),graze:+(sum('gz')/mins).toFixed(2),milestone:+(sum('ml')/mins).toFixed(2),chargedCaught:+(sum('ch')/mins).toFixed(2),collapses:+(sum('col')/mins).toFixed(2)},
 starGapHist:hist(all.star),shardGapHist:hist(all.shard),fps:(fps.reduce((a,b)=>a+b,0)/fps.length).toFixed(1),fpsMin:Math.min(...fps).toFixed(1),objs:[Math.min(...objs),Math.max(...objs)],errs:errs.slice(0,5)}));
await b.close();
