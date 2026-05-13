import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/layout/Header";

export default function DecksLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-36" />
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </main>
    </div>
  );
}
