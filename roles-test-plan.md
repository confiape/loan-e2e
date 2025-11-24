# Roles Management Module - Comprehensive Test Plan

## Application Overview

The Roles Management module is a comprehensive role-based access control (RBAC) system within the Loan application. This module allows administrators to create, view, edit, and delete user roles with granular permission assignments. The system supports role inheritance, enabling roles to inherit permissions from other roles, facilitating a hierarchical permission structure.

### Key Features:
- **Role Management**: Full CRUD operations for roles
- **Permission Assignment**: Granular permission control across multiple system controllers
- **Role Inheritance**: Ability to inherit permissions from existing roles
- **Search Functionality**: Real-time search filtering by role name
- **Table Sorting**: Sortable columns (Name and ID) with ascending/descending order
- **Bulk Operations**: Multi-select with bulk delete capability
- **Modal-based Forms**: Create and edit operations use modal dialogs
- **Confirmation Dialogs**: Safety confirmations for delete operations
- **Validation**: Client-side validation for role names and required fields

### Technical Details:
- **URL**: `http://localhost:4200/roles`
- **Edit URL Pattern**: `http://localhost:4200/roles/{roleId}`
- **Current Test Data**: 3 pre-existing roles (Admin, Cobrador, Administrador de Finanzas)
- **Permission Types**: 40+ permissions across 9 controllers (Borrower, Company, File, Loan, Payment, Reports, User, InOutBalance, and authenticated user permissions)

---

## Test Scenarios

### 1. Role Listing and Display

**Seed:** `tests/seed.spec.ts`

#### 1.1 View Roles List
**Steps:**
1. Navigate to the application at `http://localhost:4200/home`
2. Click on the "Roles" menu item in the sidebar navigation

**Expected Results:**
- URL changes to `http://localhost:4200/roles`
- Page displays "Roles" heading
- Table shows columns: Select all checkbox, Name, ID, Actions
- All existing roles are displayed with their respective data
- Each row shows: checkbox, role name, role ID, Edit button, Delete button
- "New Role" button is visible at the top

#### 1.2 Verify Table Structure
**Steps:**
1. Navigate to Roles section
2. Observe the table header and data rows

**Expected Results:**
- Table header contains: "Select all" checkbox, "Name" (sortable), "ID" (sortable), "Actions"
- Each data row contains: individual checkbox, role name as row header, role ID (MongoDB ObjectId format), Edit and Delete action buttons
- Table is responsive and properly formatted

#### 1.3 Verify Initial Data State
**Steps:**
1. Navigate to Roles section
2. Count the number of roles displayed
3. Verify role names and IDs

**Expected Results:**
- At least 3 roles are displayed: Admin, Cobrador, Administrador de Finanzas
- Each role has a unique ID in the format: 24-character hexadecimal string
- No pagination controls visible (fewer than page size limit)

---

### 2. Role Creation

**Seed:** `tests/seed.spec.ts`

#### 2.1 Open Create Role Modal
**Steps:**
1. Navigate to Roles section
2. Click the "New Role" button

**Expected Results:**
- Modal dialog opens with title "New Role"
- Modal contains three form sections:
  - Role Name: Text input with placeholder "Enter role name"
  - Inherited Roles: Dropdown/multiselect button labeled "Select inherited roles"
  - Permissions: Dropdown/multiselect button labeled "Select permissions"
- Help text displays under each field explaining requirements
- "Cancel" and "Create" buttons are present at bottom
- "Create" button is initially disabled
- Modal has a close button (X) in the top right corner

#### 2.2 Create Role with Valid Data
**Steps:**
1. Click "New Role" button
2. Enter "Test Manager" in Role Name field
3. Click "Inherited Roles" dropdown
4. Select "Admin" from the list
5. Click outside dropdown to close it
6. Click "Permissions" dropdown
7. Select "UserController_GetAllUsers" permission
8. Select "UserController_SaveUser" permission
9. Click outside dropdown to close it
10. Click "Create" button

**Expected Results:**
- Role Name accepts the input without errors
- Inherited Roles dropdown opens showing all available roles with checkboxes
- Selected role "Admin" is checked
- Permissions dropdown opens showing all 40+ permissions with checkboxes
- Selected permissions are checked
- "Create" button becomes enabled after entering role name
- Upon clicking "Create", modal closes
- New role appears in the table
- Success notification/toast message displays (if implemented)
- Role is persisted to the database

#### 2.3 Create Role with Minimum Valid Data
**Steps:**
1. Click "New Role" button
2. Enter "Basic Role" in Role Name field (only required field)
3. Leave Inherited Roles empty
4. Leave Permissions empty
5. Click "Create" button

**Expected Results:**
- "Create" button becomes enabled after entering role name
- Role is created successfully with no inherited roles or permissions
- New role appears in the table
- Modal closes after successful creation

#### 2.4 Validate Role Name - Empty Field
**Steps:**
1. Click "New Role" button
2. Leave Role Name field empty
3. Attempt to click "Create" button

**Expected Results:**
- "Create" button remains disabled
- Cannot proceed with role creation
- Validation message may appear indicating required field

#### 2.5 Validate Role Name - Too Short (Less than 2 characters)
**Steps:**
1. Click "New Role" button
2. Enter "A" (1 character) in Role Name field
3. Click or tab out of the field

**Expected Results:**
- Validation error appears: "Role name must be between 2-40 characters with no special characters"
- "Create" button remains disabled or error prevents submission
- Field may be highlighted with error styling

#### 2.6 Validate Role Name - Too Long (More than 40 characters)
**Steps:**
1. Click "New Role" button
2. Enter "ThisIsAVeryLongRoleNameThatExceedsFortyCharactersInLength" (more than 40 characters) in Role Name field
3. Click or tab out of the field

**Expected Results:**
- Validation error appears: "Role name must be between 2-40 characters with no special characters"
- Field may truncate input or prevent entry beyond 40 characters
- "Create" button remains disabled or error prevents submission
- Field may be highlighted with error styling

#### 2.7 Validate Role Name - Special Characters
**Steps:**
1. Click "New Role" button
2. Enter "Test@Role#123!" in Role Name field
3. Click or tab out of the field

**Expected Results:**
- Validation error appears: "Role name must be between 2-40 characters with no special characters"
- Error message indicates special characters are not allowed
- "Create" button remains disabled or error prevents submission

#### 2.8 Validate Role Name - Valid Boundary (Exactly 2 characters)
**Steps:**
1. Click "New Role" button
2. Enter "IT" in Role Name field
3. Observe validation state

**Expected Results:**
- No validation error appears
- "Create" button becomes enabled
- Field accepts the input

#### 2.9 Validate Role Name - Valid Boundary (Exactly 40 characters)
**Steps:**
1. Click "New Role" button
2. Enter a 40-character role name (e.g., "Administration and Management Personnel")
3. Observe validation state

**Expected Results:**
- No validation error appears
- "Create" button becomes enabled
- Field accepts the input

#### 2.10 Create Role with Multiple Inherited Roles
**Steps:**
1. Click "New Role" button
2. Enter "Super Manager" in Role Name field
3. Click "Inherited Roles" dropdown
4. Select "Admin" checkbox
5. Select "Cobrador" checkbox
6. Select "Administrador de Finanzas" checkbox
7. Click outside to close dropdown
8. Observe dropdown button text
9. Click "Create" button

**Expected Results:**
- Dropdown allows multiple selections
- All selected roles are checked
- Dropdown button may show count or truncated list of selected roles
- Role is created successfully with all inherited roles
- New role inherits permissions from all selected roles

#### 2.11 Create Role with Multiple Permissions
**Steps:**
1. Click "New Role" button
2. Enter "Reports Manager" in Role Name field
3. Click "Permissions" dropdown
4. Select all "ReportsController_*" permissions (5+ permissions)
5. Click outside to close dropdown
6. Observe dropdown button text
7. Click "Create" button

