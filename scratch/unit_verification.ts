import { CategoryValidation } from "../src/modules/category/category.validation.js";
import { GearValidation } from "../src/modules/gear/gear.validation.js";
import { RentalValidation } from "../src/modules/rental/rental.validation.js";
import { ReviewValidation } from "../src/modules/review/review.validation.js";

console.log("🧪 Starting Isolated Unit & Validation Tests...\n");

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ Passed: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ Failed: ${testName}`);
    failed++;
  }
}

// 1. Test Category Schema Validation
try {
  const result = CategoryValidation.createCategoryValidationSchema.safeParse({
    body: { name: "Adventure Sports", description: "Bungee jumping and parachute gear." }
  });
  assert(result.success === true, "Category validation allows valid inputs");
} catch (e) {
  assert(false, "Category validation crashed on valid inputs");
}

try {
  const result = CategoryValidation.createCategoryValidationSchema.safeParse({
    body: { name: "" }
  });
  assert(result.success === false, "Category validation blocks empty category names");
} catch (e) {
  assert(false, "Category validation crashed on empty names");
}

// 2. Test Gear Schema Validation
try {
  const result = GearValidation.createGearValidationSchema.safeParse({
    body: {
      name: "Trekking Pole Pro",
      description: "Carbon fiber lightweight hiking poles.",
      brand: "Leki",
      pricePerDay: 5.5,
      stock: 10,
      imageUrl: "https://example.com/poles.jpg",
      categoryId: "0e986ec3-85d7-4557-8cd6-7c3496225804"
    }
  });
  assert(result.success === true, "Gear validation allows valid products");
} catch (e) {
  assert(false, "Gear validation crashed on valid inputs");
}

try {
  const result = GearValidation.createGearValidationSchema.safeParse({
    body: {
      name: "Bad Item",
      description: "Cheap poles.",
      brand: "Generic",
      pricePerDay: -2, // Invalid
      stock: 2.5, // Invalid
      categoryId: "invalid-uuid" // Invalid
    }
  });
  assert(result.success === false, "Gear validation correctly blocks negative price, decimal stock, and invalid category UUID format");
} catch (e) {
  assert(false, "Gear validation failed to catch invalid bounds");
}

// 3. Test Rental Schema Validation
try {
  const result = RentalValidation.createRentalOrderValidationSchema.safeParse({
    body: {
      gearItemId: "0e986ec3-85d7-4557-8cd6-7c3496225804",
      startDate: "2026-07-10T12:00:00Z",
      endDate: "2026-07-15T12:00:00Z"
    }
  });
  assert(result.success === true, "Rental validation allows valid ranges");
} catch (e) {
  assert(false, "Rental validation crashed on valid ranges");
}

try {
  const result = RentalValidation.createRentalOrderValidationSchema.safeParse({
    body: {
      gearItemId: "not-a-uuid",
      startDate: "",
      endDate: ""
    }
  });
  assert(result.success === false, "Rental validation blocks invalid inputs");
} catch (e) {
  assert(false, "Rental validation failed to catch bad dates");
}

// 4. Test Review Schema Validation
try {
  const result = ReviewValidation.createReviewValidationSchema.safeParse({
    body: {
      gearItemId: "0e986ec3-85d7-4557-8cd6-7c3496225804",
      rating: 5,
      comment: "Outstanding build quality!"
    }
  });
  assert(result.success === true, "Review validation allows valid ratings");
} catch (e) {
  assert(false, "Review validation crashed on valid ratings");
}

try {
  const result = ReviewValidation.createReviewValidationSchema.safeParse({
    body: {
      gearItemId: "0e986ec3-85d7-4557-8cd6-7c3496225804",
      rating: 6, // Invalid
      comment: "" // Invalid
    }
  });
  assert(result.success === false, "Review validation blocks ratings greater than 5 or empty comments");
} catch (e) {
  assert(false, "Review validation failed to block invalid ratings");
}

console.log(`\n📊 Tests complete. Passed: ${passed}, Failed: ${failed}`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log("\n🎉 ALL UNIT AND VALIDATION TESTS PASSED! 🎉\n");
}
