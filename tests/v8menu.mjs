import {chromium} from 'playwright';
const tag=process.argv[2]||'v8';const VPS=JSON.parse(process.env.VPS||'[[473,800,2.25],[473,800,3],[360,640,3],[390,844,3],[412,915,2.625],[360,560,3]]');
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const errs=[];
const seed={tut:true,dust:1380,best:18420,bestH:5230,xp:700,lvMig:1,mode:'sector',mDone:8,streak:3,lastDay:new Date().toISOString().slice(0,10),lv:{u:1,st:{},b:{}}};
for(const [w,h,dpr] of VPS){
 const p=await (await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:dpr,hasTouch:true,isMobile:true})).newPage();
 p.on('pageerror',e=>errs.push(e.stack));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
 await p.addInitScript(s=>{localStorage.setItem('orbitune_v1',JSON.stringify(s))},seed);
 await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(2500);
 await p.screenshot({path:`shots/${tag}-menu-sectors-${w}x${h}@${dpr}.png`});
 await p.evaluate(()=>{const g=window.__game;g.registry.get('save').d.mode='endless';g.scene.getScene('Menu').scene.restart({quick:true})});await p.waitForTimeout(1200);
 await p.screenshot({path:`shots/${tag}-menu-endless-${w}x${h}@${dpr}.png`});
 if(process.env.OV){const r=await p.evaluate(()=>{const m=window.__game.scene.getScene('Menu');const L=window.ORB.LH;const bad=[];const B=m.children.list.filter(o=>o.visible&&o.type==='Text'&&o.alpha>0).map(o=>{const b=o.getBounds();return {t:o.text,x:b.x+o.padding.left,y:b.y+o.padding.top,w:b.width-o.padding.left-o.padding.right,h:b.height-o.padding.top-o.padding.bottom}});
   for(let i=0;i<B.length;i++){const a=B[i];if(a.y<0||a.y+a.h>L||a.x<0||a.x+a.w>390)bad.push('clip:'+a.t);for(let j=i+1;j<B.length;j++){const c=B[j];if(a.x<c.x+c.w&&c.x<a.x+a.w&&a.y<c.y+c.h&&c.y<a.y+a.h)bad.push(a.t+' X '+c.t);}}return {LH:L,bad}});console.log(w,h,JSON.stringify(r));}
 await p.context().close();}
console.log('errs',errs);await b.close();
