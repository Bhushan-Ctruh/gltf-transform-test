import Storage from "./storage";
import "./style.css";

const worker = new Worker("optimizer.js", { type: "module" });

const input = document.getElementById("input");

const storage = new Storage();

input.addEventListener("change", (e) => {
  const file = e.target.files[0];
  console.log("STARTED");

  const reader = new FileReader();

  reader.onload = async (event) => {
    if (event.target.readyState === FileReader.DONE) {
      console.log("LOADED");
      const arrayBuffer = event.target.result;
      const uint8Array = new Uint8Array(arrayBuffer);
      await storage.set("glb", uint8Array);
      worker.postMessage("glb");
    }
  };

  reader.onerror = function (event) {
    console.error("Error reading the file");
  };

  reader.readAsArrayBuffer(file);
});

worker.onmessage = (e) => {
  console.log(e.data, "COMPRESSED GLB ON MAIN THREAD");

  const glb = e.data;

  const blob = new Blob([glb]);

  const a = document.createElement("a");
  const url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = "downloadnewDracofromworker.glb";
  a.click();
};
