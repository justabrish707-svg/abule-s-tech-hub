import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be under 255 characters"),
  message: z.string().trim().min(1, "Message is required").max(1000, "Message must be under 1000 characters"),
});

export const newsletterSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255, "Email must be under 255 characters"),
});

export const commentSchema = z.object({
  content: z.string().trim().min(1, "Comment cannot be empty").max(1000, "Comment must be under 1000 characters"),
});

export const usernameSchema = z.object({
  username: z.string().trim().min(1, "Username is required").max(50, "Username must be under 50 characters")
    .regex(/^[a-zA-Z0-9_.-]+$/, "Username can only contain letters, numbers, dots, dashes, and underscores"),
});

export const blogPostSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be under 200 characters"),
  excerpt: z.string().trim().max(500, "Excerpt must be under 500 characters"),
  content: z.string().trim().min(1, "Content is required").max(50000, "Content is too long"),
  category: z.string().min(1, "Category is required"),
  read_time: z.string().min(1, "Read time is required"),
});

export const projectSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be under 200 characters"),
  description: z.string().trim().min(1, "Description is required").max(2000, "Description must be under 2000 characters"),
  tech: z.string().max(500, "Tech list too long"),
  github: z.string().url("Invalid URL").or(z.literal("")).optional(),
  demo: z.string().url("Invalid URL").or(z.literal("")).optional(),
});

export const authSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").max(72, "Password must be under 72 characters"),
});

export const signupSchema = authSchema.extend({
  username: z.string().trim().min(1, "Username is required").max(50, "Username must be under 50 characters")
    .regex(/^[a-zA-Z0-9_.-]+$/, "Only letters, numbers, dots, dashes, and underscores"),
});
