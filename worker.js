async function loadAndRunWasm(sharedBuffer, startIndex, endIndex) {
    try {
        const response = await fetch('increment.wasm');
        const bytes = await response.arrayBuffer();

        // Crea un oggetto WebAssembly.Global per sharedArray
        const sharedArrayGlobal = new WebAssembly.Global({ value: 'i32', mutable: true }, 0);

        const sharedMemory = new WebAssembly.Memory({
            initial: sharedBuffer.byteLength / Int32Array.BYTES_PER_ELEMENT,
            maximum: sharedBuffer.byteLength / Int32Array.BYTES_PER_ELEMENT,
            shared: true
        });

        const importObject = {
            env: {
                sharedArray: sharedArrayGlobal,
                memory: sharedMemory, // WASM might expect a shared memory import as well
                'atomic.add.i32': (ptr, offset, value) => {
            return Atomics.add(sharedArray, (ptr + offset) / Int32Array.BYTES_PER_ELEMENT, value);
        }
            }
        };

        const { instance } = await WebAssembly.instantiate(bytes, importObject);
        console.log(instance);
        

        // Ottieni la vista Int32Array dalla memoria del modulo WASM
        const sharedArray = new Int32Array(instance.exports.memory.buffer, 0, sharedBuffer.byteLength / Int32Array.BYTES_PER_ELEMENT);

        const incrementArray = instance.exports.incrementArray;
        incrementArray(startIndex, endIndex);
        postMessage('done'); // Comunica al thread principale che il lavoro è completato

    } catch (error) {
        console.error("Errore nel worker:", error);
    }
}

onmessage = function(event) {
    const { sharedBuffer, startIndex, endIndex } = event.data;
    loadAndRunWasm(sharedBuffer, startIndex, endIndex);
};