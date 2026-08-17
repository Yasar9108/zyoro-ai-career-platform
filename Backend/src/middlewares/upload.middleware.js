const multer = require('multer');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/resumes')
    },
    filename: function (req, file, cb) {
        cb(null,   file.originalname  + "-" + Date.now() + ".pdf")
    }
})

// Accept only PDF files
const fileFilter = (req, file, cb)=>{
    if(file.mimetype == 'application/pdf'){
        cb(null, true)
    } else {
        cb(new Error('Only PDF files are allowed!'), false)
    }
}

// Maximum file size: 5 MB
const limits = {
    fileSize : 1024 * 1024 * 5 // 5mb
}

const upload = multer({
    storage : storage,
    fileFilter : fileFilter,
    limits : limits
})

module.exports = upload;