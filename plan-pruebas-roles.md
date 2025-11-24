# Plan de Pruebas - Página de Roles

## Resumen Ejecutivo

La página de Roles es una interfaz de gestión completa para administrar roles de usuario en la aplicación Loan. Permite crear, editar, eliminar y buscar roles, así como gestionar sus permisos y relaciones de herencia. La página incluye una tabla interactiva con funcionalidades avanzadas de búsqueda, filtrado, ordenamiento, selección múltiple y paginación.

## Características Principales

### Gestión de Roles
- **Creación de roles**: Modal con formulario para crear nuevos roles
- **Edición de roles**: Modal para modificar roles existentes
- **Eliminación de roles**: Eliminación individual y múltiple
- **Visualización**: Tabla con nombre e ID de cada rol

### Gestión de Permisos
- **Asignación de permisos**: Selector múltiple con lista completa de permisos del sistema
- **Roles heredados**: Capacidad de heredar permisos de otros roles existentes
- **Permisos disponibles**: Más de 40 permisos organizados por controladores (Borrower, Company, File, Loan, Payment, Reports, User, InOutBalance)

### Funcionalidades de Tabla
- **Búsqueda**: Campo de búsqueda en tiempo real
- **Ordenamiento**: Columnas ordenables (Name, ID)
- **Paginación**: Navegación entre páginas (10 registros por página)
- **Selección múltiple**: Checkbox para seleccionar todos los registros visibles
- **Acciones masivas**: Eliminar múltiples roles seleccionados

### Datos del Sistema
- **Total de roles**: 138 roles en el sistema
- **Roles predefinidos**: Admin, Cobrador, Administrador de Finanzas
- **Navegación**: URL dinámica por ID de rol (/roles/:id)

---

## Escenarios de Prueba

### 1. Creación de Roles

**Seed:** `tests/seed.spec.ts`

#### 1.1 Crear Rol con Datos Válidos y Mínimos
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Hacer clic en el botón "New Role"
3. En el campo "Role Name", ingresar "Test Role QA"
4. Hacer clic en el botón "Create"

**Resultados Esperados:**
- El modal se cierra automáticamente
- El nuevo rol aparece en la tabla
- Se muestra una notificación de éxito
- El rol tiene un ID único generado automáticamente

#### 1.2 Crear Rol con Todos los Campos Completos
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Hacer clic en el botón "New Role"
3. En el campo "Role Name", ingresar "Editor Role"
4. Hacer clic en el botón "Inherited Roles"
5. Seleccionar "Admin" de la lista de roles
6. Hacer clic en el botón "Permissions"
7. Seleccionar los siguientes permisos:
   - BorrowerController_GetAllWithActiveLoans
   - LoanController_SaveLoan
   - UserController_GetAllUsers
8. Hacer clic en el botón "Create"

**Resultados Esperados:**
- El modal se cierra
- El nuevo rol "Editor Role" aparece en la tabla
- El rol hereda los permisos del rol "Admin"
- El rol tiene los 3 permisos adicionales asignados

#### 1.3 Validación de Nombre de Rol - Nombre Muy Corto
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Hacer clic en el botón "New Role"
3. En el campo "Role Name", ingresar "A" (1 carácter)
4. Intentar hacer clic en el botón "Create"

**Resultados Esperados:**
- El botón "Create" permanece deshabilitado
- Se muestra el mensaje de validación: "Role name must be between 2-40 characters with no special characters"
- No se puede enviar el formulario

#### 1.4 Validación de Nombre de Rol - Nombre Muy Largo
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Hacer clic en el botón "New Role"
3. En el campo "Role Name", ingresar "ThisIsAVeryLongRoleNameThatExceedsTheMaximumLengthAllowedByTheSystem" (más de 40 caracteres)
4. Intentar hacer clic en el botón "Create"

**Resultados Esperados:**
- El botón "Create" permanece deshabilitado
- Se muestra el mensaje de validación
- El campo solo permite ingresar hasta 40 caracteres

#### 1.5 Validación de Nombre de Rol - Caracteres Especiales
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Hacer clic en el botón "New Role"
3. En el campo "Role Name", ingresar "Role@#$%"
4. Intentar hacer clic en el botón "Create"

**Resultados Esperados:**
- El botón "Create" permanece deshabilitado o se muestra error de validación
- Se muestra el mensaje: "Role name must be between 2-40 characters with no special characters"

#### 1.6 Crear Rol Solo con Roles Heredados
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Hacer clic en el botón "New Role"
3. En el campo "Role Name", ingresar "Manager Role"
4. Hacer clic en el botón "Inherited Roles"
5. Seleccionar múltiples roles: "Admin", "Cobrador", "Administrador de Finanzas"
6. Hacer clic en el botón "Create"

**Resultados Esperados:**
- El rol se crea exitosamente
- El rol hereda todos los permisos de los 3 roles seleccionados
- Se muestra en la tabla

#### 1.7 Crear Rol Solo con Permisos Directos
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Hacer clic en el botón "New Role"
3. En el campo "Role Name", ingresar "Custom Permissions Role"
4. Hacer clic en el botón "Permissions"
5. Seleccionar 5 permisos aleatorios de la lista
6. Hacer clic en el botón "Create"

