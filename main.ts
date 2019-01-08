/**
* LUMEX WS2812燈環函數
*/

//% weight=0 color=#ff9933 icon="\uf1cd" block="LumexEzRing"
namespace LumexEzRing {
    //let functionCode = 0
    export enum yesOrNo {
        //% block="yes"
        type1 = 1,
        //% block="no"
        type0 = 0,
    }
    export enum effectType {
        //% block="fill pixel one by one, start from the last pixel"
        type1 = 10,
        //% block="fill pixel one by one, start from the first pixel"
        type2 = 11,
        //% block="stack pixel one by one clockwise then turn off pixel counterclockwise"
        type3 = 12,
        //% block="stack pixel one by one counterclockwise then turn off pixel clockwise"
        type4 = 13,
        //% block="two pixels collison then firework"
        type5 = 14,
        //% block="two stack pixels collison then firework"
        type6 = 15,
        //% block="two pixels collison then bounce back"
        type7 = 16,
        //% block="two stack pixels collison then fade back"
        type8 = 17
    }
    export enum clockMove {
        //% block="turn the ring pixels clockwise one round"
        type1 = 0xc3,
        //% block="turn the ring pixels counterclockwise one round"
        type2 = 0xc4,
        //% block="turn the ring pixels clockwise then counterclockwise"
        type3 = 0xc5,
        //% block="turn the ring pixels counterclockwise then clockwise"
        type4 = 0xc6
    }

    export enum colorCode {
        //% block="white"
        white = 0xffffff,
        //% block="red"
        red = 0xff0000,
        //% block="orange"
        orange = 0xffa500,
        //% block="yellow"
        yellow = 0xffff00,
        //% block="green"
        green = 0x00ff00,
        //% block="blue"
        blue = 0x0000ff,
        //% block="indigo"
        indigo = 0x4b0082,
        //% block="purple"
        purple = 0xa020f0,
        //% block="dark red"
        darkRed = 0x8b0000,
        //% block="pink"
        pink = 0xff69b4,
        //% block="earth yellow"
        earthYellow = 0xe1a95f,
        //% block="lime"
        lime = 0xbfff00,
        //% block="black"
        black = 0x000000
    }

    function convertHexStrToNum(myMsg: string): number {
        let myNum = 0
        for (let i = 0; i < myMsg.length; i++) {
            if ((myMsg.charCodeAt(i) > 47) && (myMsg.charCodeAt(i) < 58)) {
                myNum += (myMsg.charCodeAt(i) - 48) * (16 ** (myMsg.length - 1 - i))
            } else if ((myMsg.charCodeAt(i) > 96) && (myMsg.charCodeAt(i) < 103)) {
                myNum += (myMsg.charCodeAt(i) - 87) * (16 ** (myMsg.length - 1 - i))
            } else if ((myMsg.charCodeAt(i) > 64) && (myMsg.charCodeAt(i) < 71)) {
                myNum += (myMsg.charCodeAt(i) - 55) * (16 ** (myMsg.length - 1 - i))
            } else {
                myNum = 0
                break
            }
        }
        return myNum
    }

    function convertNumToArray(myColor: number): number[] {
        let temp0 = myColor >> 16
        let temp1 = Math.idiv(myColor % 65536, 256)
        let temp2 = myColor % 256
        let myArray: number[] = [temp0, temp1, temp2]
        return myArray;
    }

    function convertNumToHexStr(myNum: number, digits: number): string {
        let tempDiv = 0
        let tempMod = 0
        let myStr = ""
        tempDiv = myNum
        while (tempDiv > 0) {
            tempMod = tempDiv % 16
            if (tempMod > 9) {
                myStr = String.fromCharCode(tempMod - 10 + 97) + myStr
            } else {
                myStr = tempMod + myStr
            }
            tempDiv = Math.idiv(tempDiv, 16)
        }
        while (myStr.length != digits) {
            myStr = "0" + myStr
        }
        return myStr
    }

    function setDimmingLevel(level: number): void {
        serial.writeString("ATf2=(" + level + ")")
        serial.readUntil("E")
        basic.pause(10)
    }

