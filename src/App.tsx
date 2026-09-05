import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import './App.css';

type Zone = { id: string; label: string; subtitle: string; x: number; z: number; color: string };
type TouchState = { jx: number; jy: number; lookX: number; lookY: number };

const zones: Zone[] = [
  { id: 'spawn', label: 'SPAWN HUB', subtitle: 'Start here', x: 0, z: 0, color: '#9ae66e' },
  { id: 'projects', label: 'PROJECTS DISTRICT', subtitle: 'Six builds', x: -12, z: -9, color: '#72a7ff' },
  { id: 'skills', label: 'SKILLS TOWER', subtitle: 'Tech stack', x: 12, z: -8, color: '#d8b4fe' },
  { id: 'gallery', label: 'DARKROOM', subtitle: 'Photography', x: -12, z: 11, color: '#f0c36e' },
  { id: 'contact', label: 'CONTACT PORTAL', subtitle: 'Say hello', x: 12, z: 11, color: '#ef6b9a' },
];

const projects = [
  ['Flow Portfolio', 'Interactive network-based portfolio.', 'Next.js · React · TypeScript', 'https://github.com/Nayan1209/Flow-Portfolio'],
  ['Jarvis AI Assistant', 'Personal AI assistant with a FastAPI backend.', 'FastAPI · Python · React · Vite', 'https://github.com/Nayan1209/jarvis-ai-assistant'],
  ['PyLauncher', 'Minimal Android launcher experiment.', 'Python · Kivy · Android', 'https://github.com/Nayan1209/pylauncher'],
  ['Ghoul Photography', 'Moody photography and visual storytelling.', 'React · WebGL · Photography', 'https://github.com/Nayan1209/Ghoul-Photography'],
  ['JobPilot AI', 'AI-assisted job search workflow.', 'React · AI · Automation', 'https://github.com/Nayan1209/jobpilot-ai'],
  ['Iron Akhada', 'Fitness experience focused on training and strength.', 'React · Web · UI', 'https://github.com/Nayan1209/iron-akhada'],
] as const;

function Cube({ position, scale = [1, 1, 1], color, onClick }: { position: [number, number, number]; scale?: [number, number, number]; color: string; onClick?: () => void }) {
  return <mesh position={position} scale={scale} castShadow receiveShadow onClick={onClick}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color={color} roughness={0.86} /></mesh>;
}

function Terrain() {
  const blocks = useMemo(() => {
    const result: Array<[number, number, number, string]> = [];
    for (let x = -20; x <= 20; x += 1) {
      for (let z = -20; z <= 20; z += 1) {
        const edge = Math.max(Math.abs(x), Math.abs(z));
        if (edge > 19 && Math.abs(x + z) > 24) continue;
        const tall = Math.sin(x * 0.38) + Math.cos(z * 0.31) + Math.sin((x + z) * 0.18) > 1.25;
        result.push([x, -0.5, z, '#6fba50']);
        if (tall) result.push([x, 0.5, z, '#82cf5b']);
      }
    }
    return result;
  }, []);

  return <group>{blocks.map(([x, y, z, color], i) => <Cube key={i} position={[x, y, z]} color={color} />)}</group>;
}

function SpawnSign() {
  return <group position={[0, 2.2, -3]}>
    <Cube position={[-2, -1.15, 0]} scale={[0.28, 2.5, 0.28]} color="#704a31" />
    <Cube position={[2, -1.15, 0]} scale={[0.28, 2.5, 0.28]} color="#704a31" />
    <Cube position={[0, 0, 0]} scale={[4.8, 1.9, 0.35]} color="#18211e" />
    <Cube position={[0, 1.35, 0]} scale={[3.5, 0.18, 0.45]} color="#9ae66e" />
  </group>;
}

