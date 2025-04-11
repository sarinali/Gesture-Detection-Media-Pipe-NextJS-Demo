'use client';

import { useEffect, useRef, useState } from "react";
import {
  GestureRecognizer,
  FilesetResolver,
  DrawingUtils,
  NormalizedLandmark
} from "@mediapipe/tasks-vision";

export default function GestureLogger() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [detectedGestureCaption, setDetectedGestureCaption] = useState("None")

  useEffect(() => {
    const init = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      const gestureRecognizer = await GestureRecognizer.createFromOptions(
        vision,
        {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
        }
      );

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();

      let lastWebcamTime = -1;

      const detect = async () => {
        if (video.currentTime === lastWebcamTime) {
          requestAnimationFrame(detect);
          return;
        }
        lastWebcamTime = video.currentTime;

        const nowInMs = performance.now();
        const result = gestureRecognizer.recognizeForVideo(video, nowInMs);

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx && canvas) {
            const bounds = canvas.getBoundingClientRect();
            if (canvas.width !== bounds.width || canvas.height !== bounds.height) {
                canvas.width = bounds.width;
                canvas.height = bounds.height;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const drawingUtils = new DrawingUtils(ctx);


            if (result.landmarks?.length) {
                result.landmarks.forEach((landmarks: NormalizedLandmark[]) => {
                    drawingUtils.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS);
                    drawingUtils.drawLandmarks(landmarks);
                });
            }
        }

        if (result.gestures?.length > 0) {
          const gestureName = result.gestures[0][0].categoryName;
          setDetectedGestureCaption(gestureName);
        }

        requestAnimationFrame(detect);
      };

      detect();
    };

    init();
  }, []);

  return (
    <div className="relative w-full max-w-[640px] aspect-[4/3] border">
        <div className="absolute top-0 left-0 w-full h-full">
        <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }}
        />
        <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ transform: "scaleX(-1)" }}
        />
        </div>
        <div className="absolute bottom-0 left-0 text-center bg-slate-700 p-2 rounded-md">
            <p className="">{detectedGestureCaption}</p>
        </div>
  </div>
  );
}
