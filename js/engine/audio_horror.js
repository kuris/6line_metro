/* ═══════════════════════════════════════════════════
   engine/audio_horror.js
   Web Audio API 기반 호러 사운드 합성 엔진
   — 기괴한 가야금 선율, 드론음, 신음 등을 합성
   ═══════════════════════════════════════════════════ */

'use strict';

class AudioHorror {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isMuted = false;
    this.timer = null;
  }

  // 사용자 입력을 받은 후 초기화 (브라우저 정책)
  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    
    // 초기 볼륨 설정 및 드론음 시작
    this.masterGain.gain.value = 0.3;
    this.startDrone();
    this.scheduleGayageum();
    console.log('AudioHorror: Horror Soundscape Initialized');
  }

  // 낮은 저주파 드론음 (공포의 긴장감 형성)
  startDrone() {
    if (!this.ctx) return;
    
    // 저주파 오실레이터 1
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(40, this.ctx.currentTime); // 40Hz
    gain1.gain.setValueAtTime(0.05, this.ctx.currentTime);
    
    // 약간의 주파수 변조 (울림 유도)
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 0.5;
    lfoGain.gain.value = 2;
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    
    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    osc1.start();
    lfo.start();
  }

  // 기괴한 가야금 소리 합성 (불규칙한 플럭킹)
  playGayageumNote(freq) {
    if (!this.ctx || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth'; // 날카로운 음색
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 1.6);
  }

  // 불규칙하게 가야금 연주 (펜타토닉 불협화음)
  scheduleGayageum() {
    const notes = [146, 164, 196, 220, 261, 293]; // 기묘한 선율
    const nextTime = Math.random() * 3000 + 1000;
    
    this.timer = setTimeout(() => {
      const freq = notes[Math.floor(Math.random() * notes.length)] * 0.5;
      this.playGayageumNote(freq);
      this.scheduleGayageum();
    }, nextTime);
  }

  // 뮤효음/신음 (노이즈 변조)
  playMoan() {
    if (!this.ctx || this.isMuted) return;
    
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, this.ctx.currentTime);
    filter.Q.setValueAtTime(10, this.ctx.currentTime);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 0.5);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 2);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    noise.start();
  }

  setMute(isMuted) {
    this.isMuted = isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(isMuted ? 0 : 0.3, this.ctx.currentTime, 0.1);
    }
  }
}

// 전역 싱글톤으로 노출
window.AudioHorror = new AudioHorror();
