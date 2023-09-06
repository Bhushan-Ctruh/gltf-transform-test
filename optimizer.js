import { WebIO } from "@gltf-transform/core";
import { KHRONOS_EXTENSIONS } from "@gltf-transform/extensions";
import { prune, dedup, draco, simplify } from "@gltf-transform/functions";
import { MeshoptSimplifier } from "meshoptimizer";
import draco3d from "draco3d";
import Storage from "./storage";

const io = new WebIO()
  .registerExtensions(KHRONOS_EXTENSIONS)
  .registerDependencies({
    "draco3d.decoder": await draco3d.createDecoderModule(),
    "draco3d.encoder": await draco3d.createEncoderModule(),
  });

const storage = new Storage();

const canvas = new OffscreenCanvas(64, 64);
const context = canvas.getContext("2d");

const resizedCanvas = new OffscreenCanvas(512, 512);
const resizedCanvasContext = resizedCanvas.getContext("2d");

console.log(canvas, context);

self.addEventListener("message", async (e) => {
  const data = e.data;

  if (e.data === "glb") {
    const glbData = await storage.get("glb");

    console.log(glbData, "INDEX DB DATA FROM WORKER");

    const doc = await io.readBinary(glbData);

    await doc.transform(
      prune(),

      dedup(),

      simplify({ simplifier: MeshoptSimplifier, ratio: 0, error: 1 }),

      resizeTextures(),

      draco()
    );

    const transformedGlb = await io.writeBinary(doc);
    self.postMessage(transformedGlb);
  }
});

function resizeTextures(e) {
  return async (document) => {
    for (const texture of document.getRoot().listTextures()) {
      console.log(texture.getImage(), "BEFORE");
      const [textureWidth, textureHeight] = texture.getSize();
      canvas.width = textureWidth;
      canvas.height = textureHeight;
      const textureBlob = new Blob([texture.getImage()]);
      const imageBitMap = await createImageBitmap(textureBlob);
      context.drawImage(imageBitMap, 0, 0, textureWidth, textureHeight);
      resizedCanvasContext.drawImage(canvas, 0, 0, 64, 64);
      const resizedTextureBlob = await resizedCanvas.convertToBlob({
        type: "image/jpeg",
      });
      const resizedTextureArrayBuffer = await resizedTextureBlob.arrayBuffer();
      const newResizedTexture = new Uint8Array(resizedTextureArrayBuffer);
      texture.setImage(newResizedTexture);
    }
  };
}
