# Input Validation - Quick Visual Guide

## 🎯 Setup Wizard Step-by-Step

### STEP 1: ISP Selection
```
┌─────────────────────────────────────────┐
│ Who is your ISP?                        │
│ Select from popular NZ providers        │
│                                         │
│ [Spark▼                               ] │  ← Autocomplete
│                                         │
│ ℹ️ ISP name looks good                  │  ← Success indicator
│                                         │
│     [Back]                [Next ➤]      │
└─────────────────────────────────────────┘

Dropdown shows:
┌──────────────┐
│ Spark        │ ← Highlighted
│ Slingshot    │
│ Snap         │
└──────────────┘
```

**Valid Examples:**
- ✓ Spark
- ✓ Vodafone
- ✓ 2degrees
- ✓ My Custom ISP

**Invalid Examples:**
- ✗ "" (empty)
- ✗ "S" (too short)
- ✗ "This is a very long ISP name that exceeds fifty characters limit" (too long)

---

### STEP 2: Download Speed
```
┌─────────────────────────────────────────┐
│ What's your download speed?             │
│ Enter the speed you're paying for      │
│                                         │
│ [100                            100 Mbps] │ ← Auto-formatted
│                                         │
│ ✓ Speed range valid for NZ              │ ← Success message
│                                         │
│     [Back]                [Next ➤]      │
└─────────────────────────────────────────┘
```

**Valid Ranges for NZ:**
```
┌──────────────────────────────────────────┐
│ Speed      │ Use Case      │ Typical ISP │
├────────────┼───────────────┼─────────────┤
│ 1-10 Mbps  │ Rural         │ Limited     │
│ 20-50 Mbps │ Cable/Urban   │ Vodafone    │
│ 50-100 Mbps│ VDSL/VDSL+    │ Spark       │
│ 300-1000   │ Ultra Fiber   │ UFB/Premium │
└──────────────────────────────────────────┘
```

**With Warnings:**
```
100 Mbps    ✓ Valid
5 Mbps      ⚠️ Below typical NZ minimum (10 Mbps). Rural area?
400 Mbps    ⚠️ Above typical NZ maximum (300 Mbps). Ultra-fast Fibre?
```

---

### STEP 3: Monthly Cost
```
┌─────────────────────────────────────────┐
│ How much do you pay per month?          │
│ Include GST - helps us compare value    │
│                                         │
│ NZ$ [89.00          ] (incl. GST)       │ ← Currency formatting
│                                         │
│ ✓ NZ$89.00 per month                    │ ← Display format
│                                         │
│     [Back]                [Next ➤]      │
└─────────────────────────────────────────┘
```

**Valid Ranges for NZ (GST Included):**
```
Budget Plans:      NZ$30-50/month    (basic broadband)
Mid-Range Plans:   NZ$50-100/month   (most popular)
Premium Plans:     NZ$100-150/month  (larger data/speed)
Business Plans:    NZ$150+/month     (enterprise)
```

**Examples:**
```
NZ$89.00    ✓ Valid (typical plan)
NZ$29.95    ⚠️ Below typical NZ minimum ($30). Corporate rate?
NZ$200      ⚠️ Above typical NZ maximum ($150). Premium plan?
```

---

### STEP 4: Modem Location
```
┌─────────────────────────────────────────┐
│ Where is your modem located?            │
│ This is your baseline for comparison    │
│                                         │
│ [Living room▼                         ] │  ← Autocomplete
│                                         │
│ ✓ Room added: Living room               │ ← Success
│                                         │
│     [Back]                [Next ➤]      │
└─────────────────────────────────────────┘

Dropdown shows common rooms:
┌──────────────────────┐
│ Living Room          │ ← Highlighted
│ Lounge               │
│ Loft                 │
│ Laundry              │
└──────────────────────┘
```

**Suggested Rooms:**
```
Common Areas:       Outdoor:
Living Room         Patio
Kitchen             Garden
Hallway             Deck
Bedroom             Balcony

Work/Study:         Storage:
Study               Garage
Home Office         Basement
                    Attic
```

---

### STEP 5: Additional Rooms
```
┌─────────────────────────────────────────┐
│ Add additional rooms to test            │
│ Compare WiFi strength across your home  │
│                                         │
│ [Bedroom▼                    ][+ Add]   │ ← Add room
│                                         │
│ Rooms to test (2):                      │ ← Shows count
│ [Bedroom ✕]  [Kitchen ✕]                │
│                                         │
│ ✓ 2 rooms added                         │ ← Success
│                                         │
│     [Back]              [Begin Testing] │
└─────────────────────────────────────────┘
```

