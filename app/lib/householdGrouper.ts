import { PersonInfo } from '../types/residence';
import { Household, HouseholdGroupResult } from '../types/household';

/**
 * Group persons by household based on Chủ hộ
 * Logic: Mỗi người có quanHeVoiChuHo = "Chủ hộ" sẽ bắt đầu một hộ mới
 * Các người tiếp theo (cho đến Chủ hộ tiếp theo) thuộc về hộ đó
 */
export function groupByHousehold(persons: PersonInfo[]): HouseholdGroupResult {
    if (!persons || persons.length === 0) {
        return {
            households: [],
            totalPersons: 0,
            orphanPersons: [],
        };
    }

    const households: Household[] = [];
    const orphanPersons: PersonInfo[] = [];

    let currentHousehold: Household | null = null;
    let householdIndex = 0;

    for (const person of persons) {
        const isChuHo = isChuHoRole(person.quanHeVoiChuHo);

        if (isChuHo) {
            // Nếu đã có household trước đó, lưu lại
            if (currentHousehold) {
                households.push(currentHousehold);
            }

            // Tạo household mới
            householdIndex++;
            currentHousehold = {
                id: `household-${householdIndex}`,
                chuHo: person,
                members: [],
                allPersons: [person],
            };
        } else {
            // Thêm vào household hiện tại
            if (currentHousehold) {
                currentHousehold.members.push(person);
                currentHousehold.allPersons.push(person);
            } else {
                // Không có chủ hộ trước đó
                orphanPersons.push(person);
            }
        }
    }

    // Lưu household cuối cùng
    if (currentHousehold) {
        households.push(currentHousehold);
    }

    return {
        households,
        totalPersons: persons.length,
        orphanPersons,
    };
}

/**
 * Check if role is Chủ hộ
 */
function isChuHoRole(quanHe: string | null | undefined): boolean {
    if (!quanHe) return false;
    const normalized = quanHe.toLowerCase().trim();
    return normalized === 'chủ hộ' || normalized === 'chu ho';
}

/**
 * Get household by ID
 */
export function getHouseholdById(
    result: HouseholdGroupResult,
    id: string
): Household | undefined {
    return result.households.find(h => h.id === id);
}

/**
 * Get summary for each household (for tabs/selection)
 */
export function getHouseholdSummaries(result: HouseholdGroupResult): Array<{
    id: string;
    chuHoName: string;
    memberCount: number;
    address: string;
}> {
    return result.households.map(h => ({
        id: h.id,
        chuHoName: h.chuHo.hoTen,
        memberCount: h.allPersons.length,
        address: h.chuHo.hoKhauThuongTru || '',
    }));
}
