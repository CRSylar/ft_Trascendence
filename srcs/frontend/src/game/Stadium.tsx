import * as THREE from "three";
import { Vector3 } from "three";
import { Game } from "./Game";

export class Stadium {
	game!: Game;
	size_wall !: number;
	dir_light!: THREE.DirectionalLight;
	amb_light!: THREE.AmbientLight;
	tab_mesh!: THREE.Mesh;
	text_mesh?: THREE.Mesh;
	name_p1!: string;
	name_p2!: string;

	constructor(_game: Game) {
		this.game = _game;
		this.size_wall = this.game.w / 50;
		if (this.game.visual === "TRON")
			this.build_stadium_advance();
		else if (this.game.visual === "CLASSIC")
			this.build_stadium_base();
		else
			this.build_stadium_retro();
		
		this.update_score(this.game.score_p1, this.game.score_p2);
	}

	build_stadium_retro()
	{
		this.game.camera.position.z = this.game.w; 
		this.game.camera.position.y = 0;
		this.game.camera.lookAt(new Vector3(0, 0, 0));

		//BORDI CAMPO
		const lato_material = new THREE.MeshBasicMaterial({ color: 0xffffff })
		const lato_long = new THREE.BoxGeometry(this.game.w, this.size_wall, this.size_wall * 2);
		const lato_up_mesh = new THREE.Mesh(lato_long, lato_material);
		lato_up_mesh.position.y = this.game.w * 0.25 + this.size_wall * 0.5;
		lato_up_mesh.position.z = 0;
		this.game.scene.add(lato_up_mesh);

		const lato_down_mesh = lato_up_mesh.clone();
		lato_down_mesh.position.y = -(this.game.w * 0.25 + this.size_wall * 0.5);
		lato_down_mesh.position.z = 0;
		this.game.scene.add(lato_down_mesh);

		const lato_small = new THREE.BoxGeometry(this.size_wall, this.game.w * 0.5 + this.size_wall * 2, this.size_wall * 2);
		const lato_left_mesh = new THREE.Mesh(lato_small, lato_material);
		lato_left_mesh.position.y = 0;
		lato_left_mesh.position.x = this.game.w * 0.5 + this.size_wall * 0.5;
		lato_left_mesh.position.z = 0;
		this.game.scene.add(lato_left_mesh);

		const lato_rigth_mesh = lato_left_mesh.clone();
		lato_rigth_mesh.position.y = 0;
		lato_rigth_mesh.position.x = -(this.game.w * 0.5 + this.size_wall * 0.5);
		lato_rigth_mesh.position.z = 0;
		this.game.scene.add(lato_rigth_mesh);


		//LINEA CENTROCAMPO
		const middle_line = new THREE.PlaneGeometry(this.game.w / 100, this.game.w * 0.5);
		const middle_line_mesh = new THREE.Mesh(middle_line, lato_material);
		middle_line_mesh.position.z = 1;
		this.game.scene.add(middle_line_mesh);
	}

