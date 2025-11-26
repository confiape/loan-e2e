# Guía de Migración de Tests - Uso de Actions

## Introducción

Esta guía explica cómo migrar tests existentes para usar las clases de Actions en lugar de interactuar directamente con la UI de Playwright. El objetivo es tener tests más limpios, mantenibles y reutilizables.

## Beneficios de usar Actions

- ✅ **Reducción de código**: Elimina lógica repetitiva
- ✅ **Mantenibilidad**: Cambios en la UI solo requieren actualizar el Action
- ✅ **Reutilización**: Métodos compartidos entre todos los tests
- ✅ **Legibilidad**: Los tests son más fáciles de entender
- ✅ **Consistencia**: Mismo patrón en todos los tests

## Arquitectura

```
tests/
├── roles-creation.spec.ts      (Test file)
├── roles-deletion.spec.ts
└── ...

actions/
├── roles.actions.ts            (Action class con métodos reutilizables)
└── auth.actions.ts

data/
└── role-name-generator.ts      (Generador de nombres únicos)
```

## Patrones de Migración

### 1. Estructura Básica de un Test

#### ❌ ANTES (Sin Actions)

```typescript
import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { RolesPage } from '../pages/roles.page';

let rolesPage: RolesPage;

test.describe('Roles', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    rolesPage = new RolesPage(page);
    await rolesPage.goto();
  });

  test('should create a role', async ({ page }) => {
    const newRoleBtn = page.locator('[id*="new"], [class*="new"]').first();
    await newRoleBtn.click();

    const nameInput = page.locator('[id*="name"]').first();
    await nameInput.fill('Test Role');

    const createBtn = page.locator('button:has-text("Create")').last();
    await createBtn.click();

    const tableContent = await page.locator('table').textContent();
    expect(tableContent).toContain('Test Role');
  });
});
```

#### ✅ DESPUÉS (Con Actions)

```typescript
import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { RoleActions } from '../actions/roles.actions';
import { generateUniqueName } from '../data/role-name-generator';

let roleActions: RoleActions;

test.describe('Roles', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    roleActions = new RoleActions(page);
    await roleActions.navigateTo();
  });

  test('should create a role', async () => {
    const roleName = generateUniqueName();

    await roleActions.create({ name: roleName });

    await roleActions.verifyExists(roleName);
  });
});
```

### 2. Migración de Locators Genéricos

#### ❌ ANTES
```typescript
const newRoleBtn = page.locator('[id*="new"], [class*="new"], button:has-text("New Role")').first();
const nameInput = page.locator('[id*="name"], [placeholder*="name"], [name*="name"]').first();
const createBtn = page.locator('button:has-text("Create")').last();
```

#### ✅ DESPUÉS
```typescript
import { roleTestIds } from '../actions/roles.actions';

const newRoleBtn = page.getByTestId(roleTestIds.newRoleBtn);
const nameInput = page.getByTestId(roleTestIds.roleNameInput);
const createBtn = page.getByTestId(roleTestIds.submitBtn);
```

### 3. Crear Roles Únicos

#### ❌ ANTES
```typescript
// Nombres hardcodeados o con timestamps
const roleName = 'Test Role ' + new Date().getTime();

// O nombres fijos que causan conflictos
const roleName = 'Test Role';
```

#### ✅ DESPUÉS
```typescript
import { generateUniqueName } from '../data/role-name-generator';

const roleName = generateUniqueName();
// Genera: "Test_Role_1734104234_abc123" (único y incremental)
```

### 4. Verificaciones de Existencia

#### ❌ ANTES
```typescript
const tableContent = await page.getByTestId(roleTestIds.table).textContent();
expect(tableContent).toContain('Role Name');
expect(tableContent).not.toContain('Another Role');
```

#### ✅ DESPUÉS
```typescript
await roleActions.verifyExists('Role Name');
await roleActions.verifyNotExists('Another Role');
```