**Resultados Esperados:**
- El rol se crea exitosamente con solo los 5 permisos seleccionados
- No hereda permisos de otros roles

#### 1.8 Buscar Roles en el Selector de Roles Heredados
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Hacer clic en el botón "New Role"
3. Hacer clic en el botón "Inherited Roles"
4. En el campo de búsqueda del dropdown, ingresar "Admin"
5. Observar los resultados filtrados

**Resultados Esperados:**
- La lista se filtra mostrando solo roles que contienen "Admin"
- Se muestran roles como "Admin", "AdminRole 1763863713593", etc.
- Otros roles no visibles quedan ocultos

#### 1.9 Buscar Permisos en el Selector de Permisos
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Hacer clic en el botón "New Role"
3. Hacer clic en el botón "Permissions"
4. En el campo de búsqueda del dropdown, ingresar "Loan"
5. Observar los resultados filtrados

**Resultados Esperados:**
- La lista se filtra mostrando solo permisos relacionados con "Loan"
- Se muestran permisos como "LoanController_SaveLoan", "LoanController_DeleteLoan"
- Los demás permisos quedan ocultos

#### 1.10 Cancelar Creación de Rol
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Hacer clic en el botón "New Role"
3. En el campo "Role Name", ingresar "Temporal Role"
4. Seleccionar algunos roles heredados y permisos
5. Hacer clic en el botón "Cancel"

**Resultados Esperados:**
- El modal se cierra sin crear el rol
- Los datos ingresados se descartan
- La tabla de roles no muestra cambios

#### 1.11 Cerrar Modal con el Botón X
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Hacer clic en el botón "New Role"
3. En el campo "Role Name", ingresar "Another Temporal Role"
4. Hacer clic en el botón "Close modal" (X en la esquina superior derecha)

**Resultados Esperados:**
- El modal se cierra sin crear el rol
- Los datos ingresados se descartan
- No se guarda ningún cambio

#### 1.12 Cerrar Modal Haciendo Clic Fuera del Modal
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Hacer clic en el botón "New Role"
3. En el campo "Role Name", ingresar "Test Role"
4. Hacer clic en el área oscura fuera del modal (backdrop)

**Resultados Esperados:**
- El modal se cierra sin guardar
- Los datos se descartan
- No se crea el rol

---

### 2. Edición de Roles

**Seed:** `tests/seed.spec.ts`

#### 2.1 Editar Nombre de Rol Existente
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Localizar el rol "Admin" en la tabla
3. Hacer clic en el botón "Edit" del rol "Admin"
4. En el campo "Role Name", cambiar el texto a "Super Admin"
5. Hacer clic en el botón "Update"

**Resultados Esperados:**
- El modal se cierra
- El nombre del rol se actualiza en la tabla a "Super Admin"
- El ID del rol permanece sin cambios
- Se muestra notificación de éxito

#### 2.2 Editar Rol - Agregar Permisos Adicionales
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Hacer clic en el botón "Edit" del rol "Cobrador"
3. Hacer clic en el botón "Permissions"
4. Seleccionar 3 permisos adicionales que no estén ya seleccionados
5. Hacer clic en el botón "Update"

**Resultados Esperados:**
- El rol se actualiza con los nuevos permisos
- Los permisos anteriores se mantienen
- El modal muestra los 3 permisos adicionales la próxima vez que se abre

#### 2.3 Editar Rol - Eliminar Permisos
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Hacer clic en el botón "Edit" del rol "Admin"
3. Hacer clic en el botón "Permissions"
4. Deseleccionar 2 permisos que estén actualmente seleccionados
5. Hacer clic en el botón "Update"

**Resultados Esperados:**
- El rol se actualiza sin los 2 permisos deseleccionados
- Los demás permisos se mantienen intactos

#### 2.4 Editar Rol - Agregar Roles Heredados
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Hacer clic en el botón "Edit" de un rol que no tenga roles heredados
3. Hacer clic en el botón "Inherited Roles"
4. Seleccionar "Admin" de la lista
5. Hacer clic en el botón "Update"

**Resultados Esperados:**
- El rol ahora hereda los permisos del rol "Admin"
- Los permisos directos del rol se mantienen

#### 2.5 Editar Rol - Remover Roles Heredados
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Crear un rol que herede de "Admin" (ver escenario 1.6)
3. Hacer clic en el botón "Edit" del rol recién creado
4. Hacer clic en el botón "Inherited Roles"
5. Deseleccionar el rol "Admin"
6. Hacer clic en el botón "Update"

**Resultados Esperados:**
- El rol ya no hereda permisos del rol "Admin"
- Solo mantiene sus permisos directos

#### 2.6 Editar Rol - Validación de Nombre Vacío
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Hacer clic en el botón "Edit" de cualquier rol
3. Borrar completamente el contenido del campo "Role Name"
4. Intentar hacer clic en el botón "Update"

