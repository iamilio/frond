export const systems={
 original:{name:'Reference envelope',family:'Reference',host:'all',icon:'building-2',color:'#9a9c92',mech:'Existing envelope'},
 trellis:{name:'Indirect green façade',family:'Nature-based',host:'window',icon:'sprout',color:'#008300',mech:'Seasonal plant shade'},
 brick:{name:'Perforated screen',family:'Nature-inspired · vernacular',host:'window',icon:'grid-3x3',color:'#eb6834',mech:'Fixed shade with air gap'},
 ovf:{name:'Opaque ventilated façade',family:'Nature-inspired',host:'wall',icon:'columns-3',color:'#e87ba4',mech:'Ventilated cavity'},
 datepalm:{name:'Bio-based insulation',family:'Nature-derived · bio-based',host:'layer',icon:'layers-2',color:'#eda100',mech:'Thermal resistance'},
 biopcm:{name:'Bio-based PCM',family:'Nature-derived',host:'layer',icon:'box',color:'#2a78d6',mech:'Latent heat storage'},
 greenroof:{name:'Extensive green roof',family:'Nature-based',host:'roof',icon:'sprout',color:'#1baf7a',mech:'Roof insulation and evapotranspiration'},
 custom:{name:'Custom module',family:'Imported design',host:'window',icon:'component',color:'#947866',mech:'Imported geometry'}};
export const hosts={window:'In front of windows',wall:'Opaque wall',layer:'Wall layer',roof:'Roof',all:'Whole building'};
export const params={
 trellis:[['depth','Distance from glass',.2,1.5,.05,' m'],['spacing','Trellis spacing',.6,3,.1,' m'],['coverage','Leaf coverage',15,100,5,'%']],
 brick:[['depth','Distance from glass',.1,1.2,.05,' m'],['spacing','Module size',.6,3,.1,' m'],['coverage','Open area',10,80,5,'%'],['screenThick','Screen thickness',.05,.2,.01,' m']],
 ovf:[['cavity','Cavity depth',.04,.3,.01,' m']],
 datepalm:[['thick','Insulation thickness',.04,.2,.01,' m']],
 biopcm:[['pcmThick','PCM thickness',.005,.05,.005,' m'],['melt','Melting temperature',22,32,.5,' °C'],['nightAch','Night ventilation',0,10,.5,' ach']],
 greenroof:[['substrate','Substrate depth',.06,.3,.01,' m'],['lai','Leaf area index',.5,5,.1,''],['irrigation','Irrigation',0,6,.5,' L/m²·day']],
 custom:[['depth','Projection depth',.2,3,.1,' m'],['spacing','Module width',.6,4,.1,' m']]};
