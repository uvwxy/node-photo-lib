# photo-ingress

A small script to copy all files (`jpg`,`jpeg`) found within an input folder (recursively) to an output folder organized by year/month/day, detecting duplicates by comparing the exif tags `"CreateDate"`, `"ImageWidth"`, `"ImageHeight"`
Example:

    srcFolder/foo/bar/img.jpg -> targetFolder/2020/05/18/img.jpg

# Installation

    npm install -g photo-ingress


# Usage

    photo-ingress srcFolder/ targetFolder # this will simulate

    photo-ingress srcFolder/ targetFolder --copy # this will copy files not existing yet in the target 

# Notes: 

- If there is no exif flag "DateCreated" the date 1970-1-1 is used.

# Examples

## General usage

First print the help text:

    mrbook:panos paul$ photo-ingress
    Usage: photo-ingress inputPath outputPath [--copy] [--printCollisions] [--printCopied] [--printExisting]
    No options means simulation, i.e. only if --copy is provided files are written.

Let's see what would happen (the `~>` indicates files that *would* be copied):

    mrbook:panos paul$ photo-ingress ./ ~/media/photo-lib/ --printCopied --printExisting
    PANO_20180118_211832.jpg ~> /Users/paul/media/photo-lib/2018/01/18/PANO_20180118_211832.jpg
    PANO_20180119_153524.jpg ~> /Users/paul/media/photo-lib/2018/01/19/PANO_20180119_153524.jpg
    PANO_20180121_120213.jpg ~> /Users/paul/media/photo-lib/2018/01/21/PANO_20180121_120213.jpg
    [...]
    PANO_20190718_235005.jpg ~> /Users/paul/media/photo-lib/1970/1/1/PANO_20190718_235005.jpg
    PANO_20190718_235016.jpg ~> /Users/paul/media/photo-lib/1970/1/1/PANO_20190718_235016.jpg
    PANO_20190718_235055.jpg ~> /Users/paul/media/photo-lib/1970/1/1/PANO_20190718_235055.jpg
    [████████████████████████████████████████] Total  | 100% | 75/75
    [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] Copied | 0% | 0/75
    [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] Exist  | 0% | 0/75
    [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] Collisions | 0% | 0/75
    Total: 75
    Would copy: 75
    Existing: 0
    Collisions: 0

Now, we want to copy the files, by adding `--copy` (The `=>` files that have been copied):

    mrbook:panos paul$ photo-ingress ./ ~/media/photo-lib/ --printCopied --printExisting --copy
    PANO_20180118_211832.jpg => /Users/paul/media/photo-lib/2018/01/18/PANO_20180118_211832.jpg
    PANO_20180119_153524.jpg => /Users/paul/media/photo-lib/2018/01/19/PANO_20180119_153524.jpg
    PANO_20180121_120213.jpg => /Users/paul/media/photo-lib/2018/01/21/PANO_20180121_120213.jpg
    [...]
    PANO_20190718_235005.jpg => /Users/paul/media/photo-lib/1970/1/1/PANO_20190718_235005.jpg
    PANO_20190718_235016.jpg => /Users/paul/media/photo-lib/1970/1/1/PANO_20190718_235016.jpg
    PANO_20190718_235055.jpg => /Users/paul/media/photo-lib/1970/1/1/PANO_20190718_235055.jpg
    [████████████████████████████████████████] Total  | 100% | 75/75
    [████████████████████████████████████████] Copied | 100% | 75/75
    [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] Exist  | 0% | 0/75
    [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] Collisions | 0% | 0/75
    Total: 75
    Copied: 75
    Existing: 0
    Collisions: 0

Now, we try the same. The `==` indicates existing files:

    mrbook:panos paul$ photo-ingress ./ ~/media/photo-lib/ --printCopied --printExisting --copy
    PANO_20180118_211832.jpg == /Users/paul/media/photo-lib/2018/01/18/PANO_20180118_211832.jpg
    PANO_20180119_153524.jpg == /Users/paul/media/photo-lib/2018/01/19/PANO_20180119_153524.jpg
    PANO_20180121_120213.jpg == /Users/paul/media/photo-lib/2018/01/21/PANO_20180121_120213.jpg
    [...]
    PANO_20190714_191415.jpg == /Users/paul/media/photo-lib/1970/1/1/PANO_20190714_191415.jpg
    PANO_20190718_234945.jpg == /Users/paul/media/photo-lib/1970/1/1/PANO_20190718_234945.jpg
    PANO_20190718_235005.jpg == /Users/paul/media/photo-lib/1970/1/1/PANO_20190718_235005.jpg
    [████████████████████████████████████████] Total  | 100% | 75/75
    [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] Copied | 0% | 0/75
    [████████████████████████████████████████] Exist  | 100% | 75/75
    [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] Collisions | 0% | 0/75
    Total: 75
    Copied: 0
    Existing: 75
    Collisions: 0

## md5 comparison

Comparing without `--md5`, i.e. by comparing exif meta data, is faster, but theoretically not correct:

    mrbook:broken-image-import paul$ time photo-ingress ./ ~/media/photo-lib/
    Using exif comparison (hint: --md5)
    [████████████████████████████████████████] Total  | 100% | 2499/2499
    [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] Copied | 0% | 0/2499
    [████████████████████████████████████████] Exist  | 100% | 2499/2499
    [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] Collisions | 0% | 0/2499
    Total: 2499
    Would copy: 0
    Existing: 2499
    Collisions: 0

    real	0m12.855s
    user	0m4.638s
    sys	0m18.228s

Comparing with `--md5` is slower (but guarantees files are identical):

    mrbook:broken-image-import paul$ time photo-ingress ./ ~/media/photo-lib/ --md5
    Using md5 comparison
    [████████████████████████████████████████] Total  | 100% | 2499/2499
    [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] Copied | 0% | 0/2499
    [████████████████████████████████████████] Exist  | 100% | 2499/2499
    [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] Collisions | 0% | 0/2499
    Total: 2499
    Would copy: 0
    Existing: 2499
    Collisions: 0

    real	0m42.457s
    user	0m42.584s
    sys	0m15.396s