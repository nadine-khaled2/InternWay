import os
import re

target_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app')

def fix_user_pages():
    for root, dirs, files in os.walk(target_dir):
        for file in files:
            if file.endswith('.tsx') and ('student' in root or 'mentor' in root or 'company' in root) and 'signup' not in root:
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()

                new_content = content
                # We need to replace: className={`${styles.languageMenu} ${showLanguageMenu ? styles.show : ''}`}
                # with className={`language-menu ${showLanguageMenu ? 'show' : ''}`}
                
                # Replaces for exact strings
                new_content = new_content.replace('${styles.languageMenu}', 'language-menu')
                new_content = new_content.replace('${styles.languageOption}', 'language-option')
                new_content = new_content.replace('${showLanguageMenu ? styles.show : \'\'}', "${showLanguageMenu ? 'show' : ''}")
                new_content = new_content.replace('${language === \'en\' ? styles.active : \'\'}', "${language === 'en' ? 'active' : ''}")
                new_content = new_content.replace('${language === \'ar\' ? styles.active : \'\'}', "${language === 'ar' ? 'active' : ''}")

                if new_content != content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f'Updated {path}')

if __name__ == '__main__':
    fix_user_pages()
