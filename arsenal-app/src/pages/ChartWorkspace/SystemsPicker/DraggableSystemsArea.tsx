import update from 'immutability-helper';
import { useCallback } from 'react';
import { SystemOption } from "./system-option.model";
import { DraggableSystem } from './DraggableSystem';

interface DraggableSystemsAreaProps {
    selectedSystems: SystemOption[];
    setSelectedSystems: (systems: SystemOption[]) => void;
}

export function DraggableSystemsArea(props: DraggableSystemsAreaProps) {
    const { selectedSystems, setSelectedSystems } = props;

    const removeSystem = (system: SystemOption) => {
        setSelectedSystems(selectedSystems.filter(sys => sys !== system));
    }

    const renameSystem = (system: SystemOption, newName: string) => {
        const index = selectedSystems.indexOf(system);
        if (index >= 0) {
            const newSystem = { ...system, systemNameOverride: newName };
            setSelectedSystems(update(selectedSystems, {
                $splice: [
                    [index, 1, newSystem],
                ],
            }));
        }
    }

    const moveSystem = useCallback((dragIndex, hoverIndex) => {
        const dragSystem = selectedSystems[dragIndex];
        setSelectedSystems(update(selectedSystems, {
            $splice: [
                [dragIndex, 1],
                [hoverIndex, 0, dragSystem],
            ],
        }));

    }, [selectedSystems, setSelectedSystems]);

    const renderSystem = (system: SystemOption, index: number) => {
        return (
            <DraggableSystem
                key={system.id}
                index={index}
                system={system}
                moveSystem={moveSystem}
                removeSystem={removeSystem}
                renameSystem={renameSystem}
            />
        );
    };

    return (
        <div>{selectedSystems.map((system, i) => renderSystem(system, i))}</div>
    );
}
