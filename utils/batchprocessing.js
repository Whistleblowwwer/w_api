import { WriteOperationBatcher } from "./batch.js";

const writeOperationBatcher = new WriteOperationBatcher(10, 5000);

export const addtoBatch = (operation) => {
    writeOperationBatcher.addWriteOperation(operation);
};
