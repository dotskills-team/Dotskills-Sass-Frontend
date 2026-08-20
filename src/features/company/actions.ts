import type { AppDispatch } from "@/store";
import { baseApi } from "@/store/api/base-api";
import { companySelected } from "@/store/slices/company.slice";

/**
 * Company switch করার একমাত্র entry point — শুধু Redux state বদলানো
 * যথেষ্ট না, `x-company-id` header বদলানোর ফলে company-scoped সব
 * cached query stale হয়ে যায়, তাই একই সাথে সেগুলো invalidate করা হয়
 * (section 7/22) — কোনো `window.location.reload()` নয়।
 */
export function switchCompany(companyId: string) {
  return (dispatch: AppDispatch) => {
    dispatch(companySelected(companyId));
    dispatch(baseApi.util.invalidateTags(["CompanyScoped"]));
  };
}
