# Beds Page Transformation Plan

## Overview
Add dynamic ward/bed CRUD management + visual overhaul of the Beds page.

---

## Step 1: DataContext.jsx — Add 5 Ward/Bed CRUD Functions

### Functions to add (insert after `updateTheme`, before `bedStats`):

#### `addWard(name, totalBeds)`
- Generate `WARD-xxx` ID based on `prev.wards.length + 1`
- Generate `totalBeds` bed objects with sequential IDs (`BED-xxx` based on max existing bed number)
- Push ward + beds to state
- Log activity

#### `removeWard(wardId)`
- Check if any bed in ward is `Occupied` → return `{ success: false, error }` if so
- Filter out ward + all its beds from state
- Log activity
- Return `{ success: true }`

#### `updateWard(wardId, { name?, totalBeds? })`
- Check new total ≥ occupied count → return error if too low
- If renaming: update ward name + all bed `wardName` fields
- If changing count:
  - Increase: generate new beds to fill the gap
  - Decrease: remove excess `Available` beds (sorted by highest number first)
- Log activity
- Return `{ success: true }`

#### `addBed(wardId)`
- Find ward, get max `number` in ward, create next bed
- Push bed, increment `ward.totalBeds`
- Log activity

#### `removeBed(bedId)`
- Only if `Available` → return error otherwise
- Remove bed, decrement `ward.totalBeds`
- Log activity
- Return `{ success: true }`

### Expose in value object:
```js
addWard, removeWard, updateWard, addBed, removeBed
```

---

## Step 2: Rewrite Beds.jsx

### State additions:
```js
const [showManageModal, setShowManageModal] = useState(false);
const [manageView, setManageView] = useState('list'); // 'list' | 'add' | 'edit'
const [editingWard, setEditingWard] = useState(null);
const [manageForm, setManageForm] = useState({ name: '', totalBeds: 10 });
const [manageError, setManageError] = useState('');
const [admittingBed, setAdmittingBed] = useState(null);
const [selectedPatient, setSelectedPatient] = useState('');
```

### Layout:

#### Toolbar (updated)
- Ward filter dropdown (as before)
- **New** "Manage Wards" button (`btn btn-secondary`)
- Occupancy stat text
- Search box

#### Ward sections (redesigned)
Each ward section renders:
1. **Header**: ward name + occupancy bar (colored div with width %)
   - Badges: occupied/total, available count
2. **Bed grid**: `display: grid, gridTemplateColumns: repeat(auto-fill, minmax(140px, 1fr)), gap: 10px`
3. **Bed cards** with:
   - Subtle shadow (`var(--shadow-sm)`) + hover lift (`translateY(-2px)`, `var(--shadow-md)`)
   - Status-colored left border (3px)
   - Bed ID (bold)
   - Status badge (pill-style using existing badge classes)
   - Patient name (if occupied, with `text-overflow: ellipsis`)
4. **Inline admit** (when `admittingBed === bed.id`):
   - Card expands with patient `<select>` + [Admit] + [Cancel] buttons

#### Click behavior:
- **Available bed** → toggle `admittingBed` (show inline form)
- **Occupied bed** → `confirm('Discharge {name}?')` → `dischargePatient(bedId)`
- **Maintenance bed** → no action

#### Manage Wards Modal
- **List view**: each row shows ward name, bed count, [Edit] [Delete] buttons
  - Delete disabled if ward has occupied beds (with tooltip)
  - Delete shows confirmation
- **Add/Edit view**: form with name input + bed count number input
  - Add: [Create Ward] button
  - Edit: [Save Changes] button

### Visual styles (inline or via index.css classes):
```css
.bed-card { box-shadow: var(--shadow-sm); transition: all var(--transition-fast); }
.bed-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.occupancy-bar { height: 6px; border-radius: var(--radius-full); background: var(--color-bg-tertiary); overflow: hidden; }
.occupancy-bar-fill { height: 100%; border-radius: var(--radius-full); transition: width var(--transition-normal); }
```

---

## Step 3: Files Changed

| File | Change |
|---|---|
| `src/context/DataContext.jsx` | ~80 new lines (5 functions + value exports) |
| `src/pages/Beds.jsx` | Full rewrite (~200 lines) |

## Edge Cases Handled
- Cannot delete ward with occupied beds
- Cannot reduce bed count below occupied count
- Inline admit form resets on submit/cancel
- Manage modal resets form on open/close
- Bed IDs remain unique using global max+1
- Ward IDs based on array length (always sequential)
