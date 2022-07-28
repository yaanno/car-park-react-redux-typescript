import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import parkingReducer from '../features/parking/parkingSlice';

export const store = configureStore({
  reducer: {
    parkingSlot: parkingReducer
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