**Resultados Esperados:**
- El botón "Update" permanece deshabilitado
- Se muestra mensaje de validación
- No se puede actualizar el rol

#### 2.7 Editar Rol - Cambiar Nombre a Uno Ya Existente
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Hacer clic en el botón "Edit" del rol "Cobrador"
3. Cambiar el nombre a "Admin" (que ya existe)
4. Hacer clic en el botón "Update"

**Resultados Esperados:**
- Se muestra un mensaje de error indicando que el nombre ya existe
- El rol no se actualiza
- El modal permanece abierto para corrección

#### 2.8 Cancelar Edición de Rol
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Hacer clic en el botón "Edit" de cualquier rol
3. Modificar el nombre y permisos
4. Hacer clic en el botón "Cancel"

**Resultados Esperados:**
- El modal se cierra
- Los cambios no se guardan
- El rol mantiene sus valores originales

#### 2.9 Editar Rol - Verificar Datos Precargados
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Hacer clic en el botón "Edit" del rol "Admin"
3. Observar los campos del formulario

**Resultados Esperados:**
- El campo "Role Name" muestra "Admin"
- El selector de "Permissions" muestra todos los permisos asignados al rol Admin
- El selector de "Inherited Roles" muestra los roles heredados (si los tiene)
- Todos los datos coinciden con el rol actual

#### 2.10 Editar Rol mediante Navegación Directa por URL
**Pasos:**
1. Navegar directamente a http://localhost:4200/roles/68363012623d22aede6fe4d7 (ID del rol Admin)
2. Observar que se carga la página con el modal de edición abierto
3. Modificar el nombre del rol
4. Hacer clic en "Update"

**Resultados Esperados:**
- La URL carga correctamente la página de roles con el modal de edición abierto
- Los datos del rol se cargan correctamente
- La actualización funciona normalmente
- Después de actualizar, vuelve a la lista de roles

---

### 3. Eliminación de Roles

**Seed:** `tests/seed.spec.ts`

#### 3.1 Eliminar Rol Individual
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Crear un nuevo rol de prueba llamado "Role To Delete"
3. Localizar el rol en la tabla
4. Hacer clic en el botón "Delete" del rol
5. Confirmar la eliminación en el diálogo de confirmación (si existe)

**Resultados Esperados:**
- Aparece un diálogo de confirmación
- Al confirmar, el rol se elimina de la tabla
- Se muestra notificación de éxito
- El contador total de roles disminuye en 1

#### 3.2 Eliminar Rol Individual - Cancelar Confirmación
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Hacer clic en el botón "Delete" de cualquier rol
3. En el diálogo de confirmación, hacer clic en "Cancel" o "No"

**Resultados Esperados:**
- El diálogo se cierra
- El rol NO se elimina
- El rol permanece en la tabla
- No se muestra notificación de eliminación

#### 3.3 Eliminar Múltiples Roles - Selección Manual
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Seleccionar el checkbox de 3 roles diferentes
3. Verificar que aparece la barra de selección con "Selected (3):"
4. Hacer clic en el botón "Delete Selected"
5. Confirmar la eliminación en el diálogo

**Resultados Esperados:**
- Los 3 roles seleccionados se eliminan de la tabla
- Se muestra notificación de éxito con el número de roles eliminados
- La barra de selección desaparece
- El contador total se reduce en 3

#### 3.4 Eliminar Múltiples Roles - Seleccionar Todos
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Hacer clic en el checkbox "Select all" en el encabezado de la tabla
3. Verificar que todos los roles de la página actual están seleccionados
4. Observar la barra de selección mostrando "Selected (10):"
5. Hacer clic en el botón "Delete Selected"
6. Confirmar la eliminación

**Resultados Esperados:**
- Los 10 roles de la página actual se eliminan
- Se muestra notificación de éxito
- La tabla muestra los siguientes 10 roles (página 2 se convierte en página 1)
- El contador total disminuye en 10

#### 3.5 Eliminar Roles - Cancelar Eliminación Múltiple
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Seleccionar 5 roles usando los checkboxes
3. Hacer clic en "Delete Selected"
4. En el diálogo de confirmación, hacer clic en "Cancel"

**Resultados Esperados:**
- El diálogo se cierra
- Ningún rol se elimina
- Los 5 roles permanecen seleccionados en la tabla
- La barra de selección sigue mostrando "Selected (5):"

#### 3.6 Eliminar Rol Predefinido Importante
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Intentar eliminar el rol "Admin"
3. Hacer clic en el botón "Delete"

**Resultados Esperados:**
- Se muestra un mensaje de advertencia indicando que el rol es crítico del sistema
- El sistema puede impedir la eliminación de roles predefinidos importantes
- O se muestra una advertencia clara sobre las consecuencias

#### 3.7 Eliminar Rol con Usuarios Asignados
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Intentar eliminar un rol que está asignado a usuarios activos
3. Confirmar la eliminación

**Resultados Esperados:**
- Se muestra un mensaje de error indicando que el rol está en uso
- No se permite la eliminación mientras haya usuarios con ese rol
- O se ofrece reasignar los usuarios a otro rol antes de eliminar

