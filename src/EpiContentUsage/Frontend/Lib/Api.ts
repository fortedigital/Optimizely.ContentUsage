import axios from "axios";

interface Endpoints {
  contentTypeBasesEndpointUrl: string | null;
  contentTypeEndpointUrl: string | null;
  contentTypesEndpointUrl: string | null;
  contentUsagesEndpointUrl: string | null;
}

export class Api {
  static endpoints: Endpoints = {
    contentTypeBasesEndpointUrl: null,
    contentTypeEndpointUrl: null,
    contentTypesEndpointUrl: null,
    contentUsagesEndpointUrl: null,
  };

  public static setEndpoints(endpoints: Endpoints) {
    this.endpoints = endpoints;
  }

  public static setEndpoint(name: keyof Endpoints, value: string) {
    this.endpoints[name] = value;
  }

  public static async get<ResponseSchema>(
    url: string,
    params?: Record<string, string>
  ) {
    let response, queryParams;
    if (params) queryParams = new URLSearchParams(params).toString();

    try {
      response = await axios.get<ResponseSchema>(
        queryParams ? `${url}?${queryParams}` : url
      );
    } catch (error) {
      console.error(error);
    }

    return response;
  }
}
