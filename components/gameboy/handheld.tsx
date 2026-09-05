"use client";

import { useEffect, useMemo, useRef, type MutableRefObject, type ReactNode } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { CanvasTexture, DataTexture, Group, MathUtils, RepeatWrapping, RGBAFormat, Shape, SRGBColorSpace } from "three";
import type { Control } from "./console";
import { lidAt, OPEN_LID_ANGLE } from "./boot";
import { DPAD, ACTION, SMALL, SPEAKER, capsuleShape, deckShape, recessWall } from "./hardware-geometry";

type Position = [number, number, number];
type Props = {
  bootOpening: boolean; waiting: boolean; onStart: () => void;
  display: ReactNode; time: MutableRefObject<number>; booting: boolean; open: boolean; power: boolean;
  reduced: boolean; pressed: ReadonlySet<Control>; onControl: (control: Control) => void;
  onPress: (control: Control, source: string) => void; onRelease: (source: string) => void; onFold: () => void; onPower: () => void;
};

const hover = (event: ThreeEvent<PointerEvent>) => { event.stopPropagation(); document.body.style.cursor = "pointer"; };
const unhover = () => { document.body.style.cursor = "auto"; };

function ButtonTravel({ control, pressed, reduced, onPress, onRelease, children }: Pick<Props, "pressed" | "reduced" | "onPress" | "onRelease"> & { control: Control; children: ReactNode }) {
  const group = useRef<Group>(null); const { invalidate } = useThree();
  useFrame((_, delta) => {
    if (!group.current) return;
    const target = pressed.has(control) ? -.024 : 0;
    group.current.position.y = reduced ? target : MathUtils.damp(group.current.position.y, target, 35, Math.min(delta, .05));
    if (Math.abs(group.current.position.y - target) > .0001) invalidate();
  });
  return <group ref={group} onPointerOver={hover} onPointerOut={unhover} onPointerDown={event => {
    event.stopPropagation(); (event.target as Element).setPointerCapture?.(event.pointerId); onPress(control, `pointer-${event.pointerId}`);
  }} onPointerUp={event => { event.stopPropagation(); (event.target as Element).releasePointerCapture?.(event.pointerId); onRelease(`pointer-${event.pointerId}`); }} onClick={event => event.stopPropagation()}>{children}</group>;
}

function Label({ text, position, width, height = .1, color = "#333841", rotation = [0, 0, 0] }: { text: string; position: Position; width: number; height?: number; color?: string; rotation?: Position }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024; canvas.height = 128;
    const context = canvas.getContext("2d");
    if (context) {
      context.font = `600 78px Arial, sans-serif`;
      canvas.width = Math.ceil(context.measureText(text).width + 32);
      context.fillStyle = color; context.font = `600 78px Arial, sans-serif`;
      context.textAlign = "center"; context.textBaseline = "middle";
      context.fillText(text, canvas.width / 2, 68);
    }
    const result = new CanvasTexture(canvas); result.colorSpace = SRGBColorSpace;
    return result;
  }, [text, color]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <mesh position={position} rotation={rotation}>
    <planeGeometry args={[width, height]} /><meshBasicMaterial map={texture} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-1} />
  </mesh>;
}

function Disc({ position, radius, depth = .035, color = "#363b42", metalness = .15, onClick }: { position: Position; radius: number; depth?: number; color?: string; metalness?: number; onClick?: () => void }) {
  return <mesh position={position} castShadow receiveShadow onPointerOver={onClick ? hover : undefined} onPointerOut={onClick ? unhover : undefined} onClick={onClick ? event => { if (event.delta > 4) return; event.stopPropagation(); onClick(); } : undefined}>
    <cylinderGeometry args={[radius, radius * 1.03, depth, 48]} /><meshStandardMaterial color={color} roughness={.42} metalness={metalness} />
  </mesh>;
}

