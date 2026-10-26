import {C,txt,button,panel,muteBtn,background,vignette,hex} from './ui.js';
import {Sfx} from './audio.js';
import {RANKS,rankOf,rankNext} from './game.js';
import {SKINS,UPGRADES,upCost,ensureMissions} from './save.js';
const today=()=>new Date().toISOString().slice(0,10);
export class Menu extends Phaser.Scene{constructor(){super('Menu')}
 create(){const W=this.scale.width,H=this.scale.height,S=this.registry.get('save'),d=S.d;ensureMissions(d);S.save();
  this.bg=background(this);this.fx=[];
  // orbiting demo comet around a hero star
  const cx=W/2,cy=H*0.27;
  this.add.image(cx,cy,'glow').setTint(C.vio).setBlendMode('ADD').setScale(3.2).setAlpha(0.45);
  const star=this.add.image(cx,cy,'node').setTint(C.cyan).setScale(0.9);this.tweens.add({targets:star,scale:0.95,yoyo:true,repeat:-1,duration:1400,ease:'Sine.inOut'});
  this.add.image(cx,cy,'dash').setTint(C.cyan).setAlpha(0.35).setScale(1.7);
  const skin=SKINS.find(s=>s.id===d.skin)||SKINS[0];
  this.demo={a:0,cx,cy,r:104,trail:[],skin};this.trailG=this.add.graphics().setBlendMode('ADD');
  this.cg=this.add.image(0,0,'glow').setTint(skin.a).setBlendMode('ADD').setScale(0.7);this.cc=this.add.image(0,0,'dot').setScale(0.7);
  const title=txt(this,W/2,H*0.47,'ORBITUNE',50,C.text,{glow:C.mag,blur:22,spacing:8});
  txt(this,W/2,H*0.47+38,'every catch is a note',15,C.dim,{weight:'600',spacing:3});
  title.setScale(0.6).setAlpha(0);this.tweens.add({targets:title,scale:1,alpha:1,duration:700,ease:'Back.out'});
  // top bar
  this.add.image(30,36,'prism').setTint(C.gold).setScale(0.22);this.dustT=txt(this,48,36,d.dust.toLocaleString(),20,C.gold,{ox:0});
  txt(this,W-70,36,'BEST '+d.best.toLocaleString(),14,C.dim,{ox:1});
  muteBtn(this,W-32,36);
  const r=rankOf(d.xp||0),xp=d.xp||0,lo=r?rankNext(r-1):0,hi=rankNext(r);txt(this,W/2,76,'RANK '+(r+1)+' · '+RANKS[r].toUpperCase(),12,C.cyan,{spacing:2});
  const rg=this.add.graphics();rg.fillStyle(C.ink,1);rg.fillRoundedRect(W/2-80,90,160,5,2);rg.fillStyle(C.cyan,1);rg.fillRoundedRect(W/2-80,90,Math.max(5,160*Math.min(1,(xp-lo)/(hi-lo))),5,2);
  // daily streak
  const td=today(),yd=new Date(Date.now()-864e5).toISOString().slice(0,10);if(d.lastDay!==td){d.streak=d.lastDay===yd?(d.streak||0)+1:1;d.lastDay=td;const bonus=Math.min(7,d.streak)*25;d.dust+=bonus;S.save();this.dustT.setText(d.dust.toLocaleString());
   this.time.delayedCall(700,()=>{const t=txt(this,W/2,H*0.53,'DAY '+d.streak+' STREAK  +'+bonus+' dust',16,C.gold,{glow:true});t.setScale(0);this.tweens.add({targets:t,scale:1,duration:400,ease:'Back.out'});this.tweens.add({targets:t,alpha:0,delay:2600,duration:600});Sfx.gold();});}
  const by=H*0.62;
  const play=button(this,W/2,by,250,70,'PLAY',C.gold,()=>this.go({}),{size:30,solid:true,breathe:true,spacing:6,sub:d.bestSector>0?'from sector 1':null});
  // checkpoint chips
  this.startSector=0;
  if(d.bestSector>=2){const n=Math.min(d.bestSector,5);const chips=[];for(let i=0;i<n;i++){const ch=button(this,W/2+(i-(n-1)/2)*48,by+52,40,30,''+(i+1),i?C.vio:C.gold,()=>{this.startSector=i;play.sub.setText('from sector '+(i+1));chips.forEach((k,j)=>k.setAlpha(j===i?1:0.45));},{size:15});ch.setAlpha(i?0.45:1);chips.push(ch);}}
  const dd=d.daily.date===today();
  button(this,W/2-66,by+108,122,54,'DAILY',C.cyan,()=>this.go({daily:true}),{size:18,sub:dd?'best '+d.daily.best:'new seed!'});
  button(this,W/2+66,by+108,122,54,'HANGAR',C.mag,()=>this.scene.start('Hangar'),{size:18,sub:'upgrades & trails'});
  // missions
  const my=Math.min(by+190,H-150);panel(this,W/2,my+38,W-36,128,C.vio,0.7);
  txt(this,30,my-12,'CONSTELLATION ORDERS',12,C.vio,{ox:0,spacing:2});
  d.missions.forEach((m,i)=>{const y=my+14+i*34;txt(this,30,y,m.text,14,C.text,{ox:0,weight:'600'});
   txt(this,W-30,y,'+'+m.reward,14,C.gold,{ox:1});});
  if(!d.tut)txt(this,W/2,H-12,'tip: release to launch · hold to aim',12,C.dim,{weight:'600'});
  vignette(this);Sfx.intensity=0;
  this.input.once('pointerdown',()=>Sfx.init());
 }
 go(o){Sfx.init();this.cameras.main.fadeOut(220,11,10,31);this.time.delayedCall(230,()=>this.scene.start('Game',{...o,start:o.daily?0:this.startSector}));}
 update(t,dt){const D=this.demo;D.a+=dt*0.0028;const x=D.cx+Math.cos(D.a)*D.r,y=D.cy+Math.sin(D.a)*D.r*0.42;this.cg.setPosition(x,y);this.cc.setPosition(x,y);
  D.trail.push(x,y);if(D.trail.length>44)D.trail.splice(0,2);const g=this.trailG;g.clear();const n=D.trail.length/2;
  for(let i=1;i<n;i++){const k=i/n;g.lineStyle(10*k,k>0.5?D.skin.a:D.skin.b,0.7*k);g.lineBetween(D.trail[i*2-2],D.trail[i*2-1],D.trail[i*2],D.trail[i*2+1]);}
  this.bg.update(t*0.02,t);}
}
export class Hangar extends Phaser.Scene{constructor(){super('Hangar')}
 create(){const W=this.scale.width,H=this.scale.height,S=this.registry.get('save'),d=S.d;
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
