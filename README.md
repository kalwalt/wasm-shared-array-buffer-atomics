# Wasm SharedArrayBuffer with Atomics

An example of using SharedArrayBuffer with Atomics in WebAssembly.


## Build the wasm file

```bash
wat2wasm increment.wat --enable-threads -o increment.wasm
```