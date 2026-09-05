import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import * as THREE from 'three';
import './App.css';

type Zone = {
  id: string;
  label: string;
  subtitle: string;
  x: number;
  z: number;
  color: string;
};

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

function Terrain() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const blocks = useMemo(() => {
    const result: { x: number; y: number; z: number }[] = [];
    for (let x = -20; x <= 20; x += 1) {
      for (let z = -20; z <= 20; z += 1) {
        const edge = Math.max(Math.abs(x), Math.abs(z));
        if (edge > 19 && Math.abs(x + z) > 24) continue;
        const h = Math.sin(x * 0.38) + Math.cos(z * 0.31) + Math.sin((x + z) * 0.18) > 1.25 ? 2 : 1;
        for (let y = 0; y < h; y += 1) result.push({ x, y, z });
      }
    }
    return result;
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const dummy = new THREE.Object3D();
    blocks.forEach((block, index) => {
      dummy.position.set(block.x, block.y - 0.5, block.z);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(index, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [blocks]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, blocks.length]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#82cf5b" roughness={1} />
    </instancedMesh>
  );
}

function Cube({ position, scale = [1, 1, 1], color }: { position: [number, number, number]; scale?: [number, number, number]; color: string }) {
  return (
    <mesh position={position} scale={scale} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  );
}

function Sign() {
  return (
    <group position={[0, 2.1, -3]}>
      <Cube position={[-1.8, -1.1, 0]} scale={[0.25, 2.3, 0.25]} color="#765035" />
      <Cube position={[1.8, -1.1, 0]} scale={[0.25, 2.3, 0.25]} color="#765035" />
      <Cube position={[0, 0, 0]} scale={[4.4, 1.9, 0.3]} color="#202b2c" />
      <Text position={[0, 0.22, -0.18]} fontSize={0.52} color="#f3f7ef" anchorX="center" anchorY="middle">NAYAN ASATI</Text>
      <Text position={[0, -0.36, -0.18]} fontSize={0.2} color="#a8b7ad" anchorX="center" anchorY="middle">DEVELOPER / PHOTOGRAPHER</Text>
      <Float speed={1.2} floatIntensity={0.25}>
        <Text position={[0, 2, 0]} fontSize={0.25} color="#dce7df" anchorX="center">Explore. Build. Capture.</Text>
      </Float>
    </group>
  );
}

function Particles({ color }: { color: string }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.8;
  });
  return (
    <group ref={ref}>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[Math.cos(i) * 2, 1.4 + (i % 3) * 0.35, Math.sin(i) * 2]}>
          <boxGeometry args={[0.12, 0.12, 0.12]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

function Building({ zone, onHover, onInteract }: { zone: Zone; onHover: (id: string | null) => void; onInteract: (id: string) => void }) {
  const [hovered, setHovered] = useState(false);
  const common = {
    onPointerOver: () => { setHovered(true); onHover(zone.id); },
    onPointerOut: () => { setHovered(false); onHover(null); },
    onClick: (event: THREE.Event) => { event.stopPropagation(); onInteract(zone.id); },
  };

  return (
    <group position={[zone.x, 0, zone.z]} {...common}>
      {zone.id === 'skills' ? (
        <>
          {[0, 1, 2, 3, 4].map((i) => <Cube key={i} position={[0, i + 0.5, 0]} scale={[3.2 - i * 0.22, 1, 3.2 - i * 0.22]} color={i % 2 ? '#8c68bd' : '#b795e8'} />)}
          <Text position={[0, 5.6, 0]} fontSize={0.65} color="#f3eaff" anchorX="center">SKILLS</Text>
        </>
      ) : zone.id === 'gallery' ? (
        <>
          <Cube position={[0, 1.4, 0]} scale={[5, 2.8, 4]} color="#262426" />
          <Cube position={[0, 3, 0]} scale={[5.4, 0.35, 4.4]} color="#171617" />
          {[-1.6, 0, 1.6].map((x, i) => <Cube key={i} position={[x, 1.4, -2.03]} scale={[1.15, 1.4, 0.12]} color={['#5c4740', '#2f4145', '#6b4d3d'][i]} />)}
          <Text position={[0, 3.55, -0.1]} fontSize={0.55} color="#e8d7b4" anchorX="center">GHOUL DARKROOM</Text>
        </>
      ) : zone.id === 'contact' ? (
        <>
          <Cube position={[-2, 1.6, 0]} scale={[0.7, 3.5, 0.7]} color="#552b54" />
          <Cube position={[2, 1.6, 0]} scale={[0.7, 3.5, 0.7]} color="#552b54" />
          <Cube position={[0, 3.05, 0]} scale={[4.7, 0.7, 0.7]} color="#552b54" />
          <mesh position={[0, 1.6, 0]}>
            <boxGeometry args={[3.4, 3, 0.35]} />
            <meshStandardMaterial color="#b94383" emissive="#7b1f5c" emissiveIntensity={0.7} transparent opacity={0.72} />
          </mesh>
          <Text position={[0, 4.05, 0]} fontSize={0.55} color="#ffd2eb" anchorX="center">CONTACT</Text>
        </>
      ) : (
        <>
          <Cube position={[0, 0.8, 0]} scale={[4, 1.6, 3.4]} color="#805538" />
          <Cube position={[0, 2, 0]} scale={[4.4, 0.55, 3.8]} color="#9d3e3e" />
          <Cube position={[0, 0.7, -1.76]} scale={[1.1, 1.4, 0.25]} color="#282322" />
          <Cube position={[-1.25, 1.15, -1.82]} scale={[0.55, 0.55, 0.2]} color="#6ab4d1" />
          <Cube position={[1.25, 1.15, -1.82]} scale={[0.55, 0.55, 0.2]} color="#6ab4d1" />
          <Text position={[0, 3, -0.1]} fontSize={0.42} color={zone.color} anchorX="center">{zone.label}</Text>
        </>
      )}
      {hovered && <Particles color={zone.color} />}
    </group>
  );
}

function nearest(position: THREE.Vector3) {
  return zones.reduce<{ zone: Zone; distance: number } | null>((best, zone) => {
    const distance = Math.hypot(position.x - zone.x, position.z - zone.z);
    return !best || distance < best.distance ? { zone, distance } : best;
  }, null);
}

function World({ onInteract, onHover, onNear, touchRef }: { onInteract: (id: string) => void; onHover: (id: string | null) => void; onNear: (zone: Zone | null) => void; touchRef: MutableRefObject<TouchState> }) {
  const { camera, gl } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const yaw = useRef(0);
  const pitch = useRef(-0.06);
  const velocityY = useRef(0);
  const grounded = useRef(true);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      keys.current[event.key.toLowerCase()] = true;
      if (event.code === 'Space') {
        event.preventDefault();
        if (grounded.current) {
          velocityY.current = 6;
          grounded.current = false;
        }
      }
    };
    const up = (event: KeyboardEvent) => { keys.current[event.key.toLowerCase()] = false; };
    const move = (event: MouseEvent) => {
      if (document.pointerLockElement === gl.domElement) {
        yaw.current -= event.movementX * 0.0022;
        pitch.current = THREE.MathUtils.clamp(pitch.current - event.movementY * 0.0018, -1.2, 1.2);
      }
    };
    const lock = () => {
      if (document.pointerLockElement !== gl.domElement) gl.domElement.requestPointerLock?.();
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    document.addEventListener('mousemove', move);
    gl.domElement.addEventListener('click', lock);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      document.removeEventListener('mousemove', move);
      gl.domElement.removeEventListener('click', lock);
    };
  }, [gl]);

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
    if (camera.position.y <= 1.15) {
      camera.position.y = 1.15;
      velocityY.current = 0;
      grounded.current = true;
    }

    yaw.current -= touch.lookX * 0.006;
    pitch.current = THREE.MathUtils.clamp(pitch.current - touch.lookY * 0.004, -1.2, 1.2);
    touch.lookX = 0;
    touch.lookY = 0;
    camera.rotation.set(pitch.current, yaw.current, 0, 'YXZ');

    const result = nearest(camera.position);
    onNear(result && result.distance < 4 ? result.zone : null);
  });

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[8, 16, 6]} intensity={2.5} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <hemisphereLight intensity={0.35} color="#d8f0ff" groundColor="#31462b" />
      <Terrain />
      <Sign />
      {zones.filter((zone) => zone.id !== 'spawn').map((zone) => <Building key={zone.id} zone={zone} onHover={onHover} onInteract={onInteract} />)}
    </>
  );
}

