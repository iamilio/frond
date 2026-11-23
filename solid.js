import {normal} from './model.js?v=20261122f';
// Depth-tested WebGL rendering with sun lighting, moving objects and ground shadows,
// plus a software rasterizer fallback.
let renderer;
const cache = new WeakMap(), colors = new Map();
const GLASS = new Set(['#789391', '#889c9b', '#788e91', '#8fa2a0', '#819598', '#9aaca6', '#4d5a60']);
const STRIDE = 10; // position 3, colour 3, normal 3, glow 1

const VS = `attribute vec3 vertex;attribute vec3 color;attribute vec3 nrm;attribute float glow;
uniform vec3 center;uniform vec2 direction;uniform vec2 elevation;uniform vec2 size;uniform vec2 offset;uniform float depthRange;
uniform vec3 sun;uniform float day;uniform float night;uniform float flatShade;varying lowp vec3 tint;
void main(){vec3 v=vertex-center;float hor=dot(v.xy,direction);float x=dot(v.xy,vec2(-direction.y,direction.x));
float y=v.z*elevation.y-hor*elevation.x;float z=-(hor*elevation.y+v.z*elevation.x)/depthRange;
gl_Position=vec4(x*size.x+offset.x,y*size.y+offset.y,z,1.0);
vec3 cam=vec3(direction*elevation.y,elevation.x);vec3 n=nrm;if(dot(n,cam)<0.0)n=-n;
float d=max(0.0,dot(n,sun))*day;float l=flatShade>0.5?1.0:(0.58+0.17*day+0.42*d);
vec3 c=color*l;c=mix(c,c*vec3(0.42,0.5,0.72),night*(1.0-flatShade));
if(glow>0.5)c=mix(c,vec3(1.0,0.82,0.5),0.85*night);tint=c;}`;
const FS = `precision mediump float;varying lowp vec3 tint;uniform float alpha;void main(){gl_FragColor=vec4(tint*alpha,alpha);}`;

function initialize() {
  const canvas = document.createElement('canvas'), gl = canvas.getContext('webgl', {alpha: true, antialias: true, premultipliedAlpha: true, preserveDrawingBuffer: true});
  if (!gl) return null;
  const shader = (kind, src) => { const s = gl.createShader(kind); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(s)); return s; };
  const p = gl.createProgram(); gl.attachShader(p, shader(gl.VERTEX_SHADER, VS)); gl.attachShader(p, shader(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
  gl.useProgram(p);
  const loc = {}; for (const n of ['center', 'direction', 'elevation', 'size', 'offset', 'depthRange', 'sun', 'day', 'night', 'flatShade', 'alpha']) loc[n] = gl.getUniformLocation(p, n);
  const attr = {pos: gl.getAttribLocation(p, 'vertex'), col: gl.getAttribLocation(p, 'color'), nrm: gl.getAttribLocation(p, 'nrm'), glow: gl.getAttribLocation(p, 'glow')};
  for (const k in attr) gl.enableVertexAttribArray(attr[k]);
  gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.clearColor(0, 0, 0, 0);
  return {gl, canvas, loc, attr, buffers: {static: gl.createBuffer(), dynamic: gl.createBuffer(), overlay: gl.createBuffer()}, last: null};
}
function bind(r, buffer) {
  const {gl, attr} = r, B = STRIDE * 4; gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(attr.pos, 3, gl.FLOAT, false, B, 0); gl.vertexAttribPointer(attr.col, 3, gl.FLOAT, false, B, 12);
  gl.vertexAttribPointer(attr.nrm, 3, gl.FLOAT, false, B, 24); gl.vertexAttribPointer(attr.glow, 1, gl.FLOAT, false, B, 36);
}
function triangles(points, n) {
  if (points.length === 3) return [0, 1, 2]; if (points.length === 4) return [0, 1, 2, 0, 2, 3];
  let skip = Math.abs(n[2]) > .6 ? 2 : Math.abs(n[0]) > Math.abs(n[1]) ? 0 : 1, coords = points.map(p => p.filter((_, i) => i !== skip)), idx = points.map((_, i) => i), out = [];
  let sign = 0; for (let i = 0; i < coords.length; i++) { let a = coords[i], b = coords[(i + 1) % coords.length]; sign += a[0] * b[1] - a[1] * b[0]; }
  let orientation = Math.sign(sign) || 1; const cross = (a, b, c) => orientation * ((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]));
  while (idx.length > 3) { let ok = false; for (let i = 0; i < idx.length; i++) { let a = idx[(i - 1 + idx.length) % idx.length], b = idx[i], c = idx[(i + 1) % idx.length]; if (cross(coords[a], coords[b], coords[c]) <= 1e-9) continue; if (idx.some(j => j !== a && j !== b && j !== c && cross(coords[a], coords[b], coords[j]) >= 0 && cross(coords[b], coords[c], coords[j]) >= 0 && cross(coords[c], coords[a], coords[j]) >= 0)) continue; out.push(a, b, c); idx.splice(i, 1); ok = true; break; } if (!ok) { for (let j = 1; j + 1 < idx.length; j++) out.push(idx[0], idx[j], idx[j + 1]); return out; } }
  out.push(...idx); return out;
}
function rgbOf(c) { let rgb = colors.get(c); if (!rgb) { const hex = parseInt(c.slice(1, 7), 16); rgb = [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255].map(v => v / 255); colors.set(c, rgb); } return rgb; }
// Unlit colours, normals and a per-face window-glow flag; lighting happens in the shader.
function packFaces(faces) {
  const data = [];
  faces.forEach((f, fi) => {
    const n = f.n || (f.n = normal(f.p)), rgb = rgbOf(f.c), glass = GLASS.has(f.c);
    const lo = Math.min(...f.p.map(p => p[2])), hi = Math.max(...f.p.map(p => p[2]));
    const glow = glass && (Math.sin(fi * 12.9898 + lo * 3.1) * 43758.5453 % 1 + 1) % 1 > .45 ? 1 : 0;
    for (const i of triangles(f.p, n)) { const p = f.p[i], t = hi > lo ? (p[2] - lo) / (hi - lo) : 1, g = glass && f.c !== '#4d5a60' ? (.82 + .22 * t) : 1; data.push(...p, ...rgb.map(v => v * g), ...n, glow); }
  });
  return new Float32Array(data);
}
function packed(scene) { let c = cache.get(scene); if (!c) { c = packFaces(scene.poly); cache.set(scene, c); } return c; }

