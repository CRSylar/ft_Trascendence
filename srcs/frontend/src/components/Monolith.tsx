import {Component} from "react";
import * as THREE from 'three';
// import scores from './assets/scores.jpeg'
// import users from './assets/giovo.jpeg'
// import gsap from "gsap"
import sunVertexShader from './shaders/sun/vertex'
import sunFragmentShader from './shaders/sun/fragment'
import fieldVertexShader from './shaders/field/vertex'
import fieldFragmentShader from './shaders/field/fragment'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { navbarHeight } from "../config/config";



interface PMonolith {
  stop: boolean;
}


export class Monolith extends Component<PMonolith>{

	// utils
	scene = new THREE.Scene() ;
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth/(window.innerHeight - navbarHeight), 0.1, 400 );
	renderer = new THREE.WebGLRenderer({alpha: true});
	clock = new THREE.Clock()
	composer : any
	customUniforms = {
    uTime: { value: 0 }
	}
	off = false
	toDispose: any[] = []
	resizeListener : any
	mouseListener : any
	mouse = new THREE.Vector2(0, 0)
	sizes = {
		width: window.innerWidth,
		height: window.innerHeight
	}


	// meshes
	// monolith = new THREE.Mesh()
	fieldMaterial : any
	
	// pong
	// player1 = new THREE.Mesh()
	// player2 = new THREE.Mesh()
	// ball = new THREE.Mesh()

	// animations
	// ballX = 0.015
	// ballY = 0.015

	componentDidMount() {
		// camera
		this.camera.position.set(0,0,13)
		this.scene.add(this.camera)
		this.scene.fog = new THREE.Fog(0xf000ff , 10, 30) 
		
		// monolith
		// this.monolith.geometry = new THREE.BoxGeometry(5, 5, 5,16,16)
		// this.monolith.material = new THREE.MeshPhongMaterial({color: 0xf000ff, visible: false, shininess: 1, reflectivity: 5000, wireframe:false})
		// this.monolith.position.set(4, 0, 0)
		// this.monolith.rotation.y = -0.4
		// this.scene.add(this.monolith)

		// light
		const insidelight = new THREE.PointLight('white', 1)
		this.scene.add(insidelight)

		// sun
		const sun = new THREE.Mesh(new THREE.CircleGeometry(5, 120), new THREE.ShaderMaterial({
			vertexShader: sunVertexShader,
			fragmentShader: sunFragmentShader,
			uniforms: {
				uColor2: { value: new THREE.Color(0x00ffff)},
				uColor: { value: new THREE.Color(0xf000ff)}
			},
			transparent: true,
			// wireframe: true

		}))
		sun.position.set(0, 0, -10)
		this.scene.add(sun)
		const sunLight = new THREE.PointLight(0x00ffff, 15,0, )
		sun.add(sunLight)
		sunLight.position.y+=3
		this.toDispose.push(sun.geometry)
		this.toDispose.push(sun.material)
		
		// renderer
		this.setRenderer();

		// this.pongFace()
		// this.leaderboardFace()
		// this.chatFace()
		// this.userFace()
		this.createField()

		// post processing
		const renderScene = new RenderPass(this.scene, this.camera)
		const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 0.8, 0.1, 0.85 );
		bloomPass.threshold = 0.2;
		bloomPass.strength = 0.3;
		bloomPass.radius = 0.0;
		this.composer = new EffectComposer( this.renderer );
		this.composer.addPass( renderScene );
		this.composer.addPass( bloomPass );

		this.resizeListener = this.resize.bind(this)
		window.addEventListener('resize', this.resizeListener)

		// mouse
		this.mouseListener = this.mouseMove.bind(this)
		window.addEventListener('mousemove', this.mouseListener)

		this.animate()
	}

	createField() {
		const field = new THREE.Mesh()
		field.geometry = new THREE.PlaneGeometry(40, 20, 10, 10)
		let underfield = new THREE.Mesh(
			field.geometry,
			new THREE.MeshPhongMaterial({color: "black", shininess:1, reflectivity:100})
		)
		this.fieldMaterial = new THREE.ShaderMaterial({
				vertexShader: fieldVertexShader,
				fragmentShader: fieldFragmentShader,
				uniforms: {
					uColor: { value: new THREE.Color('#FA1D90')},
					uColor2: { value: new THREE.Color("#141414")},
					uTime: { value: 0 }
				},
				transparent: true
		})
		field.material = this.fieldMaterial
		this.fieldMaterial = new THREE.MeshPhongMaterial({color: "white", transparent: true })
		
		this.fieldMaterial.onBeforeCompile = (shader: any) =>
		{
				shader.uniforms.uTime = this.customUniforms.uTime
		
		
				shader.vertexShader = shader.vertexShader.replace(
						'void main() {',
						`
								varying vec2 vUv;
		
								void main() {
								vUv = uv;
						`
				)
				shader.fragmentShader = shader.fragmentShader.replace(
						'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
						`
							float y = step(0.97, abs(sin(vUv.y * 40.0 + uTime)));
							y += step(0.99, abs(sin(vUv.x * 80.0)));
							diffuseColor.a = clamp(diffuseColor.a, 0.0, y);
							gl_FragColor = vec4( outgoingLight, diffuseColor.a );
						`
				)

				shader.fragmentShader = shader.fragmentShader.replace(
					'uniform vec3 diffuse;',
					`
						varying vec2 vUv;
						uniform float uTime;
						uniform vec3 diffuse;
					`
			)
		}

		field.material = this.fieldMaterial
		field.rotation.x = - Math.PI / 2
		field.position.y = - 2.5
		field.add(underfield);
		this.toDispose.push(this.fieldMaterial)
		this.toDispose.push(field.geometry)
		this.toDispose.push(underfield.material)
		this.toDispose.push(underfield.geometry)
		this.scene.add(field)
	}

	mouseMove(event: any) {
		this.mouse.x = event.clientX / this.sizes.width * 2 - 1
		this.mouse.y = - (event.clientY / this.sizes.height * 2 - 1)
	}


