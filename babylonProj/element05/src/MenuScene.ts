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
    let title = createTextBlock(that.scene, "titleText","Element 05",50,0,"white","0px","30px",advancedTexture);
    let button1 = createSceneButton(that.scene, "but1", "Start Game","0px", "-200px", advancedTexture);
    let button2 = createSceneButton(that.scene, "but2", "Options","0px", "-125px", advancedTexture);


    //--------------
    return that;
    //--------------
  }