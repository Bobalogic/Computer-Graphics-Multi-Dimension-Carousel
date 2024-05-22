import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import * as THREE from "three";
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';



//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var camera, scene, renderer;
const pressedKeys = new Set();
var geometry, mesh, map;
var elipsoidgeometry, elipsoidemesh;
var torusGeometry, torusMesh;
var hyperboloidGeometry, hyperboloidMesh;
var paraboloidGeometry, paraboloidMesh;
var kleinBottleGeometry, kleinBottleMesh;
var sineWaveGeometry, sineWaveMesh;
var mobiusStripGeometry, mobiusStripMesh, bigMobiusStrip;
var helixGeometry, helixMesh;
var objectlist = [];
var pointLights = [];
var spotlights = [];
var materials = [];
var material;
var activeMaterialIndex = 0;
var cameras = []; // Array para armazenar todas as câmeras
var activeCameraIndex = 5; // Índice da câmera ativa
var carrossel;
var outerRing;
var MidRing;
var InnerRing;
var ascending = [true, true, true, true, true, true];
var descending = [false, false, false, false, false, false];
var rotating = false;
var clock = new THREE.Clock(true);
var stereoCamera;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene(){
    'use strict';

    scene = new THREE.Scene();
    createCarrossel(0, 0, 0);
    createLights();

   

}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////

function createCameras() {
    "use strict";
    // Câmera frontal (ortogonal)
    var frontOrthoCamera = new THREE.OrthographicCamera(-15, 15, 25, -5, 1, 1000);
    frontOrthoCamera.position.set(50, 0, 50);
    frontOrthoCamera.lookAt(scene.position);
    cameras.push(frontOrthoCamera);
  
    // Câmera lateral (ortogonal)
    var sideOrthoCamera = new THREE.OrthographicCamera(-15, 15, 15, -15, 1, 1000);
    sideOrthoCamera.position.set(30, 0, 0);
    sideOrthoCamera.lookAt(scene.position);
    cameras.push(sideOrthoCamera);
    
    // Câmera de topo (ortogonal)
    var topOrthoCamera = new THREE.OrthographicCamera(-15, 15, 15, -15, 1, 1000);
    topOrthoCamera.position.set(0, 100, 0);
    topOrthoCamera.lookAt(scene.position);
    cameras.push(topOrthoCamera);
  
    // Câmera fixa com projeção ortogonal (posicionada fora dos eixos principais)
    var fixedOrthoCamera = new THREE.OrthographicCamera(-20, 20, 20, -20, 1, 1000);
    fixedOrthoCamera.position.set(50, 50, 50);
    fixedOrthoCamera.lookAt(scene.position);
    cameras.push(fixedOrthoCamera);
  
    // Câmera fixa com projeção perspectiva (posicionada fora dos eixos principais)
    var fixedPerspCamera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    fixedPerspCamera.position.set(20, 10, 20);
    fixedPerspCamera.lookAt(scene.position);
    cameras.push(fixedPerspCamera);

    //perspective camera
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 30, 200);
    camera.position.set(20, 40, 35);
    camera.lookAt(scene.position);
    cameras.push(camera);  //Não percebo pq apaga e acende a luz também

    var stereoCamera = new THREE.StereoCamera();
    stereoCamera.aspect = 0.5;
}
  
/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

