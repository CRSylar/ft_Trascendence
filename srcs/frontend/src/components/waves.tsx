import  { Component } from "react";
import * as THREE from "three";
import waterVertexShader from './shaders/waves/vertex'
import waterFragmentShader from './shaders/waves/fragment'


class Waves extends Component {
	sizes = {
		width: window.innerWidth,
		height: window.innerHeight
	}
	mouse = new THREE.Vector2(0, 0)
	raycaster = new THREE.Raycaster()
	clock = new THREE.Clock()
	scene = new THREE.Scene()
	camera = new THREE.PerspectiveCamera(45, this.sizes.width / this.sizes.height, 0.1, 100)
	renderer = new THREE.WebGLRenderer()
	waterMaterial: any
	water: any
	off = false
	toDispose : any[] = []
	mouseListener : any
	resizeListener : any

	
  componentDidMount() {
		/**
		 * Water
		 */
		// Geometry
		const waterGeometry = new THREE.PlaneGeometry(8,6, 64, 64)
		this.toDispose.push(waterGeometry)

		// Material
		this.waterMaterial = new THREE.ShaderMaterial({
				vertexShader: waterVertexShader,
				fragmentShader: waterFragmentShader,
				uniforms:
				{
					uTime: { value: 0 },

					uMouse: { value: new THREE.Vector3(999, 999, 999)},
					
					uBigWavesElevation: { value: 0.05 },
					uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
					uBigWavesSpeed: { value: 0.75 },

					uSmallWavesElevation: { value: 0.1 },
					uSmallWavesFrequency: { value: 2 },
					uSmallWavesSpeed: { value: 0.2 },
					uSmallIterations: { value: 4 },

					uDepthColor: { value: new THREE.Color('#186691') },
					uSurfaceColor: { value: new THREE.Color('#9bd8ff') },
					uColorOffset: { value: 0.08 },
					uColorMultiplier: { value: 5 },
						
				},
				wireframe: true
		})
		this.toDispose.push(this.waterMaterial)

		// Mesh
		this.water = new THREE.Mesh(waterGeometry, this.waterMaterial)
		this.water.rotation.x = - Math.PI * 0.5
		this.scene.add(this.water)

		/**
		 * Sizes
		 */
		this.resizeListener = this.resize.bind(this)
		window.addEventListener('resize', this.resizeListener)

		// mouse
		this.mouseListener = this.mouseMove.bind(this)
		window.addEventListener('mousemove', this.mouseListener)

		/**
		 * Camera
		 */
		// Base camera
		this.camera.position.set(0, 1, 1)
		this.camera.lookAt(new THREE.Vector3(0,0.8,0))
		this.scene.add(this.camera)
		
		/**
		 * Renderer
		 */
		this.renderer.setSize(this.sizes.width, this.sizes.height)
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
		document.body.appendChild( this.renderer.domElement );
		
		/**
		 * Animate
		 */

		this.tick()
	}

	mouseMove(event: any) {
		this.mouse.x = event.clientX / this.sizes.width * 2 - 1
		this.mouse.y = - (event.clientY / this.sizes.height * 2 - 1)
	}

	resize() {
		// Update sizes
		this.sizes.width = window.innerWidth
		this.sizes.height = window.innerHeight

		// Update camera
		this.camera.aspect = this.sizes.width / this.sizes.height
		this.camera.updateProjectionMatrix()

		// Update renderer
		this.renderer.setSize(this.sizes.width, this.sizes.height)
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
	}

	tick() {
		if (this.off)
			return
		const elapsedTime = this.clock.getElapsedTime()

		this.raycaster.setFromCamera(this.mouse, this.camera)
		const intersect: any = this.raycaster.intersectObject(this.water)
		if (intersect['0'])
		{
			this.waterMaterial.uniforms.uMouse.value = intersect['0'].point
			// console.log(intersect['0'].point)
		}
		// Water
		this.waterMaterial.uniforms.uTime.value = elapsedTime

		// Render
		this.renderer.render(this.scene, this.camera)

		// Call tick again on the next frame
		window.requestAnimationFrame(this.tick.bind(this))
	}

	componentWillUnmount() {
		document.body.removeChild(this.renderer.domElement)
		window.removeEventListener('mousemove', this.mouseListener)
		window.removeEventListener('resize', this.resizeListener)
		this.off = true
		this.renderer.forceContextLoss()
		this.renderer.renderLists.dispose()
		this.renderer.dispose()
		for (const item of this.toDispose) {
			item.dispose()
		}
	}

	render() {
		return (
			<div/>
		)
	}
}
export default Waves;
