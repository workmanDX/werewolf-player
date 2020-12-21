import { LightningElement, wire, api } from 'lwc';
import { getErrorMessage } from 'utils/error';

import { getConfiguration } from 'services/configuration';
import { isNicknameAvailable, registerPlayer, isPlayerIdValid } from 'services/player';

const VALIDATION_DELAY = 500;

export default class RegistrationForm extends LightningElement {
    @api gameId;
    
    configuration;

    nickname = '';
    cleanNickname;
    isNicknameValid;
    nicknameError;

    playerId;
    _playerId = 'a024x000001WXRtAAO';

    isLoading = false;
    isRegistering = false;
    formError = '';

    validationDelayTimeout;

    showLogs(message){
        window.console.log('RegistrationForm: ', message);
    }

    showLogsJson(message, obj){
        window.console.log('RegistrationForm: ', message, ': ', JSON.stringify(obj));
    }

    connectedCallback() {
        this.showLogs('connectedCallback');
        if(this.playerId != undefined){
            this._playerId = this.playerId;
        }
    }

    @wire(getConfiguration)
    getConfiguration({ error, data }) {
        if (data) {
            this.configuration = data;
        } else if (error) {
            this.formError = getErrorMessage(error);
        }
    }

    @wire(isNicknameAvailable, { nickname: '$cleanNickname' })
    isNicknameAvailable({ error, data }) {
        if (data) {
            const { nickname, isAvailable } = data;
            this.isLoading = false;
            this.isNicknameValid = isAvailable;
            if (!isAvailable) {
                this.nicknameError = `Nickname '${nickname}' is already in use.`;
            }
        } else if (error) {
            this.isLoading = false;
            this.isNicknameValid = false;
            this.nicknameError = getErrorMessage(error);
        }
    }

    @wire(isPlayerIdValid, { playerId: '$_playerId' })
    isPlayerIdValid({ error, data }) {
        this.showLogs('isPlayerIdValid');
        if (data) {
            this.showLogsJson('isPlayerIdValid: data = ', data);
            const { playerId, isValid } = data;
            this.isLoading = false;
            if(!isValid){
                this.showLogs('notvalid)');
                this.nickname = null;
            }
            
        } else if (error) {
            this.isLoading = false;
            this.showLogs('valid)');
        }
    }

    handleNicknameChange(event) {
        clearTimeout(this.validationDelayTimeout);
        this.isLoading = false;
        this.nicknameError = null;

        this.nickname = event.detail.value;
        const cleanNickname = this.nickname.trim().toLowerCase();

        // Don't validate blank nicknames
        if (cleanNickname === '') {
            this.isNicknameValid = false;
            return;
        }
        // Don't validate if clean nickname did not change
        if (this.cleanNickname === cleanNickname) {
            return;
        }

        this.isLoading = true;
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.validationDelayTimeout = setTimeout(() => {
            this.cleanNickname = cleanNickname;
        }, VALIDATION_DELAY);
    }

    handleSubmit(event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.isRegistrationDisabled) {
            return;
        }

        this.isLoading = true;
        this.isRegistering = true;
        const nickname = this.nickname.trim();
        // registerPlayer(nickname, this.email)
        registerPlayer(nickname, this.gameId)
            .then((result) => {
                this.dispatchEvent(
                    new CustomEvent('registered', {
                        detail: {
                            nickname,
                            playerId: result.id
                        }
                    })
                );
            })
            .catch((error) => {
                this.isLoading = false;
                this.isRegistering = false;
                this.isNicknameValid = false;
                this.formError = getErrorMessage(error);
            });
    }

    // UI expressions

    get isRegistrationDisabled() {
        return (
            this.nickname.trim() === '' ||
            !this.isNicknameValid ||
            this.isLoading
        );
    }
}
