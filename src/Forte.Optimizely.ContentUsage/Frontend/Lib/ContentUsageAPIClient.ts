import axios from "axios";

import {
  ContentTypeDto,
  ContentTypeBaseDto,
  GetContentTypesQuery,
  GetContentUsagesQuery,
  GetContentUsagesResponse,
  ContentTypesResponse,
} from "../dtos";

export interface ContentUsageAPIEndpoints {
  contentTypeBases: string | null;
  contentType: string | null;
  contentTypes: string | null;
  contentUsages: string | null;
}

export interface APIResponse<ResponseSchema> {
  data: ResponseSchema | null;
  hasErrors: boolean;
}

export default class ContentUsageAPIClient {
  endpoints: ContentUsageAPIEndpoints = {
    contentTypeBases: null,
    contentType: null,
    contentTypes: null,
    contentUsages: null,
  };

  public constructor(endpoints: ContentUsageAPIEndpoints) {
    this.endpoints = endpoints;
  }

  private async get<ResponseSchema>(
    url: string,
    params?: Record<string, string>
  ): Promise<APIResponse<ResponseSchema>> {
    let response,
      queryParams,
      hasErrors = false;

    if (params) queryParams = new URLSearchParams(params).toString();

    try {
      response = await axios.get<ResponseSchema>(
        queryParams ? `${url}?${queryParams}` : url
      );
    } catch (error) {
      hasErrors = true;
    }

    return {
      data: response.data,
      hasErrors,
    } as APIResponse<ResponseSchema>;
  }

  public async getContentTypeBases() {
    return this.get<ContentTypeBaseDto[]>(this.endpoints.contentTypeBases);
  }

  public async getContentTypes(query: Partial<GetContentTypesQuery>) {
    return this.getWithQuerySchema<
      Partial<GetContentTypesQuery>,
      ContentTypesResponse
    >(`${this.endpoints.contentTypes}`, query);
  }

  public async getContentType(guid: string) {
    return this.get<ContentTypeDto>(this.endpoints.contentType, { guid });
  }

  private async getWithQuerySchema<Query, ResponseSchema>(
    url: string,
    query: Query
  ): Promise<APIResponse<ResponseSchema>> {
    const params = {} as Record<string, string>;

    for (const [key, value] of Object.entries(query)) {
      params[key] = value.toString();
    }

    return await this.get<ResponseSchema>(url, params);
  }

  public async getContentTypeUsages(query: Partial<GetContentUsagesQuery>) {
    return this.getWithQuerySchema<
      Partial<GetContentUsagesQuery>,
      GetContentUsagesResponse
    >(`${this.endpoints.contentUsages}`, query);
  }
}
