#!/bin/bash

input_file="quotes.txt"
output_file="../src/quotes.json"

# Initialize JSON string
json="{"

# Read the input file line by line
while IFS= read -r quote; do
  # Escape double quotes in the quote
  escaped_quote=$(echo "$quote" | sed 's/"/\\"/g')
  
  # Append quote to the JSON string
  json+="\"$((++count))\": \"$escaped_quote\","
done < "$input_file"

# Remove the trailing comma and close the JSON object
json="${json%,*}}"
  
# Write the JSON string to the output file
echo "$json" > "$output_file"

echo "JSON file created successfully!"