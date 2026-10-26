// Procedural Web Audio: catch notes in A minor pentatonic, ambient pad, adaptive arpeggio.
const SCALE=[0,3,5,7,10];
const hz=(semi)=>220*Math.pow(2,semi/12);
export const Sfx={ctx:null,muted:false,intensity:0,key:0,
 init(){if(this.ctx){if(this.ctx.state!=='running')this.ctx.resume();return;}
  const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=this.ctx=new C();
  this.master=c.createGain();this.master.gain.value=this.muted?0:0.8;
  const comp=c.createDynamicsCompressor();comp.threshold.value=-14;this.master.connect(comp);comp.connect(c.destination);
  // reverb
  this.verb=c.createConvolver();const len=c.sampleRate*2.2,b=c.createBuffer(2,len,c.sampleRate);
  for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3);}
  this.verb.buffer=b;this.wet=c.createGain();this.wet.gain.value=0.35;this.verb.connect(this.wet);this.wet.connect(this.master);
  this.noiseBuf=c.createBuffer(1,c.sampleRate,c.sampleRate);const nd=this.noiseBuf.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
  this.step=0;this.next=c.currentTime+0.1;this.timer=setInterval(()=>this.sched(),30);},
 setMuted(m){this.muted=m;if(this.master)this.master.gain.setTargetAtTime(m?0:0.8,this.ctx.currentTime,0.05);},
 tone(f,dur,type='sine',vol=0.2,when=0,verb=true,attack=0.005){if(!this.ctx)return;const c=this.ctx,t=c.currentTime+when;
  const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+attack);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g);g.connect(this.master);if(verb)g.connect(this.verb);o.start(t);o.stop(t+dur+0.05);return o;},
 noise(dur,freq,vol=0.2,type='bandpass',when=0,sweep=0){if(!this.ctx)return;const c=this.ctx,t=c.currentTime+when;const s=c.createBufferSource();s.buffer=this.noiseBuf;
  const f=c.createBiquadFilter();f.type=type;f.frequency.setValueAtTime(freq,t);if(sweep)f.frequency.exponentialRampToValueAtTime(sweep,t+dur);f.Q.value=1.2;
  const g=c.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);s.connect(f);f.connect(g);g.connect(this.master);s.start(t);s.stop(t+dur+0.05);},
 scaleHz(i){const o=Math.floor(i/5),s=SCALE[((i%5)+5)%5];return hz(s+12*o+this.key);},
 catchNote(combo,perfect){const i=8+(combo%10);const f=this.scaleHz(i);this.tone(f,0.9,'triangle',0.22);this.tone(f*2,0.5,'sine',0.07,0.0);if(perfect){this.tone(f*1.5,1.2,'sine',0.12,0.06);this.tone(f*3,0.4,'sine',0.05,0.1);}},
 chord(combo){const b=5+(combo%5);[0,2,4].forEach((k,j)=>this.tone(this.scaleHz(b+k),1.6,'triangle',0.13,j*0.05));},
 launch(){this.noise(0.25,600,0.12,'bandpass',0,2400);},
 bounce(){this.tone(320,0.12,'square',0.05,0,false);this.noise(0.08,1800,0.08);},
 hit(){this.noise(0.5,900,0.35,'lowpass',0,120);this.tone(90,0.4,'sawtooth',0.18,0,false);},
 gold(){[0,4,7,12,16].forEach((s,j)=>this.tone(hz(s+24+this.key),0.6,'sine',0.1,j*0.06));},
 overdrive(){if(!this.ctx)return;this.noise(0.9,300,0.16,'bandpass',0,6000);[0,4,7,12,16,19].forEach((k,j)=>this.tone(this.scaleHz(5)*Math.pow(2,k/12),0.9,'sawtooth',0.04,0.05+j*0.05));this.tone(55,0.6,'sine',0.3,0.3,false);[0,7,12].forEach((k,j)=>this.tone(this.scaleHz(10)*Math.pow(2,k/12),1.8,'triangle',0.1,0.32));},
 event(){if(!this.ctx)return;this.tone(41,2.5,'sine',0.35,0,true,0.4);this.tone(43.6,2.5,'sine',0.2,0,true,0.4);this.noise(2.2,200,0.12,'lowpass',0,60);},
 setSector(s){const P=[[0,2,4,2,1,3,4,3],[0,4,2,4,1,4,3,4],[4,3,2,0,4,3,1,0],[0,0,3,3,2,2,4,4],[0,1,0,4,0,1,0,3],[0,2,4,5,4,2,1,3]];this.pat=P[s%6];this.key=[0,2,-3,5,-5,7][s%6];},
 click(){this.tone(1200,0.06,'sine',0.08,0,false);},
 buy(){[0,7,12].forEach((s,j)=>this.tone(hz(s+19),0.4,'triangle',0.12,j*0.07));},
 sector(){[0,3,7,10,14].forEach((s,j)=>this.tone(hz(s+12+this.key),1.5,'triangle',0.1,j*0.09));},
 over(){[7,3,0,-5].forEach((s,j)=>this.tone(hz(s+12),1.0,'triangle',0.12,j*0.18));},
 sched(){const c=this.ctx;if(!c||this.muted)return;const spb=60/96/2;
  while(this.next<c.currentTime+0.15){const st=this.step,w=this.next-c.currentTime;const bar=Math.floor(st/16)%4,prog=[0,-4,-2,-7][bar];
   if(st%16===0){this.tone(hz(prog-12+this.key),spb*16,'sine',0.09,w,true,0.6);this.tone(hz(prog-5+this.key),spb*16,'triangle',0.03,w,true,1.2);}
   if(this.intensity>0.25&&st%2===0){const a=(this.pat||[0,2,4,2,1,3,4,3])[(st/2)%8];this.tone(this.scaleHz(5+a)*Math.pow(2,prog/12),spb*1.5,'sine',0.035*Math.min(1,this.intensity*1.5),w);}
   if(this.intensity>0.55&&st%4===2)this.noise(0.04,7000,0.03,'highpass',w);
   if(this.intensity>0.8&&st%8===0)this.tone(60,0.15,'sine',0.12,w,false);
   this.next+=spb;this.step++;}}
};
