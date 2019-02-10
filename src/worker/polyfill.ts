declare var OffscreenCanvas: any;

if (typeof OffscreenCanvas !== "undefined") {
  // @ts-ignore
  self.document = {
    readyState: "complete",
    createElement: () => {
      return new OffscreenCanvas(640, 480);
    }
  };

  // @ts-ignore
  self.window = {
    screen: {
      width: 640,
      height: 480
    }
  };
  // @ts-ignore
  self.HTMLVideoElement = OffscreenCanvas;
  // @ts-ignore
  self.HTMLImageElement = function() {};
  class CanvasMock {
    getContext() {
      return new OffscreenCanvas(0, 0);
    }
  }
  // @ts-ignore
  self.HTMLCanvasElement = CanvasMock;
}

import * as _tfc from "@tensorflow/tfjs-core";
import * as _tf from "@tensorflow/tfjs";
