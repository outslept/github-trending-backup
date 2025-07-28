import { createFileRoute, notFound } from "@tanstack/react-router";
import { Suspense } from "react";

import { AppSidebar } from "../components/app-sidebar";
import { DailyTrending } from "../components/daily-trending";
import { TrendingSkeleton } from "../components/skeletons";
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar";

export const Route = createFileRoute("/$date")({
  validateSearch: (search) => search,
  beforeLoad: ({ params }) => {
    const { date } = params;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(date)) {
      throw notFound();
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      throw notFound();
    }
  },
  component: DatePage,
});

function DatePage() {
  const { date } = Route.useParams();

  return (
    <SidebarProvider
      defaultOpen={true}
      style={
        {
          "--sidebar-width": "18rem",
          "--sidebar-width-mobile": "18rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar selectedDate={new Date(date)} />
      <SidebarInset>
        <div className="w-[85%] max-w-none mx-auto py-6">
          <Suspense fallback={<TrendingSkeleton />}>
            <DailyTrending date={date} />
          </Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
