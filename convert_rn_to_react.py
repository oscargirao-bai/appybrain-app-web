#!/usr/bin/env python3
"""
Script para converter React Native para React DOM automaticamente.
Substitui imports e componentes RN por equivalentes web.
"""
import os
import re
import sys

# Mapeamento de imports React Native -> React DOM
IMPORT_REPLACEMENTS = {
    # React Native core
    r"import\s+{([^}]+)}\s+from\s+['\"]react-native['\"];?": lambda m: convert_rn_imports(m.group(1)),
    r"import\s+\*\s+as\s+(\w+)\s+from\s+['\"]react-native['\"];?": "",
    
    # Safe Area
    r"import\s+{([^}]+)}\s+from\s+['\"]react-native-safe-area-context['\"];?": "",
    r"from\s+['\"]react-native-safe-area-context['\"]": "from 'react'",
    
    # SVG (remover imports de SVG components)
    r"import\s+\w+\s+from\s+['\"][^'\"]*\.svg['\"];?": "",
    
    # Async Storage (já substituído)
    r"import\s+AsyncStorage\s+from\s+['\"]@react-native-async-storage/async-storage['\"];?": "",
}

# Mapeamento de componentes RN -> HTML/React DOM
COMPONENT_REPLACEMENTS = {
    # View -> div
    r"<View\s": "<div ",
    r"</View>": "</div>",
    
    # Text -> span
    r"<Text\s": "<span ",
    r"</Text>": "</span>",
    
    # SafeAreaView -> div
    r"<SafeAreaView\s": "<div ",
    r"</SafeAreaView>": "</div>",
    
    # Pressable -> button
    r"<Pressable\s": "<button ",
    r"</Pressable>": "</button>",
    
    # TouchableOpacity -> button
    r"<TouchableOpacity\s": "<button ",
    r"</TouchableOpacity>": "</button>",
    
    # Image -> img
    r"<Image\s": "<img ",
    
    # TextInput -> input
    r"<TextInput\s": "<input ",
    
    # ScrollView -> div
    r"<ScrollView\s": "<div ",
    r"</ScrollView>": "</div>",
    
    # KeyboardAvoidingView -> div
    r"<KeyboardAvoidingView\s": "<div ",
    r"</KeyboardAvoidingView>": "</div>",
    
    # ActivityIndicator -> div com spinner
    r"<ActivityIndicator\s": "<div ",
    
    # FlatList -> div
    r"<FlatList\s": "<div ",
}

# Props que precisam ser convertidas
PROP_REPLACEMENTS = {
    r'\bstyle=\{styles\.(\w+)\}': r'style={styles.\1}',  # mantém styles object
    r'\bstyle=\{\[([^\]]+)\]\}': lambda m: convert_style_array(m.group(1)),  # arrays de style
    r'\bresizeMode=["\'](\w+)["\']': r'style={{objectFit: "\1"}}',  # resizeMode -> objectFit
    r'\bsource=\{require\(["\']([^"\']+)["\']\)\}': lambda m: f'src="{convert_asset_path(m.group(1))}"',  # require -> src
    r'\bsource=\{\{\s*uri:\s*["\']([^"\']+)["\']\s*\}\}': r'src="\1"',  # uri -> src
    r'\bonPress=': r'onClick=',  # onPress -> onClick
    r'\baccessibilityRole=["\'](\w+)["\']': '',  # remover accessibilityRole
    r'\baccessibilityLabel=': r'aria-label=',  # accessibilityLabel -> aria-label
    r'\btestID=': r'data-testid=',  # testID -> data-testid
}

