export type APIClientOptions = {
    extensionId: string;
    publisherId: string;
    clientId: string;
    refreshToken: string;
    clientSecret: string | undefined;
};

export type ItemResource = {
    crxVersion: string;
    itemId: string;
    name: string;
    uploadState: string;
};

export type PublishType =
    | 'PUBLISH_TYPE_UNSPECIFIED'
    | 'DEFAULT_PUBLISH'
    | 'TRUSTED_TESTERS'
    | 'STAGED_PUBLISH';

export type PublishResponse = {
    itemId: string;
    name: string;
    state: string;
};

export type ItemStatusResponse = {
    itemId: string;
    lastAsyncUploadState: string;
    name: string;
    publicKey: string;
    publishedItemRevisionStatus: unknown;
    submittedItemRevisionStatus: unknown;
    takenDown: boolean;
};
