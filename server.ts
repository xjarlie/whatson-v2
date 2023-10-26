// Import external modules for HTTP server management
import express from 'express';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import compression from 'compression';

// Import all route modules
import indexRouter from './routes/index';
import appRouter from './routes/app';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import postsRouter from './routes/posts';
import pushRouter from './routes/push';

// Create the server and define a listening port
const app = express();
const port = 3000;

// Determine the engine for server-side rendering
app.set('view engine', 'ejs');

// Serve static files e.g. CSS, images, external javascript
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/.well-known', express.static(path.join(__dirname, 'public', '.well-known')));

// Implement the external modules to allow for:
// cross-origin resource sharing
// file compression for faster loading times
// JSON request parsing
// cookie management
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(cookieParser());

// Provide the offline service worker to enable the app to run offline
app.get('/service-worker.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'service-worker.js'));
});

// Assign each route module to a base route
app.use('/', indexRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);
app.use('/api/push', pushRouter);

// Keep this last
app.use('/app', appRouter);

// Start the server listeing on the port, and print a success message to the console
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});