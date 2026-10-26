import {chromium} from 'playwright';
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const p=await (await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(1500);
await p.evaluate(()=>{const g=window.__game;g.scene.getScenes(true).forEach(s=>s.scene.stop());g.scene.start('Game',{mode:'sector'})});
let r;for(let i=0;i<120;i++){await p.waitForTimeout(400);r=await p.evaluate(()=>{const s=window.__game.scene.getScene('Game');return {tut:!!s.tut,step:s.tutStep,lives:s.lives,seen:window.__game.registry.get('save').d.seen,nm:s.R&&s.R.nm,ch:s.nodes&&s.nodes.filter(n=>n.type==='charged').length,clears:s.R&&s.R.clears,choice:s.choice}});if(i%3==0)await p.touchscreen.tap(195,500);}
await p.screenshot({path:'shots/v6-tutorial.png'});console.log(JSON.stringify(r),errs);await b.close();
