import { LightningElement, track, api } from 'lwc';
// import FORM_FACTOR  from '@salesforce/client/formFactor'

// import getPlayerInfo from '@salesforce/apex/GameController.getPlayerInfo';

export default class PlayerDisplay extends LightningElement {
    @api playerId;
    @api cardBack;
    @track cardImage;
    @track cardDescription;
    @track cardName;
    @track showDescription = false;

    @api
    get playerInfo() {
        return this._playerInfo;
    }
    set playerInfo(value) {
        this.setAttribute('playerInfo', value);
        this._playerInfo = value;
        this.handlePlayerUpdate();
    }
    @track _playerInfo;
    formFactor = 'Large';

    @track displayInfo = false;

    connectedCallback(){
        this.cardDescription = 'Waiting for cards to be dealt';
        this.showDescription = true;
        this.displayInfo = true;
    }

    handlePlayerUpdate(){
        window.console.log('handlePlayerUpdate: playerInfo = ', JSON.stringify(this.playerInfo));
        if(this.playerInfo != undefined && this.playerInfo.Game__r.Status__c == 'cardsDealt'){
            window.console.log('we got here');
            this.displayInfo = false;
            this.showDescription = false;
            this.cardImage = this.cardBack;
            this.cardDescription = this.playerInfo.Original_GameCard__r.Card__r.Description;
            this.cardName = this.playerInfo.Original_Card_Name__c;
            this.displayInfo = true;
        }
    }

    handleFlipCard(){
        if(this.playerInfo.Original_GameCard__r.Card__r.URL__c != undefined && this.playerInfo.Original_GameCard__r.Card__r.URL__c != null){
            this.cardImage = (this.cardImage === this.cardBack) ?  this.playerInfo.Original_GameCard__r.Card__r.URL__c : this.cardBack;
            this.showDescription = !this.showDescription;
        }
    }

    get imageWidth(){
        let width = 120
        if(this.formFactor === 'Small'){
            width = 75;
        } 
        else if(this.formFactor === 'Medium'){
            width = 90;
        }
        return width;
    }

    get imageHeight(){
        let height = 150;
        if(this.formFactor === 'Small'){
            height = 94;
        } 
        else if(this.formFactor === 'Medium'){
            height = 113;
        }
        return height;       
    } 
}