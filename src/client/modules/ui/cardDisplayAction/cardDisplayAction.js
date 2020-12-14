import { LightningElement, track, api } from 'lwc';
// import { subscribe, unsubscribe, onError, setDebugFlag, isEmpEnabled } from 'lightning/empApi';

export default class CardDisplay extends LightningElement {
    @api card;
    @api cardBack;
    @api actionCountMax;
    @api centerPlayerActionCountMax;
    @api actionName;
    @api actionCount;
    @api centerPlayerAction

    get actionCount() {
        return this._actionCount;
    }
    set actionCount(value) {
        this.showLogs('actionCount updated: ' + value);
        this.setAttribute('actions', value);
        this._actionCount = value;
        // this.handleActionsChange();
    }

    get centerPlayerAction() {
        return this._centerPlayerAction;
    }
    set centerPlayerAction(value) {
        this.showLogs('centerPlayerAction updated: ' + value);
        this.setAttribute('actions', value);
        this._centerPlayerAction = value;
    }

    @api
    get gameStatus() {
        return this._gameStatus;
    }
    set gameStatus(value) {
        this.setAttribute('gameStatus', value);
        this._gameStatus = value;
        this.handleStatusChange();
    }

    @track cardImage;
    @track _actionCount;
    @track _centerPlayerAction;
    @track isSelected;
    @track revealCard = false;

    formFactor = 'Large';
    eventDetails = {};

    connectedCallback(){
        this.isSelected = false;
        if(this.card.showCharacter){
            this.cardImage = this.card.characterImage;
        } else {
            this.cardImage = this.cardBack;
        }
        // window.console.log('cardImage = ', this.cardImage);
        // if(this.isInModal){
        //     this.showLogs('cardDisplay: ', this.card.NickName__c + ': original name = ' + this.card.Original_Card_Name__c);
        //     if(this.card.Game_Activities__r){
        //         this.showLogs('cardDisplay: activity name = ' + this.card.Game_Activities__r[0].Card_Name__c);
        //     }
        //     if(!this.card.Unassigned__c && (this.gameStatus === 'Werewolf' || this.gameStatus === 'Minion')
        //         && this.playerInfo.Game_Activities__r
        //         && (this.playerInfo.Game_Activities__r[0].Card_Name__c === 'Werewolf' || this.playerInfo.Game_Activities__r[0].Card_Name__c === 'Minion')
        //         && this.card.Game_Activities__r
        //         && this.card.Game_Activities__r[0].Card_Name__c === 'Werewolf'){
        //             this.cardImage = this.werewolfImage;
        //     }
        //     if(!this.card.Unassigned__c && this.gameStatus === 'Mason'
        //         && this.playerInfo.Game_Activities__r
        //         && this.playerInfo.Game_Activities__r[0].Card_Name__c === 'Mason'
        //         && this.card.Game_Activities__r
        //         && this.card.Game_Activities__r[0].Card_Name__c === 'Mason'){
        //             this.cardImage = this.masonImage;
        //     }
        //     if(this.gameStatus === 'Insomniac' && this.playerInfo.Game_Activities__r[0].Card_Name__c === 'Insomniac'){
        //         this.showLogs('cardDisplay: final Name = ', this.playerInfo.Final_Card_Name__c);
        //         this.cardImage = this.playerInfo.Final_Game_Card__r.Card__r.URL__c;
        //     }
        // } else {
        //     if(this.card && this.card.Game__c){
        //         let topic = '/topic/P-'+ this.card.Game__c;
        //         this.showLogs('cardDisplay: topic = ', topic);
        //         this.handleSubscribe(topic);
        //     }
        // }
    }

    showLogs(message){
        window.console.log('cardDisplayActions: ', message);
    }

    get imageWidth(){
        let width = 120
        if(this.formFactor === 'Small'){
            width = 60;
        } 
        else if(this.formFactor === 'Medium'){
            width = 80;
        }
        return width;
    }

    get imageHeight(){
        let height = 150;
        if(this.formFactor === 'Small'){
            height = 75;
        } 
        else if(this.formFactor === 'Medium'){
            height = 100;
        }
        return height;       
    }    

