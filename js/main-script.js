import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';


//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

var perspectiveCamera, frontalCamera, lateralCamera, topCamera, orthogonalCamera, mobileCamera;
//var cameras = [];
var activeCamera = 0; // Variable to switch between cameras
var scene, renderer;
var edgeMaterial;
var clock = new THREE.Clock(true);
var rotationSpeed = 0.5, movingSpeed = 4;
var carrossel, smallerRing, middleRing, biggerRing, centralCylinder;
var currentMaterial;
var materials1, materials2, materials3, materialsCyl;
var directionalLight;
var spotLights = new Array();
var pointLights = new Array();
var changeMaterial = false;
var carrosselObjects = new Array();
var mobiusMesh;



/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene(){
    'use strict';

    scene = new THREE.Scene();
    scene.add(new THREE.AxesHelper(15));
    edgeMaterial = new THREE.LineBasicMaterial({ color: 0x0});
    createLights();
    createCarrossel(0,0,0);
    createSpotLights();
    createPointLights();
    createSkyDome();

}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCamera() {
    'use strict';
    // Define scene center
    const sceneCenter = new THREE.Vector3(0, 0, 0);

    perspectiveCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    perspectiveCamera.position.set(45, 30, 45);
    perspectiveCamera.lookAt(sceneCenter);    
}


/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

function createLights(){

    directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Cor branca e intensidade 1
    directionalLight.position.set(20, 6, 20); // Defina a posição da luz direcional
    directionalLight.target.position.set(0,0,0);
    scene.add(directionalLight); // Adicione a luz direcional à cena
    
    // Crie uma luz ambiente
    const ambientLight = new THREE.AmbientLight(0xffa500, 0.2); // Cor alaranjada e baixa intensidade
    scene.add(ambientLight); // Adicione a luz ambiente à cena

}

function createSpotLights(){
    var rings = 0;
    var radius = 6;
    while(rings < 3){
        for (let i = 0; i < 8; i++) {

            const spotLight = new THREE.SpotLight(0xffffff); // Specify the color of the light

            // Set spotlight properties
            spotLight.angle = Math.PI; // Set the spotlight's cone angle (in radians)
            spotLight.penumbra = 0.5; // Set the softness of the spotlight's edges (0 for hard edges, 1 for soft edges)
            spotLight.decay = 1; // Set the intensity decay of the light with distance
            spotLight.distance = 200; // Set the maximum range of the light
            spotLight.intensity = 10; // Increase the intensity of the light
        
            // Calculate the angle for this spotlight
            const angle = (i / 8) * Math.PI * 2;
        
            // Calculate the position of the spotlight using polar coordinates
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
        
            // Set the position of the cloned spotlight
            spotLight.position.set(x, 2, z); // Set the position of the light
            spotLight.target.position.set(x, 10, z); // Set the position of the light's target

            if(rings == 0){
                smallerRing.add(spotLight);
            }else if(rings == 1){
                middleRing.add(spotLight);
            }else{
                biggerRing.add(spotLight);
            }

            spotLights.push(spotLight);
            
        }
        rings++;
        radius += 8;
    }

}


function createPointLights(){

    const numLights = 8; // Number of point lights
    for (let i = 0; i < numLights; i++) {
        const u = i / numLights * Math.PI * 2;
        const v = 0; 
        const radius = 17;

        const x = Math.cos(u) * (radius + v * Math.cos(u / 2));
        const y = Math.sin(u) * (radius + v * Math.cos(u / 2));
        const z = v * Math.sin(u / 2);


        const pointLight = new THREE.PointLight(0xffffff, 10, 200, 2);
        pointLight.position.set(x, y, z);
        mobiusMesh.add(pointLight);

        pointLights.push(pointLight);

        
    }
}


////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function createGround(x, y, z) {
    'use script';

    const geometry = new THREE.CylinderGeometry(30,30,1);
    const material = new THREE.MeshBasicMaterial({ color: 0x8c92ac});
    const ground = new THREE.Mesh(geometry, material);

    const edge = new THREE.EdgesGeometry(ground.geometry);
    const wireframeEdge = new THREE.LineSegments(edge,edgeMaterial);
    wireframeEdge.position.set(x,y,z);
    
    scene.add(ground);
    scene.add(wireframeEdge);
    ground.position.set(x,y,z);


}

