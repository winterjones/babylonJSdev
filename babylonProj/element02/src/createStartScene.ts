// ------ TOP [Imports] ------
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import {
    Scene,
    ArcRotateCamera,
    Vector3,
    HemisphericLight,
    MeshBuilder,
    Mesh,
    Camera,
    Engine,
    StandardMaterial,
    Color3,
    Texture,
    CubeTexture,
    SpriteManager,
    Sprite,
    Vector4,
  } from "@babylonjs/core";
import { colorCorrectionPixelShader } from "@babylonjs/core/Shaders/colorCorrection.fragment";
import { Color3LineComponent } from "@babylonjs/inspector/lines/color3LineComponent";
import { sceneUboDeclaration } from "@babylonjs/core/Shaders/ShadersInclude/sceneUboDeclaration";
  // ----------------------------------
  
  // ----- MIDDLE [Functions] ------
  function createTerrain(scene: Scene){
    //Create large ground for valley environment    
    const largeGroundMat = new StandardMaterial("largeGroundMat");
    largeGroundMat.diffuseTexture = new Texture("assets/valleygrass.png");
    const largeGround = MeshBuilder.CreateGroundFromHeightMap("largeGround", "assets/villageheightmap.png", {width:150, height:150, subdivisions: 20, minHeight:0, maxHeight: 10});
    largeGround.material = largeGroundMat;
    return largeGround;
  }
  function createSkybox(scene: Scene){
    const skybox = MeshBuilder.CreateBox("skyBox", {size:150}, scene);
    const skyboxMaterial = new StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
	  skyboxMaterial.reflectionTexture = new CubeTexture("assets/skybox", scene);
	  skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
	  skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
	  skyboxMaterial.specularColor = new Color3(0, 0, 0);
	  skybox.material = skyboxMaterial;

    return skybox;
  }
  function createTrees(scene: Scene) {
    const spriteManagerTrees = new SpriteManager("treesManager", 
   "textures/palmtree.png", 2000, {width: 512, height: 1024}, scene);
    //We create trees at random positions
    for (let i = 0; i < 500; i++) {
    const tree = new Sprite("tree", spriteManagerTrees);
    tree.position.x = Math.random() * (-30);
    tree.position.z = Math.random() * 20 + 8; 
    tree.position.y = 0.5; 
    } 
    for (let i = 0; i < 500; i++) {
    const tree = new Sprite("tree", spriteManagerTrees);
    tree.position.x = Math.random() * (25) + 7; 
    tree.position.z = Math.random() * -35 + 8; 
    tree.position.y = 0.5; 
    } 
    return spriteManagerTrees;
  }
  function createBox(scene: Scene){
    const faceUV: Vector4[] = [];

    faceUV[0] = new Vector4(0.5, 0.0, 0.75, 1.0); //rear face
    faceUV[1] = new Vector4(0.0, 0.0, 0.25, 1.0); //front face
    faceUV[2] = new Vector4(0.25, 0, 0.5, 1.0); //right side
    faceUV[3] = new Vector4(0.75, 0, 1.0, 1.0); //left side
    
    const box = MeshBuilder.CreateBox("box", {faceUV: faceUV, wrap: true},scene);
    box.position.y = 6.66;
    box.position.x = -3;
    box.position.z = -2;
    const boxMat = new StandardMaterial("boxMat");
    boxMat.diffuseTexture = new Texture("assets/cubehouse.png");
    box.material = boxMat;
    return box;
  }
  function createRoof(scene: Scene){
    const roof: Mesh = MeshBuilder.CreateCylinder("roof", {diameter: 1.3, height: 1.2, tessellation: 3},scene);
    roof.scaling.x = 0.75;
    roof.rotation.z = Math.PI / 2;
    roof.position.y = 7.36;
    roof.position.x = -3;
    roof.position.z = -2;
    const roofMat = new StandardMaterial("roofMat");
    roofMat.diffuseTexture = new Texture("https://assets.babylonjs.com/environments/roof.jpg");
    roof.material = roofMat;    
    return roof;
  }
  function createHouse(scene: Scene){
    const box = createBox(scene);
    const roof = createRoof(scene);
    const house: any = Mesh.MergeMeshes([box, roof], true, false, undefined, false, true);

    return house;
  }
  function cloneHouse(scene: Scene) {
    const detached_house = createHouse(scene); //.clone("clonedHouse");
    detached_house.rotation.y = -6;
    detached_house.position.x = -3;
    detached_house.position.z = -2;
    detached_house.position.y = -6;

    const semi_house = createHouse(scene); //.clone("clonedHouse");
    semi_house.rotation.y = -6;
    semi_house.position.x = -3;
    semi_house.position.z = -2;
    semi_house.position.y = -6;

    //each entry is an array [house type, rotation, x, z]
    const places: number[] [] = []; 
    places.push([1, -Math.PI / 16, 15, 10 ]);
    places.push([2, -Math.PI / 16, -12, 10 ]);
    places.push([2, -Math.PI / 16, 18, 13 ]);
    places.push([2, -Math.PI / 16, 18, 15 ]);
    places.push([2, 15 * Math.PI / 16, 18, 20 ]);
    places.push([1, 15 * Math.PI / 16, 18, 10 ]);
    places.push([2, 15 * Math.PI / 16, 18, 14 ]);
    places.push([1, 5 * Math.PI / 16, 18, 18 ]);
    places.push([1, Math.PI + Math.PI / 16, 12, -13 ]);
    places.push([2, Math.PI + Math.PI / 16, -20, -16 ]);
    places.push([1, Math.PI + Math.PI / 16, 16, -10]);
    places.push([2, Math.PI / 16, -20, -10 ]);
    places.push([1, Math.PI / 16, -23, -10 ]);
    places.push([2, Math.PI / 16, 20, -10 ]);
    places.push([1, Math.PI / 16, 23, -13 ]);
    places.push([2, -Math.PI / 16, 30, -16 ]);
    places.push([1, -Math.PI / 16, 26, -10 ]);

    const houses: Mesh[] = [];
    for (let i = 0; i < places.length; i++) {
      if (places[i][0] === 1) {
          houses[i] = detached_house.createInstance("house" + i);
      }
      else {
          houses[i] = semi_house.createInstance("house" + i);
      }
        houses[i].rotation.y = places[i][1];
        houses[i].position.x = places[i][2];
        houses[i].position.z = places[i][3];
    }

    return houses;
  }

  function createLight(scene: Scene) {
    const light = new HemisphericLight("hemiLight",new Vector3(-1,-2,-1),scene);
    light.intensity = 10;
    return light;
  }
  
  function createArcRotateCamera(scene: Scene) {
    let camAlpha = -Math.PI / 2,
      camBeta = Math.PI / 3.5,
      camDist = 35,      
      camTarget = new Vector3(0, 0, 0);
    let camera = new ArcRotateCamera(
      "camera1",
      camAlpha,
      camBeta,
      camDist,
      camTarget,
      scene,
    );    
    camera.upperBetaLimit = Math.PI / 2.2;
    camera.upperRadiusLimit = 35;
    camera.lowerRadiusLimit = 20;
    camera.attachControl(true);
    return camera;
  }
  

  //------------------------------------------------

  //----- BOTTOM [Rendering] ------
  export default function createStartScene(engine: Engine) {
    interface SceneData {
      scene: Scene;     
      light?: HemisphericLight;
      camera?: Camera;   
      //
      terrain?: Mesh;
      skybox?: Mesh;
      trees?: SpriteManager;
      box?: Mesh;
      roof?: Mesh;
      house?: any;
      hillHouse?: any;
    } 
    let that: SceneData = { scene: new Scene(engine) };

    that.terrain = createTerrain(that.scene);
    that.trees = createTrees(that.scene);
    that.skybox = createSkybox(that.scene);
    that.house = cloneHouse(that.scene);
    that.hillHouse = createHouse(that.scene);
    that.hillHouse.scaling = new Vector3(2,2,2);
    that.hillHouse.position = new Vector3(3,-6.5,2);
    that.light = createLight(that.scene);  
    that.camera = createArcRotateCamera(that.scene);
  
    return that;
  }