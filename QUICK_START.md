# Quick Start - Roles Tests

## ⚡ Inicio Rápido

### Paso 1: Asegúrate de que la app está corriendo
```bash
# En la carpeta de la aplicación Angular:
npm start
# La app debe estar disponible en http://localhost:4200
```

### Paso 2: Ejecuta los tests
```bash
# En la carpeta loan-e2e:
npx playwright test
```

### Paso 3: Ver resultados
```bash
npx playwright show-report
```

---

## 🧪 Tests Disponibles

| Archivo | Tests | Descripción |
|---------|-------|-------------|
| `roles-listing.spec.ts` | 3 | Verificar que la lista de roles se muestra correctamente |
| `roles-creation.spec.ts` | 5 | Crear nuevos roles con validación |
| `roles-editing.spec.ts` | 4 | Editar roles existentes |
| `roles-deletion.spec.ts` | 3 | Eliminar roles con confirmación |
| `roles-advanced.spec.ts` | 17 | Búsqueda, ordenamiento, selección masiva |

**Total: 32 tests E2E**

---

## 📋 Ejemplos de Uso

### Ejecutar todos los tests
```bash
npx playwright test
```

### Ejecutar solo tests de listing
```bash
npx playwright test roles-listing.spec.ts
```

### Ejecutar un test específico
```bash
npx playwright test -g "Should display roles list"
```

### Ejecutar en modo headless (sin interfaz gráfica)
```bash
npx playwright test --headless
```

### Ejecutar en modo headed (ver el navegador)
```bash
npx playwright test --headed
```

### Ejecutar en modo debug (paso a paso)
```bash
npx playwright test --debug
```

### Ejecutar solo en Chrome
```bash
npx playwright test --project=chromium
```

### Generar reporte HTML
```bash
npx playwright test
npx playwright show-report
```

---

## 🔍 Cobertura de Tests

**Completado:**
- ✅ Listing: 3 tests
- ✅ Creation: 5 tests
- ✅ Editing: 4 tests
- ✅ Deletion: 3 tests
- ✅ Advanced (Búsqueda, Ordenamiento, Selección): 17 tests

**Puede ser expandido:**
- ⏳ Validación avanzada
- ⏳ Gestión de permisos
- ⏳ Herencia de roles
- ⏳ Paginación
- ⏳ Accesibilidad
- ⏳ Seguridad

---

## 🛠️ Troubleshooting

### Error: "page.goto: net::ERR_CONNECTION_REFUSED"
**Solución**: Asegúrate de que la aplicación esté corriendo en localhost:4200

### Error: "Element not found"
**Solución**: Los selectores pueden necesitar ajustes. Revisar `roles-advanced.spec.ts` para ejemplos de selectores flexibles

### Test timeout
**Solución**: Aumentar timeout en playwright.config.ts o add `page.waitForLoadState()`

---

## 📚 Documentación Completa

Ver `TESTS_GENERATED.md` para:
- Descripción detallada de cada test
- Estructura de los tests
- Cómo agregar nuevos tests
- Mejoras futuras

---

## 👤 Información de Tests

- **Base**: `roles-test-plan.md` (plan detallado)
- **Framework**: Playwright
- **Lenguaje**: TypeScript
- **Selectors**: Flexibles (compatible con cualquier estructura HTML)
- **Limpieza**: Automática después de cada test

---

## 🚀 Próximos Pasos

1. Ejecuta los tests para verificar que todo funciona
2. Revisa el reporte en `playwright-report/`
3. Ajusta selectores si es necesario
4. Expande los tests según necesidades

Documentación: https://playwright.dev/docs/intro