function ZoneBuilding({ zone, onInteract }: { zone: Zone; onInteract: (id: string) => void }) {
  const [hovered, setHovered] = useState(false);
  const glow = hovered ? '#f4fff0' : zone.color;
  const click = () => onInteract(zone.id);

  if (zone.id === 'skills') return <group position={[zone.x, 0, zone.z]} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>{[0,1,2,3,4,5].map((i) => <Cube key={i} position={[0, i + 0.5, 0]} scale={[3.2 - i * 0.18, 1, 3.2 - i * 0.18]} color={i % 2 ? '#7955a9' : '#b795e8'} onClick={click} />)}<Cube position={[0, 6.7, 0]} scale={[2.1, 0.35, 2.1]} color={glow} onClick={click} /></group>;

  if (zone.id === 'gallery') return <group position={[zone.x, 0, zone.z]} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
    <Cube position={[0, 1.3, 0]} scale={[5, 2.6, 4]} color="#29272a" onClick={click} />
    <Cube position={[0, 2.95, 0]} scale={[5.4, 0.35, 4.4]} color="#151617" onClick={click} />
    {[-1.6, 0, 1.6].map((x, i) => <Cube key={i} position={[x, 1.35, -2.05]} scale={[1.15, 1.35, 0.15]} color={['#80604f', '#3e565a', '#76553e'][i]} onClick={click} />)}
    <Cube position={[0, 3.65, -1.7]} scale={[3.2, 0.25, 0.25]} color={glow} onClick={click} />
  </group>;

  if (zone.id === 'contact') return <group position={[zone.x, 0, zone.z]} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
    <Cube position={[-2, 1.6, 0]} scale={[0.7, 3.5, 0.7]} color="#552b54" onClick={click} />
    <Cube position={[2, 1.6, 0]} scale={[0.7, 3.5, 0.7]} color="#552b54" onClick={click} />
    <Cube position={[0, 3.05, 0]} scale={[4.7, 0.7, 0.7]} color="#552b54" onClick={click} />
    <Cube position={[0, 1.6, 0]} scale={[3.4, 3, 0.3]} color="#b94383" onClick={click} />
    <Cube position={[0, 1.6, -0.2]} scale={[2.3, 2.2, 0.15]} color="#341d35" onClick={click} />
  </group>;

  return <group position={[zone.x, 0, zone.z]} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
    <Cube position={[0, 0.8, 0]} scale={[4, 1.6, 3.4]} color={hovered ? '#9c6d49' : '#805538'} onClick={click} />
    <Cube position={[0, 2, 0]} scale={[4.4, 0.55, 3.8]} color={hovered ? '#c75b5b' : '#9d3e3e'} onClick={click} />
    <Cube position={[0, 0.7, -1.76]} scale={[1.1, 1.4, 0.25]} color="#282322" onClick={click} />
    <Cube position={[-1.25, 1.15, -1.82]} scale={[0.55, 0.55, 0.2]} color="#6ab4d1" onClick={click} />
    <Cube position={[1.25, 1.15, -1.82]} scale={[0.55, 0.55, 0.2]} color="#6ab4d1" onClick={click} />
    <Cube position={[0, 3, -0.1]} scale={[3.2, 0.22, 0.22]} color={glow} onClick={click} />
  </group>;
}

