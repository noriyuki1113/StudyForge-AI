import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { BookOpen } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-secondary/30">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">StudyForge AI</h1>
          <p className="text-muted-foreground text-sm">アカウントにログイン</p>
        </div>
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
