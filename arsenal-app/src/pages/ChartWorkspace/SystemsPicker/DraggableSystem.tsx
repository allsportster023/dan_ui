import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { TextField } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import clsx from "clsx";
import { useRef, useState, KeyboardEventHandler, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { SystemOption } from "./system-option.model";

import classes from './DraggableSystem.module.scss';

const systemItem = 'system-item';

interface DraggableSystemProps {
    system: SystemOption
    index: number;
    moveSystem: (dragIndex: number, hoverIndex: number) => void;
    removeSystem: (system: SystemOption) => void;
    renameSystem: (system: SystemOption, newName: string) => void;
}

export const DraggableSystem = ({ system, index, moveSystem, removeSystem, renameSystem }: DraggableSystemProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const renameInputRef = useRef<HTMLInputElement>(null);
    const [systemNameOverride, setSystemNameOverride] = useState(system.systemNameOverride || system.systemName);
    const [isRenaming, setIsRenaming] = useState(false);

    useEffect(() => {
        renameInputRef.current?.focus();
        renameInputRef.current?.select();
    }, [isRenaming]);

    const onRenameCancel = () => {
        setSystemNameOverride(system.systemNameOverride || system.systemName);
        setIsRenaming(false);
    }

    const onRenameAccept = () => {
        const newName = systemNameOverride || system.systemName;
        setSystemNameOverride(newName);
        renameSystem(system, newName);
        setIsRenaming(false);
    }

    const onSystemNameKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
        if (event.key === 'Enter') {
            onRenameAccept();
        } else if (event.key === 'Escape') {
            onRenameCancel();
        }
    };

    const [{ handlerId }, drop] = useDrop({
        accept: systemItem,
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            };
        },
        hover(item: { index: number }, monitor) {
            if (!containerRef.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;
            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return;
            }
            // Determine rectangle on screen
            const hoverBoundingRect = containerRef.current?.getBoundingClientRect();
            // Get vertical middle
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            // Determine mouse position
            const clientOffset = monitor.getClientOffset();
            if (!clientOffset) {
                return;
            }
            // Get pixels to the top
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;
            // Only perform the move when the mouse has crossed half of the items height
            // When dragging downwards, only move when the cursor is below 50%
            // When dragging upwards, only move when the cursor is above 50%
            // Dragging downwards
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }
            // Dragging upwards
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }
            // Time to actually perform the action
            moveSystem(dragIndex, hoverIndex);
            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations,
            // but it's good here for the sake of performance
            // to avoid expensive index searches.
            item.index = hoverIndex;
        },
    });
    const [{ isDragging }, drag] = useDrag({
        type: systemItem,
        item: () => {
            return { id: system.id, index };
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });
    const opacity = isDragging ? 0 : 1;
    drag(drop(containerRef));

    return (
        <div ref={containerRef} className={clsx(classes.root, 'padding-bottom-half', 'padding-top-half', 'padding-right-half', 'border-bottom')} style={{opacity}} data-handler-id={handlerId}>
            <DragIndicatorIcon className="margin-right-min" />
            {isRenaming ? (
                <>
                    <TextField
                        inputRef={renameInputRef}
                        className={classes.systemTextContainer}
                        value={systemNameOverride}
                        onChange={(event) => setSystemNameOverride(event.target.value)}
                        variant="standard"
                        inputProps={{ onKeyDown: onSystemNameKeyDown }}
                    />
                    <CheckIcon className={classes.actionIcon} onClick={onRenameAccept}/>
                    <ClearIcon className={classes.actionIcon} onClick={onRenameCancel}/>
                </>
            ) : (
                <>
                    <div className={classes.systemTextContainer}>
                        <div className={classes.systemName}>{system.systemNameOverride || system.systemName}</div>
                        {system.systemNameOverride && system.systemNameOverride !== system.systemName ? (
                            <div className={clsx(classes.systemNameOriginal, 'text-light')}>({system.systemName})</div>
                        ) : null}
                    </div>
                    <EditIcon className={classes.actionIcon} onClick={() => setIsRenaming(true)}/>
                    <DeleteIcon className={classes.actionIcon} onClick={() => removeSystem(system)}/>
                </>
            )}
        </div>
    );
};
