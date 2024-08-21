import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let camera, scene, renderer, controls;
let dodecahedronGroup;
let raycaster, mouse;
const cursorDefault = 'img/360_cursor.png';
const cursorPointer = 'img/clic.png';

init();
animate();

function generateDarkerColor() {
    let r, g, b;

    do {
        r = Math.floor(Math.random() * 256);
        g = Math.floor(Math.random() * 256);
        b = Math.floor(Math.random() * 256);
    } while (r + g + b > 400);

    return `rgba(${r},${g},${b},0.9)`;
}

function createCircularButton(name, url) {
    const div = document.createElement('div');
    div.className = 'button';
    div.innerText = name;
    div.style.backgroundColor = generateDarkerColor();
    div.setAttribute('data-url', url);

    div.addEventListener('pointerdown', (event) => {
        event.stopPropagation();
        event.preventDefault();
        window.open(url, '_blank');
    });

    const object = new CSS3DObject(div);
    object.scale.set(-1, 1, 1);
    object.position.set(0, 0, 0);

    return object;
}

function createDodecahedron() {
    const group = new THREE.Group();
    const radius = 70;

    const buttonData = [
        { name: 'About Me', url: 'https://linktr.ee/jeidsgn' },
        { name: 'Textil Design', url: 'https://jeidsgn.tumblr.com/tagged/textil' },
        { name: 'Illustration', url: 'https://jeidsgn.tumblr.com/tagged/Ilustraciondigitaln' },
        { name: 'UX/UI', url: 'https://jeidsgn.tumblr.com/tagged/interface' },
        { name: 'Concept Art', url: 'https://linktr.ee/jeidsgn' },
        { name: 'Animation', url: 'https://www.instagram.com/' },
        { name: 'Branding', url: 'https://jeidsgn.tumblr.com/tagged/corporativo' },
        { name: 'Editorial Design', url: 'https://jeidsgn.tumblr.com/tagged/editorial' },
        { name: 'Programming', url: 'https://github.com/Jeidsgn' },
        { name: 'Math', url: 'https://www.youtube.com/@JeiDsgn' },
        { name: 'Digital Adaptation', url: 'https://linktr.ee/jeidsgn' },
        { name: 'Visual Content Pack', url: 'https://jeidsgn.github.io/Boost-Visual-Content-Pack/' }
    ];

    const pentagonCenters = [
        new THREE.Vector3(0, -1.618, 1).multiplyScalar(radius),
        new THREE.Vector3(0, 1.618, 1).multiplyScalar(radius),
        new THREE.Vector3(0, 1.618, -1).multiplyScalar(radius),
        new THREE.Vector3(0, -1.618, -1).multiplyScalar(radius),
        new THREE.Vector3(1, 0, 1.618).multiplyScalar(radius),
        new THREE.Vector3(-1, 0, 1.618).multiplyScalar(radius),
        new THREE.Vector3(-1, 0, -1.618).multiplyScalar(radius),
        new THREE.Vector3(1, 0, -1.618).multiplyScalar(radius),
        new THREE.Vector3(1.618, 1, 0).multiplyScalar(radius),
        new THREE.Vector3(-1.618, 1, 0).multiplyScalar(radius),
        new THREE.Vector3(1.618, -1, 0).multiplyScalar(radius),
        new THREE.Vector3(-1.618, -1, 0).multiplyScalar(radius)
    ];

    pentagonCenters.forEach((center, index) => {
        const geometry = new THREE.CircleGeometry(1, 32);
        geometry.rotateX(Math.PI / 2);

        const material = new THREE.MeshBasicMaterial({ visible: false });
        const faceMesh = new THREE.Mesh(geometry, material);

        faceMesh.position.copy(center);

        const button = createCircularButton(buttonData[index].name, buttonData[index].url);
        button.position.copy(center);
        button.lookAt(new THREE.Vector3(0, 0, 0));

        group.add(button);
    });

    return group;
}

function init() {
    const container = document.getElementById('container');

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    scene = new THREE.Scene();

    renderer = new CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    dodecahedronGroup = createDodecahedron();
    scene.add(dodecahedronGroup);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.maxPolarAngle = Math.PI * 1;
    controls.minPolarAngle = Math.PI * -0.5;

    // Configuración de Raycaster
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Eventos de mouse
    window.addEventListener('mousemove', onMouseMove, false);

    // Ajustar la posición de la cámara
    updateCameraPosition();

    window.addEventListener('resize', () => {
        onWindowResize();
        updateCameraPosition(); // Actualizar la posición de la cámara en el redimensionamiento
    });
}

function onMouseMove(event) {
    // Calcula las coordenadas del mouse en el rango de -1 a +1 para cada eje
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // Actualiza el raycaster con la posición del mouse
    raycaster.setFromCamera(mouse, camera);

    // Calcula los objetos intersectados
    const intersects = raycaster.intersectObjects(dodecahedronGroup.children);

    if (intersects.length > 0) {
        // Si el cursor está sobre un objeto 3D, cambia el cursor
        document.body.style.cursor = `url('${cursorPointer}'), auto`;
    } else {
        // Si el cursor no está sobre un objeto 3D, usa el cursor por defecto
        document.body.style.cursor = `url('${cursorDefault}'), auto`;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateCameraPosition() {
    // Ajusta la posición de la cámara en función del tamaño de la pantalla
    if (window.innerWidth <= 768) { // Asumir que 768px o menos es móvil
        camera.position.z = 450;
    } else {
        camera.position.z = 300;
    }
}

function animate() {
    requestAnimationFrame(animate);

    dodecahedronGroup.rotation.y += 0.005;

    renderer.render(scene, camera);
}
