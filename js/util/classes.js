export class Handler {
    constructor(scene, data, id) {
        this.dataraw = data;
 
        if (typeof(this.dataraw.position) == 'undefined') {
            if (typeof(this.dataraw.menu) != 'undefined' && typeof(this.dataraw.menu.position) != 'undefined') {
                this.dataraw.position = this.dataraw.menu.position;
            } else {
                this.dataraw.position = {x: 0, y: 0, z: 0};
            }
        }
        this.handlerId = id;
        this.boundingObject;
        this.object;
        this.menu = typeof(data.menu) !== 'undefined' ? data.menu : undefined;
        this.menuId;
        this.menuObject;
        this.menuBackground;
        this.menuItems = [];

        this.scene = scene;
        this.handler = new THREE.Group();
        this.handler.handlerId = this.handlerId;
        this.handler.name = "Handler";
        this.handler.position.set(
            this.dataraw.position.x,
            this.dataraw.position.y,
            this.dataraw.position.z
        );
        this.scene.add(this.handler);
    }

    returnObject() {
        return this.object;
    }

    returnMenuObject() {
        return this.menuObject;
    }

    returnMenuItems() {
        return this.menuItems;
    }

    returnBoundingObject() {
        return this.boundingObject;
    }

    displayMenu() {
        if (typeof(this.menuObject) != 'undefined') this.menuObject.displayMenu();
    }

    hideMenu() {
        if (typeof(this.menuObject) != 'undefined') this.menuObject.hideMenu();
    }

    displayBoundingBox() {
        this.boundingObject.visible = true;
    }

    hideBoundingBox() {
        this.boundingObject.visible = false;
    }

    loadObject(camera) {
        var _this = this;
        var object = new Object(this.handlerId, this.dataraw);
        var interval = setInterval(
            function() {
                if (_this.checkObjectLoad()) { // Object is loaded
                    _this.loadComplete(camera, object.returnObject());
                    clearInterval(interval);
                } else {
                    _this.object = object.returnObject();
                }
            }
            ,250
        );
    }

    checkObjectLoad() {
        return typeof(this.object) != 'undefined' ? true : false;
    }

    loadComplete(camera, object) {
        var _this = this;
        object.onCommit = function() {
            _this.displayBoundingBox();
            _this.displayMenu();
        };
        object.offCommit = function() {};
        object.commit_time = 50;
        object.commit_percent = 0;
        object.buffer = 1;
        for (var i = 0; i < object.children.length; i++) {
            object.children[i].onCommit = object.onCommit;
            object.children[i].offCommit = object.offCommit;
            object.children[i].interactable = true;
            object.children[i].commit = object.commit;
        }
        this.handler.add(object)
        if (typeof(this.menu) != 'undefined') {
            this.loadMenu();
            this.faceMenuToCamera(camera);
        }
        this.updateBoundingBox();
    }

    loadMenu() {
        this.menuObject = new Menu(this.handlerId, this.menu, this.object);
        this.menuItems = this.menuObject.returnMenuItems();
        this.handler.add(this.menuObject.returnObject());
        this.updateBoundingBox();
    }

    faceMenuToCamera(camera) {
        if (typeof(this.menuObject) != 'undefined') this.menuObject.facePoint(camera);
    }

    createBoundingBox() {
        var _this = this;
        let geo = new THREE.BoxGeometry(1,1,1);
        let mat = new THREE.MeshBasicMaterial({
            //transparent: true,
            opacity: 0,
            wireframe: true
        });
        let mesh = new THREE.Mesh(geo, mat);
            mesh.handlerId = this.handlerId;
            mesh.name = "Bounding Box";
            mesh.visible = false;
            if (typeof(this.object) == 'undefined') mesh.visible = true;
            mesh.onCommit = function() {
                _this.displayMenu();
            }
            if (typeof(this.object) != 'undefined') {
                mesh.offCommit = function() {
                    _this.hideBoundingBox();
                    _this.hideMenu();
                };
            } else {
                mesh.offCommit = function() {};
            }
            mesh.commit_time = 50;
            mesh.commit_percent = 0;
            mesh.buffer = 1;
            mesh.renderOrder = 9;
        this.boundingObject = mesh;
        this.handler.add(mesh);
        this.updateBoundingBox();
    }

    updateBoundingBox() {
        if (typeof(this.boundingObject) == 'undefined') {
            this.createBoundingBox();
        } else {
            var box = new THREE.Box3().setFromObject(this.handler);
            var size = box.getSize();
            var center = box.getCenter();
            this.boundingObject.position.set(
                center.x - this.handler.position.x,
                center.y - this.handler.position.y,
                center.z - this.handler.position.z
            );
            this.boundingObject.scale.set(
                size.x,
                size.y,
                size.z
            );
        }
    }
}

