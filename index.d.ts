/// <reference types="node" />
//
// Type definitions for chrome-webstore-upload 0.2
// Project: https://github.com/DrewML/chrome-webstore-upload#readme

import { ReadStream } from "fs";

/**
 * The result state of the upload action.
 * @export
 */
export enum UploadResultState {
  Failure = "FAILURE",
  InProgress = "IN_PROGRESS",
  NotFound = "NOT_FOUND",
  Success = "SUCCESS"
}

/**
 * The result state of the publish action.
 * @export
 */
export enum PublishResultStatus {
  NotAuthorized = "NOT_AUTHORIZED",
  InvalidDeveloper = "INVALID_DEVELOPER",
  DeveloperNoOwnership = "DEVELOPER_NO_OWNERSHIP",
  DeveloperSuspended = "DEVELOPER_SUSPENDED",
  ItemNotFound = "ITEM_NOT_FOUND",
  ItemPendingReview = "ITEM_PENDING_REVIEW",
  ItemTakenDown = "ITEM_TAKEN_DOWN",
  PublisherSuspended = "PUBLISHER_SUSPENDED",
  Ok = "OK"
}

/**
 * The APIClient options for configuration.
 * @export
 * @interface APIClientOptions
 */
export interface APIClientOptions {
  extensionId: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

/**
 * The response from the upload API.
 * https://developer.chrome.com/webstore/webstore_api/items#resource
 * @export
 * @interface UploadResult
 */
export interface UploadResult {
  id: string;
  itemError: string[];
  kind: string;
  publicKey: string;
  uploadState: UploadResultState;
}

/**
 * The response from the publish API.
 * https://developer.chrome.com/webstore/webstore_api/items/publish#response
 * @export
 * @interface PublishResult
 */
export interface PublishResult {
  kind: string;
  item_id: string;
  status: PublishResultStatus[];
  statusDetail: any[];
}

/**
 * The APIClient for interacting with the Chrome Webstore.
 * @export
 * @class APIClient
 */
export class APIClient {
  constructor(options: APIClientOptions);
  uploadExisting(file: ReadStream, token: string): Promise<UploadResult>;
  publish(target: string | undefined, token: string): Promise<PublishResult>;
  fetchToken(): Promise<string>;
}

/**
 * The default export function which provides an instance of the APIClient.
 * @export
 * @param {APIClientOptions} options 
 * @returns {APIClient} 
 */
export default function(options: APIClientOptions): APIClient;
