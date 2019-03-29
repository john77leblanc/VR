import {findById} from './functions.js';

export function getIntersect(intersects, INTERSECTED) {
    if (intersects.length > 0) {
        let intersect = intersects[0].object;
        if (INTERSECTED != intersect) INTERSECTED = intersect;
    } else {
        INTERSECTED = null;
    }
    return INTERSECTED;
}

export function clearIntersect() {
    return null;
}

export function object(INTERSECTED) {
    let group = INTERSECTED.parent;
    if (group.name != 'Bounding Holder') group = group.parent;
    for (var i = 0; i < group.children.length; i++) {
        if (group.children[i].name == 'Bounding Box') {
            group.children[i].visible = true;
        }
    }
}

export function boundingBox(INTERSECTED, visible = true) {
    INTERSECTED.visible = visible;
    let group = INTERSECTED.parent;
    for (var i = 0; i < group.children.length; i++) {
        if (group.children[i].name == 'Menu Holder') group.children[i].visible = visible;
    }
}

export function menuItem(scene, INTERSECTED) {
    let target = findById(scene, INTERSECTED.target);
    let action = INTERSECTED.action;
    actionList[action].function(target, actionList[action].data.modifier);
    if (!INTERSECTED.hover) {
        // INTERSECTED.position.z -= 0.2;
        // INTERSECTED.hover = true;
    }
}

export function warpPoint(controls, user, INTERSECTED) {
    let position = new THREE.Vector3(
        INTERSECTED.position.x,
        INTERSECTED.position.y + (INTERSECTED.position.y * -1),
        INTERSECTED.position.z
    );

    controls.target.set(
        position.x,
        position.y,
        position.z
    );

    user.position.set(
        position.x,
        position.y,
        position.z
    );
}