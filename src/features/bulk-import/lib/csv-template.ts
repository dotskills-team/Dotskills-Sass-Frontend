const TEMPLATE_HEADERS = [
  "sku",
  "name",
  "categoryName",
  "unitCode",
  "barcode",
  "costPrice",
  "salePrice",
  "reorderLevel",
  "sellByWeight",
];

const TEMPLATE_EXAMPLE_ROW = ["RICE-5KG", "Fresh Rice 5kg", "Groceries", "PCS", "", "50", "60", "10", "false"];

/** UTF-8 BOM-prefixed, matching the backend Reporting module's own CSV-export precedent, so Bangla text opens correctly in Excel (Section ৮.৮ point 5). */
export function downloadProductBulkImportTemplate() {
  const lines = [TEMPLATE_HEADERS.join(","), TEMPLATE_EXAMPLE_ROW.join(",")];
  const csvContent = "﻿" + lines.join("\r\n") + "\r\n";
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "product-import-template.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
