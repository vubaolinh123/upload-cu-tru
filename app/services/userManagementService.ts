import { UserRecord, UserListResponse, DeleteUserResponse, FetchUsersParams } from '../types/userManagementTypes';

/**
 * Fetch users with pagination and optional keyword search (via proxy)
 */
export async function fetchUsers(params: FetchUsersParams): Promise<UserListResponse> {
    try {
        const { page, limit, search } = params;

        let url = `/api/users?page=${page}&limit=${limit}`;

        // Add keyword param if provided (search by hoTen or soCCCD)
        if (search && search.trim()) {
            url += `&keyword=${encodeURIComponent(search.trim())}`;
        }

        console.log('[User Service] Fetching users via proxy:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data: UserListResponse = await response.json();

        console.log('[User Service] Response:', data);

        return data;
    } catch (error) {
        console.error('[User Service] Fetch error:', error);
        return {
            error: 1,
            data: [],
            total: 0,
        };
    }
}

/**
 * Delete user by client_id (via proxy)
 */
export async function deleteUser(client_id: string): Promise<DeleteUserResponse> {
    try {
        console.log('[User Service] Deleting user via proxy:', client_id);

        const response = await fetch('/api/users', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ client_id }),
        });

        const data: DeleteUserResponse = await response.json();

        console.log('[User Service] Delete response:', data);
        console.log('[User Service] Response OK:', response.ok);

        // Accept multiple success formats: error === 0, error === "0", success === true, or HTTP 200 without error
        // Note: API returns error as string "0", not number 0
        const errorValue = data.error as unknown;
        const isSuccess = errorValue === 0 || errorValue === '0' || (data as unknown as { success?: boolean }).success === true || (response.ok && errorValue === undefined);

        if (isSuccess) {
            return {
                error: 0,
                message: 'Xóa thành công',
            };
        }

        return {
            error: 1,
            message: data.message || 'Xóa thất bại',
        };
    } catch (error) {
        console.error('[User Service] Delete error:', error);
        return {
            error: 1,
            message: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Update user by client_id (via proxy)
 */
export async function updateUser(
    client_id: string,
    userData: Partial<UserRecord>
): Promise<{ error: number; message: string }> {
    try {
        console.log('[User Service] Updating user via proxy:', client_id, userData);

        // Build household structure for API
        const household = {
            chuHo: {
                stt: userData.stt || 1,
                hoTen: userData.hoTen,
                soCCCD: userData.soCCCD,
                ngaySinh: userData.ngaySinh,
                gioiTinh: userData.gioiTinh,
                queQuan: userData.queQuan,
                danToc: userData.danToc,
                quocTich: userData.quocTich,
                quanHeVoiChuHo: userData.quanHeVoiChuHo,
                oDauDen: userData.oDauDen,
                hoKhauThuongTru: userData.hoKhauThuongTru,
            },
            members: userData.members || [],
        };

        const response = await fetch('/api/users', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id,
                households: [household],
            }),
        });

        const data = await response.json();

        console.log('[User Service] Update response:', data);
        console.log('[User Service] Response OK:', response.ok);

        // Accept multiple success formats: error === 0, error === "0", success === true, or HTTP 200 without error
        // Note: API returns error as string "0", not number 0
        const errorValue = data.error;
        const isSuccess = errorValue === 0 || errorValue === '0' || data.success === true || (response.ok && errorValue === undefined);

        if (isSuccess) {
            return {
                error: 0,
                message: 'Cập nhật thành công',
            };
        }

        return {
            error: 1,
            message: data.message || 'Cập nhật thất bại',
        };
    } catch (error) {
        console.error('[User Service] Update error:', error);
        return {
            error: 1,
            message: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
