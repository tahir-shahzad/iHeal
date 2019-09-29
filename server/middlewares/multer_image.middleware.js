const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './assets/img');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }

});
const upload = multer(
    { storage: storage },
    { limits: 1024 * 1024 * 5 }
);
let type = upload.single('picture');

module.exports = {
    image: type
}