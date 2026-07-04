import { ColumnOrientedStorage } from "@/components/visualizations/ColumnOrientedStorage";
import type { TopicContent } from "./types";

export const columnOrientedStorage: TopicContent = {
  visual: ColumnOrientedStorage,
  howItWorks: [
    {
      title: "Row stores lay out data record by record",
      description:
        "In a traditional row-oriented database (Postgres, MySQL), all columns of one row are stored physically together — ideal when you typically read/write whole records at once.",
    },
    {
      title: "Column stores lay out data column by column",
      description:
        "A column-oriented format (Parquet, column-store databases) groups all values of a single column together on disk, across every row — ideal when a query only touches a handful of columns out of many.",
      code: "-- Row store: id1,name1,age1,city1 | id2,name2,age2,city2 | ...\n-- Column store: id1,id2,id3,... | name1,name2,name3,... | age1,age2,age3,...",
    },
    {
      title: "Analytical queries touch few columns, many rows",
      description:
        "A query like `AVG(age)` across millions of rows only needs the age column. A column store reads just that column's data; a row store must read every column of every row and discard the rest.",
    },
    {
      title: "Compression is far more effective per-column",
      description:
        "Values within a single column tend to be similar or repetitive (many rows sharing a city, a status, a category), which compresses extremely well — much better than compressing mixed-type rows.",
    },
    {
      title: "The tradeoff: writing or reading a full row gets slower",
      description:
        "Reconstructing one full row (or inserting one new row) in a column store means touching every column's separate storage — the opposite of a row store's strength.",
    },
  ],
  tradeoffs: {
    pros: [
      "Dramatically faster for analytical queries scanning few columns across many rows",
      "Much better compression ratios due to similar data being stored contiguously",
      "Well suited to append-heavy, rarely-updated analytical datasets",
    ],
    cons: [
      "Slower for transactional workloads needing to read or write entire rows frequently",
      "Point updates to a single row are more expensive — touching many separate column files",
      "Not a good fit for OLTP systems with many small, targeted row-level writes",
    ],
    whenToUse: [
      "Data warehouses and analytical (OLAP) workloads: aggregations, reporting, BI dashboards",
      "Large-scale log/event storage queried by a few fields at a time (Parquet on a data lake)",
    ],
    whenNotToUse: [
      "Transactional (OLTP) systems needing fast full-row reads/writes — a user profile lookup, an order update",
      "Workloads with frequent small single-row inserts/updates rather than bulk analytical scans",
    ],
    alternatives: [
      { name: "Row store (Postgres, MySQL)", note: "Better fit for OLTP workloads needing fast whole-record access" },
      { name: "HTAP databases", note: "Attempt to serve both OLTP and OLAP well from one system (e.g. TiDB)" },
    ],
  },
  interviewAnswer: {
    script:
      "I'd choose column-oriented storage for analytical workloads — a data warehouse or reporting pipeline that runs aggregate queries like averages and sums across millions of rows but only touches a few columns per query. The win is twofold: I/O is reduced because only the relevant columns are read from disk, and compression is far more effective since values within a single column are typically similar. I'd explicitly contrast this with a transactional system needing fast full-row reads and writes, like a user profile service, where a row store is the better fit since it keeps all of a record's fields together.",
    mistakes: [
      "Not connecting the column-store benefit specifically to analytical (few-columns, many-rows) query patterns",
      "Suggesting column stores for OLTP workloads with frequent single-row updates",
      "Not mentioning the compression benefit as a first-class advantage, not just an I/O one",
    ],
    followUps: [
      "Why is compression more effective in a column-oriented format?",
      "What makes updating a single row more expensive in a column store?",
      "What is HTAP and how does it try to get the benefits of both models?",
    ],
    redFlags: [
      "Not knowing a real example of a column-oriented format or database (Parquet, Redshift, ClickHouse)",
    ],
  },
  challenge: [
    {
      question: "Why is a column store typically much faster than a row store for a query like AVG(age) across millions of rows?",
      options: [
        "Column stores use faster disks",
        "It only needs to read the age column's data, not every column of every row",
        "Row stores don't support aggregate functions",
        "Column stores don't store data on disk at all",
      ],
      correctIndex: 1,
      explanation:
        "Since a column store groups each column's values together, an aggregate query touching one column only reads that column's data — a row store would have to read every column of every row to get the same result.",
    },
    {
      question: "What is the main downside of column-oriented storage compared to row-oriented storage?",
      options: [
        "It can't compress data",
        "Reading or writing a complete single row becomes more expensive, since each column is stored separately",
        "It can't be queried with SQL",
        "It requires more total disk space than row storage",
      ],
      correctIndex: 1,
      explanation:
        "Reconstructing or updating one full row means touching many separate column-specific storage segments, which is the opposite of what row stores are optimized for.",
    },
  ],
};
