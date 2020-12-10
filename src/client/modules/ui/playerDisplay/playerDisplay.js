// import LightningElementWithSLDS from '../../../lib/lightningElementWithSLDS.js';
import { LightningElement, track, api } from 'lwc';
// import FORM_FACTOR  from '@salesforce/client/formFactor'

// export default class PlayerDisplay extends LightningElementWithSLDS {
export default class PlayerDisplay extends LightningElement {
    // @api playerId;
    @api player;
    @api cardBack;
    @track cardImage;
    // @track cardDescription;
    // @track cardName;
    @track showDescription = false;
    formFactor = 'Large';

    connectedCallback(){
        this.cardImage = this.cardBack;
    }

    handleFlipCard(){
        if(this.player.herokuOriginalImage != undefined && this.playerInfo.herokuOriginalImage != null){
            this.cardImage = this.showDescription ?  this.playerInfo.herokuOriginalImage : this.cardBack;
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