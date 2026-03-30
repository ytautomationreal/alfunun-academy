import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    description: string;
}

export default function KPICard({ title, value, icon: Icon, description }: KPICardProps) {
    return (
        <Card className="border-white/5 bg-zinc-900/50 h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-cyan-500" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-start justify-center text-left">
                <div className="text-3xl font-bold text-white mb-1">{value}</div>
                <p className="text-xs text-zinc-500">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}
