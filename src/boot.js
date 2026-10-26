import {R,LW,LH,TS,setupCam} from './dims.js?v=4';
import {C} from './ui.js?v=4';
export class Boot extends Phaser.Scene{constructor(){super('Boot')}
 create(){const W=LW,H=LH,tx=this.textures;
  // supersampled canvas textures: drawn at TS x, frame resized to logical size with full-source UVs so scale math is unchanged
  const dither=(c,W2,H2)=>{const id=c.getImageData(0,0,W2,H2),a=id.data;for(let i=3;i<a.length;i+=4){if(a[i]>0&&a[i]<255)a[i]=Math.max(0,Math.min(255,a[i]+(Math.random()*2-1)*1.5));}c.putImageData(id,0,0);};
  const cv=(k,w,h,fn,o={})=>{const S=o.s||TS;const t=tx.createCanvas(k,w*S,h*S);const c=t.getContext();c.imageSmoothingEnabled=true;c.save();c.scale(S,S);fn(c,w,h);c.restore();if(o.dither)dither(c,w*S,h*S);t.refresh();
   if(!o.noTrim){const f=t.get(),u=[f.u0,f.v0,f.u1,f.v1];f.setSize(w,h,0,0);[f.u0,f.v0,f.u1,f.v1]=u;}t.setFilter(Phaser.Textures.FilterMode.LINEAR);};
  cv('glow',128,128,(c)=>{const g=c.createRadialGradient(64,64,0,64,64,64);const P=[[0,1],[0.25,0.45],[0.6,0.1],[1,0]];for(let i=0;i<=24;i++){const x=i/24;let j=0;while(x>P[j+1][0])j++;const t=(x-P[j][0])/(P[j+1][0]-P[j][0]),e=t*t*(3-2*t);g.addColorStop(x,`rgba(255,255,255,${(P[j][1]+(P[j+1][1]-P[j][1])*e).toFixed(4)})`);}c.fillStyle=g;c.fillRect(0,0,128,128);},{dither:true});
  cv('dot',32,32,(c)=>{const g=c.createRadialGradient(16,16,0,16,16,16);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(0.35,'rgba(255,255,255,0.8)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,32,32);});
  cv('spark',32,8,(c)=>{const g=c.createLinearGradient(0,0,32,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(255,255,255,1)');c.fillStyle=g;c.beginPath();c.ellipse(16,4,16,3,0,0,7);c.fill();});
  cv('node',128,128,(c)=>{// dark core, luminous rim (tinted at runtime)
   const g=c.createRadialGradient(64,64,0,64,64,62);g.addColorStop(0,'rgba(40,36,90,1)');g.addColorStop(0.62,'rgba(20,18,50,1)');g.addColorStop(0.8,'rgba(255,255,255,0.95)');g.addColorStop(0.9,'rgba(255,255,255,0.5)');g.addColorStop(1,'rgba(255,255,255,0)');
   c.fillStyle=g;c.beginPath();c.arc(64,64,62,0,7);c.fill();
   const h=c.createRadialGradient(46,44,0,46,44,30);h.addColorStop(0,'rgba(255,255,255,0.35)');h.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=h;c.beginPath();c.arc(64,64,48,0,7);c.fill();
   c.fillStyle='rgba(255,255,255,0.9)';c.beginPath();c.arc(64,64,5,0,7);c.fill();});
  cv('ring',128,128,(c)=>{c.strokeStyle='white';c.lineWidth=3;c.beginPath();c.arc(64,64,60,0,7);c.stroke();});
  cv('dash',128,128,(c)=>{c.strokeStyle='white';c.lineWidth=2;c.setLineDash([6,9]);c.beginPath();c.arc(64,64,61,0,7);c.stroke();});
  cv('shard',64,64,(c)=>{c.fillStyle='white';c.beginPath();for(let i=0;i<12;i++){const a=i*Math.PI/6,r=i%2?11:30;c.lineTo(32+Math.cos(a)*r,32+Math.sin(a)*r);}c.closePath();c.fill();c.fillStyle='rgba(11,10,31,0.8)';c.beginPath();c.arc(32,32,6,0,7);c.fill();});
  cv('prism',96,96,(c)=>{c.fillStyle='white';c.beginPath();c.moveTo(48,6);c.lineTo(86,48);c.lineTo(48,90);c.lineTo(10,48);c.closePath();c.fill();c.fillStyle='rgba(255,255,255,0.35)';c.beginPath();c.moveTo(48,6);c.lineTo(48,90);c.lineTo(10,48);c.closePath();c.fill();});
  cv('vignette',256,512,(c,w,h)=>{const g=c.createRadialGradient(w/2,h/2,h*0.22,w/2,h/2,h*0.62);g.addColorStop(0,'rgba(5,4,16,0)');g.addColorStop(1,'rgba(5,4,16,0.75)');c.fillStyle=g;c.fillRect(0,0,w,h);},{dither:true});
  cv('nebula',256,512,(c,w,h)=>{const blobs=[[60,120,140,'59,30,110'],[200,300,160,'255,79,216'],[90,420,130,'62,242,224'],[180,60,100,'155,123,255']];
   blobs.forEach(([x,y,r,col],i)=>{const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${col},${i?0.13:0.5})`);g.addColorStop(1,`rgba(${col},0)`);c.fillStyle=g;c.fillRect(0,0,w,h);});},{dither:true});
  const cols=['#F4F1FF','#9B7BFF','#3EF2E0','#FFC94A'];
  [[0.9,120,0.5],[1.4,60,0.7],[2.2,22,0.9]].forEach(([sz,n,a],i)=>cv('stars'+i,256,512,(c)=>{for(let k=0;k<n;k++){c.globalAlpha=a*(0.3+Math.random()*0.7);c.fillStyle=cols[Math.random()<0.75?0:1+Math.floor(Math.random()*3)];c.beginPath();c.arc(Math.random()*256,Math.random()*512,sz*(0.5+Math.random()*0.7),0,7);c.fill();}},{noTrim:true}));
  this.scene.start('Menu');}
}
