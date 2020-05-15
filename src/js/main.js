/* jshint esversion: 6 */
/* global window, document, TweenMax, THREE, WEBVR */

// import * as THREE from 'three';
//import { threadId } from 'worker_threads';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { RoughnessMipmapper } from 'three/examples/jsm/utils/RoughnessMipmapper.js';
import InteractiveMesh from './interactive/interactive.mesh';

class webvr {

	constructor() {
		this.i = 0;
		this.mouse = { x: 0, y: 0 };
		this.parallax = { x: 0, y: 0 };
		this.size = { width: 0, height: 0, aspect: 0 };
		this.cameraDirection = new THREE.Vector3();
		this.init();
	}

	init() {
		this.render = this.render.bind(this);

		const section = this.section = document.querySelector('.webvr');
		const container = this.container = section.querySelector('.webvr__container');
		const debugInfo = this.debugInfo = section.querySelector('.debug__info');

		const scene = this.scene = new THREE.Scene();

		const camera = this.camera = new THREE.PerspectiveCamera(45, container.offsetWidth / container.offsetHeight, 0.1, 1000);
		camera.position.set(-1.8, 0.6, 2.7);
		camera.target = new THREE.Vector3();

		const light1 = new THREE.PointLight(0xffffff, 2, 50);
		const light2 = new THREE.PointLight(0xffffff, 2, 50);
		// Specify the light's position
		light1.position.set(-10 , 10, 10);
		light2.position.set(1, 1, 10);
		// Add the light to the scene
		scene.add(light1)
		scene.add(light2)

		const renderer = this.renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setClearColor(0xffffff, 1);
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(container.offsetWidth, container.offsetHeight);
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 0.6;
		renderer.outputEncoding = THREE.sRGBEncoding;
		container.appendChild(renderer.domElement);

		const controls = this.controler = new OrbitControls(camera, renderer.domElement);
		controls.addEventListener('change', this.render); // use if there is no animation loop
		controls.minDistance = 2;
		controls.maxDistance = 10
		controls.target.set(0, 0, -0.2);
		controls.update();

		const pivot = this.pivot = new THREE.Group();
		this.scene.add(pivot);

		this.loadRgbeBackground('/StoreView/textures/equirectangular/', 'industrial_pipe_and_valve_02_2k.hdr', (envMap) => {
			this.render();
			this.loadGltfModel('/StoreView/models/gltf/model/gltf/', 'stufa.glb', (model) => {
				pivot.scale.set(25, 25, 25);
				pivot.position.set(0, 0, 0); //-0.5
				pivot.add(model);
				this.render();
			});
		});

		this.onWindowResize = this.onWindowResize.bind(this);
		window.addEventListener('resize', this.onWindowResize, false);
	}

	loadRgbeBackground(path, file, callback) {
		const scene = this.scene;
		const renderer = this.renderer;
		const pmremGenerator = new THREE.PMREMGenerator(renderer);
		pmremGenerator.compileEquirectangularShader();
		const loader = new RGBELoader();
		loader
			.setDataType(THREE.UnsignedByteType)
			.setPath(path)
			.load(file, function (texture) {
				const envMap = pmremGenerator.fromEquirectangular(texture).texture;
				//scene.background = envMap;
				scene.environment = envMap;
				texture.dispose();
				pmremGenerator.dispose();
				if (typeof callback === 'function') {
					callback(envMap);
				}
			});
		return loader;
	}

	loadGltfModel(path, file, callback) {
		const renderer = this.renderer;
		const roughnessMipmapper = new RoughnessMipmapper(renderer); // optional
		const loader = new GLTFLoader().setPath(path);
		loader.load(file, function (gltf) {
			gltf.scene.traverse(function (child) {
				if (child.isMesh) {
					roughnessMipmapper.generateMipmaps(child.material);
				}
			});
			if (typeof callback === 'function') {
				callback(gltf.scene);
			}
			roughnessMipmapper.dispose();
		});
	}

	updateRaycaster() {
		try {
			/*
			const controllers = this.controllers;
			const controller = controllers.controller;
			if (controller) {
				const raycaster = this.raycaster;
				const position = controller.position;
				const rotation = controller.getWorldDirection(controllers.controllerDirection).multiplyScalar(-1);
				raycaster.set(position, rotation);
				const hit = InteractiveMesh.hittest(raycaster, controllers.gamepads.button);
			}
			*/
		} catch (error) {
			this.debugInfo.innerHTML = error;
		}
	}

	render(delta) {
		try {
			// this.updateOld();
			const renderer = this.renderer;
			renderer.render(this.scene, this.camera);
			this.i++;
		} catch (error) {
			this.debugInfo.innerHTML = error;
		}
	}

	animate() {
		const renderer = this.renderer;
		renderer.setAnimationLoop(() =>
			this.render());
	}

	onWindowResize() {
		try {
			const container = this.container,
				renderer = this.renderer,
				camera = this.camera;
			const size = this.size;
			size.width = container.offsetWidth;
			size.height = container.offsetHeight;
			size.aspect = size.width / size.height;
			if (renderer) {
				renderer.setSize(size.width, size.height);
			}
			if (camera) {
				camera.aspect = size.width / size.height;
				camera.updateProjectionMatrix();
			}
		} catch (error) {
			this.debugInfo.innerHTML = error;
		}
	}

	initOld__() {
		
		
	}

	loadObjects__() {
		
	}

	updateOld__() {
		const s = 1 + Math.cos(this.i * 0.1) * 0.5;
		if (this.cuber) {
			this.cube.rotation.y += Math.PI / 180 * 5;
			this.cube.rotation.x += Math.PI / 180 * 1;
			this.cube.scale.set(s, s, s);
		}
		if (this.prisme) {
			this.prisme.rotation.y += Math.PI / 180 * 5;
			this.prisme.rotation.x += Math.PI / 180 * 1;
			this.prisme.scale.set(s, s, s);
		}
		
		if (this.controllers) {
			this.controllers.update();
		}
		this.updateRaycaster();
	}

}

const tour = new webvr();
tour.animate();
