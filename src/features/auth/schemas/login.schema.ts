import { z } from "zod";

/**
 * ক্লায়েন্ট-side validation শুধু UX-এর জন্য — backend (LoginDto:
 * @IsEmail, @Length(8,128)) সবসময় authoritative। এই স্কিমা backend-এর
 * নিয়ম mirror করে যাতে ব্যবহারকারী submit করার আগেই স্পষ্ট feedback পায়,
 * কিন্তু backend validation-কে replace করে না।
 *
 * Zod v4 error-message syntax: `{ error: "..." }` object (plain-string
 * second argument আর সমর্থিত নয়) — Next.js-এর নিজস্ব bundled docs-এর
 * authentication guide থেকে verify করা।
 */
export function createLoginSchema(messages: {
  emailRequired: string;
  emailInvalid: string;
  passwordRequired: string;
}) {
  return z.object({
    email: z
      .string({ error: messages.emailRequired })
      .min(1, { error: messages.emailRequired })
      .email({ error: messages.emailInvalid }),
    password: z.string({ error: messages.passwordRequired }).min(1, {
      error: messages.passwordRequired,
    }),
    loginType: z.enum(["company", "staff"]),
  });
}

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;
