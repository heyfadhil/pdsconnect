import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  const wb = XLSX.utils.book_new();

  // Header row + example rows
  const rows = [
    ["name", "email", "company_name", "role", "title", "phone", "mobile", "website_url", "business_type", "item", "industry", "bio", "logo_url"],
    [
      "Ahmad Razif bin Hamdan",
      "ahmad.razif@example.com",
      "TechVenture Sdn Bhd",
      "buyer",
      "CEO",
      "+60 3-1234 5678",
      "+60 12-345 6789",
      "https://techventure.com",
      "SME",
      "Enterprise software, Cloud solutions",
      "Technology",
      "A leading technology solutions provider.",
      "",
    ],
    [
      "Siti Nurhaliza binti Roslan",
      "siti@globalfood.com",
      "Global Food Manufacturing Corp",
      "seller",
      "Sales Director",
      "+60 3-9876 5432",
      "+60 11-987 6543",
      "https://globalfood.com",
      "MNC",
      "Halal food products, Ready-to-eat meals",
      "Food & Beverage",
      "Halal-certified food manufacturer exporting to 10+ countries.",
      "",
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);

  ws["!cols"] = [
    { wch: 28 }, // name
    { wch: 32 }, // email
    { wch: 32 }, // company_name
    { wch: 10 }, // role
    { wch: 22 }, // title
    { wch: 18 }, // phone
    { wch: 18 }, // mobile
    { wch: 30 }, // website_url
    { wch: 16 }, // business_type
    { wch: 35 }, // item
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
