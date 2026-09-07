export interface IApiResponse<T> {
    status: number;
    success: boolean;
    message: string;
    data: T;
}
