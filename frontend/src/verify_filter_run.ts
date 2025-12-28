
import { applyColumnFilters } from './utils/globalFilter'; // Assuming relative path correct for execution context

// Mock Data
const data = [
    { symbol: "HINDALCO", current_strength: "Buyers" }, // Should be hidden
    { symbol: "KAYNES", current_strength: "Sellers" }   // Should be shown
];

// Mock Filter
const columnFilters = {
    "current_strength": {
        type: "enum" as any,
        selectedValues: ["Sellers"]
    }
};

// Test
console.log("Running Filter Test...");
const result = applyColumnFilters(data, columnFilters);

console.log("Resulting Data:");
console.log(JSON.stringify(result, null, 2));

if (result.find(d => d.symbol === "HINDALCO")) {
    console.log("FAIL: Buyers (HINDALCO) passed the Sellers filter.");
} else {
    console.log("PASS: Buyers (HINDALCO) was filtered out.");
}
