# node-photo-lib

A small script to copy all files (`jpg`,`jpeg`) found within an input folder (recursively) to an output folder organized by year/month/day

Example:

    srcFolder/foo/bar/img.jpg -> targetFolder/2020/05/18/img.jpg


# Usage

    npm install
    node src/main.js srcFolder/ targetFolder # this will simulate

    node srcx/main.js srcFolder/ targetFolder --copy # this will copy files not existing yet in the target 