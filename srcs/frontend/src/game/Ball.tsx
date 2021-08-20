import * as THREE from "three";
import { Vector3 } from "three";
import { Game } from "./Game";
import { Player } from "./Player";
import { E_Player_type } from "./Enums";
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export class Ball {
	// VARIABILI GLOBALI
	transform!: THREE.Mesh;
	dir: Vector3 = new Vector3(0, 0, 0);
	vel!: number;
	game!: Game;
	lastCollision!: E_Player_type;
	radius!: number;
	hits: number = 1;
	death!: boolean;
	counter: number = 0;

	// COSTRUTTORE
	constructor(_game: Game, _death: boolean) {
		this.death = _death;
		this.game = _game;
		this.vel = this.game.vel;
		this.radius = 19.2;
		if (this.game.visual === "TRON")
		{
			this.transform = new THREE.Mesh(
				new THREE.TorusGeometry(this.radius * 2, 10, 16, 100),
				new THREE.MeshLambertMaterial({ color:0xf000ff})
			);
			const innerTorus = new THREE.Mesh(
				new THREE.TorusGeometry(this.radius * 1.5 , 10, 10, 3),
				new THREE.MeshLambertMaterial({ color:0x00fffb})
	
			)
			const ballLight= new THREE.PointLight(0xf000ff,3,1000,1)
			this.transform.add(ballLight)
			this.transform.add(innerTorus)
		}
		else if (this.game.visual === "CLASSIC")
		{
			this.transform = new THREE.Mesh(
				new THREE.SphereGeometry(this.radius, 25, 25),
				new THREE.MeshStandardMaterial({ color: "red" })
			);
		}
		else
		{
			this.transform = new THREE.Mesh(
				new THREE.SphereGeometry(this.radius, 25, 25),
				new THREE.MeshBasicMaterial({ color: "white" })
			);			
		}
		this.transform.name = 'ball';
		this.transform.castShadow = true;
		this.transform.geometry.computeBoundingSphere();
		this.game.scene.add(this.transform);		
	}

	start(lastPoint: E_Player_type) {
		
		const randomStart = THREE.MathUtils.randFloatSpread(0.1);

		if (lastPoint === E_Player_type.null) {
			this.dir = new Vector3(this.vel, randomStart, 0);
			this.lastCollision = E_Player_type.two;
			this.transform.position.x = 0;
			this.transform.position.y = 0;
			this.transform.position.z = 28.8;
			return;
		}
		else if (lastPoint === E_Player_type.one) {
			this.dir = new Vector3(-this.vel, randomStart, 0);
			this.lastCollision = E_Player_type.one;
			this.game.score_p2 += 1;
		}
		else if (lastPoint === E_Player_type.two) {
			this.dir = new Vector3(this.vel, randomStart, 0);
			this.lastCollision = E_Player_type.two;
			this.game.score_p1 += 1;
		}

		this.game.player_1.client?.emit("goal", {
			player_1: this.game.score_p1,
			player_2: this.game.score_p2,
			idGame: this.game.ID
		});

		this.hits = 0;
		this.transform.position.x = 0;
		this.transform.position.y = 0;
		this.transform.position.z = 28.8;

		if (this.game.score_p1 > 2 || this.game.score_p2 > 2) {
			this.game.game_time = this.game.clock.getElapsedTime();
			this.game.stop();
			return;
		}
	}

	update() {
		
		if (this.game.visual === "TRON")
		{
			this.counter += 1
			this.transform.rotation.x = Math.sin(this.counter * 2 ) / this.counter
			this.transform.rotation.z += 0.2
		}

		if (this.lastCollision !== E_Player_type.one && this.controlCollision(this, this.game.player_1)) {
			this.counter = 0;
			this.dir.x = -this.vel;
			const angle = (this.transform.position.y - this.game.player_1.transform.position.y) * 0.25;
			this.dir.y = angle;
			this.lastCollision = E_Player_type.one;
			if (this.death) {
				this.hits += 0.096;
				this.dir.x -= this.hits;
			}

			this.game.player_1.client?.emit("hit", {
				idGame: this.game.ID
			});
		}
		else if (this.lastCollision !== E_Player_type.two && this.controlCollision(this, this.game.player_2)) {
			this.counter = 0;
			this.dir.x = this.vel;
			const angle = (this.transform.position.y - this.game.player_2.transform.position.y) * 0.25;
			this.dir.y = angle;
			this.lastCollision = E_Player_type.two;
			if (this.death) {
				this.hits += 0.096;
				this.dir.x += this.hits;
			}

			this.game.player_1.client?.emit("hit", {
				idGame: this.game.ID
			});
		}

		if (this.transform.position.x >= 960)
			this.start(E_Player_type.one);
		else if (this.transform.position.x <= -960)
			this.start(E_Player_type.two);

		if (this.transform.position.y >= 470.4 || this.transform.position.y <= -470.4)
			this.dir.y *= -1;

		this.transform.position.x += (this.dir.x);
		this.transform.position.y += (this.dir.y);
	}

	controlCollision(object1: Ball, object2: Player) {
		if (this.transform.position.x < 768 && this.transform.position.x > -768)
			return false

		const _ball = object1.transform.geometry.boundingSphere!.clone().applyMatrix4(object1.transform.matrixWorld);

		const _player = object2.transform.geometry.boundingBox!.clone().applyMatrix4(object2.transform.matrixWorld);

		return _ball!.intersectsBox(_player!);
	}
}
