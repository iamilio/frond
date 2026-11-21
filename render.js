import {drawSolid,drawSoftware} from './solid.js';
import {normal,colorMix,systems} from './model.js';
const ctxOf=c=>c.getContext('2d',{alpha:false});
function configure(canvas,ctx){let w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;let d=Math.min(devicePixelRatio||1,2);if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){canvas.width=Math.round(w*d);canvas.height=Math.round(h*d)}ctx.setTransform(d,0,0,d,0,0);return[w,h]}
function path(c,p){c.beginPath();c.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)c.lineTo(p[i][0],p[i][1]);c.closePath()}
function polygon(c,p,fill,stroke){if(!p.length)return;path(c,p);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=.55;c.stroke()}}
function line(c,p,q,col,width=1){c.beginPath();c.moveTo(...p);c.lineTo(...q);c.lineWidth=width;c.strokeStyle=col;c.stroke()}
function hull(pts){let p=pts.sort((a,b)=>a[0]-b[0]||a[1]-b[1]),h=[];let cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);for(let s=0;s<2;s++){let j=h.length;for(let v of p){while(h.length>=j+2&&cross(h.at(-2),h.at(-1),v)<=0)h.pop();h.push(v)}h.pop();p.reverse()}return h}
const shades=new Map();
function shaded(col,n){let lit=Math.round(20*(.2+n[0]*-.30+n[1]*-.14+n[2]*.77))/20;let key=col+' '+lit;if(shades.has(key))return shades.get(key);let c=lit>=.55?colorMix(col,'#fbf4dc',Math.min(.28,(lit-.55)*.48)):colorMix(col,'#34423e',Math.min(.38,(.55-lit)*.42));shades.set(key,c);return c}
export const cameraDefault=()=>({az:-2.38,el:.45,zoom:1,px:0,py:0});
const mixHex=(a,b,t)=>colorMix(a,b,Math.max(0,Math.min(1,t)));
// Sky and ground colours follow the sun: day, golden hour, night.
function skyColors(alt){const day=['#f2f7f3','#e7efe9','#dde8e0'],dusk=['#f6e4cf','#efdcc8','#e3d6c6'],night=['#1d2630','#243039','#2b3843'];
 const t=alt<=-.05?0:alt>=.3?1:(alt+.05)/.35;return day.map((c,i)=>t>=.5?mixHex(dusk[i],c,(t-.5)*2):mixHex(night[i],dusk[i],t*2))}
// Ground shadow of an axis-aligned box: base corners plus the roof corners pushed away from the sun.
function shadowFaces(boxes,sun){if(sun[2]<=.03)return[];const sz=Math.max(.12,sun[2]),dx=-sun[0]/sz,dy=-sun[1]/sz,out=[];
 for(const [x,y,w,d,h] of boxes){const base=[[x,y],[x+w,y],[x+w,y+d],[x,y+d]],pts=[...base,...base.map(p=>[p[0]+dx*h,p[1]+dy*h])],hp=hull(pts);if(hp.length>=3)out.push({p:hp.map(p=>[p[0],p[1],.26]),c:'#1f2d27'})}return out}
