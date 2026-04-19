"use client";

import { useActionState } from "react";

export const useActionStateWithSuccess = <
  State extends { success: boolean },
  Payload,
>(
  action: (state: State, payload: Payload) => State | Promise<State>,
  initial: Awaited<State>,
  onSuccess: () => void,
): [state: State, dispatch: (payload: Payload) => void, isPending: boolean] => {
  const wrappedAction = async (
    state: State,
    payload: Payload,
  ): Promise<State> => {
    const result = await action(state, payload);
    if (result.success) onSuccess();
    return result;
  };
  // State is constrained to a plain object (not a Promise), so Awaited<State> = State
  return useActionState<State, Payload>(wrappedAction, initial);
};
