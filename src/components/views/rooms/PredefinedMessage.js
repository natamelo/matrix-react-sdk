import React from 'react';
import AccessibleButton from '../elements/AccessibleButton';
import { _t } from '../../../languageHandler';
import sdk from '../../../index';
import {ContentHelpers} from 'matrix-js-sdk';
import MatrixClientPeg from "../../../MatrixClientPeg";

const BUTTONS_Z_INDEX = 3500;

export default class PredefinedMessage extends React.Component {

    constructor(props) {
        super(props);
        this._onShowButtonsClick = this._onShowButtonsClick.bind(this);
        this._onHideButtonsClick = this._onHideButtonsClick.bind(this);
        this._onRequestStartClicked = this._onRequestStartClicked.bind(this);
        this._onFinished = this._onFinished.bind(this);

        this.state = {
            showButtons: false,
            buttonsX: null,
            buttonsY: null,
            buttonsChevronOffset: null,
        };

        this.popoverWidth = 300;
        this.popoverHeight = 100;

    }

    _onHideButtonsClick(e) {
        this.setState({showButtons: false});
    }

    _onShowButtonsClick(e) {
        // XXX: Simplify by using a context menu that is positioned relative to the sticker picker button

        const buttonRect = e.target.getBoundingClientRect();

        // The window X and Y offsets are to adjust position when zoomed in to page
        let x = buttonRect.right + window.pageXOffset - 41;

        // Amount of horizontal space between the right of menu and the right of the viewport
        //  (10 = amount needed to make chevron centrally aligned)
        const rightPad = 10;

        // When the sticker picker would be displayed off of the viewport, adjust x
        //  (302 = width of context menu, including borders)
        x = Math.min(x, document.body.clientWidth - (302 + rightPad));

        // Offset the chevron location, which is relative to the left of the context menu
        //  (10 = offset when context menu would not be displayed off viewport)
        //  (8 = value required in practice (possibly 10 - 2 where the 2 = context menu borders)
        const buttonsChevronOffset = Math.max(10, 8 + window.pageXOffset + buttonRect.left - x);

        const y = (buttonRect.top + (buttonRect.height / 2) + window.pageYOffset) - 19;

        this.setState({
            showButtons: true,
            buttonsX: x,
            buttonsY: y,
            buttonsChevronOffset,
        });
    }

    _onFinished() {
        this.setState({showButtons: false});
    }

    _onRequestStartClicked() {
        console.log("entrou");
        const content = ContentHelpers.makeTextMessage("Solicitamos autorização para iniciar a intervenção");
        content['action'] = 'create_intervention'
        console.log("content: " + JSON.stringify(content));
        MatrixClientPeg.get().sendMessage(this.props.room.roomId, content).then((res) => {
            dis.dispatch({
                action: 'message_sent',
            });
        }).catch((e) => {
            //TODO
            //onSendMessageFailed(e, this.props.room.roomId);
        });
    }

    _getButtonsContent() {
        return (<div>
                <span className="mx_PredefinedMessages_RequestStartButton" onClick={this._onRequestStartClicked}>{_t("Request to start")}</span>
                <span className="mx_PredefinedMessages_InformCancelationButton" onClick={this._onRequestStartClicked}>{_t("Inform Cancelation")}</span></div>);
    }

    render() {

        var messagesButton = null;

        if (this.state.showButtons) {
            messagesButton =
                <AccessibleButton
                    id='messagesButton'
                    key="controls_show_messages"
                    className="mx_MessageComposer_button mx_PredefinedMessages_messages"
                    onClick={this._onHideButtonsClick}
                    title={_t("Hide Predefined Messages")}
                >
                </AccessibleButton>;
        } else {
            messagesButton =
                <AccessibleButton
                    id='messagesButton'
                    key="controls_show_messages"
                    className="mx_MessageComposer_button mx_PredefinedMessages_messages"
                    onClick={this._onShowButtonsClick}
                    title={_t("Show Predefined Messages")}
                >
                </AccessibleButton>;        
        }

        const ContextualMenu = sdk.getComponent('structures.ContextualMenu');
        const GenericElementContextMenu = sdk.getComponent('context_menus.GenericElementContextMenu');

        const buttonsMenu = <ContextualMenu
            elementClass={GenericElementContextMenu}
            chevronOffset={this.state.buttonsChevronOffset}š
            chevronFace={'bottom'}
            left={this.state.buttonsX}
            top={this.state.buttonsY}
            menuWidth={this.popoverWidth}
            menuHeight={this.popoverHeight}
            element={this._getButtonsContent()}
            onFinished={this._onFinished}
            menuPaddingTop={0}
            menuPaddingLeft={0}
            menuPaddingRight={0}
            zIndex={BUTTONS_Z_INDEX}
        />;

        return  <div>
                    {messagesButton}
                    {this.state.showButtons && buttonsMenu}
                </div>
    }
}