export const claddings={terracotta:'Terracotta',stone:'Stone (dry fixed)',gfrc:'GFRC',acp:'Aluminium composite panel',brick:'Brick',biobased:'Bio-based panel'};
// Bio-based insulation library. Typical dry conductivity (W/m·K) from the literature; real products vary with density and moisture.
export const insulations={datepalm:['Date-palm fibre',.06,'#d8bf88'],straw:['Straw',.052,'#e3cf8a'],reed:['Reed',.054,'#c4ad74'],cork:['Cork',.039,'#a9805a'],kenaf:['Kenaf',.04,'#d6cfa8']};
export const screens={brick:['Brick','#b5623b','#d39064'],terracotta:['Terracotta','#c27a4e','#dea27a'],grc:['GRC','#cfcac0','#e6e2da']};
// Existing façade of the designer's building = the reference. Labels follow the common Iranian façade types (Keikha & Jafari 2026); U in W/m²·K is indicative.
export const existingFacades={granite:['Brick with granite facing',1.6],facebrick:['Face brick',1.8],stone:['Dry-fixed stone on brick',1.5],ceramic:['Ceramic cladding',1.6],terracotta:['Terracotta cladding',1.5],stucco:['Stucco on brick',1.9],acp:['Aluminium composite panel',1.4],thermowood:['ThermoWood cladding',1.3],gfrc:['GFRC panel',1.5],curtain:['Glass curtain wall',2.7],code:['Insulated wall to code',.4]};
export const addons={pv:'PV canopy',coating:'Light reflective finish'};
export const paramDefaults={elevation:'W',floor:'all',room:'all',rotation:0,wwr:74,mass:'stepped',depth:.6,spacing:1.8,coverage:70,cavity:.12,thick:.1,pcmThick:.02,melt:26,nightAch:4,substrate:.12,lai:2.5,irrigation:2,cladding:'terracotta',insul:'datepalm',screen:'brick',screenThick:.1,existing:'granite',addons:{pv:false,coating:false},custom:null,rate:null,quantity:null};
export const stateDefault=()=>({schema:'frond-1',demo:true,name:'Terrace Office',location:'Yazd, Iran',use:'Office',levels:7,model:null,active:'v2',variants:[
 {id:'base',name:'Reference envelope',system:'original',elevation:'all'},
 {id:'v2',name:'Indirect green façade',system:'trellis',elevation:'all'},
 {id:'v3',name:'Perforated screen',system:'brick',coverage:20,depth:1,elevation:'all'},
 {id:'v4',name:'OVF · terracotta',system:'ovf',elevation:'all'},
 {id:'v5',name:'Bio-based insulation · date palm',system:'datepalm',elevation:'all'},
 {id:'v6',name:'Bio-PCM + night vent',system:'biopcm',elevation:'all'},
 {id:'v7',name:'Green roof',system:'greenroof',elevation:'all'}
].map(x=>({...structuredClone(paramDefaults),...x})),checked:['base','v2','v3','v4','v5','v6','v7']});
// Map a Frond variant to the renderer's wall, roof and shading vocabulary.
export function effective(v){const s=v.system;return{...v,layer:s==='datepalm'?'datepalm':s==='biopcm'?'pcm':'original',wall:s==='ovf'?'ovf':'original',roof:s==='greenroof'?'green':'original',system:s==='brick'?'perforated':(s==='trellis'||s==='custom')?s:(v.addons?.pv?'pv':'original')}}
export function normal(p){let a=[0,0,0];for(let i=0;i<p.length;i++){let v=p[i],w=p[(i+1)%p.length];a[0]+=(v[1]-w[1])*(v[2]+w[2]);a[1]+=(v[2]-w[2])*(v[0]+w[0]);a[2]+=(v[0]-w[0])*(v[1]+w[1]);}let n=Math.hypot(...a)||1;return a.map(v=>v/n)}
export function bounds(faces){let lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];for(const f of faces)for(const p of f.p)for(let j=0;j<3;j++){lo[j]=Math.min(lo[j],p[j]);hi[j]=Math.max(hi[j],p[j])}return{lo,hi}}
const dirs=['N','E','S','W'];
export function faceDir(n){return Math.abs(n[0])>Math.abs(n[1])?(n[0]>0?'E':'W'):(n[1]>0?'N':'S')}
export function parseModel(raw,filename,settings={}){
 const ext=filename.toLowerCase().split('.').pop(),faces=[];let rooms=[],stores=new Set();
 const unit=(v)=>({meters:1,metres:1,m:1,millimeters:.001,millimetres:.001,mm:.001,centimeters:.01,cm:.01,feet:.3048,ft:.3048,inches:.0254}[String(v||'m').toLowerCase()]??1);
 let factor=unit(settings.units);
 function push(poly,kind='wall',label='',room='',level='',host=''){if(!Array.isArray(poly)||poly.length<3)return;let p=poly.map(v=>[Number(v[0]),Number(v[1]),Number(v[2]??0)]);if(p.some(x=>x.some(n=>!Number.isFinite(n))))throw Error('The file contains an invalid vertex.');if(faces.length>=30000)throw Error('Use a simplified design with fewer than 30,000 faces.');faces.push({p,kind,label,room,level,host})}
 if(ext==='obj'){
  let pts=[],group='Model';for(let l of raw.split(/\r?\n/)){let a=l.trim().split(/\s+/),type=a.shift();if(type==='v'){let n=a.slice(0,3).map(Number);if(n.length!==3||n.some(v=>!Number.isFinite(v)))throw Error('Invalid OBJ vertex.');pts.push(settings.up==='Y'?[n[0],-n[2],n[1]]:n)}
  if(type==='g'||type==='o')group=a.join(' ')||'Model';if(type==='f'){let p=a.map(s=>{let i=Number(s.split('/')[0]);return pts[i>0?i-1:pts.length+i]});if(p.some(x=>!x))throw Error('An OBJ face refers to a missing vertex.');push(p,/glass|window|glaz/i.test(group)?'glass':/shade|fin|louver/i.test(group)?'shade':'wall',group)}}
 }else if(ext==='geojson'){
  const data=JSON.parse(raw),items=data.type==='FeatureCollection'?data.features:data.type==='Feature'?[data]:[{geometry:data,properties:{}}];
  let polys=[],origin=null;factor=1;
  for(const f of items){const g=f.geometry||{},group=g.type==='Polygon'?[g.coordinates]:g.type==='MultiPolygon'?g.coordinates:[];for(const rings of group){if(rings.length!==1)throw Error('For courtyard footprints with holes, import OBJ or HBJSON.');let ring=rings[0].slice();if(ring.length<4)continue;let a=ring[0],b=ring.at(-1);if(a[0]===b[0]&&a[1]===b[1])ring.pop();if(ring.some(p=>p.length<2||!Number.isFinite(p[0])||!Number.isFinite(p[1])||Math.abs(p[0])>180||Math.abs(p[1])>90))throw Error('GeoJSON footprints require longitude and latitude coordinates.');origin=origin||ring[0];let points=ring.map(([lon,lat])=>[(lon-origin[0])*111320*Math.cos(origin[1]*Math.PI/180),(lat-origin[1])*110574]);let area=points.reduce((n,p,i)=>{let q=points[(i+1)%points.length];return n+p[0]*q[1]-q[0]*p[1]},0);if(area<0)points.reverse();let storeys=Math.max(1,Math.min(120,Math.round(Number(f.properties?.['building:levels']||settings.storeys)||1))),height=Number(f.properties?.height)||storeys*3.5;if(height<=0||height>1000)throw Error('The footprint height must be between 0 and 1,000 metres.');polys.push({points,storeys,height})}}
  if(!polys.length)throw Error('No Polygon or MultiPolygon footprint was found.');
  for(const [i,{points,storeys,height}] of polys.entries()){for(let j=0;j<storeys;j++){let z=j*height/storeys,Z=(j+1)*height/storeys,level='Level '+(j+1),room='Building '+(i+1)+' · '+level;stores.add(level);rooms.push({id:room,name:room,level});let plane=Z=>points.map(p=>[...p,Z]);push(plane(z),'floor',room+' floor',room,level);
  for(let k=0;k<points.length;k++){let a=points[k],b=points[(k+1)%points.length];let w=[ [...a,z],[...b,z],[...b,Z],[...a,Z] ];push(w,'wall',room+' wall '+k,room,level);
  const lerp=t=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];push([[...lerp(.08),z+(Z-z)*.18],[...lerp(.92),z+(Z-z)*.18],[...lerp(.92),z+(Z-z)*.85],[...lerp(.08),z+(Z-z)*.85]],'glass',room+' window '+k,room,level,room+' wall '+k)}
  if(j===storeys-1)push(plane(Z),'roof',room+' roof',room,level)}}
 }else if(ext==='hbjson'||ext==='json'){
  let j=JSON.parse(raw);if(j.type!=='Model'||!Array.isArray(j.rooms))throw Error('Choose a Honeybee Model HBJSON, or a Frond study under Open study.');factor=unit(j.units);
  function shade(s,room='',level='',host=''){push(s.geometry?.boundary,'shade',s.identifier,room,level,host)}
  for(let r of j.rooms){let level=r.story||'',id=r.identifier||r.display_name||'Room';rooms.push({id,name:r.display_name||id,level});if(level)stores.add(level);
   for(let f of r.faces||[]){let t=String(f.face_type||'Wall').toLowerCase(),k=t.includes('roof')?'roof':t.includes('floor')?'floor':'wall';let interior=f.boundary_condition?.type==='Surface';push(f.geometry?.boundary,interior?'internal':k,f.identifier,id,level);
    for(let a of f.apertures||[]){push(a.geometry?.boundary,'glass',a.identifier,id,level,f.identifier);for(let s of [...a.outdoor_shades||[],...a.indoor_shades||[]])shade(s,id,level,f.identifier)}
    for(let s of [...f.outdoor_shades||[],...f.indoor_shades||[]])shade(s,id,level,f.identifier)
   }for(let s of r.outdoor_shades||[])shade(s)}
  for(let s of j.orphaned_shades||[])shade(s);
 }else throw Error('Supported geometry formats are OBJ and HBJSON.');
 if(!faces.length)throw Error('No polygon faces were found in this file.');
 let b=bounds(faces),center=[(b.lo[0]+b.hi[0])/2,(b.lo[1]+b.hi[1])/2,b.lo[2]];for(let f of faces)f.p=f.p.map(p=>p.map((v,i)=>(v-center[i])*factor));
 b=bounds(faces);if(Math.max(...b.hi.map((v,i)=>v-b.lo[i]))<.00001)throw Error('The model has no usable dimensions.');
 let stories=[...stores].sort((a,b)=>{const lowest=s=>Math.min(...faces.filter(f=>f.level===s).map(f=>Math.min(...f.p.map(p=>p[2]))));return lowest(a)-lowest(b)});
 return{file:filename,type:ext==='obj'?'OBJ':ext==='geojson'?'GeoJSON':'HBJSON',faces,rooms,stories,bounds:b};
}
const baseColors={wall:'#d9cfb7',roof:'#d8d5c4',floor:'#cbc5b3',glass:'#789391',shade:'#a98364',internal:'#cbbfae'};
function face(a,p,c,tag=null){a.push({p,c,tag})}
function box(a,x,y,z,w,d,h,c,tag=null){
 if(w<=0||d<=0||h<=0)return;const X=x+w,Y=y+d,Z=z+h;
 face(a,[[x,y,Z],[X,y,Z],[X,Y,Z],[x,Y,Z]],c,tag);
 face(a,[[x,y,z],[X,y,z],[X,y,Z],[x,y,Z]],c,tag);
 face(a,[[X,y,z],[X,Y,z],[X,Y,Z],[X,y,Z]],c,tag);
 face(a,[[X,Y,z],[x,Y,z],[x,Y,Z],[X,Y,Z]],c,tag);
 face(a,[[x,Y,z],[x,y,z],[x,y,Z],[x,Y,Z]],c,tag);
}
function colorMix(a,b,t){let n=parseInt(a.slice(1),16),m=parseInt(b.slice(1),16);return '#'+[16,8,0].map(i=>Math.round(((n>>i)&255)*(1-t)+((m>>i)&255)*t).toString(16).padStart(2,'0')).join('')}
function hash(n){let x=Math.sin(n*78.233+2.13)*43758.5453;return x-Math.floor(x)}
function leaf(a,x,y,z,r,seed,col){
 let sides=7,rows=[],heights=[-.72,-.32,.37,.83],widths=[.48,1,.85,.27];
 for(let j=0;j<4;j++){let ring=[];for(let i=0;i<sides;i++){let q=2*Math.PI*(i+.35*(j%2))/sides,k=r*widths[j]*(.85+.28*hash(seed+i*9+j));ring.push([x+Math.cos(q)*k,y+Math.sin(q)*k,z+r*heights[j]+r*.12*hash(seed+j*7+i)])}rows.push(ring)}
 for(let j=0;j<3;j++)for(let i=0;i<sides;i++){let n=(i+1)%sides,c=colorMix(col,'#b1b990',.25*hash(seed+i*4+j));face(a,[rows[j][i],rows[j][n],rows[j+1][n],rows[j+1][i]],c)}
 face(a,rows[3],colorMix(col,'#acb58b',.22));
}
function tree(a,x,y,z,h,s){box(a,x-.12*h/4,y-.12*h/4,z,.24*h/4,.24*h/4,h*.61,'#8b7c60');leaf(a,x,y,z+h*.72,h*.37,s,s%2?'#78865f':'#899675');leaf(a,x+h*.14,y-h*.06,z+h*.62,h*.265,s+7,'#798662')}
function faceFrame(dir,x,y,w,d,z,h,extra={}){let o,u,n,len;
 if(dir==='S'){o=[x,y,z];u=[1,0];n=[0,-1];len=w}
 if(dir==='N'){o=[x+w,y+d,z];u=[-1,0];n=[0,1];len=w}
 if(dir==='W'){o=[x,y+d,z];u=[0,-1];n=[-1,0];len=d}
 if(dir==='E'){o=[x+w,y,z];u=[0,1];n=[1,0];len=d}
 return{o,u,n,len,h,dir,...extra}}