	build_stadium_base() {
		this.game.camera.position.z = this.game.w;
		this.game.camera.position.y = -this.game.w;
		this.game.camera.lookAt(new Vector3(0, this.game.w / 6, 0));
		this.amb_light = new THREE.AmbientLight(0xffffff, 0.5);
		this.game.scene.add(this.amb_light);
		this.dir_light = new THREE.DirectionalLight(0xffffff, 1);
		this.dir_light.position.set(this.game.w * 0.25, this.game.w * 0.25, this.game.w);
		this.dir_light.castShadow = true;
		this.dir_light.shadow.mapSize.width = this.game.w * 5;
		this.dir_light.shadow.mapSize.height = this.game.w * 5;
		this.dir_light.shadow.camera.near = 1;
		this.dir_light.shadow.camera.far = this.game.w * 2;
		this.dir_light.shadow.camera.left = -this.game.w;
		this.dir_light.shadow.camera.right = this.game.w;
		this.dir_light.shadow.camera.top = this.game.w * 0.5;
		this.dir_light.shadow.camera.bottom = -this.game.w * 0.5;
		this.game.scene.add(this.dir_light);

		//CAMPO
		const field = new THREE.PlaneGeometry(this.game.w, this.game.w * 0.5);
		const field_material = new THREE.MeshStandardMaterial({ color: 0x808080 })
		const field_mesh = new THREE.Mesh(field, field_material);
		field_mesh.castShadow = false;
		field_mesh.receiveShadow = true;
		this.game.scene.add(field_mesh);

		//BORDI CAMPO
		const lato_material = new THREE.MeshStandardMaterial({ color: 0xffffff })
		const lato_long = new THREE.BoxGeometry(this.game.w, this.size_wall, this.size_wall * 2);
		const lato_up_mesh = new THREE.Mesh(lato_long, lato_material);
		lato_up_mesh.position.y = this.game.w * 0.25 + this.size_wall * 0.5;
		lato_up_mesh.position.z = 0;
		lato_up_mesh.castShadow = true;
		lato_up_mesh.receiveShadow = true;
		this.game.scene.add(lato_up_mesh);

		const lato_down_mesh = lato_up_mesh.clone();
		lato_down_mesh.position.y = -(this.game.w * 0.25 + this.size_wall * 0.5);
		lato_down_mesh.position.z = 0;
		lato_down_mesh.castShadow = true;
		lato_down_mesh.receiveShadow = true;
		this.game.scene.add(lato_down_mesh);

		const lato_small = new THREE.BoxGeometry(this.size_wall, this.game.w * 0.5 + this.size_wall * 2, this.size_wall * 2);
		const lato_left_mesh = new THREE.Mesh(lato_small, lato_material);
		lato_left_mesh.position.y = 0;
		lato_left_mesh.position.x = this.game.w * 0.5 + this.size_wall * 0.5;
		lato_left_mesh.position.z = 0;
		lato_left_mesh.castShadow = true;
		lato_left_mesh.receiveShadow = true;
		this.game.scene.add(lato_left_mesh);

		const lato_rigth_mesh = lato_left_mesh.clone();
		lato_rigth_mesh.position.y = 0;
		lato_rigth_mesh.position.x = -(this.game.w * 0.5 + this.size_wall * 0.5);
		lato_rigth_mesh.position.z = 0;
		lato_rigth_mesh.castShadow = true;
		lato_rigth_mesh.receiveShadow = true;
		this.game.scene.add(lato_rigth_mesh);

		//FONDALE
		const background = new THREE.PlaneGeometry(this.game.w * 10, this.game.w * 5);
		const background_material = new THREE.MeshStandardMaterial({ color: 0x000909 });
		const background_mesh = new THREE.Mesh(background, background_material);
		background_mesh.position.z = -this.game.w * 0.01;
		background_mesh.castShadow = false;
		background_mesh.receiveShadow = false;
		this.game.scene.add(background_mesh);

		//LINEA CENTROCAMPO
		const middle_line = new THREE.PlaneGeometry(this.game.w / 100, this.game.w * 0.5);
		const middle_line_material = new THREE.MeshStandardMaterial({ color: 0xffffff });
		const middle_line_mesh = new THREE.Mesh(middle_line, middle_line_material);
		middle_line_mesh.castShadow = false;
		middle_line_mesh.receiveShadow = true;
		middle_line_mesh.position.z = 1;
		this.game.scene.add(middle_line_mesh);

		//SPALTI
		const stadium_material = new THREE.MeshStandardMaterial({ color: 0x808080 });
		const seat_long = new THREE.BoxGeometry(this.game.w - this.size_wall, this.game.w / 20, this.game.w / 20);
		const seat_up_mesh_01 = new THREE.Mesh(seat_long, stadium_material);
		seat_up_mesh_01.castShadow = true;
		seat_up_mesh_01.receiveShadow = true;
		seat_up_mesh_01.position.y = this.game.w / 3;
		this.game.scene.add(seat_up_mesh_01);
		const seat_up_mesh_02 = seat_up_mesh_01.clone();
		seat_up_mesh_02.castShadow = true;
		seat_up_mesh_02.receiveShadow = true;
		seat_up_mesh_02.position.y = this.game.w / 2.55;
		seat_up_mesh_02.position.z = this.game.w / 40;
		this.game.scene.add(seat_up_mesh_02);
		const seat_up_mesh_03 = seat_up_mesh_01.clone();
		seat_up_mesh_03.castShadow = true;
		seat_up_mesh_03.receiveShadow = true;
		seat_up_mesh_03.position.y = this.game.w / 2.2;
		seat_up_mesh_03.position.z = this.game.w / 20;
		this.game.scene.add(seat_up_mesh_03);

		//PUNTEGGIO
		const tab = new THREE.PlaneGeometry(this.game.w * 0.25, this.game.w / 8);
		const tab_material = new THREE.MeshStandardMaterial({ color: 0xffffff });
		this.tab_mesh = new THREE.Mesh(tab, tab_material);
		this.tab_mesh.castShadow = false;
		this.tab_mesh.receiveShadow = false;
		this.tab_mesh.rotateZ(Math.PI * 0.25);
		this.tab_mesh.rotateX(Math.PI * 0.5);
		this.tab_mesh.position.x = -this.game.w / 1.6;
		this.tab_mesh.position.y = this.game.w / 3.5;
		this.tab_mesh.position.z = this.game.w / 5;
		this.game.scene.add(this.tab_mesh);
		const column_01 = new THREE.CylinderGeometry(this.size_wall * 0.25, this.size_wall * 0.25, this.game.w / 3);
		const column_mesh_01 = new THREE.Mesh(column_01, stadium_material);
		column_mesh_01.rotateX(Math.PI * 0.5);
		column_mesh_01.position.x = -this.game.w / 1.4;
		column_mesh_01.position.y = this.game.w / 5;
		column_mesh_01.position.z = this.game.w / 10;
		this.game.scene.add(column_mesh_01);
		const column_mesh_02 = column_mesh_01.clone();
		column_mesh_02.position.x = -this.game.w / 1.85;
		column_mesh_02.position.y = this.game.w / 2.68;
		column_mesh_02.position.z = this.game.w / 10;
		this.game.scene.add(column_mesh_02);

		/// LIGHT TAB
		const dir_light_tab = new THREE.SpotLight(0xffffff, 1);
		dir_light_tab.position.set(-this.game.w * 0.5, this.game.w / 5, this.game.w / 6);
		dir_light_tab.target = this.tab_mesh;
		dir_light_tab.target.updateMatrixWorld();
		this.game.scene.add(dir_light_tab);
		//const helper = new THREE.SpotLightHelper( dir_light_tab, 5 );
		//this.game.scene.add( helper );
	}

