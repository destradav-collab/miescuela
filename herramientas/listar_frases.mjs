// Escribe audio/frases.json con todas las frases que la app puede decir.
// Ejecuta datos.js (el mismo archivo que usa la app) y llama a frasesConocidas().
// Uso: node herramientas/listar_frases.mjs
import fs from "node:fs";
import vm from "node:vm";

const raiz = new URL("../", import.meta.url);
const codigo = fs.readFileSync(new URL("datos.js", raiz), "utf8");
const frases = vm.runInNewContext(codigo + "\nfrasesConocidas();", {TextEncoder});

fs.mkdirSync(new URL("audio/", raiz), {recursive: true});
fs.writeFileSync(new URL("audio/frases.json", raiz), JSON.stringify(frases, null, 1) + "\n");
console.log(`${frases.length} frases en audio/frases.json`);
