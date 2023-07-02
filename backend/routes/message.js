const multer = require('multer');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const fs = require('fs');

const initStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'userfiles'
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '_' + file.originalname);
    }
})

const upload = multer ({storage: initStorage}).single('file');

router.post('/uploadMediaFiles', auth, async(req, res)=> {
    upload(req, res, (err) => {
        if (err) return res.json({
            err : err,
            upload: false
        });
        const filename = res.req.file.path.split('\\')[1];
        return res.status(200).json({
            upload: true,
            url : filename
        })
    });
});

module.exports = router;