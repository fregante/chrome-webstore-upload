export type APIClientOptions = {
    extensionId: string;
    clientId: string;
    refreshToken: string;
    clientSecret: string | undefined;
};

export type ItemResource = {
    kind: 'chromewebstore#item';
    id: string;
    publicKey: string;
    uploadState: 'FAILURE' | 'IN_PROGRESS' | 'NOT_FOUND' | 'SUCCESS';
    itemError: Array<{
        error_code: string;
        error_detail: string;
    }>;
};

export type PublishResponse = {
    kind: 'chromewebstore#item';
    item_id: string;
    status: Array<
    | 'OK'
    | 'NOT_AUTHORIZED'
    | 'INVALID_DEVELOPER'
    | 'DEVELOPER_NO_OWNERSHIP'
    | 'DEVELOPER_SUSPENDED'
    | 'ITEM_NOT_FOUND'
    | 'ITEM_PENDING_REVIEW'
    | 'ITEM_TAKEN_DOWN'
    | 'PUBLISHER_SUSPENDED'
    >;
    statusDetail: string[];
};
