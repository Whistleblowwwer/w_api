export class WriteOperationBatcher {
    constructor(batchSize, interval) {
      this.batchSize = batchSize;
      this.interval = interval;
      this.batch = [];
      this.timer = null;
    }
  
    addWriteOperation(operation) {
      this.batch.push(operation);
  
      // Check if the batch size has been reached
      if (this.batch.length >= this.batchSize) {
        this.processBatch();
      } else {
        // If not, set a timer to process the batch after the specified interval
        if (!this.timer) {
          this.timer = setTimeout(() => {
            this.processBatch();
          }, this.interval);s
        }
      }
    }
  
    processBatch() {
      // Perform the necessary processing for the batched write operations
      console.log('Processing batch:', this.batch);
  
      // Reset batch and timer
      this.batch = [];
      clearTimeout(this.timer);
      this.timer = null;
    }
}