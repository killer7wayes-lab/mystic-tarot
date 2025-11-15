import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Just echo something simple so we know the route works
  return NextResponse.json(
    {
      success: true,
      answer: "TEST: server received your POST and route.ts is working.",
    },
    { status: 200 }
  );
}