**Room Management:**
```
Adding:
  Empty input → "Add" button disabled
  "Bed" → Suggestions show (Bedroom, Master Bedroom, etc.)
  
Added:
  Bedroom  ✓
  Kitchen  ✓
  
Cannot add:
  ✗ Duplicate room (same room twice)
  ✗ Invalid characters (numbers, special chars)
  ✗ Too short (less than 2 chars)
  ✗ Too long (more than 30 chars)
```

---

## 🔴 Error Messages Guide

### ISP Name Errors
```
❌ ISP name is required
   → User left field empty

❌ ISP name must be at least 2 characters
   → User entered "S" or similar

❌ ISP name must be less than 50 characters
   → User entered very long string

❌ ISP name contains invalid characters
   → User used: @, #, $, etc.
```

### Speed Errors
```
❌ Download speed is required
   → User left field empty

❌ Please enter a valid number
   → User entered non-numeric value

❌ Speed must be at least 1 Mbps
   → User entered 0 or negative

❌ Speed cannot exceed 1000 Mbps (max NZ UFB)
   → User entered 5000 or higher
```

### Cost Errors
```
❌ Monthly cost is required
   → User left field empty

❌ Please enter a valid amount
   → User entered non-numeric value

❌ Cost cannot be negative
   → User entered -50 or similar

❌ Cost cannot exceed NZ$500/month
   → User entered 1000 or higher
```

### Room Errors
```
❌ Room name is required
   → User left field empty

❌ Room name must be at least 2 characters
   → User entered "B"

❌ Room name must be less than 30 characters
   → User entered very long string

❌ Room name contains invalid characters
   → User used: @, #, $, etc.

❌ This room is already added
   → User tried adding "Bedroom" twice
```

---

## ⚠️ Warning Messages Guide

### Speed Warnings
```
⚠️ Speed below typical NZ minimum (10 Mbps). Rural area?
   → User entered 5 Mbps (might be rural connection)
   → This is still valid - just informational

⚠️ Speed above typical NZ maximum (300 Mbps). Ultra-fast Fibre?
   → User entered 500 Mbps (might be UFB premium)
   → This is still valid - just informational
```

### Cost Warnings
```
⚠️ Cost below typical NZ plan (NZ$30). Corporate rate?
   → User entered NZ$15/month (unusual but valid)
   → Might be employee/corporate discount

⚠️ Cost above typical NZ plan (NZ$150). Premium plan?
   → User entered NZ$200/month (unusual but valid)
   → Might be business/premium internet
```

---

## ✅ Success Indicators

```
✓ ISP name looks good
✓ Speed range valid for NZ
✓ NZ$89.00 per month
✓ Room added: Living room
✓ 2 rooms added
```

---

## 🎮 Keyboard Navigation

### In Autocomplete Dropdown
```
↓ Arrow Down   → Highlight next suggestion
↑ Arrow Up     → Highlight previous suggestion
↵ Enter        → Select highlighted suggestion (or proceed)
Esc            → Close dropdown
Tab            → Move to next field
```

### In Any Field
```
↵ Enter        → Proceed to next step (if valid)
Shift+Tab      → Move to previous field
```

### Navigation Buttons
```
← Back         → Go to previous step
Next / Begin   → Go to next step (or start test)
```

---

## 📊 Data Validation Summary

| Field | Min | Max | Required | Format |
|-------|-----|-----|----------|--------|
| ISP | 2 | 50 chars | ✓ | Title Case |
| Speed | 1 | 1000 | ✓ | X Mbps |
| Cost | 0 | 500 | ✓ | NZ$X.XX |
| Room | 2 | 30 chars | ✓ | Title Case |
| Rooms | 1+ | ∞ | ✓ | No duplicates |

---

## 🎯 User Tips

1. **ISP Selection**
   - Start typing to see suggestions
   - Click on suggestion or type custom name

2. **Speed Entry**
   - Enter YOUR PLAN speed (not tested speed yet)
   - Don't worry about decimals - they're rare

3. **Cost Entry**
   - Include GST (Goods and Services Tax)
   - This helps us make fair comparisons

4. **Room Setup**
   - Add modem room first as baseline
   - Then add 2-3 other rooms for comparison
   - More rooms = more useful data

5. **Overall**
   - Tab to next field or click "Next"
   - You can go back anytime with "Back" button
   - Each step validates before letting you proceed

---

**Professional Setup Wizard - Enhanced with NZ-Specific Validation** ✨
