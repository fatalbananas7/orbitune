import {Boot} from './boot.js';import {Menu,Hangar} from './menu.js';import {Game} from './game.js';import {Save} from './save.js';import {Sfx} from './audio.js';
const W=390,H=Math.round(Math.min(900,Math.max(640,390*innerHeight/innerWidth)));
const save=Save;save.load();Sfx.muted=!!save.d.muted;
const game=new Phaser.Game({type:Phaser.AUTO,parent:'game',width:W,height:H,backgroundColor:'#0B0A1F',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},
 render:{antialias:true,powerPreference:'high-performance'},input:{activePointers:3},fps:{target:60},scene:[Boot,Menu,Hangar,Game],callbacks:{preBoot:(g)=>g.registry.set('save',save)}});
window.__game=game;
document.addEventListener('gesturestart',e=>e.preventDefault());document.addEventListener('dblclick',e=>e.preventDefault());
document.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
