const express = require('express');
const cors = require('cors');
const path = require('path');

const indexRouter = require('./routes/index');
// const usersRouter = require('./routes/users');
// const postsRouter = require('./routes/posts');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());

app.use('/', indexRouter);
// app.use('/api/users', usersRouter);
// app.use('/api/posts', postsRouter);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});