export function draw(canvas,scene,camera,opts={}){
 let c=ctxOf(canvas),dims=configure(canvas,c);if(!dims)return{};let [W,H]=dims;
 const b=scene.bounds,sz=b.hi.map((v,i)=>v-b.lo[i]),mx=(b.hi[0]+b.lo[0])/2,my=(b.hi[1]+b.lo[1])/2,mz=(b.hi[2]+b.lo[2])*.5;
 let cx=Math.cos(camera.az),cy=Math.sin(camera.az),sa=Math.sin(camera.el),ca=Math.cos(camera.el);
 const extent=Math.max(...sz,.01),base=Math.min(W/(1.7*Math.max(Math.hypot(sz[0],sz[1]),sz[2]*.6)),H/(1.12*(sz[2]*.91+Math.hypot(sz[0],sz[1])*.40))),scale=base*camera.zoom*(opts.thumb?.96:1.04);
 const ox=W*.50+camera.px,oy=H*(opts.thumb?.52:.49)+camera.py;
 function proj(p){let x=p[0]-mx,y=p[1]-my,z=p[2]-mz;return[ox+scale*(-cy*x+cx*y),oy+scale*((cx*x+cy*y)*sa-z*ca)]}
 const sun=opts.sun||[-.45,-.55,.7],alt=Math.asin(Math.max(-1,Math.min(1,sun[2]))),day=Math.max(0,Math.min(1,alt/.35)),night=alt<0?Math.min(1,-alt/.12):0;
 const faces=scene.poly,[s0,s1,s2]=skyColors(alt);
 if(opts.thumb){c.fillStyle='#eef3ef';c.fillRect(0,0,W,H)}else{let g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,s0);g.addColorStop(.65,s1);g.addColorStop(1,s2);c.fillStyle=g;c.fillRect(0,0,W,H)}
 const gstep=extent/7;
 if(opts.grid!==false&&!opts.thumb){c.globalAlpha=night>.5?.35:1;for(let i=-45;i<=45;i++){let a=i*gstep,reach=gstep*60,col=i%4===0?'#cbd6cd97':'#d5ddd79c';line(c,proj([a,-reach,0]),proj([a,reach,0]),col,.65);line(c,proj([-reach,a,0]),proj([reach,a,0]),col,.65)}c.globalAlpha=1}
 function depth(p){let sx=0,sy=0,sz=0;for(let v of p){sx+=v[0];sy+=v[1];sz+=v[2]}return((sx*cx+sy*cy)*ca+sz*sa)/p.length}
 const overlay=opts.shadows!==false?shadowFaces(scene.shadows||[],sun):[];
 let settings={W,H,mx,my,mz,scale,ox,oy,cx,cy,sa,ca,extent},extra={sun,day,night,dynamic:opts.dynamic||[],overlay,overlayAlpha:.2+.22*day};
 let solid=!opts.wire&&drawSolid(c,scene,settings,extra);
 if(!solid&&!opts.wire){c.save();for(const f of overlay)polygon(c,f.p.map(proj),'#24302a30');c.restore();solid=drawSoftware(c,scene,settings,extra)}
 let sorted=(solid&&!opts.pick?[]:faces).map(f=>{if(!f.n)f.n=normal(f.p);return{f,z:depth(f.p)}}).sort((a,b)=>a.z-b.z);
 let hits=[];for(let {f} of sorted){let p=f.p.map(proj);
 if(opts.wire){polygon(c,p,colorMix(f.c,'#f8f6e9',.64),'#91998d');continue}
 if(f.tag&&opts.pick)hits.push({p,t:f.tag})}
 if(!opts.thumb){let g=c.createRadialGradient(W*.5,H*.44,H*.18,W*.5,H*.5,Math.max(W,H)*.72);g.addColorStop(0,'#ffffff00');g.addColorStop(1,night>.5?'#0b101633':'#d3ddd528');c.fillStyle=g;c.fillRect(0,0,W,H)}
 return{scale,hits,compass:Math.atan2(cx, -cy*sa)*180/Math.PI};
}
export function pick(hits,x,y){for(let k=hits.length-1;k>=0;k--){let {p,t}=hits[k],inside=false;for(let i=0,j=p.length-1;i<p.length;j=i++){let a=p[i],b=p[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside}if(inside)return t}}
export function swatch(canvas,v){
 let c=ctxOf(canvas),dim=configure(canvas,c);if(!dim)return;let [w,h]=dim,s=({brick:'perforated',ovf:'horizontal',greenroof:'trellis'})[v.system]||v.system,pal={datepalm:['#efe6d4','#c9ad79','#94784a'],biopcm:['#e8e9ee','#a6abbd','#6c7187'],original:['#e7e9df','#a8b5ac','#647a75'],fins:['#f2e7dc','#c28663','#98583b'],trellis:['#e7ebdf','#a4ae89','#647e5d'],kinetic:['#e5eae8','#92a5a7','#5b747c'],pv:['#e2e9e9','#78909d','#41596b'],bionic:['#efeadc','#b39768','#8d7751'],horizontal:['#eee9dc','#b29470','#8a7559'],perforated:['#efe3d9','#bd8c6b','#946b4f'],custom:['#ebe5df','#ae9988','#816e62']},[bg,mid,dark]=pal[s]||pal.original;c.fillStyle=bg;c.fillRect(0,0,w,h);
 let unit=Math.min(h/4.6,w/12),bx=w*.30,by=h*.39;
 function P(x,y,z){return[bx+(x*.96-y*.65)*unit,by+(x*.24+y*.34-z)*unit]}
 function face(p,col,stroke){polygon(c,p.map(a=>P(...a)),col,stroke)}
 let wall=(x,z,X,Z,rel,col)=>face([[x,rel,z],[X,rel,z],[X,rel,Z],[x,rel,Z]],col);
 let block=(x,z,X,Z,t,col)=>{wall(x,z,X,Z,t,col);face([[x,0,Z],[X,0,Z],[X,t,Z],[x,t,Z]],colorMix(col,'#f8f2dc',.33));face([[X,0,z],[X,t,z],[X,t,Z],[X,0,Z]],colorMix(col,'#35413b',.25))};
 for(let r=-3;r<=1;r++){wall(0,r*1.42,6.65,r*1.42+1.35,0,mid);for(let k=0;k<11;k++)wall(k*.63,r*1.42,k*.63+.045,r*1.42+1.4,.02,dark);block(-.1,r*1.42-.01,6.78,r*1.42+.1,.18,s==='original'?'#babca9':mid)}
 if(s==='fins'||s==='kinetic'||s==='custom'){for(let k=0;k<=12;k++){let x=k*.54;face([[x,.05,-4],[x+.12,.05,-4],[x+.12,.05,2.7],[x,.05,2.7]],dark);let shift=s==='kinetic'?.35:0,th=s==='kinetic'?.39:.68;face([[x,.05,-4],[x+shift,th,-4],[x+shift,th,2.7],[x,.05,2.7]],dark);block(x+shift,-4,x+shift+.095,2.7,th,mid)}}
 if(s==='trellis'){for(let x=0;x<6.6;x+=.43){wall(x,-4,x+.042,2.5,.35,dark);for(let z=-4;z<2.6;z+=.34){let r=Math.sin(107*x+z*38),[X,Y]=P(x+.18*Math.cos(z*20),.45,z);c.fillStyle=colorMix(dark,mid,(r+1)*.5);c.beginPath();c.ellipse(X,Y,unit*(.13+.056*r),unit*.115,r*1.2,0,7);c.fill()}}}
 if(['horizontal','pv','perforated','bionic'].includes(s)){for(let z=-4;z<2.5;z+=s==='pv'?1.35:.64){block(0,z,6.7,z+.12,s==='pv'?1.05:.52,mid);if(s==='perforated'||s==='bionic')for(let x=0;x<6.6;x+=.65)wall(x,z,x+.14,z+.6,.50,dark)}}
 c.fillStyle='#ffffff09';c.fillRect(0,0,w,h)
}
