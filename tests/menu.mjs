import {chromium} from 'playwright';
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const tag=process.argv[2]||'m';const errs=[];
for(const [w,h,save] of [[360,640,0],[390,844,1],[412,915,1],[360,740,0]]){const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2,hasTouch:true,isMobile:true});
 const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 if(save)await p.addInitScript(()=>localStorage.setItem('orbitune_v1',JSON.stringify({dust:1234,best:18420,bestSector:4,tut:true,xp:300,streak:3,lastDay:new Date().toISOString().slice(0,10),mDone:5})));
 await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(1800);await p.screenshot({path:`shots/${tag}-${w}x${h}.png`});await ctx.close();}
console.log(errs);await b.close();
