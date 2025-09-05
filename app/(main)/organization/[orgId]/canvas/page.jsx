import ClientExcalidrawWrapper from "../../../../../components/client-excalidraw-wrapper";

export default async function OrganizationCanvasPage({ params }) {
  const { orgId } = await params;

  if (!orgId) {
    return <div>Organization not found</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organization Canvas</h1>
          <p className="text-muted-foreground mt-2">
            Collaborate with your team on visual planning and brainstorming
          </p>
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
