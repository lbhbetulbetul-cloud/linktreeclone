'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ReactNode, useEffect, useState } from 'react';

interface DraggableListProps<T extends { id: string }> {
  items: T[];
  onReorder: (items: T[]) => Promise<void>;
  renderItem: (item: T, isDragging: boolean) => ReactNode;
  isLoading?: boolean;
}

export function DraggableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  isLoading,
}: DraggableListProps<T>) {
  const [localItems, setLocalItems] = useState(items);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localItems.findIndex((item) => item.id === active.id);
      const newIndex = localItems.findIndex((item) => item.id === over.id);

      const reordered = arrayMove(localItems, oldIndex, newIndex);
      setLocalItems(reordered);
      setActiveId(null);

      try {
        await onReorder(reordered);
      } catch (error) {
        setLocalItems(items);
      }
    } else {
      setActiveId(null);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={localItems.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
        disabled={isLoading}
      >
        <div className="space-y-2">
          {localItems.map((item) => (
            <div key={item.id}>
              {renderItem(item, activeId === item.id)}
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
