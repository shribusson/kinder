import toast from "react-hot-toast";

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  return {
    toast: (options: ToastOptions) => {
      const message = options.description
        ? `${options.title ? options.title + ": " : ""}${options.description}`
        : options.title || "";

      if (options.variant === "destructive") {
        toast.error(message);
      } else {
        toast.success(message);
      }
    },
  };
}
