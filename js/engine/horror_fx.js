/* ═══════════════════════════════════════════════════
   engine/horror_fx.js
   호러 시각 연출 엔진 (Glitch, Red-out, Shake)
   — AudioHorror와 연동되어 시너지를 냅니다.
   ═══════════════════════════════════════════════════ */

'use strict';

class HorrorFX {
  constructor() {
    this.overlay = null;
    this.createOverlay();
  }

  // 붉은색 오버레이 레이어 생성
  createOverlay() {
    if (document.getElementById('horror-overlay')) return;
    this.overlay = document.createElement('div');
    this.overlay.id = 'horror-overlay';
    this.overlay.className = 'fx-red-out';
    document.body.appendChild(this.overlay);
  }

  // 화면 전체를 붉게 섬광 (Red Flash)
  flashRed(duration = 1000) {
    if (!this.overlay) this.createOverlay();
    
    this.overlay.classList.add('show');
    if (window.AudioHorror) window.AudioHorror.playMoan(); // 소름 끼치는 소리 동반
    
    setTimeout(() => {
      this.overlay.classList.remove('show');
    }, duration);
  }

  // 화면 글리치 및 흔들림 (Jump Scare 연출용)
  glitch(duration = 500) {
    const layout = document.getElementById('layout');
    if (!layout) return;

    layout.classList.add('fx-glitch', 'fx-shake');
    if (window.AudioHorror) {
        window.AudioHorror.playGayageumNote(220); // 날카로운 노음
        window.AudioHorror.playMoan();
    }

    setTimeout(() => {
      layout.classList.remove('fx-glitch', 'fx-shake');
    }, duration);
  }

  // 색상 반전 (강렬한 불쾌감 연출)
  invert(duration = 300) {
    document.body.classList.add('fx-invert');
    setTimeout(() => {
      document.body.classList.remove('fx-invert');
    }, duration);
  }

  // 복합적인 공포 연출 (Jump Scare)
  scare() {
    this.flashRed(800);
    this.glitch(600);
    setTimeout(() => this.invert(200), 100);
  }
}

// 전역 싱글톤 노출
window.HorrorFX = new HorrorFX();
