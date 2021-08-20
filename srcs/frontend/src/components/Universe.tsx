import  { Component } from "react";
import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import terra from './../miky/terra.jpeg'
import sun_texture from './../miky/sun.jpeg'
import jupiter_texture from './../miky/juppiter.jpeg'
import moon_texture from './../miky/Moon.jpg'
import venus_texture from './../miky/venus.jpeg'
import mercury_texture from './../miky/mercury_texture.jpeg'
import mars_texture from './../miky/mars_texture.png'
import neptune_texture from './../miky/neptune_texture.jpeg'
import saturn_texture from './../miky/saturn_texture.jpeg'
import pluto_texture from './../miky/pluto_texture.jpeg'
import uranus_texture from './../miky/uranus_texture.jpeg'
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
// import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader";
import { navbarHeight } from "../config/config";




class Universe extends Component {
	renderer: any
	clickEvent: any
	keyEvent: any
	mouseEvent: any
	upEvent: any
	off= false

  componentDidMount() {
    // ==== THREE.JS CODE START ====
      const raycaster = new THREE.Raycaster();
      raycaster.params ={
          Mesh: {treshold:0.05},
          Line: { threshold: 0.01 },
          LOD: {},
          Points: { threshold: 0.01 },
          Sprite: {}
      }
      const mouse = new THREE.Vector2();
      let planetCounter=0;
      let stop:number = 0;
      let look:number=0;
      let EMPIRE_ROT:number = 0;
      let Empire_Vel:number = 0;
      let Empire_Vrot:number = 0;
      const onMouseMove = ( event:any ) => {

          // calculate mouse position in normalized device coordinates
          // (-1 to +1) for both components
          mouse.x = ( (event.clientX - this.renderer.domElement.offsetLeft) / window.innerWidth ) * 2 - 1;
          mouse.y = - ( (event.clientY- this.renderer.domElement.offsetTop) / window.innerHeight ) * 2 + 1;
      }
      function mouseClick ()
      {
          const intersects = raycaster.intersectObjects( scene.children );
          if(intersects[0] && intersects[0].object && intersects[0].object.name !== "Empire Star Destroyer"){

            alert(intersects[0].object.name);
          }
      }
			this.mouseEvent = onMouseMove.bind(this)
			this.clickEvent = mouseClick.bind(this)
			this.keyEvent = (e: any) =>{
				if(e.key ==="e"){
								EMPIRE_ROT = -0.01
						}
				else if(e.key ==="q"){
						EMPIRE_ROT = +0.01
				}
				else if (e.key === "w"){
						Empire_Vel=1;
				}
				else if(e.key ==="l"){
						look=1;
						planetCounter = (planetCounter === 9) ? 0 : planetCounter+1
				}
				else if (e.key === "g"){
					 look = look === 2 ? 0:2
						if(look === 0)
								scene.fog= new THREE.Fog("black",150)
				}
				else if (e.key === "m"){
						Empire_Vrot = 1
				}
				else if (e.key === "n"){
						Empire_Vrot = -1
				}
				else if(e.key === "r"){
						look = 0;
				}
			}
			this.upEvent = (e: any)=>{
				if(e.key ==="e"){
						EMPIRE_ROT = 0
				}
				else if(e.key ==="q"){
						EMPIRE_ROT = 0
				}
				else if (e.key === "w"){
						Empire_Vel=0;
				}
				else if (e.key === "m"){
						Empire_Vrot = 0
				}
				else if (e.key === "n"){
						Empire_Vrot = 0
				}
			}

      window.addEventListener( 'mousemove', this.mouseEvent );
      // let rotation : string;
      // rotation = '';
      window.addEventListener('click', this.clickEvent)
      window.addEventListener('keydown', this.keyEvent)
      window.addEventListener('keyup', this.upEvent)
      /*window.addEventListener('keypress', (e)=>{if(e.key === "s" ){
      //comando per allineare i pianeti!!
          let num = -100;
          stop = 1;
          scene.children.map((ob)=> {
              ob.position.x=0;
              ob.position.z = num
              num-=30;
          })
      }
      else if(e.key==="r"){
          stop = 0;
          look=0;

      }
      else if(e.key ==="l"){
          look=1;
          planetCounter = (planetCounter === 9) ? 0 : planetCounter+1

      }

      else
          console.log(e.key)});*/

      const texture_sun = new THREE.TextureLoader().load( sun_texture );
      const texture_earth = new THREE.TextureLoader().load( terra );
      const texture_jupiter = new THREE.TextureLoader().load( jupiter_texture );
      const texture_moon = new THREE.TextureLoader().load( moon_texture );
      const texture_venus = new THREE.TextureLoader().load( venus_texture);
      const texture_mercury = new THREE.TextureLoader().load( mercury_texture);
      const texture_mars = new THREE.TextureLoader().load( mars_texture);
      const texture_neptune = new THREE.TextureLoader().load( neptune_texture);
      const texture_saturn = new THREE.TextureLoader().load( saturn_texture);
      const texture_pluto = new THREE.TextureLoader().load( pluto_texture);
      const texture_uranus = new THREE.TextureLoader().load( uranus_texture);

      let TEXT:any
      // const textT = new THREE.FontLoader().load('fonts/helvetiker_regular.typeface.json', function ( font ) {

      //     const geometry = new THREE.TextGeometry( 'PORCACCIA!!', {
      //         font: font,
      //         size: 80,
      //         height: 5,
      //         curveSegments: 12,
      //         bevelEnabled: true,
      //         bevelThickness: 10,
      //         bevelSize: 8,
      //         bevelOffset: 0,
      //         bevelSegments: 5
      //     } );
      //     const TextMaterial = new THREE.MeshPhongMaterial({color:"white"})

      //     TEXT = new THREE.Mesh(geometry, TextMaterial)
      // })

      // const TextMaterial = new THREE.MeshPhongMaterial({color:"white"})



      let EmpireStarDestroyer_path = require('./../Stardest/Test.obj');
      // let EmpireStarDestroyer_material = require('./../Stardest/Test.mtl');
      let EmpireStarDestroyer:any

          const loaderObj = new OBJLoader();
          //loaderObj.setMaterials(mtl);
          loaderObj.load(EmpireStarDestroyer_path.default,function (cosa) {
              cosa.traverse((root:any)=>{

                  root.material = new THREE.MeshPhongMaterial({color:0x575655})
              })
              EmpireStarDestroyer = cosa;
              EmpireStarDestroyer.name = "Empire Star Destroyer"
          })
      let scene = new THREE.Scene();
      //scene.background = new THREE.Color(0xffffff);
      scene.fog= new THREE.Fog("black",150)
      //Camera
      let camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.01, 1000000 );
      camera.position.x = 180
      camera.position.y = 50;
      camera.position.z = 2000
      // Renderer
      this.renderer = new THREE.WebGLRenderer();
      this.renderer.setSize( window.innerWidth , window.innerHeight - navbarHeight);
      document.body.appendChild( this.renderer.domElement );

