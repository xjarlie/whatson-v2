import express from 'express';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import compression from 'compression';

import indexRouter from './routes/index';
import appRouter from './routes/app';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import postsRouter from './routes/posts';
import pushRouter from './routes/push';

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(compression());
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/.well-known', express.static(path.join(__dirname, 'public', '.well-known')));
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get('/service-worker.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'service-worker.js'));
});

app.use('/', indexRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);
app.use('/api/push', pushRouter);

// Keep this last
app.use('/app', appRouter);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});