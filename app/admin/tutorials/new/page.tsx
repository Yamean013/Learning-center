import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { NewTutorialForm } from "./new-tutorial-form";

export default async function NewTutorialPage() {
  const apps = await prisma.application.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="max-w-2xl mx-auto">
      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2 gap-1.5">
        <Link href="/admin/tutorials">
          <ArrowLeft className="h-4 w-4" /> Back to tutorials
        </Link>
      </Button>
      <h1 className="font-display text-3xl font-bold tracking-tight mb-2">Add tutorial</h1>
      <p className="text-muted-foreground mb-8">
        Upload a video or PDF guide and link it to an application.
      </p>
      <NewTutorialForm applications={apps} />
    </div>
  );
}
