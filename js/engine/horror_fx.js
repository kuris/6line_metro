/* ═══════════════════════════════════════════════════
   engine/horror_fx.js
   호러 시각 연출 엔진 (Blood-drip, Noise, Vignette, Splatter)
   — AudioHorror와 연동되어 시너지를 냅니다.
   ═══════════════════════════════════════════════════ */

'use strict';

class HorrorFXEngine {
  constructor() {
    this.vignette = document.getElementById('horror-vignette');
    this.noise = document.getElementById('horror-noise');
    this.bloodLayer = document.getElementById('horror-blood-layer');
    this.flashLayer = document.getElementById('horror-flash-layer');
    this.bloodInterval = null;
  }

  // 1. 시각적 긴장감 통합 조절 (0.0 ~ 1.0)
  setIntensity(f) {
    const val = Math.max(0, Math.min(1, f));
    if (this.vignette) {
      this.vignette.style.display = (val > 0) ? 'block' : 'none';
      this.vignette.style.opacity = 0.2 + (val * 0.8);
      this.vignette.classList.toggle('active', val > 0.3);
    }
    if (this.noise) {
      this.noise.style.display = (val > 0) ? 'block' : 'none';
      this.noise.style.opacity = 0.05 + (val * 0.35);
      this.noise.classList.toggle('active', val > 0.1);
    }
  }

  // 피 흘러내리는 이펙트는 사용자의 요청으로 완전히 제거되었습니다.

  // 핏자국 생성 (Splatter)
  spawnSplatter() {
    if (!this.bloodLayer) return;
    const splat = document.createElement('div');
    splat.className = 'blood-splatter';
    
    const x = Math.random() * 80 + 10;
    const y = Math.random() * 80 + 10;
    const scale = 0.5 + Math.random() * 2.0;
    const opacity = 0.3 + Math.random() * 0.5;
    
    splat.style.left = `${x}%`;
    splat.style.top = `${y}%`;
    splat.style.opacity = `${opacity}`;
    splat.style.transform = `scale(${scale}) rotate(${Math.random() * 360}deg)`;
    
    this.bloodLayer.appendChild(splat);
    setTimeout(() => splat.remove(), 4000);
  }

  // 3. 강렬한 혈성 섬광 (Flash Blood)
  flashBlood(duration = 1000) {
    if (!this.flashLayer) return;
    this.flashLayer.classList.add('flash-red');
    if (window.AudioHorror) window.AudioHorror.playMoan();

    const splatCount = 1 + Math.floor(Math.random() * 3);
    for(let i=0; i<splatCount; i++) {
        setTimeout(() => this.spawnSplatter(), i * 150);
    }

    setTimeout(() => {
      this.flashLayer.classList.remove('flash-red');
    }, duration);
  }

  // 4. 글리치 및 진동
  glitch(duration = 500) {
    const layout = document.getElementById('layout');
    if (layout) {
      layout.classList.add('fx-glitch', 'fx-shake');
      if (window.AudioHorror) window.AudioHorror.playGayageumNote(180);
      setTimeout(() => layout.classList.remove('fx-glitch', 'fx-shake'), duration);
    }
  }

  // 5. 시작 연출 (Initial Massive Scare)
  scareMassive() {
    this.setIntensity(1.0);
    // this.startBloodDrip(150); // 피 내리는 효과 제거 요청
    this.flashBlood(2200);
    this.glitch(1300);
    for(let i=0; i<6; i++) setTimeout(() => this.spawnSplatter(), 300 + i*180);
  }

  // 별칭 (Compatibility)
  flashRed(duration) {
    this.flashBlood(duration);
  }

  scare() {
    this.scareMassive();
  }
}

window.HorrorFX = new HorrorFXEngine();
