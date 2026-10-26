import {chromium} from 'playwright';
const secs=+process.argv[2]||40, tag=process.argv[3]||'t';
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});
const p=await ctx.newPage();const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push(e.message));
if(process.env.TUT)await p.addInitScript(()=>{if(!localStorage.getItem('orbitune_v1'))localStorage.setItem('orbitune_v1',JSON.stringify({tut:true}))});
await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(1500);
await p.screenshot({path:`shots/${tag}-menu.png`});
// canvas mapping
const box=await p.evaluate(()=>{const r=document.querySelector('canvas').getBoundingClientRect();const g=window.__game;return {x:r.x,y:r.y,s:r.width/window.ORB.LW,h:window.ORB.LH}});
const tap=async(x,y)=>p.touchscreen.tap(box.x+x*box.s,box.y+y*box.s);
await tap(195,box.h*0.62);await p.waitForTimeout(800);
let log=[],runs=0,shot=0,t0=Date.now(),fpsS=[];
while(Date.now()-t0<secs*1000){
 const st=await p.evaluate(()=>{const s=window.__game.scene.getScene('Game');if(!s||!s.sys.isActive())return {none:1};if(s.over)return {over:1,score:s.R.score,t:s.R.time.toFixed(0),sec:s.sector,why:s.why};
  const c=s.c;if(c.state!=='orbit')return {fly:1};const vx=-Math.sin(c.ang)*c.dir,vy=Math.cos(c.ang)*c.dir;let px=c.x,py=c.y,dvx=vx;
  for(let k=0;k<60;k++){px+=dvx*9;py+=vy*9;if(px<10||px>s.W-10)dvx*=-1;for(const n of s.nodes){if(n.alive&&n!==c.node&&n.y<c.node.y-40&&Math.hypot(n.x-px,n.y-py)<n.r+s.catchR*0.6)return {go:1,fps:window.__game.loop.actualFps};}}
  return {wait:1,fps:window.__game.loop.actualFps};});
 if(st.fps)fpsS.push(st.fps);
 if(st.go){const sk=+(process.env.SKILL||1);if(Math.random()<sk){await p.waitForTimeout(Math.random()*140*(2-sk));await tap(195,500);}else if(Math.random()<0.1)await tap(195,500);}
 if(st.over){runs++;log.push([st.score,st.t,st.sec,st.why]);await p.waitForTimeout(2200);await p.screenshot({path:`shots/${tag}-over${runs}.png`});await tap(195,await p.evaluate(()=>{const s=window.__game.scene.getScene('Game');return 0}) || 0);
  // press AGAIN: find button
  const y=await p.evaluate(()=>{const s=window.__game.scene.getScene('Game');const ph=380;return s.H*0.46+ph/2-70});
  await p.evaluate(()=>{const s=window.__game.scene.getScene('Game');s.scene.restart({start:0})});await p.waitForTimeout(500);}
 if(Date.now()-t0>shot*9000+4000&&shot<4){shot++;await p.screenshot({path:`shots/${tag}-play${shot}.png`});}
 await p.waitForTimeout(25);
}
const info=await p.evaluate(()=>{const s=window.__game.scene.getScene('Game');return s&&s.R?{score:s.R.score,sector:s.sector,lat:s.R.latches,nodes:s.nodes.length,objs:s.children.list.length}:null});
console.log(JSON.stringify({log,runs,info,fpsAvg:(fpsS.reduce((a,b)=>a+b,0)/fpsS.length).toFixed(1),fpsMin:Math.min(...fpsS).toFixed(1),errs:errs.slice(0,5)}));
await b.close();
