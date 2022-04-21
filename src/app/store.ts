import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import loginReducer from '../features/login/loginSlice'
import { ditapi } from './services/ditapi'

export const store = configureStore({
  reducer: {
    login: loginReducer,
    [ditapi.reducerPath]: ditapi.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(ditapi.middleware),
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>
