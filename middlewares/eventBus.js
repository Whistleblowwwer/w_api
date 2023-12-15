// import { EventEmitter } from 'events';


// class EventBus extends EventEmitter {
//     constructor(size, interval) {
//         super();
//         this.size = size;
//         this.interval = interval;
//         this.operations = [];
//     }
// }

// export const eventBus = new EventBus(15, 15000);

// async function executeOperations() {
//     console.log('Executing operations:', eventBus.operations);
//     for (const operation of eventBus.operations) {
//         try {
//             console.log(operation.model)
//             console.log(operation.method)
//             console.log(operation.data)
//         } catch (error) {
//             console.error('Error executing operation:', error);
//         }
//     }
//     eventBus.operations = []
// }


// setTimeout(() => {
//     eventBus.emit('timeEvent', 'Some time has passed');
// }, eventBus.interval);

// eventBus.on('batchProcessed', async (batch) => {
//     eventBus.operations = eventBus.operations.concat(batch);
//     if(eventBus.size <= eventBus.operations.length){
//         await executeOperations();
//     }
// });

// eventBus.on('timeEvent', async () => {

//     await executeOperations();

//     setTimeout(() => {
//         eventBus.emit('timeEvent', 'Some time has passed');
//     }, eventBus.interval);
// });