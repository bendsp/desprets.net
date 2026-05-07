import { ProjectArticle, getProjectMetadata } from "@/components/project-article";

export const metadata = getProjectMetadata("bedrock");

export default function BedrockPage() {
  return <ProjectArticle slug="bedrock" />;
}
