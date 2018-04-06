/// <reference types="node" />
//
// Type definitions for chrome-webstore-upload 0.2
// Project: https://github.com/DrewML/chrome-webstore-upload#readme

import { ReadStream } from "fs";

export enum UploadResultStates {
  Failure = "FAILURE",
  InProgress = "IN_PROGRESS",
  NotFound = "NOT_FOUND",
  Success = "SUCCESS"
}

export interface APIClientOptions {
  extensionId: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

export interface UploadResult {
  id: string;
  itemError: string[];
  kind: string;
  publicKey: string;
  uploadState: UploadResultStates;
}

export interface PublishResult {
  kind: string;
  item_id: string;
  status: string[];
  statusDetail: any[];
}

export class APIClient {
  constructor(opts: APIClientOptions);
  uploadExisting(file: ReadStream, token: string): Promise<UploadResult>;
  publish(target: string | undefined, token: string): Promise<PublishResult>;
  fetchToken(): Promise<string>;
}

export default function(opts: APIClientOptions): APIClient;
