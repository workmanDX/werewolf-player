import { LightningElement, track, api } from 'lwc';
// import { subscribe, unsubscribe, onError, setDebugFlag, isEmpEnabled } from 'lightning/empApi';
// import getPlayerInfo from '@salesforce/apex/GameController.getPlayerInfo';
// import getGameInfo from '@salesforce/apex/GameController.getGameInfo';
// import updateCardSwap from '@salesforce/apex/GameController.updateCardSwap';
// import { createRecord } from 'lightning/uiRecordApi';
// import { updateRecord } from 'lightning/uiRecordApi';
// import isGuest from '@salesforce/user/isGuest';
// import GAME_ACTIVITY_OBJECT from '@salesforce/schema/Game_Activity__c';
// import PLAYER_FIELD         from '@salesforce/schema/Game_Activity__c.Player__c';
// import COMPLETED_FIELD      from '@salesforce/schema/Game_Activity__c.Complete__c';
// import ORDER_FIELD          from '@salesforce/schema/Game_Activity__c.Order__c';
// import ID_FIELD             from '@salesforce/schema/Game_Activity__c.Id';
// import GAME_CARD_FIELD      from '@salesforce/schema/Game_Activity__c.Game_Card__c';
// import GAME_STATUS_FIELD    from '@salesforce/schema/Game_Activity__c.Set_Game_Status__c';
// import PLAYER_ID_FIELD      from '@salesforce/schema/Player__c.Id';
// import VOTED_FOR_FIELD from '@salesforce/schema/Player__c.Voted_For__c';
// import { ShowToastEvent } from 'lightning/platformShowToastEvent';

