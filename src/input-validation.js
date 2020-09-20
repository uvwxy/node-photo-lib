const path = require("path");
const fs = require("fs");

const validate = () => {

    const params = process.argv;

    if (params.length < 4) {
        console.log("Usage: photo-ingress inputPath outputPath [--copy] [--printCollisions] [--printCopied] [--printExisting]");
        console.log("No options means simulation, i.e. only if --copy is provided files are written.");
        process.exit();
    }

    const inputPath = path.normalize(process.argv[2]);
    const outputPath = path.normalize(process.argv[3]);
    const options = [4, 5, 6, 7, 8].map(x => process.argv[x]).filter(x => x);

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
        isCopy: options.findIndex(x => x == "--copy") >= 0,
        printCollisions: options.findIndex(x => x == "--printCollisions") >= 0,
        printCopied: options.findIndex(x => x == "--printCopied") >= 0,
        printExisting: options.findIndex(x => x == "--printExisting") >= 0,
        md5: options.findIndex(x => x == "--md5") >= 0
    }
}

module.exports = {
    validate: validate
}