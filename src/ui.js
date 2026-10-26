import {R,LW,LH,TS,setupCam} from './dims.js?v=3';
import {Sfx} from './audio.js?v=3';
export const FONT='"Segoe UI",Roboto,"Helvetica Neue",system-ui,sans-serif';
export const C={void:0x0B0A1F,ink:0x1A1640,dusk:0x3B1E6E,cyan:0x3EF2E0,mag:0xFF4FD8,vio:0x9B7BFF,gold:0xFFC94A,danger:0xFF5A3C,text:0xF4F1FF,dim:0x8E87C9};
export const hex=(n)=>'#'+n.toString(16).padStart(6,'0');
export function txt(s,x,y,str,size=20,color=C.text,opts={}){const t=s.add.text(x,y,str,{fontFamily:FONT,fontSize:size+'px',fontStyle:opts.weight||'bold',color:hex(color),align:opts.align||'center',resolution:Math.max(2,R*1.25),wordWrap:opts.wrap?{width:opts.wrap}:undefined}).setOrigin(opts.ox??0.5,opts.oy??0.5);
 if(opts.glow){const b=opts.blur||14;t.setPadding(b,b,b,b);t.setShadow(0,0,hex(opts.glow===true?color:opts.glow),b,true,true);}if(opts.spacing)t.setLetterSpacing(opts.spacing);return t;}
export function panel(s,x,y,w,h,color=C.vio,alpha=0.85){const g=s.add.graphics();g.fillStyle(C.ink,alpha);g.fillRoundedRect(x-w/2,y-h/2,w,h,22);g.lineStyle(2,color,0.7);g.strokeRoundedRect(x-w/2,y-h/2,w,h,22);return g;}
export function button(s,x,y,w,h,label,color,cb,opts={}){
 const c=s.add.container(x,y);const g=s.add.graphics();
 const draw=(hl)=>{g.clear();g.fillStyle(color,hl?0.38:(opts.solid?0.3:0.16));g.fillRoundedRect(-w/2,-h/2,w,h,Math.min(h/2,24));g.lineStyle(2,color,1);g.strokeRoundedRect(-w/2,-h/2,w,h,Math.min(h/2,24));};
 draw(false);
 const glow=s.add.image(0,0,'glow').setTint(color).setAlpha(opts.solid?0.35:0.18).setBlendMode(Phaser.BlendModes.ADD).setDisplaySize(w*1.5,h*2.4);
 const t=txt(s,0,opts.sub?-7:0,label,opts.size||22,C.text,{spacing:opts.spacing??1});c.add([glow,g,t]);
 if(opts.sub){c.sub=txt(s,0,13,opts.sub,12,color,{weight:'600'});c.add(c.sub);}
 c.setSize(w,h);c.setInteractive({useHandCursor:true});c.label=t;c.glowImg=glow;c.redraw=draw;
 let down=false;
 c.on('pointerdown',()=>{down=true;draw(true);s.tweens.add({targets:c,scale:0.93,duration:70,ease:'Quad.out'});Sfx.init();Sfx.click();if(navigator.vibrate)try{navigator.vibrate(8)}catch(e){}});
 c.on('pointerup',()=>{if(!down)return;down=false;draw(false);s.tweens.add({targets:c,scale:1,duration:220,ease:'Back.out'});cb&&cb(c);});
 c.on('pointerout',()=>{down=false;draw(false);s.tweens.add({targets:c,scale:1,duration:150});});
 if(opts.breathe)s.tweens.add({targets:glow,alpha:0.5,duration:900,yoyo:true,repeat:-1,ease:'Sine.inOut'});
 return c;}
export function muteBtn(s,x,y){const c=s.add.container(x,y);const g=s.add.graphics();c.add(g);
 const draw=()=>{g.clear();g.lineStyle(2,C.dim,1);g.strokeCircle(0,0,18);g.fillStyle(C.text,1);g.fillRect(-8,-4,5,8);g.fillTriangle(-3,-4,4,-10,4,10);g.fillTriangle(-3,4,4,-10,-3,-4);
  if(Sfx.muted){g.lineStyle(3,C.danger,1);g.lineBetween(-10,-10,10,10);}else{g.lineStyle(2,C.text,1);g.beginPath();g.arc(5,0,6,-1,1);g.strokePath();}};
 draw();c.setSize(44,44);c.setInteractive({useHandCursor:true});
 c.on('pointerup',()=>{Sfx.init();Sfx.setMuted(!Sfx.muted);s.registry.get('save').d.muted=Sfx.muted;s.registry.get('save').save();draw();s.tweens.add({targets:c,scale:{from:0.8,to:1},duration:250,ease:'Back.out'});});
 return c;}
export function background(s,tint){
 const W=LW,H=LH;
 s.cameras.main.setBackgroundColor(C.void);
 const neb=s.add.image(W/2,H/2,'nebula').setScrollFactor(0).setDisplaySize(W*1.4,H*1.4).setAlpha(0.9);if(tint)neb.setTint(tint);
 const l=[0.08,0.22,0.5].map((f,i)=>{const t=s.add.tileSprite(W/2,H/2,W,H,'stars'+i).setScrollFactor(0).setTileScale(1/TS);t.f=f;return t;});
 return {neb,layers:l,update(scrollY,time){l.forEach(t=>{t.tilePositionY=scrollY*t.f*TS;});neb.rotation=Math.sin(time*0.00005)*0.05;}};}
export function vignette(s){const W=LW,H=LH;return s.add.image(W/2,H/2,'vignette').setScrollFactor(0).setDisplaySize(W,H).setDepth(900);}