### 5. Operaciones CRUD

#### ❌ ANTES - Crear Role
```typescript
const newRoleBtn = page.getByTestId(roleTestIds.newRoleBtn);
await newRoleBtn.click();
await page.waitForTimeout(300);

const nameInput = page.getByTestId(roleTestIds.roleNameInput);
await nameInput.fill('New Role');

const inheritedBtn = page.getByTestId(roleTestIds.inheritedRolesSelect);
await inheritedBtn.click();
// ... más lógica de selección ...

const submitBtn = page.getByTestId(roleTestIds.submitBtn);
await submitBtn.click();
await page.waitForLoadState('networkidle');
```

#### ✅ DESPUÉS - Crear Role
```typescript
await roleActions.create({
  name: 'New Role',
  inheritedRoles: ['Admin'],
  permissions: ['PaymentController_GetDetailed']
});
```

#### ❌ ANTES - Editar Role
```typescript
const searchInput = page.getByTestId(roleTestIds.searchInput);
await searchInput.fill('Role Name');

const row = page.getByRole('rowheader', { name: 'Role Name' }).locator('..');
const editBtn = row.getByRole('button', { name: 'Edit' });
await editBtn.click();

const nameInput = page.getByTestId(roleTestIds.roleNameInput);
await nameInput.clear();
await nameInput.fill('New Name');

const submitBtn = page.getByTestId(roleTestIds.submitBtn);
await submitBtn.click();
```

#### ✅ DESPUÉS - Editar Role
```typescript
await roleActions.edit('Old Name', {
  name: 'New Name',
  inheritedRoles: ['Admin']
});
```

#### ❌ ANTES - Eliminar Role
```typescript
const searchInput = page.getByTestId(roleTestIds.searchInput);
await searchInput.fill('Role Name');

const row = page.getByRole('rowheader', { name: 'Role Name' }).locator('..');
const deleteBtn = row.getByRole('button', { name: 'Delete' });
await deleteBtn.click();

await page.waitForTimeout(500);

const confirmDeleteBtn = page.locator('button:has-text("Delete")').last();
await confirmDeleteBtn.click();
```

#### ✅ DESPUÉS - Eliminar Role
```typescript
await roleActions.clickDeleteByName('Role Name');
await page.getByTestId(roleTestIds.deleteConfirmBtn).click();
```

## Checklist de Migración

Use este checklist para migrar un archivo de test:

- [ ] Reemplazar `RolesPage` con `RoleActions`
- [ ] Importar `roleTestIds` de `roles.actions.ts`
- [ ] Importar `generateUniqueName` de `data/role-name-generator.ts`
- [ ] Reemplazar `rolesPage.goto()` con `roleActions.navigateTo()`
- [ ] Reemplazar todos los locators genéricos con `page.getByTestId(roleTestIds.xxx)`
- [ ] Usar `generateUniqueName()` para nombres de roles en cada test
- [ ] Reemplazar creación manual de roles con `roleActions.create()`
- [ ] Reemplazar edición manual con `roleActions.edit()` o `roleActions.openEditByName()`
- [ ] Reemplazar eliminación manual con `roleActions.clickDeleteByName()`
- [ ] Reemplazar verificaciones manuales con `roleActions.verifyExists()` y `roleActions.verifyNotExists()`
- [ ] Eliminar todo código de cleanup (no eliminar roles después de tests)
- [ ] Cada test debe crear su propio rol si lo necesita

## Métodos Disponibles en RoleActions

### Navegación
```typescript
await roleActions.navigateTo()                    // Ir a /roles
```

### Creación
```typescript
await roleActions.create({
  name: 'Role Name',                             // Requerido
  inheritedRoles: ['Admin', 'User'],             // Opcional
  permissions: ['Controller_Action']             // Opcional
})
```

