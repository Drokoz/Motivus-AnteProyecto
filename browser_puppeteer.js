const puppeteer = require("puppeteer");

(async () => {
  console.log("Starting");

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  console.log("Going to page");
  await page.goto("http://localhost:3001/");

  // Listen for all console events and handle errors
  page.on("console", (msg) => {
    console.log(msg.text());
    if (msg.type() === "error") console.log(`Error text: "${msg.text()}"`);
  });

  console.log("Waiting execution");
  await page.waitForFunction(() => {
    return !!Array.from(document.querySelectorAll("console")).find((el) =>
      el.textContent.includes("Inference completed")
    );
  });
  console.log("Closing browser");
  await browser.close();
})();