**Expected Results:**
- Dropdown allows multiple permission selections
- All selected permissions are checked
- Dropdown button shows truncated list or count of selected permissions
- Role is created successfully with all selected permissions

#### 2.12 Search Inherited Roles in Dropdown
**Steps:**
1. Click "New Role" button
2. Click "Inherited Roles" dropdown
3. Type "Admin" in the search box within dropdown

**Expected Results:**
- Search box filters the role list in real-time
- Only roles containing "Admin" are displayed (Admin, Administrador de Finanzas)
- "Cobrador" role is hidden
- Search is case-insensitive

#### 2.13 Search Permissions in Dropdown
**Steps:**
1. Click "New Role" button
2. Click "Permissions" dropdown
3. Type "Loan" in the search box within dropdown

**Expected Results:**
- Search box filters the permissions list in real-time
- Only permissions containing "Loan" are displayed
- Other permissions are hidden
- Search is case-insensitive

#### 2.14 Cancel Role Creation
**Steps:**
1. Click "New Role" button
2. Enter "Cancelled Role" in Role Name field
3. Select some inherited roles and permissions
4. Click "Cancel" button

**Expected Results:**
- Modal closes immediately
- No role is created
- No data is saved
- User returns to roles list
- Table shows original roles only

#### 2.15 Close Modal Using X Button
**Steps:**
1. Click "New Role" button
2. Enter some data in the form
3. Click the X (close) button in the top right of modal

**Expected Results:**
- Modal closes immediately
- No role is created
- User returns to roles list

#### 2.16 Close Modal Using Backdrop Click
**Steps:**
1. Click "New Role" button
2. Enter some data in the form
3. Click on the dark backdrop area outside the modal

**Expected Results:**
- Modal closes immediately
- No role is created
- User returns to roles list

#### 2.17 Create Duplicate Role Name
**Steps:**
1. Click "New Role" button
2. Enter "Admin" (existing role name) in Role Name field
3. Click "Create" button

**Expected Results:**
- Error message appears indicating duplicate role name
- Role is not created
- Modal remains open with error message
- User can correct the name or cancel

---

### 3. Role Editing

**Seed:** `tests/seed.spec.ts`

#### 3.1 Open Edit Role Modal
**Steps:**
1. Navigate to Roles section
2. Click the "Edit" button for the "Admin" role

**Expected Results:**
- Modal dialog opens with title "Edit Role"
- URL changes to `http://localhost:4200/roles/68363012623d22aede6fe4d7` (or current Admin role ID)
- Role Name field is pre-filled with "Admin"
- Inherited Roles dropdown button shows current inherited roles (may be empty)
- Permissions dropdown button shows list of current permissions (40+ for Admin)
- "Cancel" and "Update" buttons are present
- "Update" button is enabled (since data is already valid)

#### 3.2 Edit Role Name
**Steps:**
1. Click "Edit" button for "Cobrador" role
2. Change Role Name from "Cobrador" to "Collection Agent"
3. Click "Update" button

**Expected Results:**
- Role name updates successfully
- Modal closes
- Table reflects the new name "Collection Agent"
- URL returns to `/roles`
- Success notification displays (if implemented)
- Role ID remains unchanged

#### 3.3 Add Inherited Roles to Existing Role
**Steps:**
1. Click "Edit" button for "Cobrador" role
2. Click "Inherited Roles" dropdown
3. Select "Admin" role
4. Click outside to close dropdown
5. Click "Update" button

**Expected Results:**
- Inherited role is added successfully
- Modal closes
- Role now inherits all permissions from Admin
- Changes are persisted

#### 3.4 Remove Inherited Roles from Existing Role
**Steps:**
1. Edit a role that has inherited roles
2. Click "Inherited Roles" dropdown
3. Uncheck a previously selected role
4. Click outside to close dropdown
5. Click "Update" button

**Expected Results:**
- Inherited role is removed successfully
- Role no longer inherits permissions from that role
- Changes are persisted

#### 3.5 Add Permissions to Existing Role
**Steps:**
1. Click "Edit" button for "Cobrador" role
2. Click "Permissions" dropdown
3. Select additional permissions (e.g., "UserController_GetAllUsers")
4. Click outside to close dropdown
5. Click "Update" button

**Expected Results:**
- New permissions are added successfully
- Role now has the additional permissions
- Previously assigned permissions are retained
- Changes are persisted

#### 3.6 Remove Permissions from Existing Role
**Steps:**
1. Edit a role with multiple permissions (e.g., "Admin")
2. Click "Permissions" dropdown
3. Uncheck some previously selected permissions
4. Click outside to close dropdown
5. Click "Update" button

**Expected Results:**
- Selected permissions are removed successfully
- Remaining permissions are retained
- Changes are persisted

#### 3.7 Edit Role with Invalid Name
**Steps:**
1. Click "Edit" button for any role
2. Clear the Role Name field or enter invalid data (e.g., "@#$%")
3. Attempt to click "Update" button

**Expected Results:**
- Validation error appears
- "Update" button is disabled or error prevents submission
- Cannot save with invalid data

#### 3.8 Cancel Edit Operation
**Steps:**
1. Click "Edit" button for any role
2. Modify the role name and permissions
3. Click "Cancel" button

**Expected Results:**
- Modal closes immediately
- No changes are saved
- URL returns to `/roles`
- Table shows original role data

#### 3.9 Edit Role and Verify Data Persistence
**Steps:**
1. Click "Edit" button for "Cobrador" role
2. Change role name to "Collector"
3. Click "Update" button
4. Refresh the browser page
5. Verify the role name in the table

**Expected Results:**
- Role name remains "Collector" after refresh
- Changes are persisted in the database
- All other role data remains intact

#### 3.10 Edit Multiple Roles in Sequence
**Steps:**
1. Edit "Admin" role, change something, click "Update"
2. Edit "Cobrador" role, change something, click "Update"
3. Edit "Administrador de Finanzas" role, change something, click "Update"
4. Verify all changes are reflected in the table

**Expected Results:**
- Each role updates independently and successfully
- No conflicts between sequential edits
- All changes are reflected correctly in the table
- No data is lost or corrupted

---

### 4. Role Deletion

**Seed:** `tests/seed.spec.ts`

#### 4.1 Delete Single Role - Confirm
**Steps:**
1. Navigate to Roles section
2. Click the "Delete" button for "Cobrador" role
3. Observe the confirmation modal
4. Click "Delete" button in the confirmation modal

**Expected Results:**
- Confirmation modal appears with:
  - Title: "Confirm Delete"
  - Message: "Are you sure you want to delete **Cobrador**? This action cannot be undone."
  - Warning icon
  - "Cancel" and "Delete" buttons
- Upon clicking "Delete":
  - Modal closes
  - Role is removed from the table
  - Success notification appears (if implemented)
  - Role is permanently deleted from database
  - Remaining roles are still displayed

#### 4.2 Delete Single Role - Cancel
**Steps:**
1. Navigate to Roles section
2. Click the "Delete" button for any role
3. Observe the confirmation modal
4. Click "Cancel" button

**Expected Results:**
- Confirmation modal closes
- Role is NOT deleted
- Role remains in the table
- No changes to the database

#### 4.3 Close Delete Confirmation Modal
**Steps:**
1. Click "Delete" button for any role
2. Click the X (close) button on the confirmation modal

**Expected Results:**
- Modal closes
- Role is NOT deleted
- User returns to roles list

#### 4.4 Delete Role and Verify Removal
**Steps:**
1. Note the total number of roles (e.g., 3)
2. Delete "Cobrador" role and confirm
3. Count the roles in the table
4. Refresh the browser page
5. Verify "Cobrador" is not in the list

