
var jointCount = 20;
var skeletonJointsConnections = [
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
];
var fileRowDataCount = (jointCount * 3) + 1;//each line has (20 joints * 3 coordinates + 1 frame) numbers

var renderer;
var camera;
var scene;

var animationData;
var frameIndex;

function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 50);
    camera.position.set(0, 0, 0);
    camera.lookAt(new THREE.Vector3(0, 0, 1));

    scene = new THREE.Scene();
    renderer.render(scene, camera);
}


function play(){

    scenarioNum = document.querySelector('input[name="scenario"]:checked').value;
    frameCount= document.querySelector('input[name="frames"]:checked').value;
    animationData = readFile(scenarioNum,frameCount).split(/\s+/);
    frameIndex = 0;
    document.getElementById("status").innerHTML = "Playing...";
    animate();
}

function readFile(scenarioNum, frameCount) {
    var request = new XMLHttpRequest();
    request.open("GET", "animations/anim_"+ scenarioNum +"_"+ frameCount +".txt", false);
    request.send(null);
    return request.responseText;
}


var animationId;

function animate() {
    animationId = requestAnimationFrame( animate );

    if (frameIndex < animationData.length/fileRowDataCount){
        scene = new THREE.Scene();
        var frameNum = animationData[frameIndex*fileRowDataCount];
        for (var j = 0; j<skeletonJointsConnections.length; j++){

            startIndex = skeletonJointsConnections[j][0];
            endIndex = skeletonJointsConnections[j][1];

            x1 = animationData[(frameIndex*fileRowDataCount)+1+(startIndex-1)*3];
            y1 = animationData[(frameIndex*fileRowDataCount)+1+(startIndex-1)*3+1];
            z1 = animationData[(frameIndex*fileRowDataCount)+1+(startIndex-1)*3+2];

            x2 = animationData[(frameIndex*fileRowDataCount)+1+(endIndex-1)*3];
            y2 = animationData[(frameIndex*fileRowDataCount)+1+(endIndex-1)*3+1];
            z2 = animationData[(frameIndex*fileRowDataCount)+1+(endIndex-1)*3+2];

            var geometry = new THREE.Geometry();
            geometry.vertices.push(new THREE.Vector3(x1, y1, z1));
            geometry.vertices.push(new THREE.Vector3(x2, y2, z2));
            //console.log(x1,y1,z1,x2,y2,z2);
            var material = new THREE.LineBasicMaterial({color: 0x0ffffff});
            var line = new THREE.LineSegments(geometry, material);
            scene.add(line);
        }
        frameIndex++;
        renderer.render(scene, camera);
    } else{
        cancelAnimationFrame(animationId);
        document.getElementById("status").innerHTML = "Finished playing.";
        console.log("end");
    }


}
init();