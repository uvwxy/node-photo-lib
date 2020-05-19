const path = require("path");
const fs = require("fs");

const validate = () => {

    const params = process.argv;

    if (params.length < 4) {
        console.log("Usage: node src/main.js inputPath outputPath [--copy]");
        console.log("No options means simulation.");
        process.exit();
    }

    const inputPath = path.normalize(process.argv[2]);
    const outputPath = path.normalize(process.argv[3]);
    const option = process.argv[4];

    if (!fs.statSync(inputPath).isDirectory()) {
        console.log("Error:", inputPath, "is not a directory");
        process.exit();
    }

    if (!fs.statSync(outputPath).isDirectory()) {
        console.log("Error:", outputPath, "is not a directory");
        process.exit();
    }

    return {
        inputPath,
        outputPath,
        isCopy: option == "--copy"
    }
}

module.exports = {
    validate: validate
}