**Expected Results:**
- Role count decreases by 1 (from 3 to 2)
- "Cobrador" role is not visible in the table
- After refresh, "Cobrador" is still absent
- Deletion is permanent

#### 4.5 Attempt to Delete Critical System Role
**Steps:**
1. Attempt to delete the "Admin" role
2. Observe system behavior

**Expected Results:**
- System may prevent deletion with error message if Admin is protected
- OR confirmation modal appears with stronger warning
- OR deletion proceeds if no protection is implemented
- *Note: Document actual behavior*

#### 4.6 Delete Last Remaining Role
**Steps:**
1. Delete all roles except one
2. Attempt to delete the last role

**Expected Results:**
- System may prevent deletion to ensure at least one role exists
- OR deletion proceeds if no such restriction exists
- *Note: Document actual behavior*

---

### 5. Bulk Selection Operations

**Seed:** `tests/seed.spec.ts`

#### 5.1 Select Single Role
**Steps:**
1. Navigate to Roles section
2. Click the checkbox for "Admin" role

**Expected Results:**
- Checkbox becomes checked
- Selection bar appears above the table showing:
  - "Selected (1):"
  - Chip/tag with "Admin" and a remove (X) button
  - "Clear all" button
  - "Delete Selected" button
- "Select all" checkbox in header shows indeterminate/mixed state
- Row may be highlighted to indicate selection

#### 5.2 Select Multiple Roles Individually
**Steps:**
1. Navigate to Roles section
2. Click checkbox for "Admin" role
3. Click checkbox for "Cobrador" role
4. Click checkbox for "Administrador de Finanzas" role

**Expected Results:**
- All three checkboxes become checked
- Selection bar shows "Selected (3):"
- Three chips displayed: "Admin", "Cobrador", "Administrador de Finanzas"
- Each chip has a remove button
- "Select all" checkbox becomes fully checked
- "Delete Selected" button is enabled

#### 5.3 Select All Roles Using Header Checkbox
**Steps:**
1. Navigate to Roles section
2. Click the "Select all" checkbox in the table header

**Expected Results:**
- All role checkboxes become checked
- Selection bar shows "Selected (3):" (or total count)
- All role names appear as chips in selection bar
- "Select all" checkbox is fully checked
- "Delete Selected" button is enabled

#### 5.4 Deselect Single Role from Selection
**Steps:**
1. Select all roles using "Select all" checkbox
2. Click the checkbox for "Cobrador" to deselect it

**Expected Results:**
- "Cobrador" checkbox becomes unchecked
- Selection bar shows "Selected (2):"
- "Cobrador" chip is removed from selection bar
- "Select all" checkbox changes to indeterminate/mixed state
- Other selections remain intact

#### 5.5 Remove Role Using Chip X Button
**Steps:**
1. Select multiple roles
2. Click the X button on the "Admin" chip in the selection bar

**Expected Results:**
- "Admin" checkbox becomes unchecked
- "Admin" chip is removed from selection bar
- Selection count decreases by 1
- Other selections remain intact

#### 5.6 Clear All Selections
**Steps:**
1. Select multiple roles (at least 2)
2. Click the "Clear all" button in the selection bar

**Expected Results:**
- All checkboxes become unchecked
- Selection bar disappears
- "Select all" checkbox becomes unchecked
- Table returns to normal state

#### 5.7 Deselect All Using Select All Checkbox
**Steps:**
1. Select all roles using "Select all" checkbox
2. Click the "Select all" checkbox again

**Expected Results:**
- All checkboxes become unchecked
- Selection bar disappears
- Table returns to normal state

#### 5.8 Bulk Delete Selected Roles
**Steps:**
1. Select "Cobrador" and "Administrador de Finanzas" roles (2 roles)
2. Click "Delete Selected" button
3. Observe confirmation modal
4. Confirm deletion

**Expected Results:**
- Confirmation modal appears asking to confirm deletion of 2 roles
- Lists the role names being deleted
- Upon confirmation:
  - Both roles are deleted
  - Roles are removed from table
  - Selection bar disappears
  - Success notification appears
  - Remaining roles are still displayed

#### 5.9 Bulk Delete - Cancel
**Steps:**
1. Select multiple roles
2. Click "Delete Selected" button
3. Click "Cancel" in confirmation modal

**Expected Results:**
- Modal closes
- No roles are deleted
- Selections remain intact
- Selection bar still shows selected roles

#### 5.10 Select Roles Then Search (Filter Behavior)
**Steps:**
1. Select "Admin" and "Cobrador" roles
2. Enter "Admin" in the search box

**Expected Results:**
- Table filters to show only roles containing "Admin"
- Selection bar still shows both selections or adjusts based on implementation
- *Note: Document actual behavior - selections may persist or clear*

---

### 6. Search and Filtering

**Seed:** `tests/seed.spec.ts`

#### 6.1 Search by Exact Role Name
**Steps:**
1. Navigate to Roles section
2. Enter "Admin" in the search box

**Expected Results:**
- Table filters immediately to show only "Admin" role
- Other roles ("Cobrador", "Administrador de Finanzas") are hidden
- Search is case-insensitive
- Table shows 1 result

#### 6.2 Search by Partial Role Name
**Steps:**
1. Navigate to Roles section
2. Enter "Admin" in the search box

**Expected Results:**
- Table shows roles containing "Admin": "Admin" and "Administrador de Finanzas"
- "Cobrador" role is hidden
- Table shows 2 results
- Partial matches are highlighted (if implemented)

#### 6.3 Search with No Results
**Steps:**
1. Navigate to Roles section
2. Enter "NonExistentRole" in the search box

**Expected Results:**
- Table shows no results
- Empty state message appears (e.g., "No roles found")
- OR table is empty with headers still visible
- Search box retains the entered text

#### 6.4 Search is Case-Insensitive
**Steps:**
1. Navigate to Roles section
2. Enter "admin" (lowercase) in the search box

**Expected Results:**
- Table shows "Admin" and "Administrador de Finanzas" (both contain "admin")
- Search is case-insensitive
- Results are the same as searching "Admin"

#### 6.5 Clear Search Filter
**Steps:**
1. Enter "Admin" in search box
2. Clear the search box (delete all text)

**Expected Results:**
- Table immediately shows all roles again
- All 3 original roles are displayed
- No filters are applied

#### 6.6 Search by Role ID
**Steps:**
1. Navigate to Roles section
2. Enter a role ID (e.g., "68363012623d22aede6fe4d7") in the search box

**Expected Results:**
- Table filters to show only the role with that ID
- OR search only applies to role names (document actual behavior)
- *Note: Verify if ID search is supported*

#### 6.7 Search with Special Characters
**Steps:**
1. Navigate to Roles section
2. Enter "@#$%" in the search box

**Expected Results:**
- Table shows no results (assuming no role names contain these characters)
- No errors occur
- Search handles special characters gracefully

#### 6.8 Search Real-time Filtering
**Steps:**
1. Navigate to Roles section
2. Slowly type "Adm" character by character in search box
3. Observe table updates

**Expected Results:**
- After "A": Table may show filtered results or all roles
- After "Ad": Table shows filtered results
- After "Adm": Table shows "Admin" and "Administrador de Finanzas"
- Filtering happens in real-time with each keystroke
- No search button required

#### 6.9 Search with Leading/Trailing Spaces
**Steps:**
1. Navigate to Roles section
2. Enter "  Admin  " (with leading and trailing spaces) in search box

**Expected Results:**
- Table shows "Admin" and "Administrador de Finanzas"
- Spaces are trimmed automatically
- OR search includes spaces (document actual behavior)

#### 6.10 Search Then Sort
**Steps:**
1. Enter "Admin" in search box (shows 2 results)
2. Click "Name" column header to sort
3. Observe sort order

**Expected Results:**
- Filtered results are sorted correctly
- Sort applies only to filtered results
- Sort indicator shows current sort direction
- Search filter remains active

