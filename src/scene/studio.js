// Studio de la scène 3D : l'éclairage d'environnement qui se reflète dans le vernis, et l'ombre de contact au sol.
//
// Les deux fonctions ont besoin d'un vrai WebGLRenderer. Elles ne tournent donc pas sous Node et n'ont pas de test unitaire :
// leur contrôle se fait à l'œil, dans un navigateur. Elles restent minces et fidèles à la maquette.
// three.js et les shaders arrivent en paramètres, jamais par import.

// Les boîtes à lumière du studio : [largeur, hauteur, intensité, position]. Chacune regarde le centre de la pièce.
// Leur disposition vient de la maquette : une grande source au plafond, des bandes devant, sur les côtés et derrière.
const LAMPES = Object.freeze([
  [10, 4, 9, [0, 5.8, 2]],
  [11, 1.6, 7, [0, 3.6, 8.5]],
  [1.6, 8, 6, [-9, 1.5, 2]],
  [1.6, 8, 5, [9, 1.5, 3]],
  [8, 2.2, 2.2, [0, .6, 9]],
  [6, 2, 3, [0, 2.5, -9]],
]);

/**
 * Photographie le studio en carte d'environnement : de grandes boîtes à lumière qui se reflètent dans le vernis.
 * À poser dans scene.environment pour le mode réel.
 * @param {object} THREE Le module three.js.
 * @param {object} renderer Le THREE.WebGLRenderer de la scène.
 * @returns {object} Une THREE.Texture, prête pour scene.environment.
 */
export function creerStudio(THREE, renderer) {
  const studio = new THREE.Scene();
  studio.add(new THREE.Mesh(
    new THREE.BoxGeometry(20, 12, 20),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(.05, .05, .055), side: THREE.BackSide }),
  ));
  const sol = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(.16, .16, .17) }),
  );
  sol.position.y = -2;
  studio.add(sol);
  for (const [largeur, hauteur, intensite, position] of LAMPES) {
    const lampe = new THREE.Mesh(
      new THREE.PlaneGeometry(largeur, hauteur),
      new THREE.MeshBasicMaterial({ color: new THREE.Color().setScalar(intensite), side: THREE.DoubleSide }),
    );
    lampe.position.set(...position);
    lampe.lookAt(0, 0, 0);
    studio.add(lampe);
  }
  const pmrem = new THREE.PMREMGenerator(renderer);
  const texture = pmrem.fromScene(studio, .02).texture;
  pmrem.dispose(); // libère les shaders du générateur, la texture produite reste valable
  return texture;
}

// Réglages par défaut de l'ombre, repris de la maquette. Les dimensions sont en millimètres.
const OMBRE_PAR_DEFAUT = Object.freeze({
  largeur: 2400, profondeur: 1100, hauteur: 260, obscurite: 1.25, flou: Object.freeze([2, .8]), opacite: .75, sol: 0,
});
// Définition de la texture d'ombre, en pixels.
const RES_X = 1024, RES_Y = 512;

/**
 * Ombre de contact au sol. Elle est cuite une fois, car le vélo ne bouge pas, puis affichée sur un plan posé au sol.
 * Une caméra orthographique regarde la scène d'en bas, chaque matière est remplacée par une profondeur qui s'assombrit
 * près du sol, puis deux passes de flou (horizontal et vertical) adoucissent le résultat pour chaque valeur de `flou`.
 * Rappelle `cuire()` à chaque changement de forme du vélo (une pièce neuve, des plaquettes sorties).
 * Après `cuire()`, la scène doit être redessinée : le drapeau de rendu est à toi.
 * @param {object} THREE Le module three.js.
 * @param {object} renderer Le THREE.WebGLRenderer de la scène.
 * @param {object} scene La THREE.Scene qui contient le vélo. L'ombre y ajoute son plan.
 * @param {{HorizontalBlurShader: object, VerticalBlurShader: object}} shaders Les deux flous de three/addons/shaders.
 * @param {object} [opts] Réglages, tous facultatifs :
 *   largeur, profondeur : taille du plan d'ombre, hauteur : portée de la caméra au-dessus du sol ;
 *   obscurite : force de l'ombre ; flou : liste des rayons de flou, un par passe ; opacite : opacité du plan ;
 *   sol : hauteur du sol dans la scène (le plan d'ombre se pose 0,5 mm au-dessus, comme dans la maquette).
 * @returns {{cuire: Function}} `cuire()` calcule l'ombre et l'affiche.
 */
