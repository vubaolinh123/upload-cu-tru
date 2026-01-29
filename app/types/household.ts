import { PersonInfo } from './residence';

/**
 * Household - Một hộ gia đình với Chủ hộ và các thành viên
 */
export interface Household {
    id: string;
    chuHo: PersonInfo;
    members: PersonInfo[]; // Không bao gồm chủ hộ
    allPersons: PersonInfo[]; // Bao gồm cả chủ hộ và thành viên
}

/**
 * Kết quả sau khi group theo hộ gia đình
 */
export interface HouseholdGroupResult {
    households: Household[];
    totalPersons: number;
    orphanPersons: PersonInfo[]; // Người không có chủ hộ (nếu có)
}
