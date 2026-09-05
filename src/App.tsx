import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, Text } from '@react-three/drei';
import * as THREE from 'three';
import './App.css';

type Zone = { id: string; label: string; subtitle: string; x: number; z: number; color: string };
type Project = { id: string; name: string; description: string; stack: string[]; url: string; accent: string };
type TouchState = { jx: number; jy: number; lookX: number; lookY: number };

const zones: Zone[] = [
  { id: 'spawn', label: 'SPAWN HUB', subtitle: 'Start here', x: 0, z: 0, color: '#9ae66e' },
  { id: 'projects', label: 'PROJECTS DISTRICT', subtitle: 'Six builds', x: -15, z: -10, color: '#72a7ff' },
  { id: 'skills', label: 'SKILLS TOWER', subtitle: 'Tech stack', x: 15, z: -9, color: '#d8b4fe' },
  { id: 'gallery', label: 'DARKROOM', subtitle: 'Photography', x: -13, z: 13, color: '#f0c36e' },
  { id: 'contact', label: 'CONTACT PORTAL', subtitle: 'Say hello', x: 14, z: 12, color: '#ef6b9a' },
];

const projects: Project[] = [
  { id: 'flow', name: 'Flow Portfolio', description: 'An interactive network-based portfolio where your work becomes a living constellation.', stack: ['Next.js', 'React', 'TypeScript'], url: 'https://github.com/Nayan1209/Flow-Portfolio', accent: '#70a8ff' },
  { id: 'jarvis', name: 'Jarvis AI Assistant', description: 'A multi-platform personal AI assistant with a FastAPI backend and responsive React/Vite interface.', stack: ['FastAPI', 'Python', 'React', 'Vite'], url: 'https://github.com/Nayan1209/jarvis-ai-assistant', accent: '#9ae66e' },
  { id: 'pylauncher', name: 'PyLauncher', description: 'A minimalist Android launcher experiment built around Python and Kivy.', stack: ['Python', 'Kivy', 'Android'], url: 'https://github.com/Nayan1209/pylauncher', accent: '#eabf67' },
  { id: 'ghoul', name: 'Ghoul Photography', description: 'A moody photography portfolio focused on visual storytelling, galleries and atmosphere.', stack: ['React', 'WebGL', 'Photography'], url: 'https://github.com/Nayan1209/Ghoul-Photography', accent: '#d9a6ff' },
  { id: 'jobpilot', name: 'JobPilot AI', description: 'An AI-assisted job workflow product designed to make searching and applying less repetitive.', stack: ['React', 'AI', 'Automation'], url: 'https://github.com/Nayan1209/jobpilot-ai', accent: '#6ee7d2' },
  { id: 'iron', name: 'Iron Akhada', description: 'A bold fitness web experience built around training, strength and community.', stack: ['React', 'Web', 'UI'], url: 'https://github.com/Nayan1209/iron-akhada', accent: '#ff8f8f' },
];

const colors = { grass: '#84d65e', wood: '#765035' };

