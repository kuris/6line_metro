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

  // 2. 혈흔 흘러내림 시작 (Blood Drip)
  startBloodDrip(intensity = 500) {
    if (this.bloodInterval) clearInterval(this.bloodInterval);
    this.bloodInterval = setInterval(() => {
      this.spawnBloodDrop();
    }, intensity);
  }

  stopBloodDrip() {
    if (this.bloodInterval) clearInterval(this.bloodInterval);
    this.bloodInterval = null;
  }

  // 개별 핏방울 생성 (반투명 및 가변 길이 무작위성 강화)
  spawnBloodDrop() {
    if (!this.bloodLayer) return;
    const drop = document.createElement('div');
    drop.className = 'blood-drop drip';
    
    // 무작위 변수 계산
    const x = Math.random() * 100;
    const width = 1.5 + Math.random() * 5.5; 
    const finalHeight = 150 + Math.random() * 450; // 150px ~ 600px 사이 무작위
    const opacity = 0.4 + Math.random() * 0.5;    // 0.4 ~ 0.9 사이 무작위 투명도
    const duration = 2.5 + Math.random() * 9;      // 각기 다른 속도
    
    // 스타일 주입
    drop.style.left = `${x}%`;
    drop.style.width = `${width}px`;
    drop.style.animationDuration = `${duration}s`;
    drop.style.setProperty('--blood-height', `${finalHeight}px`);
    drop.style.setProperty('--blood-opacity', opacity);
    
    this.bloodLayer.appendChild(drop);
    setTimeout(() => drop.remove(), duration * 1000);
  }

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

    const dropCount = 8 + Math.floor(Math.random() * 12);
    for(let i=0; i<dropCount; i++) {
        setTimeout(() => this.spawnBloodDrop(), i * 40);
    }
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
}

window.HorrorFX = new HorrorFXEngine();
