import * as React from "react";

import type { ToastActionElement, ToastProps } from "./toast";

const TOAST_LIMIT = 4;
const TOAST_REMOVE_DELAY = 6000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

type ToastState = {
  toasts: ToasterToast[];
};

type ToastActionType =
  | { type: "ADD_TOAST"; toast: ToasterToast }
  | { type: "UPDATE_TOAST"; toast: Partial<ToasterToast> & { id: string } }
  | { type: "DISMISS_TOAST"; toastId?: string }
  | { type: "REMOVE_TOAST"; toastId?: string };

const toastState: ToastState = { toasts: [] };

const listeners: Array<(state: ToastState) => void> = [];

function dispatch(action: ToastActionType) {
  switch (action.type) {
    case "ADD_TOAST": {
      toastState.toasts = [action.toast, ...toastState.toasts].slice(0, TOAST_LIMIT);
      break;
    }
    case "UPDATE_TOAST": {
      toastState.toasts = toastState.toasts.map((t) =>
        t.id === action.toast.id ? { ...t, ...action.toast } : t,
      );
      break;
    }
    case "DISMISS_TOAST": {
      const { toastId } = action;
      toastState.toasts = toastState.toasts.map((t) => {
        if (toastId && t.id !== toastId) return t;
        return { ...t, open: false };
      });
      break;
    }
    case "REMOVE_TOAST": {
      if (action.toastId) {
        toastState.toasts = toastState.toasts.filter((t) => t.id !== action.toastId);
      } else {
        toastState.toasts = [];
      }
      break;
    }
  }

  for (const listener of listeners) listener({ ...toastState });
}

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

const timeouts = new Map<string, ReturnType<typeof setTimeout>>();

function addToRemoveQueue(toastId: string) {
  if (timeouts.has(toastId)) return;

  const timeout = setTimeout(() => {
    timeouts.delete(toastId);
    dispatch({ type: "REMOVE_TOAST", toastId });
  }, TOAST_REMOVE_DELAY);

  timeouts.set(toastId, timeout);
}

export function toast({ ...props }: Omit<ToasterToast, "id">) {
  const id = genId();

  const update = (props: Partial<ToasterToast>) =>
    dispatch({ type: "UPDATE_TOAST", toast: { ...props, id } });

  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return { id, dismiss, update };
}

export function useToast() {
  const [state, setState] = React.useState<ToastState>(toastState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  React.useEffect(() => {
    for (const t of state.toasts) {
      if (t.open === false) addToRemoveQueue(t.id);
    }
  }, [state.toasts]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}
