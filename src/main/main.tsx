import "@babel/polyfill";
import * as media from "./media";

const canvasSize = 400;

function update(worker: Worker, video: HTMLVideoElement) {
  // check video is ready
  if (video.videoHeight === 0) {
    return;
  }

  const offscreen = new OffscreenCanvas(video.videoWidth, video.videoHeight);
  offscreen.width = video.videoWidth;
  offscreen.height = video.videoHeight;
  const ctx = offscreen.getContext("2d") as CanvasRenderingContext2D;
  ctx.drawImage(video, 0, 0);
  const bitmap = offscreen.transferToImageBitmap();

  worker.postMessage(
    {
      type: "update",
      bitmap
    },
    [bitmap]
  );
}

declare var OffscreenCanvas: any;

export async function main() {
  const worker = new Worker("../worker/worker.ts");

  const canvas: any = document.getElementById("output");
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  const offscreenCanvas = canvas.transferControlToOffscreen();

  worker.postMessage(
    {
      type: "init",
      canvas: offscreenCanvas
    },
    [offscreenCanvas]
  );

  // setup media
  const cameras = await media.getCameras();
  const video = await media.loadVideo(cameras[0].deviceId);

  async function mainloop(): Promise<void> {
    requestAnimationFrame(mainloop);
    update(worker, video);
  }

  mainloop();
}

main();
