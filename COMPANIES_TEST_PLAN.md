# Companies Module - Comprehensive Test Plan

## Application Overview

The Companies module is a CRUD (Create, Read, Update, Delete) management interface for company entities within the Loan application. The module is accessible at `http://localhost:4200/companies` and provides core functionality for managing company records.

### Key Features Identified:
- **Company Management**: Create, edit, and delete company records
- **Search and Filtering**: Real-time search functionality to filter companies by name
- **Table Sorting**: Sortable columns (Name, ID) with visual indicators
- **Bulk Selection**: Multi-select capabilities with bulk delete operations
- **Responsive UI**: Modal-based forms for create/edit operations
- **Validation**: Client-side validation for company names (2-40 characters, no special characters)
- **Confirmation Dialogs**: Safety confirmation for delete operations

### UI Components Identified:

#### Main Page Elements
- **Header**: "Companies" heading (h1)
- **New Company Button**: `data-testid="companies-btn-new"` - Opens creation modal
- **Search Input**: `data-testid="companies-search-input"` - Real-time search functionality
- **Data Table**: `data-testid="companies-table"` (inferred)
  - Columns: Checkbox (Select all), Name, ID, Actions
  - Column headers are sortable (Name, ID)
  - Each row has: checkbox, company name, ID, Edit button, Delete button

#### Selection Controls
- **Select All Checkbox**: `data-testid="companies-table-select-all"` (inferred)
- **Individual Row Checkboxes**: Per-row selection
- **Selected Items Display**: Shows selected company names with remove option
- **Clear All Button**: Clears all selections
- **Delete Selected Button**: Bulk delete action

#### Create/Edit Modal
- **Modal Container**: `data-testid="companies-modal"` (inferred)
- **Modal Title**: "New Company" or "Edit Company"
- **Close Button**: X icon to dismiss modal
- **Company Name Input**: `data-testid="companies-input-name"`
  - Placeholder: "Enter company name"
  - Validation message: "Company name must be between 2-40 characters with no special characters"
- **Cancel Button**: `data-testid="companies-btn-cancel"`
- **Submit Button**: `data-testid="companies-btn-submit"` (Create) or `data-testid="companies-btn-update"` (Edit)
  - Initially disabled, enabled when valid data is entered

#### Delete Confirmation Modal
- **Modal Container**: `data-testid="companies-delete-modal"` (inferred)
- **Modal Title**: "Confirm Delete"
- **Warning Icon**: Visual indicator
- **Confirmation Message**: "Are you sure you want to delete {CompanyName}? This action cannot be undone."
- **Cancel Button**: `data-testid="companies-btn-cancel-delete"`
- **Delete Button**: `data-testid="companies-btn-confirm-delete"` (inferred)

