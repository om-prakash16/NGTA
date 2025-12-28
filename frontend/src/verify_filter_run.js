
// Logic from globalFilter.ts applied manually to verify
const applyColumnFilters = (data, columnFilters) => {
    return data.filter(item => {
        return Object.entries(columnFilters).every(([key, filter]) => {
            let value;

            // Map keys to values (using dot notation support)
            value = key.split('.').reduce((o, i) => o?.[i], item);

            console.log(`Debug - Symbol: ${item.symbol}, Key: ${key}, Value: ${value}, Selected: ${filter.selectedValues}`);

            if (filter.type === "number") {
                if (typeof value !== "number") return false;
                if (filter.min !== undefined && value < filter.min) return false;
                if (filter.max !== undefined && value > filter.max) return false;
                return true;
            } else {
                // Text/Enum
                if (!filter.selectedValues || filter.selectedValues.length === 0) return true;

                // Handle Array values (if cell contains multiple items)
                if (Array.isArray(value)) {
                    return value.some(v => filter.selectedValues?.some(f => String(v).toUpperCase() === f.toUpperCase()));
                }
                const match = filter.selectedValues?.some(f => String(value).toUpperCase() === f.toUpperCase());
                console.log(`   Match Result: ${match}`);
                return match;
            }
        });
    });
};

// Mock Data
const data = [
    { symbol: "HINDALCO", current_strength: "Buyers" }, // Should be hidden
    { symbol: "KAYNES", current_strength: "Sellers" }   // Should be shown
];

// Mock Filter
const columnFilters = {
    "current_strength": {
        type: "enum",
        selectedValues: ["Sellers"]
    }
};

// Test
console.log("Running Filter Test JS...");
const result = applyColumnFilters(data, columnFilters);

console.log("Resulting Data:");
console.log(JSON.stringify(result, null, 2));

if (result.find(d => d.symbol === "HINDALCO")) {
    console.log("FAIL: Buyers (HINDALCO) passed the Sellers filter.");
    process.exit(1);
} else {
    console.log("PASS: Buyers (HINDALCO) was filtered out.");
}
