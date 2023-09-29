import express from 'express';
import { sequelize } from './config/db.js';
import './models/associations.js';
import router from './routes/routes.js';

const app = express();

// Middlewares
app.use(morgan("dev"));
app.use(express.json());

app.use(router);

// Synchronize Sequelize with the database
sequelize.sync()
    .then(() => {
        app.listen(4000, () => {
            console.log('Listening on port 4000');
        });
    })
    .catch(error => {
        console.error('Error syncing the database:', error);
    });