function VoxelTerrain() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const blocks = useMemo(() => {
    const list: { x: number; y: number; z: number }[] = [];
    for (let x = -21; x <= 21; x += 1) {
      for (let z = -21; z <= 21; z += 1) {
        const edge = Math.max(Math.abs(x), Math.abs(z));
        if (edge > 20 && Math.abs(x + z) > 24) continue;
        const h = 1 + (Math.sin(x * 0.42) + Math.cos(z * 0.34) + Math.sin((x + z) * 0.17) > 1.25 ? 1 : 0);
        for (let y = 0; y <= h; y += 1) list.push({ x, y, z });
      }
    }
    return list;
  }, []);
  useEffect(() => {
    if (!ref.current) return;
    const dummy = new THREE.Object3D();
    blocks.forEach((b, i) => {
      dummy.position.set(b.x, b.y - 0.5, b.z);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [blocks]);
  return <instancedMesh ref={ref} args={[undefined, undefined, blocks.length]} frustumCulled={false}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color={colors.grass} roughness={1} /></instancedMesh>;
}

function Cube({ position, scale = [1, 1, 1], color }: { position: [number, number, number]; scale?: [number, number, number]; color: string }) {
  return <mesh position={position} scale={scale} castShadow receiveShadow><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color={color} roughness={0.88} /></mesh>;
}

function Sign({ position, title, sub }: { position: [number, number, number]; title: string; sub?: string }) {
  return <group position={position}><Cube position={[-1.8, -1.2, 0]} scale={[0.25, 2.4, 0.25]} color={colors.wood} /><Cube position={[1.8, -1.2, 0]} scale={[0.25, 2.4, 0.25]} color={colors.wood} /><Cube position={[0, 0, 0]} scale={[4.2, 1.9, 0.3]} color="#202b2c" /><Text position={[0, 0.25, -0.17]} fontSize={0.52} color="#f3f7ef" anchorX="center" anchorY="middle">{title}</Text>{sub && <Text position={[0, -0.35, -0.17]} fontSize={0.22} color="#a8b7ad" anchorX="center" anchorY="middle">{sub}</Text>}</group>;
}

function BlockParticles({ color }: { color: string }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => { if (group.current) group.current.rotation.y = clock.elapsedTime * 0.8; });
  return <group ref={group}>{Array.from({ length: 8 }).map((_, i) => <mesh key={i} position={[Math.cos(i) * 2.5, 1.4 + (i % 3) * 0.35, Math.sin(i) * 2.5]}><boxGeometry args={[0.12, 0.12, 0.12]} /><meshBasicMaterial color={color} /></mesh>)}</group>;
}

function Building({ zone, onHover, onInteract }: { zone: Zone; onHover: (id: string | null) => void; onInteract: (id: string) => void }) {
  const [hovered, setHovered] = useState(false);
  const tower = zone.id === 'skills';
  const gallery = zone.id === 'gallery';
  const contact = zone.id === 'contact';
  return <group position={[zone.x, 0, zone.z]} onPointerOver={() => { setHovered(true); onHover(zone.id); }} onPointerOut={() => { setHovered(false); onHover(null); }} onClick={(e) => { e.stopPropagation(); onInteract(zone.id); }}>
    {tower ? <><>{[0, 1, 2, 3, 4].map(i => <Cube key={i} position={[0, i + 0.5, 0]} scale={[3.2 - i * 0.22, 1, 3.2 - i * 0.22]} color={i % 2 ? '#8c68bd' : '#b795e8'} />)}</><Text position={[0, 5.6, 0]} fontSize={0.65} color="#f3eaff" anchorX="center">SKILLS</Text></> : gallery ? <><Cube position={[0, 1.4, 0]} scale={[5, 2.8, 4]} color="#262426" /><Cube position={[0, 3, 0]} scale={[5.4, 0.35, 4.4]} color="#171617" />{[-1.6, 0, 1.6].map((x, i) => <Cube key={i} position={[x, 1.4, -2.03]} scale={[1.15, 1.4, 0.12]} color={['#5c4740', '#2f4145', '#6b4d3d'][i]} />)}<Text position={[0, 3.55, -0.1]} fontSize={0.55} color="#e8d7b4" anchorX="center">GHOUL DARKROOM</Text></> : contact ? <><Cube position={[-2, 1.6, 0]} scale={[0.7, 3.5, 0.7]} color="#552b54" /><Cube position={[2, 1.6, 0]} scale={[0.7, 3.5, 0.7]} color="#552b54" /><Cube position={[0, 3.05, 0]} scale={[4.7, 0.7, 0.7]} color="#552b54" /><mesh position={[0, 1.6, 0]}><boxGeometry args={[3.4, 3, 0.35]} /><meshStandardMaterial color="#b94383" emissive="#7b1f5c" emissiveIntensity={0.7} transparent opacity={0.72} /></mesh><Text position={[0, 4.05, 0]} fontSize={0.55} color="#ffd2eb" anchorX="center">CONTACT</Text></> : <><Cube position={[0, 0.8, 0]} scale={[4, 1.6, 3.4]} color="#805538" /><Cube position={[0, 2, 0]} scale={[4.4, 0.55, 3.8]} color="#9d3e3e" /><Cube position={[0, 0.7, -1.76]} scale={[1.1, 1.4, 0.25]} color="#282322" /><Cube position={[-1.25, 1.15, -1.82]} scale={[0.55, 0.55, 0.2]} color="#6ab4d1" /><Cube position={[1.25, 1.15, -1.82]} scale={[0.55, 0.55, 0.2]} color="#6ab4d1" /><Text position={[0, 3, -0.1]} fontSize={0.42} color={zone.color} anchorX="center">{zone.label}</Text></>}
    {hovered && <BlockParticles color={zone.color} />}
  </group>;
}

function Spawn() { return <group><Sign position={[0, 2.2, -3.2]} title="NAYAN ASATI" sub="DEVELOPER  /  PHOTOGRAPHER" /><Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.3}><Text position={[0, 4.2, -3.1]} fontSize={0.24} color="#dce7df" anchorX="center">Explore. Build. Capture.</Text></Float></group>; }

