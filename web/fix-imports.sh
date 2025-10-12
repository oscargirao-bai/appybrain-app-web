#!/bin/bash

cd src

# Encontrar todos os ficheiros .jsx e .js
find . -type f \( -name "*.jsx" -o -name "*.js" \) | while read -r file; do
  # Adicionar .jsx a imports de componentes (começam com maiúscula)
  sed -i '' -E "s|from '(\\.\\./.*)/([A-Z][^/']*)';|from '\\1/\\2.jsx';|g" "$file"
  
  # Adicionar .jsx a imports de constants/ (font, color são .jsx!)
  sed -i '' -E "s|from '(\\.\\./.*constants/)([a-z]+)';|from '\\1\\2.jsx';|g" "$file"
  
  # Corrigir se ficou .js em vez de .jsx
  sed -i '' -E "s|from '(\\.\\./.*constants/[a-z]+)\\.js';|from '\\1.jsx';|g" "$file"
  
  # Adicionar .js a imports de services/ (navigationRef, serviceApi, etc)
  sed -i '' -E "s|from '(\\.\\./.*services/)([a-zA-Z]+)';|from '\\1\\2.js';|g" "$file"
  
  # Corrigir services que são .jsx (Theme, Translate, etc)
  sed -i '' -E "s|from '(\\.\\./.*services/)(Theme|Translate|ApiManager|DataManager|HtmlRender|Notifications|SearchContext)\\.js';|from '\\1\\2.jsx';|g" "$file"
  
  # Adicionar .js a imports de utils/ (console, svgUtils)
  sed -i '' -E "s|from '(\\.\\./.*utils/)([a-zA-Z]+)';|from '\\1\\2.js';|g" "$file"
  
  # Corrigir utils que são .jsx
  sed -i '' -E "s|from '(\\.\\./.*utils/[a-zA-Z]+)\\.js';|from '\\1.jsx';|g" "$file"
  
  # Adicionar .js a imports de hooks/ (useTranslate, etc)
  sed -i '' -E "s|from '(\\.\\./.*hooks/)([a-zA-Z]+)';|from '\\1\\2.js';|g" "$file"
  
  # Corrigir duplicações
  sed -i '' "s|\\.jsx\\.jsx'|.jsx'|g" "$file"
  sed -i '' "s|\\.js\\.js'|.js'|g" "$file"
  sed -i '' "s|\\.jsx\\.js'|.jsx'|g" "$file"
  sed -i '' "s|\\.js\\.jsx'|.js'|g" "$file"
done

echo "✅ Imports corrigidos!"
