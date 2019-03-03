
var container, mapcontainer, stats, controls, lineUI, gui, stats;
var camera, mapCamera, MainScene, BackgroundScene, renderer, MapRenderer, clock, composer, Mapcomposer;
var lightpos, dirLight, angle;
var skyBox;

var objects = [];
var raycaster;
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;
var worldObjects;
var colliding;
var prevTime = performance.now();
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();
var vertex = new THREE.Vector3();
var color = new THREE.Color();
var skyMaterial;
var landMassObject;
var collisionCheck;

var cycleDuration = 100;
var dawnDuration = 5;
var duskDuration = 5;
var D_N_Time = 0;
var rotation = 0;

// Custom global variables
var mouse = { x: 0, y: 0 };
var resolution = 3;
var octaves;
var persistance;
var lacunarity;
var seed = 13;
var noiseScale;
var offset = { x: 0, y: 0 };
var textureSize = 512;
var mouseDown = false;
var skyboxuniforms;

var playerBox;
var SpriteGroupManage;

var characterList = [];

//var textureList = [];

var planetSize, planetData, inPlanet, planet,
    planetText, planetTextInfo, atmoMaterial, planetTilt, hasRings,
    PlanetMaterial, moonList, ringsList, outline,
    atmo, planetRotationPeriod, planetSelected;

var targetPoint = { object: new THREE.Object3D(), size: 0 };

var sphereGeom;
var timer = 0;
var timeLimit = .25;
var startTime = Date.now();
var targetBox = { topR: 0, topL: 0, bottomR: 0, bottomL: 0 };
var transitionWidthInfo;
var atmoGrad;
var showMoonOrbits;

var startexture;
var SkyColors = [];

var cubeTest;
var skyColor = [];

var skyboxuniforms =
{
    resolution: { type: "v2", value: new THREE.Vector2() },
    randomColsMults: {
        type: "v3",
        value: new THREE.Vector3(
            randomRange(0, 10),
            randomRange(0, 10),
            randomRange(0, 10))
    },
    time: { type: "f", value: 1.0 },
    _MainTex: { type: "t", value: null },
    skyCol: { type: "i", value: new THREE.Vector4(.48, .89, .90, 1) },
}

var planetUniform =
{
    indexMatrix16x16: { type: "fv1", value: DitherPattern4x4 },
    palette: { type: "v3v", value: GrayScalePallete },
    paletteSize: { type: "i", value: 8 },
    texture: { type: "t", value: null },
    lightpos: { type: 'v3', value: new THREE.Vector3(0, 30, 20) },
    noTexture: { type: "i", value: 0 },
    customColorSwitch: { type: "i", value: 1 },
    customColor: { type: "i", value: new THREE.Vector4(.48, .89, .90, 1) }
};

var sundata =
{
    radius: 1.5424, tilt: 0, N1: 125.1228, N2: 0,
    i1: 10.6, i2: 0, w1: 318.0634, w2: 0.1643573223,
    a1: 0.5, a2: 0, e1: 0, e2: 0,
    M1: 115.3654, M2: 13.0649929509, period: 1, moonSize: "",
    moonObject: "", material: "", selected: false,
    moonOrbit: 0, orbitSpeedMult: 2, inMoon: false, text: false
}

var ShaderLoadList =
{
    planet: new Shader
        (
        ),
}

init();
animate();

function Shader(vertex, fragment) {
    this.vertex = vertex;
    this.fragment = fragment;
}

//Yummy Yum Yum
function textParse(glsl, shadow_text, dither_text) {
    var text = glsl.replace("AddShadow", shadow_text);
    text = text.replace("AddDither", dither_text);

    return text;
}


function FogController() {
    var fogFarValue = controls.getObject().position.y;

    //MainScene.fog.far = fogFarValue;

    //console.log(fogFarValue);
}

