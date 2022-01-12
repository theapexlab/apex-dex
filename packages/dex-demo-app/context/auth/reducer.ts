import { Reducer } from 'react';

export enum ACTION_TYPES {
  INITIAL = 'INITIAL',
  FETCHING_ACCOUNTS = 'FETCHING_ACCOUNTS',
  ACCOUNTS_FETCHED = 'ACCOUNTS_FETCHED',
  ACCOUNTS_ERROR = 'ACCOUNTS_ERROR',
  ACCOUNTS_CHANGED = 'ACCOUNTS_CHANGED',
}

export type Action = {
  type: ACTION_TYPES;
  payload?: any;
  error?: string;
};

export type AuthState = {
  isLoading: boolean;
  isHydrated: boolean;
  status: ACTION_TYPES;
  error: string | null;
  data: any;
};

export type AuthReducer = Reducer<AuthState, Action>;

export const initialAuthState = {
  isLoading: false,
  isHydrated: false,
  status: ACTION_TYPES.INITIAL,
  error: null,
  data: {},
};

const authReducer: AuthReducer = (state = initialAuthState, action) => {
  switch (action.type) {
    case ACTION_TYPES.FETCHING_ACCOUNTS:
      return {
        ...state,
        isLoading: true,
        status: ACTION_TYPES.FETCHING_ACCOUNTS,
      };

    case ACTION_TYPES.ACCOUNTS_FETCHED:
    case ACTION_TYPES.ACCOUNTS_CHANGED:
      return {
        ...state,
        isLoading: false,
        status: ACTION_TYPES.ACCOUNTS_FETCHED,
        data: action.payload,
        error: null,
      };

    case ACTION_TYPES.ACCOUNTS_ERROR:
      return {
        ...state,
        isLoading: false,
        status: ACTION_TYPES.ACCOUNTS_ERROR,
        error: action.error || null,
      };

    default:
      return state;
  }
};

export default authReducer;
