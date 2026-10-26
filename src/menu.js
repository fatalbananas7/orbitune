import {R,LW,LH,TS,setupCam} from './dims.js?v=4';
import {C,txt,button,panel,muteBtn,background,vignette,hex} from './ui.js?v=4';
import {Sfx} from './audio.js?v=4';
import {RANKS,rankOf,rankNext} from './game.js?v=4';
import {SKINS,UPGRADES,upCost,ensureMissions} from './save.js?v=4';
const today=()=>new Date().toISOString().slice(0,10);
export class Menu extends Phaser.Scene{constructor(){super('Menu')}
 create(){setupCam(this);const W=LW,H=LH,S=this.registry.get('save'),d=S.d;ensureMissions(d);
  // daily streak bookkeeping
  const td=today(),yd=new Date(Date.now()-864e5).toISOString().slice(0,10);let bonus=0;
  if(d.lastDay!==td){d.streak=d.lastDay===yd?(d.streak||0)+1:1;d.lastDay=td;bonus=Math.min(7,d.streak)*25;d.dust+=bonus;}S.save();
  this.bg=background(this);
  // ---- vertical layout, anchored from bottom so it fits 640..900 tall ----
  const PAD=16,panH=Math.min(150,Math.max(126,H*0.17)),panY=H-PAD-panH/2,panTop=panY-panH/2;
  const rowY=panTop-20-29,playY=rowY-29-18-38,infoY=playY-38-24,titleY=infoY-66;
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
  title.setScale(0.7).setAlpha(0);this.tweens.add({targets:title,scale:1,alpha:1,duration:700,ease:'Back.out'});
  this.tweens.add({targets:title,alpha:0.88,duration:1800,yoyo:true,repeat:-1,delay:800,ease:'Sine.inOut'});
  // ---- top bar: dust pill (reward=gold) | rank | mute ----
  const tb=this.add.graphics();const pill=(x,y,w,h,col)=>{tb.fillStyle(C.ink,0.75);tb.fillRoundedRect(x,y,w,h,h/2);tb.lineStyle(1.5,col,0.8);tb.strokeRoundedRect(x,y,w,h,h/2);};
  const dw=Math.max(84,30+String(d.dust.toLocaleString()).length*12);pill(PAD,20,dw,32,C.gold);
  this.add.image(PAD+18,36,'prism').setTint(C.gold).setScale(0.2);this.dustT=txt(this,PAD+32,36,d.dust.toLocaleString(),17,C.gold,{ox:0});
  muteBtn(this,W-PAD-20,36);
  const r=rankOf(d.xp||0),xp=d.xp||0,lo=r?rankNext(r-1):0,hi=rankNext(r),rx=W/2+(dw-48)/2+4;
  txt(this,rx,30,'RANK '+(r+1),10,C.dim,{spacing:2});txt(this,rx,45,RANKS[r].toUpperCase(),13,C.cyan,{spacing:1.5});
  const rg=this.add.graphics();rg.fillStyle(C.ink,1);rg.fillRoundedRect(rx-60,56,120,4,2);rg.fillStyle(C.cyan,1);rg.fillRoundedRect(rx-60,56,Math.max(4,120*Phaser.Math.Clamp((xp-lo)/(hi-lo),0,1)),4,2);
  // chips row: best · streak
  const chips=[];if(d.best>0)chips.push(['BEST '+d.best.toLocaleString(),C.vio]);if(d.streak>1)chips.push(['DAY '+d.streak+' STREAK',C.mag]);
  const cw=150;chips.forEach(([t,col],i)=>{const x=W/2+(i-(chips.length-1)/2)*(cw+10);pill(x-cw/2,74,cw,24,col);txt(this,x,86,t,11,col,{spacing:1.5});});
  // ---- info line above play: sector start selector or tagline ----
  this.startSector=0;const maxS=Math.min(d.bestSector||0,6);
  if(maxS>=2){const lab=txt(this,W/2,infoY,'START  ·  SECTOR 1',13,C.cyan,{spacing:2});
   const set=(v)=>{this.startSector=Phaser.Math.Wrap(v,0,maxS);lab.setText('START  ·  SECTOR '+(this.startSector+1));this.tweens.add({targets:lab,scale:{from:1.15,to:1},duration:200,ease:'Back.out'});};
   [[-1,'‹',W/2-118],[1,'›',W/2+118]].forEach(([dv,ch,x])=>{const b=button(this,x,infoY,40,30,ch,C.cyan,()=>set(this.startSector+dv),{size:20,spacing:0});});}
  else txt(this,W/2,infoY,d.tut?'climb the singing sky':'release to launch  ·  hold to aim',12,C.dim,{weight:'600',spacing:2});
  // ---- PLAY hero ----
  const play=button(this,W/2,playY,264,76,'PLAY',C.cyan,()=>this.go({}),{size:32,solid:true,breathe:true,spacing:10});
  play.setScale(0.8).setAlpha(0);this.tweens.add({targets:play,scale:1,alpha:1,duration:500,delay:200,ease:'Back.out'});
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
  this.cameras.main.fadeIn(250,11,10,31);
 }
 go(o){Sfx.init();this.cameras.main.fadeOut(220,11,10,31);this.time.delayedCall(230,()=>this.scene.start('Game',{...o,start:o.daily?0:this.startSector}));}
 update(t,dt){const D=this.demo;D.a+=dt*0.0024;const x=D.cx+Math.cos(D.a)*D.rx,y=D.cy+Math.sin(D.a)*D.ry;this.cg.setPosition(x,y);this.cc.setPosition(x,y);
  const behind=Math.sin(D.a)<0;this.cc.setDepth(behind?0:2);this.cg.setDepth(behind?0:2);D.star.setDepth(1);this.trailG.setDepth(behind?0:2);
  D.trail.push(x,y);if(D.trail.length>48)D.trail.splice(0,2);const g=this.trailG;g.clear();const n=D.trail.length/2;
  for(let i=1;i<n;i++){const k=i/n;g.lineStyle(9*k,k>0.5?D.skin.a:D.skin.b,0.7*k);g.lineBetween(D.trail[i*2-2],D.trail[i*2-1],D.trail[i*2],D.trail[i*2+1]);}
  this.bg.update(t*0.03,t);}
}
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
   button(this,W-70,y,96,40,max?'MAX':cost+'',max?C.dim:(d.dust>=cost?C.gold:C.dim),()=>{if(max||d.dust<cost){this.cameras.main.shake(120,0.004);return;}d.dust-=cost;d.up[u.id]++;S.save();Sfx.buy();refresh();},{size:16});});
  const sy=160+4*66+8;txt(this,24,sy,'COMET TRAILS',12,C.vio,{ox:0,spacing:2});
  SKINS.forEach((sk,i)=>{const col=i%3,row=Math.floor(i/3),x=W/2+(col-1)*((W-40)/3),y=sy+66+row*104;const own=d.skins.includes(sk.id),eq=d.skin===sk.id;
   const b=button(this,x,y,(W-56)/3,92,'',eq?C.gold:(own?C.vio:C.dim),()=>{if(own){d.skin=sk.id;S.save();Sfx.click();refresh();}else if(d.dust>=sk.cost){d.dust-=sk.cost;d.skins.push(sk.id);d.skin=sk.id;S.save();Sfx.buy();refresh();}else this.cameras.main.shake(120,0.004);},{size:1});
   const g=this.add.graphics().setBlendMode('ADD');for(let k=0;k<12;k++){const f=k/12;g.lineStyle(2+7*f,f>0.5?sk.a:sk.b,0.2+0.7*f);g.lineBetween(x-34+k*5,y-14+Math.sin(k*0.5)*6,x-29+k*5,y-14+Math.sin((k+1)*0.5)*6);}
   this.add.image(x+28,y-14,'glow').setTint(sk.a).setBlendMode('ADD').setScale(0.4);this.add.image(x+28,y-14,'dot').setScale(0.55);
   txt(this,x,y+14,sk.name,13,C.text);txt(this,x,y+32,eq?'EQUIPPED':own?'tap to equip':sk.cost+' dust',11,eq?C.gold:own?C.vio:(d.dust>=sk.cost?C.gold:C.dim),{weight:'600'});});
  button(this,W/2,H-46,200,54,'BACK',C.cyan,()=>this.scene.start('Menu'),{size:20});
  vignette(this);}
 update(t){this.bg.update(t*0.02,t);}
}
