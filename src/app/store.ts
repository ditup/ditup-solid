import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import loginReducer from '../features/login/loginSlice'
import { ditapi } from './services/ditapi'
import { solidApi } from './services/solidapi'
import { interestApi } from './services/interestApi'

export const store = configureStore({
  reducer: {
    login: loginReducer,
    [ditapi.reducerPath]: ditapi.reducer,
    [solidApi.reducerPath]: solidApi.reducer,
    [interestApi.reducerPath]: interestApi.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware()
      .concat(ditapi.middleware)
      .concat(solidApi.middleware)
      .concat(interestApi.middleware),
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>
