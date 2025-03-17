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
    renderer.setSize(gameWindow.clientWidth, gameWindow.clientHeight);
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
                const currentBuildingId = buildings[x][y]?.userData.id;
                const newBuildingId = city.data[x][y].buildingId;

                if(!newBuildingId && currentBuildingId){
                    scene.remove(buildings[x][y]);
                    buildings[x][y] = undefined;
                }
                
                //se os dados do medelo mudar, atuliza atualiza a malha
                if(newBuildingId !== currentBuildingId){
                    scene.remove(buildings[x][y]);
                    buildings[x][y] = createAssetInstance(newBuildingId,x,y)
                    scene.add(buildings[x][y])
                }
            }
        }
    }

    function setupLights(){
        const lighs = [
            new THREE.AmbientLight(0xffffff,0.2),
            new THREE.DirectionalLight(0xffffff,0.3),
            new THREE.DirectionalLight(0xffffff,0.3),
            new THREE.DirectionalLight(0xffffff,0.3),
        ]

        lighs[1].position.set(0,1,0);
        lighs[2].position.set(0,1,0);
        lighs[3].position.set(0,1,0);

        scene.add(...lighs)
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

    function onMouseDown(event){
        console.log('TESTE')
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
