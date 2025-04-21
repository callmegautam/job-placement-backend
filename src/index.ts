import { env } from 'process';
import { app } from './app';

const port = env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server is running on port ${port} in ${env.NODE_ENV} mode`);
});

app.on('error', (err: any) => {
    console.error('Error occurred:', err.message);
});
