import {chromium} from 'playwright';
const base=process.argv[2]||'http://localhost:8123/index.html';
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,hasTouch:true,isMobile:true});
const p=await ctx.newPage();const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{if(!localStorage.getItem('orbitune_v1'))localStorage.setItem('orbitune_v1',JSON.stringify({tut:true,best:0}))});
await p.goto(base);await p.waitForTimeout(1500);
const box=await p.evaluate(()=>{const r=document.querySelector('canvas').getBoundingClientRect();return {x:r.x,y:r.y,s:r.width/window.ORB.LW}});
const tap=(x,y)=>p.touchscreen.tap(box.x+x*box.s,box.y+y*box.s);
const start=(o)=>p.evaluate((o)=>{const g=window.__game;g.scene.getScenes(true).forEach(s=>s.scene.key!=='Game'&&s.scene.stop());g.scene.start('Game',o)},o);
async function play(secs,{shotAt,tag}={}){const t0=Date.now();let fps=[],shot=false;
 while(Date.now()-t0<secs*1000){const st=await p.evaluate(()=>{const s=window.__game.scene.getScene('Game');if(!s.sys.isActive()||!s.c)return {};if(s.over)return {over:1};
  const c=s.c;if(c.state!=='orbit')return {fps:window.__game.loop.actualFps};const vx=-Math.sin(c.ang)*c.dir,vy=Math.cos(c.ang)*c.dir;let px=c.x,py=c.y,dvx=vx;
  for(let k=0;k<60;k++){px+=dvx*9;py+=vy*9;if(px<10||px>s.W-10)dvx*=-1;for(const n of s.nodes){if(n.alive&&n!==c.node&&n.y<c.node.y-40&&Math.hypot(n.x-px,n.y-py)<n.r+s.catchR*0.6)return {go:1,fps:window.__game.loop.actualFps};}}
  return {fps:window.__game.loop.actualFps};});
  if(st.over)return {over:true,fps};if(st.fps)fps.push(st.fps);if(st.go)await tap(195,500);
  if(shotAt&&!shot&&Date.now()-t0>shotAt*1000){const g=await p.evaluate(()=>{const s=window.__game.scene.getScene('Game');if(!s.gGlow||!s.gGlow.visible)return null;const cam=s.cameras.main;return {gx:s.gGlow.x-cam.scrollX,gy:s.gGlow.y-cam.scrollY,cx:s.c.x,cy:s.c.y-cam.scrollY,lab:s.gLab.alpha,objs:s.children.list.length}});
   if(g){shot=true;await p.screenshot({path:`shots/${tag}.png`});console.log('ghost',JSON.stringify(g));}}
  await p.waitForTimeout(25);}
 return {over:false,fps};}
const G=()=>p.evaluate(()=>{const g=JSON.parse(localStorage.getItem('orbitune_ghost')||'null');return g&&{n:g.n&&{h:g.n.h,len:g.n.p.length},d:g.d&&{h:g.d.h,len:g.d.p.length}}});
// run 1: no ghost yet
await start({start:0});await p.waitForTimeout(400);
console.log('run1 gk',await p.evaluate(()=>window.__game.scene.getScene('Game').gk));
let r=await play(30);if(!r.over)await p.evaluate(()=>window.__game.scene.getScene('Game').end('test'));await p.waitForTimeout(600);
console.log('after run1',JSON.stringify(await G()));
// run 2: ghost visible
await start({start:0});await p.waitForTimeout(400);
const o0=await p.evaluate(()=>window.__game.scene.getScene('Game').children.list.length);
console.log('run2 gk',await p.evaluate(()=>window.__game.scene.getScene('Game').gk),'objs0',o0);
for(const at of [3,7,12]){r=await play(at+1,{shotAt:at,tag:'v4-ghost-run2-'+at+'s'});if(r.over)break;}
console.log('fps run2',(r.fps.reduce((a,b)=>a+b,0)/Math.max(1,r.fps.length)).toFixed(1));
await p.evaluate(()=>{const s=window.__game.scene.getScene('Game');if(!s.over)s.end('test')});await p.waitForTimeout(600);
// daily: record then replay
await start({daily:true});await p.waitForTimeout(400);r=await play(15);if(!r.over)await p.evaluate(()=>window.__game.scene.getScene('Game').end('test'));await p.waitForTimeout(600);
console.log('after daily',JSON.stringify(await G()));
await start({daily:true});await p.waitForTimeout(400);console.log('daily gk',await p.evaluate(()=>window.__game.scene.getScene('Game').gk));
await play(5,{shotAt:3,tag:'v4-ghost-daily'});await p.evaluate(()=>{const s=window.__game.scene.getScene('Game');if(!s.over)s.end('test')});await p.waitForTimeout(500);
// tutorial run: no ghost
await p.evaluate(()=>{const d=window.__game.registry.get('save').d;d.tut=false});await start({start:0});await p.waitForTimeout(400);
console.log('tut gk',await p.evaluate(()=>window.__game.scene.getScene('Game').gk));await p.evaluate(()=>{const s=window.__game.scene.getScene('Game');s.registry.get('save').d.tut=true;s.end('test')});await p.waitForTimeout(500);
// corrupt saves
for(const bad of ['{{{','"x"','null','{"v":1,"n":{"h":"x","p":[1,2]}}','{"v":1,"n":{"h":900,"p":[1,2,"a",4,5,6,7,8,9,10,11]}}','{"v":0,"n":{"h":900,"p":[]}}','{"v":1,"d":{"date":5,"p":[1]}}','[1,2,3]']){
 await p.evaluate((v)=>localStorage.setItem('orbitune_ghost',v),bad);await start({start:0});await p.waitForTimeout(300);
 const gk=await p.evaluate(()=>window.__game.scene.getScene('Game').gk);await p.evaluate(()=>window.__game.scene.getScene('Game').end('test'));await p.waitForTimeout(300);console.log('corrupt',bad,'gk',gk);}
console.log('errs',errs);await b.close();
