// .obj FILES

// PATHS ARE FROM ROOT FOLDER

var objFiles2 = [
    {
        path: "model/skull/",
        file: "skull.obj",
        map: "texture.jpg",
        position: {
            x: 0,
            y: 0,
            z: -5
        },
        scale: 0.2,
        menu: {
            position: {
                x: 1.5,
                y: 0.5,
                z: 0
            },
            items : [
                {
                    text: "Spin X",
                    type: "function",
                    onCommit: (object) => {
                        if (typeof(object) != 'undefined') object.rotation.x += 0.02;
                    },
                    offCommit: () => {}
                },
                {
                    text: "Spin Y Positive",
                    type: "function",
                    onCommit: (object) => {
                        if (typeof(object) != 'undefined') object.rotation.y += 0.02;
                    },
                    offCommit: () => {}
                },
                {
                    text: "New Menu",
                    type: "menu",
                    onCommit: (submenu) => {
                        if (typeof(submenu) != 'undefined') submenu.displayMenu();
                    },
                    offCommit: () => {},
                    menu: {
                        items: [
                            {
                                text: "Float",
                                type: "function",
                                onCommit: (object) => {
                                    if (typeof(object) != 'undefined') object.position.y += 0.01;
                                },
                                offCommit: () => {}
                            },
                            {
                                text: "Close",
                                type: "close",
                                onCommit: (submenu) => {
                                    if (typeof(submenu) != 'undefined') submenu.visible = false;
                                },
                                offCommit: () => {}
                            },
                            {
                                text: "How deep can we go?",
                                type: "menu",
                                onCommit: () => {},
                                offCommit: () => {},
                                menu: {
                                    items: [
                                        {
                                            text: "Close Me",
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
                }
            ]
        },
    },
    // {
    //     path: "model/eyeball/",
    //     file: "eyeball.obj",
    //     mtl: "eyeball.mtl",
    //     position: {
    //         x: -3,
    //         y: 0,
    //         z: -5
    //     },
    //     scale: 0.3,
    //     menu: {
    //         items: [
    //             {
    //                 text: "Rotate Right",
    //                 type: "function",
    //                 onCommit: (object) => {
    //                     if (typeof(object) != 'undefined') object.rotation.y += 0.02;
    //                 },
    //                 offCommit: () => {}
    //             },
    //             {
    //                 text: "Rotate Left",
    //                 type: "function",
    //                 onCommit: (object) => {
    //                     if (typeof(object) != 'undefined') object.rotation.y -= 0.02;
    //                 },
    //                 offCommit: () => {},
    //             }
    //         ]
    //     }
    // },
    // {
    //     path: "model/plant/",
    //     file: "plant.obj",
    //     mtl: "plant.mtl",
    //     position: {
    //         x: 7,
    //         y: -2.8,
    //         z: -2.2
    //     },
    //     scale: 2,
    // }
];

export {objFiles2};