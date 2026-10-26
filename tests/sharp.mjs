import {chromium} from 'playwright';
const tag=process.argv[2]||'x';const base=process.argv[3]||'http://localhost:8123/index.html';
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const errs=[];
const CF=process.env.CF?JSON.parse(process.env.CF):null;for(const [w,h,dpr] of CF||[[412,915,2.625],[412,915,3],[360,640,1],[390,844,2],[412,915,1],[360,640,3]]){
 const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:dpr,hasTouch:true,isMobile:true});const p=await ctx.newPage();
 p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.addInitScript(()=>localStorage.setItem('orbitune_v1',JSON.stringify({dust:1234,best:18420,bestSector:4,tut:true,xp:300,streak:3,lastDay:new Date().toISOString().slice(0,10),mDone:5})));
 await p.goto(base);await p.waitForTimeout(+(process.env.WT||1800));const f=`shots/${tag}-menu-${w}x${h}@${dpr}.png`;await p.screenshot({path:f});
 const info=await p.evaluate(()=>{const c=document.querySelector('canvas');return {bw:c.width,bh:c.height,cw:c.clientWidth}});console.log(f,JSON.stringify(info));await ctx.close();}
console.log(errs);await b.close();
