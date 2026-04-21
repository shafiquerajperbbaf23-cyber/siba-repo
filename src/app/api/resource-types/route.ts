// src/app/api/resource-types/route.ts
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const types = await prisma.resourceType.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(types);
}
