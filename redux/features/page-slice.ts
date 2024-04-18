import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  page: 1,
  perPage: 25,
  poli: "all",
  dokter: "all",
  mulai: "all",
};

export const pageParams = createSlice({
  name: "page",
  initialState,
  reducers: {
    setPageParams: (_, action: PayloadAction<typeof initialState>) => {
      return {
        page: action.payload.page,
        perPage: action.payload.perPage,
        poli: action.payload.poli,
        dokter: action.payload.dokter,
        mulai: action.payload.mulai,
      };
    },
  },
});

export const { setPageParams } = pageParams.actions;
export default pageParams.reducer;
