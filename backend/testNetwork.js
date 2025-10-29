// A simple script to test basic HTTPS connectivity from your Node.js environment.

async function testNetworkConnectivity() {
  const urlToTest = 'https://www.google.com';
  console.log(`>> Attempting to fetch a simple HTTPS endpoint: ${urlToTest}`);
  console.log(">> This will tell us if your environment has a general network issue.");

  try {
    const response = await fetch(urlToTest);
    
    // If we get here, the fetch command itself worked, which is great news.
    console.log(`\n>> SUCCESS! Received a response with status: ${response.status}`);
    console.log(">> This means your Node.js environment CAN make outgoing HTTPS requests.");
    console.log(">> The problem is likely specific to the connection to the Google Generative AI API, possibly an SSL issue or a firewall rule specific to that address.");

  } catch (error) {
    console.error("\n>> FAILED! The fetch command threw an error.");
    console.error(">> Error details:", error);
    console.log("\n>> This confirms a general network issue on your machine or in your Node.js environment.");
    console.log(">> The most common causes are a firewall, a proxy server, or an antivirus program blocking Node.js.");
  }
}

testNetworkConnectivity();