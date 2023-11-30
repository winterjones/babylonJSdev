// ----------- TOP [Imports] -----------
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
    PhysicsBody,
  } from "@babylonjs/core";

  import * as GUI from "@babylonjs/gui";

 //----------- HAVOK INIT -----------
  import HavokPhysics from "@babylonjs/havok"; 
  import { HavokPlugin } from "@babylonjs/core"; 

  let initializedHavok; 
  HavokPhysics().then((havok) => { 
   initializedHavok = havok; 
  });
  const havokInstance = await HavokPhysics();
  const havokPlugin = new HavokPlugin(true, havokInstance);
   
  globalThis.HK = await HavokPhysics();
  //----------- HAVOK END -----------

  // ---------- MIDDLE [Functions] -----------
  
  // ----- Game Setup Vars ------
  let itemsCollect: number;
  let keyDownMap: any[] = []
  //------ Player Mesh Functions -----
  function importPlayerMesh(scene: Scene, collider: Mesh, x: number, y: number) {
    let tempItem = { flag: false } 
    let item: any = SceneLoader.ImportMesh("", "./public/models/", "dummy3.babylon", scene, function(newMeshes, particleSystems, skeletons, animationGroups) {
      let mesh = newMeshes[0];
      let skeleton = skeletons[0];
      skeleton.animationPropertiesOverride = new AnimationPropertiesOverride();
      skeleton.animationPropertiesOverride.enableBlending = true;
      skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
      skeleton.animationPropertiesOverride.loopMode = 1; 

      //adapted from: www.babylonjs-playground.com/#LL5BIQ#0
      //another good playground for this is: www.babylonjs-playground.com/#AHQEIB#17
      let idleRange: any = skeleton.getAnimationRange("YBot_Idle");
      let walkRange: any = skeleton.getAnimationRange("YBot_Walk");
      // let runRange: any = skeleton.getAnimationRange("YBot_Run");
      //let leftRange: any = skeleton.getAnimationRange("YBot_LeftStrafeWalk");
      //let rightRange: any = skeleton.getAnimationRange("YBot_RightStrafeWalk");

      //MOVE THESE IF YOU WANT TO TRIGGER ANYWHERE
      //let runAnim: any = scene.beginWeightedAnimation(skeleton, runRange.from, runRange.to, 1.0, true);
      //let leftAnim: any = scene.beginWeightedAnimation(skeleton, leftRange.from, leftRange.to, 1.0, true);
      //let rightAnim: any = scene.beginWeightedAnimation(skeleton, rightRange.from, rightRange.to, 1.0, true);

      //Speed and Rotation Variables
      let speed: number = 0.04;
      let speedBackward: number = 0.01;
      let rotationSpeed = 0.1;

      //Animation Variables
      let idleAnim: any;
      let walkAnim: any;
      let animating: boolean = false;

      //clone spawn timer
      let cloneMaxTimer: number = 120;
      let cloneTimer: number = 0;

      let rampBlueprint = createBlueprintRamp(scene, new Vector3(2,0,0), new Vector3(1,1,1));
      rampBlueprint.rotation = new Vector3(20,0,60);

      scene.onBeforeRenderObservable.add(()=> {
        let keydown: boolean = false;
        if(cloneTimer >= 0)
        {
          cloneTimer -= 1;
        }

        if (keyDownMap["w"] || keyDownMap["ArrowUp"]) {
          mesh.moveWithCollisions(mesh.forward.scaleInPlace(speed));                
          //Previous code
          //mesh.position.z += 0.01;
          //mesh.rotation.y = 0;
          keydown = true;
        }
        if (keyDownMap["a"] || keyDownMap["ArrowLeft"]) {
          mesh.rotate(Vector3.Up(), -rotationSpeed);
          //Previous code
          //mesh.position.x -= 0.01;
          //mesh.rotation.y = 3 * Math.PI / 2;
          keydown = true;
        }
        if (keyDownMap["s"] || keyDownMap["ArrowDown"]) {
          mesh.moveWithCollisions(mesh.forward.scaleInPlace(-speedBackward));
          //Previous code
          //mesh.position.z -= 0.01;
          //mesh.rotation.y = 2 * Math.PI / 2;
          keydown = true;
        }
        if (keyDownMap["d"] || keyDownMap["ArrowRight"]) {
          mesh.rotate(Vector3.Up(), rotationSpeed);
          //Previous code
          //mesh.position.x += 0.01;
          //mesh.rotation.y = Math.PI / 2;
          keydown = true;
        }
        if(keyDownMap["q"])
        {
          if(cloneTimer <= 0)
          {
            let newClone = cloneRamp(scene, rampBlueprint);
            cloneTimer = cloneMaxTimer;
          }          
        }
        rampBlueprint.position = new Vector3(mesh.position.x + 2, mesh.position.y + 1, mesh.position.z);        
        if (keydown) {
          if (!animating) {
              animating = true;
              idleAnim = scene.stopAnimation(skeleton);
              walkAnim = scene.beginWeightedAnimation(skeleton, walkRange.from, walkRange.to, 1.0, true);
          }
          if (animating) {
            walkAnim = scene.beginWeightedAnimation(skeleton, walkRange.from, walkRange.to, 1.0, true);
          }
        } else {
          if (animating && !keydown) {
            animating = false;
            idleAnim = scene.beginWeightedAnimation(skeleton, idleRange.from, idleRange.to, 1.0, true);
          }
          if (!animating && !keydown) {
            idleAnim = scene.beginWeightedAnimation(skeleton, idleRange.from, idleRange.to, 1.0, true);
          }
        }

        //collision
        if (mesh.intersectsMesh(collider)) {
          console.log(collider.name);
          if(collider.name.includes ("collectible"))
          {
            console.log("collided with collectible");
          }
        }
        
      });

      //physics collision
      item = mesh;
      let playerAggregate = new PhysicsAggregate(item, PhysicsShapeType.CAPSULE, { mass: 0 }, scene);
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
  function createBlueprintRamp(scene: Scene, position: Vector3, scale: Vector3) 
  {
    let ramp = MeshBuilder.CreateBox("ramp",{height: 0.1, width: 4},scene);
    let newMaterial = new StandardMaterial("rampMaterial",scene);
    newMaterial.alpha = 0.3;
    ramp.material = newMaterial;
    ramp.position = position;
    ramp.scaling = scale;
    return ramp;
  }
  function cloneRamp(scene: Scene, rampBase: Mesh)
  {
    let clone = MeshBuilder.CreateBox("clone",{height: 0.1, width: 4},scene);
    let cloneMaterial = new StandardMaterial("cloneMaterial",scene);
    clone.position = rampBase.position;
    clone.rotation = rampBase.rotation;
    cloneMaterial.ambientColor = new Color3(1,0,0);
    clone.material = cloneMaterial;
    let cloneAggregate = new PhysicsAggregate(clone, PhysicsShapeType.BOX, { mass: 0 }, scene);

    return clone;
  }
  //----- Level Geometry Functions -----
  function createBox(scene: Scene, position: Vector3){
    let box: Mesh = MeshBuilder.CreateBox("box", { size: 1 }, scene);
    box.position = position;
    const boxAggregate = new PhysicsAggregate(box, PhysicsShapeType.BOX, { mass: 1 }, scene);
    return box; 
   } 
  
  function createGround(scene: Scene, position: Vector3, rotation: Vector3) {
    let ground = MeshBuilder.CreateGround("ground", { width: 20, height: 20, subdivisions: 4 },scene,);
    const groundAggregate = new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, scene);

    let groundMaterial = new StandardMaterial("ground", scene);
	  groundMaterial.specularColor = new Color3(0, 0, 0);

    ground.position = position;
    ground.rotation = rotation;
    ground.material = groundMaterial;
    ground.receiveShadows = true;
    return ground;
  }

  function createCollectible(scene: Scene, scale: Vector3)
  {
    const collectible = MeshBuilder.CreateSphere("collectible",{},scene);
    
    collectible.scaling = scale;
    let collectibleAggregate = new PhysicsAggregate(collectible, PhysicsShapeType.BOX, { mass: 1 }, scene);
    return collectible;
  }
  function spawnCollectibles(scene: Scene, player: any) //create and spawn collectible clones, then position them
  {
    const collectibles: Mesh[] = []; //array of all collectible objects being made
    const positions: Vector3[] = []; //array of positions that correspond to the collectibles
    positions.push(new Vector3(3,1,0)); 
    positions.push(new Vector3(6,1,0)); //pushing 5 locations for the collectibles to spawn
    positions.push(new Vector3(9,1,0));
    positions.push(new Vector3(12,1,0));
    
    for(let i = 0; i < positions.length; i++)
    {
      collectibles[i] = createCollectible(scene,new Vector3(0.1,0.1,0.1)); //clones a collectible and adds it to the array
      collectibles[i].name = "collectible" + i;
      collectibles[i].position = positions[i];
      
    }

    scene.onBeforeRenderObservable.add(()=> {
      //collision
      for (let i = 0; i < collectibles.length; i++) {
        if (collectibles[i].intersectsMesh(player)) {
          console.log(player.name);
          // if(collider.name.includes ("collectible"))
          // {
          //   console.log("collided with collectible");
          // }
        }
      }
    });
    return collectibles;
  }
  //----- Scene Functions -----
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
	  skyboxMaterial.reflectionTexture = new CubeTexture("./public/textures/skybox", scene);
	  skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
	  skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
	  skyboxMaterial.specularColor = new Color3(0, 0, 0);
	  skybox.material = skyboxMaterial;

    return skybox;
  }  
  function createLight(scene: Scene) {
    const light = new HemisphericLight("hemiLight",new Vector3(-1,-2,-1),scene);
    light.intensity = 3;
    return light;
  }

  //----- GUI Functions -----
  function createTextBlock(scene: Scene, name: string, text: string, fontSize: number, alignment: number, color: string, x: string, y: string, advtex)
    {
      let textBlock = new GUI.TextBlock(name,text);
      textBlock.fontSize = fontSize;
      textBlock.textVerticalAlignment = alignment;
      textBlock.left = x;
      textBlock.top = y;
      textBlock.color = color;

      advtex.addControl(textBlock);
      return textBlock;
    }
  //---------- MIDDLE END -----------

  //---------- BOTTOM [Rendering] -----------
  export default function GameScene(engine: Engine) {
    interface SceneData {
      //scene related
      scene: Scene;     
      light?: Light;
      camera?: ArcRotateCamera;   
      //level geometry
      skybox?: Mesh;
      box?: Mesh;
      ground?: Mesh;
      collectibles?: Mesh[];
      //player related
      importMesh?: any; 
      player?: any;
      actionManager?: any; 
    } 
    let that: SceneData = { scene: new Scene(engine) };
    that.scene.debugLayer.show();
    //----- Scene Setup -----
    that.scene.enablePhysics(new Vector3(0, -9.8, 0), havokPlugin);    
    that.actionManager = actionManager(that.scene);
    that.skybox = createSkybox(that.scene);
    that.light = createLight(that.scene);  
    //----- Level Geometry Setup -----
    that.ground = createGround(that.scene,new Vector3(0,0,0),new Vector3(0,0,0));
    that.box = createBox(that.scene, new Vector3(2,2,2));    
    that.camera = createArcRotateCamera(that.scene);
    that.importMesh = importPlayerMesh(that.scene, that.box, 0, 0);
    that.collectibles = spawnCollectibles(that.scene, that.importMesh);

    
    

    //----- GUI Setup -----
    let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI",true);
    let collectibleText = createTextBlock(that.scene,"collectibleText","Items Collected: 0",20,0,"white","-200px","-20px",advancedTexture);
    
    return that;
    //----------- RENDERING END ----------
  }