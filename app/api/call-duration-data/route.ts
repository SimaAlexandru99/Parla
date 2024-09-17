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
        { error: "Missing database, startDate, or endDate" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    const client = await connectToDatabase();
    const db = client.db(database);
    const collection = db.collection("calls");

    const records = await collection
      .find({
        day_processed: {
          $gte: start.toISOString(),
          $lte: end.toISOString(),
        },
      })
      .toArray();

    const ranges = [
      { range: "< 10 sec", min: 0, max: 10 },
      { range: "10 - 30 sec", min: 10, max: 30 },
      { range: "30 - 60 sec", min: 30, max: 60 },
      { range: "1 - 3 min", min: 60, max: 180 },
      { range: "3 - 5 min", min: 180, max: 300 },
      { range: "5 - 10 min", min: 300, max: 600 },
      { range: "10 - 20 min", min: 600, max: 1200 },
      { range: "20 - 30 min", min: 1200, max: 1800 },
      { range: "> 30 min", min: 1800, max: Infinity },
    ];

    const durationData = ranges.map((range) => ({
      range: range.range,
      count: records.filter((record) => {
        const duration = record.total_talk_duration.SPEAKER_00; // Assuming `total_talk_duration` is in seconds
        return duration >= range.min && duration < range.max;
      }).length,
    }));

    return NextResponse.json(durationData);
  } catch (error) {
    console.error("Error fetching call duration data:", error);
    return NextResponse.json(
      {
        status: `Error fetching call duration data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
