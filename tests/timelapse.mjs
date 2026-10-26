import {chromium} from 'playwright';
const tag=process.argv[2]||'tl';const base=process.argv[3]||'http://localhost:8123/index.html';
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const errs=[];
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,hasTouch:true,isMobile:true});const p=await ctx.newPage();
p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.addInitScript(()=>localStorage.setItem('orbitune_v1',JSON.stringify({dust:1234,best:18420,bestSector:4,tut:true,xp:300,streak:3,lastDay:new Date(Date.now()-864e5).toISOString().slice(0,10),mDone:5})));
await p.goto(base);const t0=Date.now();const out=[];
for(let i=0;i<40;i++){const t=Date.now()-t0;
 const s=await p.evaluate(()=>{const g=window.__game;if(!g)return null;const f=g.textures.get('prism').get();const m=g.scene.getScene('Menu');
  const pr=m&&m.children?m.children.list.filter(o=>o.texture&&o.texture.key==='prism').map(o=>+o.displayWidth.toFixed(1)):[];
  return {fw:f.width,cw:f.cutWidth,u1:f.u1,pr:pr.slice(0,2),n:m&&m.children?m.children.list.length:0,cam:m&&m.cameras.main?m.cameras.main.zoom:0}});
 out.push([t,JSON.stringify(s)]);await p.screenshot({path:`shots/${tag}-${String(i).padStart(2,'0')}.png`});await p.waitForTimeout(Math.max(0,250*(i+1)-(Date.now()-t0)));}
out.forEach(o=>console.log(o.join(' ')));console.log('errs',errs);await b.close();
