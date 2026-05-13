import { SignupForm } from "@/components/auth/SignupForm";
import { BookOpen } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-secondary/30">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">StudyForge AI</h1>
          <p className="text-muted-foreground text-sm">無料アカウントを作成</p>
        </div>
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
