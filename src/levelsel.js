import {R,LW,LH,setupCam} from './dims.js?v=8';
import {C,txt,button,background,vignette} from './ui.js?v=8';
import {Sfx} from './audio.js?v=8';
import {LEVELS} from './levels.js?v=8';
import {shake,setFX} from './fx.js?v=8';
const HAZ=['calm','drift','drift','shards','shards','cracked','cracked','black holes','pulsars','black holes','mixed','shards','black holes','mixed'];
export class Levels extends Phaser.Scene{constructor(){super('Levels')}
 create(){setupCam(this);const W=LW,H=LH,S=this.registry.get('save'),d=S.d;setFX(d);const lv=d.lv;this.bg=background(this,0xD8C4FF);
  const u=lv.u,first=LEVELS.findIndex((L,i)=>!lv.st[i]),next=Math.min(u-1,first<0?u-1:first);this.next=next;
  const HEAD=118,RH=82,top=HEAD+14,cont=this.add.container(0,0).setDepth(2);this.cont=cont;
  const path=this.add.graphics();cont.add(path);
  LEVELS.forEach((L,i)=>{const y=top+i*RH+RH/2,cx=48,locked=i>=u,done=!!lv.st[i],isN=i===next&&!locked;const a=locked?0.45:1;
   if(i<LEVELS.length-1){path.lineStyle(2,i+1<u?C.vio:C.ink,i+1<u?0.6:1);path.lineBetween(cx,y+22,cx,y+RH-22);}
   const g=this.add.graphics();cont.add(g);const col=isN?C.cyan:done?C.vio:C.dim;
   g.fillStyle(C.ink,locked?0.55:0.8);g.fillRoundedRect(16,y-RH/2+6,W-32,RH-12,16);g.lineStyle(isN?2:1.2,col,isN?1:locked?0.25:0.55);g.strokeRoundedRect(16,y-RH/2+6,W-32,RH-12,16);
   if(isN){const gl=this.add.image(cx,y,'glow').setTint(C.cyan).setBlendMode('ADD').setScale(1.1).setAlpha(0.5);cont.add(gl);this.tweens.add({targets:gl,alpha:0.15,scale:1.4,duration:900,yoyo:true,repeat:-1,ease:'Sine.inOut'});}
   g.fillStyle(done?C.vio:C.void,done?0.4:1);g.fillCircle(cx,y,21);g.lineStyle(2,col,locked?0.4:1);g.strokeCircle(cx,y,21);
   if(locked){g.fillStyle(C.dim,0.8);g.fillRoundedRect(cx-8,y-2,16,12,3);g.lineStyle(2.2,C.dim,0.8);g.beginPath();g.arc(cx,y-3,5.5,Math.PI,0);g.strokePath();}
   else cont.add(txt(this,cx,y,''+(i+1),18,isN?C.cyan:C.text,{weight:'700'}));
   cont.add(txt(this,82,y-12,L.n,16,locked?C.dim:C.text,{ox:0,weight:'700',spacing:1}).setAlpha(locked?0.7:1));
   cont.add(txt(this,82,y+10,locked?'clear level '+i+' to unlock':'LEVEL '+(i+1)+' · '+HAZ[i],11,locked?C.dim:isN?C.cyan:C.vio,{ox:0,weight:'600',spacing:1}).setAlpha(a));
   const st=lv.st[i]||0;if(!locked){cont.add(txt(this,W-30,y-11,'★'.repeat(st)+'☆'.repeat(3-st),17,st?C.gold:C.dim,{ox:1,spacing:3}));
    cont.add(txt(this,W-30,y+11,isN&&!done?'NEXT UP ▸':lv.b[i]?'best '+lv.b[i].toLocaleString():'',11,isN&&!done?C.cyan:C.dim,{ox:1,weight:'700',spacing:isN&&!done?2:0}));}});
  const listH=top+LEVELS.length*RH+90;this.minY=Math.min(0,H-listH);
  // header (opaque strip over list)
  const hg=this.add.graphics().setDepth(5);hg.fillStyle(C.void,0.96);hg.fillRect(0,0,W,HEAD);hg.lineStyle(1,C.vio,0.4);hg.lineBetween(16,HEAD,W-16,HEAD);
  const z=o=>o.setDepth(6);
  z(txt(this,W/2,48,'LEVELS',28,C.text,{glow:C.vio,blur:16,spacing:6}));
  const cl=Object.keys(lv.st).length,stt=Object.values(lv.st).reduce((a,b)=>a+b,0);
  z(txt(this,W/2,84,cl+'/'+LEVELS.length+' cleared   ·   ',12,C.vio,{weight:'700',spacing:2,ox:1}));z(txt(this,W/2,84,'★ '+stt+'/'+LEVELS.length*3,12,C.gold,{weight:'700',spacing:2,ox:0}));
  z(button(this,46,48,60,36,'‹',C.vio,()=>this.scene.start('Menu',{quick:true}),{size:22,spacing:0}));
  // footer fade
  const fg=this.add.image(W/2,H,'vignette').setDepth(4).setAlpha(0);vignette(this);
  // scroll: drag + wheel; tap = start
  this.input.on('pointerdown',p=>{if(p.y/R<HEAD)return;this.drag={y0:p.y/R,c0:cont.y,mv:0,t:this.time.now};this.vel=0;});
  this.input.on('pointermove',p=>{const D=this.drag;if(!D||!p.isDown)return;const ny=Phaser.Math.Clamp(D.c0+(p.y/R-D.y0),this.minY-40,40);this.vel=ny-cont.y;cont.y=ny;D.mv=Math.max(D.mv,Math.abs(p.y/R-D.y0));});
  this.input.on('pointerup',p=>{const D=this.drag;this.drag=null;if(!D)return;if(D.mv>10)return;const ly=p.y/R-cont.y-top,i=Math.floor(ly/RH);if(i<0||i>=LEVELS.length)return;
   if(i>=u){Sfx.init();shake(this.cameras.main,120,0.004);const t=txt(this,W/2,p.y/R-20,'LOCKED · clear level '+i+' first',13,C.dim,{weight:'700'}).setDepth(7);this.tweens.add({targets:t,y:t.y-30,alpha:0,duration:1100,onComplete:()=>t.destroy()});return;}
   Sfx.init();Sfx.click();this.start(i);});
  this.input.on('wheel',(p,o,dx,dy)=>{cont.y=Phaser.Math.Clamp(cont.y-dy*0.6,this.minY,0);});
  cont.y=Phaser.Math.Clamp(H*0.55-(top+next*RH+RH/2),this.minY,0);
  this.cameras.main.fadeIn(200,11,10,31);window.__lvsel={top,RH,HEAD};}
 start(i){if(this.going)return;this.going=1;this.cameras.main.fadeOut(200,11,10,31);this.time.delayedCall(210,()=>this.scene.start('Game',{mode:'sector',level:i}));}
 update(t){if(!this.drag&&this.vel){this.cont.y=Phaser.Math.Clamp(this.cont.y+this.vel,this.minY,0);this.vel*=0.9;if(Math.abs(this.vel)<0.2)this.vel=0;}
  if(!this.drag)this.cont.y+=((Phaser.Math.Clamp(this.cont.y,this.minY,0))-this.cont.y)*0.25;this.bg.update(t*0.02,t);}
}
