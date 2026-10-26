import {chromium} from 'playwright';
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const errs=[];
const seed={tut:true,dust:640,best:18420,bestH:5230,lvMig:1,mode:'sector',streak:3,lastDay:new Date().toISOString().slice(0,10),lv:{u:5,st:{0:3,1:2,2:3,3:1},b:{0:5210,1:6840,2:7730,3:6120}}};
for(const [w,h,dpr] of [[360,640,3],[390,844,3],[412,915,2.625]]){
 const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:dpr,hasTouch:true,isMobile:true});const p=await ctx.newPage();
 p.on('pageerror',e=>errs.push(e.stack));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
 await p.addInitScript(s=>{localStorage.setItem('orbitune_v1',JSON.stringify(s))},seed);
 await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(2500);
 await p.screenshot({path:`shots/v7-menu-sectors-${w}x${h}.png`});
 await p.evaluate(()=>{const g=window.__game;g.registry.get('save').d.mode='endless';g.scene.getScene('Menu').scene.restart({quick:true})});await p.waitForTimeout(1200);
 await p.screenshot({path:`shots/v7-menu-endless-${w}x${h}.png`});
 await p.evaluate(()=>{const g=window.__game;g.scene.getScene('Menu').scene.start('Levels')});await p.waitForTimeout(1200);
 await p.screenshot({path:`shots/v7-levels-${w}x${h}.png`});
 if(w===390){await p.evaluate(()=>{const g=window.__game;g.scene.getScene('Levels').scene.start('Menu');});await p.waitForTimeout(800);await p.evaluate(()=>window.__game.scene.getScene('Menu').howTo());await p.waitForTimeout(500);await p.screenshot({path:`shots/v7-howto.png`});}
 await ctx.close();}
console.log('errs',errs);await b.close();
