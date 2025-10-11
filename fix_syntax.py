#!/usr/bin/env python3
"""
Script para corrigir erros de sintaxe criados pela conversão automática.
Foca em }; que deveria ser });
"""
import os
import re

def fix_syntax_errors(filepath):
    """Corrige erros de sintaxe comuns."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Fix 1: body: JSON.stringify(...) }; -> });
        content = re.sub(
            r'(body:\s*JSON\.stringify\([^)]+\)\s*)\};',
            r'\1});',
            content
        )
        
        # Fix 2: params || {} }; -> params || {}) };
        content = re.sub(
            r'(\w+\s*\|\|\s*\{\})\s*\};',
            r'\1);',
            content
        )
        
        # Fix 3: arrow functions com apenas 1 statement: }) => { ... }; -> }) => { ... });
        # Procurar padrões como: const handler = (e) => callback({ ... };
        content = re.sub(
            r'(\([^)]*\)\s*=>\s*\w+\([^)]*\{[^}]+)\};',
            r'\1});',
            content
        )
        
        # Fix 4: createContext({ ... }; -> createContext({ ... });
        content = re.sub(
            r'(createContext\(\{[^}]+)\};',
            r'\1});',
            content
        )
        
        # Fix 5: method: 'POST' }; -> method: 'POST' });
        # Para await this.makeAuthenticatedRequest(..., { method: 'POST' };
        content = re.sub(
            r"(method:\s*['\"](?:POST|GET|PUT|DELETE)['\"]\s*)\};",
            r'\1});',
            content
        )
        
        # Fix 6: Genericamente qualquer função call com { ... }; no final
        # Exemplo: someFunction('arg', { key: value };
        content = re.sub(
            r'(\w+\([^{]*\{[^}]+)\};',
            r'\1});',
            content,
            flags=re.MULTILINE
        )
        
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
        
    except Exception as e:
        print(f"Erro: {e}")
        return False

def main():
    web_src = '/Users/oscargirao/Documents/appybrain_app_web/web/src'
    
    fixed = 0
    for root, dirs, files in os.walk(web_src):
        for file in files:
            if file.endswith('.jsx'):
                filepath = os.path.join(root, file)
                if fix_syntax_errors(filepath):
                    fixed += 1
                    print(f"✓ {filepath}")
    
    print(f"\n{'='*60}")
    print(f"Corrigidos: {fixed} ficheiros")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
