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
    CylinderBlock,
  } from "@babylonjs/core";
import { colorCorrectionPixelShader } from "@babylonjs/core/Shaders/colorCorrection.fragment";
import { Color3LineComponent } from "@babylonjs/inspector/lines/color3LineComponent";
import { sceneUboDeclaration } from "@babylonjs/core/Shaders/ShadersInclude/sceneUboDeclaration";
  // ----------------------------------
  
  // ----- MIDDLE [Functions] ------

  function createLight(scene: Scene) {
    const light = new DirectionalLight("dirLight",new Vector3(-1,-2,-1),scene);
    light.position = new Vector3(20, 40, 20);
    light.intensity = 1;
    return light;
  }
  
  function createBox(scene: Scene, position: Vector3, rotation: Vector3, scaling: Vector3, color: Color3) {
    const newMaterial = new StandardMaterial("newMaterial",scene);         
    let box = MeshBuilder.CreateBox("box",{size: 1}, scene);

    newMaterial.diffuseColor = color;
    newMaterial.specularColor = new Color3(0,1,1);
    box.material = newMaterial;
    box.position = position;
    box.rotation = rotation;
    box.scaling = scaling;
    box.receiveShadows = true;
    return box;
  } 
  function createSphere(scene: Scene, position: Vector3, scaling: Vector3, color: Color3) {
    let sphere = MeshBuilder.CreateSphere(
      "sphere",
      { diameter: 1, segments: 15 },
      scene,
    );
    const newMaterial = new StandardMaterial("newMaterial",scene);
    newMaterial.diffuseTexture = new Texture("https://assets.babylonjs.com/textures/rock.png", scene);
    //newMaterial.diffuseColor = color;
    
    sphere.receiveShadows = true;
    sphere.position = position;
    sphere.scaling = scaling;
    sphere.material = newMaterial;
    return sphere;
  }
  function createTorus(scene: Scene, position: Vector3, diameter: number, thickness: number, color: Color3, scale: Vector3, rotation: Vector3, tessellation: number){
    let torus = MeshBuilder.CreateTorus(
      "torus", {diameter ,thickness, tessellation}, scene
    )    
    const newMaterial = new StandardMaterial("newMaterial",scene);
    newMaterial.diffuseColor = color;

    torus.position = position;
    torus.rotation = rotation;
    torus.scaling = scale;
    torus.material = newMaterial;
    return torus;
  }
  function createGround(scene: Scene, position: Vector3, rotation: Vector3) {
    let ground = MeshBuilder.CreateGround(
      "ground",
      { width: 15, height: 15 },
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
  function createCylinder(scene: Scene, position: Vector3, rotation: Vector3, scaling: Vector3, color: Color3)
  {
    let cylinder = MeshBuilder.CreateCylinder(
      "cylinder",{height: 1}, scene
    )
    const newMaterial = new StandardMaterial("newMaterial",scene);
    newMaterial.diffuseColor = color;
      newMaterial.specularColor = new Color3(1,0,0.4);
    cylinder.material = newMaterial;
    cylinder.receiveShadows = true;
    cylinder.position = position;
    cylinder.scaling = scaling;
    cylinder.rotation = rotation;

    return cylinder;
  }
  function createArcRotateCamera(scene: Scene) {
    let camAlpha = -Math.PI / 2,
      camBeta = Math.PI / 2.5,
      camDist = 30,
      camTarget = new Vector3(0, 5, 0);
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
      cylinder?: Mesh;
      torus?: Mesh;
      outerTorus?: Mesh;
      light?: DirectionalLight;
      sphere?: Mesh;
      ground?: Mesh;
      wall?: Mesh;
      camera?: Camera;
      spotlight?: SpotLight;     
    }
  
    let that: SceneData = { scene: new Scene(engine) };
    //that.scene.debugLayer.show();

    that.light = createLight(that.scene);        
    that.sphere = createSphere(that.scene,new Vector3(0,5,0),new Vector3(5,5,5), new Color3(0,0.2,1));
    that.torus = createTorus(that.scene,new Vector3(0,5,0),7,0.3,new Color3(1,1,0.5),new Vector3(1,1,1), new Vector3(45,0,0),32);
    that.outerTorus = createTorus(that.scene,new Vector3(0,5,0),10,0.3,new Color3(0.5,1,1),new Vector3(1,1,1), new Vector3(0,0,45),32);
    that.ground = createGround(that.scene,new Vector3(0,0,0),new Vector3(0,0,0));
    that.wall = createBox(that.scene,new Vector3(-7.5,5,0),new Vector3(0,0,Math.PI/2), new Vector3(10,0.5,15), new Color3(1,0,0));
    that.box = createBox(that.scene, new Vector3(5,1,0),new Vector3(0,0,0),new Vector3(1,1,1), new Color3(0,1,0));
    that.cylinder = createCylinder(that.scene,new Vector3(5,2,0), new Vector3(Math.PI/2,0,0), new Vector3(1,4,1),new Color3(1,1,0));
    let shadowGenerator = new ShadowGenerator(1024, that.light);
    shadowGenerator.addShadowCaster(that.sphere);
    shadowGenerator.addShadowCaster(that.torus);
    shadowGenerator.addShadowCaster(that.outerTorus);
    shadowGenerator.addShadowCaster(that.box);
    shadowGenerator.addShadowCaster(that.cylinder);
	  shadowGenerator.usePoissonSampling = true;
    
    that.camera = createArcRotateCamera(that.scene);

    //setup for planet ring rotation

    let axis = new Vector3(Math.sin(20 * Math.PI/180), Math.cos(20 * Math.PI/180), 0);
    let axis2 = new Vector3(Math.sin(23 * Math.PI/90), Math.cos(23 * Math.PI/90), 0);   

    that.scene.registerBeforeRender(function() { //rotates the planet rings
      that.sphere?.rotate(new Vector3(0,1,0), 0.01, Space.LOCAL);
      that.torus?.rotate(axis, 0.04, Space.WORLD);
      that.outerTorus?.rotate(axis2, 0.02, Space.WORLD);

    })
    return that;
  }