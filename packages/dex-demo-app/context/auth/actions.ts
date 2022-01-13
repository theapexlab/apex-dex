import { Dispatch } from 'react';
import { Action, ACTION_TYPES } from './reducer';

type ActionBaseProps = {
  dispatch: Dispatch<Action>;
  accounts: string[];
};

type AccountsChangedAction = (props: ActionBaseProps & { onSuccess?: () => void }) => Promise<void>;
type HandleAccount = (props: ActionBaseProps & { isChanged: boolean }) => Promise<void>;
type GetAccountsAction = (props: {
  method: string;
  dispatch: Dispatch<Action>;
  shouldReload?: boolean;
}) => Promise<void>;

export const errorStatuses = {
  NO_ETHEREUM_FOUND: 'NO_ETHEREUM_FOUND',
  NO_ACCOUNTS_FOUND: 'NO_ACCOUNTS_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
};

const handleAccount: HandleAccount = async ({ dispatch, accounts, isChanged }) => {
  try {
    if (accounts.length === 0) {
      dispatch({
        type: ACTION_TYPES.ACCOUNTS_ERROR,
        error: errorStatuses.NO_ACCOUNTS_FOUND,
      });
    } else {
      dispatch({
        type: isChanged ? ACTION_TYPES.ACCOUNTS_CHANGED : ACTION_TYPES.ACCOUNTS_FETCHED,
        payload: accounts,
      });
    }
  } catch (error) {
    dispatch({
      type: ACTION_TYPES.ACCOUNTS_ERROR,
      // eslint-disable-next-line
      error: (error as any).code,
    });
  }
};

export const getAccountsAction: GetAccountsAction = async ({ method, dispatch, shouldReload = true }) => {
  const { ethereum } = window;

  if (shouldReload) {
    dispatch({ type: ACTION_TYPES.FETCHING_ACCOUNTS });
  }

  if (ethereum) {
    try {
      const accounts = await ethereum.request({ method });

      if (accounts.length) {
        handleAccount({ accounts, dispatch, isChanged: false });
      } else {
        dispatch({
          type: ACTION_TYPES.ACCOUNTS_ERROR,
          error: errorStatuses.NO_ACCOUNTS_FOUND,
        });
      }
    } catch (error) {
      dispatch({
        type: ACTION_TYPES.ACCOUNTS_ERROR,
        // eslint-disable-next-line
        error: (error as any).code,
      });
    }
  } else {
    dispatch({
      type: ACTION_TYPES.ACCOUNTS_ERROR,
      error: errorStatuses.NO_ETHEREUM_FOUND,
    });
  }
};

export const accountsChangedAction: AccountsChangedAction = async ({ dispatch, accounts, onSuccess }) => {
  await handleAccount({ accounts, dispatch, isChanged: true });

  if (onSuccess && typeof onSuccess === 'function') {
    onSuccess();
  }
};
