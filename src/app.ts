import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import env from './config/env';

const app = express();

app.use(
    cors({
        origin: env.CORS_ORIGIN,
        credentials: true,
    })
);
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/healthcheck', (_, res) => {
    res.status(200).send('OK').json({
        success: true,
        message: 'Server is running',
        data: null,
    });
});

export { app };