### Validation Rules
- **Minimum Length**: 2 characters
- **Maximum Length**: 40 characters
- **Allowed Characters**: Letters, numbers, and spaces
- **Disallowed Characters**: Special characters (@, #, !, etc.)
- **Trimming**: Leading and trailing spaces should be handled

### Existing Companies (Seed Data)
- Vinocanchon (ID: 68363012623d22aede6fe4e1)
- Cascaparo (ID: 68363012623d22aede6fe4df)
- SanPedro (ID: 68363012623d22aede6fe4e2)
- Wanchaq (ID: 68363012623d22aede6fe4e0)

---

## Test Scenarios

### 1. Navigation and Page Load

**Seed:** `tests/seed.spec.ts`

#### 1.1 Should load Companies page successfully
**Steps:**
1. Log in to the application
2. Click on "Companies" menu item in the sidebar
3. Wait for page to load

**Expected Results:**
- URL changes to `http://localhost:4200/companies`
- "Companies" heading is visible
- "New Company" button is visible
- Search input is visible
- Data table is visible with column headers
- Existing companies are displayed in the table
- Companies menu item is highlighted/active in sidebar

#### 1.2 Should display correct page structure
**Steps:**
1. Navigate to Companies page

**Expected Results:**
- Header section contains "Companies" title and "New Company" button
- Search bar is present above the table
- Table has correct columns: Select all, Name, ID, Actions
- All table headers are visible
- No error messages are displayed

#### 1.3 Should load all existing companies in table
**Steps:**
1. Navigate to Companies page
2. Count the number of rows in the table

**Expected Results:**
- At least 4 companies are displayed (Vinocanchon, Cascaparo, SanPedro, Wanchaq)
- Each row shows: checkbox, company name, ID, Edit button, Delete button
- All data is properly aligned in columns

---

### 2. Company Creation

**Seed:** `tests/seed.spec.ts`

#### 2.1 Should open New Company modal with correct structure
**Steps:**
1. Navigate to Companies page
2. Click "New Company" button

**Expected Results:**
- Modal appears with title "New Company"
- Company Name input field is visible and empty
- Placeholder text "Enter company name" is shown
- Validation hint is displayed: "Company name must be between 2-40 characters with no special characters"
- Cancel button is visible
- Create button is visible and disabled
- Close (X) button is visible in modal header

#### 2.2 Should create company with valid name
**Steps:**
1. Navigate to Companies page
2. Click "New Company" button
3. Enter valid company name: "Tech Solutions Inc"
4. Click "Create" button
5. Wait for modal to close

**Expected Results:**
- Create button becomes enabled after entering valid name
- Modal closes after successful creation
- Success notification is displayed
- New company appears in the table
- Company is searchable immediately
- Table updates to show the new company

#### 2.3 Should create company with minimum valid length (2 characters)
**Steps:**
1. Navigate to Companies page
2. Click "New Company" button
3. Enter company name: "AB"
4. Click "Create" button

**Expected Results:**
- Create button is enabled
- Company is created successfully
- "AB" appears in the table

#### 2.4 Should create company with maximum valid length (40 characters)
**Steps:**
1. Navigate to Companies page
2. Click "New Company" button
3. Enter company name: "Global Enterprise Management Solutions Co" (exactly 40 characters)
4. Click "Create" button

**Expected Results:**
- Create button is enabled
- Company is created successfully
- Full name appears in the table without truncation

#### 2.5 Should create company with numbers and spaces
**Steps:**
1. Navigate to Companies page
2. Click "New Company" button
3. Enter company name: "Company 123 Testing"
4. Click "Create" button

**Expected Results:**
- Create button is enabled
- Company is created successfully
- Name with numbers and spaces appears correctly in table

#### 2.6 Should keep Create button disabled when name is empty
**Steps:**
1. Navigate to Companies page
2. Click "New Company" button
3. Leave the name input empty
4. Try to click Create button

**Expected Results:**
- Create button remains disabled
- Button is not clickable
- No submission occurs

#### 2.7 Should keep Create button disabled with invalid name (less than 2 characters)
**Steps:**
1. Navigate to Companies page
2. Click "New Company" button
3. Enter single character: "A"
4. Tab out of the field

**Expected Results:**
- Create button remains disabled
- Validation error may be displayed
- No submission is possible

#### 2.8 Should reject special characters in company name
**Steps:**
1. Navigate to Companies page
2. Click "New Company" button
3. Enter name with special characters: "Test@Company#123!"
4. Tab out of the field

**Expected Results:**
- Create button remains disabled OR
- Validation error is displayed
- Special characters are rejected

#### 2.9 Should show error for name exceeding 40 characters
**Steps:**
1. Navigate to Companies page
2. Click "New Company" button
3. Enter name longer than 40 characters: "This is a very long company name that definitely exceeds the maximum allowed length"
4. Tab out of the field

**Expected Results:**
- Validation error is displayed: "Maximum length is 40"
- Create button is disabled OR
- Input is limited to 40 characters

#### 2.10 Should trim leading and trailing spaces
**Steps:**
1. Navigate to Companies page
2. Click "New Company" button
3. Enter name with spaces: "  TestCompany  "
4. Click Create button

**Expected Results:**
- Spaces are trimmed automatically OR
- Company is saved as "TestCompany" (without extra spaces)
- No validation error occurs

#### 2.11 Should cancel company creation
**Steps:**
1. Navigate to Companies page
2. Click "New Company" button
3. Enter company name: "Test Company"
4. Click "Cancel" button

**Expected Results:**
- Modal closes
- No company is created
- Table remains unchanged
- No error messages appear

#### 2.12 Should close modal when clicking X button
**Steps:**
1. Navigate to Companies page
2. Click "New Company" button
3. Enter some text in the name field
4. Click the X (Close) button in modal header

**Expected Results:**
- Modal closes
- No company is created
- Form data is discarded

#### 2.13 Should close modal when clicking outside (backdrop)
**Steps:**
1. Navigate to Companies page
2. Click "New Company" button
3. Click on the dark backdrop area outside the modal

**Expected Results:**
- Modal closes (if backdrop dismiss is enabled)
- No company is created

#### 2.14 Should show real-time validation feedback
**Steps:**
1. Navigate to Companies page
2. Click "New Company" button
3. Type one character, observe button state
4. Type second character, observe button state
5. Type special character, observe validation

**Expected Results:**
- Create button state changes dynamically based on input validity
- Real-time validation feedback is provided
- No page reload is required

---

### 3. Company Editing

**Seed:** `tests/seed.spec.ts`

#### 3.1 Should open Edit Company modal with existing data
**Steps:**
1. Navigate to Companies page
2. Click "Edit" button on "Vinocanchon" row

**Expected Results:**
- Modal opens with title "Edit Company"
- Company Name input is pre-filled with "Vinocanchon"
- Update button is visible and enabled (since data is valid)
- Cancel button is visible
- Close (X) button is visible

#### 3.2 Should update company name successfully
**Steps:**
1. Navigate to Companies page
2. Search for and click "Edit" on "Cascaparo"
3. Change name to "Cascaparo Updated"
4. Click "Update" button

**Expected Results:**
- Modal closes
- Success notification appears
- Company name in table updates to "Cascaparo Updated"
- Updated company is searchable by new name
- Old name no longer returns results in search

#### 3.3 Should update company to minimum valid length
**Steps:**
1. Navigate to Companies page
2. Click "Edit" on any company
3. Change name to "XY" (2 characters)
4. Click "Update" button

**Expected Results:**
- Update button is enabled
- Company is updated successfully
- New name "XY" appears in table

#### 3.4 Should update company to maximum valid length
**Steps:**
1. Navigate to Companies page
2. Click "Edit" on any company
3. Change name to exactly 40 characters
4. Click "Update" button

**Expected Results:**
- Update button is enabled
- Company is updated successfully
- Full 40-character name is preserved

#### 3.5 Should disable Update button when name is cleared
**Steps:**
1. Navigate to Companies page
2. Click "Edit" on any company
3. Clear the company name field completely
4. Try to click Update button

**Expected Results:**
- Update button becomes disabled
- Button is not clickable
- Validation error may be shown

#### 3.6 Should disable Update button with invalid characters
**Steps:**
1. Navigate to Companies page
2. Click "Edit" on any company
3. Change name to include special characters: "Company@123"
4. Tab out of field

**Expected Results:**
- Update button is disabled
- Validation error may be displayed
- Special characters are rejected

#### 3.7 Should disable Update button with name too short
**Steps:**
1. Navigate to Companies page
2. Click "Edit" on any company
3. Change name to single character: "A"
4. Tab out of field

**Expected Results:**
- Update button is disabled
- Validation feedback is provided

#### 3.8 Should cancel editing without saving changes
**Steps:**
1. Navigate to Companies page
2. Click "Edit" on "SanPedro"
3. Change name to "SanPedro Modified"
4. Click "Cancel" button

**Expected Results:**
- Modal closes
- No changes are saved
- "SanPedro" name remains unchanged in table

#### 3.9 Should navigate to edit page with correct URL
**Steps:**
1. Navigate to Companies page
2. Click "Edit" on "Vinocanchon"
3. Check the URL

**Expected Results:**
- URL changes to `/companies/{companyId}` (e.g., `/companies/68363012623d22aede6fe4e1`)
- Edit modal is displayed
- Browser back button works correctly

#### 3.10 Should preserve data when navigating back from edit
**Steps:**
1. Navigate to Companies page
2. Click "Edit" on a company
3. Click browser back button

**Expected Results:**
- Returns to companies list page
- No data is lost
- Table shows correct data

#### 3.11 Should apply same validation rules as create form
**Steps:**
1. Navigate to Companies page
2. Open edit modal for any company
3. Test all validation scenarios (empty, too short, too long, special chars)

**Expected Results:**
- All validation rules from creation apply to editing
- Consistent error messages
- Consistent button state behavior

---

### 4. Company Deletion

**Seed:** `tests/seed.spec.ts`

#### 4.1 Should open delete confirmation modal
**Steps:**
1. Navigate to Companies page
2. Click "Delete" button on "Wanchaq" row

**Expected Results:**
- Delete confirmation modal appears
- Modal title is "Confirm Delete"
- Warning icon is displayed
- Confirmation message shows: "Are you sure you want to delete Wanchaq? This action cannot be undone."
- Company name "Wanchaq" is highlighted (bold/strong)
- Cancel button is visible
- Delete button is visible

#### 4.2 Should delete company after confirmation
**Steps:**
1. Navigate to Companies page
2. Note the current number of companies
3. Click "Delete" on "Cascaparo"
4. Click "Delete" in confirmation modal
5. Wait for modal to close

**Expected Results:**
- Confirmation modal closes
- Success notification appears
- "Cascaparo" is removed from the table
- Total number of companies decreases by 1
- Searching for "Cascaparo" returns no results

#### 4.3 Should cancel deletion
**Steps:**
1. Navigate to Companies page
2. Click "Delete" on "SanPedro"
3. Click "Cancel" in confirmation modal

**Expected Results:**
- Modal closes
- No deletion occurs
- "SanPedro" remains in the table
- No changes to data

#### 4.4 Should close delete modal with X button
**Steps:**
1. Navigate to Companies page
2. Click "Delete" on any company
3. Click the X (Close) button in modal header

**Expected Results:**
- Modal closes
- No deletion occurs
- Company remains in table

#### 4.5 Should handle deletion of last filtered item
**Steps:**
1. Navigate to Companies page
2. Search for "Vinocanchon" to show only that company
3. Click "Delete" on "Vinocanchon"
4. Confirm deletion

**Expected Results:**
- Company is deleted
- Search results show "No data available" or empty state
- Clearing search shows remaining companies

---

### 5. Search and Filtering

**Seed:** `tests/seed.spec.ts`

#### 5.1 Should filter companies by partial name match
**Steps:**
1. Navigate to Companies page
2. Enter "San" in search input

**Expected Results:**
- Only "SanPedro" is displayed in the table
- Other companies are hidden
- Search is case-insensitive (optional to verify)
- Results update in real-time as you type

#### 5.2 Should show all companies when search is cleared
**Steps:**
1. Navigate to Companies page
2. Enter "Cascaparo" in search
3. Clear the search input

**Expected Results:**
- All companies are displayed again
- Table returns to original state
- No companies are missing

#### 5.3 Should show "No data available" for no matches
**Steps:**
1. Navigate to Companies page
2. Enter "NonExistentCompany123" in search

**Expected Results:**
- Table shows empty state or "No data available" message
- No companies are displayed
- No errors occur

#### 5.4 Should search is case-insensitive
**Steps:**
1. Navigate to Companies page
2. Enter "VINOCANCHON" in search (all caps)

**Expected Results:**
- "Vinocanchon" is displayed
- Search works regardless of case

#### 5.5 Should filter by company ID
**Steps:**
1. Navigate to Companies page
2. Enter partial or full ID in search: "6836301" or full ID

**Expected Results:**
- Companies with matching IDs are displayed
- Search works on ID field as well as name field

#### 5.6 Should preserve search when performing actions
**Steps:**
1. Navigate to Companies page
2. Search for "Wanchaq"
3. Click Edit on "Wanchaq"
4. Cancel the edit

**Expected Results:**
- Search term remains in search box
- Filtered results are preserved
- User doesn't need to re-search

#### 5.7 Should clear search when deleting filtered item
**Steps:**
1. Navigate to Companies page
2. Search for specific company
3. Delete that company
4. Observe search state

**Expected Results:**
- After deletion, search may clear OR
- Empty state is shown for the search term
- Behavior is consistent

---

### 6. Table Sorting

**Seed:** `tests/seed.spec.ts`

#### 6.1 Should sort by Name in ascending order
**Steps:**
1. Navigate to Companies page
2. Click on "Name" column header

**Expected Results:**
- Companies are sorted alphabetically by name (A-Z)
- Sort indicator (arrow icon) appears next to "Name" header
- Sort order: Cascaparo, SanPedro, Vinocanchon, Wanchaq

#### 6.2 Should sort by Name in descending order
**Steps:**
1. Navigate to Companies page
2. Click on "Name" column header twice

**Expected Results:**
- Companies are sorted in reverse alphabetical order (Z-A)
- Sort indicator changes direction
- Sort order: Wanchaq, Vinocanchon, SanPedro, Cascaparo

#### 6.3 Should sort by ID in ascending order
**Steps:**
1. Navigate to Companies page
2. Click on "ID" column header

**Expected Results:**
- Companies are sorted by ID in ascending order
- Sort indicator appears next to "ID" header
- IDs are in numerical/lexicographical order

#### 6.4 Should sort by ID in descending order
**Steps:**
1. Navigate to Companies page
2. Click on "ID" column header twice

**Expected Results:**
- Companies are sorted by ID in descending order
- Sort indicator changes direction

#### 6.5 Should maintain sort after creating new company
**Steps:**
1. Navigate to Companies page
2. Sort by Name (ascending)
3. Create new company "Alpha Company"
4. Observe table order

**Expected Results:**
- New company appears in correct sorted position
- Sort order is maintained
- "Alpha Company" appears at the top (if A-Z sort)

#### 6.6 Should preserve sort when searching
**Steps:**
1. Navigate to Companies page
2. Sort by Name (descending)
3. Enter search term that returns multiple results

**Expected Results:**
- Filtered results maintain the sorted order
- Sort direction indicator remains visible

---

### 7. Bulk Selection and Actions

**Seed:** `tests/seed.spec.ts`

#### 7.1 Should select individual company
**Steps:**
1. Navigate to Companies page
2. Click checkbox on first company row

**Expected Results:**
- Checkbox is checked
- Company name appears in "Selected" area
- "Select all" checkbox shows indeterminate state (dash/mixed)
- Selection controls appear (Clear all, Delete Selected)

#### 7.2 Should select multiple companies
**Steps:**
1. Navigate to Companies page
2. Click checkboxes on "Vinocanchon" and "Cascaparo"

**Expected Results:**
- Both checkboxes are checked
- Both company names appear in "Selected" area
- "Selected (2):" is displayed
- Delete Selected button is enabled

#### 7.3 Should select all companies
**Steps:**
1. Navigate to Companies page
2. Click "Select all" checkbox in table header

**Expected Results:**
- All company checkboxes are checked
- All company names appear in Selected area
- "Select all" checkbox is fully checked
- Delete Selected button is enabled

#### 7.4 Should deselect all companies
**Steps:**
1. Navigate to Companies page
2. Click "Select all" to select all
3. Click "Select all" again to deselect all

**Expected Results:**
- All checkboxes are unchecked
- Selected area disappears or shows "Selected (0)"
- Selection controls are hidden

#### 7.5 Should clear all selections with Clear all button
**Steps:**
1. Navigate to Companies page
2. Select multiple companies
3. Click "Clear all" button

**Expected Results:**
- All checkboxes are unchecked
- Selected area is cleared
- Selection count resets to 0

#### 7.6 Should remove individual selection from Selected area
**Steps:**
1. Navigate to Companies page
2. Select "Vinocanchon" and "Wanchaq"
3. Click the remove (X) button next to "Vinocanchon" in Selected area

**Expected Results:**
- "Vinocanchon" is removed from Selected area
- Checkbox for "Vinocanchon" in table is unchecked
- "Wanchaq" remains selected
- Selected count updates

#### 7.7 Should delete multiple selected companies
**Steps:**
1. Navigate to Companies page
2. Select "Cascaparo" and "SanPedro"
3. Click "Delete Selected" button
4. Confirm deletion in modal

**Expected Results:**
- Confirmation modal appears for bulk delete
- Modal shows count or list of companies to be deleted
- After confirmation, both companies are deleted
- Both companies are removed from table
- Selection is cleared

#### 7.8 Should preserve selection when sorting
**Steps:**
1. Navigate to Companies page
2. Select "Vinocanchon" and "Wanchaq"
3. Sort by Name

**Expected Results:**
- Selected companies remain selected
- Checkboxes stay checked after sort
- Selected area still shows the companies

#### 7.9 Should clear selection when searching
**Steps:**
1. Navigate to Companies page
2. Select 2 companies
3. Enter search term

**Expected Results:**
- Selection is cleared OR
- Selection is maintained only for companies that match search
- Behavior is consistent

#### 7.10 Should show correct selection count
**Steps:**
1. Navigate to Companies page
2. Select 1 company, verify "Selected (1)"
3. Select 2 more, verify "Selected (3)"
4. Deselect 1, verify "Selected (2)"

**Expected Results:**
- Selection count is always accurate
- Count updates immediately on selection changes

---

### 8. Validation and Error Handling

**Seed:** `tests/seed.spec.ts`

#### 8.1 Should show validation error for name less than 2 characters
**Steps:**
1. Navigate to Companies page
2. Click "New Company"
3. Enter "A"
4. Tab out or attempt to submit

**Expected Results:**
- Validation error message is displayed
- Create button is disabled
- Error is clear and helpful

#### 8.2 Should show validation error for name exceeding 40 characters
**Steps:**
1. Navigate to Companies page
2. Click "New Company"
3. Enter 41+ character name
4. Tab out or attempt to submit

**Expected Results:**
- Validation error displays "Maximum length is 40"
- Create button is disabled OR
- Input is limited to 40 characters

#### 8.3 Should show validation error for special characters
**Steps:**
1. Navigate to Companies page
2. Click "New Company"
3. Enter "Company@#$%"
4. Tab out

**Expected Results:**
- Validation error about special characters
- Create button is disabled
- User understands what characters are allowed

#### 8.4 Should show validation error for empty name after clearing
**Steps:**
1. Navigate to Companies page
2. Click "New Company"
3. Enter valid name "Test Company"
4. Clear the input completely
5. Tab out

**Expected Results:**
- Validation error appears
- Create button is disabled again
- Form returns to invalid state

#### 8.5 Should display multiple validation errors simultaneously
**Steps:**
1. Navigate to Companies page
2. Click "New Company"
3. Enter invalid input that violates multiple rules (if applicable)

**Expected Results:**
- All relevant validation errors are shown
- Errors are prioritized appropriately
- User can fix issues systematically

#### 8.6 Should handle API errors gracefully on create
**Steps:**
1. Navigate to Companies page
2. Attempt to create company when backend is unavailable (simulated/real)
3. Observe error handling

**Expected Results:**
- User-friendly error message is displayed
- Modal may remain open for retry
- No silent failures
- Data integrity is maintained

#### 8.7 Should handle API errors gracefully on update
**Steps:**
1. Navigate to Companies page
2. Edit a company
3. Simulate API failure during update
4. Observe behavior

**Expected Results:**
- Error message is shown
- Original data is preserved
- User can retry or cancel

#### 8.8 Should handle API errors gracefully on delete
**Steps:**
1. Navigate to Companies page
2. Attempt to delete company with API error
3. Observe behavior

**Expected Results:**
- Error message is displayed
- Company is not removed from table
- User can retry deletion

#### 8.9 Should prevent duplicate company names (if enforced)
**Steps:**
1. Navigate to Companies page
2. Click "New Company"
3. Enter exact name of existing company: "Vinocanchon"
4. Attempt to create

**Expected Results:**
- If duplicates are prevented: error message is shown
- If duplicates are allowed: company is created with duplicate name
- Behavior is consistent with business rules

#### 8.10 Should validate on edit form with same rules as create
**Steps:**
1. Navigate to Companies page
2. Edit any company
3. Test all validation rules (empty, too short, too long, special chars)

**Expected Results:**
- All validation rules are consistent between create and edit
- Same error messages
- Same button behavior

---

### 9. UI/UX and Accessibility

**Seed:** `tests/seed.spec.ts`

#### 9.1 Should have proper focus management in modal
**Steps:**
1. Navigate to Companies page
2. Click "New Company"
3. Observe focus behavior

**Expected Results:**
- Focus moves to first input (Company Name) when modal opens
- Focus is trapped within modal (Tab cycles through modal elements)
- Escape key closes modal
- Focus returns to "New Company" button when modal closes

#### 9.2 Should support keyboard navigation
**Steps:**
1. Navigate to Companies page
2. Use Tab key to navigate through elements
3. Use Enter to activate buttons

**Expected Results:**
- All interactive elements are keyboard accessible
- Tab order is logical
- Enter key works on buttons
- No keyboard traps

#### 9.3 Should show loading states during operations
**Steps:**
1. Navigate to Companies page
2. Create, edit, or delete a company
3. Observe UI during processing

**Expected Results:**
- Loading indicator or disabled state during operations
- User cannot trigger duplicate actions
- Clear feedback that action is in progress

#### 9.4 Should display success notifications
**Steps:**
1. Create a new company
2. Edit a company
3. Delete a company
4. Observe notifications

**Expected Results:**
- Success notification appears for each action
- Notifications auto-dismiss after few seconds
- Notifications are visually distinct (green checkmark, etc.)

#### 9.5 Should display error notifications
**Steps:**
1. Trigger an error scenario (invalid data, API error)
2. Observe notification

**Expected Results:**
- Error notification is displayed
- Message is clear and actionable
- Notification is visually distinct (red, warning icon)

#### 9.6 Should have responsive table layout
**Steps:**
1. Navigate to Companies page
2. Resize browser window
3. Observe table behavior

**Expected Results:**
- Table remains usable at various screen sizes
- Important columns remain visible
- Horizontal scroll if necessary
- No layout breaks

#### 9.7 Should show empty state when no companies exist
**Steps:**
1. Delete all companies (or use empty database)
2. Navigate to Companies page

**Expected Results:**
- Friendly empty state message is shown
- Suggests creating first company
- No broken UI or error messages

#### 9.8 Should have clear visual feedback on hover
**Steps:**
1. Navigate to Companies page
2. Hover over buttons, rows, and interactive elements

**Expected Results:**
- Hover states are clearly visible
- Cursor changes to pointer for clickable elements
- Row hover highlights the row

#### 9.9 Should have accessible labels and ARIA attributes
**Steps:**
1. Navigate to Companies page
2. Inspect elements with accessibility tools

**Expected Results:**
- All inputs have proper labels
- Buttons have descriptive text or aria-labels
- Modal has aria-modal and role="dialog"
- Screen reader users can navigate effectively

#### 9.10 Should maintain scroll position after actions
**Steps:**
1. Navigate to Companies page with many companies
2. Scroll down the table
3. Edit a company and save
4. Observe scroll position

**Expected Results:**
- Scroll position is preserved or returns to edited item
- User doesn't lose their place
- Smooth user experience

---

### 10. Edge Cases and Security

**Seed:** `tests/seed.spec.ts`

#### 10.1 Should handle rapid consecutive clicks
**Steps:**
1. Navigate to Companies page
2. Double-click "New Company" button rapidly
3. Observe behavior

**Expected Results:**
- Only one modal opens
- No duplicate modals
- No errors occur

#### 10.2 Should prevent duplicate submissions
**Steps:**
1. Open create company modal
2. Enter valid data
3. Click Create button multiple times rapidly

**Expected Results:**
- Button is disabled after first click
- Only one company is created
- No duplicate entries in database

#### 10.3 Should handle very long company names gracefully
**Steps:**
1. Open create modal
2. Attempt to paste 1000+ character text
3. Observe behavior

**Expected Results:**
- Input is limited to 40 characters OR
- Validation error prevents submission
- No application crash

#### 10.4 Should sanitize input to prevent XSS
**Steps:**
1. Open create modal
2. Enter potentially malicious input: `<script>alert('XSS')</script>`
3. Attempt to create company

**Expected Results:**
- Input is sanitized or rejected
- No script execution occurs
- Company name is stored/displayed safely

#### 10.5 Should handle SQL injection attempts
**Steps:**
1. Open create modal
2. Enter SQL-like input: `'; DROP TABLE companies; --`
3. Attempt to create company

**Expected Results:**
- Input is rejected or safely escaped
- No database operations are affected
- Validation catches dangerous input

#### 10.6 Should handle Unicode and special language characters
**Steps:**
1. Open create modal
2. Enter company name with Unicode: "Empresa España 日本"
3. Create company

**Expected Results:**
- If allowed: Unicode characters are stored and displayed correctly
- If not allowed: Validation error is shown
- Behavior is consistent with requirements

#### 10.7 Should handle network interruptions
**Steps:**
1. Start creating a company
2. Simulate network disconnect during submission
3. Observe behavior

**Expected Results:**
- Error message about network issue
- User can retry when connection is restored
- No partial data is saved

#### 10.8 Should handle concurrent edits (if applicable)
**Steps:**
1. User A opens edit modal for "Vinocanchon"
2. User B deletes "Vinocanchon"
3. User A attempts to save changes

**Expected Results:**
- Appropriate error message (company no longer exists)
- No data corruption
- User A is informed of the conflict

#### 10.9 Should handle session timeout during operation
**Steps:**
1. Let session expire (wait for timeout)
2. Attempt to create/edit/delete company
3. Observe behavior

**Expected Results:**
- User is redirected to login OR
- Session refresh occurs
- User is informed they need to re-authenticate

#### 10.10 Should require proper authentication
**Steps:**
1. Log out of application
2. Attempt to navigate directly to `/companies` via URL
3. Observe behavior

**Expected Results:**
- User is redirected to login page
- Companies page is not accessible without authentication
- No data is exposed

#### 10.11 Should enforce authorization (if role-based)
**Steps:**
1. Login as user without "Companies" permissions
2. Attempt to access Companies page
3. Observe behavior

**Expected Results:**
- If authorized: Page loads normally
- If not authorized: Access denied message OR redirect
- Permissions are enforced consistently

#### 10.12 Should handle database constraints violations
**Steps:**
1. Attempt action that violates database constraint
2. Observe error handling

**Expected Results:**
- Meaningful error message
- No application crash
- User can correct the issue

---

### 11. Performance and Load

**Seed:** `tests/seed.spec.ts`

#### 11.1 Should handle large number of companies (100+)
**Steps:**
1. Populate database with 100+ companies
2. Navigate to Companies page
3. Observe loading time and performance

**Expected Results:**
- Page loads within acceptable time (< 3 seconds)
- Pagination is implemented if needed
- Table remains responsive
- Search works efficiently

#### 11.2 Should handle rapid search input
**Steps:**
1. Navigate to Companies page
2. Type search query very quickly
3. Observe search behavior

**Expected Results:**
- Search debouncing is implemented (doesn't search on every keystroke)
- Final search term is processed correctly
- No performance degradation

#### 11.3 Should handle rapid sorting operations
**Steps:**
1. Navigate to Companies page
2. Click sort headers rapidly multiple times
3. Observe behavior

**Expected Results:**
- Sorting completes correctly
- No race conditions
- Final sort state is correct

---

### 12. Data Integrity and Persistence

**Seed:** `tests/seed.spec.ts`

#### 12.1 Should persist company data after page refresh
**Steps:**
1. Navigate to Companies page
2. Note existing companies
3. Refresh the page (F5)
4. Observe data

**Expected Results:**
- All companies are still present
- Data is identical to before refresh
- No data loss occurs

#### 12.2 Should persist new company after browser refresh
**Steps:**
1. Create new company "Persistent Company"
2. Refresh the page
3. Search for "Persistent Company"

**Expected Results:**
- Company still exists after refresh
- All data is preserved
- Company is searchable

#### 12.3 Should reflect updates across sessions
**Steps:**
1. Edit company "Cascaparo" to "Cascaparo Modified"
2. Open new browser tab
3. Navigate to Companies page in new tab

**Expected Results:**
- New tab shows updated name "Cascaparo Modified"
- Changes are reflected immediately (or after page load)

#### 12.4 Should show latest data when returning to page
**Steps:**
1. Navigate to Companies page
2. Navigate to another page (e.g., Dashboard)
3. Return to Companies page

**Expected Results:**
- Latest company data is displayed
- Any changes made elsewhere are visible
- No stale data is shown

#### 12.5 Should handle company deletion across tabs
**Steps:**
1. Open Companies page in two tabs
2. Delete company in Tab 1
3. Refresh or interact with Tab 2

**Expected Results:**
- Deleted company is removed in both tabs
- No references to deleted company remain
- Data is consistent

---

## Test Data Requirements

### Seed Data
- Minimum 4 companies for testing
- Companies with varying name lengths
- Company IDs should be consistent for reference

### Test Companies to Create
- **Minimum length**: "AB" (2 chars)
- **Maximum length**: "Global Enterprise Management Solutions Co" (40 chars)
- **With numbers**: "Company 123 Testing"
- **Normal**: "Tech Solutions Inc", "Alpha Company"
- **For editing**: "Updated Company Name"

### Invalid Test Data
- **Too short**: "A" (1 char)
- **Too long**: 41+ character strings
- **Special chars**: "Test@Company#!", "Company$$$", "Test<script>"
- **Empty**: "" (empty string)
- **Whitespace**: "   " (only spaces)
- **SQL injection**: "'; DROP TABLE companies; --"
- **XSS**: "<script>alert('XSS')</script>"

---

## Test IDs Reference

### Buttons
- `companies-btn-new` - New Company button
- `companies-btn-cancel` - Cancel button in create/edit modal
- `companies-btn-submit` - Create button in new company modal
- `companies-btn-update` - Update button in edit modal
- `companies-btn-delete` - Delete button (in row actions)
- `companies-btn-confirm-delete` - Confirm delete in delete modal
- `companies-btn-cancel-delete` - Cancel in delete modal

### Inputs
- `companies-input-name` - Company name input field
- `companies-search-input` - Search input field

### Modals
- `companies-modal` - Create/Edit company modal
- `companies-delete-modal` - Delete confirmation modal

### Table
- `companies-table` - Main data table
- `companies-table-select-all` - Select all checkbox in table header

### Error Messages
- `companies-input-name-error` - Validation error for name field

---

## Execution Priority

### P0 (Critical - Must Pass)
- 2.2: Create company with valid name
- 3.2: Update company name successfully
- 4.2: Delete company after confirmation
- 5.1: Filter companies by partial name match
- 10.10: Require proper authentication

### P1 (High Priority)
- All validation tests (8.x)
- All CRUD operations (2.x, 3.x, 4.x)
- Search functionality (5.x)
- Security tests (10.x)

### P2 (Medium Priority)
- Sorting tests (6.x)
- Bulk operations (7.x)
- UI/UX tests (9.x)

### P3 (Low Priority - Nice to Have)
- Edge cases (10.x)
- Performance tests (11.x)
- Advanced UI behaviors

---

## Automation Strategy

### Recommended Test File Structure
```
tests/
├── companies-creation.spec.ts       (Section 2)
├── companies-editing.spec.ts        (Section 3)
├── companies-deletion.spec.ts       (Section 4)
├── companies-search.spec.ts         (Section 5)
├── companies-sorting.spec.ts        (Section 6)
├── companies-bulk-actions.spec.ts   (Section 7)
├── companies-validation.spec.ts     (Section 8)
├── companies-ui-ux.spec.ts          (Section 9)
├── companies-security.spec.ts       (Section 10)
├── companies-performance.spec.ts    (Section 11)
└── companies-data-integrity.spec.ts (Section 12)
```

### Actions File
Create `actions/companies.actions.ts` similar to `roles.actions.ts`:
```typescript
export const companyTestIds = {
  // Buttons
  newCompanyBtn: "companies-btn-new",
  cancelBtn: "companies-btn-cancel",
  submitBtn: "companies-btn-submit",
  updateBtn: "companies-btn-update",
  deleteBtn: "companies-btn-delete",
  deleteConfirmBtn: "companies-btn-confirm-delete",
  deleteCancelBtn: "companies-btn-cancel-delete",

  // Inputs
  companyNameInput: "companies-input-name",
  searchInput: "companies-search-input",

  // Table
  table: "companies-table",
  selectAllCheckbox: "companies-table-select-all",

  // Modals
  modal: "companies-modal",
  deleteModal: "companies-delete-modal",
};

export class CompanyActions {
  constructor(private page: Page) {}

  async navigateTo(): Promise<void> { ... }
  async create(companyData: CompanyData): Promise<void> { ... }
  async edit(originalName: string, newData: CompanyData): Promise<void> { ... }
  async delete(companyName: string): Promise<void> { ... }
  async verifyExists(companyName: string): Promise<void> { ... }
  async verifyNotExists(companyName: string): Promise<void> { ... }
  async search(searchTerm: string): Promise<void> { ... }
  // ... more methods
}
```

---

## Notes and Observations

### Known Issues (From Exploration)
1. **Selection Display Bug**: When selecting "Cascaparo" (row 1 after sort), the Selected area displayed "Vinocanchon" instead. This appears to be a display/indexing bug that should be verified and reported.

### Assumptions
- Authentication is handled separately (via `login()` helper)
- Backend API is available at expected endpoints
- Test IDs follow the pattern observed: `{module}-{type}-{element}`
- Seed data is consistent across test runs

### Best Practices
- Use `generateUniqueName()` helper for creating unique company names
- Always navigate to Companies page before each test (`beforeEach`)
- Clean up test data after tests (delete created companies)
- Use proper waits for async operations (`waitForLoadState`)
- Verify both UI state and data state after actions

---

## Success Criteria

A comprehensive test suite for Companies module is considered complete when:

1. All CRUD operations are covered with positive and negative tests
2. All validation rules are tested with boundary values
3. Search and filtering functionality is thoroughly tested
4. Sorting functionality is verified for all sortable columns
5. Bulk operations are tested with various selection scenarios
6. Security tests cover authentication, authorization, XSS, and SQL injection
7. Error handling is verified for network, API, and validation errors
8. UI/UX aspects including accessibility are tested
9. Edge cases and race conditions are addressed
10. Data integrity and persistence are verified

Minimum coverage target: 80% of identified test scenarios automated.

---

**Document Version**: 1.0
**Created**: 2025-11-25
**Based on**: Manual exploration of Companies module at http://localhost:4200/companies
**Total Test Scenarios**: 120+
