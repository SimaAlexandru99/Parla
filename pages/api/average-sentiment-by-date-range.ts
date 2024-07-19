// pages/api/average-sentiment-by-date-range.ts
import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/dbUtils";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { database, startDate, endDate } = req.query;

    if (!database || !startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Missing database, startDate, or endDate" });
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

    const totalSentiment = records.reduce(
      (acc, record) => acc + record.average_sentiment,
      0
    );
    const averageSentiment = records.length
      ? totalSentiment / records.length
      : null;

    res.status(200).json({ averageSentiment });
  } catch (error) {
    console.error("Error fetching average sentiment by date range:", error);
    res.status(500).json({
      status: `Error fetching average sentiment by date range: ${
        (error as Error).message
      }`,
    });
  }
};

export default handler;