function createLights() {
    'use strict';
  
    // Ambient light (optional, for subtle lighting)
    var ambientLight = new THREE.AmbientLight(0xffa500, 0.2); // Cor alaranjada
    scene.add(ambientLight);
  
    // Directional light (main light source)
    var directionalLight = new THREE.DirectionalLight(0xffffff, 2.0); // Adjust color and intensity as needed
    directionalLight.position.set(5, 10, -10); // Set position for an angle relative to X-O-Z plane normal
    scene.add(directionalLight);
  
    /*
    // Add a helper for the directional light (optional, for visualization)
    var directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
    scene.add(directionalLightHelper);
    */  
   //add point lights for the big mobius strip
    for (let i = 0; i < 8; i++) {
        const pointLight = new THREE.PointLight(0xffffff, 10, 50); // Adjust color, intensity, and distance as needed
        const angle = i / 8 * Math.PI * 2;
        const u = angle;
        const v = 0;
        const x = (1 + v * Math.cos(u / 2)) * Math.cos(u);
        const y = (1 + v * Math.cos(u / 2)) * Math.sin(u);
        const z = v * Math.sin(u / 2);

        pointLight.position.set(x, y, z);
        pointLights.push(pointLight);
        bigMobiusStrip.add(pointLight);
    }
}
function createSpotlights(obj,x,y,z){
    var spotlight = new THREE.SpotLight(0xffffff, 10); // White color
    spotlight.position.set(x,y - 1.5,z); // Set spotlight position to object position
    spotlight.target.position.set(x, y + 10, z); // Point the spotlight upward
    spotlights.push(spotlight); 
    obj.add(spotlight);
    obj.add(spotlight.target);
}

function toggleDirectionalLight() {
    const light = scene.children.find(obj => obj instanceof THREE.DirectionalLight);
    if (light) {
        light.visible = !light.visible;
        console.log("Directional light is now " + (light.visible ? "on" : "off"));
    }
}

function togglePointLight(){
    for (let i = 0; i < 8; i++) {
        pointLights[i].visible =  !pointLights[i].visible;
    }

}
function toggleSpotLight(){
    for (let i = 0; i < 24; i++) {
        spotlights[i].visible =  !spotlights[i].visible;
    }

}

////////////////////////
/* CREATE MAIN OBJECT3D(S) */
////////////////////////

function createMaterials(){
    const lambertMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    const phongMaterial = new THREE.MeshPhongMaterial({
            map: map,
            side: THREE.DoubleSide
        });
    const toonMaterial = new THREE.MeshToonMaterial({ color: 0x0000ff  });
    materials.push(toonMaterial);
    const normalMaterial = new THREE.MeshNormalMaterial();
    materials.push(normalMaterial);
    const basicMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00  });
    materials.push(basicMaterial);
}

function addSkyDome(obj, x, y, z) {
    'use strict';

    var skyGeometry = new THREE.SphereGeometry(22.5, 64, 13, 3, 6.28, 1.4, 1.9);
    var textureLoader = new THREE.TextureLoader();
    var texture = textureLoader.load('domepic.jpg');

    var skyMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
    var skyDome = new THREE.Mesh(skyGeometry, skyMaterial);
    skyDome.name = "sky";
    skyDome.rotation.x = Math.PI;
    obj.add(skyDome);
}

function addBaseCarrossel(obj, x, y, z){
    'use strict';

    //CylinderGeometry(radiusTop, radiusBottom, height, radiusSegments)
    var geometry = new THREE.CylinderGeometry(12, 12, 2);
    var edges = new THREE.EdgesGeometry(geometry);
    var line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));
    edges.translate(0, 1, 0);
    obj.add(line); // Adiciona as arestas à cena
    
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addCilindroCentral(obj, x, y, z){
    'use strict';

    //CylinderGeometry(radiusTop, radiusBottom, height, radiusSegments)
    var geometry = new THREE.CylinderGeometry(1, 1, 15);
    var edges = new THREE.EdgesGeometry(geometry);
    var line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));
    edges.translate(x, y, z);
    obj.add(line); // Adiciona as arestas à cena

    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);

    addMobiusStrip(mesh, 0, 10, 0);
    
}