#### 3.8 Limpiar Selección de Roles
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Seleccionar múltiples roles (ej: 5 roles)
3. Verificar que aparece la barra de selección
4. Hacer clic en el botón "Clear all"

**Resultados Esperados:**
- Todos los checkboxes se desmarcan
- La barra de selección desaparece
- El botón "Delete Selected" ya no está disponible
- Ningún rol se elimina

#### 3.9 Deseleccionar Roles Individualmente
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Hacer clic en "Select all" para seleccionar todos los roles de la página
3. Hacer clic en el botón "Remove X from selection" en uno de los chips de la barra de selección
4. Observar el cambio

**Resultados Esperados:**
- Solo el rol seleccionado se desmarca
- Los demás roles permanecen seleccionados
- El contador de selección disminuye en 1 (ej: "Selected (9):")
- El chip del rol eliminado desaparece de la barra

#### 3.10 Seleccionar y Deseleccionar Todos
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Hacer clic en el checkbox "Select all"
3. Verificar que todos los roles están seleccionados
4. Hacer clic nuevamente en el checkbox "Select all"

**Resultados Esperados:**
- Primera vez: todos los roles se seleccionan
- Segunda vez: todos los roles se deseleccionan
- La barra de selección aparece y desaparece según corresponda

---

### 4. Búsqueda y Filtrado de Roles

**Seed:** `tests/seed.spec.ts`

#### 4.1 Búsqueda por Nombre de Rol - Coincidencia Exacta
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. En el campo "Search...", ingresar "Admin"
3. Observar los resultados

**Resultados Esperados:**
- La tabla se actualiza en tiempo real
- Se muestran solo roles que contienen "Admin" en su nombre
- Ejemplos: "Admin", "Administrador de Finanzas", "AdminRole 1763863713593"
- El contador de resultados se actualiza

#### 4.2 Búsqueda por Nombre - Coincidencia Parcial
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. En el campo "Search...", ingresar "Role"
3. Observar los resultados

**Resultados Esperados:**
- Se muestran todos los roles que contienen "Role" en su nombre
- Ejemplos: "BulkRole1", "Test Role", "Editor Role"
- Los roles sin "Role" en el nombre quedan ocultos

#### 4.3 Búsqueda por ID de Rol
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Tomar nota del ID de un rol específico (ej: "68363012623d22aede6fe4d7")
3. En el campo "Search...", ingresar ese ID completo o parcial
4. Observar los resultados

**Resultados Esperados:**
- La búsqueda filtra por ID también
- Se muestra(n) el/los rol(es) con ID coincidente
- La búsqueda es sensible a mayúsculas/minúsculas según configuración

#### 4.4 Búsqueda sin Resultados
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. En el campo "Search...", ingresar "XYZNoExiste123"
3. Observar los resultados

**Resultados Esperados:**
- La tabla queda vacía
- Se muestra un mensaje indicando "No se encontraron resultados" o similar
- El contador muestra "Showing 0 of 138" o similar

#### 4.5 Búsqueda - Limpiar Campo de Búsqueda
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Ingresar "Admin" en el campo de búsqueda
3. Verificar que la tabla se filtró
4. Borrar el texto del campo de búsqueda

**Resultados Esperados:**
- Al borrar el texto, la tabla vuelve a mostrar todos los roles
- Se restaura la visualización completa
- El contador vuelve al total original

#### 4.6 Búsqueda Case-Insensitive
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Ingresar "admin" (en minúsculas) en el campo de búsqueda
3. Observar los resultados

**Resultados Esperados:**
- La búsqueda encuentra roles independientemente de mayúsculas/minúsculas
- Se muestra "Admin", "AdminRole", "Administrador de Finanzas"
- Funciona igual que buscar "Admin", "ADMIN", o "aDmIn"

#### 4.7 Búsqueda con Caracteres Especiales
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Ingresar "Role-1" o caracteres especiales en la búsqueda
3. Observar los resultados

**Resultados Esperados:**
- La búsqueda maneja correctamente caracteres especiales
- No se producen errores
- Muestra roles que coincidan con el patrón

#### 4.8 Búsqueda y Paginación
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Ingresar una búsqueda que devuelva más de 10 resultados
3. Verificar que aparecen botones de paginación
4. Navegar entre las páginas de resultados de búsqueda

**Resultados Esperados:**
- Los resultados de búsqueda se paginan correctamente
- Se puede navegar entre páginas de resultados filtrados
- El contador muestra el total de resultados filtrados

#### 4.9 Búsqueda y Selección Múltiple
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Realizar una búsqueda (ej: "Admin")
3. Hacer clic en "Select all"
4. Verificar qué roles se seleccionan

**Resultados Esperados:**
- Solo se seleccionan los roles visibles de los resultados de búsqueda
- La barra de selección muestra el número correcto de roles seleccionados
- Los roles no visibles (fuera del filtro) no se seleccionan

#### 4.10 Búsqueda y Ordenamiento Combinados
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Realizar una búsqueda (ej: "Role")
3. Hacer clic en el botón "Name" para ordenar los resultados
4. Observar el ordenamiento de los resultados filtrados

