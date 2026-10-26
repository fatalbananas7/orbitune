import {R,LW,LH,TS,setupCam} from './dims.js?v=4';
import {Ghost} from './ghost.js?v=4';
import {C,txt,button,panel,background,vignette,hex} from './ui.js?v=4';
import {Sfx} from './audio.js?v=4';
import {SKINS,UPGRADES,upCost,ensureMissions,newMission} from './save.js?v=4';
const SECTORS=[{n:'The Nursery',t:0xFFFFFF},{n:'Drift Reef',t:0x9FFFF4},{n:'Shard Veil',t:0xFFB4A0},{n:'Brittle Choir',t:0xD8C4FF},{n:'Event Horizon',t:0xB08CFF},{n:'The Far Song',t:0xFFE6A0}];
const COLS=[C.cyan,C.mag,C.vio];
const PER_SECTOR=18;
export const RANKS=['Spark','Ember','Wanderer','Lantern','Comet','Chorister','Starwright','Nebula Singer','Pulsar Bard','Celestial Maestro'];
export const rankOf=(xp)=>Math.min(RANKS.length-1,Math.floor(Math.sqrt(xp/40)));
export const rankNext=(r)=>40*(r+1)*(r+1);
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const today=()=>new Date().toISOString().slice(0,10);
export class Game extends Phaser.Scene{constructor(){super('Game')}
 create(data){
  setupCam(this);
  const W=this.W=LW,H=this.H=LH;const S=this.S=this.registry.get('save'),d=this.d=S.d;
  this.daily=!!data.daily;this.rng=this.daily?mulberry([...today()].reduce((a,c)=>a*31+c.charCodeAt(0),7)):Math.random;
  this.skin=SKINS.find(s=>s.id===d.skin)||SKINS[0];
  this.catchR=38+6*d.up.catch+12*d.assist;this.drainK=(1-0.09*d.up.fuel)*(1-0.15*d.assist);this.focusMax=1+0.3*d.up.focus;
  this.sector=this.startSector=data.start||0;this.secLatch=0;this.lives=2+d.up.heart;this.maxLives=this.lives+1;
  this.fuel=100;this.focus=this.focusMax;this.inv=0;this.hitstop=0;this.overdrive=false;this.over=false;this.paused=false;
  this.R={score:0,latches:0,perfects:0,combo:0,maxCombo:0,chords:0,banks:0,golds:0,loot:0,time:0};
  this.chain=0;this.lastCol=-1;this.hes=0;
  this.bg=background(this,SECTORS[this.sector%6].t);
  this.nodes=[];this.haz=[];this.holes=[];this.camY=0;this.genY=H-170;
  this.constG=this.add.graphics().setBlendMode('ADD').setDepth(1);this.full=[];this.motes=[];this.moteChain=0;
  this.bestH=this.daily?(d.daily.date===today()?d.daily.h||0:0):(d.bestH||0);if(this.bestH>200){this.bestLine=this.add.graphics().setDepth(1);const yy=H-170-this.bestH;for(let x=0;x<W;x+=18){this.bestLine.lineStyle(2,C.gold,0.55);this.bestLine.lineBetween(x,yy,x+9,yy);}this.bestTxt=txt(this,W-14,yy-12,'YOUR BEST',11,C.gold,{ox:1,spacing:2}).setDepth(1);this.passedBest=false;}
  this.ghostInit();
  this.trailG=this.add.graphics().setBlendMode('ADD').setDepth(5);this.fxG=this.add.graphics().setDepth(6);
  this.burst=this.add.particles(0,0,'dot',{speed:{min:70,max:300},lifespan:{min:350,max:800},scale:{start:0.55,end:0},alpha:{start:1,end:0},blendMode:'ADD',emitting:false}).setDepth(8);
  this.bigSparks=this.add.particles(0,0,'dot',{speed:{min:220,max:640},lifespan:{min:300,max:750},scale:{start:0.7,end:0},blendMode:'ADD',emitting:false,tint:[C.gold,0xFFFFFF,0xFFE7A0]}).setDepth(9);
  this.sparks=this.add.particles(0,0,'dot',{speed:{min:150,max:520},lifespan:{min:250,max:600},scale:{start:0.35,end:0},blendMode:'ADD',emitting:false,tint:C.gold}).setDepth(8);
  this.dust=this.add.particles(0,0,'dot',{speed:{min:5,max:30},lifespan:700,scale:{start:0.3,end:0},alpha:{start:0.7,end:0},blendMode:'ADD',frequency:28,tint:this.skin.b}).setDepth(4);
  // first node
  const n0=this.makeNode(W/2,H-170,0,30,'normal');this.genY=H-170;while(this.genY>-H)this.spawnRow();
  this.c={x:n0.x+60,y:n0.y,vx:0,vy:0,state:'orbit',node:n0,ang:0,r:60,dir:1,ft:0,b:0,last:null,trail:[]};
  this.cg=this.add.image(0,0,'glow').setTint(this.skin.a).setBlendMode('ADD').setScale(0.8).setDepth(10);
  this.cc=this.add.image(0,0,'dot').setScale(0.75).setDepth(11);if(this.skin.dark){this.cg.setTint(C.mag);this.cc.setTint(0xE8DDFF);}
  this.dust.startFollow(this.cc);
  this.buildHud();vignette(this);
  this.odEdge=this.add.image(W/2,H/2,'vignette').setScrollFactor(0).setDisplaySize(W,H).setDepth(901).setTint(C.gold).setBlendMode('ADD').setAlpha(0);
  this.flash=this.add.rectangle(W/2,H/2,W,H,0xffffff,0).setScrollFactor(0).setDepth(950);
  // input
  this.input.addPointer(2);this.press=null;
  this.input.on('pointerdown',(p)=>{Sfx.init();if(this.over||this.paused)return;if(p.y/R<70&&p.x/R>W-70)return;
   if(this.press&&this.press.id!==p.id){this.reverse();return;}
   if(this.c.state==='orbit')this.press={id:p.id,t:this.time.now,x:p.x/R,y:p.y/R,sw:false};});
  this.input.on('pointermove',(p)=>{const pr=this.press;if(!pr||pr.id!==p.id||pr.sw)return;if(Math.hypot(p.x/R-pr.x,p.y/R-pr.y)>48){pr.sw=true;this.reverse();}});
  this.input.on('pointerup',(p)=>{const pr=this.press;if(!pr||pr.id!==p.id)return;this.press=null;if(!pr.sw&&this.c.state==='orbit'&&!this.over&&!this.paused)this.launch();});
  const cancel=()=>{this.press=null;};this.input.on('pointerupoutside',(p)=>{const pr=this.press;if(pr&&pr.id===p.id){this.press=null;if(!pr.sw&&this.c.state==='orbit'&&!this.over&&!this.paused)this.launch();}});
  this.game.canvas.addEventListener('pointercancel',cancel);this.game.canvas.addEventListener('touchcancel',cancel);this.events.once('shutdown',()=>{this.game.canvas.removeEventListener('pointercancel',cancel);this.game.canvas.removeEventListener('touchcancel',cancel);});
  this.vis=()=>{if(document.hidden&&!this.over)this.pause(true);};document.addEventListener('visibilitychange',this.vis);
  this.events.once('shutdown',()=>document.removeEventListener('visibilitychange',this.vis));
  this.cameras.main.fadeIn(300,11,10,31);
  Sfx.intensity=0.15;Sfx.setSector(this.sector);
  this.tutStep=d.tut?99:0;if(!d.tut)this.hint('RELEASE to launch',"tap anywhere — fly tangent to your orbit");
  this.banner(this.daily?'DAILY CONSTELLATION':SECTORS[this.sector%6].n,this.daily?today():'SECTOR '+(this.sector+1));
 }
 // ---------- world ----------
 makeNode(x,y,col,r,type){const n={x,y,bx:x,r,br:r,col,type,orbitT:0,ph:this.rng()*6.28,amp:30+this.rng()*50,sp:0.6+this.rng()*0.8,alive:true};
  const tint=type==='gold'?C.gold:COLS[col];
  n.glow=this.add.image(x,y,'glow').setTint(tint).setBlendMode('ADD').setAlpha(0.55).setDepth(2);
  n.ring=this.add.image(x,y,'dash').setTint(tint).setAlpha(0.1).setDepth(2);
  n.body=this.add.image(x,y,type==='gold'?'prism':'node').setTint(tint).setDepth(3);
  if(type==='fragile'){n.crack=this.add.image(x,y,'ring').setTint(C.text).setAlpha(0.6).setDepth(3);}
  n.body.setScale(0);this.tweens.add({targets:n.body,scale:(type==='gold'?r/40:r/62),duration:400,ease:'Back.out'});
  this.nodes.push(n);this.sizeNode(n);return n;}
 sizeNode(n){n.glow.setScale(n.r/64*3).setPosition(n.x,n.y);n.ring.setScale((n.r+this.crEff())/61).setPosition(n.x,n.y);n.body.setPosition(n.x,n.y);if(n.type==='pulsar'&&n.body.scale>0.1)n.body.setScale(n.r/62);if(n.crack)n.crack.setPosition(n.x,n.y).setScale((n.r+6)/60*(1-Math.min(1,n.orbitT/1.5)*0.6));}
 spawnRow(){const s=this.sector,R=this.rng,W=this.W;this.genY-=(150+R()*55)*(1+Math.min(s,6)*0.025);
  const xs=R()<0.36?[50+R()*(W/2-100),W/2+50+R()*(W/2-100)]:[60+R()*(W-120)];
  xs.forEach(x=>{let type='normal';const q=R();
   if(q<0.045&&this.genY<0)type='gold';else if(s>=1&&q<0.32)type='moving';else if(s>=3&&q<0.55)type='fragile';else if(s>=4&&q<0.75)type='pulsar';
   const r=Math.max(18,(22+R()*13)-Math.min(s,6)*0.8);this.makeNode(x,this.genY+(R()-0.5)*40,Math.floor(R()*3),r,type);});
  if(R()<0.55){const mx=40+R()*(W-80),my=this.genY+60+R()*40;for(let k=0;k<3;k++){const m={x:mx+(k-1)*22,y:my+Math.sin(k)*8};m.o=this.add.image(m.x,m.y,'dot').setTint(C.gold).setBlendMode('ADD').setScale(0.45).setDepth(3);this.tweens.add({targets:m.o,scale:0.6,yoyo:true,repeat:-1,duration:500+k*90,ease:'Sine.inOut'});this.motes.push(m);}}
  if(s>=4&&R()<(s===4?0.34:0.12)&&this.genY<this.camY-200){const side=R()<0.5,hx=side?40+R()*60:W-40-R()*60,hy=this.genY+90;
   const bh={x:hx,y:hy,r:20};bh.glow=this.add.image(hx,hy,'glow').setTint(C.mag).setBlendMode('ADD').setScale(2.6).setAlpha(0.45).setDepth(2);
   bh.disk=this.add.image(hx,hy,'dash').setTint(C.vio).setBlendMode('ADD').setScale(0.9).setDepth(2);bh.ring=this.add.image(hx,hy,'ring').setTint(C.mag).setBlendMode('ADD').setScale(0.48).setDepth(3);
   bh.core=this.add.circle(hx,hy,18,0x000000,1).setDepth(3);bh.pull=this.add.image(hx,hy,'dash').setTint(C.vio).setAlpha(0.12).setScale(3.6).setDepth(1);this.holes.push(bh);}
  if(s>=2&&R()<0.28+0.06*Math.min(s-2,4)){const h={y:this.genY+75+R()*30,x:R()*W,sp:(50+R()*60+s*8)*(R()<0.5?-1:1)*(s===2?0.6:1),ph:R()*6,arm:0};h.tr=this.add.graphics().setDepth(1);for(let x=4;x<W;x+=16){h.tr.fillStyle(C.danger,0.22);h.tr.fillRect(x,h.y-1,7,2);}
   h.g=this.add.image(h.x,h.y,'glow').setTint(C.danger).setBlendMode('ADD').setAlpha(0.5).setScale(0.6).setDepth(2);h.s=this.add.image(h.x,h.y,'shard').setTint(C.danger).setScale(0.5).setDepth(3);this.haz.push(h);}}
 killNode(n,fx){n.alive=false;if(fx){this.burst.particleTint=COLS[n.col];this.burst.explode(26,n.x,n.y);}
  [n.glow,n.ring,n.body,n.crack].forEach(o=>o&&o.destroy());}
 // ---------- actions ----------
 reverse(){if(this.c.state!=='orbit')return;this.c.dir*=-1;Sfx.tone(Sfx.scaleHz(3),0.15,'sine',0.08);this.burst.particleTint=this.skin.a;this.burst.explode(8,this.c.x,this.c.y);this.vib(6);
  if(this.tutStep===3){this.tutStep=4;this.tutN=this.R.latches;this.hint('Catch TIGHT to a star','skim its rim for a PERFECT');}}
 launch(){const c=this.c,tx=-Math.sin(c.ang)*c.dir,ty=Math.cos(c.ang)*c.dir,sp=560+20*Math.min(this.sector,8);
  c.vx=tx*sp;c.vy=ty*sp;c.state='fly';c.last=c.node;c.ft=0;c.b=0;Sfx.launch();this.vib(10);
  const n=c.node;if(n.alive)this.tweens.add({targets:n.body,scale:n.body.scale*0.86,duration:80,yoyo:true});
  if(n.type==='fragile'&&n.alive){this.killNode(n,true);Sfx.noise(0.3,2000,0.1);}
  if(this.tutStep===0){this.tutStep=1;this.clearHint();}}
 latch(n,dist){const c=this.c;const ox=c.x-n.x,oy=c.y-n.y;c.ang=Math.atan2(oy,ox);c.r=Phaser.Math.Clamp(dist,n.r+16,n.r+48);
  const tg=-Math.sin(c.ang)*c.vx+Math.cos(c.ang)*c.vy;c.dir=tg>=0?1:-1;c.state='orbit';c.node=n;n.orbitT=0;this.hes=0;
  const perfect=dist<n.r+24,R=this.R;R.latches++;R.combo++;R.maxCombo=Math.max(R.maxCombo,R.combo);
  const mult=this.mult();let pts=10,label=null,col=n.type==='gold'?C.gold:COLS[n.col];
  this.fuel=Math.min(100,this.fuel+(perfect?13:6));
  if(perfect){R.perfects++;pts+=25;this.hitstop=0.075;this.focus=Math.min(this.focusMax,this.focus+0.25);this.bigSparks.explode(30,c.x,c.y);this.sparks.explode(16,c.x,c.y);this.cameras.main.shake(110,0.006);this.punch(1.035,140);this.perfectText(c.x,c.y);this.ringWave(c.x,c.y,C.gold,1.8);}
  if(c.b>0){R.banks++;pts+=60;label='BANK SHOT'+(perfect?'!':'');}
  if(n.col===this.lastCol&&n.type!=='gold'){this.chain++;}else this.chain=1;this.lastCol=n.col;
  Sfx.catchNote(R.combo,perfect);
  if(this.chain===3){R.chords++;pts+=150;this.chain=0;this.lastCol=-1;Sfx.chord(R.combo);this.float(n.x,n.y-70,'CHORD',col,26);this.ringWave(n.x,n.y,col,2.4);this.cameras.main.shake(140,0.006);}
  this.full.push({x:n.x,y:n.y,p:perfect,ch:this.chain===0,col}); if(this.full.length>400)this.full.shift();this.drawConst();
  if(n.type==='gold')this.loot(n);
  const gain=pts*mult;R.score+=gain;this.float(n.x,n.y-n.r-26,'+'+gain,perfect?C.gold:C.text,perfect?22:17);if(label)this.float(n.x,n.y-n.r-50,label,C.gold,15);
  this.burst.particleTint=col;this.burst.explode(perfect?22:12,c.x,c.y);this.ringWave(n.x,n.y,col,1.3);
  this.tweens.add({targets:n.body,scale:{from:n.body.scale*1.25,to:n.body.scale},duration:300,ease:'Back.out'});
  this.tweens.add({targets:this.scoreT,scale:{from:1.2,to:1},duration:220,ease:'Back.out'});this.vib(perfect?18:8);
  if(R.combo===12&&!this.overdrive)this.setOverdrive(true);
  this.secLatch++;if(this.secLatch>=PER_SECTOR&&!this.daily||this.daily&&this.secLatch>=PER_SECTOR){this.secLatch=0;this.sector++;this.newSector();}
  if(this.tutStep===1&&R.latches>=1){this.tutStep=2;this.holdT=0;this.hint('Now HOLD your finger down','time slows · a dotted line shows your path');}
  else if(this.tutStep===2&&R.latches>=8){this.tutStep=3;this.tutN=R.latches;this.hint('While holding, SLIDE to reverse','flip your orbit direction — then let go');}
  else if(this.tutStep===3&&R.latches>=this.tutN+4){this.tutStep=4;this.tutN=R.latches;this.hint('Catch TIGHT to a star','skim its rim for a PERFECT');}
  else if(this.tutStep===4&&(perfect||R.latches>=this.tutN+5)){this.tutStep=99;this.hint(perfect?'PERFECT! You\'ve got it':'You\'ve got it','fuel burns faster as you climb — good luck');this.time.delayedCall(2200,()=>{if(this.tutStep===99)this.clearHint();});}}
 drawConst(){this.constLines(this.constG,this.full.slice(-24),(p)=>p,1);}
 constLines(g,P,map,sc){g.clear();for(let i=1;i<P.length;i++){const k=sc<1?1:i/P.length,a=map(P[i-1]),b=map(P[i]);g.lineStyle(7*sc,C.vio,0.07*k);g.lineBetween(a.x,a.y,b.x,b.y);g.lineStyle(1.6,P[i].ch?C.mag:C.vio,0.2+0.5*k);g.lineBetween(a.x,a.y,b.x,b.y);}
  P.forEach((p,i)=>{const k=sc<1?1:(i+1)/P.length,m=map(p);if(p.ch){g.lineStyle(1.5,C.mag,0.8*k);g.strokeCircle(m.x,m.y,7*Math.max(sc,0.7));}
   if(p.p){g.fillStyle(C.gold,0.25*k);g.fillCircle(m.x,m.y,7*Math.max(sc,0.6));g.fillStyle(C.gold,k);g.fillCircle(m.x,m.y,3.2);}else{g.fillStyle(C.text,0.35+0.5*k);g.fillCircle(m.x,m.y,2);}});}
 punch(z,d){const cam=this.cameras.main;this.tweens.killTweensOf(cam);cam.setZoom(R*z);this.tweens.add({targets:cam,zoom:R,duration:d,ease:'Cubic.out'});}
 perfectText(x,y){const t=txt(this,x,y-44,'PERFECT',30,C.gold,{glow:C.gold,blur:16,spacing:4}).setDepth(21).setScale(1.8).setAlpha(0);
  this.tweens.add({targets:t,scale:1,alpha:1,duration:160,ease:'Back.out'});this.tweens.add({targets:t,y:y-80,alpha:0,delay:420,duration:420,ease:'Cubic.in',onComplete:()=>t.destroy()});}
 crEff(){return this.catchR+(this.overdrive?10:0)+Math.max(0,12-6*this.sector);}
 mult(){return Math.min(5,1+Math.floor(this.R.combo/6))*(this.overdrive?2:1);}
 loot(n){const R=this.R,q=Math.random();R.golds++;Sfx.gold();this.sparks.explode(40,n.x,n.y);this.ringWave(n.x,n.y,C.gold,3);let t;
  if(q<0.03){R.loot+=150;t='JACKPOT +150 dust';this.cameras.main.flash(250,255,201,74);}else if(q<0.55){const v=10+Math.floor(Math.random()*25);R.loot+=v;t='+'+v+' dust';}
  else if(q<0.8){this.fuel=100;this.focus=this.focusMax;t='FULL BURN';}else if(q<0.92&&this.lives<this.maxLives){this.lives++;t='+1 SHIELD';}else{R.score+=500*this.mult();t='+'+500*this.mult()+' STARFALL';}
  this.float(n.x,n.y-95,t,C.gold,20);this.time.delayedCall(60,()=>{if(n.alive){n.type='normal';n.body.setTexture('node').setTint(COLS[n.col]).setScale(n.r/62);n.glow.setTint(COLS[n.col]);n.ring.setTint(COLS[n.col]);}});}
 setOverdrive(on){this.overdrive=on;Sfx.intensity=on?0.95:Math.min(0.7,0.2+this.sector*0.12);if(on){this.hitstop=0.16;Sfx.overdrive();this.punch(1.09,520);this.vib([20,30,60]);this.cameras.main.shake(300,0.008);this.cameras.main.flash(260,255,201,74);
   [0,110,220].forEach((dl,i)=>this.time.delayedCall(dl,()=>this.ringWave(this.c.x,this.c.y,i===1?C.mag:C.gold,4+i*1.5)));this.bigSparks.explode(60,this.c.x,this.c.y);
   const W=this.W,y=this.H*0.36;const t=txt(this,W/2,y,'OVERDRIVE',46,C.gold,{glow:C.gold,blur:24,spacing:6}).setScrollFactor(0).setDepth(965).setScale(3).setAlpha(0);
   const t2=txt(this,W/2,y+40,'×2 SCORE  ·  WIDER GRAVITY',13,C.text,{spacing:3}).setScrollFactor(0).setDepth(965).setAlpha(0);
   this.tweens.add({targets:t,scale:1,alpha:1,duration:380,ease:'Back.out'});this.tweens.add({targets:t2,alpha:1,delay:250,duration:300});
   this.tweens.add({targets:[t,t2],alpha:0,delay:1500,duration:500,onComplete:()=>{t.destroy();t2.destroy();}});
   this.odEdge.setAlpha(0);this.tweens.add({targets:this.odEdge,alpha:{from:0.9,to:0.45},duration:600,yoyo:true,repeat:-1,ease:'Sine.inOut'});
   this.cg.setTint(C.gold);this.dust.particleTint=C.gold;}else{this.tweens.killTweensOf(this.odEdge);this.tweens.add({targets:this.odEdge,alpha:0,duration:300});this.cg.setTint(this.skin.dark?C.mag:this.skin.a);this.dust.particleTint=this.skin.b;}}
 newSector(){const s=this.sector;Sfx.setSector(s);Sfx.sector();this.bg.neb.setTint(SECTORS[s%6].t);this.banner(s<6?SECTORS[s].n:SECTORS[5].n+' '+(s-4),s===4?'EVENT · black holes bend your flight':'SECTOR '+(s+1));if(s===4){this.punch(1.06,700);this.cameras.main.shake(500,0.005);Sfx.event();}
  this.fuel=Math.min(100,this.fuel+30);this.R.score+=250*(s);this.cameras.main.flash(300,155,123,255);if(!this.overdrive)Sfx.intensity=Math.min(0.7,0.2+s*0.12);}
 damage(why){if(this.inv>0||this.over)return;if(this.tutStep<99&&!this.d.tut){this.inv=1.2;this.cameras.main.shake(150,0.006);Sfx.hit();this.float(this.c.x,this.c.y-40,'practice — no harm',C.dim,13);return;}this.lives--;this.vib([30,40,30]);Sfx.hit();this.cameras.main.shake(260,0.012);this.hitstop=0.07;
  this.flash.setFillStyle(C.danger,0.35);this.tweens.add({targets:this.flash,alpha:{from:1,to:0},duration:350});this.sparks.particleTint=C.danger;this.sparks.explode(30,this.c.x,this.c.y);this.sparks.particleTint=C.gold;
  this.R.combo=0;this.chain=0;if(this.overdrive)this.setOverdrive(false);
  if(this.lives<=0){this.end(why);return;}this.inv=1.6;this.float(this.c.x,this.c.y-40,'SHIELD BROKEN',C.danger,16);}
 lost(){const c=this.c;this.damage('lost');if(this.over)return;
  let n=c.last&&c.last.alive&&c.last.y<this.camY+this.H-40?c.last:null;
  if(!n){n=this.nodes.filter(k=>k.alive&&k.y>this.camY+120&&k.y<this.camY+this.H-60).sort((a,b)=>b.y-a.y)[0];}
  if(!n)n=this.makeNode(this.W/2,this.camY+this.H*0.65,0,30,'normal');
  c.state='orbit';c.node=n;c.ang=-Math.PI/2;c.r=n.r+30;n.orbitT=0;c.trail=[];this.ringWave(n.x,n.y,C.text,2);}
 // ---------- fx ----------
 vib(p){if(navigator.vibrate)try{navigator.vibrate(p)}catch(e){}}
 float(x,y,s,col,size){x=Phaser.Math.Clamp(x,70,this.W-70);const t=txt(this,x,y,s,size,col,{glow:col,blur:10}).setDepth(20).setScale(0.5);this.tweens.add({targets:t,scale:1,duration:180,ease:'Back.out'});this.tweens.add({targets:t,y:y-46,alpha:0,delay:350,duration:600,ease:'Cubic.in',onComplete:()=>t.destroy()});}
 ringWave(x,y,col,s){const r=this.add.image(x,y,'ring').setTint(col).setBlendMode('ADD').setScale(0.3).setDepth(7);this.tweens.add({targets:r,scale:s,alpha:0,duration:520,ease:'Cubic.out',onComplete:()=>r.destroy()});}
 banner(a,b){const W=this.W,y=this.H*0.36;const t1=txt(this,W/2,y,a,30,C.text,{glow:C.mag,blur:18,spacing:4}).setScrollFactor(0).setDepth(960).setAlpha(0);const t2=txt(this,W/2,y+34,b,13,C.vio,{spacing:4}).setScrollFactor(0).setDepth(960).setAlpha(0);
  [t1,t2].forEach((t,i)=>{t.x=W/2+60;this.tweens.add({targets:t,x:W/2,alpha:1,duration:420,delay:i*80,ease:'Cubic.out'});this.tweens.add({targets:t,x:W/2-60,alpha:0,delay:1700+i*80,duration:380,ease:'Cubic.in',onComplete:()=>t.destroy()});});}
 hint(a,b){this.clearHint();const y=this.H-120;this.hintO=[txt(this,this.W/2,y,a,22,C.gold,{glow:true}),txt(this,this.W/2,y+28,b,13,C.dim,{weight:'600'})];this.hintO.forEach(t=>{t.setScrollFactor(0).setDepth(940);this.tweens.add({targets:t,alpha:{from:0.55,to:1},yoyo:true,repeat:-1,duration:700});});}
 clearHint(){(this.hintO||[]).forEach(t=>t.destroy());this.hintO=null;}
 // ---------- hud ----------
 buildHud(){const W=this.W;const z=(o)=>o.setScrollFactor(0).setDepth(1000);
  this.hudG=z(this.add.graphics());this.scoreT=z(txt(this,W/2,54,'0',34,C.text,{glow:C.vio,blur:12}));
  this.comboT=z(txt(this,W/2,86,'',14,C.gold,{spacing:2}));this.secT=z(txt(this,16,40,'',11,C.dim,{ox:0,spacing:1}));
  const pb=z(this.add.container(W-30,36));const pg=this.add.graphics();pg.lineStyle(2,C.dim,1);pg.strokeCircle(0,0,17);pg.fillStyle(C.text,1);pg.fillRect(-6,-7,4,14);pg.fillRect(2,-7,4,14);pb.add(pg);pb.setSize(44,44).setInteractive();pb.on('pointerup',()=>this.pause(!this.paused));}
 drawHud(){const g=this.hudG,W=this.W,R=this.R;g.clear();
  const bw=W-150,bx=75,by=16;g.fillStyle(C.ink,0.9);g.fillRoundedRect(bx,by,bw,8,4);const f=Math.max(0,this.fuel/100),fc=f<0.25?C.danger:(this.overdrive?C.gold:C.cyan);
  g.fillStyle(fc,f<0.25&&(this.time.now%400<200)?0.5:1);g.fillRoundedRect(bx,by,Math.max(8,bw*f),8,4);
  for(let i=0;i<this.lives;i++){g.fillStyle(C.gold,1);g.fillCircle(W-64-i*14,36,4.5);}
  // combo hesitation bar
  if(R.combo>1){const k=1-Math.min(1,this.hes/2.6);g.fillStyle(C.gold,0.8);g.fillRect(W/2-40,98,80*k,2);}
  this.scoreT.setText(R.score.toLocaleString());this.comboT.setText(R.combo>1?`COMBO ${R.combo}  ×${this.mult()}`:'');
  this.secT.setText((this.daily?'DAILY':'SECTOR '+(this.sector+1))+'\n'+'▮'.repeat(this.secLatch)+'▯'.repeat(PER_SECTOR-this.secLatch));this.secT.setFontSize(10);}
 pause(on){if(this.over)return;this.paused=on;if(on){this.pauseO=[];const W=this.W,H=this.H;const z=o=>{o.setScrollFactor(0).setDepth(1100);this.pauseO.push(o);return o;};
   z(this.add.rectangle(W/2,H/2,W,H,C.void,0.7));z(txt(this,W/2,H*0.38,'PAUSED',36,C.text,{glow:C.vio,spacing:6}));
   z(button(this,W/2,H*0.5,220,60,'RESUME',C.gold,()=>this.pause(false),{size:22,solid:true}));z(button(this,W/2,H*0.5+76,220,52,'MENU',C.vio,()=>this.scene.start('Menu'),{size:18}));}
  else{(this.pauseO||[]).forEach(o=>o.destroy());}}
 // ---------- loop ----------
 // ---------- ghost of personal best ----------
 ghostInit(){const d=this.d;this.gRec=[];this.gData=Ghost.load();this.gk=null;
  const g=this.gData,on=d.tut&&d.ghost!==false;
  if(on&&this.daily&&g.d&&g.d.date===today())this.gk='d';else if(on&&!this.daily&&!this.startSector&&g.n&&g.n.h>200)this.gk='n';
  if(!this.gk)return;const col=this.gk==='d'?C.cyan:C.gold;this.gCol=col;
  this.gTrail=this.add.graphics().setBlendMode('ADD').setDepth(2);
  this.gGlow=this.add.image(0,0,'glow').setTint(col).setBlendMode('ADD').setAlpha(0.3).setScale(0.32).setDepth(2);
  this.gCore=this.add.image(0,0,'dot').setTint(0xFFFFFF).setAlpha(0.32).setScale(0.42).setDepth(2);
  this.gLab=txt(this,0,0,'BEST',9,col===C.cyan?C.cyan:C.gold,{spacing:2}).setAlpha(0).setDepth(2);}
 ghostAt(t){const g=this.gData[this.gk],p=g.p,st=this.gk==='d'?2:1,n=p.length/st,f=t*1000/Ghost.DT;
  if(f>=n-1)return null;const i=Math.floor(f),k=f-i,a=(j)=>p[Math.min(j,n-1)*st+(st-1)];
  const h=a(i)+(a(i+1)-a(i))*k,x=st===2?p[i*2]+(p[Math.min(i+1,n-1)*2]-p[i*2])*k:this.W-16;return {x,y:this.H-170-h};}
 ghostUpdate(time){const R=this.R,c=this.c;
  if(!this.over&&this.gRec.length<Ghost.MAX*(this.daily?2:1)){const want=Math.floor(R.time*1000/Ghost.DT)+1,st=this.daily?2:1;
   while(this.gRec.length/st<want&&this.gRec.length<Ghost.MAX*st){if(this.daily)this.gRec.push(Math.round(c.x));this.gRec.push(Math.round(this.H-170-c.y));}}
  if(!this.gk)return;const gt=this.gTrail;gt.clear();const P=this.ghostAt(R.time);
  if(!P){if(this.gGlow.visible){this.tweens.add({targets:[this.gGlow,this.gCore,this.gLab],alpha:0,duration:600});this.gGlow.visible=false;this.gCore.setVisible(false);}return;}
  this.gGlow.setPosition(P.x,P.y).setScale(0.3+Math.sin(time*0.004)*0.03);this.gCore.setPosition(P.x,P.y);
  for(let i=1;i<=6;i++){const Q=this.ghostAt(Math.max(0,R.time-i*0.08));if(!Q)break;const prev=i===1?P:this.ghostAt(Math.max(0,R.time-(i-1)*0.08));gt.lineStyle(5*(1-i/7),this.gCol,0.22*(1-i/7));gt.lineBetween(prev.x,prev.y,Q.x,Q.y);}
  const near=Math.abs(P.y-c.y)<170;const lx=Phaser.Math.Clamp(P.x,30,this.W-30);this.gLab.setPosition(this.gk==='n'?P.x-2:lx,P.y-16).setOrigin(this.gk==='n'?1:0.5,0.5);
  this.gLab.setAlpha(Phaser.Math.Linear(this.gLab.alpha,near?0.55:0,0.1));}
 ghostSave(h,score){const g=this.gData||Ghost.load();
  if(this.daily){if(!g.d||g.d.date!==today()||h>g.d.h)g.d={date:today(),h,score,p:this.gRec};}
  else if(!this.startSector&&this.gRec.length>=10&&h>(g.n?g.n.h:0))g.n={h,score,p:this.gRec};else return;Ghost.save(g);}
 // adaptive quality: if frames are slow at high DPR, lower render scale for next launch
 perf(ms){if(navigator.webdriver||R<=1.5||this._pq)return;this._pf=(this._pf||0)+1;this._pt=(this._pt||0)+ms;
  if(this._pf===240){this._pq=1;if(this._pt/240>26){try{const q=+localStorage.getItem('orbitune_q')||1;localStorage.setItem('orbitune_q',String(Math.max(0.5,q*0.75)));}catch(e){}}}}
 update(time,dtms){this.perf(dtms);let dt=Math.min(dtms,50)/1000;this.bg.update(this.camY,time);if(this.paused){return;}
  if(this.hitstop>0){this.hitstop-=dt;this.drawHud();return;}
  const c=this.c,W=this.W,H=this.H,R=this.R;
  const holding=this.press&&!this.press.sw&&time-this.press.t>160&&c.state==='orbit'&&this.focus>0&&!this.over;
  let ts=this.over?0.25:(holding?0.3:1);if(holding)this.focus=Math.max(0,this.focus-dt*0.6);else this.focus=Math.min(this.focusMax,this.focus+dt*0.07);
  this.time.timeScale=1;if(holding&&this.tutStep===2){this.holdT+=dt;if(this.holdT>0.45){this.tutStep=3;this.hint('While holding, SLIDE to reverse','flip your orbit direction — then let go');}}const sdt=dt*ts;if(!this.over)R.time+=dt;this.inv=Math.max(0,this.inv-dt);
  const cr=this.crEff(),tt=time/1000;
  for(const n of this.nodes){if(!n.alive)continue;if(n.type==='moving')n.x=Phaser.Math.Clamp(n.bx+Math.sin(tt*n.sp+n.ph)*n.amp,n.br+10,W-n.br-10);
   if(n.type==='pulsar')n.r=n.br*(1+0.28*Math.sin(tt*2.4+n.ph));this.sizeNode(n);}
  for(const h of this.haz){h.x+=h.sp*sdt;if(h.x<-30)h.x=W+30;if(h.x>W+30)h.x=-30;const y=h.y+Math.sin(tt*2+h.ph)*14;h.g.setPosition(h.x,y).setAlpha(0.35+0.25*Math.sin(tt*6+h.ph));if(!h.armed&&h.y>this.camY-20){h.arm+=dt;if(h.arm>0.9)h.armed=true;h.s.setAlpha(0.4+0.6*Math.min(1,h.arm/0.9));}h.s.setPosition(h.x,y).setRotation(tt*3*Math.sign(h.sp));h.cy=y;}
  if(c.state==='orbit'){const n=c.node;if(n.type==='pulsar')c.r=Phaser.Math.Clamp(c.r,n.r+14,n.r+60);
   c.ang+=c.dir*(300+18*Math.min(this.sector,8))/c.r*sdt;c.x=n.x+Math.cos(c.ang)*c.r;c.y=n.y+Math.sin(c.ang)*c.r;
   if(!this.over){this.fuel-=(6+Math.min(6,this.R.time*0.05)+this.sector*0.6)*this.drainK*Math.min(1,0.7+this.R.time/80)*sdt;n.orbitT+=sdt;this.hes+=sdt;if(this.hes>2.6&&R.combo>0){R.combo=0;if(this.overdrive)this.setOverdrive(false);this.float(c.x,c.y-30,'combo faded',C.dim,13);}
    if(n.type==='fragile'&&n.orbitT>1.5){this.killNode(n,true);Sfx.noise(0.3,2000,0.12);c.vx=-Math.sin(c.ang)*c.dir*420;c.vy=Math.cos(c.ang)*c.dir*420;c.state='fly';c.last=null;c.ft=0;c.b=0;}}}
  else if(c.state==='fly'){c.ft+=sdt;if(!this.over)this.fuel-=3.5*this.drainK*sdt;
   // gentle gravity assist toward nearest node in reach
   for(const n of this.nodes){if(!n.alive||n===c.last)continue;const dx=n.x-c.x,dy=n.y-c.y,dd=Math.hypot(dx,dy);if(dd<n.r+cr+38&&dd>1){c.vx+=dx/dd*170*sdt;c.vy+=dy/dd*170*sdt;}}
   c.x+=c.vx*sdt;c.y+=c.vy*sdt;
   if(c.b<1&&(c.x<10&&c.vx<0||c.x>W-10&&c.vx>0)){c.vx*=-1;c.b++;Sfx.bounce();this.burst.particleTint=C.text;this.burst.explode(10,c.x,c.y);this.ringWave(c.x,c.y,C.text,0.6);}
   if(!this.over)for(const n of this.nodes){if(!n.alive||(n===c.last&&c.ft<0.35))continue;const dd=Math.hypot(n.x-c.x,n.y-c.y);if(dd<n.r+cr){this.latch(n,dd);break;}}
   if(c.state==='fly'&&!this.over&&(c.ft>2.4||c.x<-30||c.x>W+30||c.y>this.camY+H+30||c.y<this.camY-80))this.lost();}
  for(const bh of this.holes){bh.disk.rotation+=dt*2.2;bh.pull.rotation-=dt*0.4;bh.ring.setScale(0.48+0.04*Math.sin(tt*5));
   const dx=bh.x-c.x,dy=bh.y-c.y,dd=Math.hypot(dx,dy);
   if(c.state==='fly'&&dd<230&&dd>1){const a=480*(1-dd/230)+90;c.vx+=dx/dd*a*sdt;c.vy+=dy/dd*a*sdt;if(Math.random()<0.5){this.burst.particleTint=C.vio;this.burst.emitParticleAt(c.x,c.y,1);}}
   if(!this.over&&dd<bh.r+6&&c.state==='fly'){this.ringWave(bh.x,bh.y,C.mag,2.5);this.lost();}}
  this.holes=this.holes.filter(bh=>{if(bh.y>this.camY+H+150){['glow','disk','ring','core','pull'].forEach(k=>bh[k].destroy());return false;}return true;});
  if(!this.over&&this.inv<=0)for(const h of this.haz){if(h.armed&&Math.hypot(h.x-c.x,(h.cy||h.y)-c.y)<20){this.damage('shard');break;}}
  if(this.tutStep<99&&!this.d.tut)this.fuel=Math.max(this.fuel,40);
  if(!this.over&&this.fuel<=0){this.fuel=0;this.end('fuel');}
  // camera (only rises)
  const ty=(c.state==='orbit'?c.node.y:c.y)-H*0.62;if(ty<this.camY)this.camY+=(ty-this.camY)*Math.min(1,dt*3.2);this.cameras.main.scrollY=this.camY;
  while(this.genY>this.camY-H*0.6)this.spawnRow();
  this.nodes=this.nodes.filter(n=>{if(n.alive&&n.y>this.camY+H+160&&n!==c.node)this.killNode(n);return n.alive;});
  this.haz=this.haz.filter(h=>{if(h.y>this.camY+H+120){h.g.destroy();h.s.destroy();h.tr.destroy();return false;}return true;});
  for(const m of this.motes){if(!m.dead&&Math.hypot(m.x-c.x,m.y-c.y)<24&&!this.over){m.dead=true;m.o.destroy();this.moteChain++;R.score+=5*this.mult();this.fuel=Math.min(100,this.fuel+2.5);Sfx.tone(Sfx.scaleHz(10+this.moteChain%8),0.25,'sine',0.07);this.sparks.explode(5,m.x,m.y);R.motes=(R.motes||0)+1;}}
  this.motes=this.motes.filter(m=>{if(!m.dead&&m.y>this.camY+H+100){m.o.destroy();m.dead=true;}return !m.dead;});if(c.state==='orbit')this.moteChain=0;
  this.height=Math.max(this.height||0,H-170-c.y);if(this.bestLine&&!this.passedBest&&this.height>this.bestH){this.passedBest=true;this.banner('PAST YOUR BEST','keep climbing');Sfx.gold();this.cameras.main.flash(200,255,201,74);this.bestTxt.setText('★ NEW BEST');}
  this.ghostUpdate(time);
  // comet visuals
  const blink=this.inv>0&&(time%160<80);this.cg.setPosition(c.x,c.y).setAlpha(blink?0.3:1).setScale(0.8+(this.overdrive?0.25:0)+Math.sin(time*0.02)*0.05);this.cc.setPosition(c.x,c.y).setAlpha(blink?0.4:1);
  c.trail.push(c.x,c.y);if(c.trail.length>52)c.trail.splice(0,2);const g=this.trailG;g.clear();const nn=c.trail.length/2;
  for(let i=1;i<nn;i++){const k=i/nn;let col=this.overdrive?(k>0.5?C.gold:0xFF8A3C):(k>0.5?this.skin.a:this.skin.b);if(this.skin.rainbow&&!this.overdrive)col=Phaser.Display.Color.HSVToRGB((k*0.6+time*0.0004)%1,0.6,1).color;
   g.lineStyle(13*k,col,0.75*k);g.lineBetween(c.trail[i*2-2],c.trail[i*2-1],c.trail[i*2],c.trail[i*2+1]);}
  // focus aim preview + meter
  const fg=this.fxG;fg.clear();
  if(holding){let px=c.x,py=c.y,vx=-Math.sin(c.ang)*c.dir,vy=Math.cos(c.ang)*c.dir,hit=null;
   for(let s=0;s<70&&!hit;s++){px+=vx*9;py+=vy*9;if(px<10||px>W-10)vx*=-1;for(const n of this.nodes){if(n.alive&&n!==c.node&&Math.hypot(n.x-px,n.y-py)<n.r+cr){hit=n;break;}}
    if(s%2===0){fg.fillStyle(hit?C.gold:C.text,0.7*(1-s/70));fg.fillCircle(px,py,2.5);}}
   if(hit){fg.lineStyle(3,C.gold,0.9);fg.strokeCircle(hit.x,hit.y,hit.r+8+Math.sin(time*0.02)*3);}
   fg.lineStyle(3,C.vio,0.9);fg.beginPath();fg.arc(c.x,c.y,18,-Math.PI/2,-Math.PI/2+Math.PI*2*this.focus/this.focusMax);fg.strokePath();}
  if(c.state==='orbit'&&c.node.type==='fragile'){fg.lineStyle(2,C.danger,0.8);fg.beginPath();fg.arc(c.node.x,c.node.y,c.node.r+4,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-c.node.orbitT/1.5));fg.strokePath();}
  this.drawHud();}
 // ---------- end ----------
 end(why){if(this.over)return;this.over=true;this.why=why;this.clearHint();Sfx.intensity=0;Sfx.over();this.press=null;
  const d=this.d,R=this.R,S=this.S;const dust=Math.floor(R.score/40)+R.loot;d.dust+=dust;d.runs++;
  const newBest=R.score>d.best;if(newBest)d.best=R.score;d.bestSector=Math.max(d.bestSector,this.daily?d.bestSector:this.sector+1);
  d.stats.perfects+=R.perfects;d.stats.latches+=R.latches;d.stats.golds+=R.golds;d.stats.banks+=R.banks;
  const h=Math.round(this.height||0);this.ghostSave(h,R.score);if(this.daily){if(d.daily.date!==today())d.daily={date:today(),best:0,plays:0,h:0};d.daily.plays++;d.daily.best=Math.max(d.daily.best,R.score);d.daily.h=Math.max(d.daily.h||0,h);}else if(this.sector===this.startSector&&this.startSector===0||true){if(!this.startSector)d.bestH=Math.max(d.bestH||0,h);}
  const rank0=rankOf(d.xp||0);d.xp=(d.xp||0)+R.latches+R.perfects*2+R.chords*5;const rank1=rankOf(d.xp);this.rankUp=rank1>rank0?rank1:0;if(this.rankUp){d.dust+=rank1*40;}
  if(R.time<35)d.assist=Math.min(1,d.assist+0.12);else if(R.time>80)d.assist=Math.max(0,d.assist-0.08);
  ensureMissions(d);const done=[];const val={latch:R.latches,perfect:R.perfects,combo:R.maxCombo,sector:this.sector+1,score:R.score,chord:R.chords,bank:R.banks,gold:R.golds};
  d.missions=d.missions.map(m=>{if(val[m.type]>=m.n){done.push(m);d.dust+=m.reward;d.mDone++;return null;}return m;}).filter(Boolean);ensureMissions(d);
  d.tut=true;S.save();
  this.time.delayedCall(900,()=>this.results(why,dust,newBest,done));}
 results(why,dust,newBest,done){const W=this.W,H=this.H,R=this.R,d=this.d;const L=[];const z=o=>{o.setScrollFactor(0).setDepth(1200);L.push(o);return o;};
  z(this.add.rectangle(W/2,H/2,W,H,C.void,0.78));
  const goals=[...SKINS.filter(s=>!d.skins.includes(s.id)).map(s=>({n:s.name+' trail',c:s.cost})),...UPGRADES.filter(u=>d.up[u.id]<u.max).map(u=>({n:u.name,c:upCost(u.id,d.up[u.id])}))].sort((a,b)=>a.c-b.c);
  const extra=done.length*24+(this.rankUp?26:0)+(goals[0]?24:0);let cH=Phaser.Math.Clamp(H-30-(396+extra)-70,70,140);
  cH=Math.min(cH,120);const ph=376+extra+cH,top=Math.max(12,(H-ph-60)/2);const pg=z(this.add.graphics());let y=top+28;
  z(txt(this,W/2,y,why==='fuel'?'BURNED OUT':why==='shard'?'SHATTERED':'LOST IN THE DARK',13,C.dim,{spacing:4}));y+=44;
  const sc=z(txt(this,W/2,y,'0',50,C.text,{glow:C.vio,blur:18}));const o={v:0};this.tweens.add({targets:o,v:R.score,duration:900,ease:'Cubic.out',onUpdate:()=>sc.setText(Math.round(o.v).toLocaleString())});y+=40;
  if(newBest){const nb=z(txt(this,W/2,y,'★ NEW BEST ★',17,C.gold,{glow:true}));nb.setScale(0);this.tweens.add({targets:nb,scale:1,delay:900,duration:400,ease:'Back.out',onStart:()=>{Sfx.gold();this.bigSparks.explode(40,W/2,this.camY+y);}});}
  else z(txt(this,W/2,y,'best '+d.best.toLocaleString(),13,C.dim));y+=38;
  const st=[['catches',R.latches,C.cyan],['perfect',R.perfects,C.gold],['chords',R.chords,C.mag],['max combo',R.maxCombo,C.cyan],['sector',this.sector+1,C.vio]];
  st.forEach(([k,v,col],i)=>{const x=W/2+(i-2)*((W-56)/5);z(txt(this,x,y,''+v,21,col));z(txt(this,x,y+22,k,9,C.dim,{spacing:1}));});y+=48;
  // the run's constellation
  const bx=36,bw=W-72,P=this.full;const cg=z(this.add.graphics());cg.fillStyle(C.void,0.6);cg.fillRoundedRect(bx-8,y,bw+16,cH,14);cg.lineStyle(1,C.vio,0.35);cg.strokeRoundedRect(bx-8,y,bw+16,cH,14);
  z(txt(this,bx,y+12,'YOUR CONSTELLATION',9,C.vio,{ox:0,spacing:2}));z(txt(this,bx+bw,y+12,'✦ perfect   ◯ chord',9,C.dim,{ox:1,spacing:1}));
  if(P.length>1){const xs=P.map(p=>p.x),ys=P.map(p=>p.y),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
   const sx=bw/Math.max(1,y1-y0),ih=cH-40,sy=ih/Math.max(60,x1-x0),oy=y+28+(ih-(x1-x0)*sy)/2;
   const g=z(this.add.graphics().setBlendMode('ADD'));const map=(p)=>({x:bx+(y1-p.y)*sx,y:oy+(p.x-x0)*sy});
   const prog={n:1};this.tweens.add({targets:prog,n:P.length,duration:Math.min(1600,P.length*40),delay:300,onUpdate:()=>this.constLines(g,P.slice(0,Math.ceil(prog.n)),map,0.6)});}
  else z(txt(this,W/2,y+cH/2+6,'no stars caught',12,C.dim));
  y+=cH+24;
  z(this.add.image(W/2-48,y,'prism').setTint(C.gold).setScale(0.2));z(txt(this,W/2-32,y,'+'+dust+' dust',19,C.gold,{ox:0}));y+=28;
  done.forEach((m,i)=>{const t=z(txt(this,W/2,y,'✓ '+m.text+'  +'+m.reward,12,C.gold,{weight:'600'}));t.setAlpha(0);this.tweens.add({targets:t,alpha:1,delay:1100+i*250,duration:300,onStart:()=>Sfx.buy()});y+=24;});
  if(this.rankUp){const t=z(txt(this,W/2,y,'RANK UP → '+RANKS[this.rankUp].toUpperCase()+'  +'+this.rankUp*40,14,C.cyan,{glow:true}));t.setScale(0);this.tweens.add({targets:t,scale:1,delay:1400,duration:450,ease:'Back.out',onStart:()=>Sfx.sector()});y+=26;}
  const g0=goals[0];if(g0){z(txt(this,W/2,y,d.dust>=g0.c?`You can afford ${g0.n}! → Hangar`:`${(g0.c-d.dust)} dust to ${g0.n}`,12,d.dust>=g0.c?C.gold:C.vio,{weight:'600'}));y+=24;}
  y+=12;const ph2=y+62+18-top;pg.fillStyle(C.ink,0.94);pg.fillRoundedRect(14,top,W-28,ph2,22);pg.lineStyle(2,C.vio,0.7);pg.strokeRoundedRect(14,top,W-28,ph2,22);
  z(button(this,W/2,y+31,236,62,'AGAIN',C.cyan,()=>{this.cameras.main.fadeOut(160,11,10,31);this.time.delayedCall(170,()=>this.scene.restart({daily:this.daily,start:this.startSector}));},{size:26,solid:true,breathe:true,spacing:6}));
  const by=top+ph2+34,bw2=(W-28-20)/3;
  z(button(this,14+bw2/2,by,bw2,44,'MENU',C.vio,()=>this.scene.start('Menu'),{size:14,spacing:2}));
  z(button(this,W/2,by,bw2,44,'SHARE',C.cyan,()=>this.share(),{size:14,spacing:2}));
  z(button(this,W-14-bw2/2,by,bw2,44,'HANGAR',C.mag,()=>this.scene.start('Hangar'),{size:14,spacing:2}));
  L.forEach((o,i)=>{if(o.alpha===0)return;const a=o.alpha;o.setAlpha(0);this.tweens.add({targets:o,alpha:a,duration:300,delay:i*20});});}
 share(){const R=this.R,bars='▁▂▃▄▅▆▇█';const mel=this.full.slice(0,28).map((p,i)=>p.p?'✦':bars[Math.floor((((i+1)%10)/10)*8)]).join('');
  const url=location.origin+location.pathname;const text=`ORBITUNE${this.daily?' · Daily '+today():''}\n${R.score.toLocaleString()} pts · sector ${this.sector+1} · ${R.latches} catches · ${R.perfects} perfect · ${R.chords} chords\n♪ ${mel}\nBeat my song: ${url}`;
  const toast=(m)=>{const t=txt(this,this.W/2,this.H-24,m,13,C.cyan).setScrollFactor(0).setDepth(1300);this.tweens.add({targets:t,alpha:0,delay:1400,duration:400,onComplete:()=>t.destroy()});};
  if(navigator.share){navigator.share({title:'Orbitune',text}).catch(()=>{});}
  else if(navigator.clipboard){navigator.clipboard.writeText(text).then(()=>toast('Run copied to clipboard'),()=>toast('Could not copy'));}else toast('Sharing not supported');
  this.lastShare=text;}
}
