import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../lib/motion'

// The Kwoat mark — five rays meeting at one point — drawn as light.
// Five tapered beams fall from above and converge on a focal point
// (where the prompt box sits). Light shimmers down each beam, dust
// drifts through them, and the focal point follows the pointer slightly.

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`

const FRAG = `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uFocal; uniform vec2 uMouse; uniform float uIntensity; uniform float uSpread;

float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.-2.*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
}

// distance from p to segment a-b, and position t along it
vec2 seg(vec2 p, vec2 a, vec2 b){
  vec2 pa = p - a, ba = b - a;
  float t = clamp(dot(pa, ba) / dot(ba, ba), 0., 1.);
  return vec2(length(pa - ba * t), t);
}

void main(){
  float aspect = uRes.x / uRes.y;
  vec2 uv = gl_FragCoord.xy / uRes.y;           // y in 0..1, x in 0..aspect
  vec2 focal = vec2(uFocal.x * aspect, uFocal.y) + uMouse * vec2(.04, .02);
  float tilt = uMouse.x * .06;

  vec3 col = vec3(0.);
  // origins mirror the logo: wide fan above the viewport
  float xs[5];
  xs[0] = -1.; xs[1] = -.5; xs[2] = 0.; xs[3] = .5; xs[4] = 1.;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float spread = xs[i] * uSpread * aspect * .5;
    vec2 origin = vec2(focal.x + spread + tilt, 1.18 + abs(xs[i]) * -.04);
    vec2 d = seg(uv, origin, focal);
    float t = d.y;
    // beam is wide at the top, a needle at the focal point (like the logo's triangles)
    float w = mix(.022, .0012, pow(t, .9)) * (i == 2 ? .75 : 1.);
    float core = smoothstep(w, 0., d.x);
    float halo = exp(-d.x / (w * 5.)) * .35;
    // light travelling down the beam
    float flow = noise(vec2(t * 7. - uTime * (.55 + fi * .07), fi * 3.1));
    flow = .55 + .45 * flow;
    float fade = smoothstep(0., .25, t) * (1. - smoothstep(.985, 1., t) * .2);
    float b = (core + halo) * flow * fade;
    vec3 tint = mix(vec3(.49, .23, .93), vec3(.77, .71, .99), core);
    col += tint * b;
  }
  // focal bloom
  float fd = length(uv - focal);
  col += vec3(.55, .36, .98) * exp(-fd * 9.) * .55;
  col += vec3(.95, .92, 1.) * exp(-fd * 42.) * .5;
  // wide atmospheric wash from above
  col += vec3(.29, .12, .62) * smoothstep(.9, 0., length((uv - vec2(focal.x, 1.1)) * vec2(.6, 1.))) * .22;
  // dust motes caught in the light
  vec2 g = uv * vec2(90., 90.) + vec2(0., uTime * 1.2);
  vec2 gi = floor(g);
  float h = hash(gi);
  float mote = step(.985, h) * smoothstep(.35, 0., length(fract(g) - .5));
  col += vec3(.8, .75, 1.) * mote * clamp(length(col) * 1.5, 0., 1.) * (.5 + .5 * sin(uTime * 2. + h * 40.));

  col *= uIntensity;
  // gentle tone map so overlaps never clip harshly
  col = 1. - exp(-col * 1.6);
  gl_FragColor = vec4(col, 1.);
}`

export function Rays({
  focal = [0.5, 0.42],
  intensity = 1,
  spread = 1,
  className = '',
}: {
  focal?: [number, number]
  intensity?: number
  spread?: number
  className?: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const live = useRef({ focal, intensity, spread })
  live.current = { focal, intensity, spread }

  useEffect(() => {
    const canvas = ref.current!
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false })
    if (!gl) {
      canvas.classList.add('no-webgl')
      return
    }
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    gl.useProgram(prog)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const u = (n: string) => gl.getUniformLocation(prog, n)
    const uRes = u('uRes'), uTime = u('uTime'), uFocal = u('uFocal'), uMouse = u('uMouse'), uIntensity = u('uIntensity'), uSpread = u('uSpread')

    // Render at reduced resolution — the image is soft by nature
    const scale = Math.min(window.devicePixelRatio, 1.5) * 0.75
    const resize = () => {
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale))
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale))
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(uRes, canvas.width, canvas.height)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    const m = { x: 0, y: 0, tx: 0, ty: 0 }
    const move = (e: PointerEvent) => {
      m.tx = (e.clientX / window.innerWidth) * 2 - 1
      m.ty = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', move)
    let visible = true
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(canvas)

    const reduced = prefersReducedMotion()
    const t0 = performance.now()
    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (!visible) return
      m.x += (m.tx - m.x) * 0.04
      m.y += (m.ty - m.y) * 0.04
      const { focal: f, intensity: k, spread: s } = live.current
      gl.uniform1f(uTime, reduced ? 4 : (performance.now() - t0) / 1000)
      gl.uniform2f(uFocal, f[0], f[1])
      gl.uniform2f(uMouse, m.x, m.y)
      gl.uniform1f(uIntensity, k)
      gl.uniform1f(uSpread, s)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
    loop()
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', move)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [])

  return <canvas ref={ref} className={`rays ${className}`} aria-hidden />
}