function pt(f,u,v,k=0){return[f.o[0]+u*f.u[0]+k*f.n[0],f.o[1]+u*f.u[1]+k*f.n[1],f.o[2]+v]}
function wallQuad(a,f,u,v,U,V,k,col,tag){face(a,[pt(f,u,v,k),pt(f,U,v,k),pt(f,U,V,k),pt(f,u,V,k)],col,tag)}
function blade(a,f,u,v,U,V,k,K,c,tag,tilt=0){let b=[pt(f,u,v,k),pt(f,U,v,k),pt(f,U,V,k),pt(f,u,V,k)],p=[pt(f,u+tilt,v,K),pt(f,U+tilt,v,K),pt(f,U+tilt,V,K),pt(f,u+tilt,V,K)];face(a,p,c,tag);for(let i=0;i<4;i++){let j=(i+1)%4;face(a,[b[i],b[j],p[j],p[i]],c,tag)}}
function inside(x,y,poly){let on=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){let [a,b]=poly[i],[c,d]=poly[j];if(((b>y)!==(d>y))&&x<(c-a)*(y-b)/(d-b)+a)on=!on}return on}
function allowed(f,u,v){return !f.clip||inside(u,v,f.clip)}
function scatterPlants(a,poly,n){let o=poly[0],seed=Math.round(o[0]*13+o[1]*7);for(let t=1;t+1<poly.length;t++){let A=poly[0],B=poly[t],C=poly[t+1],area=Math.hypot(...[(B[1]-A[1])*(C[2]-A[2])-(B[2]-A[2])*(C[1]-A[1]),(B[2]-A[2])*(C[0]-A[0])-(B[0]-A[0])*(C[2]-A[2]),(B[0]-A[0])*(C[1]-A[1])-(B[1]-A[1])*(C[0]-A[0])])/2,count=Math.min(80,Math.round(area/2.2));for(let i=0;i<count;i++){let r1=hash(seed+i*3+t),r2=hash(seed+i*7+t*5);if(r1+r2>1){r1=1-r1;r2=1-r2}let p=[0,1,2].map(j=>A[j]+(B[j]-A[j])*r1+(C[j]-A[j])*r2);leaf(a,p[0]+n[0]*.1,p[1]+n[1]*.1,p[2]+.14,.28+r1*.2,seed+i,r2>.5?'#6f9a4c':'#87ad5c')}}}
// Demo neighbourhood: four streets, sidewalks, street trees and surrounding blocks with windows.
const ROADS=[{axis:'x',c:-18},{axis:'x',c:20.5},{axis:'y',c:25},{axis:'y',c:-25}],REACH=95;
function slab(a,x0,y0,x1,y1,z0,z1,c){box(a,Math.min(x0,x1),Math.min(y0,y1),z0,Math.abs(x1-x0),Math.abs(y1-y0),z1-z0,c)}
function cityBlock(a,x,y,w,d,h,col,seed,shadows){box(a,x,y,0,w,d,h,col);box(a,x-.15,y-.15,h,w+.3,d+.3,.35,colorMix(col,'#ffffff',.18));const fl=Math.max(1,Math.floor(h/3.3));
 for(let j=0;j<fl;j++){let z=j*3.3+1.0;for(const [ox,oy,ux,uy,len,nx,ny] of [[x,y,1,0,w,0,-1],[x+w,y+d,-1,0,w,0,1],[x,y+d,0,-1,d,-1,0],[x+w,y,0,1,d,1,0]]){for(let u=.8;u+1.4<len;u+=2.2){let px=ox+ux*u+nx*.03,py=oy+uy*u+ny*.03;face(a,[[px,py,z],[px+ux*1.4,py+uy*1.4,z],[px+ux*1.4,py+uy*1.4,z+1.45],[px,py,z+1.45]],'#4d5a60')}}}
 box(a,x-.05,y-.05,0,w+.1,d+.1,.9,colorMix(col,'#6b5d48',.25));for(let k=0;k<2;k++){let r=hash(seed*13+k*7),bw=2+r*2.5;box(a,x+w*(.2+.45*k)+r,y+d*(.25+.4*r),h+.35,bw,bw*.8,.9+r*.8,k?'#a9aaa2':'#bfb9aa')}
 shadows.push([x,y,w,d,h+.35])}