function createSkyDome() {
    // Create the sky dome
    const sky_geometry = new THREE.SphereGeometry(50, 60, 40);
    const sky_texture = new THREE.TextureLoader().load('images/SkyDome.png'); // Load your sky texture
    const material = new THREE.MeshBasicMaterial({
        map: sky_texture,
        side: THREE.BackSide // Make the sphere's material visible from the inside
    });
    const skyDome = new THREE.Mesh(sky_geometry, material);
    skyDome.rotateY(Math.PI);
    scene.add(skyDome);
}

function createCarrossel(x, y, z){

    carrossel = new THREE.Object3D();
    carrossel.userData = {rotating: true};
    createMaterials();
    addCentralCylinder(carrossel, x, y, z);
    addSmallerRing(carrossel, x, y, z);
    addMiddleRing(carrossel, x, y, z);
    addBiggerRing(carrossel, x, y, z);
    createMobiusStrip(carrossel, x, y, z);

    carrossel.position.set(x, y, z)
    scene.add(carrossel);

}


function createMaterials() {

    materials1 = {
        lambert: new THREE.MeshLambertMaterial({ color: 0x529DF4, side: THREE.DoubleSide }),
        phong: new THREE.MeshPhongMaterial({ color: 0x529DF4, side: THREE.DoubleSide }),
        toon: new THREE.MeshToonMaterial({ color: 0x529DF4, side: THREE.DoubleSide }),
        normal: new THREE.MeshNormalMaterial({ side: THREE.DoubleSide }),
        basic: new THREE.MeshBasicMaterial({ color: 0x529DF4, side: THREE.DoubleSide })
    };

    materials2 = {
        lambert: new THREE.MeshLambertMaterial({ color: 0x5852F4, side: THREE.DoubleSide }),
        phong: new THREE.MeshPhongMaterial({ color: 0x5852F4, side: THREE.DoubleSide }),
        toon: new THREE.MeshToonMaterial({ color: 0x5852F4, side: THREE.DoubleSide }),
        normal: new THREE.MeshNormalMaterial({ side: THREE.DoubleSide }),
        basic: new THREE.MeshBasicMaterial({ color: 0x5852F4, side: THREE.DoubleSide })
    };

    materials3 = {
        lambert: new THREE.MeshLambertMaterial({ color: 0xA952F4, side: THREE.DoubleSide }),
        phong: new THREE.MeshPhongMaterial({ color: 0xA952F4, side: THREE.DoubleSide }),
        toon: new THREE.MeshToonMaterial({ color: 0xA952F4, side: THREE.DoubleSide }),
        normal: new THREE.MeshNormalMaterial({ side: THREE.DoubleSide }),
        basic: new THREE.MeshBasicMaterial({ color: 0xA952F4, side: THREE.DoubleSide })
    };
    materialsCyl = {
        lambert: new THREE.MeshLambertMaterial({ color: 0xA952F4, side: THREE.FrontSide }),
        phong: new THREE.MeshPhongMaterial({ color: 0xA952F4, side: THREE.FrontSide }),
        toon: new THREE.MeshToonMaterial({ color: 0xA952F4, side: THREE.FrontSide }),
        normal: new THREE.MeshNormalMaterial({ side: THREE.FrontSide }),
        basic: new THREE.MeshBasicMaterial({ color: 0xA952F4, side: THREE.FrontSide })
    };
     
    
    currentMaterial = "normal";
}


function addCentralCylinder(obj, x, y, z){
    
    
    const geometry = new THREE.CylinderGeometry(2, 2, 20);
    centralCylinder = new THREE.Mesh(geometry, materialsCyl[currentMaterial]);

    obj.add(centralCylinder);
    centralCylinder.position.set(x, y+10, z);
    
}

function createMobiusStrip(obj, x, y, z) {
    
    const geometry = createMobiusStripGeometry(16, 6, 32);
    mobiusMesh = new THREE.Mesh(geometry, materials2[currentMaterial]);

    obj.add(mobiusMesh);
    mobiusMesh.rotateX(Math.PI / 2);
    mobiusMesh.position.set(x, y+25, z);
}