**Resultados Esperados:**
- Los resultados filtrados se ordenan correctamente
- El ordenamiento solo afecta a los resultados visibles de la búsqueda
- El icono de ordenamiento aparece en la columna

---

### 5. Ordenamiento de Roles

**Seed:** `tests/seed.spec.ts`

#### 5.1 Ordenar por Nombre - Orden Ascendente
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Hacer clic en el botón "Name" en el encabezado de la tabla
3. Observar el orden de los roles

**Resultados Esperados:**
- Los roles se ordenan alfabéticamente de A-Z
- Aparece un icono de flecha hacia arriba junto a "Name"
- El primer rol debe ser el que empiece con la letra más temprana del alfabeto
- Ejemplo: "ActionSearch1", "Admin", "AdminRole", etc.

#### 5.2 Ordenar por Nombre - Orden Descendente
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Hacer clic en el botón "Name" dos veces
3. Observar el orden de los roles

**Resultados Esperados:**
- Los roles se ordenan alfabéticamente de Z-A
- Aparece un icono de flecha hacia abajo junto a "Name"
- El primer rol debe ser el que empiece con la letra más tardía del alfabeto
- Ejemplo: "ViewerRole", "UserRole", "Test Role", etc.

#### 5.3 Ordenar por ID - Orden Ascendente
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Hacer clic en el botón "ID" en el encabezado de la tabla
3. Observar el orden de los roles

**Resultados Esperados:**
- Los roles se ordenan por ID de menor a mayor
- Aparece un icono indicando el orden ascendente
- Los IDs más antiguos/pequeños aparecen primero

#### 5.4 Ordenar por ID - Orden Descendente
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Hacer clic en el botón "ID" dos veces
3. Observar el orden de los roles

**Resultados Esperados:**
- Los roles se ordenan por ID de mayor a menor
- Los roles más recientes (IDs más grandes) aparecen primero
- Aparece un icono indicando el orden descendente

#### 5.5 Cambiar Entre Ordenamientos de Diferentes Columnas
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Hacer clic en el botón "Name" para ordenar por nombre
3. Hacer clic en el botón "ID" para ordenar por ID
4. Observar el cambio

**Resultados Esperados:**
- El ordenamiento cambia de nombre a ID
- El icono de ordenamiento se mueve de la columna "Name" a "ID"
- La columna "Name" pierde su indicador de ordenamiento
- Los roles se reordenan según el ID

#### 5.6 Ordenamiento con Paginación
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Ordenar por "Name" ascendente
3. Navegar a la página 2
4. Verificar que el ordenamiento se mantiene

**Resultados Esperados:**
- El ordenamiento se mantiene al cambiar de página
- Los roles de la página 2 continúan el orden alfabético de la página 1
- El indicador de ordenamiento permanece visible

#### 5.7 Ordenamiento después de Búsqueda
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Realizar una búsqueda (ej: "Admin")
3. Ordenar los resultados por "Name"
4. Observar el orden de los resultados filtrados

**Resultados Esperados:**
- Solo los resultados de la búsqueda se ordenan
- El ordenamiento funciona correctamente sobre el conjunto filtrado
- Los roles no visibles no afectan el ordenamiento

#### 5.8 Ordenamiento después de Crear Nuevo Rol
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Ordenar la tabla por "Name" ascendente
3. Crear un nuevo rol con nombre "AAA Test Role" (que debería aparecer primero)
4. Observar dónde aparece el nuevo rol

**Resultados Esperados:**
- El nuevo rol aparece en la posición correcta según el ordenamiento actual
- Si está ordenado A-Z, "AAA Test Role" aparece primero o cerca del principio
- El ordenamiento se mantiene activo

#### 5.9 Volver al Orden Original
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Ordenar por "Name" ascendente
3. Hacer clic 3 veces en el botón "Name" o buscar forma de resetear

**Resultados Esperados:**
- Según implementación, puede volver al orden original (por creación)
- O puede alternar entre ascendente/descendente indefinidamente
- El comportamiento debe ser consistente

#### 5.10 Ordenamiento y Selección Múltiple
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Seleccionar 3 roles específicos
3. Ordenar la tabla por "Name"
4. Verificar que los roles seleccionados se mantienen

**Resultados Esperados:**
- Los roles seleccionados permanecen seleccionados después del reordenamiento
- Los checkboxes de los roles seleccionados siguen marcados
- La barra de selección muestra los mismos roles

---

### 6. Paginación de Roles

**Seed:** `tests/seed.spec.ts`

#### 6.1 Navegar a la Siguiente Página
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Verificar que se muestran los primeros 10 roles (1-10)
3. Hacer clic en el botón "Next"
4. Observar los roles mostrados

**Resultados Esperados:**
- Se muestran los roles 11-20
- El texto cambia a "Showing 11-20 of 138"
- El botón "Previous" se habilita
- Los roles son diferentes a los de la página anterior

#### 6.2 Navegar a la Página Anterior
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Hacer clic en "Next" para ir a la página 2
3. Hacer clic en el botón "Previous"
4. Observar los roles mostrados

