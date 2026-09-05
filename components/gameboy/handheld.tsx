"use client";

import { useEffect, useMemo, useRef, type MutableRefObject, type ReactNode } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { CanvasTexture, DataTexture, Group, MathUtils, RepeatWrapping, RGBAFormat, Shape, SRGBColorSpace } from "three";
import type { Control } from "./console";
import { lidAt, OPEN_LID_ANGLE } from "./boot";

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
    const target = pressed.has(control) ? -.049 : 0;
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

function Screw({ position, face = "top" }: { position: Position; face?: "top" | "front" }) {
  return <group position={position} rotation={face === "front" ? [Math.PI / 2, 0, 0] : [0, 0, 0]}>
    <Disc position={[0, 0, 0]} radius={.054} depth={.009} color="#40454c" metalness={.65} />
    <mesh position={[0, .006, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}><planeGeometry args={[.064, .01]} /><meshBasicMaterial color="#151c22" /></mesh>
    <mesh position={[0, .007, 0]} rotation={[-Math.PI / 2, 0, -Math.PI / 4]}><planeGeometry args={[.064, .01]} /><meshBasicMaterial color="#151c22" /></mesh>
  </group>;
}

export function Handheld({ bootOpening, waiting, onStart, display, time, booting, open, power, reduced, pressed, onControl, onPress, onRelease, onFold, onPower }: Props) {
  const lid = useRef<Group>(null);
  const cross = useRef<Group>(null);
  const { invalidate } = useThree();
  const lidAngle = useRef(reduced ? OPEN_LID_ANGLE : Math.PI / 2);
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
    points.forEach(([x, y], index) => index === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)); shape.closePath();
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
      const y = x || z ? .202 : .224;
      cross.current.position.y = reduced ? y : MathUtils.damp(cross.current.position.y, y, 35, Math.min(delta, .05));
      if (Math.abs(cross.current.rotation.x - x) + Math.abs(cross.current.rotation.z - z) + Math.abs(cross.current.position.y - y) > .0001) invalidate();
    }
  });
  const silver = <meshPhysicalMaterial color="#b7bec8" metalness={.72} roughness={.3} roughnessMap={grain} bumpMap={grain} bumpScale={.00025} clearcoat={.25} clearcoatRoughness={.36} envMapIntensity={.85} />;
  const darkSilver = <meshStandardMaterial color="#8c949f" metalness={.6} roughness={.37} roughnessMap={grain} />;
  const travel = { pressed, reduced, onPress, onRelease };
  const button = (label: "A" | "B", control: Control, x: number, z: number) => <group key={control} position={[x, 0, z]}>
    <Disc position={[0, .186, 0]} radius={.256} depth={.023} color="#5a636f" metalness={.6} />
    <ButtonTravel control={control} {...travel}>
      <Disc position={[0, .219, 0]} radius={.22} depth={.089} color="#303944" />
      <mesh position={[0, .275, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[.3, 32]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>
      <Label text={label} position={[0, .268, 0]} width={.135} height={.145} rotation={[-Math.PI / 2, 0, 0]} color="#8d96a3" />
    </ButtonTravel>
  </group>;

  return <group onClick={waiting ? event => { if (event.delta > 4) return; event.stopPropagation(); onStart(); } : undefined} onPointerOver={waiting ? hover : undefined} onPointerOut={waiting ? unhover : undefined}>
    {/* Two molded shells meet at the dark, continuous parting line. */}
    <RoundedBox args={[3.4, .30, 3.38]} radius={.145} smoothness={6} position={[0, -.135, 0]} castShadow receiveShadow>{darkSilver}</RoundedBox>
    <RoundedBox args={[3.408, .026, 3.382]} radius={.012} smoothness={4} position={[0, -.02, 0]}><meshStandardMaterial color="#48525e" roughness={.65} /></RoundedBox>
    <RoundedBox args={[3.42, .24, 3.4]} radius={.11} smoothness={6} position={[0, .065, 0]} castShadow receiveShadow>{silver}</RoundedBox>
    {/* Shoulder buttons and segmented hinge, with a separate rotating lid. */}
    {[-1, 1].map(side => <group key={side}>
      <RoundedBox args={[.65, .22, .38]} radius={.085} smoothness={4} position={[side * 1.27, -.01, -1.56]} castShadow onClick={event => { if (event.delta > 4) return; event.stopPropagation(); onControl(side < 0 ? "left" : "right"); }} onPointerOver={hover} onPointerOut={unhover}><meshStandardMaterial color="#4d5968" roughness={.42} metalness={.35} /></RoundedBox>
      <Label text={side < 0 ? "L" : "R"} position={[side * 1.27, .112, -1.54]} rotation={[-Math.PI / 2, 0, 0]} width={.1} height={.1} color="#aab3be" />
    </group>)}
    {[-1.36, -.83, 0, .83, 1.36].map((x, i) => <mesh key={x} position={[x, .25, -1.42]} rotation={[0, 0, Math.PI / 2]} castShadow onClick={event => { if (event.delta > 4) return; event.stopPropagation(); onFold(); }} onPointerOver={hover} onPointerOut={unhover}>
      <cylinderGeometry args={[.235, .235, i === 2 ? 1.04 : .5, 64]} />{i % 2 === 0 ? silver : darkSilver}
    </mesh>)}
    {[-1.645, 1.645].map(x => <mesh key={x} position={[x, .25, -1.42]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.17, .17, .018, 48]} /><meshStandardMaterial color="#6b7581" roughness={.35} metalness={.65} /></mesh>)}

    {/* D-pad is one beveled cross, with four distinct hit areas. */}
    <Disc position={[-.93, .181, -.22]} radius={.57} depth={.017} color="#66727e" metalness={.6} />
    <group ref={cross} position={[-.93, .224, -.22]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow><extrudeGeometry args={[dpad, { depth: .066, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: .019, bevelThickness: .018 }]} /><meshStandardMaterial color="#303943" roughness={.43} metalness={.22} /></mesh>
      <Disc position={[0, .087, 0]} radius={.113} depth={.004} color="#252e38" />
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
      {([['up', 0, -.32], ['down', 0, .32], ['left', -.32, 0], ['right', .32, 0]] as const).map(([control, x, z]) => <group key={control}>

        {[0, 1, 2].map(index => <mesh key={index} position={[x + (x ? (index - 1) * .045 : 0), .09, z + (z ? (index - 1) * .045 : 0)]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[x ? .013 : .15, z ? .013 : .15]} /><meshBasicMaterial color="#687583" /></mesh>)}
      </group>)}
    </group>
    {button("B", "b", .77, .10)}
    {button("A", "a", 1.25, -.39)}

    {/* Recessed speaker perforations, each with a lip and dark interior. */}
    {Array.from({ length: 5 }, (_, row) => Array.from({ length: 5 }, (_, column) => {
      if ((row === 0 || row === 4) && (column === 0 || column === 4)) return null;
      return <group key={`${row}-${column}`} position={[(column - 2) * .102 + .02, .191, (row - 2) * .108 + .48]}>
        <Disc position={[0, 0, 0]} radius={.032} depth={.005} color="#6b737e" metalness={.5} />
        <Disc position={[0, .003, 0]} radius={.022} depth={.004} color="#18232e" />
      </group>;
    }))}
    {([['SELECT', 'select', -.34], ['START', 'start', .34]] as const).map(([label, control, x]) => <group key={control}>
      <Disc position={[x, .187, 1.07]} radius={.153} depth={.017} color="#818c97" metalness={.65} />
      <ButtonTravel control={control} {...travel}>
        <Disc position={[x, .22, 1.07]} radius={.112} depth={.063} color="#333e4c" />
        <mesh position={[x, .26, 1.07]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[.25, 32]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>
      </ButtonTravel>
      <Label text={label} position={[x, .19, 1.35]} width={.36} height={.075} rotation={[-Math.PI / 2, 0, 0]} />
    </group>)}
    <Disc position={[0, .19, -.96]} radius={.147} depth={.016} color="#85909c" metalness={.7} />
    <ButtonTravel control="light" {...travel}>
      <Disc position={[0, .213, -.96]} radius={.108} depth={.035} color="#66717f" />
      <Label text="☀" position={[0, .236, -.96]} width={.12} height={.12} rotation={[-Math.PI / 2, 0, 0]} color="#bbc4cf" />
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
    <RoundedBox args={[1.94, .14, .032]} radius={.015} position={[0, -.15, 1.682]}><meshStandardMaterial color="#15212d" /></RoundedBox>
    <RoundedBox args={[1.76, .075, .048]} radius={.014} position={[0, -.157, 1.699]}><meshStandardMaterial color="#475261" roughness={.54} /></RoundedBox>
    {[-1.38, 1.38].map(x => <Screw key={x} position={[x, -.146, 1.67]} face="front" />)}

    <group ref={lid} position={[0, .27, -1.42]} rotation={[lidAngle.current, 0, 0]}>
      <RoundedBox args={[3.4, 3.15, .23]} radius={.108} smoothness={8} position={[0, 1.58, -.028]} castShadow receiveShadow onClick={event => { if (event.delta > 4) return; event.stopPropagation(); onFold(); }} onPointerOver={hover} onPointerOut={unhover}>{silver}</RoundedBox>
      <RoundedBox args={[3.34, 3.09, .027]} radius={.012} smoothness={4} position={[0, 1.58, .088]}>{darkSilver}</RoundedBox>
      <RoundedBox args={[3.31, 3.06, .075]} radius={.035} smoothness={6} position={[0, 1.58, .122]} castShadow receiveShadow>{silver}</RoundedBox>
      <RoundedBox args={[2.98, 2.38, .034]} radius={.016} smoothness={4} position={[0, 1.69, .168]}><meshStandardMaterial color="#313b4b" metalness={.25} roughness={.32} /></RoundedBox>
      <RoundedBox args={[2.75, 1.872, .023]} radius={.01} smoothness={4} position={[0, 1.83, .191]}><meshStandardMaterial color="#111a22" roughness={.25} metalness={.3} /></RoundedBox>
      {display}
      <Label text="GAME BOY ADVANCE SP" position={[0, .668, .193]} width={1.99} height={.115} color="#a5adb9" />
      {[-1.43, 1.43].map(x => [.29, 2.89].map(y => <group key={`${x}-${y}`} position={[x, y, .168]} rotation={[Math.PI / 2, 0, 0]}>
        <Disc position={[0, 0, 0]} radius={.081} depth={.021} color="#707984" metalness={.25} />
        <Disc position={[0, -.015, 0]} radius={.06} depth={.014} color="#67717e" />
      </group>))}
      <Label text="Nintendo" position={[0, 1.67, -.15]} rotation={[0, Math.PI, 0]} width={.96} height={.22} color="#727d8a" />
    </group>
  </group>;
}
