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
    largeGroundMat.diffuseTexture = new Texture("textures/valleygrass.png");
    const largeGround = MeshBuilder.CreateGroundFromHeightMap("largeGround", "textures/villageheightmap.png", {width:150, height:150, subdivisions: 20, minHeight:0, maxHeight: 10});
    largeGround.material = largeGroundMat;
    return largeGround;
  }
  function createGround(scene: Scene){
    const groundMat = new StandardMaterial("groundMat");
    groundMat.diffuseTexture = new Texture("https://assets.babylonjs.com/environments/villagegreen.png");
    groundMat.diffuseTexture.hasAlpha = true;
    const ground = MeshBuilder.CreateGround("ground", {width:24, height:24});
    ground.material = groundMat;
    ground.position.y += 0.1;
    return ground;
  }
  function createSkybox(scene: Scene){
    const skybox = MeshBuilder.CreateBox("skyBox", {size:150}, scene);
    const skyboxMaterial = new StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
	  skyboxMaterial.reflectionTexture = new CubeTexture("textures/skybox", scene);
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
    boxMat.diffuseTexture = new Texture("textures/cubehouse.png");

    


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
  function createHouse(scene: Scene, box: Mesh, roof: Mesh){
    const house = Mesh.MergeMeshes([box,roof]);
    return house;
  }


  function createLight(scene: Scene) {
    const light = new HemisphericLight("hemiLight",new Vector3(-1,-2,-1),scene);
    light.intensity = 10;
    return light;
  }
  
  function createArcRotateCamera(scene: Scene) {
    let camAlpha = -Math.PI / 2,
      camBeta = Math.PI / 2.5,
      camDist = 30,
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
      ground?: Mesh;
      skybox?: Mesh;
      trees?: SpriteManager;
      box?: Mesh;
      roof?: Mesh;
      house?: Mesh;
    } 
    let that: SceneData = { scene: new Scene(engine) };
    //that.scene.debugLayer.show();

    that.terrain = createTerrain(that.scene);
    //that.ground = createGround(that.scene);
    that.trees = createTrees(that.scene);
    that.skybox = createSkybox(that.scene);

    that.house = createHouse(that.scene,createBox(this.scene),createRoof(this.scene)); 
    that.house.position = new Vector3(0,5,0);
    that.light = createLight(that.scene);
  
    that.camera = createArcRotateCamera(that.scene);

  
    return that;
  }