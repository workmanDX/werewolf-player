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
    @track isSelected = false;

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

    // @track cardImage;
    @track showBackImage = true;
    @track _actionCount;
    @track _centerPlayerAction;
    @track isSelected;
    @track revealCard = false;

    formFactor = 'Large';
    eventDetails = {};

    connectedCallback(){
        this.isSelected = false;
    }

    showLogs(message){
        window.console.log('cardDisplayActions: ', message);
    }

    get cardImage(){
        let cImage = this.cardBack;
        if(this.card.showCharacter || !this.showBackImage){
            cImage = this.card.characterImage;
        }
        if(this.actionName === 'Insomniac' || this.actionName === 'Done'){
            cImage = this.card.finalCharacterImage;
        }
        return cImage;
    }

    // get imageWidth(){
    //     let width = 120
    //     if(this.formFactor === 'Small'){
    //         width = 60;
    //     } 
    //     else if(this.formFactor === 'Medium'){
    //         width = 80;
    //     }
    //     return width;
    // }

    // get imageHeight(){
    //     let height = 150;
    //     if(this.formFactor === 'Small'){
    //         height = 75;
    //     } 
    //     else if(this.formFactor === 'Medium'){
    //         height = 100;
    //     }
    //     return height;       
    // }

    get displayClass(){
        let dClass = "cardimage";
        if(this.isSelected || this.card.showCharacter){
            dClass += " true";
        } else {
            dClass += " false";
        }

        return dClass;
    }

    handleFlipCard(){
        this.showBackImage = !this.showBackImage;
    }

    handleCardClick(){
        if(this.cardImage != this.cardBack){
            this.handleFlipCard();
        } else {
            this.showLogs('handleCardClick: event');
            
            if(this.checkAction()){
                this.fireEvent();
            }
        }
    }

    checkAction(){
        this.showLogs('in checkAction');
        let isValid = false;

        this.showLogs('this.card.allowFlip ' + this.card.allowFlip);
        this.showLogs('this.actionCount ' + this.actionCount);
        
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
                this.showLogs('checkAction Werewolf');
                if(this.card.allowFlip && this.actionCount < this.centerPlayerActionCountMax){
                    this.handleFlipCard();
                    isValid = true;
                }
                break;
            case 'Seer':
                this.showLogs('checkAction Seer');
                let actionCountMax = this.centerPlayerAction ? this.centerPlayerActionCountMax : this.actionCountMax;
                if(this.card.allowFlip && this.actionCount < actionCountMax){
                    this.handleFlipCard();
                    isValid = true;
                }
                break;
            case 'Robber':
                this.showLogs('checkAction Robber');
                if(this.card.allowFlip && this.actionCount < this.actionCountMax){
                    this.handleFlipCard();
                    isValid = true;
                }
                break;
            case 'Troublemaker':
                this.showLogs('checkAction Troublemaker');
                if(this.actionCount < this.actionCountMax){
                    isValid = true;
                    this.isSelected = true;
                }
                break;
            case 'Drunk':
                this.showLogs('checkAction Drunk');
                if(this.actionCount < this.centerPlayerActionCountMax){
                    isValid = true;
                    this.isSelected = true;
                }
                break;
            case 'Voting':
                this.showLogs('checkAction Voting');
                if(this.actionCount < this.actionCountMax){
                    isValid = true;
                    this.isSelected = true;
                }
                break;          
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