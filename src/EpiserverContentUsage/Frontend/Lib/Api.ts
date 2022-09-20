import axios, { AxiosResponse } from "axios";

export class Api {
  public async get<ResponseSchema>(url: string) {
    let response;
    
    try {
      response = await axios.get<ResponseSchema>(url);
    } catch (error) {
      console.error(error);
    }

    return response;
  }
}
