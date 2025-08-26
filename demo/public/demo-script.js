// Demo script to showcase the event logging functionality
// This can be run in the browser console to trigger various events

console.log('🎯 Sentry Managed Component Event Logging Demo');
console.log('═'.repeat(50));

// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Demo function to showcase different events
async function runEventLoggingDemo() {
  console.log('🚀 Starting event logging demonstration...');

  // 1. Try to trigger a Sentry error (will be blocked if no consent)
  console.log('\n1️⃣ Testing Sentry error logging...');
  try {
    // Find and click the "Trigger Error" button
    const errorButton = document.querySelector('button[style*="background-color: rgb(220, 53, 69)"]');
    if (errorButton) {
      errorButton.click();
      console.log('✅ Error button clicked - check event log for details');
    }
  } catch (e) {
    console.log('❌ Error triggering test error');
  }

  await wait(1000);

  // 2. Try performance test
  console.log('\n2️⃣ Testing Sentry performance logging...');
  try {
    const perfButton = document.querySelector('button[style*="background-color: rgb(111, 66, 193)"]');
    if (perfButton) {
      perfButton.click();
      console.log('✅ Performance test triggered - check event log');
    }
  } catch (e) {
    console.log('❌ Error triggering performance test');
  }

  await wait(1000);

  // 3. Add breadcrumb
  console.log('\n3️⃣ Testing Sentry breadcrumb logging...');
  try {
    const breadcrumbButton = document.querySelector('button[style*="background-color: rgb(23, 162, 184)"]');
    if (breadcrumbButton) {
      breadcrumbButton.click();
      console.log('✅ Breadcrumb added - check event log');
    }
  } catch (e) {
    console.log('❌ Error adding breadcrumb');
  }

  await wait(1000);

  // 4. Test consent changes
  console.log('\n4️⃣ Testing consent change logging...');
  try {
    const functionalButton = document.querySelector('button:contains("Grant")');
    if (functionalButton) {
      functionalButton.click();
      console.log('✅ Functional consent toggled - check event log');
    }
  } catch (e) {
    console.log('❌ Error toggling functional consent');
  }

  await wait(1000);

  // 5. Test consent modal
  console.log('\n5️⃣ Testing consent modal logging...');
  try {
    const modalButton = document.querySelector('button[style*="background-color: rgb(255, 193, 7)"]');
    if (modalButton) {
      modalButton.click();
      console.log('✅ Consent modal triggered - check event log');
    }
  } catch (e) {
    console.log('❌ Error showing consent modal');
  }

  await wait(1000);

  console.log('\n🎉 Demo complete! Check the Event Log component on the page to see all logged events.');
  console.log('📊 Event types logged:');
  console.log('  • SENTRY: Sentry initialization, events, and consent status');
  console.log('  • ZARAZ: Zaraz initialization and API readiness');
  console.log('  • CONSENT: Consent changes and modal interactions');
  console.log('  • GENERAL: App initialization and user interactions');
}

// Auto-run the demo
runEventLoggingDemo();

// Export for manual use
window.runEventLoggingDemo = runEventLoggingDemo;
