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
    Engine,
    StandardMaterial,
    Color3,
    Texture,
    CubeTexture,
    FollowCamera,
    Light,
    Sound,
    SceneLoader,
  } from "@babylonjs/core";

  import * as GUI from "@babylonjs/gui";

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
  function createFollowCamera(scene: Scene)
  {
    let camera = new FollowCamera("FollowCam", new Vector3(0,5,-5), scene);

    camera.radius = 8;
    camera.heightOffset = 5;
    camera.rotationOffset = -180;
    camera.cameraAcceleration = 0.5;
    camera.maxCameraSpeed = 1;
    camera.attachControl(true);

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
    light.intensity = 2;
    return light;
  }
  function createSceneButton(scene: Scene, name: string, index: string, x: string,y: string, advtex){
     let button = GUI.Button.CreateSimpleButton(name, index);
     button.left = x; 
     button.top = y; 
     button.width = "160px"
     button.height = "60px"; 
     button.color = "white"; 
     button.cornerRadius = 20; 
     button.background = "green"; 
     const buttonClick = new Sound("MenuClickSFX", "./public/audio/menu-click.wav", scene, null, {
      loop: false, 
      autoplay: false,
    });

     button.onPointerUpObservable.add(function() {
      buttonClick.play();
      setSceneIndex(1);
    });
    advtex.addControl(button); 
    return button; 
    } 
  //------------------------------------------------

  //----- BOTTOM [Rendering] ------
  export default function MenuScene(engine: Engine) {
    interface SceneData {
      scene: Scene;     
      light?: Light;
      camera?: ArcRotateCamera;   
      skybox?: Mesh;     
    } 
    let that: SceneData = { scene: new Scene(engine) };  
    that.skybox = createSkybox(that.scene);
    that.light = createLight(that.scene);  
    that.camera = createArcRotateCamera(that.scene);

    //----- GUI -----
    let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI",true);
    let button1 = createSceneButton(that.scene, "but1", "Start Game","0px", "-75px", advancedTexture);
    let button2 = createSceneButton(that.scene, "but2", "Options","0px", "0px", advancedTexture);
    
    //--------------
    return that;
    //--------------
  }