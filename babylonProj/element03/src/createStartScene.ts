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
    SceneLoader,
    ActionManager,
    ExecuteCodeAction,
    AnimationPropertiesOverride,
    FollowCamera,
    AbstractMesh,
  } from "@babylonjs/core";
import { colorCorrectionPixelShader } from "@babylonjs/core/Shaders/colorCorrection.fragment";
import { Color3LineComponent } from "@babylonjs/inspector/lines/color3LineComponent";
import { sceneUboDeclaration } from "@babylonjs/core/Shaders/ShadersInclude/sceneUboDeclaration";

  
  // ----- MIDDLE [Functions] ------
  let keyDownMap: any[] = []
  

  function importPlayerMesh(scene, x: number, y: number, camera: FollowCamera) {
    let tempItem = { flag: false } 
    let item = SceneLoader.ImportMesh("", "./models/", "dummy3.babylon", scene, 
   function(newMeshes, particleSystems, skeletons) {
    let mesh = newMeshes[0];
    camera.lockedTarget = mesh;
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
    let modifier: number = 1;
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
        camera.lockedTarget = mesh;
        if (!animating) {
        animating = true; 
        scene.beginAnimation(skeleton, walkRange.from, walkRange.to, true);
        } 
       } else { 
        animating = false; 
        scene.stopAnimation(skeleton);
       }
      }      
      );    
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

function createBox(scene: Scene) {
    const box = MeshBuilder.CreateBox("box", {});
    box.position.x = 2;
    return box;
} 
  function createLight(scene: Scene) {
    const light = new HemisphericLight("hemiLight",new Vector3(-1,-2,-1),scene);
    light.intensity = 1;
    return light;
  }
  function createGround(scene: Scene, position: Vector3, rotation: Vector3) {
    let ground = MeshBuilder.CreateGround(
      "ground",
      { width: 10, height: 10, subdivisions: 4 },
      scene,
    );

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
    camera.attachControl(true);
    return camera;
  }
  function createFollowCamera(scene: Scene)
  {
    let camera = new FollowCamera("FollowCam", new Vector3(0,5,-5), scene);

    camera.radius = 10;
    camera.heightOffset = 5;
    camera.rotationOffset = 90;
    camera.cameraAcceleration = 0;
    camera.maxCameraSpeed = 1;
    camera.attachControl(true);

    return camera;
  }

  //------------------------------------------------

  //----- BOTTOM [Rendering] ------
  export default function createStartScene(engine: Engine) {
    interface SceneData {
      scene: Scene;     
      light?: HemisphericLight;
      camera?: FollowCamera;   
      //
      skybox?: Mesh;
      ground?: Mesh;
      importMesh?: any; 
      player?: any;
      actionManager?: any; 
    } 
    let that: SceneData = { scene: new Scene(engine) };
    //that.scene.debugLayer.show();
    
    that.ground = createGround(that.scene,new Vector3(0,0,0),new Vector3(0,0,0));
    that.actionManager = actionManager(that.scene);
    that.skybox = createSkybox(that.scene);

    that.light = createLight(that.scene);  
    that.camera = createFollowCamera(that.scene);
    that.importMesh = importPlayerMesh(that.scene, 0, 0,that.camera);
    //that.camera = createArcRotateCamera(that.scene);
    return that;
  }