      //Controllo con Mouse
      let controller = new OrbitControls(camera, this.renderer.domElement);
      let sun_geometry = new THREE.SphereGeometry(17, 32, 100);
      let sun_material = new THREE.MeshBasicMaterial( {map:texture_sun} );
      let sun = new THREE.Mesh( sun_geometry, sun_material );
      sun.position.set(0,0,0)
      sun.name = "Sun"
      scene.add( sun );



      // Mercurio
      let geometry_mercury = new THREE.SphereGeometry(2, 32, 100);
      let material_mercury = new THREE.MeshPhongMaterial( {map:texture_mercury} );
      let mercury = new THREE.Mesh( geometry_mercury, material_mercury );
      mercury.name = "Mercury"
      mercury.position.set(22, 0, 0)
      scene.add( mercury );

      // Venere
      let geometry_venus = new THREE.SphereGeometry(3, 32, 100);
      let material_venus = new THREE.MeshPhongMaterial( {map:texture_venus} );
      let venus = new THREE.Mesh( geometry_venus, material_venus );
      venus.name="Venus";
      venus.position.set(30, 0, 0)

      // Terra
      let geometry_earth = new THREE.SphereGeometry(4, 32, 100);
      let material_earth = new THREE.MeshPhongMaterial( {map:texture_earth} );
      let earth = new THREE.Mesh( geometry_earth, material_earth );
      earth.position.set(50, 0, 0)
      earth.rotateZ(0.03);
      earth.name="Earth"

      scene.add( earth );

      // Luna
      let geometry_moon = new THREE.SphereGeometry(0.5, 32, 100);
      let material_moon = new THREE.MeshPhongMaterial( {map:texture_moon} );
      let moon = new THREE.Mesh( geometry_moon, material_moon );
      moon.position.set(55, 0, 0)
      moon.name="Moon"
      scene.add( moon );

