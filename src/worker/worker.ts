import "@babel/polyfill";
import "./polyfill";
import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";
import { drawPose } from "./drawPose";
tf.disableDeprecationWarnings();

const outputStride = 16;
const imageScaleFactor = 0.5;
const minPoseConfidence = 0.1;
const minPartConfidence = 0.5;
const flipHorizontal = true;

type Event = {
  data:
    | {
        type: "init";
        canvas: HTMLCanvasElement;
      }
    | {
        type: "update";
        bitmap: ImageBitmap;
      };
};

let currentContext: null | CanvasRenderingContext2D = null;

let net: null | posenet.PoseNet = null;

let tempCanvas: any | null = null;
let tempContext: CanvasRenderingContext2D | null = null;

self.addEventListener("message", async (ev: Event) => {
  switch (ev.data.type) {
    case "init": {
      console.log("init");
      const offscreenCanvas = ev.data.canvas;
      tempCanvas = new OffscreenCanvas(
        offscreenCanvas.width,
        offscreenCanvas.height
      );
      tempContext = tempCanvas.getContext("2d");

      const context = offscreenCanvas.getContext(
        "2d"
      ) as CanvasRenderingContext2D;
      currentContext = context;
      return;
    }
    case "update": {
      if (net && tempContext) {
        const bitmap = ev.data.bitmap;
        tempContext.drawImage(bitmap, 0, 0);
        try {
          // const now = Date.now();
          // console.time(`estimate-${now}`);
          const pose = await net.estimateSinglePose(
            tempCanvas,
            imageScaleFactor,
            flipHorizontal,
            outputStride
          );
          // console.timeEnd(`estimate-${now}`);
          drawPose(
            currentContext as CanvasRenderingContext2D,
            pose,
            bitmap.width,
            minPoseConfidence,
            minPartConfidence
          );
        } catch (e) {
          console.log("error in estimate", e);
        }
      }
    }
  }
});

async function main() {
  console.log("start loading");
  const loadedNet = await posenet.load();
  net = loadedNet;
  console.log("backend is", tf.getBackend());

  // console.log("net", net);
}

main();
