import { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { Api } from "../Api";

export const useDataLoading = <ResponseSchema>(
  url: string,
  params?: Record<string, string>
): [boolean, AxiosResponse<ResponseSchema>] => {
  const api = new Api();
  const [loaded, setLoaded] = useState<boolean>(false);
  const [response, setResponse] =
    useState<AxiosResponse<ResponseSchema> | null>(null);

  const loadData = async () => {
    let queryParams;
    if (params) queryParams = new URLSearchParams(params).toString();
    const response = await api.get<ResponseSchema>(
      queryParams ? `${url}?${queryParams}` : url
    );
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
