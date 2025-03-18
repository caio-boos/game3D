import * as THREE from 'three';
import { createCamera } from './camera.js'
import { createAssetInstance } from './assets.js';

export function createScene() {
    // Inicializando a cena corretamente
    const gameWindow = document.getElementById('render-target');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x777777);

    const camera = createCamera(gameWindow);

    // Configuração do renderizador
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(gameWindow.clientWidth, gameWindow.offsetHeight);
    renderer.setClearColor(0x00000,0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    gameWindow.appendChild(renderer.domElement);

  
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let selectedObject = undefined;
    
    let terrain = [];
    let buildings = [];

    let onObjectSelected = undefined;

    function initialize(city){
        scene.clear();
        terrain = [];
        buildings = []
        for(let x = 0 ; x < city.size;x++){
            const column = []
            for(let y = 0;y<city.size;y++){
                const terrainId = city.data[x][y].terrainId;
                const mesh = createAssetInstance(terrainId,x,y)
                scene.add(mesh);
                column.push(mesh)
            }
            terrain.push(column)
            buildings.push([...Array(city.size)]);
        }
        setupLights()
    }

    function update(city){
        for(let x = 0 ; x < city.size;x++){
            for(let y = 0;y<city.size;y++){
                const tile = city.data[x][y];
                const existingBuildingMesh = buildings[x][y];

                if(!tile.building && existingBuildingMesh){
                    scene.remove(existingBuildingMesh);
                    buildings[x][y] = undefined;
                }
                
                //se os dados do medelo mudar, atuliza atualiza a malha
                if(tile.building && tile.building.updated){
                    scene.remove(existingBuildingMesh);
                    buildings[x][y] = createAssetInstance(tile.building.id,x,y,tile.building)
                    scene.add(buildings[x][y])
                    tile.building.updated =false;
                }
            }
        }
    }

    function setupLights(){
       const sun = new THREE.DirectionalLight(0xfffffff,1);
       sun.position.set(20,20,20);
       sun.castShadow = true;
       sun.shadow.camera.left = -10;
       sun.shadow.camera.right = 10;
       sun.shadow.camera.top = -0;
       sun.shadow.camera.bottom = -10;
       sun.shadow.mapSize.width = 1024;
       sun.shadow.mapSize.height = 1024;
       sun.shadow.camera.near = 0.5;
       sun.shadow.camera.far = 50;
       scene.add(sun);
       scene.add(new THREE.AmbientLight(0xfffffff,0.3))
    //    const helper = new THREE.CameraHelper(sun.shadow.camera);
    //    scene.add(helper)

    }

    function draw() {
        renderer.render(scene, camera.camera);
    }

    function start() {
        renderer.setAnimationLoop(draw);
    }

    function stop() {
        renderer.setAnimationLoop(null);
    }
    // function onResize(){
    //     camera.ma
    // }

    function onMouseDown(event){
        camera.onMouseDown(event);

        mouse.x =  (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

        raycaster.setFromCamera(mouse,camera.camera);

        let intersections = raycaster.intersectObjects(scene.children,false);

        if(intersections.length > 0){
            if(selectedObject) selectedObject.material.emissive.setHex(0)
            selectedObject = intersections[0].object;
            selectedObject.material.emissive.setHex(0x555555);
            
            if(this.onObjectSelected){
                this.onObjectSelected(selectedObject)
            }
        }
    }

    function onMouseUp(event){
        camera.onMouseUp(event);
    }

    function onMouseMove(event){
        camera.onMouseMove(event)
    }

    return {
        onObjectSelected,
        initialize,
        update,
        start,
        stop,
        onMouseDown,
        onMouseUp,
        onMouseMove

    };
}
