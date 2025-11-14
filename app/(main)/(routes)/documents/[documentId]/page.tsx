import { use } from "react";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { DocumentIdClient } from "./document-id-client";

interface DocumentIdPageProps {
  params: Promise<{
    documentId: Id<"documents">;
  }>;
}

const DocumentIdPage = ({ params }: DocumentIdPageProps) => {
  const { documentId } = use(params);

  return <DocumentIdClient documentId={documentId} />;
};

export default DocumentIdPage;
