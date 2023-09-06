import { WebIO } from "@gltf-transform/core";
import { KHRONOS_EXTENSIONS } from "@gltf-transform/extensions";
import {
  resample,
  prune,
  dedup,
  draco,
  textureCompress,
  simplify,
} from "@gltf-transform/functions";
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

      draco()
    );

    const transformedGlb = await io.writeBinary(doc);
    self.postMessage(transformedGlb);
  }
});
