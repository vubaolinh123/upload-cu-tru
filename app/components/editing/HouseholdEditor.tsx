'use client';

import React, { useState, useCallback } from 'react';
import { PersonInfo } from '../../types/residence';
import { Household } from '../../types/household';
import EditablePersonRow from './EditablePersonRow';
import Button from '../ui/Button';

interface HouseholdEditorProps {
    household: Household;
    householdIndex: number;
    isConfirmed: boolean;
    onChange: (householdId: string, persons: PersonInfo[]) => void;
    onConfirm: (householdId: string) => void;
    onEdit: (householdId: string) => void;
}

export default function HouseholdEditor({
    household,
    householdIndex,
    isConfirmed,
    onChange,
    onConfirm,
    onEdit,
}: HouseholdEditorProps) {
    const [editedPersons, setEditedPersons] = useState<PersonInfo[]>(household.allPersons);

    const handlePersonChange = useCallback(
        (personIndex: number, field: keyof PersonInfo, value: string) => {
            const newPersons = [...editedPersons];
            if (field === 'stt') {
                newPersons[personIndex] = { ...newPersons[personIndex], [field]: parseInt(value) || 0 };
            } else if (field === 'gioiTinh') {
                newPersons[personIndex] = { ...newPersons[personIndex], [field]: value as 'Nam' | 'Nữ' };
            } else {
                newPersons[personIndex] = { ...newPersons[personIndex], [field]: value };
            }
            setEditedPersons(newPersons);
            onChange(household.id, newPersons);
        },
        [editedPersons, household.id, onChange]
    );

    const handleRemovePerson = useCallback(
        (personIndex: number) => {
            const newPersons = editedPersons.filter((_, idx) => idx !== personIndex);
            // Re-number STT
            const renumbered = newPersons.map((p, idx) => ({ ...p, stt: idx + 1 }));
            setEditedPersons(renumbered);
            onChange(household.id, renumbered);
        },
        [editedPersons, household.id, onChange]
    );

    const handleConfirm = () => {
        onConfirm(household.id);
    };

    const handleEdit = () => {
        onEdit(household.id);
    };

    return (
        <div className={`
            rounded-xl border-2 p-4 transition-all
            ${isConfirmed
                ? 'border-green-400 bg-green-50'
                : 'border-blue-300 bg-blue-50'
            }
        `}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-lg text-gray-800">
                        Hộ {householdIndex + 1}: {household.chuHo.hoTen}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {household.allPersons.length} người •
                        {isConfirmed ? (
                            <span className="text-green-600 font-medium"> ✓ Đã xác nhận</span>
                        ) : (
                            <span className="text-orange-600 font-medium"> ⏳ Đang chờ xác nhận</span>
                        )}
                    </p>
                </div>

                <div className="flex gap-2">
                    {isConfirmed ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEdit}
                            leftIcon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            }
                        >
                            Sửa lại
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleConfirm}
                            leftIcon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            }
                        >
                            Xác nhận
                        </Button>
                    )}
                </div>
            </div>

            {/* Person list */}
            {!isConfirmed && (
                <div className="space-y-2">
                    {editedPersons.map((person, idx) => (
                        <EditablePersonRow
                            key={`${household.id}-${idx}`}
                            person={person}
                            index={idx}
                            onChange={handlePersonChange}
                            onRemove={editedPersons.length > 1 ? handleRemovePerson : undefined}
                        />
                    ))}
                </div>
            )}

            {/* Confirmed summary */}
            {isConfirmed && (
                <div className="bg-white rounded-lg p-3 mt-2">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 border-b">
                                <th className="pb-2 pr-2">STT</th>
                                <th className="pb-2 pr-2">Họ và tên</th>
                                <th className="pb-2 pr-2">CCCD</th>
                                <th className="pb-2">Quan hệ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {editedPersons.map((person, idx) => (
                                <tr key={idx} className="border-b border-gray-100 last:border-0">
                                    <td className="py-1 pr-2">{person.stt}</td>
                                    <td className="py-1 pr-2 font-medium">{person.hoTen}</td>
                                    <td className="py-1 pr-2 text-gray-600">{person.soCCCD}</td>
                                    <td className="py-1">{person.quanHeVoiChuHo}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
