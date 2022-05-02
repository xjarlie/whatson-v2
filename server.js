const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');

const indexRouter = require('./routes/index');
const appRouter = require('./routes/app');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
const pushRouter = require('./routes/push');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use('/public', express.static(path.join(__dirname, 'public')));
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