const CAR_COLORS0=['#d94841','#2a78d6','#f2f2f2','#3b3f44','#e0b43a','#8c9aa3','#1baf7a','#c9c4b8'];
const STOP=9.4,XING=ROADS.filter(r=>r.axis==='y').flatMap(v=>ROADS.filter(r=>r.axis==='x').map(h=>[v.c,h.c]));
function neighbourhood(a,shadows,trees){
 slab(a,-REACH,-REACH,REACH,REACH,-.09,-.06,'#e4e0d3');
 const near=(r,t,w)=>ROADS.some(q=>q.axis!==r.axis&&Math.abs(t-q.c)<w);
 for(const r of ROADS){const lo=r.c-3.5,hi=r.c+3.5,side=(s,e)=>r.axis==='x'?slab(a,-REACH,s,REACH,e,0,.12,'#dcd5c6'):slab(a,s,-REACH,e,REACH,0,.12,'#dcd5c6');
  if(r.axis==='x')slab(a,-REACH,lo,REACH,hi,-.06,.01,'#5f6468');else slab(a,lo,-REACH,hi,REACH,-.06,.012,'#5f6468');side(lo-2.6,lo);side(hi,hi+2.6);
  const L=(t0,c0,t1,c1,z,col)=>r.axis==='x'?slab(a,t0,c0,t1,c1,z,z+.015,col):slab(a,c0,t0,c1,t1,z,z+.015,col);
  for(let t=-REACH;t<REACH;t+=6){if(near(r,t+1.5,STOP+1))continue;L(t,r.c-.08,t+3,r.c+.08,.012,'#f2efe4')}
  for(const e of [lo+.25,hi-.25])for(let t=-REACH;t<REACH;t+=1){if(near(r,t+.5,6.2))continue;L(t,e-.05,t+1,e+.05,.012,'#d9d6cc')}
  for(const q of ROADS.filter(q=>q.axis!==r.axis))for(const sgn of [-1,1]){const x0=q.c+sgn*6.6;for(let c=lo+.5;c<hi-.4;c+=.9)L(Math.min(x0,x0+sgn*2.2),c,Math.max(x0,x0+sgn*2.2),c+.5,.014,'#f4f1e8');{const left=(sgn<0)===(r.axis==='x');L(Math.min(q.c+sgn*STOP,q.c+sgn*(STOP-.3)),left?lo+.1:r.c,Math.max(q.c+sgn*STOP,q.c+sgn*(STOP-.3)),left?r.c:hi-.1,.014,'#f4f1e8')}}
  if(trees)for(let t=-70;t<=70;t+=10){if(near(r,t,9))continue;for(const off of [lo-1.3,hi+1.3]){let [x,y]=r.axis==='x'?[t+(off>r.c?5:0),off]:[off,t+(off>r.c?5:0)];if(Math.abs(x)<17.5&&Math.abs(y)<12.6)continue;let h=4.2+hash(x*3+y)*1.6;tree(a,x,y,.12,h,Math.round(x*7+y*3));shadows.push([x-1.2,y-1.2,2.4,2.4,h*.85])}}}
 // Traffic-light poles on the four corners of each crossing; the lamps are drawn with the cars.
 for(const [X,Y] of XING)for(const [sx,sy] of [[-1,-1],[1,-1],[1,1],[-1,1]]){let px=X+sx*4.3,py=Y+sy*4.3;box(a,px-.1,py-.1,.12,.2,.2,4.3,'#3d4246');box(a,px-.22,py-.22,4.0,.44,.44,.9,'#2b2f33')}
 // City blocks fill the cells between streets, set back from the sidewalks.
 const cut=(lo,hi)=>{let e=[-REACH+2,...ROADS.filter(r=>r.axis===lo).map(r=>r.c).sort((p,q)=>p-q).flatMap(c=>[c-7.6,c+7.6]),REACH-2],out=[];for(let i=0;i<e.length;i+=2)out.push([e[i],e[i+1]]);return out};
 const cols=['#d9cdb3','#c9a27e','#e2d6bd','#cfd0cb','#ccbfa3','#b98b6a','#e6e2d8','#d4c8ac','#c2b59c','#ddd1b7','#a9a79c'];let n=0;
 for(const [x0,x1] of cut('y'))for(const [y0,y1] of cut('x')){if(x0<0&&x1>0&&y0<0&&y1>0)continue;const nx=x1-x0>40?2:1,ny=y1-y0>40?2:1,gw=(x1-x0)/nx,gh=(y1-y0)/ny;
  for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){let r=hash(x0*3+y0*7+i*13+j*29),w=gw-6-r*4,d=gh-6-hash(r*17)*4,bx=x0+i*gw+(nx>1&&i===0?0:gw-w)*(nx>1?1:.5),by=y0+j*gh+(ny>1&&j===0?0:gh-d)*(ny>1?1:.5);
   const dist=Math.min(Math.abs(bx+w/2),Math.abs(by+d/2)),h=Math.round((dist<45?5:9)+hash(r*5)*(dist<45?6:22));cityBlock(a,bx,by,w,d,h,cols[n++%cols.length],n,shadows)}}}
// Traffic: lanes with signalised crossings. Cars keep a gap to the car ahead and stop at red lights.
const LANE_DEF=ROADS.flatMap((r,i)=>[{axis:r.axis,c:r.c-1.75*(r.axis==='x'?1:-1),dir:1,v0:9+i*.7},{axis:r.axis,c:r.c+1.75*(r.axis==='x'?1:-1),dir:-1,v0:8.4+i*.9}]);
const startSlots=(xs,n,seed)=>{let c=[];for(let t=-REACH+4;t<REACH-4;t+=9)if(xs.every(X=>Math.abs(t-X)>30))c.push(t);return Array.from({length:n},(_,i)=>c[Math.floor((i+hash(seed)*.9)*c.length/n)%c.length])};
export const LANES=LANE_DEF.map((L,li)=>({...L,stops:ROADS.filter(q=>q.axis!==L.axis).map(q=>q.c),cars:startSlots(ROADS.filter(q=>q.axis!==L.axis).map(q=>q.c),5,li*7).map((s0,i)=>({s:s0,v:L.v0,col:CAR_COLORS0[(li*3+i)%CAR_COLORS0.length]}))}));
function signal(axis,t){const p=((t%32)+32)%32;if(axis==='x')return p<11?'g':p<13?'a':'r';return p>=16&&p<27?'g':p>=27&&p<29?'a':'r'}
let simT=null;
function stepTraffic(t){if(simT===null){simT=t;return}let dt=Math.min(.1,Math.max(0,t-simT));simT=t;if(!dt)return;
 for(const L of LANES){const st=signal(L.axis,t),span=2*REACH,cars=L.cars.slice().sort((p,q)=>L.dir*(p.s-q.s));
  cars.forEach((c,i)=>{let lead=cars[(i+1)%cars.length],gap=L.dir*(lead.s-c.s);if(gap<=0)gap+=span;let vt=L.v0*Math.max(0,Math.min(1,(gap-7)/14));
   if(st!=='g')for(const X of L.stops){let line=X-L.dir*STOP,dist=L.dir*(line-c.s)-2.2;if(dist>-.5&&dist<45&&!(st==='a'&&dist<Math.max(1,c.v*.9)))vt=Math.min(vt,L.v0*Math.max(0,Math.min(1,dist/20)))}
   c.v+=Math.max(-7*dt,Math.min(2.5*dt,vt-c.v));c.v=Math.max(0,c.v);c.s+=L.dir*c.v*dt;if(L.dir*c.s>REACH)c.s-=L.dir*span})}}
