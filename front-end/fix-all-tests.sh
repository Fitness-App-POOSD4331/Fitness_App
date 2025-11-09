#!/bin/bash

# Automatic fix for all test files
# Run this in your front-end directory

echo "Fixing all test files..."

# Fix all .test.tsx files in src/components
for file in src/components/*.test.tsx; do
  if [ -f "$file" ]; then
    echo "Fixing $(basename $file)..."
    
    # Replace global.fetch with globalThis.fetch
    sed -i.bak 's/global\.fetch/globalThis.fetch/g' "$file"
    
    # Replace (global as any).fetch with globalThis.fetch
    sed -i.bak 's/(global as any)\.fetch/globalThis.fetch/g' "$file"
    sed -i.bak 's/;(global as any)\.fetch/globalThis.fetch/g' "$file"
    
    # Ensure type casts
    sed -i.bak 's/globalThis\.fetch = vi\.fn()$/globalThis.fetch = vi.fn() as any/g' "$file"
    
    # Remove backup files
    rm "${file}.bak" 2>/dev/null
  fi
done

echo ""
echo "✅ All test files fixed!"
echo ""
echo "Now run: npm test"
