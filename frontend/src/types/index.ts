export type SourceType = "url" | "image" | "manual";

export interface Item {
  id: string;
  title: string;
  source_type: SourceType;
  source_value: string | null;
  summary: string | null;
  price: string | null;
  category: string | null;
  specs: Record<string, string> | null;
  created_at: string;
}

export interface Comparison {
  id: string;
  item_ids: string[];
  dimensions: string[];
  report: string;
  table_data: Record<string, string>[];
  created_at: string;
}

export interface ComparisonPayload {
  item_ids: string[];
}
