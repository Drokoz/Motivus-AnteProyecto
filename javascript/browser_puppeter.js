const puppeteer = require("puppeteer");
const fs = require("fs");
const modelName = "benchmark";
(async () => {
  for (let rep = 1; rep < 10; rep++) {
    console.log("Starting");

    const browser = await puppeteer.launch({ headless: true , protocolTimeout: 0});
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);
    console.log("Going to page");
    await page.goto("http://localhost:3001/", {
      waitUntil: "load",
      timeout: 0
    });

    // Listen for all console events and handle errors
    page.on("console", (msg) => {
      console.log(msg.text());
      if (msg.type() === "error") console.log(`Error text: "${msg.text()}"`);
    });

    console.log("Waiting execution");
    // Wait for the desired console log
    // Inject a script into the page that listens for console.log
    await page.evaluate(() => {
      console.log = ((originalConsoleLog) => {
        return (...args) => {
          originalConsoleLog.apply(console, args);
          window.dispatchEvent(new CustomEvent("consoleLog", { detail: args }));
        };
      })(console.log);
    });

    // Wait for the desired console log
    await page.evaluate(() => {
      return new Promise((resolve) => {
        window.addEventListener("consoleLog", (event) => {
          const logMessage = event.detail[0];
          if (logMessage.includes("Inference completed")) {
            resolve();
          }
        });
      });
    });

    if (modelName == "batch") {
      // download data results
      console.log("Saving data output");
      const res = await page.evaluate(() => {
        return fetch("http://localhost:3001/data", {
          method: "GET",
          credentials: "include"
        }).then((r) => r.json());
      });
      console.log(typeof res);
      //console.log(JSON.stringify(res));
      fs.writeFileSync("../data/output.json", JSON.stringify(res));
    } else {
      console.log("Saving data benchmark");
      // download times from benchmark
      const res2 = await page.evaluate(() => {
        return fetch("http://localhost:3001/times", {
          method: "GET",
          credentssials: "include"
        }).then((r) => r.json());
      });
      //console.log(typeof res2);
      //console.log(JSON.stringify(res));
      await fs.writeFileSync(
        "../data/resnet-wasm-headless" + rep.toString() + ".json",
        JSON.stringify(res2)
      );
    }
    console.log("Closing browser");
    await browser.close();
    // CSV data as plain text
  }
})();