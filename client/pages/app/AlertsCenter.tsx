import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Alert } from "@shared/types";

const categoryIcons: Record<string, string> = {
  usage_growth: "📈",
  cost_risk: "💰",
  architecture_drift: "🏗️",
  platform_suitability: "🎯",
  stability_regression: "⚠️",
};

const severityStyles: Record<string, string> = {
  informational: "border-l-blue-400",
  heads_up: "border-l-yellow-400",
  action_soon: "border-l-red-400",
};

export default function AlertsCenter() {
  const [searchParams] = useSearchParams();
  const analysisId = searchParams.get("analysisId");

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const limit = 10;

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(page * limit),
      });
      if (analysisId) params.set("analysisId", analysisId);

      const response = await fetch(`/api/alerts?${params}`);
      const data = await response.json();

      setAlerts(data.alerts || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [page, analysisId]);

  const markAsRead = async (alertId: string) => {
    try {
      await fetch(`/api/alerts/${alertId}/read`, { method: "PATCH" });
      setAlerts(prev =>
        prev.map(a => a.id === alertId ? { ...a, read_at: new Date().toISOString() } : a)
      );
    } catch (error) {
      console.error("Failed to mark alert as read:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: "short", day: "numeric", year: "numeric"
    });
  };

  return (
    <AppShell showNav>
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Alerts</h1>
            <p className="text-muted-foreground">
              {total} alert{total !== 1 ? "s" : ""} total
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading alerts...
          </div>
        ) : alerts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="font-medium mb-2">No alerts yet</h3>
              <p className="text-sm text-muted-foreground">
                We'll notify you when something important changes
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card
                key={alert.id}
                className={`border-l-4 ${severityStyles[alert.severity]} cursor-pointer transition-opacity ${
                  alert.read_at ? "opacity-60" : ""
                }`}
                onClick={() => !alert.read_at && markAsRead(alert.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{categoryIcons[alert.category]}</span>
                      <CardTitle className="text-lg">{alert.title}</CardTitle>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(alert.created_at)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{alert.body}</p>

                  {(alert.what_changed || alert.next_step) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {alert.what_changed && (
                        <div className="bg-muted/50 rounded-lg p-3">
                          <span className="font-medium">What changed:</span>
                          <p className="text-muted-foreground">{alert.what_changed}</p>
                        </div>
                      )}
                      {alert.next_step && (
                        <div className="bg-primary/5 rounded-lg p-3">
                          <span className="font-medium">Next step:</span>
                          <p className="text-muted-foreground">{alert.next_step}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {!alert.read_at && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-primary">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      New
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {total > limit && (
              <div className="flex justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Page {page + 1} of {Math.ceil(total / limit)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={(page + 1) * limit >= total}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
