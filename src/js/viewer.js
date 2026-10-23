/* Atelier Grizl : visionneuse 3D partagée (three.js r160). Elle ne démarre pas seule : js/scene/app.js expose window.THREE puis appelle AtelierViewer.start().
   Chaque modèle s'enregistre avec AtelierModels.register(nom, définition).
   Le HTML contient : <figure class="v3d" data-model="nom"> <div class="v3d-stage"></div> ... </figure> */
(function () {
  'use strict';
  var REG = {};
  window.AtelierModels = { register: function (name, def) { REG[name] = def; }, _reg: REG };

  var TAU = Math.PI * 2;
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function hasWebGL() {
    try { var c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl'))); }
    catch (e) { return false; }
  }

  /* ---------- Outils de géométrie partagés (H) ---------- */
  function makeHelpers(THREE) {
    function V2(x, y) { return new THREE.Vector2(x, y); }
    function pol(r, a, cx, cy) { return V2((cx || 0) + r * Math.cos(a), (cy || 0) + r * Math.sin(a)); }
    function circlePts(r, seg, cx, cy) { seg = seg || 48; var p = []; for (var i = 0; i < seg; i++) p.push(pol(r, i / seg * TAU, cx, cy)); return p; }
    /* Contour de roue dentée. rTip < rRoot donne des dents tournées vers l'intérieur (cannelures d'un trou). */
    function gearPts(n, rRoot, rTip, o) {
      o = o || {}; var tip = o.tip != null ? o.tip : 0.42, flank = o.flank != null ? o.flank : 0.14, ph = o.phase || 0;
      var cx = o.cx || 0, cy = o.cy || 0, P = [], p = TAU / n;
      for (var i = 0; i < n; i++) {
        var a0 = i * p + ph, c = a0 + p / 2, h = p * tip / 2, f = p * flank;
        P.push(pol(rRoot, a0, cx, cy), pol(rRoot, c - h - f, cx, cy), pol(rTip, c - h, cx, cy), pol(rTip, c + h, cx, cy), pol(rRoot, c + h + f, cx, cy));
      }
      return P;
    }
    function shape(pts) { return new THREE.Shape(pts); }
    function path(pts) { return new THREE.Path(pts); }
    /* Extrusion centrée sur z = 0, épaisseur selon z. */
    function extrude(sh, depth, o) {
      o = o || {}; var bevel = o.bevel || 0;
      var g = new THREE.ExtrudeGeometry(sh, { depth: depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: o.bevelSize != null ? o.bevelSize : bevel, bevelSegments: o.bevelSegments || 2, curveSegments: o.curve || 24, steps: 1 });
      g.translate(0, 0, -depth / 2); return g;
    }
    function roundRect(w, h, r, cx, cy) {
      var s = new THREE.Shape(), x = (cx || 0) - w / 2, y = (cy || 0) - h / 2; r = Math.min(r, w / 2, h / 2);
      s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r);
      s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
      s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
    }
    /* Oriente une géométrie construite le long de Y (cylindre) vers l'axe x, y ou z. */
    function orient(g, axis) { if (axis === 'x') g.rotateZ(-Math.PI / 2); else if (axis === 'z') g.rotateX(Math.PI / 2); return g; }
    function mesh(g, m, parent, pos, rot) {
      var o = new THREE.Mesh(g, m);
      if (pos) o.position.set(pos[0], pos[1], pos[2]);
      if (rot) o.rotation.set(rot[0], rot[1], rot[2]);
      if (parent) parent.add(o); return o;
    }
    function cyl(r, h, axis, m, parent, pos, seg, rTop) { return mesh(orient(new THREE.CylinderGeometry(rTop != null ? rTop : r, r, h, seg || 32), axis), m, parent, pos); }
    function box(w, h, d, m, parent, pos, rot) { return mesh(new THREE.BoxGeometry(w, h, d), m, parent, pos, rot); }
    /* Tour (lathe) : profil [[rayon, axial], ...] tourné autour de Y. phiStart / phiLen en radians. */
    function lathe(profile, seg, phiStart, phiLen) { return new THREE.LatheGeometry(profile.map(function (p) { return V2(p[0], p[1]); }), seg || 64, phiStart || 0, phiLen == null ? TAU : phiLen); }
    /* Faces de coupe aux deux extrémités d'un tour partiel. holes = liste de profils. */
    function latheCaps(profile, phiStart, phiLen, holes) {
      var sh = shape(profile.map(function (p) { return V2(p[0], p[1]); }));
      (holes || []).forEach(function (h) { sh.holes.push(path(h.map(function (p) { return V2(p[0], p[1]); }))); });
      var g0 = new THREE.ShapeGeometry(sh); g0.rotateY(-Math.PI / 2); g0.rotateY(phiStart);
      var g1 = g0.clone(); g1.rotateY(phiLen); return [g0, g1];
    }
    function tube(points, r, m, parent, closed, seg, radial) {
      var c = new THREE.CatmullRomCurve3(points.map(function (p) { return new THREE.Vector3(p[0], p[1], p[2]); }), !!closed, 'centripetal');
      return mesh(new THREE.TubeGeometry(c, seg || Math.max(24, points.length * 12), r, radial || 12, !!closed), m, parent);
    }
    return { V2: V2, pol: pol, circlePts: circlePts, gearPts: gearPts, shape: shape, path: path, extrude: extrude, roundRect: roundRect,
      orient: orient, mesh: mesh, cyl: cyl, box: box, lathe: lathe, latheCaps: latheCaps, tube: tube, TAU: TAU };
  }

  /* ---------- Matériaux partagés (M), créés pour chaque visionneuse ---------- */
  function makeMats(THREE) {
    /* Les couleurs hexadécimales sont lues en sRGB : three.js les convertit lui-même en linéaire. */
    function S(c, met, rough, extra) { return new THREE.MeshStandardMaterial(Object.assign({ color: c, metalness: met, roughness: rough }, extra || {})); }
    function P(o) { return new THREE.MeshPhysicalMaterial(o); }
    return {
      steel: S(0xd6d9dd, 1, 0.24), steelDark: S(0x8e949b, 1, 0.36), alu: S(0xc3c7cc, 0.95, 0.32), aluDark: S(0x6d737a, 0.9, 0.4),
      anodBlack: S(0x2b2d32, 0.75, 0.4), black: S(0x17181a, 0.25, 0.55), lockring: S(0x3b3e44, 0.85, 0.33),
      carbon: P({ color: 0x1c1e22, metalness: 0.2, roughness: 0.42, clearcoat: 1, clearcoatRoughness: 0.08 }),
      paintViolet: P({ color: 0x6c5fa6, metalness: 0.35, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.1 }),
      rubber: S(0x1c1c1e, 0, 0.86), skinwall: S(0x7a5a38, 0, 0.78), pad: S(0x55504a, 0.15, 0.92),
      gold: S(0xcaa45a, 1, 0.3), brass: S(0xb98d45, 1, 0.35), white: S(0xf2f2f0, 0, 0.5),
      hose: P({ color: 0x111214, roughness: 0.35, clearcoat: 0.6 }),
      tape: S(0x3d5bb5, 0.05, 0.45),
      sealant: P({ color: 0xe6efe0, roughness: 0.12, metalness: 0, transparent: true, opacity: 0.86, clearcoat: 1 }),
      ghost: S(0x9aa3ab, 0.6, 0.5, { transparent: true, opacity: 0.28, depthWrite: false }),
      highlight: S(0x7c68d6, 0.5, 0.35, { emissive: 0x2a1f66, emissiveIntensity: 0.6 }),
      red: S(0xc0392b, 0.1, 0.5), yellow: S(0xe0b21a, 0.1, 0.5), orange: S(0xe07a1a, 0.1, 0.5)
    };
  }

  /* Carte d'environnement « studio » pour les reflets des métaux. */
  function makeEnv(THREE, renderer) {
    var pm = new THREE.PMREMGenerator(renderer), s = new THREE.Scene();
    var g = new THREE.SphereGeometry(50, 32, 16), pos = g.attributes.position, cols = [];
    for (var i = 0; i < pos.count; i++) { var t = (pos.getY(i) / 50 + 1) / 2; cols.push(0.16 + 0.62 * t, 0.17 + 0.63 * t, 0.19 + 0.66 * t); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    s.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
    function soft(w, h, x, y, z, k) {
      var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(k, k, k), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m);
    }
    soft(34, 12, 0, 36, 18, 4.2); soft(12, 30, -38, 6, 12, 2.4); soft(18, 18, 32, 10, -30, 1.7); soft(40, 6, 0, -20, 40, 0.9);
    var rt = pm.fromScene(s, 0.02); pm.dispose(); return rt.texture;
  }

  /* ---------- Visionneuse ---------- */
  var viewers = [];
  function Viewer(fig, def) {
    this.fig = fig; this.def = def; this.inited = false; this.visible = false; this.dirty = true;
    var c = def.camera || {};
    this.cam0 = { yaw: c.yaw != null ? c.yaw : 0.7, pitch: c.pitch != null ? c.pitch : 0.35, dist: c.dist || 200, target: c.target || [0, 0, 0] };
    this.min = c.min || this.cam0.dist * 0.4; this.max = c.max || this.cam0.dist * 2.5;
    this.reset(); this.auto = !reduce; this.ex = 0; this.exT = 0; this.free = false; this.last = 0; this.sel = -1;
  }
  Viewer.prototype.reset = function () { this.yaw = this.cam0.yaw; this.pitch = this.cam0.pitch; this.dist = this.cam0.dist; this.dirty = true; };
  Viewer.prototype.init = function () {
    var THREE = window.THREE, self = this, fig = this.fig;
    var stage = fig.querySelector('.v3d-stage');
    if (!stage) { stage = document.createElement('div'); stage.className = 'v3d-stage'; fig.insertBefore(stage, fig.firstChild); }
    this.stage = stage;
    this.H = makeHelpers(THREE); this.M = makeMats(THREE);
    var api = {
      dirty: function () { self.dirty = true; },
      setPins: function (pins) { self.setPins(pins); },
      setExplode: function (on) { self.exT = on ? 1 : 0; self.dirty = true; },
      viewer: self
    };
    this.api = api;
    this.model = this.def.build({ THREE: THREE, H: this.H, M: this.M, api: api });
    this.parts = (this.model.parts || []).map(function (p) { return { obj: p.obj, base: p.obj.position.clone(), off: new THREE.Vector3(p.off[0], p.off[1], p.off[2]) }; });
    this.buildBar();
    this.setPins(this.model.pins || []);
    this.inited = true;
    if (!hasWebGL()) { this.fallback('La 3D ne peut pas s’afficher sur cet appareil. Les planches 2D et les vidéos restent disponibles.'); return; }
    var canvas = document.createElement('canvas'); stage.appendChild(canvas); this.canvas = canvas;
    var r;
    try { r = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'low-power' }); }
    catch (e) { canvas.remove(); this.fallback('La 3D ne peut pas s’afficher sur cet appareil.'); return; }
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
    this.renderer = r;
    var scene = new THREE.Scene(); this.scene = scene;
    scene.environment = makeEnv(THREE, r);
    /* Unités physiques depuis r155 : on multiplie par π pour garder l'éclairage de r128. */
    scene.add(new THREE.HemisphereLight(0xffffff, 0x3c4450, 0.45 * Math.PI));
    var d1 = new THREE.DirectionalLight(0xffffff, 1.35 * Math.PI); d1.position.set(1, 2, 1.6); scene.add(d1);
    var d2 = new THREE.DirectionalLight(0xc8d0ff, 0.45 * Math.PI); d2.position.set(-2, 0.4, -1); scene.add(d2);
    this.camera = new THREE.PerspectiveCamera(32, 4 / 3, 0.5, 8000);
    scene.add(this.model.group);
    this.pinsEl = document.createElement('div'); this.pinsEl.className = 'v3d-pins'; stage.appendChild(this.pinsEl);
    this.hint = document.createElement('div'); this.hint.className = 'v3d-hint';
    this.hint.textContent = 'Glisse sur le côté pour tourner · « Manipuler » pour zoomer';
    stage.appendChild(this.hint);
    setTimeout(function () { if (self.hint) { self.hint.remove(); self.hint = null; } }, 7000);
    this.renderPins();
    this.bindControls();
    var ro = new ResizeObserver(function () { self.resize(); }); ro.observe(stage); this.resize();
  };
  Viewer.prototype.fallback = function (msg) {
    var d = document.createElement('div'); d.className = 'v3d-fallback'; d.textContent = msg; this.stage.appendChild(d);
  };
  Viewer.prototype.resize = function () {
    if (!this.renderer) return;
    var w = this.stage.clientWidth, h = this.stage.clientHeight; if (!w || !h) return;
    this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); this.dirty = true;
  };
  Viewer.prototype.buildBar = function () {
    var self = this, fig = this.fig, bar = fig.querySelector('.v3d-bar');
    if (!bar) { bar = document.createElement('div'); bar.className = 'v3d-bar'; this.stage.insertAdjacentElement('afterend', bar); }
    bar.innerHTML = '';
    function btn(label, pressed, fn) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.textContent = label;
      if (pressed != null) b.setAttribute('aria-pressed', pressed ? 'true' : 'false');
      b.addEventListener('click', function () { fn(b); }); bar.appendChild(b); return b;
    }
    if (this.parts.length) {
      btn(this.def.explodeLabel || 'Vue éclatée', false, function (b) {
        self.exT = self.exT ? 0 : 1; b.setAttribute('aria-pressed', self.exT ? 'true' : 'false'); self.dirty = true;
      });
    }
    (this.model.controls || []).forEach(function (c, ci) {
      if (c.type === 'segmented') {
        var bs = [];
        c.options.forEach(function (o) {
          var b = btn(o.label, o.value === c.value, function () {
            bs.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); }); b.setAttribute('aria-pressed', 'true');
            c.onChange(o.value); self.dirty = true;
          }); bs.push(b);
        });
      } else if (c.type === 'toggle') {
        btn(c.label, !!c.value, function (b) { var v = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', v ? 'true' : 'false'); c.onChange(v); self.dirty = true; });
      } else if (c.type === 'range') {
        var wrap = document.createElement('label'); wrap.className = 'v3d-range';
        var id = (self.fig.dataset.model || 'm') + '-r' + ci;
        var span = document.createElement('span'); span.textContent = c.label;
        var inp = document.createElement('input'); inp.type = 'range'; inp.id = id; inp.min = c.min; inp.max = c.max; inp.step = c.step || 1; inp.value = c.value;
        var out = document.createElement('output'); out.setAttribute('for', id); out.textContent = c.format ? c.format(c.value) : c.value;
        inp.addEventListener('input', function () { var v = Number(inp.value); out.textContent = c.format ? c.format(v) : v; c.onChange(v); self.dirty = true; });
        wrap.appendChild(span); wrap.appendChild(inp); wrap.appendChild(out); bar.appendChild(wrap);
      }
    });
    this.freeBtn = btn('Manipuler', false, function (b) {
      self.free = !self.free; b.setAttribute('aria-pressed', self.free ? 'true' : 'false');
      self.stage.classList.toggle('free', self.free); self.auto = false;
    });
    btn('Recentrer', null, function () { self.reset(); });
  };
  Viewer.prototype.setPins = function (pins) {
    var self = this, THREE = window.THREE;
    this.pins = pins.map(function (p, i) { return { obj: p.obj, p: new THREE.Vector3(p.p[0], p.p[1], p.p[2]), text: p.text, n: i + 1 }; });
    /* La liste change (étape, entonnoir, outil) : la pastille choisie est oubliée, pour qu'aucun numéro ne passe à une
       autre pièce. */
    this.sel = -1;
    var leg = this.fig.querySelector('.v3d-legend');
    if (!leg) { leg = document.createElement('ol'); leg.className = 'v3d-legend'; var bar = this.fig.querySelector('.v3d-bar'); bar.insertAdjacentElement('afterend', leg); }
    leg.innerHTML = '';
    this.legBtns = this.pins.map(function (p, i) {
      var li = document.createElement('li'), b = document.createElement('button'); b.type = 'button';
      b.innerHTML = '<span>' + p.n + '</span><span></span>'; b.lastChild.textContent = p.text;
      b.addEventListener('click', function () { self.select(i); }); li.appendChild(b); leg.appendChild(li); return b;
    });
    if (this.pinsEl) this.renderPins();
    this.dirty = true;
  };
  Viewer.prototype.renderPins = function () {
    var self = this; this.pinsEl.innerHTML = '';
    this.pinEls = this.pins.map(function (p, i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'pin'; b.textContent = p.n;
      b.setAttribute('aria-label', p.n + ' : ' + p.text);
      b.addEventListener('click', function () { self.select(i); }); self.pinsEl.appendChild(b); return b;
    });
  };
  Viewer.prototype.select = function (i) {
    this.sel = this.sel === i ? -1 : i;
    var s = this.sel;
    (this.pinEls || []).forEach(function (b, k) { b.classList.toggle('on', k === s); });
    (this.legBtns || []).forEach(function (b, k) { b.classList.toggle('on', k === s); });
    this.dirty = true;
  };
  Viewer.prototype.bindControls = function () {
    var self = this, cv = this.canvas, pts = new Map(), pinch = 0;
    function stopAuto() { self.auto = false; if (self.hint) { self.hint.remove(); self.hint = null; } }
    cv.addEventListener('pointerdown', function (e) { pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); try { cv.setPointerCapture(e.pointerId); } catch (er) {} stopAuto(); });
    cv.addEventListener('pointermove', function (e) {
      var p = pts.get(e.pointerId); if (!p) return;
      var dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
      if (pts.size === 2) {
        var a = Array.from(pts.values()), d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
        if (pinch && self.free) self.dist = clamp(self.dist * pinch / d, self.min, self.max); pinch = d;
      } else {
        self.yaw -= dx * 0.009;
        if (e.pointerType === 'mouse' || self.free) self.pitch = clamp(self.pitch + dy * 0.008, -1.4, 1.4);
      }
      self.dirty = true;
    });
    function up(e) { pts.delete(e.pointerId); if (pts.size < 2) pinch = 0; }
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up); cv.addEventListener('lostpointercapture', up);
    cv.addEventListener('wheel', function (e) {
      if (!(self.free || e.ctrlKey || e.metaKey)) return;
      e.preventDefault(); self.dist = clamp(self.dist * (1 + e.deltaY * 0.0012), self.min, self.max); self.dirty = true; stopAuto();
    }, { passive: false });
  };
  Viewer.prototype.tick = function (now) {
    var dt = this.last ? Math.min(0.05, (now - this.last) / 1000) : 0; this.last = now;
    var anim = false;
    if (this.auto) { this.yaw += dt * 0.28; anim = true; }
    if (Math.abs(this.ex - this.exT) > 0.001) {
      this.ex += (this.exT - this.ex) * Math.min(1, dt * 6); if (Math.abs(this.ex - this.exT) < 0.002) this.ex = this.exT; anim = true;
      var e = this.ex, k = e * e * (3 - 2 * e);
      this.parts.forEach(function (p) { p.obj.position.copy(p.base).addScaledVector(p.off, k); });
    }
    if (this.model.onFrame && this.model.onFrame(dt, now)) anim = true;
    if (!anim && !this.dirty) return;
    this.dirty = false;
    var c = this.camera, t = this.cam0.target, cp = Math.cos(this.pitch);
    c.position.set(t[0] + this.dist * cp * Math.sin(this.yaw), t[1] + this.dist * Math.sin(this.pitch), t[2] + this.dist * cp * Math.cos(this.yaw));
    c.lookAt(t[0], t[1], t[2]);
    this.renderer.render(this.scene, c);
    this.placePins();
  };
  Viewer.prototype.placePins = function () {
    if (!this.pinEls) return;
    var THREE = window.THREE, w = this.stage.clientWidth, h = this.stage.clientHeight, c = this.camera;
    var tv = new THREE.Vector3(this.cam0.target[0], this.cam0.target[1], this.cam0.target[2]);
    var cdir = c.position.clone().sub(tv).normalize();
    for (var i = 0; i < this.pins.length; i++) {
      var p = this.pins[i], el = this.pinEls[i];
      p.obj.updateMatrixWorld(true);
      var wp = p.obj.localToWorld(p.p.clone());
      var facing = wp.clone().sub(tv); var len = facing.length();
      var behind = len > 1e-3 && facing.divideScalar(len).dot(cdir) < -0.45;
      var v = wp.project(c);
      var off = v.z > 1 || v.x < -1.1 || v.x > 1.1 || v.y < -1.1 || v.y > 1.1;
      el.classList.toggle('hide', off || (behind && i !== this.sel));
      el.style.transform = 'translate(' + ((v.x * 0.5 + 0.5) * w).toFixed(1) + 'px,' + ((-v.y * 0.5 + 0.5) * h).toFixed(1) + 'px)';
    }
  };

  function loop(now) {
    requestAnimationFrame(loop);
    for (var i = 0; i < viewers.length; i++) { var v = viewers[i]; if (v.inited && v.visible && v.renderer) v.tick(now); }
  }

  function start() {
    var figs = document.querySelectorAll('figure.v3d[data-model]');
    if (!figs.length) return;
    if (!window.THREE) {
      figs.forEach(function (f) {
        var st = f.querySelector('.v3d-stage'); if (!st) return;
        var d = document.createElement('div'); d.className = 'v3d-fallback'; d.textContent = 'La 3D n’a pas pu se charger. Les planches 2D et les vidéos restent disponibles.'; st.appendChild(d);
      });
      return;
    }
    var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        var v = en.target.__viewer; if (!v) return;
        v.visible = en.isIntersecting;
        if (en.isIntersecting && !v.inited) { try { v.init(); } catch (err) { v.inited = true; if (window.console) console.error(err); v.fallback && v.stage && v.fallback('Erreur de chargement de la 3D.'); } }
        if (en.isIntersecting) { v.last = 0; v.dirty = true; }
      });
    }, { rootMargin: '200px 0px' }) : null;
    figs.forEach(function (f) {
      var def = REG[f.dataset.model]; if (!def) return;
      var v = new Viewer(f, def); f.__viewer = v; viewers.push(v);
      if (io) io.observe(f); else { v.init(); v.visible = true; }
    });
    requestAnimationFrame(loop);
  }
  window.AtelierViewer = { start: start, viewers: viewers };
})();