---

### 7. Table Sorting

**Seed:** `tests/seed.spec.ts`

#### 7.1 Sort by Name - Ascending
**Steps:**
1. Navigate to Roles section
2. Note the current order of roles
3. Click the "Name" column header

**Expected Results:**
- Table sorts by role name in ascending alphabetical order
- Expected order: "Admin", "Administrador de Finanzas", "Cobrador"
- Sort indicator (arrow icon) appears next to "Name" showing ascending direction
- "Name" column header is highlighted/active

#### 7.2 Sort by Name - Descending
**Steps:**
1. Navigate to Roles section
2. Click the "Name" column header once (ascending)
3. Click the "Name" column header again

**Expected Results:**
- Table sorts by role name in descending alphabetical order
- Expected order: "Cobrador", "Administrador de Finanzas", "Admin"
- Sort indicator changes to show descending direction (arrow pointing down)
- "Name" column header remains highlighted/active

#### 7.3 Sort by Name - Toggle Multiple Times
**Steps:**
1. Navigate to Roles section
2. Click "Name" column header 3 times
3. Observe sorting behavior with each click

**Expected Results:**
- First click: Ascending sort
- Second click: Descending sort
- Third click: May return to default sort or cycle back to ascending
- *Note: Document actual behavior*

#### 7.4 Sort by ID - Ascending
**Steps:**
1. Navigate to Roles section
2. Click the "ID" column header

**Expected Results:**
- Table sorts by role ID in ascending order
- IDs are sorted lexicographically or chronologically (MongoDB ObjectIds have timestamp component)
- Sort indicator appears next to "ID" showing ascending direction
- "ID" column header is highlighted/active
- "Name" sort indicator is removed

#### 7.5 Sort by ID - Descending
**Steps:**
1. Navigate to Roles section
2. Click the "ID" column header once (ascending)
3. Click the "ID" column header again

**Expected Results:**
- Table sorts by role ID in descending order
- Sort indicator shows descending direction
- "ID" column header remains highlighted/active

#### 7.6 Switch Between Name and ID Sorting
**Steps:**
1. Navigate to Roles section
2. Click "Name" to sort by name ascending
3. Click "ID" to sort by ID ascending
4. Observe behavior

**Expected Results:**
- Sort switches from "Name" to "ID"
- "Name" sort indicator is removed
- "ID" sort indicator appears
- Table re-sorts by ID
- Only one column can be sorted at a time

#### 7.7 Sort Maintains State After Search
**Steps:**
1. Navigate to Roles section
2. Click "Name" to sort ascending
3. Enter "Admin" in search box
4. Observe filtered results order

**Expected Results:**
- Filtered results maintain the sort order
- "Admin" appears before "Administrador de Finanzas" (alphabetically)
- Sort indicator remains visible

#### 7.8 Sort with Single Result
**Steps:**
1. Navigate to Roles section
2. Search for a role that returns single result (e.g., "Cobrador")
3. Click "Name" column header to sort

**Expected Results:**
- Sort operation completes without error
- Single result remains displayed
- Sort indicator updates
- No visual change in results (only one item)

#### 7.9 Sort Empty Results
**Steps:**
1. Navigate to Roles section
2. Search for non-existent role (no results)
3. Click "Name" column header to sort

**Expected Results:**
- Sort operation completes without error
- Empty state remains
- Sort indicator updates
- No errors in console

#### 7.10 Sort Persistence After Page Refresh
**Steps:**
1. Navigate to Roles section
2. Sort by "Name" descending
3. Refresh the browser page
4. Observe the initial sort order

**Expected Results:**
- Sort order may reset to default
- OR sort preference is saved and persists
- *Note: Document actual behavior*

---

### 8. Pagination

**Seed:** `tests/seed.spec.ts`

#### 8.1 Verify Pagination Controls Presence
**Steps:**
1. Navigate to Roles section
2. Observe if pagination controls are visible at bottom of table

**Expected Results:**
- If total roles ≤ page size: No pagination controls visible
- If total roles > page size: Pagination controls appear showing:
  - Current page indicator
  - Total pages
  - Previous/Next buttons
  - Page number buttons
  - Items per page selector (if implemented)
- *Note: Current test data has only 3 roles, pagination may not be visible*

#### 8.2 Create Multiple Roles to Test Pagination
**Prerequisite:** Create enough roles to trigger pagination (if page size is 10, create 11+ roles)

**Steps:**
1. Create 15 new roles using "New Role" button
2. Observe pagination controls appearance
3. Note the page size and total pages

**Expected Results:**
- Pagination controls appear
- First 10 roles are displayed (or configured page size)
- Shows "Page 1 of 2" or similar indicator
- "Next" button is enabled
- "Previous" button is disabled

#### 8.3 Navigate to Next Page
**Steps:**
1. Ensure multiple pages of roles exist
2. Click "Next" button or "Page 2" button

**Expected Results:**
- Table loads next page of roles
- URL may update with page parameter (e.g., `?page=2`)
- "Previous" button becomes enabled
- "Next" button state depends on whether more pages exist
- Page indicator updates to "Page 2 of X"

#### 8.4 Navigate to Previous Page
**Steps:**
1. Navigate to page 2 or later
2. Click "Previous" button or "Page 1" button

**Expected Results:**
- Table loads previous page of roles
- Returns to page 1
- "Previous" button becomes disabled
- "Next" button is enabled
- Page indicator updates

#### 8.5 Jump to Specific Page
**Steps:**
1. Ensure at least 3 pages of roles exist
2. Click on "Page 3" button directly

**Expected Results:**
- Table loads page 3
- Page indicator updates to "Page 3 of X"
- Navigation buttons update accordingly

#### 8.6 Change Page Size
**Steps:**
1. Locate page size selector (if available)
2. Change from 10 items per page to 25
3. Observe table changes

**Expected Results:**
- Table reloads with 25 items per page
- Pagination controls update to reflect new page count
- May return to page 1
- URL updates with page size parameter

#### 8.7 Last Page Navigation
**Steps:**
1. Navigate to the last page of results
2. Observe button states

**Expected Results:**
- "Next" button is disabled
- "Previous" button is enabled
- Page indicator shows last page number
- Only roles on last page are displayed (may be fewer than page size)

#### 8.8 Pagination with Search Filter
**Steps:**
1. Ensure pagination is visible
2. Enter search term that reduces results to single page
3. Observe pagination controls

**Expected Results:**
- Pagination controls disappear or update to show 1 page
- All filtered results are displayed on single page
- Clearing search brings back pagination

#### 8.9 Pagination with Sorting
**Steps:**
1. Navigate to page 2
2. Click to sort by "Name"
3. Observe results

**Expected Results:**
- Results are sorted across all pages, not just current page
- May return to page 1 after sort
- Sort applies to entire dataset

#### 8.10 Delete Role on Last Page
**Steps:**
1. Navigate to last page with only 1 role
2. Delete that role
3. Observe behavior

**Expected Results:**
- After deletion, automatically navigates to previous page
- OR shows empty state on last page
- Pagination controls update correctly

---

### 9. Form Validation and Error Handling

**Seed:** `tests/seed.spec.ts`

#### 9.1 Role Name - Required Field Validation
**Steps:**
1. Click "New Role" button
2. Leave Role Name field empty
3. Click or tab to another field
4. Observe validation state

**Expected Results:**
- Field may show red border or error styling
- "Create" button remains disabled
- May show error message: "Role name is required"

#### 9.2 Role Name - Minimum Length Validation (Boundary: 1 char)
**Steps:**
1. Click "New Role" button
2. Enter "A" in Role Name field
3. Tab out of field

**Expected Results:**
- Validation error appears: "Role name must be between 2-40 characters"
- Field shows error styling
- "Create" button is disabled