function World({ onInteract, onNear, touchRef }: { onInteract: (id: string) => void; onNear: (zone: Zone | null) => void; touchRef: MutableRefObject<TouchState> }) {
  const { camera, gl } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const yaw = useRef(0);
  const pitch = useRef(0.08);
  const velocityY = useRef(0);
  const grounded = useRef(true);

  useEffect(() => {
    camera.position.set(0, 2.2, 8);
    camera.rotation.set(pitch.current, yaw.current, 0, 'YXZ');
    const down = (event: KeyboardEvent) => { keys.current[event.key.toLowerCase()] = true; if (event.code === 'Space') { event.preventDefault(); if (grounded.current) { velocityY.current = 6; grounded.current = false; } } };
    const up = (event: KeyboardEvent) => { keys.current[event.key.toLowerCase()] = false; };
    const move = (event: MouseEvent) => { if (document.pointerLockElement !== gl.domElement) return; yaw.current -= event.movementX * 0.0022; pitch.current = THREE.MathUtils.clamp(pitch.current - event.movementY * 0.0018, -1.15, 1.15); };
    const lock = () => { if (document.pointerLockElement !== gl.domElement) gl.domElement.requestPointerLock?.(); };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); document.addEventListener('mousemove', move); gl.domElement.addEventListener('click', lock);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); document.removeEventListener('mousemove', move); gl.domElement.removeEventListener('click', lock); };
  }, [camera, gl]);

  useFrame((_, delta) => {
    const touch = touchRef.current;
    const forward = Number(keys.current.w || keys.current.arrowup) - Number(keys.current.s || keys.current.arrowdown) - touch.jy;
    const strafe = Number(keys.current.d || keys.current.arrowright) - Number(keys.current.a || keys.current.arrowleft) + touch.jx;
    const length = Math.hypot(forward, strafe) || 1;
    const amount = Math.min(1, Math.abs(forward) + Math.abs(strafe));
    const direction = new THREE.Vector3(strafe / length, 0, forward / length).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current);
    camera.position.x = THREE.MathUtils.clamp(camera.position.x + direction.x * 5.2 * delta * amount, -18.5, 18.5);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z + direction.z * 5.2 * delta * amount, -18.5, 18.5);
    velocityY.current -= 16 * delta;
    camera.position.y += velocityY.current * delta;
    if (camera.position.y <= 1.65) { camera.position.y = 1.65; velocityY.current = 0; grounded.current = true; }
    yaw.current -= touch.lookX * 0.006;
    pitch.current = THREE.MathUtils.clamp(pitch.current - touch.lookY * 0.004, -1.15, 1.15);
    touch.lookX = 0; touch.lookY = 0;
    camera.rotation.set(pitch.current, yaw.current, 0, 'YXZ');
    let closest: { zone: Zone; distance: number } | null = null;
    for (const zone of zones) { const distance = Math.hypot(camera.position.x - zone.x, camera.position.z - zone.z); if (!closest || distance < closest.distance) closest = { zone, distance }; }
    onNear(closest && closest.distance < 4 ? closest.zone : null);
  });

  return <><ambientLight intensity={1.25} /><hemisphereLight intensity={0.45} color="#d8f0ff" groundColor="#31462b" /><directionalLight position={[8, 18, 7]} intensity={2.8} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} /><Terrain /><SpawnSign />{zones.filter((zone) => zone.id !== 'spawn').map((zone) => <ZoneBuilding key={zone.id} zone={zone} onInteract={onInteract} />)}</>;
}

function Overlay({ panel, close }: { panel: string | null; close: () => void }) {
  if (!panel) return null;
  if (panel === 'projects') return <div className="overlay"><div className="panel project-panel"><button className="close" onClick={close}>×</button><p className="eyebrow">PROJECTS DISTRICT</p><h1>Things I build.</h1><div className="project-grid">{projects.map(([name, description, stack, url]) => <article key={name}><div className="project-mark" /><h2>{name}</h2><p>{description}</p><div className="tags">{stack.split(' · ').map((tag) => <span key={tag}>{tag}</span>)}</div><a href={url} target="_blank" rel="noreferrer">VIEW ON GITHUB ↗</a></article>)}</div></div></div>;
  if (panel === 'skills') return <div className="overlay"><div className="panel"><button className="close" onClick={close}>×</button><p className="eyebrow">SKILLS TOWER</p><h1>My toolkit.</h1><p className="lead">HTML · CSS · JavaScript · Python · FastAPI · Kivy · React · Next.js · TypeScript</p><div className="skill-cloud">{['HTML','CSS','JavaScript','Python','FastAPI','Kivy','React','Next.js','TypeScript','Git','GitHub','Vercel'].map((skill) => <span key={skill}>{skill}</span>)}</div></div></div>;
  if (panel === 'gallery') return <div className="overlay"><div className="panel"><button className="close" onClick={close}>×</button><p className="eyebrow">GHOUL DARKROOM</p><h1>Frames in the dark.</h1><p className="lead">Photography, atmosphere and visual storytelling.</p><div className="shots"><div /><div /><div /><div /></div><a className="primary" href="https://github.com/Nayan1209/Ghoul-Photography" target="_blank" rel="noreferrer">OPEN GHOUL PHOTOGRAPHY ↗</a></div></div>;
  if (panel === 'contact') return <div className="overlay"><div className="panel"><button className="close" onClick={close}>×</button><p className="eyebrow">CONTACT PORTAL</p><h1>Let's build something.</h1><p className="lead">Open a channel and tell me what you're making.</p><div className="contact-links"><a href="https://github.com/Nayan1209" target="_blank" rel="noreferrer"><span>GITHUB</span><b>@Nayan1209 ↗</b></a><a href="https://www.instagram.com/nayan._.asati/" target="_blank" rel="noreferrer"><span>INSTAGRAM</span><b>@nayan._.asati ↗</b></a><a href="mailto:YOUR_EMAIL_HERE"><span>EMAIL</span><b>Configure your email ↗</b></a></div></div></div>;
  return <div className="overlay"><div className="panel welcome"><button className="close" onClick={close}>×</button><p className="eyebrow">SPAWN HUB / WELCOME</p><h1>Nayan Asati.</h1><p className="lead">Developer + photographer building digital experiences with code, curiosity and a little chaos.</p><p>Walk the island. Find the builds. Press <kbd>E</kbd> near a world node.</p><button className="primary" onClick={close}>ENTER WORLD</button></div></div>;
}

