
var skeletenonJoints = [
                [4,3],
                [3,2],
        [3,5],          [3,9],
    [5,6],                  [9,10],
    [6,7],      [2,1],      [10,11],
[7,8],                          [11,12],
            [1,13], [1,17],
        [13,14],        [17,18],
        [14,15],        [18,19],
    [15,16],                [19,20]
]

var renderer;
var camera;
var scene;

function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 50);
    camera.position.set(0, 0, 0);
    camera.lookAt(new THREE.Vector3(0, 0, 1));

    scene = new THREE.Scene();
    renderer.render(scene, camera);
}

function play(){
    scene = new THREE.Scene();
    var material = new THREE.LineBasicMaterial({color: 0x0ffffff});

    scenarioNum = document.querySelector('input[name="scenario"]:checked').value;
    frameCount= document.querySelector('input[name="frames"]:checked').value;
    var animationData = readFile(scenarioNum,frameCount).split(/\s+/);

    for (var i = 0; i < animationData.length/(20*3+1); i++){//each line has (20 joints * 3 coordinates + 1 frame) numbers
        var frameNum = animationData[i+61];
        for (var j = 0; j<skeletenonJoints.length; j++){

            startIndex = skeletenonJoints[j][0];
            endIndex = skeletenonJoints[j][1];

            x1 = animationData[(i*61)+1+(startIndex-1)*3];
            y1 = animationData[(i*61)+1+(startIndex-1)*3+1];
            z1 = animationData[(i*61)+1+(startIndex-1)*3+2];

            x2 = animationData[(i*61)+1+(endIndex-1)*3];
            y2 = animationData[(i*61)+1+(endIndex-1)*3+1];
            z2 = animationData[(i*61)+1+(endIndex-1)*3+2];

            var geometry = new THREE.Geometry();
            geometry.vertices.push(new THREE.Vector3(x1, y1, z1));
            geometry.vertices.push(new THREE.Vector3(x2, y2, z2));
            console.log(x1,y1,z1,x2,y2,z2);
            var line = new THREE.LineSegments(geometry, material);
            scene.add(line);
        }
        break;//temp
    }
    renderer.render(scene, camera);
}

function readFile(scenarioNum, frameCount) {
    var request = new XMLHttpRequest();
    request.open("GET", "animations/anim_"+ scenarioNum +"_"+ frameCount +".txt", false);
    request.send(null);
    return request.responseText;
}

init();