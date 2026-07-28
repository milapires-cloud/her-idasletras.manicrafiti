import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  varchar,
} from "drizzle-orm/pg-core";

// FAMÍLIAS — permite 50+ pessoas em contas separadas.
// Cada família tem um código curto para amiguinhos entrarem.
export const families = pgTable("families", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  joinCode: varchar("join_code", { length: 8 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Heróis (jogadores). Pode ser criança OU adulto (para duelar).
export const heroes = pgTable("heroes", {
  id: serial("id").primaryKey(),
  familyId: integer("family_id").notNull().default(0),
  name: varchar("name", { length: 80 }).notNull(),
  age: integer("age").notNull().default(6),
  avatar: varchar("avatar", { length: 20 }).notNull().default("steve"),
  isAdult: boolean("is_adult").notNull().default(false),
  xp: integer("xp").notNull().default(0),
  gems: integer("gems").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  currentDay: integer("current_day").notNull().default(1),
  armorTier: integer("armor_tier").notNull().default(0), // 0..5
  style: jsonb("style")
    .notNull()
    .default({ skin: "medio", hair: "castanho", eyes: "castanho", outfit: "azul", armor: "auto" }),
  isTest: boolean("is_test").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Comandantes: mãe (admin), pai, padrinho, madrinha, avó, professor…
// Agora ligados a uma família e com nome único global para login.
export const commanders = pgTable("commanders", {
  id: serial("id").primaryKey(),
  familyId: integer("family_id").notNull().default(0),
  role: varchar("role", { length: 20 }).notNull(),
  name: varchar("name", { length: 80 }).notNull(),
  loginName: varchar("login_name", { length: 80 }).notNull().unique(),
  pinHash: varchar("pin_hash", { length: 200 }).notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  // Permissões que a mãe liga/desliga para cada comandante.
  permissions: jsonb("permissions")
    .notNull()
    .default({ missoes: true, recompensas: true, desafios: true, voz: true, tarefas: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Cada tentativa granular vira uma linha. É a base pra IA saber se
// o cérebro dele já dominou uma letra/sílaba (ver /api/mastery).
export const attempts = pgTable("attempts", {
  id: serial("id").primaryKey(),
  heroId: integer("hero_id").notNull(),
  day: integer("day").notNull(),
  phase: varchar("phase", { length: 20 }).notNull(), // 'discovery' | 'battle' | 'writing'
  target: varchar("target", { length: 40 }).notNull(), // letra/sílaba/palavra
  correct: boolean("correct").notNull(),
  responseMs: integer("response_ms").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Progresso consolidado por dia: só libera próximo dia se accuracy >= 80%.
export const dayProgress = pgTable("day_progress", {
  id: serial("id").primaryKey(),
  heroId: integer("hero_id").notNull(),
  day: integer("day").notNull(),
  completed: boolean("completed").notNull().default(false),
  accuracy: integer("accuracy").notNull().default(0), // 0-100
  xpEarned: integer("xp_earned").notNull().default(0),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

// Missões comportamentais criadas pelos pais.
export const missions = pgTable("missions", {
  id: serial("id").primaryKey(),
  heroId: integer("hero_id").notNull(),
  title: varchar("title", { length: 120 }).notNull(),
  description: text("description").notNull().default(""),
  reward: integer("reward").notNull().default(100),
  kind: varchar("kind", { length: 30 }).notNull().default("obediencia"),
  // 'obediencia' | 'escola' | 'anti-tela'
  completed: boolean("completed").notNull().default(false),
  createdBy: varchar("created_by", { length: 20 }).notNull().default("mae"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

// Diário emocional. Campo "segredo" é privado da criança (não vai pro painel).
export const diary = pgTable("diary", {
  id: serial("id").primaryKey(),
  heroId: integer("hero_id").notNull(),
  day: integer("day").notNull(),
  mood: varchar("mood", { length: 20 }).notNull().default("feliz"),
  school: text("school").notNull().default(""),
  dream: text("dream").notNull().default(""),
  friend: text("friend").notNull().default(""),
  secret: text("secret").notNull().default(""), // privado
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Fotos das escritas enviadas na Fase Crafting.
export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  heroId: integer("hero_id").notNull(),
  day: integer("day").notNull(),
  target: varchar("target", { length: 40 }).notNull(),
  dataUrl: text("data_url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Mensagens de voz gravadas pelos pais que aparecem como surpresa.
export const voiceMessages = pgTable("voice_messages", {
  id: serial("id").primaryKey(),
  heroId: integer("hero_id").notNull(),
  fromRole: varchar("from_role", { length: 20 }).notNull(),
  text: text("text").notNull().default(""), // fala por TTS se não houver áudio
  audioUrl: text("audio_url").notNull().default(""), // gravação real (dataURL)
  played: boolean("played").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Eventos comportamentais anti-tela (chegou perto da TV? pediu celular?)
export const behavior = pgTable("behavior", {
  id: serial("id").primaryKey(),
  heroId: integer("hero_id").notNull(),
  kind: varchar("kind", { length: 40 }).notNull(),
  value: jsonb("value").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Hero = typeof heroes.$inferSelect;
export type NewHero = typeof heroes.$inferInsert;
export type Commander = typeof commanders.$inferSelect;
export type Attempt = typeof attempts.$inferSelect;
export type DayProgress = typeof dayProgress.$inferSelect;
export type Mission = typeof missions.$inferSelect;
export type Diary = typeof diary.$inferSelect;
export type Photo = typeof photos.$inferSelect;
export type VoiceMessage = typeof voiceMessages.$inferSelect;

// ---------- NOVAS ENTIDADES ----------

// Tarefas escolares lançadas por mãe/pai (aparecem no jogo).
export const schoolTasks = pgTable("school_tasks", {
  id: serial("id").primaryKey(),
  heroId: integer("hero_id").notNull(),
  subject: varchar("subject", { length: 60 }).notNull().default("Português"),
  title: varchar("title", { length: 160 }).notNull(),
  dueDate: varchar("due_date", { length: 20 }).notNull().default(""),
  reward: integer("reward").notNull().default(150),
  done: boolean("done").notNull().default(false),
  photoUrl: text("photo_url").notNull().default(""),
  createdBy: varchar("created_by", { length: 20 }).notNull().default("mae"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Desafios que a CRIANÇA lança para os pais (inverte o poder = engajamento).
export const kidChallenges = pgTable("kid_challenges", {
  id: serial("id").primaryKey(),
  heroId: integer("hero_id").notNull(),
  toRole: varchar("to_role", { length: 20 }).notNull().default("mae"),
  title: varchar("title", { length: 160 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pendente"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Inventário de itens comprados/desbloqueados.
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  heroId: integer("hero_id").notNull(),
  itemId: varchar("item_id", { length: 40 }).notNull(),
  itemName: varchar("item_name", { length: 80 }).notNull(),
  icon: varchar("icon", { length: 12 }).notNull().default("🎁"),
  equipped: boolean("equipped").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Calendário de presença (streak real por data).
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  heroId: integer("hero_id").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  day: integer("day").notNull().default(1),
  minutes: integer("minutes").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SchoolTask = typeof schoolTasks.$inferSelect;
export type KidChallenge = typeof kidChallenges.$inferSelect;
export type InventoryItem = typeof inventory.$inferSelect;
export type Attendance = typeof attendance.$inferSelect;

// Sessões persistentes (token no localStorage do dispositivo).
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  token: varchar("token", { length: 64 }).notNull().unique(),
  commanderId: integer("commander_id").notNull(),
  familyId: integer("family_id").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Family = typeof families.$inferSelect;
export type Session = typeof sessions.$inferSelect;
