async function loadAndRunWasm(sharedBuffer, startIndex, endIndex) {
    try {
        const response = await fetch('increment.wasm');
        const bytes = await response.arrayBuffer();

        // Create a WebAssembly.Global for sharedArray
        const sharedArrayGlobal = new WebAssembly.Global({ value: 'i32', mutable: true }, 0);

        // Create the memory object
        const sharedMemory = new WebAssembly.Memory({
            initial: 1,
            maximum: 1024,
            shared: true,
        });

        const importObject = {
            env: {
                sharedArray: sharedArrayGlobal,
                memory: sharedMemory,
                print_i32: (value) => console.log("WASM print_i32:", value),
            }
        };

        const { instance } = await WebAssembly.instantiate(bytes, importObject);
        console.log(instance);

        // Debugging: Print before setting the global value
        console.log("Worker: Before setting sharedArrayGlobal.value");

        // Set the offset of the shared array
        sharedArrayGlobal.value = 0;

        // Debugging: Print after setting the global value
        console.log("Worker: After setting sharedArrayGlobal.value");

        // Get the Int32Array view from the shared memory
        const wasmSharedArrayView = new Int32Array(sharedMemory.buffer);
        // Get the Int32Array view from the shared buffer
        const jsSharedArrayView = new Int32Array(sharedBuffer);

        // Copy data from sharedBuffer to wasm memory
        wasmSharedArrayView.set(jsSharedArrayView);

        const incrementArray = instance.exports.incrementArray;

        // Debugging: Print the received start and end indices
        console.log("Worker: Received startIndex:", startIndex, "endIndex:", endIndex);

        incrementArray(startIndex, endIndex);
        
        // Copy data from wasm memory to sharedBuffer
        jsSharedArrayView.set(wasmSharedArrayView);

        postMessage('done'); // Communicate to the main thread that the work is complete

    } catch (error) {
        console.error("Errore nel worker:", error);
    }
}

onmessage = function(event) {
    const { sharedBuffer, startIndex, endIndex } = event.data;
    loadAndRunWasm(sharedBuffer, startIndex, endIndex);
};
