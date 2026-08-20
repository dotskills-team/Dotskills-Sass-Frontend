/**
 * NestJS-এর default HttpException/ValidationPipe error shape — এই session-এ
 * বারবার live curl দিয়ে verify করা হয়েছে backend-এ, invent করা হয়নি।
 * `message` সাধারণত string, কিন্তু class-validator ব্যর্থ হলে string[]।
 */
export interface BackendErrorBody {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export interface NormalizedApiError {
  status: number | "FETCH_ERROR" | "TIMEOUT_ERROR" | "PARSING_ERROR" | "UNKNOWN_ERROR";
  /** একটাই, user-facing message — component-এ এর বেশি parse করার দরকার নেই। */
  message: string;
  /** ValidationPipe থেকে আসা field-level ভাঙা মেসেজ, ফর্মে map করার জন্য। */
  fieldMessages?: string[];
}
