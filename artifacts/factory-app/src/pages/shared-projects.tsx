import { useListSharedProjects } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Factory, Boxes } from "lucide-react";

export default function SharedProjects() {
  const { data: projects, isLoading } = useListSharedProjects();

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">المشاريع المشتركة</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects?.map((project, idx) => (
          <Card key={idx} className="bg-card border-border">
            <CardHeader className="pb-2 border-b border-border/50">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl text-primary">{project.client}</CardTitle>
                <Badge variant={project.combinedCompletionPct === 100 ? "default" : "secondary"}>
                  {project.combinedCompletionPct}% إجمالي
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <Factory className="h-4 w-4 text-muted-foreground" />
                    <span>معدني ({project.metalOrderCount} أمر)</span>
                  </div>
                  <span className="font-medium">{project.metalCompletionPct}%</span>
                </div>
                <Progress value={project.metalCompletionPct} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <Boxes className="h-4 w-4 text-muted-foreground" />
                    <span>خشبي ({project.woodenOrderCount} أمر)</span>
                  </div>
                  <span className="font-medium">{project.woodenCompletionPct}%</span>
                </div>
                <Progress value={project.woodenCompletionPct} className="h-2" />
              </div>
              
              {Math.abs((project.metalCompletionPct || 0) - (project.woodenCompletionPct || 0)) > 20 && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">
                  تنبيه: يوجد تفاوت كبير في نسب الإنجاز بين المصنعين مما قد يؤثر على موعد التسليم النهائي للعميل.
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {projects?.length === 0 && (
          <div className="col-span-full p-12 text-center text-muted-foreground border border-dashed rounded-lg">
            لا توجد مشاريع مشتركة حالياً
          </div>
        )}
      </div>
    </div>
  );
}
