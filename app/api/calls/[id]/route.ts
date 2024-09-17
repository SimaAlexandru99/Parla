import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/dbUtils";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const database = searchParams.get("database");
  const id = params.id;

  if (!database) {
    return NextResponse.json(
      { message: "Database parameter is required" },
      { status: 400 }
    );
  }

  try {
    const client = await connectToDatabase();
    const db = client.db(database);
    const callsCollection = db.collection("calls");

    const call = await callsCollection.findOne({ _id: new ObjectId(id) });

    if (!call) {
      return NextResponse.json({ message: "Call not found" }, { status: 404 });
    }

    const callDetails = {
      ...call,
      _id: call._id.toString(),
    };

    return NextResponse.json(callDetails);
  } catch (error) {
    console.error("Error fetching call details:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
