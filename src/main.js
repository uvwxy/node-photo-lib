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
prgBorked.update(0, { fileName: "Borked" });

const checkImage = (imagePaths, outputPath, i) => {
    prgTotal.update(i + 1, { fileName: "Total " });

    if (i >= imagePaths.length) {
        prg.stop();
        console.log("Borked Images:");
        borkedImages.forEach(imagePath => console.log(imagePath));
        console.log("Total:", numTotal);
        console.log("Existing:", numExist);
        console.log("Borked:", borkedImages.length);
        if (options.isCopy) {
            console.log("Copied:", numCopy);
        } else {
            console.log("Would copy:", numCopy);
        }

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
            imageUtil.compareExif(srcPath, targetPath, exifEqual => {
                if (!exifEqual) {
                    borkedImages.push(targetPath, { fileName: "Borked" });
                    prgBorked.update(borkedImages.length);
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
        }

        checkImage(imagePaths, outputPath, i + 1);
    });
}

checkImage(inputImages, options.outputPath, 0);