function DayNightCycle(delta) {

    if (cycleDuration > 1) {
        rotation = (rotation + 360 / cycleDuration * delta) % 360;
        D_N_Time = rotation / 360;
        // roation = Euler (r, 0, 0)

        //console.log(D_N_Time);
        SetSkyColor(D_N_Time);
    }

    var nightToDay = 0.25;
    var dayToNight = 0.75;
    var dawnNormalized = dawnDuration / cycleDuration / 2.0;
    var duskNormalized = duskDuration / cycleDuration / 2.0;

    D_N_Time = (D_N_Time + nightToDay) % 1.0;

    // Set night and day variables depending on what time it is
    if (D_N_Time > nightToDay + dawnNormalized && D_N_Time < dayToNight - dawnNormalized) {
        day = true;
        night = dawn = dusk = false;
    } else {
        if (D_N_Time < nightToDay - duskNormalized || D_N_Time > dayToNight + duskNormalized) {
            night = true;
            day = dawn = dusk = false;
        } else {
            if (D_N_Time < (nightToDay + dayToNight) / 2) {
                dawn = true;
                day = night = dusk = false;
            } else {
                dusk = true;
                day = night = dawn = false;
            }
        }
    }

    //console.log("Night: " + night + " Dawn: " + dawn + " Day: " + day + " Dusk: " + dusk )
}

function SetSkyColor(d_n_time) {

    var index = (skyColor.length * d_n_time);

    var a = skyColor[Math.floor(index)];
    var b = skyColor[Math.ceil(index) % skyColor.length];

    var lerped = new THREE.Vector3();

    lerped.lerpVectors(a, b, index - Math.floor(index));


    //MainScene.background = new THREE.Color(lerped.x, lerped.y, lerped.z, 0.7);
    MainScene.fog.color = new THREE.Color(lerped.x, lerped.y, lerped.z, 0.7);
    //console.log(new THREE.Color(lerped.x, lerped.y, lerped.z, 0.7).getHex());

    if (skyMaterial !== undefined) {
        //console.log("poo");
        skyMaterial.uniforms.skyCol.value = new THREE.Vector4(lerped.x, lerped.y, lerped.z, 0.7);
    }
    //console.log(index);
}