	build_stadium_advance() {
		this.game.camera.position.z = this.game.w;
		this.game.camera.position.y = -this.game.w;
		this.game.camera.lookAt(new Vector3(0, this.game.w / 6, 0));
		this.amb_light = new THREE.AmbientLight(0xffffff, 0.5);
		this.game.scene.add(this.amb_light);

		const field = new THREE.PlaneGeometry(this.game.w, this.game.w * 0.5, 20, 10);
        const field_material = new THREE.MeshPhongMaterial({color:"black", shininess:1, reflectivity:50, wireframe:true
            }
        )
		const field_mesh = new THREE.Mesh(field, field_material);
		field_mesh.castShadow = false;
		field_mesh.receiveShadow = true;
		field_mesh.position.z-=35;
		this.game.scene.add(field_mesh);
		//BORDI CAMPO
		 const lato_material =  new THREE.MeshPhongMaterial({color:"black", shininess:1, reflectivity:100,side:THREE.DoubleSide,transparent:false
			 }
		 )
		 const lato_long = new THREE.BoxGeometry(this.game.w, this.size_wall, this.size_wall * 2);
		 const lato_up_mesh = new THREE.Mesh(lato_long, lato_material);
		 lato_up_mesh.position.y = this.game.h * 0.5 + this.size_wall ;
		 lato_up_mesh.position.z = 0;
		 lato_up_mesh.castShadow = true;
		 lato_up_mesh.receiveShadow = true;
		 this.game.scene.add(lato_up_mesh);

		 const lato_down_mesh = lato_up_mesh.clone();
		 lato_down_mesh.position.y = -(this.game.w * 0.25 + this.size_wall * 0.5);
		 lato_down_mesh.position.z = 0;
		 lato_down_mesh.castShadow = true;
		 lato_down_mesh.receiveShadow = true;
		this.game.scene.add(lato_down_mesh);

		 const lato_small = new THREE.BoxGeometry(this.size_wall, this.game.w * 0.5 + this.size_wall * 2, this.size_wall * 2);
		 const lato_left_mesh = new THREE.Mesh(lato_small, lato_material);
		 lato_left_mesh.position.y = 0;
		 lato_left_mesh.position.x = this.game.w * 0.5 + this.size_wall ;
		 lato_left_mesh.position.z = 0;
		 lato_left_mesh.castShadow = true;
		 lato_left_mesh.receiveShadow = true;
		 this.game.scene.add(lato_left_mesh);

		 const lato_rigth_mesh = lato_left_mesh.clone();
		 lato_rigth_mesh.position.y = 0;
		 lato_rigth_mesh.position.x = -(this.game.w * 0.5 + this.size_wall );
		 lato_rigth_mesh.position.z = 0;
		 lato_rigth_mesh.castShadow = true;
		 lato_rigth_mesh.receiveShadow = true;
		 this.game.scene.add(lato_rigth_mesh);

		//LINEA CENTROCAMPO
		const middle_line = new THREE.PlaneGeometry(this.game.w / 100, this.game.w * 0.5);
		const middle_line_material = new THREE.MeshStandardMaterial({ color:0x000000, refractionRatio:30, emissiveIntensity:1});
		const middle_line_mesh = new THREE.Mesh(middle_line, middle_line_material);
		middle_line_mesh.castShadow = false;
		middle_line_mesh.receiveShadow = true;
		middle_line_mesh.position.z = -35;
		this.game.scene.add(middle_line_mesh);

		// LINEE BORDO
		const line_material = new THREE.MeshPhongMaterial({ color: 0xe933ff, shininess: 1, reflectivity: 52 });
		const top_line = new THREE.PlaneGeometry( this.game.w * 0.955, this.game.w / 200);
		const top_line_mesh = new THREE.Mesh(top_line, line_material);
		top_line_mesh.castShadow = false;
		top_line_mesh.receiveShadow = true;
		top_line_mesh.position.z = -35.2;
		top_line_mesh.position.y = this.game.h / 2 * 0.95
		this.game.scene.add(top_line_mesh);

		const bottom_line_mesh = new THREE.Mesh(top_line, line_material);
		bottom_line_mesh.castShadow = false;
		bottom_line_mesh.receiveShadow = true;
		bottom_line_mesh.position.z = -35.2;
		bottom_line_mesh.position.y = -this.game.h / 2 * 0.95
		this.game.scene.add(bottom_line_mesh);

		const left_line = new THREE.PlaneGeometry( this.game.w / 200, this.game.h * 0.955, );
		const left_line_mesh = new THREE.Mesh(left_line, line_material);
		left_line_mesh.castShadow = false;
		left_line_mesh.receiveShadow = true;
		left_line_mesh.position.z = -35.2;
		left_line_mesh.position.x = -this.game.w / 2 * 0.95
		this.game.scene.add(left_line_mesh);

		const right_line_mesh = new THREE.Mesh(left_line, line_material);
		right_line_mesh.castShadow = false;
		right_line_mesh.receiveShadow = true;
		right_line_mesh.position.z = -35.2;
		right_line_mesh.position.x = this.game.w / 2 * 0.95
		this.game.scene.add(right_line_mesh);


		//Cerchi concentrici
		const cirMat3=new THREE.MeshLambertMaterial({ color: 0x00fffb });
		const centerCircleGeo= new THREE.CircleGeometry(70)
		const cirMat=new THREE.MeshLambertMaterial({ color: 0xffffff , emissive:0xe933ff, emissiveIntensity:1});
		const centerCirlce= new THREE.Mesh(centerCircleGeo,cirMat);
		centerCirlce.position.z-=25;
		this.game.scene.add(centerCirlce)

		const centerCircleGeo2= new THREE.CircleGeometry(65)
		const cirMat2=new THREE.MeshStandardMaterial({ color: "black" });
		const centerCirlce2= new THREE.Mesh(centerCircleGeo2,cirMat2);
		centerCirlce2.position.z-=24;
		this.game.scene.add(centerCirlce2)

		const centerCircleGeo3= new THREE.CircleGeometry(200)

		const centerCirlce3= new THREE.Mesh(centerCircleGeo3,cirMat3);
		centerCirlce3.position.z-=37;
		this.game.scene.add(centerCirlce3)

		const centerCircleGeo4= new THREE.CircleGeometry(180)
		const cirMat4=new THREE.MeshStandardMaterial({ color: 0x000000, refractionRatio:30 });
		const centerCirlce4= new THREE.Mesh(centerCircleGeo4,cirMat4);
		centerCirlce4.position.z-=33;
		this.game.scene.add(centerCirlce4)

		//megacircle
		const megaTorus_geo = new THREE.TorusGeometry(1600,5,8,8,);
		const megaTorus_Mat = new THREE.MeshStandardMaterial({color:0xe933ff, emissiveIntensity:200})
		const megaTorus_ = new THREE.Mesh(megaTorus_geo,megaTorus_Mat);
		this.game.scene.add(megaTorus_)
	}

