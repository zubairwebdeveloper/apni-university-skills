// app/student/ai-assistant/page.jsx
import { Bot } from "lucide-react";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import { AIAssistantPage } from "@/components/ai-assistant/AIAssistantPage";

export const metadata = { title: "AI Assistant" };

export default function StudentAIAssistantPage() {
  return (
    <>
      <StudentPageHeader
        eyebrow="Learn"
        icon={Bot}
        title="AI Assistant"
        description="Ask about courses, concepts and code. Your conversations are saved to your account."
      />
      <AIAssistantPage />
    </>
  );
}
