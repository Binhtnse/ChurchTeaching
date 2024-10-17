import { configureStore } from '@reduxjs/toolkit';
import classGradesReducer from './slices/classGradesSlice';

export const store = configureStore({
  reducer: {
    classGrades: classGradesReducer,
    // other reducers...
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
