import { Card, CardContent } from "@factory/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useFactoryTranslation } from "../../lib/useFactoryTranslation";

export default function NotFound() {
  const { ft } = useFactoryTranslation();
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">{ft("notFound.title")}</h1>
          </div>
          <p className="mt-4 text-sm text-gray-600">{ft("notFound.hint")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
