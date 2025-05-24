#!/bin/bash
echo "Searching for 'PageProps' in .d.ts files..."
grep -r --include=\*.d.ts 'PageProps' .

echo "\nSearching for 'PageProps' in tsconfig.json..."
grep 'PageProps' tsconfig.json || echo "Not found in tsconfig.json"

echo "\nSearching for global declarations containing 'PageProps'..."
grep -r --include=\*.d.ts -A 5 -B 5 'declare global' . | grep 'PageProps' || echo "No global PageProps found in .d.ts"