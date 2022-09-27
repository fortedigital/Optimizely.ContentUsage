import { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { Api } from "../Api";

export const useDataLoading = <ResponseSchema>(
  url: string
): [boolean, AxiosResponse<ResponseSchema>] => {
  const api = new Api();
  const [loaded, setLoaded] = useState<boolean>(false);
  const [response, setResponse] =
    useState<AxiosResponse<ResponseSchema> | null>(null);

  const loadData = async () => {
    const response = await api.get<ResponseSchema>(url);
    return response;
  };

  useEffect(() => {
    loadData().then((response) => {
      setResponse(response);
      setLoaded(true);
    });
  }, []);

  return [loaded, response];
};
