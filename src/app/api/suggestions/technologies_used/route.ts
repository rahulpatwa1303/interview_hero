import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../prisma";
import { Prisma } from "@prisma/client";

export const GET = async (req: NextRequest) => {
  const input = req.nextUrl.searchParams.get("q")?.toLowerCase().trim() || "";
  if (!input) {
    const allData = await prisma.technology_used.findMany();
    return NextResponse.json(allData); // Return all data if no input
  }

  const suggestion = await prisma.technology_used.findMany({
    where: {
      name: {
        contains: input,
        mode: 'insensitive', // Adjust mode as needed
      },
    },
  });

  return NextResponse.json(suggestion);
};
