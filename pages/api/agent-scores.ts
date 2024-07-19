import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from "@/lib/dbUtils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { database, username } = req.query;

  if (typeof database !== 'string' || typeof username !== 'string') {
    return res.status(400).json({ message: 'Invalid query parameters' });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db(database);
    const collection = db.collection('calls');

    // Aggregate scores by month for the specific agent
    const result = await collection.aggregate([
      { $match: { "agent_info.username": username } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$day_processed" } } },
          averageScore: { $avg: "$score" }
        }
      },
      { $sort: { "_id": 1 } },
      {
        $project: {
          _id: 0,
          month: "$_id",
          score: { $round: ["$averageScore", 2] }
        }
      }
    ]).toArray();

    // If no results, return an empty array
    if (result.length === 0) {
      return res.status(200).json([]);
    }

    // Return the results
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching agent scores:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}