function Overlay({ panel, close }: { panel: string | null; close: () => void }) {
  if (!panel) return null;
  if (panel === 'projects') {
    return <div className="overlay"><div className="panel project-panel"><button className="close" onClick={close}>×</button><p className="eyebrow">PROJECTS DISTRICT</p><h1>Things I build.</h1><div className="project-grid">{projects.map(([name, description, stack, url]) => <article key={name}><div className="project-mark" /><h2>{name}</h2><p>{description}</p><div className="tags">{stack.split(' · ').map((tag) => <span key={tag}>{tag}</span>)}</div><a href={url} target="_blank" rel="noreferrer">VIEW ON GITHUB ↗</a></article>)}</div></div></div>;
  }
  if (panel === 'skills') return <div className="overlay"><div className="panel"><button className="close" onClick={close}>×</button><p className="eyebrow">SKILLS TOWER</p><h1>My toolkit.</h1><p className="lead">HTML · CSS · JavaScript · Python · FastAPI · Kivy · React · Next.js · TypeScript</p><div className="skill-cloud">{['HTML','CSS','JavaScript','Python','FastAPI','Kivy','React','Next.js','TypeScript','Git','GitHub','Vercel'].map((skill) => <span key={skill}>{skill}</span>)}</div></div></div>;
  if (panel === 'gallery') return <div className="overlay"><div className="panel"><button className="close" onClick={close}>×</button><p className="eyebrow">GHOUL DARKROOM</p><h1>Frames & atmosphere.</h1><p className="lead">Photography is the other half of the portfolio — composition, mood and stories beyond the screen.</p><div className="shots"><div /><div /><div /><div /></div><a className="primary" href="https://www.instagram.com/nayan._.asati/" target="_blank" rel="noreferrer">OPEN INSTAGRAM ↗</a></div></div>;
  if (panel === 'contact') return <div className="overlay"><div className="panel"><button className="close" onClick={close}>×</button><p className="eyebrow">CONTACT PORTAL</p><h1>Let's build something.</h1><p className="lead">Open a channel and tell me what you're making.</p><div className="contact-links"><a href="https://github.com/Nayan1209" target="_blank" rel="noreferrer"><span>GITHUB</span><b>@Nayan1209 ↗</b></a><a href="https://www.instagram.com/nayan._.asati/" target="_blank" rel="noreferrer"><span>INSTAGRAM</span><b>@nayan._.asati ↗</b></a><a href="mailto:YOUR_EMAIL_HERE"><span>EMAIL</span><b>Configure your email ↗</b></a></div></div></div>;
  return <div className="overlay"><div className="panel welcome"><button className="close" onClick={close}>×</button><p className="eyebrow">SPAWN HUB / WELCOME</p><h1>Nayan Asati.</h1><p className="lead">Developer + photographer building digital experiences with code, curiosity and a little chaos.</p><p>Walk the island. Find the builds. Press <kbd>E</kbd> when a world node starts talking to you.</p><button className="primary" onClick={close}>ENTER WORLD</button></div></div>;
}

