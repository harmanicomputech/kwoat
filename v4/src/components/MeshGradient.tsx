import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../lib/motion'

// A slow, Stripe-style mesh gradient in raw WebGL. Soft colour fields drift
// and breathe; the pointer nudges the nearest one. The palette crossfades
// between light and dark with the theme.

const VERT = `attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }`

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform float uTime; uniform vec2 uMouse; uniform float uDark; uniform vec2 uRes;

vec3 field(vec2 uv, vec2 c, float r, vec3 col){
  float d = length((uv - c) * vec2(uRes.x / uRes.y, 1.));
  return col * smoothstep(r, 0., d);
}
void main(){
  vec2 uv = vUv;
  float t = uTime * .06;
  // gentle domain warp for a silky, non-circular look
  uv += .035 * vec2(sin(uv.y * 5. + t * 3.), cos(uv.x * 4. - t * 2.5));
  vec3 baseL = vec3(.968, .964, .985);
  vec3 baseD = vec3(.027, .024, .047);
  vec3 base = mix(baseL, baseD, uDark);
  vec3 a = mix(vec3(.80, .74, 1.0), vec3(.36, .16, .74), uDark);   // violet
  vec3 b = mix(vec3(.99, .78, .90), vec3(.46, .10, .36), uDark);   // pink
  vec3 c = mix(vec3(.75, .90, 1.0), vec3(.13, .20, .55), uDark);   // sky / indigo
  vec3 d = mix(vec3(1.0, .88, .76), vec3(.30, .10, .52), uDark);   // peach / plum
  vec3 col = base;
  col += field(uv, vec2(.50 + .16 * sin(t * 1.1), .78 + .06 * cos(t * 1.3)) + uMouse * .05, .62, a - base) * .9;
  col += field(uv, vec2(.16 + .08 * cos(t * .9), .52 + .10 * sin(t * 1.2)), .50, c - base) * .8;
  col += field(uv, vec2(.86 + .07 * sin(t * 1.4), .56 + .09 * cos(t)), .48, b - base) * .8;
  col += field(uv, vec2(.62 + .12 * cos(t * 1.6), .30 + .06 * sin(t * 1.5)), .44, d - base) * .55;
  float n = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  col += (n - .5) * .014;
  gl_FragColor = vec4(col, 1.);
}`

export function MeshGradient({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const gl = canvas.getContext('webgl', { antialias: false })
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
    const uTime = u('uTime'), uMouse = u('uMouse'), uDark = u('uDark'), uRes = u('uRes')

    // The image is soft, so render at half resolution and let CSS scale it
    const resize = () => {
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * 0.5))
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * 0.5))
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(uRes, canvas.width, canvas.height)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    const isDark = () => (document.documentElement.dataset.theme === 'dark' ? 1 : 0)
    let dark = isDark()
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
    let last = t0
    let raf = 0
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (!visible) return
      const dt = Math.min((now - last) / 1000, 0.2)
      last = now
      dark += (isDark() - dark) * (1 - Math.exp(-dt * 7))
      m.x += (m.tx - m.x) * 0.04
      m.y += (m.ty - m.y) * 0.04
      gl.uniform1f(uTime, reduced ? 3 : (now - t0) / 1000)
      gl.uniform2f(uMouse, m.x, m.y)
      gl.uniform1f(uDark, dark)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', move)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [])

  return <canvas ref={ref} className={`mesh ${className}`} aria-hidden />
}