	addNames(name_1: string, name_2: string) {
		this.name_p1 = name_1;;
		this.name_p2 = name_2;
		new THREE.FontLoader().load('https://threejsfundamentals.org/threejs/resources/threejs/fonts/helvetiker_regular.typeface.json', (font) => {
			const text = new THREE.TextGeometry(this.name_p1, {
				font: font,
				size: this.game.w / 25,
				height: 0,
				curveSegments: 5,
				bevelEnabled: true,
				bevelThickness: this.game.w / 500,
				bevelSize: this.game.w / 500,
				bevelOffset: 0,
				bevelSegments: 5
			});
			text.center();
			let material;
			if (this.game.visual === "RETRO")
				material = new THREE.MeshBasicMaterial({ color: 0xffffff });
			else
				material = new THREE.MeshStandardMaterial({ color: 0x707070 });
			const name_1_mesh = new THREE.Mesh(text, material);
			name_1_mesh.position.x = this.game.w * 0.25;
			name_1_mesh.position.y = -this.game.w / 5;
			this.game.scene.add(name_1_mesh);
		});

		new THREE.FontLoader().load('https://threejsfundamentals.org/threejs/resources/threejs/fonts/helvetiker_regular.typeface.json', (font) => {
			const text = new THREE.TextGeometry(this.name_p2, {
				font: font,
				size: this.game.w / 25,
				height: 0,
				curveSegments: 5,
				bevelEnabled: true,
				bevelThickness: this.game.w / 500,
				bevelSize: this.game.w / 500,
				bevelOffset: 0,
				bevelSegments: 5
			});
			text.center();
			let material;
			if (this.game.visual === "RETRO")
				material = new THREE.MeshBasicMaterial({ color: 0xffffff });
			else
				material = new THREE.MeshStandardMaterial({ color: 0x707070 });
			const name_2_mesh = new THREE.Mesh(text, material);
			name_2_mesh.position.x = -this.game.w * 0.25;
			name_2_mesh.position.y = -this.game.w / 5;
			this.game.scene.add(name_2_mesh);
		});
	}

