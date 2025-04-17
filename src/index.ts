import { env } from 'process';
import { app } from './app';

app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
});