export function drawSolid(ctx, scene, settings, extra = {}) {
  try {
    if (renderer === undefined) renderer = initialize(); if (!renderer) return false;
    const r = renderer, {gl, loc, canvas} = r, {W, H, mx, my, mz, scale, ox, oy, cx, cy, sa, ca, extent} = settings;
    const d = Math.min(devicePixelRatio || 1, 2), w = Math.round(W * d), h = Math.round(H * d);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, w, h); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniform3f(loc.center, mx, my, mz); gl.uniform2f(loc.direction, cx, cy); gl.uniform2f(loc.elevation, sa, ca);
    gl.uniform2f(loc.size, 2 * scale / W, 2 * scale / H); gl.uniform2f(loc.offset, 2 * ox / W - 1, 1 - 2 * oy / H); gl.uniform1f(loc.depthRange, Math.max(extent * 3, 420));
    const sun = extra.sun || [-.45, -.55, .7], day = extra.day ?? 1, night = extra.night ?? 0;
    gl.uniform3f(loc.sun, sun[0], sun[1], sun[2]); gl.uniform1f(loc.day, day); gl.uniform1f(loc.night, night);
    // Static scene.
    gl.uniform1f(loc.flatShade, 0); gl.uniform1f(loc.alpha, 1); gl.disable(gl.BLEND); gl.depthMask(true);
    const data = packed(scene); bind(r, r.buffers.static); if (r.last !== data) { gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); r.last = data; }
    gl.drawArrays(gl.TRIANGLES, 0, data.length / STRIDE);
    // Moving objects (cars), repacked every frame.
    if (extra.dynamic?.length) { const dyn = packFaces(extra.dynamic); bind(r, r.buffers.dynamic); gl.bufferData(gl.ARRAY_BUFFER, dyn, gl.DYNAMIC_DRAW); gl.drawArrays(gl.TRIANGLES, 0, dyn.length / STRIDE); }
    // Ground shadows: flat, translucent, hidden where buildings stand in front.
    if (extra.overlay?.length) { const ov = packFaces(extra.overlay); bind(r, r.buffers.overlay); gl.bufferData(gl.ARRAY_BUFFER, ov, gl.DYNAMIC_DRAW); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false); gl.uniform1f(loc.flatShade, 1); gl.uniform1f(loc.alpha, extra.overlayAlpha ?? .26); gl.drawArrays(gl.TRIANGLES, 0, ov.length / STRIDE); gl.depthMask(true); gl.disable(gl.BLEND); }
    ctx.drawImage(canvas, 0, 0, W, H); return true;
  } catch (e) { console.error("drawSolid", e); renderer = null; return false; }
}