function init() {

    skyColor = [
        new THREE.Vector3(0.4, 0.588, 0.729),
        new THREE.Vector3(0.886, 0.890, 0.545),
        new THREE.Vector3(0.905, 0.647, 0.325),
        new THREE.Vector3(0.494, 0.294, 0.407),
        new THREE.Vector3(0.160, 0.160, 0.396),
    ];

    clock = new THREE.Clock();
    resolution = (window.devicePixelRatio == 1) ? 3 : 4;;

    BackgroundScene = new THREE.Scene();

    var sizex = window.innerWidth * 35;
    var sizey = window.innerHeight * 35;
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);

    MainScene = new THREE.Scene();

    //MainScene.background = new THREE.Color(0x42c5ff);
    MainScene.fog = new THREE.Fog(0x42c5ff, 0.0025, 7000);

    dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    var vector = new THREE.Vector3(750, 500, 1000);
    dirLight.position.set(vector);

    dirLight.shadow.camera.near = 0.01;
    dirLight.castShadow = true;

    var d = 550;

    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;

    dirLight.shadow.mapSize.width = 512;
    dirLight.shadow.mapSize.height = 512;

    dirLight.shadow.camera.far = 2500;
    dirLight.shadow.bias = -0.01;

    MainScene.add(dirLight);
    dirLight.position.set(1000, 1000, 1);
    controls = new THREE.PointerLockControls(camera);

    var blocker = document.getElementById('blocker');
    var instructions = document.getElementById('instructions');

    instructions.addEventListener('click', function () {

        controls.lock();

    }, false);

    controls.addEventListener('lock', function () {

        instructions.style.display = 'none';
        blocker.style.display = 'none';

    });

    controls.addEventListener('unlock', function () {

        blocker.style.display = 'block';
        instructions.style.display = '';

    });
    MainScene.add(controls.getObject());
    controls.getObject().position.set(((textureSize / 2.0) - 5) * 50, 40, ((textureSize / 2.0) - 5) * 50);

    worldObjects = new THREE.Object3D();
    collisionCheck = new Array();

    MainScene.add(worldObjects);

    //MainScene.add(mapCamera);
    //mapCamera.lookAt(controls.getObject());
    //var shadowCam = new THREE.CameraHelper(dirLight.shadow.camera);
    //MainScene.add(shadowCam);

    var geometry = new THREE.BoxGeometry(5, 5, 5);
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    playerBox = new THREE.Mesh(geometry, material);

    var geometry = new THREE.BoxGeometry(1000, 1000, 1000);
    var material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    playerMarkerBox = new THREE.Mesh(geometry, material);

    playerBox.add(playerMarkerBox);
    MainScene.add(playerBox);

    var gridHelper = new THREE.GridHelper(1000, 20);
    MainScene.add(gridHelper);

    var onKeyDown = function (event) {

        switch (event.keyCode) {

            case 38: // up
            case 87: // w
                moveForward = true;
                break;

            case 37: // left
            case 65: // a
                moveLeft = true;
                break;

            case 40: // down
            case 83: // s
                moveBackward = true;
                break;

            case 39: // right
            case 68: // d
                moveRight = true;
                break;

            case 32: // space
                if (canJump === true) velocity.y += 350;
                canJump = false;
                break;

        }

    };

    var onKeyUp = function (event) {

        switch (event.keyCode) {

            case 38: // up
            case 87: // w
                moveForward = false;
                break;

            case 37: // left
            case 65: // a
                moveLeft = false;
                break;

            case 40: // down
            case 83: // s
                moveBackward = false;
                break;

            case 39: // right
            case 68: // d
                moveRight = false;
                break;

        }

    };

    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);

    raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, - 1, 0), 0, 10);
    raycaster_F = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, 0, -1), 0, 1000);
    raycaster_U = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, 1, 0), 0);
    //LoadAssets();
    //Load Shaders and Setup Planet
    ShaderLoader('js/Shaders/Planet/Planet.vs.glsl',
        'js/Shaders/Planet/Planet.fs.glsl', setUpPlanet, true);

    //camera.position.y = -40;
    container = document.getElementById('webGL-container');
    document.body.appendChild(container);

    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });

    renderer.setSize(Math.round(window.innerWidth / resolution), Math.round(window.innerHeight / resolution));

    renderer.setClearColor(0x000000, 0);
    document.body.appendChild(renderer.domElement);
    renderer.autoClear = false;
    renderer.domElement.style.width = Math.round(renderer.domElement.width * resolution) + 'px';
    renderer.domElement.style.height = Math.round(renderer.domElement.height * resolution) + 'px';
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = false;
    renderer.shadowMapSize = 32;
    renderer.shadowMap.renderReverseSided = false;
    renderer.shadowMap.renderSingleSided = false;

    //Map Canvas

    mapcontainer = document.getElementById('webGL-container-map_view');
    document.body.appendChild(mapcontainer);

    //MapRenderer = new THREE.WebGLRenderer({ antialias: false });
    //MapRenderer.setSize(window.innerWidth / 3, window.innerWidth / 4);
    //MapRenderer.setClearColor(0x000000, 1);
    //MapRenderer.setPixelRatio(window.devicePixelRatio);
    //document.body.appendChild(MapRenderer.domElement);
    //MapRenderer.domElement.id = "Map";

    //Composer
    composer = new THREE.EffectComposer(renderer);

    var StarsRenderPass = new THREE.RenderPass(BackgroundScene, camera);
    composer.addPass(StarsRenderPass);

    var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
    composer.addPass(effectCopy);
    effectCopy.renderToScreen = true;

    var MainRenderPass = new THREE.RenderPass(MainScene, camera);
    MainRenderPass.clear = false;
    MainRenderPass.clearDepth = true;
    composer.addPass(MainRenderPass);

    MainRenderPass.renderToScreen = true;


    //Load Shaders and Setup SkyBox
    ShaderLoader('js/Shaders/Sky/Sky.vs.glsl', 'js/Shaders/Sky/Sky.fs.glsl', setUpSky, true);
    if (devicePixelRatio == 1)
        composer.setSize(window.innerWidth / resolution, window.innerHeight / resolution);
    else
        composer.setSize(window.innerWidth, window.innerHeight);


    window.addEventListener("resize", onWindowResize, false);

    stats = new Stats()

    stats.domElement.style.position = 'absolute'
    stats.domElement.style.left = '0px'
    stats.domElement.style.bottom = '0px'
    container.appendChild(stats.domElement)

    LoadCharacters(0);
    //LoadAssets();
}

