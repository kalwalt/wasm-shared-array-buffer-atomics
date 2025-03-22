const matrixSize = 100;
const totalElements = matrixSize * matrixSize;
const numWorkers = navigator.hardwareConcurrency || 4; // Numero di core del processore

// Crea un SharedArrayBuffer per contenere la matrice di interi a 32 bit
const sharedBuffer = new SharedArrayBuffer(totalElements * Int32Array.BYTES_PER_ELEMENT);
const sharedArray = new Int32Array(sharedBuffer);

// Inizializza la matrice (opzionale)
for (let i = 0; i < totalElements; i++) {
    sharedArray[i] = i;
}

const outputDiv = document.getElementById('output');
outputDiv.innerHTML = `<p>Matrice iniziale (primi 10 elementi): ${sharedArray.slice(0, 10)}...</p>`;

const workers = [];
const elementsPerWorker = Math.ceil(totalElements / numWorkers);
let startIndex = 0;

const startTime = performance.now();
let workersDone = 0;

for (let i = 0; i < numWorkers; i++) {
    const worker = new Worker('worker.js');
    const endIndex = Math.min(startIndex + elementsPerWorker, totalElements);
    worker.postMessage({ sharedBuffer, startIndex, endIndex });
    workers.push(worker);

    worker.onmessage = function(event) {
        workersDone++;
        if (workersDone === numWorkers) {
            const endTime = performance.now();
            outputDiv.innerHTML += `<p>Matrice dopo l'incremento (primi 10 elementi): ${sharedArray.slice(0, 10)}...</p>`;
            outputDiv.innerHTML += `<p>Tempo impiegato: ${(endTime - startTime).toFixed(2)} ms</p>`;
        }
    };

    startIndex = endIndex;
}