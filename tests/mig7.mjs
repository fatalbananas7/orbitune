import {chromium} from 'playwright';
const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>localStorage.setItem('orbitune_v1',JSON.stringify({tut:true,dust:300,best:12000,bestSector:5,mode:'sector',bestSR:{score:9000,sector:3,stars:{0:3,1:2}},seen:{bank:1}})));
await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(1500);
console.log(JSON.stringify(await p.evaluate(()=>{const d=window.__game.registry.get('save').d;return {lv:d.lv,mode:d.mode,best:d.best,fxr:d.fxr,vib:d.vib}})),errs);await b.close();
