# PopUp/Modal Title Error Correction Prompt

## Problem Description
Modal/popup windows are showing generic titles instead of specific, contextual titles that match the content or trigger element.

## Common Issues
- Strategic cards showing "Strategic Card" instead of "Development", "Long Range", "Pluto", etc.
- Planetary cards showing "Planetary Influence" instead of "Mercury", "Venus", "Mars", etc.
- Generic titles like "Card Reading" instead of specific card names
- Modal titles not reflecting the actual content or trigger element

## Root Cause Analysis
1. **Hardcoded Titles**: Modal components using hardcoded, type-based titles instead of dynamic content
2. **Missing Props**: Modal components not receiving specific title data from parent components
3. **Fallback Logic**: Modal title logic prioritizing generic fallbacks over specific data

## Step-by-Step Fix Process

### Step 1: Identify the Modal Component
```bash
# Search for modal components
grep -r "Modal\|modal" components/
grep -r "Popup\|popup" components/
grep -r "Dialog\|dialog" components/
```

### Step 2: Find Title Logic
```bash
# Look for title-related functions
grep -r "getTitle\|getModalTitle\|title.*=" components/
grep -r "Modal.*title\|title.*Modal" components/
```

### Step 3: Check Data Flow
```bash
# Find where titles are passed to modals
grep -r "title.*=" components/
grep -r "displayName\|cardName\|periodName" components/
```

### Step 4: Identify the Fix Pattern

#### Pattern A: Modal Component Missing Title Prop
**Problem**: Modal component has hardcoded titles
```javascript
// ❌ WRONG - Hardcoded titles
const getModalTitle = () => {
  switch (type) {
    case 'strategic': return 'Strategic Card';
    case 'planetary': return 'Planetary Influence';
    default: return 'Card Reading';
  }
};
```

**Solution**: Add title prop and prioritize it
```javascript
// ✅ CORRECT - Dynamic titles
const Modal = ({ title, type, ...props }) => {
  const getModalTitle = () => {
    // Prioritize specific title over generic type
    if (title) return title;
    
    // Fallback to type-based titles
    switch (type) {
      case 'strategic': return 'Strategic Card';
      case 'planetary': return 'Planetary Influence';
      default: return 'Card Reading';
    }
  };
};
```

#### Pattern B: Parent Component Not Passing Title
**Problem**: Parent component has the data but doesn't pass it
```javascript
// ❌ WRONG - Missing title prop
<Modal
  card={card}
  type="strategic"
  description={description}
/>
```

**Solution**: Pass the specific title
```javascript
// ✅ CORRECT - Pass specific title
<Modal
  card={card}
  title={item.displayName} // or period.planet, card.name, etc.
  type="strategic"
  description={description}
/>
```

### Step 5: Common Data Sources for Titles
Look for these properties in your data:
- `displayName` - Often contains the specific name
- `period.planet` - For planetary cards
- `item.name` - For named items
- `card.title` - For card-specific titles
- `type.name` - For type-specific names

### Step 6: Test the Fix
1. **Check Enhanced Data Path**: Ensure titles work with enhanced/CSV data
2. **Check Fallback Path**: Ensure titles work with legacy/JSON data
3. **Verify All Card Types**: Test birth cards, strategic cards, planetary cards
4. **Test Edge Cases**: Empty titles, missing data, etc.

## Quick Fix Template

### For Modal Components:
```javascript
// Add title prop to component signature
const Modal = ({ title, type, ...otherProps }) => {
  
  // Update title logic to prioritize specific title
  const getModalTitle = () => {
    if (title) return title; // ✅ Use specific title first
    
    // Fallback to generic titles
    switch (type) {
      case 'birth': return 'Birth Card';
      case 'strategic': return 'Strategic Card';
      case 'planetary': return 'Planetary Influence';
      default: return 'Card Reading';
    }
  };
  
  return (
    <div>
      <h2>{getModalTitle()}</h2>
      {/* rest of modal content */}
    </div>
  );
};
```

### For Parent Components:
```javascript
// Pass specific title to modal
<Modal
  title={item.displayName || period.planet || card.name}
  type={cardType}
  description={description}
  // ... other props
/>
```

## Verification Checklist
- [ ] Modal shows specific title (e.g., "Development" not "Strategic Card")
- [ ] Planetary cards show planet names (e.g., "Mercury" not "Planetary Influence")
- [ ] Birth cards show "Birth Card" (unchanged)
- [ ] Fallback data still works if enhanced data unavailable
- [ ] All card types tested and working
- [ ] No console errors or warnings

## Common File Patterns to Check
- `components/Modal.jsx` or `components/Modal.tsx`
- `components/CardModal.jsx` or `components/CardModal.tsx`
- `components/Popup.jsx` or `components/Popup.tsx`
- `components/Dialog.jsx` or `components/Dialog.tsx`
- Parent components that render modals

## Search Commands for Quick Identification
```bash
# Find modal components
find . -name "*.jsx" -o -name "*.tsx" | xargs grep -l "Modal\|modal"

# Find title-related code
grep -r "getTitle\|getModalTitle" components/

# Find where titles are passed
grep -r "title.*=" components/

# Find displayName usage
grep -r "displayName" components/ utils/
```

## Expected Results After Fix
- ✅ Strategic cards: "Development", "Long Range", "Pluto", "Result", "Support"
- ✅ Planetary cards: "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"
- ✅ Birth cards: "Birth Card"
- ✅ Generic fallback: "Card Reading" (only when no specific title available)

---

**Usage**: Copy this prompt and use it in Cursor to quickly identify and fix modal title issues in any application. The pattern is consistent across most React/Next.js applications with modal components.
