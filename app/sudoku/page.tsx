import { ProjectArticle, getProjectMetadata } from "@/components/project-article";

export const metadata = getProjectMetadata("sudoku");

export default function SudokuPage() {
  return <ProjectArticle slug="sudoku" />;
}
