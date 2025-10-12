#!/bin/bash
# Script de verificação COMPLETA de ReferenceErrors antes do deploy

echo "🔍 VERIFICAÇÃO COMPLETA - ReferenceErrors"
echo "========================================"
echo ""

cd "$(dirname "$0")/src"

# 1. Procurar require() (CommonJS)
echo "1️⃣ Verificando require()..."
COUNT=$(grep -r "require(" . --include="*.jsx" --include="*.js" | wc -l | tr -d ' ')
if [ "$COUNT" -gt 0 ]; then
  echo "❌ ERRO: $COUNT usos de require() encontrados!"
  grep -rn "require(" . --include="*.jsx" --include="*.js" | head -10
  exit 1
else
  echo "✅ Sem require()"
fi
echo ""

# 2. Procurar module.exports (CommonJS)
echo "2️⃣ Verificando module.exports..."
COUNT=$(grep -r "module\.exports\|exports\." . --include="*.jsx" --include="*.js" | wc -l | tr -d ' ')
if [ "$COUNT" -gt 0 ]; then
  echo "❌ ERRO: $COUNT usos de module.exports encontrados!"
  grep -rn "module\.exports\|exports\." . --include="*.jsx" --include="*.js" | head -10
  exit 1
else
  echo "✅ Sem module.exports"
fi
echo ""

# 3. Procurar APIs React Native não mocadas
echo "3️⃣ Verificando APIs React Native..."
APIS=("Platform\." "Dimensions\.get" "Animated\.Value" "Easing\." "Linking\." "BackHandler\.")
for api in "${APIS[@]}"; do
  COUNT=$(grep -r "$api" . --include="*.jsx" | grep -v "mock" | grep -v "// " | wc -l | tr -d ' ')
  if [ "$COUNT" -gt 0 ]; then
    echo "⚠️  WARNING: $COUNT usos de $api (verificar se têm mock)"
  fi
done
echo "✅ APIs verificadas"
echo ""

# 4. Procurar imports sem extensão
echo "4️⃣ Verificando imports sem extensão..."
COUNT=$(grep -r "from '\\./" . --include="*.jsx" | grep -v "\\.jsx'" | grep -v "\\.js'" | grep -v "\\.json'" | grep -v "\\.png'" | grep -v "\\.svg'" | grep -v "\\?react'" | wc -l | tr -d ' ')
if [ "$COUNT" -gt 0 ]; then
  echo "⚠️  WARNING: $COUNT imports sem extensão"
  grep -r "from '\\./" . --include="*.jsx" | grep -v "\\.jsx'" | grep -v "\\.js'" | grep -v "\\.json'" | grep -v "\\.png'" | grep -v "\\.svg'" | grep -v "\\?react'" | head -10
else
  echo "✅ Todos imports com extensão"
fi
echo ""

# 5. Procurar componentes usados mas possivelmente não importados
echo "5️⃣ Verificando componentes potencialmente não importados..."
# Extrair todos os componentes JSX usados
USED=$(grep -rho "<[A-Z][a-zA-Z0-9]*" . --include="*.jsx" | sed 's/<//g' | sort -u)
# Para cada um, verificar se tem import
MISSING=0
for comp in $USED; do
  # Pular componentes HTML nativos comuns
  if [[ "$comp" =~ ^(App|Fragment|React|Suspense|StrictMode)$ ]]; then
    continue
  fi
  # Verificar se aparece em algum import
  IMPORTED=$(grep -r "import.*$comp" . --include="*.jsx" | wc -l | tr -d ' ')
  if [ "$IMPORTED" -eq 0 ]; then
    echo "⚠️  Possível componente não importado: $comp"
    ((MISSING++))
  fi
done
if [ "$MISSING" -eq 0 ]; then
  echo "✅ Todos componentes parecem importados"
else
  echo "⚠️  $MISSING componentes suspeitos (verificar manualmente)"
fi
echo ""

# 6. Build test
echo "6️⃣ Testando build..."
cd ..
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Build PASSOU"
else
  echo "❌ Build FALHOU!"
  npm run build 2>&1 | tail -20
  exit 1
fi
echo ""

echo "========================================"
echo "✅ VERIFICAÇÃO COMPLETA!"
echo "Build pronto para deploy."
echo "========================================"
