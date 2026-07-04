import { Building2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function CompanyNote({ company, note }: { company: string; note: string }) {
  return (
    <Card className="border-success/25 bg-success/5">
      <div className="mb-2 flex items-center gap-2">
        <Building2 size={16} className="text-success" />
        <Badge tone="success">What {company} actually built</Badge>
      </div>
      <p className="text-sm text-text">{note}</p>
    </Card>
  );
}
