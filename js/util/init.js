// INITIALIZE SCENE
export function scene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcce0ff);
    scene.fog = new THREE.Fog(0xcce0ff, 200, 300);
    return scene;
}

// INITIALIZE CAMERA
export function camera() {
    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 250 );
    camera.position.set(0,0,3);
    return camera;
}

// INITIALIZE USER
export function user(scene, camera) {
    var user = new THREE.Group();
    user.position.set(0,0,0);
    user.add(camera);
    scene.add(user);
    return user;
}