      // Marte
      let geometry_mars = new THREE.SphereGeometry(1.1, 32, 100);
      let material_mars = new THREE.MeshPhongMaterial( {map:texture_mars} );
      let mars = new THREE.Mesh( geometry_mars, material_mars );
      mars.position.set(60, 0, 0)
      mars.name="Mars"
      scene.add( mars );

      // Giove
      let geometry_jupiter = new THREE.SphereGeometry(8, 32, 100);
      let material_jupiter = new THREE.MeshPhongMaterial( {map:texture_jupiter} );
      let jupiter = new THREE.Mesh( geometry_jupiter, material_jupiter );
      jupiter.position.set(90, 0, 0)
      jupiter.name ="Jupiter"
      scene.add( jupiter );
      venus.rotation.x = 90
      scene.add( venus );

      // Saturn
      let geometry_saturn = new THREE.SphereGeometry(7, 32, 100);
      let material_saturn = new THREE.MeshPhongMaterial( {map:texture_saturn} );
      let saturn = new THREE.Mesh( geometry_saturn, material_saturn );
      saturn.position.set(150, 0, 0)
      saturn.name="Saturn"
      scene.add( saturn );
      //saturn ring
      let geometry_saturn_ring = new THREE.RingGeometry(8, 10,100);
      let material_saturn_ring = new THREE.MeshPhongMaterial({color:0xffcc99});
      material_saturn_ring.side = THREE.DoubleSide
      let saturn_ring = new THREE.Mesh(geometry_saturn_ring, material_saturn_ring);
      saturn_ring.position.set(150, 0, 0)
      saturn_ring.rotation.x = -90
      saturn_ring.name = "Saturn Ring"
      scene.add(saturn_ring);
      // Uranus
      let geometry_uranus = new THREE.SphereGeometry(6, 32, 100);
      let material_uranus = new THREE.MeshPhongMaterial( {map:texture_uranus} );
      let uranus = new THREE.Mesh( geometry_uranus, material_uranus );
      uranus.position.set(170, 0, 0)
      uranus.name="Uranus"
      scene.add( uranus );

      // Neptune
      let geometry_neptune = new THREE.SphereGeometry(5, 32, 100);
      let material_neptune = new THREE.MeshPhongMaterial( {map:texture_neptune} );
      let neptune = new THREE.Mesh( geometry_neptune, material_neptune );
      neptune.position.set(185, 0, 0)
      neptune.name="Neptune"
      scene.add( neptune );

      // pluto
      let geometry_pluto = new THREE.SphereGeometry(1, 32, 100);
      let material_pluto = new THREE.MeshPhongMaterial( {map:texture_pluto} );
      let pluto = new THREE.Mesh( geometry_pluto, material_pluto );
      pluto.position.set(195, 0, 0)
      pluto.name = "Pluto"
      scene.add( pluto );

      //Point light
      let pLight= new THREE.PointLight("white", 0.8)
      pLight.position.set(0,0,0);
      scene.add(pLight);

      //Ambient light
      let ambientLight = new THREE.AmbientLight("white", 0.4);
      scene.add(ambientLight);


      let addStars = function (){
          for(let c=1; c<15;c++){

          for ( let z= -500; z < 500; z+=20 ) {

              let geometry   = new THREE.OctahedronGeometry(0.5)
              const colors = [0x00ccff, 0xffff00, 0xff00ff, 0xffffff, 0xffffff, 0xffffff, 0xffffff,  0xffffff,  0xffffff, 0xffffff]
              let material = new THREE.MeshBasicMaterial( {color: colors[Math.floor(Math.random() * (colors.length -1))]} );
              let sphere = new THREE.Mesh(geometry, material)

              sphere.position.x = Math.random() * 1000 - 500 ;
              sphere.position.x += (sphere.position.x > 200 || sphere.position.x < -130) ? 0 : (sphere.position.x <0 ? -100: 100);
              sphere.position.y = Math.random() * 1000 - 500;
              sphere.position.y += (sphere.position.y > 200 || sphere.position.y < -130) ? 0 :(sphere.position.y <0 ? -100: 100) ;
              sphere.position.z = z;
              sphere.scale.x = sphere.scale.y = 2;
              scene.add( sphere );
          }
          }
      }
        addStars()
      //alpha


