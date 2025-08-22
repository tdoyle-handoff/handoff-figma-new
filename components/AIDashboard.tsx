import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription } from "./ui/alert";
import { usePropertyContext } from "./PropertyContext";
import { useTaskContext } from "./TaskContext";
import { useAI } from "./AIContext";
import { useIsMobile } from "./ui/use-mobile";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Home,
  Calendar,
  Target,
  Lightbulb,
  ArrowRight,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Star,
  MessageSquare,
  BookOpen,
  Users,
  MapPin,
  FileText,
  Search,
} from "lucide-react";

export function AIDashboard() {
  const propertyContext = usePropertyContext();
  const taskContext = useTaskContext();
  const ai = useAI();
  const isMobile = useIsMobile();

  const [aiAnalysis, setAIAnalysis] = useState<any>(null);
  const [marketInsights, setMarketInsights] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    generateAIAnalysis();
    loadMarketInsights();
    generateRecommendations();
  }, [propertyContext.propertyData, taskContext.tasks]);

  const generateAIAnalysis = () => {
    const progress = ai.analyzeProgress();
    const completion = propertyContext.getCompletionStatus();
    const timeline = propertyContext.getTimelineStatus();
    const tasks = taskContext.tasks || [];

    const completedTasks = tasks.filter((task) => task.completed).length;
    const overdueTasks = tasks.filter(
      (task) =>
        !task.completed &&
        typeof task.dueDate === "string" &&
        new Date(task.dueDate) < new Date(),
    ).length;
    const urgentTasks = tasks.filter(
      (task) =>
        !task.completed &&
        typeof task.dueDate === "string" &&
        new Date(task.dueDate) <=
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    ).length;

    setAIAnalysis({
      overallHealth:
        progress.timelineRisk === "low"
          ? "excellent"
          : progress.timelineRisk === "medium"
            ? "good"
            : "needs-attention",
      completionRate: completion.percentage,
      taskCompletion:
        tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0,
      timelineStatus: {
        daysUntilClosing: timeline.daysUntilClosing,
        risk: progress.timelineRisk,
        overdueTasks,
        urgentTasks,
      },
      keyMetrics: {
        setupComplete: completion.completed,
        hasLender: propertyContext.propertyData?.hasLender || false,
        hasPreApproval: !!propertyContext.propertyData?.preApprovalAmount,
        totalTasks: tasks.length,
        completedTasks,
        blockers: progress.blockers.length,
      },
      nextActions: progress.nextSteps.slice(0, 3),
      insights: [
        ...ai.currentInsights.filter((insight) => insight.priority <= 2),
        ...generateCustomInsights(),
      ],
    });
  };

  const generateCustomInsights = () => {
    const insights = [];
    const data = propertyContext.propertyData;
    const tasks = taskContext.tasks || [];

    // Timeline insights
    if (data?.targetClosingDate) {
      const daysUntil = Math.ceil(
        (new Date(data.targetClosingDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      );
      if (daysUntil <= 30 && !data.hasLender) {
        insights.push({
          type: "warning",
          title: "Urgent: Financing Setup Needed",
          description:
            "With only 30 days until closing, you need to secure financing immediately.",
          action: () => ai.sendMessage("Help me find a lender urgently"),
        });
      }
    }

    // Progress insights
    const completion = propertyContext.getCompletionStatus();
    if (completion.percentage > 80 && tasks.length === 0) {
      insights.push({
        type: "info",
        title: "Ready for Task Generation",
        description:
          "Your profile is complete! I can now generate personalized task lists.",
        action: () => ai.sendMessage("Generate my home buying task list"),
      });
    }

    return insights;
  };

  const loadMarketInsights = async () => {
    if (
      propertyContext.propertyData?.city &&
      propertyContext.propertyData?.state
    ) {
      const location = `${propertyContext.propertyData.city}, ${propertyContext.propertyData.state}`;
      await propertyContext.loadMarketInsights(location);
      setMarketInsights(propertyContext.marketInsights);
    }
  };

  const generateRecommendations = () => {
    const recs = [];
    const data = propertyContext.propertyData;
    const completion = propertyContext.getCompletionStatus();

    if (!data?.hasLender) {
      recs.push({
        id: "get-lender",
        priority: "high",
        title: "Connect with a Mortgage Lender",
        description: "Pre-approval is essential for making competitive offers",
        estimatedTime: "2-3 days",
        action: () => ai.sendMessage("Help me find a mortgage lender"),
        category: "financing",
      });
    }

    if (completion.percentage < 50) {
      recs.push({
        id: "complete-profile",
        priority: "medium",
        title: "Complete Your Property Profile",
        description: "More details help me provide better guidance",
        estimatedTime: "15 minutes",
        action: () =>
          window.dispatchEvent(
            new CustomEvent("navigate", { detail: "property" }),
          ),
        category: "setup",
      });
    }

    if (data?.targetClosingDate && !taskContext.tasks?.length) {
      recs.push({
        id: "generate-tasks",
        priority: "medium",
        title: "Generate Your Task Timeline",
        description: "Get a personalized checklist for your closing date",
        estimatedTime: "5 minutes",
        action: () =>
          window.dispatchEvent(
            new CustomEvent("navigate", { detail: "tasks" }),
          ),
        category: "planning",
      });
    }

    setRecommendations(recs);
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case "excellent":
        return "text-green-600 bg-green-50 border-green-200";
      case "good":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "needs-attention":
        return "text-amber-600 bg-amber-50 border-amber-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case "excellent":
        return <CheckCircle className="w-5 h-5" />;
      case "good":
        return <TrendingUp className="w-5 h-5" />;
      case "needs-attention":
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "financing":
        return <DollarSign className="w-4 h-4" />;
      case "setup":
        return <Home className="w-4 h-4" />;
      case "planning":
        return <Calendar className="w-4 h-4" />;
      case "legal":
        return <FileText className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  if (!aiAnalysis) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <span className="text-lg">
            AI is analyzing your home buying progress...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isMobile ? "p-4" : "p-6"}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            AI Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Personalized insights for your home buying journey
          </p>
        </div>
        <Button
          onClick={() => ai.setChatOpen(true)}
          className="flex items-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          Ask AI
        </Button>
      </div>

      {/* Health Score */}
      <Card className={`border-2 ${getHealthColor(aiAnalysis.overallHealth)}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            {getHealthIcon(aiAnalysis.overallHealth)}
            Overall Progress Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.round(aiAnalysis.completionRate)}%
              </div>
              <div className="text-sm text-muted-foreground">
                Setup Complete
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.round(aiAnalysis.taskCompletion)}%
              </div>
              <div className="text-sm text-muted-foreground">Tasks Done</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {aiAnalysis.timelineStatus.daysUntilClosing}
              </div>
              <div className="text-sm text-muted-foreground">Days to Close</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {aiAnalysis.keyMetrics.blockers}
              </div>
              <div className="text-sm text-muted-foreground">Blockers</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Property Setup
                </div>
                <div className="font-medium">
                  {aiAnalysis.keyMetrics.setupComplete
                    ? "Complete"
                    : "In Progress"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Financing</div>
                <div className="font-medium">
                  {aiAnalysis.keyMetrics.hasPreApproval
                    ? "Pre-approved"
                    : aiAnalysis.keyMetrics.hasLender
                      ? "In Progress"
                      : "Not Started"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Tasks</div>
                <div className="font-medium">
                  {aiAnalysis.keyMetrics.completedTasks} of{" "}
                  {aiAnalysis.keyMetrics.totalTasks}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  aiAnalysis.timelineStatus.risk === "low"
                    ? "bg-green-100"
                    : aiAnalysis.timelineStatus.risk === "medium"
                      ? "bg-amber-100"
                      : "bg-red-100"
                }`}
              >
                <Clock
                  className={`w-5 h-5 ${
                    aiAnalysis.timelineStatus.risk === "low"
                      ? "text-green-600"
                      : aiAnalysis.timelineStatus.risk === "medium"
                        ? "text-amber-600"
                        : "text-red-600"
                  }`}
                />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Timeline Risk
                </div>
                <div className="font-medium capitalize">
                  {aiAnalysis.timelineStatus.risk}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            AI Recommendations
          </CardTitle>
          <CardDescription>
            Personalized next steps based on your progress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.slice(0, 3).map((rec, index) => (
            <div
              key={rec.id}
              className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  {getCategoryIcon(rec.category)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{rec.title}</h4>
                    <Badge
                      className={getPriorityColor(rec.priority)}
                      variant="outline"
                    >
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {rec.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>⏱️ {rec.estimatedTime}</span>
                    <span>📋 {rec.category}</span>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                onClick={rec.action}
                className="flex items-center gap-1"
              >
                Start
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          ))}

          {recommendations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Great job! No urgent recommendations at the moment.</p>
              <p className="text-sm">
                Keep up the excellent progress on your home buying journey.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Actions */}
      {aiAnalysis.nextActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Your Next Actions
            </CardTitle>
            <CardDescription>
              Priority items to keep your timeline on track
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiAnalysis.nextActions.map((action: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                >
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <span className="flex-1">{action}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => ai.sendMessage(`Help me with: ${action}`)}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Market Insights */}
      {marketInsights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-500" />
              Market Insights
            </CardTitle>
            <CardDescription>
              AI analysis of your local real estate market
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {marketInsights.averagePrice.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Average Price
                </div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {marketInsights.daysOnMarket}
                </div>
                <div className="text-sm text-muted-foreground">
                  Days on Market
                </div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div
                  className={`text-2xl font-bold capitalize ${
                    marketInsights.marketTrend === "rising"
                      ? "text-green-600"
                      : marketInsights.marketTrend === "falling"
                        ? "text-red-600"
                        : "text-blue-600"
                  }`}
                >
                  {marketInsights.marketTrend}
                </div>
                <div className="text-sm text-muted-foreground">
                  Market Trend
                </div>
              </div>
            </div>

            {marketInsights.recommendedActions && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  AI Market Recommendations
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {marketInsights.recommendedActions.map(
                    (action: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {action}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Insights */}
      {aiAnalysis.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiAnalysis.insights
              .slice(0, 3)
              .map((insight: any, index: number) => (
                <Alert key={index} className="border-l-4 border-l-primary">
                  <AlertTriangle className="w-4 h-4" />
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{insight.title}</h4>
                      <AlertDescription className="mt-1">
                        {insight.description}
                      </AlertDescription>
                    </div>
                    {insight.action && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={insight.action}
                        className="ml-2"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </Alert>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => ai.sendMessage("What should I do next?")}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm">Ask AI</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("navigate", { detail: "tasks" }),
                )
              }
            >
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">View Tasks</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() =>
                ai.sendMessage("Help me understand the home buying process")
              }
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-sm">Learn More</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("navigate", { detail: "team" }),
                )
              }
            >
              <Users className="w-5 h-5" />
              <span className="text-sm">My Team</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
