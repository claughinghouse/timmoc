#!/bin/bash

file_path="./quotes.txt"
output_file="../src/hashedQuotes.json"

hash_map=""

while IFS= read -r line; do
  hash=$(echo -n "$line" | sha256sum | awk '{print $1}')
  escaped_line=$(printf '%s' "$line" | sed 's/"/\\"/g')
  hash_map=$(printf '%s\n"%s":"%s",' "$hash_map" "$hash" "$escaped_line")
done < "$file_path"

json_output="${hash_map%,}" # Remove the trailing comma
json_output="{$json_output}"

echo "$json_output" > "$output_file"

echo "Output JSON written to $output_file"

