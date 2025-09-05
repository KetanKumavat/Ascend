import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { getCachedUser } from "@/lib/user-utils";

export async function GET(request) {
  try {
    const { userId, orgId } = await auth();
    
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    const projectId = searchParams.get("projectId");
    const canvasId = searchParams.get("canvasId");

    if (!organizationId) {
      return NextResponse.json({ error: "Organization ID required" }, { status: 400 });
    }

    // Verify user belongs to organization
    if (organizationId !== orgId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    let canvas;

    if (canvasId) {
      // Get specific canvas with org check in query
      canvas = await db.canvas.findFirst({
        where: { 
          id: canvasId,
          organizationId: organizationId
        },
        select: {
          id: true,
          title: true,
          elements: true,
          appState: true,
          organizationId: true,
          projectId: true,
          createdAt: true,
          updatedAt: true,
          createdBy: {
            select: { id: true, name: true, email: true }
          },
          project: {
            select: { id: true, name: true }
          }
        }
      });
    } else {
      // Get or create default canvas for organization/project
      const whereClause = {
        organizationId: organizationId,
        ...(projectId ? { projectId } : { projectId: null }),
        isDefault: true
      };

      canvas = await db.canvas.findFirst({
        where: whereClause,
        select: {
          id: true,
          title: true,
          elements: true,
          appState: true,
          organizationId: true,
          projectId: true,
          createdAt: true,
          updatedAt: true,
          createdBy: {
            select: { id: true, name: true, email: true }
          },
          project: {
            select: { id: true, name: true }
          }
        }
      });

      // Create default canvas if it doesn't exist
      if (!canvas) {
        const user = await getCachedUser(userId);

        if (!user) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        canvas = await db.canvas.create({
          data: {
            title: projectId ? "Project Canvas" : "Organization Canvas",
            elements: JSON.stringify([]),
            appState: JSON.stringify({}),
            organizationId: organizationId,
            projectId: projectId || null,
            createdById: user.id,
            isDefault: true
          },
          select: {
            id: true,
            title: true,
            elements: true,
            appState: true,
            organizationId: true,
            projectId: true,
            createdAt: true,
            updatedAt: true,
            createdBy: {
              select: { id: true, name: true, email: true }
            },
            project: {
              select: { id: true, name: true }
            }
          }
        });
      }
    }

    if (!canvas) {
      return NextResponse.json({ error: "Canvas not found" }, { status: 404 });
    }

    // Parse JSON data with error handling
    let elements = [];
    let appState = {};
    
    try {
      elements = canvas.elements ? JSON.parse(canvas.elements) : [];
    } catch (error) {
      console.warn('Invalid JSON in canvas elements:', error);
      elements = [];
    }
    
    try {
      appState = canvas.appState ? JSON.parse(canvas.appState) : {};
    } catch (error) {
      console.warn('Invalid JSON in canvas appState:', error);
      appState = {};
    }

    // Get active collaborators (mock data for now - in real app you'd track this)
    const collaborators = [
      { id: userId, name: "You", isActive: true }
    ];

    return NextResponse.json({
      id: canvas.id,
      title: canvas.title,
      elements,
      appState,
      collaborators,
      createdBy: canvas.createdBy,
      project: canvas.project,
      createdAt: canvas.createdAt,
      updatedAt: canvas.updatedAt,
      isDefault: canvas.isDefault
    });

  } catch (error) {
    console.error("Error fetching canvas:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { userId, orgId } = await auth();
    
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      organizationId, 
      projectId, 
      canvasId, 
      elements, 
      appState, 
      title 
    } = body;

    if (!organizationId) {
      return NextResponse.json({ error: "Organization ID required" }, { status: 400 });
    }

    // Verify user belongs to organization
    if (organizationId !== orgId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let canvas;

    if (canvasId) {
      // Update existing canvas
      canvas = await db.canvas.update({
        where: { 
          id: canvasId,
          organizationId: organizationId
        },
        data: {
          elements: JSON.stringify(elements || []),
          appState: JSON.stringify(appState || {}),
          title: title || canvas?.title
        }
      });
    } else {
      // Create new canvas or update default
      const whereClause = {
        organizationId: organizationId,
        ...(projectId ? { projectId } : { projectId: null }),
        isDefault: true
      };

      // Try to find existing default canvas
      const existingCanvas = await db.canvas.findFirst({
        where: whereClause
      });

      if (existingCanvas) {
        // Update existing default canvas
        canvas = await db.canvas.update({
          where: { id: existingCanvas.id },
          data: {
            elements: JSON.stringify(elements || []),
            appState: JSON.stringify(appState || {}),
            title: title || existingCanvas.title
          }
        });
      } else {
        // Create new default canvas
        canvas = await db.canvas.create({
          data: {
            title: title || (projectId ? "Project Canvas" : "Organization Canvas"),
            elements: JSON.stringify(elements || []),
            appState: JSON.stringify(appState || {}),
            organizationId: organizationId,
            projectId: projectId || null,
            createdById: user.id,
            isDefault: true
          }
        });
      }
    }

    return NextResponse.json({
      id: canvas.id,
      message: "Canvas saved successfully",
      updatedAt: canvas.updatedAt
    });

  } catch (error) {
    console.error("Error saving canvas:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { userId, orgId } = await auth();
    
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const canvasId = searchParams.get("canvasId");
    const organizationId = searchParams.get("organizationId");

    if (!canvasId || !organizationId) {
      return NextResponse.json({ error: "Canvas ID and Organization ID required" }, { status: 400 });
    }

    // Verify user belongs to organization
    if (organizationId !== orgId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Don't allow deletion of default canvases
    const canvas = await db.canvas.findUnique({
      where: { 
        id: canvasId,
        organizationId: organizationId
      }
    });

    if (!canvas) {
      return NextResponse.json({ error: "Canvas not found" }, { status: 404 });
    }

    if (canvas.isDefault) {
      return NextResponse.json({ error: "Cannot delete default canvas" }, { status: 400 });
    }

    await db.canvas.delete({
      where: { 
        id: canvasId,
        organizationId: organizationId
      }
    });

    return NextResponse.json({ message: "Canvas deleted successfully" });

  } catch (error) {
    console.error("Error deleting canvas:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