export class Object {
    constructor(id, data) {
        this.handlerId = id;
        this.data = data;
        this.object;
        var _this = this;
        if (typeof(this.data.mtl) != 'undefined') {
            var mtlLoader = new THREE.MTLLoader();
            mtlLoader.setPath(this.data.path);
            mtlLoader.load(this.data.mtl, function(materials){
                materials.preload();
                _this.load(materials);
            })
        } else {
            _this.load();
        }
    }

    returnObject() {
        return this.object;
    }

    load(materials = false) {
        var _this = this;
        var objLoader = new THREE.OBJLoader();
        objLoader.setPath(this.data.path);
        if (materials) objLoader.setMaterials(materials);
        objLoader.load(this.data.file, function(object){
            object.handlerId = _this.handlerId;
            if (typeof(_this.data.scale) != 'undefined') {
                object.scale.set(
                    _this.data.scale,
                    _this.data.scale,
                    _this.data.scale
                );
            }
            if (typeof(_this.data.map) != 'undefined') _this.loadJPGTexture(object);
            _this.object = object;
            _this.object.castShadow = true;
        });
    }

    loadJPGTexture(object) {
        var texture = new THREE.TextureLoader().load(this.data.path + this.data.map);
        if (object.type == 'Group') {
            for (var i = 0; i < object.children.length; i++) {
                object.children[i].material.map = texture;
            }
        } else {
            object.material.map = texture;
        }
    }
}

