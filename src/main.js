import {Boot} from './boot.js?v=7';import {Menu,Hangar,Levels} from './menu.js?v=7';import {Game} from './game.js?v=7';import {Save} from './save.js?v=7';import {Sfx} from './audio.js?v=7';
import {R,LW,LH} from './dims.js?v=7';
const save=Save;save.load();Sfx.muted=!!save.d.muted;
const game=new Phaser.Game({type:Phaser.AUTO,parent:'game',width:Math.round(LW*R),height:Math.round(LH*R),backgroundColor:'#0B0A1F',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},
 render:{antialias:true,pixelArt:false,roundPixels:false,mipmapFilter:'',powerPreference:'high-performance'},input:{activePointers:3},fps:{target:60},scene:[Boot,Menu,Hangar,Levels,Game],callbacks:{preBoot:(g)=>g.registry.set('save',save)}});
window.__game=game;
document.addEventListener('gesturestart',e=>e.preventDefault());document.addEventListener('dblclick',e=>e.preventDefault());
document.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
