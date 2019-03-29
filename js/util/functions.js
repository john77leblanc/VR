import * as Classes from './classes.js';

// AJAX Request
export function AjaxGet(data) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            return JSON.parse(this.responseText);
        }
    };
    xhttp.open("GET", data.file, true);
    xhttp.send();
}

// FIND
function findMenus(scene) {
    let menus = [];
    for (var i = 0; i < scene.children.length; i++) {
        if (scene.children[i].name == 'Menu Holder') menus.push(scene.children[i]);
    }
    return menus;
}

export function findById(scene, id) {
    var obj = null;
    for (var i = 0; i < scene.children.length; i++) {
        if (obj == null) {
            if (scene.children[i].uuid == id) {
                obj = scene.children[i];
                break;
            } else if (scene.children[i].type == 'Group') {
                obj = findById(scene.children[i], id);
            }
        } else {
            break;
        }
    }
    return obj;
}

// FACE MENUS TO CAMERA
function faceMenusToCamera(scene, user) {
    var menus = findMenus(scene);
    for (var i = 0; i < menus.length; i++) {
        menus[i].lookAt(user.position);
    }
}

function getDif(min, max) {
    let dif = max - min;
    if (dif < 0) dif *= -1;
    return dif;
}

export function loadWarpPoints(scene, wpData) {
    for (var i = 0; i < wpData.length; i++) {
        new Classes.WarpPoint(scene, wpData[i]);
    }
}

// LIGHT
export function loadLights(scene, lightData) {
    for (var i = 0; i < lightData.length; i++) {
        var light;
        switch (lightData[i].type) {
            case 'Ambient':
                light = new THREE.AmbientLight(lightData[i].color[0], lightData[i].intensity);
                break;
            case 'Point':
                light = new THREE.PointLight(lightData[i].color[0], lightData[i].intensity);
                break;
            case 'Hemisphere':
                light = new THREE.HemisphereLight(lightData[i].color[0], lightData[i].color[1], lightData[i].intensity);
        }
        scene.add(light);
    }
}

function UpdateLightPos(light, target) {
    light.position.set(
        target.position.x,
        target.position.y,
        target.position.z
    );
}

// CAMERA HELPER
export function EnableCameraHelper(testing, holder) {
    if (testing) {
        var newCamera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 10 );
		var cameraHelper = new THREE.CameraHelper(newCamera);
		holder.add(cameraHelper);
    }
}