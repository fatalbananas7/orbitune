// Render at native device resolution: logical layout stays 390 x LH CSS-ish units,
// the backing canvas is LW*R x LH*R and every camera zooms by R.
const LW=390;
const LH=Math.round(Math.min(900,Math.max(640,LW*innerHeight/innerWidth)));
const MAX_PX=2.7e6;let q=1;try{q=+localStorage.getItem('orbitune_q')||1}catch(e){}
const dpr=Math.min(window.devicePixelRatio||1,3);
export const R=Math.max(1,Math.min(dpr*q,Math.sqrt(MAX_PX/(LW*LH))));
export {LW,LH};
export const TS=Math.max(2,Math.ceil(R)); // texture supersampling
export function setupCam(scene){scene.cameras.main.setOrigin(0,0).setZoom(R);return scene.cameras.main;}
window.ORB={R,LW,LH,TS};
