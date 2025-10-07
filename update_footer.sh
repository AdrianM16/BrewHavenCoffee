#!/bin/bash

# Update footer in all HTML files to include Customers and Messages links

for file in index.html features.html products.html contact.html customers.html messages.html mock_email.html mock_social.html; do
  if [ -f "$file" ]; then
    # Check if footer already has the links
    if ! grep -q "customers.html" "$file" 2>/dev/null; then
      # Add links after Contact in footer
      sed -i 's|<li><a href="contact.html">Contact</a></li>|<li><a href="contact.html">Contact</a></li>\n            <li><a href="customers.html">Customers</a></li>\n            <li><a href="messages.html">Messages</a></li>|g' "$file"
      echo "Updated footer in $file"
    else
      echo "Footer already updated in $file"
    fi
  fi
done

echo "Footer update complete!"