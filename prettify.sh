#!/bin/bash

# Prettify HTML files using the same settings as the pre-commit hook
# Usage:
#   ./prettify              # format all modified HTML files
#   ./prettify file.html    # format specific file(s)

command -v prettier >/dev/null 2>&1 || {
    echo >&2 "Prettier is not installed. Install it with 'npm install -g prettier'."
    exit 1
}

if [ $# -gt 0 ]; then
    # Format specific files passed as arguments
    for file in "$@"; do
        if [ -f "$file" ]; then
            echo "Formatting $file..."
            prettier --write "$file"
        else
            echo "File not found: $file"
        fi
    done
else
    # Format all modified HTML files (staged and unstaged)
    modified_files=$(git diff --name-only --diff-filter=d HEAD 2>/dev/null | grep -E '\.html$')

    if [ -z "$modified_files" ]; then
        echo "No modified HTML files to format."
        exit 0
    fi

    for file in $modified_files; do
        echo "Formatting $file..."
        prettier --write "$file"
    done
fi

echo "Done."