// import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class TheGame extends LightningElement {
    //doppelTestInfo;
    // @api gameId = 'a005w00000euGliAAE';
    // @api gameStatus = 'Doppelganger';
    // @api cardBack = '/resource/1600725367000/cardBackDP';
    // @api playerInfo = this.doppelInfo();

    @api gameId;
    @api playerInfo;
    @api gameStatus

    //action and model variables
    @api actions = {};
    @api actionCount = 0;
    @api inModal = false;
    @track allowedClicks;
    
    @track disableReveal;

    
    // private
    @track gameInfo = [];
    @track unAssignedCards = [];
    @track disableUnassigned = true;
    @track troubleMakerCount;

    @api cardBack;
    @api player;
    @api actionInfo;

    @track showAction = false;
    @track actionCount = 0;

    @track playersForAction = [];
    @track centerPlayersForAction = [];

    showLogs(message){
        window.console.log('playerAction: ', message);
    }

    showLogsJson(message, obj){
        window.console.log('playerAction: ', message, ': ', JSON.stringify(obj));
    }

    get isStatusDone(){
        return this.gameStatus === 'Done' ? true : false;
    }

    get buttonLabel(){
        return this.gameStatus == 'Doppelganger' ? 'Continue' : 'End Turn';
    }

    // doppelInfo() {
    //     return {"Id":"a025w00000paieUAAQ","NickName__c":"testDoppel","Game__c":"a005w00000euGliAAE","Final_Card_Name__c":"Doppelganger","Final_GameCard__c":"a015w00001Iw45EAAR","Original_Card_Name__c":"Doppelganger","Original_GameCard__c":"a015w00001Iw45EAAR","Unassigned__c":false,"IsSelected__c":false,"Reveal_Card__c":false,"Game_Activities__r":[{"Player__c":"a025w00000paieUAAQ","Id":"a045w000048aQcwAAE","Card_Name__c":"Doppelganger","Set_Game_Status__c":"Werewolf","Complete__c":false,"GameCard__c":"a015w00001Iw45EAAR","Order__c":0,"CreatedDate":"2020-09-29T03:12:56.000Z"}],"Final_GameCard__r":{"Card__c":"01t5w00000EZfWIAA1","Id":"a015w00001Iw45EAAR","Card__r":{"URL__c":"/resource/1590641164000/doppelganger","Id":"01t5w00000EZfWIAA1"}},"Original_GameCard__r":{"Card__c":"01t5w00000EZfWIAA1","Id":"a015w00001Iw45EAAR","Card__r":{"URL__c":"/resource/1590641164000/doppelganger","Description":"The Doppelgänger is a fairly complicated card, because she takes on the role and team of whatever card she views. If you haven’t played with most of the other roles yet, skip this section for now...it will make a lot more sense then. \r\nThe Doppelgänger wakes up before the other roles.\r\nAt night, the Doppelgänger looks at (but does not switch) one other player’s card and does the following based on what she sees:\r\n\r\nVillager, Tanner, Hunter: She is now that role and does nothing else at night. \r\n\r\nWerewolf or Mason: She wakes up with the other Werewolves or Masons when they are called. She is on the werewolf team if she views a Werewolf, and is on the village team if she views a Mason. \r\n\r\nSeer, Robber, Troublemaker, Drunk: She immmediately does that role’s action (she does not wake up again with the original role when it is called).\r\n\r\nMinion: At the end of the Doppelgänger phase, the Announcer tells the Doppelgänger to close her eyes unless she is now the Minion, and that werewolves should put their thumbs up. She is on the werewolf team.\r\n\r\nInsomniac: After the Insomniac closes her eyes, the Doppelgänger-Insomniac is woken up to check her card to see if she is still the Doppelgänger. If a player receives the Doppelgänger card during the night, she is the role the Doppelgänger originally viewed. \r\n\r\nThe Doppelgänger’s script at night is a little different than most, as she has to be told to look for werewolves if she is the Minion, and is woken up later at night if the Insomniac is present.","Id":"01t5w00000EZfWIAA1"}}};
    // }
    
    connectedCallback() {
        this.showLogs('connectedCallback');
        this.showAction = true;
        this.showLogsJson('connectedCallback: actionInfo = ', this.actionInfo);
        this.showLogsJson('connectedCallback: actionInfo.actionName = ', this.actionInfo.actionName);
        this.actionCount = this.actionInfo.actionCount;

        let playerList = this.actionInfo.players;
        for(var key in playerList){
            this.showLogsJson('playerList: ' + key, playerList[key]);
            this.playersForAction.push(playerList[key]);
        }
        if(this.actionInfo.centerPlayers != undefined){
            let centerPlayers = this.actionInfo.centerPlayers;
            for(var key in centerPlayers){
                this.showLogsJson('centerList: ' + key, centerPlayers[key]);
                this.centerPlayersForAction.push(centerPlayers[key]);
            }
        }

        this.showLogsJson('playersForAction = ', this.playersForAction);
        this.showLogsJson('centerPlayersForAction = ', this.centerPlayersForAction);
    }



    // prepActionVars(){
    //     this.showLogs('prepActionVars');
    //     switch(this.action){
    //         case 'Doppelganger':
    //             this.actions.showPlayers = true;
    //             this.actions.showUnassigned = false;
    //             this.actions.showPlayer = false;
    //             this.actions.allowFlip = true;
    //             break;
    //         case 'Werewolf':
    //             this.actions.showUnassigned = false;
    //             this.actions.allowFlip = false;
    //             for(let i = 0; i < 3; i++){
    //                 if(this.centerCards[i].action === 'Werewolf'){
    //                     this.actions.showUnassigned = true;
    //                     this.actions.allowFlip = true;
    //                 }
    //             }
    //             this.actions.showPlayers = true;
    //             this.actions.showPlayer = false;
    //             this.showLogs('setting werewolf actions: ' + JSON.stringify(this.actions));
    //             break;
    //         case 'Minion':
    //         case 'Mason':
    //             this.actions.showPlayers = true;
    //             this.actions.showUnassigned = false;
    //             this.actions.showPlayer = false;    
    //             this.actions.allowFlip = false;
    //             break;
    //         case 'Robber':
    //             this.actions.showPlayers = true;
    //             this.actions.showUnassigned = false;
    //             this.actions.showPlayer = false;
    //             this.actions.allowFlip = true;
    //             this.actions.robberSelectOne = true;
    //             break;
    //         case 'Seer':
    //             this.actions.showPlayers = true;
    //             this.actions.showUnassigned = true;
    //             this.actions.showPlayer = false;
    //             this.actions.allowFlip = true;
    //             this.actions.seerUnassignedChosen = 0;
    //             break;
    //         case 'Troublemaker':
    //             this.actions.showPlayers = true;
    //             this.actions.showUnassigned = false;
    //             this.actions.showPlayer = false;
    //             this.actions.allowSelection = true;
    //             this.actions.actionCount = 0;
    //             this.actions.allowFlip = false;
    //             break;
    //         case 'Drunk':
    //             this.actions.showPlayers = false;
    //             this.actions.showUnassigned = true;
    //             this.actions.showPlayer = false;
    //             this.actions.allowSelection = true;
    //             this.actions.actionCount = 0;
    //             this.actions.allowFlip = false;
    //             break;
    //         case 'Insomniac':
    //             this.actions.showPlayers = false;
    //             this.actions.showUnassigned = false;
    //             this.actions.showPlayer = true;
    //             this.actions.allowSelection = true;
    //             this.actions.actionCount = 0;
    //             this.actions.allowFlip = false;             
    //             break;
    //         case 'Done':
    //             this.actions.showPlayers = true;
    //             this.actions.showUnassigned = false;
    //             this.actions.showPlayer = false;
    //             this.actions.allowSelection = true;
    //             this.actions.actionCount = 0;
    //             this.actions.allowFlip = false; 
    //             break;
    //         default:
    //             window.console.log('do nothing');
    //     }
    // }

    // prepWerewolfActions(){
    //     this.actions.showPlayers = true;
    //     for(let i = 0; i < this.unAssignedCards.length; i++){
    //         if(this.unAssignedCards[0].Original_Card_Name__c === 'Werewolf'){
    //             this.actions.showUnassigned = true;
    //             this.actions.allowFlip = true;
    //         }
    //     }        
    //     this.actions.showPlayer = false;    
    //     // this.actions.allowFlip = false;
    // }

    // createDoppelgangerAction(selectedAction){
    //     const fields = {};
    //     fields[PLAYER_FIELD.fieldApiName] = this.playerInfo.Id;
    //     fields[GAME_STATUS_FIELD.fieldApiName] = selectedAction.Set_Game_Status__c;
    //     fields[GAME_CARD_FIELD.fieldApiName] = selectedAction.GameCard__c;
    //     fields[ORDER_FIELD.fieldApiName] = selectedAction.Order__c;        
    //     const recordInput = { apiName: GAME_ACTIVITY_OBJECT.objectApiName, fields };
    //     createRecord(recordInput);
    // }

    // handleVote(){
    //     this.showLogs('inHandleVote');
    //     this.handleVoteUpdate();        
    // }

    // closeModal() {
    //     this.openModal = false
    //     this.actions.allowFlip = false;
    //     this.inModal = false;
    //     switch(this.gameStatus){
    //         case 'Robber':
    //             this.handleRobberUpdate();
    //             break;
    //         case 'Troublemaker':
    //             this.handleTroublemakerUpdate();
    //             break;
    //         case 'Drunk':
    //             this.handleDrunkUpdate();
    //             break;
    //         case 'Doppelganger':
    //             this.handleDoppelganger();

    //     }
    //     // const fields = {};
    //     // fields[ID_FIELD.fieldApiName] = this.playerInfo.Game_Activities__r[0].Id;
    //     // fields[COMPLETED_FIELD.fieldApiName] = true;
    //     // const recordInput = { fields };
    //     // updateRecord(recordInput)
    //     // .then(
    //         // this.fetchPlayerInfo()
    //     // ).then(
    //     //     finalActions()
    //     // )
    // }

    // // finalActions(){
    //     //swap robber with the selected card
    // // }

    handleCardClick(event){
        let detail = event.detail;
        this.showLogs('handleCardClick event actionName = ' +  this.actionInfo.actionName);
        this.showLogsJson('handleCardClick event: ', event.detail.cardInfo);
        // let status = event.detail.status;
        // window.console.log('cardClickDetail = ', JSON.stringify(detail.cardInfo));
        // window.console.log('cardClick gameStatus = ', status);
        switch(this.actionInfo.actionName){
            // case 'Doppelganger':
                // window.console.log('doppelganger action');
                // window.console.log('doppelganger card = ', JSON.stringify(detail.doppelganger.Game_Activities__r[0]));
                // this.actions.allowFlip = false;
                // if(detail.doppelganger.Game_Activities__r){
                //     this.createDoppelgangerAction(detail.doppelganger.Game_Activities__r[0]);
                // }
                // this.handleDoppelgangerAction(detail);
                // break;
            case 'Werewolf':
                this.handleWerewolfAction(detail);
                break;
    //         case 'Seer':
    //             this.handleSeerAction(detail);
    //             break;
    //         case 'Robber':
    //             this.handleRobberAction(detail);
    //             break;
    //         case 'Troublemaker':
    //             this.handleTroublemakerAction(detail);
    //             break;
    //         case 'Drunk':
    //             this.handleDrunkAction(detail);
    //             break;
    //         case 'Done':
    //             this.handleVoteAction(detail);
    //         default:
    //             window.console.log('handleCardClick: do nothing');
        }
    }

    // handleSeerAction(detail){
    //     // window.console.log('in handleSeerAction');
    //     // window.console.log('detail.seer.Unassigned__c: ', detail.seer.Unassigned__c);
    //     //determine if assigned card was selected and change allowFlip for all other cards.
    //     if(!detail.seer.Unassigned__c || this.actions.seerUnassignedChosen == 2){
    //         this.actions.allowFlip = false;
    //     } else{
    //         this.actions.seerUnassignedChosen ++;
    //     }
    //     // window.console.log('seerUnassignedChosen: ', this.actions.seerUnassignedChosen);
    // }

    handleWerewolfAction(detail){
        this.showLogs('handleWerewolfAction actionCount = ' + this.actionInfo.actionCount);
        this.actionCount ++;;
    }

    // handleDoppelgangerAction(detail){
    //     this.actions.doppelSelection = detail.doppelSelection;
    //     this.actions.allowFlip = false;
    // }

    // handleRobberAction(detail){
    //     // window.console.log('in handleRobberAction');
    //     // window.console.log('detail.robberSelectOne: ',detail.robberSelectOne);
    //     this.actions.robberSelectOne = detail.robberSelectOne;
    //     this.actions.allowFlip = false;
    //     // window.console.log('this.actions.robberSelectOne: ',this.actions.robberSelectOne);
    // }

    // handleDrunkAction(detail){
    //     // window.console.log('in handleDrunkAction');
    //     // window.console.log('detail.drunkSelectOne: ', detail.drunkSelectOne);
    //     if(this.actions.drunkSelectOne && this.actions.drunkSelectOne.Id === detail.drunkSelectOne.Id){
    //         this.actions.drunkSelectOne = null;
    //     } else {
    //         this.actions.drunkSelectOne = detail.drunkSelectOne;
    //     }
    //     this.actionCount ++;
    //     // window.console.log('this.actions.drunkSelectOne: ',this.actions.drunkSelectOne);
    // }

    // handleTroublemakerAction(detail){
    //     // window.console.log('in handleTroublemakerAction');
    //     detail.cardInfo.IsSelected__c = !detail.cardInfo.IsSelected__c;

    //     this.troubleMakerSelectedCount(detail);
    // }

    // troubleMakerSelectedCount(detail){      
    //     let selectedCount = 0;
    //     this.actions.allowSelection = true;
    //     this.gameInfo.forEach(function(currentPlayer) {                
    //         if(detail.cardInfo.Id === currentPlayer.Id){
    //             currentPlayer.IsSelected__c = detail.cardInfo.IsSelected__c;
    //         }
    //         if(currentPlayer.IsSelected__c){
    //             selectedCount++;
    //         }
    //     }); 

    //     // window.console.log('selectedCount = ', selectedCount);
    //     if(selectedCount >= 2){
    //         this.actions.allowSelection = false;
    //     }        
    //     this.actionCount = selectedCount;
    // }

    // handleVoteAction(detail){
    //     if(this.actions.voteSelectOne && this.actions.voteSelectOne.Id === detail.cardInfo.Id){
    //         this.actions.voteSelectOne = null;
    //     } else {
    //         this.actions.voteSelectOne = detail.cardInfo;
    //     }
    //     this.actionCount ++;
    //     // detail.cardInfo.IsSelected__c = !detail.cardInfo.IsSelected__c;
    //     // voteSelectOne
    // }

    // handleDoppelganger(){
    //     this.showLogs('Doppelganger Selected card = ' + JSON.stringify(this.actions.doppelSelection));
    //     this.gameStatus = this.actions.doppelSelection.Final_Card_Name__c;
    //     this.showLogs('Player__c: ' + this.playerInfo.Id);
    //     let doppelAction = {
    //         Player__c: this.playerInfo.Id,
    //         Card_Name__c : this.actions.doppelSelection.Final_Card_Name__c,
    //         Set_Game_Status__c: this.playerInfo.Game_Activities__r[0].Set_Game_Status__c,
    //         GameCard__c : this.actions.doppelSelection.Final_GameCard__c
    //     }
    //     this.playerInfo.Game_Activities__r[0] = doppelAction;
    //     this.showLogs('Doppelganger Final Card = ' + JSON.stringify(doppelAction));
    //     // this.connectedCallback();
    //     //Send action and updated player info to gamePlay2
    // }

    // handleDrunkUpdate(){
    //     updateCardSwap({player1 : this.playerInfo, player2 : this.actions.drunkSelectOne});
    // }

    // handleRobberUpdate(){
    //     updateCardSwap({player1 : this.playerInfo, player2 : this.actions.robberSelectOne});
    // }

    // handleTroublemakerUpdate(){
    //     let players = [];
    //     this.gameInfo.forEach(function(currentPlayer) {                
    //         if(currentPlayer.IsSelected__c){
    //             players.push(currentPlayer);
    //         }
    //     }); 

    //     // window.console.log('in handleTroublemakerUpdate: ', players);

    //     updateCardSwap({player1 : players[0], player2 : players[1]});
    // }

    // handleVoteUpdate(){
    //     this.showLogs('in handleVoteUpdate');
    //     const fields = {};
    //     fields[PLAYER_ID_FIELD.fieldApiName] = this.playerInfo.Id;
    //     fields[VOTED_FOR_FIELD.fieldApiName] = this.actions.voteSelectOne.Id;
    //     const recordUpdate = { fields };

    //     this.showLogs('handleVoteUpdate Fields: ' + JSON.stringify(fields));
    //     // updateRecord(recordUpdate)
    //     updateRecord(recordUpdate).then(record => {
    //         this.dispatchEvent(
    //             new ShowToastEvent({
    //                 title: 'Success',
    //                 message: 'Vote Recorded',
    //                 variant: 'success',
    //             }),
    //         );
    //         this.openModal = false;
    //     })
    //     .catch(error => {
    //         this.dispatchEvent(
    //             new ShowToastEvent({
    //                 title: 'Error Recording Vote',
    //                 message: 'Please Try again. </br>' + error.body.message,
    //                 variant: 'error',
    //             }),
    //         );
    //     });

    // }

 
}