function addInnerRing(obj, x, y, z, height) {
    'use strict';

    var ringShape = new THREE.Shape();
    var outerRadius = 4;
    var innerRadius = 1;
    var ringHeight = height; // Rename 'height' parameter to 'ringHeight' to avoid conflict
    
    ringShape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);
    ringShape.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
    var extrudeSettings = {
        depth: ringHeight,
        bevelEnabled: false
    };

    InnerRing = new THREE.Object3D();
    InnerRing.userData = {ascending: false, descending: false};
    const extrudedGeometry = new THREE.ExtrudeGeometry(ringShape, extrudeSettings);
    const ring = new THREE.Mesh(extrudedGeometry, material);

    ring.position.set(x, y, z);
    ring.rotateX(Math.PI / 2);
    InnerRing.add(ring);

    obj.add(InnerRing);
    InnerRing.position.set(x, y, z);

    addElipsoids(InnerRing, 3, 3, 0);
    createSpotlights(InnerRing, 3, 3, 0);

    addTorus(InnerRing, -3, 3, 0);
    createSpotlights(InnerRing, -3, -3, 0);

    addHyperboloid(InnerRing, 0, 3.5, 2.5);
    createSpotlights(InnerRing, 0, 3.5, 2.5);

    addParaboloid(InnerRing, 0, 3.5, -2.5);
    createSpotlights(InnerRing, 0, 3.5, -2.5);

    addKleinBottle(InnerRing, 2.5 * Math.cos(Math.PI / 4), 3.5, 2.5 * Math.sin(Math.PI / 4));
    createSpotlights(InnerRing, 2.5 * Math.cos(Math.PI / 4), 3.5, 2.5 * Math.sin(Math.PI / 4));

    addSineWave(InnerRing, -2.5 * Math.cos(Math.PI / 4), 3.5, -2.5 * Math.sin(Math.PI / 4));
    createSpotlights(InnerRing, -2.5 * Math.cos(Math.PI / 4), 3.5, -2.5 * Math.sin(Math.PI / 4));

    addMobiusStrip(InnerRing, -2.5 * Math.cos(3 * Math.PI / 4), 3.5, -2.5 * Math.sin(3 * Math.PI / 4));
    createSpotlights(InnerRing, -2.5 * Math.cos(3 * Math.PI / 4), 3.5, -2.5 * Math.sin(3 * Math.PI / 4));

    addHelix(InnerRing, 2.5 * Math.cos(3 * Math.PI / 4), 3.5, 2.5 * Math.sin(3 * Math.PI / 4));
    createSpotlights(InnerRing, 2.5 * Math.cos(3 * Math.PI / 4), 3.5, 2.5 * Math.sin(3 * Math.PI / 4));
}

function addMiddleRing(obj, x, y, z, height) {
    'use strict';

    var ringShape = new THREE.Shape();
    var outerRadius = 7;
    var innerRadius = 4;
    var ringHeight = height; // Rename 'height' parameter to 'ringHeight' to avoid conflict
    
    ringShape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);
    ringShape.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
    var extrudeSettings = {
        depth: ringHeight,
        bevelEnabled: false
    };

    MidRing = new THREE.Object3D();
    MidRing.userData = {ascending: false, descending: false};
    const extrudedGeometry = new THREE.ExtrudeGeometry(ringShape, extrudeSettings);
    const ring = new THREE.Mesh(extrudedGeometry, material);

    ring.position.set(x, y, z);
    ring.rotateX(Math.PI / 2);
    MidRing.add(ring);

    obj.add(MidRing);
    MidRing.position.set(x, y, z);

    addElipsoids(MidRing, 6, 3, 0);
    createSpotlights(MidRing, 6, 3, 0);

    addTorus(MidRing, -6, 3, 0);
    createSpotlights(MidRing, -6, 3, 0);

    addHyperboloid(MidRing, 0, 3.5, 5.5);
    createSpotlights(MidRing, 0, 3.5, 5.5);

    addParaboloid(MidRing, 0, 3.5, -5.5);
    createSpotlights(MidRing, 0, 3.5, -5.5);

    addKleinBottle(MidRing, 5.5 * Math.cos(Math.PI / 4), 3.5, 5.5 * Math.sin(Math.PI / 4));
    createSpotlights(MidRing, 5.5 * Math.cos(Math.PI / 4), 3.5, 5.5 * Math.sin(Math.PI / 4));

    addSineWave(MidRing, -5.5 * Math.cos(Math.PI / 4), 3.5, -5.5 * Math.sin(Math.PI / 4));
    createSpotlights(MidRing, -5.5 * Math.cos(Math.PI / 4), 3.5, -5.5 * Math.sin(Math.PI / 4));

    addMobiusStrip(MidRing, -5.5 * Math.cos(3 * Math.PI / 4), 3.5, -5.5 * Math.sin(3 * Math.PI / 4));
    createSpotlights(MidRing, -5.5 * Math.cos(3 * Math.PI / 4), 3.5, -5.5 * Math.sin(3 * Math.PI / 4));

    addHelix(MidRing, 5.5 * Math.cos(3 * Math.PI / 4), 3.5, 5.5 * Math.sin(3 * Math.PI / 4));
    createSpotlights(MidRing, 5.5 * Math.cos(3 * Math.PI / 4), 3.5, 5.5 * Math.sin(3 * Math.PI / 4));

}