function createMobiusStripGeometry(radius, width, segments) {
    const geometry = new THREE.BufferGeometry();
    
    const positions = [];
    const indices = [];

    for (let i = 0; i <= segments; i++) {
        const u = i / segments * Math.PI * 2;

        for (let j = 0; j <= 1; j++) {
            const v = (j - 0.5) * width;

            // Möbius strip parametric equations
            const x = Math.cos(u) * (radius + v * Math.cos(u / 2));
            const y = Math.sin(u) * (radius + v * Math.cos(u / 2));
            const z = v * Math.sin(u / 2);

            positions.push(x, y, z);
        }
    }

    for (let i = 0; i < segments; i++) {
        const a = 2 * i;
        const b = 2 * i + 1;
        const c = 2 * (i + 1);
        const d = 2 * (i + 1) + 1;

        indices.push(a, b, c);
        indices.push(b, d, c);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals(); // Compute normals for correct shading

    return geometry;
}

function addSmallerRing(obj, x, y, z){

    const shape = new THREE.Shape();
    const innerRadius = 2;
    const outerRadius = 10;

    // Move to the starting point of the outer circle
    shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);

    // Move to the starting point of the inner circle
    shape.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);

    smallerRing = new THREE.Object3D();
    smallerRing.userData = {moveSmallerRing: false, moveUpSmallerRing: true, moveDownSmallerRing: false};
    const extrudedGeometry = new THREE.ExtrudeGeometry(shape, {depth: 2, bevelEnabled: false});
    const ring = new THREE.Mesh(extrudedGeometry, materials3[currentMaterial]);

    
    ring.position.set(x, y, z);
    ring.rotateX(Math.PI / 2);
    smallerRing.add(ring);
    
    obj.add(smallerRing);
    smallerRing.position.set(x, y+2, z);

    addSuperficies(smallerRing, x, y, z, (innerRadius+outerRadius)/2);
    // smallerRing.rotateY(Math.PI/6);
    
}

function addMiddleRing(obj, x, y, z){

    const shape = new THREE.Shape();
    const innerRadius = 10;
    const outerRadius = 18;

    // Move to the starting point of the outer circle
    shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);

    // Move to the starting point of the inner circle
    shape.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);

    middleRing = new THREE.Object3D();
    middleRing.userData = {moveMiddleRing: false, moveUpMiddleRing: true, moveDownMiddleRing: false};
    const extrudedGeometry = new THREE.ExtrudeGeometry(shape, {depth: 2, bevelEnabled: false});
    const ring = new THREE.Mesh(extrudedGeometry, materials3[currentMaterial]);

    ring.position.set(x, y, z);
    ring.rotateX(Math.PI / 2);
    middleRing.add(ring);

    obj.add(middleRing);
    middleRing.position.set(x, y+2, z);

    addSuperficies(middleRing, x, y, z, (innerRadius+outerRadius)/2);
    // middleRing.rotateY(Math.PI/12);
}

function addBiggerRing(obj, x, y, z){

    const shape = new THREE.Shape();
    const innerRadius = 18;
    const outerRadius = 26;

    // Move to the starting point of the outer circle
    shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);

    // Move to the starting point of the inner circle
    shape.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);

    biggerRing = new THREE.Object3D();
    biggerRing.userData = {moveBiggerRing: false, moveUpBiggerRing: true, moveDownBiggerRing: false};
    const extrudedGeometry = new THREE.ExtrudeGeometry(shape, {depth: 2, bevelEnabled: false});
    const ring = new THREE.Mesh(extrudedGeometry, materials3[currentMaterial]);

    ring.position.set(x, y, z);
    ring.rotateX(Math.PI / 2);
    biggerRing.add(ring);

    obj.add(biggerRing);
    biggerRing.position.set(x, y+2, z);

    addSuperficies(biggerRing, x, y, z, (innerRadius+outerRadius)/2);
    addSuperficies(biggerRing, x, y, z, (innerRadius+outerRadius)/2);
}

