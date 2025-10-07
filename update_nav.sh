#!/bin/bash

# Update navigation in all HTML files to include Customers and Messages links

for file in index.html features.html products.html contact.html; do
  if [ -f "$file" ]; then
    # Add Customers and Messages links before the Cart link
    sed -i 's|<li><a href="contact.html">Contact</a></li>|<li><a href="contact.html">Contact</a></li>\n             <li><a href="customers.html">Customers</a></li>\n             <li><a href="messages.html">Messages</a></li>|g' "$file"
    echo "Updated $file"
  fi
done

echo "Navigation update complete!"