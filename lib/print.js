function printQuote() {
  // This function calls window.calculateQuote() and window.updateSubsectionTotals()
  // so ensure calculation.js exposes those on window.
  try {
    window.calculateQuote();
  } catch (e) {}
  try {
    window.updateSubsectionTotals();
  } catch (e) {}

  const quoteRef = `QR-${Date.now().toString().slice(-6)}`;
  const quoteDate = new Date().toLocaleDateString();
  const headerHtml = `
    <div class="header" style="text-align:left; padding:10px 0 20px 0;">
      <h1 style="margin:0; font-size:1.6em; color:#2c5aa0;">Air-to-Water Heat Pump Quote</h1>
      <div style="margin-top:6px;">
        <strong>Quote Reference:</strong> ${quoteRef}<br/>
        <strong>Date:</strong> ${quoteDate}
      </div>
    </div>
  `;

  const original = document.querySelector(".container");
  const clone = original.cloneNode(true);
  const clonedResults = clone.querySelector("#resultsSection");
  if (clonedResults) clonedResults.style.display = "block";
  const origResults = document.getElementById("results");
  if (clonedResults && origResults) {
    const clonedResultsInner = clone.querySelector("#results");
    if (clonedResultsInner)
      clonedResultsInner.innerHTML = origResults.innerHTML;
  }

  clone
    .querySelectorAll(".calculate-btn, .print-btn")
    .forEach((el) => el.remove());
  clone.querySelectorAll(".subtotal-value").forEach((el) => {
    if (el.id) {
      const orig = document.getElementById(el.id);
      if (orig) el.textContent = orig.textContent;
    }
  });

  clone.querySelectorAll("input, select, textarea").forEach((el) => {
    const wrapper = document.createElement("div");
    wrapper.style.display = "inline-block";
    wrapper.style.minWidth = "120px";
    if (el.tagName.toLowerCase() === "select") {
      const text = el.options[el.selectedIndex]
        ? el.options[el.selectedIndex].text
        : el.value;
      wrapper.textContent = text;
    } else if (el.type === "checkbox") {
      wrapper.textContent = el.checked ? "Yes" : "No";
    } else {
      wrapper.textContent = el.value !== "" ? el.value : "-";
    }
    el.parentNode && el.parentNode.replaceChild(wrapper, el);
  });

  let styles = "";
  document.querySelectorAll("head style").forEach((s) => {
    styles += s.innerHTML;
  });

  const printWindow = window.open("", "_blank", "width=1000,height=1400");
  if (!printWindow) {
    alert(
      "Pop-up blocked. Allow pop-ups for this site or use the browser print (Cmd+P)."
    );
    return;
  }

  printWindow.document.open();
  printWindow.document.write(`
    <html>
      <head>
        <title>Quote - ${quoteRef}</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width,initial-scale=1"/>
        <style>
          ${styles}
          body { background: white; color: #222; padding: 20px; font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; }
          .container { box-shadow: none; background: white; border-radius: 0; padding: 0; }
          .header h1 { color: #2c5aa0; }
          .subsection { background: transparent; border-left: none; padding: 8px 0; margin: 6px 0; }
          .subsection h3 { color: #2c5aa0; margin-bottom:6px; }
          .form-group { margin-bottom:6px; }
          .form-group label { display:block; font-weight:600; color:#333; margin-bottom:3px; }
          .form-group div { font-weight:500; color:#111; }
          .results { background: transparent; border: none; padding: 0; }
          .calculate-btn, .print-btn { display: none !important; }
          @media print { body { padding: 12mm; } }
        </style>
      </head>
      <body>
        ${headerHtml}
        <main>
          ${clone.innerHTML}
        </main>
      </body>
    </html>
  `);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }, 300);
}
