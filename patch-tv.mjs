import fs from 'fs';
import * as glob from 'glob';

const focusedStyle = `{ borderColor: '#00BFFF', borderWidth: 3, borderRadius: 12, backgroundColor: 'rgba(0,191,255,0.08)', transform: [{ scale: 1.08 }], shadowColor: '#00BFFF', shadowRadius: 10, shadowOpacity: 0.7, elevation: 8 }`;
const patterns = ['src/**/*.tsx', 'src/**/*.ts'];

for (const pattern of patterns) {
  for (const file of glob.sync(pattern)) {
    let code = fs.readFileSync(file, 'utf8');
    let orig = code;
    let focusableCount = 0;
    // Replace touchables
    code = code.replace(/TouchableOpacity|TouchableNativeFeedback|Pressable/gi, 'TVFocusable');
    // Remove overflow
    code = code.replace(/overflow\s*:\s*['"]hidden['"],?/g, '');
    code = code.replace(/\boverflow-hidden\b/g, '');
    // Remove mobile-only props
    code = code.replace(/\s*activeOpacity\s*=\s*{[^}]*}/g, '');
    code = code.replace(/\s*underlayColor\s*=\s*{[^}]*}/g, '');
    code = code.replace(/\s*onLongPress\s*=\s*{[^}]*}/g, '');
    // Add TVFocusable import if missing
    if (!/TVFocusable/.test(code)) {
      code = code.replace(/import.*from 'react'/, m => m + "\nimport { TVFocusable } from '../components/tv/TVFocusable';");
    }
    // Inject focusedStyle and accessibility props
    code = code.replace(/<TVFocusable([^>]*)>/g, (match, props) => {
      let newProps = props;
      if (!/focusedStyle\s*=/.test(newProps)) newProps += ` focusedStyle={${focusedStyle}}`;
      if (!/accessible\s*=/.test(newProps)) newProps += ' accessible={true}';
      if (!/accessibilityRole\s*=/.test(newProps)) newProps += ' accessibilityRole="button"';
      if (!/onFocus\s*=/.test(newProps)) newProps += ' onFocus={() => {}}';
      if (!/onBlur\s*=/.test(newProps)) newProps += ' onBlur={() => {}}';
      if (focusableCount === 0 && !/hasTVPreferredFocus\s*=/.test(newProps)) {
        newProps += ' hasTVPreferredFocus={true}';
      }
      focusableCount++;
      return `<TVFocusable${newProps}>`;
    });
    code = code.replace(/<TVFocusable([^>]*)\/>/g, (match, props) => {
      let newProps = props;
      if (!/focusedStyle\s*=/.test(newProps)) newProps += ` focusedStyle={${focusedStyle}}`;
      if (!/accessible\s*=/.test(newProps)) newProps += ' accessible={true}';
      if (!/accessibilityRole\s*=/.test(newProps)) newProps += ' accessibilityRole="button"';
      if (!/onFocus\s*=/.test(newProps)) newProps += ' onFocus={() => {}}';
      if (!/onBlur\s*=/.test(newProps)) newProps += ' onBlur={() => {}}';
      if (focusableCount === 0 && !/hasTVPreferredFocus\s*=/.test(newProps)) {
        newProps += ' hasTVPreferredFocus={true}';
      }
      focusableCount++;
      return `<TVFocusable${newProps}/>`;
    });
    if (code !== orig) {
      fs.writeFileSync(file, code, 'utf8');
      console.log('Patched:', file);
    }
  }
}
