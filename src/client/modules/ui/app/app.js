/* eslint-disable no-console */
import {LightningElement, wire, track } from 'lwc';

import { getErrorMessage } from 'utils/error';
import { getCookie, setCookie, clearCookie } from 'utils/cookies';
import { WebSocketClient } from 'utils/webSocketClient';

// import { PHASES, getCurrentSession } from 'services/session';
import { STAGES, getGameInfo, cardSwap } from 'services/game';
import { submitAnswer } from 'services/answer';
import { isPlayerIdValid } from 'services/player';

const COOKIE_PLAYER_NICKNAME = 'nickname';
const COOKIE_PLAYER_ID = 'playerId';
const COOKIE_ANSWER = 'answer';
const COOKIE_PLAYER = 'player'

export default class App extends LightningElement {
    nickname;
    gameInfo;
    errorMessage;
    playerLeaderboard = { score: '-', rank: '-' };
    showFooter = false;
    lastAnswer;
    answerSaved;
    playerId;
    pingTimeout;
    ws;
    
    playerList = {};
    actionInfo;
    messageData = {};
    actionName;
    @track player;
    @track showAction = false;
    // @track showRegistration = false;

    tempCard = "resources/images/characters/werewolf.jpg";

    PLAYER_APP_VERSION = '2.0.0';

    showLogs(message){
        window.console.log('playerApp: ', message);
    }

    showLogsJson(message, obj){
        window.console.log('playerApp: ', message, ': ', JSON.stringify(obj));
    }

    @wire(getGameInfo)
    getGameInfo({ error, data }) {
        if (data) {
            this.showLogsJson('gameInfo = ', data);
            this.gameInfo = data;
            if (!(this.showGame || this.isRegistrationStage)) {
                clearCookie(COOKIE_ANSWER);
            }
        } else if (error) {
            if (error.status && error.status === 404) {
                this.resetGame();
            }
            this.errorMessage = getErrorMessage(error);
        }
    }

    @wire(isPlayerIdValid, { playerId: '$playerId' })
    isPlayerIdValid({ error, data }) {
        this.showLogs('isPlayerIdValid: ' + this.playerId);
        if (data) {
            this.showLogsJson('isPlayerIdValid: data = ', data);
            const { playerId, isValid, name, activity } = data;
            this.isLoading = false;
            if(!isValid){
                this.showLogs('notvalid');
                this.nickname = null;
            } else {
                this.nickname = getCookie(COOKIE_PLAYER_NICKNAME);
                this.actionName = activity;
            }
            
        } else if (error) {
            this.isLoading = false;
            this.showLogs('valid)');
        }
    }

    connectedCallback() {
        this.showLogs('setPlayerId');
        this.nickname = getCookie(COOKIE_PLAYER_NICKNAME);
        this.player = getCookie(COOKIE_PLAYER_NICKNAME);
        this.showLogsJson('connectedCallback player: ', this.player);
        const playerId = getCookie(COOKIE_PLAYER_ID);
        if(playerId){
            this.setPlayer(playerId);
        }

        // Get WebSocket URL
        const wsUrl =
            (window.location.protocol === 'http:' ? 'ws://' : 'wss://') +
            window.location.host;
        // Connect WebSocket
        this.ws = new WebSocketClient(wsUrl);
        this.ws.connect();
        this.ws.addMessageListener((message) => {
            this.handleWsMessage(message);
        });
    }

    // setPlayerId(){
    //     this.showRegistration = true;
    // }

    disconnectedCallback() {
        this.ws.close();
    }

    handleWsMessage(message) {
        // this.showLogs('handleWsMessage = '+ JSON.stringify(message));
        this.showLogs('handleWsMessage message.data.body.info = '+ JSON.stringify(message.data.body.info));
        // this.showLogs('handleWsMessage data.info = '+ JSON.stringify(message.data.info));        
        // this.showLogs('handleWsMessage data.info.stage = '+ JSON.stringify(message.data.info.stage));
        this.errorMessage = undefined;
        this.showAction = false;
        if (message.type === 'phaseChangeEvent') {
            this.gameInfo = message.data.body.info;
            // eslint-disable-next-line default-case
            switch (this.gameInfo.stage) {
                case STAGES.REGISTRATION:
                    this.resetGame();
                    break;
                case STAGES.READY:
                    this.showLogs('STAGES.READY');
                    this.playerList = message.data.body.players;
                    this.updatePlayer();
                    break;
                case STAGES.GAME_PLAY:
                    this.showLogs('STAGES.GAME_PLAY');
                    this.showLogs('handleWsMessage message.data.body.info.action = '+ JSON.stringify(message.data.body.info.action));
                    this.actionName = message.data.body.info.action;
                    // this.messageData = message.data;
                    this.checkAction(message.data.body.actionInfo);
                    break;
                case STAGES.VOTING:
                    this.showLogs('STAGES.VOTING');
                    this.showLogs('handleWsMessage message.data.body.info.action = '+ JSON.stringify(message.data.body.info.action));
                    this.actionName = message.data.body.info.action;
                    // this.messageData = message.data;
                    this.checkAction(message.data.body.actionInfo);
                    break;
                default:
            }
        }
    }

