
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

var renderer;
var camera;
var scene;

var frameIndex;
var animationId;
var animationCalculatedData;

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
    var animationFileData = readFile(scenarioNum,frameCount).split(/[\r\n]+/);//get rows

    document.getElementById("status").innerHTML = "Calculating...";
    animationCalculatedData = calculateAnimationData(animationFileData);

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

function animate() {
    animationId = requestAnimationFrame( animate );
    if (frameIndex < animationCalculatedData.length){

        scene = new THREE.Scene();
        for (var j = 0; j<skeletonJointsConnections.length; j++){

            var startIndex = skeletonJointsConnections[j][0]-1;
            var endIndex = skeletonJointsConnections[j][1]-1;

            var geometry = new THREE.Geometry();
            geometry.vertices.push(animationCalculatedData[frameIndex][startIndex]);
            geometry.vertices.push(animationCalculatedData[frameIndex][endIndex]);
            var material = new THREE.LineBasicMaterial({color: 0x0ffffff});
            var line = new THREE.LineSegments(geometry, material);
            scene.add(line);
        }
        frameIndex++;
        renderer.render(scene, camera);

    } else {
        cancelAnimationFrame(animationId);
        document.getElementById("status").innerHTML = "Finished playing.";
    }
}

function calculateAnimationData(animationFileData) {

    var frameData = [];
    for (var i = 0; i < animationFileData.length; i++){//we ommit first and last frame

        var points = [];
        var row = animationFileData[i].trim().split(/\s+/);
        var frameId = row[0];

        for (var j = 1; j<row.length;){//we omit the first number (frame id)

            var point = new THREE.Vector3();
            point.x = row[j++];
            point.y = row[j++];
            point.z = row[j++];

            points.push(point);
        }
        frameData.push(points);
    }
    return frameData;
}

var alpha = 0.5;//set from 0-1

function catmulRom(p0,p1,p2,p3, amountOfPoints){
    var newPoints = [];

    var t0 = 0.0;
    var t1 = getT(t0, p0, p1);
    var t2 = getT(t1, p1, p2);
    var t3 = getT(t2, p2, p3);

    for(var t=t1+((t2-t1)/(amountOfPoints+1)); t<t2; t+=((t2-t1)/(amountOfPoints+1))){

        var A1 = (p0.clone().multiplyScalar((t1-t)/(t1-t0))).add(p1.clone().multiplyScalar((t-t0)/(t1-t0)));
        var A2 = (p1.clone().multiplyScalar((t2-t)/(t2-t1))).add(p2.clone().multiplyScalar((t-t1)/(t2-t1)));
        var A3 = (p2.clone().multiplyScalar((t3-t)/(t3-t2))).add(p3.clone().multiplyScalar((t-t2)/(t3-t2)));

        var B1 = (A1.clone().multiplyScalar((t2-t)/(t2-t0))).add(A2.clone().multiplyScalar((t-t0)/(t2-t0)));
        var B2 = (A2.clone().multiplyScalar((t3-t)/(t3-t1))).add(A3.clone().multiplyScalar((t-t1)/(t3-t1)));

        var C = (B1.clone().multiplyScalar((t2-t)/(t2-t1))).add(B2.clone().multiplyScalar((t-t1)/(t2-t1)));

        newPoints.push(C.clone());
    }
    return newPoints;


}

function getT(t, p0, p1) {
    var a = Math.pow((p1.x-p0.x), 2.0) + Math.pow((p1.y-p0.y), 2.0) + Math.pow((p1.z-p0.z), 2.0);
    var b = Math.pow(a, 0.5);
    var c = Math.pow(b, alpha);

    return (c + t);
}

