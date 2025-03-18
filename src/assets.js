import * as THREE from 'three';

const cube = new THREE.BoxGeometry(1, 1, 1);

let loader = new THREE.TextureLoader();

function loadTexture(url){
    const text = loader.load(url);
    text.wrapS = THREE.RepeatWrapping;
    text.wrapT = THREE.RepeatWrapping;
    text.repeat.set(1,1);
    return text;
}

const textures = {
    'grass':loadTexture('public/textures/grass.png'),
    'residential1':loadTexture('public/textures/residential1.png'),
    'residential2':loadTexture('public/textures/residential2.png'),
    'residential3':loadTexture('public/textures/residential3.png'),
    'commercial1':loadTexture('public/textures/commercial1.png'),
    'commercial2':loadTexture('public/textures/commercial2.png'),
    'commercial3':loadTexture('public/textures/commercial3.png'),
    'industrial1':loadTexture('public/textures/industrial1.png'),
    'industrial2':loadTexture('public/textures/industrial2.png'),
    'industrial3':loadTexture('public/textures/industrial3.png'),
}


function getTopMaterial(){
    return new THREE.MeshLambertMaterial({color:0x555555});
}

function getSideMaterial(textureName){
    return new THREE.MeshLambertMaterial({map:textures[textureName.clone()]})
}

/**
 * 
 * @param {string} assetId 
 * @param {number} x 
 * @param {number} y 
 * @param {object} data 
 * @returns 
 */

export function createAssetInstance(assetId,x,y,data){
    if(assetId in assets){
        return assets[assetId](x,y,data)
    }else{
        // console.warn(`Asset Id ${assetId} is not found`)
        return undefined
    }
}


const assets = {
    'grass':(x,y) =>{
        const material = new THREE.MeshLambertMaterial({ map:textures.grass });
        const mesh = new THREE.Mesh(cube, material);
        mesh.userData = { id:'grass',x,y};
        mesh.position.set(x,-0.5,y);
        mesh.receiveShadow = true;
        return mesh
    },
    'residential':(x,y,data)=>createZoneMesh(x,y,data),
    'commercial':(x,y,data)=>createZoneMesh(x,y,data),
    'industrial':(x,y,data)=>createZoneMesh(x,y,data),
    'road':(x,y)  =>{
        const material = new THREE.MeshLambertMaterial({ color: 0x2222222 });
        const mesh = new THREE.Mesh(cube, material);
        mesh.userData = {x,y};
        mesh.scale.set(1,0.2,1)
        mesh.position.set(x,0.01,y);
        mesh.receiveShadow = true;
        return mesh
    },
}

function createZoneMesh(x,y,data){
    const textureName = data.type + data.style;

    const topMaterial = getTopMaterial();
    const sideMaterial = getSideMaterial(textureName);
    let materialArray = [
        sideMaterial,//+x
        sideMaterial,//-x
        topMaterial,//+y
        topMaterial,//-y
        sideMaterial,//+z
        sideMaterial,//-z
    ]
    let mesh = new THREE.Mesh(cube,materialArray);
    mesh.userData = {x,y}
    mesh.scale.set(0.8,(data.height - 0.95)/2,0.8);
    mesh.material.forEach(material=>material.map?.reapeat.set(1,data.height -1));
    mesh.position.set(x,(data.height - 0.95)/4,y);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}