    checkAction(actionInfo){
        this.showLogsJson('checkAction: ', this.player);
        // this.showLogsJson('checkAction actionInfo: ', actionInfo);
        if(this.actionName === this.player.actionName || this.actionName === STAGES.VOTING){
            this.showLogsJson('checkAction actionInfo for ' + this.nickname, actionInfo[this.nickname]);
            this.actionInfo = actionInfo[this.nickname];
            this.actionInfo.actionCount = parseInt(this.actionInfo.actionCount);
            this.actionInfo.actionCountMax = parseInt(this.actionInfo.actionCountMax);
            this.actionInfo.centerPlayerActionCountMax = parseInt(this.actionInfo.centerPlayerActionCountMax);
            this.showAction = true;
        }
    }

    updatePlayer(){
        if(this.playerList[this.nickname]){
            this.player = this.playerList[this.nickname];
            setCookie(COOKIE_PLAYER, this.player);
        }
    }

    handleCardSwap(event){
        let detail = event.detail;
        this.showLogs('handleCardSwap player1.Id = ' + detail.player1.playerId);
        this.showLogs('handleCardSwap this.player.id = ' + this.playerId);
        this.showLogs('handleCardSwap this.actionInfo.id = ' + this.actionInfo.id);
        if(detail.player2 != undefined){
            cardSwap(detail.player1.playerId, detail.player2.playerId, this.actionInfo.id);
        } else {
            cardSwap(detail.player1.playerId, this.playerId, this.actionInfo.id);
        }
    }

    handleRegistered(event) {
        const { nickname, playerId } = event.detail;

        setCookie(COOKIE_PLAYER_NICKNAME, nickname);
        this.nickname = nickname;

        setCookie(COOKIE_PLAYER_ID, playerId);
        this.setPlayer(playerId);
    }

    handleAnswer(event) {
        this.errorMessage = undefined;
        const { answer } = event.detail;
        setCookie(COOKIE_ANSWER, answer);
        this.lastAnswer = answer;
        submitAnswer(answer)
            .then(() => {
                this.answerSaved = true;
            })
            .catch((error) => {
                this.errorMessage = getErrorMessage(error);
            });
    }

    resetGame() {
        clearCookie(COOKIE_PLAYER_NICKNAME);
        clearCookie(COOKIE_PLAYER_ID);
        clearCookie(COOKIE_ANSWER);
        clearCookie(COOKIE_PLAYER);
        window.location.reload();
    }

    setPlayer(playerId) {
        this.playerId = playerId;
        // this.updateLeaderboard();
    }

    updateLeaderboard() {
        getPlayerLeaderboard({ playerId: this.playerId })
            .then((data) => {
                this.playerLeaderboard = data;
                this.showFooter = true;
            })
            .catch((error) => {
                this.showFooter = false;
                if (error.status && error.status === 404) {
                    this.resetGame();
                }
                this.errorMessage = getErrorMessage(error);
            });
    }

    // UI expressions

    get isAuthenticated() {
        return this.nickname !== '';
    }

    get isRegistrationStage() {
        return (this.gameInfo.stage === STAGES.REGISTRATION || this.gameInfo.stage === STAGES.CHARACTER_SELECTION || this.gameInfo.stage === STAGES.DEALING);
    }

    get showGame() {
        return this.gameInfo.stage === STAGES.READY && this.nickname != undefined;
    }

    get isPlayGamePhase() {
        return this.gameInfo.stage === STAGES.GAME_PLAY && this.player != undefined && this.player != null && !this.showAction;
    }

    get isVotingPhase() {
        return this.gameInfo.stage === STAGES.VOTING;
    }

    get isWerewolfPhase() {
        return this.gameInfo.stage === STAGES.WEREWOLF;
    }


    /*********** Quiz Related - to delete later after all references are removed********/

    get isPreQuestionPhase() {
        return this.gameInfo.stage === STAGES.PRE_QUESTION;
    }

    get isQuestionPhase() {
        return this.gameInfo.stage === STAGES.QUESTION;
    }

    get isQuestionResultsPhase() {
        return this.gameInfo.stage === STAGES.QUESTION_RESULTS;
    }

    get isGameResultsPhase() {
        return this.gameInfo.stage === STAGES.GAME_RESULTS;
    }

    get isCorrectAnswer() {
        return (
            this.lastAnswer && this.lastAnswer === this.gameInfo.correctAnswer
        );
    }
}