#### 9.3 Role Name - Minimum Length Validation (Boundary: 2 chars)
**Steps:**
1. Click "New Role" button
2. Enter "AB" in Role Name field
3. Tab out of field

**Expected Results:**
- No validation error
- Field shows valid styling
- "Create" button becomes enabled

#### 9.4 Role Name - Maximum Length Validation (Boundary: 40 chars)
**Steps:**
1. Click "New Role" button
2. Enter exactly 40 characters in Role Name field
3. Tab out of field

**Expected Results:**
- No validation error
- Field accepts all 40 characters
- "Create" button remains enabled

#### 9.5 Role Name - Maximum Length Validation (Boundary: 41 chars)
**Steps:**
1. Click "New Role" button
2. Attempt to enter 41 characters in Role Name field

**Expected Results:**
- Field prevents entry beyond 40 characters (hard limit)
- OR allows entry but shows validation error
- "Create" button is disabled if over limit

#### 9.6 Role Name - Special Characters Validation
**Steps:**
1. Click "New Role" button
2. Enter various special characters: "Test@Role!", "Role#123", "Role$Name"
3. Observe validation

**Expected Results:**
- Validation error: "Role name must be between 2-40 characters with no special characters"
- Field shows error styling
- Specifically which special characters are allowed/disallowed should be clear
- *Note: Document which characters are considered "special"*

#### 9.7 Role Name - Numbers and Spaces
**Steps:**
1. Click "New Role" button
2. Enter "Role 123" with space and numbers
3. Observe validation

**Expected Results:**
- Field accepts or rejects based on validation rules
- *Note: Document whether numbers and spaces are allowed*

#### 9.8 Role Name - Leading/Trailing Spaces
**Steps:**
1. Click "New Role" button
2. Enter "  TestRole  " with leading/trailing spaces
3. Submit form

**Expected Results:**
- Spaces are automatically trimmed
- OR validation error for spaces
- Role is saved with or without spaces based on implementation

#### 9.9 Real-time Validation Feedback
**Steps:**
1. Click "New Role" button
2. Type invalid input in Role Name field
3. Correct the input
4. Observe validation feedback timing

**Expected Results:**
- Validation occurs on blur (leaving field) or on input
- Error messages appear promptly
- Error messages clear when input becomes valid
- "Create" button state updates in real-time

#### 9.10 Multiple Field Validation Errors
**Steps:**
1. Click "New Role" button
2. Enter invalid role name (too short)
3. Attempt to submit

**Expected Results:**
- All validation errors are displayed
- Form does not submit
- Clear indication of which fields have errors
- Error messages are helpful and specific

#### 9.11 Server-Side Validation Error
**Steps:**
1. Simulate server error (e.g., database connection issue)
2. Attempt to create a role
3. Observe error handling

**Expected Results:**
- Error message displays indicating server issue
- User-friendly error message (not technical jargon)
- Form remains open with data intact
- User can retry or cancel
- Error is logged appropriately

#### 9.12 Network Error Handling
**Steps:**
1. Disconnect network or simulate offline state
2. Attempt to create or edit a role
3. Observe behavior

**Expected Results:**
- Error message: "Network error, please check your connection"
- Form data is not lost
- User can retry when connection is restored
- Graceful degradation

#### 9.13 Duplicate Role Name Error
**Steps:**
1. Create role "Test Role"
2. Attempt to create another role with exact same name "Test Role"
3. Observe error

**Expected Results:**
- Error message: "A role with this name already exists"
- Form remains open
- User can modify name or cancel
- First role remains unchanged

#### 9.14 Validation on Edit Form
**Steps:**
1. Edit existing role
2. Clear role name or enter invalid name
3. Attempt to update

**Expected Results:**
- Same validation rules apply as create form
- Cannot save with invalid data
- Validation messages appear
- "Update" button is disabled

---

### 10. Permission Management

**Seed:** `tests/seed.spec.ts`

#### 10.1 View All Available Permissions
**Steps:**
1. Click "New Role" button
2. Click "Permissions" dropdown
3. Scroll through the list of permissions

**Expected Results:**
- Dropdown shows 40+ permissions organized by controller
- Permission names follow pattern: "{Controller}_{Action}"
- Examples visible:
  - BorrowerController_GetAllWithActiveLoans
  - CompanyController_CreateCompany
  - LoanController_SaveLoan
  - PaymentController_Pay
  - ReportsController_ReportPaymentByDay
  - UserController_GetAllUsers
  - InOutBalanceController_DeleteInOutBalance
- Each permission has a checkbox
- Permissions are readable and descriptive

#### 10.2 Select Single Permission
**Steps:**
1. Click "New Role" button
2. Enter role name "Single Permission Role"
3. Click "Permissions" dropdown
4. Select only "UserController_GetAllUsers"
5. Click outside to close dropdown
6. Observe dropdown button text
7. Click "Create"

**Expected Results:**
- Single permission is selected and checked
- Dropdown button shows selected permission name
- Role is created with only that permission
- Dropdown can be reopened to verify selection

#### 10.3 Select Multiple Related Permissions
**Steps:**
1. Click "New Role" button
2. Enter role name "User Manager"
3. Click "Permissions" dropdown
4. Select all "UserController_*" permissions:
   - UserController_GetAllUsers
   - UserController_SearchByIdOrDni
   - UserController_SaveUser
   - UserController_DeleteUserAsync
   - UserController_GetAllRolesAsync
   - UserController_SaveRole
   - UserController_DeleteRoleAsync
   - UserController_GetAllPermissionsAsync
5. Click "Create"

**Expected Results:**
- All selected permissions are checked
- Dropdown button shows count or truncated list
- Role is created with all UserController permissions

#### 10.4 Search Permissions by Controller Name
**Steps:**
1. Click "New Role" button
2. Click "Permissions" dropdown
3. Enter "Loan" in search box
4. Observe filtered results

**Expected Results:**
- Only permissions containing "Loan" are displayed:
  - LoanController_SaveLoan
  - LoanController_DeleteLoan
  - BorrowerController_GetAllWithActiveLoans (contains "Loans")
  - Others with "Loan" in name
- Other permissions are hidden
- Search is case-insensitive

#### 10.5 Search Permissions by Action Name
**Steps:**
1. Click "New Role" button
2. Click "Permissions" dropdown
3. Enter "Delete" in search box

**Expected Results:**
- All delete permissions are shown:
  - BorrowerController_DeleteBorrower
  - CompanyController_DeleteCompany
  - LoanController_DeleteLoan
  - PaymentController_DeletePay
  - UserController_DeleteUserAsync
  - UserController_DeleteRoleAsync
  - InOutBalanceController_DeleteInOutBalance
- Other permissions are hidden

#### 10.6 Select All Permissions (If Possible)
**Steps:**
1. Click "New Role" button
2. Click "Permissions" dropdown
3. Check if there's a "Select All" option
4. If yes, click it; if no, manually select all permissions
5. Observe behavior

**Expected Results:**
- If "Select All" exists: All 40+ permissions are selected at once
- If manual selection required: Can select all but tedious
- Dropdown button indicates "All" or shows count
- *Note: Document if "Select All" feature exists*

#### 10.7 Deselect All Permissions
**Steps:**
1. Select multiple permissions
2. Check if there's a "Deselect All" or "Clear" option
3. Click it or manually uncheck all

**Expected Results:**
- All permissions become unchecked
- Dropdown button returns to placeholder text
- Can still create role without permissions (if allowed)

#### 10.8 Permission Persistence After Save
**Steps:**
1. Create role with specific permissions (e.g., "Test Role" with 3 permissions)
2. Click "Create"
3. Edit the same role
4. Open permissions dropdown
5. Verify selected permissions

**Expected Results:**
- Previously selected permissions are checked
- Other permissions remain unchecked
- Permissions are correctly saved and loaded

