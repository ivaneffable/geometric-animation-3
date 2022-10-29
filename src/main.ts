import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'
import { scaleLinear } from 'd3-scale'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const black = '#1F2930'
const blue = '#284546'
const red = '#8E352F'
const yellow = '#F7AD30'
const boxColors = [blue, red, yellow]

const tileX = 5
const tileY = 0.25
const tileZ = 5
const tileMargin = 0.05

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

const numRows = 15
const numColumns = 15

const delayScale = scaleLinear()
  .domain([0, numRows / 2, numRows])
  .range([0, 2, 0])

const animateRotation = (rotations: THREE.Euler[], delay: number) => {
  gsap.to(rotations, {
    x: Math.PI,
    stagger: 0.3,
    delay,
    duration: 0.5,
    yoyo: true,
    repeat: -1,
  })
}

const createTile = (
  x: number,
  z: number,
  color: THREE.ColorRepresentation
): [THREE.LineSegments, THREE.Mesh] => {
  const geometry = new THREE.BoxGeometry(tileX, tileY, tileZ)
  const material = new THREE.MeshBasicMaterial({
    color: black,
  })
  const cube = new THREE.Mesh(geometry, material)
  cube.position.set(x, 0, z)

  const edges = new THREE.EdgesGeometry(geometry)
  const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({
      color,
      linewidth: 3,
    })
  )
  line.position.set(x, 0, z)

  return [line, cube]
}

// init scene
const renderer = new THREE.WebGLRenderer()
renderer.setSize(sizes.width, sizes.height)
document.body.appendChild(renderer.domElement)
renderer.domElement.setAttribute('class', 'webgl')

const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  1,
  500
)
camera.position.set(34, 30, -28)

const scene = new THREE.Scene()
scene.background = new THREE.Color(black)
// ---

const group = new THREE.Group()
const rowsOfTiles: [THREE.LineSegments, THREE.Mesh][][] = []
for (let i = 0; i < numRows; i++) {
  const row = []
  for (let j = 0; j < numColumns; j++) {
    const tile = createTile(
      i * (tileX + tileMargin),
      j * (tileX + tileMargin),
      boxColors[(i + j) % 3]
    )
    row.push(tile)

    group.add(tile[0])
    group.add(tile[1])
  }
  rowsOfTiles.push(row)
}

for (let i = 0; i < numColumns; i++) {
  const lineRotations = rowsOfTiles[i].reduce((acc, value) => {
    acc.push(value[0].rotation)
    return acc
  }, [] as THREE.Euler[])
  const boxRotations = rowsOfTiles[i].reduce((acc, value) => {
    acc.push(value[1].rotation)
    return acc
  }, [] as THREE.Euler[])
  animateRotation(lineRotations, delayScale(i))
  animateRotation(boxRotations, delayScale(i))
}

group.position.x = -40
group.position.z = -40
group.rotation.y = -0.5
scene.add(group)

camera.lookAt(group.position)

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  renderer.setSize(sizes.width, sizes.height)
})

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
function animate() {
  controls.update()
  renderer.render(scene, camera)

  requestAnimationFrame(animate)

  console.log(camera.position)
}
animate()