export class Menu {
    constructor(id, menu, object = null, parent = null) {
        this.handlerId = id;
        this.object = object;
        this.menu = menu.items;
        this.position = null;
        if (typeof(menu.position) != 'undefined') this.position = menu.position;
        else if (this.position == null && this.object != null) this.position = {
            x: 0,
            y: this.object.position.y - 1,
            z: 0
        };
        else this.position = {x:0,y:0,z:0};

        this.menuObject = new THREE.Group();
        this.menuObject.position.set(
            this.position.x,
            this.position.y,
            this.position.z
        );

        this.parentMenu = parent;
        if (this.parentMenu != null && this.menuObject.position == {x:0,y:0,z:0}) {
            this.menuObject.position.set(0,0,0.2);
        }
        this.menuObject.name = "Menu Holder";
        this.menuObject.visible = this.object == null && this.parentMenu == null ? true : false;
        this.menuItemObjects = [];

        this.menuBackground = new THREE.Mesh(
            new THREE.BoxGeometry(1,1,0.01),
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true
            })
        );
        this.menuBackground.handlerId = this.handlerId;
        this.menuBackground.name = "Menu Background";

        this.menuObject.add(this.menuBackground);
        this.createMenu();
    }

    returnObject() {
        return this.menuObject;
    }

    returnMenuItems() {
        return this.menuItemObjects;
    }

    displayMenu() {
        this.menuObject.visible = true;
        this.updateChildren();
    }

    hideMenu() {
        this.menuObject.visible = false;
        this.updateChildren();
    }

    updateChildren() {
        for (var i = 0; i < this.menuItemObjects.length; i++) {
            this.menuItemObjects[i].visible = this.menuObject.visible;
            if (this.menuItemObjects[i].visible == false && typeof(this.menuItemObjects[i].submenu) != 'undefined') {
                this.menuItemObjects[i].submenu.hideMenu();
            }
        }
    }

    createMenu() {
        for (var i = 0; i < this.menu.length; i++) {
            let menuItem = this.createMenuItem(this.menu[i]);
            this.menuItemObjects.push(menuItem);
            this.menuObject.add(menuItem);
        }
        this.sizeMenu();
        this.positionMenuItems();
    }

    createSubMenu(menuItem) {
        let submenu = new Menu(this.handlerId, menuItem.menu, this.object, this.menuObject);
        return submenu;
    }

    createMenuItem(menuItem) {
        var _this = this;

        let scale = 50;
        let defaultColor = 'rgba(0,0,0,0)';

        let textDetails = {
            text: menuItem.text,
            fontFamily: "Helvetica",
            fontSize: 20,
            textAlign: "center",
            fontColor: "rgb(255,255,255)"
        };

        let frameDetails = {
            background: 'rgb(30,30,30)'
        };

        let fontSize = textDetails.fontSize * scale;

        let canvas = document.createElement('canvas');
        let tempCanvas = document.createElement('canvas');

        let context = canvas.getContext('2d');
        let tempContext = tempCanvas.getContext('2d');

        tempContext.font = fontSize + "px " + textDetails.fontFamily;

        var width = tempContext.measureText(textDetails.text).width;
            width += width * 0.1;
        var height = fontSize;
            height += height * 0.3;

        canvas.width = width;
        canvas.height = height;

        context.font = fontSize + "px " + textDetails.fontFamily;

        let align;

        // Background
        context.fillStyle = typeof(frameDetails.background) != 'undefined' ? frameDetails.background : defaultColor;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Text
        switch (textDetails.textAlign) {
            case "center":
                align = canvas.width/2;
                break;
            case "right":
                align = canvas.width;
                break;
            default:
                align = 0;
        }

        context.textAlign = textDetails.textAlign;
        context.fillStyle = textDetails.fontColor;
        context.fillText(textDetails.text, align, fontSize);

        let texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;

        let material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true
        });

        let box = {
            width: canvas.width/scale/100,
            height: canvas.height/scale/100
        };

        let mesh = new THREE.Mesh(
            new THREE.BoxGeometry(box.width, box.height, 0.01),
            material
        );

        mesh.handlerId = this.handlerId;
        mesh.position.z = 0.01;
        mesh.visible = _this.menuObject.visible;
        mesh.commit_time = 50;
        mesh.commit_percent = 0;
        var target;
        if (menuItem.type == 'function') {
            target = _this.object;
        }
        else if (menuItem.type == 'menu') {
            mesh.submenu = this.createSubMenu(menuItem);
            mesh.submenuObject = new THREE.Group().add(mesh.submenu.returnObject());
            mesh.add(mesh.submenuObject);
            target = mesh.submenu;
        }
        else if (menuItem.type == 'close') {
            target = _this.menuObject;
        }
        mesh.onCommit = function() {
            menuItem.onCommit(target);
        };
        if (menuItem.type == 'menu') {
            mesh.onCommit = function() {
                mesh.submenu.displayMenu();
            }
        }
        mesh.offCommit = function() {
            menuItem.offCommit(target);
        };
        mesh.menuItem = true;
        mesh.name = "Menu Item";
        mesh.text = menuItem.text;
        mesh.margin = 0.05;
        return mesh;
    }

    sizeMenu() {
        var height = 0;
        var width = 0;
        for (var i = 0; i < this.menuItemObjects.length; i++) {
            height += this.menuItemObjects[i].geometry.parameters.height;
            height += this.menuItemObjects[i].margin;
            width = this.menuItemObjects[i].geometry.parameters.width > width ? this.menuItemObjects[i].geometry.parameters.width : width;
        }
        width += (this.menuItemObjects[0].margin * 2);
        this.menuBackground.scale.y = height;
        this.menuBackground.scale.x = width;
    }

    positionMenuItems() {
        var max = Math.floor(this.menuItemObjects.length/2);
        var min = max*-1;
        var even = this.menuItemObjects.length % 2 == 0 ? true : false;
        var nMax = !even ? max + 1 : max;

        for (var i = min; i < nMax; i++) {
            let menuItem = this.menuItemObjects[i+max];
            let mod = (menuItem.geometry.parameters.height + menuItem.margin);
            if (menuItem) {
                let increment = i;
                increment += (i >= 0 && even) ? 1 : 0;
                if (even) mod /= 2;
                menuItem.position.y = mod*-increment;
            }
        }
    }

    facePoint(point) {
        this.menuObject.lookAt(point.position);
    }
}

export class WarpPoint {
    constructor(scene, data) {
        this.position = data.position;
        this.create(scene);
    }

    create(scene) {
        let sphere = new THREE.Mesh(
            new THREE.SphereGeometry(1, 16, 3, 0, 6.3, 0, 1),
            new THREE.MeshLambertMaterial({
                color: 0x0000ff
            })
        );
        sphere.position.x = this.position.x;
        sphere.position.y = this.position.y;
        sphere.position.z = this.position.z;
        sphere.name = "Warp Point";
        sphere.interactable = true;
        sphere.onCommit = function(camera) {
            camera.position.x = this.position.x;
            camera.position.z = this.position.z;
        };
        sphere.offCommit = function() {};
        scene.add(sphere);
    }
}

export class InfoBox {
    constructor(data) {
        this.textInfo = data.textInfo;
        this.text = this.textInfo.text;
        this.frameInfo = data.frameInfo;
        this.position = data.position;
    }

