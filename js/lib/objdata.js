// .obj FILES

// PATHS ARE FROM ROOT FOLDER
var objFiles = [
    {
        path: "model/skull/",
        file: "skull.obj",
        map: "texture.jpg",
        position: {
            x: 0,
            y: -1,
            z: -5
        },
        scale: 0.2,
        actions: [
            'spinX',
            'spinYP',
            'spinZ'
        ],
    },
    // {
    //     path: "model/room/",
    //     file: "Coffee Kiosk.obj",
    //     position: {
    //         x: 0,
    //         y: -10,
    //         z: 0
    //     },
    //     scale: 0.4,
    // },
    // {
    // 	path: "model/eyeball/",
    // 	file: "eyeball.obj",
    // 	mtl: "eyeball.mtl",
    // 	position: {
    // 		x: -5,
    // 		y: -1,
    // 		z: -5
    // 	},
    // 	scale: 0.3,
    // 	actions: [
    // 		'spinYP',
    // 		'spinYN'
    // 	]
    // },
    // {
    // 	path: "model/plant/",
    // 	file: "plant.obj",
    // 	mtl: "plant.mtl",
    // 	position: {
    // 		x: 13,
    // 		y: -2.8,
    // 		z: -2.2
    // 	},
    // 	scale: 2,
    // }
];

export {objFiles};