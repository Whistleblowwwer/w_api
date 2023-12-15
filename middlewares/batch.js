import { eventBus } from "./eventBus.js";

export class WriteOperationBatcher {
  constructor(batchSize, interval) {
    this.batchSize = batchSize;
    this.interval = interval;
    this.batch = [];
    this.timer = null;
  }

  async addWriteOperation(asyncOperation) {
    this.batch.push(asyncOperation);

    // Check if the batch size has been reached
    if (this.batch.length >= this.batchSize) {
      await this.processBatch();
    } else {
      // If not, set a timer to process the batch after the specified interval
      if (!this.timer) {
        this.timer = setTimeout(async () => {
          await this.processBatch();
        }, this.interval);
      }
    }
  }

  async processBatch() {
    // Perform the necessary processing for the batched write operations
    console.log('Processing batch');

    // Execute each asynchronous operation in the batch
    const results = await Promise.all(this.batch.map(op => op()));

    eventBus.emit('batchProcessed', this.batch);
    
    // Reset batch and timer
    this.batch = [];
    clearTimeout(this.timer);
    this.timer = null;

   

    return results;
  }
}