    function setPixelNumber(pixels: number): void {
        serial.writeString("ATcf=(" + pixels + ")")
        serial.readUntil("E")
        basic.pause(10)
    }

    //% blockId="setSerial" block="set EzRing RX to %pinRX|TX to %pinTX|BaudRate %br|pixel number of ring: %pixels"
    //% weight=100 blockGap=5 blockInlineInputs=true pixels.min=1 pixels.max=120
    export function setSerial(pinRX: SerialPin, pinTX: SerialPin, br: BaudRate, pixels: number): void {
        basic.pause(300)
        serial.redirect(
            pinRX,
            pinTX,
            br
        )
        serial.readUntil("E")
        basic.pause(20)
        setStopDyna()
        setPixelNumber(pixels)
        setDimmingLevel(31)
        clear()
    }

    //% blockId="clear" block="clear display"
    //% weight=95 blockGap=10
    export function clear(): void {
        serial.writeString("ATd0=()")
        serial.readUntil("E")
        basic.pause(10)
    }

    //% blockId="getColor" block="get the color code| red(0~255) %red|green(0~255) %green|blue(0~255) %blue"
    //% weight=90 blockGap=5 blockExternalInputs=true red.min=0 red.max=255 green.min=0 green.max=255 blue.min=0 blue max=255
    export function getColor(red: number, green: number, blue: number): number {
        let myColor = (red << 16) + (green << 8) + blue
        return myColor
    }

    //% blockId="getColorHexStr" block="get the color code from hex string %hexStr"
    //% weight=85 blockGap=5 blockExternalInputs=true
    export function getColorHexStr(hexStr: string): number {
        if (hexStr.length > 6) {
            hexStr = hexStr.substr(hexStr.length - 6, 6)
        }
        else if (hexStr.length < 6) {
            hexStr = "000000"
        }
        let myColor = convertHexStrToNum(hexStr)
        return myColor
    }

    //% blockId="getColorHex" block="get the color code %hex"
    //% weight=80 blockGap=10 blockExternalInputs=true
    export function getColorHex(hex: colorCode): number {
        return hex
    }

    //% blockId="setPixelColor" block="set the single pixel %addr|with color code %color"
    //% weight=75 blockGap=5 blockInlineInputs=true addr.min=0 addr.max=119
    export function setPixelColor(addr: number, color: number): void {
        let myColor = convertNumToArray(color)
        serial.writeString("ATc0=(" + addr + "," + myColor[0] + "," + myColor[1] + "," + myColor[2] + ")")
        serial.readUntil("E")
        basic.pause(10)
    }

    //% blockId="setSectionColor" block="set the color code %color| from the pixel %addr0| to the pixel %addr1"
    //% weight=70 blockGap=5 blockInlineInputs=true addr0.min=0 addr0.max=119 addr1.min=0 addr1.max=119
    export function setSectionColor(color: number, addr0: number, addr1: number): void {
        let myColor = convertNumToArray(color)
        serial.writeString("ATc1=(" + addr0 + "," + addr1 + "," + myColor[0] + "," + myColor[1] + "," + myColor[2] + ")")
        serial.readUntil("E")
        basic.pause(10)
    }

    //% blockId="setRandomColor" block="set the color randomly for each pixel"
    //% weight=65 blockGap=10 blockInlineInputs=true pixels.min=1 pixels.max=120
    export function setRandomColor(): void {
        serial.writeString("ATc2=()")
        serial.readUntil("E")
        basic.pause(10)
    }

    //% blockId="loadPage" block="switch display designated page(0~7): %page"
    //% weight=64 blockGap=5 blockInlineInputs=true page.min=0 page.max=7
    export function loadPage(page:number): void {
        serial.writeString("ATfc=("+page+")")
        serial.readUntil("E")
        basic.pause(10)
    }

    //% blockId="writeToPage" block="save display contents to current page"
    //% weight=63 blockGap=10 blockInlineInputs=true page.min=0 page.max=7
    export function writeToPage(): void {
        serial.writeString("ATfe=()")
        serial.readUntil("E")
        basic.pause(10)
    }

