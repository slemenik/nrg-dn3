
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

    var scenarioNum = document.querySelector('input[name="scenario"]:checked').value;
    var frameCount= document.querySelector('input[name="frames"]:checked').value;
    var animationFileData = readFile(scenarioNum,frameCount).trim().split(/[\r\n]+/);

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

    var frames = [];
    for (var i = 0; i<animationFileData.length; i++){
        var points = [];
        var frame = animationFileData[i].trim().split(/\s+/);
        for (var j = 1; j<frame.length;j+=3){//we omit the first number (frame number)
            points.push(new THREE.Vector3(parseFloat(frame[j]), parseFloat(frame[j+1]), parseFloat(frame[j+2])));
        }
        frames.push(points);
    }
    if (document.querySelector('input[name="interpolation"]:checked').value === "0" ) {
        return frames; //without catmull-rom
    }

    var solution = [];
    //artificially add duplicate first and last keyframe
    frames.unshift(frames[0]);
    frames.push(frames[frames.length-1]);

    var jointsCount = (j-1)/3; //last j from previous for loop keeps number of columns in row (61)->20 joints
    for (i = 0; i<jointsCount;i++){
        var newKeyFramePoints = [];
        for (var k = 1; k<frames.length-2;k++){//we omit both artificially added points as well as original last point

            var point0 = frames[k-1][i];
            var point1 = frames[k][i];
            var point2 = frames[k+1][i];
            var point3 = frames[k+2][i];
            var newFramesNeeded = parseInt(document.getElementById("frameCount").value);

            var newPoints = catmullRom(point0, point1, point2, point3, newFramesNeeded);
            newKeyFramePoints = newKeyFramePoints.concat(newPoints);
        }
        //add last point
        newKeyFramePoints.push(frames[k][i]);

        //transpose
        for (k = 0; k<newKeyFramePoints.length;k++){
            if (solution[k] == null) solution[k] = [];
            solution[k].push(newKeyFramePoints[k]);
        }
    }
    return solution;
}

function catmullRom(p0, p1, p2, p3, amountOfPoints){

    var newPoints = [];
    var t0 = 0.0;
    var t1 = 1.0;
    var t2 = 2.0;
    var t3 = 3.0;

    for(var t=t1; t<t2; t+=((t2-t1)/(amountOfPoints+1))){

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