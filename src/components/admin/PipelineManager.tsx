
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, GripVertical, Trash2, Edit2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Stage {
    id: string;
    name: string;
    order: number;
    color: string;
}

interface Pipeline {
    id: string;
    name: string;
    stages: Stage[];
}

function SortableStage({ stage, onDelete, onEdit }: { stage: Stage, onDelete: (id: string) => void, onEdit: (id: string, name: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: stage.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(stage.name);

    const handleSave = () => {
        onEdit(stage.id, editName);
        setIsEditing(false);
    }

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl mb-3 group hover:border-white/10 transition-colors">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 hover:bg-white/10 rounded-lg">
                <GripVertical className="w-5 h-5 text-white/20 group-hover:text-white/50" />
            </div>

            <Badge variant="outline" className="border-white/10 text-white/30 font-mono text-[10px] w-8 flex justify-center">{stage.order + 1}</Badge>

            <div className="flex-1">
                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-8 bg-black/40 border-white/10 text-white font-bold"
                            autoFocus
                        />
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-400 hover:text-green-300 hover:bg-green-500/20" onClick={handleSave}>
                            <Check className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-white/40 hover:text-white" onClick={() => setIsEditing(false)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                ) : (
                    <p className="font-bold text-white tracking-wide">{stage.name}</p>
                )}
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {!isEditing && (
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-white/40 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg" onClick={() => setIsEditing(true)}>
                        <Edit2 className="w-4 h-4" />
                    </Button>
                )}
                <Button size="icon" variant="ghost" className="h-8 w-8 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg" onClick={() => onDelete(stage.id)}>
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}

export function PipelineManager() {
    const { toast } = useToast();
    const [pipeline, setPipeline] = useState<Pipeline | null>(null);
    const [loading, setLoading] = useState(true);
    const [newStageName, setNewStageName] = useState("");

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchPipeline();
    }, []);

    const fetchPipeline = async () => {
        try {
            const res = await fetch('/api/admin/pipeline');
            const data = await res.json();
            // Assuming first pipeline for now since we only have one default
            if (data && data.length > 0) {
                setPipeline(data[0]);
            }
        } catch (error) {
            console.error("Failed to load pipeline", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || !pipeline) return;

        if (active.id !== over.id) {
            setPipeline((items) => {
                if (!items) return null;
                const oldIndex = items.stages.findIndex((s) => s.id === active.id);
                const newIndex = items.stages.findIndex((s) => s.id === over.id);

                const newStages = arrayMove(items.stages, oldIndex, newIndex);

                // Optimistic UI Update
                const updatedPipeline = { ...items, stages: newStages };

                // API Call
                saveOrder(newStages);

                return updatedPipeline;
            });
        }
    };

    const saveOrder = async (stages: Stage[]) => {
        await fetch('/api/admin/pipeline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'REORDER',
                stages: stages
            })
        });
    };

    const handleAddStage = async () => {
        if (!newStageName.trim() || !pipeline) return;

        const res = await fetch('/api/admin/pipeline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'CREATE_STAGE',
                pipelineId: pipeline.id,
                stageName: newStageName
            })
        });

        if (res.ok) {
            setNewStageName("");
            fetchPipeline();
            toast({ title: "Stage Created" });
        }
    };

    const handleDeleteStage = async (id: string) => {
        if (!confirm("Are you sure? This action cannot be undone only if stage is empty.")) return;

        const res = await fetch('/api/admin/pipeline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'DELETE_STAGE',
                stageId: id
            })
        });

        const data = await res.json();
        if (data.success) {
            fetchPipeline();
            toast({ title: "Stage Deleted" });
        } else {
            toast({ title: "Error", description: data.error, variant: "destructive" });
        }
    };

    const handleEditStage = async (id: string, name: string) => {
        const res = await fetch('/api/admin/pipeline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'UPDATE_STAGE',
                stageId: id,
                stageName: name
            })
        });

        if (res.ok) {
            fetchPipeline();
            toast({ title: "Stage Updated" });
        }
    };

    if (loading) return <div className="p-10 text-center text-white/20">Loading Neural Pathways...</div>;
    if (!pipeline) return <div className="p-10 text-center text-red-400">No Active Pipeline Found. Inject Seed first.</div>;

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                        {pipeline.name || "Default Pipeline"}
                        <Badge variant="outline" className="border-primary/20 text-primary">{pipeline.stages.length} STAGES</Badge>
                    </h3>
                    <p className="text-white/40 text-xs uppercase tracking-widest mt-1">Drag handle to reorder • Changes affect AI logic instantly</p>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={pipeline.stages.map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-4">
                        {pipeline.stages.map((stage) => (
                            <SortableStage
                                key={stage.id}
                                stage={stage}
                                onDelete={handleDeleteStage}
                                onEdit={handleEditStage}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <div className="mt-8 pt-8 border-t border-white/5">
                <div className="flex gap-4">
                    <Input
                        placeholder="NEW STAGE NAME"
                        className="bg-white/5 border-white/10 text-white font-bold h-12 rounded-xl focus:ring-primary/20"
                        value={newStageName}
                        onChange={(e) => setNewStageName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddStage()}
                    />
                    <Button
                        className="bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest h-12 px-8 rounded-xl"
                        onClick={handleAddStage}
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Stage
                    </Button>
                </div>
            </div>
        </div>
    );
}
