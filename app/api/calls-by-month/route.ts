import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/dbUtils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const database = searchParams.get("database");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!database || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Invalid query parameters" },
        { status: 400 }
      );
    }

    const client = await connectToDatabase();
    const db = client.db(database);
    const collection = db.collection("calls");

    const pipeline = [
      {
        $addFields: {
          day_processed_date: {
            $dateFromString: { dateString: "$day_processed" },
          },
        },
      },
      {
        $match: {
          day_processed_date: {
            $gte: new Date(startDate),
            $lt: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$day_processed_date" },
            year: { $year: "$day_processed_date" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ];

    const results = await collection.aggregate(pipeline).toArray();

    console.log("API Results:", results); // Log the results

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching call data by month:", error);
    return NextResponse.json(
      {
        status: `Error fetching call data by month: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
