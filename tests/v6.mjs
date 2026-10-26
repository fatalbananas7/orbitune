import {chromium} from 'playwright';
const secs=+process.argv[2]||150,mode=process.argv[3]||'sector',skill=+(process.argv[4]||0.9),tag=process.argv[5]||'v6';
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:+(process.env.VW||390),height:+(process.env.VH||844)},deviceScaleFactor:+(process.env.DPR||2),hasTouch:true,isMobile:true});
const p=await ctx.newPage();const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push(e.stack));
await p.addInitScript(()=>{if(!localStorage.getItem('orbitune_v1'))localStorage.setItem('orbitune_v1',JSON.stringify({tut:true,assist:0,dust:50,best:900,bestSector:3}))});
await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(1500);
const box=await p.evaluate(()=>{const r=document.querySelector('canvas').getBoundingClientRect();return {x:r.x,y:r.y,s:r.width/window.ORB.LW,H:window.ORB.LH}});
const tap=(x,y)=>p.touchscreen.tap(box.x+x*box.s,box.y+y*box.s);const shot=n=>p.screenshot({path:`shots/${tag}-${n}.png`});
if(process.env.MENU){ // mode toggle + how-to
 await tap(195+65,await p.evaluate(()=>{const m=window.__game.scene.getScene('Menu');return m.children.list.find(o=>o.type==='Text'&&o.text==='SECTORS').y}));await p.waitForTimeout(900);await shot('menu-sectors');
 await tap(390-16-66,36);await p.waitForTimeout(600);await shot('howto');await tap(195,await p.evaluate(()=>{const m=window.__game.scene.getScene('Menu');return m.children.list.filter(o=>o.list&&o.list.some(c=>c.text==='GOT IT'))[0].y}));await p.waitForTimeout(400);
 console.log('menu mode',await p.evaluate(()=>window.__game.registry.get('save').d.mode),'howO',await p.evaluate(()=>!!window.__game.scene.getScene('Menu').howO));}
const start=(o)=>p.evaluate((o)=>{const g=window.__game;g.scene.getScenes(true).forEach(s=>s.scene.key!=='Game'&&s.scene.stop());g.scene.start('Game',o)},o);
await start({mode,start:0});await p.waitForTimeout(500);
const got={};const once=async(k,cond)=>{if(cond&&!got[k]){got[k]=1;await shot(k);}};let prev={},choices=0,log=[],fps=[],objs=[];const t0=Date.now();
while(Date.now()-t0<secs*1000){
 const st=await p.evaluate(()=>{const s=window.__game.scene.getScene('Game');if(!s.sys.isActive()||!s.c)return {};const R=s.R,c=s.c;
  const base={over:s.over,choice:s.choice,lives:s.lives,banks:R.banks,nm:R.nm+R.gz,ml:R.ml,clears:R.clears,col:R.collapses,fly:c.state==='fly'&&c.b===0&&c.ft>0.12,fps:window.__game.loop.actualFps,o:s.children.list.length,
   chVis:s.nodes.some(n=>n.alive&&n.type==='charged'&&n.y>s.camY+120&&n.y<s.camY+s.H-120),onCh:c.state==='orbit'&&c.node.type==='charged'?c.node.orbitT:0,H:s.H};
  if(s.over||s.choice||c.state!=='orbit')return base;const vx=-Math.sin(c.ang)*c.dir,vy=Math.cos(c.ang)*c.dir;let px=c.x,py=c.y,dvx=vx,bb=0;
  for(let k=0;k<60;k++){px+=dvx*9;py+=vy*9;if((px<10||px>s.W-10)&&bb<1){dvx*=-1;bb++;}for(const n of s.nodes){if(n.alive&&n!==c.node&&n.y<c.node.y-40&&Math.hypot(n.x-px,n.y-py)<n.r+s.catchR*0.6)return {...base,go:1};}}
  return base;});
 if(process.env.ENDAT&&Date.now()-t0>process.env.ENDAT*1000&&!st.over&&!st.choice&&st.fps)await p.evaluate(()=>{const s=window.__game.scene.getScene('Game');s.lives=0;s.end('lost')});
 if(st.fps){fps.push(st.fps);objs.push(st.o);}
 if(st.lives<prev.lives){await p.waitForTimeout(120);await once('shield-break',1);}
 if(st.banks>prev.banks){await p.waitForTimeout(60);await once('bankshot-success',1);}
 if(st.nm>prev.nm)await once('nearmiss',1);
 if(st.ml>prev.ml){await p.waitForTimeout(150);await once('milestone',1);}
 if(st.clears>prev.clears&&mode==='endless'){await p.waitForTimeout(500);await once('sector-clear-endless',1);}
 if(st.fly)await once('bank-available',1);
 if(st.chVis)await once('charged',1);
 if(st.onCh>0.95)await once('charged-collapsing',1);
 if(st.col>prev.col)await once('collapse',1);
 if(st.choice){await p.waitForTimeout(700);await once('continue-overlay',1);choices++;const by=Math.min(st.H-150,st.H*0.3+170);
  if(choices===1){await tap(195,by);log.push('continue');}else{await tap(195,by+88);log.push('bank');}await p.waitForTimeout(600);}
 if(st.over){const r=await p.evaluate(()=>{const s=window.__game.scene.getScene('Game');return {why:s.why,score:s.R.score,clears:s.R.clears,stars:s.R.stars,pot:s.R.pot,kept:s.potKept,sec:s.sector+1,co:s.callout()}});log.push(r);
  await p.waitForTimeout(2800);await once('results-'+r.why,1);await once('results',1);await start({mode,start:0});await p.waitForTimeout(500);prev={};continue;}
 if(st.go&&!(st.onCh>0&&st.onCh<1.1&&process.env.HOLDCH)){if(Math.random()<skill){await p.waitForTimeout(Math.random()*150*(1.6-skill));await tap(195,500);}}
 else if(!st.go&&!st.choice&&Math.random()<(1-skill)*0.06)await tap(195,500);
 prev=st;await p.waitForTimeout(20);}
const save=await p.evaluate(()=>{const d=window.__game.registry.get('save').d;return {mode:d.mode,best:d.best,bestSR:d.bestSR,seen:d.seen,dust:d.dust}});
console.log(JSON.stringify({log,shots:Object.keys(got),save,fps:(fps.reduce((a,b)=>a+b,0)/fps.length).toFixed(1),objs:[Math.min(...objs),Math.max(...objs)],errs:errs.slice(0,5)}));await b.close();
