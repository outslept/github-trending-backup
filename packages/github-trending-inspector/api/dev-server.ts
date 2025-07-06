import process from "node:process";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { fetchMetadata, fetchMonthData } from "./lib/github";

const app = new Hono();

app.use("*", cors());

// Metadata endpoint
app.get("/api/trending/metadata", async (c) => {
  const month = c.req.query("month");

  if (!month) {
    return c.json({ error: "Month parameter is required" }, 400);
  }

  try {
    const metadata = await fetchMetadata(month);
    return c.json({ month, ...metadata });
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return c.json({ month, availableDates: [], totalDays: 0 });
  }
});

// Dynamic trending endpoint
app.get("/api/trending/:slug", async (c) => {
  const slug = c.req.param("slug");
  const page = Number.parseInt(c.req.query("page") || "1");
  const limit = Number.parseInt(c.req.query("limit") || "5");

  // Handle YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(slug)) {
    const date = slug;
    const month = date.split("-").slice(0, 2).join("-");

    try {
      const data = await fetchMonthData(month, 1, 1, date);
      return c.json({ month, repositories: data.repositories });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch data";
      const status = message === "Date not found" ? 404 : 500;
      return c.json({ error: message }, status);
    }
  }

  // Handle YYYY-MM format
  if (/^\d{4}-\d{2}$/.test(slug)) {
    const month = slug;

    try {
      const data = await fetchMonthData(month, page, limit);
      return c.json({
        month,
        repositories: data.repositories,
        pagination: { page: data.currentPage, totalPages: data.totalPages },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch data";
      return c.json({ error: message }, 500);
    }
  }

  return c.json(
    {
      error: "Invalid endpoint. Use: metadata, YYYY-MM, or YYYY-MM-DD",
    },
    404,
  );
});

const port = Number.parseInt(process.env.PORT || "3001");

serve({ fetch: app.fetch, port }, () => {
  // eslint-disable-next-line no-console
  console.log(`Dev server running on http://localhost:${port}`);
});