def convert_rn_imports(imports_str):
    """Converte imports de react-native para versão web."""
    # Lista de imports que devem ser removidos (não existem no web)
    remove_imports = {
        'View', 'Text', 'Image', 'Pressable', 'TouchableOpacity', 'TextInput',
        'ScrollView', 'SafeAreaView', 'KeyboardAvoidingView', 'ActivityIndicator',
        'FlatList', 'StyleSheet', 'Platform', 'useWindowDimensions', 'Keyboard',
        'Alert', 'Animated', 'Dimensions', 'AppState'
    }
    
    imports = [i.strip() for i in imports_str.split(',')]
    kept_imports = [i for i in imports if i not in remove_imports]
    
    if kept_imports:
        return f"import {{{', '.join(kept_imports)}}} from 'react-native';"
    return ""

def convert_style_array(styles_str):
    """Converte array de styles para Object.assign ou spread."""
    styles = [s.strip() for s in styles_str.split(',')]
    if len(styles) == 1:
        return f'style={{{styles[0]}}}'
    # Usar spread operator
    return f'style={{{{...{styles[0]}, ...{styles[1]}}}}}'

def convert_asset_path(path):
    """Converte require('../../assets/...') para /assets/..."""
    # Remove '../' e './' do início
    clean_path = re.sub(r'^(\.\.\/|\.\/)+', '', path)
    if not clean_path.startswith('/'):
        clean_path = '/' + clean_path
    return clean_path

def convert_stylesheet_create(content):
    """Converte StyleSheet.create para objeto JS normal."""
    # Remover StyleSheet.create, manter apenas o objeto
    content = re.sub(
        r'const\s+styles\s+=\s+StyleSheet\.create\s*\(\s*\{',
        'const styles = {',
        content
    )
    # Remover o ); final do StyleSheet.create (substituir por };)
    # Procurar padrão: fecha chave seguido de ); no final de linha
    content = re.sub(
        r'\}\s*\)\s*;(\s*$)',
        r'};\1',
        content,
        flags=re.MULTILINE
    )
    return content

def convert_file(filepath):
    """Converte um ficheiro de React Native para React DOM."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # 1. Converter imports
        for pattern, replacement in IMPORT_REPLACEMENTS.items():
            if callable(replacement):
                content = re.sub(pattern, replacement, content)
            else:
                content = re.sub(pattern, replacement, content)
        
        # 2. Converter StyleSheet.create
        content = convert_stylesheet_create(content)
        
        # 3. Converter componentes
        for pattern, replacement in COMPONENT_REPLACEMENTS.items():
            content = re.sub(pattern, replacement, content)
        
        # 4. Converter props
        for pattern, replacement in PROP_REPLACEMENTS.items():
            if callable(replacement):
                content = re.sub(pattern, replacement, content)
            else:
                content = re.sub(pattern, replacement, content)
        
        # 5. Remover imports vazios
        content = re.sub(r'import\s+{\s*}\s+from\s+[^;]+;?\n?', '', content)
        content = re.sub(r'import\s+from\s+[^;]+;?\n?', '', content)
        
        # 6. Substituir Alert.alert por window.alert
        content = re.sub(r'Alert\.alert\s*\([^,]+,\s*([^)]+)\)', r'window.alert(\1)', content)
        
        # 7. Substituir useWindowDimensions por window.innerWidth/innerHeight
        content = re.sub(
            r'const\s+{\s*width(?:,\s*height)?\s*}\s+=\s+useWindowDimensions\(\);?',
            'const width = window.innerWidth; const height = window.innerHeight;',
            content
        )
        
        # Só escrever se houve mudanças
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
        
    except Exception as e:
        print(f"Erro ao converter {filepath}: {e}", file=sys.stderr)
        return False

def main():
    """Converte todos os ficheiros .jsx em web/src."""
    web_src = '/Users/oscargirao/Documents/appybrain_app_web/web/src'
    
    converted = 0
    total = 0
    
    for root, dirs, files in os.walk(web_src):
        for file in files:
            if file.endswith('.jsx'):
                filepath = os.path.join(root, file)
                total += 1
                if convert_file(filepath):
                    converted += 1
                    print(f"✓ {filepath}")
    
    print(f"\n{'='*60}")
    print(f"Conversão completa: {converted}/{total} ficheiros modificados")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
