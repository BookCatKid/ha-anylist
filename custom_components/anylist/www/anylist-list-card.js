class AnyListListCard extends HTMLElement {
  setConfig(config) {
    if (!config.entity) {
      throw new Error("You need to define an AnyList todo entity");
    }

    this._config = config;

    if (!this._card) {
      this._card = document.createElement("hui-todo-list-card");
      this.appendChild(this._card);
    }

    this._card.setConfig({
      type: "todo-list",
      entity: config.entity,
      title: config.title || "AnyList",
    });
  }

  set hass(hass) {
    if (this._card) {
      this._card.hass = hass;
    }
  }

  getCardSize() {
    return this._card?.getCardSize?.() ?? 3;
  }

  static getStubConfig(hass) {
    const todoEntity =
      Object.keys(hass.states).find((entityId) => entityId.startsWith("todo.")) ||
      "todo.shopping_list";

    return {
      entity: todoEntity,
      title: "AnyList",
    };
  }

  static async getConfigElement() {
    return document.createElement("anylist-list-card-editor");
  }
}

class AnyListListCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _render() {
    if (!this._hass) {
      return;
    }

    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.innerHTML = `
        <style>
          .wrapper {
            display: grid;
            gap: 12px;
          }
          label {
            display: grid;
            gap: 6px;
            font-size: 14px;
          }
          select, input {
            padding: 8px;
            font: inherit;
          }
        </style>
        <div class="wrapper">
          <label>
            AnyList list entity
            <select id="entity"></select>
          </label>
          <label>
            Card title
            <input id="title" type="text" placeholder="AnyList" />
          </label>
        </div>
      `;

      this._entitySelect = this.shadowRoot.querySelector("#entity");
      this._titleInput = this.shadowRoot.querySelector("#title");
      this._entitySelect?.addEventListener("change", (event) => {
        this._updateConfig({ entity: event.target.value });
      });
      this._titleInput?.addEventListener("change", (event) => {
        this._updateConfig({ title: event.target.value });
      });
    }

    const currentEntity = this._config?.entity || "";
    const currentTitle = this._config?.title || "";
    const todoEntities = Object.keys(this._hass.states)
      .filter((entityId) => entityId.startsWith("todo."))
      .sort();

    if (this._entitySelect) {
      this._entitySelect.textContent = "";
      for (const entityId of todoEntities) {
        const option = document.createElement("option");
        option.value = entityId;
        option.textContent = entityId;
        option.selected = entityId === currentEntity;
        this._entitySelect.appendChild(option);
      }
    }

    if (this._titleInput) {
      this._titleInput.value = currentTitle;
    }
  }

  _updateConfig(changes) {
    const newConfig = {
      ...this._config,
      ...changes,
    };

    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: newConfig },
        bubbles: true,
        composed: true,
      })
    );
  }
}

customElements.define("anylist-list-card", AnyListListCard);
customElements.define("anylist-list-card-editor", AnyListListCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "anylist-list-card",
  name: "AnyList List Card",
  description: "Display an AnyList todo list and select the list in card settings.",
});