function nearest(pos: THREE.Vector3) { return zones.reduce<{ z: Zone; d: number } | null>((best, z) => { const d = Math.hypot(pos.x - z.x, pos.z - z.z); return !best || d < best.d ? { z, d } : best; }, null); }

function World({ onInteract, onHover, onNear, touchRef }: { onInteract: (id: string) => void; onHover: (id: string | null) => void; onNear: (z: Zone | null) => void; touchRef: MutableRefObject<TouchState> }) {
  const { camera, gl } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const yaw = useRef(0), pitch = useRef(-0.06), vy = useRef(0), grounded = useRef(true);
  useEffect(() => {
    const down = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = true; if (e.code === 'Space') { e.preventDefault(); if (grounded.current) { vy.current = 6; grounded.current = false; } } };
    const up = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    const move = (e: MouseEvent) => { if (document.pointerLockElement === gl.domElement) { yaw.current -= e.movementX * 0.0022; pitch.current = THREE.MathUtils.clamp(pitch.current - e.movementY * 0.0018, -1.2, 1.2); } };
    const lock = () => gl.domElement.requestPointerLock?.();
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); document.addEventListener('mousemove', move); gl.domElement.addEventListener('click', lock);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); document.removeEventListener('mousemove', move); gl.domElement.removeEventListener('click', lock); };
  }, [gl]);
  useFrame((_, delta) => {
    const t = touchRef.current;
    const forward = Number(keys.current.w || keys.current.arrowup) - Number(keys.current.s || keys.current.arrowdown) - t.jy;
    const strafe = Number(keys.current.d || keys.current.arrowright) - Number(keys.current.a || keys.current.arrowleft) + t.jx;
    const len = Math.hypot(forward, strafe) || 1;
    const f = Math.min(1, Math.abs(forward) + Math.abs(strafe));
    const dir = new THREE.Vector3(strafe / len, 0, forward / len).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current);
    camera.position.x = THREE.MathUtils.clamp(camera.position.x + dir.x * 5.2 * delta * f, -19, 19);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z + dir.z * 5.2 * delta * f, -19, 19);
    vy.current -= 16 * delta; camera.position.y += vy.current * delta;
    if (camera.position.y <= 1.15) { camera.position.y = 1.15; vy.current = 0; grounded.current = true; }
    yaw.current -= t.lookX * 0.006; pitch.current = THREE.MathUtils.clamp(pitch.current - t.lookY * 0.004, -1.2, 1.2); t.lookX = 0; t.lookY = 0;
    camera.rotation.set(pitch.current, yaw.current, 0, 'YXZ');
    const n = nearest(camera.position); onNear(n && n.d < 4 ? n.z : null);
  });
  return <><ambientLight intensity={0.65} /><directionalLight position={[8, 16, 5]} intensity={2.2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} /><VoxelTerrain /><Spawn />{zones.filter(z => z.id !== 'spawn').map(z => <Building key={z.id} zone={z} onHover={onHover} onInteract={onInteract} />)}<Environment preset="forest" background={false} environmentIntensity={0.35} /></>;
}