function Recess({ x, z, radius, span = 0, angle = 0 }: { x: number; z: number; radius: number; span?: number; angle?: number }) {
  const wall = useMemo(() => recessWall(radius,span),[radius,span]);
  const floor = useMemo(() => capsuleShape(radius-.062,span),[radius,span]);
  useEffect(() => () => wall.dispose(),[wall]);
  return <group position={[x,0,z]} rotation={[0,angle,0]}>
    <mesh geometry={wall} receiveShadow><meshStandardMaterial color="#a9afb5" metalness={.55} roughness={.38} side={2} /></mesh>
    <mesh position={[0,.12,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><shapeGeometry args={[floor]} /><meshStandardMaterial color="#b7bdc3" metalness={.5} roughness={.4} /></mesh>
  </group>;
}

export function Handheld({ bootOpening, waiting, onStart, display, time, booting, open, power, reduced, pressed, onControl, onPress, onRelease, onFold, onPower }: Props) {
  const lid = useRef<Group>(null);
  const cross = useRef<Group>(null);
  const { invalidate } = useThree();
  const lidAngle = useRef(reduced ? OPEN_LID_ANGLE : Math.PI / 2);
  const deck = useMemo(() => deckShape(), []);
  const [grain, dpad] = useMemo(() => {
    const data = new Uint8Array(128 * 128 * 4);
    let seed = 73;
    for (let i = 0; i < data.length; i += 4) {
      seed = (seed * 16807) % 2147483647;
      const value = 230 + seed % 25;
      data[i] = value; data[i + 1] = value; data[i + 2] = value; data[i + 3] = 255;
    }
    const map = new DataTexture(data, 128, 128, RGBAFormat);
    map.wrapS = map.wrapT = RepeatWrapping; map.repeat.set(7, 7); map.needsUpdate = true;
    const shape = new Shape();
    const points = [[-.17, .49], [.17, .49], [.17, .17], [.49, .17], [.49, -.17], [.17, -.17], [.17, -.49], [-.17, -.49], [-.17, -.17], [-.49, -.17], [-.49, .17], [-.17, .17]];
    points.forEach(([x, y], index) => index === 0 ? shape.moveTo(x*.77, y*.77) : shape.lineTo(x*.77, y*.77)); shape.closePath();
    return [map, shape] as const;
  }, []);
  useEffect(() => () => grain.dispose(), [grain]);
  useEffect(() => { invalidate(); }, [open, reduced, invalidate]);
  useFrame((_, delta) => {
    const target = open ? OPEN_LID_ANGLE : Math.PI / 2;
    lidAngle.current = waiting && bootOpening ? Math.PI / 2 : booting && bootOpening ? reduced ? OPEN_LID_ANGLE : lidAt(time.current) : reduced ? target : MathUtils.damp(lidAngle.current, target, 8, Math.min(delta, .05));
    if (lid.current) lid.current.rotation.x = lidAngle.current;
    if (!booting && Math.abs(lidAngle.current - target) > .0001) invalidate();
    if (cross.current) {
      const x = (Number(pressed.has("up")) - Number(pressed.has("down"))) * .065;
      const z = (Number(pressed.has("left")) - Number(pressed.has("right"))) * .065;
      cross.current.rotation.x = reduced ? x : MathUtils.damp(cross.current.rotation.x, x, 35, Math.min(delta, .05));
      cross.current.rotation.z = reduced ? z : MathUtils.damp(cross.current.rotation.z, z, 35, Math.min(delta, .05));
      const y = x || z ? .13 : .146;
      cross.current.position.y = reduced ? y : MathUtils.damp(cross.current.position.y, y, 35, Math.min(delta, .05));
      if (Math.abs(cross.current.rotation.x - x) + Math.abs(cross.current.rotation.z - z) + Math.abs(cross.current.position.y - y) > .0001) invalidate();
    }
  });
  const silver = <meshPhysicalMaterial color="#bfc2c5" metalness={.5} roughness={.38} roughnessMap={grain} bumpMap={grain} bumpScale={.00025} clearcoat={.14} clearcoatRoughness={.36} envMapIntensity={.85} />;
  const darkSilver = <meshStandardMaterial color="#8c949f" metalness={.6} roughness={.37} roughnessMap={grain} />;
  const travel = { pressed, reduced, onPress, onRelease };
  const button = (label: "A" | "B", control: Control, x: number, z: number) => <group key={control} position={[x, 0, z]}>
    <ButtonTravel control={control} {...travel}>
      <Disc position={[0, .168, 0]} radius={.169} depth={.048} color="#777b79" />
      <mesh position={[0, .211, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[.3, 32]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>
      <Label text={label} position={[.003, .194, .003]} width={.091} height={.121} rotation={[-Math.PI / 2, 0, 0]} color="#989c98" />
      <Label text={label} position={[0, .195, 0]} width={.091} height={.121} rotation={[-Math.PI / 2, 0, 0]} color="#636864" />
    </ButtonTravel>
  </group>;

  return <group onClick={waiting ? event => { if (event.delta > 4) return; event.stopPropagation(); onStart(); } : undefined} onPointerOver={waiting ? hover : undefined} onPointerOut={waiting ? unhover : undefined}>
    {/* The two shells meet in an inset seam, without a projecting mid-plate. */}
    <RoundedBox args={[3.4, .30, 3.4]} radius={.12} smoothness={6} position={[0, -.135, 0]} castShadow receiveShadow>{darkSilver}</RoundedBox>
    <RoundedBox args={[3.35, .022, 3.35]} radius={.01} smoothness={4} position={[0, .003, 0]}><meshStandardMaterial color="#4f555a" roughness={.65} /></RoundedBox>
    <mesh position={[0,-.015,0]} rotation={[-Math.PI/2,0,0]} castShadow receiveShadow>
      <extrudeGeometry args={[deck,{depth:.18,bevelEnabled:true,bevelSize:.006,bevelThickness:.015,bevelSegments:3,steps:1,curveSegments:32}]} />{silver}
    </mesh>
    {/* Shoulder buttons and segmented hinge, with a separate rotating lid. */}
    {[-1, 1].map(side => <group key={side}>
      <RoundedBox args={[.65, .22, .38]} radius={.085} smoothness={4} position={[side * 1.27, -.01, -1.56]} castShadow onClick={event => { if (event.delta > 4) return; event.stopPropagation(); onControl(side < 0 ? "left" : "right"); }} onPointerOver={hover} onPointerOut={unhover}><meshStandardMaterial color="#4d5968" roughness={.42} metalness={.35} /></RoundedBox>
      <Label text={side < 0 ? "L" : "R"} position={[side * 1.27, .112, -1.54]} rotation={[-Math.PI / 2, 0, 0]} width={.1} height={.1} color="#aab3be" />
    </group>)}
    {([[-1.51,.30],[-.69,1.32],[.59,1.20],[1.32,.22],[1.55,.23]] as const).map(([x,length],i) => <mesh key={x} position={[x,.27,-1.42]} rotation={[0,0,Math.PI/2]} castShadow onClick={event => { if(event.delta>4) return; event.stopPropagation(); onFold(); }} onPointerOver={hover} onPointerOut={unhover}>
      <cylinderGeometry args={[.205,.205,length,64]} />{silver}
    </mesh>)}
    {[-1.54,1.54].map(x => <group key={x}>
      <RoundedBox args={[.29,.28,.36]} radius={.075} position={[x,.17,-1.43]} castShadow>{silver}</RoundedBox>
      <mesh position={[x<0?-1.67:1.68,.27,-1.42]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.157,.157,.013,48]} /><meshStandardMaterial color="#9b9f9f" metalness={.4} roughness={.42} /></mesh>
    </group>)}

    {/* Low-profile cross inside the molded circular well. */}
    <Recess {...DPAD} />
    <group ref={cross} position={[DPAD.x, .146, DPAD.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow><extrudeGeometry args={[dpad, { depth: .045, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: .021, bevelThickness: .012 }]} /><meshStandardMaterial color="#7d807e" roughness={.43} metalness={.22} /></mesh>
      {/* One continuous target resolves direction by quadrant, without diagonal overlap. */}
      <mesh position={[0, .115, 0]} rotation={[-Math.PI / 2, 0, 0]} onPointerDown={event => {
        event.stopPropagation();
        const point = event.object.worldToLocal(event.point.clone());
        const control: Control = Math.abs(point.x) > Math.abs(point.y) ? point.x > 0 ? "right" : "left" : point.y > 0 ? "up" : "down";
        (event.target as Element).setPointerCapture?.(event.pointerId);
        onPress(control, `pointer-${event.pointerId}`);
      }} onPointerUp={event => { event.stopPropagation(); (event.target as Element).releasePointerCapture?.(event.pointerId); onRelease(`pointer-${event.pointerId}`); }} onClick={event => event.stopPropagation()} onPointerOver={hover} onPointerOut={unhover}>
        <circleGeometry args={[.66, 32]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

    </group>
    <Recess {...ACTION} />
    {button("B", "b", ACTION.x-Math.cos(ACTION.angle)*ACTION.span/2, ACTION.z+Math.sin(ACTION.angle)*ACTION.span/2)}
    {button("A", "a", ACTION.x+Math.cos(ACTION.angle)*ACTION.span/2, ACTION.z-Math.sin(ACTION.angle)*ACTION.span/2)}

    {/* Sixteen drilled speaker holes, with four slightly larger central holes. */}
    {SPEAKER.map((p,i) => <mesh key={i} position={[p.x,.14,p.z]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[p.radius*1.3,16]} /><meshBasicMaterial color="#101617" /></mesh>)}
    {SMALL.xs.map((x,i) => <group key={x}>
      <Recess x={x} z={SMALL.z} radius={SMALL.radius} />
      <ButtonTravel control={i===0?"select":"start"} {...travel}>
        <Disc position={[x,.151,SMALL.z]} radius={.115} depth={.037} color="#797d78" />
        <mesh position={[x,.202,SMALL.z]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[.25,32]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>
      </ButtonTravel>
      <Label text={i===0?"SELECT":"START"} position={[x,.183,.94]} width={.30} height={.09} rotation={[-Math.PI/2,0,0]} color="#656d6e" />
    </group>)}
    <Recess x={0} z={-1.0} radius={.135} />
    <ButtonTravel control="light" {...travel}>
      <Disc position={[0,.147,-1.0]} radius={.085} depth={.033} color="#747a76" />
      <Label text="☀" position={[0,.165,-1.0]} width={.11} height={.11} rotation={[-Math.PI/2,0,0]} color="#a3aaa1" />
    </ButtonTravel>

    {/* Power slider, charge LED, volume wheel, and cartridge opening. */}
    <RoundedBox args={[.028, .115, .38]} radius={.012} position={[1.718, -.01, -.79]}><meshStandardMaterial color="#27313a" roughness={.48} /></RoundedBox>
    <group onClick={event => { if (event.delta > 4) return; event.stopPropagation(); onPower(); }} onPointerOver={hover} onPointerOut={unhover}>
    <RoundedBox args={[.05, .10, .16]} radius={.012} position={[1.741, -.01, power ? -.86 : -.69]}><meshStandardMaterial color="#3e4855" roughness={.5} /></RoundedBox>
      <mesh position={[1.75, -.01, -.78]}><boxGeometry args={[.1, .25, .5]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>
    </group>
    <mesh position={[1.722, .104, -.46]}><boxGeometry args={[.024, .059, .102]} /><meshStandardMaterial color={power ? "#95fc76" : "#223c29"} emissive={power ? "#79ff52" : "#000000"} emissiveIntensity={2} /></mesh>
    <mesh position={[1.722, .104, -.27]}><boxGeometry args={[.024, .048, .073]} /><meshStandardMaterial color="#58411f" roughness={.3} /></mesh>
    <RoundedBox args={[.027, .105, .53]} radius={.012} position={[-1.715, -.026, -.6]}><meshStandardMaterial color="#26313d" /></RoundedBox>
    {Array.from({ length: 10 }, (_, index) => <mesh key={index} position={[-1.736, -.026, -.81 + index * .047]}><boxGeometry args={[.034, .091, .017]} /><meshStandardMaterial color="#768491" metalness={.6} roughness={.4} /></mesh>)}
    <RoundedBox args={[2.87, .17, .026]} radius={.012} position={[0, -.168, 1.697]}><meshStandardMaterial color="#15212d" /></RoundedBox>
    <RoundedBox args={[2.64, .033, .015]} radius={.008} position={[0, -.23, 1.711]}><meshStandardMaterial color="#475261" roughness={.54} /></RoundedBox>

    <group ref={lid} position={[0, .27, -1.42]} rotation={[lidAngle.current, 0, 0]}>
      {/* The lid face sits behind the hinge axis so it clears the controls when folded. */}
      <group position={[0,0,-.15]}>
      <RoundedBox args={[3.4, 3.15, .23]} radius={.108} smoothness={8} position={[0, 1.58, -.028]} castShadow receiveShadow onClick={event => { if (event.delta > 4) return; event.stopPropagation(); onFold(); }} onPointerOver={hover} onPointerOut={unhover}>{silver}</RoundedBox>
      <RoundedBox args={[3.34, 3.09, .027]} radius={.012} smoothness={4} position={[0, 1.58, .088]}>{darkSilver}</RoundedBox>
      <RoundedBox args={[3.31, 3.06, .075]} radius={.035} smoothness={6} position={[0, 1.58, .122]} castShadow receiveShadow>{silver}</RoundedBox>
      <RoundedBox args={[2.94, 2.32, .034]} radius={.016} smoothness={4} position={[0, 1.69, .168]}><meshStandardMaterial color="#111614" metalness={.12} roughness={.25} /></RoundedBox>
      <RoundedBox args={[2.75, 1.872, .023]} radius={.01} smoothness={4} position={[0, 1.83, .191]}><meshStandardMaterial color="#111a22" roughness={.25} metalness={.3} /></RoundedBox>
      {display}
      <Label text="GAME BOY ADVANCE SP" position={[0, .665, .194]} width={1.58} height={.119} color="#a0a49d" />
      {/* Keep each pad inside the silver border: lens ends at y=2.85, hinge radius is .205. */}
      {([[-1.46,.355],[1.46,.355],[-1.46,2.985],[0,2.985],[1.46,2.985]] as const).map(([x,y]) => <group key={`${x}-${y}`} position={[x,y,.161]} rotation={[Math.PI/2,0,0]}>
        <Disc position={[0,0,0]} radius={.085} depth={.012} color="#888e87" metalness={.08} />
      </group>)}
      <mesh position={[0,1.67,-.15]} scale={[1,.43,1]}><torusGeometry args={[.55,.009,8,64]} /><meshStandardMaterial color="#828787" metalness={.35} roughness={.5} /></mesh>
      <Label text="Nintendo" position={[0, 1.67, -.15]} rotation={[0, Math.PI, 0]} width={.86} height={.18} color="#727d8a" />
      </group>
    </group>
  </group>;
}