function addOuterRing(obj, x, y, z, height) {
    'use strict';

    var ringShape = new THREE.Shape();
    var outerRadius = 10;
    var innerRadius = 7;
    var ringHeight = height; // Rename 'height' parameter to 'ringHeight' to avoid conflict
    
    ringShape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);
    ringShape.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
    var extrudeSettings = {
        depth: ringHeight,
        bevelEnabled: false
    };

    outerRing = new THREE.Object3D();
    outerRing.userData = {ascending: false, descending: false};
    const extrudedGeometry = new THREE.ExtrudeGeometry(ringShape, extrudeSettings);
    const ring = new THREE.Mesh(extrudedGeometry, material);

    ring.position.set(x, y, z);
    ring.rotateX(Math.PI / 2);
    outerRing.add(ring);

    obj.add(outerRing);
    outerRing.position.set(x, y, z);

    addElipsoids(outerRing, 9, 3, 0);
    createSpotlights(outerRing, 9, 3, 0);

    addTorus(outerRing, -9, 3, 0);
    createSpotlights(outerRing, -9, 3, 0);

    addHyperboloid(outerRing, 0, 3.5, 8.5);
    createSpotlights(outerRing, 0, 3.5, 8.5);

    addParaboloid(outerRing, 0, 3.5, -8.5);
    createSpotlights(outerRing, 0, 3.5, -8.5);

    addKleinBottle(outerRing, 8.5 * Math.cos(Math.PI / 4), 3.5, 8.5 * Math.sin(Math.PI / 4));
    createSpotlights(outerRing, 8.5 * Math.cos(Math.PI / 4), 3.5, 8.5 * Math.sin(Math.PI / 4));

    addSineWave(outerRing, -8.5 * Math.cos(Math.PI / 4), 3.5, -8.5 * Math.sin(Math.PI / 4));
    createSpotlights(outerRing, -8.5 * Math.cos(Math.PI / 4), 3.5, -8.5 * Math.sin(Math.PI / 4));

    addMobiusStrip(outerRing, -8.5 * Math.cos(3 * Math.PI / 4), 3.5, -8.5 * Math.sin(3 * Math.PI / 4)); 
    createSpotlights(outerRing, -8.5 * Math.cos(3 * Math.PI / 4), 3.5, -8.5 * Math.sin(3 * Math.PI / 4));

   addHelix(outerRing, 8.5 * Math.cos(3 * Math.PI / 4), 3.5, 8.5 * Math.sin(3 * Math.PI / 4));
   createSpotlights(outerRing, 8.5 * Math.cos(3 * Math.PI / 4), 3.5, 8.5 * Math.sin(3 * Math.PI / 4));

}


//////////////////////
/* PARAMETRIC SHAPES */
//////////////////////

function elipsoideFunction(u, v, target) {
    const a = 0.5; 
    const b = 0.9; 
    const c = 0.9; 

    const phi = u * Math.PI;
    const theta = v * Math.PI * 2;

    const x = a * Math.sin(phi) * Math.cos(theta);
    const y = b * Math.sin(phi) * Math.sin(theta);
    const z = c * Math.cos(phi);

    target.set(x, y, z);

}

