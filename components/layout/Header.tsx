"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, LogOut, PlusCircle, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";

export function Header() {
  const { user } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary">
          <BookOpen className="h-5 w-5" />
          <span>StudyForge AI</span>
        </Link>

        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/decks">
                  <Library className="h-4 w-4 mr-1" />
                  デッキ一覧
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/generate">
                  <PlusCircle className="h-4 w-4 mr-1" />
                  新規作成
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} aria-label="ログアウト">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">ログイン</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/signup">はじめる</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