export default function App() {
  const [loading, setLoading] = useState(true), [panel, setPanel] = useState<string | null>(null), [hover, setHover] = useState<string | null>(null), [near, setNear] = useState<Zone | null>(null), [day, setDay] = useState(0.55);
  const touchRef = useRef<TouchState>({ jx: 0, jy: 0, lookX: 0, lookY: 0 });
  useEffect(() => { const t = window.setTimeout(() => setLoading(false), 1300); return () => window.clearTimeout(t); }, []);
  useEffect(() => { const i = window.setInterval(() => setDay(v => (v + 0.012) % 1), 1000); return () => window.clearInterval(i); }, []);
  useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key.toLowerCase() === 'e' && near) setPanel(near.id); if (e.key === 'Escape') setPanel(null); }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [near]);
  const sun = Math.sin(day * Math.PI * 2) * 0.5 + 0.5;
  return <main className="game-shell">
    {loading && <div className="loading"><div className="loading-logo">NAYAN<span>.WORLD</span></div><div className="loading-bar"><i /></div><div className="loading-copy">Building terrain...<br />Placing blocks...<br />Waking the world...</div></div>}
    <Canvas shadows camera={{ position: [0, 1.15, 4], fov: 70 }} dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: 'high-performance' }} onCreated={({ camera }) => { camera.rotation.order = 'YXZ'; }}>
      <color attach="background" args={[sun > 0.35 ? '#86b9cf' : '#172234']} /><fog attach="fog" args={[sun > 0.35 ? '#86b9cf' : '#172234', 18, 45]} /><World onInteract={setPanel} onHover={setHover} onNear={setNear} touchRef={touchRef} />
    </Canvas>
    <div className="hud topbar"><div><b>NAYAN ASATI</b><span>VOXEL PORTFOLIO</span></div><div className="status"><i /> ONLINE <em>{Math.round(sun * 100)}% DAYLIGHT</em></div></div>
    <div className="hud controls"><span>WASD / ARROWS</span><span>SPACE · JUMP</span><span>MOUSE · LOOK</span><kbd>E</kbd><span>INTERACT</span></div>
    <div className="crosshair">+</div><div className="compass"><b>N</b><span>·</span><b>E</b><span>·</span><b>S</b><span>·</span><b>W</b></div>
    <div className="minimap"><div className="map-title">WORLD MAP</div>{zones.map(z => <button key={z.id} className="map-dot" style={{ left: `${50 + z.x * 2.05}%`, top: `${50 + z.z * 2.05}%`, background: z.color }} onClick={() => setPanel(z.id)} title={z.label} />)}<div className="map-player" /></div>
    {near && <div className="prompt"><kbd>E</kbd><span>INTERACT</span><strong>{near.label}</strong></div>}
    <div className="hover-label">{hover ? zones.find(z => z.id === hover)?.label : 'EXPLORE THE ISLAND'}</div><TouchControls touchRef={touchRef} />{panel && <Overlay id={panel} close={() => setPanel(null)} />}
  </main>;
}