function torusFunction(u, v, target) {
    const R = 0.7; // Major radius
    const r = 0.1; // Minor radius

    const phi = u * 2 * Math.PI;
    const theta = v * 2 * Math.PI;

    const x = (R + r * Math.cos(theta)) * Math.cos(phi);
    const y = (R + r * Math.cos(theta)) * Math.sin(phi);
    const z = r * Math.sin(theta);

    target.set(x, y, z);
}

function hyperboloidFunction(u, v, target) {
    const a = 0.3, b = 0.3, c = 0.7;
    const phi = u * 2 * Math.PI, t = v * 2 - 1;
    const x = a * Math.cosh(t) * Math.cos(phi);
    const y = b * Math.cosh(t) * Math.sin(phi);
    const z = c * Math.sinh(t);
    target.set(x, y, z);
}

function paraboloidFunction(u, v, target) {
    const a = 0.5, b = 0.5;
    const phi = u * 2 * Math.PI, t = v;
    const x = a * t * Math.cos(phi);
    const y = b * t * Math.sin(phi);
    const z = t * t;
    target.set(x, y, z);
}

function kleinBottleFunction(u, v, target) {
    u *= Math.PI;
    v *= 2 * Math.PI;
    u = u * 2;
    const x = (2 + Math.cos(u / 2) * Math.sin(v) - Math.sin(u / 2) * Math.sin(2 * v)) * Math.cos(u);
    const y = (2 + Math.cos(u / 2) * Math.sin(v) - Math.sin(u / 2) * Math.sin(2 * v)) * Math.sin(u);
    const z = Math.sin(u / 2) * Math.sin(v) + Math.cos(u / 2) * Math.sin(2 * v);
    target.set(x, y, z);
}

function sineWaveFunction(u, v, target) {
    const x = u * 4 - 2;
    const y = Math.sin(4 * Math.PI * v);
    const z = v * 4 - 2;
    target.set(x, y, z);
}

function mobiusStripFunction(u, v, target) {
    u = u - 0.5;
    const t = 2 * Math.PI * v;
    const x = Math.cos(t) * (1 + 0.5 * u * Math.cos(t / 2));
    const y = Math.sin(t) * (1 + 0.5 * u * Math.cos(t / 2));
    const z = 0.5 * u * Math.sin(t / 2);
    target.set(x, y, z);
}

function helixFunction(u, v, target) {
    const t = 2 * Math.PI * u;
    const r = 0.1;
    const x = r * Math.cos(t);
    const y = r * Math.sin(t);
    const z = 2 * Math.PI * v;
    target.set(x, y, z);
}

function addHelix(obj, x, y, z) {
    'use strict';

    helixGeometry = new ParametricGeometry(helixFunction, 100, 100);
    helixMesh = new THREE.Mesh(helixGeometry, material);

    helixMesh.scale.set(0.25, 0.25, 0.25);

    obj.add(helixMesh);
    helixMesh.position.set(x, y, z);
    helixMesh.userData.rotationAxis = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
    helixMesh.userData.rotationSpeed = Math.random() * 5 + 1; // Random speed between 1 and 5
    objectlist.push(helixMesh);
}

