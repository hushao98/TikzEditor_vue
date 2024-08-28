export default class Node {
    
    constructor(name,shape,x,y) {
        this.name = name
        this.shape = shape
        this.x=x
        this.y=y
    }
    getName() {
        return this.name
    }

    setName(name) {
        this.name = name
    }

    getShape() {
        return this.shape
    }

    setShape(shape) {
        this.shape = shape
    }

    getX() {
        return this.x
    }

    setX(x) {
        this.x = x
    }
    getY() {
        return this.y
    }

    setName(y) {
        this.y = y
    }

    getPosition() {
        return [this.x, this.y]
    }

    setPosition([x, y]) {
        this.x, this.y = x, y
    }
}