### Lectura/Verificación
```typescript
await roleActions.verifyExists('Role Name')      // Verifica que existe
await roleActions.verifyNotExists('Role Name')   // Verifica que NO existe
await roleActions.verifyPermissionsSelected(     // Verifica permisos
  'Role Name',
  ['Permission1']
)
await roleActions.verifyInheritedRolesSelected(  // Verifica roles heredados
  'Role Name',
  ['Admin']
)
```

### Edición
```typescript
await roleActions.edit('Old Name', {             // Editar por nombre
  name: 'New Name',
  inheritedRoles: ['Admin'],
  permissions: ['Controller_Action']
})
await roleActions.openEditByName('Role Name')    // Solo abre el modal
```

### Eliminación
```typescript
await roleActions.delete('Role Name')            // Busca y abre confirmación
await roleActions.clickDeleteByName('Role Name') // Busca y hace click en Delete
```

### Búsqueda
```typescript
const row = await roleActions.findRowByName('Role Name')  // Retorna locator de la fila
```

## Generador de Nombres Únicos

```typescript
import { generateUniqueName } from '../data/role-name-generator';

// Cada llamada genera un nombre único y incremental
const name1 = generateUniqueName();  // "Test_Role_1734104234_abc123"
const name2 = generateUniqueName();  // "Test_Role_1734104235_def456"
const name3 = generateUniqueName();  // "Test_Role_1734104236_ghi789"

// NO se eliminan después del test
// Los nombres son incrementales para evitar conflictos
```

## Test IDs Disponibles

```typescript
import { roleTestIds } from '../actions/roles.actions';

roleTestIds.newRoleBtn                          // Botón "New Role"
roleTestIds.modal                               // Modal dialog
roleTestIds.roleNameInput                       // Input de nombre del rol
roleTestIds.submitBtn                           // Botón Submit/Create/Update
roleTestIds.cancelBtn                           // Botón Cancel
roleTestIds.deleteConfirmBtn                    // Botón de confirmación de delete
roleTestIds.table                               // Tabla de roles
roleTestIds.searchInput                         // Input de búsqueda
roleTestIds.selectAllCheckbox                   // Checkbox "Select All"
roleTestIds.inheritedRolesSelect                // Dropdown de roles heredados
roleTestIds.permissionsSelect                   // Dropdown de permisos
roleTestIds.updateBtn                           // Botón Update (en edición)
roleTestIds.rolesMultiselectRolesIdList         // Lista de roles en multiselect
roleTestIds.rolesMultiselectPermissionsIdList   // Lista de permisos en multiselect
roleTestIds.rolesMultiselectRolesIdSearch       // Input de búsqueda en roles
roleTestIds.rolesMultiselectPermissionsIdSearch // Input de búsqueda en permisos
```

## Ejemplos Reales del Proyecto

### Ejemplo 1: Test de Creación

```typescript
test('Should create role with permissions', async () => {
  const roleName = generateUniqueName();

  await roleActions.create({
    name: roleName,
    permissions: ['PaymentController_GetDetailed']
  });

  await roleActions.verifyExists(roleName);
  await roleActions.verifyPermissionsSelected(roleName, ['PaymentController_GetDetailed']);
});
```

### Ejemplo 2: Test de Edición

```typescript
test('Should edit role name', async () => {
  const originalName = generateUniqueName();
  const newName = generateUniqueName();

  await roleActions.create({ name: originalName });

  await roleActions.edit(originalName, { name: newName });

  await roleActions.verifyExists(newName);
  await roleActions.verifyNotExists(originalName);
});
```

### Ejemplo 3: Test de Eliminación

```typescript
test('Should delete role with confirmation', async ({ page }) => {
  const roleName = generateUniqueName();

  await roleActions.create({ name: roleName });
  await roleActions.clickDeleteByName(roleName);

  const modal = page.getByTestId(roleTestIds.modal);
  await expect(modal).toBeVisible();

  await page.getByTestId(roleTestIds.deleteConfirmBtn).click();

  await roleActions.verifyNotExists(roleName);
});
```

