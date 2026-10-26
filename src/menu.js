import {shake,setFX,FX} from './fx.js?v=7';
import {R,LW,LH,TS,setupCam} from './dims.js?v=7';
import {C,txt,button,panel,muteBtn,background,vignette,hex} from './ui.js?v=7';
import {Sfx} from './audio.js?v=7';
import {RANKS,rankOf,rankNext} from './game.js?v=7';
import {LEVELS} from './levels.js?v=7';
import {SKINS,UPGRADES,upCost,ensureMissions} from './save.js?v=7';
const today=()=>new Date().toISOString().slice(0,10);
export class Menu extends Phaser.Scene{constructor(){super('Menu')}
 create(data){setupCam(this);const W=LW,H=LH,S=this.registry.get('save'),d=S.d;ensureMissions(d);const quick=data&&data.quick;this.mode=d.mode==='sector'?'sector':'endless';setFX(d);if(!d.bestSR)d.bestSR={score:0,sector:0,stars:{}};
  // daily streak bookkeeping
  const td=today(),yd=new Date(Date.now()-864e5).toISOString().slice(0,10);let bonus=0;
  if(d.lastDay!==td){d.streak=d.lastDay===yd?(d.streak||0)+1:1;d.lastDay=td;bonus=Math.min(7,d.streak)*25;d.dust+=bonus;}S.save();
  this.bg=background(this);
  // ---- vertical layout, anchored from bottom so it fits 640..900 tall ----
  const PAD=16,panH=Math.min(150,Math.max(126,H*0.17)),panY=H-PAD-panH/2,panTop=panY-panH/2;
  const rowY=panTop-20-29,playY=rowY-29-18-38,modeY=playY-38-14-27,infoY=modeY-27-21,titleY=infoY-64;
  const heroTop=104,heroBot=titleY-44,k=Phaser.Math.Clamp((heroBot-heroTop)/250,0.5,1.05),cx=W/2,cy=(heroTop+heroBot)/2;
  // hero: orbit demo
  const halo=this.add.image(cx,cy,'glow').setTint(C.vio).setBlendMode('ADD').setScale(3.4*k).setAlpha(0.4);
  this.tweens.add({targets:halo,alpha:0.6,scale:3.7*k,duration:2600,yoyo:true,repeat:-1,ease:'Sine.inOut'});
  const ring=this.add.image(cx,cy,'dash').setTint(C.cyan).setAlpha(0.28).setScale(1.75*k,0.75*k);this.tweens.add({targets:ring,rotation:Math.PI*2,duration:60000,repeat:-1});
  this.add.image(cx,cy,'glow').setTint(C.cyan).setBlendMode('ADD').setScale(1.5*k).setAlpha(0.5);
  const star=this.add.image(cx,cy,'node').setTint(C.cyan).setScale(0.9*k);this.tweens.add({targets:star,scale:0.96*k,yoyo:true,repeat:-1,duration:1500,ease:'Sine.inOut'});
  // small satellite stars (midground depth)
  [[-0.36,-0.7,C.mag,0.28],[0.38,0.55,C.vio,0.22],[0.42,-0.9,C.cyan,0.16]].forEach(([fx,fy,col,sc],i)=>{const x=cx+fx*W,y=cy+fy*110*k;
   this.add.image(x,y,'glow').setTint(col).setBlendMode('ADD').setScale(sc*2.6).setAlpha(0.5);const n=this.add.image(x,y,'node').setTint(col).setScale(sc);
   this.tweens.add({targets:n,y:y-6,duration:2200+i*500,yoyo:true,repeat:-1,ease:'Sine.inOut'});});
  const skin=SKINS.find(s=>s.id===d.skin)||SKINS[0];
  this.demo={a:0,cx,cy,rx:108*k,ry:46*k,trail:[],skin,star};this.trailG=this.add.graphics().setBlendMode('ADD');
  this.cg=this.add.image(0,0,'glow').setTint(skin.dark?C.mag:skin.a).setBlendMode('ADD').setScale(0.75);this.cc=this.add.image(0,0,'dot').setScale(0.7);
  // title
  const title=txt(this,W/2,titleY,'ORBITUNE',48,C.text,{glow:C.mag,blur:22,spacing:8});
  const sub=txt(this,W/2,titleY+33,'every catch is a note',14,C.dim,{weight:'600',spacing:3});
  if(!quick){title.setScale(0.7).setAlpha(0);}this.tweens.add({targets:title,scale:1,alpha:1,duration:700,ease:'Back.out'});
  this.tweens.add({targets:title,alpha:0.88,duration:1800,yoyo:true,repeat:-1,delay:800,ease:'Sine.inOut'});
  // ---- top bar: dust pill (reward=gold) | rank | mute ----
  const tb=this.add.graphics();const pill=(x,y,w,h,col)=>{tb.fillStyle(C.ink,0.75);tb.fillRoundedRect(x,y,w,h,h/2);tb.lineStyle(1.5,col,0.8);tb.strokeRoundedRect(x,y,w,h,h/2);};
  const dw=Math.max(84,30+String(d.dust.toLocaleString()).length*12);pill(PAD,20,dw,32,C.gold);
  this.add.image(PAD+18,36,'prism').setTint(C.gold).setScale(0.2);this.dustT=txt(this,PAD+32,36,d.dust.toLocaleString(),17,C.gold,{ox:0});
  muteBtn(this,W-PAD-20,36);button(this,W-PAD-66,36,36,36,'?',C.cyan,()=>this.howTo(),{size:17,spacing:0});
  const r=rankOf(d.xp||0),xp=d.xp||0,lo=r?rankNext(r-1):0,hi=rankNext(r),rx=W/2+(dw-48)/2+4;
  txt(this,rx,30,'RANK '+(r+1),10,C.dim,{spacing:2});txt(this,rx,45,RANKS[r].toUpperCase(),13,C.cyan,{spacing:1.5});
  const rg=this.add.graphics();rg.fillStyle(C.ink,1);rg.fillRoundedRect(rx-60,56,120,4,2);rg.fillStyle(C.cyan,1);rg.fillRoundedRect(rx-60,56,Math.max(4,120*Phaser.Math.Clamp((xp-lo)/(hi-lo),0,1)),4,2);
  // chips row: best · streak
  const chips=[];const sm=this.mode==='sector';const lv=d.lv,cl=Object.keys(lv.st).length,stt=Object.values(lv.st).reduce((a,b)=>a+b,0);
  if(sm){chips.push(['LEVELS '+cl+'/'+LEVELS.length,C.vio]);chips.push(['★ '+stt+'/'+LEVELS.length*3,C.gold]);}
  else{if(d.best>0)chips.push(['BEST '+d.best.toLocaleString(),C.cyan]);if((d.bestH||0)>0)chips.push(['HEIGHT '+Math.round(d.bestH/10)+' m',C.cyan]);}
  if(d.streak>1&&chips.length<2)chips.push(['DAY '+d.streak+' STREAK',C.mag]);
  const cw=Math.min(150,(W-32-10*(chips.length-1))/Math.max(1,chips.length));chips.forEach(([t,col],i)=>{const x=W/2+(i-(chips.length-1)/2)*(cw+10);pill(x-cw/2,74,cw,24,col);txt(this,x,86,t,11,col,{spacing:1.5});});
  // ---- mode switch (segmented) + info line ----
  this.next=Math.min(lv.u-1,LEVELS.findIndex((L,i)=>!lv.st[i])<0?lv.u-1:LEVELS.findIndex((L,i)=>!lv.st[i]));
  const cwd=(W-2*PAD-10)/2,chh=54,cards=[['sector','SECTORS','levels',C.vio,PAD+cwd/2],['endless','ENDLESS','how far',C.cyan,W-PAD-cwd/2]];
  cards.forEach(([id,lab,sub,col,x])=>{const on=this.mode===id,g=this.add.graphics();g.fillStyle(on?col:C.ink,on?0.26:0.7);g.fillRoundedRect(x-cwd/2,modeY-chh/2,cwd,chh,16);g.lineStyle(on?2:1.5,col,on?1:0.35);g.strokeRoundedRect(x-cwd/2,modeY-chh/2,cwd,chh,16);
   const ix=x-cwd/2+24,a=on?1:0.5;
   if(id==='sector'){for(let k=0;k<3;k++){g.fillStyle(col,a*(k<2?1:0.35));g.fillRoundedRect(ix-12+k*9,modeY+8-k*8,7,7,2);}}
   else{g.lineStyle(2,col,a);g.lineBetween(ix,modeY+12,ix,modeY-11);g.lineBetween(ix-7,modeY-4,ix,modeY-11);g.lineBetween(ix+7,modeY-4,ix,modeY-11);g.fillStyle(C.gold,a);g.fillCircle(ix,modeY+13,2.5);}
   txt(this,ix+20,modeY-8,lab,15,on?C.text:C.dim,{ox:0,spacing:3,weight:'700'});txt(this,ix+20,modeY+11,sub,11,on?col:C.dim,{ox:0,spacing:2,weight:'600'});
   if(on){g.fillStyle(col,1);g.fillCircle(x+cwd/2-16,modeY,4);}
   const hz=this.add.zone(x,modeY,cwd,chh).setInteractive();hz.on('pointerup',()=>{if(this.mode===id)return;Sfx.init();Sfx.click();d.mode=id;S.save();this.scene.restart({quick:true});});});
  if(this.mode==='sector'){const L=LEVELS[this.next];button(this,W/2,infoY,Math.min(300,W-2*PAD),30,'▦  LEVEL SELECT   ·   next: '+(this.next+1)+' '+L.n,C.vio,()=>{Sfx.init();this.scene.start('Levels');},{size:12,spacing:1});}
  else txt(this,W/2,infoY,!d.tut?'release to launch  ·  hold to aim':'always from sector 1  ·  race your ghost',12,C.dim,{weight:'600',spacing:2});
  // ---- PLAY hero ----
  const play=button(this,W/2,playY,264,76,'PLAY',this.mode==='sector'?C.vio:C.cyan,()=>this.go({}),{size:32,solid:true,breathe:true,spacing:10,sub:this.mode==='sector'?'LEVEL '+(this.next+1)+' · '+LEVELS[this.next].n:'endless climb'});
  if(!quick){play.setScale(0.8).setAlpha(0);this.tweens.add({targets:play,scale:1,alpha:1,duration:500,delay:200,ease:'Back.out'});}
  this.tweens.add({targets:play.label,scale:1.04,duration:900,yoyo:true,repeat:-1,ease:'Sine.inOut'});
  // ---- secondary row ----
  const dd=d.daily.date===td,bw=(W-2*PAD-12)/2;
  button(this,PAD+bw/2,rowY,bw,58,'DAILY',C.mag,()=>this.go({daily:true}),{size:17,spacing:3,sub:dd?'today best '+d.daily.best.toLocaleString():'new sky today'});
  button(this,W-PAD-bw/2,rowY,bw,58,'HANGAR',C.vio,()=>this.scene.start('Hangar'),{size:17,spacing:3,sub:'upgrades · trails'});
  // ---- missions panel ----
  panel(this,W/2,panY,W-2*PAD,panH,C.vio,0.72);
  txt(this,PAD+16,panTop+18,'CONSTELLATION ORDERS',11,C.vio,{ox:0,spacing:2});
  txt(this,W-PAD-16,panTop+18,(d.mDone||0)+' done',11,C.dim,{ox:1,spacing:1});
  const rowH=(panH-36)/3;
  d.missions.forEach((m,i)=>{const y=panTop+36+rowH*(i+0.5);const g=this.add.graphics();g.lineStyle(1.5,C.cyan,0.8);g.strokeCircle(PAD+22,y,5);
   txt(this,PAD+36,y,m.text,13,C.text,{ox:0,weight:'600'});
   this.add.image(W-PAD-62,y,'prism').setTint(C.gold).setScale(0.13);txt(this,W-PAD-16,y,'+'+m.reward,13,C.gold,{ox:1});
   if(i<2){g.lineStyle(1,C.vio,0.2);g.lineBetween(PAD+16,y+rowH/2,W-PAD-16,y+rowH/2);}});
  vignette(this);Sfx.intensity=0;
  if(bonus){this.time.delayedCall(600,()=>{const t=txt(this,W/2,heroBot-6,'DAY '+d.streak+' STREAK  +'+bonus,16,C.gold,{glow:true}).setDepth(999);t.setScale(0);
   this.tweens.add({targets:t,scale:1,duration:400,ease:'Back.out'});this.tweens.add({targets:t,y:t.y-20,alpha:0,delay:2400,duration:600});Sfx.gold();});}
  this.input.once('pointerdown',()=>Sfx.init());
  if(!quick)this.cameras.main.fadeIn(250,11,10,31);
 }
 go(o){Sfx.init();this.cameras.main.fadeOut(220,11,10,31);this.time.delayedCall(230,()=>this.scene.start('Game',o.daily||this.mode!=='sector'?{...o,mode:'endless'}:{mode:'sector',level:this.next}));}
 howTo(){if(this.howO)return;Sfx.click();const W=LW,H=LH,O=[];const z=o=>{o.setDepth(2000);O.push(o);return o;};this.howO=O;
  z(this.add.rectangle(W/2,H/2,W,H,C.void,0.85).setInteractive());const ph=Math.min(H-40,600),top=(H-ph)/2;z(panel(this,W/2,H/2,W-28,ph,C.cyan,0.95));
  z(txt(this,W/2,top+30,'HOW IT WORKS',20,C.text,{glow:C.cyan,blur:10,spacing:5}));
  const rows=[['perfect','PERFECT','catch close to a star’s rim · +25 & more fuel'],['bank','BANKSHOT','1 wall bounce per flight · catch after it: +60 & fuel · a 2nd wall = lost'],
   ['shield','SHIELDS','gold pips around you · a shard hit or missed flight breaks one · at 0 the next ends the run'],['haz','HAZARDS','red shards slide across lanes · black holes bend your flight'],
   ['charged','CHARGED STAR','catch tight for ×3 · leave before its ring closes or it collapses'],['modes','MODES','SECTORS: levels · 18 stars unlock the next · ENDLESS: from sector 1, how far?']];
  const rh=(ph-172)/rows.length;rows.forEach(([ic,h,b],i)=>{const y=top+64+rh*(i+0.5),x=46,g=z(this.add.graphics());
   if(ic==='perfect'){g.lineStyle(2,C.cyan,1);g.strokeCircle(x,y,10);g.lineStyle(2,C.gold,1);g.strokeCircle(x,y,16);g.fillStyle(C.gold,1);g.fillCircle(x+16,y,3);}
   if(ic==='bank'){g.lineStyle(3,C.cyan,0.8);g.lineBetween(x-16,y-16,x-16,y+16);g.lineStyle(1.5,C.text,0.9);g.lineBetween(x+12,y+14,x-15,y);g.lineBetween(x-15,y,x+12,y-14);g.fillStyle(C.cyan,1);g.fillCircle(x+12,y-14,3);}
   if(ic==='shield'){g.fillStyle(C.text,1);g.fillCircle(x,y,4);[0,2.1,4.2].forEach(a=>{g.fillStyle(C.gold,1);g.fillCircle(x+Math.cos(a)*13,y+Math.sin(a)*13,3);});}
   if(ic==='haz'){z(this.add.image(x-6,y,'shard').setTint(C.danger).setScale(0.4));g.fillStyle(0x000000,1);g.fillCircle(x+12,y+6,6);g.lineStyle(1.5,C.mag,1);g.strokeCircle(x+12,y+6,8);}
   if(ic==='charged'){z(this.add.image(x,y,'node').setTint(0xE6DCFF).setScale(0.22));g.lineStyle(2.5,0xE6DCFF,1);g.beginPath();g.arc(x,y,16,-Math.PI/2,Math.PI*0.9);g.strokePath();}
   if(ic==='modes'){g.lineStyle(1.5,C.cyan,1);g.strokeRoundedRect(x-18,y-9,17,18,6);g.lineStyle(1.5,C.mag,1);g.strokeRoundedRect(x+1,y-9,17,18,6);}
   z(txt(this,80,y-rh*0.22,h,12,ic==='shield'||ic==='perfect'?C.gold:ic==='haz'?C.danger:C.cyan,{ox:0,spacing:2,weight:'700'}));
   z(this.add.text(80,y-rh*0.22+10,b,{fontFamily:'"Segoe UI",Roboto,system-ui,sans-serif',fontSize:'11.5px',fontStyle:'600',color:hex(C.text),wordWrap:{width:W-110},lineSpacing:2,resolution:Math.max(2,R*1.25)}));});
  const S=this.registry.get('save'),d=S.d,tw=(W-28-40)/2;const tg=(x,lab,on,f)=>{const b=z(button(this,x,top+ph-86,tw,34,lab+(on?'  ON':'  OFF'),on?C.cyan:C.dim,f,{size:12,spacing:2}));return b;};
  tg(W/2-tw/2-6,'REDUCED FX',!!d.fxr,()=>{d.fxr=!d.fxr;S.save();setFX(d);O.forEach(o=>o.destroy());this.howO=null;this.howTo();});
  tg(W/2+tw/2+6,'VIBRATION',d.vib!==false,()=>{d.vib=d.vib===false;S.save();setFX(d);O.forEach(o=>o.destroy());this.howO=null;this.howTo();});
  z(button(this,W/2,top+ph-34,180,46,'GOT IT',C.cyan,()=>{O.forEach(o=>o.destroy());this.howO=null;},{size:16,spacing:3,solid:true}));}
 update(t,dt){const D=this.demo;D.a+=dt*0.0024;const x=D.cx+Math.cos(D.a)*D.rx,y=D.cy+Math.sin(D.a)*D.ry;this.cg.setPosition(x,y);this.cc.setPosition(x,y);
  const behind=Math.sin(D.a)<0;this.cc.setDepth(behind?0:2);this.cg.setDepth(behind?0:2);D.star.setDepth(1);this.trailG.setDepth(behind?0:2);
  D.trail.push(x,y);if(D.trail.length>48)D.trail.splice(0,2);const g=this.trailG;g.clear();const n=D.trail.length/2;
  for(let i=1;i<n;i++){const k=i/n;g.lineStyle(9*k,k>0.5?D.skin.a:D.skin.b,0.7*k);g.lineBetween(D.trail[i*2-2],D.trail[i*2-1],D.trail[i*2],D.trail[i*2+1]);}
  this.bg.update(t*0.03,t);}
}
export {Levels} from './levelsel.js?v=7';
export class Hangar extends Phaser.Scene{constructor(){super('Hangar')}
 create(){setupCam(this);const W=LW,H=LH,S=this.registry.get('save'),d=S.d;
  this.bg=background(this,0xFFB0F0);
  txt(this,W/2,44,'HANGAR',30,C.text,{glow:C.mag,spacing:6});
  this.add.image(30,86,'prism').setTint(C.gold).setScale(0.22);const dust=txt(this,48,86,d.dust.toLocaleString(),20,C.gold,{ox:0});
  const refresh=()=>{this.scene.restart();};
  txt(this,24,122,'UPGRADES',12,C.vio,{ox:0,spacing:2});
  UPGRADES.forEach((u,i)=>{const y=160+i*66,l=d.up[u.id],max=l>=u.max,cost=upCost(u.id,l);
   panel(this,W/2,y,W-32,58,C.vio,0.6);txt(this,30,y-10,u.name,17,C.text,{ox:0});txt(this,30,y+12,u.desc,12,C.dim,{ox:0,weight:'600'});
   for(let k=0;k<u.max;k++){const g=this.add.graphics();g.fillStyle(k<l?C.cyan:C.ink,1);g.lineStyle(1.5,C.cyan,0.8);g.fillCircle(170+k*14,y+12,4.5);g.strokeCircle(170+k*14,y+12,4.5);}
   button(this,W-70,y,96,40,max?'MAX':cost+'',max?C.dim:(d.dust>=cost?C.gold:C.dim),()=>{if(max||d.dust<cost){shake(this.cameras.main,120,0.004);return;}d.dust-=cost;d.up[u.id]++;S.save();Sfx.buy();refresh();},{size:16});});
  const sy=160+4*66+8;txt(this,24,sy,'COMET TRAILS',12,C.vio,{ox:0,spacing:2});
  SKINS.forEach((sk,i)=>{const col=i%3,row=Math.floor(i/3),x=W/2+(col-1)*((W-40)/3),y=sy+66+row*104;const own=d.skins.includes(sk.id),eq=d.skin===sk.id;
   const b=button(this,x,y,(W-56)/3,92,'',eq?C.gold:(own?C.vio:C.dim),()=>{if(own){d.skin=sk.id;S.save();Sfx.click();refresh();}else if(d.dust>=sk.cost){d.dust-=sk.cost;d.skins.push(sk.id);d.skin=sk.id;S.save();Sfx.buy();refresh();}else shake(this.cameras.main,120,0.004);},{size:1});
   const g=this.add.graphics().setBlendMode('ADD');for(let k=0;k<12;k++){const f=k/12;g.lineStyle(2+7*f,f>0.5?sk.a:sk.b,0.2+0.7*f);g.lineBetween(x-34+k*5,y-14+Math.sin(k*0.5)*6,x-29+k*5,y-14+Math.sin((k+1)*0.5)*6);}
   this.add.image(x+28,y-14,'glow').setTint(sk.a).setBlendMode('ADD').setScale(0.4);this.add.image(x+28,y-14,'dot').setScale(0.55);
   txt(this,x,y+14,sk.name,13,C.text);txt(this,x,y+32,eq?'EQUIPPED':own?'tap to equip':sk.cost+' dust',11,eq?C.gold:own?C.vio:(d.dust>=sk.cost?C.gold:C.dim),{weight:'600'});});
  button(this,W/2,H-46,200,54,'BACK',C.cyan,()=>this.scene.start('Menu'),{size:20});
  vignette(this);}
 update(t){this.bg.update(t*0.02,t);}
}
