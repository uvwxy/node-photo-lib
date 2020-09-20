#!/usr/local/bin/node

const cliProgress = require('cli-progress');
const options = require("./input-validation").validate();
const imageUtil = require("./image-util");
const path = require("path");
const fs = require("fs");

const inputImages = imageUtil.findFiles(options.inputPath, ["jpg", "jpeg"]);

var numCopy = 0;
var numExist = 0;
var numTotal = 0;

const copiedImages = [];
const existingImages = [];
const borkedImages = [];

const prg = new cliProgress.MultiBar({
    clearOnComplete: false, hideCursor: true,
    format: "[{bar}] {fileName} | {percentage}% | {value}/{total}"
}, cliProgress.Presets.shades_grey);

const prgTotal = prg.create(inputImages.length, 0);
const prgCopy = prg.create(inputImages.length, 0);
const prgExist = prg.create(inputImages.length, 0);
const prgBorked = prg.create(inputImages.length, 0);

prgCopy.update(0, { fileName: "Copied" });
prgExist.update(0, { fileName: "Exist " });
prgBorked.update(0, { fileName: "Collisions" });

const checkImage = (imagePaths, outputPath, i) => {
    prgTotal.update(i, { fileName: "Total " });

    if (i >= imagePaths.length) {
        prg.stop();
        if (options.printCopied) {
            copiedImages.forEach(line => console.log(line));
        }
        if (options.printExisting) {
            existingImages.forEach(line => console.log(line));
        }
        if (options.printCollisions) {
            borkedImages.forEach(line => console.log(line));
        }
        console.log("Total:", numTotal);
        if (options.isCopy) {
            console.log("Copied:", numCopy);
        } else {
            console.log("Would copy:", numCopy);
        }
        console.log("Existing:", numExist);
        console.log("Collisions:", borkedImages.length);
        return;
    }

    const srcPath = imagePaths[i];

    numTotal++;
    imageUtil.readExifData(srcPath, exif => {
        const fileName = path.basename(srcPath);
        const targetPath = imageUtil.exifDateToPath(outputPath, exif.exif.CreateDate, fileName);
        const exists = fs.existsSync(targetPath);

        if (exists) {
            numExist++;
            prgExist.update(numExist);

            const compareFn = options.md5 ? imageUtil.compareMd5 : imageUtil.compareExif;

            compareFn(srcPath, targetPath, exifEqual => {
                if (!exifEqual) {
                    borkedImages.push(`${srcPath}, ${targetPath}`);
                    prgBorked.update(borkedImages.length, { fileName: "Collisions" });
                } else {
                    existingImages.push(`${srcPath} == ${targetPath}`);
                }
            });
        } else {
            numCopy++;
            if (options.isCopy) {
                if (!fs.existsSync(path.dirname(targetPath)).isDirectory) {
                    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
                }
                fs.copyFileSync(srcPath, targetPath);
                prgCopy.update(numCopy, { fileName: "Copied" });
            }
            copiedImages.push(`${srcPath} ${options.isCopy ? "=>" : "~>"} ${targetPath}`);
        }

        checkImage(imagePaths, outputPath, i + 1);
    });
}


if (options.md5) {
    console.log("Using md5 comparison");
} else {
    console.log("Using exif comparison (hint: --md5)");
}
checkImage(inputImages, options.outputPath, 0);