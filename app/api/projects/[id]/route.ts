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
    const projectsCollection = db.collection("projects");
    const agentsCollection = db.collection("agents");

    const project = await projectsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    const agentsCount = await agentsCollection.countDocuments({
      project: project.project_name,
    });

    const projectDetails = {
      ...project,
      _id: project._id.toString(),
      agentsCount,
    };

    return NextResponse.json(projectDetails);
  } catch (error) {
    console.error("Error handling project details:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const updates = await request.json();

    const client = await connectToDatabase();
    const db = client.db(database);
    const projectsCollection = db.collection("projects");
    const agentsCollection = db.collection("agents");

    const updatedProject = await projectsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: "after" }
    );

    if (!updatedProject) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    const agentsCount = await agentsCollection.countDocuments({
      project: updatedProject.project_name,
    });

    const projectDetails = {
      ...updatedProject,
      _id: updatedProject._id.toString(),
      agentsCount,
    };

    return NextResponse.json(projectDetails);
  } catch (error) {
    console.error("Error handling project details:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
