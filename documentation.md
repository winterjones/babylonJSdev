# JSPF - Documentation Notes
B00621257  - Winter Jones

# Element 05
* Arc Rotate Camera
* Imported Mesh
* Player Movement

```typescript
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
```