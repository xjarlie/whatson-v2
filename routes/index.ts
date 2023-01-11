import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
    res.redirect('/app');
});

router.get('/p/:id', (req, res) => {
    res.redirect('/app/posts/' + req.params.id);
});

router.get('/u/:id', (req, res) => {
    res.redirect('/app/users/' + req.params.id);
});

export default router;