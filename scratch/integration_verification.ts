import "dotenv/config";

const BASE_URL = "http://localhost:5000/api";

console.log("🧪 Starting Integration Tests (Auth Guards, Middleware & Standardized Error Responses)...\n");

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

async function runIntegrationTests() {
  let customerToken = "";
  let providerToken = "";

  try {
    // 1. Log in Customer & Provider
    const customerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "user@example.com", password: "user123" }),
    });
    const customerLogin = await customerLoginRes.json() as any;
    customerToken = customerLogin.data.accessToken;

    const providerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "provider@example.com", password: "provider123" }),
    });
    const providerLogin = await providerLoginRes.json() as any;
    providerToken = providerLogin.data.accessToken;

    // 2. Integration Test: Block Customer from Provider inventory routes (Role Guard)
    console.log("🔒 [Test 1] Testing Role Guard (Customer accessing Provider routes)...");
    const badRes1 = await fetch(`${BASE_URL}/provider/gear`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({}),
    });
    const badJson1 = await badRes1.json() as any;
    assert(
      badRes1.status === 500 && badJson1.message.includes("not authorized"),
      "Bridges customer access from provider route with correct authorization error"
    );

    // 3. Integration Test: Block Provider from Admin routes
    console.log("\n🔒 [Test 2] Testing Role Guard (Provider accessing Admin routes)...");
    const badRes2 = await fetch(`${BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${providerToken}` },
    });
    const badJson2 = await badRes2.json() as any;
    assert(
      badRes2.status === 500 && badJson2.message.includes("not authorized"),
      "Bridges provider access from admin routes with correct authorization error"
    );

    // 4. Integration Test: Unauthenticated requests block
    console.log("\n🔒 [Test 3] Testing Unauthenticated Route Guard...");
    const badRes3 = await fetch(`${BASE_URL}/auth/me`);
    const badJson3 = await badRes3.json() as any;
    assert(
      badRes3.status === 500 && badJson3.message.includes("not logged in"),
      "Bridges unauthenticated requests with login required message"
    );

    // 5. Integration Test: Error Response Format
    console.log("\n📄 [Test 4] Verifying Standardized Error Response Shape...");
    assert(
      badJson3.success === false &&
      badJson3.status_code !== undefined &&
      badJson3.message !== undefined &&
      badJson3.error !== undefined,
      "Response has standardized shape: { success, status_code, message, error }"
    );

    console.log(`\n📊 Integration Tests Complete. Passed: ${passed}, Failed: ${failed}`);
    if (failed > 0) process.exit(1);
    else console.log("\n🎉 ALL INTEGRATION TESTS PASSED! 🎉\n");

  } catch (err: any) {
    console.error(`\n❌ Integration test suite failed: ${err.message}\n`);
    process.exit(1);
  }
}

runIntegrationTests();
