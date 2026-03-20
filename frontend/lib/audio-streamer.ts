export class AudioStreamer {
  private audioCtx: AudioContext;
  private nextStartTime: number = 0;

  constructor() {
    this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }

  async resume() {
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
  }

  addPCM16(base64Data: string) {
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }

    const buffer = this.audioCtx.createBuffer(1, float32Array.length, 24000);
    buffer.getChannelData(0).set(float32Array);

    const source = this.audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioCtx.destination);

    const currentTime = this.audioCtx.currentTime;
    if (this.nextStartTime < currentTime) {
      this.nextStartTime = currentTime;
    }
    source.start(this.nextStartTime);
    this.nextStartTime += buffer.duration;
  }

  stop() {
    this.audioCtx.close();
  }

  interrupt() {
    this.audioCtx.close();
    this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    this.nextStartTime = 0;
  }
}