let soft;
export function drawSoftware(ctx, scene, {W, H, mx, my, mz, scale, ox, oy, cx, cy, sa, ca}, extra = {}) {
  const d = Math.min(1.4, Math.max(1, devicePixelRatio || 1)), w = Math.round(W * d), h = Math.round(H * d);
  if (!soft || soft.w !== w || soft.h !== h) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const gc = cv.getContext('2d'); soft = {w, h, cv, gc, im: gc.createImageData(w, h), depth: new Float32Array(w * h)}; }
  const {cv, gc, im, depth} = soft, px = new Uint32Array(im.data.buffer); px.fill(0); depth.fill(-Infinity);
  const sun = extra.sun || [-.45, -.55, .7], day = extra.day ?? 1, night = extra.night ?? 0, cam = [cx * ca, cy * ca, sa];
  const parts = [packed(scene)]; if (extra.dynamic?.length) parts.push(packFaces(extra.dynamic));
  const A = new Float64Array(18);
  for (const data of parts) for (let j = 0; j < data.length; j += 3 * STRIDE) {
    let n = [data[j + 6], data[j + 7], data[j + 8]]; if (n[0] * cam[0] + n[1] * cam[1] + n[2] * cam[2] < 0) n = n.map(v => -v);
    const lit = (.58 + .17 * day + .42 * Math.max(0, n[0] * sun[0] + n[1] * sun[1] + n[2] * sun[2]) * day), shade = [1 - .58 * night, 1 - .5 * night, 1 - .28 * night];
    for (let k = 0; k < 3; k++) { const o = j + k * STRIDE, x = data[o] - mx, y = data[o + 1] - my, z = data[o + 2] - mz, u = x * cx + y * cy; A[k * 6] = (ox + scale * (-cy * x + cx * y)) * d; A[k * 6 + 1] = (oy + scale * (u * sa - z * ca)) * d; A[k * 6 + 2] = u * ca + z * sa; for (let q = 0; q < 3; q++) A[k * 6 + 3 + q] = data[o + 3 + q] * lit * shade[q] * 255; }
    const x0 = A[0], y0 = A[1], x1 = A[6], y1 = A[7], x2 = A[12], y2 = A[13], den = (y1 - y2) * (x0 - x2) + (x2 - x1) * (y0 - y2); if (Math.abs(den) < .001) continue;
    const l = Math.max(0, Math.floor(Math.min(x0, x1, x2))), r = Math.min(w - 1, Math.ceil(Math.max(x0, x1, x2))), t = Math.max(0, Math.floor(Math.min(y0, y1, y2))), b = Math.min(h - 1, Math.ceil(Math.max(y0, y1, y2)));
    for (let yy = t; yy <= b; yy++) for (let xx = l; xx <= r; xx++) { const a = ((y1 - y2) * (xx + .5 - x2) + (x2 - x1) * (yy + .5 - y2)) / den; if (a < -.00005) continue; const v = ((y2 - y0) * (xx + .5 - x2) + (x0 - x2) * (yy + .5 - y2)) / den; if (v < -.00005 || a + v > 1.00005) continue; const u = 1 - a - v, k = yy * w + xx, z = A[2] * a + A[8] * v + A[14] * u; if (z < depth[k] - .00001) continue; depth[k] = z; const rr = A[3] * a + A[9] * v + A[15] * u, gg = A[4] * a + A[10] * v + A[16] * u, bb = A[5] * a + A[11] * v + A[17] * u; px[k] = (255 << 24) | (Math.min(255, bb) << 16) | (Math.min(255, gg) << 8) | Math.min(255, rr); }
  }
  gc.putImageData(im, 0, 0); ctx.drawImage(cv, 0, 0, W, H); return true;
}
