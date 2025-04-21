import express from 'express';
import { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import env from './config/env';
import morgan from 'morgan';
import globalErrorHandler from './middlewares/error-handler.middleware';

const app = express();

const isProduction = env.NODE_ENV === 'PRODUCTION';

app.use(
    cors({
        origin: env.CORS_ORIGIN,
        credentials: true,
    })
);
app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (_: Request, res: Response) => {
    return res.status(200).json({
        success: true,
        message: 'Server is running',
        data: null,
    });
});

// Routes
import userRoute from './routes/user.route';
import companyRoute from './routes/company.route';
import skillRoute from './routes/skill.route';
app.use('/api/v1/users', userRoute);
app.use('/api/v1/companies', companyRoute);
app.use('/api/v1/skills', skillRoute);

app.use('*', (_: Request, res: Response) => {
    return res.status(404).json({
        success: false,
        message: 'Not Found',
        data: null,
    });
});

app.use(globalErrorHandler);

export { app };