### Ejemplo 4: Test de Búsqueda

```typescript
test('Should search and verify role exists', async ({ page }) => {
  const searchInput = page.getByTestId(roleTestIds.searchInput);

  await searchInput.fill('Admin');

  await roleActions.verifyExists('Admin');
});
```

## Mejores Prácticas

1. **Usa `generateUniqueName()` siempre**
   ```typescript
   // ✅ BIEN
   const roleName = generateUniqueName();

   // ❌ MAL
   const roleName = 'Test Role';
   const roleName = 'Test Role ' + Math.random();
   ```

2. **No limpies roles después del test**
   ```typescript
   // ❌ NO hagas esto
   test.afterEach(async () => {
     // No elimines los roles creados
     await roleActions.delete(roleName);
   });
   ```

3. **Cada test crea sus propios datos**
   ```typescript
   // ✅ BIEN - Test independiente
   test('Test 1', async () => {
     const name1 = generateUniqueName();
     await roleActions.create({ name: name1 });
     // ...
   });

   test('Test 2', async () => {
     const name2 = generateUniqueName();
     await roleActions.create({ name: name2 });
     // ...
   });
   ```

4. **Usa los métodos de RoleActions en lugar de interactuar directamente**
   ```typescript
   // ✅ BIEN
   await roleActions.create({ name: 'Role' });
   await roleActions.verifyExists('Role');

   // ❌ MAL
   await page.getByTestId(roleTestIds.newRoleBtn).click();
   // ... lógica manual ...
   const content = await page.textContent();
   expect(content).toContain('Role');
   ```

5. **Espera a que se carguen los datos**
   ```typescript
   // ✅ BIEN - RoleActions maneja las esperas
   await roleActions.create({ name: 'Role' });

   // ❌ MAL - Esperas arbitrarias
   await page.getByTestId(roleTestIds.newRoleBtn).click();
   await page.waitForTimeout(1000);
   ```

## Troubleshooting

### Problema: El test falla porque no encuentra el rol
**Solución**: Verifica que:
- Usaste `generateUniqueName()` para el nombre
- El rol fue creado exitosamente con `roleActions.create()`
- Usas `await roleActions.verifyExists(roleName)` para verificar

### Problema: El test se tarda mucho
**Solución**:
- Elimina los `waitForTimeout()` innecesarios
- Usa `page.waitForLoadState('networkidle')` en lugar de esperas fijas
- RoleActions ya maneja las esperas necesarias

### Problema: Tests no son independientes
**Solución**:
- Asegúrate que cada test crea sus propios datos con `generateUniqueName()`
- No reutilices nombres entre tests
- No uses cleanup/afterEach para eliminar datos

## Archivos de Referencia

- **Actions**: `/home/warren/loan-e2e/actions/roles.actions.ts`
- **Test IDs**: Definidos en `roles.actions.ts` en el objeto `roleTestIds`
- **Generador de nombres**: `/home/warren/loan-e2e/data/role-name-generator.ts`
- **Tests migraiados**:
  - `/home/warren/loan-e2e/tests/roles-creation.spec.ts`
  - `/home/warren/loan-e2e/tests/roles-deletion.spec.ts`
  - `/home/warren/loan-e2e/tests/roles-editing.spec.ts`

## Resumen

| Concepto | Antes | Después |
|----------|-------|---------|
| Creación de rol | Manual UI clicks | `roleActions.create()` |
| Edición de rol | Búsqueda + clicks | `roleActions.edit()` |
| Eliminación | Búsqueda + clicks | `roleActions.clickDeleteByName()` |
| Verificación | `textContent().toContain()` | `roleActions.verifyExists()` |
| Nombres únicos | Timestamps o hardcoded | `generateUniqueName()` |
| Cleanup | afterEach() con eliminación | No se requiere |
| Independencia | Tests reutilizan datos | Cada test crea los suyos |
| Locators | Genéricos y frágiles | Test IDs estables |