function addMobiusStrip(obj, x, y, z, n) {
    'use strict';
    const radius = 1;
    const tubeRadius = 0.3;
    const radialSegments = 100;
    const tubularSegments = 50;
    const vertices = [];
    const indices = [];


    if (y >= 8) {
        for (let i = 0; i <= radialSegments; i++) {
            for (let j = 0; j <= tubularSegments; j++) {
                const u = i / radialSegments * Math.PI * 2;
                const v = j / tubularSegments * 2 - 1;
                const x = (radius + v * Math.cos(u / 2)) * Math.cos(u);
                const y = (radius + v * Math.cos(u / 2)) * Math.sin(u);
                const z = v * Math.sin(u / 2);
                vertices.push(x, y, z);
            }
        }
    
        for (let i = 0; i < radialSegments; i++) {
            for (let j = 0; j < tubularSegments; j++) {
                const a = i * (tubularSegments + 1) + j;
                const b = (i + 1) * (tubularSegments + 1) + j;
                const c = (i + 1) * (tubularSegments + 1) + (j + 1);
                const d = i * (tubularSegments + 1) + (j + 1);
    
                indices.push(a, b, d);
                indices.push(b, c, d);
            }
        }
    
         mobiusStripGeometry = new THREE.BufferGeometry();
         mobiusStripGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
         mobiusStripGeometry.setIndex(indices);
         mobiusStripGeometry.computeVertexNormals();
         mobiusStripMesh = new THREE.Mesh(mobiusStripGeometry, material);
         mobiusStripMesh.scale.set(2, 2, 2);
        obj.add(mobiusStripMesh);
        mobiusStripMesh.position.set(x, y + 0., z);
        //rotate the mobius strip around the x-axis
        mobiusStripMesh.rotateX(Math.PI / 2);
        bigMobiusStrip = mobiusStripMesh;
    } 
    else {
    mobiusStripGeometry = new ParametricGeometry(mobiusStripFunction, 100, 100);
    mobiusStripMesh = new THREE.Mesh(mobiusStripGeometry, material);
    mobiusStripMesh.scale.set(0.50, 0.50, 0.5);
    obj.add(mobiusStripMesh);
    mobiusStripMesh.position.set(x, y, z);
    mobiusStripMesh.userData.rotationAxis = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
    mobiusStripMesh.userData.rotationSpeed = Math.random() * 5 + 1; // Random speed between 1 and 5
    objectlist.push(mobiusStripMesh);
    
    }


    

}

function addKleinBottle(obj, x, y, z) {
    'use strict';

    kleinBottleGeometry = new ParametricGeometry(kleinBottleFunction, 100, 100);
    kleinBottleMesh = new THREE.Mesh(kleinBottleGeometry, material);

    // Apply scaling transformation to match the scale of other objects
    kleinBottleMesh.scale.set(0.25, 0.25, 0.25);

    obj.add(kleinBottleMesh);
    kleinBottleMesh.position.set(x, y, z);
    kleinBottleMesh.userData.rotationAxis = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
    kleinBottleMesh.userData.rotationSpeed = Math.random() * 5 + 1; // Random speed between 1 and 5
    objectlist.push(kleinBottleMesh);
}

function addParaboloid(obj, x, y, z) {
    'use strict';

    paraboloidGeometry = new ParametricGeometry(paraboloidFunction, 100, 100);
    paraboloidMesh = new THREE.Mesh(paraboloidGeometry, material);
    obj.add(paraboloidMesh);
    paraboloidMesh.position.set(x, y, z);
    paraboloidMesh.userData.rotationAxis = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
    paraboloidMesh.userData.rotationSpeed = Math.random() * 5 + 1; // Random speed between 1 and 5
    objectlist.push(paraboloidMesh);
}

function addSineWave(obj, x, y, z) {
    'use strict';

    sineWaveGeometry = new ParametricGeometry(sineWaveFunction, 100, 100);
    sineWaveMesh = new THREE.Mesh(sineWaveGeometry, material);

    sineWaveMesh.scale.set(0.25, 0.25, 0.25);

    obj.add(sineWaveMesh);
    sineWaveMesh.position.set(x, y, z);
    sineWaveMesh.userData.rotationAxis = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
    sineWaveMesh.userData.rotationSpeed = Math.random() * 5 + 1; // Random speed between 1 and 5
    objectlist.push(sineWaveMesh);
}

function addHyperboloid(obj, x, y, z) {
    'use strict';

    hyperboloidGeometry = new ParametricGeometry(hyperboloidFunction, 100, 100);
    hyperboloidMesh = new THREE.Mesh(hyperboloidGeometry, material);
    obj.add(hyperboloidMesh);
    hyperboloidMesh.position.set(x, y, z);
    hyperboloidMesh.userData.rotationAxis = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
    hyperboloidMesh.userData.rotationSpeed = Math.random() * 5 + 1; // Random speed between 1 and 5
    objectlist.push(hyperboloidMesh);
}

