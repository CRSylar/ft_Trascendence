import * as THREE from "three";
import { Ball } from "./Ball"
import { Stadium } from "./Stadium";
import music1 from "./assets/believer.mp3"
import music2 from "./assets/heathens.mp3"
import music3 from "./assets/in_my_mind.mp3"
import musicTron from "./assets/tron_st.mp3"
import musicTron2 from "./assets/tron_st2.mp3"
import { Vector3 } from "three";
import { E_Game_status, E_Player_type } from "./Enums";
import { Player } from "./Player";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { navbarHeight } from "../config/config";
import * as dat from 'dat.gui'

const listMusic = [music1, music2, music3];
const listMusicTron = [musicTron, musicTron2];

export class Game {

	// VARIABILI GLOBALI
	seed!: number;
	ID!: string;
	analyser!: THREE.AudioAnalyser;
	music_camera!: boolean;
	sound!: THREE.Audio;
	game_status!: E_Game_status;
	scene!: THREE.Scene;
	player_type: E_Player_type = E_Player_type.null;
	player_1!: Player;
	player_2!: Player;
	ball!: Ball;
	stadium!: Stadium;
	renderer!: THREE.WebGLRenderer;
	camera!: THREE.PerspectiveCamera;
	camera_rotation_Y: number = 0.0;
	game_time: number = 0;
	camera_FOV_base: number = 35;
	camera_FOV_max: number = 45;
	camera_FOV: number = 35;
	ratio!: number;
	listener!: THREE.AudioListener;
	clock!: THREE.Clock;
	vel!: number;
	h!: number;
	w!: number;
	score_p1: number = 0;
	score_p2: number = 0;
	death!: boolean;
	resizeFunction!: any;
	visual!: string;
	renderScene!: RenderPass
	bloomPass!: any
	composer!: EffectComposer
	gui!: dat.GUI
	
