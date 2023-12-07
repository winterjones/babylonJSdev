// ----------- TOP [Imports] -----------
import setSceneIndex from "./index";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import {
    Scene,
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
    PhysicsMotionType,
    AbstractMesh,
    Quaternion,
    ShadowGenerator,
    DirectionalLight,
    Space,
  } from "@babylonjs/core";

  import * as GUI from "@babylonjs/gui";

 //----------- HAVOK INIT -----------
  import HavokPhysics, { MotionType } from "@babylonjs/havok"; 
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
  function importPlayerMesh(scene: Scene, collider: Mesh, x: number, y: number, blueprint: Mesh, cooldownText: GUI.TextBlock, collectibleText: GUI.TextBlock) {  
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
    let speed: number = 0.03;
    let speedBackward: number = 0.01;
    let rotationSpeed = 0.05;
    skeleton.animationPropertiesOverride = new AnimationPropertiesOverride();
    skeleton.animationPropertiesOverride.enableBlending = true;
    skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
    skeleton.animationPropertiesOverride.loopMode = 1; 

    //Animation Variables
    let idleAnim: any;
    let walkAnim: any;
    let animating: boolean = false;

    //clone blueprint setup
    let cloneMaxTimer: number = 90;
    let cloneTimer: number = 0;
    blueprint.rotation.z = (20/180) * Math.PI;
    blueprint.parent = mesh;
    //collectible setup
    let collectiblesObtained: number = 0;
    
    //physics collision
    item = mesh;
    const playerAggregate = new PhysicsAggregate(item, PhysicsShapeType.CAPSULE, { mass: 10 }, scene);
    playerAggregate.body.setLinearDamping(5);
    playerAggregate.body.setAngularDamping(10);
      
    playerAggregate.body.disablePreStep = false;
    scene.onBeforeRenderObservable.add(()=> {
      let keydown: boolean = false;
      item.rotationQuaternion.x = 0;
      item.rotationQuaternion.z = 0;
      //clone timer management
      if(cloneTimer >= 0)
      {
        cooldownText.text = "Clone Ramp Cooldown: " + Math.round(cloneTimer/10);
        cloneTimer -= 1;
      }
      else
      {
        cooldownText.text = "Clone Ramp Cooldown: Finished";
      }
      //key controls
      if (keyDownMap["w"] || keyDownMap["ArrowUp"]) {
        mesh.moveWithCollisions(mesh.forward.scaleInPlace(speed));                
        keydown = true;
        }
      if (keyDownMap["a"] || keyDownMap["ArrowLeft"]) {
        mesh.rotate(Vector3.Up(), -rotationSpeed);
        keydown = true;
      }
      if (keyDownMap["s"] || keyDownMap["ArrowDown"]) {
        mesh.moveWithCollisions(mesh.forward.scaleInPlace(-speedBackward));
        keydown = true;
      }
      if (keyDownMap["d"] || keyDownMap["ArrowRight"]) {
        mesh.rotate(Vector3.Up(), rotationSpeed);
        keydown = true;
      }
      //spawn clone control
      if(keyDownMap["q"])
      {
        if(cloneTimer <= 0)
        {
          cloneTimer = cloneMaxTimer;
          const worldPos: Vector3 = blueprint.absolutePosition;
          const newPos: Vector3 = new Vector3(worldPos.x,worldPos.y,worldPos.z);
          const worldRot: Quaternion = blueprint.absoluteRotationQuaternion;
          const newRot: Quaternion = new Quaternion(worldRot.x,worldRot.y,worldRot.z,worldRot.w);
          let newClone = cloneRamp(scene, newRot, newPos);
          blueprint.rotation.z = (20/180) * Math.PI;
          blueprint.rotation.y = (180/360) * -Math.PI;
        }          
      }
      //animation
     let isPlaying: boolean = false;
        if (keydown && !isPlaying) {
          if (!animating) {
              idleAnim = scene.stopAnimation(skeleton);
              walkAnim = scene.beginWeightedAnimation(skeleton, walkRange.from, walkRange.to, 1.0, true);
              animating = true;
          }
          if (animating) {
            //walkAnim = scene.beginWeightedAnimation(skeleton, walkRange.from, walkRange.to, 1.0, true);
            isPlaying = true;
          }
        } else {
          if (animating && !keydown) {
            walkAnim = scene.stopAnimation(skeleton);
            idleAnim = scene.beginWeightedAnimation(skeleton, idleRange.from, idleRange.to, 1.0, true);
            animating = false;
            isPlaying = false;
          }

      //collision
      if (mesh.intersectsMesh(collider)) {
        console.log("hit collider");
        collectiblesObtained += 1;
        changeCollectibleLocation(scene,collider,collectiblesObtained);    
        collectibleText.text = "Items Collected: " + collectiblesObtained;
        if(collectiblesObtained == 8)
        {
          setSceneIndex(2);
        }
      }
    } 
    });
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
    const ramp = MeshBuilder.CreateBox("ramp",{height: 0.1, width: 3, size: 1.5},scene); 
    let newMaterial = new StandardMaterial("rampMaterial",scene);
    newMaterial.diffuseColor = new Color3(0.4,0.1,0.1);

    newMaterial.alpha = 0.3;
    ramp.material = newMaterial;
    ramp.position = position;
    ramp.scaling = scale;
    ramp.rotation.z = (20/180) * Math.PI;
    ramp.rotation.y = (180/360) * -Math.PI;

    return ramp;
  }
  function cloneRamp(scene: Scene, rotation: Quaternion, position: Vector3)
  {
    let clone = MeshBuilder.CreateBox("rampClone",{height: 0.1, width: 3, size: 1.5},scene);
    let cloneMaterial = new StandardMaterial("cloneMaterial",scene);
    clone.position = position;
    clone.rotationQuaternion = rotation;
    cloneMaterial.specularColor = new Color3(0.4,0.1,0.1);
    cloneMaterial.diffuseColor = new Color3(0.4,0.1,0.1);
    clone.material = cloneMaterial;
    const cloneAggregate = new PhysicsAggregate(clone, PhysicsShapeType.BOX, { mass: 0, friction: 5 }, scene);
    return clone;
  }
  function changeCollectibleLocation(scene: Scene, collectible: Mesh, index: number)
  {
    const locations: Vector3[] = [];
    locations.push(new Vector3(3,1,0)); 
    locations.push(new Vector3(10,2,0));
    locations.push(new Vector3(21,4.6,0));
    locations.push(new Vector3(15,8.5,0));
    locations.push(new Vector3(15,12.5,0));
    locations.push(new Vector3(10,13.5,0));
    locations.push(new Vector3(5,14.5,0));
    locations.push(new Vector3(0,15.5,0));
    locations.push(new Vector3(-100,-100,-100));
    collectible.position = locations[index];
  }
   //move the collectible outside the map so the player cannot collect it
  //----- Level Geometry Functions -----
  function createBox(scene: Scene, position: Vector3, scaling: Vector3, rotation: Vector3){
    //this function is primarily used to create the platforms to traverse
    let box: Mesh = MeshBuilder.CreateBox("box", { size: 1 }, scene);
    let boxMaterial = new StandardMaterial("boxMaterial",scene);
    boxMaterial.alpha = 0.75;
    boxMaterial.diffuseColor = new Color3(0.38,0.38,0.38);
    box.position = position;
    box.rotation = rotation;
    box.scaling = scaling;
    const boxAggregate = new PhysicsAggregate(box, PhysicsShapeType.BOX, { mass: 1 }, scene);
    boxAggregate.body.setGravityFactor(0);
    boxAggregate.body.setMotionType(PhysicsMotionType.STATIC);
    box.material = boxMaterial;
    box.receiveShadows = true;
    return box; 
  } 
  
  function createGround(scene: Scene, position: Vector3, rotation: Vector3, name: string) {
    let ground = MeshBuilder.CreateGround(name, { width: 10, height: 10, subdivisions: 4 },scene,);
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
    let collectibleMaterial = new StandardMaterial("collectibleMaterial", scene) ;
    collectibleMaterial.diffuseColor = new Color3(0,0.75,0);
    collectible.scaling = scale;
    collectible.material = collectibleMaterial;
    changeCollectibleLocation(scene,collectible,0);    

    return collectible;
  }
 
  //----- Scene Functions -----
  function createFollowCamera(scene: Scene, player: any)
  {
    const camera = new FollowCamera("FollowCam", new Vector3(0,4,-10), scene);

    camera.radius = 8;
    camera.heightOffset = 3;
    camera.rotationOffset = -90;
    camera.cameraAcceleration = 0.05;
    camera.maxCameraSpeed = 1;
    camera.lockedTarget = player;
    
    return camera;
  }
  function createSkybox(scene: Scene){
    const skybox = MeshBuilder.CreateBox("skyBox", {size:150}, scene);
    const skyboxMaterial = new StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
	  skyboxMaterial.reflectionTexture = new CubeTexture("./public/textures/skybox2", scene);
	  skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
	  skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
	  skyboxMaterial.specularColor = new Color3(0, 0, 0);
	  skybox.material = skyboxMaterial;

    return skybox;
  }  
  function createHemiLight(scene: Scene) {
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
    return light;
  }

  //----- GUI Functions -----
  function createTextBlock(scene: Scene, name: string, text: string, fontSize: number, alignment: number, color: string, x: number, y: number, advtex)
    {
      let textBlock = new GUI.TextBlock(name,text);
      textBlock.fontSize = fontSize;
      textBlock.textVerticalAlignment = alignment;
      textBlock.left = x+"px";
      textBlock.top = y+"px";
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
      dirLight?: DirectionalLight;
      hemiLight?: Light;
      camera?: FollowCamera;  
      //level geometry
      skybox?: Mesh;
      platform1?: Mesh;
      platform2?: Mesh;
      platform3?: Mesh;
      platform4?: Mesh;
      platform5?: Mesh;
      ground?: Mesh;
      collectible?: Mesh;
      //player related
      importMesh?: any; 
      player?: any;
      actionManager?: any; 
      rampBlueprint?: Mesh;
    } 
    let that: SceneData = { scene: new Scene(engine) };
    //----- GUI Setup -----
    let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI",true);
    let collectibleText = createTextBlock(that.scene,"collectibleText","Items Collected: 0",25,0,"white",-520,5,advancedTexture);
    let cooldownText = createTextBlock(that.scene,"cooldownText","Clone Ramp Cooldown: Finished",20,0,"white",0,800,advancedTexture);
    //----- Scene Setup -----
    that.scene.enablePhysics(new Vector3(0, -9.8, 0), havokPlugin); 
    that.actionManager = actionManager(that.scene);
    that.skybox = createSkybox(that.scene);
    that.hemiLight = createHemiLight(that.scene);
    const music = new Sound("Music", "./public/audio/510895__deleted_user_11009121__lofi-loop-7.mp3", that.scene, null, {
      loop: true,
      autoplay: true,
      volume: 1,
    });
    //----- Level Geometry Setup -----
    that.ground = createGround(that.scene,new Vector3(0,0,0),new Vector3(0,0,0),"ground");
    that.platform1 = createBox(that.scene, new Vector3(10,-9,0),new Vector3(5,20,5), new Vector3(0,0,0));
    that.platform2 = createBox(that.scene, new Vector3(21,-7.4,0),new Vector3(5,20,5), new Vector3(0,0,0));    
    that.platform3 = createBox(that.scene, new Vector3(15,7,0),new Vector3(5,0.5,5), new Vector3(0,0,0));    
    that.platform4 = createBox(that.scene, new Vector3(15,11,0),new Vector3(5,0.5,5), new Vector3(0,0,0));   
    that.platform5 = createBox(that.scene, new Vector3(0,13,5),new Vector3(5,0.5,10), new Vector3(0,0,0));  
    that.collectible = createCollectible(that.scene,new Vector3(0.3,0.3,0.3));
    that.rampBlueprint = createBlueprintRamp(that.scene, new Vector3(0,0.5,2.5), new Vector3(1,1,1));

    that.importMesh = importPlayerMesh(that.scene, that.collectible, 0, 0,that.rampBlueprint,cooldownText, collectibleText);
    that.camera = createFollowCamera(that.scene,that.rampBlueprint);   
    that.camera.parent = that.importMesh.mesh;   
    return that;
    //----------- RENDERING END ----------
  }