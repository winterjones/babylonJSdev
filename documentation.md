# JSPF - Documentation Notes (Element 05)
*B00621257  - Winter Jones*

# E5: Ramped Up
"E5: Ramped Up" is a game about creating your own platforms to traverse the level. This game uses the idea of "cloning" objects and placing them in new positions, to reach new areas and complete the level. 

The two key components of the code are the "Ramp Cloning" and the "Collectibles" sections. These are the complexities and will be explored in more detail.

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
# Collectables
content