**Resultados Esperados:**
- Se muestran nuevamente los roles 1-10
- El texto vuelve a "Showing 1-10 of 138"
- El botón "Previous" se deshabilita
- El botón "Next" permanece habilitado

#### 6.3 Botón Previous Deshabilitado en Primera Página
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Verificar el estado del botón "Previous"

**Resultados Esperados:**
- El botón "Previous" está deshabilitado (atributo disabled)
- No se puede hacer clic en él
- Tiene apariencia visual de deshabilitado

#### 6.4 Botón Next Deshabilitado en Última Página
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Hacer clic en "Next" repetidamente hasta llegar a la última página
3. Verificar el estado del botón "Next"

**Resultados Esperados:**
- El botón "Next" se deshabilita en la última página
- Se muestra "Showing 131-138 of 138" (o similar según el total)
- No se pueden mostrar más roles

#### 6.5 Contador de Registros Actualizado
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Observar el texto "Showing 1-10 of 138"
3. Navegar entre varias páginas
4. Verificar que el contador se actualiza

**Resultados Esperados:**
- Página 1: "Showing 1-10 of 138"
- Página 2: "Showing 11-20 of 138"
- Página 3: "Showing 21-30 of 138"
- Última página: "Showing 131-138 of 138"

#### 6.6 Paginación después de Crear Nuevo Rol
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Ir a la página 2 (roles 11-20)
3. Crear un nuevo rol
4. Observar en qué página aparece el nuevo rol

**Resultados Esperados:**
- Según implementación, puede volver a la página 1
- O puede permanecer en la página actual
- El contador total aumenta: "Showing X-Y of 139"
- El nuevo rol es visible en alguna página

#### 6.7 Paginación después de Eliminar Rol
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Ir a la página 2
3. Eliminar un rol de esa página
4. Observar el comportamiento

**Resultados Esperados:**
- El contador total disminuye en 1
- Si quedan menos de 10 roles en la página, se puede cargar uno de la siguiente página
- O puede quedar con 9 roles y ajustar en el siguiente cambio de página
- El contador se actualiza correctamente

#### 6.8 Paginación con Búsqueda Activa
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Realizar una búsqueda que devuelva más de 10 resultados (ej: buscar roles con "Role")
3. Observar el contador y botones de paginación
4. Navegar entre páginas de resultados

**Resultados Esperados:**
- El contador muestra el total de resultados filtrados (ej: "Showing 1-10 of 45")
- La paginación funciona sobre los resultados filtrados
- Al cambiar de página, la búsqueda se mantiene activa
- Los botones Previous/Next se habilitan/deshabilitan correctamente

#### 6.9 Paginación al Limpiar Búsqueda
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Realizar una búsqueda que devuelva resultados paginados
3. Navegar a la página 2 de los resultados
4. Limpiar el campo de búsqueda

**Resultados Esperados:**
- Vuelve a la página 1 de todos los roles
- O permanece en la página 2 de la lista completa
- El contador vuelve al total completo (138 roles)
- La paginación se ajusta al total de roles

#### 6.10 Persistencia de Paginación con Ordenamiento
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Ir a la página 3 (roles 21-30)
3. Ordenar por "Name"
4. Verificar en qué página queda

**Resultados Esperados:**
- Según implementación, puede volver a la página 1 con el nuevo ordenamiento
- O puede permanecer en la página 3 con roles diferentes (21-30 del orden nuevo)
- El comportamiento debe ser consistente y predecible

---

### 7. Interacciones Combinadas y Flujos Complejos

**Seed:** `tests/seed.spec.ts`

#### 7.1 Crear Rol, Buscarlo, Editarlo y Eliminarlo
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Crear un nuevo rol llamado "CompleteFlow Role"
3. En el campo de búsqueda, ingresar "CompleteFlow"
4. Hacer clic en "Edit" del rol encontrado
5. Cambiar el nombre a "CompleteFlow Updated"
6. Hacer clic en "Update"
7. Buscar nuevamente "CompleteFlow Updated"
8. Hacer clic en "Delete" y confirmar

**Resultados Esperados:**
- El rol se crea exitosamente
- La búsqueda encuentra el rol
- La edición actualiza el nombre
- La búsqueda encuentra el rol con el nuevo nombre
- La eliminación remueve el rol de la tabla
- El flujo completo funciona sin errores

#### 7.2 Selección Múltiple, Búsqueda y Eliminación
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Crear 5 roles nuevos con nombres similares: "Temp1", "Temp2", "Temp3", "Temp4", "Temp5"
3. En el campo de búsqueda, ingresar "Temp"
4. Hacer clic en "Select all" para seleccionar todos los resultados
5. Hacer clic en "Delete Selected"
6. Confirmar la eliminación

**Resultados Esperados:**
- Los 5 roles se crean exitosamente
- La búsqueda muestra solo estos 5 roles
- Se seleccionan los 5 roles
- La eliminación remueve los 5 roles
- La tabla vuelve a mostrar todos los roles restantes

