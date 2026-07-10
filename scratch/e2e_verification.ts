import "dotenv/config";

const BASE_URL = "http://localhost:5000/api";

async function runTests() {
  console.log("🚀 Starting End-to-End API verification tests...");

  let customerToken = "";
  let providerToken = "";
  let adminToken = "";
  let categoryId = "";
  let gearItemId = "";
  let rentalOrderId = "";
  let transactionId = "";

  const uniqueSuffix = Date.now().toString();

  try {
    // 1. Authenticate Admin
    console.log("\n🔑 [Test 1] Authenticating Admin...");
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@example.com",
        password: "admin123",
      }),
    });
    const adminLogin = await adminLoginRes.json() as any;
    if (!adminLogin.success) throw new Error("Admin login failed");
    adminToken = adminLogin.data.accessToken;
    console.log("✅ Admin authenticated successfully.");

    // 2. Authenticate Provider
    console.log("\n🔑 [Test 2] Authenticating Provider...");
    const providerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "provider@example.com",
        password: "provider123",
      }),
    });
    const providerLogin = await providerLoginRes.json() as any;
    if (!providerLogin.success) throw new Error("Provider login failed");
    providerToken = providerLogin.data.accessToken;
    console.log("✅ Provider authenticated successfully.");

    // 3. Authenticate Customer
    console.log("\n🔑 [Test 3] Authenticating Customer...");
    const customerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "user@example.com",
        password: "user123",
      }),
    });
    const customerLogin = await customerLoginRes.json() as any;
    if (!customerLogin.success) throw new Error("Customer login failed");
    customerToken = customerLogin.data.accessToken;
    console.log("✅ Customer authenticated successfully.");

    // 4. Create Category (Admin Only)
    console.log("\n📁 [Test 4] Creating Category (Admin)...");
    const categoryName = `Hiking & Climbing ${uniqueSuffix}`;
    const categoryRes = await fetch(`${BASE_URL}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: categoryName,
        description: "Outdoor hiking poles, backpacks, and safety gear.",
      }),
    });
    const categoryJson = await categoryRes.json() as any;
    if (!categoryJson.success) throw new Error(`Category creation failed: ${JSON.stringify(categoryJson)}`);
    categoryId = categoryJson.data.id;
    console.log(`✅ Category created successfully. ID: ${categoryId}`);

    // 5. Create Gear Item (Provider Only)
    console.log("\n🏋️ [Test 5] Creating Gear Item listing (Provider)...");
    const gearRes = await fetch(`${BASE_URL}/provider/gear`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${providerToken}`,
      },
      body: JSON.stringify({
        name: `Osprey Backpack ${uniqueSuffix}`,
        description: "55L lightweight trekking backpack with waterproof cover.",
        brand: "Osprey",
        pricePerDay: 12.5,
        stock: 3,
        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
        categoryId,
      }),
    });
    const gearJson = await gearRes.json() as any;
    if (!gearJson.success) throw new Error(`Gear listing failed: ${JSON.stringify(gearJson)}`);
    gearItemId = gearJson.data.id;
    console.log(`✅ Gear item listed successfully. ID: ${gearItemId}`);

    // 6. Search and Filter Gear (Public)
    console.log("\n🔍 [Test 6] Fetching Gear with filters (Public)...");
    const filterRes = await fetch(`${BASE_URL}/gear?category=${encodeURIComponent(categoryName)}&availableOnly=true`);
    const filterJson = await filterRes.json() as any;
    if (!filterJson.success || filterJson.data.length === 0) {
      throw new Error(`Gear filtering failed: ${JSON.stringify(filterJson)}`);
    }
    console.log(`✅ Gear filtering verified. Found: ${filterJson.data.length} item(s)`);

    // 7. Place Rental Order (Customer)
    console.log("\n📦 [Test 7] Placing Rental Order (Customer)...");
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 5); // 5 days duration

    const rentalRes = await fetch(`${BASE_URL}/rentals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        gearItemId,
        startDate: today.toISOString(),
        endDate: nextWeek.toISOString(),
      }),
    });
    const rentalJson = await rentalRes.json() as any;
    if (!rentalJson.success) throw new Error(`Rental creation failed: ${JSON.stringify(rentalJson)}`);
    rentalOrderId = rentalJson.data.id;
    console.log(`✅ Rental order placed. ID: ${rentalOrderId}, Cost: $${rentalJson.data.totalCost}`);

    // 8. Create Stripe Payment Intent
    console.log("\n💳 [Test 8] Generating Stripe Payment Intent...");
    const paymentRes = await fetch(`${BASE_URL}/payments/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ rentalOrderId }),
    });
    const paymentJson = await paymentRes.json() as any;
    if (!paymentJson.success) throw new Error(`Payment intent failed: ${JSON.stringify(paymentJson)}`);
    transactionId = paymentJson.data.transactionId;
    console.log(`✅ Payment intent generated. Transaction ID: ${transactionId}`);

    // 9. Confirm Payment (Simulated Checkout Confirmation)
    console.log("\n💸 [Test 9] Confirming simulated Stripe payment checkout...");
    const confirmRes = await fetch(`${BASE_URL}/payments/confirm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ transactionId }),
    });
    const confirmJson = await confirmRes.json() as any;
    if (!confirmJson.success) throw new Error(`Payment confirmation failed: ${JSON.stringify(confirmJson)}`);
    console.log(`✅ Payment status set to COMPLETED.`);

    // 10. Update Rental Status (CONFIRMED -> PICKED_UP -> RETURNED)
    console.log("\n🔄 [Test 10] Performing rental status lifecycle updates (Provider)...");
    const statuses = ["CONFIRMED", "PICKED_UP", "RETURNED"];
    for (const status of statuses) {
      const statusRes = await fetch(`${BASE_URL}/provider/orders/${rentalOrderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${providerToken}`,
        },
        body: JSON.stringify({ status }),
      });
      const statusJson = await statusRes.json() as any;
      if (!statusJson.success) {
        throw new Error(`Status update to ${status} failed: ${JSON.stringify(statusJson)}`);
      }
      console.log(`  ➔ Rental order updated to ${status}`);
    }
    console.log("✅ Lifecycle status transitions completed.");

    // 11. Leave Review (Customer)
    console.log("\n⭐ [Test 11] Leaving Gear Review (Customer)...");
    const reviewRes = await fetch(`${BASE_URL}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        gearItemId,
        rating: 5,
        comment: "Absolutely amazing backpack! Extremely comfortable for long hikes.",
      }),
    });
    const reviewJson = await reviewRes.json() as any;
    if (!reviewJson.success) throw new Error(`Review submission failed: ${JSON.stringify(reviewJson)}`);
    console.log("✅ Review submitted successfully.");

    console.log("\n🎉 ALL E2E API VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉\n");
  } catch (error: any) {
    console.error(`\n❌ Test suite failed: ${error.message}\n`);
    process.exit(1);
  }
}

runTests();