function addTorus(obj, x, y, z) {
    'use strict';

    torusGeometry = new ParametricGeometry(torusFunction, 100, 100);
    torusMesh = new THREE.Mesh(torusGeometry, material);
    obj.add(torusMesh);
    torusMesh.position.set(x, y, z);
    torusMesh.userData.rotationAxis = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
    torusMesh.userData.rotationSpeed = Math.random() * 5 + 1; // Random speed between 1 and 5
    objectlist.push(torusMesh);
}

function addElipsoids(obj, x, y, z){
    'use strict';

    elipsoidgeometry = new ParametricGeometry(elipsoideFunction, 100, 100);
    elipsoidemesh = new THREE.Mesh(elipsoidgeometry, material);
    obj.add(elipsoidemesh);
    elipsoidemesh.position.set(x, y, z);
    elipsoidemesh.userData.rotationAxis = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
    elipsoidemesh.userData.rotationSpeed = Math.random() * 5  + 1;
    objectlist.push(elipsoidemesh);
}   

//////////////////////
/* CREATE CARROSSEL */
//////////////////////

function createCarrossel(x, y, z) {
    'use strict';

    carrossel = new THREE.Object3D();

    map = new THREE.TextureLoader().load("https://threejs.org/examples/textures/uv_grid_opengl.jpg");
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.anisotropy = 16;
    
    material = new THREE.MeshPhongMaterial({
        map: map,
        side: THREE.DoubleSide
    }); //TODO experimentar o MeshPhongMaterial

    addBaseCarrossel(carrossel, 0, 1, 0);
    addCilindroCentral(carrossel, 0, 9.5, 0);
    addInnerRing(carrossel, 0, 2, 0, 2); // Adiciona o anel interno
    addMiddleRing(carrossel, 0, 2, 0, 2); // Adiciona o anel do meio
    addOuterRing(carrossel, 0, 2, 0, 2); // Adiciona o anel externo
    addSkyDome(carrossel, 15, 0, 15);
    
    scene.add(carrossel);

    carrossel.position.x = x;
    carrossel.position.y = y;
    carrossel.position.z = z;
}

////////////
/* UPDATE */
////////////
function update(){
    'use strict';

    var delta = clock.getDelta();
    var movementAmount = 5; // You can adjust this value as needed
    // Move the rings up or down based on the pressed keys
    if (carrossel.children[4].userData.ascending || carrossel.children[4].userData.descending) {
        moveRing(carrossel.children[4], movementAmount * delta, 4);
    }
    if (carrossel.children[5].userData.ascending || carrossel.children[5].userData.descending) {
        moveRing(carrossel.children[5], movementAmount * delta, 5);
    }
    if (carrossel.children[6].userData.ascending || carrossel.children[6].userData.descending) {
        moveRing(carrossel.children[6], movementAmount * delta, 6);
    }

    if(rotating){
        rotateRings(carrossel.children[2], delta); //Roda cilindro central
        rotateRings(carrossel.children[3], delta); //Roda lines do cilindro central
        rotateRings(carrossel.children[4], delta); //Roda anel interno
        rotateRings(carrossel.children[5], delta); //Roda anel do meio
        rotateRings(carrossel.children[6], delta);  //Roda anel externo
        for (let obj of objectlist) {
            rotateObjects(obj, delta);
        }
    }
}

function rotateObjects(obj, delta) {
    'use strict';
    if (obj.userData.rotationAxis && obj.userData.rotationSpeed) {
        obj.rotateOnAxis(obj.userData.rotationAxis,  obj.userData.rotationSpeed * delta);
    }
}

function rotateRings(obj, amount, n){
    'use strict';
    if(n == 1){
        obj.rotation.y += amount;
    } else {
    obj.rotation.y -= 0.01;
    }
}

