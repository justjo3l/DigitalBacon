/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import MenuPages from '/scripts/core/enums/MenuPages.js';
import PubSubTopics from '/scripts/core/enums/PubSubTopics.js';
import PointerInteractable from '/scripts/core/interactables/PointerInteractable.js';
import TexturesHandler from '/scripts/core/handlers/TexturesHandler.js';
import PubSub from '/scripts/core/handlers/PubSub.js';
import { Colors, Fonts, FontSizes, Textures } from '/scripts/core/helpers/constants.js';
import ThreeMeshUIHelper from '/scripts/core/helpers/ThreeMeshUIHelper.js';
import PaginatedPage from '/scripts/core/menu/pages/PaginatedPage.js';
import ThreeMeshUI from 'three-mesh-ui';

const FIELD_MAX_LENGTH = 25;

class TexturesPage extends PaginatedPage {
    constructor(controller) {
        super(controller, false, true);
        this._textures = TexturesHandler.getTextures();
        this._items = Object.keys(this._textures);
        this._addPageContent();
        this._createAddButton();
    }

    _addPageContent() {
        let titleBlock = ThreeMeshUIHelper.createTextBlock({
            'text': 'Textures',
            'fontSize': FontSizes.header,
            'height': 0.04,
            'width': 0.2,
        });
        this._container.add(titleBlock);

        this._addList();
    }

    _createAddButton() {
        let addButtonParent = new ThreeMeshUI.Block({
            height: 0.06,
            width: 0.06,
            backgroundColor: Colors.defaultMenuBackground,
            backgroundOpacity: 0,
        });
        let addButton = ThreeMeshUIHelper.createButtonBlock({
            'text': "+",
            'fontSize': 0.04,
            'height': 0.04,
            'width': 0.04,
        });
        addButtonParent.set({ fontFamily: Fonts.defaultFamily, fontTexture: Fonts.defaultTexture });
        addButtonParent.position.fromArray([.175, 0.12, -0.001]);
        addButtonParent.add(addButton);
        let interactable = new PointerInteractable(addButton, () => {
            let page = this._controller.getPage(MenuPages.NEW_TEXTURE);
            page.setContent((texture) => {
                this._handleItemInteraction(texture.getId());
            });
            this._controller.pushPage(MenuPages.NEW_TEXTURE);
        });
        this._containerInteractable.addChild(interactable);
        this._object.add(addButtonParent);
    }

    _getItemName(item) {
        let name = this._textures[item].getName();
        if(name.length > FIELD_MAX_LENGTH)
            name = "..." + name.substring(name.length - FIELD_MAX_LENGTH);
        return name;
    }

    _handleItemInteraction(item) {
        let texturePage = this._controller.getPage(MenuPages.TEXTURE);
        texturePage.setTexture(this._textures[item]);
        this._controller.pushPage(MenuPages.TEXTURE);
    }

    _refreshItems() {
        this._textures = TexturesHandler.getTextures();
        this._items = Object.keys(this._textures);
    }

    _addSubscriptions() {
        PubSub.subscribe(this._id, PubSubTopics.TEXTURE_ADDED, (texture) => {
            this._refreshItems();
            this._updateItemsGUI();
        });
        PubSub.subscribe(this._id, PubSubTopics.TEXTURE_UPDATED, (message) => {
            this._refreshItems();
            this._updateItemsGUI();
        });
        PubSub.subscribe(this._id, PubSubTopics.TEXTURE_DELETED, (e) => {
            this._refreshItems();
            this._updateItemsGUI();
        });
        PubSub.subscribe(this._id, PubSubTopics.PROJECT_LOADING, (done) => {
            if(!done) return;
            this._refreshItems();
            this._updateItemsGUI();
        });
    }

    _removeSubscriptions() {
        PubSub.unsubscribe(this._id, PubSubTopics.TEXTURE_ADDED);
        PubSub.unsubscribe(this._id, PubSubTopics.TEXTURE_UPDATED);
        PubSub.unsubscribe(this._id, PubSubTopics.TEXTURE_DELETED);
        PubSub.unsubscribe(this._id, PubSubTopics.PROJECT_LOADING);
    }

    addToScene(scene, parentInteractable) {
        this._addSubscriptions();
        super.addToScene(scene, parentInteractable);
    }

    removeFromScene() {
        this._removeSubscriptions();
        super.removeFromScene();
    }

}

export default TexturesPage;
