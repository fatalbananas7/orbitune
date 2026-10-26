import {chromium} from 'playwright';
const b=await chromium.launch({args:['--use-gl=swiftshader']});const p=await (await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>localStorage.setItem('orbitune_v1',JSON.stringify({tut:true,fxr:true,vib:false})));
await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(1500);
await p.evaluate(()=>window.__game.scene.getScene('Menu').howTo());await p.waitForTimeout(400);await p.screenshot({path:'shots/v7-howto-reduced.png'});
await p.evaluate(()=>{const g=window.__game;g.scene.getScenes(true).forEach(s=>s.scene.stop());g.scene.start('Game',{mode:'endless'})});await p.waitForTimeout(800);
const r=await p.evaluate(()=>{const s=window.__game.scene.getScene('Game'),F=window.__FX;F.log.length=0;s.punch(1.09,520);s.setOverdrive(true);s.vib([20,30,60]);return {reduced:F.reduced,vibOn:F.vibOn,log:F.log}});
console.log(JSON.stringify(r),errs);await b.close();
