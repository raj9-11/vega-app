// patch-tv.mjs - CORRECTED VERSION
import fs from 'fs';
import * as glob from 'glob';

const patterns = ['src/**/*.tsx', 'src/**/*.ts'];

for (const pattern of patterns) {
  for (const file of glob.sync(pattern)) {
    let code = fs.readFileSync(file, 'utf8');
    let orig = code;

    // Skip if already has TVFocusable import
    if (code.includes('TVFocusable')) {
      continue;
    }

    // Simple replacements only
    code = code.replace(/TouchableOpacity/g, 'TVFocusable');
    code = code.replace(/TouchableNativeFeedback/g, 'TVFocusable');
    code = code.replace(/TouchableHighlight/g, 'TVFocusable');
    
    // Remove problematic mobile props
    code = code.replace(/\s*activeOpacity\s*=\s*{[^}]*}/g, '');
    code = code.replace(/\s*underlayColor\s*=\s*{[^}]*}/g, '');
    code = code.replace(/\s*onLongPress\s*=\s*{[^}]*}/g, '');
    
    // Remove overflow hidden which interferes with focus borders
    code = code.replace(/overflow\s*:\s*['"]hidden['"],?/g, '');
    code = code.replace(/\boverflow-hidden\b/g, '');

    // Add TVFocusable import if we made changes
    if (code !== orig && !code.includes('TVFocusable')) {
      const reactImportMatch = code.match(/import.*from\s+['"]react['"];?\s*\n/);
      if (reactImportMatch) {
        const insertIndex = reactImportMatch.index + reactImportMatch[0].length;
        const tvImport = "import { TVFocusable } from '../components/tv/TVFocusable';\n";
        code = code.slice(0, insertIndex) + tvImport + code.slice(insertIndex);
      }
    }

    // Write file only if changed
    if (code !== orig) {
      fs.writeFileSync(file, 'utf8');
      console.log('✅ Patched:', file);
    }
  }
}

console.log('🎯 TV patching complete!');
