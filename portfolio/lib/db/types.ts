export type { ItemInput, ItemType } from "../validation";
import type { ItemType } from "../validation";

export type ItemRow = {
  id: string;
  created_at: string;
  type: ItemType;
  slug: string;
  title: string;
  short_description: string;
  description: string;
  status: string;
  category: string;
  tags: string[];
  cover_url: string | null;
  live_url: string | null;
  demo_url: string | null;
  android_url: string | null;
  ios_url: string | null;
  published: boolean;
  sort_order: number;
  updated_at: string;
};

export type CommentRow = {
  id: string;
  created_at: string;
  item_id: string;
  author_id: string;
  author_name: string;
  author_avatar: string | null;
  body: string;
  is_owner: boolean;
  hidden: boolean;
};

export type BudgetRange = "free" | "under_10" | "10_50" | "over_50" | "not_sure";

export type VoteRow = {
  id: string;
  created_at: string;
  item_id: string;
  user_id: string;
  budget_range: BudgetRange | null;
};

export type SuggestionStatus = "new" | "published" | "dismissed";

export type SuggestionRow = {
  id: string;
  created_at: string;
  title: string;
  description: string;
  audience: string | null;
  budget_range: string | null;
  contact_email: string | null;
  submitter_name: string | null;
  credit_ok: boolean;
  status: SuggestionStatus;
};

export type SubscriberStatus = "pending" | "confirmed" | "unsubscribed";

export type SubscriberRow = {
  id: string;
  created_at: string;
  email: string;
  status: SubscriberStatus;
  confirm_token: string | null;
  consent_at: string;
  source: string | null;
};

export type VisitRow = {
  id: string;
  created_at: string;
  day: string;
  visitor_hash: string;
  last_seen: string;
};

export type PublicStats = {
  activeNow: number;
  visitorsToday: number;
  visitorsWeek: number;
  totalComments: number;
};
