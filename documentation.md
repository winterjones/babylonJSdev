# JSPF - Documentation Notes (Element 05)
*B00621257  - Winter Jones*

# E5: Ramped Up
"E5: Ramped Up" is a game about creating your own platforms to traverse the level. This game uses the idea of "cloning" objects and placing them in new positions, to reach new areas and complete the level. 

The two key components of the code are the "Ramp Cloning" and the "Collectibles" sections. These are the complexities and will be explored in more detail.

The player should use WASD to move the character and press Q to place a ramp.

# Ramp Cloning
The game contains a "blueprint" ramp that sits in front of the player at all times. 
This is used to spawn clones on its position by pressing "Q". These clones are created using a simple CreateBox and then passing through appropriate values. 

Whilst a "CloneMesh" function is doable, it wasn't appropriate for the implimentation I went with.
```typescript
function cloneRamp(scene: Scene, rotation: Quaternion, position: Vector3)
  {
    let clone = MeshBuilder.CreateBox("rampClone",{height: 0.1, width: 3, size: 2},scene);
    let cloneMaterial = new StandardMaterial("cloneMaterial",scene);
    clone.position = position;
    clone.rotationQuaternion = rotation;
    cloneMaterial.ambientColor = new Color3(1,0,0);
    clone.material = cloneMaterial;
    const cloneAggregate = new PhysicsAggregate(clone, PhysicsShapeType.BOX, { mass: 0, friction: 5 }, scene);
    return clone;
  }
```
The variables *rotation* and *position* are set using the follow code:
```typescript
    const worldPos: Vector3 = blueprint.absolutePosition;
    const newPos: Vector3 = new Vector3(worldPos.x,worldPos.y,worldPos.z);
    const worldRot: Quaternion = blueprint.absoluteRotationQuaternion;
    const newRot: Quaternion = new Quaternion(worldRot.x,worldRot.y,worldRot.z,worldRot.w);
    let newClone = cloneRamp(scene, newRot, newPos);
```
The assignment of these two variables is done twice as to take a snapshot of the Blueprint's current **WORLD** (absolute) location. This is due to it being a child of the Player Mesh and thus *.position* cannot be used for cloning.

Each time the clone is made, the Blueprint needs to have its rotation reset back to normal. This is due to a bug with passing the rotation/position, but can be bypassed with the code shown below.
```typescript
    blueprint.rotation.z = (15/180) * Math.PI;
    blueprint.rotation.y = (180/360) * -Math.PI;
```
# Collectibles
The Collectibles feature of the game is only a singular object, but this object moves each time it is collected. This saves having to create each individual one, but also forces the player to follow a path - represented by the collectible.

The code below shows the creation of said collectible. This sets a basic material and uses the *changeCollectibleLocation* function to place it in the first position (using an index value of 0).
```typescript
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
```
This next function contains all the locations for the collectible to move to. The *index* value is passed through as *collectiblesObtained* (which is a **number** representing how many times the player has touched the collectible). 

The position is stored in a **Vector3** array. This makes it more manageable and adaptable for future adaptions of the game. The final position moves the collectible out of the player's reach and allows them to complete the game, after they grab the final collectible.
```typescript
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
```

# Game Completion
The game is designated as completed when the player collects all the collectibles. This is checked every single time an object is picked up. 

If the player has collected the correct amount, then they'll be moved to the **GameFinishScene**. 
```typescript
if(collectiblesObtained == 8)
    {
      setSceneIndex(2);
    }
```

