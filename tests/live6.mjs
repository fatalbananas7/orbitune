import {chromium} from 'playwright';
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const p=await (await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto('https://fatalbananas7.github.io/orbitune/');await p.waitForTimeout(3000);
await p.evaluate(()=>{const g=window.__game;g.scene.getScenes(true).forEach(s=>s.scene.stop());g.scene.start('Game',{mode:'sector',level:0})});await p.waitForTimeout(4000);
console.log(await p.evaluate(()=>{const s=window.__game.scene.getScene('Game');return [s.mode,s.level,typeof window.__FX,s.sys.isActive()]}),errs);await p.screenshot({path:'/tmp/live6.png'});await b.close();
