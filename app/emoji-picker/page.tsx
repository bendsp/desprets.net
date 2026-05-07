import { ProjectArticle, getProjectMetadata } from "@/components/project-article";

export const metadata = getProjectMetadata("emoji-picker");

export default function EmojiPickerPage() {
  return <ProjectArticle slug="emoji-picker" />;
}