function LoadCharacters(spriteNumber) {
    var flower = new THREE.TextureLoader().load("img/Game_File/Ally.png");
    flower.magFilter = THREE.NearestFilter;
    flower.minFilter = THREE.NearestFilter;

    var spriteMaterial = new THREE.SpriteMaterial({ map: flower, color: 0xffffff });
    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(60, 60, 60);

    spriteMaterial.map.offset = new THREE.Vector2(0.25 * spriteNumber, 0);
    spriteMaterial.map.repeat = new THREE.Vector2(1 / 4, 1);

    //sprite.position.set(controls.getObject().position);

    console.log(sprite.position);
    sprite.rotation.y = 180;
    characterList.push(sprite);
    MainScene.add(sprite);
}

function SimpleCollision(delta) {
    colliding = false;
    var friction = 1.0;

    for (var i = 0; i < collisionCheck.length; i++) {

        var child = collisionCheck[i];
        //console.log(child);
        if (!child.isSprite) {

            if (detectCollisionCubes(child, playerBox)) {
                var childvector = new THREE.Vector3();
                childvector.setFromMatrixPosition(child.matrixWorld);

                colliding = true;

                var reflection = new THREE.Vector3();//velocity.reflect(dir);
                reflection.copy(velocity)
                reflection.reflect(velocity.normalize());


                velocity.x += reflection.x * 1.15;
                velocity.z += reflection.z * 1.15;
                break;
            }
        }
    }
}

function detectCollisionCubes(object1, object2) {
    object1.geometry.computeBoundingBox(); //not needed if its already calculated
    object2.geometry.computeBoundingBox();
    object1.updateMatrixWorld();
    object2.updateMatrixWorld();

    var box1 = object1.geometry.boundingBox.clone();
    box1.applyMatrix4(object1.matrixWorld);

    var box2 = object2.geometry.boundingBox.clone();
    box2.applyMatrix4(object2.matrixWorld);

    return box1.intersectsBox(box2);
}

function GetCharHeight(raycaster, char) {

    var vector = new THREE.Vector3(
        char.position.x,
        0,
        char.position.z);

    raycaster.ray.origin.copy(vector);
    raycaster.ray.origin.y -= 1;

    var intersections = raycaster.intersectObjects(objects);

    var onObject = intersections.length > 0;
    var height = 0;

    if (intersections[0] !== undefined)
        height = intersections[0].point.y + 40;
    else
        height = 40;

    return height;
}

function GetHeight() {

    var vector = new THREE.Vector3(
        controls.getObject().position.x,
        0,
        controls.getObject().position.z);

    raycaster_U.ray.origin.copy(vector);
    raycaster_U.ray.origin.y -= 1;

    var intersections = raycaster_U.intersectObjects(objects);

    var onObject = intersections.length > 0;
    var height = 0;

    if (intersections[0] !== undefined)
        height = intersections[0].point.y + 40;
    else
        height = 40;

    return height;
}

function setUpSky(start, vertex_text, fragment_text) {

    var texterLoader = new THREE.TextureLoader();

    starMap01 = texterLoader.load("img/Game_File/StarField.png");
    starMap01.magFilter = THREE.NearestFilter;
    starMap01.minFilter = THREE.NearestFilter;

    skyMaterial = new THREE.ShaderMaterial(
        {
            vertexShader: vertex_text,
            fragmentShader: fragment_text,
            uniforms: skyboxuniforms,
            side: THREE.BackSide,
            fog: true
        });

    skyBox = new THREE.Mesh(new THREE.SphereGeometry(10000,
        32, 32), skyMaterial);

    BackgroundScene.add(skyBox);
    skyBox.castShadow = false;
    skyBox.receiveShadow = false;
    skyMaterial.uniforms._MainTex.value = starMap01;
    skyMaterial.uniforms.resolution.value.x = window.innerWidth;
    skyMaterial.uniforms.resolution.value.y = window.innerHeight;
}

