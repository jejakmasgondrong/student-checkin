import { Buffer } from "buffer";

type GlobalWithBuffer = typeof globalThis & {
  Buffer?: typeof Buffer;
};

const globalObject = globalThis as GlobalWithBuffer;

if (typeof globalObject.Buffer === "undefined") {
  globalObject.Buffer = Buffer;
}
