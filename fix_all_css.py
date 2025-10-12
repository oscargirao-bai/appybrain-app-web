#!/usr/bin/env python3
"""
Script para corrigir TODOS os estilos CSS web que ainda usam sintaxe React Native
"""
import os
import re
from pathlib import Path

def fix_horizontal_margins_and_paddings(content):
    """Converte marginHorizontal e paddingHorizontal para web"""
    
    # marginHorizontal: X → marginLeft: X, marginRight: X
    content = re.sub(
        r'marginHorizontal:\s*(-?\d+)',
        r'marginLeft: \1, marginRight: \1',
        content
    )
    
    # paddingHorizontal: X → paddingLeft: X, paddingRight: X
    content = re.sub(
        r'paddingHorizontal:\s*(-?\d+)',
        r'paddingLeft: \1, paddingRight: \1',
        content
    )
    
    # marginVertical: X → marginTop: X, marginBottom: X
    content = re.sub(
        r'marginVertical:\s*(-?\d+)',
        r'marginTop: \1, marginBottom: \1',
        content
    )
    
    # paddingVertical: X → paddingTop: X, paddingBottom: X
    content = re.sub(
        r'paddingVertical:\s*(-?\d+)',
        r'paddingTop: \1, paddingBottom: \1',
        content
    )
    
    return content

def fix_style_arrays(content):
    """Converte style={[...]} para style={{...}}"""
    
    # Procura por style={[ seguido de conteúdo até ]}
    # Nota: isto é simplificado, pode não apanhar todos os casos nested
    pattern = r'style=\{\[([^\]]+)\]\}'
    
    def replace_array(match):
        inner = match.group(1).strip()
        # Se tem vírgulas, é array de múltiplos objetos: mesclar com spread
        if ',' in inner and '{' in inner:
            # Tentar identificar objetos separados por vírgula
            parts = []
            depth = 0
            current = []
            for char in inner:
                if char == '{':
                    depth += 1
                elif char == '}':
                    depth -= 1
                elif char == ',' and depth == 0:
                    parts.append(''.join(current).strip())
                    current = []
                    continue
                current.append(char)
            if current:
                parts.append(''.join(current).strip())
            
            # Mesclar objetos com spread
            merged = '{{' + ', '.join(f'...{p}' if not p.startswith('{') else p[1:-1] for p in parts) + '}}'
            return f'style={merged}'
        else:
            # Single object ou estilo simples
            return f'style={{{inner}}}'
    
    content = re.sub(pattern, replace_array, content)
    
    return content

def add_display_flex_to_flex_containers(content):
    """Adiciona display: 'flex' a elementos que usam flex mas não têm display"""
    
    # Procura por estilos que têm flexDirection mas não têm display
    lines = content.split('\n')
    new_lines = []
    
    for i, line in enumerate(lines):
        new_lines.append(line)
        
        # Se linha tem flexDirection mas não é em inline style
        if 'flexDirection:' in line and 'display:' not in line:
            # Verificar se é um objeto de estilo (não inline)
            # Procurar se é parte de um const styles = { ... }
            if i > 0 and ':' in line and '{' not in line:
                # Adicionar display: 'flex' antes
                indent = len(line) - len(line.lstrip())
                new_lines.insert(-1, ' ' * indent + "display: 'flex',")
    
    return '\n'.join(new_lines)

def fix_pressable_buttons(content):
    """Garante que botões <button> têm estilos web corretos"""
    
    # Se há chestPressable sem border/background, adicionar
    if 'chestPressable:' in content and "border: 'none'" not in content:
        content = re.sub(
            r'(chestPressable:\s*\{[^}]+)(\})',
            r"\1,\n\t\tborder: 'none',\n\t\tbackground: 'transparent',\n\t\tpadding: 0,\n\t\tcursor: 'pointer',\n\t\2",
            content
        )
    
    return content

def process_file(filepath):
    """Processa um ficheiro JSX"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Aplicar todas as correções
        content = fix_horizontal_margins_and_paddings(content)
        content = fix_style_arrays(content)
        # content = add_display_flex_to_flex_containers(content)  # Pode causar problemas, comentado
        content = fix_pressable_buttons(content)
        
        # Se houve mudanças, escrever
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'✅ Fixed: {filepath}')
            return True
        else:
            return False
            
    except Exception as e:
        print(f'❌ Error in {filepath}: {e}')
        return False

def main():
    """Processa todos os ficheiros .jsx no /web"""
    web_dir = Path(__file__).parent / 'web' / 'src'
    
    if not web_dir.exists():
        print(f'❌ Directory not found: {web_dir}')
        return
    
    print(f'🔍 Scanning {web_dir} for .jsx files...')
    
    fixed_count = 0
    total_count = 0
    
    for jsx_file in web_dir.rglob('*.jsx'):
        total_count += 1
        if process_file(jsx_file):
            fixed_count += 1
    
    print(f'\n✅ Done! Fixed {fixed_count}/{total_count} files')

if __name__ == '__main__':
    main()
