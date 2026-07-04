import { GeospatialIndexing } from "@/components/visualizations/GeospatialIndexing";
import type { TopicContent } from "./types";

export const geospatialIndexing: TopicContent = {
  visual: GeospatialIndexing,
  howItWorks: [
    {
      title: "GeoHash: encode 2D coordinates into a 1D string",
      description:
        "GeoHash recursively divides the world into a grid, interleaving latitude and longitude bits into a single string. Each additional character narrows the area, and nearby locations tend to share a common prefix.",
      code: "encode(37.7749, -122.4194) → \"9q8yy\" (San Francisco, ~5km precision)",
    },
    {
      title: "QuadTree: a tree of recursively subdivided regions",
      description:
        "A QuadTree recursively splits a 2D space into four quadrants, only subdividing further where points are dense — giving finer resolution in crowded areas and coarser resolution in sparse ones.",
    },
    {
      title: "Nearby queries become prefix/range queries",
      description:
        "With GeoHash, 'find things near me' becomes a database range/prefix query on the encoded string — a task databases are already good at indexing, no custom geo-index engine required.",
      code: "SELECT * FROM drivers WHERE geohash LIKE '9q8yy%';",
    },
    {
      title: "The edge case: boundary discontinuity",
      description:
        "Two points can be physically very close but fall on opposite sides of a grid boundary, ending up with very different geohash prefixes — real systems check neighboring cells too, not just an exact prefix match.",
    },
    {
      title: "H3 and S2: modern alternatives",
      description:
        "Uber's H3 (hexagonal grid) and Google's S2 (spherical geometry) solve some of GeoHash's distortion and boundary issues, at the cost of more complex encoding.",
    },
  ],
  tradeoffs: {
    pros: [
      "Turns a 2D nearest-neighbor problem into a simple, indexable string prefix/range query",
      "GeoHash strings are compact and human-shareable (a whole location in one short string)",
      "QuadTrees adapt resolution to data density automatically",
    ],
    cons: [
      "GeoHash suffers from boundary discontinuity — nearby points can have very different prefixes",
      "Grid-based systems distort distances near the poles or across cell boundaries",
      "Choosing the right precision (string length / tree depth) requires tuning per use case",
    ],
    whenToUse: [
      "Location-based search: nearby restaurants, nearby drivers, geofencing",
      "Any system needing to index and query millions of moving or static geographic points efficiently",
    ],
    whenNotToUse: [
      "Applications needing precise, distortion-free distance calculations (use proper geodesic math instead)",
      "Very small-scale, low-query-volume systems where a simple bounding-box SQL query is sufficient",
    ],
    alternatives: [
      { name: "Uber H3", note: "Hexagonal hierarchical grid — no distance distortion from square-grid corners, popular for ride-hailing" },
      { name: "Google S2", note: "Maps the sphere onto cube faces for more geometrically accurate cells" },
      { name: "R-tree", note: "Indexes bounding boxes directly rather than encoding points into a linear string" },
    ],
  },
  interviewAnswer: {
    script:
      "For a 'find nearby drivers' style feature, I'd encode each driver's location as a GeoHash and store it as an indexed column, turning proximity search into a prefix or range query the database already handles efficiently. I'd explicitly call out the boundary discontinuity problem — two nearby points can land in different cells — so a real nearby-search checks the current cell plus its immediate neighbors, not just an exact prefix match. For a ride-hailing style system specifically, I'd mention Uber's H3 hexagonal grid as the production-grade alternative, since it avoids some of the distance distortion square GeoHash cells introduce.",
    mistakes: [
      "Not knowing about the geohash boundary discontinuity problem and its neighbor-cell workaround",
      "Suggesting a full table scan with distance calculation for every row instead of using a spatial index",
      "Not knowing any real production geospatial indexing systems (H3, S2, R-tree)",
    ],
    followUps: [
      "How do you handle two nearby points that land in different geohash cells?",
      "How would you choose the geohash precision (string length) for a ride-hailing app?",
      "What's the difference between a QuadTree and an R-tree?",
    ],
    redFlags: [
      "Proposing to compute distance to every row in the database for every query",
      "Not knowing what a spatial index is",
    ],
  },
  challenge: [
    {
      question: "Why does a 'find nearby' query using GeoHash typically also check neighboring grid cells, not just an exact prefix match?",
      options: [
        "It doesn't need to — an exact prefix match is always sufficient",
        "Two physically close points can fall on opposite sides of a grid cell boundary and get very different prefixes",
        "Neighboring cells are always empty",
        "GeoHash doesn't support prefix matching at all",
      ],
      correctIndex: 1,
      explanation:
        "This is the classic GeoHash boundary discontinuity problem — physical proximity doesn't always mean prefix similarity near a cell edge, so robust nearby-search checks adjacent cells too.",
    },
    {
      question: "What is the main advantage of encoding a 2D location as a GeoHash string?",
      options: [
        "It makes location data unreadable for security",
        "It turns a 2D proximity search into a simple, database-indexable 1D string prefix/range query",
        "It eliminates the need for any location precision",
        "It compresses location data to zero bytes",
      ],
      correctIndex: 1,
      explanation:
        "By interleaving latitude/longitude bits into one string where nearby locations share prefixes, GeoHash lets ordinary database indexes handle proximity queries efficiently.",
    },
  ],
};
