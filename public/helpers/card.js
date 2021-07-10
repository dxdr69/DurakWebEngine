/* eslint-disable no-unused-vars */
class Card {
    constructor(scene)
    {
        this.render = (x, y, cardType, sprite) => 
        {
            if (cardType === 'player')
            {
                let card = scene.add.image(x, y, sprite).setScale(0.22, 0.22).setInteractive();
                scene.input.setDraggable(card);
                return card;
            }
            else if (cardType === 'opponent')
            {
                let card = scene.add.image(x, y, sprite).setScale(0.22, 0.22);
                return card;
            }
        }
    }
}
