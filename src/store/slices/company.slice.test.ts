import { describe, expect, it } from "vitest";

import { companyCleared, companyReducer, companySelected, type CompanyState } from "./company.slice";

const initialState: CompanyState = { currentCompanyId: null };

describe("company slice", () => {
  it("companySelected sets currentCompanyId", () => {
    const state = companyReducer(initialState, companySelected("company-1"));
    expect(state.currentCompanyId).toBe("company-1");
  });

  it("companySelected replaces a previously selected company (switch)", () => {
    const selected = companyReducer(initialState, companySelected("company-1"));
    const switched = companyReducer(selected, companySelected("company-2"));
    expect(switched.currentCompanyId).toBe("company-2");
  });

  it("companyCleared resets to null", () => {
    const selected = companyReducer(initialState, companySelected("company-1"));
    const cleared = companyReducer(selected, companyCleared());
    expect(cleared.currentCompanyId).toBeNull();
  });
});