#### 7.3 Ordenamiento, Paginación y Selección
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Ordenar por "Name" ascendente
3. Seleccionar los primeros 3 roles de la página 1
4. Navegar a la página 2
5. Seleccionar 2 roles más
6. Verificar la barra de selección

**Resultados Esperados:**
- Los roles se ordenan correctamente
- Las selecciones de la página 1 se mantienen al cambiar de página
- La barra de selección muestra "Selected (5):"
- Los 5 roles seleccionados aparecen en la barra sin importar su página

#### 7.4 Búsqueda, Selección Parcial y Limpieza
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Buscar "Admin"
3. Seleccionar 3 roles de los resultados
4. Limpiar el campo de búsqueda
5. Verificar qué roles siguen seleccionados

**Resultados Esperados:**
- La búsqueda filtra correctamente
- Los 3 roles se seleccionan
- Al limpiar la búsqueda, los 3 roles siguen seleccionados
- Los 3 roles aparecen marcados en sus posiciones en la tabla completa

#### 7.5 Crear Rol con Herencia Múltiple y Editar
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Crear un rol "MultiInherit" que herede de "Admin" y "Cobrador"
3. Editar el rol recién creado
4. Agregar herencia de "Administrador de Finanzas"
5. Agregar 5 permisos directos adicionales
6. Actualizar el rol

**Resultados Esperados:**
- El rol se crea con 2 herencias
- La edición muestra correctamente las 2 herencias previas
- Se agrega la tercera herencia exitosamente
- Los 5 permisos se agregan
- El rol tiene herencia de 3 roles + 5 permisos directos

#### 7.6 Eliminar Roles de Diferentes Páginas
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Seleccionar 2 roles de la página 1
3. Navegar a la página 2
4. Seleccionar 3 roles de la página 2
5. Hacer clic en "Delete Selected"
6. Confirmar

**Resultados Esperados:**
- Se pueden seleccionar roles de diferentes páginas
- La barra muestra "Selected (5):"
- Los 5 roles se eliminan correctamente sin importar su página de origen
- El sistema maneja correctamente la eliminación cross-página

#### 7.7 Búsqueda sin Resultados, Crear Rol Coincidente
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Buscar "UniqueTestRole123"
3. Verificar que no hay resultados
4. Con la búsqueda activa, crear un nuevo rol llamado "UniqueTestRole123"
5. Observar si aparece automáticamente en los resultados

**Resultados Esperados:**
- Inicialmente no hay resultados
- Al crear el rol, puede aparecer automáticamente en los resultados de búsqueda
- O puede requerir refrescar/relanzar la búsqueda
- El comportamiento debe ser consistente

#### 7.8 Editar Múltiples Roles Consecutivamente
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Editar el rol "Admin", cambiar un permiso, actualizar
3. Editar el rol "Cobrador", cambiar otro permiso, actualizar
4. Editar el rol "Administrador de Finanzas", cambiar otro permiso, actualizar
5. Verificar que todos los cambios se guardaron

**Resultados Esperados:**
- Cada edición se guarda correctamente
- Los cambios no se mezclan entre roles
- Cada rol mantiene sus cambios específicos
- No hay pérdida de datos entre ediciones

#### 7.9 Navegación por URL Directa y Regreso
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Aplicar filtros: búsqueda "Admin" + ordenar por Name + ir a página 2
3. Copiar un ID de rol y navegar a http://localhost:4200/roles/:id
4. Cerrar el modal o cancelar
5. Verificar si se mantienen los filtros previos

**Resultados Esperados:**
- La navegación por URL funciona correctamente
- Al volver a la lista, puede mantener los filtros (búsqueda, orden, página)
- O puede resetear a vista por defecto
- El comportamiento debe ser consistente

#### 7.10 Operaciones Masivas con Validaciones
**Pasos:**
1. Navegar a http://localhost:4200/roles
2. Seleccionar 10 roles incluyendo "Admin" (rol crítico)
3. Hacer clic en "Delete Selected"
4. Observar el comportamiento

**Resultados Esperados:**
- El sistema puede bloquear la eliminación si incluye roles críticos
- O puede mostrar una advertencia y permitir eliminar solo los no críticos
- O puede mostrar qué roles no se pueden eliminar y por qué
- Se debe proteger la integridad del sistema

---

## Permisos del Sistema

### Lista Completa de Permisos Disponibles

**Permisos Generales:**
- OnlyAuthenticatedUser (aparece múltiples veces en diferentes contextos)

**BorrowerController (Prestatarios):**
- BorrowerController_GetAllWithActiveLoans
- BorrowerController_GetByDniInformation
- BorrowerController_GetByIdWithActiveLoans
- BorrowerController_CreateBorrower
- BorrowerController_UpdateBorrower
- BorrowerController_DeleteBorrower

**CompanyController (Empresas):**
- CompanyController_GetAllCompanies
- CompanyController_GetCompanyById
- CompanyController_CreateCompany
- CompanyController_UpdateCompany
- CompanyController_DeleteCompany

**FileController (Archivos):**
- FileController_Upload

**LoanController (Préstamos):**
- LoanController_SaveLoan
- LoanController_DeleteLoan

