import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/dbUtils";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { database, startDate, endDate } = req.query;

    if (typeof database !== 'string' || typeof startDate !== 'string' || typeof endDate !== 'string') {
      res.status(400).json({ error: 'Invalid query parameters' });
      return;
    }

    const client = await connectToDatabase();
    const db = client.db(database);
    const collection = db.collection("calls");

    const pipeline = [
      {
        $addFields: {
          day_processed_date: { $dateFromString: { dateString: "$day_processed" } }
        }
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

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching call data by month:", error);
    res.status(500).json({
      status: `Error fetching call data by month: ${(error as Error).message}`,
    });
  }
};

export default handler;