/* 	pongFace() {
		// plane
		const pongPlane = new THREE.Mesh(
			new THREE.PlaneGeometry(4.9,4.9), 
			new THREE.MeshPhongMaterial({
				// color: "black", wireframe: true, shininess: 1, reflectivity: 50,
				visible: false
			}))
		pongPlane.position.z = 2.51
		this.monolith.add(pongPlane)

		// field
		const fieldBorder = new THREE.Mesh(new THREE.PlaneGeometry(3,1.8), new THREE.MeshBasicMaterial({color: "white"}))
		fieldBorder.position.z = 0.05
		pongPlane.add(fieldBorder)
		const fieldInside = new THREE.Mesh(new THREE.PlaneGeometry(2.9,1.7), new THREE.MeshBasicMaterial({color: "black"}))
		fieldInside.position.z = 0.1
		pongPlane.add(fieldInside)

		// players
		const playerGeometry = new THREE.PlaneGeometry(0.15, 0.6,)
		const playerMaterial = new THREE.MeshBasicMaterial()
		this.player1.geometry = playerGeometry
		this.player1.material = playerMaterial
		this.player1.position.z = 0.15
		this.player1.position.x = -1.20
		pongPlane.add(this.player1)

		this.player2.geometry = playerGeometry
		this.player2.material = playerMaterial
		this.player2.position.z = 0.15
		this.player2.position.x = 1.20
		pongPlane.add(this.player2)

		// ball
		this.ball.geometry = new THREE.CircleGeometry(0.1, 16)
		this.ball.material = new THREE.MeshBasicMaterial()
		this.ball.position.z = 0.15

		pongPlane.add(this.ball)
	}

	leaderboardFace() {

		const scoreTexture = new THREE.TextureLoader().load(scores)
		scoreTexture.repeat.set(1,1)
		
		// plane
		const scorePlane = new THREE.Mesh(new THREE.PlaneGeometry(4.9,4.9), 
			new THREE.MeshPhongMaterial({
				color: "black", 
				wireframe: true,
				reflectivity: 40,
				shininess: 1,
				visible: false
			}))
		scorePlane.rotation.y = Math.PI / 2
		scorePlane.position.x = 2.51
		this.monolith.add(scorePlane)

		// field
		const fieldBorder = new THREE.Mesh(new THREE.PlaneGeometry(3,4), new THREE.MeshBasicMaterial({color: "white"}))
		fieldBorder.position.z = 0.05
		scorePlane.add(fieldBorder)
		const fieldInside = new THREE.Mesh(new THREE.PlaneGeometry(2.9,3.9), new THREE.MeshBasicMaterial({color: "black" }))
		fieldInside.position.z = 0.06
		scorePlane.add(fieldInside)
		const leadertext = new THREE.Mesh(new THREE.PlaneGeometry(2.9,1.5), new THREE.MeshBasicMaterial({map: scoreTexture }))
		leadertext.position.z = 0.07
		scorePlane.add(leadertext)
	}

	chatFace() {

		//const chatTexture = new THREE.TextureLoader().load(chats)
		//chatTexture.repeat.set(1,1)
		// chatTexture.wrapS = THREE.RepeatWrapping
		// chatTexture.wrapT = THREE.RepeatWrapping

		// plane
		const chatPlane = new THREE.Mesh(
			new THREE.PlaneGeometry(4.9,4.9),
			new THREE.MeshPhongMaterial({
				// color: "black", 
				// wireframe: true, 
				// shininess: 1, 
				// reflectivity: 50,
				// visible: false
			}))
		chatPlane.rotation.y =  - Math.PI / 2
		chatPlane.position.x = -2.51
		this.monolith.add(chatPlane)

		// field
		const fieldBorder = new THREE.Mesh(new THREE.PlaneGeometry(2.5,2.2), new THREE.MeshBasicMaterial({color: "white"}))
		fieldBorder.position.z = 0.05
		chatPlane.add(fieldBorder)
		const fieldInside = new THREE.Mesh(new THREE.PlaneGeometry(2.4,2.1), new THREE.MeshBasicMaterial({color: "black"}))
		fieldInside.position.z = 0.1
		chatPlane.add(fieldInside)
		
		// messages
		// const msgGeometry = new THREE.PlaneGeometry(0.5, 0.2)
		// const msgMaterial = new THREE.MeshBasicMaterial({color: 'rgb(0,255,255)'})
		// this.msg1.geometry = msgGeometry
		// this.msg1.material = msgMaterial
		// this.msg1.position.set(-1, 2, 0.15)
		// chatPlane.add(this.msg1)

		// chatPlane.add(chattext)
	}

	userFace() {
		const userTexture = new THREE.TextureLoader().load(users)
		userTexture.repeat.set(1,1)
		// userTexture.wrapS = THREE.RepeatWrapping
		// userTexture.wrapT = THREE.RepeatWrapping

		// plane
		const userPlane = new THREE.Mesh(new THREE.PlaneGeometry(4.9,4.9, 42, 42), 
			new THREE.MeshPhongMaterial({
				color: "black", 
				wireframe: true, 
				shininess: 1, 
				reflectivity: 50,
				visible: false
			}))
		userPlane.rotation.y =   Math.PI 
		userPlane.position.z = -2.51
		this.monolith.add(userPlane)

		// field
		const fieldBorder = new THREE.Mesh(new THREE.PlaneGeometry(3,3), new THREE.MeshBasicMaterial({color: "white"}))
		fieldBorder.position.z = 0.05
		userPlane.add(fieldBorder)
		const fieldInside = new THREE.Mesh(new THREE.PlaneGeometry(2.9,2.9), new THREE.MeshBasicMaterial({color: "black" }))
		fieldInside.position.z = 0.06
		userPlane.add(fieldInside)
		const usertext = new THREE.Mesh(new THREE.PlaneGeometry(2.9,2.9), new THREE.MeshBasicMaterial({map: userTexture }))
		usertext.position.z = 0.07
		userPlane.add(usertext)

	}

	// mouseMove(event: any) {
	// 	this.mouse.x = ( (event.clientX - this.renderer.domElement.offsetLeft) / window.innerWidth ) * 2 - 1;
	// 	this.mouse.y = - ( (event.clientY - 22) / window.innerHeight) * 2 + 1;
	// }

	movePong(elapsedTime: number) {
		this.player1.position.y = Math.sin(elapsedTime) * 0.45
		this.player2.position.y = Math.cos(elapsedTime) * 0.45
		this.ball.position.x += this.ballX
		this.ball.position.y += this.ballY	
		if (this.ball.position.x > 1 || this.ball.position.x < -1)
			this.ballX *= -1
		if (this.ball.position.y > 0.7 || this.ball.position.y < - 0.7)
			this.ballY *= -1
	}
 */
	animate(){
		if (this.off)
			return
		const elapsedTime = this.clock.getElapsedTime()
		
		// this.monolith.rotation.y += 0.01
		
		// this.controller.update()
		// this.test.position.x = - 3 + this.mouse.x * 6
		// this.test.position.y = 1 + this.mouse.y * 2
		// this.plight.position.x = - 3 + this.mouse.x * 6
		// this.plight.position.y = 1 + this.mouse.y * 2

		this.camera.rotation.y = this.mouse.x * 0.01
		this.camera.rotation.x = this.mouse.y * 0.01
		
		// if (this.props.selected === 0)
		// this.movePong(elapsedTime)
		
		this.customUniforms.uTime.value = elapsedTime
		
		// this.renderer.render(this.scene, this.camera)
		if (!this.props.stop)
			this.composer.render()
		window.requestAnimationFrame(this.animate.bind(this));
	}
	
	// rotateCube(side: number) {
	// 	let rotation: number
	// 	switch(side) {
	// 		case 1:
	// 			rotation = Math.PI / 2 - 0.4
	// 			break;
	// 		case 2:
	// 			rotation = Math.PI -0.4
	// 			break;
	// 		case 3:
	// 			rotation = 3 * Math.PI / 2 - 0.4
	// 			break;
	// 		default:
	// 			rotation = 0 -0.4
	// 	}
	// 	gsap.to(this.monolith.rotation, { duration: 0.5, y: rotation})
	// }

	// componentDidUpdate(){
	// 	this.rotateCube(this.props.selected)
	// }

	
	setRenderer(){
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize( window.innerWidth , window.innerHeight - navbarHeight );
		document.body.appendChild( this.renderer.domElement );
		this.renderer.setClearColor("#141414")

	}

	resize() {
		// Update sizes
		this.sizes = { 
			width: window.innerWidth, 
			height: window.innerHeight - navbarHeight
		}
		
		// Update camera
		this.camera.aspect = this.sizes.width / this.sizes.height
		this.camera.updateProjectionMatrix()
		
		// Update renderer
		this.renderer.setSize(this.sizes.width, this.sizes.height)
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
	}
	
	componentWillUnmount() {
		document.body.removeChild(this.renderer.domElement)
		window.removeEventListener('resize', this.resizeListener)
		window.removeEventListener('mousemove', this.mouseListener)
		this.off = true
		this.renderer.forceContextLoss()
		this.renderer.renderLists.dispose()
		this.renderer.dispose()
		for (const item of this.toDispose) {
			item.dispose()
		}
	}

	render(){
		return(<div/>);
	}
}