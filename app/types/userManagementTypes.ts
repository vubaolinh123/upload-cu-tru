/**
 * Types for User Management API
 */

export interface UserRecord {
    _id: string;
    stt?: number;
    hoTen: string;
    soCCCD: string;
    ngaySinh: string;
    gioiTinh: string;
    queQuan: string;
    danToc: string;
    quocTich: string;
    quanHeVoiChuHo: string;
    oDauDen: string;
    hoKhauThuongTru: string;
    members: UserRecord[];
    client_id: string;
}

export interface UserListResponse {
    error: number;
    data: UserRecord[];
    total: number;
}

export interface DeleteUserResponse {
    error: number;
    message?: string;
}

export interface FetchUsersParams {
    page: number;
    limit: number;
    search?: string;
}
