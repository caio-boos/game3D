import * as THREE from 'three';
import { createCamera } from './camera.js'

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

  

    let terrain = [];
    let buildings = []
    function initialize(city){
        scene.clear();
        terrain = [];
        buildings = []
        for(let x = 0 ; x < city.size;x++){
            const column = []
            for(let y = 0;y<city.size;y++){
                  // geometria da garama
                const geometry = new THREE.BoxGeometry(1, 1, 1);
                const material = new THREE.MeshLambertMaterial({ color: 0x00aa00 });
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(x,-0.5,y);
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
                if(tile.building && tile.building.startsWith('building')){
                    console.log(tile)
                    const heigth = Number(tile.building.slice(-1))
                    const buildingGeometry = new THREE.BoxGeometry(1, heigth, 1);
                    const buildingMaterial = new THREE.MeshLambertMaterial({ color: 0x777777 });
                    const buildingMesh = new THREE.Mesh(buildingGeometry, buildingMaterial);
                    buildingMesh.position.set(x,heigth/2,y);

                    if(buildings[x,y]){
                        scene.remove(buildings[x][y])
                    }

                    scene.add(buildingMesh);
                    buildings[x][y] = buildingMesh;

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
        camera.onMouseDown(event);
    }

    function onMouseUp(event){
        camera.onMouseUp(event);
    }

    function onMouseMove(event){
        camera.onMouseMove(event)
    }

    return {
        initialize,
        update,
        start,
        stop,
        onMouseDown,
        onMouseUp,
        onMouseMove

    };
}