#### 10.9 View Admin Role Permissions
**Steps:**
1. Click "Edit" for "Admin" role
2. Click "Permissions" dropdown
3. Observe selected permissions

**Expected Results:**
- Admin role has all or most permissions selected (40+ permissions)
- Dropdown button shows truncated list or count
- All permissions can be viewed in dropdown

#### 10.10 Permissions Display Format
**Steps:**
1. Click "New Role" button
2. Click "Permissions" dropdown
3. Observe permission naming and grouping

**Expected Results:**
- Permissions use clear, descriptive names
- Format: {Controller}_{Action}
- Grouped by controller (if implemented)
- OR displayed as flat list
- Easy to read and understand
- *Note: Document actual display format*

---

### 11. Role Inheritance

**Seed:** `tests/seed.spec.ts`

#### 11.1 View Available Roles for Inheritance
**Steps:**
1. Click "New Role" button
2. Click "Inherited Roles" dropdown
3. View the list of available roles

**Expected Results:**
- Dropdown shows all existing roles as options
- Currently visible: Admin, Cobrador, Administrador de Finanzas
- Each role has a checkbox
- Roles are listed by name

#### 11.2 Create Role with Single Inherited Role
**Steps:**
1. Click "New Role" button
2. Enter role name "Junior Admin"
3. Click "Inherited Roles" dropdown
4. Select "Admin"
5. Click outside to close dropdown
6. Do NOT select any direct permissions
7. Click "Create"
8. Edit the newly created role
9. Check permissions

**Expected Results:**
- Role is created successfully
- Dropdown button shows "Admin" as selected
- Role inherits all permissions from Admin role
- When editing, permissions dropdown shows inherited permissions (possibly with indication they are inherited)

#### 11.3 Create Role with Multiple Inherited Roles
**Steps:**
1. Click "New Role" button
2. Enter role name "Super User"
3. Click "Inherited Roles" dropdown
4. Select "Admin", "Cobrador", and "Administrador de Finanzas"
5. Click "Create"
6. Edit the role and check permissions

**Expected Results:**
- Role is created with all three inherited roles
- Dropdown shows all selected roles or count
- Role inherits permissions from all three roles
- If roles have overlapping permissions, no duplicates appear
- Combined permission set is union of all inherited permissions

#### 11.4 Inherit Role and Add Additional Permissions
**Steps:**
1. Click "New Role" button
2. Enter role name "Custom Manager"
3. Click "Inherited Roles" dropdown, select "Cobrador"
4. Click "Permissions" dropdown, select additional permissions not in Cobrador
5. Click "Create"
6. Edit role and verify permissions

**Expected Results:**
- Role has permissions from Cobrador PLUS additional selected permissions
- Both inherited and direct permissions are active
- Total permissions = inherited + direct

#### 11.5 Circular Inheritance Prevention
**Steps:**
1. Create Role A
2. Create Role B that inherits from Role A
3. Attempt to edit Role A to inherit from Role B

**Expected Results:**
- System prevents circular inheritance
- Error message: "Circular inheritance detected" or role B is not available in dropdown
- Cannot create circular dependency
- *Note: Document actual behavior*

#### 11.6 Self-Inheritance Prevention
**Steps:**
1. Edit existing role "Admin"
2. Click "Inherited Roles" dropdown
3. Check if "Admin" appears in the list

**Expected Results:**
- Current role should not appear in its own inherited roles list
- Cannot select self as inherited role
- Prevents self-referential inheritance

#### 11.7 Remove Inherited Role
**Steps:**
1. Edit role that has inherited roles
2. Click "Inherited Roles" dropdown
3. Uncheck one of the inherited roles
4. Click "Update"
5. Edit role again and check permissions

**Expected Results:**
- Inherited role is removed
- Permissions from that role are no longer available
- Direct permissions remain
- Other inherited roles remain

#### 11.8 Update Parent Role Affects Child Role
**Steps:**
1. Create Role A with permission X
2. Create Role B that inherits from Role A
3. Edit Role A and add permission Y
4. Check Role B's permissions

**Expected Results:**
- Role B now has both permission X and Y
- Changes to parent role automatically propagate to child roles
- OR inheritance is snapshot at creation time (document actual behavior)
- *Note: This tests dynamic vs. static inheritance*

#### 11.9 Delete Parent Role with Child Roles
**Steps:**
1. Create Role A
2. Create Role B that inherits from Role A
3. Attempt to delete Role A

**Expected Results:**
- System may prevent deletion with error: "Role has dependent child roles"
- OR deletion proceeds and child role loses inherited permissions
- OR child role reference is broken but role remains
- *Note: Document actual behavior and protection mechanism*

#### 11.10 Multi-Level Inheritance
**Steps:**
1. Create Role A with permission X
2. Create Role B that inherits from Role A
3. Create Role C that inherits from Role B
4. Check Role C's permissions

**Expected Results:**
- Role C has permission X (inherited through B from A)
- Multi-level inheritance is supported
- OR only direct inheritance is supported
- *Note: Document actual behavior and inheritance depth limit*

---

### 12. UI/UX and Responsiveness

**Seed:** `tests/seed.spec.ts`

#### 12.1 Modal Responsiveness
**Steps:**
1. Open "New Role" modal
2. Resize browser window to various sizes
3. Observe modal behavior

**Expected Results:**
- Modal remains centered and accessible at all sizes
- Content adjusts to fit smaller screens
- Scrolling is available if content exceeds viewport
- Close button always accessible

#### 12.2 Table Responsiveness
**Steps:**
1. Navigate to Roles section
2. Resize browser window to mobile size (320px width)
3. Observe table layout

**Expected Results:**
- Table adapts to narrow screens
- Columns may stack or become scrollable horizontally
- Critical information remains visible
- Actions remain accessible

#### 12.3 Button States and Visual Feedback
**Steps:**
1. Hover over "New Role" button
2. Hover over "Edit" button
3. Hover over "Delete" button
4. Observe visual changes

**Expected Results:**
- Buttons show hover state (color change, shadow, etc.)
- Cursor changes to pointer
- Clear visual feedback for interactive elements
- Disabled buttons have distinct appearance

#### 12.4 Loading States
**Steps:**
1. Create a new role
2. Observe UI during save operation
3. Observe UI during page load

**Expected Results:**
- Loading indicator appears during operations
- Buttons show loading state (spinner, disabled)
- User cannot trigger duplicate operations
- Clear feedback that action is in progress

#### 12.5 Error Messages Visibility
**Steps:**
1. Trigger validation error
2. Trigger server error (simulate)
3. Observe error message display

**Expected Results:**
- Error messages are clearly visible
- Located near relevant field or at top of form
- Use error color (typically red)
- Dismissible or auto-dismiss after time
- Icon indicates error type

#### 12.6 Success Messages/Notifications
**Steps:**
1. Successfully create a role
2. Successfully edit a role
3. Successfully delete a role
4. Observe notifications

**Expected Results:**
- Success toast/notification appears
- Message is clear: "Role created successfully"
- Auto-dismisses after 3-5 seconds
- User can manually dismiss
- Uses success color (typically green)

#### 12.7 Keyboard Navigation
**Steps:**
1. Navigate roles page using only keyboard (Tab, Enter, Escape)
2. Open modal, fill form, submit using keyboard
3. Navigate table and trigger actions

**Expected Results:**
- All interactive elements are keyboard accessible
- Tab order is logical and intuitive
- Enter submits forms
- Escape closes modals
- Focus indicators are clearly visible
- No keyboard traps

#### 12.8 Focus Management
**Steps:**
1. Open "New Role" modal
2. Observe initial focus
3. Close modal and observe focus return

**Expected Results:**
- Focus automatically moves to first field in modal
- After closing modal, focus returns to trigger button
- Focus is visible and clear
- Tab order respects visual layout

#### 12.9 Dropdown Accessibility
**Steps:**
1. Open "Inherited Roles" dropdown
2. Navigate using keyboard
3. Select items using keyboard