function addSuperficies(obj, x, y, z, rad) {

    // Create Elipsoide
    const geometry = new ParametricGeometry(elipsoideFunction, 50, 50);
    const mesh = new THREE.Mesh(geometry, materials1[currentMaterial]);

    obj.add(mesh);
    mesh.position.set(x+rad, y+2, z); //ok
    carrosselObjects.push(mesh);

    // Create Torus
    const torusGeometry = new ParametricGeometry(torusFunction, 16, 16);
    const torusMesh = new THREE.Mesh(torusGeometry, materials1[currentMaterial]);
    scene.add(torusMesh);

    obj.add(torusMesh);
    torusMesh.position.set(x, y+2, z+rad); //ok
    carrosselObjects.push(torusMesh);

    // Create Klein
    const kleinGeometry = new ParametricGeometry(kleinFunction, 100, 100);
    const kleinMesh = new THREE.Mesh(kleinGeometry, materials1[currentMaterial]);
    scene.add(kleinMesh);

    obj.add(kleinMesh);
    kleinMesh.position.set(x-rad, y+2, z); //ok
    carrosselObjects.push(kleinMesh);

    
    // Create Helicoid
    const heliGeometry = new ParametricGeometry(helicoidFunction, 40, 40);
    const heliMesh = new THREE.Mesh(heliGeometry, materials1[currentMaterial]);
    scene.add(heliMesh);

    obj.add(heliMesh);
    heliMesh.rotateY(-Math.PI / 4);
    heliMesh.position.set(x+rad*(Math.cos(3*Math.PI/4)), y+2, z+rad*(Math.sin(3*Math.PI/4)));
    carrosselObjects.push(heliMesh);

    // Create Hiperboloid
    const hGeometry = new ParametricGeometry(hyperboloidFunction, 16, 16);
    const hMesh = new THREE.Mesh(hGeometry, materials1[currentMaterial]);
    scene.add(hMesh);

    obj.add(hMesh);
    hMesh.position.set(x, y+2, z-rad);
    carrosselObjects.push(hMesh);

    // Create Hiperbolic Paraboloid
    const hpGeometry = new ParametricGeometry(hyperbolicParaboloidFunction, 16, 16);
    const hpMesh = new THREE.Mesh(hpGeometry, materials1[currentMaterial]);
    scene.add(hpMesh);

    obj.add(hpMesh);
    hpMesh.position.set(x+rad*(Math.cos(Math.PI/4)), y+2, z+rad*(Math.sin(Math.PI/4)));
    carrosselObjects.push(hpMesh);

    // Create Horn Torus
    const htGeometry = new ParametricGeometry(hornTorus, 16, 16);
    const htMesh = new THREE.Mesh(htGeometry, materials1[currentMaterial]);
    scene.add(htMesh);

    obj.add(htMesh);
    htMesh.rotateX(Math.PI/3);
    htMesh.position.set(x+rad*(Math.cos(-Math.PI/4)), y+2, z+rad*(Math.sin(-Math.PI/4)));
    carrosselObjects.push(htMesh);

    // Create enneper Surface
    const esGeometry = new ParametricGeometry(enneperSurface, 16, 16);
    const esMesh = new THREE.Mesh(esGeometry, materials1[currentMaterial]);
    scene.add(esMesh);

    obj.add(esMesh);
    esMesh.rotateY(-Math.PI / 2);
    esMesh.position.set(x+rad*(Math.cos(-3*Math.PI/4)), y+2, z+rad*(Math.sin(-3*Math.PI/4)));
    carrosselObjects.push(esMesh);

}

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
    const R = 0.6, r = 0.3;

    u *= 2 * Math.PI;
    v *= 2 * Math.PI;

    const x = (R + r * Math.cos(v)) * Math.cos(u);
    const y = (R + r * Math.cos(v)) * Math.sin(u);
    const z = r * Math.sin(v);

    target.set(x, y, z);

}

function kleinFunction(u, v, target) {
    u *= 2 * Math.PI; // u ranges from 0 to 2π
    v *= 2 * Math.PI; // v ranges from 0 to 2π

    const r = 0.2; // radius of the tube

    const x = (r + Math.cos(u / 2) * Math.sin(v) - Math.sin(u / 2) * Math.sin(2 * v)) * Math.cos(u);
    const y = (r + Math.cos(u / 2) * Math.sin(v) - Math.sin(u / 2) * Math.sin(2 * v)) * Math.sin(u);
    const z = Math.sin(u / 2) * Math.sin(v) + Math.cos(u / 2) * Math.sin(2 * v);

    target.set(x/2, y/2, z/2);

}

