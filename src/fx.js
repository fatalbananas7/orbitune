// Central feedback intensity. Tune here. v7: ~0.7-0.8 of v6 values; REDUCED FX halves again.
export const FX={flashA:0.72,flashD:0.85,shake:0.72,shakeD:0.85,punch:0.72,vib:0.7,hit:0.8,reduced:false,vibOn:true,log:[]};
const k=()=>FX.reduced?0.5:1;
export function setFX(d){FX.reduced=!!d.fxr;FX.vibOn=d.vib!==false;}
const rec=(t,v)=>{if(FX.log.length<400)FX.log.push([t,v]);};
export function flash(cam,d,r,g,b){const a=FX.flashA*k(),dd=Math.round(d*FX.flashD);cam.flash(dd,r,g,b,true);cam.flashEffect._alpha=a;rec('flash',[dd,a]);}
export function shake(cam,d,i){const ii=i*FX.shake*k(),dd=Math.round(d*FX.shakeD);cam.shake(dd,ii,true);rec('shake',[dd,+ii.toFixed(4)]);}
export const punchZ=(z)=>{const v=1+(z-1)*FX.punch*k();rec('punch',+v.toFixed(4));return v;};
export const hit=(t)=>{const v=t*FX.hit*(FX.reduced?0.6:1);rec('hit',+v.toFixed(3));return v;};
export function vib(p){if(!FX.vibOn||!navigator.vibrate)return;const s=FX.vib*k();const q=Array.isArray(p)?p.map((x,i)=>i%2?x:Math.max(1,Math.round(x*s))):Math.max(1,Math.round(p*s));rec('vib',q);try{navigator.vibrate(q)}catch(e){}}
if(typeof window!=='undefined')window.__FX=FX;
export const fa=(a)=>{const v=a*FX.flashA*(FX.reduced?0.5:1);rec('overlay',+v.toFixed(3));return v;};
