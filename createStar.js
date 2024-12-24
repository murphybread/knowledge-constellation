import * as THREE from "three";

export async function createStarScene() {
  // scene , camera, renderer 파트
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1, // 카메라 near 값 조정
    1000
  );
  camera.position.set(0, 40, 15);
  camera.lookAt(0, 0, 0);
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // data.json 파일 읽어오기
  let data;
  try {
    const response = await fetch("data.json");
    if (!response.ok) {
      throw new Error(`Failed to fetch data.json: ${response.status}`);
    }
    data = await response.json();
  } catch (error) {
    console.error("Error loading data.json:", error);
    return;
  }

  // 원 생성 및 설정
  const sphericalObjectGeo = new THREE.SphereGeometry(1.5, 32, 16);
  const colors = [
    0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xff8800,
    0x8800ff,
  ];

  // group이 cluster인 데이터만 필터링
  const clusterData = data.filter((item) => item.group === "cluster");

  // clusterData의 개수만큼 원 생성
  for (let i = 0; i < clusterData.length; i++) {
    const item = clusterData[i];

    const sphericalObjectMat = new THREE.MeshBasicMaterial({
      color: colors[i % colors.length],
    });
    const sphericalObject = new THREE.Mesh(
      sphericalObjectGeo,
      sphericalObjectMat
    );
    // position 값이 없으면 기본값 설정
    const position = item.position
      ? new THREE.Vector3().setFromSpherical(
          new THREE.Spherical(...item.position)
        )
      : new THREE.Vector3(0, 0, 0);
    sphericalObject.position.copy(position);
    scene.add(sphericalObject);

    // 폰트 로더 생성
    const fontLoader = new THREE.FontLoader();
    // 폰트 로드
    fontLoader.load(
      "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
      (font) => {
        // 텍스트 메시 생성
        const textGeo = new THREE.TextGeometry(item.id, {
          font: font, // 로드한 폰트 적용
          size: 2,
          height: 0.2,
        });
        const textMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const textMesh = new THREE.Mesh(textGeo, textMat);
        // 텍스트 메시를 구의 자식으로 설정
        sphericalObject.add(textMesh);
        // 텍스트 메시 위치 조정
        textMesh.position.x = 2;
        textMesh.position.y = 2;
        textMesh.lookAt(camera.position);
      }
    );
  }

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
}
