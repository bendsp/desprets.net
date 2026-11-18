const noise = `
float hash(vec2 p){
  vec3 p3=fract(vec3(p.xyx)*.1031);
  p3+=dot(p3,p3.yzx+33.33);
  return fract((p3.x+p3.y)*p3.z);
}
float noise2(vec2 p){
  vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
    mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);
}
float fbm(vec2 p){
  return .52*noise2(p)+.26*noise2(p*2.07+13.)+.14*noise2(p*4.19+32.)+.08*noise2(p*8.5);
}
vec3 horizon(float t){
  vec3 c=mix(vec3(.96,.88,.71),vec3(1.,.53,.28),smoothstep(.04,.64,t));
  return mix(c,vec3(.39,.31,.45),smoothstep(.61,1.,t));
}
`;

export const skyVertex = `
attribute vec2 pos;
varying vec2 uv;
void main(){uv=pos;gl_Position=vec4(pos,1.,1.);}
`;
export const skyFragment =
  `
precision highp float;
varying vec2 uv;
uniform sampler2D clouds;
uniform vec2 lens;
uniform vec3 sun;
uniform float dusk;
` +
  noise +
  `
void main(){
  vec3 ray=normalize(vec3(uv*lens,-1.));
  float h=max(0.,ray.y);
  vec3 top=mix(vec3(.26,.58,.85),vec3(.39,.40,.64),smoothstep(.05,.62,dusk));
  top=mix(top,vec3(.063,.091,.20),smoothstep(.61,1.,dusk));
  vec3 sky=mix(horizon(dusk),top,1.-exp(-h*4.0));
  float dist=length(ray-sun);
  float day=1.-smoothstep(.73,.98,dusk);
  vec3 sunlight=mix(vec3(1.,.89,.61),vec3(1.,.47,.16),smoothstep(.0,.73,dusk));
  sky=mix(sky,sunlight,(.42*exp(-dist*4.)+.46*exp(-dist*22.))*day);
  // Intersect view rays with a high cloud deck. Wisps converge at the horizon.
  vec2 deck=ray.xz/(max(.025,h)+.055);
  float cloud=texture2D(clouds,(deck+vec2(13.))/vec2(26.,13.)).r*smoothstep(.012,.12,h);
  vec3 cloudColor=mix(vec3(1.,.96,.84),vec3(.99,.59,.43),smoothstep(.18,.62,dusk));
  cloudColor=mix(cloudColor,vec3(.33,.31,.44),smoothstep(.62,1.,dusk));
  sky=mix(sky,cloudColor,cloud*.71);
  sky=mix(sky,vec3(1.,.96,.77),day*(1.-smoothstep(.013,.016,dist))*(1.-.32*cloud));
  vec2 stars=ray.xy*395.;
  float star=step(.995,hash(floor(stars)))*(1.-smoothstep(.015,.19,length(fract(stars)-.5)));
  sky+=star*smoothstep(.85,1.,dusk)*smoothstep(.08,.3,h)*.7;
  gl_FragColor=vec4(sky,1.);
}`;
export const landVertex = `
precision highp float;
attribute vec3 pos,color;
attribute vec2 plant;
uniform vec2 lens;
uniform vec3 eye;
uniform float clock;
varying vec3 world,albedo;
varying float kind,depth;
void main(){
  world=pos;
  float gust=sin(clock*1.35+pos.x*1.63+pos.z*.79)+.45*sin(clock*2.04+pos.z*2.72);
  world.x+=plant.x*.030*gust; world.z+=plant.x*.014*gust;
  if(plant.y>10.5 && plant.y<11.5){
    vec2 local=vec2(plant.x,color.b);
    float a=mod(clock,52.)*.1208305;
    world=pos;world.xy+=mat2(cos(a),sin(a),-sin(a),cos(a))*local-local;
  }
  albedo=color*(plant.y==1. ? .75+.32*plant.x : 1.);
  kind=plant.y;
  vec3 v=world-eye; depth=-v.z;
  gl_Position=vec4(v.xy/lens,depth*1.001-.090,depth);
}`;
export const landFragment =
  `
#extension GL_OES_standard_derivatives : enable
precision highp float;
uniform vec3 eye;
uniform sampler2D flora, grass, legends, trees, peaks, twigs;
uniform vec2 oakRoot;
uniform float dusk;
uniform vec3 sun;
varying vec3 world,albedo;
varying float kind,depth;
` +
  noise +
  `
void main(){
  vec3 col=albedo;
  if(kind>12.5){
    vec3 n=normalize(cross(dFdx(world),dFdy(world)));
    float furrow=noise2(vec2((world.x+world.z*.63)*47.,world.y*3.4));
    col*=.65+.25*furrow+.32*max(0.,dot(n,sun));
  }else if(kind>11.5){
    vec4 leaf=texture2D(twigs,albedo.xy);
    if(leaf.a<.36)discard;
    vec3 n=normalize(cross(dFdx(world),dFdy(world)));
    float lit=smoothstep(.40,1.03,albedo.z);
    vec3 leafLight=mix(vec3(.64,.82,.85),vec3(1.14,1.05,.80),lit);
    col=leaf.rgb*leafLight*albedo.z*(.77+.32*abs(dot(n,sun)));
  }else if(kind>10.5){
    col=vec3(albedo.r,albedo.g,albedo.g*.81);
  }else if(kind>9.5){
    float ripple=noise2(world.xz*vec2(3.1,27.)+noise2(world.xz*1.8)*1.5);
    float glint=smoothstep(.84,.98,ripple)*smoothstep(.16,.72,noise2(world.xz*.64));
    float reflection=noise2(world.xz*vec2(.49,.26));
    col=mix(vec3(.28,.40,.37),vec3(.53,.63,.65),smoothstep(.20,.77,reflection));
    col+=(ripple-.5)*vec3(.09,.12,.13)+glint*vec3(.28,.25,.19);
  }else if(kind>7.5){
    vec4 sampleColor=kind>8.5?texture2D(peaks,albedo.xy):texture2D(trees,albedo.xy);
    if(sampleColor.a<.38)discard;
    col=sampleColor.rgb*albedo.z;
  }else if(kind>6.5){
    vec3 cap=albedo.z>.75 ? vec3(.76,.241,.16) : albedo.z>.25 ? vec3(.25,.29,.34) : vec3(.41,.45,.5);
    col=mix(cap,vec3(.91,.91,.85),texture2D(legends,albedo.xy).r);
  }else if(kind>4.5){
    vec4 plant=kind>5.5?texture2D(grass,albedo.xy):texture2D(flora,albedo.xy);
    if(plant.a<.39) discard;
    col=plant.rgb*albedo.z*(.67+.33*(1.-albedo.y));
  }else if(kind<.5){
    float patches=fbm(world.xz*.91);
    col*=.61+.67*patches;
    col+=vec3(.064,.055,.013)*noise2(world.xz*26.);
  }else if(kind>3.5){
    vec3 slope=normalize(cross(dFdx(world),dFdy(world)));
    col*=.53+.42*max(0.,dot(slope,normalize(vec3(.70,.32,-.32))))+.35*fbm(world.xy*.86);
  }else if(kind>2.5){
    vec3 n=normalize(cross(dFdx(world),dFdy(world)));
    float diffuse=max(0.,dot(n,sun));
    col*=.69+.44*diffuse;
    if(albedo.b>.50){
      vec3 reflected=reflect(normalize(world-eye),n);
      col*=.56+.70*smoothstep(-.64,.70,reflected.y);
      col+=vec3(.26,.25,.21)*pow(max(0.,dot(reflected,sun)),12.);
    }
    if(albedo.r>albedo.b*1.6){
      float grain=noise2(vec2(world.x*1.9,world.z*76.));
      col*=.82+.26*grain+.07*sin(world.z*171.+noise2(world.xz*4.)*3.);
    }
  }
  // Soft contact and cast shadows beneath the desktop and in the grass.
  if(kind<2.5){
    vec2 s=world.xz-vec2(.42,-.2);
    float shadow=exp(-s.x*s.x*.65-s.y*s.y*2.0);
    vec2 projection=world.xz+(sun.xz/max(.14,sun.y))*(.92-world.y);
    float occlusion=(1.-smoothstep(1.44,1.84,abs(projection.x)))*(1.-smoothstep(.47,.72,abs(projection.y)));
    col*=1.-shadow*.25-occlusion*.28*(1.-dusk);
  }
  if(kind<.5 || (kind>4.5 && kind<6.5)){
    vec2 shade=(world.xz-oakRoot-vec2(-1.25,1.1))/vec2(2.3,1.65);
    col*=1.-.31*exp(-dot(shade,shade))*(1.-dusk);
  }
  vec3 light=mix(vec3(1.07,1.035,.94),vec3(.99,.69,.53),smoothstep(.03,.66,dusk));
  light=mix(light,vec3(.30,.34,.47),smoothstep(.59,1.,dusk));
  col*=light;
  float haze=1.-exp(-max(depth-4.,0.)*(kind>3.5?.013:.016));
  gl_FragColor=vec4(mix(col,mix(horizon(dusk),vec3(.55,.69,.79),.74*(1.-smoothstep(.15,.75,dusk))),haze*(kind>8.5 && kind<9.5?.62:.92)),1.);
}`;
