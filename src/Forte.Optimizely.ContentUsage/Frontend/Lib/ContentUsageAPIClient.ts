import axios from "axios";

import { ContentTypeDto, ContentUsageDto, ContentTypeBaseDto } from "../dtos";

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

  public async getContentTypes() {
    return this.get<ContentTypeDto[]>(this.endpoints.contentTypes);
  }

  public async getContentType(guid: string) {
    return this.get<ContentTypeDto>(this.endpoints.contentType, { guid });
  }

  public async getContentTypeUsages(query: Record<string, string>) {
    return this.get<ContentUsageDto[]>(
      `${this.endpoints.contentUsages}`,
      query
    );
  }
}