    //% blockId="playAnimation" block="display effect %effect|color code %color|speed(1~30) %speed"
    //% weight=60 blockGap=5 blockInlineInputs=true speed.min=1 speed.max=30
    export function playAnimation(effect: effectType, color: number, speed: number): void {
        let myColor = convertNumToArray(color)
        serial.writeString("AT" + effect + "=(" + myColor[0] + "," + myColor[1] + "," + myColor[2] + "," + speed + ")")
        serial.readUntil("E")
        basic.pause(10)
    }


    //% blockId="setClockMove" block="%myClockMove|speed(1~30) %speed"
    //% weight=55 blockGap=5 blockInlineInputs=true speed.min=1 speed.max=30
    export function setClockMove(myClockMove: clockMove, speed: number): void {
        serial.writeString("AT" + convertNumToHexStr(myClockMove, 2) + "=(" + speed + ")")
        serial.readUntil("E")
        basic.pause(10)
    }

    //% blockId="setPixelFlash" block="flash one single pixel %addr|speed(1~100) %speed"
    //% weight=50 blockGap=5 blockInlineInputs=true addr.min=0 addr.max=119 speed.min=1 speed.max=100
    export function setPixelFlash(addr: number, speed: number): void {
        serial.writeString("ATc7=(" + addr + "," + speed + ")")
        serial.readUntil("E")
        basic.pause(10)
    }

    //% blockId="setSectionFlash" block="flash the section pixels from the pixel %addr0| to the pixel %addr1|speed(1~100) %speed"
    //% weight=45 blockGap=5 blockInlineInputs=true addr0.min=0 addr0.max=119 addr1.min=0 addr1.max=119 speed.min=1 speed.max=100
    export function setSectionFlash(addr0: number, addr1: number, speed: number): void {
        serial.writeString("ATc8=(" + addr0 + "," + addr1 + "," + speed + ")")
        serial.readUntil("E")
        basic.pause(10)
    }

    //% blockId="setRingFlash" block="flash whole ring, speed(1~100) %speed"
    //% weight=40 blockGap=5 blockInlineInputs=true speed.min=1 speed.max=100
    export function setRingFlash(speed: number): void {
        serial.writeString("ATc9=(" + speed + ")")
        serial.readUntil("E")
        basic.pause(10)
    }

    //% blockId="setBreath" block="breath effect of whole ring red %red|green %green|blue %blue"
    //% weight=35 blockGap=10 blockInlineInputs=true
    export function setBreath(red: yesOrNo, green: yesOrNo, blue: yesOrNo): void {
        serial.writeString("ATca=(" + red + "," + green + "," + blue + ")")
        serial.readUntil("E")
        basic.pause(10)
    }

    //% blockId="setDynaFunction" block="set the dynamic function code(1~20) %fCode"
    //% weight=30 blockGap=5 blockInlineInputs=true fCode.min=1 fCode.max=20
    export function setDynaFunction(fCode: number): void {
        if (fCode > 0) {
            serial.writeString("ATfd=(" + fCode + ")")
            serial.readUntil("E")
            basic.pause(10)
        }
    }

    //% blockId="setStopDyna" block="stop the dynamic function"
    //% weight=25 blockGap=5 blockInlineInputs=true
    export function setStopDyna(): void {
        serial.writeString("ATfd=(0)")
        serial.readUntil("E")
        basic.pause(10)
    }

    //% blockId="setDynaSpeed" block="set the dynamic function's speed(1~100) %speed"
    //% weight=20 blockGap=5 blockInlineInputs=true speed.min=1 speed.max=100
    export function setDynaSpeed(speed: number): void {
        serial.writeString("ATce=(" + speed + ")")
        serial.readUntil("E")
        basic.pause(10)
    }

    //% blockId="setDynaColor" block="set the dynamic function's color code %color"
    //% weight=15 blockGap=5 blockInlineInputs=true
    export function setDynaColor(color: number): void {
        let myColor = convertNumToArray(color)
        serial.writeString("ATcd=(" + myColor[0] + "," + myColor[1] + "," + myColor[2] + ")")
        serial.readUntil("E")
        basic.pause(10)
    }
}
