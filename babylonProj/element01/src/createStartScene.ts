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
    Light,
    Camera,
    Engine,
    StandardMaterial,
    Color3,
    SpotLight,
    ShadowGenerator,
    DirectionalLight,
    Texture,
    Space,
  } from "@babylonjs/core";
import { colorCorrectionPixelShader } from "@babylonjs/core/Shaders/colorCorrection.fragment";
import { Color3LineComponent } from "@babylonjs/inspector/lines/color3LineComponent";
  // ----------------------------------
  
  // ----- MIDDLE [Functions] ------

  function createLight(scene: Scene) {
    const light = new DirectionalLight("dirLight",new Vector3(-1,-2,-1),scene);
    light.position = new Vector3(20, 40, 20);
    light.intensity = 1;
    return light;
  }
  function createBox(scene: Scene, px: number, py: number, pz: number, scaling: Vector3, color: Color3) {
    const newMaterial = new StandardMaterial("newMaterial",scene);    
    
    
    let box = MeshBuilder.CreateBox("box",{size: 1}, scene);

    newMaterial.diffuseColor = color;
    box.material = newMaterial;
    box.position = new Vector3(px,py,pz);
    box.scaling = scaling;
    return box;
  } 
  function createSpotlight(scene: Scene, px: number, py: number, pz: number)
  {
    const light = new SpotLight("spotLight", new Vector3(px, py, pz), new Vector3(0, -1, 0), Math.PI / 3.5, 2, scene);
    light.diffuse = new Color3(1,0,0);
    light.specular = new Color3(0,1,0);
    return light;
  }
  function createSphere(scene: Scene, px: number, py: number, pz: number, scaling: Vector3, color: Color3) {
    let sphere = MeshBuilder.CreateSphere(
      "sphere",
      { diameter: 1, segments: 15 },
      scene,
    );
    const newMaterial = new StandardMaterial("newMaterial",scene);
    newMaterial.diffuseColor = color;
    
    sphere.position = new Vector3(px,py,pz);
    sphere.scaling = scaling;
    sphere.material = newMaterial;
    return sphere;
  }
  
  function createGround(scene: Scene) {
    let ground = MeshBuilder.CreateGround(
      "ground",
      { width: 15, height: 15 },
      scene,
    );
    let groundMaterial = new StandardMaterial("ground", scene);
	  groundMaterial.specularColor = new Color3(0, 0, 0);
    ground.material = groundMaterial;
    ground.receiveShadows = true;
    return ground;
  }
  
  function createArcRotateCamera(scene: Scene) {
    let camAlpha = -Math.PI / 2,
      camBeta = Math.PI / 2.5,
      camDist = 10,
      camTarget = new Vector3(0, 0, 0);
    let camera = new ArcRotateCamera(
      "camera1",
      camAlpha,
      camBeta,
      camDist,
      camTarget,
      scene,
    );
    camera.attachControl(true);
    return camera;
  }
  //------------------------------------------------

  //----- BOTTOM [Rendering] ------
  export default function createStartScene(engine: Engine) {
    interface SceneData {
      scene: Scene;
      box?: Mesh;
      light?: DirectionalLight;
      sphere?: Mesh;
      ground?: Mesh;
      camera?: Camera;
      spotlight?: SpotLight;
     
    }
  
    let that: SceneData = { scene: new Scene(engine) };
    //that.scene.debugLayer.show();
    // note: create orrary 
    //that.spotlight = createSpotlight(that.scene,0,5,0);
    that.light = createLight(that.scene);
        
    that.sphere = createSphere(that.scene,0,2,0,new Vector3(1,1,1), new Color3(0,0,1));
    that.box = createBox(that.scene,0,3,0,new Vector3(1,1,1), new Color3(0,1,0));
    that.ground = createGround(that.scene);

    let shadowGenerator = new ShadowGenerator(1024, that.light);
	  shadowGenerator.addShadowCaster(that.box);
    shadowGenerator.addShadowCaster(that.sphere);
	  shadowGenerator.usePoissonSampling = true;
    
    that.camera = createArcRotateCamera(that.scene);
    return that;
  }