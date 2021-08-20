import * as THREE from "three";
import { Game } from "./Game";
import { E_Player_type } from "./Enums";

export class Player {
	// VARIABILI GLOBALI
	transform!: THREE.Mesh;
	game!: Game;
	vel!: number;
	dir: number = 0;
	player_type!: E_Player_type;
	radius!: number;
	length!: number;
	key_move: string = "";
	client?: any;
	distanceCollision_pos!:number;
	distanceCollision_neg!:number;

	// COSTRUTTORE
	constructor(_game: Game, _player_type: E_Player_type) {
		this.game = _game;
		this.player_type = _player_type;
		this.vel = this.game.vel * 2;
		this.radius = this.game.w * 0.03;
		this.length = this.game.w * 0.1;
		if (this.game.visual === "TRON")
		{
			this.transform = new THREE.Mesh(
				new THREE.BoxGeometry(this.radius, this.length, this.radius),
				new THREE.MeshStandardMaterial({ color: 0x27e0fc })
			);	
		}
		else if (this.game.visual === "CLASSIC")
		{
			this.transform = new THREE.Mesh(
				new THREE.BoxGeometry(this.radius, this.length, this.radius, this.radius),
				new THREE.MeshStandardMaterial({ color: 0xfb8e00 })
			);		
		}
		else
		{
			this.transform = new THREE.Mesh(
				new THREE.BoxGeometry(this.radius, this.length, this.radius, this.radius),
				new THREE.MeshBasicMaterial({ color: 0xffffff })
			);			
		}
		this.transform.castShadow = true;
		this.transform.geometry.computeBoundingBox();
		this.game.scene.add(this.transform);
		this.distanceCollision_pos = this.game.w * 0.25 - this.length * 0.5;
		this.distanceCollision_neg = -this.game.w * 0.25 + this.length * 0.5;
		this.start();
	}

	setClient(_client: any) {
		this.client = _client;
	}

	start() {
		if (this.player_type === E_Player_type.one) {
			this.transform.position.z = this.game.w * 0.02;
			this.transform.position.x = this.game.w * 0.45;
			this.transform.position.y = 0;
		}
		else {
			this.transform.position.z = this.game.w * 0.02;
			this.transform.position.x = -this.game.w * 0.45;
			this.transform.position.y = 0;
		}
	}

	input(code: string, push: number) {
		if (this.key_move !== code && push === 1) {
			this.key_move = code;
			switch (code) {
				case "w":
				case "ArrowUp":
					this.dir = this.vel;
					break;
				case "s":
				case "ArrowDown":
					this.dir = this.vel * -1;
					break;
				default:
					break;
			}
		}
		else if (this.key_move === code && push === 0) {
			this.key_move = "";
		}
	}

	update() {
		if (this.transform.position.y + this.dir >= this.distanceCollision_pos ||
			this.transform.position.y + this.dir <= this.distanceCollision_neg) {
			this.dir = 0;
			return;
		}
		this.transform.translateY(this.dir)
		if (this.dir > 0 && this.key_move === "") {
			this.dir -= this.vel * 0.2;
			if (this.dir < 0)
				this.dir = 0;
		}
		else if (this.dir < 0 && this.key_move === "") {
			this.dir += this.vel * 0.2;
			if (this.dir > 0)
				this.dir = 0;
		}
	}

	resize() {

	}
}