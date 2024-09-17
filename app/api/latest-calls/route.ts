import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/dbUtils";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const database = searchParams.get("database");
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";

  if (!database) {
    return NextResponse.json(
      { error: "Invalid database parameter" },
      { status: 400 }
    );
  }

  try {
    const client = await connectToDatabase();
    const db = client.db(database);
    const collection = db.collection("calls");

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    if (
      isNaN(pageNumber) ||
      isNaN(limitNumber) ||
      pageNumber < 1 ||
      limitNumber < 1
    ) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    const skip = (pageNumber - 1) * limitNumber;
    const latestCalls = await collection
      .find()
      .sort({ day_processed: -1 })
      .skip(skip)
      .limit(limitNumber)
      .toArray();

    const totalCalls = await collection.countDocuments();

    return NextResponse.json({ latestCalls, totalCalls });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      {
        error: `Error processing request: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const database = searchParams.get("database");
  const id = searchParams.get("id");

  if (!database) {
    return NextResponse.json(
      { error: "Invalid database parameter" },
      { status: 400 }
    );
  }

  if (!id) {
    return NextResponse.json({ error: "Invalid call ID" }, { status: 400 });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db(database);
    const collection = db.collection("calls");

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      return NextResponse.json({ message: "Call deleted successfully" });
    } else {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      {
        error: `Error processing request: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
