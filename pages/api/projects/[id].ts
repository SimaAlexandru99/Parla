import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/dbUtils";
import { ObjectId } from "mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id, database } = req.query;

  if (req.method !== "GET" && req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  if (!database || typeof database !== "string") {
    return res.status(400).json({ message: "Database parameter is required" });
  }

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Project ID is required" });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db(database);
    const projectsCollection = db.collection("projects");
    const agentsCollection = db.collection("agents");

    if (req.method === "GET") {
      const project = await projectsCollection.findOne({
        _id: new ObjectId(id),
      });

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const agentsCount = await agentsCollection.countDocuments({
        project: project.project_name,
      });

      const projectDetails = {
        ...project,
        _id: project._id.toString(),
        agentsCount,
      };

      res.status(200).json(projectDetails);
    } else if (req.method === "PUT") {
      const updates = req.body;

      const updatedProject = await projectsCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updates },
        { returnDocument: 'after' }
      );

      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }

      const agentsCount = await agentsCollection.countDocuments({
        project: updatedProject.project_name,
      });

      const projectDetails = {
        ...updatedProject,
        _id: updatedProject._id.toString(),
        agentsCount,
      };

      res.status(200).json(projectDetails);
    }
  } catch (error) {
    console.error("Error handling project details:", error);
    if (error instanceof Error) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}