import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface CompanyState {
  /**
   * শুধু id রাখা হয়, কারণ authoritative Company data (name, status,
   * ইত্যাদি) RTK Query cache-এ থাকবে (companyApi, পরবর্তী phase) —
   * এখানে duplicate করা হয় না। Backend contract অনুযায়ী প্রতিটি
   * company-scoped request-এ এই id-ই `x-company-id` header হিসেবে
   * base-api থেকে inject হবে।
   */
  currentCompanyId: string | null;
}

const initialState: CompanyState = {
  currentCompanyId: null,
};

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    companySelected(state, action: PayloadAction<string>) {
      state.currentCompanyId = action.payload;
    },
    companyCleared(state) {
      state.currentCompanyId = null;
    },
  },
});

export const { companySelected, companyCleared } = companySlice.actions;

export const companyReducer = companySlice.reducer;
