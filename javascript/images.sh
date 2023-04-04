#!/bin/bash

# Receive two command-line arguments
dir=$1
namefile=$2
size1=$3
size2=$4

# Create an empty gzip file to hold the encoded images
gzipfile="encoded_images.gz"
touch "$gzipfile"

# Loop through all JPG files in the directory and append their base64-encoded strings to the gzip file
for file in "$dir"/*.jpg; do
  echo "Processing file: $file"
  encoded=$(base64 < "$file")
  echo "$encoded" | gzip >> "$gzipfile"
done

# Pass the path to the gzip file as a parameter to the Node.js program
node $namefile $size1 $size2 encoded_images.gz