const CAR_COLORS=CAR_COLORS0;
function orientedBox(a,cx,cy,z,len,wid,h,ux,uy,c,ds=0,dt=0){const nx=-uy,ny=ux;cx+=ux*ds+nx*dt;cy+=uy*ds+ny*dt;const P=(s,t,q)=>[cx+ux*s*len/2+nx*t*wid/2,cy+uy*s*len/2+ny*t*wid/2,z+q];
 a.push({p:[P(-1,-1,h),P(1,-1,h),P(1,1,h),P(-1,1,h)],c});for(const [s0,t0,s1,t1] of [[-1,-1,1,-1],[1,-1,1,1],[1,1,-1,1],[-1,1,-1,-1]])a.push({p:[P(s0,t0,0),P(s1,t1,0),P(s1,t1,h),P(s0,t0,h)],c})}
function car(out,x,y,ux,uy,col,braking){const B=(len,wid,z,h,c,ds=0,dt=0)=>orientedBox(out,x,y,z,len,wid,h,ux,uy,c,ds,dt);
 for(const s of [-1.35,1.35])for(const t of [-.82,.82])B(.66,.24,.02,.6,'#1d1f22',s,t);
 B(4.3,1.78,.3,.62,col);B(2.25,1.6,.92,.5,'#2a3640',-.25);B(1.95,1.5,1.42,.05,colorMix(col,'#ffffff',.08),-.25);
 for(const t of [-.62,.62]){B(.06,.32,.62,.16,'#fff6d5',2.14,t);B(.06,.32,.62,.16,braking?'#ff2d20':'#9b2a22',-2.14,t)}}
export function carFaces(time){stepTraffic(time);const out=[];
 for(const L of LANES)for(const c of L.cars){let [x,y,ux,uy]=L.axis==='x'?[c.s,L.c,L.dir,0]:[L.c,c.s,0,L.dir];car(out,x,y,ux,uy,c.col,c.v<L.v0*.6)}
 const lamp={g:'#2fe07a',a:'#ffb21a',r:'#ff3b30'};
 for(const [X,Y] of XING)for(const [sx,sy] of [[-1,-1],[1,-1],[1,1],[-1,1]]){let px=X+sx*4.3,py=Y+sy*4.3,cx=signal('x',time),cy=signal('y',time);
  out.push({p:[[px-sx*.23,py-.12,4.25],[px-sx*.23,py+.12,4.25],[px-sx*.23,py+.12,4.65],[px-sx*.23,py-.12,4.65]],c:lamp[cx]});
  out.push({p:[[px-.12,py-sy*.23,4.25],[px+.12,py-sy*.23,4.25],[px+.12,py-sy*.23,4.65],[px-.12,py-sy*.23,4.65]],c:lamp[cy]})}
 return out}
// Sun direction for Yazd (lat 31.9° N) on the 21st of a month at a solar hour. x east, y north, z up.
export function sunVector(month,hour,lat=31.9){const n=[21,52,80,111,141,172,202,233,264,294,325,355][month],dec=23.45*Math.PI/180*Math.sin(2*Math.PI*(284+n)/365),H=(hour-12)*15*Math.PI/180,phi=lat*Math.PI/180;
 const x=-Math.cos(dec)*Math.sin(H),y=Math.sin(dec)*Math.cos(phi)-Math.cos(dec)*Math.cos(H)*Math.sin(phi),z=Math.sin(dec)*Math.sin(phi)+Math.cos(dec)*Math.cos(H)*Math.cos(phi);return[x,y,z]}