function helicoidFunction(u, v, target) {
    u *= Math.PI * 2; 
    v = v * 1.6 - 0.8; 

    const a = 0.3; 
    const x = v * Math.cos(u);
    const y = v * Math.sin(u);
    const z = a * u;

    target.set(x, y, z);
}

function hyperboloidFunction(u, v, target) {

    const a = 0.4, b = 0.4;

    u *= 2 * Math.PI;
    v = v * 4 - 2;

    const x = a * Math.cosh(v) * Math.cos(u);
    const y = a * Math.cosh(v) * Math.sin(u);
    const z = b * Math.sinh(v);

    target.set(x/2, y/2, z/2);

}

function hyperbolicParaboloidFunction(u, v, target) {
    u = u * 1.6 - 0.8; 
    v = v * 1.6 - 0.8; 

    const x = u;
    const y = v;
    const z = u * u - v * v;

    target.set(x, y, z);

}

function hornTorus(u, v, target) {
    u *= 2 * Math.PI; // u ranges from 0 to 2π
    v *= 2 * Math.PI; // v ranges from 0 to 2π

    const r = 0.5; // radius of the tube
    const R = r; // major radius is equal to the minor radius

    const x = (R + r * Math.cos(v)) * Math.cos(u);
    const y = (R + r * Math.cos(v)) * Math.sin(u);
    const z = r * Math.sin(v);

    target.set(x, y, z);
}

// Parametric function for a seashell
function enneperSurface(u, v, target) {
    u = (u - 0.5) * 3; // u ranges from -2 to 2
    v = (v - 0.5) * 3; // v ranges from -2 to 2

    const x = u - (u ** 3) / 3 + u * (v ** 2);
    const y = v - (v ** 3) / 3 + v * (u ** 2);
    const z = (u ** 2 - v ** 2);

    target.set(x/4, y/4, z/4);
}



//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollision(obj1, obj2) {
    
}


///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions(idx1){
    
}

////////////
/* UPDATE */
////////////
function update(){
    'use strict';

    var delta = clock.getDelta();
    let rSpeed = rotationSpeed * delta;
    let mSpeed = movingSpeed * delta;
    

    //rotating carrossel
    if (carrossel.userData.rotating) {
        carrossel.rotation.y += rSpeed; 
    }
    
    // move smaller ring
    if (smallerRing.userData.moveSmallerRing) {
        if(smallerRing.userData.moveUpSmallerRing){
            if(smallerRing.position.y < 20){  
                smallerRing.position.y += mSpeed;
            }
            else{
                smallerRing.userData.moveUpSmallerRing = false;
                smallerRing.userData.moveDownSmallerRing = true;
            }
        }
        if(smallerRing.userData.moveDownSmallerRing){
            if(smallerRing.position.y > 2){  
                smallerRing.position.y -= mSpeed;
            }
            else{
                smallerRing.userData.moveUpSmallerRing = true;
                smallerRing.userData.moveDownSmallerRing = false;
            }
        }
    }

    // move middle ring
    if (middleRing.userData.moveMiddleRing) {
        if(middleRing.userData.moveUpMiddleRing){
            if(middleRing.position.y < 20){  
                middleRing.position.y += mSpeed;
            }
            else{
                middleRing.userData.moveUpMiddleRing = false;
                middleRing.userData.moveDownMiddleRing = true;
            }
        }
        if(middleRing.userData.moveDownMiddleRing){
            if(middleRing.position.y > 2){  
                middleRing.position.y -= mSpeed;
            }
            else{
                middleRing.userData.moveUpMiddleRing = true;
                middleRing.userData.moveDownMiddleRing = false;
            }
        }
    }

    // move bigger ring
    if (biggerRing.userData.moveBiggerRing) {
        if(biggerRing.userData.moveUpBiggerRing){
            if(biggerRing.position.y < 20){  
                biggerRing.position.y += mSpeed;
            }
            else{
                biggerRing.userData.moveUpBiggerRing = false;
                biggerRing.userData.moveDownBiggerRing = true;
            }
        }
        if(biggerRing.userData.moveDownBiggerRing){
            if(biggerRing.position.y > 2){  
                biggerRing.position.y -= mSpeed;
            }
            else{
                biggerRing.userData.moveUpBiggerRing = true;
                biggerRing.userData.moveDownBiggerRing = false;
            }
        }
    }

    if (changeMaterial){
        updateMaterials();
        changeMaterial = false;
    }

    // Rotate Pieces
    for (let i = 0; i<carrosselObjects.length; i+=2) {
        carrosselObjects[i].rotation.y += rSpeed;
    }
    for (let i = 1; i<carrosselObjects.length; i+=2) {
        if(i%8 != 3) {
            carrosselObjects[i].rotation.y -= rSpeed*2;
        }
        else {
            carrosselObjects[i].rotation.z -= rSpeed*2;
        }
    }

}

