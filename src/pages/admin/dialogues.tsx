import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import DialogueWizard from '@/components/InitialDialogue/DialogueWizard';
import { initial_dialogue_templates, DialogueTemplate } from '@/data/dialogueTemplates';
import { AppProvider, useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';

const AdminContent: React.FC = () => {
  const { user } = useAppContext();
  const [templates, setTemplates] = useState<DialogueTemplate[]>(initial_dialogue_templates);
  const [preview, setPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!user?.isAdmin) {
    return <div className="p-6">Not authorized</div>;
  }

  const validate = (field: string, id: string) => {
    const duplicate = templates.find(t => t.field_name === field && t.id !== id);
    setErrors(prev => ({ ...prev, [id]: duplicate ? 'Field name must be unique' : '' }));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(templates);
    const [removed] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, removed);
    setTemplates(items);
  };

  const addTemplate = () => {
    const id = Date.now().toString();
    setTemplates(prev => [...prev, { id, field_name: '', label: '', is_active: true }]);
  };

  const updateTemplate = (id: string, patch: Partial<DialogueTemplate>) => {
    setTemplates(prev => prev.map(t => (t.id === id ? { ...t, ...patch } : t)));
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dialogue Templates</h1>
        <Button onClick={() => setPreview(p => !p)} variant="secondary">
          {preview ? 'Close Preview' : 'Preview as User'}
        </Button>
      </div>

      {preview ? (
        <DialogueWizard templates={templates} />
      ) : (
        <>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="templates">
              {provided => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                  {templates.map((t, index) => (
                    <Draggable key={t.id} draggableId={t.id} index={index}>
                      {prov => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          className="border rounded p-2 flex items-center gap-2"
                        >
                          <span {...prov.dragHandleProps} className="cursor-move select-none px-1">⋮⋮</span>
                          <input
                            className="border p-1 rounded text-sm"
                            value={t.field_name}
                            placeholder="field name"
                            onChange={e => {
                              updateTemplate(t.id, { field_name: e.target.value });
                              validate(e.target.value, t.id);
                            }}
                          />
                          <input
                            className="border p-1 rounded text-sm"
                            value={t.label}
                            placeholder="label"
                            onChange={e => updateTemplate(t.id, { label: e.target.value })}
                          />
                          <label className="flex items-center gap-1 text-sm">
                            <input
                              type="checkbox"
                              checked={t.is_active}
                              onChange={e => updateTemplate(t.id, { is_active: e.target.checked })}
                            />
                            active
                          </label>
                          {errors[t.id] && <span className="text-red-600 text-xs">{errors[t.id]}</span>}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <Button onClick={addTemplate} className="mt-2">Add Template</Button>
        </>
      )}
    </div>
  );
};

const AdminDialogues: React.FC = () => (
  <AppProvider>
    <AdminContent />
  </AppProvider>
);

export default AdminDialogues;
