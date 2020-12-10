/* eslint-disable no-console */
import LightningElementWithSLDS from '../../../lib/lightningElementWithSLDS.js';
import { wire, track } from 'lwc';

import { getErrorMessage } from 'utils/error';
import { getCookie, setCookie, clearCookie } from 'utils/cookies';
import { WebSocketClient } from 'utils/webSocketClient';

// import { PHASES, getCurrentSession } from 'services/session';
import { STAGES, getGameInfo } from 'services/game';
// import { getPlayerLeaderboard } from 'services/player';
import { submitAnswer } from 'services/answer';

const COOKIE_PLAYER_NICKNAME = 'nickname';
const COOKIE_PLAYER_ID = 'playerId';
const COOKIE_ANSWER = 'answer';

export default class App extends LightningElementWithSLDS {
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
    @track player;

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
            this.showLogs('gameInfo = '+ data);
            this.gameInfo = data;
            if (!(this.isQuestionPhase || this.isQuestionResultsPhase)) {
                clearCookie(COOKIE_ANSWER);
            }
        } else if (error) {
            if (error.status && error.status === 404) {
                this.resetGame();
            }
            this.errorMessage = getErrorMessage(error);
        }
    }

    connectedCallback() {
        this.nickname = getCookie(COOKIE_PLAYER_NICKNAME);
        const playerId = getCookie(COOKIE_PLAYER_ID);
        if (playerId) {
            this.setPlayer(playerId);
        }
        this.lastAnswer = getCookie(COOKIE_ANSWER);
        this.answerSaved = false;

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

    disconnectedCallback() {
        this.ws.close();
    }

    handleWsMessage(message) {
        this.showLogs('handleWsMessage = '+ JSON.stringify(message));
        this.showLogs('handleWsMessage data.stage = '+ JSON.stringify(message.data.stage));
        this.showLogs('handleWsMessage data.info = '+ JSON.stringify(message.data.info));
        this.showLogs('handleWsMessage data.playerMap = '+ JSON.stringify(message.data.players));
        this.showLogs('handleWsMessage data.info.stage = '+ JSON.stringify(message.data.info.stage));
        this.errorMessage = undefined;
        if (message.type === 'phaseChangeEvent') {
            this.gameInfo = message.data.info;
            // eslint-disable-next-line default-case
            switch (this.gameInfo.stage) {
                case STAGES.REGISTRATION:
                    this.resetGame();
                    break;
                case STAGES.READY:
                    this.playerList = message.data.players;
                    this.checkAction();
                    break;
                default:
            }
        }
    }

    checkAction(){
        if(this.playerList[this.nickname]){
            this.player = this.playerList[this.nickname];
            this.showLogsJson('checkAction: ', this.player);
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

    get isReadyStage() {
        return (this.gameInfo.stage === STAGES.READY && this.player != undefined && this.player != null);
        // return (this.gameInfo.stage === STAGES.READY);
    }

    get isPlayGamePhase() {
        return this.gameInfo.stage === STAGES.GAME_PLAY;
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
