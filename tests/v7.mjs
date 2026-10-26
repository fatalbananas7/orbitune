import {chromium} from 'playwright';
const secs=+process.argv[2]||300,skill=+(process.argv[3]||0.92),tag=process.argv[4]||'v7';
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:+(process.env.DPR||1),hasTouch:true,isMobile:true});
const p=await ctx.newPage();const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push(e.stack));
// v6-style save (no lv / lvMig) with bestSR progress -> migration
await p.addInitScript(()=>{if(!localStorage.getItem('orbitune_v1'))localStorage.setItem('orbitune_v1',JSON.stringify({tut:true,assist:0,dust:50,best:900,bestSector:3,mode:'sector',bestSR:{score:4000,sector:0,stars:{0:2}},seen:{bank:1}}))});
await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(1500);
const box=await p.evaluate(()=>{const r=document.querySelector('canvas').getBoundingClientRect();return {x:r.x,y:r.y,s:r.width/window.ORB.LW}});
const tap=(x,y)=>p.touchscreen.tap(box.x+x*box.s,box.y+y*box.s);const shot=n=>p.screenshot({path:`shots/${tag}-${n}.png`});
const save=()=>p.evaluate(()=>JSON.parse(JSON.stringify(window.__game.registry.get('save').d.lv)));
const tapLabel=async(lab)=>{const xy=await p.evaluate((lab)=>{for(const s of window.__game.scene.getScenes(true)){const o=s.children.list.find(o=>o.list&&o.list.some(c=>c.text===lab));if(o)return [o.x,o.y];}return null},lab);if(!xy)return false;await tap(xy[0],xy[1]);return true;};
const out={mig:await save(),flow:[],fx:{}};
const start=(o)=>p.evaluate((o)=>{const g=window.__game;g.scene.getScenes(true).forEach(s=>s.scene.key!=='Game'&&s.scene.stop());g.scene.start('Game',o)},o);
// locked level cannot be started
await start({mode:'sector',level:9});await p.waitForTimeout(600);out.lockedTry=await p.evaluate(()=>window.__game.scene.getScene('Game').level);
await start({mode:'sector',level:0});await p.waitForTimeout(500);
let fps=[],objs=[],t0=Date.now(),phase='clear',fails=0,got={};
while(Date.now()-t0<secs*1000){
 const st=await p.evaluate(()=>{const s=window.__game.scene.getScene('Game');if(!s.sys.isActive()||!s.c)return {};const c=s.c;
  const base={over:s.over,why:s.why,lv:s.level,sec:s.sector,latch:s.secLatch,choice:s.choice,fps:window.__game.loop.actualFps,o:s.children.list.length,res:!!(s.over&&s.children.list.some(o=>o.list&&o.list.some(c=>['NEXT LEVEL ▸','RETRY','REPLAY'].includes(c.text))))};
  if(s.over||s.choice||c.state!=='orbit')return base;const vx=-Math.sin(c.ang)*c.dir,vy=Math.cos(c.ang)*c.dir;let px=c.x,py=c.y,dvx=vx,bb=0;
  for(let k=0;k<60;k++){px+=dvx*9;py+=vy*9;if((px<10||px>s.W-10)&&bb<1){dvx*=-1;bb++;}for(const n of s.nodes){if(n.alive&&n!==c.node&&n.y<c.node.y-40&&Math.hypot(n.x-px,n.y-py)<n.r+s.catchR*0.6)return {...base,go:1};}}
  return base;});
 if(st.fps){fps.push(st.fps);objs.push(st.o);}
 if(st.choice&&!got['clear'+st.lv]){got['clear'+st.lv]=1;await p.waitForTimeout(250);await shot('levelclear-banner-L'+(st.lv+1));}
 if(st.res){await p.waitForTimeout(2200);const lvs=await save();await shot('results-'+st.why+'-L'+(st.lv+1));out.flow.push({lv:st.lv+1,why:st.why,u:lvs.u,st:lvs.st});
  if(st.why==='clear'){if(st.lv===1&&!got.replay){got.replay=1;await tapLabel('REPLAY');out.flow.push('tap REPLAY');}else if(st.lv>=2){break;}else{await tapLabel('NEXT LEVEL ▸');out.flow.push('tap NEXT');}}
  else{fails++;await tapLabel('RETRY');out.flow.push('tap RETRY');}
  await p.waitForTimeout(900);const nl=await p.evaluate(()=>{const s=window.__game.scene.getScene('Game');return [s.level,s.sector,s.secLatch,s.fuel,s.lives]});out.flow.push({started:nl});continue;}
 if(process.env.FAILAT&&!got.fail&&Date.now()-t0>process.env.FAILAT*1000&&!st.over&&!st.choice&&st.fps){got.fail=1;await p.evaluate(()=>{const s=window.__game.scene.getScene('Game');s.lives=0;s.end('lost')});}
 if(st.go&&Math.random()<skill){await p.waitForTimeout(Math.random()*100);await tap(195,500);}
 await p.waitForTimeout(20);}
out.fx=await p.evaluate(()=>{const L=window.__FX.log,o={};L.forEach(([t,v])=>{(o[t]=o[t]||[]).push(JSON.stringify(v))});for(const k in o)o[k]=[...new Set(o[k])].slice(0,8);return o});
// persistence across reload
await p.reload();await p.waitForTimeout(1500);out.afterReload=await save();
// Endless always sector 1
await start({mode:'endless',start:3});await p.waitForTimeout(600);out.endless=await p.evaluate(()=>{const s=window.__game.scene.getScene('Game');return {mode:s.mode,sector:s.sector,P:s.P.sh}});
out.fps=(fps.reduce((a,b)=>a+b,0)/fps.length).toFixed(1);out.objs=[Math.min(...objs),Math.max(...objs)];out.errs=errs.slice(0,5);console.log(JSON.stringify(out,null,0));await b.close();
