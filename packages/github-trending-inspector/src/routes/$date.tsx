import { createFileRoute, notFound } from "@tanstack/react-router";
import { AppSidebar } from "../components/app-sidebar";
import { DailyTrending } from "../components/daily-trending";

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
    <div className="flex min-h-screen">
      <AppSidebar selectedDate={new Date(date)} />
      <div className="flex flex-col flex-1 min-w-0">
        <div className="container mx-auto px-4 py-6">
          <DailyTrending date={date} />
        </div>
      </div>
    </div>
  );
}