// Opaque pieces of a façade frame. Sample-building frames carry both glass and wall, so systems that need an opaque wall get punched windows: sill, head and side piers per bay.
function wallPieces(f,W,H){if(!(f.shadeHost&&f.wallHost))return[[0,0,W,H]];const n=Math.max(1,Math.round(W/1.8)),bw=W/n,sill=Math.min(.95,H*.3),head=Math.max(sill+.7,H-.45),p=Math.min(.4,bw*.22),r=[];for(let i=0;i<n;i++){let u=i*bw,U=u+bw;r.push([u,0,U,sill],[u,head,U,H],[u,sill,u+p,head],[U-p,sill,U,head])}return r}
function buildSystem(a,f,v,isTarget){
 const tag={dir:f.dir,level:f.level,room:f.room},W=f.len,H=f.h,k=.20;
 if(!isTarget||a.length>165000)return;
 if(v.wall==='living'&&f.wallHost){for(let i=0;i<W;i+=1.25){if(!allowed(f,i+.4,H*.38))continue;wallQuad(a,f,i,0,Math.min(W,i+1.18),H*.71,.06,i%2?'#70845d':'#83956c',tag)}}
 const bands=f.bands||[[0,H]];
 // Wall systems cover the whole opaque façade; on the sample building they become a punched façade with windows behind openings.
 const tiles=(cb,tw,th)=>{for(const [u0,v0,u1,v1] of wallPieces(f,W,H)){for(let u=u0;u<u1-.02;u+=tw)for(let z=v0;z<v1-.02;z+=th){let U=Math.min(u1,u+tw),Z=Math.min(v1,z+th);if(U-u<.05||Z-z<.05||!allowed(f,(u+U)/2,(z+Z)/2))continue;cb(u,z,U,Z)}}};
 if(v.wall==='ovf'&&f.wallHost){const cav=Math.max(.04,Number(v.cavity)||.12)*1.5,col={brick:'#b9653f',terracotta:'#c98257',biobased:'#a88f5f',stone:'#cfc4ae',gfrc:'#d8d4cc',acp:'#bcc3c7'}[v.cladding]||'#c98257',th=v.cladding==='acp'||v.cladding==='gfrc'?1.05:.6,tw=v.cladding==='brick'?.6:1.2;
  for(const [u0,v0,u1,v1] of wallPieces(f,W,H))if(allowed(f,(u0+u1)/2,(v0+v1)/2)){blade(a,f,u0+.03,v0,u0+.08,v1,.055,.06+cav,'#5f5b55',tag);blade(a,f,u1-.08,v0,u1-.03,v1,.055,.06+cav,'#5f5b55',tag)}
  tiles((u,z,U,Z)=>blade(a,f,u+.008,z+.008,U-.008,Z-.008,.06+cav,.085+cav,colorMix(col,'#ffffff',hash(u*7+z*13)*.18),tag),tw,th)}
 if(v.layer==='datepalm'&&f.wallHost){const t=Math.max(.04,Number(v.thick)||.1)*.9,m=insulations[v.insul]||insulations.datepalm;
  tiles((u,z,U,Z)=>{let c=colorMix(m[2],'#ffffff',hash(u*5+z*3)*.12);blade(a,f,u+.006,z+.006,U-.006,Z-.006,.056,.056+t,c,tag);for(let q=u+.05;q<U-.03;q+=.1)wallQuad(a,f,q,z+.02,q+.025,Z-.02,.06+t,colorMix(m[2],'#6b5532',.35),tag)},.6,1.2)}
 if(v.layer==='pcm'&&f.wallHost){tiles((u,z,U,Z)=>{blade(a,f,u,z,U,Z,.056,.07,'#e7e8ee',tag);blade(a,f,u+.03,z+.03,U-.03,Z-.03,.07,.1,hash(u*3+z*11)>.5?'#6d82c4':'#8b9fd6',tag)},.3,.3)}
 if(!f.shadeHost||v.system==='original')return;
 const spacing=Math.max(.5,Number(v.spacing)||1.8),depth=Number(v.depth)||.9,angle=(Number(v.angle)||0)*Math.PI/180;
 if(v.system==='fins'||v.system==='kinetic'){let count=Math.max(1,Math.min(80,Math.round(W/spacing)));for(let i=0;i<count;i++){let u=(i+.5)*W/count;if(!allowed(f,u,H*.5))continue;let t=Math.min(W/count*.21,.20);blade(a,f,u-t/2,.03,u+t/2,H-.03,k,k+Math.max(.09,depth*Math.cos(angle)),v.system==='fins'?'#bb7854':'#82959b',tag,depth*Math.sin(angle))}}
 if(v.system==='horizontal'||v.system==='pv'){let count=v.system==='pv'?1:Math.max(1,Math.min(20,Math.round(H/Math.max(.35,spacing*.6))));for(let i=0;i<count;i++){let z=H-(i+.12)*H/count,dx=v.system==='pv'?Math.max(depth,1.2):depth;if(!allowed(f,W*.5,z-.08))continue;blade(a,f,0,z-.13,W,z,k,k+dx,v.system==='pv'?'#526d79':'#b59373',tag);if(v.system==='pv'){for(let q=.4;q<W;q+=spacing)face(a,[pt(f,q,z+.01,k),pt(f,q+.04,z+.01,k),pt(f,q+.04,z+.01,k+dx),pt(f,q,z+.01,k+dx)],'#a7bec4',tag)}}}
 if(v.system==='perforated'){const open=Math.min(.7,Math.max(.1,(v.coverage||30)/100)),bl=.42,bh=.12,gap=bl*open/(1-open),kk=k+Math.min(depth,1.3);
  for(let u=0;u<=W;u+=3)if(allowed(f,Math.min(u,W-.05),H*.5))blade(a,f,Math.max(0,Math.min(u,W-.06)),0,Math.max(.06,Math.min(u+.06,W)),H,k,kk,'#5b5c58',tag);
  for(let row=0,z=.02;z<H-.04;row++,z+=bh){let off=row%2?(bl+gap)/2:0;for(let u=-off;u<W;u+=bl+gap){let u0=Math.max(0,u),u1=Math.min(W,u+bl);if(u1-u0<.05||!allowed(f,(u0+u1)/2,z+bh/2))continue;let sc=screens[v.screen]||screens.brick,c=colorMix(sc[1],sc[2],hash(row*31+Math.round(u*10)));face(a,[pt(f,u0,z,kk),pt(f,u1,z,kk),pt(f,u1,z+bh*.84,kk),pt(f,u0,z+bh*.84,kk)],c,tag);face(a,[pt(f,u0,z+bh*.84,kk),pt(f,u1,z+bh*.84,kk),pt(f,u1,z+bh*.84,kk+.1),pt(f,u0,z+bh*.84,kk+.1)],colorMix(c,'#ffffff',.18),tag)}}
  return}
 if(v.system==='trellis'){const kk=k+Math.max(.2,Math.min(depth,1.3)),cov=Math.max(.15,Math.min(1,(v.coverage||70)/100)),greens=['#3f6b33','#4f7a3a','#5f8c45','#6e9a4f','#7aa65a'],cs=.3;
  if(allowed(f,W/2,.2))blade(a,f,0,0,W,.38,kk-.18,kk+.22,'#6a5843',tag);
  for(let u=spacing/2;u<W;u+=spacing)if(allowed(f,u,H/2))blade(a,f,u-.012,.38,u+.012,H,kk-.012,kk+.012,'#4f5753',tag);
  for(let u=0;u<W;u+=cs)for(let z=.3;z<H;z+=cs){let r=hash(u*31.7+z*17.3+f.o[0]*3+f.o[1]*5+f.o[2]*7),need=cov*(1.25-.45*z/H);if(r>need||!allowed(f,u+cs/2,z+cs/2))continue;
   let j=(hash(r*91)-.5)*.08,d=kk+.02+.1*hash(r*37),c=greens[Math.floor(hash(r*53)*greens.length)],U=Math.min(W,u+cs*1.3),Z=Math.min(H,z+cs*1.3);face(a,[pt(f,u+j,z,d),pt(f,U,z+j,d+.03),pt(f,U-j,Z,d),pt(f,u,Z-j,d-.02)],c,tag);
   if(r<cov*.22){let [x,y,zz]=pt(f,u+cs/2,z+cs/2,d+.16);leaf(a,x,y,zz,.24+.12*r,Math.round(u*53+z*7),greens[Math.floor(hash(r*7)*greens.length)])}}
  return}
 if(v.system==='trellis'||v.system==='perforated'||v.system==='bionic'){
 let green=v.system==='trellis',bio=v.system==='bionic',step=Math.max(.52,spacing*.65,Math.sqrt(W*H/1200));for(let i=0;i<W;i+=step){for(let j=0;j<H;j+=step){let u=Math.min(i+step*.5,W-.1),z=Math.min(j+step*.5,H-.1);if(!allowed(f,u,z))continue;let rr=step*.46*Math.sqrt((v.coverage||70)/100),kk=k+Math.min(depth,1.3);if(green){wallQuad(a,f,i,Math.max(0,j),Math.min(i+.05,W),Math.min(H,j+step),kk,'#8a8b75',tag);wallQuad(a,f,i,j,Math.min(W,i+step),Math.min(j+.05,H),kk,'#898a72',tag);let r=hash(i*12+j*3+f.o[2]);if(r<(v.coverage||70)/100)leaf(a,...pt(f,u,z,kk+.12),rr*(1+.35*r),Math.round(i*53+j),r>.55?'#839a62':'#708451')}
 else if(bio){let amt=.25+.65*Math.sin(angle);face(a,[pt(f,u-rr,z,kk),pt(f,u,z-rr,kk+amt),pt(f,u+rr,z,kk),pt(f,u,z+rr,kk+amt)],'#b29367',tag)}
 else{wallQuad(a,f,i,j,Math.min(i+step*(v.coverage/170),W),Math.min(j+step,H),kk,'#b37955',tag);wallQuad(a,f,i,j,Math.min(W,i+step),Math.min(H,j+step*(v.coverage/220)),kk,'#b37955',tag)}}}}
 if(v.system==='custom'&&v.custom){let b=v.custom.bounds,range=b.hi.map((n,i)=>n-b.lo[i]),width=Math.max(.2,Math.min(W,spacing)),height=H,num=Math.max(1,Math.min(24,Math.floor(W/width)));for(let i=0;i<num;i++){let stride=W/num;if(!allowed(f,(i+.5)*stride,H*.5))continue;for(let cf of v.custom.faces){let p=cf.p.map(q=>pt(f,i*stride+(q[0]-b.lo[0])/Math.max(.001,range[0])*stride,(q[2]-b.lo[2])/Math.max(.001,range[2])*height,k+(q[1]-b.lo[1])/Math.max(.001,range[1])*depth));face(a,p,'#aa8468',tag)}}}
}
function rotatedDir(dir,angle){return dirs[(dirs.indexOf(dir)+Math.round((angle||0)/90)+4)%4]}
function targeted(v,dir,level){return(v.elevation==='all'||v.elevation===rotatedDir(dir,v.rotation))&&(v.floor==='all'||Number(v.floor)===level)}
function buildBase(project,v,opt={}){
 let a=[],shadows=[],floors=Math.max(1,project.levels||7),maxFloor=opt.cut?Math.max(1,Math.min(floors,opt.cut)):floors;
 if(project.model){
 const m=project.model,b=m.bounds,H=Math.max(.01,b.hi[2]-b.lo[2]);const hasGlass=m.faces.some(f=>f.kind==='glass');let hosts=[],hasStory=m.stories.length===floors;const byId=new Map(m.faces.map(f=>[f.label,f]));
 for(const f of m.faces){let n=normal(f.p),mid=f.p.reduce((s,p)=>s.map((x,i)=>x+p[i]/f.p.length),[0,0,0]);let level=f.level&&hasStory?m.stories.indexOf(f.level)+1:Math.max(1,Math.min(floors,Math.floor((mid[2]-.001)/H*floors)+1));let cutZ=maxFloor*H/floors;if((level>maxFloor&&(!opt.cut||Math.min(...f.p.map(p=>p[2]))>=cutZ))||f.kind==='internal'&&!opt.cut)continue;
 if(f.kind==='shade'&&v.system!=='original'){let parent=byId.get(f.host),facing=parent?normal(parent.p):[mid[0]/Math.max(.01,b.hi[0]-b.lo[0]),mid[1]/Math.max(.01,b.hi[1]-b.lo[1]),0];if(targeted(v,faceDir(facing),level)&&(!v.room||v.room==='all'||v.room===f.room))continue}
 if(n[0]*mid[0]+n[1]*mid[1]<0&&m.type==='OBJ')n=n.map(x=>-x);let dir=faceDir(n),vertical=Math.abs(n[2])<.45,tag={dir:vertical?dir:null,level,room:f.room};if(f.kind==='roof'&&v.roof==='green'){face(a,f.p,'#86a25a',tag);scatterPlants(a,f.p,n)}else{let p=f.kind==='glass'?f.p.map(p=>[p[0]+n[0]*.012,p[1]+n[1]*.012,p[2]]):f.p;face(a,p,baseColors[f.kind]||baseColors.wall,tag)}
 if(vertical&&['wall','glass'].includes(f.kind)&&targeted(v,dir,level)){let l=Math.hypot(n[0],n[1]),nx=n[0]/l,ny=n[1]/l,u=[-ny,nx],coord=f.p.map(p=>p[0]*u[0]+p[1]*u[1]),min=Math.min(...coord),max=Math.max(...coord),zlo=Math.min(...f.p.map(p=>p[2])),zhi=Math.max(...f.p.map(p=>p[2])),k=mid[0]*nx+mid[1]*ny,len=max-min,h=zhi-zlo;if(len>.14&&h>.14){let frame={o:[min*u[0]+k*nx,min*u[1]+k*ny,zlo],u,n:[nx,ny],len,h,dir,level,room:f.room,clip:f.p.map((p,i)=>[coord[i]-min,p[2]-zlo]),wallHost:f.kind==='wall',shadeHost:hasGlass?f.kind==='glass':f.kind==='wall'};hosts.push(frame)}}}
 for(let f of hosts)buildSystem(a,f,v,!v.room||v.room==='all'||v.room===f.room);
 if(v.roof==='green'&&m.type==='OBJ')for(const f of m.faces){let n=normal(f.p),z=Math.min(...f.p.map(p=>p[2]));if(Math.abs(n[2])>.9&&z>H*.75&&maxFloor===floors)face(a,f.p.map(p=>[p[0],p[1],p[2]+.016]),'#819268')}
 return{poly:a,bounds:b,shadows:[[b.lo[0],b.lo[1],b.hi[0]-b.lo[0],b.hi[1]-b.lo[1],H]],demo:false}}
 // A stepped office block with a planted terrace, glazed bays and a recessed plinth.
 const fh=3.5;let last;
 box(a,-17.1,-12.2,-.37,34.2,24.4,.37,'#c6c5b4');box(a,-16.15,-11.25,0,32.3,22.5,.23,'#e0d7c3');
 for(let i=0;i<maxFloor;i++){let x=i===0?-14.2:i<3?-14:-12.3,y=i===0?-9.7:i<3?-9.5:-6.5,w=i===0?28.4:i<3?28:19.9,d=i===0?19.4:i<3?19:15.7,z=.28+i*fh;last=[x,y,w,d,z+fh];if(v.mass==='bar'&&i>0){x=-13.7;y=-8.4;w=27.4;d=16.8;last=[x,y,w,d,z+fh]}let hot=i===0?'#a8a18e':'#d9c7ac';box(a,x-.32,y-.32,z,w+.64,d+.64,.33,hot);
 for(let dir of dirs){let f=faceFrame(dir,x,y,w,d,z+.33,fh-.36,{level:i+1,shadeHost:true,wallHost:true,room:dir+' perimeter · Level '+(i+1)}),tag={dir,level:i+1,room:f.room};let bays=Math.max(2,Math.round(f.len/1.83));for(let j=0;j<bays;j++){let u=j*f.len/bays,U=(j+1)*f.len/bays,r=hash(i*48+j*7+dir.charCodeAt(0)),col=['#889c9b','#788e91','#8fa2a0','#819598','#9aaca6'][Math.floor(r*5)];wallQuad(a,f,u+.025,.08,U-.02,f.h-.08,.015,col,tag);if(r>.71){wallQuad(a,f,u+.04,.10,U-.04,f.h*(.47+r*.25),.028,'#a0a9a0',tag)}wallQuad(a,f,u,.02,u+.065,f.h,.042,'#525f5d',tag);wallQuad(a,f,u+.01,f.h*.83,U,f.h*.83+.045,.047,'#6a7875',tag);if(j%3===0)blade(a,f,u-.06,0,u+.15,f.h,.05,.23,'#d7c4a7',tag)}
 wallQuad(a,f,0,.03,f.len,.12,.051,'#b5ae98',tag);let opaque=Math.max(0,1-(v.wwr??74)/100)*fh;
 wallQuad(a,f,0,.02,f.len,Math.min(f.h*.84,opaque*.65),.055,v.addons?.coating?'#f3f0e8':'#ccbaa0',tag);
 wallQuad(a,f,0,f.h-opaque*.22,f.len,f.h,.055,v.addons?.coating?'#f3f0e8':'#cbbba2',tag);
 f.bands=[[.02,Math.min(f.h*.84,opaque*.65)],[f.h-opaque*.22,f.h]];buildSystem(a,f,v,targeted(v,dir,i+1)&&(!v.room||v.room==='all'||v.room===f.room));}
 box(a,x-.42,y-.42,z+fh-.23,w+.84,d+.84,.27,'#e2cfb1');
 if(i===2&&i<maxFloor-1&&v.mass!=='bar'){box(a,8.7,-8.4,z+fh+.055,3.9,16.8,.30,'#abac8b');for(let n=0;n<6;n++)tree(a,10.5,-6.8+n*2.55,z+fh+.3,2.15,n+4);box(a,-12.8,-8.7,z+fh+.04,20.4,1.25,.29,'#979f7f')}
 }
 if(last){let [x,y,w,d,z]=last;box(a,x-.1,y-.1,z+.02,w+.2,d+.2,.16,'#d7d0ba');box(a,x+.55,y+.55,z+.16,w-1.1,d-1.1,v.roof==='green'?.06+(Number(v.substrate)||.12)*.6:.09,v.roof==='green'?'#7a6a4f':'#c7c8b5');if(v.roof==='green'){let top=z+.22+(Number(v.substrate)||.12)*.6,cover=Math.min(1,.35+(Number(v.lai)||2.5)*.15);box(a,x+.6,y+.6,top-.03,w-1.2,d-1.2,.03,'#86a25a');for(let gx=x+1.1;gx<x+w-1;gx+=1.25)for(let gy=y+1.1;gy<y+d-1;gy+=1.25){let r=hash(gx*13+gy*7);if(r>cover||(gx>x+w*.4&&gx<x+w*.43+4.3&&gy>y+d*.46&&gy<y+d*.48+3.6)||(gx>x+2&&gx<x+6.8&&gy>y+2.1&&gy<y+4.5))continue;leaf(a,gx+(r-.5)*.5,gy+(hash(gy*3+gx)-.5)*.5,top+.12,.32+r*.22,Math.round(gx*31+gy*17),r>.5?'#6f9a4c':'#87ad5c')}}for(let k of [[x,y,w,.13],[x,y,.13,d],[x,y+d-.13,w,.13],[x+w-.13,y,.13,d]])box(a,k[0],k[1],z+.12,k[2],k[3],.4,'#dfd1b8');
 if(maxFloor===floors){box(a,x+w*.43,y+d*.48,z+.24,4.1,3.4,1.25,'#c9c5ab');box(a,x+w*.43-.12,y+d*.48-.12,z+1.49,4.34,3.64,.15,'#e4d8ba');box(a,x+2.1,y+2.2,z+.24,4.5,2.2,.42,'#aeb2a1');for(let i=0;i<4;i++)box(a,x+2.25+i, y+2.37,z+.65,.63,1.7,.055,'#929d8d')}
 if(opt.cut){for(let j=0;j<3;j++)box(a,x+w*(j+1)/4,y+.1,z+.28,.14,d-.2,.8,'#aeaa96');box(a,x+.1,y+d*.54,z+.28,w-.2,.15,.8,'#aeaa96')}}
 const extraShadows=[];if(opt.context===true)neighbourhood(a,extraShadows,opt.landscape!==false);
 if(opt.landscape!==false){for(let [x,y,h,s]of[[-15,-7,3.7,3],[-15.1,4.2,4.1,4],[14.8,-6.2,3.9,6],[14.9,3.1,4.1,8],[7.7,-10.2,3.5,1]])tree(a,x,y,.22,h,s);
 box(a,-7.7,-11.35,.25,7.5,1,.21,'#b7b6a0');for(let i=0;i<4;i++)box(a,-8.2,-11.73-.30*i,.02,8.4,.31,.2-.04*i,'#d6d0bb')}
 shadows=[[-14,-9.5,28,19,10.7],[-12.3,-6.5,19.9,15.7,maxFloor*fh+.8],...extraShadows];
 return{poly:a,bounds:{lo:[-17,-12,0],hi:[17,12,floors*fh+2]},shadows,demo:true}
}
export {colorMix}

