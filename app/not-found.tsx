import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground font-mono flex flex-col items-center justify-center p-4">
      <h1 className="text-6xl font-bold mb-6">404</h1>
      <h2 className="text-2xl mb-8">Project Not Found</h2>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        The project you're looking for doesn't exist or has been moved.
      </p>
      <Link href="/">
        <Button>Return Home</Button>
      </Link>
    </div>
  );
}