function DistanceCollisionManage(ObjectList, Threshold) {
    var vector = controls.getObject().position;

    if (ObjectList !== undefined) {
        ObjectList.updateMatrixWorld();
        ObjectList.traverse(function (child) {

            if (child !== ObjectList) {
                var childvector = new THREE.Vector3();
                childvector.setFromMatrixPosition(child.matrixWorld);

                if ((childvector.distanceTo(vector) > Threshold)) {

                    var index = collisionCheck.indexOf(child);
                    if (index > -1) {
                        collisionCheck.splice(index, 1);
                    }

                } else if ((childvector.distanceTo(vector) < (Threshold - 0.01))) {

                    var index = collisionCheck.indexOf(child);
                    if (index == -1) {
                        collisionCheck.push(child);
                    }

                }

            }
        });
    }
}

function ShowHideObjects(ObjectList, Threshold, doChildren = false, doDistance = true) {
    var vector = controls.getObject().position;

    if (ObjectList !== undefined) {
        ObjectList.updateMatrixWorld();
        ObjectList.traverse(function (child) {

            if (child !== ObjectList) {
                var childvector = new THREE.Vector3();
                childvector.setFromMatrixPosition(child.matrixWorld);

                if ((childvector.distanceTo(vector) > Threshold && doDistance) || FrustrumIntersection(child) == false) {
                    child.visible = false;

                    if (doChildren) {
                        child.traverse(function (children) {

                            if (child.visible)
                                children.visible = false;

                        });
                    }

                    //MainScene.remove(child);
                } else if ((childvector.distanceTo(vector) < (Threshold - 0.01) && doDistance) || FrustrumIntersection(child) == true) {
                    child.visible = true;
                    //MainScene.add(child);

                    if (doChildren) {
                        child.traverse(function (children) {

                            if (!child.visible)
                                children.visible = true;
                        });
                    }
                }

            }
        });
    }
}

function onWindowResize() {
    // notify the renderer of the size change
    // update the camera
    resolution = (window.devicePixelRatio == 1) ? 3 : 4;;

    renderer.setPixelRatio(window.devicePixelRatio);
    composer.setSize(Math.round(window.innerWidth / resolution), Math.round(window.innerHeight / resolution));
    renderer.setSize(Math.round(window.innerWidth / resolution), Math.round(window.innerHeight / resolution));
    renderer.domElement.style.width = Math.round((renderer.domElement.width) * resolution) + 'px';
    renderer.domElement.style.height = Math.round((renderer.domElement.height) * resolution) + 'px';

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

function ManageCharacters() {

    for (var i = 0; i < characterList.length; i++) {

        var char = characterList[i];
        var charYAngle = (char.rotation.y) * Math.PI / 180;
        char.position.y = GetCharHeight(new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, 1, 0), 0), char);

        var camObj = controls.getObject();

        var vector = new Vector2(char.position.z - camObj.position.z, char.position.x - camObj.position.x);
        var angle = Math.atan2(vector.y, vector.x);
        UpdateCharacterSprite(angle + charYAngle, char);
    }
}

function UpdateCharacterSprite(angle, char) {

    //Regions mapped from -1 to 1;
    var offset = Math.PI / 4;

    var dagrees = AbsoluteAngle((angle + offset) * 180 / Math.PI);

    //normaledAngle = (normaledAngle * 2) - 1;
    var normalizedAngle = dagrees / 360;

    var index = Math.ceil(((normalizedAngle * 4)) % 4) - 1;

    //console.log(index);

    char.material.map.offset = new THREE.Vector2(0.25 * (index), 0);
    // char.material.map.repeat = new THREE.Vector2(1 / 2, 1);
}