function moveRing(ring, amount, n) {
    var maxHeight = 15; // Maximum height for the rings
    var minHeight = 2;  // Minimum height for the rings

    if(ring.position.y + amount < maxHeight && ascending[n-4]) {
        ring.position.y += amount;
    } else{
        ascending[n-4] = false;
        descending[n-4] = true;
    }
    if(ring.position.y - amount > minHeight && descending[n-4]) {
        ring.position.y -= amount ;
    } else {
        ascending[n-4] = true;
        descending[n-4] = false;
    }

}

function updateMaterial(){
    carrossel.children.forEach(object => {
        if(object.name != 'sky')
        object.material = material;
    });
    outerRing.children.forEach(object => {
        if(object.name != 'sky')
        object.material = material;
    });
    InnerRing.children.forEach(object => {
        if(object.name != 'sky')
        object.material = material;
    });
    MidRing.children.forEach(object => {
        if(object.name != 'sky')
        object.material = material;
    });
    bigMobiusStrip.material = material;
}
/////////////
/* DISPLAY */
/////////////
function render()  {
    // Update the StereoCamera with the active camera parameters
    if (renderer.xr.isPresenting) {
        // In VR mode, update the StereoCamera with the active camera parameters
        if (cameras[activeCameraIndex] instanceof THREE.PerspectiveCamera) {
            stereoCamera.update(cameras[activeCameraIndex]);

            // Render the scene for both left and right cameras
            renderer.render(scene, stereoCamera.cameraL);
            renderer.render(scene, stereoCamera.cameraR);
        } else {
            // For other camera types in VR mode, just render the scene with the active camera
            renderer.render(scene, cameras[activeCameraIndex]);
        }
    } else {
        // In non-VR mode, just render the scene with the active camera
        renderer.render(scene, cameras[activeCameraIndex]);
    }
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
    'use strict';

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    document.body.appendChild( VRButton.createButton( renderer ) );
    renderer.xr.enabled = true;
    renderer.setClearColor(0x000000);

    createScene();
    createCameras();
    // createLights();

    render();

    
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    'use strict';

    update();
    render();
    renderer.setAnimationLoop( animate);

}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() { 
    'use strict';

    if (renderer) {
        const width = window.innerWidth;
        const height = window.innerHeight;
    
        renderer.setSize(width, height);
    
        const camera = cameras[activeCameraIndex];
        if (camera) {
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        }
    
        render();
    }
}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    'use strict';
    var key = e.key; //TODO: adicionar caso de maiusculas
    pressedKeys.add(key);
    switch (key) {
        case '1':
            carrossel.children[4].userData.ascending = true;
            break;
        case '2':
            carrossel.children[5].userData.descending = true;
            break;
        case '3':
            carrossel.children[6].userData.ascending = true;
            break;
        case '4':
            rotating = true;
            break;
        case '5':
            rotating = false;
            break; 
        case "q":
            material =  new THREE.MeshLambertMaterial({  map: map,
                side: THREE.DoubleSide });
            updateMaterial();  
            break;
        case "w":
            material =  new THREE.MeshPhongMaterial({
                map: map,
                side: THREE.DoubleSide

            });
            updateMaterial();
            break;
        case "e":
            material = new THREE.MeshToonMaterial({  map: map,
                side: THREE.DoubleSide  });
            updateMaterial();
            break;
        case "r":
            material = new THREE.MeshNormalMaterial({  map: map,
                side: THREE.DoubleSide});
            updateMaterial();
            break;
        case "t":
            material =  new THREE.MeshBasicMaterial({   map: map,
                side: THREE.DoubleSide  });
            updateMaterial();
            break;
        case "y":
            activeCameraIndex = 2;
            break;
        case 'd':
            toggleDirectionalLight();
            break;
        case  "p":
            togglePointLight();
            break;
        case "s":
            toggleSpotLight();
            break;
        
    }
    render();
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e){
    'use strict';
    var key = e.key;
    pressedKeys.delete(key);
    switch (key) {
        case '1':
            carrossel.children[4].userData.ascending = false;
            break;
        case '2':
            carrossel.children[5].userData.descending = false;
            break;
        case '3':
            carrossel.children[6].userData.ascending = false;
            break;
    }
}

init();
animate();