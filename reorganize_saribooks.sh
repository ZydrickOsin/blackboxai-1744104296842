#!/bin/bash

# Create directory structure
mkdir -p ../../../sari_books/{templates,static/{css,js}}

# Move HTML files
for html_file in dashboard.html landing.html new_index.html new_redirect.html redirect.html tax_calculation.html transaction_input.html; do
    if [ -f "../../../sari_books/$html_file" ]; then
        mv "../../../sari_books/$html_file" "../../../sari_books/templates/"
    fi
done

# Move assets
[ -f "../../../sari_books/styles.css" ] && mv "../../../sari_books/styles.css" "../../../sari_books/static/css/"
[ -f "../../../sari_books/scripts.js" ] && mv "../../../sari_books/scripts.js" "../../../sari_books/static/js/"

# Update references in HTML files
for html_file in ../../../sari_books/templates/*.html; do
    sed -i 's|href="styles.css"|href="../static/css/styles.css"|g' "$html_file"
    sed -i 's|src="scripts.js"|src="../static/js/scripts.js"|g' "$html_file"
done

echo "Reorganization complete. New structure:"
tree ../../../sari_books/