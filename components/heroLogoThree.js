// The part of three.js the hero logo uses, loaded on demand by HeroLogo3D.
// Named imports let the bundler drop the rest of the library: `import('three')`
// as a namespace shipped all of it — about 186 KB gzipped of script to
// download and compile on a phone, for a dozen classes.
export {
  ACESFilmicToneMapping,
  AmbientLight,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
  SRGBColorSpace,
  Scene,
  WebGLRenderer,
} from 'three';
export { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
