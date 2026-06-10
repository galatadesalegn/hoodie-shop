import express from 'express';
const router = express.Router();

router.get('/debug/cookies', (req, res) => {
  res.json({
    cookies: req.cookies,
    headers: {
      cookie: req.headers.cookie || 'none',
      'content-type': req.headers['content-type'],
    }
  });
});

export default router;
