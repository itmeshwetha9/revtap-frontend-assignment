import { useState, useCallback } from "react";

/* useAPI is a custom hook to ease API calling along with status
** Loading , Response and Error
*/
const useAPI = <T, R>(
  service: (data: T) => R | Promise<R>
): {
  loading: boolean;
  error?: Error;
  response?: R;
  callAPI: (
    data: T,
    onSuccess?: (response?: R) => void,
    onError?: (error: string) => void
  ) => void;
} => {
  const [state, setState] = useState<{
    loading: boolean;
    error: Error | undefined;
    response: R | undefined;
  }>({
    loading: false,
    error: undefined,
    response: undefined
  });

  const callAPI = useCallback(
    async (
      data: T,
      onSuccess?: (response?: R) => void,
      onError?: (error: string) => void
    ) => {
      try {
        setState(prevState => ({
          ...prevState,
          loading: true,
          error: undefined
        }));
        const response: R = await service(data);

        setState(prevState => ({
          ...prevState,
          loading: false,
          response,
          error: undefined
        }));

        if (onSuccess) {
          onSuccess(response);
        }
      } catch (error) {
        setState(prevState => ({ ...prevState, loading: false, error }));
        if (onError) {
          onError(error.message || error);
        }
      }
    },
    [service]
  );

  return {
    loading: state.loading,
    error: state.error,
    response: state.response,
    callAPI
  };
};

export default useAPI;
