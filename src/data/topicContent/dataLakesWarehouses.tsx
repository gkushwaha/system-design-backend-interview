import { DataLakesWarehouses } from "@/components/visualizations/DataLakesWarehouses";
import type { TopicContent } from "./types";

export const dataLakesWarehouses: TopicContent = {
  visual: DataLakesWarehouses,
  howItWorks: [
    {
      title: "Data warehouse: structure first, then load",
      description:
        "A warehouse (Snowflake, Redshift, BigQuery) requires data to be transformed into a defined schema before loading — schema-on-write. This gives fast, reliable SQL analytics at the cost of upfront transformation work.",
    },
    {
      title: "Data lake: load first, structure later",
      description:
        "A lake stores raw data of any format cheaply in object storage (S3), applying structure only when queried — schema-on-read. This is flexible and cheap, but historically lacked transactional guarantees and fast query performance.",
    },
    {
      title: "The lake's problem: it can become a 'data swamp'",
      description:
        "Without transactional guarantees or enforced schema, a data lake can accumulate inconsistent, undocumented, unreliable data over time — hard to trust for business-critical reporting.",
    },
    {
      title: "Lakehouse: a table format layer on top of lake storage",
      description:
        "Table formats like Delta Lake and Apache Iceberg add ACID transactions, schema enforcement, and time travel on top of cheap object storage — combining the lake's flexibility and cost with the warehouse's reliability.",
      code: "-- Lakehouse: same S3 storage, but with transactional guarantees\nCREATE TABLE events USING DELTA LOCATION 's3://bucket/events';",
    },
    {
      title: "One copy of data serving both BI and ML",
      description:
        "Because a lakehouse can serve fast SQL analytics AND raw-format ML training data from the same underlying storage, it avoids maintaining separate warehouse and lake copies of the same data.",
    },
  ],
  tradeoffs: {
    pros: [
      "Warehouse: fast, reliable, mature tooling for structured SQL analytics",
      "Lake: extremely cheap storage, maximum format flexibility, great for ML/raw data",
      "Lakehouse: gets most of both — reliability and flexibility from one copy of data",
    ],
    cons: [
      "Warehouse: expensive relative to raw storage, and rigid about schema changes",
      "Lake: historically lacked ACID guarantees, easy to turn into an unreliable 'data swamp'",
      "Lakehouse: still a newer paradigm with less mature tooling than decades-old warehouse products",
    ],
    whenToUse: [
      "Warehouse — mature, well-defined BI/reporting needs on structured data",
      "Lake — ML training pipelines, raw/semi-structured data at low cost",
      "Lakehouse — organizations wanting to unify BI and ML on one data copy without duplicating pipelines",
    ],
    whenNotToUse: [
      "Lake alone for business-critical reporting that needs strong consistency guarantees",
      "Warehouse alone for large-scale raw/unstructured ML training data — cost and rigidity become prohibitive",
    ],
    alternatives: [
      { name: "Delta Lake", note: "Databricks' open table format bringing ACID transactions to lake storage" },
      { name: "Apache Iceberg", note: "Vendor-neutral table format with similar goals, wide engine support (Spark, Trino, Flink)" },
    ],
  },
  interviewAnswer: {
    script:
      "I'd frame this as an evolution: warehouses give fast, reliable SQL analytics but require rigid upfront schema and get expensive at raw-data scale. Data lakes solved the cost and flexibility problem with cheap object storage and schema-on-read, but lacked transactional guarantees, which let them degrade into unreliable 'data swamps.' A lakehouse — using a table format like Delta Lake or Iceberg on top of object storage — adds ACID transactions and schema enforcement back on top of lake storage, so one copy of data can reliably serve both BI dashboards and ML training pipelines instead of maintaining separate warehouse and lake copies.",
    mistakes: [
      "Not knowing what made data lakes unreliable before lakehouse table formats existed",
      "Treating these as three unrelated technologies rather than an evolution addressing each other's weaknesses",
      "Not being able to name a real lakehouse table format (Delta Lake, Iceberg)",
    ],
    followUps: [
      "What specifically does a table format like Delta Lake or Iceberg add on top of raw object storage?",
      "Why did data lakes get a reputation as 'data swamps'?",
      "How would you migrate an existing warehouse-only analytics pipeline to a lakehouse architecture?",
    ],
    redFlags: [
      "Not knowing the difference between schema-on-write and schema-on-read",
    ],
  },
  challenge: [
    {
      question: "What key capability does a 'lakehouse' table format (Delta Lake, Iceberg) add on top of plain object storage that a traditional data lake lacked?",
      options: [
        "Cheaper storage",
        "ACID transactions and schema enforcement",
        "The ability to store any file format",
        "Compression",
      ],
      correctIndex: 1,
      explanation:
        "Table formats like Delta Lake and Iceberg add transactional guarantees and schema enforcement on top of cheap object storage — the missing piece that made lakes unreliable for business-critical use.",
    },
    {
      question: "Why is a data warehouse described as 'schema-on-write' while a data lake is 'schema-on-read'?",
      options: [
        "There's no real difference between them",
        "A warehouse requires data to be structured before loading, while a lake applies structure only at query time",
        "Warehouses don't support SQL",
        "Lakes require more upfront transformation than warehouses",
      ],
      correctIndex: 1,
      explanation:
        "A warehouse enforces a defined schema during the load/write process, whereas a lake stores raw data as-is and only interprets/structures it when a query reads it later.",
    },
  ],
};