    create(scene) {
        let scale = 50;
        let defaultColor = 'rgba(0,0,0,0)';

        let fontSize = this.textInfo.fontSize * scale;

        let canvas = document.createElement('canvas');
        let tempCanvas = document.createElement('canvas');

        let context = canvas.getContext('2d');
        let tempContext = tempCanvas.getContext('2d');

        tempContext.font = fontSize + "px " + this.textInfo.fontFamily;

        var width = tempContext.measureText(this.textInfo.text).width;
            width += width * 0.1;
        var height = fontSize;
            height += height * 0.3;

        canvas.width = width;
        canvas.height = height;

        context.font = fontSize + "px " + this.textInfo.fontFamily;

        let align;

        // Background
        context.fillStyle = typeof(this.frameInfo.background) != 'undefined' ? this.frameInfo.background : defaultColor;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Text
        switch (this.textInfo.textAlign) {
            case "center":
                align = canvas.width/2;
                break;
            case "right":
                align = canvas.width;
                break;
            default:
                align = 0;
        }

        context.textAlign = this.textInfo.textAlign;
        context.fillStyle = this.textInfo.fontColor;
        context.fillText(this.textInfo.text, align, fontSize);

        let texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;

        let material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true
        });

        let box = {
            width: canvas.width/scale/100,
            height: canvas.height/scale/100
        };

        let mesh = new THREE.Mesh(
            new THREE.BoxGeometry(box.width, box.height, 0.01),
            material
        );
        mesh.position.set(
            this.position.x,
            this.position.y,
            this.position.z
        );
        scene.add(mesh);
    }
}

export class RoundCrosshair {
    constructor (camera) {
        this.camera = camera;
        this.objects = {}; // Crosshair holder

        this.hover = 0.015;
        this.hoverBuffer = this.hover;
        this.hoverMod = 0.004;

        // Create crosshair
        this.objects.crosshair = new THREE.Mesh(
            new THREE.CircleBufferGeometry(this.hover),
            new THREE.MeshBasicMaterial({
                color: 0xcccccc,
                opacity: 0.7,
                transparent: true,
                blending: THREE['CustomBlending'],
                blendSrc: THREE['OneMinusDstColorFactor'],
                blendDst: THREE['OneMinusSrcColorFactor'],
                blendEquation: THREE.AddEquation
            })
        );

        this.crosshairSize = {
            innerRadius: 0.025,
            outerRadius: 0.04
        }

        this.objects.crosshair.name = "crosshair";
        this.objects.crosshair.position.z = -2;
        this.camera.add(this.objects.crosshair);

        // Create buffer ring
        this.objects.buffer = new THREE.Mesh(
            new THREE.RingBufferGeometry(
                this.crosshairSize.innerRadius,
                this.crosshairSize.outerRadius,
                32,
                8,
                (Math.PI / 2),
                0
            ),
            new THREE.MeshBasicMaterial({
                color: 0x333333ff,
                opacity: 0.7,
                side: THREE.DoubleSide,
                transparent: true,
            })
        );
        this.objects.buffer.name = "buffer";
        this.objects.buffer.position.z = -2;
        this.objects.buffer.rotation.y = Math.PI;
        this.camera.add(this.objects.buffer);

        this.bufferDefaultGeometry = this.objects.buffer.geometry.parameters;
        this.bufferGeometry;
        this.INTERSECTED = null;
        this.PREVINTERSECTED = this.INTERSECTED;

        this.obj_intersect = null;
        this.obj_prev = null;
        this.bound_intersect = null;
        this.bound_prev = null;
        this.menu_intersect = null;
        this.menu_prev = null;

        this.commit_buffer = 1;
    }

    roundHoverBuffer() {
        this.hoverBuffer *= 1000;
        this.hoverBuffer = Math.floor(this.hoverBuffer);
        this.hoverBuffer /= 1000;
    }

    crosshairOnHover() {
        if (this.hoverBuffer <= this.crosshairSize.outerRadius) {
            this.hoverBuffer += this.hoverMod;
            this.roundHoverBuffer();
            this.objects.crosshair.geometry.dispose();
            if (this.hoverBuffer >= this.crosshairSize.outerRadius) {
                this.objects.crosshair.geometry = new THREE.RingBufferGeometry(
                    this.crosshairSize.innerRadius,
                    this.crosshairSize.outerRadius,
                    32
                );
            } else {
                this.objects.crosshair.geometry = new THREE.RingBufferGeometry(
                    this.hoverBuffer - (this.crosshairSize.outerRadius - this.crosshairSize.innerRadius),
                    this.hoverBuffer,
                    32
                );
            }
        }
    }