    // handleActionsChange(){
    //     this.showLogs('cardDisplay: in cardDisplay handleActionsChange');
    //     if(this.isInModal){
    //         if(!this.card.unassigned__c && this.gameStatus === 'Doppelganger'){
    //             this.isSelected = true;
    //             this.showLogs('cardDisplay: '+ this.card.NickName__c + ': adding css class');
    //         }
    //         if(!this.card.Unassigned__c && this.gameStatus === 'Robber'){
    //             if(this.actions.robberSelectOne && this.actions.robberSelectOne.Id === this.card.Id){
    //                 this.isSelected = true;
    //                 this.showLogs('cardDisplay: '+ this.card.NickName__c + ': adding css class');
    //             }
    //             else {
    //                 this.isSelected = false;
    //             }
    //         }
    //         if(!this.card.Unassigned__c && this.gameStatus === 'Troublemaker'){
    //             this.showLogs('cardDisplay: this.actions.allowSelection = ' + this.actions.allowSelection);
    //             if(this.card.IsSelected__c){
    //                 this.isSelected = true;
    //                 this.showLogs('cardDisplay: ' + this.card.NickName__c + ': adding css class');
    //             }
    //             else {
    //                 this.isSelected = false;
    //             }
    //         }
    //         if(this.card.Unassigned__c && this.gameStatus === 'Drunk'){
    //             if(this.actions.drunkSelectOne && this.actions.drunkSelectOne.Id === this.card.Id){
    //                 this.isSelected = true;
    //                 this.showLogs('cardDisplay: ' + this.card.NickName__c + ': adding css class');
    //             }
    //             else {
    //                 this.isSelected = false;
    //             }
    //         }
    //         if(!this.card.Unassigned__c && this.gameStatus === 'Done'){
    //             if(this.actions.voteSelectOne && this.actions.voteSelectOne.Id === this.card.Id){
    //                 this.isSelected = true;
    //                 this.showLogs('cardDisplay: '+ this.card.NickName__c + ': adding css class');
    //             }
    //             else {
    //                 this.isSelected = false;
    //             }
    //         }
    //         if(!this.card.Unassigned__c && this.card.Reveal__c){
    //             this.showLogs('cardDisplay: reveal card: ' + this.card.Reveal__c, ' : ' + this.card.Final_Card_Name__c );
    //             this.revealCard = true;
    //         }
    //     }
    // }

    handleFlipCard(){
        this.cardImage = (this.cardImage === this.cardBack) ?  this.card.characterImage : this.cardBack;
    }

    // handleRevealCard(info){
    //     if(info.Id === this.card.Id){
    //         this.showLogs('cardDisplay: in handleRevealCard');
    //         this.cardImage = info.Final_Card_Image__c;
    //     }
    // }

    handleCardClick(){
        if(this.cardImage != this.cardBack){
            this.handleFlipCard();
        } else {
            this.showLogs('handleCardClick: event');
            
            if(this.checkAction()){
                this.fireEvent();
            }
                // this.checkAction()
                // .then(
                    
                // );
        }
    }

    checkAction(){
        this.showLogs('cardDisplay: in checkAction');
        let isValid = false;
        switch(this.actionName){
            // case 'Doppelganger':
            //     if(this.actions.allowFlip){
            //         this.eventDetails.doppelSelection = this.card;
            //         this.handleFlipCard();
            //         isValid = true;
            //     }
                // this.handleDoppelgangerAction();
                // break;
            case 'Werewolf':
                if(this.card.allowFlip && this.actionCount < this.centerPlayerActionCountMax){
                    this.handleFlipCard();
                    isValid = true;
                }
                break;
            case 'Seer':
                this.showLogs('cardDisplay: check action - seer - allowFlip = ' + this.card.allowFlip);
                let actionCountMax = this.centerPlayerAction ? this.centerPlayerActionCountMax : this.actionCountMax;
                if(this.card.allowFlip && this.actionCount < actionCountMax);
                    this.handleFlipCard();
                    isValid = true;
                }
                break;
    //         case 'Robber':
    //             if(!this.card.Unassigned__c && this.actions.allowFlip){
    //                 this.eventDetails.robberSelectOne = this.card;
    //                 this.handleFlipCard();
    //                 isValid = true;
    //             }
    //             break;
    //         case 'Troublemaker':
    //             this.showLogs('cardDisplay: this.actions.allowSelection: ' + this.actions.allowSelection);
    //             if(!this.card.Unassigned__c){
    //                 if(this.card.IsSelected__c || (!this.card.IsSelected__c && this.actions.allowSelection)){
    //                     isValid = true;
    //                 } else {
    //                     this.showLogs('cardDisplay: not selected or allow selection = false')
    //                 }
    //             }
    //             break;
    //         case 'Drunk':
    //             if(this.card.Unassigned__c){
    //                 if(this.card.IsSelected__c || (!this.card.IsSelected__c && this.actions.allowSelection)){
    //                     this.eventDetails.drunkSelectOne = this.card;
    //                     isValid = true;
    //                 } else {
    //                     this.showLogs('cardDisplay: not selected or allow selection = false')
    //                 }
    //             }
    //         break;
    //         case 'Done':
    //             if((this.card.IsSelected__c || (!this.card.IsSelected__c && this.actions.allowSelection)) && this.card.Id != this.playerInfo.Id){
    //                 isValid = true;
    //             }
    //             break;            
            default:
                this.showLogs('cardDisplay: do nothing');
        }
        return isValid;
    }    

    fireEvent(){
        this.showLogs('cardDisplay: fireEvent');
        this.eventDetails.cardInfo = this.card;

        const event = new CustomEvent('cardselected', {
            // detail contains only primitives
            detail: this.eventDetails
        });        
        // Fire the event from c-gameSetup
        this.dispatchEvent(event);
    }

    // handleStatusChange(){
    //     // this.eventDetails = {};
    //     this.eventDetails.cardInfo = null;
    //     this.eventDetails.status = this.gameStatus;
    // }
}