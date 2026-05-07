import { ProjectArticle, getProjectMetadata } from "@/components/project-article";

export const metadata = getProjectMetadata("fundamental");

export default function FundamentalPage() {
  return <ProjectArticle slug="fundamental" />;
}
