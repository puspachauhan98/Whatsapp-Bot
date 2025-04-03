const puppeteer = require("puppeteer");

(async function main() {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
    );

    console.log("Opening WhatsApp Web...");
    await page.goto("https://web.whatsapp.com", { waitUntil: "networkidle2" });

    // Wait for QR code
    console.log("Waiting for QR code to load...");
    await page.waitForSelector("canvas", { timeout: 90000 });
    console.log("QR code detected. Please scan it with your phone.");

    // Wait for WhatsApp Web UI to load
    console.log("Waiting for WhatsApp Web to load...");
    await page.waitForSelector("div[role='textbox']", { timeout: 90000 });

    // Define contact and message
    const contactName = "Mom"; // Update with the exact WhatsApp contact name
    const message = "This is auto message ";

    // Search for contact
    console.log(`Searching for contact: ${contactName}`);
    await page.waitForSelector("div[role='textbox']", { timeout: 60000 });
    await page.click("div[role='textbox']");
    await page.type("div[role='textbox']", contactName);

    // Wait for search results
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for 3 seconds

    // Debugging: Take a screenshot to verify search results
    await page.screenshot({ path: "debug_search_results.png" });

    await page.waitForSelector(`span[title='${contactName}']`, { timeout: 60000 });
    await page.click(`span[title='${contactName}']`);
    console.log(`Contact ${contactName} selected.`);

    // Wait for the message input box to appear using the updated selector
    console.log("Waiting for message input box...");
    await page.waitForSelector("div[aria-label='Type a message'][contenteditable='true']", { visible: true, timeout: 60000 });

    // Loop to send the message 100 times
    for (let i = 0; i < 100; i++) {
      console.log(`Sending message #${i + 1}: "${message}"`);
      
      const messageBox = await page.$("div[aria-label='Type a message'][contenteditable='true']");

      if (!messageBox) {
        throw new Error("Message input box not found!");
      }

      // Wait for the element to be focused before typing
      await page.evaluate(element => element.focus(), messageBox);
      await page.keyboard.type(message);

      // Wait for Send button
      console.log("Waiting for Send button...");
      await page.waitForSelector("button[aria-label='Send']", { timeout: 60000 });

      // Send the message
      await page.click("button[aria-label='Send']");
      console.log(`Message #${i + 1} sent successfully!`);

      // Wait for 1 second before sending the next message
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1000ms (1 second)
    }

    console.log("All messages sent!");

    // Close the browser (optional)
    await browser.close();
  } catch (error) {
    console.error("Error occurred:", error);
  }
})();
