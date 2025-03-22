const matrixSize = 100;
let totalElements = matrixSize * matrixSize;
const numWorkers = navigator.hardwareConcurrency || 4; // Number of processor cores
console.log(numWorkers);

// Create a SharedArrayBuffer to hold the matrix of 32-bit integers
const sharedBuffer = new SharedArrayBuffer(totalElements * Int32Array.BYTES_PER_ELEMENT);
const sharedArray = new Int32Array(sharedBuffer);

// Initialize the matrix (optional)
for (let i = 0; i < totalElements; i++) {
    sharedArray[i] = i;
}
console.log(sharedArray);


const outputDiv = document.getElementById('output');
outputDiv.innerHTML = `<p>Initial matrix (first 10 elements): ${sharedArray.slice(0, 10)}...</p>`;

const workers = [];
let elementsPerWorker = Math.ceil(totalElements / numWorkers);
let startIndex = 0;

const startTime = performance.now();
let workersDone = 0;
console.log(elementsPerWorker);


for (let i = 0; i < numWorkers; i++) {
    const worker = new Worker('worker.js');
    let endIndex = Math.min(startIndex + elementsPerWorker, totalElements);
    // Debugging: Print the start and end indices for each worker
    console.log("Main: Posting to worker", i, "startIndex:", startIndex, "endIndex:", endIndex);
    worker.postMessage({ sharedBuffer, startIndex, endIndex });
    workers.push(worker);

    worker.onmessage = function(event) {
        workersDone++;
        if (workersDone === numWorkers) {
            const endTime = performance.now();
            outputDiv.innerHTML += `<p>Matrix after increment (first 10 elements): ${sharedArray.slice(0, 10)}...</p>`;
            outputDiv.innerHTML += `<p>Time taken: ${(endTime - startTime).toFixed(2)} ms</p>`;
        }
    };

    // Correct way:
    startIndex = endIndex;
    if (startIndex < totalElements) {
        startIndex++;
    }
}