function TouchControls({ touchRef }: { touchRef: MutableRefObject<TouchState> }) {
  const start = useRef({ x: 0, y: 0 });
  return <div className="touch-ui"><div className="joystick" onTouchStart={e => { const t = e.touches[0]; start.current = { x: t.clientX, y: t.clientY }; }} onTouchMove={e => { const t = e.touches[0]; const dx = t.clientX - start.current.x, dy = t.clientY - start.current.y, m = Math.min(45, Math.hypot(dx, dy)), a = Math.atan2(dy, dx); touchRef.current.jx = Math.cos(a) * m / 45; touchRef.current.jy = Math.sin(a) * m / 45; }} onTouchEnd={() => { touchRef.current.jx = 0; touchRef.current.jy = 0; }}><i /></div><div className="look-pad" onTouchMove={e => { const t = e.touches[0], el = e.currentTarget as HTMLElement, last = el.dataset.last?.split(',').map(Number); if (last) { touchRef.current.lookX += t.clientX - last[0]; touchRef.current.lookY += t.clientY - last[1]; } el.dataset.last = `${t.clientX},${t.clientY}`; }} onTouchStart={e => { const t = e.touches[0]; (e.currentTarget as HTMLElement).dataset.last = `${t.clientX},${t.clientY}`; }} onTouchEnd={e => { delete (e.currentTarget as HTMLElement).dataset.last; }}><span>LOOK</span></div></div>;
}

function Overlay({ id, close }: { id: string; close: () => void }) {
  if (id === 'projects') return <div className="overlay"><div className="panel project-panel"><button className="close" onClick={close}>×</button><p className="eyebrow">PROJECTS DISTRICT / 06 BUILDS</p><h1>Things I've shipped.</h1><div className="project-grid">{projects.map(p => <article key={p.id}><div className="project-mark" style={{ background: p.accent }} /><h2>{p.name}</h2><p>{p.description}</p><div className="tags">{p.stack.map(s => <span key={s}>{s}</span>)}</div><a href={p.url} target="_blank" rel="noreferrer">VIEW SOURCE ↗</a></article>)}</div></div></div>;
  if (id === 'skills') return <div className="overlay"><div className="panel"><button className="close" onClick={close}>×</button><p className="eyebrow">SKILLS TOWER</p><h1>Tools of the trade.</h1><p className="lead">I like simple primitives, strong systems and interfaces that feel alive.</p><div className="skill-cloud">{['HTML / CSS / JS', 'Python', 'FastAPI', 'Kivy', 'React', 'Next.js', 'TypeScript', 'Three.js', 'Git / GitHub', 'Vite'].map(s => <span key={s}>{s}</span>)}</div></div></div>;
  if (id === 'gallery') return <div className="overlay"><div className="panel gallery-panel"><button className="close" onClick={close}>×</button><p className="eyebrow">GHOUL PHOTOGRAPHY / DARKROOM</p><h1>Light, shadow, memory.</h1><div className="shots"><div /><div /><div /><div /></div><p className="lead">Photography is the other side of my brain — slower, quieter, more deliberate.</p><a className="primary" href="https://www.instagram.com/nayan._.asati/" target="_blank" rel="noreferrer">OPEN INSTAGRAM ↗</a></div></div>;
  if (id === 'contact') return <div className="overlay"><div className="panel"><button className="close" onClick={close}>×</button><p className="eyebrow">CONTACT PORTAL</p><h1>Let's build something.</h1><p className="lead">Open a channel and tell me what you're making.</p><div className="contact-links"><a href="https://github.com/Nayan1209" target="_blank" rel="noreferrer"><span>GITHUB</span><b>@Nayan1209 ↗</b></a><a href="https://www.instagram.com/nayan._.asati/" target="_blank" rel="noreferrer"><span>INSTAGRAM</span><b>@nayan._.asati ↗</b></a><a href="mailto:YOUR_EMAIL_HERE"><span>EMAIL</span><b>Configure your email ↗</b></a></div></div></div>;
  return <div className="overlay"><div className="panel welcome"><button className="close" onClick={close}>×</button><p className="eyebrow">SPAWN HUB / WELCOME</p><h1>Nayan Asati.</h1><p className="lead">Developer + photographer building digital experiences with code, curiosity and a little chaos.</p><p>Walk the island. Find the builds. Press <kbd>E</kbd> when a world node starts talking to you.</p><button className="primary" onClick={close}>ENTER WORLD</button></div></div>;
}
