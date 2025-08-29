import { For, createSignal, createEffect } from 'solid-js';
import type { Component } from 'solid-js';
import './TagFilterBar.css';

interface TagFilterBarProps {
  allTags: string[];
  onTagSelect: (selectedTags: string[]) => void;
}

const TagFilterBar: Component<TagFilterBarProps> = (props) => {
  const [selectedTags, setSelectedTags] = createSignal<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  createEffect(() => {
    props.onTagSelect(selectedTags());
  });

  return (
    <div class="tag-filter-bar">
      <div class="tag-list">
        <For each={props.allTags}>
          {(tag) => (
            <button
              class={`tag-button ${selectedTags().includes(tag) ? 'active' : ''}`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          )}
        </For>
      </div>
    </div>
  );
};

export default TagFilterBar;
