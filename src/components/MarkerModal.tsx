import { createSignal, Show, createEffect } from 'solid-js';
import type { Component } from 'solid-js';
import type { CustomMarker, MarkerFormData } from '../types/markers';

// Define a local type for the form data to handle tags as a string
interface LocalMarkerFormData {
  title: string;
  description: string;
  color: CustomMarker['color'];
  tags: string; // Tags are handled as a comma-separated string in the form
}

interface MarkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MarkerFormData) => void;
  editingMarker?: CustomMarker | null;
  position?: { lat: number; lon: number } | null;
}

const MarkerModal: Component<MarkerModalProps> = (props) => {
  const [formData, setFormData] = createSignal<LocalMarkerFormData>({
    title: props.editingMarker?.title || '',
    description: props.editingMarker?.description || '',
    color: props.editingMarker?.color || 'red',
    tags: props.editingMarker?.tags?.join(', ') || '' // Initialize tags as a comma-separated string
  });

  // Effect to update form data when editingMarker prop changes
  createEffect(() => {
    if (props.editingMarker) {
      setFormData({
        title: props.editingMarker.title || '',
        description: props.editingMarker.description || '',
        color: props.editingMarker.color || 'red',
        tags: props.editingMarker.tags?.join(', ') || ''
      });
    } else {
      // Reset form if no editing marker
      setFormData({
        title: '',
        description: '',
        color: 'red',
        tags: ''
      });
    }
  });

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const currentData = formData();
    const dataToSave: MarkerFormData = {
      title: currentData.title,
      description: currentData.description,
      color: currentData.color,
      tags: currentData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    };

    if (dataToSave.title.trim()) {
      props.onSave(dataToSave);
      props.onClose();
      // Reset form
      setFormData({
        title: '',
        description: '',
        color: 'red',
        tags: ''
      });
    }
  };

  const handleClose = () => {
    props.onClose();
    // Reset form
    setFormData({
      title: props.editingMarker?.title || '',
      description: props.editingMarker?.description || '',
      color: props.editingMarker?.color || 'red',
      tags: props.editingMarker?.tags?.join(', ') || ''
    });
  };

  const updateFormData = (field: keyof LocalMarkerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Show when={props.isOpen}>
      <div class="modal-overlay" onClick={handleClose}>
        <div class="modal-content" onClick={(e) => e.stopPropagation()}>
          <div class="modal-header">
            <h3>{props.editingMarker ? 'Редактировать флажок' : 'Добавить флажок'}</h3>
            <button class="modal-close" onClick={handleClose}>×</button>
          </div>
          
          <form onSubmit={handleSubmit} class="marker-form">
            <div class="form-group">
              <label for="title">Название:</label>
              <input
                id="title"
                type="text"
                value={formData().title}
                onInput={(e) => updateFormData('title', e.currentTarget.value)}
                placeholder="Введите название флажка"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="description">Описание:</label>
              <textarea
                id="description"
                value={formData().description}
                onInput={(e) => updateFormData('description', e.currentTarget.value)}
                placeholder="Введите описание (необязательно)"
                rows={3}
              />
            </div>

            <div class="form-group">
              <label for="tags">Теги (через запятую):</label>
              <input
                id="tags"
                type="text"
                value={formData().tags as string}
                onInput={(e) => updateFormData('tags', e.currentTarget.value)}
                placeholder="Например: природа, поход, вид"
              />
            </div>
            
            <div class="form-group">
              <label for="color">Цвет флажка:</label>
              <select
                id="color"
                value={formData().color}
                onChange={(e) => updateFormData('color', e.currentTarget.value as CustomMarker['color'])}
              >
                <option value="red">Красный</option>
                <option value="blue">Синий</option>
                <option value="green">Зеленый</option>
                <option value="orange">Оранжевый</option>
                <option value="purple">Фиолетовый</option>
              </select>
            </div>
            
            <Show when={props.position}>
              <div class="position-info">
                <small>
                  Координаты: {props.position?.lat.toFixed(6)}, {props.position?.lon.toFixed(6)}
                </small>
              </div>
            </Show>
            
            <div class="modal-actions">
              <button type="button" onClick={handleClose} class="btn-cancel">
                Отмена
              </button>
              <button type="submit" class="btn-save">
                {props.editingMarker ? 'Сохранить' : 'Добавить'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Show>
  );
};

export default MarkerModal;
