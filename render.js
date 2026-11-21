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
export function draw(canvas,scene,camera,opts={}){
 let c=ctxOf(canvas),dims=configure(canvas,c);if(!dims)return{};let [W,H]=dims;
 const b=scene.bounds,sz=b.hi.map((v,i)=>v-b.lo[i]),mx=(b.hi[0]+b.lo[0])/2,my=(b.hi[1]+b.lo[1])/2,mz=(b.hi[2]+b.lo[2])*.5;
 let cx=Math.cos(camera.az),cy=Math.sin(camera.az),sa=Math.sin(camera.el),ca=Math.cos(camera.el);
 const extent=Math.max(...sz,.01),base=Math.min(W/(1.7*Math.max(Math.hypot(sz[0],sz[1]),sz[2]*.6)),H/(1.12*(sz[2]*.91+Math.hypot(sz[0],sz[1])*.40))),scale=base*camera.zoom*(opts.thumb?.96:1.04);
 const ox=W*.50+camera.px,oy=H*(opts.thumb?.52:.49)+camera.py;
 function proj(p){let x=p[0]-mx,y=p[1]-my,z=p[2]-mz;return[ox+scale*(-cy*x+cx*y),oy+scale*((cx*x+cy*y)*sa-z*ca)]}
 const faces=scene.poly,back=opts.thumb?'#e6eee9':'#e7efea';c.fillStyle=back;c.fillRect(0,0,W,H);
 if(!opts.thumb){let g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,'#ecf4ef');g.addColorStop(.65,'#e5ede8');g.addColorStop(1,'#dbe6e0');c.fillStyle=g;c.fillRect(0,0,W,H)}
 const gstep=extent/7;
 if(opts.grid!==false&&!opts.thumb){for(let i=-45;i<=45;i++){let a=i*gstep,reach=gstep*60,col=i%4===0?'#c7d2cc97':'#cfdad49c';line(c,proj([a,-reach,0]),proj([a,reach,0]),col,.65);line(c,proj([-reach,a,0]),proj([reach,a,0]),col,.65)}}
 if(opts.context!==false&&scene.demo&&!opts.thumb){const rect=(x,y,w,d,z)=>[[x,y,z],[x+w,y,z],[x+w,y+d,z],[x,y+d,z]].map(proj);
  for(let [x,y,w,d] of [[-23,-15,43,28],[-57,-14,26,26],[26,-14,29,26],[-20,19,39,23],[-20,-45,38,24]])polygon(c,rect(x,y,w,d,-.45),'#d8e3dd48','#bcccc3');
  let v=[];for(let [x,y,w,d,h] of [[-45,22,27,13,5.5],[-28,41,20,12,8.3],[6,34,22,14,5.8],[35,11,19,15,8.6],[38,-25,17,13,5],[-53,-25,14,17,4],[-43,-45,22,15,3],[-1,-48,12,9,2]]){let q=[[x,y,0],[x+w,y,0],[x+w,y+d,0],[x,y+d,0]],Q=q.map(([X,Y])=>[X,Y,h]);for(let i=0;i<4;i++){let j=(i+1)%4;v.push({p:[q[i],q[j],Q[j],Q[i]],f:i%2?'#d4dfd9':'#dae5df'})}v.push({p:Q,f:'#e9f2ed'})}
  v.sort((a,b)=>depth(a.p)-depth(b.p));c.globalAlpha=.68;for(let f of v)polygon(c,f.p.map(proj),f.f,'#beccc4');c.globalAlpha=1
 }
 function depth(p){let sx=0,sy=0,sz=0;for(let v of p){sx+=v[0];sy+=v[1];sz+=v[2]}return((sx*cx+sy*cy)*ca+sz*sa)/p.length}
 if(opts.shadows!==false){c.save();let shadowScale=extent/35;for(let [x,y,w,d,h] of scene.shadows){let pts=[[x,y],[x+w,y],[x+w,y+d],[x,y+d]],ps=[...pts,...pts.map(p=>[p[0]+h*.52,p[1]-h*.38])].map(p=>proj([...p,0]));c.shadowColor='#4b5b5236';c.shadowBlur=Math.max(2,scale*shadowScale*.7);polygon(c,hull(ps),'#7283795a')}c.restore()}
 let settings={W,H,mx,my,mz,scale,ox,oy,cx,cy,sa,ca,extent};
 let solid=!opts.wire&&(drawSolid(c,scene,settings)||drawSoftware(c,scene,settings));
 let sorted=(solid&&!opts.pick?[]:faces).map(f=>{if(!f.n)f.n=normal(f.p);return{f,z:depth(f.p)}}).sort((a,b)=>a.z-b.z);
 let hits=[];for(let {f} of sorted){let p=f.p.map(proj),n=f.n;
 if(opts.wire){polygon(c,p,colorMix(f.c,'#f8f6e9',.64),'#8e9892');continue}
 if(solid){if(f.tag&&opts.pick)hits.push({p,t:f.tag});continue}
 let col=shaded(f.c,n);
 if(f.c==='#789391'||f.c==='#8fa2a0'||f.c==='#889c9b'||f.c==='#788e91'||f.c==='#819598'){let y0=Math.min(...p.map(v=>v[1])),y1=Math.max(...p.map(v=>v[1])),gr=c.createLinearGradient(0,y0,0,y1+.1);gr.addColorStop(0,colorMix(col,'#e2ece6',.23));gr.addColorStop(1,colorMix(col,'#3c4e48',.20));polygon(c,p,gr)}
 else polygon(c,p,col);
 if(f.tag&&opts.pick)hits.push({p,t:f.tag})
 }
 if(!opts.thumb){let g=c.createRadialGradient(W*.5,H*.44,H*.18,W*.5,H*.5,Math.max(W,H)*.72);g.addColorStop(0,'#ffffff00');g.addColorStop(1,'#cbdad128');c.fillStyle=g;c.fillRect(0,0,W,H)}
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