      const theta_mercury = 3.1415926 /150;
      const theta_venus = 3.1415926 / 200;
      const theta_earth = 3.1415926 / 250;
      const theta_mars = 3.1415926 / 300;
      const theta_jupiter = 3.1415926 / 350;
      const theta_saturn = 3.1415926 / 400;
      const theta_uranus = 3.1415926 / 450;
      const theta_neptune = 3.1415926 / 500;
      const theta_pluto = 3.1415926 / 550;
      // const theta_EmpireStarDestroyer_mouse = 3.1415926 / 800;

      const theta_moon = 3.1415926 / 50;

      let alpha_mercury = theta_mercury;
      let alpha_venus = theta_venus;
      let alpha_earth = theta_earth;
      let alpha_jupiter = theta_jupiter;
      let alpha_mars = theta_mars;
      let alpha_neptune = theta_neptune;
      let alpha_saturn = theta_saturn;
      let alpha_pluto = theta_pluto;
      let alpha_moon = theta_moon
      let alpha_uranus = theta_uranus;

      // let alpha_EmpireStarDestroyer_mouse = theta_EmpireStarDestroyer_mouse;


      let moon_tmp_x = moon.position.x;
      let moon_tmp_z = moon.position.z;
      let saturnx
      let saturnz
      let intro = 0;
      let todo=1;
      let putIt=0
      let animate = () => {
				if (this.off)
					return
        requestAnimationFrame( animate );
          if(!stop){
              sun.rotation.y -= 0.01;

              earth.rotation.y += 0.01;
              earth.position.x += 50 * ((Math.cos(alpha_earth)) - (Math.cos(alpha_earth - theta_earth)));
              earth.position.z += 50 * 2 * (Math.sin(alpha_earth) - Math.sin(alpha_earth - theta_earth));
              alpha_earth += theta_earth;

              mars.rotation.y += 0.01;
              mars.position.x += 60 * ((Math.cos(alpha_mars)) - (Math.cos(alpha_mars - theta_mars)));
              mars.position.z += 60 * 2 * (Math.sin(alpha_mars) - Math.sin(alpha_mars - theta_mars));
              alpha_mars += theta_mars;

              jupiter.rotation.y += 0.01;
              jupiter.position.x += 90 * ((Math.cos(alpha_jupiter)) - (Math.cos(alpha_jupiter - theta_jupiter)));
              jupiter.position.z += 90 * 2 * (Math.sin(alpha_jupiter) - Math.sin(alpha_jupiter - theta_jupiter));
              alpha_jupiter += theta_jupiter;

              venus.rotation.y += 0.01;
              venus.position.x += 30 * ((Math.cos(alpha_venus)) - (Math.cos(alpha_venus - theta_venus)));
              venus.position.z += 30 * 2 * (Math.sin(alpha_venus) - Math.sin(alpha_venus - theta_venus));
              alpha_venus += theta_venus;

              mercury.rotation.y += 0.01;
              mercury.position.x += 22 * ((Math.cos(alpha_mercury)) - (Math.cos(alpha_mercury - theta_mercury)));
              mercury.position.z += 22 * 2 * (Math.sin(alpha_mercury) - Math.sin(alpha_mercury - theta_mercury));
              alpha_mercury += theta_mercury;

              neptune.rotation.y += 0.01;
              neptune.position.x += 185 * ((Math.cos(alpha_neptune)) - (Math.cos(alpha_neptune - theta_neptune)));
              neptune.position.z += 185 * 2 * (Math.sin(alpha_neptune) - Math.sin(alpha_neptune - theta_neptune));
              alpha_neptune += theta_neptune;

              pluto.rotation.y += 0.01;
              pluto.position.x += 195 * ((Math.cos(alpha_pluto)) - (Math.cos(alpha_pluto - theta_pluto)));
              pluto.position.z += 195 * 2 * (Math.sin(alpha_pluto) - Math.sin(alpha_pluto - theta_pluto));
              alpha_pluto += theta_pluto;

              uranus.rotation.y += 0.01;
              uranus.position.x += 170 * ((Math.cos(alpha_uranus)) - (Math.cos(alpha_uranus - theta_uranus)));
              uranus.position.z += 170 * 2 * (Math.sin(alpha_uranus) - Math.sin(alpha_uranus - theta_uranus));
              alpha_uranus += theta_uranus;

              saturn.rotation.y += 0.01;
              saturnx = 150 * ((Math.cos(alpha_saturn)) - (Math.cos(alpha_saturn - theta_saturn)));
              saturnz = 150 * 2 * (Math.sin(alpha_saturn) - Math.sin(alpha_saturn - theta_saturn));
              saturn.position.x += saturnx;
              saturn.position.z += saturnz;
              saturn_ring.position.x += saturnx;
              saturn_ring.position.z += saturnz;
              alpha_saturn += theta_saturn;

              moon.rotation.y -= 0.01;
              moon_tmp_x += (5 * ((Math.cos(alpha_moon)) - (Math.cos(alpha_moon - theta_moon)))) + (50 * ((Math.cos(alpha_earth)) - (Math.cos(alpha_earth - theta_earth))));
              moon_tmp_z += (5 * 1.3 * (Math.sin(alpha_moon) - Math.sin(alpha_moon - theta_moon))) + (50 * 2 * (Math.sin(alpha_earth) - Math.sin(alpha_earth - theta_earth)))
              moon.position.x = moon_tmp_x;
              moon.position.z = moon_tmp_z;
              alpha_moon += theta_moon;


              if(EmpireStarDestroyer)
              {
                  EmpireStarDestroyer.rotation.y += EMPIRE_ROT;
                  EmpireStarDestroyer.translateY(Empire_Vrot);
                  EmpireStarDestroyer.translateZ(Empire_Vel);
                  if(EMPIRE_ROT > 0 )
                      EmpireStarDestroyer.rotation.z -= (EmpireStarDestroyer.rotation.z < - 0.3) ? 0: 0.1
                  else if(EMPIRE_ROT < 0 )
                  EmpireStarDestroyer.rotation.z += (EmpireStarDestroyer.rotation.z >  0.3) ? 0: 0.1
                  else
                      if (EmpireStarDestroyer.rotation.z!== 0)
                      {
                          EmpireStarDestroyer.rotation.z += (Math.floor(EmpireStarDestroyer.rotation.z * 10) >  0) ? -0.01: 0.01
                          if (EmpireStarDestroyer.rotation.z < 0.01 || EmpireStarDestroyer.rotation.z > -0.01)
                              EmpireStarDestroyer.rotation.z = 0;
                      }
              }
          }
        if (!intro)
        {
            if(camera.position.z < 50)
                intro=1;
            camera.position.z-=15;
            camera.position.y+=1;
        }
          if( todo && EmpireStarDestroyer)
          {
              //console.log(EmpireStarDestroyer.scale)
              scene.add(EmpireStarDestroyer)
              EmpireStarDestroyer.position.set(50, 0,0)
              EmpireStarDestroyer.scale.x = 0.008;
              EmpireStarDestroyer.scale.y = 0.008;
              EmpireStarDestroyer.scale.z = 0.008;
              todo = 0;
          }

          if (putIt && TEXT)
          {
              scene.add(TEXT)
          }
          if (!look){
              if(EmpireStarDestroyer){EmpireStarDestroyer.remove(camera)}
              controller.update();
          }else if (look === 1)
          {
              let allPlanets = [saturn,earth,sun,moon,neptune,venus,pluto,uranus,mars, EmpireStarDestroyer]
              camera.position.z = allPlanets[planetCounter].position.z
              camera.lookAt(allPlanets[planetCounter].position)
          }
          else if (look === 2)
          {
              //camera.rotation.y -= 0.01;
              EmpireStarDestroyer.add(camera)
              camera.lookAt(EmpireStarDestroyer.position)
              scene.fog=null;
          }

          // update the picking ray with the camera and mouse position
          raycaster.setFromCamera( mouse, camera );

          // calculate objects intersecting the picking ray

          /*for ( let i = 0; i < intersects.length; i ++ ) {

              intersects[ i ].object.scale.set(0.1,0.1,0.1)

          }*/
        this.renderer.render( scene, camera );
    };
    animate();
  }
  render() {


      return (
      <div />
    )
  }

	componentWillUnmount() {
		this.off = true

		this.renderer.forceContextLoss()
		this.renderer.renderLists.dispose()
		this.renderer.dispose()

		window.removeEventListener('mousemove', this.mouseEvent)
		window.removeEventListener('click', this.clickEvent)
		window.removeEventListener('keydown', this.keyEvent)
		window.removeEventListener('keyup', this.upEvent)
	}
}
export default Universe;