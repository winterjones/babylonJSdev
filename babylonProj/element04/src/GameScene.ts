// ------ TOP [Imports] ------
import setSceneIndex from "./index";
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
    SceneLoader,
    ActionManager,
    ExecuteCodeAction,
    AnimationPropertiesOverride,
    FollowCamera,
    PhysicsAggregate,
    PhysicsShapeType,
    Light,
    Sound,
  } from "@babylonjs/core";

  import * as GUI from "@babylonjs/gui";

 // ------ havok initialisation ------
  import HavokPhysics from "@babylonjs/havok"; 
  import { HavokPlugin } from "@babylonjs/core"; 

  let initializedHavok; 
  HavokPhysics().then((havok) => { 
   initializedHavok = havok; 
  });
  const havokInstance = await HavokPhysics();
  const havokPlugin = new HavokPlugin(true, havokInstance);
   
  globalThis.HK = await HavokPhysics();
  //------ end hk ------

  // ----- MIDDLE [Functions] ------
  let keyDownMap: any[] = []
  

  function importPlayerMesh(scene: Scene, collider: Mesh, x: number, y: number) {
    let tempItem = { flag: false } 
    let item: any = SceneLoader.ImportMesh("", "./models/", "dummy3.babylon", scene, function(newMeshes, particleSystems, skeletons) {
    let mesh = newMeshes[0];
    let skeleton = skeletons[0];
    skeleton.animationPropertiesOverride = new AnimationPropertiesOverride();
    skeleton.animationPropertiesOverride.enableBlending = true; 
    skeleton.animationPropertiesOverride.blendingSpeed = 0.05; 
    skeleton.animationPropertiesOverride.loopMode = 1; 
    let walkRange: any = skeleton.getAnimationRange("YBot_Walk");
    // let runRange: any = skeleton.getAnimationRange("YBot_Run");
    // let leftRange: any = skeleton.getAnimationRange("YBot_LeftStrafeWalk");
    // let rightRange: any = skeleton.getAnimationRange("YBot_RightStrafeWalk");
    //let idleRange: any = skeleton.getAnimationRange("YBot_Idle")

    let animating: boolean = false;
    scene.onBeforeRenderObservable.add(()=> { 
      let keydown: boolean = false;
      
      if(keyDownMap["w"] || keyDownMap["ArrowUp"]){
        mesh.position.z += 0.1; 
        mesh.rotation.y = 0; 
        keydown = true;
      } 
      if(keyDownMap["a"] || keyDownMap["ArrowLeft"]){
        mesh.position.x -= 0.1; 
        mesh.rotation.y = 3 * Math.PI / 2; 
        keydown = true;
      } 
      if(keyDownMap["s"] || keyDownMap["ArrowDown"]){
        mesh.position.z -= 0.1; 
        mesh.rotation.y = 2 * Math.PI / 2; 
        keydown = true;
      } 
      if(keyDownMap["d"] || keyDownMap["ArrowRight"]){
        mesh.position.x += 0.1; 
        mesh.rotation.y = Math.PI / 2; 
        keydown = true;
      } 
      if (keydown) {
        if (!animating) {
        animating = true; 
        scene.beginAnimation(skeleton, walkRange.from, walkRange.to, true);
        } 
       } else { 
        animating = false; 
        scene.stopAnimation(skeleton);
       }
       //collision check
       if (mesh.intersectsMesh(collider)) {

       } 
      }      

      
      );    
      item = mesh; 
      let playerAggregate = new PhysicsAggregate(item, PhysicsShapeType.CAPSULE, { mass: 0}, scene);
      playerAggregate.body.disablePreStep = false;
    });

    return item; 
  }


  function actionManager(scene: Scene){
    scene.actionManager = new ActionManager(scene);
    scene.actionManager.registerAction( 
      new ExecuteCodeAction( 
        { 
        trigger: ActionManager.OnKeyDownTrigger, 
        //parameters: 'w' 
        },
        function(evt) {keyDownMap[evt.sourceEvent.key] = true; }
      ) 
    );
    scene.actionManager.registerAction( 
      new ExecuteCodeAction( 
    { 
      trigger: ActionManager.OnKeyUpTrigger
    
    },
      function(evt) {keyDownMap[evt.sourceEvent.key] = false; }
      ) 
    );
    return scene.actionManager; 
   }
 

  function createBox(scene: Scene, position: Vector3){
    let box: Mesh = MeshBuilder.CreateBox("box", {size: 1}, scene);
    box.position = position;
    const boxAggregate = new PhysicsAggregate(box, PhysicsShapeType.BOX, { mass: 1 }, scene);
    return box; 
   } 
  
  function createGround(scene: Scene, position: Vector3, rotation: Vector3) {
    let ground = MeshBuilder.CreateGround("ground", { width: 10, height: 10, subdivisions: 4 },scene,);
    const groundAggregate = new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, scene);

    let groundMaterial = new StandardMaterial("ground", scene);
	  groundMaterial.specularColor = new Color3(0, 0, 0);

    ground.position = position;
    ground.rotation = rotation;
    ground.material = groundMaterial;
    ground.receiveShadows = true;
    return ground;
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
    camera.attachControl(false);
    return camera;
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
  function createLight(scene: Scene) {
    const light = new HemisphericLight("hemiLight",new Vector3(-1,-2,-1),scene);
    light.intensity = 2;
    return light;
  }
  //------------------------------------------------

  //----- BOTTOM [Rendering] ------
  export default function GameScene(engine: Engine) {
    interface SceneData {
      scene: Scene;     
      light?: Light;
      camera?: ArcRotateCamera;   
      skybox?: Mesh;
      box?: Mesh;
      ground?: Mesh;
      importMesh?: any; 
      player?: any;
      actionManager?: any; 
    } 
    let that: SceneData = { scene: new Scene(engine) };
    //that.scene.debugLayer.show();
    that.scene.enablePhysics(new Vector3(0, -9.8, 0), havokPlugin);
    

    that.actionManager = actionManager(that.scene);
    that.skybox = createSkybox(that.scene);
    that.light = createLight(that.scene);  
    that.ground = createGround(that.scene,new Vector3(0,0,0),new Vector3(0,0,0));
    that.box = createBox(that.scene, new Vector3(2,2,2));    
    that.camera = createArcRotateCamera(that.scene);
    that.importMesh = importPlayerMesh(that.scene,that.box, 0, 0);

    //----- GUI -----
    let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI",true);
    
    //--------------
    return that;
    //------
  }