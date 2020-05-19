const ExifImage = require("exif").ExifImage;
const path = require("path");
const fs = require("fs");

const findFiles = (inputPath, extensions) => {
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

    const result = [];

    extensions.forEach(ext => {
        const images = find(inputPath, ext);
        images.forEach(i => result.push(i));
    });

    return result;
};

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

const exifDateToPath = (outputPath, createDate, fileName) => {
    const temp = createDate.split(" ");
    const date = temp[0].split(":");
    // const time = temp[1].split(":");
    return path.resolve(outputPath, date[0], date[1], date[2], fileName);
}

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

module.exports = {
    compareExif,
    exifDateToPath,
    readExifData,
    findFiles
}