/* eslint-disable no-unused-vars */
class Zone {
    constructor(scene) 
    {
        this.renderZone = (originX, originY, width, height) => 
        {
            let dropZone = scene.add.zone(originX, originY, width, height).setRectangleDropZone(width, height);
            dropZone.setData( { cards: 0 } );
            return dropZone;
        }

        this.renderOutline = (dropZone, color) => 
        {
            let dropZoneOutline = scene.add.graphics();
            dropZoneOutline.lineStyle(4, color);
            dropZoneOutline.strokeRect(dropZone.x - dropZone.input.hitArea.width / 2, 
                                       dropZone.y - dropZone.input.hitArea.height / 2,
                                       dropZone.input.hitArea.width,
                                       dropZone.input.hitArea.height);
        }
    }
}