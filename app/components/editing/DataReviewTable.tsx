'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { PersonInfo } from '../../types/residence';
import { Household, HouseholdGroupResult } from '../../types/household';
import { groupByHousehold } from '../../lib/householdGrouper';
import HouseholdEditor from './HouseholdEditor';
import Button from '../ui/Button';

interface DataReviewTableProps {
    persons: PersonInfo[];
    onConfirmAll: (confirmedPersons: PersonInfo[]) => void;
    onCancel: () => void;
}

interface HouseholdState {
    id: string;
    persons: PersonInfo[];
    isConfirmed: boolean;
}

export default function DataReviewTable({
    persons,
    onConfirmAll,
    onCancel,
}: DataReviewTableProps) {
    // Group persons by household
    const initialHouseholdResult: HouseholdGroupResult = useMemo(() => {
        return groupByHousehold(persons);
    }, [persons]);

    // Track state for each household
    const [householdStates, setHouseholdStates] = useState<Map<string, HouseholdState>>(() => {
        const map = new Map<string, HouseholdState>();
        initialHouseholdResult.households.forEach((h) => {
            map.set(h.id, {
                id: h.id,
                persons: [...h.allPersons],
                isConfirmed: false,
            });
        });
        return map;
    });

    // Check if all households are confirmed
    const allConfirmed = useMemo(() => {
        return Array.from(householdStates.values()).every((h) => h.isConfirmed);
    }, [householdStates]);

    const confirmedCount = useMemo(() => {
        return Array.from(householdStates.values()).filter((h) => h.isConfirmed).length;
    }, [householdStates]);

    const handleHouseholdChange = useCallback(
        (householdId: string, updatedPersons: PersonInfo[]) => {
            setHouseholdStates((prev) => {
                const newMap = new Map(prev);
                const current = newMap.get(householdId);
                if (current) {
                    newMap.set(householdId, {
                        ...current,
                        persons: updatedPersons,
                    });
                }
                return newMap;
            });
        },
        []
    );

    const handleConfirmHousehold = useCallback((householdId: string) => {
        setHouseholdStates((prev) => {
            const newMap = new Map(prev);
            const current = newMap.get(householdId);
            if (current) {
                newMap.set(householdId, {
                    ...current,
                    isConfirmed: true,
                });
            }
            return newMap;
        });
    }, []);

    const handleEditHousehold = useCallback((householdId: string) => {
        setHouseholdStates((prev) => {
            const newMap = new Map(prev);
            const current = newMap.get(householdId);
            if (current) {
                newMap.set(householdId, {
                    ...current,
                    isConfirmed: false,
                });
            }
            return newMap;
        });
    }, []);

    const handleConfirmAllHouseholds = useCallback(() => {
        // Collect all confirmed persons
        const allPersons: PersonInfo[] = [];
        householdStates.forEach((state) => {
            allPersons.push(...state.persons);
        });
        onConfirmAll(allPersons);
    }, [householdStates, onConfirmAll]);

    // Convert map to array for rendering
    const householdsWithState = useMemo(() => {
        return initialHouseholdResult.households.map((h) => ({
            ...h,
            state: householdStates.get(h.id),
        }));
    }, [initialHouseholdResult.households, householdStates]);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex-shrink-0 mb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            Kiểm tra & Chỉnh sửa Dữ liệu
                        </h2>
                        <p className="text-sm text-gray-500">
                            Vui lòng kiểm tra lại thông tin đã đọc từ ảnh và sửa nếu cần thiết
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-500">
                            Đã xác nhận: <span className="font-bold text-green-600">{confirmedCount}</span> / {householdsWithState.length} hộ
                        </div>
                    </div>
                </div>
            </div>

            {/* Household list - scrollable */}
            <div className="flex-1 overflow-auto space-y-4 mb-4">
                {householdsWithState.map((household, idx) => (
                    <HouseholdEditor
                        key={household.id}
                        household={{
                            ...household,
                            allPersons: household.state?.persons || household.allPersons,
                        }}
                        householdIndex={idx}
                        isConfirmed={household.state?.isConfirmed || false}
                        onChange={handleHouseholdChange}
                        onConfirm={handleConfirmHousehold}
                        onEdit={handleEditHousehold}
                    />
                ))}
            </div>

            {/* Action buttons - fixed at bottom */}
            <div className="flex-shrink-0 flex items-center justify-between gap-3 pt-4 border-t border-gray-200">
                <Button
                    variant="ghost"
                    onClick={onCancel}
                    leftIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    }
                >
                    Hủy bỏ
                </Button>

                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => {
                            // Confirm all at once
                            householdsWithState.forEach((h) => {
                                handleConfirmHousehold(h.id);
                            });
                        }}
                        disabled={allConfirmed}
                    >
                        Xác nhận tất cả
                    </Button>

                    <Button
                        variant="primary"
                        onClick={handleConfirmAllHouseholds}
                        disabled={!allConfirmed}
                        leftIcon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    >
                        Hoàn tất & Xem biên bản
                    </Button>
                </div>
            </div>
        </div>
    );
}
