import {createScene} from './scene.js' ;
import {createCity} from './city.js'
import buildingFactory from './buildings.js'
export function createGame(){
    let activeToolId = ''
    const scene = createScene();
    const city  = createCity(16) 
    
    scene.initialize(city);

    scene.onObjectSelected = (selectedObject) =>{
        let {x,y} = selectedObject.userData;
        const tile = city.data[x][y];

        if(activeToolId === 'bulldoze'){
            tile.buildingId = undefined;
            scene.update(city)
        }else if(!tile.building){
            tile.building = buildingFactory?.[activeToolId]();
            scene.update(city)
        }
    }

    // window.scene = scene;
    document.addEventListener('mousedown',scene.onMouseDown.bind(scene),false);
    document.addEventListener('mouseup',scene.onMouseUp.bind(scene),false);
    document.addEventListener('mousemove',scene.onMouseMove.bind(scene),false);
    document.addEventListener('contextmenu',(event)=>event.preventDefault(),false);

    const game = {
        update(){
            city.update();
            scene.update(city)
        },
        setActiveToolId(toolId){
            activeToolId = toolId
            console.log(activeToolId)
        }
    }

    setInterval(()=>{
        game.update()
    },1000)

    scene.start();

    return game

}