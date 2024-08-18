#!/bin/bash

# Run vite build
# vite build

# Check if build was successful (optional)
# if [[ $? -ne 0 ]]; then
#   echo "Error: vite build failed!"
#   exit 1
# fi

# Define the destination directory and archive filename

archive_name="com.perrin.mqtt"
dst_dir="$archive_name".sdPlugin
final_extension="streamDeckPlugin"

# Create the zip archive
7z a Release/"$archive_name".zip "$dst_dir"

# Change the archive file extension (if needed)
cp Release/"$archive_name".zip Release/"$archive_name".$final_extension

echo "Successfully built, copied, and archived to $archive_name.$final_extension"
