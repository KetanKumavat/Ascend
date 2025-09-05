import ClientExcalidrawWrapper from "../../../../../components/client-excalidraw-wrapper";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

export default async function OrganizationCanvasPage({ params }) {
  const { orgId } = await params;

  if (!orgId) {
    return <div>Organization not found</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6 mt-36 mb-24">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link 
          href={`/organization/${orgId}`}
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <Home className="w-4 h-4" />
          Organization
        </Link>
        <span>/</span>
        <span className="text-foreground">Canvas</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/organization/${orgId}`}>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Organization
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Organization Canvas</h1>
            <p className="text-muted-foreground mt-2">
              Collaborate with your team on visual planning and brainstorming
            </p>
          </div>
        </div>
      </div>

      <ClientExcalidrawWrapper
        organizationId={orgId}
        title="Organization Canvas"
        readOnly={false}
      />
    </div>
  );
}