function AbsoluteAngle(angle) {
    return (angle %= 360) >= 0 ? angle : (angle + 360);
}
function animate() {

    //console.log(collisionCheck.length);

    stats.begin();
    ManageCharacters();
    FogController()

    //console.log(worldObjects);
    var delta = clock.getDelta();
    timer = timer + delta;
    DayNightCycle(delta);
    //Landmass ChunkManagement
    ShowHideObjects(landMassObject, 2000, false, false, false);

    //Scene and Collsion World Managment
    //ShowHideObjects(worldObjects, 3000, true);
    DistanceCollisionManage(worldObjects, 300);

    SimpleCollision(delta);



    angle += 0.1;
    //mapCamera.rotation.x  += delta;
    if (planet !== undefined) {
        dirLight.lookAt(planet.position);
        var elapsedMilliseconds = Date.now() - startTime;
        var elapsedSeconds = elapsedMilliseconds / 1000.;
    }

    if (skyMaterial !== undefined) {
        skyMaterial.uniforms.time.value = timer;
    }

    Movement(delta);

    stats.end();
    requestAnimationFrame(animate);

    render();

}

function Movement(delta) {

    if (controls.isLocked === true) {

        var height = GetHeight();
        //console.log(height);

        //raycaster.ray.origin.copy(controls.getObject().position);
        //raycaster.ray.origin.y -= 10;

        //var intersections = raycaster.intersectObjects(objects);

        //var onObject = intersections.length > 0;

        var time = performance.now();
        var delta = (time - prevTime) / 1000;



        velocity.x -= velocity.x * 2.0 * delta;
        velocity.z -= velocity.z * 2.0 * delta;

        //velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveLeft) - Number(moveRight);
        direction.normalize(); // this ensures consistent movements in all directions

        if (moveForward && !colliding || moveBackward && !colliding) velocity.z -= direction.z * 400.0 * delta;
        if (moveLeft && !colliding || moveRight && !colliding) velocity.x -= direction.x * 400.0 * delta;

        //if (onObject === true) {
        //    velocity.y = Math.max(0, velocity.y);
        //    canJump = true;
        //}
        controls.getObject().translateX(velocity.x * delta);
        controls.getObject().translateY(velocity.y * delta);
        controls.getObject().translateZ(velocity.z * delta);

        //if (controls.getObject().position.y <= height) {

        //    velocity.y = 0;
        //    controls.getObject().position.y = height;

        //    canJump = true;

        //}
        // console.log(height);

        if (controls.getObject().position.y !== height)
            controls.getObject().position.y = height;

        prevTime = time;

        if (skyBox !== undefined)
            skyBox.position.copy(controls.getObject().position);

        playerBox.position.copy(controls.getObject().position);

        //var CameraVector = new THREE.Vector3(controls.getObject().position.x, mapCamera.position.y, controls.getObject().position.z)
        //mapCamera.position.copy(controls.getObject().position);
    }
}

function render() {
    //renderer.render(MainScene, camera);
    composer.render();
    //renderer.render(MainScene, camera);

}


function toScreenPosition(obj, camera) {
    var vector = new THREE.Vector3();

    var widthHalf = window.innerWidth / 2;
    var heightHalf = window.innerHeight / 2;

    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);
    vector.project(camera);

    vector.x = (vector.x * widthHalf) + widthHalf;
    vector.y = - (vector.y * heightHalf) + heightHalf;
    vector.z = obj.position.z;
    return {
        x: vector.x,
        y: vector.y,
        z: vector.z
    };
}

function CalculateParametres() {
    persistance = 2.9;//randomRange(0.65, 0.85);
    lacunarity = 0.21;//randomRange(1.9, 2.2);
    octaves = 5;//Math.round(randomRange(4, 6));
    noiseScale = 3;//randomRange(10, 200);
    moonList = new Array(Math.round(randomRange(1, 4)));
    planetTilt = randomRange(-55, 55);
    planetSize = 100;//randomRange(40, 110);
    planetRotationPeriod = Math.round(randomRange(65, 100));
    //InitializeMoonData(moonList, vertex_text, fragment_text);
}

function FrustrumIntersection(object) {
    var frustum = new THREE.Frustum();
    var cameraViewProjectionMatrix = new THREE.Matrix4();

    // every time the camera or objects change position (or every frame)

    camera.updateMatrixWorld(); // make sure the camera matrix is updated
    camera.matrixWorldInverse.getInverse(camera.matrixWorld);
    cameraViewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromMatrix(cameraViewProjectionMatrix);

    // frustum is now ready to check all the objects you need

    if (object.isSprite) {
        return frustum.intersectsSprite(object);
    } else {
        return frustum.intersectsObject(object);
    }

}

