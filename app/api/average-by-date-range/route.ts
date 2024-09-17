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

    const client = await connectToDatabase();
    const db = client.db(database);
    const collection = db.collection("calls");

    const start = new Date(startDate);
    const end = new Date(endDate);

    const pipeline = [
      {
        $match: {
          day_processed: {
            $gte: start.toISOString(),
            $lte: end.toISOString(),
          },
        },
      },
      {
        $group: {
          _id: null,
          averageDuration: { $avg: "$file_info.duration" },
        },
      },
    ];

    const [result] = await collection.aggregate(pipeline).toArray();
    const averageDurationInSeconds = result?.averageDuration || 0;
    const averageDurationText = formatDuration(averageDurationInSeconds);

    return NextResponse.json({ averageDurationText, averageDurationInSeconds });
  } catch (error) {
    console.error("Error calculating average audio duration:", error);
    return NextResponse.json(
      {
        status: `Error calculating average audio duration: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}

const formatDuration = (durationInSeconds: number) => {
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = Math.floor(durationInSeconds % 60);
  return `${minutes} m ${seconds} s`;
};
