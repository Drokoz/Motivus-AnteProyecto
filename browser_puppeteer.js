const puppeteer = require("puppeteer");

// Parse command line arguments
const args = process.argv.slice(2);
const model = args[0];
const mode = args[1];
const backend = args[2];

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("http://localhost:3000/");

  // Listen for all console events and handle errors
  page.on("console", (msg) => {
    console.log(msg.text());
    if (msg.type() === "error") console.log(`Error text: "${msg.text()}"`);
  });

  const image_url = await page.$("#image_url");
  const load_button = await page.$("#load_button");
  const model_select = await page.$("#model_select");
  const mode_select = await page.$("#mode_select");
  const backend_select = await page.$("#backend_select");
  const run_button = await page.$("#run_button");
  const messages = await page.$("#messages");

  await load_button.click();
  await model_select.select(model);
  await mode_select.select(mode);
  await backend_select.select(backend);
  await run_button.click();
  await browser.close();
})();