function CreateLand(start, vertex_text, fragment_text) {

    var vertex = vertex_text;
    var fragment = fragment_text;
    //var ico = new THREE.PlaneGeometry(1000, 1000, 32);//new THREE.IcosahedronGeometry(planetSize, 4);

    PlanetMaterial = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.merge([
            THREE.UniformsLib['lights'],
            THREE.UniformsLib['fog'],
            planetUniform]),
        vertexShader: (vertex),
        fragmentShader: (fragment),
        lights: true,
        //wireframe:true
        fog: true
    });


    CalculateParametres();

    ShaderLoader('js/Shaders/BillBoard/BillBoard.vs.glsl',
        'js/Shaders/BillBoard/BillBoard.fs.glsl', setUpMapFirstPass, {
            octaves: octaves, persistance: persistance, lacunarity: lacunarity,
            seed: seed, noiseScale: noiseScale, offset: offset, size: textureSize, scale: 50.0, gridsize: 16,
        });


}

function PostImageData(map) {
    // create off-screen canvas element
    var canvastest = document.createElement('canvas');
    var ctx = canvastest.getContext('2d');
    document.getElementById("webGL-container-map_view").appendChild(canvastest);

    canvastest.width = textureSize;
    canvastest.height = textureSize;

    // create imageData object
    var idata = ctx.createImageData(textureSize, textureSize);

    // set our buffer as source
    //idata.data.set(map.image);
    //console.log(map);
    for (var x = 0; x < textureSize; x++) {
        for (var y = 0; y < textureSize; y++) {
            var idx = (x + y * textureSize) * 4;
            var idx2 = (x + y * textureSize) * 3;
            idata.data[idx + 0] = map.image.data[idx2 + 0];
            idata.data[idx + 1] = map.image.data[idx2 + 1];
            idata.data[idx + 2] = map.image.data[idx2 + 2];
            idata.data[idx + 3] = textureSize;
        }
    }
    // update canvas with new data
    ctx.putImageData(idata, 0, 0);
    var dataUri = canvastest.toDataURL('image/png'); // produces a PNG file



    //export_object(planetobject, dataUri);

    $.ajax({
        type: 'POST',
        url: '/planet_information_post.php',
        data: {
            image: dataUri,
        },
        success: function (d) {
            console.log('done');
        }
    });
}

function doDispose(obj) {
    if (obj !== null) {
        for (var i = 0; i < obj.children.length; i++) {
            doDispose(obj.children[i]);
        }
        if (obj.geometry) {
            obj.geometry.dispose();
            obj.geometry = undefined;
        }
        if (obj.material) {
            if (obj.material.map) {
                obj.material.map.dispose();
                obj.material.map = undefined;
            }
            obj.material.dispose();
            obj.material = undefined;
        }
    }
    obj = undefined;
};

function createDataMap(map, size) {
    var dataTexture;

    dataTexture = new THREE.DataTexture
        (
            Uint8Array.from(map),
            size,
            size,
            THREE.RGBFormat,
            THREE.UnsignedByteType,
        );

    dataTexture.needsUpdate = true;

    return dataTexture;
}

function createPlantiodDataFirst(data, vertexShader, fragShader) {
    ShaderLoader('js/Shaders/Instance/Instance.vs.glsl',
        'js/Shaders/Instance/Instance.fs.glsl', setUpMapFinal, { data: data, vertex : vertexShader, fragment : fragShader });
}

