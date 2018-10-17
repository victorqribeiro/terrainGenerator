let s = 1;
let w = 256;
let h = 256;
let map;
let canvas = document.createElement('canvas');
canvas.width = w * s;
canvas.height = h * s;
let main = document.createElement('div');
main.id = "main";
main.appendChild(canvas);
let c = canvas.getContext('2d');
let colorful = false;

init();
draw(colorful);
createToolBar();
document.body.appendChild(main);

function init() {
  map = [];
  for (let i = 0; i < h; i++) {
    let row = [];
    for (let j = 0; j < w; j++) {
      row.push(Math.floor(Math.random() * 256));
    }
    map.push(row);
  }
}

function createToolBar(){
	let tools = {
		"New" : init,
		"Blur" : blur,
		"Contrast" : contrast,
		"Invert" : invert,
		"Color" : toggle,
		"3D" : createTerrain
	};
	let toolbar = document.createElement('div');
	toolbar.id = "toolbar";
	for(let key in tools){
		let btn = document.createElement('button');
		btn.innerText = key;
		btn.onclick = tools[key];
		btn.addEventListener("click", draw);
		toolbar.appendChild(btn);
	}
	document.body.appendChild(toolbar);
}

function draw() {
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      let cl = map[i][j];
      if (colorful) {
        if (map[i][j] / 255 < 0.3) {
          c.fillStyle = "blue";
        } else if (map[i][j] / 255 < 0.4) {
          c.fillStyle = "orange";
        } else if (map[i][j] / 255 < 0.6) {
          c.fillStyle = "green";
        } else if (map[i][j] / 255 < 0.9) {
          c.fillStyle = "brown";
        } else {
          c.fillStyle = "white";
        }
      } else {
        c.fillStyle = 'rgb(' + cl + ',' + cl + ',' + cl + ')';
      }
      c.fillRect(j * s, i * s, s, s);
    }
  }
}

function blur() {
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      let ln, rn, tn, bn;
      if (i == 0) {
        tn = map[h - 1][j];
      } else {
        tn = map[i - 1][j];
      }
      if (j == 0) {
        ln = map[i][w - 1];
      } else {
        ln = map[i][j - 1];
      }
      if (i == h - 1) {
        bn = map[0][j];
      } else {
        bn = map[i + 1][j];
      }
      if (j == w - 1) {
        rn = map[i][0];
      } else {
        rn = map[i][j + 1];
      }
      map[i][j] = Math.floor((tn + ln + rn + bn) / 4);
    }
  }
}

function contrast() {
  let black = 255, white = 0;
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      if (map[i][j] < black) {
        black = map[i][j];
      }
      if (map[i][j] > white) {
        white = map[i][j];
      }
    }
  }
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      map[i][j] = (map[i][j] - black) / (white - black) * 255;
    }
  }
}

function invert() {
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      map[i][j] = 255 - map[i][j];
    }
  }
}

function diagonal() {
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      map[i][j] = Math.floor((map[i][j] + map[(i + 1) % h][(j + 1) % w]) / 2);
    }
  }
}

function toggle() {
  if (colorful) {
    colorful = false;
  } else {
    colorful = true;
  }
}

document.addEventListener('keydown', function(e) {
  switch (e.keyCode) {
	  case 65 :
      	createTerrain();
      break;
    case 66 :
      	blur();
      break;
    case 67 :
      	contrast();
      break;
    case 73 :
      	invert();
      break;
    case 76 :
      	toggle();
      break;
    case 78 :
      	init();
      break;
  }
  draw(colorful);
});


function createTerrain(){
	let scene = new THREE.Scene();
	let camera = new THREE.PerspectiveCamera( 75, w*s/h*s, 0.1, 1000 );

	let t = document.getElementById('terrain');
	if(t){
		t.remove();
		//return;
	}
	
	let renderer = new THREE.WebGLRenderer();
	renderer.domElement.id = 'terrain';
	renderer.setSize( w*s, h*s );
	renderer.setClearColor(0x7EC0EE);
	//document.body.appendChild( renderer.domElement );
	main.appendChild( renderer.domElement );

	let sun = new THREE.PointLight(0xFCD440,1);
	sun.position.x = 3;
	sun.position.y = 5;
	scene.add( sun );

	let env = new THREE.AmbientLight(0x7EC0EE,0.3);
	env.position.y = 5;
	scene.add( env );

	let terrain_geometry = makeTile(0.1, 40);
	let terrain_material = new THREE.MeshLambertMaterial({color: new THREE.Color(0.9, 0.55, 0.4)});
	let terrain = new THREE.Mesh(terrain_geometry, terrain_material);
	terrain.position.x = -10;
	terrain.position.z = -10;
	terrain.updateMatrixWorld(true);
	scene.add(terrain);
	
	camera.position.y = 2;
	
	let a = 0;

	let animate = function() {
			requestAnimationFrame(animate);
			renderer.render(scene, camera);
			
			camera.position.x = Math.cos(a) * 3;
			camera.position.z = Math.sin(a) * 3;
			camera.lookAt(new THREE.Vector3(0,0,0) );
			a += 0.005;
	};

	function makeTile(size, res) {
		geometry = new THREE.Geometry();
		for (let i = 0; i < h; i++) {
			for (let j = 0; j < w; j++) {
				let z = j * size + 1 * size;
				let x = i * size + 1 * size;
				let y = map[i][j]/255;
				let position = new THREE.Vector3(x, y, z);
				let addFace = (i > 0) && (j > 0);
				makeQuad(geometry, position, addFace, w);
			}
		}
		geometry.computeFaceNormals();
		geometry.normalsNeedUpdate = true;

		return geometry;
	};

	function makeQuad(geometry, position, addFace, verts) {
		geometry.vertices.push(position);

		if (addFace) {
			let index1 = geometry.vertices.length - 1;
			let index2 = index1 - 1;
			let index3 = index1 - verts;
			let index4 = index1 - verts - 1;

			geometry.faces.push(new THREE.Face3(index2, index3, index1));
			geometry.faces.push(new THREE.Face3(index2, index4, index3));
		}
	};

	animate();
}