**Expected Results:**
- Dropdown can be opened with keyboard (Enter/Space)
- Items can be navigated with arrow keys
- Items can be selected with Enter/Space
- Dropdown can be closed with Escape
- Screen reader announces selections

#### 12.10 Empty States
**Steps:**
1. Delete all roles (if possible) or search with no results
2. Observe empty state display

**Expected Results:**
- Friendly empty state message
- Helpful icon or illustration
- Suggestion for next action (e.g., "Create your first role")
- No broken layouts or errors

---

### 13. Data Integrity and Consistency

**Seed:** `tests/seed.spec.ts`

#### 13.1 Role ID Uniqueness
**Steps:**
1. View multiple roles in the table
2. Copy all role IDs
3. Verify uniqueness

**Expected Results:**
- Each role has a unique ID
- IDs are in MongoDB ObjectId format (24 hex characters)
- No duplicate IDs exist

#### 13.2 Role Name Uniqueness Enforcement
**Steps:**
1. Create role "Test Role"
2. Attempt to create another role "Test Role"
3. Observe system behavior

**Expected Results:**
- Second role creation fails
- Error message indicates duplicate name
- Database maintains uniqueness constraint
- First role remains unchanged

#### 13.3 Data Persistence After Browser Refresh
**Steps:**
1. Create new role "Persistence Test"
2. Note its position in table
3. Refresh browser page
4. Verify role still exists

**Expected Results:**
- Role "Persistence Test" is still present
- Data is unchanged
- Position may change based on sort/filter state

#### 13.4 Concurrent User Scenario (If Applicable)
**Steps:**
1. Open application in two browser tabs
2. In Tab 1: Edit "Admin" role, change name
3. In Tab 2: Edit same "Admin" role simultaneously
4. Save in Tab 1, then save in Tab 2
5. Observe conflict handling

**Expected Results:**
- System handles concurrent edits gracefully
- May show conflict warning in Tab 2
- Last write wins OR optimistic locking prevents overwrite
- Data integrity is maintained
- *Note: Document actual conflict resolution strategy*

#### 13.5 Transaction Rollback on Error
**Steps:**
1. Simulate database error during role creation
2. Verify role is not partially created
3. Verify database consistency

**Expected Results:**
- Transaction rolls back completely
- No partial data is saved
- Database remains in consistent state
- User is informed of failure

#### 13.6 Permission Consistency
**Steps:**
1. Create role with specific permissions
2. Edit role and modify permissions
3. Verify permissions are correctly updated

**Expected Results:**
- Permission changes are saved accurately
- No permissions are lost or duplicated
- Permission set matches user selections exactly

#### 13.7 Inherited Role Consistency
**Steps:**
1. Create role A that inherits from role B
2. Verify inherited permissions
3. Edit role A to remove inheritance
4. Verify permissions are removed

**Expected Results:**
- Inheritance relationship is correctly established
- Permissions are accurately inherited
- Removing inheritance removes inherited permissions
- Direct permissions remain intact

#### 13.8 Delete Cascade Behavior
**Steps:**
1. Create relationships: Role A, Role B inherits from A
2. Delete Role A
3. Observe Role B state

**Expected Results:**
- System prevents deletion OR
- Deletion proceeds with proper cascade behavior
- Role B is handled appropriately (orphaned, deleted, or inheritance removed)
- *Note: Document actual cascade behavior*

#### 13.9 Data Export/Import Integrity (If Applicable)
**Steps:**
1. Export roles data (if feature exists)
2. Modify or delete some roles
3. Import previously exported data
4. Verify data integrity

**Expected Results:**
- Export captures complete role data
- Import restores data correctly
- IDs and relationships are preserved
- No data corruption

#### 13.10 Audit Trail (If Applicable)
**Steps:**
1. Create, edit, and delete a role
2. Check if system maintains audit log
3. Verify audit entries

**Expected Results:**
- System logs all CRUD operations (if implemented)
- Audit includes: timestamp, user, action, changes
- Audit log is accurate and complete
- *Note: Document if audit trail feature exists*

---

### 14. Security and Permissions Testing

**Seed:** `tests/seed.spec.ts`

#### 14.1 Verify User is Authenticated
**Steps:**
1. Open application in incognito/private browsing mode
2. Navigate directly to `http://localhost:4200/roles`
3. Observe behavior

**Expected Results:**
- If not authenticated, redirect to login page
- Roles section is not accessible without authentication
- Unauthorized access is prevented

#### 14.2 Role-Based Access Control (View Roles)
**Steps:**
1. Login with user having "view roles" permission
2. Navigate to Roles section
3. Observe available actions

**Expected Results:**
- User can view roles list
- Create/Edit/Delete buttons may be hidden or disabled
- Access control based on permissions

#### 14.3 Role-Based Access Control (Create Roles)
**Steps:**
1. Login with user NOT having "create roles" permission
2. Navigate to Roles section
3. Attempt to access "New Role" button

**Expected Results:**
- "New Role" button is hidden or disabled
- OR click shows error: "Insufficient permissions"
- Cannot create roles without permission

#### 14.4 Role-Based Access Control (Edit Roles)
**Steps:**
1. Login with user NOT having "edit roles" permission
2. Navigate to Roles section
3. Attempt to click "Edit" button

**Expected Results:**
- "Edit" buttons are hidden or disabled
- OR click shows error: "Insufficient permissions"
- Cannot edit roles without permission

#### 14.5 Role-Based Access Control (Delete Roles)
**Steps:**
1. Login with user NOT having "delete roles" permission
2. Navigate to Roles section
3. Attempt to click "Delete" button

**Expected Results:**
- "Delete" buttons are hidden or disabled
- OR click shows error: "Insufficient permissions"
- Cannot delete roles without permission

#### 14.6 SQL Injection Prevention (If Applicable)
**Steps:**
1. In search box, enter SQL injection attempt: `' OR '1'='1`
2. In role name, enter SQL: `'; DROP TABLE roles; --`
3. Observe system behavior

**Expected Results:**
- System handles input safely
- No SQL errors occur
- Database is not compromised
- Input is sanitized or parameterized

#### 14.7 XSS Prevention
**Steps:**
1. Attempt to create role with name containing script tag: `<script>alert('XSS')</script>`
2. Submit form
3. View roles list

**Expected Results:**
- Script is not executed
- Content is escaped or sanitized
- XSS attack is prevented
- Role name displays safely

#### 14.8 CSRF Protection (If Applicable)
**Steps:**
1. Inspect network requests for create/edit/delete operations
2. Check for CSRF tokens
3. Attempt request without valid token

**Expected Results:**
- CSRF token is present in requests
- Requests without valid token are rejected
- Protection against cross-site request forgery

#### 14.9 Direct URL Access to Edit Page
**Steps:**
1. Note a role ID (e.g., 68363012623d22aede6fe4d7)
2. Navigate directly to `http://localhost:4200/roles/{roleId}` in browser
3. Observe access control

**Expected Results:**
- If user has permission: Edit modal opens
- If user lacks permission: Access denied or redirect
- Invalid role ID shows error message

#### 14.10 API Endpoint Authorization
**Steps:**
1. Inspect network requests during role operations
2. Note API endpoints (e.g., POST /api/roles, PUT /api/roles/{id})
3. Attempt direct API call without authentication
4. Observe response

**Expected Results:**
- API returns 401 Unauthorized without valid token
- API returns 403 Forbidden without required permission
- Backend enforces authorization
- Frontend restrictions are not the only security layer

---

### 15. Edge Cases and Boundary Conditions

**Seed:** `tests/seed.spec.ts`

#### 15.1 Unicode Characters in Role Name
**Steps:**
1. Create role with Unicode name: "管理员" (Chinese) or "مدير" (Arabic)
2. Submit form
3. View in table

