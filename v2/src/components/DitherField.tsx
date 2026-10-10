import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../lib/motion'

// Full-bleed WebGL field: flowing fbm noise rendered through an 8×8 Bayer
// ordered dither, so it reads like ink printed on paper. Pixels near the
// pointer flip to the signal colour and the pattern bulges like a lens.

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`

const FRAG = `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform float uCell;
uniform vec3 uInk; uniform vec3 uPaper; uniform vec3 uSignal; uniform float uDensity; uniform float uScroll; uniform float uSide;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*(3.-2.*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0., a = .5;
  for(int i=0;i<5;i++){ v += a*noise(p); p = p*2.03 + vec2(1.7,9.2); a *= .5; }
  return v;
}
float bayer(vec2 c){
  // 8x8 Bayer threshold built from the 2x2 recursion
  vec2 a = floor(mod(c, 8.));
  float v = 0.;
  float s = 1.;
  for(int i=0;i<3;i++){
    vec2 b = floor(mod(a / s, 2.));
    v += (2.*b.x + 3.*b.y - 4.*b.x*b.y) * pow(4., float(2-i));
    s *= 2.;
  }
  return (v + .5) / 64.;
}
void main(){
  vec2 frag = gl_FragCoord.xy;
  vec2 cell = floor(frag / uCell);
  vec2 uv = (cell * uCell) / uRes.y;
  vec2 m = uMouse * vec2(uRes.x/uRes.y, 1.);
  float d = distance(uv, m);
  float lens = smoothstep(.32, 0., d);
  vec2 q = uv * 2.2 + vec2(0., uScroll*1.5);
  q += (uv - m) * lens * -.6;
  float t = uTime * .06;
  float n = fbm(q + vec2(fbm(q + t*1.3), fbm(q - t)) * 1.6 + t);
  // fade the field toward the left so headline copy stays readable
  float x = gl_FragCoord.x / uRes.x;
  float side = smoothstep(.3, .95, x) * uSide + (1. - uSide);
  float top = smoothstep(1., .82, gl_FragCoord.y / uRes.y);
  float lum = clamp((n - .44) * 2.4, 0., 1.) * side * top * uDensity;
  lum = max(lum, lens * .38 * uDensity * mix(.5, 1., side));
  float on = step(1. - lum, bayer(cell));
  vec3 inkCol = mix(uInk, uSignal, smoothstep(.16, .02, d));
  vec3 col = mix(uPaper, inkCol, on);
  gl_FragColor = vec4(col, 1.);
}`

function rgb(v: string): [number, number, number] {
  const c = document.createElement('canvas').getContext('2d')!
  c.fillStyle = v
  const hex = c.fillStyle as string
  const n = parseInt(hex.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

export function DitherField({ density = 1, cell = 3, className = '', fadeLeft = true }: { density?: number; cell?: number; className?: string; fadeLeft?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false })
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
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const u = (n: string) => gl.getUniformLocation(prog, n)
    const uRes = u('uRes'), uTime = u('uTime'), uMouse = u('uMouse'), uCell = u('uCell')
    const uInk = u('uInk'), uPaper = u('uPaper'), uSignal = u('uSignal'), uDensity = u('uDensity'), uScroll = u('uScroll'), uSide = u('uSide')

    const setColors = () => {
      const cs = getComputedStyle(document.documentElement)
      gl.uniform3fv(uInk, rgb(cs.getPropertyValue('--ink').trim()))
      gl.uniform3fv(uPaper, rgb(cs.getPropertyValue('--paper').trim()))
      gl.uniform3fv(uSignal, rgb(cs.getPropertyValue('--signal').trim()))
    }
    setColors()
    const mo = new MutationObserver(setColors)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    const dpr = Math.min(window.devicePixelRatio, 2)
    const resize = () => {
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uCell, cell * dpr)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()
    gl.uniform1f(uDensity, density)
    gl.uniform1f(uSide, fadeLeft ? 1 : 0)

    const mouse = { x: 0.75, y: 0.5, tx: 0.75, ty: 0.5 }
    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse.tx = (e.clientX - r.left) / r.width
      mouse.ty = 1 - (e.clientY - r.top) / r.height
    }
    window.addEventListener('pointermove', move)

    let visible = true
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(canvas)

    const reduced = prefersReducedMotion()
    const start = performance.now()
    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (!visible) return
      mouse.x += (mouse.tx - mouse.x) * 0.08
      mouse.y += (mouse.ty - mouse.y) * 0.08
      const r = canvas.getBoundingClientRect()
      gl.uniform1f(uTime, reduced ? 12 : (performance.now() - start) / 1000)
      gl.uniform2f(uMouse, mouse.x, mouse.y)
      gl.uniform1f(uScroll, Math.max(0, -r.top / Math.max(1, r.height)))
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
    loop()
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      mo.disconnect()
      window.removeEventListener('pointermove', move)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [density, cell, fadeLeft])

  return <canvas ref={ref} className={`dither ${className}`} aria-hidden />
}
