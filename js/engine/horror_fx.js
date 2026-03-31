/* ═══════════════════════════════════════════════════
   engine/horror_fx.js
   호러 시각 연출 엔진 (Blood-drip, Noise, Vignette)
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

  // 1. 시야 압박 (Vignette) 강도 조절
  setVignette(active = true) {
    if (this.vignette) {
      this.vignette.classList.toggle('active', active);
    }
  }

  // 2. 전파 노이즈 (Noise) 강도 조절
  setNoise(active = true) {
    if (this.noise) {
      this.noise.classList.toggle('active', active);
    }
  }

  // 3. 혈흔 흘러내림 시작 (Blood Drip)
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

  // 개별 핏방울 생성
  spawnBloodDrop() {
    if (!this.bloodLayer) return;
    const drop = document.createElement('div');
    drop.className = 'blood-drop drip';
    
    // 무작위 위치 및 크기
    const x = Math.random() * 100;
    const width = 1 + Math.random() * 4;
    const duration = 2 + Math.random() * 8;
    
    drop.style.left = `${x}%`;
    drop.style.width = `${width}px`;
    drop.style.animationDuration = `${duration}s`;
    
    this.bloodLayer.appendChild(drop);
    
    // 애니메이션 종료 후 제거
    setTimeout(() => {
      drop.remove();
    }, duration * 1000);
  }

  // 4. 강렬한 혈성 섬광 (Flash Blood)
  flashBlood(duration = 1000) {
    if (!this.flashLayer) return;
    
    this.flashLayer.classList.add('flash-red');
    if (window.AudioHorror) window.AudioHorror.playMoan();

    // 일시적으로 핏방울 대량 생성
    for(let i=0; i<15; i++) {
        setTimeout(() => this.spawnBloodDrop(), i * 50);
    }

    setTimeout(() => {
      this.flashLayer.classList.remove('flash-red');
    }, duration);
  }

  // 5. 글리치 및 진동 (기존 기능 유지)
  glitch(duration = 500) {
    const layout = document.getElementById('layout');
    if (layout) {
      layout.classList.add('fx-glitch', 'fx-shake');
      if (window.AudioHorror) window.AudioHorror.playGayageumNote(180);
      
      setTimeout(() => {
        layout.classList.remove('fx-glitch', 'fx-shake');
      }, duration);
    }
  }

  // 6. 시작 연출 (Initial Massive Scare)
  scareMassive() {
    this.setVignette(true);
    this.setNoise(true);
    this.startBloodDrip(300);
    this.flashBlood(1500);
    this.glitch(1000);
  }
}

// 전역 싱글톤 노출
window.HorrorFX = new HorrorFXEngine();
