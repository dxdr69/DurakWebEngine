/* eslint-disable no-unused-vars */
class Text {
    constructor(scene)
    {
        this.renderText = (x, y, text, isInteractive) => 
        {
            let newText = scene.add.text(x, y, text).setFontSize(14).setFontFamily('Trebuchet MS').setColor('#ffffff');

            if (isInteractive) 
            { 
                newText.setInteractive(); 
            }

            return newText;
        }
    }
}