# photo-ingress

A small script to copy all files (`jpg`,`jpeg`) found within an input folder (recursively) to an output folder organized by year/month/day

Example:

    srcFolder/foo/bar/img.jpg -> targetFolder/2020/05/18/img.jpg

# Installation

    npm install -g photo-ingress


# Usage

    photo-ingress srcFolder/ targetFolder # this will simulate

    photo-ingress srcFolder/ targetFolder --copy # this will copy files not existing yet in the target 