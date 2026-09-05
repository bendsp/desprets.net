import { BufferGeometry, Float32BufferAttribute, Path, Shape, Vector2 } from "three";

// Proportions from a straight-on AGS housing photograph; one unit is about 24 mm.
export const DPAD = { x: -.85, z: -.25, radius: .59 };
export const ACTION = { x: .82, z: -.27, radius: .345, span: .56, angle: .31 };
export const SMALL = { z: 1.25, radius: .215, xs: [-.30, .30] };
export const SPEAKER = Array.from({length: 16}, (_,i) => ({
  x: (i%4-1.5)*.165, z: .33+Math.floor(i/4)*.165,
  radius: (i%4 === 1 || i%4 === 2) && (Math.floor(i/4) === 1 || Math.floor(i/4) === 2) ? .03 : .021,
}));

export function capsulePoints(radius: number, span = 0) {
  return Array.from({length: 66}, (_,i) => {
    const right = i < 33, step = right ? i : i-33;
    const angle = (right ? -Math.PI/2 : Math.PI/2) + step*Math.PI/32;
    return new Vector2((right ? span/2 : -span/2)+Math.cos(angle)*radius, Math.sin(angle)*radius);
  });
}
export function capsuleShape(radius: number, span = 0) {
  return new Shape(capsulePoints(radius,span));
}
function hole(x: number, z: number, radius: number, span = 0, angle = 0) {
  const points = capsulePoints(radius,span).map(p => new Vector2(x+p.x*Math.cos(angle)-p.y*Math.sin(angle),-z+p.x*Math.sin(angle)+p.y*Math.cos(angle)));
  return new Path(points);
}
export function deckShape() {
  const s = new Shape(), h = 1.685, r = .16;
  s.moveTo(-h+r,-h); s.lineTo(h-r,-h); s.quadraticCurveTo(h,-h,h,-h+r);
  s.lineTo(h,h-r); s.quadraticCurveTo(h,h,h-r,h); s.lineTo(-h+r,h);
  s.quadraticCurveTo(-h,h,-h,h-r); s.lineTo(-h,-h+r); s.quadraticCurveTo(-h,-h,-h+r,-h);
  s.holes.push(hole(DPAD.x,DPAD.z,DPAD.radius),hole(ACTION.x,ACTION.z,ACTION.radius,ACTION.span,ACTION.angle));
  SMALL.xs.forEach(x => s.holes.push(hole(x,SMALL.z,SMALL.radius)));
  s.holes.push(hole(0,-1.0,.135));
  SPEAKER.forEach(p => s.holes.push(hole(p.x,p.z,p.radius)));
  return s;
}
// A sloped wall joins the deck to the pocket floor; these are actual cut-outs.
export function recessWall(radius: number, span = 0) {
  const rings = [[radius,.181],[radius-.012,.173],[radius-.055,.125],[radius-.065,.12]];
  const vertices: number[] = [], indices: number[] = [];
  rings.forEach(([r,y]) => capsulePoints(r,span).forEach(p => vertices.push(p.x,y,-p.y)));
  const n = 66;
  for(let row=0;row<rings.length-1;row++) for(let i=0;i<n;i++) {
    const a=row*n+i,b=row*n+(i+1)%n,c=a+n,d=b+n;
    indices.push(a,c,b,b,c,d);
  }
  const geometry=new BufferGeometry(); geometry.setAttribute("position",new Float32BufferAttribute(vertices,3)); geometry.setIndex(indices); geometry.computeVertexNormals();
  return geometry;
}