**Expected Results:**
- Unicode characters are accepted and saved
- Display correctly in table
- No encoding issues
- Searchable

#### 15.2 Emoji in Role Name
**Steps:**
1. Create role with emoji: "Admin 👨‍💼 Manager 🔐"
2. Submit form
3. View and search

**Expected Results:**
- Emojis are handled appropriately
- May be accepted or rejected based on validation
- No display issues
- *Note: Document actual behavior*

#### 15.3 Very Long Permission List
**Steps:**
1. Create role and select all 40+ permissions
2. Save role
3. Edit role and view permissions dropdown

**Expected Results:**
- All permissions are saved correctly
- Dropdown displays all selections (possibly with scroll)
- Performance remains acceptable
- No truncation of data

#### 15.4 Role with No Permissions
**Steps:**
1. Create role with only name, no permissions or inherited roles
2. Save role
3. Edit and verify

**Expected Results:**
- Role is created successfully
- Role has zero permissions
- No errors occur
- May show warning that role has no permissions

#### 15.5 Rapidly Creating Multiple Roles
**Steps:**
1. Quickly create 10 roles in succession
2. Do not wait for success notifications
3. Verify all are created

**Expected Results:**
- All roles are created successfully
- No race conditions or conflicts
- Database handles concurrent inserts
- All roles appear in table

#### 15.6 Delete Role While Edit Modal is Open
**Steps:**
1. Open edit modal for "Cobrador"
2. In another tab, delete "Cobrador" role
3. In first tab, attempt to save changes
4. Observe behavior

**Expected Results:**
- Error message: "Role no longer exists"
- Cannot save changes to deleted role
- User is informed gracefully
- No database errors

#### 15.7 Network Interruption During Save
**Steps:**
1. Start creating a role
2. Before clicking save, disable network
3. Click "Create" button
4. Observe error handling

**Expected Results:**
- Error message: "Network error"
- Form data is retained
- User can retry when network is restored
- No partial data saved

#### 15.8 Browser Back Button After Creating Role
**Steps:**
1. Create new role successfully
2. Click browser back button
3. Observe state

**Expected Results:**
- Returns to previous page or state
- No duplicate role is created
- Application state is correct
- No errors occur

#### 15.9 Maximum Roles Limit (If Any)
**Steps:**
1. Create roles until system limit is reached (e.g., 1000 roles)
2. Attempt to create one more
3. Observe behavior

**Expected Results:**
- If limit exists: Error message displayed
- System performance remains acceptable
- Pagination handles large dataset
- *Note: Document if limit exists*

#### 15.10 Special Database Characters
**Steps:**
1. Create role with name containing database special characters: `Test$Role` or `Test\Role`
2. Save and verify

**Expected Results:**
- Characters are properly escaped
- No database errors
- Name is saved and retrieved correctly
- Search works correctly

---

## Test Execution Guidelines

### Prerequisites
1. Application is running at `http://localhost:4200`
2. Backend API is accessible and functional
3. Test database is seeded with initial data (Admin, Cobrador, Administrador de Finanzas roles)
4. Test user has full permissions to manage roles

### Test Environment Setup
1. Use seed file: `tests/seed.spec.ts` to ensure consistent starting state
2. Clear browser cache before test execution
3. Use supported browsers: Chrome, Firefox, Safari, Edge (latest versions)
4. Disable browser extensions that may interfere with testing

### Test Data Management
- Create test data with prefix "TEST_" for easy identification and cleanup
- Clean up test data after test execution
- Document any permanent test roles that should remain

### Execution Order
- Tests are designed to be independent and can run in any order
- Some tests require specific preconditions noted in each scenario
- Pagination tests require creating additional test data

### Reporting
- Document actual vs. expected results for any deviations
- Capture screenshots for UI/visual issues
- Record console errors and network failures
- Note performance issues or slow operations

### Priority Levels
- **P0 (Critical)**: CRUD operations, authentication, data integrity
- **P1 (High)**: Search, sorting, validation, error handling
- **P2 (Medium)**: Bulk operations, pagination, inheritance
- **P3 (Low)**: UI/UX, edge cases, performance optimization

---

## Known Limitations and Notes

1. **Pagination**: Currently only 3 roles exist in test data, pagination may not be visible without creating additional roles
2. **Permission Types**: 40+ permissions available across 9 controllers
3. **Role IDs**: MongoDB ObjectId format (24 hexadecimal characters)
4. **Browser Compatibility**: Test across modern browsers; legacy browser support not verified
5. **Performance**: Test with production-like data volumes to identify performance bottlenecks
6. **API Behavior**: Some behaviors depend on backend implementation (inheritance propagation, cascade delete, etc.)

---

## Appendix

### Test Data Reference

**Existing Roles:**
- **Admin** (ID: 68363012623d22aede6fe4d7)
  - All permissions (40+ permissions)
  - No inherited roles

- **Cobrador** (ID: 68363012623d22aede6fe4d8)
  - Limited permissions (specific to collection activities)
  - No inherited roles

- **Administrador de Finanzas** (ID: 68363012623d22aede6fe4d9)
  - Finance-related permissions
  - No inherited roles

### Available Permissions (Partial List)

**Borrower Controller:**
- BorrowerController_GetAllWithActiveLoans
- BorrowerController_GetByDniInformation
- BorrowerController_GetByIdWithActiveLoans
- BorrowerController_CreateBorrower
- BorrowerController_UpdateBorrower
- BorrowerController_DeleteBorrower

**Company Controller:**
- CompanyController_GetAllCompanies
- CompanyController_GetCompanyById
- CompanyController_CreateCompany
- CompanyController_UpdateCompany
- CompanyController_DeleteCompany

**File Controller:**
- FileController_Upload

**Loan Controller:**
- LoanController_SaveLoan
- LoanController_DeleteLoan

**Payment Controller:**
- PaymentController_GetDetailed
- PaymentController_Pay
- PaymentController_DeletePay

**Reports Controller:**
- ReportsController_ReportPaymentByDay
- ReportsController_ReportPaymentByLoan
- ReportsController_ReportLoansByClientId
- ReportsController_GeneratePaymentReceipt
- ReportsController_ReportNoPaymentClients

**User Controller:**
- UserController_GetAllUsers
- UserController_SearchByIdOrDni
- UserController_SaveUser
- UserController_DeleteUserAsync
- UserController_GetAllRolesAsync
- UserController_SaveRole
- UserController_DeleteRoleAsync
- UserController_GetAllPermissionsAsync

**InOutBalance Controller:**
- InOutBalanceController_GetByDate
- InOutBalanceController_SaveInOutBalance
- InOutBalanceController_DeleteInOutBalance

**Authenticated User:**
- OnlyAuthenticatedUser (appears multiple times in list)

### UI Element Test IDs

**Buttons:**
- `roles-btn-new` - New Role button
- `roles-btn-cancel` - Cancel button in modals
- `roles-btn-cancel-delete` - Cancel button in delete confirmation
- `roles-table-action-edit-row-{roleId}` - Edit button for specific role
- `roles-table-action-delete-row-{roleId}` - Delete button for specific role

**Inputs:**
- `roles-input-name` - Role Name text input
- `roles-search-input` - Search box
- `roles-multiselect-rolesId` - Inherited Roles dropdown
- `roles-multiselect-permissionsId` - Permissions dropdown

**Table:**
- `roles-table-select-all` - Select all checkbox
- `roles-table-row-{roleId}` - Individual table row

---

## Test Plan Maintenance

This test plan should be updated when:
- New features are added to the Roles module
- Permission types change or are added
- UI components are modified
- API endpoints change
- Validation rules are updated
- Bugs are discovered and fixed

**Version:** 1.0
**Last Updated:** 2025-11-24
**Author:** QA Team
**Review Cycle:** Quarterly or with major releases
