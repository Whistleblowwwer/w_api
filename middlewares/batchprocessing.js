import { WriteOperationBatcher } from "./batch.js";

const writeOperationBatcher = new WriteOperationBatcher(5, 10000);

export const addtoBatch = (operation) => {
    writeOperationBatcher.addWriteOperation(operation);
}