**PaymentController (Pagos):**
- PaymentController_GetDetailed
- PaymentController_Pay (aparece múltiples veces)
- PaymentController_DeletePay

**ReportsController (Reportes):**
- ReportsController_ReportPaymentByDay
- ReportsController_ReportPaymentByLoan
- ReportsController_ReportLoansByClientId
- ReportsController_GeneratePaymentReceipt
- ReportsController_ReportNoPaymentClients

**UserController (Usuarios):**
- UserController_GetAllUsers
- UserController_SearchByIdOrDni
- UserController_SaveUser
- UserController_DeleteUserAsync
- UserController_GetAllRolesAsync
- UserController_SaveRole
- UserController_DeleteRoleAsync
- UserController_GetAllPermissionsAsync

**InOutBalanceController (Balance de Entradas/Salidas):**
- InOutBalanceController_GetByDate
- InOutBalanceController_SaveInOutBalance
- InOutBalanceController_DeleteInOutBalance

---

## Notas de Implementación

### Validaciones Identificadas
1. **Nombre de rol**: 2-40 caracteres, sin caracteres especiales
2. **Campos obligatorios**: Solo el nombre es obligatorio
3. **Roles heredados**: Opcionales, multiselección permitida
4. **Permisos**: Opcionales, multiselección permitida

### Comportamientos Observados
1. **Modal**: Se abre y cierra correctamente con botones y backdrop
2. **Búsqueda**: Filtrado en tiempo real mientras se escribe
3. **Selección múltiple**: Funciona con chips visuales mostrando roles seleccionados
4. **Paginación**: 10 registros por página, 138 roles totales en el sistema
5. **URL dinámica**: Soporta navegación directa a roles específicos por ID

### Consideraciones Especiales
1. **Roles predefinidos**: Admin, Cobrador, Administrador de Finanzas pueden tener protecciones especiales
2. **Herencia de permisos**: Un rol puede heredar de múltiples roles simultáneamente
3. **Permisos acumulativos**: Los permisos heredados se suman a los permisos directos
4. **Estado de sesión**: Los datos de roles se cargan con autenticación (token JWT visible en logs)

---

## Datos de Prueba Recomendados

### Roles de Prueba a Crear
1. **BasicRole**: Solo nombre, sin permisos ni herencia
2. **InheritedRole**: Con herencia de Admin
3. **PermissionsRole**: Con 5-10 permisos específicos
4. **CompleteRole**: Con herencia + permisos directos
5. **EdgeCaseRole**: Nombre de 40 caracteres exactos
6. **MinimalRole**: Nombre de 2 caracteres exactos

### Escenarios de Datos
- Rol con 1 herencia
- Rol con 3 herencias
- Rol con todos los permisos del sistema
- Rol sin permisos ni herencias (solo nombre)
- Múltiples roles con nombres similares para probar búsqueda

---

## Criterios de Aceptación Generales

### Funcionalidad
- Todos los botones deben responder correctamente
- Los modales deben abrir y cerrar sin errores
- Las validaciones deben prevenir datos inválidos
- Los mensajes de error deben ser claros y útiles

### Usabilidad
- La interfaz debe ser intuitiva y consistente
- Los tiempos de respuesta deben ser aceptables (<2 segundos)
- Los cambios deben reflejarse inmediatamente en la UI
- La navegación debe ser fluida entre páginas y modales

### Integridad de Datos
- No se deben perder datos durante operaciones
- Las relaciones de herencia deben mantenerse correctamente
- Los permisos deben asignarse y guardarse sin errores
- Las eliminaciones deben ser definitivas y confirmadas

### Manejo de Errores
- Errores de red deben mostrarse apropiadamente
- Validaciones del servidor deben comunicarse al usuario
- La aplicación no debe quedar en estado inconsistente
- Los errores no deben interrumpir otras funcionalidades

---

## Herramientas y Configuración

**URL Base:** http://localhost:4200/roles
**Framework:** Angular (visible en logs de consola)
**Autenticación:** JWT Token (visible en logs)
**Backend API:** Integrado con controladores REST
**Navegador:** Compatible con Chromium (Playwright)

**Archivos de Seed:**
- Ubicación recomendada: `tests/seed.spec.ts`
- Debe incluir autenticación previa
- Debe navegar a la página de roles
- Estado inicial: Usuario autenticado con permisos de administración

---

## Resumen de Cobertura de Pruebas

Este plan de pruebas cubre exhaustivamente:
- ✅ Creación de roles (12 escenarios)
- ✅ Edición de roles (10 escenarios)
- ✅ Eliminación de roles (10 escenarios)
- ✅ Búsqueda y filtrado (10 escenarios)
- ✅ Ordenamiento (10 escenarios)
- ✅ Paginación (10 escenarios)
- ✅ Flujos combinados (10 escenarios)

**Total: 72 escenarios de prueba documentados**

Cada escenario incluye:
- Pasos detallados paso a paso
- Resultados esperados verificables
- Condiciones iniciales claras
- Criterios de éxito/falla explícitos
