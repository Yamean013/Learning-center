import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser, accessibleApplicationIds } from "@/lib/session";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { TutorialPlayer } from "./tutorial-player";

export const dynamic = "force-dynamic";

export default async function TutorialPage(props: PageProps<"/tutorial/[id]">) {
  const { id } = await props.params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tutorial = await prisma.tutorial.findUnique({
    where: { id },
    include: { application: true },
  });
  if (!tutorial) notFound();

  const access = accessibleApplicationIds(user);
  if (access !== "ALL" && !access.includes(tutorial.applicationId)) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 py-10 fade-up">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-2">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Back to tutorials
          </Link>
        </Button>
      </div>

      <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-8">
        {tutorial.title}
      </h1>

      <TutorialPlayer
        id={tutorial.id}
        type={tutorial.type}
        fileUrl={tutorial.fileUrl}
        fileName={tutorial.fileName}
      />
    </main>
  );
}
