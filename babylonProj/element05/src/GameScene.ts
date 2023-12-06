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
  function importPlayerMesh(scene: Scene, collider: Mesh, x: number, y: number, blueprint: Mesh, cooldownText: GUI.TextBlock) {  
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
    let rotationSpeed = 0.05;

    //Animation Variables
    let idleAnim: any;
    let walkAnim: any;
    let animating: boolean = false;

    //clone spawn timer
    let cloneMaxTimer: number = 90;
    let cloneTimer: number = 0;

    blueprint.rotation.z = (20/180) * Math.PI;
    blueprint.parent = mesh;
    //physics collision
    item = mesh;
    const playerAggregate = new PhysicsAggregate(item, PhysicsShapeType.CAPSULE, { mass: 1 }, scene);
    playerAggregate.body.setLinearDamping(10);
    playerAggregate.body.setAngularDamping(10);
      
    playerAggregate.body.disablePreStep = false;
    scene.onBeforeRenderObservable.add(()=> {
      let keydown: boolean = false;
      item.rotationQuaternion.x = 0;
      item.rotationQuaternion.z = 0;

      if(cloneTimer >= 0)
      {
        cooldownText.text = "Clone Ramp Cooldown: " + Math.round(cloneTimer/10);
        cloneTimer -= 1;
      }
      else
      {
        cooldownText.text = "Clone Ramp Cooldown: Finished";
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
  //----- Level Geometry Functions -----
  function createBox(scene: Scene, position: Vector3, scaling: Vector3,rotation: Vector3){
    let box: Mesh = MeshBuilder.CreateBox("box", { size: 1 }, scene);
    box.position = position;
    box.rotation = rotation;
    box.scaling = scaling;
    const boxAggregate = new PhysicsAggregate(box, PhysicsShapeType.BOX, { mass: 100 }, scene);
    boxAggregate.body.setGravityFactor(0);
    boxAggregate.body.setMotionType(PhysicsMotionType.STATIC);
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
	  skyboxMaterial.reflectionTexture = new CubeTexture("./public/textures/skybox", scene);
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
      ground?: Mesh;
      collectibles?: Mesh[];
      //player related
      importMesh?: any; 
      player?: any;
      actionManager?: any; 
      rampBlueprint?: Mesh;
    } 
    let that: SceneData = { scene: new Scene(engine) };
    //that.scene.debugLayer.show();
    //----- GUI Setup -----
    let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI",true);
    let collectibleText = createTextBlock(that.scene,"collectibleText","Items Collected: 0",30,0,"white",-520,5,advancedTexture);
    let cooldownText = createTextBlock(that.scene,"cooldownText","Clone Ramp Cooldown: Finished",20,0,"white",0,800,advancedTexture);
    //----- Scene Setup -----
    that.scene.enablePhysics(new Vector3(0, -9.8, 0), havokPlugin); 
    that.actionManager = actionManager(that.scene);
    that.skybox = createSkybox(that.scene);
    that.hemiLight = createHemiLight(that.scene);

    //----- Level Geometry Setup -----
    that.ground = createGround(that.scene,new Vector3(0,0,0),new Vector3(0,0,0),"ground");
    that.platform1 = createBox(that.scene, new Vector3(10,1,0),new Vector3(5,0.5,5), new Vector3(0,0,0));
    that.platform2 = createBox(that.scene, new Vector3(21,2.4,0),new Vector3(5,0.5,5), new Vector3(0,0,0));    
    that.platform3 = createBox(that.scene, new Vector3(17,6,0),new Vector3(5,0.5,5), new Vector3(0,0,0));    

    that.rampBlueprint = createBlueprintRamp(that.scene, new Vector3(0,0.5,2.5), new Vector3(1,1,1));
    that.importMesh = importPlayerMesh(that.scene, that.platform1, 0, 0,that.rampBlueprint,cooldownText);
    that.camera = createFollowCamera(that.scene,that.rampBlueprint);   
    that.camera.parent = that.importMesh.mesh;
    //that.collectibles = spawnCollectibles(that.scene, that.importMesh);   

    
    
    return that;
    //----------- RENDERING END ----------
  }