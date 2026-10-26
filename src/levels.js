// v7 Sectors mode: sequential levels. t = theme (sector visuals/name), d = density/size ramp (0..6.5)
// mv/fr/pu = cumulative star-type thresholds (moving / fragile / pulsar), ho = black-hole chance, sh = shard chance, ss = shard speed, ch = charged stars
const L=(n,t,d,mv,fr,pu,ho,sh,ss,ch,tag)=>({n,t,d,mv,fr,pu,ho,sh,ss,ch,tag});
export const LEVELS=[
 L('The Nursery',0,0,0,0,0,0,0,1,0,'gentle start'),
 L('Drift Reef',1,1,0.32,0,0,0,0,1,1,'moving stars · charged'),
 L('Drift Currents',1,1.5,0.5,0,0,0,0,1,1,'faster drift'),
 L('Shard Veil',2,2,0.32,0,0,0,0.28,0.6,1,'first shards'),
 L('Shard Storm',2,2.5,0.32,0,0,0,0.42,0.85,1,'more shards'),
 L('Brittle Choir',3,3,0.3,0.55,0,0,0.3,1,1,'cracked stars'),
 L('Glass Garden',3,3.5,0.25,0.65,0,0,0.34,1,1,'mostly cracked'),
 L('Event Horizon',4,4,0.32,0.55,0.75,0.34,0.3,1,1,'black holes'),
 L('Pulsar Field',4,4.5,0.3,0.5,0.85,0.08,0.36,1,1,'pulsars'),
 L('Gravity Well',4,5,0.3,0.5,0.75,0.42,0.34,1,1,'deep pull'),
 L('The Far Song',5,5.5,0.32,0.55,0.75,0.12,0.4,1,1,'everything'),
 L('Shatterlight',5,6,0.3,0.6,0.75,0.1,0.55,1.15,1,'shard rain'),
 L('Singularity',5,6,0.25,0.5,0.85,0.5,0.4,1,1,'holes everywhere'),
 L('Last Chord',5,6.5,0.32,0.62,0.85,0.25,0.55,1.2,1,'final exam'),
];
// endless profile from sector index (identical to v6 behaviour)
export function prof(s){return {t:s,d:Math.min(s,6),mv:s>=1?0.32:0,fr:s>=3?0.55:0,pu:s>=4?0.75:0,ho:s>=4?(s===4?0.34:0.12):0,sh:s>=2?0.28+0.06*Math.min(s-2,4):0,ss:s===2?0.6:1,ch:s>=1?1:0};}
export const lvStars=(p)=>p>=9?3:p>=4?2:1;
