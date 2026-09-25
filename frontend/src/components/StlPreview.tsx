import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'

export function StlPreview({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1c1b)
    const camera = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.1, 2000)
    camera.position.set(80, 60, 80)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(el.clientWidth, el.clientHeight)
    el.appendChild(renderer.domElement)
    const controls = new OrbitControls(camera, renderer.domElement)
    scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    const dir = new THREE.DirectionalLight(0xffffff, 0.6)
    dir.position.set(40, 80, 20)
    scene.add(dir)
    const loader = new STLLoader()
    let mesh: THREE.Mesh | null = null
    loader.load(url, (geom) => {
      geom.center()
      geom.computeVertexNormals()
      mesh = new THREE.Mesh(geom, new THREE.MeshStandardMaterial({ color: 0x8aa090, metalness: 0.1, roughness: 0.7 }))
      scene.add(mesh)
      const box = new THREE.Box3().setFromObject(mesh)
      const size = box.getSize(new THREE.Vector3()).length()
      camera.position.copy(box.getCenter(new THREE.Vector3()).add(new THREE.Vector3(size, size, size)))
      controls.target.copy(box.getCenter(new THREE.Vector3()))
    })
    let raf = 0
    const tick = () => {
      controls.update()
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => {
      cancelAnimationFrame(raf)
      mesh?.geometry.dispose()
      renderer.dispose()
      el.innerHTML = ''
    }
  }, [url])
  return <div className="stl-view" ref={ref} />
}
