

var fov = 70;
var lon = 0;
var lat = 0;
var phi = 0;
var theta = 0;


var container;
var camera;
var scene;
var renderer;
var video;
var texture;
var material;
var mesh;
var lookSensitivity = 0.25;
var currentSize = "FULL_SCREEN";

////
// UI
var menu = document.getElementById("menu");

function generateButtonCallback(url) {
	return function(event) {
		loadMolecule(url);
	}
}

function createMenu() {
	var button;
	
	//play
	button = document.createElement('button');
	button.innerHTML = "Play/Pause";
	menu.appendChild(button);
	button.addEventListener('click', videoPlayOrPause, false);
	
	//stop
	button = document.createElement('button');
	button.innerHTML = "Stop";
	menu.appendChild(button);
	button.addEventListener('click', videoStop, false);
	
	//small
   button = document.createElement('button');
   button.innerHTML = "Small";
   menu.appendChild(button);
   button.addEventListener('click', function() {
      changeSize("SMALL");
   }, false);
   
   //large
   button = document.createElement('button');
   button.innerHTML = "Large";
   menu.appendChild(button);
   button.addEventListener('click', function() {
      changeSize("LARGE");
   }, false);
   
   //full screen
   button = document.createElement('button');
   button.innerHTML = "Full";
   menu.appendChild(button);
   button.addEventListener('click', function() {
      changeSize("FULL_SCREEN");
   }, false);
}

////


init();
animate();
createMenu();

function init() {

   container = document.createElement('div');
   document.body.appendChild(container);
   var size = getVideoDimensions();
   camera = new THREE.PerspectiveCamera(fov, size[0] / size[1], 1, 1000);

   scene = new THREE.Scene();

   var light = new THREE.DirectionalLight(0xffffff);
   light.position.set(0.5, 1, 1).normalize();
   scene.add(light);

   renderer = new THREE.WebGLRenderer({
      antialias: false
   });
   renderer.setSize(size[0], size[1]);

   container.appendChild(renderer.domElement);

   video = document.getElementById('video');
   texture = new THREE.Texture(video);
   texture.minFilter = THREE.LinearFilter;

   //

   var parameters = {
         color: 0xffffff,
         map: texture
   };
   var material_base = new THREE.MeshLambertMaterial(parameters);
   
   
   var geometry = new THREE.SphereGeometry(600, 60, 40);
   material = new THREE.MeshBasicMaterial(parameters);
   mesh = new THREE.Mesh(geometry, material);
   mesh.scale.x = -1;
   scene.add(mesh);

   //
   
   document.addEventListener('mousedown', onDocumentMouseDown, false);
   document.addEventListener('mousewheel', onDocumentMouseWheel, false);
   document.addEventListener('DOMMouseScroll', onDocumentMouseWheel, false);
   window.addEventListener('resize', onWindowResized, false);

   onWindowResized(null);

}

function onWindowResized(event) {
   var size = getVideoDimensions();
   renderer.setSize(size[0], size[1]);
   camera.projectionMatrix.makePerspective(fov, size[0] / size[1], 1, 1100);
}

function onDocumentMouseDown(event) {

   event.preventDefault();

   onPointerDownPointerX = event.clientX;
   onPointerDownPointerY = event.clientY;

   onPointerDownLon = lon;
   onPointerDownLat = lat;

   document.addEventListener('mousemove', onDocumentMouseMove, false);
   document.addEventListener('mouseup', onDocumentMouseUp, false);

}

function onDocumentMouseMove(event) {
   lon = (event.clientX - onPointerDownPointerX)
      * lookSensitivity + onPointerDownLon;
   lat = (event.clientY - onPointerDownPointerY)
      * lookSensitivity + onPointerDownLat;
}


function onDocumentMouseUp(event) {
   document.removeEventListener('mousemove', onDocumentMouseMove, false);
   document.removeEventListener('mouseup', onDocumentMouseUp, false);
}

function onDocumentMouseWheel(event) {

   // WebKit
   if (event.wheelDeltaY) {
      fov -= event.wheelDeltaY * 0.05;
   }
   // Opera / Explorer 9
   else if (event.wheelDelta) {
      fov -= event.wheelDelta * 0.05;
   }
   // Firefox
   else if (event.detail) {
      fov += event.detail * 1.0;
   }

   var size = getVideoDimensions();
   camera.projectionMatrix.makePerspective(fov, size[0] / size[1], 1, 1100);
}

function animate() {
   requestAnimationFrame(animate);
   render();
}

function render() {

   var time = Date.now();

   lat = Math.max(-85, Math.min(85, lat));
   phi = THREE.Math.degToRad(90 - lat);
   theta = THREE.Math.degToRad(lon);

   camera.position.x = 100 * Math.sin(phi) * Math.cos(-theta);
   camera.position.y = 100 * -Math.cos(phi);
   camera.position.z = 100 * Math.sin(phi) * Math.sin(-theta);
   
   camera.lookAt(scene.position);
   
   if (video.readyState === video.HAVE_ENOUGH_DATA) {
      if (texture) {
         texture.needsUpdate = true;
      }
   }
   renderer.render(scene, camera);
}

////

function getVideoDimensions() {
   if (currentSize == "SMALL") {
      return [640, 390];
   }
   else if (currentSize == "LARGE") {
      return [854, 510];
   }
   else if (currentSize == "FULL_SCREEN") {
      return [window.innerWidth, window.innerHeight];
   }
}

function changeSize(size) {
   currentSize = size;
   onWindowResized(null);
}


////
// Video Controls
////

function videoPlayOrPause() {
   if (!(video.readyState === video.HAVE_ENOUGH_DATA)) {
      return;
   }

   if (video.paused) {
      video.play();
   } else {
      video.pause();
   }
}

function videoStop() {
   if (!(video.readyState === video.HAVE_ENOUGH_DATA)) {
      return;
   }
   video.pause();
   video.currentTime = 0;
}

function videoRewind() {
   video.currentTime = 0;
}