export function buildScene(project,v,opt={}){
 const scene=buildBase(project,effective(v),opt);
 if(project.model&&opt.cut){let b=project.model.bounds,coeff=opt.cut/Math.max(1,project.levels),hi=b.lo[2]+(b.hi[2]-b.lo[2])*coeff;scene.poly=scene.poly.flatMap(f=>{let p=[];for(let i=0;i<f.p.length;i++){let a=f.p[i],b=f.p[(i+1)%f.p.length];if(a[2]<=hi)p.push(a);if((a[2]>hi)!==(b[2]>hi)){let t=(hi-a[2])/(b[2]-a[2]);p.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1]),hi])}}return p.length>=3?[{...f,p}]:[]})}
 if(!project.model&&v.mass==='twins'){let output=[];for(const sign of [-1,1])for(const f of scene.poly)output.push({...f,p:f.p.map(([x,y,z])=>[x*.65+sign*12,y*.65+sign*2.5,z])});scene.poly=output;scene.shadows=scene.shadows.flatMap(([x,y,w,d,h])=>[-1,1].map(s=>[x*.65+s*12,y*.65+s*2.5,w*.65,d*.65,h]));scene.bounds=bounds(output)}
 const angle=(v.rotation||0)*Math.PI/180;if(angle){let c=Math.cos(angle),s=Math.sin(angle),rot=([x,y,z])=>[x*c+y*s,-x*s+y*c,z];scene.poly=scene.poly.map(f=>({...f,p:f.p.map(rot),tag:f.tag?{...f.tag,dir:f.tag.dir?rotatedDir(f.tag.dir,v.rotation):null}:null}));scene.bounds=bounds(scene.poly);scene.shadows=scene.shadows.map(([x,y,w,d,h])=>{let pts=[[x,y,0],[x+w,y,0],[x+w,y+d,0],[x,y+d,0]].map(rot),b=bounds([{p:pts}]);return[b.lo[0],b.lo[1],b.hi[0]-b.lo[0],b.hi[1]-b.lo[1],h]})}return scene
}