function TouchControls({ touchRef }: { touchRef: MutableRefObject<TouchState> }) {
  const joystick = useRef<HTMLDivElement>(null);
  const updateJoystick = (event: React.PointerEvent) => {
    if (!joystick.current) return;
    const rect = joystick.current.getBoundingClientRect();
    const x = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const y = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    const distance = Math.min(1, Math.hypot(x, y));
    const angle = Math.atan2(y, x);
    touchRef.current.jx = Math.cos(angle) * distance;
    touchRef.current.jy = Math.sin(angle) * distance;
  };
  return <div className="touch-ui"><div className="joystick" ref={joystick} onPointerMove={updateJoystick} onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); updateJoystick(e); }} onPointerUp={() => { touchRef.current.jx = 0; touchRef.current.jy = 0; }}><i /></div><div className="look-pad" onPointerMove={(e) => { if (e.buttons) { touchRef.current.lookX += e.movementX; touchRef.current.lookY += e.movementY; } }}><span>LOOK</span></div></div>;
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [panel, setPanel] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [near, setNear] = useState<Zone | null>(null);
  const [day, setDay] = useState(0.55);
  const touchRef = useRef<TouchState>({ jx: 0, jy: 0, lookX: 0, lookY: 0 });

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setDay((value) => (value + 0.012) % 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'e' && near) setPanel(near.id);
      if (event.key === 'Escape') setPanel(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [near]);

  const sun = Math.sin(day * Math.PI * 2) * 0.5 + 0.5;

  return (
    <main className="game-shell">
      {loading && <div className="loading"><div className="loading-logo">NAYAN<span>.WORLD</span></div><div className="loading-bar"><i /></div><div className="loading-copy">Building terrain...<br />Placing blocks...<br />Waking the world...</div></div>}
      <Canvas shadows camera={{ position: [0, 1.15, 4], fov: 70, near: 0.1, far: 100 }} dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: 'high-performance' }} onCreated={({ camera }) => { camera.rotation.order = 'YXZ'; }}>
        <color attach="background" args={[sun > 0.35 ? '#86b9cf' : '#172234']} />
        <fog attach="fog" args={[sun > 0.35 ? '#86b9cf' : '#172234', 20, 48]} />
        <World onInteract={setPanel} onHover={setHover} onNear={setNear} touchRef={touchRef} />
      </Canvas>
      <div className="hud topbar"><div><b>NAYAN ASATI</b><span>VOXEL PORTFOLIO</span></div><div className="status"><i /> ONLINE <em>{Math.round(sun * 100)}% DAYLIGHT</em></div></div>
      <div className="hud controls"><span>WASD / ARROWS</span><span>SPACE · JUMP</span><span>MOUSE · LOOK</span><kbd>E</kbd><span>INTERACT</span></div>
      <div className="crosshair">+</div>
      <div className="compass"><b>N</b><span>·</span><b>E</b><span>·</span><b>S</b><span>·</span><b>W</b></div>
      <div className="minimap"><span className="map-title">WORLD MAP</span><span className="map-player" />{zones.filter((z) => z.id !== 'spawn').map((z) => <button key={z.id} className="map-dot" style={{ left: `${50 + z.x * 2.1}%`, top: `${50 + z.z * 2.1}%`, color: z.color, background: z.color }} onClick={() => setPanel(z.id)} aria-label={z.label} />)}</div>
      {near && <div className="prompt"><kbd>E</kbd><strong>{near.label}</strong><span>INTERACT</span></div>}
      {hover && <div className="hover-label">{zones.find((z) => z.id === hover)?.label}</div>}
      <TouchControls touchRef={touchRef} />
      <Overlay panel={panel} close={() => setPanel(null)} />
    </main>
  );
}
