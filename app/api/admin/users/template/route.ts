import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  const wb = XLSX.utils.book_new();

  // Header row + one example row
  const rows = [
    ["name", "email", "company_name", "role", "website_url", "industry", "bio", "logo_url"],
    [
      "Ahmad Razif bin Hamdan",
      "ahmad.razif@example.com",
      "TechVenture Sdn Bhd",
      "buyer",
      "https://techventure.com",
      "Technology",
      "A leading technology solutions provider.",
      "",
    ],
    [
      "Siti Nurhaliza binti Roslan",
      "siti@globalfood.com",
      "Global Food Manufacturing Corp",
      "seller",
      "https://globalfood.com",
      "Food & Beverage",
      "Halal-certified food manufacturer exporting to 10+ countries.",
      "",
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Column widths
  ws["!cols"] = [
    { wch: 28 }, // name
    { wch: 32 }, // email
    { wch: 32 }, // company_name
    { wch: 10 }, // role
    { wch: 30 }, // website_url
    { wch: 22 }, // industry
    { wch: 40 }, // bio
    { wch: 30 }, // logo_url
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Users");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="user_upload_template.xlsx"',
    },
  });
}
