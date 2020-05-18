const ExifImage = require("exif").ExifImage;
const path = require("path");
const fs = require("fs");
const cliProgress = require('cli-progress');

const readExifData = (imagePath, callback) => {
    try {
        new ExifImage({ image: imagePath }, (error, exifData) => {
            if (error) {
                console.log('Error: ' + error.message);
                return;
            }
            callback(exifData);
        });
    } catch (error) {
        console.log('Error: ' + error.message);
    }
};

const findImages = (inputPath, extension) => {
    // based on https://gist.github.com/victorsollozzo/4134793
    const find = (base, ext, files, result) => {
        files = files || fs.readdirSync(base);
        result = result || [];

        files.forEach(file => {
            var newbase = path.join(base, file)
            if (fs.statSync(newbase).isDirectory()) {
                result = find(newbase, ext, fs.readdirSync(newbase), result)
            } else if (file.substr(-1 * (ext.length + 1)).toLowerCase() == ('.' + ext).toLowerCase()) {
                result.push(newbase)
            }
        }
        )
        return result
    }

    return find(inputPath, extension)
};

const params = process.argv;

if (params.length != 4) {
    console.log("Usage: node src/main.js inputPath outputPath [--copy]");
    console.log("No options means simulation.");
    process.exit();
}

const inputPath = path.normalize(process.argv[2]);
const outputPath = path.normalize(process.argv[3]);

if (!fs.statSync(inputPath).isDirectory()) {
    console.log("Error:", inputPath, "is not a directory");
    process.exit();
}

if (!fs.statSync(outputPath).isDirectory()) {
    console.log("Error:", outputPath, "is not a directory");
    process.exit();
}

const inputImages = findImages(inputPath, "jpg");

const dateToPath = (outputPath, createDate, fileName) => {
    const temp = createDate.split(" ");
    const date = temp[0].split(":");
    // const time = temp[1].split(":");
    return path.resolve(outputPath, date[0], date[1], date[2], fileName);
}

var numCopy = 0;
var numExist = 0;
var numTotal = 0;

const compareExif = (srcPath, targetPath, callback) => {
    readExifData(srcPath, srcExif => {
        readExifData(targetPath, targetExif => {

            const exifs = ["CreateDate", "ExifImageWidth", "ExifImageHeight"]

            exifs.forEach(attribute => {
                if (srcExif.exif[attribute] != targetExif.exif[attribute]) {
                    callback(false);
                }
            });

            const srcStat = fs.statSync(srcPath);
            const targetStat = fs.statSync(srcPath);
            if (srcStat.size != targetStat.size) {
                callback(false);
            }

            callback(true);
        });
    });
}

const borkedImages = [];

const prg = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
prg.start(inputImages.length - 1, 0);

const checkImage = (imagePaths, outputPath, i) => {
    if (i >= imagePaths.length) {
        prg.stop();
        console.log("Borked Images:");
        borkedImages.forEach(imagePath => console.log(imagePath));
        console.log("Total:", numTotal);
        console.log("Existing:", numExist);
        console.log("Borked:", borkedImages.length);
        if (process.argv[5] == "--copy") {
            console.log("Copied:", numCopy);
        } else {
            console.log("Would copy:", numCopy);
        }

        return;
    }
    prg.update(i);

    const srcPath = imagePaths[i];

    numTotal++;
    readExifData(srcPath, exif => {
        const fileName = path.basename(srcPath);
        const targetPath = dateToPath(outputPath, exif.exif.CreateDate, fileName);
        const exists = fs.existsSync(targetPath);

        if (exists) {
            numExist++;
            compareExif(srcPath, targetPath, exifEqual => {
                if (!exifEqual) {
                    borkedImages.push(targetPath);
                }
            });
        } else {
            numCopy++;
            if (process.argv[5] == "--copy") {
                fs.copyFileSync(srcPath, targetPath);
            }
        }


        checkImage(imagePaths, outputPath, i + 1);
    });
}

checkImage(inputImages, outputPath, 0);