import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import { createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

// ==================== ENUMS ====================
export const roles = ["tenant", "owner", "admin", "super_admin"] as const;
export const listingTypes = ["room", "apartment", "shared_space"] as const;
export const messageTypes = ["text", "image", "file"] as const;
export const reportCategories = ["spam", "fake", "inappropriate"] as const;
export const paymentCycleEnum = ['weekly', 'monthly', 'yearly'] as const;
export const paymentStatusEnum = ['pending', 'completed', 'failed', 'refunded'] as const;
export const facilityTypeEnum = ['electricity', 'water', 'furniture', 'internet', 'cleaning'] as const;
export const conditionEnum = ["new", "like_new", "used"] as const;

// ==================== CORE TABLES ====================
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash"),
  roles: text("roles", { mode: "json" }).$type<Array<typeof roles[number]>>().notNull().default(["tenant"]),
  stripeCustomerId: text("stripe_customer_id"),
  stripeAccountId: text("stripe_account_id"),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  lastLogin: text("last_login"),
  oauthProvider: text("oauth_provider"),
  oauthId: text("oauth_id"),
});

export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").unique().references(() => users.id),
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  budgetMin: integer("budget_min"),
  budgetMax: integer("budget_max"),
  preferredLocation: text("preferred_location"),
  lifestyleTags: text("lifestyle_tags", { mode: "json" }).$type<string[]>(),
  phone: text("phone"),
  emergencyContact: text("emergency_contact"),
  preferredPaymentMethod: text("preferred_payment_method"),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

// ==================== LISTINGS & FACILITIES ====================
export const roomListings = sqliteTable("room_listings", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  ownerId: text("owner_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type", { enum: listingTypes }).notNull(),
  baseRent: integer("base_rent").notNull(),
  securityDeposit: integer("security_deposit"),
  availableFrom: text("available_from").notNull(),
  address: text("address").notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
});

export const facilities = sqliteTable("facilities", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name", { enum: facilityTypeEnum }).notNull(),
  description: text("description"),
});

export const roomFacilities = sqliteTable("room_facilities", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  roomId: text("room_id").references(() => roomListings.id),
  facilityId: text("facility_id").references(() => facilities.id),
  includedInRent: integer("included_in_rent", { mode: "boolean" }).default(false),
  additionalCost: integer("additional_cost"),
});

// ==================== MEDIA & AMENITIES ====================
export const roomImages = sqliteTable("room_images", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  listingId: text("listing_id").references(() => roomListings.id),
  url: text("url").notNull(),
  caption: text("caption"),
  order: integer("order").notNull(),
});

export const amenities = sqliteTable("amenities", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name").notNull().unique(),
});

export const roomAmenities = sqliteTable("room_amenities", {
  roomId: text("room_id").references(() => roomListings.id),
  amenityId: text("amenity_id").references(() => amenities.id),
});

// ==================== PAYMENTS ====================
export const paymentCycles = sqliteTable("payment_cycles", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  roomId: text("room_id").references(() => roomListings.id),
  cycleType: text("cycle_type", { enum: paymentCycleEnum }).notNull(),
  discountPercentage: integer("discount_percentage"),
});

export const payments = sqliteTable("payments", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  tenantId: text("tenant_id").references(() => users.id),
  ownerId: text("owner_id").references(() => users.id),
  roomId: text("room_id").references(() => roomListings.id),
  amount: integer("amount").notNull(),
  serviceFee: integer("service_fee").notNull(),
  cycleType: text("cycle_type", { enum: paymentCycleEnum }).notNull(),
  dueDate: text("due_date").notNull(),
  paidDate: text("paid_date"),
  status: text("status", { enum: paymentStatusEnum }).default("pending"),
  stripePaymentId: text("stripe_payment_id").notNull(),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const paymentReminders = sqliteTable("payment_reminders", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  paymentId: text("payment_id").references(() => payments.id),
  reminderDate: text("reminder_date").notNull(),
  status: text("status", { enum: ["pending", "sent"] }).default("pending"),
  sentAt: text("sent_at"),
});

// ==================== MESSAGING ====================
export const messageThreads = sqliteTable("message_threads", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  participant1: text("participant_1").references(() => users.id),
  participant2: text("participant_2").references(() => users.id),
  lastMessageAt: text("last_message_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  threadId: text("thread_id").references(() => messageThreads.id),
  senderId: text("sender_id").references(() => users.id),
  content: text("content").notNull(),
  type: text("type", { enum: messageTypes }).default("text"),
  fileUrl: text("file_url"),
  readAt: text("read_at"),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

// ==================== MARKETPLACE ====================
export const furnitureAds = sqliteTable("furniture_ads", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  sellerId: text("seller_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  condition: text("condition", { enum: conditionEnum }),
  category: text("category").notNull(),
  location: text("location").notNull(),
  lat: real("lat"),
  lng: real("lng"),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

// ==================== ADMIN & MODERATION ====================
export const adminNotes = sqliteTable("admin_notes", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").references(() => users.id),
  adminId: text("admin_id").references(() => users.id),
  content: text("content").notNull(),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const reports = sqliteTable("reports", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  reporterId: text("reporter_id").references(() => users.id),
  targetType: text("target_type", { enum: ["user", "listing", "message"] }),
  targetId: text("target_id").notNull(),
  category: text("category", { enum: reportCategories }).notNull(),
  status: text("status", { enum: ["open", "resolved"] }).default("open"),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

// ==================== REVIEWS & RATINGS ====================
export const roomReviews = sqliteTable("room_reviews", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  roomId: text("room_id").references(() => roomListings.id),
  tenantId: text("tenant_id").references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

// ==================== HABITS ====================
export const habitTable = sqliteTable("habits", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  duration: integer("duration").notNull(),
  archived: integer("archived", {
    mode: "boolean",
  }).default(false),
  enableNotifications: integer("enable_notifications", {
    mode: "boolean",
  }).default(false),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

// ==================== ZOD SCHEMAS ====================
export const UserSchema = createSelectSchema(users);
export const ProfileSchema = createSelectSchema(profiles);
export const RoomListingSchema = createSelectSchema(roomListings);
export const MessageSchema = createSelectSchema(messages);
export const PaymentSchema = createSelectSchema(payments);
export const HabitSchema = createSelectSchema(habitTable);

// ==================== TYPES ====================
export type User = z.infer<typeof UserSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type RoomListing = z.infer<typeof RoomListingSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type Payment = z.infer<typeof PaymentSchema>;
export type Habit = z.infer<typeof HabitSchema>;