function updateMaterials() {
    console.log(currentMaterial, smallerRing);

    smallerRing.traverse(function(child) {
        if (child instanceof THREE.Mesh) {
            child.material = materials3[currentMaterial];;
        }
    });

    middleRing.traverse(function(child) {
        if (child instanceof THREE.Mesh) {
            child.material = materials3[currentMaterial];;
        }
    });

    biggerRing.traverse(function(child) {
        if (child instanceof THREE.Mesh) {
            child.material = materials3[currentMaterial];;
        }
    });

    centralCylinder.material = materialsCyl[currentMaterial];
    mobiusMesh.material = materials2[currentMaterial];

    for (let obj of carrosselObjects) {
        obj.material = materials1[currentMaterial];
    }

}

function toggleSpotLights(){
    for(let i = 0; i < spotLights.length; i++){
        spotLights[i].visible = !spotLights[i].visible;
    }
}

function togglePointLights(){
    for(let i = 0; i < pointLights.length; i++){
        pointLights[i].visible = !pointLights[i].visible;
    }
}



/////////////
/* DISPLAY */
/////////////
function render() {
    'use strict';
    
    renderer.render(scene, perspectiveCamera);
}



////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
    'use strict';
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff);
    document.body.appendChild(renderer.domElement);

    document.body.appendChild( VRButton.createButton( renderer ) );
    renderer.xr.enabled = true;



    createScene();
    createCamera();
    createGround(0,-0.51,0)

    render();

    window.addEventListener('resize', onResize);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    'use strict';

    update();

    render();

}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() { 
    'use strict';

    renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerHeight > 0 && window.innerWidth > 0) {
        perspectiveCamera.aspect = window.innerWidth / window.innerHeight;
        perspectiveCamera.updateProjectionMatrix();
    }

}

///////////////////////
/* KEY DOWN CALLBACK */ 
///////////////////////
function onKeyDown(e) {
    'use strict';
    
    switch (e.key) {
        case '1':
            smallerRing.userData.moveSmallerRing = true;
            break;
        case '2':
            middleRing.userData.moveMiddleRing = true;
            break;
        case '3':
            biggerRing.userData.moveBiggerRing = true;
            break;
        case '5':
            activeCamera = 4;
            break;
        case 'q':
        case 'Q':
            changeMaterial = true;
            currentMaterial = "lambert";
            break;
        case 't':
        case 'T':
            changeMaterial = true;
            currentMaterial = "basic";
            break;
        case 'w':
        case 'W':
            changeMaterial = true;
            currentMaterial = "phong";
            break;
        case 's':
        case 'S':
            toggleSpotLights();
            break;
        case 'e':
        case 'E':
            changeMaterial = true;
            currentMaterial = "toon";
            break;
        case 'd':
        case 'D':
            directionalLight.visible = !directionalLight.visible;
            break;
        case 'r':
        case 'R':
            changeMaterial = true;
            currentMaterial = "normal";
            break;
        case 'p':
        case 'P':
            togglePointLights();
            break;
        default:
            break;
    }


    render();
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e){ 
    'use strict';
    
    switch (e.key) {
        case '1':
            smallerRing.userData.moveSmallerRing = false;
            break;
        case '2':
            middleRing.userData.moveMiddleRing = false;
            break;
        case '3':
            biggerRing.userData.moveBiggerRing = false;
            break;
        default:
            break;
    }
}

init();

renderer?.setAnimationLoop( animate);