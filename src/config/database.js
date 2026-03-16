const mongoose = require("mongoose");

const connectDB = async () => {
    await mongoose.connect(
        "mongodb+srv://namastedev:Sanket3623*@namastenode.4xycefn.mongodb.net/devTinder"
    );
};

module.exports = connectDB;

    