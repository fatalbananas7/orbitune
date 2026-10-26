import {chromium} from 'playwright';
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
const tutorial=process.argv[2]==='tut';
if(!tutorial)await p.addInitScript(()=>localStorage.setItem('orbitune_v1',JSON.stringify({tut:true,bestSector:5})));
await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(1200);
await p.evaluate((t)=>{window.__game.scene.getScene('Menu').scene.start('Game',{start:t?0:4})},tutorial);await p.waitForTimeout(800);
const S=()=>p.evaluate(()=>{const s=window.__game.scene.getScene('Game');const c=s.c;if(s.over)return{over:1};if(c.state!=='orbit')return{};const vx=-Math.sin(c.ang)*c.dir,vy=Math.cos(c.ang)*c.dir;let px=c.x,py=c.y,dvx=vx;
 for(let k=0;k<60;k++){px+=dvx*9;py+=vy*9;if(px<10||px>s.W-10)dvx*=-1;for(const n of s.nodes){if(n.alive&&n!==c.node&&n.y<c.node.y-40&&Math.hypot(n.x-px,n.y-py)<n.r+8)return{go:1,combo:s.R.combo};}}return{combo:s.R.combo}});
const tap=()=>p.touchscreen.tap(195,500);
if(tutorial){await p.screenshot({path:'shots/f-tut0.png'});
 for(let i=0;i<200;i++){const st=await S();if(st.go){await tap();break;}await p.waitForTimeout(25);}await p.waitForTimeout(1500);await p.screenshot({path:'shots/f-tut1.png'});
 const cdp=await ctx.newCDPSession(p);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:195,y:500}]});await p.waitForTimeout(1200);await p.screenshot({path:'shots/f-tut2.png'});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:280,y:500}]});await p.waitForTimeout(100);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(400);await p.screenshot({path:'shots/f-tut3.png'});
 console.log(await p.evaluate(()=>window.__game.scene.getScene('Game').tutStep),errs);await b.close();process.exit();}
let t0=Date.now(),od=false,pf=false,shots=0;
while(Date.now()-t0<40000){const st=await S();if(st.over)break;
 if(st.go){if(!od&&st.combo>=3){await p.evaluate(()=>{window.__game.scene.getScene('Game').R.combo=11});}
  const before=await p.evaluate(()=>window.__game.scene.getScene('Game').R.perfects);await tap();
  for(let k=0;k<30;k++){await p.waitForTimeout(30);const r=await p.evaluate(()=>{const s=window.__game.scene.getScene('Game');return {o:s.overdrive,p:s.R.perfects,st:s.c.state}});
   if(r.o&&!od){od=true;await p.waitForTimeout(120);await p.screenshot({path:'shots/f-overdrive.png'});break;}
   if(r.p>before&&!pf){pf=true;await p.waitForTimeout(60);await p.screenshot({path:'shots/f-perfect.png'});break;}if(r.st==='orbit')break;}}
 if(Date.now()-t0>shots*8000+6000&&shots<3){shots++;await p.screenshot({path:`shots/f-ev${shots}.png`});}
 await p.waitForTimeout(25);}
console.log({od,pf,errs});await b.close();
