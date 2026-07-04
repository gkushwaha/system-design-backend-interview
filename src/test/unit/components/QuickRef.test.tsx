import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { QuickRef } from "@/pages/QuickRef";

describe("QuickRef", () => {
  it("renders the database comparison table with all 5 databases", () => {
    render(<QuickRef />);
    expect(screen.getByText("Database Comparison")).toBeInTheDocument();
    for (const db of ["PostgreSQL (SQL)", "Cassandra", "MongoDB", "Redis", "Elasticsearch"]) {
      expect(screen.getAllByText(db).length).toBeGreaterThanOrEqual(1);
    }
  });

  it("renders the latency numbers section with L1 cache and disk seek rows", () => {
    render(<QuickRef />);
    expect(screen.getByText("Latency Numbers Cheat Sheet")).toBeInTheDocument();
    expect(screen.getByText("0.5 ns")).toBeInTheDocument();
    expect(screen.getByText("10 ms")).toBeInTheDocument();
  });

  it("renders the HTTP status codes section including 429", () => {
    render(<QuickRef />);
    expect(screen.getByText("HTTP Status Codes")).toBeInTheDocument();
    expect(screen.getByText("429")).toBeInTheDocument();
    expect(screen.getByText(/Too Many Requests/)).toBeInTheDocument();
  });

  it("renders all 4 caching patterns", () => {
    render(<QuickRef />);
    expect(screen.getByText("Caching Patterns")).toBeInTheDocument();
    for (const pattern of ["Cache-aside", "Write-through", "Write-back", "Read-through"]) {
      expect(screen.getByText(pattern)).toBeInTheDocument();
    }
  });

  it("renders the capacity estimation formulas section", () => {
    render(<QuickRef />);
    expect(screen.getByText("Capacity Estimation Formulas")).toBeInTheDocument();
  });

  it("renders the CAP theorem real systems section", () => {
    render(<QuickRef />);
    expect(screen.getByText("CAP Theorem — Real Systems")).toBeInTheDocument();
  });

  it("renders common port numbers", () => {
    render(<QuickRef />);
    expect(screen.getByText("Common Port Numbers")).toBeInTheDocument();
    expect(screen.getByText("6379")).toBeInTheDocument(); // Redis
  });
});
