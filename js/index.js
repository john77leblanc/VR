import {objFiles2} from './lib/objdata2.js';
import {wpData} from './lib/warppointdata.js';
import {lightData} from './lib/lightdata.js';
import {EnableCameraHelper, loadWarpPoints, loadLights} from './util/functions.js';
import * as Init from './util/init.js';
import * as Raycast from './util/raycast.js';
import * as Classes from './util/classes.js';

var container = document.createElement('div');
document.body.appendChild(container);

// TESTING VARIABLES
var testing = false;
var vr = false;
var logged = false;

var userMenu = 5;

// APP VARIABLES
var container,
    raycaster,
    renderer;

var crosshair;

var controls;

var handlers = [];

// INITIALIZE
function init() {
    // GEOMETRY
    var geo2 = new THREE.BoxGeometry(1,1,1);
    var mat2 = new THREE.MeshStandardMaterial({
        color: 0x001199,
        metalness: 0.1,
    });
    var cube = new THREE.Mesh(geo2, mat2);
    cube.position.set(1,2,-3);
    cube.rotateX(-Math.PI / 4);
    scene.add(cube);
    if (!vr) cube.layers.set(userMenu);
    else {
        var cube2 = cube.clone();
        cube.layers.set(1);
        cube2.layers.set(2);
        scene.add(cube2);
    }

    crosshair = new Classes.RoundCrosshair(camera);

    // FLOOR
    var geometry = new THREE.PlaneGeometry(500, 500);
    var material = new THREE.MeshLambertMaterial({color: 0x666666});
    var plane = new THREE.Mesh(geometry, material);
    plane.position.y = -8;
    plane.rotateX(- Math.PI / 2);
    plane.receiveShadow = true;
    scene.add(plane);

    // RAYCASTER
    raycaster = new THREE.Raycaster();

    // RENDERER
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    if (vr) renderer.vr.enabled = true;
    container.appendChild(renderer.domElement);
    if (vr) document.body.appendChild(WEBVR.createButton(renderer));

    // CONTROLS
    controls = new THREE.OrbitControls(camera);
    controls.update();

    EnableCameraHelper(testing, scene);
}

function animate() {
    if (vr) {
        renderer.setAnimationLoop(render);
    } else {
        requestAnimationFrame(animate);
        render();
    }
}

function render() {
    controls.update();
    raycaster.setFromCamera({x: 0, y: 0}, camera);

    ////////////////////////////////////////////////
    //
    //  Create interaction list
    //
    ////////////////////////////////////////////////

    var objectsList = [];
    var boundList = [];
    var menuList = [];

    for (var i = 0; i < handlers.length; i++) {
        // Get interactive objects
        if (typeof(handlers[i].returnObject()) != 'undefined') objectsList.push(handlers[i].returnObject());
        // Get menu items
        if (typeof(handlers[i].returnMenuItems()) != 'undefined') {
            for (var ii = 0; ii < handlers[i].returnMenuItems().length; ii++) {
                menuList.push(handlers[i].returnMenuItems()[ii]);
            }
        }
        // Get Bounding Box
        if (typeof(handlers[i].returnBoundingObject()) != 'undefined') boundList.push(handlers[i].returnBoundingObject());
    }

    ////////////////////////////////////////////////
    //
    //  Raycast
    //
    ////////////////////////////////////////////////

    var obj_intersects = raycaster.intersectObjects(objectsList, true);
    var bound_intersects = raycaster.intersectObjects(boundList, true);
    var menu_intersects = raycaster.intersectObjects(menuList, true);

    crosshair.objIntersect(obj_intersects);
    crosshair.boundIntersect(bound_intersects);
    crosshair.menuIntersect(menu_intersects);
    obj_intersects = null;
    
    ////////

    renderer.clear();
    renderer.render(scene, camera);
}

var scene = Init.scene();
var camera = Init.camera();
var user = Init.user(scene, camera); // Required
for (var i = 0; i < objFiles2.length; i++) {
    handlers[i] = new Classes.Handler(scene, objFiles2[i], i);
    handlers[i].loadObject(user);
}

var td = {
    textInfo: {
        text: "Skull",
        fontFamily: "Helvetica",
        fontSize: "50",
        textAlign: "center",
        fontColor: "Blue",
    },
    frameInfo: {
        background: "rgb(230,230,230)"
    },
    position: {
        x: 3,
        y: 1,
        z: -3
    }
}
var text = new Classes.InfoBox(td);
text.create(scene);



var um = {
    position: {
        x: user.position.x,
        y: user.position.y - 3,
        z: user.position.z - 0.5,
    },
    menu: {
        items: [
            {
                text: "User Menu",
                type: "menu",
                onCommit: (submenu) => {
                    if (typeof(submenu) != 'undefined') submenu.displayMenu();
                },
                offCommit: () => {},
                menu: {
                    position: {
                        x: 0,
                        y: 1.5,
                        z: 0.1
                    },
                    items: [
                        {
                            text: "Show Cube",
                            type: "function",
                            onCommit: () => {
                                // if (!vr) camera.layers.enable(userMenu);
                                // else {
                                //     camera.layers.enable(1);
                                //     camera.layers.enable(2);
                                // }
                                camera.layers.enable(userMenu);
                            },
                            offCommit: () => {}
                        },
                        {
                            text: "Hide Cube",
                            type: "function",
                            onCommit: (object) => {
                                // if (!vr) camera.layers.disable(userMenu);
                                // else {
                                //     camera.layers.disable(1);
                                //     camera.layers.disable(2);
                                // }
                                camera.layers.disable(userMenu);
                            },
                            offCommit: () => {}
                        },
                        {
                            text: "Close User Menu",
                            type: "close",
                            onCommit: (submenu) => {
                                if (typeof(submenu) != 'undefined') submenu.visible = false;
                            },
                            offCommit: () => {}
                        }
                    ]
                }
            }
        ]
    }
};
var item = new Classes.Handler(scene, um, handlers.length);
item.loadMenu();
item.faceMenuToCamera(user);
handlers.push(item);

loadLights(scene, lightData);
//loadWarpPoints(scene, wpData);
init();
animate();