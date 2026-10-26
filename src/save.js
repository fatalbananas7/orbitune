const KEY='orbitune_v1';
const DEF={dust:0,best:0,bestSector:0,up:{focus:0,catch:0,heart:0,fuel:0},skins:['ember'],skin:'ember',muted:false,missions:[],mDone:0,daily:{date:'',best:0,plays:0},runs:0,stats:{perfects:0,latches:0,golds:0,banks:0},tut:false,assist:0.3,recent:[],mode:'endless',bestSR:{score:0,sector:0,stars:{}},seen:{},lv:{u:1,st:{},b:{}},fxr:false,vib:true};
export const Save={d:null,
 load(){let raw={};try{raw=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){}
  const d=JSON.parse(JSON.stringify(DEF));for(const k in raw){if(d[k]&&typeof d[k]==='object'&&!Array.isArray(d[k]))Object.assign(d[k],raw[k]);else d[k]=raw[k];}
  if(!d.lvMig){d.lvMig=1;const c=(d.bestSR&&d.bestSR.sector)||0;d.lv.u=Math.max(d.lv.u||1,1+Math.min(c,5));}
  d.lv.u=Math.max(1,Math.min(14,d.lv.u|0||1));if(typeof d.lv.st!=='object'||!d.lv.st)d.lv.st={};if(typeof d.lv.b!=='object'||!d.lv.b)d.lv.b={};if(typeof d.mode!=='string')d.mode='endless';
  this.d=d;return d;},
 save(){try{localStorage.setItem(KEY,JSON.stringify(this.d))}catch(e){}},
 reset(){localStorage.removeItem(KEY);this.load();}
};
export const SKINS=[
 {id:'ember',name:'Ember',cost:0,a:0xFFC94A,b:0xFF4FD8},
 {id:'tide',name:'Tidewake',cost:150,a:0x3EF2E0,b:0x9B7BFF},
 {id:'hymn',name:'Hymnal',cost:300,a:0xF4F1FF,b:0x9B7BFF},
 {id:'solar',name:'Solar Wind',cost:500,a:0xFFE7A0,b:0xFF8A3C},
 {id:'prism',name:'Prism',cost:900,a:0xFFFFFF,b:0x3EF2E0,rainbow:true},
 {id:'void',name:'Event Horizon',cost:1500,a:0x1A1640,b:0xFF4FD8,dark:true},
];
export const UPGRADES=[
 {id:'focus',name:'Deep Focus',desc:'+30% focus meter',max:4},
 {id:'catch',name:'Gravity Well',desc:'+6 catch radius',max:4},
 {id:'fuel',name:'Cold Burn',desc:'-9% fuel drain',max:4},
 {id:'heart',name:'Halo Shield',desc:'+1 shield per run',max:2},
];
export const upCost=(id,l)=>Math.round((id==='heart'?220:70)*Math.pow(l+1,1.7));
const POOL=[
 ['latch','Catch {n} stars in one run',[25,40,60,90]],
 ['perfect','Land {n} perfect catches in a run',[5,10,18,30]],
 ['combo','Reach a {n}x combo',[10,20,35,50]],
 ['sector','Reach sector {n}',[2,3,4,5,6]],
 ['score','Score {n} in one run',[1500,4000,8000,15000]],
 ['chord','Play {n} chords (3 same colour)',[2,4,7]],
 ['bank','Catch {n} bank shots (bounce first)',[1,3,6]],
 ['gold','Crack {n} prism stars',[1,2,4]],
 ['charged','Catch {n} charged stars tightly',[1,2,3]],
];
export function newMission(level){const p=POOL[Math.floor(Math.random()*POOL.length)];const t=p[2][Math.min(p[2].length-1,Math.floor(level/3)+Math.floor(Math.random()*2))];return {type:p[0],n:t,text:p[1].replace('{n}',t.toLocaleString()),reward:Math.round(40+t/(p[0]==='score'?60:1)*(p[0]==='score'?1:6)+level*8),prog:0};}
export function ensureMissions(d){d.missions=(d.missions||[]).filter(m=>m&&m.type);const seen=new Set();d.missions=d.missions.filter(m=>!seen.has(m.type)&&seen.add(m.type));while(d.missions.length<3){let m,k=0;do{m=newMission(d.mDone)}while(seen.has(m.type)&&k++<30);seen.add(m.type);d.missions.push(m);}}
