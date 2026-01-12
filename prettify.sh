#!/bin/bash

# Prettify HTML files using the same settings as the pre-commit hook
# Usage:
#   ./prettify              # format all modified HTML files
#   ./prettify file.html    # format specific file(s)
#
# Note: Files listed in .prettierignore (e.g., pages with complex SVGs) are skipped.

command -v prettier >/dev/null 2>&1 || {
    echo >&2 "Prettier is not installed. Install it with 'npm install -g prettier'."
    exit 1
}

# Check if a file is ignored by prettier
is_ignored() {
    local file="$1"
    # prettier --check returns 0 for ignored files (they "pass" the check)
    # but we need to detect if it was actually ignored vs formatted
    if [ -f ".prettierignore" ] && grep -qFx "$file" .prettierignore 2>/dev/null; then
        return 0
    fi
    return 1
}

if [ $# -gt 0 ]; then
    # Format specific files passed as arguments
    for file in "$@"; do
        if [ -f "$file" ]; then
            if is_ignored "$file"; then
                echo "Skipping $file (listed in .prettierignore)"
            else
                echo "Formatting $file..."
                prettier --write "$file"
            fi
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
        if is_ignored "$file"; then
            echo "Skipping $file (listed in .prettierignore)"
        else
            echo "Formatting $file..."
            prettier --write "$file"
        fi
    done
fi

echo "Done."
