const puppeteer = require("puppeteer");
const fs = require("fs");
// sample formate
(async () => {
  // Sample HTML content (can also be loaded from file)
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Train Ticket</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 30px;
          }
          h1 {
            color: #2c3e50;
          }
          .ticket {
            border: 1px solid #ccc;
            padding: 15px;
            border-radius: 6px;
            background-color: #f9f9f9;
            width: 100%;
            max-width: 500px;
          }
        </style>
      </head>
      <body>
        <h1>Train Ticket</h1>
        <div class="ticket">
          <p><strong>Passenger:</strong> John Doe</p>
          <p><strong>Train:</strong> Shatabdi Express (12001)</p>
          <p><strong>From:</strong> Delhi</p>
          <p><strong>To:</strong> Mumbai</p>
          <p><strong>Date:</strong> 2025-08-01</p>
          <p><strong>Coach:</strong> B1</p>
          <p><strong>Seat:</strong> 23</p>
          <p><strong>Fare:</strong> ₹850</p>
        </div>
      </body>
    </html>
  `;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set HTML content
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  // Generate PDF
  await page.pdf({
    path: "ticket.pdf",
    format: "A4",
    printBackground: true,
    margin: {
      top: "30px",
      bottom: "30px",
      left: "30px",
      right: "30px",
    },
  });

  await browser.close();
  console.log("✅ PDF generated: ticket.pdf");
})();