	update_score(score_1: number, score_2: number) {
		if (this.text_mesh)
			this.game.scene.remove(this.text_mesh)
		if (this.game.visual === "RETRO")
		{
			new THREE.FontLoader().load('https://threejsfundamentals.org/threejs/resources/threejs/fonts/helvetiker_regular.typeface.json', (font) => {
				const text = new THREE.TextGeometry(score_2.toString() + '     ' + score_1.toString(), {
					font: font,
					size: this.game.w / 18,
					height: this.game.w / 100,
					curveSegments: 5,
					bevelEnabled: true,
					bevelThickness: this.game.w / 500,
					bevelSize: this.game.w / 500,
					bevelOffset: 0,
					bevelSegments: 5
				});
				text.center();
				const material = new THREE.MeshBasicMaterial({ color: 0xffffff })
				this.text_mesh = new THREE.Mesh(text, material);
				this.text_mesh.position.x = 0;
				this.text_mesh.position.y = this.game.w * 0.2;
				this.game.scene.add(this.text_mesh);
			});
		}
		else if (this.game.visual === "TRON")
		{
			new THREE.FontLoader().load('https://threejsfundamentals.org/threejs/resources/threejs/fonts/helvetiker_regular.typeface.json', (font) => {
				const text = new THREE.TextGeometry(score_2.toString() + '     ' + score_1.toString(), {
					font: font,
					size: this.game.w / 18,
					height: this.game.w / 100,
					curveSegments: 5,
					bevelEnabled: true,
					bevelThickness: this.game.w / 500,
					bevelSize: this.game.w / 500,
					bevelOffset: 0,
					bevelSegments: 5
				});
				text.center();
				const material = new THREE.MeshBasicMaterial({ color: 0xffffff })
				this.text_mesh = new THREE.Mesh(text, material);
				this.text_mesh.position.x = 0;
				this.text_mesh.position.y = this.game.w * 0.4;
				this.text_mesh.rotateX(Math.PI * 0.25);
				this.game.scene.add(this.text_mesh);
			});
		}
		else if (this.game.visual === "CLASSIC")
		{

			//console.log("TYPE = ", this.game.visual)
			new THREE.FontLoader().load('https://threejsfundamentals.org/threejs/resources/threejs/fonts/helvetiker_regular.typeface.json', (font) => {
				const text = new THREE.TextGeometry(score_2.toString() + '  -  ' + score_1.toString(), {
					font: font,
					size: this.game.w / 20,
					height: this.game.w / 300,
					curveSegments: 5,
					bevelEnabled: true,
					bevelThickness: this.game.w / 500,
					bevelSize: this.game.w / 500,
					bevelOffset: 0,
					bevelSegments: 5
				});
				text.center();	
				const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
				this.text_mesh = new THREE.Mesh(text, material);
				this.text_mesh.position.x = -this.game.w / 1.6;
				this.text_mesh.position.y = this.game.w / 3.45;
				this.text_mesh.position.z = this.game.w / 5.2;
				this.text_mesh.rotateZ(Math.PI * 0.25);
				this.text_mesh.rotateX(Math.PI * 0.5);
				this.game.scene.add(this.text_mesh);
			});
		}
	}
}
