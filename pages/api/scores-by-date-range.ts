// pages/api/scores-by-date-range.ts
import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/dbUtils";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { database, startDate, endDate } = req.query;

    if (!database || !startDate || !endDate) {
      return res.status(400).json({ error: "Missing database, startDate, or endDate" });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const client = await connectToDatabase();
    const db = client.db(database as string);
    const collection = db.collection("calls");

    const records = await collection
      .find({
        day_processed: {
          $gte: start.toISOString(),
          $lte: end.toISOString(),
        },
      })
      .toArray();

    const scores = records.map((record) => record.score);

    res.status(200).json({ scores });
  } catch (error) {
    console.error("Error fetching scores by date range:", error);
    res.status(500).json({
      status: `Error fetching scores by date range: ${(error as Error).message}`,
    });
  }
};

export default handler;
