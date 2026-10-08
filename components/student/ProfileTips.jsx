import { FiZap } from "react-icons/fi";
import { Card } from "@/components/ui/card";

const tips = [
  "Ek clear photo lagayein, is se reviews zyada trustworthy lagte hain.",
  "Headline mein apna goal likhein, jaise “Learning Next.js & Firebase”.",
  "Bio chhoti rakhein: 2-3 lines kaafi hain.",
  "Public name mein real naam use karein, kyun ke yeh reviews par dikhta hai.",
];

export function ProfileTips() {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-transparent p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <FiZap className="text-primary" /> Profile tips
      </h3>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {tips.map((t) => (
          <li key={t} className="flex gap-2">
            <span className="text-primary">•</span>
            {t}
          </li>
        ))}
      </ul>
    </Card>
  );
}
