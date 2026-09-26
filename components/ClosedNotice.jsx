import { Card } from "@/components/ui";

export default function ClosedNotice({ title, message }) {
  return (
    <div className="pt-10 text-center">
      <Card>
        <div className="font-bold text-base mb-1">{title}</div>
        <p className="text-muted text-[13px]">{message}</p>
      </Card>
    </div>
  );
}
