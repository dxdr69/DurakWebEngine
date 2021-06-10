/* eslint-disable no-unused-vars */
class Card {
    constructor(scene)
    {
        this.render = (x, y, playerOrOpponentCard, sprite) => {
            if (playerOrOpponentCard === 'player')
            {
                let card = scene.add.image(x, y, sprite).setScale(0.25, 0.25).setInteractive();
                scene.input.setDraggable(card);
                return card;
            }
            else
            {
                if (playerOrOpponentCard === 'opponent')
                {
                    let card = scene.add.image(x, y, sprite).setScale(0.25, 0.25);
                    return card;
                }
            }

        }
    }
}
