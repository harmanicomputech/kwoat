import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { prefersReducedMotion } from '../lib/motion'
import { MODELS } from '../api'

// The Kwoat mark — five rays meeting at a point — as five pieces of
// iridescent glass, refracting a slowly flowing mesh gradient behind it.
//  · On load the rays fly in from all sides and lock together.
//  · The pointer tilts it; it floats gently when idle.
//  · Scrolling the hero pulls the rays apart along their own axes.
//  · Model names orbit it in 3D: they are DOM nodes positioned every frame
//    from points projected through the same camera, so depth, scale and
//    blur match the WebGL scene exactly.

// Logo geometry from the brand SVG (viewBox 96×96), converge point at (48, 84)
const RAYS: [number, number, number, number][] = [
  [12, 18, 18, 14],
  [28, 12, 33, 10],
  [46, 22, 50, 22],
  [63, 10, 68, 12],
  [78, 14, 84, 18],
]
const TIP = [48, 84]
const S = 1 / 26
const toX = (x: number) => (x - 48) * S
const toY = (y: number) => -(y - 50) * S

const BG_FRAG = `
precision highp float;
uniform float uTime; uniform vec2 uMouse; uniform float uDark; uniform vec2 uRes;
varying vec2 vUv;
vec3 blob(vec2 uv, vec2 c, float r, vec3 col){ float d = length((uv - c) * vec2(uRes.x/uRes.y, 1.)); return col * smoothstep(r, 0., d); }
void main(){
  vec2 uv = vUv;
  float t = uTime * .08;
  vec3 baseL = vec3(.965, .961, .984);
  vec3 baseD = vec3(.027, .024, .047);
  vec3 col = mix(baseL, baseD, uDark);
  // light palette: lavender, pink, peach, sky. dark palette: violet, plum, indigo, magenta
  vec3 a = mix(vec3(.80, .72, 1.), vec3(.30, .11, .62), uDark);
  vec3 b = mix(vec3(.98, .70, .87), vec3(.45, .08, .32), uDark);
  vec3 c = mix(vec3(1., .86, .70), vec3(.12, .14, .45), uDark);
  vec3 d = mix(vec3(.73, .90, .99), vec3(.42, .16, .80), uDark);
  vec3 acc = vec3(0.);
  acc += blob(uv, vec2(.72 + .12*sin(t*1.3), .62 + .10*cos(t*1.1)) + uMouse*.04, .55, a - col);
  acc += blob(uv, vec2(.88 + .08*cos(t*.9), .28 + .12*sin(t*1.4)), .45, b - col);
  acc += blob(uv, vec2(.52 + .10*sin(t*1.7), .18 + .08*cos(t)), .42, c - col);
  acc += blob(uv, vec2(.30 + .10*cos(t*1.2), .78 + .07*sin(t*1.6)) - uMouse*.03, .40, d - col);
  col += acc * mix(.85, .9, uDark);
  // fine grain to avoid banding
  float n = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  col += (n - .5) * .012;
  gl_FragColor = vec4(col, 1.);
}`
const BG_VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.); }`

export function GlassScene({ progress, start = true, onReady }: { progress: { current: number }; start?: boolean; onReady?: () => void }) {
  const mount = useRef<HTMLDivElement>(null)
  const orbit = useRef<HTMLDivElement>(null)
  const startRef = useRef(start)
  startRef.current = start

  useEffect(() => {
    const el = mount.current!
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    } catch {
      el.classList.add('no-webgl')
      onReady?.()
      return
    }
    const reduced = prefersReducedMotion()
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.outputColorSpace = THREE.SRGBColorSpace
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
    camera.position.set(0, 0, 11)
    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

    // Full-screen gradient, drawn first so the glass has something to refract
    const bgU = { uTime: { value: 0 }, uMouse: { value: new THREE.Vector2() }, uDark: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) } }
    const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ vertexShader: BG_VERT, fragmentShader: BG_FRAG, uniforms: bgU, depthWrite: false }))
    bg.frustumCulled = false
    bg.renderOrder = -1
    scene.add(bg)

    // A few soft coloured orbs float behind the logo for the glass to bend
    const orbs = new THREE.Group()
    const orbCols = ['#a855f7', '#ec4899', '#38bdf8']
    orbCols.forEach((c, i) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.34 - i * 0.05, 48, 48), new THREE.MeshStandardMaterial({ color: c, roughness: 0.25, metalness: 0, emissive: c, emissiveIntensity: 0.5 }))
      m.position.set(Math.cos(i * 2.1 + 0.6) * 0.9, Math.sin(i * 2.1 + 0.6) * 0.8 + 0.3, -1.6 - i * 0.3)
      orbs.add(m)
    })
    scene.add(orbs)

    // Glass rays
    const glass = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#ffffff'),
      transmission: 1,
      thickness: 0.9,
      roughness: 0.06,
      ior: 1.5,
      iridescence: 1,
      iridescenceIOR: 1.35,
      iridescenceThicknessRange: [180, 620],
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      attenuationColor: new THREE.Color('#8b5cf6'),
      attenuationDistance: 1.4,
      envMapIntensity: 1.3,
      dispersion: 0.35,
      specularIntensity: 1,
    })
    const logo = new THREE.Group()
    const rays: { mesh: THREE.Mesh; dir: THREE.Vector3; spin: THREE.Vector3 }[] = []
    const tip = new THREE.Vector2(toX(TIP[0]), toY(TIP[1]))
    RAYS.forEach(([x1, y1, x2, y2], i) => {
      const shape = new THREE.Shape()
      shape.moveTo(toX(x1), toY(y1))
      shape.lineTo(toX(x2), toY(y2))
      shape.lineTo(tip.x, tip.y)
      shape.closePath()
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.32, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.045, bevelSegments: 8, curveSegments: 4 })
      geo.translate(0, 0, -0.16)
      const mesh = new THREE.Mesh(geo, glass)
      const top = new THREE.Vector2((toX(x1) + toX(x2)) / 2, (toY(y1) + toY(y2)) / 2)
      const dir = new THREE.Vector3(top.x - tip.x, top.y - tip.y, (i - 2) * 0.15).normalize()
      rays.push({ mesh, dir, spin: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(4) })
      logo.add(mesh)
    })
    // a small bright core where the rays meet
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.08, 32, 32), new THREE.MeshBasicMaterial({ color: '#c4b5fd' }))
    core.position.set(tip.x, tip.y, 0)
    logo.add(core)
    const holder = new THREE.Group()
    holder.add(logo)
    logo.position.y = 0.25
    scene.add(holder)

    const key = new THREE.DirectionalLight('#ffffff', 2.2)
    key.position.set(3, 4, 6)
    scene.add(key)
    const rim = new THREE.PointLight('#a855f7', 30, 20)
    rim.position.set(-4, -2, 3)
    scene.add(rim)

    // Theme
    let darkTarget = document.documentElement.dataset.theme === 'dark' ? 1 : 0
    bgU.uDark.value = darkTarget
    const mo = new MutationObserver(() => (darkTarget = document.documentElement.dataset.theme === 'dark' ? 1 : 0))
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    // Orbiting DOM labels
    const chips = Array.from(orbit.current?.children ?? []) as HTMLElement[]
    const tmp = new THREE.Vector3()

    let wide = true
    const resize = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      wide = w / h > 1.15
      camera.position.z = wide ? 11 : 14
      camera.updateProjectionMatrix()
      bgU.uRes.value.set(w, h)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    resize()

    const mouse = new THREE.Vector2()
    const target = new THREE.Vector2()
    const onMove = (e: PointerEvent) => target.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1)
    window.addEventListener('pointermove', onMove)

    let visible = true
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(el)

    const clock = new THREE.Clock()
    const intro = { t: reduced ? 1 : 0, from: -1 }
    let raf = 0
    let readied = false
    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (!visible) return
      const dt = Math.min(clock.getDelta(), 0.2)
      const t = clock.elapsedTime
      // the entrance starts when the page is ready, and runs on wall-clock time
      if (intro.t < 1 && startRef.current) {
        if (intro.from < 0) intro.from = t
        intro.t = Math.min(1, (t - intro.from) / 2.4)
      }
      const ease = 1 - Math.pow(1 - intro.t, 4)
      const p = progress.current
      mouse.lerp(target, 0.06)

      bgU.uTime.value = t
      bgU.uMouse.value.copy(mouse)
      bgU.uDark.value += (darkTarget - bgU.uDark.value) * (1 - Math.exp(-dt * 7))
      const dk = bgU.uDark.value
      renderer.toneMappingExposure = 1.05 - dk * 0.15
      core.material.color.setRGB(0.77 - dk * 0.1, 0.71 - dk * 0.2, 0.99)

      // layout: logo sits right of the headline on wide screens
      holder.position.x = (wide ? 2.55 : 0) - p * (wide ? 0.6 : 0)
      holder.position.y = (wide ? -0.15 : 2.35) + Math.sin(t * 0.8) * 0.08 + p * 0.8
      const sc = (wide ? 1.12 : 0.78) * (0.6 + 0.4 * ease) * (1 + p * 0.25)
      holder.scale.setScalar(sc)
      holder.rotation.y = mouse.x * 0.45 + Math.sin(t * 0.35) * 0.18 + (1 - ease) * 2.4 + p * 1.4
      holder.rotation.x = -mouse.y * 0.3 + Math.cos(t * 0.3) * 0.06 - p * 0.3
      holder.rotation.z = (1 - ease) * -0.6

      // each ray flies in from far along its own axis, and splits apart on scroll
      rays.forEach((r, i) => {
        const fly = (1 - ease) * (7 + i) + p * (1.2 + Math.abs(i - 2) * 0.25)
        r.mesh.position.copy(r.dir).multiplyScalar(fly)
        r.mesh.rotation.set(r.spin.x * (1 - ease) + p * r.spin.x * 0.12, r.spin.y * (1 - ease) + p * r.spin.y * 0.12, r.spin.z * (1 - ease))
      })
      orbs.rotation.z = t * 0.12
      orbs.position.copy(holder.position)
      orbs.scale.setScalar(sc * ease)

      renderer.render(scene, camera)

      // place the orbiting labels
      chips.forEach((c, i) => {
        const a = t * 0.32 + (i / chips.length) * Math.PI * 2
        tmp.set(Math.cos(a) * 2.6, Math.sin(a * 1.0) * 0.55 - 0.1, Math.sin(a) * 2.2)
        tmp.applyEuler(new THREE.Euler(0.25, 0, -0.18))
        tmp.multiplyScalar(sc).add(holder.position)
        const depth = tmp.z
        tmp.project(camera)
        const x = (tmp.x * 0.5 + 0.5) * el.clientWidth
        const y = (-tmp.y * 0.5 + 0.5) * el.clientHeight
        const front = THREE.MathUtils.clamp((depth + 2.5) / 5, 0, 1)
        c.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${0.72 + front * 0.38})`
        c.style.opacity = String((0.25 + front * 0.75) * ease * (1 - p * 1.4))
        c.style.filter = `blur(${(1 - front) * 2.2}px)`
        c.style.zIndex = depth > 0 ? '3' : '1'
      })
      if (!readied && intro.t > 0.05) {
        readied = true
        onReady?.()
      }
    }
    loop()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      mo.disconnect()
      window.removeEventListener('pointermove', onMove)
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        m.geometry?.dispose()
        ;(m.material as THREE.Material | undefined)?.dispose?.()
      })
      pmrem.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const labels = MODELS.filter((m) => !m.id.includes('mistral') && !m.id.includes('llama')).slice(0, 8)
  return (
    <div ref={mount} className="glass-scene" aria-hidden>
      <div ref={orbit} className="orbit">
        {labels.map((m) => (
          <span key={m.id} className="orbit-chip">
            <i style={{ background: m.color }} />
            {m.name}
          </span>
        ))}
      </div>
    </div>
  )
}
