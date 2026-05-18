'use client';

import { useEffect, useRef } from 'react';

/* ────────────────────────────────────────────────────────────────────────────
 *  Hero 3D logo — extrudes /logo-3d.svg into a metallic orange mesh and
 *  spins it slowly with mouse-drag override. Three.js is loaded on demand
 *  via dynamic import so it doesn't enter the initial JS bundle.
 *  Falls back gracefully if WebGL is unavailable.
 * ──────────────────────────────────────────────────────────────────────── */

export default function HeroLogo3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let raf;
    const cleanups = [];

    (async () => {
      // Code-split: three + SVGLoader only load when the hero mounts.
      const [THREE, { SVGLoader }] = await Promise.all([
        import('three'),
        import('three/examples/jsm/loaders/SVGLoader.js'),
      ]);
      if (disposed) return;

      const w = () => mount.clientWidth || 1;
      const h = () => mount.clientHeight || 1;

      const scene = new THREE.Scene();
      scene.background = null;

      const camera = new THREE.PerspectiveCamera(35, w() / h(), 0.1, 2000);
      camera.position.set(0, 0, 900);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w(), h());
      if ('outputColorSpace' in renderer && THREE.SRGBColorSpace) {
        renderer.outputColorSpace = THREE.SRGBColorSpace;
      }
      if (THREE.ACESFilmicToneMapping) {
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
      }
      renderer.toneMappingExposure = 1.25;
      mount.appendChild(renderer.domElement);
      Object.assign(renderer.domElement.style, {
        display: 'block',
        width: '100%',
        height: '100%',
      });

      // Lights — bright warm setup so the brand orange reads cleanly.
      scene.add(new THREE.AmbientLight(0xffffff, 0.55));
      const key = new THREE.DirectionalLight(0xffd9a0, 3.0);
      key.position.set(160, 120, 220);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xeb6414, 2.6);
      rim.position.set(-180, 60, -120);
      scene.add(rim);
      const fill = new THREE.PointLight(0xffb070, 2.0, 800);
      fill.position.set(0, 0, 300);
      scene.add(fill);
      const back = new THREE.PointLight(0xffe8c8, 1.4, 600);
      back.position.set(0, 200, -200);
      scene.add(back);

      const group = new THREE.Group();
      scene.add(group);

      // Brand orange #EB6414 — lower metalness lets the surface colour read,
      // emissive at the same hue keeps the logo glowing in dark sections.
      const mat = new THREE.MeshStandardMaterial({
        color: 0xeb6414,
        metalness: 0.35,
        roughness: 0.45,
        emissive: 0xeb6414,
        emissiveIntensity: 0.55,
      });

      const meshes = [];
      const fitSize = () => {
        const target = Math.min(w(), h()) * 0.5;
        const s = target / 297.67 * 0.7;
        group.scale.setScalar(s);
      };

      try {
        const loader = new SVGLoader();
        const text = await fetch('/logo-3d.svg').then((r) => r.text());
        if (disposed) return;
        const data = loader.parse(text);

        const all = new THREE.Group();
        data.paths.forEach((path) => {
          const shapes = SVGLoader.createShapes
            ? SVGLoader.createShapes(path)
            : (typeof path.toShapes === 'function' ? path.toShapes(true) : []);
          shapes.forEach((shape) => {
            const geom = new THREE.ExtrudeGeometry(shape, {
              depth: 40,
              bevelEnabled: true,
              bevelThickness: 5,
              bevelSize: 3,
              bevelOffset: 0,
              bevelSegments: 5,
              curveSegments: 32,
            });
            const mesh = new THREE.Mesh(geom, mat);
            all.add(mesh);
            meshes.push({ geom, mesh });
          });
        });

        // SVG y-axis flipped; center on viewBox 297.67x297.67.
        all.scale.y = -1;
        all.position.x = -297.67 / 2;
        all.position.y = 297.67 / 2;

        const wrap = new THREE.Group();
        wrap.add(all);
        group.add(wrap);

        fitSize();
      } catch (err) {
        // Drop quietly — hero still renders without the 3D layer.
        // eslint-disable-next-line no-console
        console.warn('HeroLogo3D: failed to load SVG —', err);
      }

      // Drag rotation + auto-spin
      let isDragging = false;
      let pX = 0, pY = 0;
      let targetRY = 0, targetRX = -0.15;
      let curRY = 0, curRX = -0.15;
      let lastMoveAt = 0;
      let autoSpin = true;

      const onPointerDown = (e) => {
        isDragging = true;
        pX = e.clientX;
        pY = e.clientY;
        autoSpin = false;
        try { mount.setPointerCapture?.(e.pointerId); } catch {/* not supported */}
      };
      const onPointerMove = (e) => {
        if (!isDragging) return;
        const dx = e.clientX - pX;
        const dy = e.clientY - pY;
        pX = e.clientX;
        pY = e.clientY;
        targetRY += dx * 0.012;
        targetRX += dy * 0.008;
        targetRX = Math.max(-0.9, Math.min(0.9, targetRX));
        lastMoveAt = performance.now();
      };
      const onPointerUp = () => {
        if (!isDragging) return;
        isDragging = false;
        setTimeout(() => {
          if (performance.now() - lastMoveAt > 1400) autoSpin = true;
        }, 1500);
      };

      mount.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      cleanups.push(() => {
        mount.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
      });

      const onResize = () => {
        camera.aspect = w() / h();
        camera.updateProjectionMatrix();
        renderer.setSize(w(), h());
        fitSize();
      };
      window.addEventListener('resize', onResize);
      cleanups.push(() => window.removeEventListener('resize', onResize));

      // Pause when not visible — save battery.
      let visible = true;
      const visObs = new IntersectionObserver(
        (entries) => entries.forEach((en) => { visible = en.isIntersecting; }),
        { threshold: 0.01 },
      );
      visObs.observe(mount);
      cleanups.push(() => visObs.disconnect());

      const loop = () => {
        if (disposed) return;
        raf = requestAnimationFrame(loop);
        if (!visible) return;
        if (autoSpin) targetRY += 0.004;
        curRY += (targetRY - curRY) * 0.10;
        curRX += (targetRX - curRX) * 0.10;
        group.rotation.y = curRY;
        group.rotation.x = curRX;
        renderer.render(scene, camera);
      };
      loop();

      cleanups.push(() => {
        cancelAnimationFrame(raf);
        meshes.forEach(({ geom }) => geom.dispose());
        mat.dispose();
        renderer.dispose();
        if (renderer.domElement.parentNode === mount) {
          mount.removeChild(renderer.domElement);
        }
      });
    })().catch((err) => {
      // eslint-disable-next-line no-console
      console.warn('HeroLogo3D: setup failed —', err);
    });

    return () => {
      disposed = true;
      cleanups.forEach((fn) => { try { fn(); } catch {/* ignore */} });
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="hero__logo3d-canvas"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        touchAction: 'none',
      }}
    />
  );
}
