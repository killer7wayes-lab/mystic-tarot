import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    return NextResponse.json(
      {
        success: true,
        answer: "TEST OK"
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
