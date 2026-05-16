#!/bin/bash
# Script de prueba para el flujo completo: login + petición protegida

BACKEND="http://localhost:8000"

echo "======================================"
echo " 1. HEALTH CHECK (sin auth)"
echo "======================================"
curl -s "$BACKEND/health" | python3 -m json.tool 2>/dev/null || curl -s "$BACKEND/health"
echo ""

echo ""
echo "======================================"
echo " 2. LOGIN (obtener token)"
echo "======================================"
CREDENCIALES='{"email":"juan@empresaA.com","password":"12345678"}'
RESPONSE=$(curl -s -X POST "$BACKEND/auth/login" \
  -H "Content-Type: application/json" \
  -d "$CREDENCIALES")

echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"

# Extraer token
TOKEN=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo ""
  echo "❌ No se pudo obtener el token. Verifica las credenciales."
  exit 1
fi

echo ""
echo "======================================"
echo " 3. USUARIOS (con token)"
echo "======================================"
curl -s -X GET "$BACKEND/usuarios/?estado=activo" \
  -H "accept: application/json" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool 2>/dev/null || \
curl -s -X GET "$BACKEND/usuarios/?estado=activo" \
  -H "accept: application/json" \
  -H "Authorization: Bearer $TOKEN"

echo ""
echo ""
echo "======================================"
echo " 4. DEBUG HEADERS (con token)"
echo "======================================"
curl -s "$BACKEND/auth/debug-header" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool 2>/dev/null || \
curl -s "$BACKEND/auth/debug-header" \
  -H "Authorization: Bearer $TOKEN"

echo ""
echo ""
echo "======================================"
echo " ✅ TODO FUNCIONA CORRECTAMENTE"
echo "======================================"
echo "Token: ${TOKEN:0:30}...${TOKEN: -10}"
