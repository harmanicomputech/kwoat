import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { prefersReducedMotion } from '../lib/motion'

// A noise-displaced iridescent orb inside a field of drifting particles.
// The orb follows the pointer and swells with scroll progress.

const noise = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`

const orbVertex = /* glsl */ `
uniform float uTime; uniform float uAmp; uniform vec2 uMouse;
varying vec3 vNormal; varying vec3 vPos; varying float vNoise;
${noise}
void main(){
  vec3 p = position;
  float n = snoise(p*1.4 + vec3(uTime*.25, uTime*.18, 0.) + vec3(uMouse,0.)*.6);
  float n2 = snoise(p*3.2 - uTime*.3)*.25;
  float d = (n + n2) * uAmp;
  p += normal * d;
  vNoise = d;
  vNormal = normalize(normalMatrix * normal);
  vPos = (modelViewMatrix * vec4(p,1.)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.);
}`

const orbFragment = /* glsl */ `
uniform float uTime;
varying vec3 vNormal; varying vec3 vPos; varying float vNoise;
vec3 palette(float t){
  vec3 a=vec3(.58,.45,.9); vec3 b=vec3(.38,.3,.32); vec3 c=vec3(1.,.9,.8); vec3 d=vec3(.72,.55,.42);
  return a + b*cos(6.28318*(c*t+d));
}
void main(){
  vec3 viewDir = normalize(-vPos);
  float fres = pow(1. - max(dot(viewDir, vNormal), 0.), 2.4);
  vec3 col = palette(vNoise*1.6 + fres*.6 + uTime*.05);
  col = mix(col*.35, col, fres);
  col += vec3(.75,.6,1.) * pow(fres, 4.) * 1.4;
  gl_FragColor = vec4(col, .96);
}`

const pointsVertex = /* glsl */ `
uniform float uTime; uniform float uScroll; uniform float uPixelRatio;
attribute float aScale; attribute float aSpeed;
varying float vAlpha;
void main(){
  vec3 p = position;
  p.y += mod(uTime*aSpeed*.15 + p.y + 6., 12.) - 6. - p.y;
  p.x += sin(uTime*aSpeed + p.y)*.15;
  p.z += uScroll * 4.;
  vec4 mv = modelViewMatrix * vec4(p,1.);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aScale * 26. * uPixelRatio / -mv.z;
  vAlpha = smoothstep(-12., -2., mv.z) * (.35 + aScale*.5);
}`

const pointsFragment = /* glsl */ `
varying float vAlpha;
void main(){
  float d = length(gl_PointCoord - .5);
  float a = smoothstep(.5, 0., d);
  gl_FragColor = vec4(.78,.7,1., a*vAlpha);
}`

export function HeroScene({ progress }: { progress: { current: number } }) {
  const mount = useRef<HTMLDivElement>(null)
  const progressRef = progress

  useEffect(() => {
    const el = mount.current
    if (!el) return
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    } catch {
      el.classList.add('no-webgl')
      return
    }
    const reduced = prefersReducedMotion()
    const dpr = Math.min(window.devicePixelRatio, 2)
    renderer.setPixelRatio(dpr)
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
    camera.position.set(0, 0, 7)

    const orbUniforms = { uTime: { value: 0 }, uAmp: { value: 0.32 }, uMouse: { value: new THREE.Vector2() } }
    const orb = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.55, 128),
      new THREE.ShaderMaterial({ vertexShader: orbVertex, fragmentShader: orbFragment, uniforms: orbUniforms, transparent: true }),
    )
    scene.add(orb)

    // Thin orbit rings
    const rings = new THREE.Group()
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(2.3 + i * 0.45, 0.004, 8, 256),
        new THREE.MeshBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.35 - i * 0.08 }),
      )
      ring.rotation.set(Math.PI / 2.2 + i * 0.25, i * 0.4, 0)
      rings.add(ring)
    }
    scene.add(rings)

    const COUNT = window.innerWidth < 700 ? 900 : 2200
    const pos = new Float32Array(COUNT * 3)
    const scale = new Float32Array(COUNT)
    const speed = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2
      scale[i] = Math.random()
      speed[i] = 0.2 + Math.random()
    }
    const pg = new THREE.BufferGeometry()
    pg.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    pg.setAttribute('aScale', new THREE.BufferAttribute(scale, 1))
    pg.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1))
    const pointUniforms = { uTime: { value: 0 }, uScroll: { value: 0 }, uPixelRatio: { value: dpr } }
    const points = new THREE.Points(
      pg,
      new THREE.ShaderMaterial({
        vertexShader: pointsVertex,
        fragmentShader: pointsFragment,
        uniforms: pointUniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    )
    scene.add(points)

    const mouse = new THREE.Vector2()
    const target = new THREE.Vector2()
    const onMove = (e: PointerEvent) => {
      target.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1)
    }
    window.addEventListener('pointermove', onMove)

    let offsetX = 0
    const resize = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.position.z = w < 700 ? 9 : 7
      offsetX = w / h > 1.25 ? 1.9 : 0
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    resize()

    let visible = true
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(el)

    const clock = new THREE.Clock()
    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (!visible) return
      const t = reduced ? 0 : clock.getElapsedTime()
      const p = progressRef.current
      mouse.lerp(target, 0.05)
      orbUniforms.uTime.value = t
      orbUniforms.uMouse.value.copy(mouse)
      orbUniforms.uAmp.value = 0.28 + p * 0.5
      pointUniforms.uTime.value = t
      pointUniforms.uScroll.value = p
      orb.position.x = offsetX + mouse.x * 0.35 - p * offsetX * 0.6
      orb.position.y = mouse.y * 0.25 - p * 1.2
      orb.rotation.y = t * 0.12 + mouse.x * 0.4
      orb.rotation.x = mouse.y * 0.3
      orb.scale.setScalar(1 + p * 0.6)
      rings.rotation.z = t * 0.08
      rings.rotation.x = mouse.y * 0.2
      rings.position.copy(orb.position)
      camera.position.x = mouse.x * 0.3
      camera.lookAt(0, 0, 0)
      renderer.render(scene, camera)
    }
    loop()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        m.geometry?.dispose()
        const mat = m.material as THREE.Material | undefined
        mat?.dispose()
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={mount} className="hero-scene" aria-hidden />
}