export function creerOmbre(THREE, renderer, scene, shaders, opts = {}) {
  const { largeur, profondeur, hauteur, obscurite, flou, opacite, sol } = { ...OMBRE_PAR_DEFAUT, ...opts };

  const groupe = new THREE.Group();
  groupe.position.set(0, sol + .5, 0);
  scene.add(groupe);

  const rt = new THREE.WebGLRenderTarget(RES_X, RES_Y), rtb = new THREE.WebGLRenderTarget(RES_X, RES_Y);
  rt.texture.generateMipmaps = rtb.texture.generateMipmaps = false;

  const geo = new THREE.PlaneGeometry(largeur, profondeur).rotateX(Math.PI / 2);
  const plan = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: rt.texture, transparent: true, depthWrite: false, opacity: opacite }));
  plan.renderOrder = 1;
  plan.scale.y = -1;
  groupe.add(plan);
  const planFlou = new THREE.Mesh(geo);
  planFlou.visible = false;
  groupe.add(planFlou);
  const camera = new THREE.OrthographicCamera(-largeur / 2, largeur / 2, profondeur / 2, -profondeur / 2, 0, hauteur);
  camera.rotation.x = Math.PI / 2;
  groupe.add(camera);

  // Matière de remplacement : noire, d'autant plus opaque que la pièce est proche du sol.
  const matProfondeur = new THREE.MeshDepthMaterial();
  matProfondeur.userData.darkness = { value: obscurite };
  matProfondeur.onBeforeCompile = sh => {
    sh.uniforms.darkness = matProfondeur.userData.darkness;
    sh.fragmentShader = 'uniform float darkness;\n' + sh.fragmentShader.replace(
      'gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );',
      'gl_FragColor = vec4( vec3( 0.0 ), ( 1.0 - fragCoordZ ) * darkness );',
    );
  };
  matProfondeur.depthTest = false;
  matProfondeur.depthWrite = false;

  const floueH = new THREE.ShaderMaterial(shaders.HorizontalBlurShader);
  const floueV = new THREE.ShaderMaterial(shaders.VerticalBlurShader);
  floueH.depthTest = floueV.depthTest = false;

  // Une passe de flou de rayon a : horizontal de rt vers rtb, puis vertical de rtb vers rt.
  function flouter(a) {
    planFlou.visible = true;
    planFlou.material = floueH;
    floueH.uniforms.tDiffuse.value = rt.texture;
    floueH.uniforms.h.value = a / RES_X;
    renderer.setRenderTarget(rtb);
    renderer.render(planFlou, camera);
    planFlou.material = floueV;
    floueV.uniforms.tDiffuse.value = rtb.texture;
    floueV.uniforms.v.value = a / RES_Y;
    renderer.setRenderTarget(rt);
    renderer.render(planFlou, camera);
    planFlou.visible = false;
  }

  function cuire() {
    plan.visible = false;
    scene.overrideMaterial = matProfondeur;
    const alpha = renderer.getClearAlpha();
    renderer.setClearAlpha(0);
    renderer.setRenderTarget(rt);
    renderer.clear();
    renderer.render(scene, camera);
    scene.overrideMaterial = null;
    for (const a of flou) flouter(a);
    renderer.setRenderTarget(null);
    renderer.setClearAlpha(alpha);
    plan.visible = true;
  }

  return { cuire };
}