function TouchControls({ touchRef }: { touchRef: MutableRefObject<TouchState> }) {
  const joystickStart = useRef({ x: 0, y: 0 });
  return <div className="touch-ui"><div className="joystick" onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); joystickStart.current = { x: e.clientX, y: e.clientY }; }} onPointerMove={(e) => { if (!e.currentTarget.hasPointerCapture(e.pointerId)) return; const dx = e.clientX - joystickStart.current.x; const dy = e.clientY - joystickStart.current.y; const d = Math.min(38, Math.hypot(dx, dy)); const a = Math.atan2(dy, dx); touchRef.current.jx = Math.cos(a) * d / 38; touchRef.current.jy = Math.sin(a) * d / 38; }} onPointerUp={() => { touchRef.current.jx = 0; touchRef.current.jy = 0; }} onPointerCancel={() => { touchRef.current.jx = 0; touchRef.current.jy = 0; }}><i /></div><div className="look-pad" onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)} onPointerMove={(e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) { touchRef.current.lookX += e.movementX; touchRef.current.lookY += e.movementY; } }} /></div>;
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [panel, setPanel] = useState<string | null>('spawn');
  const [near, setNear] = useState<Zone | null>(null);
  const [day, setDay] = useState(0.18);
  const touchRef = useRef<TouchState>({ jx: 0, jy: 0, lookX: 0, lookY: 0 });

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 900);
    const clock = window.setInterval(() => setDay((value) => (value + 0.008) % 1), 1000);
    const key = (event: KeyboardEvent) => { if (event.key.toLowerCase() === 'e' && near) setPanel(near.id); if (event.key === 'Escape') setPanel(null); };
    window.addEventListener('keydown', key);
    return () => { window.clearTimeout(timer); window.clearInterval(clock); window.removeEventListener('keydown', key); };
  }, [near]);

  const daylight = Math.round((Math.sin(day * Math.PI * 2) * 0.5 + 0.5) * 100);
  const sky = daylight > 35 ? '#86b9cf' : '#172234';

  return <main className="game-shell">
    {loading && <div className="loading"><div className="loading-logo">NAYAN<span>.WORLD</span></div><div className="loading-bar"><i /></div><div className="loading-copy">Building terrain...<br />Placing blocks...<br />Waking the world...</div></div>}
    <Canvas camera={{ position: [0, 2.2, 8], fov: 70 }} dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: 'high-performance' }} onCreated={({ camera }) => { camera.rotation.order = 'YXZ'; }}>
      <color attach="background" args={[sky]} /><fog attach="fog" args={[sky, 22, 52]} /><World onInteract={setPanel} onNear={setNear} touchRef={touchRef} />
    </Canvas>
    <div className="hud topbar"><div><b>NAYAN ASATI</b><span>VOXEL PORTFOLIO</span></div><div className="status"><i /> ONLINE <em>{daylight}% DAYLIGHT</em></div></div>
    <div className="hud controls"><span>WASD / ARROWS</span><span>SPACE · JUMP</span><span>MOUSE · LOOK</span><kbd>E</kbd><span>INTERACT</span></div>
    <div className="crosshair">+</div><div className="compass"><b>N</b><span>·</span><b>E</b><span>·</span><b>S</b><span>·</span><b>W</b></div>
    <div className="minimap"><div className="map-title">WORLD MAP</div><div className="map-player" />{zones.filter((z) => z.id !== 'spawn').map((z) => <button key={z.id} className="map-dot" style={{ left: `${50 + z.x * 2.7}%`, top: `${50 + z.z * 2.7}%`, color: z.color, background: z.color }} onClick={() => setPanel(z.id)} aria-label={z.label} />)}</div>
    {near && <div className="prompt"><kbd>E</kbd><strong>{near.label}</strong><span>INTERACT</span></div>}
    <Overlay panel={panel} close={() => setPanel(null)} />
    <TouchControls touchRef={touchRef} />
  </main>;
}