function createPlantiodDataFinal(information, vertexShader, fragShader) {

    //console.log(vertexShader);
    //console.log(information.vertex);
    //console.log(data);
    var planetInfo = new MapGenerator(information.data.octaves, information.data.persistance, information.data.lacunarity,
        information.data.seed, information.data.noiseScale, information.data.offset, information.data.size, information.data.scale, information.data.gridsize, false, worldObjects,
        collisionCheck, { billvertex : information.vertex, billfragment: information.fragment, instavert : vertexShader, instafrag: fragShader });

    var dataTexture;

    dataTexture = new THREE.DataTexture
        (
            Uint8Array.from(planetInfo.map),
            information.data.size,
            information.data.size,
            THREE.RGBFormat,
            THREE.UnsignedByteType,
        );

    dataTexture.needsUpdate = true;

    //textureList.push(dataTexture);
    //worldObjects.scale.z = -1;
    // worldObjects.scale.x = -1;
    //console.log(planetInfo);
    planetData = new PlanetInformation(dataTexture, planetInfo.hasAtmo,
        planetInfo.hasLiquad, planetInfo.colors, planetInfo.url,
        planetInfo.regionsInfo, planetInfo.LandMass);


    if (planetData != undefined) {
        landMassObject = new THREE.Object3D();

        for (var i = 0; i < planetData.LandMass.length; i++) {
            var chunk = new THREE.Mesh(planetData.LandMass[i],
                PlanetMaterial);


            chunk.castShadow = true; //default is false
            chunk.receiveShadow = true; //default
            chunk.scale.set(1, 1, 1);
            //MainScene.add(planet);
            //planet.scale.z = -1;
            //planet.scale.x = -1;
            //planet.rotation.x = Math.PI / 2;
            PlanetMaterial.uniforms.texture.value = planetData.map;
            planetData.map.wrapS = THREE.RepeatWrapping;
            planetData.map.repeat.x = -1;
            PlanetMaterial.side = THREE.DoubleSide;
            dirLight.target = landMassObject;
            landMassObject.add(chunk)
            objects.push(chunk);
        }

        PostImageData(planetData.map);
        MainScene.add(landMassObject);
    }

    var texture, imagedata;

    texture = new THREE.TextureLoader().load( "img/Game_File/MapDecal.jpg", function ( event ) {
        imagedata = getImageData( texture.image );
        GenerateEnviromentalDecal(information.data.scale, information.data.size, imagedata, worldObjects, objects);
    } );
}

// Credit to THeK3nger - https://gist.github.com/THeK3nger/300b6a62b923c913223fbd29c8b5ac73
//Sorry to any soul that bare's witness to this Abomination....May the gods have mercy on me
function ShaderLoader(vertex_url, fragment_url, onLoad, Custom, onProgress, onError) {
    var vertex_loader = new THREE.FileLoader(THREE.DefaultLoadingManager);
    vertex_loader.setResponseType('text');
    vertex_loader.load(vertex_url, function (vertex_text) {
        var fragment_loader = new THREE.FileLoader(THREE.DefaultLoadingManager);
        fragment_loader.setResponseType('text');
        fragment_loader.load(fragment_url, function (fragment_text) {
            var shadow_loader = new THREE.FileLoader(THREE.DefaultLoadingManager);
            shadow_loader.setResponseType('text');
            shadow_loader.load("js/Shaders/Shadow.glsl", function (shadow_text) {
                var dither_loader = new THREE.FileLoader(THREE.DefaultLoadingManager);
                dither_loader.setResponseType('text');
                dither_loader.load("js/Shaders/Dither.glsl", function (dither_text) {
                    onLoad(Custom, textParse(vertex_text, shadow_text, dither_text), textParse(fragment_text, shadow_text, dither_text));
                }

                )
            });
        })
    }, onProgress, onError);
}
//Methods to Setup and Save the Loaded Texts
//Aswell as pass in extra paramaratres if needed

function setUpMapFirstPass(init, vertex_text, fragment_text) {
    ShaderLoadList.planet.vertex = vertex_text;
    ShaderLoadList.planet.fragment = fragment_text;
    createPlantiodDataFirst(init, vertex_text, fragment_text);
}

function setUpMapFinal(init, vertex_text, fragment_text) {
    ShaderLoadList.planet.vertex = vertex_text;
    ShaderLoadList.planet.fragment = fragment_text;
    createPlantiodDataFinal(init, vertex_text, fragment_text);
}

function setUpPlanet(init, vertex_text, fragment_text) {
    ShaderLoadList.planet.vertex = vertex_text;
    ShaderLoadList.planet.fragment = fragment_text;
    CreateLand(init, vertex_text, fragment_text);
}