    crosshairOffHover() {
        if (this.hoverBuffer >= this.hover) {
            this.hoverBuffer -= this.hoverMod;
            this.roundHoverBuffer();
            this.objects.crosshair.geometry.dispose();
            if (this.hoverBuffer <= this.hover) this.objects.crosshair.geometry = new THREE.CircleBufferGeometry(this.hoverBuffer);
            else this.objects.crosshair.geometry = new THREE.RingBufferGeometry(
                this.hoverBuffer - (this.crosshairSize.outerRadius - this.crosshairSize.innerRadius),
                this.hoverBuffer,
                32
            );
        }
    }

    updateCommit(object) {
        return this.commit_buffer/object.commit_time;
    }

    buffer() {
        this.commit_buffer += 1;
    }

    resetBuffer() {
        this.commit_buffer = 1;
        this.updateBufferGeometry(null, true);
    }

    updateBufferGeometry(object, reset = false) {
        this.objects.buffer.geometry.dispose();
        var geometry;
        if (reset) {
            geometry = new THREE.RingBufferGeometry(
                this.bufferDefaultGeometry.innerRadius,
                this.bufferDefaultGeometry.outerRadius,
                this.bufferDefaultGeometry.thetaSegments,
                this.bufferDefaultGeometry.phiSegments,
                this.bufferDefaultGeometry.thetaStart,
                this.bufferDefaultGeometry.thetaLength
            );
        } else {
            geometry = new THREE.RingBufferGeometry(
                this.bufferDefaultGeometry.innerRadius,
                this.bufferDefaultGeometry.outerRadius,
                this.bufferDefaultGeometry.thetaSegments,
                this.bufferDefaultGeometry.phiSegments,
                this.bufferDefaultGeometry.thetaStart,
                (object.commit_percent * Math.PI) * 2
            );
        }
        this.objects.buffer.geometry = geometry;
    }

    isVisible(object) {
        return object.visible;
    }

    hasOnCommit(object) {
        return typeof(object.onCommit) != 'undefined' ? true : false;
    }

    hasOffCommit(object) {
        return typeof(object.offCommit) != 'undefined' ? true : false;
    }

    hasCommitTime(object) {
        return typeof(object.commit_time) != 'undefined' ? true : false;
    }

    objIntersect(intersects) {
        if (intersects.length > 0) {
            this.obj_intersect = intersects[0].object;
            if (this.hasOnCommit(this.obj_intersect)) this.obj_intersect.onCommit();
        } else {
            this.obj_intersect = null;
        }
        if (this.obj_intersect == null && this.obj_prev != null) {
            if (this.hasOffCommit(this.obj_prev)) this.obj_prev.offCommit();
        }

        this.obj_prev = this.obj_intersect;
    }

    boundIntersect(intersects) {
        if (intersects.length > 0) {
            this.crosshairOnHover();
            this.bound_intersect = intersects[0].object;
            if (this.hasOnCommit(this.bound_intersect)) this.bound_intersect.onCommit();
        } else {
            this.crosshairOffHover();
            this.bound_intersect = null;
        }
        if (this.bound_intersect == null && this.bound_prev != null) {
            if (this.hasOffCommit(this.bound_prev)) this.bound_prev.offCommit();
        }
        this.bound_prev = this.bound_intersect;
    }

    menuIntersect(intersects) {
        if (intersects.length > 0) {
            this.menu_intersect = intersects[0].object;
            if (this.hasOnCommit(this.menu_intersect) && this.isVisible(this.menu_intersect)) {
                if (this.hasCommitTime(this.menu_intersect) && this.menu_intersect.commit_percent != 1) {
                    this.menu_intersect.commit_percent = this.updateCommit(this.menu_intersect);
                    this.buffer();
                    this.updateBufferGeometry(this.menu_intersect);
                }
                else this.menu_intersect.onCommit();
            }
        } else {
            this.menu_intersect = null;
        }
        if (this.menu_intersect != this.menu_prev && this.menu_prev != null) {
            if (this.hasOffCommit(this.menu_prev)) this.menu_prev.offCommit();
            if (this.hasCommitTime(this.menu_prev)) {
                this.menu_prev.commit_percent = 0;
                this.resetBuffer(true);
            }
        }

        this.menu_prev = this.menu_intersect;
    }
}