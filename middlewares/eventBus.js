const EventEmitter = require('events');

class EventBus extends EventEmitter {}

// Create an instance of the event bus
const eventBus = new EventBus();

// Example: Emitting an event when a review is created
eventBus.on('reviewCreated', (review) => {
    console.log('Review created:', review);
    // Update the read database or perform other actions
});

// Example: Emitting an event after a certain time period
setTimeout(() => {
    eventBus.emit('timeEvent', 'Some time has passed');
}, 15000); // Emit the event after 15 seconds

// Example: Triggering the event when a review is created
const createdReview = { /* Review data */ };
eventBus.emit('reviewCreated', createdReview);