	// SETUP
	constructor(_ID: string, _death: boolean, _music_camera: boolean, _visual: string, _seed : number, _scoreP1 : number, _scoreP2: number) {
		this.score_p1 = _scoreP1;
		this.score_p2 = _scoreP2;
		this.death = _death;
		this.music_camera = _music_camera;
		this.ID = _ID;
		this.seed = _seed;
		this.visual = _visual;
		this.w = 1920; //DONT TOUCH
		this.h = 1080; //DONT TOUCH
		this.ratio = 1.7777;
		this.camera = new THREE.PerspectiveCamera(this.camera_FOV, 2, 1, 3840);
		this.camera.lookAt(new Vector3(0, 0, 0));
		this.scene = new THREE.Scene();
		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: false,
			precision: "highp",
			powerPreference: "high-performance"
		});
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.renderer.setSize(window.innerWidth, (window.innerHeight - navbarHeight));
		document.body.getElementsByClassName("Damcont")[0].appendChild(this.renderer.domElement);
		this.stadium = new Stadium(this);
		this.vel = 19.2;
		this.player_1 = new Player(this, E_Player_type.one);
		this.player_2 = new Player(this, E_Player_type.two);
		this.ball = new Ball(this, this.death);
		this.listener = new THREE.AudioListener();
		this.camera.add(this.listener);
		this.sound = new THREE.Audio(this.listener);
		this.startPlaylist();

		this.resizeFunction = this.resizeScene.bind(this);
		window.addEventListener('resize', this.resizeFunction, true);

		if (this.visual === "TRON")
		{
			this.renderer.toneMapping = THREE.ReinhardToneMapping;
			this.renderScene = new RenderPass(this.scene, this.camera)
			this.bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
			this.bloomPass.threshold = 0;
			this.bloomPass.strength = 0.6;
			this.bloomPass.radius = 0.1;
			this.composer = new EffectComposer( this.renderer );
			this.composer.addPass( this.renderScene );
			this.composer.addPass( this.bloomPass );		
			this.renderer.outputEncoding = THREE.sRGBEncoding
			this.renderer.toneMapping = THREE.ReinhardToneMapping
		}
	}

	startPlaylist() {
		let music_selected;
		if (this.visual === "TRON")
			music_selected = listMusicTron[this.seed % listMusicTron.length];
		else
			music_selected = listMusic[this.seed % listMusic.length];

		this.clock = new THREE.Clock();
		new THREE.AudioLoader().load(music_selected, (buffer) => {
			this.sound.setBuffer(buffer);
			if (this.visual === "RETRO")
				this.sound.setVolume(0);
			else
				this.sound.setVolume(0.8);
			this.sound.play();
			this.clock.start();
		});
		this.analyser = new THREE.AudioAnalyser(this.sound, 1024);
	}

	start() {
		this.game_status = E_Game_status.play;
		this.ball.start(E_Player_type.null);

		this.draw();
	}

	stop() {
		this.player_1.client?.emit("finish", {
			score_p1: this.score_p1,
			score_p2: this.score_p2,
			idGame: this.ID
		});
        this.player_1.client?.emit("update-game-finish", {
            score_p1: this.score_p1,
            score_p2: this.score_p2,
            idGame: this.ID
        });
		this.game_status = E_Game_status.finish;
	}

	resizeScene() {
		this.renderer.setSize(window.innerWidth, (window.innerHeight - navbarHeight));
	}

	draw() {
		if (this.game_status === E_Game_status.play) {
			if (this.music_camera)
				this.move_camera_music();
			if (this.player_1.client)
				this.ball.update();
			this.player_1.update();
			this.player_2.update();
			this.player_1.client?.emit("ball", {
				pos: this.ball.transform.position,
				rot: this.ball.transform.rotation,
				dir: this.ball.dir,
				idGame: this.ID
			});
			if (this.visual === "TRON")
				this.composer.render()
			else
				this.renderer.render(this.scene, this.camera);
			requestAnimationFrame(() => this.draw());
		}
		else if (this.game_status === E_Game_status.finish) {
			this.fadeout_music();
			this.fadeout_ligth();

			if (this.camera_rotation_Y !== 0 && this.camera_FOV > this.camera_FOV_base)
				this.reset_camera();
			else if (this.visual !== "RETRO")
				this.camera_on_tab();

			if (this.visual === "TRON")
				this.composer.render()
			else
				this.renderer.render(this.scene, this.camera);
			requestAnimationFrame(() => this.draw());
		}
		else if (this.game_status === E_Game_status.exit) {
			return;
		}
	}

	move_camera_music() {
		const matrix_sound = this.analyser.getFrequencyData();
		if (matrix_sound[1] === 255 && matrix_sound[2]) {
			if ((this.camera_rotation_Y > -0.2 && -this.ball.dir.x < 0) || (this.camera_rotation_Y < 0.2 && -this.ball.dir.x > 0)) {
				this.camera.rotateY(-this.ball.dir.x * 0.0001);
				this.camera_rotation_Y += -this.ball.dir.x * 0.0001;
			}
			if (this.camera_FOV < this.camera_FOV_max) {
				this.camera_FOV += 0.025;
				this.camera.setFocalLength(this.camera_FOV);
			}
		}
		else {
			this.reset_camera();
		}
	}

	reset_camera() {
		if (this.camera_rotation_Y > 0.01) {
			this.camera.rotateY(-0.01);
			this.camera_rotation_Y -= 0.01;
		}
		else if (this.camera_rotation_Y < -0.01) {
			this.camera.rotateY(0.01);
			this.camera_rotation_Y += 0.01;
		}
		if (this.camera_FOV >= this.camera_FOV_base) {
			this.camera_FOV -= 1;
			this.camera.setFocalLength(this.camera_FOV);
		}
	}

	camera_on_tab() {
		if (this.visual === "CLASSIC")
		{
			if (this.camera.position.x > -768)
				this.camera.position.x -= 0.71;
			if (this.camera.position.y < 0)
				this.camera.position.y += 1.8;
			if (this.camera.position.z > 640)
				this.camera.position.z -= 1.2

			if (this.camera.rotation.x < 1.1)
				this.camera.rotateX(0.0005);

			if (this.camera.rotation.y < 0.5)
				this.camera.rotateY(0.0005);

			if (this.camera.rotation.z < 0.3)
				this.camera.rotateZ(0.0004)
		}
		else if (this.visual === "TRON")
		{
			if (this.camera.position.y < 0)
				this.camera.position.y += 1.8;
			if (this.camera.position.z > 640)
				this.camera.position.z -= 1.2

			if (this.camera.rotation.x < 0)
				this.camera.rotateX(0.0005);

			if (this.camera.rotation.y < 0)
				this.camera.rotateY(0.0005);

			if (this.camera.rotation.z < 0)
				this.camera.rotateZ(0.0004)		
		}
	}

	fadeout_music() {
		if (this.sound.getVolume() > 0.1)
			this.sound.setVolume(this.sound.getVolume() - 0.004);
	}

	fadeout_ligth() {
		if (this.visual === "CLASSIC")
		{
			if (this.stadium.amb_light.intensity > 0)
				this.stadium.amb_light.intensity -= 0.0005;
			if (this.stadium.dir_light.intensity > 0.5)
				this.stadium.dir_light.intensity -= 0.0005;
		}
	}
}
